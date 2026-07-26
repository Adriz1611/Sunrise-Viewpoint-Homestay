import type { CollectionConfig, Payload } from 'payload'
import { ValidationError } from 'payload'

type Reference = number | string | { id: number | string }

type BookingData = {
  checkIn?: string | null
  checkOut?: string | null
  customerName?: string | null
  customerPhone?: string | null
  id?: number | string
  notes?: string | null
  rooms?: Reference[] | null
  status?: 'confirmed' | 'cancelled'
}

type AvailabilityRow = {
  bookingRecordID?: string | null
  guestNotes?: string | null
  room?: Reference | null
  status?: 'available' | 'booked' | 'maintenance'
}

type DailyAvailabilityData = {
  availability?: AvailabilityRow[] | null
  id: number | string
}

const staffAccess = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

const referenceID = (value: Reference | null | undefined): number | string | undefined => {
  if (typeof value === 'object' && value !== null) return value.id
  return value ?? undefined
}

const sameReference = (first: Reference | null | undefined, second: Reference | null | undefined) => {
  const firstID = referenceID(first)
  const secondID = referenceID(second)
  return firstID !== undefined && secondID !== undefined && String(firstID) === String(secondID)
}

function roomIDs(rooms: BookingData['rooms']): Array<number | string> {
  return [...new Set((rooms ?? []).map(referenceID).filter((id): id is number | string => id !== undefined))]
}

function calendarDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value)
  return match?.[1]
}

function bookingDates(checkIn: string | null | undefined, checkOut: string | null | undefined): string[] {
  const start = calendarDate(checkIn)
  const end = calendarDate(checkOut)
  if (!start || !end || start >= end) return []

  const dates: string[] = []
  const current = new Date(`${start}T00:00:00.000Z`)
  const last = new Date(`${end}T00:00:00.000Z`)

  while (current < last) {
    dates.push(current.toISOString().slice(0, 10))
    current.setUTCDate(current.getUTCDate() + 1)
  }

  return dates
}

async function dailyBoard(payload: Payload, date: string): Promise<DailyAvailabilityData | undefined> {
  const found = await payload.find({
    collection: 'daily-availability',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      date: {
        equals: `${date}T00:00:00.000Z`,
      },
    },
  })

  return found.docs[0] as DailyAvailabilityData | undefined
}

async function boardForDate(payload: Payload, date: string): Promise<DailyAvailabilityData> {
  const existing = await dailyBoard(payload, date)
  if (existing) return existing

  return (await payload.create({
    collection: 'daily-availability',
    data: {
      date: `${date}T00:00:00.000Z`,
    },
    depth: 0,
    overrideAccess: true,
  })) as DailyAvailabilityData
}

function guestNote(booking: BookingData): string {
  return [booking.customerName, booking.customerPhone].filter(Boolean).join(' · ')
}

async function releaseBooking(payload: Payload, booking: BookingData): Promise<void> {
  if (booking.status !== 'confirmed' || !booking.id) return

  for (const date of bookingDates(booking.checkIn, booking.checkOut)) {
    const board = await dailyBoard(payload, date)
    if (!board?.availability) continue

    const availability = board.availability.map((row) => {
      if (row.status !== 'booked' || !sameReference(row.bookingRecordID, booking.id)) return row
      return {
        ...row,
        bookingRecordID: undefined,
        guestNotes: undefined,
        status: 'available' as const,
      }
    })

    await payload.update({
      collection: 'daily-availability',
      id: board.id,
      data: { availability } as never,
      depth: 0,
      overrideAccess: true,
    })
  }
}

async function applyBooking(payload: Payload, booking: BookingData): Promise<void> {
  if (booking.status !== 'confirmed' || !booking.id) return

  const selectedRooms = roomIDs(booking.rooms)
  for (const date of bookingDates(booking.checkIn, booking.checkOut)) {
    const board = await boardForDate(payload, date)
    const availability = (board.availability ?? []).map((row) => {
      if (!selectedRooms.some((id) => sameReference(row.room, id))) return row
      return {
        ...row,
        bookingRecordID: String(booking.id),
        guestNotes: guestNote(booking),
        status: 'booked' as const,
      }
    })

    await payload.update({
      collection: 'daily-availability',
      id: board.id,
      data: { availability } as never,
      depth: 0,
      overrideAccess: true,
    })
  }
}

async function validateAvailability(payload: Payload, booking: BookingData, originalBooking?: BookingData): Promise<void> {
  const dates = bookingDates(booking.checkIn, booking.checkOut)
  const rooms = roomIDs(booking.rooms)

  if (calendarDate(booking.checkIn) && calendarDate(booking.checkOut) && dates.length === 0) {
    throw new ValidationError({
      collection: 'bookings',
      errors: [{ path: 'checkOut', message: 'Check-out must be after check-in.' }],
    })
  }

  if (booking.status !== 'confirmed') return

  for (const date of dates) {
    const board = await dailyBoard(payload, date)
    if (!board?.availability) continue

    for (const room of rooms) {
      const row = board.availability.find((availabilityRow) => sameReference(availabilityRow.room, room))
      if (!row) continue
      if (row.status === 'maintenance') {
        throw new ValidationError({
          collection: 'bookings',
          errors: [{ path: 'rooms', message: `A selected room is in maintenance on ${date}.` }],
        })
      }
      if (row.status === 'booked' && !sameReference(row.bookingRecordID, originalBooking?.id)) {
        throw new ValidationError({
          collection: 'bookings',
          errors: [{ path: 'rooms', message: `A selected room is already booked on ${date}.` }],
        })
      }
    }
  }
}

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  labels: {
    singular: 'Booking',
    plural: 'Bookings',
  },
  admin: {
    group: 'Operations',
    useAsTitle: 'customerName',
    defaultColumns: ['customerName', 'customerPhone', 'checkIn', 'checkOut', 'status'],
    description: 'Book one or more whole rooms for a guest or group. Cancelling releases every booked night automatically.',
  },
  access: {
    create: staffAccess,
    delete: staffAccess,
    read: staffAccess,
    update: staffAccess,
  },
  hooks: {
    beforeChange: [async ({ data, originalDoc, req }) => {
      const booking = { ...(originalDoc as BookingData | undefined), ...(data as BookingData) }
      await validateAvailability(req.payload, booking, originalDoc as BookingData | undefined)
      return data
    }],
    afterChange: [async ({ doc, previousDoc, req }) => {
      await releaseBooking(req.payload, previousDoc as BookingData)
      await applyBooking(req.payload, doc as BookingData)
      return doc
    }],
    afterDelete: [async ({ doc, req }) => {
      await releaseBooking(req.payload, doc as BookingData)
    }],
  },
  fields: [
    {
      name: 'customerName',
      type: 'text',
      required: true,
    },
    {
      name: 'customerPhone',
      type: 'text',
      required: true,
      admin: {
        description: 'Use the number staff should call for this booking.',
      },
    },
    {
      name: 'rooms',
      type: 'relationship',
      relationTo: 'hotel-rooms',
      hasMany: true,
      required: true,
      admin: {
        description: 'Select every whole room this guest or group is taking.',
      },
    },
    {
      name: 'checkIn',
      type: 'date',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'checkOut',
      type: 'date',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: 'The room becomes available again on this date.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'confirmed',
      options: [
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        description: 'Set to Cancelled to release all rooms and dates without deleting the booking record.',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Optional internal note for the booking.',
      },
    },
  ],
}

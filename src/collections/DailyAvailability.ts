import type { CollectionConfig, Payload } from 'payload'

type RoomReference = number | string | { id: number | string }

type AvailabilityRow = {
  bookingRecordID?: string | null
  guestNotes?: string | null
  room?: RoomReference | null
  roomNumber?: string | null
  status?: 'available' | 'booked' | 'maintenance'
}

type DailyAvailabilityData = {
  availability?: AvailabilityRow[] | null
}

const staffAccess = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

const roomID = (room: RoomReference | null | undefined): number | string | undefined => {
  if (typeof room === 'object' && room !== null) return room.id
  return room ?? undefined
}

async function activeRoomRows(
  existingRows: AvailabilityRow[] | null | undefined,
  payload: Payload,
): Promise<AvailabilityRow[]> {
  const activeRooms = await payload.find({
    collection: 'hotel-rooms',
    depth: 0,
    limit: 0,
    overrideAccess: true,
    sort: 'roomNumber',
    where: {
      isActive: {
        equals: true,
      },
    },
  })

  const currentByRoom = new Map(
    (existingRows ?? [])
      .map((row) => [roomID(row.room), row] as const)
      .filter(([id]) => id !== undefined),
  )

  return activeRooms.docs.map((room) => {
    const current = currentByRoom.get(room.id)
    const status = current?.status ?? 'available'
    return {
      room: room.id,
      roomNumber: room.roomNumber,
      status,
      ...(status === 'booked' && current?.bookingRecordID ? { bookingRecordID: current.bookingRecordID } : {}),
      ...(status !== 'available' && current?.guestNotes ? { guestNotes: current.guestNotes } : {}),
    }
  })
}

export const DailyAvailability: CollectionConfig = {
  slug: 'daily-availability',
  labels: {
    singular: 'Daily availability',
    plural: 'Daily availability',
  },
  admin: {
    group: 'Operations',
    useAsTitle: 'date',
    defaultColumns: ['date', 'updatedAt'],
    description: 'One record per date. Bookings update these room statuses automatically; use this board for manual changes and maintenance.',
  },
  access: {
    create: staffAccess,
    delete: staffAccess,
    read: staffAccess,
    update: staffAccess,
  },
  hooks: {
    // Shows rooms added after a date was first created; the next save persists them.
    afterRead: [async ({ doc, req }) => {
      const daily = doc as DailyAvailabilityData
      daily.availability = await activeRoomRows(daily.availability, req.payload)
      return daily
    }],
    // Keeps one whole-room status row for every active room.
    beforeChange: [async ({ data, originalDoc, req }) => {
      const daily = data as DailyAvailabilityData
      const previous = originalDoc as DailyAvailabilityData | undefined
      daily.availability = await activeRoomRows(
        daily.availability ?? previous?.availability,
        req.payload,
      )
      return daily
    }],
  },
  fields: [
    {
      name: 'date',
      type: 'date',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayOnly',
        },
        description: 'Create exactly one availability board for each calendar date.',
      },
    },
    {
      name: 'availability',
      type: 'array',
      labels: {
        singular: 'Room status',
        plural: 'Room statuses',
      },
      admin: {
        description: 'Select a date, save once, then update only the room status and note below.',
        initCollapsed: true,
        components: {
          RowLabel: '@/components/payload/AvailabilityRowLabel#default',
        },
      },
      fields: [
        {
          name: 'room',
          type: 'relationship',
          relationTo: 'hotel-rooms',
          required: true,
          admin: { hidden: true },
        },
        {
          name: 'roomNumber',
          type: 'text',
          required: true,
          admin: {
            readOnly: true,
            description: 'Set automatically from the Rooms list.',
          },
        },
        {
          name: 'bookingRecordID',
          type: 'text',
          admin: {
            hidden: true,
          },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'available',
          options: [
            { label: 'Available', value: 'available' },
            { label: 'Booked', value: 'booked' },
            { label: 'Maintenance', value: 'maintenance' },
          ],
        },
        {
          name: 'guestNotes',
          type: 'textarea',
          admin: {
            description: 'Optional guest, group, or operational note. Clear it when the room becomes Available again.',
          },
        },
      ],
    },
  ],
}

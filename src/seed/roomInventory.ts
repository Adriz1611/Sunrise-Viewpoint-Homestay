import type { Payload } from 'payload'

type InitialRoom = {
  roomNumber: string
  roomType: '4-Sharing' | '6-Sharing'
}

const initialRoomTypes = [
  { name: '4-Sharing', capacity: 4 },
  { name: '6-Sharing', capacity: 6 },
] as const

const initialRooms: InitialRoom[] = [
  ...['101', '102', '103', '104', '105', '106'].map((roomNumber) => ({ roomNumber, roomType: '4-Sharing' as const })),
  ...['201', '202'].map((roomNumber) => ({ roomNumber, roomType: '6-Sharing' as const })),
]

/** Initial inventory supplied for the room-status management system. */
export async function seedRoomInventory(payload: Payload): Promise<void> {
  const typeIDs = new Map<string, number>()

  for (const roomType of initialRoomTypes) {
    const existing = await payload.find({
      collection: 'room-types',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { name: { equals: roomType.name } },
    })
    const doc = existing.docs[0] ?? await payload.create({
      collection: 'room-types',
      data: roomType,
      overrideAccess: true,
    })
    typeIDs.set(roomType.name, doc.id)
  }

  for (const room of initialRooms) {
    const existing = await payload.find({
      collection: 'hotel-rooms',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { roomNumber: { equals: room.roomNumber } },
    })
    if (existing.docs[0]) continue

    await payload.create({
      collection: 'hotel-rooms',
      data: {
        roomNumber: room.roomNumber,
        roomType: typeIDs.get(room.roomType)!,
        isActive: true,
      },
      overrideAccess: true,
    })
  }

  payload.logger.info('seed: 2 room types and 8 rooms ready')
}

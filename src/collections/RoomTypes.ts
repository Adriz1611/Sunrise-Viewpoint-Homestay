import type { CollectionConfig } from 'payload'

const staffAccess = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

export const RoomTypes: CollectionConfig = {
  slug: 'room-types',
  labels: {
    singular: 'Room type',
    plural: 'Room types',
  },
  admin: {
    group: 'Inventory',
    useAsTitle: 'name',
    defaultColumns: ['name', 'capacity', 'updatedAt'],
    description: 'Reusable room configurations. Add a type here before adding its rooms.',
  },
  access: {
    create: staffAccess,
    delete: staffAccess,
    read: staffAccess,
    update: staffAccess,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'For example: 4-Sharing or 2-Sharing.',
      },
    },
    {
      name: 'capacity',
      type: 'number',
      required: true,
      min: 1,
      admin: {
        description: 'Maximum guests for one whole room. Beds are not booked separately.',
      },
    },
  ],
}

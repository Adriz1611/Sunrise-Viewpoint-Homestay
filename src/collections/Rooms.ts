import type { CollectionConfig } from 'payload'

const staffAccess = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

export const Rooms: CollectionConfig = {
  // The prior marketing CMS used the `rooms` database table for a global.
  // Keep the staff-facing label as Rooms while avoiding a destructive table migration.
  slug: 'hotel-rooms',
  labels: {
    singular: 'Room',
    plural: 'Rooms',
  },
  admin: {
    group: 'Inventory',
    useAsTitle: 'roomNumber',
    defaultColumns: ['roomNumber', 'roomType', 'isActive', 'updatedAt'],
    description: 'Each record is one bookable room. Mark a room inactive to remove it from future daily availability.',
  },
  access: {
    create: staffAccess,
    delete: staffAccess,
    read: staffAccess,
    update: staffAccess,
  },
  fields: [
    {
      name: 'roomNumber',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'A stable room identifier, for example 101 or Cottage A.',
      },
    },
    {
      name: 'roomType',
      type: 'relationship',
      relationTo: 'room-types',
      required: true,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Only active rooms appear in the daily availability board.',
      },
    },
  ],
}

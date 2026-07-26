import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'manager',
      options: [
        { label: 'Manager', value: 'manager' },
        { label: 'Staff', value: 'staff' },
      ],
      admin: {
        description: 'Room-status access is limited to authenticated staff and managers in this admin panel.',
      },
    },
  ],
}

'use client'

import { useRowLabel } from '@payloadcms/ui'

type AvailabilityRow = {
  roomNumber?: string
  status?: 'available' | 'booked' | 'maintenance'
}

const statusLabels = {
  available: 'Available',
  booked: 'Booked',
  maintenance: 'Maintenance',
} as const

export default function AvailabilityRowLabel() {
  const { data } = useRowLabel<AvailabilityRow>()
  const status = data.status ?? 'available'

  return (
    <span>
      Room {data.roomNumber ?? '—'} — <strong>{statusLabels[status]}</strong>
    </span>
  )
}

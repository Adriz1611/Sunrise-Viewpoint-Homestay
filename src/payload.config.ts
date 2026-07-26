import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { RoomTypes } from './collections/RoomTypes'
import { Rooms } from './collections/Rooms'
import { DailyAvailability } from './collections/DailyAvailability'
import { Bookings } from './collections/Bookings'
import { SiteSettings } from './globals/SiteSettings'
import { Hero } from './globals/Hero'
import { Rooms as MarketingRooms } from './globals/Rooms'
import { Experiences } from './globals/Experiences'
import { Gallery } from './globals/Gallery'
import { Tariff } from './globals/Tariff'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const databaseURL =
  process.env.DATABASE_URI || process.env.DATABASE_URL || process.env.POSTGRES_URL || ''

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, RoomTypes, Rooms, DailyAvailability, Bookings],
  globals: [Hero, MarketingRooms, Experiences, Gallery, Tariff, SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseURL,
    },
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      // Vercel injects this after a Blob store is connected. Without it, local
      // development keeps Payload's normal disk-backed upload behavior.
      token: process.env.BLOB_READ_WRITE_TOKEN,
      collections: {
        media: true,
      },
      // Vercel Functions have a 4.5 MB request-body limit. Client uploads send
      // the file directly to Blob and then let Payload save the Media document.
      clientUploads: true,
      addRandomSuffix: true,
    }),
  ],
})

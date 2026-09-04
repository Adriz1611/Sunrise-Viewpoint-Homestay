import { getLocalWeather } from '@/lib/met-weather'

// Weather updates independently; the marketing homepage remains prerendered.
export async function GET() {
  try {
    return Response.json(await getLocalWeather(), {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    console.error(
      'Local weather unavailable:',
      error instanceof Error ? error.message : 'Unknown error',
    )
    return Response.json(
      { error: 'Weather is temporarily unavailable' },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  }
}

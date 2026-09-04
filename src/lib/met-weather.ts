import { MAP_EMBED_SRC, SITE_URL } from '@/lib/site'
import { localWeatherDate, WEATHER_REFRESH_MS, type LocalWeather } from '@/lib/weather'

// MET Norway's global forecast and Sunrise 3.0 services require no API key
// and allow commercial use with attribution: https://api.met.no/doc/TermsOfService
// Cache until upstream Expires and use Last-Modified for conditional requests.
type CachedResponse = { data: unknown; expires: number; modified: string | null }
const cache = new Map<string, CachedResponse>()
const pending = new Map<string, Promise<unknown>>()

async function metJSON(url: string): Promise<unknown> {
  const previous = cache.get(url)
  if (previous && previous.expires > Date.now()) return previous.data
  const active = pending.get(url)
  if (active) return active

  const request = (async () => {
    const headers: Record<string, string> = {
      'User-Agent': `SunriseViewpointHomestay/1.0 ${SITE_URL}`,
    }
    if (previous?.modified) headers['If-Modified-Since'] = previous.modified
    const response = await fetch(url, {
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok && !(response.status === 304 && previous)) {
      throw new Error(`MET Norway returned ${response.status}`)
    }
    const data: unknown = response.status === 304 ? previous!.data : await response.json()
    cache.set(url, {
      data,
      expires: Math.max(
        Date.now() + WEATHER_REFRESH_MS,
        Date.parse(response.headers.get('Expires') ?? '') || 0,
      ),
      modified: response.headers.get('Last-Modified') ?? previous?.modified ?? null,
    })
    // Only one location is queried; discard old sunrise dates as days roll over.
    if (cache.size > 4) cache.delete(cache.keys().next().value!)
    return data
  })()
  pending.set(url, request)
  try {
    return await request
  } finally {
    pending.delete(url)
  }
}

type Forecast = {
  properties?: {
    timeseries?: {
      time: string
      data?: { instant?: { details?: { air_temperature?: number } } }
    }[]
  }
}
type Sun = { properties?: { sunrise?: { time?: string | null } } }

export async function getLocalWeather(now = new Date()): Promise<LocalWeather> {
  // Use the region centered in the existing Google Maps embed, as requested.
  // Derive rather than duplicating coordinates or replacing Payload's location fields.
  const match = MAP_EMBED_SRC.match(/!2d(-?[\d.]+)!3d(-?[\d.]+)/)
  if (!match) throw new Error('The map embed does not contain weather coordinates')
  const location = new URLSearchParams({
    lat: Number(match[2]).toFixed(4),
    lon: Number(match[1]).toFixed(4),
  })
  const sunAt = async (date: Date) => {
    const params = new URLSearchParams(location)
    params.set('date', localWeatherDate(date))
    params.set('offset', '+05:30')
    const data = (await metJSON(`https://api.met.no/weatherapi/sunrise/3.0/sun?${params}`)) as Sun
    const time = data.properties?.sunrise?.time
    if (!time || !Number.isFinite(Date.parse(time))) throw new Error('Sunrise is unavailable')
    return time
  }
  const [forecast, todaySunrise] = await Promise.all([
    metJSON(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?${location}`,
    ) as Promise<Forecast>,
    sunAt(now),
  ])
  const points = forecast.properties?.timeseries
  if (!Array.isArray(points) || !points.length) throw new Error('Weather is unavailable')
  const nearest = points.reduce((best, point) =>
    Math.abs(Date.parse(point.time) - now.getTime()) <
    Math.abs(Date.parse(best.time) - now.getTime())
      ? point
      : best,
  )
  const temperature = nearest.data?.instant?.details?.air_temperature
  // This is a current forecast estimate, not a thermometer at the property.
  if (
    typeof temperature !== 'number' ||
    !Number.isFinite(temperature) ||
    !Number.isFinite(Date.parse(nearest.time)) ||
    Math.abs(Date.parse(nearest.time) - now.getTime()) > 90 * 60 * 1000
  ) {
    throw new Error('A current temperature estimate is unavailable')
  }
  const sunrise =
    Date.parse(todaySunrise) > now.getTime()
      ? todaySunrise
      : await sunAt(new Date(now.getTime() + 24 * 60 * 60 * 1000))
  return { temperature: Math.round(temperature), sunrise, checkedAt: now.toISOString() }
}

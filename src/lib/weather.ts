/** All weather dates use the homestay's Indian local time, never the visitor's. */
export const WEATHER_TIME_ZONE = 'Asia/Kolkata'
export const WEATHER_REFRESH_MS = 5 * 60 * 1000

export type LocalWeather = {
  temperature: number
  sunrise: string
  checkedAt: string
}

export function localWeatherDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: WEATHER_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function localWeatherTime(date: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: WEATHER_TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date))
}

export function isLocalWeather(value: unknown): value is LocalWeather {
  if (!value || typeof value !== 'object') return false
  const data = value as LocalWeather
  return (
    typeof data.temperature === 'number' &&
    Number.isFinite(data.temperature) &&
    typeof data.sunrise === 'string' &&
    Number.isFinite(Date.parse(data.sunrise)) &&
    typeof data.checkedAt === 'string' &&
    Number.isFinite(Date.parse(data.checkedAt))
  )
}

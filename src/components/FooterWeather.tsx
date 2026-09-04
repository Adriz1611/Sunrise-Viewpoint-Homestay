'use client'

import { useEffect, useState } from 'react'
import Reveal from '@/components/Reveal'
import {
  isLocalWeather,
  localWeatherDate,
  localWeatherTime,
  WEATHER_REFRESH_MS,
  type LocalWeather,
} from '@/lib/weather'

export default function FooterWeather() {
  const [weather, setWeather] = useState<LocalWeather | null>(null)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    let controller: AbortController | undefined
    let disposed = false
    async function refresh() {
      if (document.hidden || controller) return
      const request = new AbortController()
      controller = request
      const timeout = window.setTimeout(() => request.abort(), 25000)
      try {
        const response = await fetch('/api/weather', { cache: 'no-store', signal: request.signal })
        if (!response.ok) throw new Error('Weather unavailable')
        const data: unknown = await response.json()
        if (!isLocalWeather(data)) throw new Error('Invalid weather response')
        if (!disposed) {
          setWeather(data)
          setUnavailable(false)
        }
      } catch {
        // Never leave an old reading presented as the current temperature.
        if (!disposed) {
          setWeather(null)
          setUnavailable(true)
        }
      } finally {
        window.clearTimeout(timeout)
        controller = undefined
      }
    }
    void refresh()
    const interval = window.setInterval(refresh, WEATHER_REFRESH_MS)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      disposed = true
      controller?.abort()
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  const sunriseDay =
    weather &&
    localWeatherDate(new Date(weather.sunrise)) === localWeatherDate(new Date(weather.checkedAt))
      ? 'today'
      : 'tomorrow'

  return (
    <Reveal className="mt-5">
      {/* A whole-block reveal keeps changing text out of SplitText's managed DOM. */}
      <h2 className="font-display max-w-5xl text-4xl leading-[1.1] tracking-tight text-cream sm:text-6xl lg:text-7xl">
        {weather ? (
          <>
            It’s about{' '}
            <a
              href="https://api.met.no/doc/License"
              target="_blank"
              rel="noopener noreferrer"
              title="Weather and sunrise data from MET Norway (CC BY 4.0). Temperature rounded."
              className="font-numeric whitespace-nowrap"
            >
              {weather.temperature}°C
            </a>{' '}
            on the ridge.
          </>
        ) : (
          'Stay for the morning light.'
        )}
        <br />
        <em className="text-celadon">
          {weather ? (
            <>
              Sunrise is at{' '}
              <span className="font-numeric whitespace-nowrap not-italic">
                {localWeatherTime(weather.sunrise)}
              </span>{' '}
              {sunriseDay}.
            </>
          ) : (
            'The hills will be waiting.'
          )}
        </em>
      </h2>
      <p className="mt-5 text-xs leading-relaxed text-cream-dim" role="status" aria-live="polite">
        {weather ? (
          <>
            Local time (IST) · Checked at{' '}
            <span className="font-numeric">{localWeatherTime(weather.checkedAt)}</span>
          </>
        ) : unavailable ? (
          'Weather is temporarily unavailable. We’ll check again shortly.'
        ) : (
          'Checking the weather on the ridge…'
        )}
      </p>
    </Reveal>
  )
}

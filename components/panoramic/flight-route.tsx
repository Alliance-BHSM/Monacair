'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import type { PanoramicFlight, Destination as PayloadDestination } from '../../payload-types'

interface FlightRouteProps {
  panoramicFlight: PanoramicFlight | null
}

interface Stop {
  name: string
  isMainStop: boolean
}

export default function FlightRoute({ panoramicFlight }: FlightRouteProps) {
  const t = useTranslations('Panoramic.route')
  const [stops, setStops] = useState<Stop[]>([])

  useEffect(() => {
    if (panoramicFlight && panoramicFlight.routes && panoramicFlight.routes.length > 0) {
      const route = panoramicFlight.routes[0]

      if (panoramicFlight.start && route.end && route.end.length > 0) {
        const startPoint = panoramicFlight.start as PayloadDestination | string
        const endPointOfInterest = route.end[0].point_of_interest
        const endPointDestination =
          endPointOfInterest && typeof endPointOfInterest === 'object'
            ? (endPointOfInterest.destination as PayloadDestination | string)
            : null

        const startName =
          typeof startPoint === 'string' ? startPoint : startPoint?.title || t('defaultStart')
        const endName = endPointDestination
          ? typeof endPointDestination === 'string'
            ? endPointDestination
            : endPointDestination?.title || t('defaultEnd')
          : t('defaultEnd')

        const routeStops: Stop[] = [{ name: startName, isMainStop: true }]

        if (
          endPointOfInterest &&
          typeof endPointOfInterest === 'object' &&
          endPointOfInterest.stops
        ) {
          endPointOfInterest.stops.forEach((stopObj) => {
            const stopPoint = stopObj as PayloadDestination | string
            if (stopPoint && typeof stopPoint !== 'string') {
              routeStops.push({ name: stopPoint.title || t('intermediateStop'), isMainStop: false })
            } else if (typeof stopPoint === 'string') {
              routeStops.push({ name: stopPoint || t('intermediateStop'), isMainStop: false })
            }
          })
        }
        routeStops.push({ name: endName, isMainStop: true })
        setStops(routeStops)
      } else {
        setStops([])
      }
    } else {
      setStops([])
    }
  }, [panoramicFlight, t])

  if (!panoramicFlight || stops.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-[color:var(--color-royalblue)] text-5xl font-serif font-caslon mb-16 tracking-tight">
          {t('title')}
        </h1>
        <div className="text-center py-8">{t('noRouteInfo')}</div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h1 className="text-[color:var(--color-royalblue)] text-5xl font-serif font-caslon mb-16 tracking-tight">
        {t('title')}
      </h1>

      <div className="relative">
        <div className="flex justify-between mb-8">
          <h2 className="text-3xl font-bold font-brother">{stops[0]?.name || ''}</h2>
          <h2 className="text-3xl font-bold font-brother">{stops[stops.length - 1]?.name || ''}</h2>
        </div>

        <div className="relative">
          <div className="absolute top-[14px] left-0 right-0 border-t-4 border-dashed border-[color:var(--color-redmonacair)] z-0"></div>

          <div className="flex justify-between relative z-10">
            {stops.map((stop, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full border-4 border-[color:var(--color-redmonacair)] bg-white ${index === 0 || index === stops.length - 1 ? 'ring-4 ring-[color:var(--color-redmonacair)] ring-opacity-30' : ''}`}
                ></div>
                {!stop.isMainStop && (
                  <div className="mt-6 text-center text-gray-600 max-w-[120px] font-brother">
                    {stop.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

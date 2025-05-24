'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname /*, useRouter */ } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ArrowRight, ChevronDown, ArrowUpDown } from 'lucide-react'
import type { RegularFlight, Destination, PanoramicFlight } from '@/payload-types'
import { QueryParams } from 'next-intl/navigation'
import { TravelersDropdown } from '@/components/regular-line/travelers-dropdown'

interface BookingFormProps {
  initialAllDestinations: Destination[]
  initialRoutes: RegularFlight[]
  initialPanoramicFlights: PanoramicFlight[]
}

const BookingForm = ({
  initialAllDestinations,
  initialRoutes,
  initialPanoramicFlights,
}: BookingFormProps) => {
  const t = useTranslations('Booking')
  const router = useRouter()

  const [flightType, setFlightType] = useState('regular-line')
  const [departure, setDeparture] = useState('')
  const [destination, setDestination] = useState('')
  const [passengers, setPassengers] = useState('1')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [newborns, setNewborns] = useState(0)
  const [isReturn, setIsReturn] = useState(false)
  const [availableDestinations, setAvailableDestinations] = useState<Destination[]>([])
  const [availableDepartures, setAvailableDepartures] = useState<Destination[]>([])
  const [allDestinations, setAllDestinations] = useState<Destination[]>(initialAllDestinations)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [routes, setRoutes] = useState<RegularFlight[]>(initialRoutes)
  const [panoramicFlights, setPanoramicFlights] =
    useState<PanoramicFlight[]>(initialPanoramicFlights)
  const [maxPassengers, setMaxPassengers] = useState(6)

  useEffect(() => {
    if (loading || allDestinations.length === 0) {
      setAvailableDepartures([])
      return
    }

    let filteredDepartures: Destination[] = []

    if (flightType === 'regular-line' || flightType === 'private-flight') {
      if (routes.length > 0) {
        const departureIds = new Set<string>()
        routes.forEach((route) => {
          const startId =
            typeof route.start_point === 'string' ? route.start_point : route.start_point.slug
          departureIds.add(startId)
          const endId = typeof route.end_point === 'string' ? route.end_point : route.end_point.slug
          departureIds.add(endId)
        })
        filteredDepartures = allDestinations.filter((dest) => departureIds.has(dest.slug))
      }
    } else if (flightType === 'panoramic-flight') {
      if (panoramicFlights.length > 0) {
        const departureIds = new Set<string>()
        panoramicFlights.forEach((flight) => {
          const startId = typeof flight.start === 'string' ? flight.start : flight.start?.slug
          if (startId) departureIds.add(startId)
        })
        filteredDepartures = allDestinations.filter((dest) => departureIds.has(dest.slug))
      }
    }

    if (filteredDepartures.length > 0) {
      setAvailableDepartures(filteredDepartures)
    } else if (flightType === 'private-jet') {
      setAvailableDepartures(allDestinations)
    } else {
      setAvailableDepartures([])
    }
  }, [flightType, loading, allDestinations, routes, panoramicFlights])

  useEffect(() => {
    if (departure) {
      if (flightType === 'regular-line' || flightType === 'private-flight') {
        const forwardRoutes = routes.filter((route) => {
          const startId =
            typeof route.start_point === 'string' ? route.start_point : route.start_point.slug
          return startId === departure
        })

        const reverseRoutes = routes.filter((route) => {
          const endId = typeof route.end_point === 'string' ? route.end_point : route.end_point.slug
          return endId === departure
        })

        const forwardDestIds = forwardRoutes.map((route) => {
          return typeof route.end_point === 'string' ? route.end_point : route.end_point.slug
        })

        const reverseDestIds = reverseRoutes.map((route) => {
          return typeof route.start_point === 'string' ? route.start_point : route.start_point.slug
        })

        const availableDestIds = [...forwardDestIds, ...reverseDestIds]
        const uniqueDestIds = [...new Set(availableDestIds)]
        const filteredDestinations = allDestinations.filter((dest) =>
          uniqueDestIds.includes(dest.slug),
        )
        setAvailableDestinations(filteredDestinations)

        if (destination && !uniqueDestIds.includes(destination)) {
          setDestination('')
        }
      } else if (flightType === 'panoramic-flight') {
        const panoramicRoutes = panoramicFlights.filter((flight) => {
          const startId = typeof flight.start === 'string' ? flight.start : flight.start?.slug

          return startId === departure
        })

        const availableDestIds: string[] = []

        panoramicRoutes.forEach((flight) => {
          flight.routes?.forEach((route) => {
            route.end?.forEach((endpoint) => {
              const destId =
                typeof endpoint.point_of_interest?.destination === 'string'
                  ? endpoint.point_of_interest.destination
                  : endpoint.point_of_interest?.destination?.slug

              if (destId && !availableDestIds.includes(destId)) {
                availableDestIds.push(destId)
              }
            })
          })
        })

        const filteredDestinations = allDestinations.filter((dest) =>
          availableDestIds.includes(dest.slug),
        )

        setAvailableDestinations(filteredDestinations)

        if (destination && !availableDestIds.includes(destination)) {
          setDestination('')
        }
      } else {
        setAvailableDestinations([])
      }
    } else {
      setAvailableDestinations([])
    }
  }, [departure, destination, routes, allDestinations, flightType, panoramicFlights])

  useEffect(() => {
    if (destination) {
      if (flightType === 'regular-line' || flightType === 'private-flight') {
        const forwardRoutes = routes.filter((route) => {
          const endId = typeof route.end_point === 'string' ? route.end_point : route.end_point.slug
          return endId === destination
        })

        const reverseRoutes = routes.filter((route) => {
          const startId =
            typeof route.start_point === 'string' ? route.start_point : route.start_point.slug
          return startId === destination
        })

        const forwardDepIds = forwardRoutes.map((route) => {
          return typeof route.start_point === 'string' ? route.start_point : route.start_point.slug
        })

        const reverseDepIds = reverseRoutes.map((route) => {
          return typeof route.end_point === 'string' ? route.end_point : route.end_point.slug
        })

        const availableDepIds = [...forwardDepIds, ...reverseDepIds]
        const uniqueDepIds = [...new Set(availableDepIds)]
        const filteredDepartures = allDestinations.filter((dest) =>
          uniqueDepIds.includes(dest.slug),
        )
        if (JSON.stringify(availableDepartures) !== JSON.stringify(filteredDepartures)) {
          setAvailableDepartures(filteredDepartures)
        }

        if (departure && !uniqueDepIds.includes(departure)) {
          setDeparture('')
        }
      } else if (flightType === 'panoramic-flight') {
        const panoramicRoutes = panoramicFlights.filter((flight) => {
          let hasDestination = false

          flight.routes?.forEach((route) => {
            route.end?.forEach((endpoint) => {
              const destId =
                typeof endpoint.point_of_interest?.destination === 'string'
                  ? endpoint.point_of_interest.destination
                  : endpoint.point_of_interest?.destination?.slug

              if (destId === destination) {
                hasDestination = true
              }
            })
          })

          return hasDestination
        })

        const availableDepIds: string[] = []

        panoramicRoutes.forEach((flight) => {
          const startId = typeof flight.start === 'string' ? flight.start : flight.start?.slug

          if (startId && !availableDepIds.includes(startId)) {
            availableDepIds.push(startId)
          }
        })

        const filteredDepartures = allDestinations.filter((dest) =>
          availableDepIds.includes(dest.slug),
        )

        if (JSON.stringify(availableDepartures) !== JSON.stringify(filteredDepartures)) {
          setAvailableDepartures(filteredDepartures)
        }

        if (departure && !availableDepIds.includes(departure)) {
          setDeparture('')
        }
      } else {
        if (JSON.stringify(availableDepartures) !== JSON.stringify(allDestinations)) {
          setAvailableDepartures(allDestinations)
        }
      }
    } else {
      if (JSON.stringify(availableDepartures) !== JSON.stringify(allDestinations)) {
      }
    }
  }, [destination, departure, routes, allDestinations, flightType, panoramicFlights])

  const handleTravelersChange = (newAdults: number, newChildren: number, newNewborns: number) => {
    setAdults(newAdults)
    setChildren(newChildren)
    setNewborns(newNewborns)
    setPassengers(String(newAdults + newChildren))
  }

  const handleFlightTypeChange = (value: string) => {
    setFlightType(value)
    setDeparture('')
    setDestination('')

    if (value === 'panoramic-flight') {
      setIsReturn(false)
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!departure || !destination || passengers === '0') {
      return
    }

    let pathname = '/'
    const query: QueryParams = {
      passengers: passengers,
    }
    const queryParams = new URLSearchParams()

    if (flightType === 'regular-line') {
      pathname = `/flights/regular/${departure}/${destination}`
      query.adults = String(adults)

      if (children > 0) {
        query.children = String(children)
      }

      if (newborns > 0) {
        query.newborns = String(newborns)
      }

      if (isReturn) {
        query.isReturn = 'true'
      } else {
        query.oneway = 'true'
      }
    } else if (flightType === 'panoramic-flight') {
      pathname = `/flights/panoramic/${departure}/${destination}`
      if (children > 0) {
        queryParams.append('children', String(children))
      }

      if (newborns > 0) {
        queryParams.append('newborns', String(newborns))
      }
    } else if (flightType === 'private-flight') {
      pathname = `/booking/private/${departure}/${destination}`
      queryParams.append('passengers', passengers)
      queryParams.append('adults', String(adults))

      if (children > 0) {
        queryParams.append('children', String(children))
      }

      if (newborns > 0) {
        queryParams.append('newborns', String(newborns))
      }
    } else if (flightType === 'private-jet') {
      pathname = '/private-jet'
      queryParams.append('from', departure)
      queryParams.append('to', destination)
      queryParams.append('passengers', passengers)
      queryParams.append('adults', String(adults))

      if (children > 0) {
        queryParams.append('children', String(children))
      }

      if (newborns > 0) {
        queryParams.append('newborns', String(newborns))
      }
    }

    if (isReturn) {
      queryParams.append('isReturn', 'true')
    } else {
      queryParams.append('oneway', 'true')
    }

    router.push({ pathname, query })
  }

  const switchLocations = () => {
    const temp = departure
    setDeparture(destination)
    setDestination(temp)
  }

  return (
    <div className="py-6">
      <div className="container mx-auto px-2 sm:px-12">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row rounded-2xl overflow-hidden border-4 border-royalblue">
            <div className="relative flex-1 bg-white">
              <div className="absolute top-3 left-4 text-xs text-gray-500">Du</div>
              <div className="flex items-center h-full">
                <select
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  className="w-full h-full pt-6 pb-2 px-4 text-2xl text-gray-500 focus:outline-none appearance-none"
                  disabled={loading}
                >
                  <option value="" disabled>
                    {loading
                      ? 'Loading departures...'
                      : availableDepartures.length === 0
                        ? 'No departures available for this flight type'
                        : 'Départ'}
                  </option>
                  {availableDepartures.map((dest) => (
                    <option key={`dep-${dest.slug}`} value={dest.slug}>
                      {dest.title}
                    </option>
                  ))}
                </select>
                <button type="button" className="px-4">
                  <ChevronDown className="h-6 w-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center bg-royalblue px-2">
              <button type="button" onClick={switchLocations} className="bg-white rounded-full p-2">
                <ArrowUpDown className="h-5 w-5 text-royalblue" />
              </button>
            </div>

            <div className="relative flex-1 bg-white">
              <div className="absolute top-3 left-4 text-xs text-gray-500">À</div>
              <div className="flex items-center h-full">
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full h-full pt-6 pb-2 px-4 text-2xl text-gray-500 focus:outline-none appearance-none"
                  disabled={loading || !departure || availableDestinations.length === 0}
                >
                  <option value="" disabled>
                    {loading
                      ? 'Loading destinations...'
                      : !departure
                        ? 'Select departure first'
                        : availableDestinations.length === 0
                          ? 'No destinations available for this route'
                          : 'Destination'}
                  </option>
                  {availableDestinations.map((dest) => (
                    <option key={`dest-${dest.slug}`} value={dest.slug}>
                      {dest.title}
                    </option>
                  ))}
                </select>
                <button type="button" className="px-4">
                  <ChevronDown className="h-6 w-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="relative bg-white border-l-2 border-gray-200">
              <div className="absolute top-3 left-4 text-xs text-gray-500">
                {t('booking-form.passengers')}
              </div>
              <div className="flex items-end h-full">
                <TravelersDropdown
                  maxAdults={maxPassengers}
                  maxTotal={maxPassengers}
                  onChange={handleTravelersChange}
                  initialAdults={adults}
                  initialChildren={children}
                  initialNewborns={newborns}
                  noBorder={true}
                />
              </div>
            </div>

            {(flightType === 'regular-line' ||
              flightType === 'private-flight' ||
              flightType === 'private-jet') && (
              <div className="relative bg-white border-l-2 border-gray-200 px-4 flex items-center">
                <div className="flex flex-col items-center justify-center w-full py-2">
                  <div className="mt-[-8px] mb-2">
                    <span className="text-xs whitespace-nowrap text-red-600 font-bold">
                      {isReturn
                        ? t('booking-form.flight-type.return')
                        : t('booking-form.flight-type.one-way')}
                    </span>
                  </div>
                  <Switch checked={isReturn} onCheckedChange={setIsReturn} />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="bg-red-600 p-6 flex items-center justify-center"
              disabled={loading || !departure || !destination}
            >
              <ArrowRight className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 mt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <input
                  type="radio"
                  name="flightType"
                  className="sr-only"
                  checked={flightType === 'private-flight'}
                  onChange={() => handleFlightTypeChange('private-flight')}
                />
                <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                {flightType === 'private-flight' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
                  </div>
                )}
              </div>
              <span>{t('booking-form.flight-types.private-flight')}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <input
                  type="radio"
                  name="flightType"
                  className="sr-only"
                  checked={flightType === 'regular-line'}
                  onChange={() => handleFlightTypeChange('regular-line')}
                />
                <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                {flightType === 'regular-line' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
                  </div>
                )}
              </div>
              <span>{t('booking-form.flight-types.regular-line')}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <input
                  type="radio"
                  name="flightType"
                  className="sr-only"
                  checked={flightType === 'panoramic-flight'}
                  onChange={() => handleFlightTypeChange('panoramic-flight')}
                />
                <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                {flightType === 'panoramic-flight' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
                  </div>
                )}
              </div>
              <span>{t('booking-form.flight-types.panoramic-flight')}</span>
            </label>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookingForm

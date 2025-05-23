'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ArrowRight, ChevronDown, ArrowUpDown } from 'lucide-react'
import type { RegularFlight, Destination, PanoramicFlight } from '../../payload-types'

const BookingForm = () => {
  const t = useTranslations('Booking')
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const [flightType, setFlightType] = useState('regular-line')
  const [departure, setDeparture] = useState('')
  const [destination, setDestination] = useState('')
  const [passengers, setPassengers] = useState('1')
  const [isReturn, setIsReturn] = useState(false)
  const [availableDestinations, setAvailableDestinations] = useState<Destination[]>([])
  const [availableDepartures, setAvailableDepartures] = useState<Destination[]>([])
  const [allDestinations, setAllDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [routes, setRoutes] = useState<RegularFlight[]>([])
  const [panoramicFlights, setPanoramicFlights] = useState<PanoramicFlight[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const [destinationsResponse, routesResponse, panoramicResponse] = await Promise.all([
          fetch('/api/destinations?limit=100'),
          fetch('/api/regular-flights?limit=100'),
          fetch('/api/panoramic-flights?limit=100'),
        ])

        const destinationsData = await destinationsResponse.json()
        const routesData = await routesResponse.json()
        const panoramicData = await panoramicResponse.json()

        if (destinationsData.docs && Array.isArray(destinationsData.docs)) {
          setAllDestinations(destinationsData.docs)
        }

        if (routesData.docs && Array.isArray(routesData.docs)) {
          setRoutes(routesData.docs)
        }

        if (panoramicData.docs && Array.isArray(panoramicData.docs)) {
          setPanoramicFlights(panoramicData.docs)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load destinations')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (
      !loading &&
      allDestinations.length > 0 &&
      (routes.length > 0 || panoramicFlights.length > 0)
    ) {
      let filteredDepartures: Destination[] = []

      if (flightType === 'regular-line' || flightType === 'private-flight') {
        const departureIds = new Set<string>()

        routes.forEach((route) => {
          const startId =
            typeof route.start_point === 'string' ? route.start_point : route.start_point.id
          departureIds.add(startId)

          const endId = typeof route.end_point === 'string' ? route.end_point : route.end_point.id
          departureIds.add(endId)
        })

        filteredDepartures = allDestinations.filter((dest) => departureIds.has(dest.id))
      } else if (flightType === 'panoramic-flight') {
        const departureIds = new Set<string>()
        panoramicFlights.forEach((flight) => {
          flight.routes?.forEach((route) => {
            const startId = typeof route.start === 'string' ? route.start : route.start?.id
            if (startId) {
              departureIds.add(startId)
            }
          })
        })

        filteredDepartures = allDestinations.filter((dest) => departureIds.has(dest.id))
      } else if (flightType === 'private-jet') {
        filteredDepartures = allDestinations
      }

      setAvailableDepartures(filteredDepartures.length > 0 ? filteredDepartures : allDestinations)
    }
  }, [flightType, loading, allDestinations, routes, panoramicFlights])

  useEffect(() => {
    if (departure) {
      if (flightType === 'regular-line' || flightType === 'private-flight') {
        const forwardRoutes = routes.filter((route) => {
          const startId =
            typeof route.start_point === 'string' ? route.start_point : route.start_point.id
          return startId === departure
        })

        const reverseRoutes = routes.filter((route) => {
          const endId = typeof route.end_point === 'string' ? route.end_point : route.end_point.id
          return endId === departure
        })

        const forwardDestIds = forwardRoutes.map((route) => {
          return typeof route.end_point === 'string' ? route.end_point : route.end_point.id
        })

        const reverseDestIds = reverseRoutes.map((route) => {
          return typeof route.start_point === 'string' ? route.start_point : route.start_point.id
        })

        const availableDestIds = [...forwardDestIds, ...reverseDestIds]

        const uniqueDestIds = [...new Set(availableDestIds)]

        const filteredDestinations = allDestinations.filter((dest) =>
          uniqueDestIds.includes(dest.id),
        )
        setAvailableDestinations(filteredDestinations)

        if (destination && !uniqueDestIds.includes(destination)) {
          setDestination('')
        }
      } else if (flightType === 'panoramic-flight') {
        const panoramicRoutes = panoramicFlights.filter((flight) => {
          const startId =
            typeof flight.routes?.[0]?.start === 'string'
              ? flight.routes[0].start
              : flight.routes?.[0]?.start?.id

          return startId === departure
        })

        const availableDestIds: string[] = []

        panoramicRoutes.forEach((flight) => {
          flight.routes?.forEach((route) => {
            route.end?.forEach((endpoint) => {
              const destId =
                typeof endpoint.point_of_interest?.destination === 'string'
                  ? endpoint.point_of_interest.destination
                  : endpoint.point_of_interest?.destination?.id

              if (destId && !availableDestIds.includes(destId)) {
                availableDestIds.push(destId)
              }
            })
          })
        })

        const filteredDestinations = allDestinations.filter((dest) =>
          availableDestIds.includes(dest.id),
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
          const endId = typeof route.end_point === 'string' ? route.end_point : route.end_point.id
          return endId === destination
        })

        const reverseRoutes = routes.filter((route) => {
          const startId =
            typeof route.start_point === 'string' ? route.start_point : route.start_point.id
          return startId === destination
        })

        const forwardDepIds = forwardRoutes.map((route) => {
          return typeof route.start_point === 'string' ? route.start_point : route.start_point.id
        })

        const reverseDepIds = reverseRoutes.map((route) => {
          return typeof route.end_point === 'string' ? route.end_point : route.end_point.id
        })

        const availableDepIds = [...forwardDepIds, ...reverseDepIds]

        const uniqueDepIds = [...new Set(availableDepIds)]

        const filteredDepartures = allDestinations.filter((dest) => uniqueDepIds.includes(dest.id))
        setAvailableDepartures(filteredDepartures)

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
                  : endpoint.point_of_interest?.destination?.id

              if (destId === destination) {
                hasDestination = true
              }
            })
          })

          return hasDestination
        })

        const availableDepIds: string[] = []

        panoramicRoutes.forEach((flight) => {
          const startId =
            typeof flight.routes?.[0]?.start === 'string'
              ? flight.routes[0].start
              : flight.routes?.[0]?.start?.id

          if (startId && !availableDepIds.includes(startId)) {
            availableDepIds.push(startId)
          }
        })

        const filteredDepartures = allDestinations.filter((dest) =>
          availableDepIds.includes(dest.id),
        )

        setAvailableDepartures(filteredDepartures)

        if (departure && !availableDepIds.includes(departure)) {
          setDeparture('')
        }
      } else {
        setAvailableDepartures(allDestinations)
      }
    } else {
      setAvailableDepartures(allDestinations)
    }
  }, [destination, departure, routes, allDestinations, flightType, panoramicFlights])

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

    if (!departure || !destination) {
      alert(t('booking-form.select-locations') || 'Please select departure and destination')
      return
    }

    const basePath = `/${locale}`

    const queryParams = new URLSearchParams({
      passengers: passengers,
      from: departure,
      to: destination,
      isReturn: isReturn.toString(),
    })

    if (flightType === 'regular-line' || flightType === 'private-flight') {
      let selectedRoute = routes.find((route) => {
        const startId =
          typeof route.start_point === 'string' ? route.start_point : route.start_point.id
        const endId = typeof route.end_point === 'string' ? route.end_point : route.end_point.id
        return startId === departure && endId === destination
      })

      let isReversed = false
      if (!selectedRoute) {
        selectedRoute = routes.find((route) => {
          const startId =
            typeof route.start_point === 'string' ? route.start_point : route.start_point.id
          const endId = typeof route.end_point === 'string' ? route.end_point : route.end_point.id
          return startId === destination && endId === departure
        })

        if (selectedRoute) {
          isReversed = true
        }
      }

      if (selectedRoute) {
        queryParams.append('routeId', selectedRoute.id)
        if (isReversed) {
          queryParams.append('isReversed', 'true')
        }
      }
    }

    switch (flightType) {
      case 'private-flight':
        router.push(
          `${basePath}/regular-line/reservation?${queryParams.toString()}&flightType=private-flight`,
        )
        break
      case 'regular-line':
        router.push(`${basePath}/regular-line?${queryParams.toString()}`)
        break
      case 'panoramic-flight':
        router.push(`${basePath}/panoramic?${queryParams.toString()}`)
        break
      case 'private-jet':
        router.push(`${basePath}/private-jet?${queryParams.toString()}`)
        break
      default:
        router.push(`${basePath}/regular-line?${queryParams.toString()}`)
    }

    console.log('Form submitted with:', {
      flightType,
      departure,
      destination,
      passengers,
      isReturn,
    })
  }

  const switchLocations = () => {
    const temp = departure
    setDeparture(destination)
    setDestination(temp)
  }

  return (
    <div className="py-6 relative -mt-16 z-20">
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
                    <option key={`dep-${dest.id}`} value={dest.id}>
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
                    <option key={`dest-${dest.id}`} value={dest.id}>
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
              <div className="flex items-center h-full">
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  className="w-full h-full pt-6 pb-2 px-4 text-2xl text-gray-500 focus:outline-none appearance-none"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                </select>
                <button type="button" className="px-4">
                  <ChevronDown className="h-6 w-6 text-gray-500" />
                </button>
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

            <label className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <input
                  type="radio"
                  name="flightType"
                  className="sr-only"
                  checked={flightType === 'private-jet'}
                  onChange={() => handleFlightTypeChange('private-jet')}
                />
                <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                {flightType === 'private-jet' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
                  </div>
                )}
              </div>
              <span>{t('booking-form.flight-types.private-jet')}</span>
            </label>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookingForm

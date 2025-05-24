import React from 'react'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import Hero from '@/components/shared/hero'
import Footer from '@/components/shared/footer'
import BookingForm from '@/components/regular-line/reservation/booking-form'
import type { Destination, RegularFlight } from '@/payload-types'

interface PageProps {
  params: Promise<{
    locale: string
    slug: string[]
  }>
  searchParams: Promise<{
    from?: string
    to?: string
    passengers?: string
    adults?: string
    children?: string
    newborns?: string
    date?: string
    time?: string
    isReturn?: string
    oneway?: string
  }>
}

export default async function PrivateFlightBookingPage({ params, searchParams }: PageProps) {
  const { locale, slug } = await params
  const query = await searchParams
  const t = await getTranslations('RegularLine.Reservation')
  const payload = await getPayload({ config })

  const fromParam = query.from || (slug.length > 0 ? slug[0] : '')
  const toParam = query.to || (slug.length > 1 ? slug[1] : '')

  const initialAdults = query.adults ? parseInt(query.adults, 10) : 1
  const initialChildren = query.children ? parseInt(query.children, 10) : 0
  const initialNewborns = query.newborns ? parseInt(query.newborns, 10) : 0
  const initialDate = query.date || ''
  const initialTime = query.time || ''
  const initialIsReturn = query.isReturn === 'true'

  let routeDetails: RegularFlight | null = null
  let departureDetails: Destination | null = null
  let arrivalDetails: Destination | null = null
  let error: string | null = null

  try {
    if (fromParam && toParam) {
      const [destinationsData, routesData] = await Promise.all([
        payload.find({
          collection: 'destinations',
          where: {
            slug: {
              in: [fromParam, toParam],
            },
          },
          limit: 2,
        }),
        payload.find({
          collection: 'regular-flights',
          depth: 2,
        }),
      ])

      const destinations = destinationsData.docs
      departureDetails = destinations.find((dest) => dest.slug === fromParam) || null
      arrivalDetails = destinations.find((dest) => dest.slug === toParam) || null

      if (!departureDetails || !arrivalDetails) {
        error = 'Destination not found'
      }

      const route = routesData.docs.find((route) => {
        const startSlug =
          typeof route.start_point === 'string' ? route.start_point : route.start_point?.slug
        const endSlug =
          typeof route.end_point === 'string' ? route.end_point : route.end_point?.slug

        return (
          (startSlug === fromParam && endSlug === toParam) ||
          (startSlug === toParam && endSlug === fromParam)
        )
      })

      if (route) {
        routeDetails = route
      }
    }
  } catch (err) {
    console.error('Error fetching data:', err)
    error = 'Failed to load flight data'
  }

  if (error === 'Destination not found') {
    return notFound()
  }

  if (!fromParam || !toParam) {
    return redirect(`/${locale}/flights`)
  }

  const isRouteReversed = !!(
    routeDetails &&
    typeof routeDetails.start_point === 'object' &&
    routeDetails.start_point.slug === toParam
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Hero
        title="Réservation Vol Privé"
        subtitle="Réservez votre hélicoptère privé pour un service exclusif et personnalisé."
        buttonText={t('heroBanner.buttonText')}
        buttonLink="/flights"
        imageSrc="/images/index/hero.webp"
      />

      <BookingForm
        initialFlightType="vol-prive"
        initialDepartureId={fromParam}
        initialArrivalId={toParam}
        initialAdults={initialAdults}
        initialDate={initialDate}
        initialTime={initialTime}
        initialIsReturn={initialIsReturn}
        isRouteInitiallyReversed={isRouteReversed}
        initialRouteDetails={routeDetails}
        initialDepartureDetails={departureDetails}
        initialArrivalDetails={arrivalDetails}
        dataFetchingError={error}
      />

      <Footer />
    </div>
  )
}

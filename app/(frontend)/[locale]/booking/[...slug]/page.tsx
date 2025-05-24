import { Destination } from '@/payload-types'
import Hero from '@/components/shared/hero'
import Footer from '@/components/shared/footer'
import React from 'react'
import { redirect } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import BookingForm from '@/components/shared/booking-form'
import { getRouteDetailsBySlug } from '@/app/(frontend)/[locale]/booking/actions'

const Booking = async ({
  params,
  searchParams,
}: {
  params: Promise<{
    locale: string
    slug: ['private' | 'regular' | 'panoramic', Destination['slug'], Destination['slug']]
  }>
  searchParams: Promise<{
    passengers?: string[]
    adults?: string
    children?: string
    newborns?: string
    oneway?: string
    date?: string
    flex?: string
    datetime?: string
    returndatetime?: string
    isReturn?: string
  }>
}) => {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const { slug, locale } = resolvedParams
  const flightType = slug[0]

  const translations = await getTranslations(
    flightType === 'panoramic' ? 'Panoramic.Reservation' : 'RegularLine',
  )

  let routeDetails = null
  let initialAdults = 1
  let initialChildren = 0
  let initialBabies = 0
  let initialDate = ''
  let initialTime = ''
  let initialIsReturn = false
  let isFlexTariff = false

  // Parse search parameters
  if (resolvedSearchParams.adults) {
    initialAdults = parseInt(resolvedSearchParams.adults, 10) || 1
  } else if (resolvedSearchParams.passengers && resolvedSearchParams.passengers.length > 0) {
    initialAdults = parseInt(resolvedSearchParams.passengers[0], 10) || 1
  }

  if (resolvedSearchParams.children) {
    initialChildren = parseInt(resolvedSearchParams.children, 10) || 0
  } else if (resolvedSearchParams.passengers && resolvedSearchParams.passengers.length > 1) {
    initialChildren = parseInt(resolvedSearchParams.passengers[1], 10) || 0
  }

  if (resolvedSearchParams.newborns) {
    initialBabies = parseInt(resolvedSearchParams.newborns, 10) || 0
  } else if (resolvedSearchParams.passengers && resolvedSearchParams.passengers.length > 2) {
    initialBabies = parseInt(resolvedSearchParams.passengers[2], 10) || 0
  }

  if (resolvedSearchParams.datetime) {
    try {
      const dateObj = new Date(resolvedSearchParams.datetime)
      initialDate = dateObj.toISOString().split('T')[0]
      initialTime = dateObj.toISOString().split('T')[1].substring(0, 5)
    } catch (error) {
      console.error('Error parsing datetime parameter:', error)
    }
  } else if (resolvedSearchParams.date) {
    initialDate = resolvedSearchParams.date
  }

  if (resolvedSearchParams.oneway === 'false' || resolvedSearchParams.isReturn === 'true') {
    initialIsReturn = true
  }

  if (resolvedSearchParams.flex === 'true') {
    isFlexTariff = true
  }

  // Get route details for regular flights
  if (flightType === 'regular' && slug.length >= 3) {
    routeDetails = await getRouteDetailsBySlug([slug[1], slug[2]])
    if (!routeDetails) {
      return redirect({ href: '/flights', locale })
    }
  }

  switch (flightType) {
    case 'private':
      return (
        <div className="flex flex-col min-h-screen">
          <Hero
            title={translations('privateJet.title')}
            subtitle={translations('privateJet.subtitle')}
            buttonText={translations('privateJet.buttonText')}
            buttonLink="/private-jet"
            imageSrc="/images/index/hero.webp"
          />

          <BookingForm
            initialFlightType="jet-prive"
            initialAdults={initialAdults}
            initialChildren={initialChildren}
            initialBabies={initialBabies}
            initialDate={initialDate}
            initialTime={initialTime}
            initialIsReturn={initialIsReturn}
          />

          <Footer />
        </div>
      )

    case 'regular':
      if (
        !routeDetails ||
        typeof routeDetails.start_point === 'string' ||
        typeof routeDetails.end_point === 'string'
      ) {
        return redirect({ href: '/flights', locale })
      }

      return (
        <div className="flex flex-col min-h-screen">
          <Hero
            title={translations('heroBanner.title')}
            subtitle={translations('heroBanner.subtitle')}
            buttonText={translations('heroBanner.buttonText')}
            buttonLink="/regular-line/reservation"
            imageSrc="/images/index/hero.webp"
          />

          <BookingForm
            initialFlightType="ligne-reguliere"
            initialDepartureId={routeDetails.start_point.id}
            initialArrivalId={routeDetails.end_point.id}
            initialAdults={initialAdults}
            initialChildren={initialChildren}
            initialBabies={initialBabies}
            initialDate={initialDate}
            initialTime={initialTime}
            initialIsReturn={initialIsReturn}
            isRouteInitiallyReversed={routeDetails.reversed}
            initialRouteDetails={routeDetails}
            initialDepartureDetails={routeDetails.start_point}
            initialArrivalDetails={routeDetails.end_point}
          />

          <Footer />
        </div>
      )

    case 'panoramic':
      return (
        <div className="flex flex-col min-h-screen">
          <Hero
            title={translations('hero.title')}
            subtitle={translations('hero.subtitle')}
            buttonText={translations('hero.buttonText')}
            buttonLink="/panoramic"
            imageSrc="/images/index/hero.webp"
          />

          <BookingForm
            initialFlightType="vol-panoramique"
            initialAdults={initialAdults}
            initialChildren={initialChildren}
            initialBabies={initialBabies}
            initialDate={initialDate}
            initialTime={initialTime}
            isPanoramicView={true}
          />

          <Footer />
        </div>
      )

    default:
      return redirect({ href: '/flights', locale })
  }
}

export default Booking

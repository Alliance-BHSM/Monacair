import { Destination } from '@/payload-types'
import { getTranslations } from 'next-intl/server'
import Hero from '@/components/shared/hero'
import BookingForm from '@/components/regular-line/reservation/booking-form'
import { redirect } from '@/i18n/navigation'
import React from 'react'
import { getRegularFlight } from '@/app/(frontend)/[locale]/flights/regular/[...slug]/actions'

const Regular = async ({
  params,
  searchParams,
}: {
  params: Promise<{
    locale: string
    slug: [Destination['slug'], Destination['slug']]
  }>
  searchParams: Promise<{
    passengers?: string[]
    oneway?: string
    date?: string
    flex?: string
  }>
}) => {
  const t = await getTranslations('RegularLine.Reservation')
  const query = await searchParams.then((res) => ({
    // TODO: Implement missing flight features into the booking form (i.e., possibly preselected date and flex tariff).
    passengers: {
      adults: res.passengers ? parseInt(res.passengers[0], 10) : 1,
      children: res.passengers ? parseInt(res.passengers[1], 10) : 0,
      infants: res.passengers ? parseInt(res.passengers[2], 10) : 0,
    },
    oneway: res.oneway === 'true',
    date: res.date && new Date(res.date),
    flex: res.flex === 'true',
  }))
  const routeDetails = await getRegularFlight([(await params).slug[0], (await params).slug[1]])

  return routeDetails ? (
    <>
      <Hero
        title={t('heroBanner.title')}
        subtitle={t('heroBanner.subtitle')}
        buttonText={t('heroBanner.buttonText')}
        buttonLink="/regular-line/reservation"
        imageSrc="/images/index/hero.webp"
      />

      {typeof routeDetails.start_point !== 'string' &&
        typeof routeDetails.end_point !== 'string' && (
          <BookingForm
            initialFlightType={'ligne-reguliere'}
            initialDepartureId={routeDetails.start_point.id}
            initialArrivalId={routeDetails.end_point.id}
            initialAdults={query.passengers.adults}
            isRouteInitiallyReversed={routeDetails.reversed}
            initialRouteDetails={routeDetails}
            initialDepartureDetails={routeDetails.start_point}
            initialArrivalDetails={routeDetails.end_point}
            dataFetchingError={null}
          />
        )}
    </>
  ) : (
    redirect({ href: '/flights', locale: (await params).locale })
  )
}

export default Regular

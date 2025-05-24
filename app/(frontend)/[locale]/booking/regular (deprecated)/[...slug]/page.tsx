import { getPayload } from 'payload'
import config from '@payload-config'
import BookingForm from '@/components/regular-line/reservation/booking-form'
import Hero from '@/components/shared/hero'
import { getTranslations } from 'next-intl/server'

interface RegularBookingPageProps {
  params: Promise<{
    locale: string
    slug: string[]
  }>
  searchParams: Promise<{
    passengers?: string
    oneway?: string
    flex?: string
    datetime?: string
    returndatetime?: string
  }>
}

export default async function RegularBookingPage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: RegularBookingPageProps) {
  const params = await paramsPromise
  const searchParams = await searchParamsPromise
  const t = await getTranslations('RegularLine.Reservation')

  let initialDate = ''
  let initialTime = ''
  if (searchParams?.datetime) {
    try {
      const dateObj = new Date(searchParams.datetime)
      initialDate = dateObj.toISOString().split('T')[0]
      initialTime = dateObj.toISOString().split('T')[1].substr(0, 5)
    } catch (error) {
      console.error('Error parsing datetime parameter:', error)
    }
  }

  let initialReturnDate = ''
  let initialReturnTime = ''
  let initialIsReturn = false
  if (searchParams?.returndatetime) {
    try {
      const dateObj = new Date(searchParams.returndatetime)
      initialReturnDate = dateObj.toISOString().split('T')[0]
      initialReturnTime = dateObj.toISOString().split('T')[1].substr(0, 5)
      initialIsReturn = true
    } catch (error) {
      console.error('Error parsing returndatetime parameter:', error)
    }
  }

  const [fromSlug, toSlug] = params.slug || []

  if (!fromSlug || !toSlug) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>{t('errorMessages.missingParams')}</p>
      </div>
    )
  }

  const payload = await getPayload({ config })

  const [fromDestination, toDestination] = await Promise.all([
    payload.find({
      collection: 'destinations',
      where: {
        slug: { equals: fromSlug },
      },
      limit: 1,
      depth: 1,
    }),
    payload.find({
      collection: 'destinations',
      where: {
        slug: { equals: toSlug },
      },
      limit: 1,
      depth: 1,
    }),
  ])

  const fromData = fromDestination.docs[0]
  const toData = toDestination.docs[0]

  if (!fromData || !toData) {
    return (
      <div className="container mx-auto py-8 text-center text-red-500">
        <p>{t('errorMessages.destinationNotFound')}</p>
      </div>
    )
  }

  const routeResponse = await payload.find({
    collection: 'regular-flights',
    where: {
      'start_point.id': { equals: fromData.id },
      'end_point.id': { equals: toData.id },
    },
    limit: 1,
    depth: 1,
  })

  const routeDetails = routeResponse.docs[0]

  return (
    <>
      <Hero
        title={t('heroBanner.title')}
        subtitle={t('heroBanner.subtitle')}
        buttonText={t('heroBanner.buttonText')}
        buttonLink="/regular-line/reservation"
        imageSrc="/images/index/hero.webp"
      />

      <BookingForm
        initialFlightType={searchParams?.flex === 'true' ? 'vol-prive' : 'ligne-reguliere'}
        initialDepartureId={fromData.id}
        initialArrivalId={toData.id}
        initialAdults={searchParams?.passengers ? parseInt(searchParams.passengers, 10) : 1}
        initialTime={initialTime}
        initialDate={initialDate}
        initialReturnDate={initialReturnDate}
        initialReturnTime={initialReturnTime}
        initialIsReturn={initialIsReturn}
        initialRouteDetails={routeDetails}
        initialDepartureDetails={fromData}
        initialArrivalDetails={toData}
        dataFetchingError={!routeDetails ? t('errorMessages.routeNotFound') : null}
      />
    </>
  )
}

import Hero from '@/components/shared/hero'
import { getTranslations } from 'next-intl/server'
import BookingForm from 'components/booking/booking-form'
import RegularLineSection from 'components/booking/regular-line-section'
import VipService from 'components/booking/vip-service'
import PrivateFlights from 'components/booking/private-flights'
import Destinations from 'components/booking/destinations'
import JetPrive from 'components/booking/jet-prive'
import PanoramicFlights from 'components/booking/panoramic-flights'
import Footer from '@/components/shared/footer'
import payload from '@/lib/payload'

export default async function BookingPage() {
  const t = await getTranslations('Booking')

  const panoramicFlightsData = await payload.find({
    collection: 'panoramic-flights',
    depth: 2,
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Hero
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        buttonText={t('hero.buttonText')}
        buttonLink="/reservation"
        imageSrc="/images/index/hero.webp"
      />

      <BookingForm
        initialAllDestinations={(await payload.find({ collection: 'destinations' })).docs}
        initialRoutes={(await payload.find({ collection: 'regular-flights' })).docs}
        initialPanoramicFlights={(await payload.find({ collection: 'panoramic-flights' })).docs}
      />

      <PrivateFlights />

      <RegularLineSection />

      <VipService />

      <Destinations />

      <JetPrive />

      <PanoramicFlights panoramicFlights={panoramicFlightsData.docs} />

      <Footer />
    </div>
  )
}

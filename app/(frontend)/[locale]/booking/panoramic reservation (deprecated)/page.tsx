import React from 'react'
import { useTranslations } from 'next-intl'
import Hero from '@/components/shared/hero'
import BookingForm from '@/components/panoramic/reservation/booking-form'
import Footer from '@/components/shared/footer'

export default function PanoramicFlightReservationPage() {
  const t = useTranslations('Panoramic.Reservation')

  return (
    <div className="flex flex-col min-h-screen">
      <Hero
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        buttonText={t('hero.buttonText')}
        buttonLink="/panoramic"
        imageSrc="/images/index/hero.webp"
      />

      <BookingForm />

      <Footer />
    </div>
  )
}

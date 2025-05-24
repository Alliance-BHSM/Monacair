import { getTranslations } from 'next-intl/server'
import Hero from '@/components/shared/hero'
import BookingForm from '@/components/panoramic/reservation/booking-form'
import Footer from '@/components/shared/footer'
import React from 'react'

const Panoramic = async () => {
  const t = await getTranslations('Panoramic.Reservation')
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

export default Panoramic

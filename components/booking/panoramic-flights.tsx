import React from 'react'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import type { PanoramicFlight, Destination } from '@/payload-types'

interface PanoramicFlightsProps {
  panoramicFlights: PanoramicFlight[]
}

const PanoramicFlights: React.FC<PanoramicFlightsProps> = async ({ panoramicFlights }) => {
  const t = await getTranslations('Booking')

  const uniqueStartLocations = new Map<string, { destination: Destination; image?: string }>()

  panoramicFlights.forEach((flight) => {
    if (flight.start && typeof flight.start === 'object') {
      const destination = flight.start as Destination
      if (!uniqueStartLocations.has(destination.slug)) {
        const heroUrl =
          typeof flight.hero === 'object' && flight.hero !== null && flight.hero.url
            ? flight.hero.url
            : undefined
        const imageUrl =
          typeof flight.image === 'object' && flight.image !== null && flight.image.url
            ? flight.image.url
            : undefined

        uniqueStartLocations.set(destination.slug, {
          destination,
          image: heroUrl || imageUrl || '/images/index/panoramique.webp',
        })
      }
    }
  })

  const destinations = Array.from(uniqueStartLocations.values()).map(({ destination, image }) => ({
    name: destination.title,
    slug: destination.slug,
    image: image || '/images/index/panoramique.webp',
    alt: `${t('panoramic-flights.title')} - ${destination.title}`,
  }))

  return (
    <section className="min-h-screen bg-royalblue text-white py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-5xl md:text-6xl font-bold font-brother text-center mb-8">
          {t('panoramic-flights.title')}
        </h1>

        <p className="text-xl text-center max-w-3xl mx-auto mb-16">
          {t('panoramic-flights.description')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {destinations.map((destination, index) => (
            <Link key={destination.slug || index} href={`/flights/panoramic/${destination.slug}`}>
              <div className="relative rounded-2xl overflow-hidden group cursor-pointer">
                <div className="aspect-[3/4] relative">
                  <Image
                    src={destination.image}
                    alt={destination.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-0 p-6">
                  <h2 className="text-3xl font-bold font-brother">{destination.name}</h2>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-lg mb-8">{t('panoramic-flights.cta-text')}</p>

          <Link href="/booking/panoramic">
            <Button variant="red" size="lg" className="px-8 py-6 text-lg font-bold">
              {t('panoramic-flights.book-now')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default PanoramicFlights

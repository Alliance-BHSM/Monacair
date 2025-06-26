import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Wrench, MapPin, Building, Landmark, Ship, Castle, Mountain } from 'lucide-react'
import { BentoGrid, BentoGridItem } from '../ui/bento-grid'
import { Button } from 'components/ui/button'
import { Link } from '@/i18n/navigation'

export default async function Maintenance() {
  const t = await getTranslations('Management.maintenance')

  const locations = [
    {
      title: 'Grimaud',
      description: 'Saint-Tropez',
      icon: <Ship className="h-5 w-5 text-[color:var(--color-redmonacair)]" />,
    },
    {
      title: 'Cannes',
      description: "Côte d'Azur",
      icon: <Landmark className="h-5 w-5 text-[color:var(--color-redmonacair)]" />,
    },
    {
      title: 'Annecy',
      description: 'Haute-Savoie',
      icon: <Building className="h-5 w-5 text-[color:var(--color-redmonacair)]" />,
    },
    {
      title: 'Monaco',
      description: 'Principauté',
      icon: <Castle className="h-5 w-5 text-[color:var(--color-redmonacair)]" />,
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 w-full h-[300px] md:h-[500px] relative mb-8 md:mb-0">
            <Image
              src="/images/index/hero.webp"
              alt="Maintenance d'hélicoptères"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover rounded-lg shadow-lg"
            />
          </div>
          <div className="md:w-1/2">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[color:var(--color-redmonacair)]/10 flex items-center justify-center mr-4">
                <Wrench className="h-6 w-6 text-[color:var(--color-redmonacair)]" />
              </div>
              <h2 className="text-3xl font-bold text-black font-brother">{t('title')}</h2>
            </div>

            <div className="space-y-6">
              <p className="text-black font-brother">{t('description')}</p>
              <p className="text-black font-brother">{t('certificationDescription')}</p>
              <p className="text-black font-brother">{t('locationsDescription')}</p>
            </div>

            <div className="mt-8">
              <BentoGrid className="grid-cols-2 md:grid-cols-3 gap-3 py-3 md:auto-rows-[6rem]">
                {locations.map((location, index) => (
                  <BentoGridItem
                    key={index}
                    title={
                      <span className="text-lg font-brother text-[color:var(--color-redmonacair)]">
                        {location.title}
                      </span>
                    }
                    description={
                      <div className="flex items-center mt-0 ">
                        <MapPin className="h-3 w-3 text-gray-500 mr-1 flex-shrink-0" />
                        <span className="text-xs text-gray-600 font-brother">
                          {location.description}
                        </span>
                      </div>
                    }
                    className="hover:shadow-md transition-all duration-300 border border-gray-100"
                    icon={<div className="flex items-center">{location.icon}</div>}
                  />
                ))}
              </BentoGrid>
              <Link href={'/services/maintenance'}>
                <Button>{t('CTA')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

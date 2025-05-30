import React from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { Event, Region } from '@/payload-types'
import { PaginatedDocs } from 'payload'

const EventListing = async ({
  data,
}: {
  data: { events: PaginatedDocs<Event>; regions: PaginatedDocs<Region> }
}) => {
  const t = await getTranslations('Index.events')
  return (
    <section className={'px-6 sm:px-10 md:px-20 lg:px-40 py-10 md:py-20'}>
      <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'}>
        {data.events.docs.map((event) => (
          <div
            className={
              'flex-col flex justify-between w-full h-[450px] border-2 border-black rounded-lg p-3'
            }
            key={event.id}
          >
            <div>
              <Image
                src={
                  typeof event.image === 'string'
                    ? event.image
                    : event.image?.url || '/images/placeholder.png'
                }
                alt={(typeof event.image !== 'string' && event.image?.alt) || 'Event image'}
                width={(typeof event.image === 'string' ? undefined : event.image?.width) || 500}
                height={(typeof event.image === 'string' ? undefined : event.image?.height) || 500}
                className={'rounded-lg h-[250px] w-full object-cover object-center'}
              />
              <h3 className={'font-brother text-sm'}>{event.date}</h3>
              <h2 className={'font-brother text-xl'}>{event.title}</h2>
            </div>
            <div>
              <h2 className={'text-lg font-brother pb-2'}>{event.city}</h2>
              <Link href={`/events/${event.slug}`} className="block">
                <Button className={'text-xs'} size={'sm'} variant={'blue'}>
                  {t('CTA')}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default EventListing

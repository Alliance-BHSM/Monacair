import React from 'react'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

export default function CTASection() {
  const t = useTranslations('RegularLine.cta-section')

  return (
    <section className="py-12 sm:py-16 relative">
      <div className="absolute inset-0 bg-royalblue z-0"></div>
      <div className="absolute top-0 left-0 right-0"></div>
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 font-brother">{t('title')}</h2>
          <p className="text-base sm:text-xl mb-6 sm:mb-8 font-brother">{t('description')}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/regular-line/reservation" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full bg-redmonacair hover:bg-redmonacair/90 text-white font-brother"
              >
                {t('book-now')}
              </Button>
            </Link>
            {/* <Link href="/contact" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="white"
                className="w-full border-white text-white hover:bg-white/10 font-brother"
              >
                {t('contact-us')}
              </Button>
            </Link> */}
          </div>
        </div>
      </div>
    </section>
  )
}

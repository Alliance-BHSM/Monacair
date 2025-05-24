'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Plane, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface FlightTypeProps {
  flightType: string
  setFlightType: (type: string) => void
}

export default function FlightType({ flightType, setFlightType }: FlightTypeProps) {
  const t = useTranslations('RegularLine.Reservation')

  const isPrivate = flightType === 'vol-prive'

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{t('flightType.title')}</CardTitle>
        <CardDescription>{t('flightType.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center justify-between rounded-md border-2 border-redmonacair bg-white p-4">
              <div className="mb-3 w-12 h-12 rounded-full bg-redmonacair/10 flex items-center justify-center">
                {isPrivate ? (
                  <Star className="h-6 w-6 text-redmonacair" />
                ) : (
                  <Plane className="h-6 w-6 text-redmonacair" />
                )}
              </div>
              <div className="text-center">
                <p className="font-medium">
                  {isPrivate ? t('flightType.privateFlight') : t('flightType.regularLine')}
                </p>
                <p className="text-sm text-gray-500">
                  {isPrivate ? t('flightType.privateFlightDesc') : t('flightType.regularLineDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

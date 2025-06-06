'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Calendar, Clock, Users, Baby, MapPin, Luggage, Briefcase, Check } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface BookingSummaryProps {
  flightType: string
  departure: string
  arrival: string
  date: string
  time: string
  isReturn?: boolean
  returnDate?: string
  returnTime?: string
  adults: number
  childPassengers: number
  babies: number
  cabinLuggage: number
  checkedLuggage: number
  flex?: boolean
  selectedHelicopter?: string
  basePrice: number
  baggagePrice?: number
  cabinBaggagePrice?: number
  total: number
  multipleFlights?: Array<{
    departure: string
    destination: string
    adults: number
    children: number
    newborns: number
    isReturn: boolean
    cabinLuggage?: number
    checkedLuggage?: number
    date?: string
    time?: string
    returnDate?: string
    returnTime?: string
  }>
}

export default function BookingSummary({
  flightType,
  departure,
  arrival,
  date,
  time,
  isReturn,
  returnDate,
  returnTime,
  adults,
  childPassengers,
  babies,
  cabinLuggage,
  checkedLuggage,
  flex,
  selectedHelicopter,
  basePrice,
  baggagePrice,
  cabinBaggagePrice,
  total,
  multipleFlights,
}: BookingSummaryProps) {
  const t = useTranslations('RegularLine.Reservation')

  const getLocationName = (name: string) => {
    return name
  }

  const getHelicopterName = (id: string) => {
    switch (id) {
      case 'h125':
        return 'Airbus H125'
      case 'h130':
        return 'Airbus H130'
      case 'h135':
        return 'Airbus H135'
      case 'h145':
        return 'Airbus H145'
      default:
        return id
    }
  }

  const getHelicopterPrice = (id: string) => {
    switch (id) {
      case 'h125':
        return '1 500€'
      case 'h130':
        return '2 000€'
      case 'h135':
        return '3 000€'
      case 'h145':
        return '4 500€'
      default:
        return '—'
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="bg-[#002841] text-white rounded-t-lg">
        <CardTitle>{t('summary.title')}</CardTitle>
        <CardDescription className="text-white/80">{t('summary.description')}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-lg mb-2">
              {flightType === 'ligne-reguliere'
                ? t('summary.regularLine')
                : t('summary.privateFlight')}
              {flex && flightType === 'ligne-reguliere' && (
                <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Flex
                </span>
              )}
            </h3>

            {multipleFlights && multipleFlights.length > 1 ? (
              <div className="space-y-4">
                {multipleFlights.map((flight, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-medium text-base text-gray-700 mb-2">Vol {index + 1}</h4>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>
                        {t('summary.from')} {getLocationName(flight.departure)} {t('summary.to')}{' '}
                        {getLocationName(flight.destination)}
                      </span>
                    </div>
                    {(flight.date || flight.time) && (
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{flight.date}</span>
                        {flight.time && (
                          <>
                            <Clock className="h-4 w-4 ml-2 mr-1" />
                            <span>{flight.time}</span>
                          </>
                        )}
                      </div>
                    )}
                    {flight.isReturn && (
                      <>
                        <div className="flex items-center text-sm text-blue-600 mb-1">
                          <span className="text-xs">Aller-retour</span>
                        </div>
                        {(flight.returnDate || flight.returnTime) && (
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{flight.returnDate}</span>
                            {flight.returnTime && (
                              <>
                                <Clock className="h-4 w-4 ml-2 mr-1" />
                                <span>{flight.returnTime}</span>
                              </>
                            )}
                          </div>
                        )}
                      </>
                    )}
                    {!flight.isReturn && flight.isReturn !== undefined && (
                      <div className="flex items-center text-sm text-gray-400 mb-1">
                        <span className="text-xs">Aller simple</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Users className="h-4 w-4 mr-1" />
                      <span>
                        {flight.adults + flight.children} passager
                        {flight.adults + flight.children > 1 ? 's' : ''}
                      </span>
                    </div>
                    {((flight.cabinLuggage || 0) > 0 || (flight.checkedLuggage || 0) > 0) && (
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Luggage className="h-4 w-4 mr-1" />
                        <span>
                          {(flight.cabinLuggage || 0) > 0 && `${flight.cabinLuggage} cabine`}
                          {(flight.cabinLuggage || 0) > 0 &&
                            (flight.checkedLuggage || 0) > 0 &&
                            ', '}
                          {(flight.checkedLuggage || 0) > 0 && `${flight.checkedLuggage} soute`}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {t('summary.from')} {getLocationName(departure)} {t('summary.to')}{' '}
                    {getLocationName(arrival)}
                  </span>
                </div>
                {date && time && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{date}</span>
                    <Clock className="h-4 w-4 ml-2 mr-1" />
                    <span>{time}</span>
                  </div>
                )}

                {isReturn && returnDate && returnTime && (
                  <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>
                        {t('summary.from')} {getLocationName(arrival)} {t('summary.to')}{' '}
                        {getLocationName(departure)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{returnDate}</span>
                      <Clock className="h-4 w-4 ml-2 mr-1" />
                      <span>{returnTime}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium mb-2">{t('summary.passengers')}</h4>
            {multipleFlights && multipleFlights.length > 1 ? (
              <div className="space-y-2">
                {(() => {
                  const totalAdults = multipleFlights.reduce(
                    (sum, flight) => sum + flight.adults,
                    0,
                  )
                  const totalChildren = multipleFlights.reduce(
                    (sum, flight) => sum + flight.children,
                    0,
                  )
                  const totalNewborns = multipleFlights.reduce(
                    (sum, flight) => sum + flight.newborns,
                    0,
                  )

                  return (
                    <>
                      {totalAdults > 0 && (
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{t('summary.adults')}</span>
                          </div>
                          <div>
                            <span>{totalAdults}</span>
                          </div>
                        </div>
                      )}

                      {totalChildren > 0 && (
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{t('summary.children')}</span>
                          </div>
                          <div>
                            <span>{totalChildren}</span>
                          </div>
                        </div>
                      )}

                      {totalNewborns > 0 && (
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <Baby className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{t('summary.babies')}</span>
                          </div>
                          <div>
                            <span>{totalNewborns}</span>
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{t('summary.adults')}</span>
                  </div>
                  <div>
                    <span>{adults}</span>
                  </div>
                </div>

                {childPassengers > 0 && (
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{t('summary.children')}</span>
                    </div>
                    <div>
                      <span>{childPassengers}</span>
                    </div>
                  </div>
                )}

                {babies > 0 && (
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <Baby className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{t('summary.babies')}</span>
                    </div>
                    <div>
                      <span>{babies}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium mb-2">{t('summary.luggage')}</h4>
            <div className="space-y-2">
              {multipleFlights && multipleFlights.length > 1 ? (
                (() => {
                  const totalCabinLuggage = multipleFlights.reduce(
                    (sum, flight) => sum + (flight.cabinLuggage || 0),
                    0,
                  )
                  const totalCheckedLuggage = multipleFlights.reduce(
                    (sum, flight) => sum + (flight.checkedLuggage || 0),
                    0,
                  )

                  return (
                    <>
                      {totalCabinLuggage > 0 && (
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{t('summary.cabinLuggage')}</span>
                          </div>
                          <div>
                            <span>{totalCabinLuggage}</span>
                          </div>
                        </div>
                      )}

                      {totalCheckedLuggage > 0 && (
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <Luggage className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{t('summary.checkedLuggage')}</span>
                          </div>
                          <div>
                            <span>{totalCheckedLuggage}</span>
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()
              ) : (
                <>
                  {cabinLuggage > 0 && (
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{t('summary.cabinLuggage')}</span>
                      </div>
                      <div>
                        <span>{cabinLuggage}</span>
                      </div>
                    </div>
                  )}

                  {checkedLuggage > 0 && (
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Luggage className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{t('summary.checkedLuggage')}</span>
                      </div>
                      <div>
                        <span>{checkedLuggage}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {flightType === 'vol-prive' && selectedHelicopter && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium mb-2">{t('summary.helicopter')}</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{getHelicopterName(selectedHelicopter)}</span>
                  <span className="font-medium">{getHelicopterPrice(selectedHelicopter)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium mb-2">{t('summary.estimatedTotal')}</h4>

            {flightType === 'ligne-reguliere' && (
              <div className="space-y-2">
                {flex ? (
                  <div className="flex justify-between">
                    <span>
                      {adults + childPassengers} {t('summary.passengers')}
                    </span>
                    <span>{basePrice}€</span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span>
                      {adults + childPassengers} {t('summary.passengers')}
                    </span>
                    <span>
                      {basePrice}€ x {adults + childPassengers} ={' '}
                      {basePrice * (adults + childPassengers)}€
                    </span>
                  </div>
                )}

                {flex && (
                  <div className="flex justify-between text-blue-600">
                    <span>Tarif Flex</span>
                    <span>Inclus</span>
                  </div>
                )}

                {cabinLuggage > 0 && cabinBaggagePrice && (
                  <div className="flex justify-between">
                    <span>
                      {t('summary.cabinLuggage')} ({cabinLuggage})
                    </span>
                    <span>
                      {cabinBaggagePrice}€ x {cabinLuggage} = {cabinBaggagePrice * cabinLuggage}€
                    </span>
                  </div>
                )}

                {checkedLuggage > 0 && baggagePrice && (
                  <div className="flex justify-between">
                    <span>
                      {t('summary.checkedLuggage')} ({checkedLuggage})
                    </span>
                    <span>
                      {baggagePrice}€ x {checkedLuggage} = {baggagePrice * checkedLuggage}€
                    </span>
                  </div>
                )}

                {isReturn && (
                  <div className="flex justify-between font-medium">
                    <span>{t('summary.returnMultiplier')}</span>
                    <span>x 2</span>
                  </div>
                )}

                <div className="flex justify-between font-bold border-t border-gray-200 pt-2 text-lg">
                  <span>{t('summary.estimatedTotal')}</span>
                  <span>{total}€</span>
                </div>
              </div>
            )}

            {flightType === 'vol-prive' && selectedHelicopter && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{getHelicopterName(selectedHelicopter)}</span>
                  <span>{getHelicopterPrice(selectedHelicopter)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-gray-200 pt-2 text-lg">
                  <span>{t('summary.estimatedTotal')}</span>
                  <span>{total}€</span>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 mt-5 space-y-2">
              <div className="flex items-center">
                <Check className="h-3 w-3 mr-1" />
                <span>{t('summary.paymentOnSiteNote')}</span>
              </div>
              <div className="flex items-center">
                <Check className="h-3 w-3 mr-1" />
                <span>{t('summary.freeCancellation')}</span>
              </div>
              <div className="flex items-center">
                <Check className="h-3 w-3 mr-1" />
                <span>{t('summary.instantConfirmation')}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t border-gray-200 rounded-b-lg pt-6">
        <div className="w-full">
          <div className="flex items-center mb-3">
            <Check className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm">{t('summary.freeCancellation')}</span>
          </div>
          <div className="flex items-center">
            <Check className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm">{t('summary.instantConfirmation')}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

'use client'

import { useState, FormEvent, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import type { RegularFlight, Destination } from '@/payload-types'
import {
  getDestinations,
  getRegularFlights,
  getFlightTimeslots,
} from '@/app/(frontend)/[locale]/booking/actions'

import ProgressSteps from '../reservation/progress-steps'
import FlightType from '../reservation/flight-type'
import FlightDetails from '../reservation/flight-details'
import ContactInformation from '../reservation/contact-information'
import BookingSummary from '../reservation/booking-summary'
import CustomerSupport from '../reservation/customer-support'

interface BookingFormProps {
  initialFlightType?: string
  initialDepartureId: string
  initialArrivalId: string
  initialAdults?: number
  isRouteInitiallyReversed?: boolean
  initialTime?: string
  initialDate?: string
  initialReturnDate?: string
  initialReturnTime?: string
  initialIsReturn?: boolean

  initialRouteDetails: RegularFlight | null
  initialDepartureDetails: Destination | null
  initialArrivalDetails: Destination | null
  dataFetchingError?: string | null
}

export default function BookingForm({
  initialFlightType = 'ligne-reguliere',
  initialDepartureId,
  initialArrivalId,
  initialAdults = 1,
  isRouteInitiallyReversed = false,
  initialTime = '',
  initialDate = '',
  initialReturnDate = '',
  initialReturnTime = '',
  initialIsReturn = false,
  initialRouteDetails,
  initialDepartureDetails,
  initialArrivalDetails,
  dataFetchingError,
}: BookingFormProps) {
  const t = useTranslations('RegularLine.Reservation')

  const [currentStep, setCurrentStep] = useState(1)

  const [flightType, setFlightType] = useState(initialFlightType)

  const [departure, setDeparture] = useState(initialDepartureId)
  const [arrival, setArrival] = useState(initialArrivalId)
  const [date, setDate] = useState(initialDate)
  const [time, setTime] = useState(initialTime)
  const [adults, setAdults] = useState(initialAdults)
  const [childPassengers, setChildPassengers] = useState(0)
  const [babies, setBabies] = useState(0)
  const [cabinLuggage, setCabinLuggage] = useState(0)
  const [checkedLuggage, setCheckedLuggage] = useState(0)

  const [isReturn, setIsReturn] = useState(initialIsReturn)

  const [returnDate, setReturnDate] = useState(initialReturnDate)
  const [returnTime, setReturnTime] = useState(initialReturnTime)

  const [hasCommercialFlight, setHasCommercialFlight] = useState(false)
  const [airline, setAirline] = useState('')
  const [flightOriginDestination, setFlightOriginDestination] = useState('')
  const [flightTime, setFlightTime] = useState('')

  const [needsDriverService, setNeedsDriverService] = useState(false)
  const [pickupLocation, setPickupLocation] = useState('')

  const [isCompany, setIsCompany] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [allDestinations, setAllDestinations] = useState<Destination[]>([])
  const [routes, setRoutes] = useState<RegularFlight[]>([])
  const [availableDestinations, setAvailableDestinations] = useState<Destination[]>([])
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const departureTitle = initialDepartureDetails?.title || departure
  const arrivalTitle = initialArrivalDetails?.title || arrival

  const getAdultPrice = () => {
    if (initialRouteDetails?.tariffs?.price_per_adult) {
      const basePrice = initialRouteDetails.tariffs.price_per_adult
      return flightType === 'vol-prive' ? Math.round(basePrice * 1.5) : basePrice
    }

    let basePrice = 195
    if (
      (departure === 'nice' && arrival === 'monaco') ||
      (departure === 'monaco' && arrival === 'nice')
    ) {
      basePrice = 195
    } else if (
      (departure === 'nice' && arrival === 'cannes') ||
      (departure === 'cannes' && arrival === 'nice')
    ) {
      basePrice = 220
    } else {
      basePrice = 250
    }

    return flightType === 'vol-prive' ? Math.round(basePrice * 1.5) : basePrice
  }

  const getChildPrice = () => {
    const baseChildPrice = initialRouteDetails?.tariffs?.price_per_child || getAdultPrice() * 0.8
    return flightType === 'vol-prive' ? Math.round(baseChildPrice * 1.5) : baseChildPrice
  }

  const getBabyPrice = () => {
    const baseBabyPrice = initialRouteDetails?.tariffs?.price_per_newborn || 0
    return flightType === 'vol-prive' ? Math.round(baseBabyPrice * 1.5) : baseBabyPrice
  }

  const getBaggagePrice = () => {
    const baseBaggagePrice = initialRouteDetails?.tariffs?.price_per_baggage || 15
    return flightType === 'vol-prive' ? Math.round(baseBaggagePrice * 1.2) : baseBaggagePrice
  }

  const adultPrice = getAdultPrice()
  const childPrice = getChildPrice()
  const babyPrice = getBabyPrice()
  const baggagePrice = getBaggagePrice()

  const adultCost = adults * adultPrice
  const childCost = childPassengers * childPrice
  const babyCost = babies * babyPrice
  const baggageCost = checkedLuggage * baggagePrice

  const singleTripTotal = adultCost + childCost + babyCost + baggageCost
  const total = isReturn ? singleTripTotal * 2 : singleTripTotal

  const allDestinationsIds = useMemo(
    () => allDestinations.map((dest) => dest.id).join(','),
    [allDestinations],
  )

  const routesIds = useMemo(() => routes.map((route) => route.id).join(','), [routes])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [destinationsData, routesData] = await Promise.all([
          getDestinations(),
          getRegularFlights(),
        ])

        setAllDestinations(destinationsData)
        setRoutes(routesData)

        if (initialRouteDetails) {
          const times = await getFlightTimeslots(initialRouteDetails)
          setAvailableTimes(times)
        } else {
          const defaultTimes = [
            '08:00',
            '08:30',
            '09:00',
            '09:30',
            '10:00',
            '10:30',
            '11:00',
            '11:30',
            '12:00',
            '12:30',
            '13:00',
            '13:30',
            '14:00',
            '14:30',
            '15:00',
            '15:30',
            '16:00',
            '16:30',
            '17:00',
            '17:30',
            '18:00',
            '18:30',
            '19:00',
            '19:30',
            '20:00',
          ]
          setAvailableTimes(defaultTimes)
        }
      } catch (error) {
        console.error('Error loading data:', error)
        const defaultTimes = [
          '08:00',
          '08:30',
          '09:00',
          '09:30',
          '10:00',
          '10:30',
          '11:00',
          '11:30',
          '12:00',
          '12:30',
          '13:00',
          '13:30',
          '14:00',
          '14:30',
          '15:00',
          '15:30',
          '16:00',
          '16:30',
          '17:00',
          '17:30',
          '18:00',
          '18:30',
          '19:00',
          '19:30',
          '20:00',
        ]
        setAvailableTimes(defaultTimes)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [initialRouteDetails])

  useEffect(() => {
    if (loading || allDestinations.length === 0) {
      setAvailableDestinations([])
      return
    }

    let filteredDestinations: Destination[] = []

    if (flightType === 'ligne-reguliere' || flightType === 'vol-prive') {
      if (routes.length > 0) {
        const destinationIds = new Set<string>()
        routes.forEach((route) => {
          const startId =
            typeof route.start_point === 'string' ? route.start_point : route.start_point?.id
          const endId = typeof route.end_point === 'string' ? route.end_point : route.end_point?.id
          if (startId) destinationIds.add(startId)
          if (endId) destinationIds.add(endId)
        })
        filteredDestinations = allDestinations.filter((dest) => destinationIds.has(dest.id))
      }
    }

    if (filteredDestinations.length > 0) {
      setAvailableDestinations(filteredDestinations)
    } else {
      if (initialDepartureDetails && initialArrivalDetails) {
        setAvailableDestinations([initialDepartureDetails, initialArrivalDetails])
      } else {
        setAvailableDestinations(allDestinations)
      }
    }
  }, [allDestinations, routes, flightType, loading, initialDepartureDetails, initialArrivalDetails])

  useEffect(() => {
    if (loading || allDestinations.length === 0 || !departure) {
      return
    }

    if (flightType === 'ligne-reguliere' || flightType === 'vol-prive') {
      const availableFromDeparture: Destination[] = []

      routes.forEach((route) => {
        const startId =
          typeof route.start_point === 'string' ? route.start_point : route.start_point?.id
        const endId = typeof route.end_point === 'string' ? route.end_point : route.end_point?.id

        if (startId === departure && endId) {
          const destination = allDestinations.find((dest) => dest.id === endId)
          if (destination && !availableFromDeparture.some((d) => d.id === destination.id)) {
            availableFromDeparture.push(destination)
          }
        }

        if (endId === departure && startId) {
          const destination = allDestinations.find((dest) => dest.id === startId)
          if (destination && !availableFromDeparture.some((d) => d.id === destination.id)) {
            availableFromDeparture.push(destination)
          }
        }
      })

      if (availableFromDeparture.length > 0) {
        setAvailableDestinations(availableFromDeparture)
        if (arrival && !availableFromDeparture.some((dest) => dest.id === arrival)) {
          setArrival('')
        }
      }
    }
  }, [departure, flightType, allDestinationsIds, routesIds, arrival])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setIsSubmitting(true)

    try {
      const dateTimeISO = date && time ? `${date}T${time}:00Z` : null
      const returnDateTimeISO =
        isReturn && returnDate && returnTime ? `${returnDate}T${returnTime}:00Z` : null

      const bookingData = {
        flightType: flightType === 'vol-prive' ? 'private-flight' : 'regular-line',
        departure,
        arrival,
        datetime: dateTimeISO,
        returnDatetime: returnDateTimeISO,
        isReturn,
        passengers: {
          adults,
          children: childPassengers,
          babies,
        },
        luggage: {
          checked: checkedLuggage,
        },
        driverService: needsDriverService
          ? {
              pickupLocation,
            }
          : null,
        contact: {
          type: isCompany ? 'company' : 'individual',
          firstName,
          lastName,
          companyName: isCompany ? companyName : '',
          email,
          phone,
        },
        pricing: {
          adultPrice,
          childPrice,
          babyPrice,
          baggagePrice,
          adultCost,
          childCost,
          babyCost,
          baggageCost,
          totalPrice: total,
        },
      }

      const flightTypeLabel = flightType === 'vol-prive' ? 'Vol Privé' : 'Ligne Régulière'

      const emailBody = `
        Nouvelle réservation :
        
        Type : ${flightTypeLabel}
        Trajet : ${departureTitle} -> ${arrivalTitle}
        Date : ${date}
        Heure : ${time}
        ${
          isReturn
            ? `
        Trajet retour : ${arrivalTitle} -> ${departureTitle}
        Date : ${returnDate}
        Heure : ${returnTime}
        `
            : ''
        }
        Passagers : ${adults} adultes, ${childPassengers} enfants, ${babies} bébés
        Bagages : ${checkedLuggage} unités enregistrées
        
        Contact : ${isCompany ? companyName : `${firstName} ${lastName}`}
        Email : ${email}
        Téléphone : ${phone}
        
        Prix :
        Adultes : ${adults} x ${adultPrice}€ = ${adultCost}€
        Enfants : ${childPassengers} x ${childPrice}€ = ${childCost}€
        Bébés : ${babies} x ${babyPrice}€ = ${babyCost}€
        Bagages : ${checkedLuggage} x ${baggagePrice}€ = ${baggageCost}€
        ${isReturn ? `Total aller-retour : ${total}€ (${singleTripTotal}€ x 2)` : `Total : ${total}€`}
      `

      alert(t('formSubmitted'))
      window.location.href = '/booking/success'
    } catch (error) {
      console.error('Error submitting form:', error)
      alert(t('formError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2)
    } else {
      setCurrentStep(currentStep + 1)
    }
    window.scrollTo(0, 0)
  }

  const goToPreviousStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    } else {
      setCurrentStep(currentStep - 1)
    }
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const isReturnParam = searchParams.get('isReturn')
    const onewayParam = searchParams.get('oneway')
    const datetimeParam = searchParams.get('datetime')
    const returndatetimeParam = searchParams.get('returndatetime')

    if (isReturnParam === 'true') {
      setIsReturn(true)
    } else if (onewayParam === 'true') {
      setIsReturn(false)
    }

    if (datetimeParam) {
      try {
        const dateObj = new Date(datetimeParam)
        setDate(dateObj.toISOString().split('T')[0])
        setTime(dateObj.toISOString().split('T')[1].substr(0, 5))
      } catch (error) {
        console.error('Error parsing datetime parameter:', error)
      }
    }

    if (returndatetimeParam) {
      try {
        const dateObj = new Date(returndatetimeParam)
        setReturnDate(dateObj.toISOString().split('T')[0])
        setReturnTime(dateObj.toISOString().split('T')[1].substr(0, 5))
      } catch (error) {
        console.error('Error parsing returndatetime parameter:', error)
      }
    }
  }, [])

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <ProgressSteps
            currentStep={currentStep}
            steps={[t('steps.flightDetails'), t('steps.contact')]}
          />

          {currentStep === 1 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                goToNextStep()
              }}
            >
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <FlightType flightType={flightType} setFlightType={setFlightType} />
                  <FlightDetails
                    departure={departure}
                    setDeparture={setDeparture}
                    arrival={arrival}
                    setArrival={setArrival}
                    date={date}
                    setDate={setDate}
                    time={time}
                    setTime={setTime}
                    adults={adults}
                    setAdults={setAdults}
                    childPassengers={childPassengers}
                    setChildPassengers={setChildPassengers}
                    babies={babies}
                    setBabies={setBabies}
                    cabinLuggage={cabinLuggage}
                    setCabinLuggage={setCabinLuggage}
                    checkedLuggage={checkedLuggage}
                    setCheckedLuggage={setCheckedLuggage}
                    hasCommercialFlight={hasCommercialFlight}
                    setHasCommercialFlight={setHasCommercialFlight}
                    airline={airline}
                    setAirline={setAirline}
                    flightOriginDestination={flightOriginDestination}
                    setFlightOriginDestination={setFlightOriginDestination}
                    flightTime={flightTime}
                    setFlightTime={setFlightTime}
                    needsDriverService={needsDriverService}
                    setNeedsDriverService={setNeedsDriverService}
                    pickupLocation={pickupLocation}
                    setPickupLocation={setPickupLocation}
                    goToNextStep={goToNextStep}
                    isReversed={isRouteInitiallyReversed}
                    availableDestinations={availableDestinations}
                    availableTimes={availableTimes}
                    routeData={initialRouteDetails}
                    maxPassengers={6}
                    maxBaggage={2}
                    baggagePrice={baggagePrice}
                  />
                </div>
                <div className="md:col-span-1">
                  <div className="sticky top-8">
                    <BookingSummary
                      flightType={flightType}
                      departure={departureTitle}
                      arrival={arrivalTitle}
                      date={date}
                      time={time}
                      isReturn={isReturn}
                      returnDate={returnDate}
                      returnTime={returnTime}
                      adults={adults}
                      childPassengers={childPassengers}
                      babies={babies}
                      cabinLuggage={cabinLuggage}
                      checkedLuggage={checkedLuggage}
                      basePrice={adultPrice}
                      baggagePrice={baggagePrice}
                      total={total}
                    />
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <form
              action="https://formsubmit.co/danyamas07@gmail.com"
              method="POST"
              encType="multipart/form-data"
            >
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <ContactInformation
                    isCompany={isCompany}
                    setIsCompany={setIsCompany}
                    firstName={firstName}
                    setFirstName={setFirstName}
                    lastName={lastName}
                    setLastName={setLastName}
                    companyName={companyName}
                    setCompanyName={setCompanyName}
                    email={email}
                    setEmail={setEmail}
                    phone={phone}
                    setPhone={setPhone}
                    acceptTerms={acceptTerms}
                    setAcceptTerms={setAcceptTerms}
                    goToPreviousStep={goToPreviousStep}
                  />

                  <input
                    type="hidden"
                    name="_subject"
                    value={`Nouvelle réservation de vol: ${departureTitle} - ${arrivalTitle}`}
                  />
                  <input type="hidden" name="_next" value={`${window.location.origin}/`} />
                  <input type="hidden" name="_captcha" value="true" />
                  <input type="hidden" name="_template" value="table" />

                  <input type="hidden" name="flightType" value="Ligne Régulière" />
                  <input type="hidden" name="departure" value={departureTitle} />
                  <input type="hidden" name="arrival" value={arrivalTitle} />
                  <input type="hidden" name="date" value={date} />
                  <input type="hidden" name="time" value={time} />
                  <input type="hidden" name="isReturn" value={isReturn ? 'Oui' : 'Non'} />
                  {isReturn && (
                    <>
                      <input type="hidden" name="returnDate" value={returnDate} />
                      <input type="hidden" name="returnTime" value={returnTime} />
                    </>
                  )}

                  <input type="hidden" name="adultsCount" value={adults.toString()} />
                  <input type="hidden" name="childrenCount" value={childPassengers.toString()} />
                  <input type="hidden" name="babiesCount" value={babies.toString()} />
                  <input type="hidden" name="luggageCount" value={checkedLuggage.toString()} />

                  {hasCommercialFlight && (
                    <>
                      <input type="hidden" name="hasCommercialFlight" value="Oui" />
                      <input type="hidden" name="airline" value={airline} />
                      <input
                        type="hidden"
                        name="flightOriginDestination"
                        value={flightOriginDestination}
                      />
                      <input type="hidden" name="flightTime" value={flightTime} />
                    </>
                  )}

                  {needsDriverService && (
                    <>
                      <input type="hidden" name="needsDriverService" value="Oui" />
                      <input type="hidden" name="pickupLocation" value={pickupLocation} />
                    </>
                  )}

                  <input type="hidden" name="adultPrice" value={`${adultPrice}€`} />
                  <input type="hidden" name="childPrice" value={`${childPrice}€`} />
                  <input type="hidden" name="babyPrice" value={`${babyPrice}€`} />
                  <input type="hidden" name="baggagePrice" value={`${baggagePrice}€`} />
                  <input type="hidden" name="adultCost" value={`${adultCost}€`} />
                  <input type="hidden" name="childCost" value={`${childCost}€`} />
                  <input type="hidden" name="babyCost" value={`${babyCost}€`} />
                  <input type="hidden" name="baggageCost" value={`${baggageCost}€`} />
                  <input type="hidden" name="totalPrice" value={`${total}€`} />
                </div>
                <div className="md:col-span-1">
                  <div className="sticky top-8">
                    <BookingSummary
                      flightType={flightType}
                      departure={departureTitle}
                      arrival={arrivalTitle}
                      date={date}
                      time={time}
                      isReturn={isReturn}
                      returnDate={returnDate}
                      returnTime={returnTime}
                      adults={adults}
                      childPassengers={childPassengers}
                      babies={babies}
                      cabinLuggage={cabinLuggage}
                      checkedLuggage={checkedLuggage}
                      basePrice={adultPrice}
                      baggagePrice={baggagePrice}
                      total={total}
                    />
                    <CustomerSupport />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

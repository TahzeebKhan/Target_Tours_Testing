import React from 'react'
import BetweenMajesticPeaks from './components/betweenMajesticPeaks/BetweenMajesticPeaks'
import TripHighlights from './components/tripHighlights/TripHighlights'
import InfoStrip from './components/infoStrip/InfoStrip'
import WhereWillYouStay from './components/whereWillYouStay/WhereWillYouStay'
import Testimonial from './components/testimonialSection/Testimonial'
import TravelInspiration from './components/travelInspiration/TravelInspiration'
import Footer from '../home-page/components/footer/Footer'
import FeatureSection from '../home-page/components/featureSection/FeatureSection'
import TourBookingHeroSection from './components/tourBookingHeroSection/TourBookingHeroSection'
import UpcomingDepartures from './components/upcomingDepartures/UpcomingDepartures'
import ArrivalToronto from './components/arrivalToronto/ArrivalToronto'

const page = () => {
  return (
    <div>
      <TourBookingHeroSection/>
      <BetweenMajesticPeaks/>
      <UpcomingDepartures/>
      <TripHighlights/>
      <ArrivalToronto/>
      <InfoStrip/>
      <WhereWillYouStay/>
      <Testimonial/>
      <TravelInspiration/>
      <FeatureSection/>
      <Footer/>
    </div>
  )
}

export default page

import React from 'react'
import TourBookingHeroSection from './components/tourBookingHeroSection/tourBookingHeroSection'
import BetweenMajesticPeaks from './components/betweenMajesticPeaks/BetweenMajesticPeaks'
import TripHighlights from './components/tripHighlights/TripHighlights'
import InfoStrip from './components/infoStrip/InfoStrip'
import WhereWillYouStay from './components/whereWillYouStay/WhereWillYouStay'
import Testimonial from './components/testimonialSection/Testimonial'
import TravelInspiration from './components/travelInspiration/TravelInspiration'
import Footer from '../home-page/components/footer/Footer'
import FeatureSection from '../home-page/components/featureSection/FeatureSection'

const page = () => {
  return (
    <div>
      <TourBookingHeroSection/>
      <BetweenMajesticPeaks/>
      <TripHighlights/>
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

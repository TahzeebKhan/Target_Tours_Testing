import React from 'react'
import Comprehensive from './components/Comprehensive/Comprehensive'
import Claim from './components/Claim/Claim'
import Questions from './components/Questions/questions'
import FeatureSection from '../home-page/components/featureSection/FeatureSection'
import Footer from '../home-page/components/footer/Footer'
import Navbar from './components/Navbar/Navbar'

const page = () => {
  return (
    <div>
      <Navbar />
      <Comprehensive />
          <Claim />
          <Questions />
          <FeatureSection />
          <Footer />
          
    </div>
  )
}

export default page
"use client";
import HomePage from "./home-page/components/homePage/HomePage";
import TopToFlights from "./home-page/components/topToFlights/TopToFlights";
import TargetTours from "./home-page/components/targetTours/TargetTours";
import SignatureExperiences from "./home-page/components/signatureExperiences/SignatureExperiences";
import PopularFlights from "./home-page/components/popularFlights/PopularFlights";
import ExploreStays from "./home-page/components/exploreStays/ExploreStays";
import LimitedTimeOffer from "./home-page/components/limitedTimeOffer/LimitedTimeOffer";
import GroupPrivateTrips from "./home-page/components/groupPrivateTrips/GroupPrivateTrips";
import FeatureSection from "./home-page/components/featureSection/FeatureSection";
import Footer from "./home-page/components/footer/Footer";
import PrivateGroup from "./home-page/components/privateGroup/PrivateGroup";

import { Suspense, useEffect, useState } from "react";

export default function Home() {
  const [homeReady, setHomeReady] = useState(false);
  const [isMultiTripMobile, setIsMultiTripMobile] = useState(false);
  const [itineraryType, setItineraryType] = useState(null);

  const [itineraryOpen, setItineraryOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 895px)");

    const handleChange = (e) => {
      setIsMobileView(e.matches);
    };

    // initial check
    setIsMobileView(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <HomePage
          itineraryType={itineraryType}
          itineraryOpen={itineraryOpen}
          setItineraryOpen={setItineraryOpen}
          // mobileItineraryOpen={mobileItineraryOpen}
          // setMobileItineraryOpen={setMobileItineraryOpen}
          setIternaryType={setItineraryType}
          setIsMultiTripMobile={setIsMultiTripMobile}
          onReady={() => setHomeReady(true)}
        />
      </Suspense>
      {homeReady && (
        <>
          <SignatureExperiences isMultiTripMobile={isMultiTripMobile} />
          <PopularFlights />
          <TopToFlights />

          <TargetTours />
          {isMobileView ? (
            <PrivateGroup
              onGroupQuote={() => {
                setItineraryType("group");
                setItineraryOpen(true);
              }}
              onPrivateQuote={() => {
                setItineraryType("private");
                setItineraryOpen(true);
              }}
            />
          ) : (
            <GroupPrivateTrips
              onGroupQuote={() => {
                setItineraryType("group");
                setItineraryOpen(true);
              }}
              onPrivateQuote={() => {
                setItineraryType("private");
                setItineraryOpen(true);
              }}
            />
          )}

          <LimitedTimeOffer />
          <ExploreStays />
          <FeatureSection />
          <Footer />
        </>
      )}
    </>
  );
}

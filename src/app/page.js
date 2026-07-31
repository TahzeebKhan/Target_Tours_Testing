"use client";
import HomePage from "./home-page/components/homePage/HomePage";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";

const SignatureExperiences = dynamic(
  () =>
    import(
      "./home-page/components/signatureExperiences/SignatureExperiences"
    ),
  { loading: () => null },
);
const PopularFlights = dynamic(
  () => import("./home-page/components/popularFlights/PopularFlights"),
  { loading: () => null },
);
const TopToFlights = dynamic(
  () => import("./home-page/components/topToFlights/TopToFlights"),
  { loading: () => null },
);
const TargetTours = dynamic(
  () => import("./home-page/components/targetTours/TargetTours"),
  { loading: () => null },
);
const GroupPrivateTrips = dynamic(
  () => import("./home-page/components/groupPrivateTrips/GroupPrivateTrips"),
  { loading: () => null },
);
const PrivateGroup = dynamic(
  () => import("./home-page/components/privateGroup/PrivateGroup"),
  { loading: () => null },
);
const LimitedTimeOffer = dynamic(
  () => import("./home-page/components/limitedTimeOffer/LimitedTimeOffer"),
  { loading: () => null },
);
const ExploreStays = dynamic(
  () => import("./home-page/components/exploreStays/ExploreStays"),
  { loading: () => null },
);
const FeatureSection = dynamic(
  () => import("./home-page/components/featureSection/FeatureSection"),
  { loading: () => null },
);
const Footer = dynamic(
  () => import("./home-page/components/footer/Footer"),
  { loading: () => null },
);

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
          {/* <PopularFlights /> */}
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

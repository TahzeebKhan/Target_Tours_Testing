import Image from "next/image";
import HomePage from "./home-page/components/homePage/HomePage";
import TopToFlights from "./home-page/components/topToFlights/TopToFlights";
import TargetTours from "./home-page/components/targetTours/TargetTours";
import SignatureExperiences from "./home-page/components/signatureExperiences/SignatureExperiences";
import PopularFlights from "./home-page/components/popularFlights/PopularFlights";
import ExploreStays from "./home-page/components/exploreStays/ExploreStays";
import LimitedTimeOffer from "./home-page/components/limitedTimeOffer/LimitedTimeOffer";
import GroupPrivateTrips from "./home-page/components/groupPrivateTrips/GroupPrivateTrips";
import FeatureSection from "./home-page/components/featureSection/FeatureSection";
import Footer from "./home-page/components/footer/footer";

export default function Home() {
  return (
    <>
    <HomePage/>
    <SignatureExperiences/>
    <PopularFlights/>
    <TopToFlights/>
    
    <TargetTours/>
    <GroupPrivateTrips/>
    <LimitedTimeOffer/>
    <ExploreStays/>
    <FeatureSection/>
    <Footer/>
    </>
    
  );
}

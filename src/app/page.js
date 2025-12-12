import Image from "next/image";
import HomePage from "./home-page/components/homePage/HomePage";
import TopToFlights from "./home-page/components/topToFlights/TopToFlights";
import TargetTours from "./home-page/components/targetTours/TargetTours";
import SignatureExperiences from "./home-page/components/signatureExperiences/SignatureExperiences";

export default function Home() {
  return (
    <>
    <HomePage/>
    <SignatureExperiences></SignatureExperiences>
    <TopToFlights/>
    
    {/* <TargetTours/> */}
    </>
    
  );
}

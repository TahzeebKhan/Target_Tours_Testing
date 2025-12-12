import Image from "next/image";
import HomePage from "./home-page/components/homePage/HomePage";
import TopToFlights from "./home-page/components/topToFlights/TopToFlights";
import TargetTours from "./home-page/components/targetTours/TargetTours";

export default function Home() {
  return (
    <>
    <HomePage/>
    <TopToFlights/>
    <TargetTours/>
    </>
    
  );
}

import React from "react";
import FeatureSection from "../home-page/components/featureSection/FeatureSection";
import Footer from "../home-page/components/footer/Footer";
import Navbar from "./components/Navbar/Navbar";
import SupportPage from "./components/Support/support";

const page = () => {
  return (
    <div>
      <Navbar />
      <SupportPage />
      <FeatureSection />
      <Footer />
    </div>
  );
};

export default page;

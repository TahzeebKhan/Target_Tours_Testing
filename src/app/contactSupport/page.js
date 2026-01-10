import React from "react";
import FeatureSection from "../home-page/components/featureSection/FeatureSection";
import Footer from "../home-page/components/footer/Footer";
import Navbar from "./components/Navbar/Navbar";
import SupportPage from "./components/Support/support";
import ContactSupport from "./components/Contact/contact";
import HelpBooking from "./components/Help/help";
import Connect from "./components/Connect/connect";

const page = () => {
  return (
    <div>
      <Navbar />
      <SupportPage />
      <ContactSupport />
      <HelpBooking />
      <Connect />
      <FeatureSection />
      <Footer />
    </div>
  );
};

export default page;

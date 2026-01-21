"use client";

import Navbar from "./components/Navbar/Navbar";
import SupportPage from "./components/Support/support";
import ContactSupport from "./components/Contact/contact";
import HelpBooking from "./components/Help/help";
import Connect from "./components/Connect/connect";
import FeatureSection from "../home-page/components/featureSection/FeatureSection";
import Footer from "../home-page/components/footer/Footer";
import { useSupportFlow } from "../context/SupportFlowContext";
// import { useSupportFlow } from "./context/SupportFlowContext";
import styles from "./page.module.css";

export default function Page() {
  const { step } = useSupportFlow();

  if (step === "help") return <HelpBooking />;
  if (step === "contact") return <ContactSupport />;
  if (step === "connect") return <Connect />;

  return (
    <>
      <div className={styles.desktop}>
        <Navbar />
        <SupportPage />
        <FeatureSection />
        <Footer />
      </div>

      <div className={styles.mobileView}>
        <Navbar />
        <SupportPage />
        <FeatureSection />
        {/* <Footer /> */}
      </div>
    </>
  );
}

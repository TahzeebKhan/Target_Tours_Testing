"use client";

import React from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import BetweenMajesticPeaks from "./components/betweenMajesticPeaks/BetweenMajesticPeaks";
import TripHighlights from "./components/tripHighlights/TripHighlights";
import InfoStrip from "./components/infoStrip/InfoStrip";
import WhereWillYouStay from "./components/whereWillYouStay/WhereWillYouStay";
import Testimonial from "./components/testimonialSection/Testimonial";
import TravelInspiration from "./components/travelInspiration/TravelInspiration";
import Footer from "../home-page/components/footer/Footer";
import FeatureSection from "../home-page/components/featureSection/FeatureSection";
import TourBookingHeroSection from "./components/tourBookingHeroSection/TourBookingHeroSection";
import UpcomingDepartures from "./components/upcomingDepartures/UpcomingDepartures";
import ArrivalToronto from "./components/arrivalToronto/ArrivalToronto";
import PriceBar from "./components/priceBar/PriceBar";
import styles from "./page.module.css";
import CustomLoaderHomePage from "@/shared/components/CustomLoaderHomePage";

/* ---------------- Error UI ---------------- */
const ErrorState = ({ title, description }) => {
  const router = useRouter();

  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center", background: "#fff", borderRadius: 12, padding: "32px 24px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
        <h2 style={{ marginBottom: 12 }}>{title}</h2>
        <p style={{ color: "#666", marginBottom: 24 }}>{description}</p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => router.back()} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #ddd", background: "#fff" }}>
            Go Back
          </button>
          <button onClick={() => router.push("/")} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#000", color: "#fff" }}>
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Query fn ---------------- */
const fetchTourDetails = async ({ queryKey }) => {
  const [, tourId] = queryKey;
  const token = Cookies.get("auth_token");

  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/holiday-packages/${tourId}?domain=${process.env.NEXT_PUBLIC_DOMAIN}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );

  return res.data?.data;
};

const TourDetailsClient = () => {
  const searchParams = useSearchParams();
  const tourId = searchParams.get("id");

  const {
    data: tourDetails,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tour-details", tourId],
    queryFn: fetchTourDetails,
    enabled: !!tourId,           // 🔒 don’t fire without ID
    staleTime: 1000 * 60 * 5,     // 5 min cache
    retry: 1,
  });

  /* ---------- Guards ---------- */
  if (!tourId) {
    return (
      <ErrorState
        title="Invalid Tour"
        description="We couldn’t find the tour you’re looking for. Please try again."
      />
    );
  }

  if (isLoading) {
    return <CustomLoaderHomePage />;
  }

  if (isError || !tourDetails) {
    return (
      <ErrorState
        title="Something went wrong"
        description="We’re having trouble loading this tour right now. Please try again later."
      />
    );
  }

  /* ---------- UI ---------- */
  return (
    <div>
      <TourBookingHeroSection data={tourDetails} />
      <BetweenMajesticPeaks data={tourDetails} />
      <UpcomingDepartures data={tourDetails} />
      <TripHighlights data={tourDetails} />

      <div className={styles.priceBarContainer}>
        <PriceBar data={tourDetails} />
      </div>

      <ArrivalToronto data={tourDetails} />
      <InfoStrip data={tourDetails} />
      <WhereWillYouStay data={tourDetails} />

      <Testimonial data={tourDetails} />
      <TravelInspiration />
      <FeatureSection />
      <Footer />
    </div>
  );
};

export default TourDetailsClient;

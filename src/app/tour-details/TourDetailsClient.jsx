"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef } from "react";
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

const SELECTED_TOUR_OPTION_KEY = "selectedTourOption";

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
  const [, tourId, withFlight] = queryKey;
  const token = Cookies.get("auth_token");
  const params = {
    domain: process.env.NEXT_PUBLIC_DOMAIN,
  };

  if (withFlight === "true" || withFlight === "false") {
    params.with_flight = withFlight;
  }

  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/holiday-packages/${tourId}`,
    {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );

  return res.data?.data;
};

const TourDetailsClient = () => {
  const searchParams = useSearchParams();
  const tourId = searchParams.get("id");
  const withFlight = searchParams.get("with_flight");
  const selectedPrice = searchParams.get("selected_price");
  const itineraryRef = useRef(null);

  const scrollToItinerary = () => {
    itineraryRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const resetScrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  };

  const {
    data: tourDetails,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tour-details", tourId, withFlight],
    queryFn: fetchTourDetails,
    enabled: !!tourId,           // 🔒 don’t fire without ID
    staleTime: 1000 * 60 * 5,     // 5 min cache
    retry: 1,
  });

  const displayTourDetails = useMemo(() => {
    if (!tourDetails) return tourDetails;

    const selectedWithFlight =
      withFlight === "true" ? true : withFlight === "false" ? false : undefined;
    let selectedPriceValue = Number(selectedPrice);

    if (
      (!Number.isFinite(selectedPriceValue) || selectedPriceValue <= 0) &&
      typeof window !== "undefined"
    ) {
      try {
        const selectedOption = JSON.parse(
          window.sessionStorage.getItem(SELECTED_TOUR_OPTION_KEY) || "{}"
        );
        const matchesSelection =
          String(selectedOption?.id) === String(tourId) &&
          selectedOption?.with_flight === selectedWithFlight;

        if (matchesSelection) {
          selectedPriceValue = Number(selectedOption?.selected_price);
        }
      } catch {
        selectedPriceValue = 0;
      }
    }

    return {
      ...tourDetails,
      ...(Number.isFinite(selectedPriceValue) && selectedPriceValue > 0
        ? { started_price: selectedPriceValue }
        : {}),
      ...(typeof selectedWithFlight === "boolean"
        ? { with_flight: selectedWithFlight }
        : {}),
    };
  }, [selectedPrice, tourDetails, tourId, withFlight]);

  useLayoutEffect(() => {
    if (!tourId) return;
    resetScrollToTop();
  }, [tourId]);

  useEffect(() => {
    if (!tourId) return;

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [tourId]);

  useEffect(() => {
    if (!tourId || !tourDetails) return;

    resetScrollToTop();

    let secondFrameId;
    const firstFrameId = window.requestAnimationFrame(() => {
      resetScrollToTop();
      secondFrameId = window.requestAnimationFrame(resetScrollToTop);
    });
    const timeoutId = window.setTimeout(resetScrollToTop, 150);

    return () => {
      window.cancelAnimationFrame(firstFrameId);
      if (secondFrameId) window.cancelAnimationFrame(secondFrameId);
      window.clearTimeout(timeoutId);
    };
  }, [tourId, tourDetails]);

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

  if (isError || !displayTourDetails) {
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
      <TourBookingHeroSection
        data={displayTourDetails}
        onViewItinerary={scrollToItinerary}
      />
      <BetweenMajesticPeaks data={displayTourDetails} />
      <UpcomingDepartures data={displayTourDetails} />
      <TripHighlights data={displayTourDetails} />

      <div className={styles.priceBarContainer}>
        <PriceBar data={displayTourDetails} />
      </div>

      <div ref={itineraryRef}>
        <ArrivalToronto data={displayTourDetails} />
      </div>
      <InfoStrip data={displayTourDetails} />
      <WhereWillYouStay data={displayTourDetails} />

      <Testimonial data={displayTourDetails} />

      {/* <TravelInspiration /> */}

      <FeatureSection />
      <Footer />
    </div>
  );
};

export default TourDetailsClient;

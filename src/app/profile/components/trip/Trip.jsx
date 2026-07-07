"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EmptyTrip from "../emptyTrip/EmptyTrip";
import Reservations from "../reservations/Reservations";
import IndividualProperty from "../individualProperty/IndividualProperty";

const DEFAULT_ACTIVE_TAB = "HOTEL BOOKING";
const ACTIVE_TAB_STORAGE_KEY = "profileReservationsActiveTab";
const RESERVATION_TABS = new Set([
  "ALL",
  "HOTEL BOOKING",
  "FLIGHT BOOKING",
  "PACKAGES",
  "TRAVEL INSURANCE",
]);

const DETAIL_TYPE_TO_TAB = {
  hotel: "HOTEL BOOKING",
  flight: "FLIGHT BOOKING",
  package: "PACKAGES",
  insurance: "TRAVEL INSURANCE",
};

const TAB_TO_DETAIL_TYPE = {
  "HOTEL BOOKING": "hotel",
  "FLIGHT BOOKING": "flight",
  PACKAGES: "package",
  "TRAVEL INSURANCE": "insurance",
};

const getStoredActiveTab = () => {
  if (typeof window === "undefined") return DEFAULT_ACTIVE_TAB;

  const storedTab = window.localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
  return RESERVATION_TABS.has(storedTab) ? storedTab : DEFAULT_ACTIVE_TAB;
};

const Trip = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState("RESERVATIONS");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [activeTab, setActiveTab] = useState(DEFAULT_ACTIVE_TAB);
  const [hasRestoredActiveTab, setHasRestoredActiveTab] = useState(false);
  // EMPTY | RESERVATIONS | DETAILS

  useEffect(() => {
    setActiveTab(getStoredActiveTab());
    setHasRestoredActiveTab(true);
  }, []);

  useEffect(() => {
    if (!hasRestoredActiveTab) return;
    if (!RESERVATION_TABS.has(activeTab)) return;
    window.localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTab);
  }, [activeTab, hasRestoredActiveTab]);

  useEffect(() => {
    if (!hasRestoredActiveTab) return;

    const bookingId = searchParams.get("bookingId");
    const bookingType = searchParams.get("bookingType");
    const tabFromType = DETAIL_TYPE_TO_TAB[bookingType];

    if (!bookingId || !tabFromType) return;

    setSelectedBooking((current) => {
      if (current?.detailId === bookingId) return current;

      return {
        id: bookingId,
        detailId: bookingId,
        bookingType: tabFromType,
        raw: { id: bookingId },
      };
    });
    setActiveTab(tabFromType);
    setStep("DETAILS");
  }, [hasRestoredActiveTab, searchParams]);

  const openDetails = (booking) => {
    setSelectedBooking(booking || null);
    if (booking?.bookingType) {
      setActiveTab(booking.bookingType);
    }

    const bookingId = booking?.detailId || booking?.raw?.id || booking?.id;
    const bookingType = TAB_TO_DETAIL_TYPE[booking?.bookingType || activeTab];

    if (bookingId && bookingType) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("bookingId", bookingId);
      params.set("bookingType", bookingType);
      router.replace(`/profile?${params.toString()}`, { scroll: false });
    }

    setStep("DETAILS");
  };

  const backToReservations = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("bookingId");
    params.delete("bookingType");
    router.replace(params.toString() ? `/profile?${params.toString()}` : "/profile", {
      scroll: false,
    });
    setStep("RESERVATIONS");
    setSelectedBooking(null);
  };

  if (step === "EMPTY") {
    return <EmptyTrip onStartSearching={() => setStep("RESERVATIONS")} />;
  }

  if (step === "RESERVATIONS") {
    return (
      <Reservations
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onCheckDetails={openDetails}
      />
    );
  }

  return (
    <IndividualProperty
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      selectedBooking={selectedBooking}
      onBack={backToReservations}
    />
  );
};

export default Trip;

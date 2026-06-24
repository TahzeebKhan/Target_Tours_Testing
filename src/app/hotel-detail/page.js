"use client";
import React, { useRef, useState, useEffect } from "react";
import styles from "./HotelDetailLayout.module.css";
import DescriptionComponent from "./Components/descriptionComponent/DescriptionComponent";
import Amenities from "./Components/amenities/Amenities";
import AvailabilityComponent from "./Components/availabilityComponent/AvailabilityComponent";
import HotelPolicies from "./Components/hotelPolicies/HotelPolicies";
import RoomSelectionCard from "./Components/roomSelectionCard/RoomSelectionCard";
import CustomerReviews from "./Components/customerReviews/CustomerReviews";
import BarcelonaSection from "./Components/BarcelonaSection/BarcelonaSection";
import BookingSummary from "./Components/bookingSummary/BookingSummary";
import Tabs from "./Components/tabs/Tabs";
import { useHotelDetailData } from "./HotelDetailDataContext";
import {
  HOTEL_BOOKING_SESSION_KEY,
  HOTEL_SEARCH_SESSION_KEY,
} from "@/shared/services/hotelSearch";

const parseCurrencyNumber = (value) => {
  const numericValue = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const formatDisplayDate = (value, fallback) => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const readStoredHotelSearch = () => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(HOTEL_SEARCH_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getSearchParamValue = (key) => {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(key) || "";
};

const isPlaceholderDate = (value) =>
  ["check-in", "check-out"].includes(String(value || "").trim().toLowerCase());

const getFirstValue = (...values) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !isPlaceholderDate(value),
  ) || "";

const getNightCount = (checkInValue, checkOutValue) => {
  const checkInDate = new Date(checkInValue);
  const checkOutDate = new Date(checkOutValue);

  if (
    Number.isNaN(checkInDate.getTime()) ||
    Number.isNaN(checkOutDate.getTime()) ||
    checkOutDate <= checkInDate
  ) {
    return 1;
  }

  return Math.max(
    1,
    Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)),
  );
};

const Page = () => {
  const { hotelDetail, roomsLoading } = useHotelDetailData();
  const [activeTab, setActiveTab] = useState("Description");
  const [showSummary, setShowSummary] = useState(false);
  const [roomList, setRoomList] = useState([
    {
      id: "deluxe_ac_room",
      title: "Deluxe Private AC Room with Ensuite Bathroom",
      image: "/images/hotelArt1.png",
      pricePerNight: 1397.86,
      quantity: 1,
      maxQuantity: 5,
      nights: 8,
    },
    {
      id: "premium_ac_room",
      title: "Premium Private AC Room with Ensuite Bathroom",
      image: "/images/hotelArt1.png",
      pricePerNight: 1397.86,
      quantity: 1,
      maxQuantity: 5,
      nights: 8,
    },
  ]);
  const searchRequest = hotelDetail?.request || {};
  const storedHotelSearch = readStoredHotelSearch() || {};
  const urlCheckIn = getSearchParamValue("checkIn");
  const urlCheckOut = getSearchParamValue("checkOut");
  const apiCheckIn = getFirstValue(
    urlCheckIn,
    searchRequest.checkInDate,
    searchRequest.checkInRaw,
    searchRequest.checkIn,
    searchRequest.check_in,
    storedHotelSearch.checkIn,
    storedHotelSearch.initPayload?.checkIn,
  );
  const apiCheckOut = getFirstValue(
    urlCheckOut,
    searchRequest.checkOutDate,
    searchRequest.checkOutRaw,
    searchRequest.checkOut,
    searchRequest.check_out,
    storedHotelSearch.checkOut,
    storedHotelSearch.initPayload?.checkOut,
  );
  const checkIn = formatDisplayDate(
    apiCheckIn,
    "Check-in",
  );
  const checkOut = formatDisplayDate(
    apiCheckOut,
    "Check-out",
  );
  const rooms =
    getSearchParamValue("rooms") ||
    searchRequest.rooms ||
    searchRequest.roomCount ||
    storedHotelSearch.rooms ||
    1;
  const adults =
    getSearchParamValue("adults") ||
    searchRequest.adults ||
    searchRequest.adultCount ||
    storedHotelSearch.adults ||
    storedHotelSearch.initPayload?.rooms?.[0]?.adults ||
    1;
  const children =
    getSearchParamValue("children") ||
    searchRequest.children ||
    searchRequest.childCount ||
    storedHotelSearch.children ||
    storedHotelSearch.initPayload?.rooms?.[0]?.children ||
    0;
  const nights = getNightCount(apiCheckIn, apiCheckOut);
  const selectedRooms = roomList.filter((room) => room.quantity > 0);

  const saveBookingSession = () => {
    if (typeof window === "undefined") return;

    const payload = {
      hotel: {
        id: hotelDetail?.id || "",
        name: hotelDetail?.name || "Hotel",
        address: hotelDetail?.address || "",
        rating: hotelDetail?.rating || 0,
        reviewText: hotelDetail?.reviewText || "",
        image: hotelDetail?.images?.[0] || "/images/hotelArt1.png",
      },
      request: {
        ...searchRequest,
        searchContext: storedHotelSearch,
        initResponse: storedHotelSearch.initResponse,
        checkInDate: apiCheckIn,
        checkOutDate: apiCheckOut,
        checkIn,
        checkOut,
        nights,
        rooms,
        adults,
        children,
      },
      rooms: selectedRooms,
    };

    window.sessionStorage.setItem(HOTEL_BOOKING_SESSION_KEY, JSON.stringify(payload));
  };

  useEffect(() => {
    if (!hotelDetail?.rooms?.length) return;

    setRoomList(
      hotelDetail.rooms.map((room) => {
        const occupancyGuestCount = Array.isArray(room.occupancies)
          ? room.occupancies.reduce(
              (total, occupancy) =>
                total +
                Number(occupancy.numOfAdults || occupancy.NumOfAdults || 0) +
                Number(occupancy.numOfChildren || occupancy.NumOfChildren || 0),
              0,
            )
          : 0;
        const displayedGuestCount =
          Number(String(room.persons || "").match(/\d+/)?.[0]) || 0;

        return {
          id: room.id,
          title: room.title,
          image: room.image?.[0]?.img || "/images/hotelArt1.png",
          pricePerNight: parseCurrencyNumber(room.price?.offer),
          publishedRate: Number(room.price?.actualAmount) || parseCurrencyNumber(room.price?.actual),
          taxPerNight: Number(room.price?.taxAmount) || 0,
          rateIncludesTax: Boolean(room.price?.rateIncludesTax),
          quantity: 0,
          maxQuantity: Number(room.availability) || 1,
          nights,
          roomId: room.roomId,
          roomGroupId: room.roomGroupId,
          recommendationId: room.recommendationId,
          supplierName: room.supplierName,
          guestCode: room.guestCode,
          occupancies: room.occupancies,
          maxGuestAllowed: displayedGuestCount || occupancyGuestCount || 1,
          netAmount: parseCurrencyNumber(room.price?.offer),
        };
      }),
    );
  }, [hotelDetail?.rooms, nights]);
  const removeRoom = (id) => {
    setRoomList((prev) => {
      const nextRooms = prev.map((room) =>
        room.id === id ? { ...room, quantity: 0 } : room,
      );

      setShowSummary(nextRooms.some((room) => room.quantity > 0));
      return nextRooms;
    });
  };
  const handleRoomQuantityChange = (id, quantity) => {
    setRoomList((prev) => {
      const nextRooms = prev.map((room) =>
        room.id === id ? { ...room, quantity } : room,
      );

      setShowSummary(nextRooms.some((room) => room.quantity > 0));
      return nextRooms;
    });
  };
  const sectionRefs = {
    Description: useRef(null),
    Amenities: useRef(null),
    Rooms: useRef(null),
    Reviews: useRef(null),
    "HOTEL POLICY": useRef(null),
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    sectionRefs[tab]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };









  return (
    <>
      {/* <Tabs
        tabs={[
          "Description",
          "Amenities",
          "Rooms",
          "Location",
          "Reviews",
          "HOTEL POLICY",
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      /> */}
      <Tabs
        tabs={Object.keys(sectionRefs)}
        activeTab={activeTab}
        onChange={handleTabChange}
      />
      {/* SECTION 1: contentWrapper */}
      <main className={styles.contentWrapper}>
        <div className={styles.leftContent}>
          <section ref={sectionRefs.Description}>
            <DescriptionComponent description={hotelDetail?.description} />
          </section>
          <section ref={sectionRefs.Amenities}>
            <Amenities amenities={hotelDetail?.amenities} />
          </section>
          <section ref={sectionRefs.Rooms}>
            <AvailabilityComponent
              rooms={hotelDetail?.rooms || []}
              loading={roomsLoading}
              errorMessage={hotelDetail?.roomsErrorMessage}
              onRoomQuantityChange={handleRoomQuantityChange}
            />
          </section>
        </div>

        <div
          className={`${styles.rightSidebar} ${
            showSummary ? styles.summarySidebar : ""
          }`}
        >
          <div
            className={`${styles.roomWrapper} ${
              showSummary ? styles.hide : ""
            }`}
          >
            <RoomSelectionCard
              onBookNow={() => setShowSummary(true)}
              checkIn={apiCheckIn}
              checkOut={apiCheckOut}
              rooms={rooms}
              adults={adults}
              children={children}
            />
          </div>

          {/* Booking Summary */}
          <div
            className={`${styles.summaryWrapper} ${
              showSummary ? styles.show : ""
            }`}
          >
            <BookingSummary
              roomList={selectedRooms}
              checkInDate={apiCheckIn}
              nights={nights}
              onRemove={removeRoom}
              onBookNow={saveBookingSession}
            />
          </div>
        </div>
      </main>

      {/* SECTION 2: OUTSIDE contentWrapper */}
      <section
        className={styles.policySection}
        ref={sectionRefs["HOTEL POLICY"]}
      >
        <HotelPolicies
          policies={hotelDetail?.policies}
          hotelName={hotelDetail?.name}
        />
      </section>

      <section className={styles.Reviews} ref={sectionRefs.Reviews}>
        <CustomerReviews  Reviews={hotelDetail?.reviews} />
      </section>
      <BarcelonaSection />
    </>
  );
};

export default Page;

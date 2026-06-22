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
import { HOTEL_BOOKING_SESSION_KEY } from "@/shared/services/hotelSearch";

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
  const checkIn = formatDisplayDate(
    searchRequest.checkIn || searchRequest.check_in,
    "Check-in",
  );
  const checkOut = formatDisplayDate(
    searchRequest.checkOut || searchRequest.check_out,
    "Check-out",
  );
  const rooms = searchRequest.rooms || searchRequest.roomCount || 1;
  const adults = searchRequest.adults || searchRequest.adultCount || 1;
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
        checkIn,
        checkOut,
        rooms,
        adults,
      },
      rooms: selectedRooms,
    };

    window.sessionStorage.setItem(HOTEL_BOOKING_SESSION_KEY, JSON.stringify(payload));
  };

  useEffect(() => {
    if (!hotelDetail?.rooms?.length) return;

    setRoomList(
      hotelDetail.rooms.map((room) => ({
        id: room.id,
        title: room.title,
        image: room.image?.[0]?.img || "/images/hotelArt1.png",
        pricePerNight: parseCurrencyNumber(room.price?.offer),
        quantity: 0,
        maxQuantity: Number(room.availability) || 1,
        nights: 1,
        roomId: room.roomId,
        roomGroupId: room.roomGroupId,
        recommendationId: room.recommendationId,
        supplierName: room.supplierName,
        guestCode: room.guestCode,
        occupancies: room.occupancies,
        netAmount: parseCurrencyNumber(room.price?.offer),
      })),
    );
  }, [hotelDetail?.rooms]);
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
              checkIn={checkIn}
              checkOut={checkOut}
              rooms={rooms}
              adults={adults}
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

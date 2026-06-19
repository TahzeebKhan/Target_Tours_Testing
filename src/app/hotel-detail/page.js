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
import ExpCarousel from "../exploreCarousel/component/ExpCarousel";
import BookingSummary from "./Components/bookingSummary/BookingSummary";
import Tabs from "./Components/tabs/Tabs";
import { useHotelDetailData } from "./HotelDetailDataContext";

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
  const { hotelDetail } = useHotelDetailData();
  const [activeTab, setActiveTab] = useState("Description");
  const [showSummary, setShowSummary] = useState(false);
  const onBookNow = () => {
    setShowSummary(true);
  };
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

  useEffect(() => {
    if (!hotelDetail?.rooms?.length) return;

    setRoomList(
      hotelDetail.rooms.slice(0, 2).map((room) => ({
        id: room.id,
        title: room.title,
        image: room.image?.[0]?.img || "/images/hotelArt1.png",
        pricePerNight: parseCurrencyNumber(room.price?.offer),
        quantity: 1,
        maxQuantity: 5,
        nights: 1,
      })),
    );
  }, [hotelDetail?.rooms]);
  const removeRoom = (id) => {
    setRoomList((prev) =>
      prev.map((room) => (room.id === id ? { ...room, quantity: 0 } : room))
    );
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
            <AvailabilityComponent rooms={hotelDetail?.rooms} />
          </section>
        </div>

        <div className={styles.rightSidebar}>
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
            <BookingSummary roomList={roomList} onRemove={removeRoom} />
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

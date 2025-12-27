"use client";
import React, { useRef, useState } from "react";
import styles from "./TourHeroSection.module.css";
import Navbar from "@/app/flights/Navbar";
import TravellerSelector from "@/app/home-page/components/homePage/TravellerSelector";
import DestinationFilter from "../tabsFilters/DestinationFilter";
import TravellerFilter from "../tabsFilters/TravellerFilter";
import PreferencesFilter from "../tabsFilters/PreferencesFilter";

const TourHeroSection = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [guestRoomCount, setGuestRoomCount] = useState("SELECT ROOMS");
  const departureRef = useRef(null);

  const [activeTab, setActiveTab] = useState("");
  const travellerOptions = [
    { value: "1_room_2_adult", label: "1 Room, 2 Adults" },
    { value: "2_room_4_adult", label: "2 Rooms, 4 Adults" },
  ];

  const openDeparturePicker = () => {
    const input = departureRef.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.focus();
      input.click();
    }
  };

  const handleFieldClick = (e) => {
    const target = e.currentTarget;
    const input = target.querySelector("input");

    if (!input) return;

    // Check if it's a date input
    if (input.type === "date" && typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      // For text inputs, just focus
      input.focus();
    }
  };
  return (
    <section className={styles.tourHeroSection}>
      <div className={styles.overlay}></div>
      <div>
        <Navbar />
      </div>
      <div className={styles.container}>
        <div
          className={`${styles.serarchingCont} ${styles.glass_panel} ${styles.searchFormContainer}`}
        >
          <div
            className={`${styles.serarchingContBottom} ${styles.swapActive}`}
          >
            {/* Slot 1: From City */}
            <div
              className={`${styles.fromBtn} ${styles.pos1}`}
              onClick={handleFieldClick}
            >
              <div className={`${styles.lable} ${styles.labelFade}`}>
                From CITY
              </div>
              <input
                type="text"
                className={`${styles.contant} ${styles.contentFade}`}
                placeholder="Departure"
                value={from || ""}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>

            {/* Slot 2: Departure Date */}
            <div
              className={`${styles.fromBtn} ${styles.pos2} ${styles.swapField}`}
              onClick={handleFieldClick}
            >
              <div className={`${styles.lable} ${styles.labelFade}`}>
                Departure Date
              </div>
              <div
                className={`${styles.dateInputWrapper} ${styles.contentFade}`}
                onClick={openDeparturePicker}
              >
                <input
                  ref={departureRef}
                  type="date"
                  className={styles.contant}
                  data-placeholder="ADD DATES"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.calendarIcon}
                  onClick={openDeparturePicker}
                >
                  <img src="/icons/calander.svg" alt="" />
                </button>
              </div>
            </div>

            {/* Slot 3: To City / Country / Category */}
            <div
              className={`${styles.fromBtn} ${styles.pos3} ${styles.swapField}`}
              onClick={handleFieldClick}
            >
              <div className={`${styles.lable} ${styles.labelFade}`}>
                To CITY/COUNTRY, CATEGORY
              </div>
              <input
                type="text"
                className={`${styles.contant} ${styles.contentFade}`}
                placeholder="Destination"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>

            {/* Slot 4: Rooms & Guests */}
            <TravellerSelector
              travellerClass={guestRoomCount}
              setTravellerClass={setGuestRoomCount}
              travellerOptions={travellerOptions}
              styles={styles}
              name="ROOMS & GUESTS"
              className={`${styles.pos4}`}
            />

            {/* Search Button */}
            <div className={`${styles.searchBtn} ${styles.pos5}`}>
              <img src="/icons/blueSearchIcon.svg" alt="" />
            </div>
          </div>
        </div>
        <div className={styles.textcontainer}>
          <p className={styles.para}>Discover the destination</p>
          <h2 className={styles.heading}>CANADA</h2>
        </div>
      </div>

      <div className={styles.tabContainer}>
        <button
          type="button"
          className={`${styles.tab} ${
            activeTab === "destination" ? styles.tabActive : ""
          }`}
          onClick={() =>
            setActiveTab(activeTab === "destination" ? "" : "destination")
          }
        >
          Destinations
          <img
            className={`${styles.downArrow} ${
              activeTab === "destination"
                ? styles.downArrow
                : styles.reversedDownArrow
            }`}
            src="/icons/DownArrows.svg"
            alt=""
          />
        </button>
        <div
          className={`${styles.filterWrapper} ${
            activeTab === "destination" ? styles.openFilter : styles.closeFilter
          }`}
        >
          {activeTab === "destination" && <DestinationFilter />}
        </div>

        <button
          type="button"
          className={`${styles.tab} ${
            activeTab === "traveler" ? styles.tabActive : ""
          }`}
          onClick={() =>
            setActiveTab(activeTab === "traveler" ? "" : "traveler")
          }
        >
          Traveler profiles
          <img
            className={`${styles.downArrow} ${
              activeTab === "traveler"
                ? styles.downArrow
                : styles.reversedDownArrow
            }`}
            src="/icons/DownArrows.svg"
            alt=""
          />
        </button>
        <div
          className={`${styles.filterWrapper} ${
            activeTab === "traveler" ? styles.openFilter : styles.closeFilter
          }`}
        >
          {activeTab === "traveler" && <TravellerFilter />}
        </div>

        <button
          type="button"
          className={`${styles.tab} ${
            activeTab === "preferences" ? styles.tabActive : ""
          }`}
          onClick={() =>
            setActiveTab(activeTab === "preferences" ? "" : "preferences")
          }
        >
          Your preferences
          <img
            className={`${styles.downArrow} ${
              activeTab === "preferences"
                ? styles.downArrow
                : styles.reversedDownArrow
            }`}
            src="/icons/DownArrows.svg"
            alt=""
          />
        </button>
        <div
          className={`${styles.filterWrapper} ${
            activeTab === "preferences" ? styles.openFilter : styles.closeFilter
          }`}
        >
          {activeTab === "preferences" && <PreferencesFilter />}
        </div>
      </div>
    </section>
  );
};

export default TourHeroSection;

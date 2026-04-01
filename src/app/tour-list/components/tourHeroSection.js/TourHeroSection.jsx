"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./TourHeroSection.module.css";
import Navbar from "@/app/flights/Navbar";
import DestinationFilter from "../tabsFilters/DestinationFilter";
import TravellerFilter from "../tabsFilters/TravellerFilter";
import PreferencesFilter from "../tabsFilters/PreferencesFilter";
import SuggestionBox from "@/app/home-page/components/homePage/SuggestionBox";
import { TripTypeProvider } from "@/app/flights/TripTypeContext";
import PassengerClassSelector from "@/app/home-page/components/homePage/PassengerClassSelector";
import { ChevronDown } from "lucide-react";
import DateField from "../dateField/DateField";
import { useSearchParams } from "next/navigation";
import RecentSearch from "@/shared/components/recentSearch/RecentSearch";

const TourHeroSection = () => {
  const searchParams = useSearchParams();
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");
  const [departureDate, setDepartureDate] = useState(
    searchParams.get("date") || "",
  );
  const [guestRoomCount, setGuestRoomCount] = useState("SELECT ROOMS");

  const departureRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const [travellerOpend, setTravellerOpend] = useState(false);

  const travellerRef = useRef(null);

  const [passengers, setPassengers] = useState({
    adult: 1,
    child: 0,
    infant: 0,
  });

  const [travelClass, setTravelClass] = useState("Economy");

  const totalPassengers =
    passengers.adult + passengers.child + passengers.infant;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (travellerRef.current && !travellerRef.current.contains(e.target)) {
        setTravellerOpend(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setTravellerOpend(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const recentSearches = [
    {
      label: "CHENNAI, INDIA",
      detail: "Chennai International Airport, India",
      code: "CEN",
      value: "Chennai, India",
    },
    {
      label: "MUMBAI, INDIA",
      detail: "Mumbai Chhatrapati Shivaji Maharaj International Airport, India",
      code: "BOM",
      value: "Mumbai, India",
    },
    {
      label: "KOLKATA, INDIA",
      detail: "Kolkata Netaji Subhas Chandra Bose International Airport, India",
      code: "KLG",
      value: "Kolkata, India",
    },
    {
      label: "BENGALURU, INDIA",
      detail: "Bengaluru Kempegowda International Airport, India",
      code: "BLR",
      value: "Bengaluru, India",
    },
  ];

  const getFilteredSuggestions = (query) => {
    if (!query) return recentSearches;
    const q = query.toLowerCase();
    return recentSearches.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.detail.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q),
    );
  };

  const [fromSuggestionsOpen, setFromSuggestionsOpen] = useState(false);
  const [toSuggestionsOpen, setToSuggestionsOpen] = useState(false);

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const fromSuggestionRef = useRef(null);
  const toSuggestionRef = useRef(null);

  const handleFromSelect = (city) => {
    setFrom(city); // city is already a string
    setFromSuggestionsOpen(false);
    fromInputRef.current?.focus();
  };

  const handleToSelect = (city) => {
    setTo(city);
    setToSuggestionsOpen(false);
    toInputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        fromSuggestionRef.current &&
        !fromSuggestionRef.current.contains(e.target) &&
        fromInputRef.current &&
        !fromInputRef.current.contains(e.target)
      ) {
        setFromSuggestionsOpen(false);
      }

      if (
        toSuggestionRef.current &&
        !toSuggestionRef.current.contains(e.target) &&
        toInputRef.current &&
        !toInputRef.current.contains(e.target)
      ) {
        setToSuggestionsOpen(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setFromSuggestionsOpen(false);
        setToSuggestionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

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
        <Navbar scrollProgress={scrollProgress} />
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
                ref={fromInputRef}
                type="text"
                className={`${styles.contant} ${styles.contentFade}`}
                placeholder="Departure"
                value={from}
                onFocus={() => setFromSuggestionsOpen(true)}
                onClick={() => setFromSuggestionsOpen(true)}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setFromSuggestionsOpen(true);
                }}
              />

              {fromSuggestionsOpen && (
                <div ref={fromSuggestionRef}>
                  <RecentSearch onSelect={handleFromSelect} />
                </div>
              )}
            </div>

            {/* Slot 2: Departure Date */}
            <div
              className={`${styles.fromBtn} ${styles.pos2} ${styles.swapField}`}
            >
              <div className={`${styles.lable} ${styles.labelFade}`}>
                Departure Date
              </div>
              <div
                className={`${styles.dateInputWrapper} ${styles.contentFade}`}
              >
                <DateField
                  label={""}
                  placeholder={"ADD DATES"}
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                />
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
                ref={toInputRef}
                type="text"
                className={`${styles.contant} ${styles.contentFade}`}
                placeholder="Destination"
                value={to}
                onFocus={() => setToSuggestionsOpen(true)}
                onClick={() => setToSuggestionsOpen(true)}
                onChange={(e) => {
                  setTo(e.target.value);
                  setToSuggestionsOpen(true);
                }}
              />

              {toSuggestionsOpen && (
                <div ref={toSuggestionRef}>
                  <RecentSearch onSelect={handleToSelect} />
                </div>
              )}
            </div>

            {/* Slot 4: Rooms & Guests */}
            <div
              ref={travellerRef}
              className={`${styles.fromBtn} ${styles.pos4} ${styles.fromBtn2}`}
              onClick={(e) => {
                e.stopPropagation();
                setTravellerOpend((prev) => !prev);
              }}
            >
              <div className={styles.lable}>ROOMS & GUESTS</div>

              <div className={styles.guestSummary}>
                <span className={styles.guestCount}>
                  {`${totalPassengers} Guest${totalPassengers > 1 ? "s" : ""}`}
                </span>

                <ChevronDown
                  className={`${styles.guestChevron} ${
                    travellerOpend ? styles.openChevron : styles.closeChevron
                  }`}
                  size={16}
                  color="#FFFFFF"
                />
              </div>

              <div
                style={{
                  display: travellerOpend ? "block" : "none",
                }}
              >
                <TripTypeProvider>
                  <PassengerClassSelector
                    open={true}
                    setOpen={setTravellerOpend}
                    passengers={passengers}
                    setPassengers={setPassengers}
                    travelClass={travelClass}
                    setTravelClass={setTravelClass}
                  />
                </TripTypeProvider>
              </div>
            </div>

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

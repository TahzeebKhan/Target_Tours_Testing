"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./TourHeroSection.module.css";
import Navbar from "@/app/flights/Navbar";
import DateField from "@/app/home-page/components/homePage/DateField";
import TravellerSelector from "@/app/home-page/components/homePage/TravellerSelector";
import SuggestionBox from "@/app/home-page/components/homePage/SuggestionBox";
import PassengerClassSelector from "@/app/home-page/components/homePage/PassengerClassSelector";
import { ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import HotelDateCalendarModal from "@/app/components/hotelCalendar/HotelDateCalendarModal";
import HotelCalendarMonths from "@/app/components/hotelCalendar/HotelCalendarMonths";
import { CalendarSVG } from "@/app/flights/components/SVGFile";

const TourHeroSection = () => {
  const searchParams = useSearchParams();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState(searchParams.get("city") || "");
  const [departureDate, setDepartureDate] = useState(searchParams.get("checkIn") || "");
  const [guestRoomCount, setGuestRoomCount] = useState("SELECT ROOMS");
  const departureRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const hotelCalendarRef = useRef(null);
  const [showHotelCalendar, setShowHotelCalendar] = useState(false);
  const [hotelStartDate, setHotelStartDate] = useState(
    searchParams.get("checkIn") || ""
  );
  const [hotelEndDate, setHotelEndDate] = useState(
    searchParams.get("checkOut") || ""
  );


  // Ye lines add karein:
  const [travellerOpen, setTravellerOpen] = useState(false);
  const [passengers, setPassengers] = useState({
    adult: 1,
    child: 0,
    infant: 0,
  });

  const [travelClass, setTravelClass] = useState("Economy");

  // Ye line bhi add karein:
  const totalPassengers = passengers.adult + passengers.child + passengers.infant;

  // Truncate function:
  const truncate = (str, maxLength) => {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + "...";
  };


  const fromWrapperRef = useRef(null);
  const fromSuggestionRef = useRef(null);
  const [showFromSuggestion, setShowFromSuggestion] = useState(false);
  const toWrapperRef = useRef(null);
  const toSuggestionRef = useRef(null);

  const [showToSuggestion, setShowToSuggestion] = useState(false);

  const fromSuggestions = [
    {
      label: "New Delhi",
      detail: "India",
      code: "DEL",
    },
    {
      label: "Mumbai",
      detail: "India",
      code: "BOM",
    },
    {
      label: "Toronto",
      detail: "Canada",
      code: "YYZ",
    },
  ];

  const toSuggestions = [
    { label: "Canada", detail: "Country", code: "CA" },
    { label: "United States", detail: "Country", code: "US" },
    { label: "Europe Tour", detail: "Category", code: "EU" },
    { label: "Asia Tour", detail: "Category", code: "ASIA" },
  ];

  const handleFromSelect = (s) => {
    setFrom(s.label);
    setShowFromSuggestion(false);
  };
  const handleToSelect = (s) => {
    setTo(s.label);
    setShowToSuggestion(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        fromWrapperRef.current &&
        !fromWrapperRef.current.contains(e.target)
      ) {
        setShowFromSuggestion(false);
      }

      if (
        toWrapperRef.current &&
        !toWrapperRef.current.contains(e.target)
      ) {
        setShowToSuggestion(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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


  const handleHotelDateClick = (date) => {
    if (!hotelStartDate || hotelEndDate) {
      setHotelStartDate(date);
      setHotelEndDate("");
    } else if (new Date(date) >= new Date(hotelStartDate)) {
      setHotelEndDate(date);
      setShowHotelCalendar(false);
    } else {
      setHotelStartDate(date);
      setHotelEndDate("");
    }
  };

  useEffect(() => {
    if (!showHotelCalendar) return;

    const handleClickOutside = (e) => {
      if (
        hotelCalendarRef.current &&
        !hotelCalendarRef.current.contains(e.target)
      ) {
        setShowHotelCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showHotelCalendar]);


  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date)) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = date
      .toLocaleString("en-US", { month: "short" })
      .toUpperCase();
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
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
            {/* Slot 1: From City */}
            <div
              ref={fromWrapperRef}
              className={`${styles.fromBtn} ${styles.pos1}`}
            >
              <div className={`${styles.lable} ${styles.labelFade}`}>
                WHERE TO
              </div>

              <input
                type="text"
                className={`${styles.contant} ${styles.contentFade}`}
                placeholder="Departure"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setShowFromSuggestion(true);
                }}
                onFocus={() => setShowFromSuggestion(true)}
              />

              {showFromSuggestion && (
                <SuggestionBox
                  boxRef={fromSuggestionRef}
                  heading="RECENT SEARCH"
                  suggestions={fromSuggestions}
                  onSelect={handleFromSelect}
                />
              )}
            </div>



            {/* Slot 2: Departure Date */}
            <div
              className={`${styles.fromBtn} ${styles.pos3} ${styles.swapField}`}
            >
              <div className={`${styles.lable} ${styles.labelFade}`}>
                Check In
              </div>

              {showHotelCalendar && (
                <HotelDateCalendarModal
                  mode="roundtrip"
                  onModeChange={() => { }}
                  onClose={() => setShowHotelCalendar(false)}
                >
                  <div ref={hotelCalendarRef}>
                    <HotelCalendarMonths
                      startDate={hotelStartDate}
                      endDate={hotelEndDate}
                      onDateClick={handleHotelDateClick}
                    />
                  </div>
                </HotelDateCalendarModal>
              )}

              <div
                className={`${styles.dateInputWrapper} ${styles.contentFade}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHotelCalendar(true);
                }}
              >
                <input
                  type="text"
                  readOnly
                  className={styles.contant}
                  placeholder="ADD DATES"
                  value={formatDate(hotelStartDate)}
                />
                <button type="button" className={styles.calendarIcon}>
                  <CalendarSVG />
                </button>
              </div>
            </div>
            <div
              className={`${styles.fromBtn} ${styles.pos2} ${styles.swapField}`}
            >
              <div className={`${styles.lable} ${styles.labelFade}`}>
                Check Out
              </div>

              <div
                className={`${styles.dateInputWrapper} ${styles.contentFade}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHotelCalendar(true);
                }}
              >
                <input
                  type="text"
                  readOnly
                  className={styles.contant}
                  placeholder="ADD DATES"
                  value={formatDate(hotelEndDate)}
                />
                <button type="button" className={styles.calendarIcon}>
                  <CalendarSVG />
                </button>
              </div>
            </div>


            <div
              className={`${styles.fromBtn} ${styles.fromBtn2} ${styles.pos4}`}
              onClick={(e) => {
                e.stopPropagation();
                setTravellerOpen((o) => !o);
              }}
            >
              <div className={styles.lable}>GUESTS & ROOMS</div>
              <div className={styles.iconCont}>
                <div className={styles.contant}>
                  {truncate(`${totalPassengers} Adult${totalPassengers > 1 ? 's' : ''}, ${totalPassengers} Room${totalPassengers > 1 ? 's' : ''}`, 20)}
                </div>

                <ChevronDown
                  className={`${styles.chevron} ${travellerOpen ? styles.openChevron : styles.closeChevron}`}
                  size={20}
                  color="#FFFFFF"
                />
              </div>

              <PassengerClassSelector
                open={travellerOpen}
                setOpen={setTravellerOpen}
                passengers={passengers}
                setPassengers={setPassengers}
                travelClass={travelClass}
                setTravelClass={setTravelClass}
              />
            </div>

            {/* Search Button */}
            <div className={`${styles.searchBtn} ${styles.pos5}`}>
              <img src="/icons/blueSearchIcon.svg" alt="" />
            </div>
          </div>
        </div>

      </div>
      <div className={styles.textcontainer}>
        <p className={styles.para}>Showing Stays in</p>
        <h2 className={styles.heading}>CANADA</h2>
      </div>
    </section>
  );
};

export default TourHeroSection;

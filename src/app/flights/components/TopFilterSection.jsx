"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import styles from "./TopFilterSection.module.css";
// import Switch from "@/app/home-page/components/Switch";
// import TravellerSelector from "@/app/home-page/components/homePage/TravellerSelector";
import { ArrowLeft, ArrowLeftRight, ChevronDown, Pencil } from "lucide-react";
import CustomCheckbox from "@/shared/components/CustomCheckbox";
import PassengerClassSelector from "./PassengerClassSelector";
import { CalendarSVG } from "./SVGFile";
import { useTripType } from "../TripTypeContext";
import DateCalendarModal from "@/shared/components/calendar/DateCalendarModal";
import CalendarMonths from "@/shared/components/calendar/CalendarMonths";
import AirportSuggestionBox from "@/shared/components/airport/AirportSuggestionBox";
import { useRouter } from "next/navigation";
import FlightEditFieldPopup from "@/shared/components/FlightPhoneViewPopup/FlightEditFieldPopup";
import { useDatewiseFare } from "@/features/flights/hooks/useDatewiseFare";
// import calendarSVG from "/icons/calendar.svg";

const travellerOptions = [
  { value: "1_traveller_econ", label: "1 Traveller, Economy" },
  { value: "2_traveller_econ", label: "2 Travellers, Economy" },
  { value: "3_traveller_business", label: "3 Traveller, Business" },
];

const truncate = (str) => {
  return str.length > 10 ? str.slice(0, 10) + "..." : str;
};

const passengerTypes = [
  "REGULAR",
  "SENIOR CITIZEN",
  "STUDENT"
];

const PencilIcon = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_4473_64088)">
        <path
          d="M14.1161 4.54126C14.4686 4.18888 14.6666 3.71091 14.6667 3.2125C14.6668 2.71409 14.4688 2.23607 14.1165 1.8836C13.7641 1.53112 13.2861 1.33307 12.7877 1.33301C12.2893 1.33295 11.8113 1.53088 11.4588 1.88326L2.56145 10.7826C2.40667 10.9369 2.29219 11.1269 2.22812 11.3359L1.34745 14.2373C1.33022 14.2949 1.32892 14.3562 1.34369 14.4145C1.35845 14.4728 1.38873 14.5261 1.43132 14.5686C1.4739 14.6111 1.5272 14.6413 1.58556 14.656C1.64392 14.6706 1.70516 14.6693 1.76279 14.6519L4.66479 13.7719C4.87357 13.7084 5.06357 13.5947 5.21812 13.4406L14.1161 4.54126Z"
          stroke="white"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 3.33337L12.6667 6.00004"
          stroke="white"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4473_64088">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

const TopFilterSection = ({
  isScrolled: parentScrolled = false,
  scrollProgress,
  setIsOpecEditFields,
}) => {
  const calendarRef = useRef(null);
  const [fromSuggestionsOpen, setFromSuggestionsOpen] = useState(false);
  const [toSuggestionsOpen, setToSuggestionsOpen] = useState(false);
  const fromInputRef = useRef(null);
  const fromSuggestionRef = useRef(null);
  const toSuggestionRef = useRef(null);
  const router = useRouter();

  const {
    tripType,
    setTripType,
    from,
    setFrom,
    to,
    setTo,
    fromCode,
    setFromCode,
    toCode,
    setToCode,
    passengers,
    setPassengers,
    travelClass,
    setTravelClass,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleSearch,
    isSearchSubmitting,
    selectedFareTypes,
    setSelectedFareTypes,
  } = useTripType();
  const [openCalendarFor, setOpenCalendarFor] = useState(null);
  const [directOnly, setDirectOnly] = useState(false);
  const isScrolled = parentScrolled || false;
  // const [showCalendar, setShowCalendar] = useState(false);
  const [activeMultiIndex, setActiveMultiIndex] = useState(null);
  const [activeTile, setActiveTile] = useState([]);
  const [dateTiles, setDateTiles] = useState([]);
  const [currentMonth, setCurrentMonth] = useState("");

  // Direction for flight trip-type animation (round / oneway / multi)
  const [flightDirection, setFlightDirection] = useState("right");
  const renderSearchButtonContent = () =>
    isSearchSubmitting ? (
      <span className={styles.searchSpinner}></span>
    ) : (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16.9994 16.2923L20.8536 20.1464C21.0488 20.3417 21.0488 20.6583 20.8536 20.8536C20.6583 21.0488 20.3417 21.0488 20.1464 20.8536L16.2923 16.9994C14.882 18.2445 13.0292 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11C19 13.0292 18.2445 14.882 16.9994 16.2923ZM11 18C14.866 18 18 14.866 18 11C18 7.13401 14.866 4 11 4C7.13401 4 4 7.13401 4 11C4 14.866 7.13401 18 11 18Z"
          fill="#000033"
        />
      </svg>
    );

  const [bookingType, setBookingType] = useState("flight");
  const [multiSegments, setMultiSegments] = useState([
    { from: "", to: "", date: "" },
    { from: "", to: "", date: "" },
  ]);

  const recentSearches = [
    {
      label: "CHENNAI, INDIA",
      detail: "Chennai International Airport, India",
      code: "CEN",
      value: "Chennai (MAA)",
    },
    {
      label: "MUMBAI, INDIA",
      detail: "Mumbai Chhatrapati Shivaji Maharaj International Airport, India",
      code: "BOM",
      value: "Mumbai (BOM)",
    },
    {
      label: "KOLKATA, INDIA",
      detail: "Kolkata Netaji Subhas Chandra Bose International Airport, India",
      code: "CCU",
      value: "Kolkata (CCU)",
    },
    {
      label: "BENGALURU, INDIA",
      detail: "Bengaluru Kempegowda International Airport, India",
      code: "BLR",
      value: "Bengaluru (BLR)",
    },
  ];

  const departureRef = useRef(null);
  const returnRef = useRef(null);
  const multiDateRef1 = useRef(null);
  const multiDateRef0 = useRef(null);

  const [travellerOpen, setTravellerOpen] = useState(false);
  const travellerRef = useRef(null);

  const [calendarTripType, setCalendarTripType] = useState("oneway");
  const { data: datewiseFareData } = useDatewiseFare({
    tripType,
    from,
    to,
    fromCode,
    toCode,
    startDate,
    endDate,
    provider: "both",
    domain: process.env.NEXT_PUBLIC_DOMAIN,
    enabled: true,
  });
  const apiDateTiles = datewiseFareData?.tiles || [];
  const datewiseFaresByDate = datewiseFareData?.faresByDate || {};
  const visibleDateTiles = apiDateTiles.length > 0 ? apiDateTiles : dateTiles;

  const [activeMultiFromIndex, setActiveMultiFromIndex] = useState(null);
  const [activeMultiToIndex, setActiveMultiToIndex] = useState(null);

  const getAirportDisplayValue = (value, code) => {
    const trimmedValue = String(value || "").trim();
    const normalizedCode = String(code || "").trim().toUpperCase();

    if (!trimmedValue) return normalizedCode;
    if (!normalizedCode || trimmedValue.toUpperCase().includes(`(${normalizedCode})`)) {
      return trimmedValue;
    }

    return `${trimmedValue} (${normalizedCode})`;
  };

  const getSuggestionDisplayValue = (suggestion) => {
    if (!suggestion) return "";
    if (typeof suggestion === "string") return suggestion;

    const code = String(suggestion?.iataCode || suggestion?.code || "")
      .trim()
      .toUpperCase();
    const directValue =
      typeof suggestion?.value === "string" ? suggestion.value.trim() : "";

    if (directValue) {
      return getAirportDisplayValue(directValue, code);
    }

    const city =
      typeof suggestion?.city === "string"
        ? suggestion.city.trim()
        : typeof suggestion?.label === "string"
          ? suggestion.label.split(",")[0]?.trim()
          : "";

    if (city && code) return getAirportDisplayValue(city, code);
    if (city) return city;
    if (code) return code;
    return "";
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion, field) => {
    if (suggestion?.route && tripType !== "multi") {
      const route = suggestion.route;
      setFrom(getAirportDisplayValue(route.origin, route.originCode));
      setFromCode(route.originCode || "");
      setTo(getAirportDisplayValue(route.destination, route.destinationCode));
      setToCode(route.destinationCode || "");
      if (route.departureDate) setStartDate(route.departureDate);
      if (route.returnDate) setEndDate(route.returnDate);
      setFromSuggestionsOpen(false);
      setToSuggestionsOpen(false);
      return;
    }

    const value = getSuggestionDisplayValue(suggestion);
    const iataCode = suggestion?.iataCode || suggestion?.code || "";

    if (tripType === "multi") {
      if (field === "from" && activeMultiFromIndex !== null) {
        updateSegment(activeMultiFromIndex, "from", value);
      }
      if (field === "to" && activeMultiToIndex !== null) {
        updateSegment(activeMultiToIndex, "to", value);
      }
    } else {
      if (field === "from") {
        setFrom(value);
        setFromCode(iataCode);
      } else {
        setTo(value);
        setToCode(iataCode);
      }
    }

    setFromSuggestionsOpen(false);
    setToSuggestionsOpen(false);
    setActiveMultiFromIndex(null);
    setActiveMultiToIndex(null);
  };

  const handleDateClick = (date) => {
    // Multi-city logic
    if (tripType === "multi" && activeMultiIndex !== null) {
      setMultiSegments((prev) =>
        prev.map((seg, i) => (i === activeMultiIndex ? { ...seg, date } : seg)),
      );
      setOpenCalendarFor(null); // ✅ Close via state
      setActiveMultiIndex(null);
      return;
    }

    // Oneway logic
    if (calendarTripType === "oneway") {
      setStartDate(date);
      setEndDate(null);
      setOpenCalendarFor(null); // ✅ Close via state
      return;
    }

    // Roundtrip logic
    if (!startDate || endDate) {
      setStartDate(date);
      setEndDate(null);
    } else if (new Date(date) >= new Date(startDate)) {
      setEndDate(date);
      setOpenCalendarFor(null); // ✅ Close via state
    } else {
      setStartDate(date);
      setEndDate(null);
    }
  };

  useEffect(() => {
    if (tripType === "round") {
      setCalendarTripType("round");
    } else {
      setCalendarTripType("oneway");
    }
  }, [tripType]);

  const handleCalendarModeChange = (mode) => {
    const nextTripType = mode === "roundtrip" ? "round" : "oneway";
    setCalendarTripType(nextTripType);
    setTripType(nextTripType);
  };

  const swapLocations = () => {
    setFrom(to);
    setTo(from);
    setFromCode(toCode);
    setToCode(fromCode);
  };

  const updateSegment = (index, field, value) => {
    setMultiSegments((prev) =>
      prev.map((seg, i) => (i === index ? { ...seg, [field]: value } : seg)),
    );
  };

  const openMultiDatePicker1 = () => {
    const input = multiDateRef1.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.focus();
      input.click();
    }
  };

  const openMultiDatePicker0 = () => {
    const input = multiDateRef0.current;
    if (!input) return;
    input.showPicker?.() || input.focus();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (travellerRef.current && !travellerRef.current.contains(e.target)) {
        setTravellerOpen(false);
      }
      if (
        fromSuggestionRef.current &&
        !fromSuggestionRef.current.contains(e.target) &&
        fromInputRef.current &&
        !fromInputRef.current.contains(e.target)
      ) {
        setFromSuggestionsOpen(false);
        setActiveMultiFromIndex(null);
      }

      if (
        toSuggestionRef.current &&
        !toSuggestionRef.current.contains(e.target)
      ) {
        setToSuggestionsOpen(false);
        setActiveMultiToIndex(null);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setTravellerOpen(false);
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

  const toggleType = (type) => {
    setSelectedFareTypes((prev) => (prev.includes(type) ? [] : [type]));
  };

  useEffect(() => {
    if (!openCalendarFor) return;

    const handleClickOutside = (e) => {
      if (e.target.closest('[data-calendar-modal="true"]')) {
        return;
      }

      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setOpenCalendarFor(null);
        setActiveMultiIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openCalendarFor]);

  const tripOrder = ["round", "oneway", "multi"];

  const handleTripTypeChange = (nextType) => {
    const prevIndex = tripOrder.indexOf(tripType);
    const nextIndex = tripOrder.indexOf(nextType);

    if (prevIndex < nextIndex) {
      setFlightDirection("right");
    } else if (prevIndex > nextIndex) {
      setFlightDirection("left");
    }

    setTripType(nextType);
  };

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

  const formatSubTextDate = (dateStr) => {
    if (!dateStr) return "ADD DATES";
    const date = new Date(dateStr);
    if (isNaN(date)) return "ADD DATES";

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  // handlers to open the native date picker (if supported)
  const openDeparturePicker = () => {
    const input = departureRef.current;
    if (!input) return;
    // preferred: showPicker if available
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      // fallback: focus then click (some browsers will open)
      input.focus();
      input.click();
    }
  };
  const toggleTile = (index) => {
    setActiveTile(
      (prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index) // deselect
          : [...prev, index], // select
    );
  };

  const openReturnPicker = () => {
    const input = returnRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.focus();
      input.click();
    }
  };

  // const openRoundTripCalendar = () => {
  //   setCalendarTripType("round");
  //   setShowCalendar(true);
  // };

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY || 0);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const MAX_MARGIN = 76;
  const MIN_PADDING = 16;
  const MAX_PADDING = 20;
  const MAX_MARGIN_BOTTOM = 28;
  const clampedScroll = Math.min(scrollY, MAX_MARGIN);
  const progress = clampedScroll / MAX_MARGIN;

  const marginTop = MAX_MARGIN * (1 - progress);
  const marginBottom = MAX_MARGIN_BOTTOM * (1 - progress);
  const padding = MAX_PADDING - (MAX_PADDING - MIN_PADDING) * progress;

  // const [isOpecEditFields, setIsOpecEditFields] = useState(false);
  // ---------- DATE TILE DATA GENERATOR ----------

  // helpers
  const formatTileDate = (date) =>
    date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });

  useEffect(() => {
    const today = new Date();
    setCurrentMonth(
      today.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    );

    const tiles = [];

    for (let i = 0; i < 40; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const price = Math.floor(Math.random() * (9000 - 4000 + 1)) + 4000;

      tiles.push({
        label: d.toLocaleDateString("en-US", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        }),
        price,
      });
    }

    const prices = tiles.map((t) => t.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    setDateTiles(
      tiles.map((t) => ({
        ...t,
        trend: t.price === min ? "down" : t.price === max ? "up" : "neutral",
      })),
    );
  }, []);

  return (
    <>
      <div
        style={
          {
            // marginTop: scrollProgress === 1 ? `0px` : "",
            // padding: `${padding}px`,
            // marginBottom: `${marginBottom}px`,
            // transition: "none", // 👈 IMPORTANT
          }
        }
        className={`${styles.searchSec} ${
          tripType === "multi" ? styles.isMulti : ""
        }
        ${scrollProgress === 1 ? styles.scrolledSearchSec : ""}
         sticky top-0 flex flex-col gap-[127px] items-center`}
      >
        <div
          className={`${styles.searchPanelWrapper} ${
            bookingType === "holiday" || bookingType === "insurance"
              ? styles.noAnimation
              : ""
          }`}
        >
          {bookingType === "flight" && (
            <div
              className={`${styles.serarchingCont} ${styles.glass_panel}
              ${scrollProgress === 1 ? styles.scrolledSerarchingCont : ""}
              //  ${isScrolled ? styles.scrolledGap : ""}
               
               `}
            >
              <div className={styles.serarchingContTop}>
                <div className={styles.tripTypeWrapper}>
                  <label
                    className={`${styles.tripOption} ${
                      tripType === "oneway" ? styles.active : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="tripType"
                      value="oneway"
                      checked={tripType === "oneway"}
                      onChange={() => handleTripTypeChange("oneway")}
                    />
                    <span className={styles.customRadio}></span>
                    <span className={styles.labelText}>ONE WAY</span>
                  </label>

                  <label
                    className={`${styles.tripOption} ${
                      tripType === "round" ? styles.active : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="tripType"
                      value="round"
                      checked={tripType === "round"}
                      onChange={() => handleTripTypeChange("round")}
                    />
                    <span className={styles.customRadio}></span>
                    <span className={styles.labelText}>ROUND TRIP</span>
                  </label>

                  <label
                    className={`${styles.tripOption} ${
                      tripType === "multi" ? styles.active : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="tripType"
                      value="multi"
                      checked={tripType === "multi"}
                      onChange={() => handleTripTypeChange("multi")}
                    />
                    <span className={styles.customRadio}></span>
                    <span className={styles.labelText}>MULTI CITY</span>
                  </label>
                </div>

                {/* <div className={styles.serarchingContTop_right}>
                  <Switch
                    checked={directOnly}
                    onChange={setDirectOnly}
                    label="DIRECT FLIGHTS ONLY"
                  />
                </div> */}
              </div>
              {/* Flight trip-type forms (round / oneway / multi) with smart-animate style transition */}
              <div className={styles.flightSearchFormContainer}>
                {/* Unified One-way, Round-trip, and Multi-city (first row) form */}
                {(tripType === "oneway" ||
                  tripType === "round" ||
                  tripType === "multi") && (
                  <div
                    className={`${styles.serarchingContBottom} ${
                      styles.flightSearchFormWrapper
                    } ${styles.formVisible} ${
                      tripType === "round"
                        ? styles.roundTripSerarchingContBottom
                        : ""
                    }
                     
                      `}
                  >
                    <div
                      className={`${styles.fromBtn} ${styles.fromBtn2} ${
                        tripType === "oneway" || tripType === "multi"
                          ? styles.growRight
                          : ""
                      } ${tripType === "round" ? styles.roundTripBtn : ""}`}
                    >
                      <div className={styles.lable}>From</div>
                      <input
                        ref={fromInputRef}
                        type="text"
                        className={styles.contant}
                        placeholder="Departure"
                        value={
                          tripType === "multi" ? multiSegments[0].from : from
                        }
                        onFocus={() => {
                          setFromSuggestionsOpen(true);
                          if (tripType === "multi") setActiveMultiFromIndex(0);
                        }}
                        onClick={() => {
                          setFromSuggestionsOpen(true);
                          if (tripType === "multi") setActiveMultiFromIndex(0);
                        }}
                        onChange={(e) => {
                          if (tripType === "multi") {
                            updateSegment(0, "from", e.target.value);
                            setActiveMultiFromIndex(0);
                          } else {
                            setFrom(e.target.value);
                            setFromCode("");
                          }
                          setFromSuggestionsOpen(true);
                        }}
                      />

                      {fromSuggestionsOpen &&
                        (tripType !== "multi" ||
                          activeMultiFromIndex === 0) && (
                          <AirportSuggestionBox
                            boxRef={fromSuggestionRef}
                            query={
                              tripType === "multi"
                                ? multiSegments[0].from
                                : from
                            }
                            fallbackSuggestions={recentSearches}
                            field="from"
                            onSelect={(s) => selectSuggestion(s, "from")}
                          />
                        )}
                    </div>
                    <div
                      className={`${styles.arrowbox} ${
                        tripType === "round" ? styles.arrowbox2 : ""
                      } ${tripType === "multi" ? styles.arrowbox3 : ""}
                      ${
                        tripType === "multi" ? styles.multiCityArrowBoxTop : ""
                      }`}
                      onClick={() => {
                        if (tripType === "multi") {
                          const { from, to } = multiSegments[0];
                          updateSegment(0, "from", to);
                          updateSegment(0, "to", from);
                        } else {
                          swapLocations();
                        }
                      }}
                    >
                      <ArrowLeftRight size={16} className={styles.arrowIcon} />
                    </div>
                    <div
                      className={`${styles.fromBtn} ${styles.fromBtn2} ${
                        styles.toBtn
                      } ${
                        tripType === "oneway" || tripType === "multi"
                          ? styles.growRight
                          : ""
                      } ${tripType === "round" ? styles.roundTripBtn : ""}`}
                    >
                      <div className={styles.lable}>To</div>
                      <input
                        type="text"
                        className={styles.contant}
                        placeholder="Destination"
                        value={tripType === "multi" ? multiSegments[0].to : to}
                        onFocus={() => {
                          setToSuggestionsOpen(true);
                          setActiveMultiToIndex(0);
                        }}
                        onClick={() => {
                          setToSuggestionsOpen(true);
                          setActiveMultiToIndex(0);
                        }}
                        onChange={(e) => {
                          if (tripType === "multi") {
                            updateSegment(0, "to", e.target.value);
                            setActiveMultiToIndex(0);
                          } else {
                            setTo(e.target.value);
                            setToCode("");
                          }
                          setToSuggestionsOpen(true);
                        }}
                      />

                      {toSuggestionsOpen && activeMultiToIndex === 0 && (
                        <AirportSuggestionBox
                          boxRef={toSuggestionRef}
                          query={
                            tripType === "multi" ? multiSegments[0].to : to
                          }
                          fallbackSuggestions={recentSearches}
                          field="to"
                          onSelect={(s) => selectSuggestion(s, "to")}
                        />
                      )}
                    </div>

                    <div
                      className={`${styles.fromBtn} ${styles.fromBtn2} ${
                        tripType === "oneway" || tripType === "multi"
                          ? styles.growRight
                          : ""
                      } ${styles.calendarAnchor} ${
                        tripType === "round" ? styles.roundTripBtn : ""
                      }`}
                    >
                      <div className={styles.lable}>Departure Date</div>
                      {openCalendarFor === "main" && (
                        <DateCalendarModal
                          mode={
                            calendarTripType === "round"
                              ? "roundtrip"
                              : "oneway"
                          }
                          onModeChange={handleCalendarModeChange}
                          onClose={() => {
                            setOpenCalendarFor(null);
                            setActiveMultiIndex(null);
                          }}
                        >
                          <div ref={calendarRef}>
                            <CalendarMonths
                              startDate={startDate}
                              endDate={endDate}
                              onDateClick={handleDateClick}
                              price={true}
                              faresByDate={datewiseFaresByDate}
                            />
                          </div>
                        </DateCalendarModal>
                      )}
                      <div
                        className={styles.dateInputWrapper}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCalendarTripType(
                            tripType === "round" ? "round" : "oneway",
                          );
                          setActiveMultiIndex(tripType === "multi" ? 0 : null);
                          setOpenCalendarFor("main"); // ✅ Trigger specific calendar
                        }}
                      >
                        <input
                          type="text"
                          readOnly
                          className={styles.contant}
                          placeholder="ADD DATE"
                          value={
                            tripType === "multi"
                              ? formatDate(multiSegments[0].date)
                              : formatDate(startDate) || ""
                          }
                        />

                        <button type="button" className={styles.calendarIcon}>
                          <CalendarSVG />
                        </button>
                      </div>
                    </div>

                    {/* Return Date - conditionally hidden with CSS */}
                    <div
                      className={`${styles.fromBtn} ${styles.fromBtn2} ${
                        styles.returnDateField
                      } ${
                        tripType === "oneway" || tripType === "multi"
                          ? styles.hiddenField
                          : ""
                      } ${tripType === "round" ? styles.roundTripBtn : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCalendarTripType("round");
                        setActiveMultiIndex(null);
                        setOpenCalendarFor("main");
                      }}
                    >
                      <div className={styles.lable}>Return Date</div>

                      <div className={styles.dateInputWrapper}>
                        <input
                          type="text"
                          readOnly
                          className={styles.contant}
                          placeholder="ADD DATE"
                          value={formatDate(endDate) || ""}
                        />

                        <button type="button" className={styles.calendarIcon}>
                          <CalendarSVG />
                        </button>
                      </div>
                    </div>

                    <div
                      className={`${styles.fromBtn} ${styles.fromBtn2} ${
                        tripType === "oneway" || tripType === "multi"
                          ? styles.growRight
                          : ""
                      } ${tripType === "round" ? styles.roundTripBtn : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTravellerOpen((o) => !o);
                      }}
                    >
                      <div className={styles.lable}>Travellers & Class</div>
                      <div className={styles.iconCont}>
                        <div
                          className={`${styles.contant} ${styles.contantTra}`}
                        >
                          {passengers.adult +
                            passengers.child +
                            passengers.infant}{" "}
                          Traveller(s), {travelClass}
                        </div>

                        <ChevronDown
                          className={`${styles.chevron} ${
                            travellerOpen
                              ? styles.openChevron
                              : styles.closeChevron
                          }`}
                          size={16}
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

                    {tripType !== "multi" && (
                      <div
                        className={`${styles.searchBtn} ${
                          isSearchSubmitting ? styles.searchBtnLoading : ""
                        }`}
                        onClick={handleSearch}
                        aria-disabled={isSearchSubmitting}
                      >
                        {renderSearchButtonContent()}
                      </div>
                    )}
                  </div>
                )}

                {/* Multi-city form - Additional Rows */}
                {tripType === "multi" && (
                  <>
                    <div
                      className={`${styles.serarchingContBottom} ${styles.multiSearch} ${styles.flightSearchFormWrapper} ${styles.formVisible}`}
                      style={{ pointerEvents: "none" }}
                    >
                      {/* First row is now handled by the unified block above. 
                          We use paddingTop to space the second row. */}

                      <div
                        className={`${styles.serarchingContBottom} ${
                          styles.bottomRowAnimate
                        } ${
                          tripType === "multi"
                            ? styles.animateIn
                            : styles.animateOut
                        }
                        
                         ${
                           tripType === "multi"
                             ? styles.multiCitySerarchingContBottom
                             : ""
                         }`}
                        style={{ pointerEvents: "auto" }}
                      >
                        <div
                          className={`${styles.fromBtn} ${styles.fromBtn3} ${styles.bottomRowFirstBtn}`}
                        >
                          <div className={styles.lable}>From</div>
                          <input
                            ref={fromInputRef}
                            type="text"
                            className={styles.contant}
                            placeholder="Departure"
                            value={multiSegments[1].from}
                            onFocus={() => {
                              setFromSuggestionsOpen(true);
                              setActiveMultiFromIndex(1);
                            }}
                            onClick={() => {
                              setFromSuggestionsOpen(true);
                              setActiveMultiFromIndex(1);
                            }}
                            onChange={(e) => {
                              updateSegment(1, "from", e.target.value);
                              setFromSuggestionsOpen(true);
                              setActiveMultiFromIndex(1);
                            }}
                          />

                          {fromSuggestionsOpen &&
                            activeMultiFromIndex === 1 && (
                              <AirportSuggestionBox
                                boxRef={fromSuggestionRef}
                                query={multiSegments[1].from}
                                fallbackSuggestions={recentSearches}
                                field="from"
                                onSelect={(s) => selectSuggestion(s, "from")}
                              />
                            )}

                          <div
                            className={`${styles.arrowbox} ${styles.arrowbox3} ${styles.arrowboxBottomRow} `}
                            onClick={() => {
                              const { from, to } = multiSegments[1];
                              updateSegment(1, "from", to);
                              updateSegment(1, "to", from);
                            }}
                          >
                            <ArrowLeftRight
                              size={16}
                              className={styles.arrowIcon}
                            />
                          </div>
                        </div>

                        <div
                          style={{ zIndex: "-999" }}
                          className={`${styles.fromBtn} ${styles.fromBtn3} ${styles.toBtn}`}
                        >
                          <div className={styles.lable}>To</div>
                          <input
                            type="text"
                            className={styles.contant}
                            placeholder="Destination"
                            value={multiSegments[1].to}
                            onFocus={() => {
                              setToSuggestionsOpen(true);
                              setActiveMultiToIndex(1);
                            }}
                            onClick={() => {
                              setToSuggestionsOpen(true);
                              setActiveMultiToIndex(1);
                            }}
                            onChange={(e) => {
                              updateSegment(1, "to", e.target.value);
                              setToSuggestionsOpen(true);
                              setActiveMultiToIndex(1);
                            }}
                          />

                          {toSuggestionsOpen && activeMultiToIndex === 1 && (
                            <AirportSuggestionBox
                              boxRef={toSuggestionRef}
                              query={multiSegments[1].to}
                              fallbackSuggestions={recentSearches}
                              field="to"
                              onSelect={(s) => selectSuggestion(s, "to")}
                            />
                          )}
                        </div>

                        <div className={`${styles.fromBtn} ${styles.fromBtn3}`}>
                          <div className={styles.lable}>Departure Date</div>
                          {openCalendarFor === "multi-1" && (
                            <DateCalendarModal
                              mode="oneway"
                              onClose={() => {
                                setOpenCalendarFor(null);
                                setActiveMultiIndex(null);
                              }}
                            >
                              <div ref={calendarRef}>
                                <CalendarMonths
                                  startDate={null}
                                  endDate={null}
                                  onDateClick={handleDateClick}
                                  price={true}
                                  faresByDate={datewiseFaresByDate}
                                />
                              </div>
                            </DateCalendarModal>
                          )}

                          <div
                            className={styles.dateInputWrapper}
                            onClick={() => {
                              setCalendarTripType("oneway");
                              setActiveMultiIndex(1);
                              setOpenCalendarFor("multi-1");
                            }}
                          >
                            <input
                              type="text"
                              readOnly
                              className={styles.contant}
                              placeholder="ADD DATE"
                              value={formatDate(multiSegments[1].date)}
                            />
                            <button
                              type="button"
                              aria-label="Open departure date picker"
                              className={styles.calendarIcon}
                              onClick={openMultiDatePicker0}
                            >
                              {/* SAME SVG – unchanged */}
                              <CalendarSVG />
                            </button>
                          </div>
                        </div>
                        <div
                          className={`${styles.searchBtn} ${
                            isSearchSubmitting ? styles.searchBtnLoading : ""
                          }`}
                          onClick={handleSearch}
                          aria-disabled={isSearchSubmitting}
                        >
                          {renderSearchButtonContent()}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className={styles.passengerTypeRow}>
                {passengerTypes.map((type) => (
                  <CustomCheckbox
                    key={type}
                    label={type}
                    checked={selectedFareTypes.includes(type)}
                    onChange={() => toggleType(type)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className={styles.MobileTopFilterSection}>
            <div className={styles.topDetails}>
              {/* Left: Back Arrow */}

              <div
                onClick={() => {
                  router.push("/");
                }}
                className={styles.leftIcon}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.9203 7.30135H2.48481L6.48039 3.30577C6.72862 3.05754 6.72862 2.65632 6.48039 2.4081C6.23201 2.15987 5.83079 2.15987 5.58256 2.4081L0.50325 7.4868C0.444736 7.54577 0.398412 7.61632 0.366107 7.69373C0.301955 7.8487 0.301955 8.02394 0.366107 8.17891C0.398412 8.25632 0.444736 8.32672 0.50325 8.38585L5.58256 13.4646C5.7063 13.5884 5.86889 13.6506 6.03148 13.6506C6.19392 13.6506 6.35651 13.5884 6.48039 13.4646C6.72862 13.2163 6.72862 12.8151 6.48039 12.5667L2.48481 8.57129H14.9203C15.2708 8.57129 15.5553 8.2868 15.5553 7.93632C15.5553 7.58585 15.2708 7.30135 14.9203 7.30135Z"
                    fill="white"
                  />
                </svg>
              </div>

              {/* Middle: Content */}
              <div className={styles.middleContent}>
                <div className={styles.routeText}>
                  <span>{from || "Departure"}</span>
                  <span>-</span>
                  <span>{to || "Destination"}</span>
                </div>
                <div className={styles.subText}>
                  {formatSubTextDate(startDate)} •{" "}
                  {passengers.adult +
                    (passengers.child || 0) +
                    passengers.infant}{" "}
                  Traveller • {travelClass}
                </div>
              </div>

              {/* Right: Edit Icon */}
              <div
                className={styles.rightIcon}
                onClick={() => setIsOpecEditFields(true)}
              >
                <PencilIcon />
              </div>
            </div>

            <div className={styles.datesContainer}>
              <div className={styles.datesScrollerWrapper}>
                {/* Month badge */}
                <div className={styles.monthBadge}>{currentMonth}</div>
                {/* Scrollable dates */}
                {visibleDateTiles.length > 0 && (
                  <div className={styles.datesScroller}>
                    {visibleDateTiles.map((item, i) => (
                      <div
                        key={i}
                        className={`${styles.dateTile} ${
                          activeTile.includes(i) ? styles.activeTile : ""
                        }`}
                        onClick={() => toggleTile(i)}
                      >
                        <div className={styles.dateLabel}>{item.label}</div>

                        <div
                          className={`${styles.price} ${
                            item.trend === "up"
                              ? styles.priceUp
                              : item.trend === "down"
                                ? styles.priceDown
                                : ""
                          }`}
                        >
                          ₹ {item.price.toLocaleString("en-IN")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* {isOpecEditFields && (
                <FlightEditFieldPopup />
              )} */}
      </div>
    </>
  );
};

export default TopFilterSection;

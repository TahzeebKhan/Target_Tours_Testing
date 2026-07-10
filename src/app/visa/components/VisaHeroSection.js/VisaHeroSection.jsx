"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./VisaHeroSection.module.css";
import Navbar from "@/app/flights/Navbar";
import DestinationFilter from "../dateField/tabsFilters/DestinationFilter";
import TravellerFilter from "../dateField/tabsFilters/TravellerFilter";
import PreferencesFilter from "../dateField/tabsFilters/PreferencesFilter";
import SuggestionBox from "@/app/home-page/components/homePage/SuggestionBox";
import { ChevronDown } from "lucide-react";
import DateField from "../dateField/DateField";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchHolidayPackageSuggestions } from "@/shared/services/tourPackage";
import TourGuestSelector from "./TourGuestSelector";

const DEFAULT_HERO = {
  video: "/videos/visa.mp4",
  heading: "Your visa, sorted — for any destination.",
  subHeading: "One platform for every visa category: pure e-visas, visa on arrival, ETAs, embassy interviews, and biometrics-at-VFS. ",
};

const normalizeHolidaySuggestions = (payload) => {
  const source =
    payload?.data?.suggestions ||
    payload?.data ||
    payload?.suggestions ||
    payload ||
    [];

  if (!Array.isArray(source)) return [];

  return source
    .map((item, index) => {
      const label =
        item?.label ||
        item?.name ||
        item?.city ||
        item?.country ||
        item?.title ||
        item?.value ||
        "";
      const detail =
        item?.detail ||
        item?.description ||
        item?.country ||
        item?.category ||
        "";
      const code =
        item?.code || item?.iata_code || item?.iataCode || item?.type || "";

      return {
        id: item?.id || item?.documentId || `${label}-${index}`,
        label,
        detail,
        code,
        value: item?.value || label,
        raw: item,
      };
    })
    .filter((item) => item.label || item.value);
};

const getSuggestionValue = (suggestion) =>
  suggestion?.value || suggestion?.label || "";

const VisaHeroSection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");
  const [departureDate, setDepartureDate] = useState(
    searchParams.get("date") || "",
  );
  const [guestRoomCount, setGuestRoomCount] = useState("CHECK ROOMS");

  const departureRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const [travellerOpend, setTravellerOpend] = useState(false);
  const travellerRef = useRef(null);
  const [passengers, setPassengers] = useState({
    room: Number(searchParams.get("rooms") || 1),
    adult: Number(searchParams.get("adults") || 1),
    child: Number(searchParams.get("children") || 0),
  });

  const heroContent = DEFAULT_HERO;

  const totalPassengers = passengers.adult + passengers.child;
  const totalRooms = Number(passengers.room || 1);

  useEffect(() => {
    if (!travellerOpend) return;

    const handleClickOutside = (event) => {
      if (travellerRef.current && !travellerRef.current.contains(event.target)) {
        setTravellerOpend(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setTravellerOpend(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [travellerOpend]);

  const [fromSuggestionsOpen, setFromSuggestionsOpen] = useState(false);
  const [toSuggestionsOpen, setToSuggestionsOpen] = useState(false);
  const [debouncedFromSuggestionQuery, setDebouncedFromSuggestionQuery] = useState("");
  const [debouncedToSuggestionQuery, setDebouncedToSuggestionQuery] = useState("");

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const fromSuggestionRef = useRef(null);
  const toSuggestionRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedFromSuggestionQuery(from.trim());
      setDebouncedToSuggestionQuery(to.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [from, to]);

  const { data: fromSuggestionResponse } = useQuery({
    queryKey: [
      "tour-list-package-suggestions",
      "from",
      debouncedFromSuggestionQuery,
      process.env.NEXT_PUBLIC_DOMAIN,
    ],
    queryFn: () =>
      fetchHolidayPackageSuggestions({
        term: debouncedFromSuggestionQuery,
        type: "from",
      }),
    enabled: fromSuggestionsOpen && debouncedFromSuggestionQuery.length >= 2,
    staleTime: 1000 * 60 * 5,
  });

  const { data: toSuggestionResponse } = useQuery({
    queryKey: [
      "tour-list-package-suggestions",
      "to",
      debouncedToSuggestionQuery,
      process.env.NEXT_PUBLIC_DOMAIN,
    ],
    queryFn: () =>
      fetchHolidayPackageSuggestions({
        term: debouncedToSuggestionQuery,
        type: "to",
      }),
    enabled: toSuggestionsOpen && debouncedToSuggestionQuery.length >= 2,
    staleTime: 1000 * 60 * 5,
  });

  const fromSuggestions = normalizeHolidaySuggestions(fromSuggestionResponse);
  const toSuggestions = normalizeHolidaySuggestions(toSuggestionResponse);

  const handleFromSelect = (suggestion) => {
    setFrom(getSuggestionValue(suggestion));
    setFromSuggestionsOpen(false);
    fromInputRef.current?.focus();
  };

  const handleToSelect = (suggestion) => {
    setTo(getSuggestionValue(suggestion));
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
  const tabContainerRef = useRef(null);


  useEffect(() => {
    if (!activeTab) return;

    const handleClickOutside = (e) => {
      if (
        tabContainerRef.current &&
        !tabContainerRef.current.contains(e.target)
      ) {
        setActiveTab("");
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setActiveTab("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [activeTab]);


  const handleFieldClick = (e) => {
    const target = e.currentTarget;
    // const input = target.querySelector("input");

    if (!input) return;

    // Check if it's a date input
    if (input.type === "date" && typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      // For text inputs, just focus
      input.focus();
    }
  };

  const handleSearch = () => {
    const nextParams = new URLSearchParams(searchParams?.toString() || "");

    if (from) {
      nextParams.set("from", from);
    } else {
      nextParams.delete("from");
    }

    if (to) {
      nextParams.set("to", to);
    } else {
      nextParams.delete("to");
    }

    if (departureDate) {
      nextParams.set("date", departureDate);
    } else {
      nextParams.delete("date");
    }

    nextParams.set("rooms", String(totalRooms));
    nextParams.set("adults", String(passengers.adult));
    nextParams.set("children", String(passengers.child));

    router.push(`/tour-list?${nextParams.toString()}`);
  };

  const handleDestinationApply = ({ countries = [] } = {}) => {
    const nextParams = new URLSearchParams(searchParams?.toString() || "");
    const selectedCountry = Array.isArray(countries)
      ? countries.filter(Boolean).join(",")
      : "";

    if (selectedCountry) {
      nextParams.set("country", selectedCountry);
    } else {
      nextParams.delete("country");
    }

    setActiveTab("");
    router.push(`/tour-list?${nextParams.toString()}`);
  };

  const handlePreferencesApply = (selectedPrefs = []) => {
    const nextParams = new URLSearchParams(searchParams?.toString() || "");
    const selectedThemes = Array.isArray(selectedPrefs)
      ? selectedPrefs.filter(Boolean).join(",")
      : "";

    if (selectedThemes) {
      nextParams.set("themes", selectedThemes);
    } else {
      nextParams.delete("themes");
    }

    setActiveTab("");
    router.push(`/tour-list?${nextParams.toString()}`);
  };

  const handleTravellerApply = (selectedProfiles = []) => {
    const nextParams = new URLSearchParams(searchParams?.toString() || "");
    const selectedPackageTypes = Array.isArray(selectedProfiles)
      ? selectedProfiles.filter(Boolean).join(",")
      : "";

    if (selectedPackageTypes) {
      nextParams.set("package_type", selectedPackageTypes);
    } else {
      nextParams.delete("package_type");
    }

    setActiveTab("");
    router.push(`/tour-list?${nextParams.toString()}`);
  };

  return (
    <section className={styles.tourHeroSection}>
      <video
        className={styles.heroVideo}
        src={heroContent?.video || DEFAULT_HERO.video}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
      <div className={styles.overlay}></div>
      <div className={styles.heroNav}>
        <Navbar scrollProgress={scrollProgress} />
      </div>
      <div className={styles.container}>
        <div className={styles.containerChild}>


    <div className={styles.textcontainer}>
          <h2 className={styles.heading}>{heroContent.heading}</h2>
          <p className={styles.para}>{heroContent.subHeading}</p>
          
        </div>

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
                // onFocus={() => setFromSuggestionsOpen(true)}
                // onClick={() => setFromSuggestionsOpen(true)}
                // onChange={(e) => {
                //   setFrom(e.target.value);
                //   setFromSuggestionsOpen(true);
                // }}
              />

              {fromSuggestionsOpen && (
                <SuggestionBox
                  boxRef={fromSuggestionRef}
                  heading="PACKAGE SUGGESTIONS"
                  suggestions={fromSuggestions}
                  onSelect={handleFromSelect}
                />
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
                // onFocus={() => setToSuggestionsOpen(true)}
                // onClick={() => setToSuggestionsOpen(true)}
                // onChange={(e) => {
                //   setTo(e.target.value);
                //   setToSuggestionsOpen(true);
                // }}
              />

              {toSuggestionsOpen && (
                <SuggestionBox
                  boxRef={toSuggestionRef}
                  heading="PACKAGE SUGGESTIONS"
                  suggestions={toSuggestions}
                  onSelect={handleToSelect}
                />
              )}
            </div>

            {/* Slot 4: Rooms & Guests */}
            <div
              ref={travellerRef}
              className={`${styles.fromBtn} ${styles.pos4} ${styles.fromBtn2}`}
              onClick={(event) => {
                event.stopPropagation();
                setTravellerOpend((current) => !current);
              }}
            >
              <div className={styles.lable}>ROOMS & GUESTS</div>

              <div className={styles.guestSummary}>
                <span className={styles.guestCount}>
                  {`${totalRooms} Room${totalRooms > 1 ? "s" : ""}, ${totalPassengers} Guest${totalPassengers > 1 ? "s" : ""}`}
                </span>
                <ChevronDown
                  className={`${styles.guestChevron} ${
                    travellerOpend ? styles.openChevron : styles.closeChevron
                  }`}
                  size={16}
                  color="#FFFFFF"
                />
              </div>

              <TourGuestSelector
                open={travellerOpend}
                setOpen={setTravellerOpend}
                passengers={passengers}
                setPassengers={setPassengers}
              />
            </div>

            {/* Search Button */}
            <div
              className={`${styles.searchBtn} ${styles.pos5}`}
              // onClick={handleSearch}
            >
              <img src="/icons/blueSearchIcon.svg" alt="" />
            </div>
          </div>
        </div>


    
        <div className={styles.CountryTabContainer}>
          <div className={`${styles.ActiveCountryTab} ${styles.CountryTab}`}>  
            All Country

          </div>
          <div  className={styles.CountryTab}>
            China
          </div>
          <div  className={styles.CountryTab}>
            China
          </div>

        </div>
                </div>
      </div>

      {/* <div className={styles.tabContainer} ref={tabContainerRef}>
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
          {activeTab === "destination" && (
            <DestinationFilter onApply={handleDestinationApply} />
          )}
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
          {activeTab === "traveler" && (
            <TravellerFilter onApply={handleTravellerApply} />
          )}
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
          {activeTab === "preferences" && (
            <PreferencesFilter onApply={handlePreferencesApply} />
          )}
        </div>
      </div> */}
    </section>
  );
};

export default VisaHeroSection;

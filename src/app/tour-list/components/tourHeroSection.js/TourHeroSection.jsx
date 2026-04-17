"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./TourHeroSection.module.css";
import Navbar from "@/app/flights/Navbar";
import DestinationFilter from "../tabsFilters/DestinationFilter";
import TravellerFilter from "../tabsFilters/TravellerFilter";
import PreferencesFilter from "../tabsFilters/PreferencesFilter";
import SuggestionBox from "@/app/home-page/components/homePage/SuggestionBox";
import { ChevronDown } from "lucide-react";
import DateField from "../dateField/DateField";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPublicBanner } from "@/shared/services/heroApi";
import { fetchHolidayPackageSuggestions } from "@/shared/services/tourPackage";
import TourGuestSelector from "./TourGuestSelector";

const DEFAULT_HERO = {
  image: "/images/tourHeroImage.png",
  heading: "N/A",
  subHeading: "Discover the destination",
};

const getBannerRecord = (response) => {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload[0] || {};
  if (Array.isArray(payload?.data)) return payload.data[0] || {};
  return payload || {};
};

const getLocationNameFromSearchValue = (value = "") =>
  String(value || "")
    .split(",")[0]
    ?.trim() || "";

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

const resolveBannerImage = (record) => {
  const candidate =
    record?.location?.banner_image?.url ||
    record?.location?.image?.url ||
    record?.media?.url ||
    record?.image?.url ||
    record?.banner_image?.url ||
    record?.background_image?.url ||
    record?.url ||
    record?.location?.banner_image ||
    record?.location?.image ||
    record?.image ||
    record?.banner_image ||
    record?.background_image ||
    "";

  if (!candidate) return DEFAULT_HERO.image;
  if (/^https?:\/\//i.test(candidate)) return candidate;
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}${candidate}`;
};

const TourHeroSection = () => {
  const router = useRouter();
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

  const [heroContent, setHeroContent] = useState(DEFAULT_HERO);
  const [heroBackgroundImage, setHeroBackgroundImage] = useState(
    DEFAULT_HERO.image
  );
  const bannerLocationName =
    getLocationNameFromSearchValue(searchParams.get("to")) || "Ottawa";

  const totalPassengers =
    passengers.adult + passengers.child + passengers.infant;

  const { data: publicBannerResponse } = useQuery({
    queryKey: ["tour-public-banner", bannerLocationName],
    queryFn: () => getPublicBanner(bannerLocationName),
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (!publicBannerResponse) return;

    const banner = getBannerRecord(publicBannerResponse);
    setHeroContent({
      image: resolveBannerImage(banner),
      heading:
        banner?.location?.name ||
        banner?.heading ||
        banner?.title ||
        banner?.name ||
        banner?.location_name ||
        DEFAULT_HERO.heading,
      subHeading: DEFAULT_HERO.subHeading,
    });
  }, [publicBannerResponse]);

  useEffect(() => {
    const imageUrl = heroContent?.image || DEFAULT_HERO.image;

    if (imageUrl === DEFAULT_HERO.image) {
      setHeroBackgroundImage(DEFAULT_HERO.image);
      return;
    }

    const img = new Image();
    img.onload = () => setHeroBackgroundImage(imageUrl);
    img.onerror = () => setHeroBackgroundImage(DEFAULT_HERO.image);
    img.src = imageUrl;
  }, [heroContent?.image]);

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

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const fromSuggestionRef = useRef(null);
  const toSuggestionRef = useRef(null);

  const { data: fromSuggestionResponse } = useQuery({
    queryKey: [
      "tour-list-package-suggestions",
      "from",
      from,
      process.env.NEXT_PUBLIC_DOMAIN,
    ],
    queryFn: () =>
      fetchHolidayPackageSuggestions({
        term: from,
        type: "from",
      }),
    enabled: fromSuggestionsOpen && from.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const { data: toSuggestionResponse } = useQuery({
    queryKey: [
      "tour-list-package-suggestions",
      "to",
      to,
      process.env.NEXT_PUBLIC_DOMAIN,
    ],
    queryFn: () =>
      fetchHolidayPackageSuggestions({
        term: to,
        type: "to",
      }),
    enabled: toSuggestionsOpen && to.trim().length > 0,
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
  const travellerOptions = [
    { value: "1_room_2_adult", label: "1 Room, 2 Adults" },
    { value: "2_room_4_adult", label: "2 Rooms, 4 Adults" },
  ];

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
    <section
      className={styles.tourHeroSection}
      style={{ backgroundImage: `url("${heroBackgroundImage}")` }}
    >
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
                onFocus={() => setToSuggestionsOpen(true)}
                onClick={() => setToSuggestionsOpen(true)}
                onChange={(e) => {
                  setTo(e.target.value);
                  setToSuggestionsOpen(true);
                }}
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
              onClick={handleSearch}
            >
              <img src="/icons/blueSearchIcon.svg" alt="" />
            </div>
          </div>
        </div>
        <div className={styles.textcontainer}>
          <p className={styles.para}>{heroContent.subHeading}</p>
          <h2 className={styles.heading}>{heroContent.heading}</h2>
        </div>
      </div>

      <div className={styles.tabContainer} ref={tabContainerRef}>
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
      </div>
    </section>
  );
};

export default TourHeroSection;

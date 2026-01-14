"use client";
import styles from "./HomePage.module.css";
import Switch from "../Switch";
import { useState, useRef, useEffect } from "react";
import TravellerSelector from "./TravellerSelector";
import Navbar from "../../../flights/Navbar";
import Link from "next/link";
import DateField from "./DateField";
import { ArrowLeftRight, ChevronDown } from "lucide-react";
import PassengerClassSelector from "./PassengerClassSelector";
import SuggestionBox from "./SuggestionBox";
import { CalendarSVG } from "@/app/flights/components/SVGFile";
import DateCalendarModal from "./calendar/DateCalendarModal";
import CalendarMonths from "./calendar/CalendarMonths";
import HotelDropDown from "@/app/components/hotelDropDown/HotelDropDown";
import HotelDateCalendarModal from "@/app/components/hotelCalendar/HotelDateCalendarModal";
import HotelCalendarMonths from "@/app/components/hotelCalendar/HotelCalendarMonths";
import RecentSearch from "@/app/components/recentSearch/RecentSearch";

import LoginPopup from "@/app/account/loginPopUp/LoginPopup";
import SignupPopup from "@/app/account/signUpPopUp/SignupPopup";

import FlightSearchMobile from "./flightSearchMobile/FlightSearchMobile";
import HotelSearchMobile from "./hotelSearchMobile/HotelSearchMobile";
import HolidaySearchMobile from "./holidaySearchMobile/HolidaySearchMobile";
import InsuranceSearchMobile from "./insuranceSearchMobile/InsuranceSearchMobile";
// import Cookies from "js-cookie";
import ProfileModal from "./modals/ProfileModal";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/profile/context/AuthContext";
import Cookies from "js-cookie";

const HomePage = () => {
  const [directOnly, setDirectOnly] = useState(true);
  const [tripType, setTripType] = useState("round");
  const [bookingType, setBookingType] = useState("flight");
  const [menuOpen, setMenuOpen] = useState(false);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturenDate] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [heroData, setHeroData] = useState({
    heading: "",
    description: "",
    videoUrl: "/videos/hero.mp4"
  });

  // refs for the date inputs
  const departureRef = useRef(null);
  const returnRef = useRef(null);

  // Flight calendar modal controls
  const calendarRef = useRef(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeMultiIndex, setActiveMultiIndex] = useState(null);
  const [calendarTripType, setCalendarTripType] = useState("oneway");
  // const [startDate, setStartDate] = useState("");
  // const [endDate, setEndDate] = useState("");

  const router = useRouter();

  // Hotel calendar states
  const hotelCalendarRef = useRef(null);
  const [showHotelCalendar, setShowHotelCalendar] = useState(false);
  const [hotelStartDate, setHotelStartDate] = useState("");
  const [hotelEndDate, setHotelEndDate] = useState("");

  // Holiday calendar states
  const holidayCalendarRef = useRef(null);
  const [showHolidayCalendar, setShowHolidayCalendar] = useState(false);
  const [holidayStartDate, setHolidayStartDate] = useState("");

  // Insurance calendar states
  const insuranceCalendarRef = useRef(null);
  const [showInsuranceCalendar, setShowInsuranceCalendar] = useState(false);
  const [insuranceStartDate, setInsuranceStartDate] = useState("");
  const [insuranceEndDate, setInsuranceEndDate] = useState("");

  const [activeFeature, setActiveFeature] = useState(1);
  const featureRowRef = useRef(null);
  const progressRef = useRef(null);

  // const router = useRouter();
  const searchParams = useSearchParams(); // ✅ correct
  useEffect(() => console.log("isLoggedIn", isLoggedIn), []);
  useEffect(() => {
    const openLogin = searchParams.get("openLogin") === "true";

    if (openLogin) {
      setShowLogin(true);
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    const fetchHeroSection = async () => {
      try {
        // Get token from cookie
        const getCookie = (name) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(";").shift();
        };

        const token = getCookie("auth_token");

        const headers = {
          "Content-Type": "application/json",
        };

        // Add Authorization header if token exists
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(
          "http://139.84.175.121:1337/api/hero-section/company",
          {
            method: "GET",
            headers,
            credentials: "include", // Still include for cookie-based auth
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        setHeroData({
          heading: data.heading || "",
          description: data.description || "",
          videoUrl: data.media?.url
            ? `http://139.84.175.121:1337${data.media.url}`
            : "/videos/hero.mp4",
        });
      } catch (error) {
        console.error("Hero section fetch failed:", error);
        // Optionally set default/fallback data
        setHeroData({
          heading: "Welcome to Our Platform",
          description: "Discover amazing travel experiences",
          videoUrl: "/videos/hero.mp4",
        });
      }
    };

    fetchHeroSection();
  }, []);

  const [flightDates, setFlightDates] = useState({
    round: {
      start: "",
      end: "",
    },
    oneway: {
      start: "",
    },
    multi: [{ date: "" }, { date: "" }],
  });
  const {
    isLoggedIn,
    profile: userProfile,
    user,
    loading: authLoading,
  } = useAuth();
  const [travellerDestination, setTravellerDestination] =
    useState("SELECT DESTINATION");
  const [travellerCount, setTravellerCount] = useState("1 TRAVELLER");
  const [guestRoomCount, setGuestRoomCount] = useState("SELECT ROOMS");
  const [hotelGuestRoomCount, setHotelGuestRoomCount] =
    useState("GUESTS & ROOMS");
  const [travellerOpen, setTravellerOpen] = useState(false);

  const [travellerOpend, setTravellerOpend] = useState(false);
  const [hotelGuestOpen, setHotelGuestOpen] = useState({
    room: 1,
    adults: 0,
    children: 0,
    pets: 0,
  });
  const [passengers, setPassengers] = useState({
    adult: 1,
    child: 0,
    infant: 0,
  });

  const totalHotelPassengers =
    hotelGuestOpen.adults +
    hotelGuestOpen.children +
    hotelGuestOpen.pets +
    hotelGuestOpen.room;
  const totalPassengers =
    passengers.adult + passengers.child + passengers.infant;

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

  const [fromSuggestionsOpen, setFromSuggestionsOpen] = useState(false);
  const [toSuggestionsOpen, setToSuggestionsOpen] = useState(false);
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const fromSuggestionRef = useRef(null);
  const toSuggestionRef = useRef(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(null);
  const multiInputRefs = useRef([]);
  const multiSuggestionRefs = useRef([]);

  const getFilteredSuggestions = (query) => {
    if (!query) return recentSearches;
    const q = query.toLowerCase();
    return recentSearches.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.detail.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
    );
  };

  const selectSuggestion = (sugg, field = "from", index = null) => {
    if (typeof index === "number") {
      updateMultiLeg(index, field, sugg.value);
      setActiveSuggestion(null);
      const wrapper = multiInputRefs.current[index];
      if (wrapper) {
        const inputEl = wrapper.querySelector("input");
        if (inputEl) inputEl.focus();
      }
      return;
    }

    if (field === "from") {
      setFrom(sugg.value);
      setFromSuggestionsOpen(false);
      if (fromInputRef.current) fromInputRef.current.focus();
    } else {
      setTo(sugg.value);
      setToSuggestionsOpen(false);
      if (toInputRef.current) toInputRef.current.focus();
    }
  };

  const [travelClass, setTravelClass] = useState("Economy");
  const [travellerClass, setTravellerClass] = useState("1_traveller_econ");

  const travellerRef = useRef(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [multiCity, setMultiCity] = useState([
    { from: "", to: "" },
    { from: "", to: "" },
  ]);

  const [direction, setDirection] = useState("right");
  const [flightDirection, setFlightDirection] = useState("right");

  const swapLocations = (index) => {
    if (typeof index === "number" && tripType === "multi") {
      setMultiCity((prev) =>
        prev.map((leg, i) =>
          i === index ? { ...leg, from: leg.to || "", to: leg.from || "" } : leg
        )
      );
      return;
    }
    setFrom(to);
    setTo(from);
  };

  const addMultiLeg = () => {
    setMultiCity((prev) => [...prev, { from: "", to: "", date: "" }]);
  };

  const updateMultiLeg = (index, field, value) => {
    setMultiCity((prev) =>
      prev.map((leg, i) => (i === index ? { ...leg, [field]: value } : leg))
    );
  };

  const removeMultiLeg = (index) => {
    setMultiCity((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
    );
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
      }

      if (
        toSuggestionRef.current &&
        !toSuggestionRef.current.contains(e.target) &&
        toInputRef.current &&
        !toInputRef.current.contains(e.target)
      ) {
        setToSuggestionsOpen(false);
      }

      if (activeSuggestion?.index !== undefined) {
        const idx = activeSuggestion.index;
        const inputWrapper = multiInputRefs.current[idx];
        const suggestionBox = multiSuggestionRefs.current[idx];

        if (
          suggestionBox &&
          inputWrapper &&
          !suggestionBox.contains(e.target) &&
          !inputWrapper.contains(e.target)
        ) {
          setActiveSuggestion(null);
        }
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setTravellerOpen(false);
        setFromSuggestionsOpen(false);
        setToSuggestionsOpen(false);
        setActiveSuggestion(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [activeSuggestion, travellerOpen]);

  const truncate = (str, max = 10) => {
    if (!str) return "";
    return str.length > max ? str.slice(0, max) + "..." : str;
  };

  const TravellerDestinationOptions = [
    { value: "india", label: "india" },
    { value: "chennai", label: "Chennai" },
  ];

  const features = [
    {
      id: 0,
      label: "Hotels & Resorts",
      icon: "/icons/hotel.svg",
      type: "hotel",
    },
    { id: 1, label: "Flights", icon: "/icons/flight.svg", type: "flight" },
    {
      id: 2,
      label: "Holiday Gateways",
      icon: "/icons/holiday.svg",
      type: "holiday",
    },
    {
      id: 3,
      label: "Travel Insurance",
      icon: "/icons/insurance.svg",
      type: "insurance",
    },
  ];

  const tabOrder = ["hotel", "flight", "holiday", "insurance"];
  const tripOrder = ["round", "oneway", "multi"];

  const profileBtnRef = useRef(null);
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

  const handleFeatureClick = (feature) => {
    setActiveFeature(feature.id);

    const prevIndex = tabOrder.indexOf(bookingType);
    const nextIndex = tabOrder.indexOf(feature.type);
    if (prevIndex < nextIndex) {
      setDirection("right");
    } else if (prevIndex > nextIndex) {
      setDirection("left");
    }

    setBookingType(feature.type);
  };
  useEffect(() => {
    setFromSuggestionsOpen(false);
    setToSuggestionsOpen(false);
    setActiveSuggestion(null);
  }, [bookingType, tripType]);

  useEffect(() => {
    const update = () => {
      const row = featureRowRef.current;
      const prog = progressRef.current;
      if (!row || !prog) return;

      const buttons = Array.from(row.querySelectorAll("button"));
      const idx = features.findIndex((f) => f.id === activeFeature);
      const target = buttons[idx];
      if (!target) return;

      const rowRect = row.getBoundingClientRect();
      const progRect = prog.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      const left = targetRect.left - progRect.left;
      const width = targetRect.width;

      const activeEl =
        prog.querySelector(`.${styles.progressActive}`) ||
        prog.firstElementChild;
      if (activeEl) {
        activeEl.style.left = `${left}px`;
        activeEl.style.width = `${width}px`;
      }
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [activeFeature, features]);

  // Flight calendar outside click
  useEffect(() => {
    if (!showCalendar) return;

    const handleClickOutsideCalendar = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
        setActiveMultiIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideCalendar);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideCalendar);
  }, [showCalendar]);

  // Hotel calendar outside click
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
  // const [userProfile, setUserProfile] = useState(null);
  // Holiday calendar outside click
  useEffect(() => {
    if (!showHolidayCalendar) return;

    const handleClickOutside = (e) => {
      if (
        holidayCalendarRef.current &&
        !holidayCalendarRef.current.contains(e.target)
      ) {
        setShowHolidayCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showHolidayCalendar]);

  // Insurance calendar outside click
  useEffect(() => {
    if (!showInsuranceCalendar) return;

    const handleClickOutside = (e) => {
      if (
        insuranceCalendarRef.current &&
        !insuranceCalendarRef.current.contains(e.target)
      ) {
        setShowInsuranceCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showInsuranceCalendar]);

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

  const handleFieldClick = (e) => {
    const target = e.currentTarget;
    const input = target.querySelector("input");

    if (!input) return;

    if (input.type === "date" && typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.focus();
    }
  };

  const handleRoundDateClick = (date) => {
    setFlightDates((prev) => {
      const { start, end } = prev.round;

      if (!start || end) {
        return {
          ...prev,
          round: { start: date, end: "" },
        };
      }

      if (new Date(date) >= new Date(start)) {
        return {
          ...prev,
          round: { start, end: date },
        };
      }

      return {
        ...prev,
        round: { start: date, end: "" },
      };
    });
  };

  const handleOneWayDateClick = (date) => {
    setFlightDates((prev) => ({
      ...prev,
      oneway: { start: date },
    }));
  };
  const handleMultiDateClick = (index, date) => {
    setFlightDates((prev) => {
      const updated = [...prev.multi];
      updated[index] = { date };
      return { ...prev, multi: updated };
    });
  };

  const handleDateClick = (date) => {
    if (tripType === "round") {
      handleRoundDateClick(date);
    }

    if (tripType === "oneway") {
      handleOneWayDateClick(date);
      setShowCalendar(false);
    }

    if (tripType === "multi" && activeMultiIndex !== null) {
      handleMultiDateClick(activeMultiIndex, date);
      setShowCalendar(false);
      setActiveMultiIndex(null);
    }
  };

  // Hotel date handler
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

  // Holiday date handler
  const handleHolidayDateClick = (date) => {
    setHolidayStartDate(date);
    setShowHolidayCalendar(false);
  };

  // Insurance date handler
  const handleInsuranceDateClick = (date) => {
    if (!insuranceStartDate || insuranceEndDate) {
      setInsuranceStartDate(date);
      setInsuranceEndDate("");
    } else if (new Date(date) >= new Date(insuranceStartDate)) {
      setInsuranceEndDate(date);
      setShowInsuranceCalendar(false);
    } else {
      setInsuranceStartDate(date);
      setInsuranceEndDate("");
    }
  };

  useEffect(() => {
    if (tripType === "round") {
      setCalendarTripType("round");
    } else {
      setCalendarTripType("oneway");
    }
  }, [tripType]);

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

  const handleSearch = () => {
    if (bookingType === "flight") {
      router.push(
        `/flights?from=${from}&to=${to}&tripType=${tripType}&start=${flightDates.round.start}&end=${flightDates.round.end}`
      );
    }
    if (bookingType === "flight") {
      router.push(
        `/flights?from=${from}&to=${to}&tripType=${tripType}&start=${flightDates.round.start}&end=${flightDates.round.end}`
      );
    }

    if (bookingType === "hotel") {
      router.push(
        `/hotel-list?city=${to}&checkIn=${hotelStartDate}&checkOut=${hotelEndDate}`
      );
    }
    if (bookingType === "hotel") {
      router.push(
        `/hotel-list?city=${to}&checkIn=${hotelStartDate}&checkOut=${hotelEndDate}`
      );
    }

    if (bookingType === "holiday") {
      router.push(
        `/tour-list?from=${from}&to=${to}&date=${holidayStartDate}`
      );
    }

    if (bookingType === "insurance") {
      router.push(
        `/travel-insurance?destination=${travellerDestination}&start=${insuranceStartDate}&end=${insuranceEndDate}`
      );
    }
  };


  return (
    <>
      <section className="relative w-full h-[100vh]">
        <div
          className={`${styles.menuSection} ${menuOpen ? styles.menuOpen : styles.menuClose
            }`}
        >
          <div className={`${styles.navContainer} top-0 z-20`}>
            <div
              className={`${styles.navbar}  w-full flex  justify-between items-center`}
            >
              <img src="./Logo.svg" alt="" />
              <div className={`${styles.navRight} flex gap-3`}>
                <button
                  className={`${styles.glass_button} ${styles.downloadBtn}`}
                >
                  Download the App
                </button>
                <button
                  className={styles.hamBurger}
                  onClick={() => setMenuOpen(false)}
                >
                  <img src="/icons/XIcon.svg" alt="" />
                </button>
              </div>
            </div>
          </div>
          <div className={styles.menuContainer}>
            <div className={styles.menuItems}>
              <ul>
                <li>
                  <Link href="#">Home</Link>
                </li>
                <li>
                  <Link href="#">Destinations</Link>
                </li>
                <li>
                  <Link href="#">Tailor-Made Journeys</Link>
                </li>
                <li>
                  <Link href="#">About Us</Link>
                </li>
                <li>
                  <Link href="#">Flight Booking</Link>
                </li>
                <li>
                  <Link href="#">Blogs</Link>
                </li>
              </ul>
            </div>
            <div className={styles.menuBottom}>
              <button className={styles.accountBtn}>ACCOUNT LOGIN</button>
            </div>
          </div>
        </div>

        <header className={`${styles.homeSection} w-full h-[100vh]`}>
          {/* <video
            className="absolute inset-0 w-full h-full object-cover"
            key={heroData.videoUrl}
            src={heroData.videoUrl}
            poster="/images/hero-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
          /> */}
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={heroData.videoUrl}
            poster="/images/hero-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
          <img className={styles.gradient} src="/images/gradient.png" />
        </header>
        <div className={`${styles.overlay} absolute inset-0`}></div>
        <div className={`${styles.navContainer} absolute top-0 z-20`}>
          <div
            className={`${styles.navbar}  w-full flex  justify-between items-center`}
          >
            <img src="./Logo.svg" alt="" />
            <div className={`${styles.navRight} flex gap-3`}>
              <button
                className={`${styles.glass_button} ${styles.downloadBtn}`}
              >
                Download the App
              </button>
              {!isLoggedIn ? (
                <button
                  className={styles.signInBtn}
                  onClick={() => setShowLogin(true)}
                >
                  Sign In
                </button>
              ) : (
                <>
                  <button
                    ref={profileBtnRef}
                    onClick={() => setShowProfileModal(true)}
                    className={`${styles.glass_button} ${styles.logggedInBtn}`}
                    type="button"
                  >
                    Hi, {userProfile?.display_name || "User"}
                  </button>

                  {showProfileModal && (
                    <ProfileModal
                      anchorRef={profileBtnRef}
                      onClose={() => setShowProfileModal(false)}
                    />
                  )}
                </>
              )}

              <button
                className={styles.hamBurger}
                onClick={() => setMenuOpen(true)}
              >
                <img src="/icons/hamBurger.png" alt="" />
                menu
              </button>
            </div>
          </div>
        </div>

        <div className={styles.homePageContainer}>
          <div className={styles.InspiredSection}>
            <h1>{heroData.heading}</h1>
            <p>{heroData.description}</p>
          </div>

          <div
            className={`${styles.searchSec} flex flex-col gap-[127px] items-center`}
          >
            <div
              className={`${styles.searchPanelWrapper} ${bookingType === "holiday" || bookingType === "insurance"
                  ? styles.noAnimation
                  : ""
                }`}
            >
              {bookingType === "flight" && (
                <div
                  className={`${styles.serarchingCont} ${styles.glass_panel}`}
                >
                  <div className={styles.serarchingContTop}>
                    <div className={styles.serarchingContTop_left}>
                      <button
                        className={`${styles.round_tripBtn} ${tripType === "round" ? styles.activeTrip : ""
                          }`}
                        onClick={() => handleTripTypeChange("round")}
                      >
                        Round-trip
                      </button>

                      <button
                        className={`${styles.round_tripBtn} ${tripType === "oneway" ? styles.activeTrip : ""
                          }`}
                        onClick={() => handleTripTypeChange("oneway")}
                      >
                        One-way
                      </button>

                      <button
                        className={`${styles.round_tripBtn} ${tripType === "multi" ? styles.activeTrip : ""
                          }`}
                        onClick={() => handleTripTypeChange("multi")}
                      >
                        Multi-City
                      </button>
                    </div>
                    <div className={styles.serarchingContTop_right}>
                      <Switch
                        checked={directOnly}
                        onChange={setDirectOnly}
                        label="DIRECT FLIGHTS ONLY"
                      />
                    </div>
                  </div>
                  <div className={styles.flightSearchFormContainer}>
                    {(tripType === "round" ||
                      tripType === "oneway" ||
                      tripType === "multi") && (
                        <div
                          key="row1"
                          className={`${styles.serarchingContBottom} ${styles.formVisible}`}
                        >
                          <div
                            className={`${styles.arrowbox} ${tripType === "oneway"
                                ? styles.arrowboxOneWay
                                : tripType === "multi"
                                  ? styles.multiArrow
                                  : ""
                              }`}
                            onClick={() =>
                              swapLocations(tripType === "multi" ? 0 : undefined)
                            }
                          >
                            <ArrowLeftRight
                              size={16}
                              className={styles.arrowIcon}
                            />
                          </div>
                          <div
                            className={`${styles.fromBtn} ${styles.fromInput}`}
                            onClick={handleFieldClick}
                          >
                            <div className={styles.lable}>From</div>
                            <input
                              ref={fromInputRef}
                              type="text"
                              className={styles.contant}
                              placeholder="Departure"
                              value={
                                tripType === "multi"
                                  ? multiCity[0]?.from || ""
                                  : from
                              }
                              onFocus={() => setFromSuggestionsOpen(true)}
                              onClick={() => setFromSuggestionsOpen(true)}
                              onChange={(e) => {
                                if (tripType === "multi") {
                                  updateMultiLeg(0, "from", e.target.value);
                                } else {
                                  setFrom(e.target.value);
                                  setFromSuggestionsOpen(true);
                                }
                              }}
                            />

                            {fromSuggestionsOpen && (
                              <SuggestionBox
                                boxRef={fromSuggestionRef}
                                heading="RECENT SEARCH"
                                suggestions={getFilteredSuggestions(from)}
                                onSelect={(s) => selectSuggestion(s, "from")}
                              />
                            )}
                          </div>
                          <div
                            className={`${styles.fromBtn} ${styles.fromInput} ${styles.toInput}`}
                            onClick={handleFieldClick}
                          >
                            <div className={styles.lable}>To</div>
                            <input
                              ref={toInputRef}
                              type="text"
                              className={styles.contant}
                              placeholder="Destination"
                              value={
                                tripType === "multi" ? multiCity[0]?.to || "" : to
                              }
                              onFocus={() => setToSuggestionsOpen(true)}
                              onClick={() => setToSuggestionsOpen(true)}
                              onChange={(e) => {
                                if (tripType === "multi") {
                                  updateMultiLeg(0, "to", e.target.value);
                                } else {
                                  setTo(e.target.value);
                                  setToSuggestionsOpen(true);
                                }
                              }}
                            />

                            {toSuggestionsOpen && (
                              <SuggestionBox
                                boxRef={toSuggestionRef}
                                heading="RECENT SEARCH"
                                suggestions={getFilteredSuggestions(to)}
                                onSelect={(s) => selectSuggestion(s, "to")}
                              />
                            )}
                          </div>

                          <div
                            className={`${styles.fromBtn} ${styles.fromBtn2} ${tripType === "oneway" || tripType === "multi"
                                ? styles.growRight
                                : ""
                              } ${styles.calendarAnchor}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (tripType === "multi") {
                                setCalendarTripType("oneway");
                                setActiveMultiIndex(0);
                                setShowCalendar(true);
                              } else {
                                setCalendarTripType("oneway");
                                if (tripType === "round")
                                  setCalendarTripType("round");
                                setShowCalendar(true);
                              }
                            }}
                          >
                            <div className={styles.lable}>Departure Date</div>
                            {showCalendar && (
                              <DateCalendarModal
                                mode={
                                  tripType === "round" ? "roundtrip" : "oneway"
                                }
                                onModeChange={() => { }}
                                onClose={() => {
                                  setShowCalendar(false);
                                  setActiveMultiIndex(null);
                                }}
                              >
                                <div ref={calendarRef}>
                                  <CalendarMonths
                                    startDate={
                                      tripType === "round"
                                        ? flightDates.round.start
                                        : tripType === "oneway"
                                          ? flightDates.oneway.start
                                          : flightDates.multi[activeMultiIndex ?? 0]
                                            ?.date
                                    }
                                    endDate={
                                      tripType === "round"
                                        ? flightDates.round.end
                                        : null
                                    }
                                    onDateClick={handleDateClick}
                                  />
                                </div>
                              </DateCalendarModal>
                            )}

                            <div
                              className={styles.dateInputWrapper}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (tripType === "multi") {
                                  setCalendarTripType("oneway");
                                  setActiveMultiIndex(0);
                                  setShowCalendar(true);
                                } else {
                                  setCalendarTripType("oneway");
                                  if (tripType === "round")
                                    setCalendarTripType("round");
                                  setShowCalendar(true);
                                }
                              }}
                            >
                              <input
                                type="text"
                                readOnly
                                className={styles.contant}
                                placeholder="ADD DATE"
                                value={
                                  tripType === "round"
                                    ? formatDate(flightDates.round.start)
                                    : tripType === "oneway"
                                      ? formatDate(flightDates.oneway.start)
                                      : formatDate(flightDates.multi[0]?.date)
                                }
                              />

                              <button
                                type="button"
                                className={styles.calendarIcon}
                              >
                                <CalendarSVG />
                              </button>
                            </div>
                          </div>

                          <div
                            className={`${styles.fromBtn} ${styles.fromInput} ${styles.returnDateField
                              } ${tripType === "oneway" || tripType === "multi"
                                ? styles.hiddenField
                                : ""
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();

                              if (tripType === "round") {
                                setCalendarTripType("round");
                                setShowCalendar(true);
                              }
                            }}
                          >
                            <div className={styles.lable}>Return Date</div>
                            <div
                              className={styles.dateInputWrapper}
                              onClick={openReturnPicker}
                            >
                              <input
                                type="text"
                                readOnly
                                className={styles.contant}
                                placeholder="ADD DATE"
                                value={formatDate(flightDates.round.end)}
                              />
                              <button
                                type="button"
                                aria-label="Open return date picker"
                                className={styles.calendarIcon}
                                onClick={openReturnPicker}
                              >
                                <img src="/icons/calander.svg" alt="" />
                              </button>
                            </div>
                          </div>

                          <div
                            ref={travellerRef}
                            className={`${styles.fromBtn} ${styles.fromBtn2} ${tripType === "oneway" || tripType === "multi"
                                ? styles.growRight
                                : ""
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setTravellerOpend((o) => !o);
                            }}
                          >
                            <div className={styles.lable}>Travellers & Class</div>
                            <div className={styles.iconCont}>
                              <div className={styles.contant}>
                                {truncate(
                                  `${totalPassengers} Traveller${totalPassengers > 1 ? "s" : ""
                                  }, ${travelClass}`,
                                  17
                                )}
                              </div>

                              <ChevronDown
                                className={`${styles.chevron} ${travellerOpend
                                    ? styles.openChevron
                                    : styles.closeChevron
                                  }`}
                                size={16}
                                color="#FFFFFF"
                              />
                            </div>

                            <PassengerClassSelector
                              open={travellerOpend}
                              setOpen={setTravellerOpend}
                              passengers={passengers}
                              setPassengers={setPassengers}
                              travelClass={travelClass}
                              setTravelClass={setTravelClass}
                            />
                          </div>

                          <div
                            className={`${styles.searchBtn} ${tripType === "multi" ? styles.hiddenField : ""
                              }`}
                            onClick={handleSearch}
                          >
                            <img src="/images/searchIcon.svg" alt="" />
                          </div>
                        </div>
                      )}

                    {tripType === "multi" && (
                      <div className={styles.multiSearch}>
                        {multiCity.slice(1).map((leg, idx) => {
                          const actualIndex = idx + 1;
                          return (
                            <div
                              key={actualIndex}
                              ref={(el) =>
                                (multiInputRefs.current[actualIndex] = el)
                              }
                              className={styles.serarchingContBottom}
                              style={{ position: "relative" }}
                            >
                              <div
                                className={`${styles.arrowboxOneWay} ${styles.arrowbox}  ${styles.multiArrow}`}
                                onClick={() => swapLocations(actualIndex)}
                              >
                                <ArrowLeftRight
                                  size={16}
                                  className={styles.arrowIcon}
                                />
                              </div>
                              <div
                                className={`${styles.fromBtn} ${styles.travellerClass}`}
                                onClick={handleFieldClick}
                              >
                                <div className={styles.lable}>From</div>
                                <input
                                  type="text"
                                  className={styles.contant}
                                  placeholder="Departure"
                                  value={leg.from || ""}
                                  onFocus={() =>
                                    setActiveSuggestion({
                                      field: "from",
                                      index: actualIndex,
                                    })
                                  }
                                  onClick={() =>
                                    setActiveSuggestion({
                                      field: "from",
                                      index: actualIndex,
                                    })
                                  }
                                  onChange={(e) =>
                                    updateMultiLeg(
                                      actualIndex,
                                      "from",
                                      e.target.value
                                    )
                                  }
                                />

                                {activeSuggestion &&
                                  activeSuggestion.index === actualIndex &&
                                  activeSuggestion.field === "from" && (
                                    <SuggestionBox
                                      boxRef={(el) =>
                                      (multiSuggestionRefs.current[
                                        actualIndex
                                      ] = el)
                                      }
                                      heading="RECENT SEARCH"
                                      suggestions={getFilteredSuggestions(
                                        leg.from || ""
                                      )}
                                      onSelect={(s) =>
                                        selectSuggestion(s, "from", actualIndex)
                                      }
                                    />
                                  )}
                              </div>
                              <div
                                className={`${styles.fromBtn} ${styles.travellerClass} ${styles.toInput}`}
                                onClick={handleFieldClick}
                              >
                                <div className={styles.lable}>To</div>
                                <input
                                  type="text"
                                  className={styles.contant}
                                  placeholder="Destination"
                                  value={leg.to || ""}
                                  onFocus={() =>
                                    setActiveSuggestion({
                                      field: "to",
                                      index: actualIndex,
                                    })
                                  }
                                  onClick={() =>
                                    setActiveSuggestion({
                                      field: "to",
                                      index: actualIndex,
                                    })
                                  }
                                  onChange={(e) =>
                                    updateMultiLeg(
                                      actualIndex,
                                      "to",
                                      e.target.value
                                    )
                                  }
                                />

                                {activeSuggestion &&
                                  activeSuggestion.index === actualIndex &&
                                  activeSuggestion.field === "to" && (
                                    <SuggestionBox
                                      boxRef={(el) =>
                                      (multiSuggestionRefs.current[
                                        actualIndex
                                      ] = el)
                                      }
                                      heading="RECENT SEARCH"
                                      suggestions={getFilteredSuggestions(
                                        leg.to || ""
                                      )}
                                      onSelect={(s) =>
                                        selectSuggestion(s, "to", actualIndex)
                                      }
                                    />
                                  )}
                              </div>

                              <div
                                className={`${styles.fromBtn} ${styles.travellerClass}`}
                                onClick={handleFieldClick}
                              >
                                <div className={styles.lable}>
                                  Departure Date
                                </div>

                                {showCalendar &&
                                  activeMultiIndex === actualIndex && (
                                    <DateCalendarModal
                                      mode="oneway"
                                      onModeChange={() => { }}
                                      onClose={() => {
                                        setShowCalendar(false);
                                        setActiveMultiIndex(null);
                                      }}
                                      anchorEl={
                                        multiInputRefs.current[actualIndex]
                                      }
                                    >
                                      <div>
                                        {/* <CalendarMonths
                                      startDate={leg.date}
                                      endDate={null}
                                      onDateClick={(date) => {
                                        updateMultiLeg(actualIndex, 'date', date);
                                        setShowCalendar(false);
                                        setActiveMultiIndex(null);
                                      }}
                                    /> */}
                                        <CalendarMonths
                                          startDate={
                                            flightDates.multi[actualIndex]?.date
                                          }
                                          endDate={null}
                                          onDateClick={(date) => {
                                            handleMultiDateClick(
                                              actualIndex,
                                              date
                                            );
                                            setShowCalendar(false);
                                            setActiveMultiIndex(null);
                                          }}
                                        />
                                      </div>
                                    </DateCalendarModal>
                                  )}

                                <div
                                  className={styles.dateInputWrapper}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCalendarTripType("oneway");
                                    setActiveMultiIndex(actualIndex);
                                    setShowCalendar(true);
                                  }}
                                >
                                  <input
                                    type="text"
                                    readOnly
                                    className={styles.contant}
                                    placeholder="ADD DATES"
                                    value={formatDate(
                                      flightDates.multi[actualIndex]?.date
                                    )}
                                    required
                                  />
                                  <button
                                    type="button"
                                    aria-label="Open departure date picker"
                                    className={styles.calendarIcon}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMultiIndex(actualIndex);
                                      setShowCalendar(true);
                                    }}
                                  >
                                    <img src="/icons/calander.svg" alt="" />
                                  </button>
                                </div>
                              </div>

                              {actualIndex === multiCity.length - 1 ? (
                                <div
                                  className={styles.multisearchBtn}
                                  onClick={handleSearch}
                                >
                                  Search
                                </div>
                              ) : (
                                <div
                                  className={`${styles.multisearchBtn} opacity-0 pointer-events-none`}
                                  onClick={handleSearch}
                                >
                                  Search
                                </div>
                              )}

                              {multiCity.length > 2 && (
                                <button
                                  className="absolute -right-8 top-1/2 -translate-y-1/2 text-white hover:text-red-500"
                                  onClick={() => removeMultiLeg(actualIndex)}
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(bookingType === "hotel" ||
                bookingType === "holiday" ||
                bookingType === "insurance") && (
                  <div
                    className={`${styles.serarchingCont} ${styles.glass_panel} ${styles.searchFormContainer}`}
                  >
                    <div
                      className={`${styles.serarchingContBottom} ${bookingType === "holiday" ? styles.swapActive : ""
                        }`}
                    >
                      {bookingType === "insurance" ? (
                        <TravellerSelector
                          travellerClass={travellerDestination}
                          setTravellerClass={setTravellerDestination}
                          travellerOptions={TravellerDestinationOptions}
                          styles={styles}
                          name="TRAVEL DESTINATION"
                          className={`${styles.pos1}`}
                          enableEllipsis={false}
                        />
                      ) : (
                        <div
                          className={`${styles.fromBtn} ${styles.pos1}`}
                          onClick={handleFieldClick}
                        >
                          <div className={`${styles.lable} ${styles.labelFade}`}>
                            {bookingType === "hotel" ? "WHERE TO" : "From CITY"}
                          </div>

                          <input
                            ref={
                              bookingType === "hotel" ? toInputRef : fromInputRef
                            }
                            type="text"
                            className={`${styles.contant} ${styles.contentFade}`}
                            placeholder={
                              bookingType === "hotel" ? "Where to" : "Departure"
                            }
                            value={bookingType === "hotel" ? to : from}
                            onChange={(e) => {
                              if (bookingType === "hotel") {
                                setTo(e.target.value);
                                setToSuggestionsOpen(true);
                              } else {
                                setFrom(e.target.value);
                                setFromSuggestionsOpen(true);
                              }
                            }}
                            onFocus={() => {
                              if (bookingType === "hotel") {
                                setToSuggestionsOpen(true);
                              } else {
                                setFromSuggestionsOpen(true);
                              }
                            }}
                          />

                          {bookingType === "hotel" && toSuggestionsOpen && (
                            <div ref={toSuggestionRef}>
                              <RecentSearch
                                onSelect={(city) => {
                                  setTo(city); // ✅ input value set
                                  setToSuggestionsOpen(false); // ✅ dropdown close
                                }}
                              />
                            </div>
                          )}
                          {bookingType === "holiday" && fromSuggestionsOpen && (
                            <SuggestionBox
                              boxRef={fromSuggestionRef}
                              heading="RECENT SEARCH"
                              suggestions={getFilteredSuggestions(from)}
                              onSelect={(s) => selectSuggestion(s, "from")}
                            />
                          )}
                        </div>
                      )}

                      {/* SLOT 2: Check In / Departure Date / Travel Date with Calendar */}
                      <div
                        className={`${styles.fromBtn} ${styles.pos2} ${styles.swapField} ${styles.calendarAnchor}`}
                      >
                        <div className={`${styles.lable} ${styles.labelFade}`}>
                          {bookingType === "hotel"
                            ? "Check In"
                            : bookingType === "holiday"
                              ? "Departure Date"
                              : "Travel Date"}
                        </div>

                        {/* Hotel Calendar */}
                        {bookingType === "hotel" && showHotelCalendar && (
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

                        {/* Holiday Calendar */}
                        {bookingType === "holiday" && showHolidayCalendar && (
                          <DateCalendarModal
                            mode="oneway"
                            onModeChange={() => { }}
                            onClose={() => setShowHolidayCalendar(false)}
                          >
                            <div ref={holidayCalendarRef}>
                              <CalendarMonths
                                startDate={holidayStartDate}
                                endDate={null}
                                onDateClick={handleHolidayDateClick}
                              />
                            </div>
                          </DateCalendarModal>
                        )}

                        {/* Insurance Calendar */}
                        {bookingType === "insurance" && showInsuranceCalendar && (
                          <DateCalendarModal
                            mode="roundtrip"
                            onModeChange={() => { }}
                          // onClose={() => setShowInsuranceCalendar(false)}
                          >
                            <div ref={insuranceCalendarRef}>
                              <CalendarMonths
                                startDate={insuranceStartDate}
                                endDate={insuranceEndDate}
                                onDateClick={handleInsuranceDateClick}
                              />
                            </div>
                          </DateCalendarModal>
                        )}

                        <div
                          className={`${styles.dateInputWrapper} ${styles.contentFade}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (bookingType === "hotel") {
                              setShowHotelCalendar(true);
                            } else if (bookingType === "holiday") {
                              setShowHolidayCalendar(true);
                            } else if (bookingType === "insurance") {
                              setShowInsuranceCalendar(true);
                            }
                          }}
                        >
                          <input
                            type="text"
                            readOnly
                            className={styles.contant}
                            placeholder="ADD DATES"
                            value={
                              bookingType === "hotel"
                                ? formatDate(hotelStartDate)
                                : bookingType === "holiday"
                                  ? formatDate(holidayStartDate)
                                  : formatDate(insuranceStartDate)
                            }
                          />
                          <button type="button" className={styles.calendarIcon}>
                            <CalendarSVG />
                          </button>
                        </div>
                      </div>

                      {/* SLOT 3: Check Out / To City / Return Date */}
                      <div
                        className={`${styles.fromBtn} ${styles.pos3} ${styles.swapField
                          } ${bookingType === "holiday" ? "" : styles.calendarAnchor
                          }`}
                      >
                        <div className={`${styles.lable} ${styles.labelFade}`}>
                          {bookingType === "hotel"
                            ? "Check Out"
                            : bookingType === "holiday"
                              ? "To CITY/COUNTRY, CATEGORY"
                              : "Return Date"}
                        </div>

                        {bookingType === "holiday" ? (
                          <>
                            <input
                              ref={toInputRef}
                              type="text"
                              className={`${styles.contant} ${styles.contentFade}`}
                              placeholder="Destination"
                              value={to}
                              onChange={(e) => {
                                setTo(e.target.value);
                                setToSuggestionsOpen(true);
                              }}
                              onFocus={() => setToSuggestionsOpen(true)}
                            />

                            {toSuggestionsOpen && (
                              <SuggestionBox
                                boxRef={toSuggestionRef}
                                heading="RECENT SEARCH"
                                suggestions={getFilteredSuggestions(to)}
                                onSelect={(s) => selectSuggestion(s, "to")}
                              />
                            )}
                          </>
                        ) : (
                          <div
                            className={`${styles.dateInputWrapper} ${styles.contentFade}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (bookingType === "hotel") {
                                setShowHotelCalendar(true);
                              } else if (bookingType === "insurance") {
                                setShowInsuranceCalendar(true);
                              }
                            }}
                          >
                            <input
                              type="text"
                              readOnly
                              className={styles.contant}
                              placeholder="ADD DATES"
                              value={
                                bookingType === "hotel"
                                  ? formatDate(hotelEndDate)
                                  : formatDate(insuranceEndDate)
                              }
                            />
                            <button type="button" className={styles.calendarIcon}>
                              <CalendarSVG />
                            </button>
                          </div>
                        )}
                      </div>

                      <div
                        ref={travellerRef}
                        className={`${styles.fromBtn} ${styles.pos4} ${styles.fromBtn2}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setTravellerOpend((prev) => !prev);
                        }}
                      >
                        <div className={styles.lable}>
                          {bookingType === "hotel"
                            ? "GUESTS & ROOMS"
                            : bookingType === "holiday"
                              ? "ROOMS & GUESTS"
                              : "TRAVELLERS"}
                        </div>

                        <div className={styles.iconCont}>
                          <div className={styles.contant}>
                            {truncate(
                              bookingType === "hotel"
                                ? `${totalHotelPassengers} Guest${totalHotelPassengers > 1 ? "s" : ""
                                }, ${totalHotelPassengers} Room${totalHotelPassengers > 1 ? "s" : ""
                                }`
                                : bookingType === "holiday"
                                  ? `${totalPassengers} Room${totalPassengers > 1 ? "s" : ""
                                  }, ${totalPassengers} Guest${totalPassengers > 1 ? "s" : ""
                                  }`
                                  : `${totalPassengers} Traveller${totalPassengers > 1 ? "s" : ""
                                  }, ${travelClass}`,
                              17
                            )}
                          </div>

                          <ChevronDown
                            className={`${styles.chevron} ${travellerOpend
                                ? styles.openChevron
                                : styles.closeChevron
                              }`}
                            size={16}
                            color="#FFFFFF"
                          />
                        </div>

                        {bookingType === "hotel" && (
                          <HotelDropDown
                            open={travellerOpend}
                            setOpen={setTravellerOpend}
                            passengers={hotelGuestOpen}
                            setPassengers={setHotelGuestOpen}
                            travelClass={travelClass}
                            setTravelClass={setTravelClass}
                          />
                        )}
                        {bookingType === "holiday" && (
                          <PassengerClassSelector
                            open={travellerOpend}
                            setOpen={setTravellerOpend}
                            passengers={passengers}
                            setPassengers={setPassengers}
                            travelClass={travelClass}
                            setTravelClass={setTravelClass}
                          />
                        )}
                        {bookingType === "insurance" && (
                          <PassengerClassSelector
                            open={travellerOpend}
                            setOpen={setTravellerOpend}
                            passengers={passengers}
                            setPassengers={setPassengers}
                            travelClass={travelClass}
                            setTravelClass={setTravelClass}
                          />
                        )}
                      </div>

                      <div className={`${styles.searchBtn} ${styles.pos5}`} onClick={handleSearch}>
                        <img src="/images/searchIcon.svg" alt="" />
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>

          <div className={styles.featureStrip}>
            <div
              className={styles.progress}
              ref={progressRef}
              style={{
                "--active-index": String(activeFeature),
                "--count": String(features.length),
              }}
            >
              <div className={styles.progressActive}></div>
            </div>

            <div className={styles.featureRow} ref={featureRowRef}>
              {features.map((f) => (
                <button
                  key={f.id}
                  className={`${styles.feature} ${activeFeature === f.id ? styles.featureActive : ""
                    }`}
                  onClick={() => handleFeatureClick(f)}
                  type="button"
                >
                  <img src={f.icon} className={styles.icon} alt="" />
                  <div className={styles.featurelabel}>{f.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile sections remain same as original with DateField */}
        {/* Mobile sections remain same as original with DateField */}
        {bookingType === "flight" && (
          <FlightSearchMobile
            styles={styles}
            swapLocations={swapLocations}
            from={from}
            setFrom={setFrom}
            to={to}
            setTo={setTo}
            departureDate={departureDate}
            setDepartureDate={setDepartureDate}
            returnDate={returnDate}
            setReturenDate={setReturenDate}
            travellerOpen={travellerOpen}
            setTravellerOpen={setTravellerOpen}
            totalPassengers={totalPassengers}
            travelClass={travelClass}
            setTravelClass={setTravelClass}
            passengers={passengers}
            setPassengers={setPassengers}
            truncate={truncate}
          />
        )}

        {bookingType === "hotel" && (
          <HotelSearchMobile
            styles={styles}
            to={to}
            setTo={setTo}
            checkIn={checkIn}
            setCheckIn={setCheckIn}
            checkOut={checkOut}
            setCheckOut={setCheckOut}
            travellerOpen={travellerOpen}
            setTravellerOpen={setTravellerOpen}
            totalPassengers={totalPassengers}
            passengers={passengers}
            setPassengers={setPassengers}
            travelClass={travelClass}
            setTravelClass={setTravelClass}
            truncate={truncate}
          />
        )}

        {bookingType === "holiday" && (
          <HolidaySearchMobile
            styles={styles}
            from={from}
            setFrom={setFrom}
            to={to}
            setTo={setTo}
            departureDate={departureDate}
            setDepartureDate={setDepartureDate}
            travellerOpen={travellerOpen}
            setTravellerOpen={setTravellerOpen}
            totalPassengers={totalPassengers}
            passengers={passengers}
            setPassengers={setPassengers}
            travelClass={travelClass}
            setTravelClass={setTravelClass}
            truncate={truncate}
          />
        )}

        {bookingType === "insurance" && (
          <InsuranceSearchMobile
            styles={styles}
            travellerDestination={travellerDestination}
            setTravellerDestination={setTravellerDestination}
            TravellerDestinationOptions={TravellerDestinationOptions}
            departureDate={departureDate}
            setDepartureDate={setDepartureDate}
            returnDate={returnDate}
            setReturnDate={setReturenDate}
            travellerOpen={travellerOpen}
            setTravellerOpen={setTravellerOpen}
            totalPassengers={totalPassengers}
            travelClass={travelClass}
            setTravelClass={setTravelClass}
            passengers={passengers}
            setPassengers={setPassengers}
            truncate={truncate}
          />
        )}
        {showLogin && authView === "login" && (
          <LoginPopup
            onClose={() => setShowLogin(false)}
            onNavigate={setAuthView}
          />
        )}

        {showLogin && authView === "signup" && (
          <SignupPopup
            onClose={() => setShowLogin(false)}
            onNavigate={setAuthView}
          />
        )}
      </section>
    </>
  );
};

export default HomePage;

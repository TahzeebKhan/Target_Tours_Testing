"use client";
import styles from "./HomePage.module.css";
import Switch from "../Switch";
import { useState, useRef, useEffect } from "react";
import TravellerSelector from "./TravellerSelector";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeftRight, ChevronDown } from "lucide-react";
import PassengerClassSelector from "./PassengerClassSelector";
import { saveRecentFlightSearch } from "@/shared/services/recentSearch";
import { CalendarSVG } from "@/app/flights/components/SVGFile";
import HotelDropDown from "@/shared/components/hotelDropDown/HotelDropDown";
import HolidayGuestSelector from "./HolidayGuestSelector";

import { useQuery } from "@tanstack/react-query";
import { getHeroSection } from "@/shared/services/heroApi";

// import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuthDisplayName, useAuth } from "@/app/context/AuthContext";
import Cookies from "js-cookie";
import CustomLoaderHomePage from "@/shared/components/CustomLoaderHomePage";
import { useDatewiseFare } from "@/features/flights/hooks/useDatewiseFare";
import { toast } from "react-toastify";
import BrandLogo from "@/shared/components/BrandLogo";
import { fetchHolidayPackageSuggestions } from "@/shared/services/tourPackage";
import {
  HOTEL_SEARCH_SESSION_KEY,
  HOTEL_SEARCH_RESULTS_KEY,
  HOTEL_LAST_SEARCH_URL_KEY,
  createHotelSearchChannel,
  fetchHotelSearchSuggestions,
} from "@/shared/services/hotelSearch";

const AirportSuggestionBox = dynamic(
  () => import("@/shared/components/airport/AirportSuggestionBox"),
  { loading: () => null, ssr: false },
);
const DateCalendarModal = dynamic(
  () => import("@/shared/components/calendar/DateCalendarModal"),
  { loading: () => null, ssr: false },
);
const CalendarMonths = dynamic(
  () => import("@/shared/components/calendar/CalendarMonths"),
  { loading: () => null, ssr: false },
);
const HotelDateCalendarModal = dynamic(
  () => import("@/shared/components/hotelCalendar/HotelDateCalendarModal"),
  { loading: () => null, ssr: false },
);
const HotelCalendarMonths = dynamic(
  () => import("@/shared/components/hotelCalendar/HotelCalendarMonths"),
  { loading: () => null, ssr: false },
);
const RecentSearch = dynamic(
  () => import("@/shared/components/recentSearch/RecentSearch"),
  { loading: () => null, ssr: false },
);
const LoginPopup = dynamic(
  () => import("@/app/account/loginPopUp/LoginPopup"),
  { loading: () => null, ssr: false },
);
const SignupPopup = dynamic(
  () => import("@/app/account/signUpPopUp/SignupPopup"),
  { loading: () => null, ssr: false },
);
const FlightSearchMobile = dynamic(
  () => import("./flightSearchMobile/FlightSearchMobile"),
  { loading: () => null, ssr: false },
);
const HotelSearchMobile = dynamic(
  () => import("./hotelSearchMobile/HotelSearchMobile"),
  { loading: () => null, ssr: false },
);
const HolidaySearchMobile = dynamic(
  () => import("./holidaySearchMobile/HolidaySearchMobile"),
  { loading: () => null, ssr: false },
);
const InsuranceSearchMobile = dynamic(
  () => import("./insuranceSearchMobile/InsuranceSearchMobile"),
  { loading: () => null, ssr: false },
);
const ProfileModal = dynamic(
  () => import("./modals/ProfileModal"),
  { loading: () => null, ssr: false },
);
const CustomItinerary = dynamic(
  () => import("./customIternaryComponents/CustomItinerary"),
  { loading: () => null, ssr: false },
);
const MobileItinerary = dynamic(
  () => import("./customIternaryComponents/MobileItinerary"),
  { loading: () => null, ssr: false },
);

const normalizeHotelRoomPayloads = (guestState = {}) => {
  const roomCount = Math.max(1, Number(guestState.room || guestState.rooms?.length || 1));
  const sourceRooms = Array.isArray(guestState.rooms) ? guestState.rooms : [];

  return Array.from({ length: roomCount }, (_, index) => {
    const sourceRoom =
      sourceRooms[index] ||
      (index === 0
        ? {
            adults: guestState.adults,
            children: guestState.children,
            childAges: guestState.childAges,
          }
        : {});
    const children = Math.max(0, Number(sourceRoom.children || 0));
    const childAges = Array.isArray(sourceRoom.childAges)
      ? sourceRoom.childAges.slice(0, children).map((age) => String(age))
      : [];

    return {
      adults: String(Math.max(1, Number(sourceRoom.adults || 1))),
      children: String(children),
      childAges,
    };
  });
};

const getHotelRoomTotals = (rooms = []) => ({
  adults: rooms.reduce((sum, room) => sum + Number(room.adults || 0), 0),
  children: rooms.reduce((sum, room) => sum + Number(room.children || 0), 0),
});

const MAX_MULTI_CITY_ROUTES = 4;
const SuggestionBox = dynamic(() => import("./SuggestionBox"), {
  loading: () => null,
  ssr: false,
});
const sampleHotel = {
  title: "SERENE HAVEN INN, TORONTO",
  images: ["/images/hotel-placeholder.jpg"],
};

const normalizeHolidaySuggestions = (payload) => {
  const source =
    payload?.data?.suggestions ||
    payload?.data ||
    payload?.suggestions ||
    payload ||
    [];

  if (!Array.isArray(source)) return [];

  return source.map((item, index) => {
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
      item?.code ||
      item?.iata_code ||
      item?.iataCode ||
      item?.type ||
      "";

    return {
      id: item?.id || item?.documentId || `${label}-${index}`,
      label,
      detail,
      code,
      value: item?.value || label,
      raw: item,
    };
  }).filter((item) => item.label || item.value);
};
const HomePage = ({
  itineraryType,
  setIternaryType,
  itineraryOpen,
  setItineraryOpen,
  onReady,
  setIsMultiTripMobile,
}) => {
  const [directOnly, setDirectOnly] = useState(false);
  const [tripType, setTripType] = useState("round");
  const [bookingType, setBookingType] = useState("flight");
  const [menuOpen, setMenuOpen] = useState(false);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturenDate] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [authModalKey, setAuthModalKey] = useState(0);
  const [searchSubmitting, setSearchSubmitting] = useState(false);
  const [heroData, setHeroData] = useState({
    heading: "",
    description: "",
    videoUrl: "/videos/hero.mp4",
  });

  // refs for the date inputs
  const departureRef = useRef(null);
  const returnRef = useRef(null);

  // Flight calendar modal controls
  const calendarRef = useRef(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeCalendarField, setActiveCalendarField] = useState("departure");
  const [activeMultiIndex, setActiveMultiIndex] = useState(null);
  const [calendarTripType, setCalendarTripType] = useState("oneway");

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
  const {
    data: heroResponse,
    isLoading: heroLoading,
    isError: heroError,
  } = useQuery({
    queryKey: ["hero-section"],
    queryFn: getHeroSection,
    staleTime: 1000 * 60 * 10,
    // 10 minutes cache
  });

  useEffect(() => {
    if (!heroResponse) return;

    setHeroData({
      heading:
        heroResponse.heading || "Inspired travel for the curious & cultured",
      description:
        heroResponse.description ||
        "Thoughtfully designed journeys for those who find beauty in the details.",
      videoUrl: heroResponse.media?.url
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${heroResponse.media.url}`
        : "/videos/hero.mp4",
    });
  }, [heroResponse]);
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
  const displayName = getAuthDisplayName(userProfile, user);
  
  const [travellerDestination, setTravellerDestination] =
    useState("SELECT DESTINATION");
  const [travellerCount, setTravellerCount] = useState("1 TRAVELLER");
  const [guestRoomCount, setGuestRoomCount] = useState("CHECK ROOMS");
  const [hotelGuestRoomCount, setHotelGuestRoomCount] =
    useState("GUESTS & ROOMS");
  const [travellerOpen, setTravellerOpen] = useState(false);

  const [travellerOpend, setTravellerOpend] = useState(false);
  const [hotelGuestOpen, setHotelGuestOpen] = useState({
    room: 1,
    adults: 1,
    children: 0,
    childAges: [],
    rooms: [{ adults: 1, children: 0, childAges: [] }],
    pets: 0,
  });
  const [passengers, setPassengers] = useState({
    room: 1,
    adult: 1,
    child: 0,
    infant: 0,
  });
  const [showDestinationSearch, setShowDestinationSearch] = useState(false);

  const hotelRoomPayloadsForSummary = normalizeHotelRoomPayloads(hotelGuestOpen);
  const hotelRoomTotalsForSummary = getHotelRoomTotals(hotelRoomPayloadsForSummary);
  const hotelGuestCount =
    hotelRoomTotalsForSummary.adults + hotelRoomTotalsForSummary.children;
  const hotelRoomCount = Number(hotelGuestOpen.room || 1);
  const totalPassengers =
    passengers.adult + passengers.child + passengers.infant;
  const totalHolidayGuests = passengers.adult + passengers.child;
  const totalRooms = Number(passengers.room || 1);

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

  const [fromSuggestionsOpen, setFromSuggestionsOpen] = useState(false);
  const [toSuggestionsOpen, setToSuggestionsOpen] = useState(false);
  const [debouncedFromSuggestionQuery, setDebouncedFromSuggestionQuery] = useState("");
  const [debouncedToSuggestionQuery, setDebouncedToSuggestionQuery] = useState("");
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const nonFlightStartDateRef = useRef(null);
  const nonFlightEndDateRef = useRef(null);
  const nonFlightSearchRef = useRef(null);
  const fromSuggestionRef = useRef(null);
  const toSuggestionRef = useRef(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(null);
  const multiInputRefs = useRef([]);
  const multiSuggestionRefs = useRef([]);
  const [isMobile, setIsMobile] = useState(false);



  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth <= 895;
      setIsMobile(mobile);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const getSuggestionDisplayValue = (suggestion) => {
    if (!suggestion) return "";
    if (typeof suggestion === "string") return suggestion;

    const code = String(
      suggestion?.iataCode || suggestion?.code || ""
    )
      .trim()
      .toUpperCase();
    const directValue =
      typeof suggestion?.value === "string"
        ? suggestion.value
        : "";
    if (directValue.trim()) {
      const trimmedValue = directValue.trim();
      return code && !trimmedValue.toUpperCase().includes(`(${code})`)
        ? `${trimmedValue} (${code})`
        : trimmedValue;
    }

    const city =
      typeof suggestion?.city === "string"
        ? suggestion.city.trim()
        : typeof suggestion?.label === "string"
          ? suggestion.label.split(",")[0]?.trim()
          : "";

    if (city && code) return `${city} (${code})`;
    if (city) return city;
    if (code) return code;
    return "";
  };

  const selectSuggestion = (sugg, field = "from", index = null) => {
    if (sugg?.route && tripType !== "multi") {
      const route = sugg.route;
      setFrom(route.origin || "");
      setFromCode(route.originCode || "");
      setTo(route.destination || "");
      setToCode(route.destinationCode || "");
      if (route.departureDate) setDepartureDate(route.departureDate);
      if (route.returnDate) setReturenDate(route.returnDate);
      setFromSuggestionsOpen(false);
      setToSuggestionsOpen(false);
      return;
    }
    const displayValue = getSuggestionDisplayValue(sugg);
    const iataCode = sugg?.iataCode || sugg?.code || "";

    if (tripType === "multi" && typeof index === "number") {
      updateMultiLeg(index, field, displayValue);
      if (index === 0) {
        if (field === "from") setFromCode(iataCode);
        if (field === "to") setToCode(iataCode);
      }
      setActiveSuggestion(null);
      return;
    }

    if (field === "from") {
      setFrom(displayValue);
      setFromCode(iataCode);
      setFromSuggestionsOpen(false);
      if (fromInputRef.current) fromInputRef.current.focus();
    } else {
      setTo(displayValue);
      setToCode(iataCode);
      setToSuggestionsOpen(false);
      if (toInputRef.current) toInputRef.current.focus();
    }
  };

  const [travelClass, setTravelClass] = useState("Economy");
  const [travellerClass, setTravellerClass] = useState("1_traveller_econ");

  const travellerRef = useRef(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromCode, setFromCode] = useState("");
  const [toCode, setToCode] = useState("");
  const [selectedHotelLocation, setSelectedHotelLocation] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedFromSuggestionQuery(from.trim());
      setDebouncedToSuggestionQuery(to.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [from, to]);

  const [multiCity, setMultiCity] = useState([
    { from: "", to: "" },
    { from: "", to: "" },
  ]);

  const selectHotelSuggestion = (suggestion) => {
    setSelectedHotelLocation(suggestion || null);
    setTo(suggestion?.value || suggestion?.label || "");
    setToCode(suggestion?.locationId || suggestion?.id || "");
    setToSuggestionsOpen(false);
    if (toInputRef.current) toInputRef.current.focus();
  };

  const [direction, setDirection] = useState("right");
  const [flightDirection, setFlightDirection] = useState("right");
  const getQueryDateValue = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (value instanceof Date && !isNaN(value.getTime())) {
      return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
    }
    return "";
  };
  const todayQueryDate = getQueryDateValue(new Date());
  const activeLegIndex = activeMultiIndex ?? 0;
  const datewiseFrom =
    tripType === "multi"
      ? multiCity?.[activeLegIndex]?.from || multiCity?.[0]?.from || from
      : from;
  const datewiseTo =
    tripType === "multi"
      ? multiCity?.[activeLegIndex]?.to || multiCity?.[0]?.to || to
      : to;
  const datewiseDepartureDate =
    tripType === "round"
      ? flightDates.round.start ||
        getQueryDateValue(departureDate) ||
        todayQueryDate
      : tripType === "oneway"
        ? flightDates.oneway.start ||
          getQueryDateValue(departureDate) ||
          todayQueryDate
        : flightDates.multi?.[activeLegIndex]?.date;
  const datewiseReturnDate =
    tripType === "round"
      ? flightDates.round.end ||
        getQueryDateValue(returnDate)
      : "";
  const { data: datewiseFareData } = useDatewiseFare({
    tripType,
    from: datewiseFrom,
    to: datewiseTo,
    fromCode,
    toCode,
    startDate: datewiseDepartureDate,
    endDate: datewiseReturnDate,
    provider: "both",
    domain: process.env.NEXT_PUBLIC_DOMAIN,
    enabled: bookingType === "flight",
  });
  const datewiseFaresByDate = datewiseFareData?.faresByDate || {};
  const {
    data: holidayFromSuggestionResponse,
  } = useQuery({
    queryKey: [
      "holiday-package-suggestions",
      "from",
      debouncedFromSuggestionQuery,
      process.env.NEXT_PUBLIC_DOMAIN,
    ],
    queryFn: () =>
      fetchHolidayPackageSuggestions({
        term: debouncedFromSuggestionQuery,
        type: "from",
      }),
    enabled:
      bookingType === "holiday" &&
      fromSuggestionsOpen &&
      debouncedFromSuggestionQuery.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
  const {
    data: holidayToSuggestionResponse,
  } = useQuery({
    queryKey: [
      "holiday-package-suggestions",
      "to",
      debouncedToSuggestionQuery,
      process.env.NEXT_PUBLIC_DOMAIN,
    ],
    queryFn: () =>
      fetchHolidayPackageSuggestions({
        term: debouncedToSuggestionQuery,
        type: "to",
      }),
    enabled:
      bookingType === "holiday" &&
      toSuggestionsOpen &&
      debouncedToSuggestionQuery.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
  const {
    data: hotelSuggestionResponse = [],
  } = useQuery({
    queryKey: [
      "hotel-search-suggestions",
      debouncedToSuggestionQuery,
      process.env.NEXT_PUBLIC_DOMAIN,
    ],
    queryFn: () => fetchHotelSearchSuggestions(debouncedToSuggestionQuery),
    enabled:
      bookingType === "hotel" &&
      toSuggestionsOpen &&
      debouncedToSuggestionQuery.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
  const holidayFromSuggestions = normalizeHolidaySuggestions(
    holidayFromSuggestionResponse,
  );
  const holidayToSuggestions = normalizeHolidaySuggestions(
    holidayToSuggestionResponse,
  );
  const hotelSuggestions = hotelSuggestionResponse;

  const swapLocations = (index) => {
    if (typeof index === "number" && tripType === "multi") {
      setMultiCity((prev) =>
        prev.map((leg, i) =>
          i === index
            ? { ...leg, from: leg.to || "", to: leg.from || "" }
            : leg,
        ),
      );
      if (index === 0) {
        setFromCode(toCode);
        setToCode(fromCode);
      }
      return;
    }
    setFrom(to);
    setTo(from);
    setFromCode(toCode);
    setToCode(fromCode);
  };

  const addMultiLeg = () => {
    setMultiCity((prev) => {
      if (prev.length >= MAX_MULTI_CITY_ROUTES) {
        toast.error(`You can add up to ${MAX_MULTI_CITY_ROUTES} routes.`);
        return prev;
      }

      return [...prev, { from: "", to: "", departureDate: "" }];
    });
    setFlightDates((prev) => {
      if (prev.multi.length >= MAX_MULTI_CITY_ROUTES) return prev;

      return {
        ...prev,
        multi: [...prev.multi, { date: "" }],
      };
    });
  };

  const updateMultiLeg = (index, field, value) => {
    setMultiCity((prev) =>
      prev.map((leg, i) => (i === index ? { ...leg, [field]: value } : leg)),
    );
  };

  const removeMultiLeg = (index) => {
    setMultiCity((prev) =>
      prev.length > 2 ? prev.filter((_, i) => i !== index) : prev,
    );
    setFlightDates((prev) => ({
      ...prev,
      multi:
        prev.multi.length > 2
          ? prev.multi.filter((_, i) => i !== index)
          : prev.multi,
    }));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (travellerRef.current && !travellerRef.current.contains(e.target)) {
        setTravellerOpen(false);
        setTravellerOpend(false);
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
        setTravellerOpend(false);
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
  }, [activeSuggestion, travellerOpen, travellerOpend]);

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
      if (e.target.closest('[data-calendar-modal="true"]')) {
        return;
      }

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
    setCalendarTripType("round");
    setActiveCalendarField("return");
    setShowCalendar(true);
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

  const focusRefOnTab = (event, nextRef, previousRef = null) => {
    if (event.key !== "Tab") return;

    const targetRef = event.shiftKey ? previousRef : nextRef;
    if (!targetRef?.current) return;

    event.preventDefault();
    targetRef.current.focus();
  };

  const openNonFlightDatePicker = () => {
    if (bookingType === "hotel") {
      setShowHotelCalendar(true);
    } else if (bookingType === "holiday") {
      setShowHolidayCalendar(true);
    } else if (bookingType === "insurance") {
      setShowInsuranceCalendar(true);
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
    setMultiCity((prev) =>
      prev.map((leg, legIndex) =>
        legIndex === index ? { ...leg, departureDate: date } : leg,
      ),
    );
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

  const handleCalendarModeChange = (mode) => {
    const nextTripType = mode === "roundtrip" ? "round" : "oneway";
    setCalendarTripType(nextTripType);
    setTripType(nextTripType);
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

  const normalizeSearchDate = (value) => {
    if (!value) return "";

    const parsedDate = new Date(value);
    if (isNaN(parsedDate.getTime())) return "";

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatHotelApiDate = (value) => {
    if (!value) return "";
    const parsedDate = new Date(value);
    if (isNaN(parsedDate.getTime())) return "";

    const day = String(parsedDate.getDate()).padStart(2, "0");
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const year = parsedDate.getFullYear();

    return `${month}/${day}/${year}`;
  };

  const isValidHotelDateRange = (startValue, endValue) => {
    const startDate = new Date(startValue);
    const endDate = new Date(endValue);

    return (
      !Number.isNaN(startDate.getTime()) &&
      !Number.isNaN(endDate.getTime()) &&
      endDate > startDate
    );
  };

  const normalizePlaceValue = (value = "") =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s*\([^)]+\)\s*$/, "");

  const isSamePlace = (leftLabel, rightLabel, leftCode = "", rightCode = "") => {
    const normalizedLeftCode = String(leftCode || "").trim().toUpperCase();
    const normalizedRightCode = String(rightCode || "").trim().toUpperCase();

    if (
      normalizedLeftCode &&
      normalizedRightCode &&
      normalizedLeftCode === normalizedRightCode
    ) {
      return true;
    }

    return normalizePlaceValue(leftLabel) === normalizePlaceValue(rightLabel);
  };

  const handleSearch = async ({ tripType: incomingTripType, multiFlights } = {}) => {
    if (searchSubmitting) return;

    const finalTripType = incomingTripType || tripType;
    const normalizedPassengers = {
      adult: Number(passengers?.adult || 1),
      child: Number(passengers?.child || passengers?.children || 0),
      infant: Number(passengers?.infant || 0),
    };
    const normalizedTravelClass = String(travelClass || "Economy").toUpperCase();

    const getValidationMessage = (fieldKey) => {
      const messages = {
        flightFrom: "Select where you're flying from.",
        flightTo: "Select where you want to fly.",
        flightDepartureDate: "Choose your departure date.",
        flightReturnDate: "Choose your return date to search round-trip flights.",
        hotelDestination: "Choose the city or hotel destination.",
        hotelCheckIn: "Select your check-in date.",
        hotelCheckOut: "Select your check-out date.",
        holidayFrom: "Select your departure city for this holiday.",
        holidayTo: "Choose a destination, country, or category.",
        holidayDepartureDate: "Choose your holiday departure date.",
        insuranceDestination: "Choose where you are travelling.",
        insuranceStartDate: "Select your travel start date.",
        insuranceEndDate: "Select your return date.",
      };

      return messages[fieldKey] || "Please complete the required field.";
    };

    if (bookingType === "flight") {
      if (finalTripType === "multi") {
        const searchLegs = (multiFlights || multiCity).map((leg, index) => ({
          ...leg,
          departureDate:
            leg.departureDate ||
            leg.date ||
            flightDates.multi?.[index]?.date ||
            "",
        }));
        const incompleteLegIndex = searchLegs?.findIndex(
          (leg) => !leg?.from || !leg?.to || !leg?.departureDate,
        );

        if (incompleteLegIndex >= 0) {
          const leg = searchLegs?.[incompleteLegIndex];
          if (!leg?.from) {
            toast.error(`Select where you're flying from in trip ${incompleteLegIndex + 1}.`);
            return;
          }

          if (!leg?.to) {
            toast.error(`Select where you want to fly in trip ${incompleteLegIndex + 1}.`);
            return;
          }

          if (!leg?.departureDate) {
            toast.error(`Choose a departure date for trip ${incompleteLegIndex + 1}.`);
            return;
          }

          return;
        }
      } else {
        const startDate =
          finalTripType === "oneway"
            ? flightDates?.oneway?.start || normalizeSearchDate(departureDate)
            : flightDates?.round?.start || normalizeSearchDate(departureDate);
        const endDate =
          finalTripType === "round"
            ? flightDates?.round?.end || normalizeSearchDate(returnDate)
            : "";

        if (!from) {
          toast.error(getValidationMessage("flightFrom"));
          return;
        }

        if (!to) {
          toast.error(getValidationMessage("flightTo"));
          return;
        }

        if (!startDate) {
          toast.error(getValidationMessage("flightDepartureDate"));
          return;
        }

        if (finalTripType === "round" && !endDate) {
          toast.error(getValidationMessage("flightReturnDate"));
          return;
        }
      }
    }

    if (bookingType === "hotel" && (!to || !hotelStartDate || !hotelEndDate)) {
      if (!to) {
        toast.error(getValidationMessage("hotelDestination"));
      } else if (!hotelStartDate) {
        toast.error(getValidationMessage("hotelCheckIn"));
      } else {
        toast.error(getValidationMessage("hotelCheckOut"));
      }
      return;
    }

    if (
      bookingType === "hotel" &&
      !isValidHotelDateRange(hotelStartDate, hotelEndDate)
    ) {
      toast.error("Check-out date must be after check-in date.");
      return;
    }

    if (bookingType === "hotel") {
      const roomPayloads = normalizeHotelRoomPayloads(hotelGuestOpen);
      const hasMissingChildAge = roomPayloads.some((room) => {
        const children = Number(room.children || 0);
        return (
          children > 0 &&
          (room.childAges.length < children ||
            room.childAges.slice(0, children).some((age) => !age))
        );
      });

      if (hasMissingChildAge) {
        toast.error("Select age for each child.");
        return;
      }
    }

    if (bookingType === "holiday" && (!from || !to || !holidayStartDate)) {
      if (!from) {
        toast.error(getValidationMessage("holidayFrom"));
      } else if (!to) {
        toast.error(getValidationMessage("holidayTo"));
      } else {
        toast.error(getValidationMessage("holidayDepartureDate"));
      }
      return;
    }

    if (
      bookingType === "insurance" &&
      (
        !travellerDestination ||
        travellerDestination === "SELECT DESTINATION" ||
        !insuranceStartDate ||
        !insuranceEndDate
      )
    ) {
      if (
        !travellerDestination ||
        travellerDestination === "SELECT DESTINATION"
      ) {
        toast.error(getValidationMessage("insuranceDestination"));
      } else if (!insuranceStartDate) {
        toast.error(getValidationMessage("insuranceStartDate"));
      } else {
        toast.error(getValidationMessage("insuranceEndDate"));
      }
      return;
    }

    setSearchSubmitting(true);

    if (bookingType === "flight") {
      // MULTI CITY
      if (finalTripType === "multi") {
        const searchLegs = (multiFlights || multiCity).map((leg, index) => ({
          ...leg,
          departureDate:
            leg.departureDate ||
            leg.date ||
            flightDates.multi?.[index]?.date ||
            "",
        }));
        const hasInvalidLeg = searchLegs.some((leg) =>
          leg?.from &&
          leg?.to &&
          isSamePlace(leg.from, leg.to)
        );

        if (hasInvalidLeg) {
          setSearchSubmitting(false);
          toast.error("Departure and destination cannot be the same.");
          return;
        }

        const firstLeg = searchLegs?.[0];
        if (firstLeg?.from && firstLeg?.to && firstLeg?.departureDate) {
          try {
            await saveRecentFlightSearch({
              origin: firstLeg.from,
              destination: firstLeg.to,
              departureDate: firstLeg.departureDate,
            });
          } catch (error) {
            console.error("Failed to save recent flight search", error);
          }
        }

        const params = new URLSearchParams({
          tripType: "multi",
          adults: String(normalizedPassengers.adult),
          children: String(normalizedPassengers.child),
          infants: String(normalizedPassengers.infant),
          travelClass: normalizedTravelClass,
        });
        if (directOnly) params.set("stops", "0");
        searchLegs.forEach((leg, i) => {
          params.set(`from${i}`, leg.from || "");
          params.set(`to${i}`, leg.to || "");
          params.set(`date${i}`, leg.departureDate || "");
        });

        router.push(`/flights?${params.toString()}`);
        return;
      }

      // ROUND / ONEWAY
      const startDate =
        finalTripType === "oneway"
          ? flightDates.oneway.start || normalizeSearchDate(departureDate)
          : flightDates.round.start || normalizeSearchDate(departureDate);

      const endDate =
        finalTripType === "round"
          ? flightDates.round.end || normalizeSearchDate(returnDate)
          : "";

      if (from && to && isSamePlace(from, to, fromCode, toCode)) {
        setSearchSubmitting(false);
        toast.error("Departure and destination cannot be the same.");
        return;
      }

      try {
        await saveRecentFlightSearch({
          origin: fromCode || from,
          destination: toCode || to,
          departureDate: startDate,
          returnDate: endDate,
        });
      } catch (error) {
        console.error("Failed to save recent flight search", error);
      }

      const params = new URLSearchParams({
        from,
        to,
        tripType: finalTripType,
        start: startDate || "",
        end: endDate || "",
        adults: String(normalizedPassengers.adult),
        children: String(normalizedPassengers.child),
        infants: String(normalizedPassengers.infant),
        travelClass: normalizedTravelClass,
      });
      if (fromCode) params.set("origin", fromCode);
      if (toCode) params.set("destination", toCode);
      if (directOnly) params.set("stops", "0");
      router.push(`/flights?${params.toString()}`);
      return;
    }

    if (bookingType === "hotel") {
      try {
        const channel = createHotelSearchChannel();
        const checkInDate = normalizeSearchDate(hotelStartDate);
        const checkOutDate = normalizeSearchDate(hotelEndDate);
        const fetchedHotelSuggestions = selectedHotelLocation
          ? []
          : await fetchHotelSearchSuggestions(to);
        const matchedHotelLocation =
          selectedHotelLocation ||
          fetchedHotelSuggestions.find(
            (item) =>
              String(item.value || item.label || "").toLowerCase() ===
              String(to || "").toLowerCase(),
          ) ||
          fetchedHotelSuggestions[0];
        const hotelLocation = matchedHotelLocation || {
          label: to,
          value: to,
          locationId: toCode,
          geoCode: {},
        };
        const roomPayloads = normalizeHotelRoomPayloads(hotelGuestOpen);
        const roomTotals = getHotelRoomTotals(roomPayloads);
        const adults = roomTotals.adults;
        const children = roomTotals.children;
        const rooms = roomPayloads.length;
      const geoCode = {
        lat: Number(hotelLocation?.geoCode?.lat),
        long: Number(hotelLocation?.geoCode?.long),
      };
      const hasGeoCode = Number.isFinite(geoCode.lat) && Number.isFinite(geoCode.long);
      const destinationCountryCode =
        hotelLocation?.country ||
        hotelLocation?.countryCode ||
        hotelLocation?.raw?.country ||
        hotelLocation?.raw?.countryCode ||
        "";
      const locationPayload = hotelLocation?.raw || {
        id: hotelLocation?.locationId || toCode || "",
        name: hotelLocation?.label || hotelLocation?.value || to,
        fullName:
          hotelLocation?.detail ||
            hotelLocation?.label ||
            hotelLocation?.value ||
            to,
          code: null,
        type: hotelLocation?.type || "city",
        city: null,
        state: hotelLocation?.state || "",
        country: destinationCountryCode,
        score: 0,
        referenceId: null,
        ...(hasGeoCode ? { coordinates: geoCode } : {}),
      };
      const initPayload = {
          domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337",
          locations: [locationPayload],
          channel,
          ...(hasGeoCode ? { geoCode } : {}),
          locationId: hotelLocation?.locationId || toCode || "",
        currency: "INR",
        culture: "en-US",
        checkIn: formatHotelApiDate(hotelStartDate),
        checkOut: formatHotelApiDate(hotelEndDate),
        rooms: roomPayloads,
        agentCode: "14005",
        destinationCountryCode,
        nationality: "IN",
        countryOfResidence: "IN",
        channelId: "b2bIndiaDeals",
        affiliateRegion: "B2B_India",
        segmentId: "",
          companyId: "1",
          gstPercentage: 0,
          tdsPercentage: 0,
        };
        const searchContext = {
          channel,
          initPayload,
          city: hotelLocation?.value || hotelLocation?.label || to,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          rooms,
          adults,
          children,
          location: hotelLocation,
        };

        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem(HOTEL_SEARCH_RESULTS_KEY);
          window.sessionStorage.setItem(
            HOTEL_SEARCH_SESSION_KEY,
            JSON.stringify({
              ...searchContext,
              initResponse: null,
              initStatus: "pending",
            }),
          );
        }

        const params = new URLSearchParams({
          city: searchContext.city,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          channel,
          rooms: String(rooms),
          adults: String(adults),
          children: String(children),
        });

        const flatChildAges = roomPayloads.flatMap((room) => room.childAges);

        if (flatChildAges.length) {
          params.set("childAges", flatChildAges.join(","));
        }

        if (hotelLocation?.locationId || toCode) {
          params.set("locationId", hotelLocation?.locationId || toCode);
        }
        if (destinationCountryCode) {
          params.set("country", destinationCountryCode);
        }
        if (hotelLocation?.state) {
          params.set("state", hotelLocation.state);
        }

        const resultsUrl = `/hotels?${params.toString()}`;
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(HOTEL_LAST_SEARCH_URL_KEY, resultsUrl);
          } catch {
            // Ignore storage failures.
          }
        }
        router.push(resultsUrl);
      } catch (error) {
        setSearchSubmitting(false);
        toast.error(error.message || "Unable to start hotel search.");
      }
      return;
    }

    if (bookingType === "holiday") {
      const params = new URLSearchParams({
        from,
        to,
        date: holidayStartDate,
        rooms: String(totalRooms),
        adults: String(normalizedPassengers.adult),
        children: String(normalizedPassengers.child),
      });
      router.push(`/tour-list?${params.toString()}`);
    }

    if (bookingType === "insurance") {
      router.push(
        `/travel-insurance?destination=${travellerDestination}&start=${insuranceStartDate}&end=${insuranceEndDate}`,
      );
    }
  };

  const [showLoader, setShowLoader] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleMotionPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
      if (mediaQuery.matches) setVideoReady(true);
    };

    handleMotionPreference();
    mediaQuery.addEventListener("change", handleMotionPreference);

    return () =>
      mediaQuery.removeEventListener("change", handleMotionPreference);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setVideoReady(true);
      return;
    }

    setVideoReady(false);
    const fallbackTimer = window.setTimeout(() => {
      setVideoReady(true);
    }, 3500);

    return () => window.clearTimeout(fallbackTimer);
  }, [heroData.videoUrl, prefersReducedMotion]);

  useEffect(() => {
    // Logged-in users must wait for:
    // 1. Hero API
    // 2. Video readiness
    if (isLoggedIn) {
      setShowLoader(heroLoading || !videoReady);
      return;
    }

    // Logged-out users:
    // Hero API may fail fast → ignore it
    // Only wait for video
    setShowLoader(!videoReady);
  }, [isLoggedIn, heroLoading, videoReady]);
  useEffect(() => {
    if (!showLoader && onReady) {
      onReady();
    }
  }, [showLoader, onReady]);

  useEffect(() => {
    if (bookingType !== "flight") setIsMultiTripMobile(false);
  }, [bookingType]);

  // personalize handler

  const handlePersonalize = (e) => {
    // onPersonalize?.(e);

    if (isMobile) {
      setItineraryOpen(false);
      setMobileItineraryOpen(true);
    } else {
      setMobileItineraryOpen(false);
      setItineraryOpen(true);
    }
  };

  const openLoginModal = () => {
    setAuthView("login");
    setAuthModalKey((current) => current + 1);
    setShowLogin(true);
  };

  const closeAuthModal = () => {
    setShowLogin(false);
    setAuthView("login");
  };

  const navigateAuthModal = (view) => {
    setAuthView(view);
    setAuthModalKey((current) => current + 1);
    setShowLogin(true);
  };

  return (
    <>
      <div
        className={`${styles.customLoaderContainer} ${
          !showLoader ? styles.loaderClose : styles.loaderOpen
        }`}
      >
        <CustomLoaderHomePage />
      </div>

      <section className="relative w-full h-[100vh]">
        <div
          className={`${styles.menuSection} ${
            menuOpen ? styles.menuOpen : styles.menuClose
          }`}
        >
          <div className={`${styles.navContainer} top-0 z-20`}>
            <div
              className={`${styles.navbar}  w-full flex  justify-between items-center`}
            >
              <Link
                href="/"
                className="cursor-pointer"
                onClick={() => setMenuOpen(false)}
              >
                <BrandLogo fallbackSrc="/Logo.svg" alt="Target Tours Logo" />
              </Link>
              <div className={`${styles.navRight} flex gap-3`}>
                <button
                  className={`${styles.glass_button} ${styles.downloadBtn}`}
                >
                  Download the App
                </button>
                {!isLoggedIn ? (
                  <button
                    className={`${styles.signInBtn} ${styles.downloadBtnMobile}`}
                    onClick={openLoginModal}
                  >
                    Sign In
                  </button>
                ) : (
                  <>
                    <button
                      ref={profileBtnRef}
                      onClick={() => setShowProfileModal(true)}
                      className={`${styles.glass_button} ${styles.logggedInBtn} ${styles.downloadBtnMobile} ${styles.logggedInBtnSidebar}`}
                      type="button"
                    >
                      Hi, {displayName}
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
              {!isLoggedIn && (
                <button
                  onClick={openLoginModal}
                  className={styles.accountBtn}
                >
                  ACCOUNT LOGIN
                </button>
              )}
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
          {prefersReducedMotion ? (
            <img
              className="absolute inset-0 w-full h-full object-cover"
              src="/images/hero-poster.jpg"
              alt=""
              loading="eager"
              decoding="async"
            />
          ) : (
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src={heroData.videoUrl}
              poster="/images/hero-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              disablePictureInPicture
              preload="metadata"
              aria-hidden="true"
              onLoadedMetadata={() => setVideoReady(true)}
              onLoadedData={() => setVideoReady(true)}
              onCanPlay={() => setVideoReady(true)}
              onError={() => setVideoReady(true)}
            />
          )}
          <img className={styles.gradient} src="/images/gradient.png" />
        </header>
        <div className={`${styles.overlay} absolute inset-0`}></div>
        <div
          className={`${styles.navContainer} absolute top-0 z-[1002] ${
            menuOpen ? "hidden" : ""
          }`}
        >
          <div
            className={`${styles.navbar}  w-full flex  justify-between items-center`}
          >
            <Link href="/" className="cursor-pointer">
              <BrandLogo fallbackSrc="/Logo.svg" alt="Target Tours Logo" />
            </Link>
            <div className={`${styles.navRight} flex gap-3`}>
              <button
                className={`${styles.glass_button} ${styles.downloadBtn}`}
              >
                Download the App
              </button>
              {!isLoggedIn ? (
                <button
                  className={styles.signInBtn}
                  onClick={openLoginModal}
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
                    Hi, {displayName}
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
          <div className={styles.tabsLayout}>

         
          <div className={styles.InspiredSection}>
            <h1>{heroData.heading}</h1>
            <p>{heroData.description}</p>
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
                  className={`${styles.feature} ${
                    activeFeature === f.id ? styles.featureActive : ""
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



          {/* =======================================below search filed============================================ */}

          <div
            className={`${styles.searchSec} flex flex-col gap-[127px] items-center`}
          >
            <div
              className={`${styles.searchPanelWrapper} ${
                bookingType === "holiday" || bookingType === "insurance"
                  ? styles.noAnimation
                  : ""
              } ${
                bookingType === "flight" && tripType === "multi"
                  ? styles.multiCitySearchPanel
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
                        className={`${styles.round_tripBtn} ${
                          tripType === "round" ? styles.activeTrip : ""
                        }`}
                        onClick={() => handleTripTypeChange("round")}
                      >
                        Round-trip
                      </button>

                      <button
                        className={`${styles.round_tripBtn} ${
                          tripType === "oneway" ? styles.activeTrip : ""
                        }`}
                        onClick={() => handleTripTypeChange("oneway")}
                      >
                        One-way
                      </button>

                      <button
                        className={`${styles.round_tripBtn} ${
                          tripType === "multi" ? styles.activeTrip : ""
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
                          className={`${styles.arrowbox} ${
                            tripType === "oneway"
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
                                setFromCode("");
                              } else {
                                setFrom(e.target.value);
                                setFromCode("");
                                setFromSuggestionsOpen(true);
                              }
                            }}
                          />

                          {fromSuggestionsOpen && (
                            <AirportSuggestionBox
                              boxRef={fromSuggestionRef}
                              query={
                                tripType === "multi"
                                  ? multiCity[0]?.from || ""
                                  : from
                              }
                              fallbackSuggestions={recentSearches}
                              field="from"
                              onSelect={(s) => selectSuggestion(s, "from", 0)}
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
                                setToCode("");
                              } else {
                                setTo(e.target.value);
                                setToCode("");
                                setToSuggestionsOpen(true);
                              }
                            }}
                          />

                          {toSuggestionsOpen && (
                            <AirportSuggestionBox
                              boxRef={toSuggestionRef}
                              query={
                                tripType === "multi" ? multiCity[0]?.to || "" : to
                              }
                              fallbackSuggestions={recentSearches}
                              field="to"
                              onSelect={(s) => selectSuggestion(s, "to", 0)}
                            />
                          )}
                        </div>

                        <div
                          className={`${styles.fromBtn} ${styles.fromBtn2} ${
                            tripType === "oneway" || tripType === "multi"
                              ? styles.growRight
                              : ""
                          } ${styles.calendarAnchor}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (tripType === "multi") {
                              setCalendarTripType("oneway");
                              setActiveCalendarField("departure");
                              setActiveMultiIndex(0);
                              setShowCalendar(true);
                            } else {
                              setCalendarTripType("oneway");
                              if (tripType === "round")
                                setCalendarTripType("round");
                              setActiveCalendarField("departure");
                              setShowCalendar(true);
                            }
                          }}
                        >
                          <div className={styles.lable}>Departure Date</div>

                          {showCalendar &&
                            activeCalendarField === "departure" &&
                            (tripType !== "multi" ||
                              activeMultiIndex === 0) && (
                              <DateCalendarModal
                                mode={
                                  tripType === "round" ? "roundtrip" : "oneway"
                                }
                                onModeChange={handleCalendarModeChange}
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
                                          : flightDates.multi[
                                              activeMultiIndex ?? 0
                                            ]?.date
                                    }
                                    endDate={
                                      tripType === "round"
                                        ? flightDates.round.end
                                        : null
                                    }
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
                              if (tripType === "multi") {
                                setCalendarTripType("oneway");
                                setActiveCalendarField("departure");
                                setActiveMultiIndex(0);
                                setShowCalendar(true);
                              } else {
                                setCalendarTripType("oneway");
                                if (tripType === "round")
                                  setCalendarTripType("round");
                                setActiveCalendarField("departure");
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
                          className={`${styles.fromBtn} ${styles.fromInput} ${
                            styles.returnDateField
                          } ${
                            tripType === "oneway" || tripType === "multi"
                              ? styles.hiddenField
                              : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();

                            if (tripType === "round") {
                              setCalendarTripType("round");
                              setActiveCalendarField("return");
                              setShowCalendar(true);
                            }
                          }}
                        >
                          <div className={styles.lable}>Return Date</div>
                          {showCalendar &&
                            tripType === "round" &&
                            activeCalendarField === "return" && (
                              <DateCalendarModal
                                mode="roundtrip"
                                onModeChange={handleCalendarModeChange}
                                onClose={() => {
                                  setShowCalendar(false);
                                  setActiveMultiIndex(null);
                                }}
                              >
                                <div ref={calendarRef}>
                                  <CalendarMonths
                                    startDate={flightDates.round.start}
                                    endDate={flightDates.round.end}
                                    onDateClick={handleDateClick}
                                    price={true}
                                    faresByDate={datewiseFaresByDate}
                                  />
                                </div>
                              </DateCalendarModal>
                            )}
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
                          className={`${styles.fromBtn} ${styles.fromBtn2} ${
                            tripType === "oneway" || tripType === "multi"
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
                                `${totalPassengers} Traveller${
                                  totalPassengers > 1 ? "s" : ""
                                }, ${travelClass}`,
                                17,
                              )}
                            </div>

                            <ChevronDown
                              className={`${styles.chevron} ${
                                travellerOpend
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
                          className={`${styles.searchBtn} ${
                            tripType === "multi" ? styles.hiddenField : ""
                          } ${searchSubmitting ? styles.searchBtnLoading : ""}`}
                          onClick={handleSearch}
                          aria-disabled={searchSubmitting}
                        >
                          {searchSubmitting ? (
                            <span className={styles.searchSpinner}></span>
                          ) : (
                            <img src="/images/searchIcon.svg" alt="" />
                          )}
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
                                      e.target.value,
                                    )
                                  }
                                />

                                {activeSuggestion &&
                                  activeSuggestion.index === actualIndex &&
                                  activeSuggestion.field === "from" && (
                                    <AirportSuggestionBox
                                      boxRef={(el) =>
                                        (multiSuggestionRefs.current[
                                          actualIndex
                                        ] = el)
                                      }
                                      query={leg.from || ""}
                                      fallbackSuggestions={recentSearches}
                                      field="from"
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
                                      e.target.value,
                                    )
                                  }
                                />

                                {activeSuggestion &&
                                  activeSuggestion.index === actualIndex &&
                                  activeSuggestion.field === "to" && (
                                    <AirportSuggestionBox
                                      boxRef={(el) =>
                                        (multiSuggestionRefs.current[
                                          actualIndex
                                        ] = el)
                                      }
                                      query={leg.to || ""}
                                      fallbackSuggestions={recentSearches}
                                      field="to"
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
                                      onModeChange={handleCalendarModeChange}
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
                                              date,
                                            );
                                            setShowCalendar(false);
                                            setActiveMultiIndex(null);
                                          }}
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
                                      flightDates.multi[actualIndex]?.date,
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
                                  className={`${styles.multisearchBtn} ${
                                    searchSubmitting ? styles.searchBtnLoading : ""
                                  }`}
                                  onClick={handleSearch}
                                  aria-disabled={searchSubmitting}
                                >
                                  {searchSubmitting ? "Searching..." : "Search"}
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
                        <div className={styles.multiCityActions}>
                          <button
                            type="button"
                            className={styles.addMultiCityBtn}
                            onClick={addMultiLeg}
                            disabled={multiCity.length >= MAX_MULTI_CITY_ROUTES}
                          >
                            + Add another city
                          </button>
                          <span className={styles.multiCityLimit}>
                            {multiCity.length}/{MAX_MULTI_CITY_ROUTES} routes
                          </span>
                        </div>
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
                    className={`${styles.serarchingContBottom} ${
                      bookingType === "holiday" ? styles.swapActive : ""
                    }`}
                  >
                    {bookingType === "insurance" ? (
                      // <div
                      //   className={`${styles.fromBtn} ${styles.pos1}`}
                      //   onClick={handleFieldClick}
                      // >

                      //   <div className={`${styles.lable} ${styles.labelFade}`}>
                      //     TRAVEL DESTINATION
                      //   </div>
                      //   <div className={styles.iconCont}>
                      //     <div className={styles.contant}>
                      //       SELECT DESTINATION
                      //     </div>

                      //     <ChevronDown
                      //       className={`${styles.chevron} ${travellerOpend
                      //         ? styles.openChevron
                      //         : styles.closeChevron
                      //         }`}
                      //       size={16}
                      //       color="#FFFFFF"
                      //     />
                      //   </div>
                      // </div>
                      <div
                        className={`${styles.fromBtn} ${styles.pos1}`}
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDestinationSearch((prev) => !prev);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setShowDestinationSearch((prev) => !prev);
                            return;
                          }

                          focusRefOnTab(event, nonFlightStartDateRef);
                        }}
                      >
                        <div className={`${styles.lable} ${styles.labelFade}`}>
                          TRAVEL DESTINATION
                        </div>

                        <div className={styles.iconCont}>
                          <div className={styles.contant}>
                            {travellerDestination || "SELECT DESTINATION"}
                          </div>

                          <ChevronDown
                            className={`${styles.chevron} ${
                              showDestinationSearch
                                ? styles.openChevron
                                : styles.closeChevron
                            }`}
                            size={16}
                            color="#FFFFFF"
                          />
                        </div>

                        {/* DROPDOWN */}
                        {showDestinationSearch && (
                          <div
                            className={styles.destinationDropdown}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <RecentSearch
                              onSelect={(city) => {
                                setTravellerDestination(city); // ✅ set destination
                                setShowDestinationSearch(false); // ✅ close dropdown
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      // <TravellerSelector
                      //   travellerClass={travellerDestination}
                      //   setTravellerClass={setTravellerDestination}
                      //   travellerOptions={TravellerDestinationOptions}
                      //   styles={styles}
                      //   name="TRAVEL DESTINATION"
                      //   className={``}
                      //   enableEllipsis={false}
                      // />
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
                              setToCode("");
                              setSelectedHotelLocation(null);
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
                          onKeyDown={(event) => {
                            if (bookingType === "hotel") {
                              focusRefOnTab(event, nonFlightStartDateRef);
                              return;
                            }

                            focusRefOnTab(event, toInputRef);
                          }}
                        />

                        {bookingType === "hotel" && toSuggestionsOpen && (
                          <SuggestionBox
                            boxRef={toSuggestionRef}
                            anchorRef={toInputRef}
                            heading="HOTEL DESTINATIONS"
                            suggestions={hotelSuggestions}
                            onSelect={selectHotelSuggestion}
                          />
                        )}
                        {bookingType === "holiday" && fromSuggestionsOpen && (
                          <>
                            <SuggestionBox
                              boxRef={fromSuggestionRef}
                              anchorRef={fromInputRef}
                              heading="PACKAGE SUGGESTIONS"
                              suggestions={holidayFromSuggestions}
                              onSelect={(s) => selectSuggestion(s, "from")}
                            />
                          </>
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
                          onModeChange={() => {}}
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
                          onModeChange={() => {}}
                          onClose={() => setShowHolidayCalendar(false)}
                          showModeToggle={false}
                        >
                          <div ref={holidayCalendarRef}>
                            <CalendarMonths
                              startDate={holidayStartDate}
                              endDate={null}
                              onDateClick={handleHolidayDateClick}
                              price={false}
                            />
                          </div>
                        </DateCalendarModal>
                      )}

                      {/* Insurance Calendar */}
                      {bookingType === "insurance" && showInsuranceCalendar && (
                        <DateCalendarModal
                          mode="roundtrip"
                          onModeChange={() => {}}
                          // onClose={() => setShowInsuranceCalendar(false)}
                        >
                          <div ref={insuranceCalendarRef}>
                            <CalendarMonths
                              startDate={insuranceStartDate}
                              endDate={insuranceEndDate}
                              onDateClick={handleInsuranceDateClick}
                              price={false}
                            />
                          </div>
                        </DateCalendarModal>
                      )}

                      <div
                        className={`${styles.dateInputWrapper} ${styles.contentFade}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openNonFlightDatePicker();
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openNonFlightDatePicker();
                            return;
                          }

                          focusRefOnTab(
                            event,
                            bookingType === "hotel"
                              ? nonFlightEndDateRef
                              : travellerRef,
                            bookingType === "holiday" ? toInputRef : toInputRef,
                          );
                        }}
                      >
                        <input
                          ref={nonFlightStartDateRef}
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
                      className={`${styles.fromBtn} ${styles.pos3} ${
                        styles.swapField
                      } ${
                        bookingType === "holiday" ? "" : styles.calendarAnchor
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
                              setToCode("");
                              setSelectedHotelLocation(null);
                              setToSuggestionsOpen(true);
                            }}
                            onFocus={() => setToSuggestionsOpen(true)}
                            onKeyDown={(event) => {
                              focusRefOnTab(event, nonFlightStartDateRef, fromInputRef);
                            }}
                          />

                          {toSuggestionsOpen && (
                            <SuggestionBox
                              boxRef={toSuggestionRef}
                              anchorRef={toInputRef}
                              heading={
                                bookingType === "hotel"
                                  ? "HOTEL DESTINATIONS"
                                  : "PACKAGE SUGGESTIONS"
                              }
                              suggestions={
                                bookingType === "hotel"
                                  ? hotelSuggestions
                                  : holidayToSuggestions
                              }
                              onSelect={(s) =>
                                bookingType === "hotel"
                                  ? selectHotelSuggestion(s)
                                  : selectSuggestion(s, "to")
                              }
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
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              if (bookingType === "hotel") {
                                setShowHotelCalendar(true);
                              } else if (bookingType === "insurance") {
                                setShowInsuranceCalendar(true);
                              }
                              return;
                            }

                            focusRefOnTab(event, travellerRef, nonFlightStartDateRef);
                          }}
                        >
                          <input
                            ref={nonFlightEndDateRef}
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
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTravellerOpend((prev) => !prev);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setTravellerOpend((prev) => !prev);
                          return;
                        }

                        focusRefOnTab(
                          event,
                          nonFlightSearchRef,
                          bookingType === "hotel"
                            ? nonFlightEndDateRef
                            : nonFlightStartDateRef,
                        );
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
                              ? `${hotelGuestCount} Guest${
                                  hotelGuestCount > 1 ? "s" : ""
                                }, ${hotelRoomCount} Room${
                                  hotelRoomCount > 1 ? "s" : ""
                                }`
                              : bookingType === "holiday"
                                ? `${totalRooms} Room${
                                    totalRooms > 1 ? "s" : ""
                                  }, ${totalHolidayGuests} Guest${
                                    totalHolidayGuests > 1 ? "s" : ""
                                  }`
                                : `${totalPassengers} Traveller${
                                    totalPassengers > 1 ? "s" : ""
                                  }, ${travelClass}`,
                            17,
                          )}
                        </div>

                        <ChevronDown
                          className={`${styles.chevron} ${
                            travellerOpend
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
                        <HolidayGuestSelector
                          open={travellerOpend}
                          setOpen={setTravellerOpend}
                          passengers={passengers}
                          setPassengers={setPassengers}
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

                    <div
                      ref={nonFlightSearchRef}
                      className={`${styles.searchBtn} ${styles.pos5} ${
                        searchSubmitting ? styles.searchBtnLoading : ""
                      }`}
                      role="button"
                      tabIndex={0}
                      onClick={handleSearch}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleSearch();
                          return;
                        }

                        focusRefOnTab(event, null, travellerRef);
                      }}
                      aria-disabled={searchSubmitting}
                    >
                      {searchSubmitting ? (
                        <span className={styles.searchSpinner}></span>
                      ) : (
                        <img src="/images/searchIcon.svg" alt="" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile sections remain same as original with DateField */}
        {/* Mobile sections remain same as original with DateField */}
        {bookingType === "flight" && (
          <FlightSearchMobile
            tripType={tripType}
            setTripType={setTripType}
            setIsMultiTripMobile={setIsMultiTripMobile}
            styles={styles}
            swapLocations={swapLocations}
            from={from}
            setFrom={setFrom}
            setFromCode={setFromCode}
            to={to}
            setTo={setTo}
            setToCode={setToCode}
            handleSearch={handleSearch}
            isSearchLoading={searchSubmitting}
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
            faresByDate={datewiseFaresByDate}
            truncate={truncate}
          />
        )}

        {bookingType === "hotel" && (
          <HotelSearchMobile
            handleSearch={handleSearch}
            styles={styles}
            to={to}
            setTo={(value) => {
              setTo(value);
              setToCode("");
              setSelectedHotelLocation(null);
            }}
            onHotelSelect={(location) => {
              setSelectedHotelLocation(location || null);
              setToCode(location?.locationId || location?.id || "");
            }}
            checkIn={hotelStartDate}
            setCheckIn={setHotelStartDate}
            checkOut={hotelEndDate}
            setCheckOut={setHotelEndDate}
            travellerOpen={travellerOpen}
            setTravellerOpen={setTravellerOpen}
            totalPassengers={hotelGuestCount}
            passengers={hotelGuestOpen}
            setPassengers={setHotelGuestOpen}
            travelClass={travelClass}
            setTravelClass={setTravelClass}
            truncate={truncate}
          />
        )}

        {bookingType === "holiday" && (
          <HolidaySearchMobile
            handleSearch={handleSearch}
            styles={styles}
            from={from}
            setFrom={setFrom}
            to={to}
            setTo={setTo}
            departureDate={holidayStartDate}
            setDepartureDate={setHolidayStartDate}
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
            handleSearch={handleSearch}
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
            key={`login-${authModalKey}`}
            onClose={closeAuthModal}
            onNavigate={navigateAuthModal}
          />
        )}

        {showLogin && authView === "signup" && (
          <SignupPopup
            key={`signup-${authModalKey}`}
            onClose={closeAuthModal}
            onNavigate={navigateAuthModal}
          />
        )}
      </section>

      {isMobile ? (
        <MobileItinerary
          type={itineraryType}
          isOpen={itineraryOpen}
          hotel={sampleHotel}
          onClose={() => {
            setItineraryOpen(false);
            setIternaryType(null);
          }}
        />
      ) : (
        <CustomItinerary
          type={itineraryType}
          isOpen={itineraryOpen}
          hotel={sampleHotel}
          onClose={() => {
            setItineraryOpen(false);
            setIternaryType(null);
          }}
        />
      )}
    </>
  );
};

export default HomePage;

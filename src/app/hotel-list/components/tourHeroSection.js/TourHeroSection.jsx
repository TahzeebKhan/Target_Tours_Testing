"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./TourHeroSection.module.css";
import Navbar from "@/app/flights/Navbar";
import DateField from "@/app/home-page/components/homePage/DateField";
import TravellerSelector from "@/app/home-page/components/homePage/TravellerSelector";
import SuggestionBox from "@/app/home-page/components/homePage/SuggestionBox";
import { ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import HotelDateCalendarModal from "@/shared/components/hotelCalendar/HotelDateCalendarModal";
import HotelCalendarMonths from "@/shared/components/hotelCalendar/HotelCalendarMonths";
import { CalendarSVG } from "@/app/flights/components/SVGFile";
import HotelDropDown from "@/shared/components/hotelDropDown/HotelDropDown";
import {
  HOTEL_SEARCH_SESSION_KEY,
  HOTEL_SEARCH_RESULTS_EVENT,
  HOTEL_SEARCH_RESULTS_KEY,
  createHotelSearchChannel,
  fetchHotelSearchSuggestions,
  initHotelSearch,
  subscribeHotelSearchChannel,
} from "@/shared/services/hotelSearch";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const safeSetSessionStorage = (key, value) => {
  if (typeof window === "undefined") return false;

  try {
    window.sessionStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Unable to cache ${key} in sessionStorage:`, error);
    return false;
  }
};

const TourHeroSection = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchedCity = searchParams.get("city") || "";
  const hotelSearchChannel = searchParams.get("channel") || "";
  const [from, setFrom] = useState(searchedCity);
  const [to, setTo] = useState(searchParams.get("city") || "");
  const [toCode, setToCode] = useState(searchParams.get("locationId") || "");
  const [selectedHotelLocation, setSelectedHotelLocation] = useState(null);
  const [searchSubmitting, setSearchSubmitting] = useState(false);
  const [departureDate, setDepartureDate] = useState(
    searchParams.get("checkIn") || "",
  );
  const [guestRoomCount, setGuestRoomCount] = useState("SELECT ROOMS");
  const departureRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const hotelCalendarRef = useRef(null);
  const [showHotelCalendar, setShowHotelCalendar] = useState(false);
  const [hotelStartDate, setHotelStartDate] = useState(
    searchParams.get("checkIn") || "",
  );
  const [hotelEndDate, setHotelEndDate] = useState(
    searchParams.get("checkOut") || "",
  );

  // Ye lines add karein:
  const [travellerOpen, setTravellerOpen] = useState(false);
  const [hotelGuestOpen, setHotelGuestOpen] = useState({
    room: Number(searchParams.get("rooms") || 1),
    adults: Number(searchParams.get("adults") || 1),
    children: Number(searchParams.get("children") || 0),
    pets: 0,
  });

  const [travelClass, setTravelClass] = useState("Economy");

  // Ye line bhi add karein:
  const totalHotelGuests =
    hotelGuestOpen.adults + hotelGuestOpen.children + hotelGuestOpen.pets;
  const totalHotelRooms = hotelGuestOpen.room;

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
  const hotelSearchSocketRef = useRef(null);
  const initStartedChannelsRef = useRef(new Set());
  const initRequestStartRef = useRef(null);
  const firstSocketResponseRef = useRef(false);
  const socketResponseCountRef = useRef(0);

  const { data: hotelSuggestions = [] } = useQuery({
    queryKey: [
      "hotel-list-search-suggestions",
      from,
      process.env.NEXT_PUBLIC_DOMAIN,
    ],
    queryFn: () => fetchHotelSearchSuggestions(from),
    enabled: showFromSuggestion && from.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!hotelSearchChannel) return;

    let effectClosed = false;
    const socketTimer = window.setTimeout(() => {
      hotelSearchSocketRef.current?.close();
      hotelSearchSocketRef.current = subscribeHotelSearchChannel(
        hotelSearchChannel,
        {
          onOpen: async () => {
            if (effectClosed || initStartedChannelsRef.current.has(hotelSearchChannel)) {
              return;
            }

            const storedSearch = window.sessionStorage.getItem(
              HOTEL_SEARCH_SESSION_KEY,
            );
            let searchContext = null;

            try {
              searchContext = storedSearch ? JSON.parse(storedSearch) : null;
            } catch {
              searchContext = null;
            }

            const initSkipReason =
              searchContext?.channel !== hotelSearchChannel
                ? "session channel does not match URL channel"
                : !searchContext?.initPayload
                  ? "missing initPayload in sessionStorage"
                  : searchContext?.initResponse
                    ? "initResponse already exists in sessionStorage"
                    : "";

            if (initSkipReason) {
              console.log("[Hotel timing] init API skipped", {
                channel: hotelSearchChannel,
                reason: initSkipReason,
                sessionChannel: searchContext?.channel,
                initStatus: searchContext?.initStatus,
                hasInitPayload: Boolean(searchContext?.initPayload),
                hasInitResponse: Boolean(searchContext?.initResponse),
              });
              return;
            }

            initStartedChannelsRef.current.add(hotelSearchChannel);

            try {
              const initStartedAt = performance.now();
              initRequestStartRef.current = initStartedAt;
              firstSocketResponseRef.current = false;
              socketResponseCountRef.current = 0;

              console.log("[Hotel timing] init API started", {
                channel: hotelSearchChannel,
                startedAt: new Date().toISOString(),
              });

              const initResponse = await initHotelSearch(searchContext.initPayload);
              console.log("[Hotel timing] init API response received", {
                channel: hotelSearchChannel,
                durationMs: Math.round(performance.now() - initStartedAt),
                response: initResponse,
              });

              safeSetSessionStorage(
                HOTEL_SEARCH_SESSION_KEY,
                JSON.stringify({
                  ...searchContext,
                  initResponse,
                  initStatus: "complete",
                }),
              );
            } catch (error) {
              initStartedChannelsRef.current.delete(hotelSearchChannel);
              safeSetSessionStorage(
                HOTEL_SEARCH_SESSION_KEY,
                JSON.stringify({
                  ...searchContext,
                  initStatus: "failed",
                  initError: error.message || "Hotel search init failed",
                }),
              );
              toast.error(error.message || "Unable to start hotel search.");
            } finally {
              setSearchSubmitting(false);
            }
          },
          onError: () => {
            console.warn("Hotel list socket connection failed.");
            setSearchSubmitting(false);
          },
          onClose: (event) => {
            console.warn("Hotel list socket closed.", {
              code: event.code,
              reason: event.reason,
              wasClean: event.wasClean,
            });
          },
          onMessage: (payload) => {
            if (payload?.channel && payload.channel !== hotelSearchChannel) {
              return;
            }

            socketResponseCountRef.current += 1;
            const initStart = initRequestStartRef.current;
            const elapsedFromInitMs = initStart
              ? Math.round(performance.now() - initStart)
              : null;
            const socketType =
              payload?.type ||
              payload?.data?.type ||
              payload?.data?.content?.type ||
              "UNKNOWN";
            const content = payload?.data?.content || payload?.data || payload;
            const hotelCount =
              content?.mergedHotels?.length ||
              content?.curatedHotels?.length ||
              content?.hotels?.length ||
              0;

            console.log("[Hotel timing] socket response", {
              channel: payload?.channel || hotelSearchChannel,
              responseNumber: socketResponseCountRef.current,
              type: socketType,
              hotelCount,
              elapsedFromInitMs,
              receivedAt: new Date().toISOString(),
            });

            if (!firstSocketResponseRef.current && initStart) {
              firstSocketResponseRef.current = true;
              console.log("[Hotel timing] first socket response after init", {
                channel: payload?.channel || hotelSearchChannel,
                type: socketType,
                hotelCount,
                elapsedFromInitMs,
              });
            }

            const cachedPayload = window.sessionStorage.getItem(
              HOTEL_SEARCH_RESULTS_KEY,
            );
            let cachedResult = null;

            try {
              cachedResult = cachedPayload ? JSON.parse(cachedPayload) : null;
            } catch {
              cachedResult = null;
            }

            if (payload?.type === "HOTEL_MERGED_RESPONSE") {
              window.sessionStorage.removeItem(HOTEL_SEARCH_RESULTS_KEY);
            } else if (cachedResult?.type !== "HOTEL_MERGED_RESPONSE") {
              const didCacheResults = safeSetSessionStorage(
                HOTEL_SEARCH_RESULTS_KEY,
                JSON.stringify(payload),
              );

              if (!didCacheResults) {
                window.sessionStorage.removeItem(HOTEL_SEARCH_RESULTS_KEY);
              }
            }

            window.dispatchEvent(
              new CustomEvent(HOTEL_SEARCH_RESULTS_EVENT, {
                detail: payload,
              }),
            );
          },
        },
      );
    }, 0);

    return () => {
      effectClosed = true;
      window.clearTimeout(socketTimer);
      hotelSearchSocketRef.current?.close();
      hotelSearchSocketRef.current = null;
    };
  }, [hotelSearchChannel]);

  const handleFromSelect = (suggestion) => {
    setSelectedHotelLocation(suggestion || null);
    setFrom(suggestion?.value || suggestion?.label || "");
    setTo(suggestion?.value || suggestion?.label || "");
    setToCode(suggestion?.locationId || suggestion?.id || "");
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

      if (toWrapperRef.current && !toWrapperRef.current.contains(e.target)) {
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

  const normalizeSearchDate = (value) => {
    if (!value) return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

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

  const handleHotelSearch = async () => {
    if (searchSubmitting) return;

    if (!from.trim()) {
      toast.error("Choose the city or hotel destination.");
      return;
    }

    if (!hotelStartDate) {
      toast.error("Select your check-in date.");
      return;
    }

    if (!hotelEndDate) {
      toast.error("Select your check-out date.");
      return;
    }

    setSearchSubmitting(true);

    try {
      const channel = createHotelSearchChannel();
      const checkInDate = normalizeSearchDate(hotelStartDate);
      const checkOutDate = normalizeSearchDate(hotelEndDate);
      const fetchedHotelSuggestions = selectedHotelLocation
        ? []
        : await fetchHotelSearchSuggestions(from);
      const matchedHotelLocation =
        selectedHotelLocation ||
        fetchedHotelSuggestions.find(
          (item) =>
            String(item.value || item.label || "").toLowerCase() ===
            String(from || "").toLowerCase(),
        ) ||
        fetchedHotelSuggestions[0];
      const hotelLocation = matchedHotelLocation || {
        label: from,
        value: from,
        locationId: toCode,
        geoCode: {},
      };
      const adults = Math.max(1, Number(hotelGuestOpen?.adults || 1));
      const children = Math.max(0, Number(hotelGuestOpen?.children || 0));
      const rooms = Math.max(1, Number(hotelGuestOpen?.room || 1));
      const geoCode = {
        lat: Number(hotelLocation?.geoCode?.lat),
        long: Number(hotelLocation?.geoCode?.long),
      };
      const hasGeoCode =
        Number.isFinite(geoCode.lat) && Number.isFinite(geoCode.long);
      const locationPayload = hotelLocation?.raw || {
        id: hotelLocation?.locationId || toCode || "",
        name: hotelLocation?.label || hotelLocation?.value || from,
        fullName:
          hotelLocation?.detail ||
          hotelLocation?.label ||
          hotelLocation?.value ||
          from,
        code: null,
        type: hotelLocation?.type || "city",
        city: null,
        state: hotelLocation?.state || "",
        country: hotelLocation?.country || "IN",
        score: 0,
        referenceId: null,
        ...(hasGeoCode ? { coordinates: geoCode } : {}),
      };
      const initPayload = {
        locations: [locationPayload],
        channel,
        ...(hasGeoCode ? { geoCode } : {}),
        locationId: hotelLocation?.locationId || toCode || "",
        currency: "INR",
        culture: "en-US",
        checkIn: formatHotelApiDate(hotelStartDate),
        checkOut: formatHotelApiDate(hotelEndDate),
        rooms: [
          {
            adults: String(adults),
            children: String(children),
            childAges: [],
          },
        ],
        agentCode: "14005",
        destinationCountryCode: hotelLocation?.country || "IN",
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
        city: hotelLocation?.value || hotelLocation?.label || from,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        rooms,
        adults,
        children,
        location: hotelLocation,
      };

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(HOTEL_SEARCH_RESULTS_KEY);
        safeSetSessionStorage(
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

      if (hotelLocation?.locationId || toCode) {
        params.set("locationId", hotelLocation?.locationId || toCode);
      }

      setFrom(searchContext.city);
      setTo(searchContext.city);
      setToCode(hotelLocation?.locationId || toCode || "");
      setSelectedHotelLocation(hotelLocation);
      router.push(`/hotel-list?${params.toString()}`);
    } catch (error) {
      setSearchSubmitting(false);
      toast.error(error.message || "Unable to start hotel search.");
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
                  setTo(e.target.value);
                  setToCode("");
                  setSelectedHotelLocation(null);
                  setShowFromSuggestion(true);
                }}
                onFocus={() => setShowFromSuggestion(true)}
              />

              {showFromSuggestion && (
                <SuggestionBox
                  boxRef={fromSuggestionRef}
                  anchorRef={fromWrapperRef}
                  heading="HOTEL DESTINATIONS"
                  suggestions={hotelSuggestions}
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
                  {truncate(
                    `${totalHotelGuests} Guest${totalHotelGuests === 1 ? "" : "s"}, ${totalHotelRooms} Room${totalHotelRooms === 1 ? "" : "s"}`,
                    20,
                  )}
                </div>

                <ChevronDown
                  className={`${styles.chevron} ${travellerOpen ? styles.openChevron : styles.closeChevron}`}
                  size={20}
                  color="#FFFFFF"
                />
              </div>

              <HotelDropDown
                open={travellerOpen}
                setOpen={setTravellerOpen}
                passengers={hotelGuestOpen}
                setPassengers={setHotelGuestOpen}
                travelClass={travelClass}
                setTravelClass={setTravelClass}
              />
            </div>

            {/* Search Button */}
            <div
              className={`${styles.searchBtn} ${styles.pos5} ${
                searchSubmitting ? styles.searchBtnLoading : ""
              }`}
              role="button"
              tabIndex={0}
              onClick={handleHotelSearch}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleHotelSearch();
                }
              }}
              aria-disabled={searchSubmitting}
            >
              {searchSubmitting ? (
                <span className={styles.searchSpinner}></span>
              ) : (
                <img src="/icons/blueSearchIcon.svg" alt="" />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.textcontainer}>
        <p className={styles.para}>Showing Stays in</p>
        <h2 className={styles.heading}>{searchedCity || "CANADA"}</h2>
      </div>
    </section>
  );
};

export default TourHeroSection;

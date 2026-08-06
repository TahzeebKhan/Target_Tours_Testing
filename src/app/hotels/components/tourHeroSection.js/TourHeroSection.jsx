"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./TourHeroSection.module.css";
import Navbar from "@/app/flights/Navbar";
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
  HOTEL_LAST_SEARCH_URL_KEY,
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

const parseSocketValue = (value) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const getSocketContent = (payload = {}) => {
  const data = parseSocketValue(payload?.data);
  return parseSocketValue(data?.content || data?.data?.content) || data || payload;
};

const getFirstHotelMetaValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "") || "";

const compactHotelInit = (init = {}, fallback = {}) => ({
  searchId:
    init?.searchId ||
    init?.search_id ||
    init?.searchid ||
    fallback?.searchId ||
    fallback?.search_id ||
    fallback?.searchid ||
    "",
  hotelSearchId:
    init?.hotelSearchId ||
    init?.hotel_search_id ||
    init?.hotel_search_key ||
    fallback?.hotelSearchId ||
    fallback?.hotel_search_id ||
    fallback?.hotel_search_key ||
    "",
  searchTracingKey:
    init?.searchTracingKey ||
    init?.search_tracing_key ||
    init?.roomsSearchTracingKey ||
    init?.TUI ||
    fallback?.searchTracingKey ||
    fallback?.search_tracing_key ||
    fallback?.roomsSearchTracingKey ||
    fallback?.TUI ||
    "",
});

const buildSlimHotelSearchResult = (payload = {}, fallbackChannel = "") => {
  const data = parseSocketValue(payload?.data) || payload;
  const content = getSocketContent(payload);
  const hotelSets = [
    { source: "merged", hotels: content?.mergedHotels },
    { source: "curated", hotels: content?.curatedHotels },
    { source: "hotels", hotels: content?.hotels },
    { source: "hotels", hotels: data?.hotels },
    { source: "hotels", hotels: payload?.hotels },
  ];
  const result = hotelSets.find(({ hotels }) => Array.isArray(hotels) && hotels.length);

  if (!result) return null;

  const init = content?.init || data?.init || payload?.init || {};
  const searchId = getFirstHotelMetaValue(
    content?.searchId,
    content?.search_id,
    content?.searchid,
    init?.searchId,
    init?.search_id,
    init?.searchid,
    data?.searchId,
    data?.search_id,
    payload?.searchId,
    payload?.search_id,
  );
  const hotelSearchId = getFirstHotelMetaValue(
    content?.hotelSearchId,
    content?.hotel_search_id,
    content?.hotel_search_key,
    data?.hotelSearchId,
    data?.hotel_search_id,
    payload?.hotelSearchId,
    payload?.hotel_search_id,
  );
  const searchTracingKey = getFirstHotelMetaValue(
    content?.searchTracingKey,
    content?.search_tracing_key,
    init?.searchTracingKey,
    init?.search_tracing_key,
    data?.searchTracingKey,
    data?.search_tracing_key,
    payload?.searchTracingKey,
    payload?.search_tracing_key,
  );
  const type =
    payload?.type ||
    content?.type ||
    data?.type ||
    payload?.data?.content?.type ||
    "HOTEL_RESULTS";

  return {
    channel: payload?.channel || fallbackChannel,
    type,
    source: result.source,
    hotelCount: result.hotels.length,
    searchId,
    hotelSearchId,
    searchTracingKey,
  };
};

const rememberHotelSearchUrl = (url) => {
  if (typeof window === "undefined" || !url) return;

  try {
    window.localStorage.setItem(HOTEL_LAST_SEARCH_URL_KEY, url);
  } catch {
    // Ignore storage failures.
  }
};

const syncHotelSearchMetaToUrl = ({ searchId, hotelSearchId } = {}) => {
  if (typeof window === "undefined" || (!searchId && !hotelSearchId)) return;

  const url = new URL(window.location.href);
  let didChange = false;

  if (searchId && url.searchParams.get("searchId") !== searchId) {
    url.searchParams.set("searchId", searchId);
    didChange = true;
  }

  if (hotelSearchId && url.searchParams.get("hotelSearchId") !== hotelSearchId) {
    url.searchParams.set("hotelSearchId", hotelSearchId);
    didChange = true;
  }

  if (didChange) {
    window.history.replaceState(window.history.state, "", url.toString());
  }
};

const parseChildAgesParam = (value = "") =>
  String(value || "")
    .split(",")
    .map((age) => age.trim())
    .filter(Boolean);

const parseNumberListParam = (value = "") =>
  String(value || "")
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));

const buildRoomsFromUrlParams = (params) => {
  const roomCount = Math.max(1, Number(params.get("rooms") || 1));
  const roomAdults = parseNumberListParam(params.get("roomAdults"));
  const roomChildren = parseNumberListParam(params.get("roomChildren"));
  const childAges = parseChildAgesParam(params.get("childAges"));

  if (!roomAdults.length && !roomChildren.length) {
    return normalizeHotelRoomPayloads({
      room: roomCount,
      adults: Number(params.get("adults") || 1),
      children: Number(params.get("children") || 0),
      childAges,
    });
  }

  let childAgeIndex = 0;
  const rooms = Array.from({ length: roomCount }, (_, index) => {
    const children = Math.max(0, Number(roomChildren[index] || 0));
    const roomChildAges = childAges.slice(childAgeIndex, childAgeIndex + children);
    childAgeIndex += children;

    return {
      adults: String(Math.max(1, Number(roomAdults[index] || 1))),
      children: String(children),
      childAges: roomChildAges,
    };
  });

  return normalizeHotelRoomPayloads({ rooms });
};

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

const normalizeHotelApiDateFromUrl = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
};

const getHotelRoomTotals = (rooms = []) => ({
  adults: rooms.reduce((sum, room) => sum + Number(room.adults || 0), 0),
  children: rooms.reduce((sum, room) => sum + Number(room.children || 0), 0),
});

const createHotelSearchContextFromUrl = (channel) => {
  if (typeof window === "undefined" || !channel) return null;

  const params = new URLSearchParams(window.location.search);
  const city = params.get("city") || params.get("location") || "";
  const checkIn = params.get("checkIn") || params.get("checkin") || "";
  const checkOut = params.get("checkOut") || params.get("checkout") || "";
  if (!city || !checkIn || !checkOut) return null;

  const rooms = buildRoomsFromUrlParams(params);
  const totals = getHotelRoomTotals(rooms);
  const locationId = params.get("locationId") || "";
  const lat = Number(params.get("lat"));
  const long = Number(params.get("long"));
  const hasGeoCode = Number.isFinite(lat) && Number.isFinite(long);
  const location = {
    id: locationId,
    locationId,
    label: city,
    value: city,
    detail: city,
    country: params.get("country") || "IN",
    type: "city",
    ...(hasGeoCode ? { geoCode: { lat, long } } : {}),
  };
  const locationPayload = {
    id: locationId,
    name: city,
    fullName: city,
    code: null,
    type: "city",
    city: null,
    state: params.get("state") || "",
    country: params.get("country") || "IN",
    score: 0,
    referenceId: null,
    ...(hasGeoCode ? { coordinates: { lat, long } } : {}),
  };
  const initPayload = {
    domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337",
    locations: [locationPayload],
    channel,
    locationId,
    currency: "INR",
    culture: "en-US",
    checkIn: normalizeHotelApiDateFromUrl(checkIn),
    checkOut: normalizeHotelApiDateFromUrl(checkOut),
    rooms,
    agentCode: "14005",
    ...(hasGeoCode ? { geoCode: { lat, long } } : {}),
    destinationCountryCode: location.country,
    nationality: "IN",
    countryOfResidence: "IN",
    channelId: "b2bIndiaDeals",
    affiliateRegion: "B2B_India",
    segmentId: "",
    companyId: "1",
    gstPercentage: 0,
    tdsPercentage: 0,
  };

  return {
    channel,
    initPayload,
    city,
    checkIn,
    checkOut,
    rooms: rooms.length,
    adults: totals.adults,
    children: totals.children,
    location,
    searchId: params.get("searchId") || "",
    hotelSearchId: params.get("hotelSearchId") || "",
  };
};

const syncHotelSearchIdToUrl = (hotelSearchId) => {
  syncHotelSearchMetaToUrl({ hotelSearchId });
};

const readStoredHotelRooms = () => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.sessionStorage.getItem(HOTEL_SEARCH_SESSION_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed?.initPayload?.rooms) ? parsed.initPayload.rooms : [];
  } catch {
    return [];
  }
};

const TourHeroSection = ({ resultsPath = "/hotels" } = {}) => {
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
  const [guestRoomCount, setGuestRoomCount] = useState("CHECK ROOMS");
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
  const [hotelGuestOpen, setHotelGuestOpen] = useState(() => {
    const storedRooms = readStoredHotelRooms();
    const fallbackRooms = buildRoomsFromUrlParams(searchParams);
    const rooms = storedRooms.length ? normalizeHotelRoomPayloads({ rooms: storedRooms }) : fallbackRooms;
    const totals = getHotelRoomTotals(rooms);

    return {
      room: rooms.length,
      adults: totals.adults,
      children: totals.children,
      childAges: rooms.flatMap((room) => room.childAges),
      rooms,
      pets: 0,
    };
  });

  const [travelClass, setTravelClass] = useState("Economy");

  // Ye line bhi add karein:
  const hotelRoomPayloadsForSummary = normalizeHotelRoomPayloads(hotelGuestOpen);
  const hotelRoomTotalsForSummary = getHotelRoomTotals(hotelRoomPayloadsForSummary);
  const totalHotelGuests =
    hotelRoomTotalsForSummary.adults +
    hotelRoomTotalsForSummary.children +
    Number(hotelGuestOpen.pets || 0);
  const totalHotelRooms = hotelRoomPayloadsForSummary.length;

  // Truncate function:
  const truncate = (str, maxLength) => {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + "...";
  };

  const fromWrapperRef = useRef(null);
  const fromSuggestionRef = useRef(null);
  const [showFromSuggestion, setShowFromSuggestion] = useState(false);
  const [debouncedFromSuggestionQuery, setDebouncedFromSuggestionQuery] = useState("");
  const toWrapperRef = useRef(null);
  const toSuggestionRef = useRef(null);

  const [showToSuggestion, setShowToSuggestion] = useState(false);
  const hotelSearchSocketRef = useRef(null);
  const initStartedChannelsRef = useRef(new Set());
  const initRequestStartRef = useRef(null);
  const firstSocketResponseRef = useRef(false);
  const socketResponseCountRef = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedFromSuggestionQuery(from.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [from]);

  const { data: hotelSuggestions = [] } = useQuery({
    queryKey: [
      "hotel-list-search-suggestions",
      debouncedFromSuggestionQuery,
      process.env.NEXT_PUBLIC_DOMAIN,
    ],
    queryFn: () => fetchHotelSearchSuggestions(debouncedFromSuggestionQuery),
    enabled: showFromSuggestion && debouncedFromSuggestionQuery.length >= 2,
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
               console.log("searchContext",searchContext)
            } catch {
              searchContext = null;
            }

            if (
              (!searchContext ||
                searchContext.channel !== hotelSearchChannel ||
                !searchContext.initPayload) &&
              typeof window !== "undefined"
            ) {
              const urlSearchContext = createHotelSearchContextFromUrl(hotelSearchChannel);
              if (urlSearchContext?.initPayload) {
                searchContext = {
                  ...urlSearchContext,
                  initResponse: null,
                  initStatus: "pending",
                };
                safeSetSessionStorage(
                  HOTEL_SEARCH_SESSION_KEY,
                  JSON.stringify(searchContext),
                );
              }
            }

            const initSkipReason =
              searchContext?.channel !== hotelSearchChannel
                ? "session channel does not match URL channel"
                : !searchContext?.initPayload
                  ? "missing initPayload in sessionStorage"
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
              window.sessionStorage.removeItem(HOTEL_SEARCH_RESULTS_KEY);
              safeSetSessionStorage(
                HOTEL_SEARCH_SESSION_KEY,
                JSON.stringify({
                  ...searchContext,
                  initResponse: null,
                  initStatus: "pending",
                }),
              );

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

              const latestStoredSearch = window.sessionStorage.getItem(
                HOTEL_SEARCH_SESSION_KEY,
              );
              let latestSearchContext = searchContext;

              try {
                latestSearchContext = latestStoredSearch
                  ? JSON.parse(latestStoredSearch)
                  : searchContext;
              } catch {
                latestSearchContext = searchContext;
              }
 console.log("latestSearchContext",latestSearchContext)
              const hotelSearchId =
                latestSearchContext?.hotelSearchId ||
                initResponse?.hotelSearchId ||
                initResponse?.hotel_search_id ||
                initResponse?.hotel_search_key ||
                "";
              const searchId =
                latestSearchContext?.searchId ||
                latestSearchContext?.searchid ||
                initResponse?.searchId ||
                initResponse?.search_id ||
                initResponse?.searchid ||
                initResponse?.data?.searchId ||
                initResponse?.data?.search_id ||
                initResponse?.data?.searchid ||
                initResponse?.init?.searchId ||
                initResponse?.init?.search_id ||
                initResponse?.init?.searchid ||
                "";

              syncHotelSearchMetaToUrl({ searchId, hotelSearchId });
              safeSetSessionStorage(
                HOTEL_SEARCH_SESSION_KEY,
                JSON.stringify({
                  ...latestSearchContext,
                  searchId,
                  hotelSearchId,
                  init: compactHotelInit(
                    latestSearchContext?.init ||
                      initResponse?.init ||
                      initResponse?.data?.init ||
                      {},
                    { searchId, hotelSearchId },
                  ),
                  initResponse: null,
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
            const socketHotelSearchId =
              content?.hotelSearchId ||
              content?.hotel_search_id ||
              content?.hotel_search_key ||
              payload?.hotelSearchId ||
              payload?.hotel_search_id ||
              payload?.hotel_search_key ||
              "";
            const socketSearchId =
              content?.searchId ||
              content?.search_id ||
              content?.searchid ||
              content?.init?.searchId ||
              content?.init?.search_id ||
              content?.init?.searchid ||
              payload?.searchId ||
              payload?.search_id ||
              payload?.searchid ||
              "";

            syncHotelSearchMetaToUrl({
              searchId: socketSearchId,
              hotelSearchId: socketHotelSearchId,
            });
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

            if (socketType === "HOTEL_INIT_COMPLETE" && content?.init) {
              const storedSearch = window.sessionStorage.getItem(
                HOTEL_SEARCH_SESSION_KEY,
              );
              let searchContext = null;

              try {
                searchContext = storedSearch ? JSON.parse(storedSearch) : null;
              } catch {
                searchContext = null;
              }

              if (!searchContext?.channel || searchContext.channel === hotelSearchChannel) {
                const hotelSearchId =
                  content.hotelSearchId ||
                  content.hotel_search_id ||
                  content.hotel_search_key ||
                  searchContext?.hotelSearchId ||
                  "";
                const searchId =
                  content.init.searchId ||
                  content.init.search_id ||
                  content.init.searchid ||
                  searchContext?.searchId ||
                  searchContext?.search_id ||
                  searchContext?.searchid ||
                  "";

                syncHotelSearchMetaToUrl({ searchId, hotelSearchId });
                safeSetSessionStorage(
                  HOTEL_SEARCH_SESSION_KEY,
                  JSON.stringify({
                    ...(searchContext || {}),
                    channel: searchContext?.channel || hotelSearchChannel,
                    init: compactHotelInit(content.init, {
                      searchId,
                      hotelSearchId,
                    }),
                    initResponse: null,
                    initStatus: "complete",
                    searchId,
                    hotelSearchId,
                    searchTracingKey:
                      content.init.searchTracingKey ||
                      searchContext?.searchTracingKey ||
                      "",
                  }),
                );
              }
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
              const slimPayload = buildSlimHotelSearchResult(
                payload,
                hotelSearchChannel,
              );
              const didCacheResults = safeSetSessionStorage(
                HOTEL_SEARCH_RESULTS_KEY,
                JSON.stringify(slimPayload),
              );

              if (!slimPayload || !didCacheResults) {
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

;

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

    const selectedRoomPayloads = normalizeHotelRoomPayloads(hotelGuestOpen);
    const hasMissingChildAge = selectedRoomPayloads.some((room) => {
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
      const roomPayloads = normalizeHotelRoomPayloads(hotelGuestOpen);
      const roomTotals = getHotelRoomTotals(roomPayloads);
      const adults = roomTotals.adults;
      const children = roomTotals.children;
      const rooms = roomPayloads.length;
      const geoCode = {
        lat: Number(hotelLocation?.geoCode?.lat),
        long: Number(hotelLocation?.geoCode?.long),
      };
      const hasGeoCode =
        Number.isFinite(geoCode.lat) && Number.isFinite(geoCode.long);
      const destinationCountryCode =
        hotelLocation?.country ||
        hotelLocation?.countryCode ||
        hotelLocation?.raw?.country ||
        hotelLocation?.raw?.countryCode ||
        "";
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
        city: hotelLocation?.value || hotelLocation?.label || from,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        rooms,
        adults,
        children,
        location: hotelLocation,
        searchType: hotelLocation?.type || hotelLocation?.raw?.type || "",
        selectedHotelName:
          String(hotelLocation?.type || hotelLocation?.raw?.type || "")
            .trim()
            .toLowerCase() === "hotel"
            ? hotelLocation?.value || hotelLocation?.label || from
            : "",
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

      const flatChildAges = roomPayloads.flatMap((room) => room.childAges);

      if (flatChildAges.length) {
        params.set("childAges", flatChildAges.join(","));
      }
      params.set(
        "roomAdults",
        roomPayloads.map((room) => room.adults).join(","),
      );
      params.set(
        "roomChildren",
        roomPayloads.map((room) => room.children).join(","),
      );

      if (hotelLocation?.locationId || toCode) {
        params.set("locationId", hotelLocation?.locationId || toCode);
      }
      if (destinationCountryCode) {
        params.set("country", destinationCountryCode);
      }
      if (hotelLocation?.state) {
        params.set("state", hotelLocation.state);
      }

      setFrom(searchContext.city);
      setTo(searchContext.city);
      setToCode(hotelLocation?.locationId || toCode || "");
      setSelectedHotelLocation(hotelLocation);
      const resultsUrl = `${resultsPath}?${params.toString()}`;
      rememberHotelSearchUrl(resultsUrl);
      router.push(resultsUrl);
    } catch (error) {
      setSearchSubmitting(false);
      toast.error(error.message || "Unable to start hotel search.");
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
      {/* <div className={styles.textcontainer}>
        <p className={styles.para}>Showing Stays in</p>
        <h2 className={styles.heading}>{searchedCity || "CANADA"}</h2>
      </div> */}
    </section>
  );
};

export default TourHeroSection;

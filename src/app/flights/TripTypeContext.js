"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  storeFlightSearchParams,
  useFlightSearchParams,
} from "./hooks/useFlightSearchParams";
import {
  RECENT_SEARCHES_QUERY_KEY,
  saveRecentFlightSearch,
} from "@/shared/services/recentSearch";
import { toast } from "react-toastify";

const TripTypeContext = createContext(null);

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTomorrowDate = () => {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 1);
  return formatLocalDate(nextDate);
};

const DEFAULT_FLIGHT_SEARCH = {
  tripType: "oneway",
  from: "Delhi (DEL)",
  to: "Bangalore (BLR)",
  fromCode: "DEL",
  toCode: "BLR",
  startDate: getTomorrowDate(),
  endDate: null,
  passengers: {
    adult: 1,
    child: 0,
    infant: 0,
  },
  travelClass: "ECONOMY",
  fareTypes: [],
};

const SENIOR_CITIZEN_FARE = "SENIOR CITIZEN";
const STUDENT_FARE = "STUDENT";
const MAX_MULTI_CITY_ROUTES = 4;
const MIN_MULTI_CITY_ROUTES = 2;

const EMPTY_MULTI_SEGMENT = { from: "", to: "", date: "" };

const parseCodeFromLabel = (label = "") => {
  const match = String(label || "").match(/\(([^)]+)\)/);
  return match ? match[1].trim().toUpperCase() : "";
};

const getRouteLabel = (label = "", code = "") => {
  const normalizedCode = String(code || "").trim().toUpperCase();
  const currentLabel = String(label || "").trim();

  if (!normalizedCode) return currentLabel;

  const labelCode = parseCodeFromLabel(currentLabel);
  if (labelCode && labelCode === normalizedCode) {
    return currentLabel;
  }

  return currentLabel ? `${currentLabel} (${normalizedCode})` : normalizedCode;
};

const getSyncedRoute = ({ from = "", to = "", fromCode = "", toCode = "" }) => ({
  from: getRouteLabel(from, fromCode),
  to: getRouteLabel(to, toCode),
  fromCode: String(fromCode || "").trim().toUpperCase(),
  toCode: String(toCode || "").trim().toUpperCase(),
});

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

const isTruthyParam = (value = "") => {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "true" || normalized === "1";
};

const getFareTypesFromParams = (getParam) => {
  if (isTruthyParam(getParam("IsStudentFare"))) {
    return [STUDENT_FARE];
  }
  if (isTruthyParam(getParam("IsSeniorCitizen"))) {
    return [SENIOR_CITIZEN_FARE];
  }
  return [];
};

const normalizeMultiSegments = (segments = []) => {
  const normalized = segments
    .slice(0, MAX_MULTI_CITY_ROUTES)
    .map((segment) => ({
      from: String(segment?.from || "").trim(),
      to: String(segment?.to || "").trim(),
      date: String(segment?.date || "").trim(),
    }));

  while (normalized.length < MIN_MULTI_CITY_ROUTES) {
    normalized.push({ ...EMPTY_MULTI_SEGMENT });
  }

  return normalized;
};

const getMultiSegmentsFromParams = (getParam, fallbackRoute, fallbackDate) => {
  const segments = [];

  for (let index = 0; index < MAX_MULTI_CITY_ROUTES; index += 1) {
    const segment = {
      from: getParam(`from${index}`),
      to: getParam(`to${index}`),
      date: getParam(`date${index}`),
    };

    if (segment.from || segment.to || segment.date) {
      segments.push(segment);
    }
  }

  if (segments.length > 0) {
    return normalizeMultiSegments(segments);
  }

  return normalizeMultiSegments([
    {
      from: fallbackRoute?.from || DEFAULT_FLIGHT_SEARCH.from,
      to: fallbackRoute?.to || DEFAULT_FLIGHT_SEARCH.to,
      date: fallbackDate || DEFAULT_FLIGHT_SEARCH.startDate,
    },
    { ...EMPTY_MULTI_SEGMENT },
  ]);
};

/**
 * Provider
 */
export function TripTypeProvider({ children }) {
  const searchParams = useFlightSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Helper to safely get params
  const getParam = (key) => searchParams?.get(key) || "";

  const [tripType, setTripType] = useState(
    getParam("tripType") || DEFAULT_FLIGHT_SEARCH.tripType
  );
  const initialFromParam = getParam("from") || getParam("from0");
  const initialToParam = getParam("to") || getParam("to0");
  const initialStartParam = getParam("start") || getParam("date0");
  const initialRoute = getSyncedRoute({
    from: initialFromParam || DEFAULT_FLIGHT_SEARCH.from,
    to: initialToParam || DEFAULT_FLIGHT_SEARCH.to,
    fromCode:
      getParam("origin") ||
      parseCodeFromLabel(initialFromParam) ||
      DEFAULT_FLIGHT_SEARCH.fromCode,
    toCode:
      getParam("destination") ||
      parseCodeFromLabel(initialToParam) ||
      DEFAULT_FLIGHT_SEARCH.toCode,
  });
  const [from, setFrom] = useState(initialRoute.from);
  const [to, setTo] = useState(initialRoute.to);
  const [fromCode, setFromCode] = useState(initialRoute.fromCode);
  const [toCode, setToCode] = useState(initialRoute.toCode);
  const [startDate, setStartDate] = useState(
    initialStartParam || DEFAULT_FLIGHT_SEARCH.startDate
  );
  const [endDate, setEndDate] = useState(getParam("end") || null);
  const [passengers, setPassengers] = useState({
    adult: Number(getParam("adults") || DEFAULT_FLIGHT_SEARCH.passengers.adult),
    child: Number(getParam("children") || 0),
    infant: Number(getParam("infants") || 0),
  });
  const [travelClass, setTravelClass] = useState(
    getParam("travelClass") || DEFAULT_FLIGHT_SEARCH.travelClass
  );
  const [multiSegments, setMultiSegments] = useState(() =>
    getMultiSegmentsFromParams(
      getParam,
      initialRoute,
      initialStartParam || DEFAULT_FLIGHT_SEARCH.startDate
    )
  );
  const [selectedFareTypes, setSelectedFareTypes] = useState(() =>
    getFareTypesFromParams(getParam)
  );
  const [committedSearches, setCommittedSearches] = useState({
    oneway: {
      from: initialRoute.from || DEFAULT_FLIGHT_SEARCH.from,
      to: initialRoute.to || DEFAULT_FLIGHT_SEARCH.to,
    },
    round: {
      from: initialRoute.from || DEFAULT_FLIGHT_SEARCH.from,
      to: initialRoute.to || DEFAULT_FLIGHT_SEARCH.to,
    },
    multi: {
      from: initialRoute.from || DEFAULT_FLIGHT_SEARCH.from,
      to: initialRoute.to || DEFAULT_FLIGHT_SEARCH.to,
    },
  });
  const [committedRequest, setCommittedRequest] = useState({
    tripType: getParam("tripType") || DEFAULT_FLIGHT_SEARCH.tripType,
    from: initialRoute.from || DEFAULT_FLIGHT_SEARCH.from,
    to: initialRoute.to || DEFAULT_FLIGHT_SEARCH.to,
    fromCode: initialRoute.fromCode || DEFAULT_FLIGHT_SEARCH.fromCode,
    toCode: initialRoute.toCode || DEFAULT_FLIGHT_SEARCH.toCode,
    startDate: getParam("start") || DEFAULT_FLIGHT_SEARCH.startDate,
    endDate: getParam("end") || null,
    passengers: {
      adult: Number(getParam("adults") || DEFAULT_FLIGHT_SEARCH.passengers.adult),
      child: Number(getParam("children") || 0),
      infant: Number(getParam("infants") || 0),
    },
    travelClass: getParam("travelClass") || DEFAULT_FLIGHT_SEARCH.travelClass,
    fareTypes: getFareTypesFromParams(getParam),
  });
  const [isSearchSubmitting, setIsSearchSubmitting] = useState(false);
  const [searchRefreshToken, setSearchRefreshToken] = useState(0);
  const refreshFlightSearch = () => setSearchRefreshToken(Date.now());

  // Effect to update state when URL params change (e.g. on navigation)
  useEffect(() => {
    const pTripType = getParam("tripType");
    const pFrom = getParam("from") || getParam("from0");
    const pTo = getParam("to") || getParam("to0");
    const pOrigin = getParam("origin") || parseCodeFromLabel(pFrom);
    const pDestination = getParam("destination") || parseCodeFromLabel(pTo);
    const pStart = getParam("start") || getParam("date0");
    const pEnd = getParam("end");
    const pAdults = Number(
      getParam("adults") || DEFAULT_FLIGHT_SEARCH.passengers.adult
    );
    const pChildren = Number(getParam("children") || 0);
    const pInfants = Number(getParam("infants") || 0);
    const pTravelClass =
      getParam("travelClass") || DEFAULT_FLIGHT_SEARCH.travelClass;
    const pFareTypes = getFareTypesFromParams(getParam);
    const hasIndexedMultiSearch = Boolean(
      (getParam("from0") || getParam("origin0")) &&
      (getParam("to0") || getParam("destination0")) &&
      getParam("date0")
    );
    const hasSearchDetails = Boolean(
      ((pFrom || pOrigin) && (pTo || pDestination)) || hasIndexedMultiSearch
    );
    const syncedRoute = getSyncedRoute({
      from: pFrom || DEFAULT_FLIGHT_SEARCH.from,
      to: pTo || DEFAULT_FLIGHT_SEARCH.to,
      fromCode: pOrigin || DEFAULT_FLIGHT_SEARCH.fromCode,
      toCode: pDestination || DEFAULT_FLIGHT_SEARCH.toCode,
    });

    setTripType(pTripType || DEFAULT_FLIGHT_SEARCH.tripType);
    setFrom(syncedRoute.from || DEFAULT_FLIGHT_SEARCH.from);
    setTo(syncedRoute.to || DEFAULT_FLIGHT_SEARCH.to);
    setFromCode(syncedRoute.fromCode || DEFAULT_FLIGHT_SEARCH.fromCode);
    setToCode(syncedRoute.toCode || DEFAULT_FLIGHT_SEARCH.toCode);
    setStartDate(pStart || DEFAULT_FLIGHT_SEARCH.startDate);
    if (pEnd) setEndDate(pEnd);
    if (!pEnd) setEndDate(null);
    setPassengers({
      adult: pAdults,
      child: pChildren,
      infant: pInfants,
    });
    setTravelClass(pTravelClass);
    setMultiSegments(getMultiSegmentsFromParams(getParam, syncedRoute, pStart));
    setSelectedFareTypes(pFareTypes);

    setCommittedSearches(prev => ({
        ...prev,
        [pTripType || DEFAULT_FLIGHT_SEARCH.tripType]: {
          from:
            syncedRoute.from ||
            prev[pTripType || DEFAULT_FLIGHT_SEARCH.tripType].from,
          to:
            syncedRoute.to ||
            prev[pTripType || DEFAULT_FLIGHT_SEARCH.tripType].to,
        }
      }));

    setCommittedRequest({
        tripType: pTripType || DEFAULT_FLIGHT_SEARCH.tripType,
        from: syncedRoute.from,
        to: syncedRoute.to,
        fromCode: syncedRoute.fromCode || DEFAULT_FLIGHT_SEARCH.fromCode,
        toCode: syncedRoute.toCode || DEFAULT_FLIGHT_SEARCH.toCode,
        startDate: pStart || DEFAULT_FLIGHT_SEARCH.startDate,
        endDate: pEnd || null,
        passengers: {
          adult: pAdults,
          child: pChildren,
          infant: pInfants,
        },
        travelClass: pTravelClass,
        fareTypes: pFareTypes,
      });

    if (!hasSearchDetails) {
      const nextParams = new URLSearchParams(searchParams?.toString() || "");
      nextParams.set("tripType", pTripType || DEFAULT_FLIGHT_SEARCH.tripType);
      nextParams.set("from", DEFAULT_FLIGHT_SEARCH.from);
      nextParams.set("to", DEFAULT_FLIGHT_SEARCH.to);
      nextParams.set("origin", DEFAULT_FLIGHT_SEARCH.fromCode);
      nextParams.set("destination", DEFAULT_FLIGHT_SEARCH.toCode);
      nextParams.set("start", pStart || DEFAULT_FLIGHT_SEARCH.startDate);
      nextParams.set("adults", String(DEFAULT_FLIGHT_SEARCH.passengers.adult));
      nextParams.set("children", "0");
      nextParams.set("infants", "0");
      nextParams.set("travelClass", DEFAULT_FLIGHT_SEARCH.travelClass);
      nextParams.delete("IsSeniorCitizen");
      nextParams.delete("IsStudentFare");
      nextParams.delete("end");
      nextParams.delete("page");

      router.replace(`/flights?${nextParams.toString()}`);
    }

  }, [searchParams, router]);


  const handleSearch = async () => {
    if (isSearchSubmitting) return;

    setIsSearchSubmitting(true);

    const syncedRoute = getSyncedRoute({
      from: from || committedSearches?.[tripType]?.from || DEFAULT_FLIGHT_SEARCH.from,
      to: to || committedSearches?.[tripType]?.to || DEFAULT_FLIGHT_SEARCH.to,
      fromCode,
      toCode,
    });
    let fallbackFrom = syncedRoute.from || DEFAULT_FLIGHT_SEARCH.from;
    let fallbackTo = syncedRoute.to || DEFAULT_FLIGHT_SEARCH.to;
    let normalizedFromCode = syncedRoute.fromCode;
    let normalizedToCode = syncedRoute.toCode;
    let searchStartDate = startDate;
    const normalizedMultiSegments = normalizeMultiSegments(multiSegments);

    if (tripType === "multi") {
      const partialSegment = normalizedMultiSegments.find((segment) => {
        const hasAnyField = Boolean(segment.from || segment.to || segment.date);
        const hasAllFields = Boolean(segment.from && segment.to && segment.date);
        return hasAnyField && !hasAllFields;
      });
      const completedSegments = normalizedMultiSegments.filter(
        (segment) => segment.from && segment.to && segment.date
      );

      if (partialSegment || completedSegments.length < MIN_MULTI_CITY_ROUTES) {
        setIsSearchSubmitting(false);
        toast.error("Please add departure, destination and date for at least 2 routes.");
        return;
      }

      const duplicateSegment = completedSegments.find((segment) =>
        isSamePlace(
          segment.from,
          segment.to,
          parseCodeFromLabel(segment.from),
          parseCodeFromLabel(segment.to)
        )
      );

      if (duplicateSegment) {
        setIsSearchSubmitting(false);
        toast.error("Departure and destination cannot be the same.");
        return;
      }

      const firstSegment = completedSegments[0];
      const firstRoute = getSyncedRoute({
        from: firstSegment.from,
        to: firstSegment.to,
        fromCode: parseCodeFromLabel(firstSegment.from),
        toCode: parseCodeFromLabel(firstSegment.to),
      });
      fallbackFrom = firstRoute.from || firstSegment.from;
      fallbackTo = firstRoute.to || firstSegment.to;
      normalizedFromCode = firstRoute.fromCode || parseCodeFromLabel(firstSegment.from);
      normalizedToCode = firstRoute.toCode || parseCodeFromLabel(firstSegment.to);
      searchStartDate = firstSegment.date;
    }

    if (isSamePlace(fallbackFrom, fallbackTo, normalizedFromCode, normalizedToCode)) {
      setIsSearchSubmitting(false);
      toast.error("Departure and destination cannot be the same.");
      return;
    }

    try {
      await saveRecentFlightSearch({
        origin: normalizedFromCode || fallbackFrom,
        destination: normalizedToCode || fallbackTo,
        departureDate: searchStartDate,
        returnDate: tripType === "round" ? endDate : null,
      });
      queryClient.invalidateQueries({
        queryKey: RECENT_SEARCHES_QUERY_KEY,
      });
    } catch (error) {
      console.error("Failed to save recent flight search", error);
    }

    setCommittedSearches((prev) => ({
      ...prev,
      [tripType]: { from: fallbackFrom, to: fallbackTo },
    }));
    setCommittedRequest({
      tripType,
      from: fallbackFrom,
      to: fallbackTo,
      fromCode: normalizedFromCode,
      toCode: normalizedToCode,
      startDate: searchStartDate,
      endDate,
      passengers,
      travelClass,
      fareTypes: selectedFareTypes,
    });

    const nextParams = new URLSearchParams(searchParams?.toString() || "");
    nextParams.set("tripType", tripType);
    nextParams.set("from", fallbackFrom);
    nextParams.set("to", fallbackTo);

    if (normalizedFromCode) {
      nextParams.set("origin", normalizedFromCode);
    } else {
      nextParams.delete("origin");
    }

    if (normalizedToCode) {
      nextParams.set("destination", normalizedToCode);
    } else {
      nextParams.delete("destination");
    }

    if (searchStartDate) {
      nextParams.set("start", searchStartDate);
    } else {
      nextParams.delete("start");
    }

    if (tripType === "round" && endDate) {
      nextParams.set("end", endDate);
    } else {
      nextParams.delete("end");
    }

    for (let index = 0; index < MAX_MULTI_CITY_ROUTES; index += 1) {
      nextParams.delete(`from${index}`);
      nextParams.delete(`to${index}`);
      nextParams.delete(`date${index}`);
    }

    if (tripType === "multi") {
      normalizedMultiSegments
        .filter((segment) => segment.from && segment.to && segment.date)
        .slice(0, MAX_MULTI_CITY_ROUTES)
        .forEach((segment, index) => {
          nextParams.set(`from${index}`, segment.from);
          nextParams.set(`to${index}`, segment.to);
          nextParams.set(`date${index}`, segment.date);
        });
    }

    nextParams.set("adults", String(passengers?.adult ?? 1));
    nextParams.set("children", String(passengers?.child ?? 0));
    nextParams.set("infants", String(passengers?.infant ?? 0));
    nextParams.set("travelClass", travelClass);
    nextParams.set("searchToken", String(Date.now()));
    if (selectedFareTypes.includes(SENIOR_CITIZEN_FARE)) {
      nextParams.set("IsSeniorCitizen", "true");
    } else {
      nextParams.delete("IsSeniorCitizen");
    }
    if (selectedFareTypes.includes(STUDENT_FARE)) {
      nextParams.set("IsStudentFare", "true");
    } else {
      nextParams.delete("IsStudentFare");
    }
    nextParams.delete("page");

    storeFlightSearchParams(nextParams);
    router.push("/flights");

    window.setTimeout(() => {
      setIsSearchSubmitting(false);
    }, 1200);
  };

  return (
    <TripTypeContext.Provider
      value={{
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
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        passengers,
        setPassengers,
        multiSegments,
        setMultiSegments,
        travelClass,
        setTravelClass,
        selectedFareTypes,
        setSelectedFareTypes,
        committedSearches,
        committedRequest,
        handleSearch,
        isSearchSubmitting,
        searchRefreshToken,
        refreshFlightSearch,
      }}
    >
      {children}
    </TripTypeContext.Provider>
  );
}

/**
 * Hook
 */
export function useTripType() {
  const context = useContext(TripTypeContext);

  if (!context) {
    throw new Error("useTripType must be used inside TripTypeProvider");
  }

  return context;
}

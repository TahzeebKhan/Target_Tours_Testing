"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RECENT_SEARCHES_QUERY_KEY,
  saveRecentFlightSearch,
} from "@/shared/services/recentSearch";
import { toast } from "react-toastify";

const TripTypeContext = createContext(null);

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

/**
 * Provider
 */
export function TripTypeProvider({ children }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Helper to safely get params
  const getParam = (key) => searchParams?.get(key) || "";

  const [tripType, setTripType] = useState(getParam("tripType") || "oneway");
  const initialRoute = getSyncedRoute({
    from: getParam("from") || "",
    to: getParam("to") || "",
    fromCode: getParam("origin") || "",
    toCode: getParam("destination") || "",
  });
  const [from, setFrom] = useState(initialRoute.from);
  const [to, setTo] = useState(initialRoute.to);
  const [fromCode, setFromCode] = useState(initialRoute.fromCode);
  const [toCode, setToCode] = useState(initialRoute.toCode);
  const [startDate, setStartDate] = useState(getParam("start") || null);
  const [endDate, setEndDate] = useState(getParam("end") || null);
  const [passengers, setPassengers] = useState({
    adult: Number(getParam("adults") || 1),
    child: Number(getParam("children") || 0),
    infant: Number(getParam("infants") || 0),
  });
  const [travelClass, setTravelClass] = useState(getParam("travelClass") || "ECONOMY");
  const [committedSearches, setCommittedSearches] = useState({
    oneway: { from: initialRoute.from || "Jakarta (CGK)", to: initialRoute.to || "Singapore (SIN)" },
    round: { from: initialRoute.from || "Jakarta (CGK)", to: initialRoute.to || "Singapore (SIN)" },
    multi: { from: initialRoute.from || "Jakarta (CGK)", to: initialRoute.to || "Singapore (SIN)" },
  });
  const [committedRequest, setCommittedRequest] = useState({
    tripType: getParam("tripType") || "oneway",
    from: initialRoute.from || "Jakarta (CGK)",
    to: initialRoute.to || "Singapore (SIN)",
    fromCode: initialRoute.fromCode,
    toCode: initialRoute.toCode,
    startDate: getParam("start") || null,
    endDate: getParam("end") || null,
    passengers: {
      adult: Number(getParam("adults") || 1),
      child: Number(getParam("children") || 0),
      infant: Number(getParam("infants") || 0),
    },
    travelClass: getParam("travelClass") || "ECONOMY",
  });

  // Effect to update state when URL params change (e.g. on navigation)
  useEffect(() => {
    const pTripType = getParam("tripType");
    const pFrom = getParam("from");
    const pTo = getParam("to");
    const pOrigin = getParam("origin");
    const pDestination = getParam("destination");
    const pStart = getParam("start");
    const pEnd = getParam("end");
    const pAdults = Number(getParam("adults") || 1);
    const pChildren = Number(getParam("children") || 0);
    const pInfants = Number(getParam("infants") || 0);
    const pTravelClass = getParam("travelClass") || "ECONOMY";
    const syncedRoute = getSyncedRoute({
      from: pFrom,
      to: pTo,
      fromCode: pOrigin,
      toCode: pDestination,
    });

    if (pTripType) setTripType(pTripType);
    if (pFrom || pOrigin) setFrom(syncedRoute.from);
    if (pTo || pDestination) setTo(syncedRoute.to);
    if (pOrigin) setFromCode(syncedRoute.fromCode);
    if (pDestination) setToCode(syncedRoute.toCode);
    if (pStart) setStartDate(pStart);
    if (pEnd) setEndDate(pEnd);
    setPassengers({
      adult: pAdults,
      child: pChildren,
      infant: pInfants,
    });
    setTravelClass(pTravelClass);

    if (pFrom || pTo || pOrigin || pDestination) {
      setCommittedSearches(prev => ({
        ...prev,
        [pTripType || "oneway"]: {
          from: syncedRoute.from || prev[pTripType || "oneway"].from,
          to: syncedRoute.to || prev[pTripType || "oneway"].to,
        }
      }));
    }

    // Auto-trigger initial search when arriving from Home with URL params.
    if (pFrom && pTo) {
      setCommittedRequest({
        tripType: pTripType || "oneway",
        from: syncedRoute.from,
        to: syncedRoute.to,
        fromCode: syncedRoute.fromCode,
        toCode: syncedRoute.toCode,
        startDate: pStart || null,
        endDate: pEnd || null,
        passengers: {
          adult: pAdults,
          child: pChildren,
          infant: pInfants,
        },
        travelClass: pTravelClass,
      });
    }

  }, [searchParams]);


  const handleSearch = async () => {
    const syncedRoute = getSyncedRoute({
      from: from || committedSearches?.[tripType]?.from || "Jakarta (CGK)",
      to: to || committedSearches?.[tripType]?.to || "Singapore (SIN)",
      fromCode,
      toCode,
    });
    const fallbackFrom = syncedRoute.from || "Jakarta (CGK)";
    const fallbackTo = syncedRoute.to || "Singapore (SIN)";
    const normalizedFromCode = syncedRoute.fromCode;
    const normalizedToCode = syncedRoute.toCode;

    if (isSamePlace(fallbackFrom, fallbackTo, normalizedFromCode, normalizedToCode)) {
      toast.error("Departure and destination cannot be the same.");
      return;
    }

    try {
      await saveRecentFlightSearch({
        origin: normalizedFromCode || fallbackFrom,
        destination: normalizedToCode || fallbackTo,
        departureDate: startDate,
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
      startDate,
      endDate,
      passengers,
      travelClass,
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

    if (startDate) {
      nextParams.set("start", startDate);
    } else {
      nextParams.delete("start");
    }

    if (tripType === "round" && endDate) {
      nextParams.set("end", endDate);
    } else {
      nextParams.delete("end");
    }

    nextParams.set("adults", String(passengers?.adult ?? 1));
    nextParams.set("children", String(passengers?.child ?? 0));
    nextParams.set("infants", String(passengers?.infant ?? 0));
    nextParams.set("travelClass", travelClass);
    nextParams.delete("page");

    router.push(`/flights?${nextParams.toString()}`);

    // Force a fresh API request on every Search click, even with same params.
    queryClient.invalidateQueries({
      queryKey: ["search-flights"],
      refetchType: "active",
    });
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
        travelClass,
        setTravelClass,
        committedSearches,
        committedRequest,
        handleSearch,
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

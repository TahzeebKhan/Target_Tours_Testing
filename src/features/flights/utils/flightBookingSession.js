"use client";

import { resolveAirlineLogo } from "./airlineLogos";

let inMemoryFlightBookingSession = null;
const FLIGHT_BOOKING_SESSION_KEY = "target_tours_flight_booking_session";
export const FLIGHT_PRICING_SESSION_DURATION_MS = 20 * 60 * 1000;

const readNumber = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null || value === "") continue;

    if (Array.isArray(value)) {
      const nested = readNumber(...value);
      if (Number.isFinite(nested)) return nested;
      continue;
    }

    if (value && typeof value === "object") {
      const nested = readNumber(
        value.Amount,
        value.amount,
        value.Price,
        value.price,
        value.TotalAmount,
        value.totalAmount,
        value.GrossAmount,
        value.grossAmount,
        value.Charge,
        value.charge,
        value.Value,
        value.value
      );
      if (Number.isFinite(nested)) return nested;
      continue;
    }

    const normalizedText =
      typeof value === "string" ? value.replace(/[^\d.]/g, "") : null;
    if (typeof value === "string" && !normalizedText) continue;

    const normalized =
      typeof value === "string" ? Number(normalizedText) : Number(value);
    if (Number.isFinite(normalized)) return normalized;
  }
  return null;
};

const readFirstPositiveNumber = (...values) => {
  for (const value of values) {
    const amount = readNumber(value);
    if (Number.isFinite(amount) && amount > 0) return amount;
  }
  return null;
};

const pickFirst = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
};

const deriveTripIndexForOrder = (value, orderId) => {
  const text = String(value || "").trim();
  if (!text) return undefined;

  const parts = text.split("|");
  if (parts.length < 2) return undefined;

  const lastIndex = parts.length - 1;
  if (!/^\d+$/.test(parts[lastIndex].trim())) return undefined;

  parts[lastIndex] = String(orderId);
  return parts.join("|");
};

const normalizeTripIndexForOrder = (trip, index, trips = []) => {
  const explicitIndex = pickFirst(trip?.Index, trip?.index, trip?.flightIndex);
  const previousIndex =
    index > 0 ? pickFirst(trips[index - 1]?.Index, trips[index - 1]?.index, trips[index - 1]?.flightIndex) : undefined;

  if (index > 0 && explicitIndex && explicitIndex === previousIndex) {
    return deriveTripIndexForOrder(previousIndex, index + 1) || explicitIndex;
  }

  return (
    explicitIndex ||
    deriveTripIndexForOrder(pickFirst(trips[0]?.Index, trips[0]?.index, trips[0]?.flightIndex), index + 1)
  );
};

const normalizeGenderCode = (value) => {
  const text = String(value || "").trim().toUpperCase();
  if (text === "MALE" || text === "M") return "M";
  if (text === "FEMALE" || text === "F") return "F";
  return text;
};

const normalizeProviderCode = (provider) =>
  String(provider || "").trim().toLowerCase();

const getProviderFromSearchKey = (searchKey) => {
  const parts = String(searchKey || "").split("_").filter(Boolean);
  const originalLength = parts.length;

  while (["true", "false"].includes(parts.at(-1)?.toLowerCase())) {
    parts.pop();
  }

  return parts.length < originalLength ? parts.at(-1) : undefined;
};

const formatRiyaSeatDateTime = (value) => {
  if (!value) return "";
  const text = String(value).trim();
  if (/^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s+\d{2}:\d{2}$/.test(text)) {
    return text;
  }

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day} ${month} ${year} ${hours}:${minutes}`;
};

const safeEncodePayload = (value) => {
  try {
    return encodeURIComponent(JSON.stringify(value));
  } catch {
    return "";
  }
};

const safeDecodePayload = (value) => {
  try {
    return JSON.parse(decodeURIComponent(String(value || "")));
  } catch {
    return null;
  }
};

const extractTrips = (payload) => {
  if (Array.isArray(payload?.Trips)) return payload.Trips;
  if (Array.isArray(payload?.trips)) return payload.trips;
  if (Array.isArray(payload?.data?.Trips)) return payload.data.Trips;
  if (Array.isArray(payload?.data?.trips)) return payload.data.trips;
  return [];
};

const extractPrimaryTrip = (payload) => extractTrips(payload)[0] || null;
const unwrapPayload = (payload) => {
  const directPayload = payload?.data;
  const nestedPayload = payload?.data?.data;
  const pricingChunkPayload = (payload?.pricingChunks || directPayload?.pricingChunks || [])
    .slice()
    .reverse()
    .find((chunk) => {
      const resultPayload = Array.isArray(chunk?.data?.results)
        ? chunk.data.results.find((result) => result?.data?.data)?.data?.data
        : null;
      return (
        resultPayload?.formatted ||
        resultPayload?.fare_breakdown ||
        resultPayload?.tui
      );
    });
  const chunkResultPayload = Array.isArray(pricingChunkPayload?.data?.results)
    ? pricingChunkPayload.data.results.find((result) => result?.data?.data)?.data?.data
    : null;
  const v2PricingResultPayload = Array.isArray(directPayload?.results)
    ? directPayload.results.find((result) => {
        const resultPayload = result?.data?.data || result?.data;
        return (
          resultPayload?.formatted ||
          resultPayload?.fare_breakdown ||
          resultPayload?.tui
        );
      })?.data?.data
    : null;

  if (
    chunkResultPayload?.formatted ||
    chunkResultPayload?.fare_breakdown ||
    chunkResultPayload?.tui
  ) {
    return chunkResultPayload;
  }

  if (
    v2PricingResultPayload?.formatted ||
    v2PricingResultPayload?.fare_breakdown ||
    v2PricingResultPayload?.tui
  ) {
    return v2PricingResultPayload;
  }

  if (nestedPayload?.formatted || nestedPayload?.fare_breakdown || nestedPayload?.tui) {
    return nestedPayload;
  }

  if (directPayload?.formatted || directPayload?.fare_breakdown || directPayload?.tui) {
    return directPayload;
  }

  return directPayload || payload || {};
};

const getFormattedJourneys = (payload) => {
  const normalized = unwrapPayload(payload);
  if (Array.isArray(normalized?.formatted?.journeys)) return normalized.formatted.journeys;
  if (Array.isArray(normalized?.journeys)) return normalized.journeys;
  if (Array.isArray(normalized?.formattedJourneys)) return normalized.formattedJourneys;
  return [];
};

const parseDuration = (value) => {
  const text = String(value || "").trim();
  const match = text.match(/(\d+)\s*h\s*(\d+)\s*m/i);
  if (match) {
    return {
      hours: match[1],
      minutes: match[2],
    };
  }
  return { hours: "00", minutes: "00" };
};

const formatDateLabel = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatHeaderDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
};

const formatTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  const match = String(value).match(/(\d{2}:\d{2})/);
  return match ? match[1] : "N/A";
};

const compactAirportName = (value, fallback = "N/A") => {
  const text = String(value || "").trim();
  if (!text) return fallback;
  return (
    text
      .split("|")[0]
      ?.trim()
      .split(",")
      .map((part) => part.trim())
      .find(Boolean) || fallback
  );
};

const splitAirportMeta = (value, fallback = "N/A") => {
  const text = String(value || "").trim();
  if (!text) {
    return {
      airportName: fallback,
      cityName: fallback,
    };
  }

  const [airportPart, cityPart] = text.split("|").map((part) => part?.trim()).filter(Boolean);

  return {
    airportName: airportPart || fallback,
    cityName: cityPart || airportPart || fallback,
  };
};

const normalizeTerminal = (value) => {
  const text = String(value || "").trim();
  return text ? `Terminal ${text}` : "Terminal N/A";
};

const normalizeTravelClass = (value, selectedFare) => {
  const text = String(value || "").trim().toUpperCase();
  if (text === "E" || text === "ECONOMY") return "Economy";
  if (text === "B" || text === "BUSINESS") return "Business";
  if (text === "F" || text === "FIRST") return "First Class";

  const fareName = String(selectedFare?.name || "").toUpperCase();
  if (fareName.includes("PREMIUM")) return "Premium";
  return "Economy";
};

const normalizeAircraftLabel = (...values) => {
  for (const value of values) {
    const text = String(value || "").trim();
    if (text && text.toUpperCase() !== "N/A") return text;
  }

  return "Boeing 737";
};

const buildResolvedAirlineLogo = (airline = {}) =>
  resolveAirlineLogo({
    name: airline?.name,
    code: airline?.carrierCode || airline?.code || airline?.flightNo,
    logo: airline?.logo,
  });

const normalizeFlightCardLogo = (flight) => {
  if (!flight || typeof flight !== "object") return flight;

  return {
    ...flight,
    aircraft: normalizeAircraftLabel(flight.aircraft),
    airline: {
      ...(flight.airline || {}),
      logo: buildResolvedAirlineLogo(flight.airline || {}),
    },
  };
};

const getSelectedFareForLeg = (selectedFare, legKey) => {
  if (legKey === "return") {
    return selectedFare?.roundTripFares?.return || selectedFare;
  }

  return selectedFare?.roundTripFares?.onward || selectedFare;
};

const getSelectedFareForTripIndex = (selectedFare, index) =>
  index === 1
    ? selectedFare?.roundTripFares?.return || selectedFare
    : selectedFare?.roundTripFares?.onward || selectedFare;

const extractTripFromFare = (fare, index) => {
  const rawFare = fare?.rawFare || {};
  const fareTrips = extractTrips(fare);
  const rawFareTrips = extractTrips(rawFare);

  return fareTrips[index] || rawFareTrips[index] || fareTrips[0] || rawFareTrips[0] || {};
};

const readSelectedFareTripAmount = (fare, index) => {
  const rawFare = fare?.rawFare || {};
  const fareTrip = extractTripFromFare(fare, index);

  return readNumber(
    fareTrip?.Amount,
    fareTrip?.amount,
    fare?.Amount,
    fare?.amount,
    fare?.netAmount,
    rawFare?.Amount,
    rawFare?.amount,
    rawFare?.netAmount,
    rawFare?.price,
    rawFare?.grossFare
  );
};

export const buildSelectedFarePriceRequest = (priceRequest, selectedFare) => {
  const trips = extractTrips(priceRequest);
  if (!trips.length) return priceRequest;

  return {
    ...(priceRequest || {}),
    Trips: trips.map((trip, index) => {
      const selectedTripFare = getSelectedFareForTripIndex(selectedFare, index);
      const selectedAmount = readSelectedFareTripAmount(selectedTripFare, index);

      return {
        ...trip,
        Amount: selectedAmount ?? readNumber(trip?.Amount, trip?.amount) ?? 0,
        Index: normalizeTripIndexForOrder(trip, index, trips),
        OrderID: String(index + 1),
      };
    }),
  };
};

const parseRouteLabel = (value) => {
  const text = String(value || "").trim();
  const match = text.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return {
    city: match?.[1]?.trim() || text || "N/A",
    code: match?.[2]?.trim() || "",
  };
};

const buildFlightCard = (source, selectedFare) => {
  if (!source || typeof source !== "object") return null;

  const departureCode = String(
    source?.origin || source?.from || source?.departureCode || ""
  )
    .trim()
    .toUpperCase();
  const arrivalCode = String(
    source?.destination || source?.to || source?.arrivalCode || ""
  )
    .trim()
    .toUpperCase();
  const departureMeta = splitAirportMeta(
    source?.dep_airport_name || source?.fromName || source?.FromName,
    departureCode || "N/A"
  );
  const arrivalMeta = splitAirportMeta(
    source?.arr_airport_name || source?.toName || source?.ToName,
    arrivalCode || "N/A"
  );
  const stopCount = Number(source?.stops);

  return {
    airline: {
      name: source?.airline || "N/A",
      code: String(source?.flightNo || source?.flight_no || "N/A").trim(),
      logo: buildResolvedAirlineLogo({
        name: source?.airline,
        code: source?.carrierCode || source?.airline_code || source?.flightNo || source?.flight_no,
        logo: source?.logo || source?.airline_logo,
      }),
    },
    aircraft: normalizeAircraftLabel(source?.aircraft, source?.AirCraft, source?.Aircraft),
    flexiPlusFare: selectedFare?.name || "",
    travelClass: normalizeTravelClass(
      source?.cabin || source?.cabinClass || source?.travelClass,
      selectedFare
    ),
    departure: {
      date: formatDateLabel(source?.departure),
      time: formatTime(source?.departure),
      airport: `${departureCode || "N/A"} - ${departureMeta.cityName.toUpperCase()}`,
      terminal: normalizeTerminal(source?.terminal?.departure || source?.departureTerminal),
      city: departureMeta.airportName,
    },
    arrival: {
      date: formatDateLabel(source?.arrival),
      time: formatTime(source?.arrival),
      airport: `${arrivalCode || "N/A"} - ${arrivalMeta.cityName.toUpperCase()}`,
      terminal: normalizeTerminal(source?.terminal?.arrival || source?.arrivalTerminal),
      city: arrivalMeta.airportName,
    },
    duration: parseDuration(source?.duration),
    stops: Number.isFinite(stopCount) ? (stopCount === 0 ? "Non Stop" : `${stopCount} Stop`) : "Non Stop",
  };
};

const buildSelectedFlightCard = (selectedFlight, selectedFare) => {
  if (!selectedFlight || typeof selectedFlight !== "object") return null;

  const departureRoute = parseRouteLabel(selectedFlight?.departure?.city);
  const arrivalRoute = parseRouteLabel(selectedFlight?.arrival?.city);
  const details = selectedFlight?.details || {};

  return {
    airline: {
      name: selectedFlight?.airlines?.[0]?.name || details?.airline || "N/A",
      code: selectedFlight?.airlines?.[0]?.code || "N/A",
      carrierCode: selectedFlight?.airlines?.[0]?.carrierCode || "",
      flightNo: selectedFlight?.airlines?.[0]?.flightNo || details?.flightNo || "",
      logo: buildResolvedAirlineLogo({
        ...(selectedFlight?.airlines?.[0] || {}),
        name: selectedFlight?.airlines?.[0]?.name || details?.airline,
        code: selectedFlight?.airlines?.[0]?.carrierCode || selectedFlight?.airlines?.[0]?.code,
        logo: selectedFlight?.airlines?.[0]?.logo,
      }),
    },
    aircraft: normalizeAircraftLabel(details?.aircraft, selectedFlight?.aircraft),
    flexiPlusFare: selectedFare?.name || "",
    travelClass: normalizeTravelClass(selectedFlight?.fare?.cabinClass, selectedFare),
    departure: {
      date: formatDateLabel(details?.departureDateTime),
      time: selectedFlight?.departure?.time || "N/A",
      airport: `${departureRoute.code || "N/A"} - ${(departureRoute.city || "N/A").toUpperCase()}`,
      terminal: normalizeTerminal(details?.departureTerminal),
      city: compactAirportName(details?.fromName, departureRoute.city || "N/A"),
    },
    arrival: {
      date: formatDateLabel(details?.arrivalDateTime),
      time: selectedFlight?.arrival?.time || "N/A",
      airport: `${arrivalRoute.code || "N/A"} - ${(arrivalRoute.city || "N/A").toUpperCase()}`,
      terminal: normalizeTerminal(details?.arrivalTerminal),
      city: compactAirportName(details?.toName, arrivalRoute.city || "N/A"),
    },
    duration: {
      hours: selectedFlight?.duration?.hours || "00",
      minutes: selectedFlight?.duration?.minutes || "00",
    },
    stops: selectedFlight?.stops?.type || "Non Stop",
    fare: selectedFlight?.fare || selectedFare || null,
  };
};

const buildRoundSelectedFlightCard = (selectedFlight, selectedFare, legKey) => {
  const legFare = getSelectedFareForLeg(selectedFare, legKey);
  const segmentWrapper =
    legKey === "return"
      ? selectedFlight?.return || selectedFlight?.tripCard?.return
      : selectedFlight?.depart || selectedFlight?.tripCard?.depart;
  const leg =
    legKey === "return"
      ? selectedFlight?.inbound ||
        selectedFlight?.return?.flight ||
        selectedFlight?.tripCard?.return?.flight
      : selectedFlight?.outbound ||
        selectedFlight?.depart?.flight ||
        selectedFlight?.tripCard?.depart?.flight;

  if (!leg || typeof leg !== "object") return null;

  const departureLabel = String(leg?.departure?.city || "").trim();
  const arrivalLabel = String(leg?.arrival?.city || "").trim();
  const departureRoute = parseRouteLabel(departureLabel);
  const arrivalRoute = parseRouteLabel(arrivalLabel);
  const details = leg?.details || {};
  const airlineSource =
    segmentWrapper?.airline ||
    leg?.airlines?.[0] ||
    leg?.airline ||
    selectedFlight?.airline ||
    {};
  const departureAirportCode =
    departureRoute.code ||
    String(departureLabel.split("-")[0] || "")
      .trim()
      .toUpperCase();
  const arrivalAirportCode =
    arrivalRoute.code ||
    String(arrivalLabel.split("-")[0] || "")
      .trim()
      .toUpperCase();
  const departureCityLabel = departureRoute.city || departureLabel || "N/A";
  const arrivalCityLabel = arrivalRoute.city || arrivalLabel || "N/A";

  return {
    airline: {
      name: airlineSource?.name || "N/A",
      code: airlineSource?.code || "N/A",
      carrierCode: airlineSource?.carrierCode || "",
      flightNo: airlineSource?.flightNo || details?.flightNo || "",
      logo: buildResolvedAirlineLogo({
        ...airlineSource,
        code: airlineSource?.carrierCode || airlineSource?.code || details?.flightNo,
      }),
    },
    aircraft: normalizeAircraftLabel(
      details?.aircraft,
      details?.AirCraft,
      leg?.aircraft,
      leg?.AirCraft,
      leg?.Aircraft
    ),
    flexiPlusFare: legFare?.name || "",
    travelClass: normalizeTravelClass(
      selectedFlight?.fare?.cabinClass || leg?.fare?.cabinClass || leg?.travelClass,
      legFare
    ),
    departure: {
      date:
        segmentWrapper?.date ||
        leg?.dateLabel ||
        leg?.date ||
        formatDateLabel(details?.departureDateTime),
      time: leg?.departure?.time || "N/A",
      airport: `${departureAirportCode || "N/A"} - ${departureCityLabel.toUpperCase()}`,
      terminal: normalizeTerminal(details?.departureTerminal),
      city: compactAirportName(details?.fromName, departureCityLabel),
    },
    arrival: {
      date:
        segmentWrapper?.date ||
        leg?.dateLabel ||
        leg?.date ||
        formatDateLabel(details?.arrivalDateTime),
      time: leg?.arrival?.time || "N/A",
      airport: `${arrivalAirportCode || "N/A"} - ${arrivalCityLabel.toUpperCase()}`,
      terminal: normalizeTerminal(details?.arrivalTerminal),
      city: compactAirportName(details?.toName, arrivalCityLabel),
    },
    duration: {
      hours: leg?.duration?.hours || "00",
      minutes: leg?.duration?.minutes || "00",
    },
    stops: leg?.stops?.type || "Non Stop",
  };
};

export const readFlightBookingSession = () => {
  if (inMemoryFlightBookingSession) {
    if (isFlightBookingSessionExpired(inMemoryFlightBookingSession)) {
      clearFlightBookingSession();
      return null;
    }
    return inMemoryFlightBookingSession;
  }
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(FLIGHT_BOOKING_SESSION_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (isFlightBookingSessionExpired(parsed)) {
      clearFlightBookingSession();
      return null;
    }
    inMemoryFlightBookingSession = parsed || null;


    const sizeInBytes = new Blob([
  JSON.stringify(inMemoryFlightBookingSession)
]).size;

console.log(`Size: ${sizeInBytes} bytes`);
console.log(`Size: ${(sizeInBytes / 1024).toFixed(2)} KB`);
     console.log("inMemoryFlightBookingSession", inMemoryFlightBookingSession);
    return inMemoryFlightBookingSession;
  } catch {
    return null;
  }
};

const removeStoredFlightBookingSession = () => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(FLIGHT_BOOKING_SESSION_KEY);
  } catch {
  }
};

export const clearFlightBookingSession = () => {
  inMemoryFlightBookingSession = null;
  removeStoredFlightBookingSession();
};

const storeFlightBookingSession = (value) => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(FLIGHT_BOOKING_SESSION_KEY, JSON.stringify(value));
  } catch {
  }
};

export const getFlightBookingSessionExpiry = (session) => {
  if (session?.priceResponse) {
    const startedAt = Number(session?.pricingSessionStartedAt);
    if (Number.isFinite(startedAt) && startedAt > 0) {
      return startedAt + FLIGHT_PRICING_SESSION_DURATION_MS;
    }
  }

  const expiry = Number(session?.pricingSessionExpiresAt);
  return Number.isFinite(expiry) && expiry > 0 ? expiry : null;
};

export const isFlightBookingSessionExpired = (session, now = Date.now()) => {
  const expiry = getFlightBookingSessionExpiry(session);
  return Boolean(expiry && now >= expiry);
};

export const withFlightPricingSessionExpiry = (value) => {
  if (!value?.priceResponse) return value;

  const startedAt = Number(value.pricingSessionStartedAt) || Date.now();
  const expiresAt = startedAt + FLIGHT_PRICING_SESSION_DURATION_MS;

  return {
    ...value,
    pricingSessionStartedAt: startedAt,
    pricingSessionExpiresAt: expiresAt,
  };
};

export const writeFlightBookingSession = (value) => {
  if (!value) {
    clearFlightBookingSession();
    return;
  }

  const nextValue = withFlightPricingSessionExpiry(value);
  if (isFlightBookingSessionExpired(nextValue)) {
    clearFlightBookingSession();
    return;
  }

  inMemoryFlightBookingSession = nextValue;
  storeFlightBookingSession(nextValue);
};

export const readFlightBookingSessionLegacy = () => {
  return inMemoryFlightBookingSession;
};

export const readBookingFallbackFromSearch = (search) => {
  const params =
    search instanceof URLSearchParams
      ? search
      : new URLSearchParams(String(search || "").replace(/^\?/, ""));
  const raw = params.get("bookingFallback");
  const parsed = safeDecodePayload(raw);
  return parsed && typeof parsed === "object" ? parsed : null;
};

export const mergeFlightBookingSession = (patch) => {
  const current = readFlightBookingSession() || {};
  const next = {
    ...current,
    ...patch,
  };
  writeFlightBookingSession(next);
  return next;
};

export const buildSsrPayload = (session) => {

  const priceResponse = session?.priceResponse || {};
  const priceRequest = session?.priceRequest || {};
  const selectedFare = session?.selectedFare || {};
  const selectedFlight = session?.selectedFlight || {};
  const requestTrips = extractTrips(priceRequest);
  const flightBooking = selectedFlight?.booking || {};
  const rootTui = pickFirst(
    priceResponse?.tui,
    priceResponse?.TUI,
    priceResponse?.data?.tui,
    priceResponse?.data?.TUI,
    priceResponse?.data?.raw?.TUI,
    priceResponse?.data?.raw?.tui
  );

  return {
    provider:
      normalizeProviderCode(
        pickFirst(
          priceRequest?.provider,
          priceRequest?.Provider,
          flightBooking?.provider,
          selectedFlight?.provider,
          priceResponse?.provider,
          priceResponse?.Provider,
          session?.priceResponse?.provider,
          session?.priceResponse?.Provider,
          getProviderFromSearchKey(
            pickFirst(
              priceRequest?.search_key,
              priceResponse?.search_key,
              priceResponse?.SearchKey,
              flightBooking?.searchKey
            )
          )
        )
      ),
    search_key: pickFirst(
      priceRequest?.search_key,
      priceResponse?.search_key,
      priceResponse?.SearchKey,
      priceResponse?.data?.search_key,
      flightBooking?.searchKey
    ),
    PaidSSR: true,
    Source: pickFirst(
      flightBooking?.ssrSource,
      priceRequest?.SSRSource,
      priceRequest?.ssrSource,
      priceResponse?.SSRSource,
      priceResponse?.ssrSource,
      priceResponse?.data?.SSRSource,
      priceResponse?.data?.ssrSource,
      "LV"
    ),
    FareType: pickFirst(
      priceRequest?.FareType,
      "N"
    ),
    Trips: (requestTrips.length > 0 ? requestTrips : [extractPrimaryTrip(priceRequest) || {}]).map(
      (requestTrip, index) => {
        const selectedTripFare = getSelectedFareForTripIndex(selectedFare, index);

        return {
          Amount:
            readSelectedFareTripAmount(selectedTripFare, index) ??
            readNumber(requestTrip?.Amount, requestTrip?.amount) ??
            0,
          Index: "",
          OrderID: pickFirst(
            requestTrip?.OrderID,
            requestTrip?.orderId,
            requestTrip?.OrderId,
            String(index + 1)
          ),
          TUI: pickFirst(
            rootTui,
            requestTrip?.TUI,
            requestTrip?.tui
          ),
        };
      }),
  };
};

const makeV2SsrChannel = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `ssr-${crypto.randomUUID()}`;
  }

  return `ssr-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const makeV2SeatLayoutChannel = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `seatLayout-${crypto.randomUUID()}`;
  }

  return `seatLayout-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const makeV2CreateBookingChannel = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `booking-${crypto.randomUUID()}`;
  }

  return `booking-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const buildV2SsrPayload = (session = {}) => {
  const priceResponse = session?.priceResponse || {};
  const payload = unwrapPayload(priceResponse);
  const priceRequest = session?.priceRequest || {};
  const selectedFare = session?.selectedFare || {};
  const requestTrips = extractTrips(priceRequest);
  const rootTui = pickFirst(
    payload?.tui,
    payload?.TUI,
    payload?.raw?.TUI,
    priceResponse?.tui,
    priceResponse?.TUI,
    priceResponse?.data?.tui,
    priceResponse?.data?.TUI
  );
  const searchKey = pickFirst(
    priceRequest?.search_key,
    priceRequest?.SearchKey,
    priceRequest?.searchKey,
    payload?.search_key,
    payload?.SearchKey,
    session?.selectedFlight?.booking?.searchKey
  );
  const selectedFareIndex = pickFirst(
    selectedFare?.rawFare?.index,
    selectedFare?.rawFare?.Index,
    selectedFare?.rawFare?.flightIndex,
    selectedFare?.index,
    selectedFare?.Index,
    selectedFare?.flightIndex,
    selectedFare?.id
  );
  const sourceTrips = requestTrips.length
    ? requestTrips
    : selectedFareIndex
      ? [{ Index: selectedFareIndex, Order: 1 }]
      : [];
  const ssrRequests = [
    {
      search_key: searchKey,
      Trips: sourceTrips
        .map((trip, index) => ({
          Index: String(
            normalizeTripIndexForOrder(trip, index, sourceTrips) ||
              selectedFareIndex ||
              ""
          ),
          Order: Number(
            trip?.Order ??
              trip?.OrderID ??
              trip?.order ??
              trip?.orderId ??
              index + 1
          ),
          TUI: pickFirst(rootTui, trip?.TUI, trip?.tui),
        }))
        .filter((trip) => trip.Index && trip.TUI),
    },
  ].filter((request) => request.search_key && request.Trips.length > 0);

  return {
    channel: makeV2SsrChannel(),
    domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337",
    PaidSSR: "true",
    ssr_requests: ssrRequests,
  };
};

const resolveFlightProvider = (session = {}) => {
  const priceResponse = unwrapPayload(session?.priceResponse);
  return normalizeProviderCode(
    pickFirst(
      session?.priceRequest?.provider,
      session?.priceRequest?.Provider,
      session?.selectedFlight?.booking?.provider,
      session?.selectedFlight?.provider,
      priceResponse?.provider,
      priceResponse?.Provider,
      session?.priceResponse?.provider,
      session?.priceResponse?.Provider,
      getProviderFromSearchKey(
        pickFirst(
          session?.priceRequest?.search_key,
          session?.priceResponse?.search_key,
          session?.priceResponse?.SearchKey,
          session?.selectedFlight?.booking?.searchKey
        )
      )
    )
  );
};

const getRiyaSeatFormattedJourneys = (priceResponse = {}) => {
  const payload = unwrapPayload(priceResponse);
  return Array.isArray(payload?.formatted?.journeys)
    ? payload.formatted.journeys
    : [];
};

const buildRiyaSeatLayoutPayload = (session = {}, travelerDetails = []) => {
  const priceResponse = unwrapPayload(session?.priceResponse);
  const rawPriceResponse = session?.priceResponse || {};
  const priceRequest = session?.priceRequest || {};
  const selectedFlight = session?.selectedFlight || {};
  const booking = selectedFlight?.booking || {};
  const journeys = getRiyaSeatFormattedJourneys(session?.priceResponse);
  const bookingTrips = extractTrips(priceRequest);
  const firstJourney = journeys[0] || {};
  const firstFlightDetails = firstJourney?.flight_details || {};
  const firstTrip = bookingTrips[0] || {};
  const routeContext = session?.routeContext || {};
  const fallbackDeparture = selectedFlight?.departure || selectedFlight?.depart?.flight?.departure || {};
  const fallbackArrival = selectedFlight?.arrival || selectedFlight?.depart?.flight?.arrival || {};
  const rawTripType = String(
    pickFirst(
      priceRequest?.TripType,
      priceRequest?.tripType,
      booking?.tripType,
      session?.routeContext?.tripType,
      "O"
    )
  ).trim().toUpperCase();
  const tripType = rawTripType === "RT" || rawTripType === "ROUND" ? "R" : "O";
  const baseOrigin = String(
    pickFirst(
      firstFlightDetails?.from,
      firstJourney?.origin,
      firstTrip?.Origin,
      firstTrip?.origin,
      routeContext?.fromCode,
      fallbackDeparture?.airportCode,
      fallbackDeparture?.airport?.split?.("-")?.[0],
      ""
    )
  ).trim().toUpperCase();
  const baseDestination = String(
    pickFirst(
      firstFlightDetails?.to,
      firstJourney?.destination,
      firstTrip?.Destination,
      firstTrip?.destination,
      routeContext?.toCode,
      fallbackArrival?.airportCode,
      fallbackArrival?.airport?.split?.("-")?.[0],
      ""
    )
  ).trim().toUpperCase();

  const flightSources = journeys.length
    ? journeys
    : bookingTrips.length
      ? bookingTrips
      : [firstJourney];

  const flightsInfo = flightSources.map((_, index) => {
    const trip = bookingTrips[index] || firstTrip;
    const journey = journeys[index] || firstJourney;
    const flightDetails = journey?.flight_details || {};
    const flightNo = String(
      pickFirst(
        flightDetails?.flightNo,
        flightDetails?.flight_number,
        flightDetails?.FlightNumber,
        trip?.FlightNumber,
        trip?.flightNumber,
        trip?.flightNo,
        trip?.flight_no,
        selectedFlight?.details?.flightNo,
        booking?.flightNo,
        ""
      )
    ).trim();
    const stock = String(
      pickFirst(
        flightDetails?.Stock,
        flightDetails?.stock,
        flightDetails?.airlineCode,
        flightDetails?.airline_code,
        journey?.Stock,
        journey?.stock,
        journey?.airline_code,
        trip?.Stock,
        trip?.stock,
        trip?.AirlineCode,
        selectedFlight?.airlines?.[index]?.code,
        selectedFlight?.airlines?.[0]?.code,
        flightNo.split(/\s+/)[0],
        ""
      )
    ).trim().toUpperCase();

    return {
      FlightID: String(
        pickFirst(
          flightDetails?.FlightID,
          flightDetails?.FlightId,
          flightDetails?.flight_id,
          flightDetails?.flightId,
          trip?.FlightID,
          trip?.FlightId,
          trip?.flight_id,
          trip?.flightId,
          selectedFlight?.FlightID,
          selectedFlight?.flightId,
          selectedFlight?.id,
          ""
        )
      ),
      Stock: stock,
      FlightNumber: flightNo,
      Origin: String(
        pickFirst(flightDetails?.from, journey?.origin, trip?.Origin, trip?.origin, baseOrigin)
      ).trim().toUpperCase(),
      Destination: String(
        pickFirst(
          flightDetails?.to,
          journey?.destination,
          trip?.Destination,
          trip?.destination,
          baseDestination
        )
      ).trim().toUpperCase(),
      DepartureTerminal: String(
        pickFirst(
          flightDetails?.terminal?.departure,
          flightDetails?.DepartureTerminal,
          flightDetails?.departureTerminal,
          flightDetails?.departure_terminal,
          journey?.DepartureTerminal,
          journey?.departureTerminal,
          trip?.DepartureTerminal,
          trip?.departureTerminal,
          selectedFlight?.details?.departureTerminal,
          fallbackDeparture?.terminal,
          ""
        )
      ).trim(),
      ArrivalTerminal: String(
        pickFirst(
          flightDetails?.terminal?.arrival,
          flightDetails?.ArrivalTerminal,
          flightDetails?.arrivalTerminal,
          flightDetails?.arrival_terminal,
          journey?.ArrivalTerminal,
          journey?.arrivalTerminal,
          trip?.ArrivalTerminal,
          trip?.arrivalTerminal,
          selectedFlight?.details?.arrivalTerminal,
          fallbackArrival?.terminal,
          ""
        )
      ).trim(),
      DepartureDateTime: formatRiyaSeatDateTime(
        pickFirst(
          flightDetails?.departure,
          journey?.departure,
          trip?.DepartureDateTime,
          trip?.departureDateTime,
          selectedFlight?.details?.departureDateTime,
          fallbackDeparture?.date
        )
      ),
      ArrivalDateTime: formatRiyaSeatDateTime(
        pickFirst(
          flightDetails?.arrival,
          journey?.arrival,
          trip?.ArrivalDateTime,
          trip?.arrivalDateTime,
          selectedFlight?.details?.arrivalDateTime,
          fallbackArrival?.date
        )
      ),
    };
  });

  return {
    provider: "riya",
    domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337",
    SegmentInfo: {
      BaseOrigin: baseOrigin,
      BaseDestination: baseDestination,
      TripType: tripType,
    },
    FlightsInfo: flightsInfo,
    APIPaxDetails: (Array.isArray(travelerDetails) ? travelerDetails : []).map(
      (traveler, index) => ({
        PaxRefNumber: String(index + 1),
        Title: String(traveler?.Title || "").replace(/\./g, "").toUpperCase(),
        PaxType: (() => {
          const type = String(traveler?.PTC || traveler?.type || "ADT").toUpperCase();
          if (type === "CHILD" || type === "CHD") return "CHD";
          if (type === "INFANT" || type === "INF") return "INF";
          return "ADT";
        })(),
        FirstName: String(traveler?.FName || "").trim().toUpperCase(),
        LastName: String(traveler?.LName || "").trim().toUpperCase(),
      })
    ),
    TrackId: String(
      pickFirst(
        priceResponse?.trackid,
        priceResponse?.TrackId,
        priceResponse?.TrackID,
        priceResponse?.trackId,
        priceResponse?.track_id,
        priceResponse?.raw?.trackid,
        priceResponse?.raw?.TrackId,
        rawPriceResponse?.trackid,
        rawPriceResponse?.TrackId,
        rawPriceResponse?.TrackID,
        rawPriceResponse?.trackId,
        rawPriceResponse?.data?.trackid,
        rawPriceResponse?.data?.TrackId,
        rawPriceResponse?.data?.data?.trackid,
        rawPriceResponse?.data?.data?.TrackId,
        session?.ssrResponse?.trackid,
        session?.ssrResponse?.TrackId,
        session?.ssrResponse?.data?.trackid,
        session?.ssrResponse?.data?.TrackId,
        priceRequest?.trackid,
        priceRequest?.TrackId,
        priceRequest?.TrackID,
        booking?.trackid,
        booking?.trackId,
        booking?.TrackId,
      ) || ""
    ),
  };
};

const buildV2SeatLayoutPaxDetails = (travelerDetails = []) =>
  (Array.isArray(travelerDetails) ? travelerDetails : []).map((traveler, index) => ({
    PaxRefNumber: String(index + 1),
    Title: String(traveler?.Title || "MR").replace(/\./g, "").toUpperCase(),
    FirstName: String(traveler?.FName || traveler?.FirstName || "").trim().toUpperCase(),
    LastName: String(traveler?.LName || traveler?.LastName || "").trim().toUpperCase(),
  }));

const buildV2SeatLayoutPayload = (session = {}, travelerDetails = []) => {
  const priceRequest = session?.priceRequest || {};
  const ssrRequest = session?.ssrRequest || {};
  const ssrPayload = unwrapPayload(session?.ssrResponse);
  const pricePayload = unwrapPayload(session?.priceResponse);
  const requestTrips = extractTrips(priceRequest);
  const ssrRequests = Array.isArray(ssrRequest?.ssr_requests)
    ? ssrRequest.ssr_requests
    : [];
  const primarySsrRequest = ssrRequests[0] || {};
  const searchKey = pickFirst(
    primarySsrRequest?.search_key,
    priceRequest?.search_key,
    priceRequest?.SearchKey,
    priceRequest?.searchKey,
    pricePayload?.search_key,
    pricePayload?.SearchKey,
    session?.selectedFlight?.booking?.searchKey
  );
  const tui = pickFirst(
    primarySsrRequest?.TUI,
    primarySsrRequest?.Trips?.[0]?.TUI,
    ssrPayload?.tui,
    ssrPayload?.TUI,
    ssrPayload?.raw?.TUI,
    pricePayload?.tui,
    pricePayload?.TUI,
    pricePayload?.raw?.TUI,
    priceRequest?.TUI,
    priceRequest?.tui
  );
  const sourceTrips = Array.isArray(primarySsrRequest?.Trips) &&
    primarySsrRequest.Trips.length
      ? primarySsrRequest.Trips
      : requestTrips;
  const trips = sourceTrips
    .map((trip, index) => ({
      OrderID: String(
        pickFirst(
          trip?.OrderID,
          trip?.OrderId,
          trip?.Order,
          trip?.orderId,
          trip?.order,
          index + 1
        )
      ),
      TUI: pickFirst(trip?.TUI, trip?.tui, tui),
    }))
    .filter((trip) => trip.OrderID);
  const seatLayoutRequests = [
    {
      search_key: searchKey,
      Trips: trips,
    },
  ].filter((request) =>
    request.search_key &&
    request.Trips.length &&
    request.Trips.every((trip) => trip.TUI)
  );

  return {
    channel: makeV2SeatLayoutChannel(),
    domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337",
    APIPaxDetails: buildV2SeatLayoutPaxDetails(travelerDetails),
    seat_layout_requests: seatLayoutRequests,
  };
};

export const buildSeatLayoutPayload = (session, travelerDetails = []) => {
  const provider = resolveFlightProvider(session);
  const providerPayloadBuilders = {
    riya: buildRiyaSeatLayoutPayload,
  };
  const providerPayloadBuilder = providerPayloadBuilders[provider];

  if (providerPayloadBuilder) {
    return providerPayloadBuilder(session, travelerDetails);
  }

  if (Array.isArray(session?.ssrRequest?.ssr_requests)) {
    return buildV2SeatLayoutPayload(session, travelerDetails);
  }

  const priceRequest = session?.priceRequest || {};
  const ssrResponse = session?.ssrResponse || {};
  const priceResponse = session?.priceResponse || {};
  const selectedFlight = session?.selectedFlight || {};
  const flightBooking = selectedFlight?.booking || {};
  const bookingPriceRequest = flightBooking?.priceRequest || {};
  const requestTrips = extractTrips(priceRequest);
  const bookingTrips = extractTrips(bookingPriceRequest);
  const seatTrips = requestTrips.length > 0 ? requestTrips : bookingTrips;
  const primaryTrip = seatTrips[0] || {};
  const ssrPayload = unwrapPayload(ssrResponse);
  const ssrRaw = ssrPayload?.raw || ssrResponse?.raw || {};
  const ssrFormatted = ssrPayload?.formatted || ssrResponse?.formatted || {};
  const rootTui = pickFirst(
    priceResponse?.data?.raw?.TUI,
    priceResponse?.data?.raw?.tui,
    priceResponse?.raw?.TUI,
    priceResponse?.raw?.tui,
    priceResponse?.data?.tui,
    priceResponse?.data?.TUI,
    priceResponse?.tui,
    priceResponse?.TUI,
    primaryTrip?.TUI,
    primaryTrip?.tui,
    ssrPayload?.tui,
    ssrPayload?.TUI,
    ssrRaw?.TUI,
    ssrFormatted?.tui,
    ssrFormatted?.TUI
  );

  return {

    Source: pickFirst(
      flightBooking?.ssrSource,
      priceRequest?.SSRSource,
      priceRequest?.ssrSource,
      priceResponse?.SSRSource,
      priceResponse?.ssrSource,
      priceResponse?.data?.SSRSource,
      priceResponse?.data?.ssrSource,
      "LV"
    ),
    domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337",
    Trips: (seatTrips.length > 0 ? seatTrips : [primaryTrip]).map((trip, index) => ({
      TUI: pickFirst(rootTui, trip?.TUI, trip?.tui, ""),
      Index: "",
      OrderID: String(index + 1),
    })),
  };
};

export const extractBaseFareAmount = (session) => {
  const priceResponse = session?.priceResponse || {};
  const priceRequest = session?.priceRequest || {};
  const payload = unwrapPayload(priceResponse);
  const fareBreakdown = Array.isArray(payload?.fare_breakdown)
    ? payload.fare_breakdown
    : Array.isArray(payload?.formatted?.fare_breakdown)
      ? payload.formatted.fare_breakdown
      : [];
  const fareBreakdownTotal = fareBreakdown.reduce((sum, item) => {
    const value = readNumber(item?.total_journey_price, item?.totalJourneyPrice);
    return sum + (value ?? 0);
  }, 0);
  const formattedJourneyTotal = (Array.isArray(payload?.formatted?.journeys)
    ? payload.formatted.journeys
    : []
  ).reduce((sum, journey) => {
    const value = readNumber(
      journey?.total_pricing?.net,
      journey?.total_pricing?.gross,
      journey?.per_adult?.net,
      journey?.per_adult?.gross
    );
    return sum + (value ?? 0);
  }, 0);
  const primaryTrip = extractPrimaryTrip(priceResponse) || extractPrimaryTrip(priceRequest) || {};

  return readFirstPositiveNumber(
    fareBreakdownTotal,
    payload?.formatted?.final_price,
    payload?.final_price,
    payload?.formatted?.finalPrice,
    formattedJourneyTotal,
    priceResponse?.BaseFare,
    priceResponse?.baseFare,
    priceResponse?.data?.BaseFare,
    priceResponse?.Fare?.BaseFare,
    priceResponse?.fare?.baseFare,
    primaryTrip?.Amount,
    session?.urlFallback?.priceSummary?.baseFare,
    session?.urlFallback?.priceSummary?.total,
    session?.selectedFare?.netAmount,
    session?.selectedFare?.price,
    session?.selectedFare?.pricePerAdult,
    session?.selectedFlight?.fare?.pricePerAdult,
    session?.selectedFlight?.fare?.totalFare,
    session?.urlFallback?.departureFlight?.fare?.pricePerAdult,
    session?.urlFallback?.departureFlight?.fare?.totalFare
  ) || 0;
};

export const extractTaxAmount = (session) => {
  const priceResponse = session?.priceResponse || {};
  const payload = unwrapPayload(priceResponse);
  const selectedFlightTax = pickFirst(
    session?.selectedFlight?.tax,
    session?.selectedFlight?.Tax,
    session?.selectedFlight?.fare?.tax,
    session?.selectedFlight?.fare?.Tax,
    session?.selectedFare?.tax,
    session?.selectedFare?.Tax,
    session?.urlFallback?.departureFlight?.fare?.tax,
    session?.urlFallback?.departureFlight?.fare?.Tax
  );
  const payloadTax = pickFirst(
    payload?.formatted?.total_tax,
    payload?.formatted?.totalTax,
    payload?.total_tax,
    payload?.totalTax,
    payload?.Tax,
    payload?.tax
  );
  const fareBreakdown = Array.isArray(payload?.fare_breakdown)
    ? payload.fare_breakdown
    : Array.isArray(payload?.formatted?.fare_breakdown)
      ? payload.formatted.fare_breakdown
      : [];
  const fareBreakdownTax = fareBreakdown.reduce((sum, item) => {
    const value = readNumber(
      item?.total_tax,
      item?.totalTax,
      item?.total_journey_tax,
      item?.totalJourneyTax,
      item?.ADT?.tax,
      item?.CHD?.tax,
      item?.INF?.tax,
      item?.tax
    );
    return sum + (value ?? 0);
  }, 0);
  const formattedJourneyTax = (Array.isArray(payload?.formatted?.journeys)
    ? payload.formatted.journeys
    : []
  ).reduce((sum, journey) => {
    const value = readNumber(
      journey?.total_pricing?.tax,
      journey?.total_pricing?.totalTax,
      journey?.per_adult?.tax
    );
    return sum + (value ?? 0);
  }, 0);

  return readFirstPositiveNumber(
    fareBreakdownTax,
    formattedJourneyTax,
    payloadTax,
    session?.urlFallback?.priceSummary?.tax,
    selectedFlightTax
  ) || 0;
};

const readPassengerCountsFromSearchKey = (searchKey) => {
  const parts = String(searchKey || "").trim().split("_");
  const lastDateIndex = parts.reduce(
    (lastIndex, part, index) =>
      /^\d{4}-\d{2}-\d{2}$/.test(String(part || "").trim()) ? index : lastIndex,
    -1
  );
  const countParts = parts
    .slice(lastDateIndex >= 0 ? lastDateIndex + 1 : 0)
    .filter((part) => /^\d+$/.test(String(part || "").trim()))
    .slice(0, 3);

  if (countParts.length >= 3) {
    return {
      adult: Math.max(Number(countParts[0] || 1), 1),
      child: Math.max(Number(countParts[1] || 0), 0),
      infant: Math.max(Number(countParts[2] || 0), 0),
    };
  }

  return {
    adult: Math.max(Number(parts[4] || 1), 1),
    child: Math.max(Number(parts[5] || 0), 0),
    infant: Math.max(Number(parts[6] || 0), 0),
  };
};

export const getBookingPassengerCounts = (session) => {
  const priceRequest = session?.priceRequest || {};
  const countsFromSearchKey = readPassengerCountsFromSearchKey(
    priceRequest?.search_key || session?.selectedFlight?.booking?.searchKey
  );
  if (
    countsFromSearchKey.adult > 0 ||
    countsFromSearchKey.child > 0 ||
    countsFromSearchKey.infant > 0
  ) {
    return countsFromSearchKey;
  }

  const raw =
    session?.createItineraryResponse?.data?.raw ||
    session?.startPaymentResponse?.data?.raw ||
    session?.priceResponse?.data?.raw ||
    session?.priceResponse?.raw ||
    {};

  const countsFromRaw = {
    adult: readNumber(raw?.ADT, raw?.adult),
    child: readNumber(raw?.CHD, raw?.child),
    infant: readNumber(raw?.INF, raw?.infant),
  };

  if (
    countsFromRaw.adult !== null ||
    countsFromRaw.child !== null ||
    countsFromRaw.infant !== null
  ) {
    return {
      adult: Math.max(countsFromRaw.adult ?? 1, 1),
      child: Math.max(countsFromRaw.child ?? 0, 0),
      infant: Math.max(countsFromRaw.infant ?? 0, 0),
    };
  }

  return countsFromSearchKey;
};

export const getBookingDetailsView = (session) => {
  const fallbackView = session?.urlFallback || null;
  const payload = unwrapPayload(session?.priceResponse);
  const selectedFare = session?.selectedFare || null;
  const selectedFlight = session?.selectedFlight || null;
  const routeContext = session?.routeContext || {};
  const journeys = getFormattedJourneys(payload);
  const departureJourney =
    journeys.find((journey) => String(journey?.journey_type || "").toUpperCase() === "ONWARD") ||
    journeys[0] ||
    null;
  const returnJourney =
    journeys.find((journey) => String(journey?.journey_type || "").toUpperCase() === "RETURN") ||
    journeys[1] ||
    null;
  const departureSource =
    departureJourney?.flight_details || payload?.depart || payload?.departure_details || payload;
  const returnSource =
    returnJourney?.flight_details || payload?.return || payload?.return_details || null;

  const isSelectedRoundTrip = Boolean(
    selectedFlight?.outbound ||
      selectedFlight?.inbound ||
      selectedFlight?.depart?.flight ||
      selectedFlight?.return?.flight ||
      selectedFlight?.tripCard?.depart?.flight ||
      selectedFlight?.tripCard?.return?.flight
  );
  const selectedDepartureFlight = isSelectedRoundTrip
    ? buildRoundSelectedFlightCard(selectedFlight, selectedFare, "depart")
    : buildSelectedFlightCard(selectedFlight, selectedFare);
  const selectedReturnFlight = isSelectedRoundTrip
    ? buildRoundSelectedFlightCard(selectedFlight, selectedFare, "return")
    : null;
  const rawDepartureFlight =
    selectedDepartureFlight ||
    fallbackView?.departureFlight ||
    buildFlightCard(departureSource, selectedFare);
  const rawReturnFlight =
    selectedReturnFlight ||
    fallbackView?.returnFlight ||
    buildFlightCard(returnSource, selectedFare);
  const departureFlight = normalizeFlightCardLogo(rawDepartureFlight);
  const returnFlight = normalizeFlightCardLogo(rawReturnFlight);
  const selectedDepartureRoute = isSelectedRoundTrip
    ? parseRouteLabel(
        selectedFlight?.outbound?.departure?.city ||
          selectedFlight?.depart?.flight?.departure?.city ||
          selectedFlight?.tripCard?.depart?.flight?.departure?.city
      )
    : parseRouteLabel(selectedFlight?.departure?.city);
  const selectedArrivalRoute = isSelectedRoundTrip
    ? parseRouteLabel(
        selectedFlight?.outbound?.arrival?.city ||
          selectedFlight?.depart?.flight?.arrival?.city ||
          selectedFlight?.tripCard?.depart?.flight?.arrival?.city
      )
    : parseRouteLabel(selectedFlight?.arrival?.city);
  const routeFrom =
    String(
      routeContext?.fromCode ||
      fallbackView?.header?.fromCode ||
      selectedDepartureRoute.code ||
      departureFlight?.departure?.airport?.split("-")[0] ||
      departureSource?.origin ||
      departureSource?.from ||
      ""
    ).trim().toUpperCase();
  const routeTo =
    String(
      routeContext?.toCode ||
      fallbackView?.header?.toCode ||
      selectedArrivalRoute.code ||
      departureFlight?.arrival?.airport?.split("-")[0] ||
      (returnSource?.to || returnSource?.destination || "") ||
        departureSource?.destination ||
        departureSource?.to ||
        ""
    )
      .trim()
      .toUpperCase();
  const headerFrom = splitAirportMeta(
    routeContext?.fromName ||
      fallbackView?.header?.fromName ||
      selectedFlight?.details?.fromName ||
      selectedDepartureFlight?.departure?.city ||
      departureSource?.dep_airport_name ||
      departureSource?.fromName ||
      departureSource?.FromName,
    routeFrom || "N/A"
  ).cityName;
  const headerTo = splitAirportMeta(
    routeContext?.toName ||
      fallbackView?.header?.toName ||
      selectedFlight?.details?.toName ||
      selectedDepartureFlight?.arrival?.city ||
      (returnSource?.arr_airport_name || returnSource?.toName || returnSource?.ToName) ||
      departureSource?.arr_airport_name ||
      departureSource?.toName ||
      departureSource?.ToName,
    routeTo || "N/A"
  ).cityName;
  const summaryDuration = departureFlight?.duration || { hours: "00", minutes: "00" };

  return {
    isRoundTrip: Boolean(returnFlight),
    header: {
      fromName: headerFrom,
      fromCode: routeFrom,
      toName: headerTo,
      toCode: routeTo,
      date: formatHeaderDate(
        selectedFlight?.details?.departureDateTime ||
          fallbackView?.header?.date ||
          selectedDepartureFlight?.departure?.date ||
          departureSource?.departure
      ),
      stops: departureFlight?.stops || "N/A",
      duration: `${summaryDuration.hours} h ${summaryDuration.minutes} m`,
      cabinClass: departureFlight?.travelClass || "Economy",
    },
    departureFlight,
    returnFlight,
  };
};

export const buildBookingFallbackQuery = (session) => {
  const view = getBookingDetailsView(session);
  const baseFare = extractBaseFareAmount(session);
  const tax = extractTaxAmount(session);
  const payload = {
    header: view?.header || null,
    departureFlight: view?.departureFlight || null,
    returnFlight: view?.returnFlight || null,
    priceSummary: {
      baseFare,
      tax,
      total: baseFare,
    },
  };
  const encoded = safeEncodePayload(payload);
  return encoded ? `bookingFallback=${encoded}` : "";
};

const readSsrAmount = (item) =>
  readNumber(
    item?.price,
    item?.Price,
    item?.amount,
    item?.Amount,
    item?.fare,
    item?.Fare,
    item?.seatFare,
    item?.SeatFare,
    item?.totalAmount,
    item?.TotalAmount,
    item?.grossAmount,
    item?.GrossAmount,
    item?.charge,
    item?.Charge,
    item?.serviceCharge,
    item?.ServiceCharge,
    item?.ssrAmount,
    item?.SSRAmount
  ) ?? 0;

const formatRiyaDateSlash = (value) => {
  if (!value) return "";
  const text = String(value).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) return text;

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const normalizeRiyaGender = (value) => {
  const gender = String(value || "").trim().toUpperCase();
  if (gender === "M" || gender === "MALE") return "Male";
  if (gender === "F" || gender === "FEMALE") return "Female";
  return value || "";
};

const normalizeRiyaPaxType = (value) => {
  const type = String(value || "ADT").trim().toUpperCase();
  if (type === "CHILD" || type === "CHD") return "CHD";
  if (type === "INFANT" || type === "INF") return "INF";
  return "ADT";
};

const formatRiyaAmount = (value) => {
  const amount = readNumber(value);
  if (!Number.isFinite(amount)) return "0";

  return Number.isInteger(amount) ? String(amount) : String(amount);
};

const getRiyaSsrId = (item, keys = []) => {
  const value = pickFirst(...keys.map((key) => item?.[key]));
  if (value === undefined || value === null || value === "") return "";
  const text = String(value).trim();
  if (
    !text ||
    text.includes("::") ||
    /^journey-\d+:/i.test(text) ||
    /^(cabin|checked)-\d+$/i.test(text)
  ) {
    return "";
  }
  return text;
};

const normalizeRiyaSsrSelections = (items = [], idKeys = [], idField) => {
  const passengerTotalsBySegment = {};

  return (Array.isArray(items) ? items : [])
    .map((item) => {
      const id = getRiyaSsrId(item, idKeys);
      if (!id) return null;

      const segment = String(
        pickFirst(item?.segment, item?.journeyLabel, item?.journeyIndex, "default")
      );
      const paxRefNumber = pickFirst(
        item?.PaxRefNumber,
        item?.paxRefNumber,
        item?.PaxID,
        item?.paxId,
        item?.passengerId,
        Number.isFinite(Number(item?.passengerIndex))
          ? Number(item.passengerIndex) + 1
          : undefined
      );
      const nextSegmentPax =
        (passengerTotalsBySegment[segment] || 0) + 1;
      passengerTotalsBySegment[segment] = nextSegmentPax;

      return {
        [idField]: id,
        PaxRefNumber: String(paxRefNumber || nextSegmentPax),
      };
    })
    .filter(Boolean);
};

const buildRiyaSeatsSsrInfo = (seats = []) =>
  normalizeRiyaSsrSelections(
    seats,
    [
      "SeatID",
      "seatID",
      "SeatId",
      "seatId",
      "seat_id",
      "SSRId",
      "ssrId",
      "ssid",
      "SSID",
      "rawId",
    ],
    "SeatID"
  );

const buildRiyaBaggageSsrInfo = (baggage = []) =>
  normalizeRiyaSsrSelections(
    baggage,
    [
      "BaggageID",
      "baggageID",
      "BaggageId",
      "baggageId",
      "SSRId",
      "ssrId",
      "ssid",
      "SSID",
    ],
    "BaggageID"
  );

const buildRiyaMealsSsrInfo = (meals = []) =>
  normalizeRiyaSsrSelections(
    meals,
    [
      "MealID",
      "mealID",
      "MealId",
      "mealId",
      "SSRId",
      "ssrId",
      "ssid",
      "SSID",
    ],
    "MealID"
  );

const getRiyaSelectedSsrAmount = (session = {}, prices = {}) => {
  const pricedSsrAmount = readNumber(prices?.baggage, prices?.meals, prices?.seats);
  if (Number.isFinite(pricedSsrAmount)) {
    return (
      (readNumber(prices?.baggage) || 0) +
      (readNumber(prices?.meals) || 0) +
      (readNumber(prices?.seats) || 0)
    );
  }

  const selectedSsrItems = [
    ...(Array.isArray(session?.baggage) ? session.baggage : []),
    ...(Array.isArray(session?.meals) ? session.meals : []),
    ...(Array.isArray(session?.seats) ? session.seats : []),
  ];

  return selectedSsrItems.reduce((sum, item) => sum + readSsrAmount(item), 0);
};

const buildRiyaCreateItineraryPayload = (session, prices) => {
  const priceResponse = unwrapPayload(session?.priceResponse);
  const rawPriceResponse = session?.priceResponse || {};
  const priceRequest = session?.priceRequest || {};
  const selectedFlight = session?.selectedFlight || {};
  const booking = selectedFlight?.booking || {};
  const selectedFare = session?.selectedFare || {};
  const priceData = rawPriceResponse?.data || {};
  const nestedPriceData = priceData?.data || {};
  const travelers = Array.isArray(session?.travelerDetails)
    ? session.travelerDetails
    : [];
  const contact = session?.bookingContactDetails || {};
  const seatPayload = buildRiyaSeatLayoutPayload(session, travelers);
  const passengerCounts = getBookingPassengerCounts(session);
  const seatsSsrInfo = buildRiyaSeatsSsrInfo(session?.seats);
  const baggageSsrInfo = buildRiyaBaggageSsrInfo(session?.baggage);
  const mealsSsrInfo = buildRiyaMealsSsrInfo(session?.meals);
  const selectedSsrAmount = getRiyaSelectedSsrAmount(session, prices);
  const providerFareAmount = readFirstPositiveNumber(
    priceResponse?.formatted?.final_price,
    priceResponse?.formatted?.finalPrice,
    priceResponse?.final_price,
    priceResponse?.finalPrice,
    priceResponse?.TotalAmount,
    priceData?.TotalAmount,
    nestedPriceData?.TotalAmount,
    selectedFare?.netAmount,
    selectedFare?.price,
    prices?.baseFare
  );
  const totalAmount = readFirstPositiveNumber(
    Number.isFinite(providerFareAmount)
      ? providerFareAmount + selectedSsrAmount
      : undefined,
    prices?.total,
    priceResponse?.TotalAmount,
    priceData?.TotalAmount,
    nestedPriceData?.TotalAmount,
    0
  );
  const formattedJourneys = Array.isArray(priceResponse?.formatted?.journeys)
    ? priceResponse.formatted.journeys
    : [];
  const rawFormattedJourneys = Array.isArray(priceData?.formatted?.journeys)
    ? priceData.formatted.journeys
    : Array.isArray(nestedPriceData?.formatted?.journeys)
      ? nestedPriceData.formatted.journeys
      : [];
  const firstFormattedJourney =
    formattedJourneys[0] || rawFormattedJourneys[0] || {};
  const token = String(
    pickFirst(
      firstFormattedJourney?.Token,
      firstFormattedJourney?.token,
      priceResponse?.Token,
      priceResponse?.token,
      priceResponse?.formatted?.Token,
      priceResponse?.formatted?.token,
      priceResponse?.raw?.Token,
      priceResponse?.raw?.token,
      rawPriceResponse?.Token,
      rawPriceResponse?.token,
      priceData?.Token,
      priceData?.token,
      priceData?.raw?.Token,
      priceData?.raw?.token,
      nestedPriceData?.Token,
      nestedPriceData?.token,
      nestedPriceData?.raw?.Token,
      nestedPriceData?.raw?.token,
      selectedFare?.Token,
      selectedFare?.token,
      booking?.Token,
      booking?.token,
      priceRequest?.Token,
      priceRequest?.token,
      ""
    )
  ).trim();

  return {
    provider: "riya",
    domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337",
    AdultCount: passengerCounts.adult,
    ChildCount: passengerCounts.child,
    InfantCount: passengerCounts.infant,
    ItineraryFlightsInfo: [
      {
        Token: token,
        FlighstInfo: (seatPayload?.FlightsInfo || []).map((flight) => ({
          FlightID: flight.FlightID || "",
          FlightNumber: flight.FlightNumber || "",
          Origin: flight.Origin || "",
          Destination: flight.Destination || "",
          DepartureDateTime: flight.DepartureDateTime || "",
          ArrivalDateTime: flight.ArrivalDateTime || "",
        })),
        PaymentMode: "T",
        SeatsSSRInfo: seatsSsrInfo,
        BaggSSRInfo: baggageSsrInfo,
        MealsSSRInfo: mealsSsrInfo,
        OtherSSRInfo: [],
        PaymentInfo: [
          {
            TotalAmount: formatRiyaAmount(totalAmount),
          },
        ],
      },
    ],
    PaxDetailsInfo: travelers.map((traveler, index) => ({
      PaxRefNumber: String(index + 1),
      Title: String(traveler?.Title || "").replace(/\./g, "").toUpperCase(),
      FirstName: String(traveler?.FName || "").trim(),
      LastName: String(traveler?.LName || "").trim(),
      DOB: formatRiyaDateSlash(traveler?.DOB),
      Gender: normalizeRiyaGender(traveler?.Gender),
      PaxType: normalizeRiyaPaxType(traveler?.PTC || traveler?.type),
      PassportNo: traveler?.PassportNo || "",
      PassportExpiry: formatRiyaDateSlash(
        traveler?.PDOE || traveler?.PassportExpiry
      ),
      PassportIssuedDate: formatRiyaDateSlash(
        traveler?.PassportIssuedDate || traveler?.PassportIssuedOn
      ),
      PassportCountryCode:
        traveler?.PassportCountryCode || traveler?.Nationality || "IN",
      InfantRef: traveler?.InfantRef || "",
    })),
    AddressDetails: {
      CountryCode: String(pickFirst(contact.CountryCode, "91")).replace(
        /[^\d]/g,
        ""
      ) || "91",
      ContactNumber: String(
        pickFirst(contact.MobileNumber, contact.Phone, travelers[0]?.MobileNumber, "")
      ),
      EmailID: String(pickFirst(contact.Email, travelers[0]?.Email, "")),
    },
    GSTInfo: {
      GSTNumber: "",
      GSTCompanyName: "",
      GSTAddress: "",
      GSTEmailID: "",
      GSTMobileNumber: "",
    },
    TripType: seatPayload?.SegmentInfo?.TripType || "O",
    BlockPNR: false,
    BaseOrigin: seatPayload?.SegmentInfo?.BaseOrigin || "",
    BaseDestination: seatPayload?.SegmentInfo?.BaseDestination || "",
    TrackId: seatPayload?.TrackId || "",
  };
};

export const buildCreateItineraryPayload = (session, prices) => {
  const provider = resolveFlightProvider(session);

  if (provider === "riya") {
    return buildRiyaCreateItineraryPayload(session, prices);
  }

  const priceResponse = unwrapPayload(session?.priceResponse);
  const fareBreakdown = Array.isArray(priceResponse?.fare_breakdown)
    ? priceResponse.fare_breakdown
    : Array.isArray(priceResponse?.formatted?.fare_breakdown)
      ? priceResponse.formatted.fare_breakdown
      : [];
  const fareBreakdownTotal = fareBreakdown.reduce((sum, item) => {
    const value = readNumber(item?.total_journey_price, item?.totalJourneyPrice);
    return sum + (value ?? 0);
  }, 0);
  const finalPrice = readNumber(
    fareBreakdownTotal > 0 ? fareBreakdownTotal : null,
    priceResponse?.formatted?.final_price,
    priceResponse?.final_price,
    priceResponse?.formatted?.finalPrice,
    session?.selectedFare?.netAmount,
    session?.selectedFare?.price,
    session?.selectedFare?.pricePerAdult
  );
  const contact = session?.bookingContactDetails || {};
  const travelers = Array.isArray(session?.travelerDetails)
    ? session.travelerDetails
    : [];
  const baggageSelections = Array.isArray(session?.baggage) ? session.baggage : [];
  const mealSelections = Array.isArray(session?.meals) ? session.meals : [];
  const seatSelections = Array.isArray(session?.seats) ? session.seats : [];
  const primaryTraveler = travelers[0] || {};
  const contactMobile = pickFirst(contact.MobileNumber, primaryTraveler.MobileNumber, "");
  const contactCountryCode = pickFirst(
    contact.CountryCode,
    primaryTraveler.CountryCode,
    ""
  );
  const totalPassengers = Math.max(travelers.length, 1);
  const ssrSelections = [...baggageSelections, ...mealSelections, ...seatSelections];
  const legacySsrSelections = ssrSelections
    .map((item, index) => {
      const fuid = readNumber(
        item?.fuid,
        item?.FUID,
        item?.flight_uid,
        item?.flightUid,
        item?.flightId,
        item?.FlightID,
        item?.FlightId,
        Number.isFinite(Number(item?.journeyIndex))
          ? Number(item.journeyIndex) + 1
          : undefined
      );
      const ssid = readNumber(
        item?.ssid,
        item?.SSID,
        item?.SeatID,
        item?.seatID,
        item?.SeatId,
        item?.seatId,
        item?.SSRId,
        item?.ssrId,
        item?.rawId,
        item?.id
      );

      if (!Number.isFinite(fuid) || !Number.isFinite(ssid)) {
        return null;
      }

      return {
        item,
        fuid,
        ssid,
        paxId: (index % totalPassengers) + 1,
      };
    })
    .filter(Boolean);
  const ssrPayload = legacySsrSelections
    .map((item, index) => {
      return {
        FUID: item.fuid,
        PaxID: item.paxId || (index % totalPassengers) + 1,
        SSID: item.ssid,
      };
    })
    .filter(Boolean);
  const ssrAmount = legacySsrSelections.reduce(
    (sum, item) => sum + readSsrAmount(item.item),
    0
  );
  const baseNetAmount = readNumber(finalPrice, prices?.baseFare) ?? 0;
  const netAmount = baseNetAmount;

  return {
    TUI: pickFirst(
      priceResponse?.tui,
      priceResponse?.TUI,
      session?.ssrResponse?.data?.tui,
      session?.ssrResponse?.tui,
      ""
    ),
    BookingType: "HB",
    ContactInfo: {
      Title: pickFirst(contact.Title, primaryTraveler.Title, ""),
      FName: pickFirst(contact.FName, primaryTraveler.FName, ""),
      LName: pickFirst(contact.LName, primaryTraveler.LName, ""),
      Mobile: contactMobile,
      Phone: pickFirst(contact.Phone, contactMobile, ""),
      Email: pickFirst(contact.Email, primaryTraveler.Email, ""),
      Address: contact.Address || "",
      CountryCode: "IN",
      State: contact.State || "",
      City: contact.City || "",
      PIN: contact.PIN || "",
      GSTCompanyName: "",
      GSTTIN: "",
      GSTMobile: "",
      GSTEmail: "",
      UpdateProfile: false,
      IsGuest: false,
      SaveGST: false,
    },
    Travellers: travelers.map((traveler, index) => ({
      ID: index + 1,
      Title: traveler.Title || "",
      FName: traveler.FName || "",
      LName: traveler.LName || "",
      Age: traveler.Age ? Number(traveler.Age) : "",
      DOB: traveler.DOB || "",
      Gender: normalizeGenderCode(traveler.Gender),
      PTC: traveler.PTC || "",
      Nationality: traveler.Nationality || "",
      PassportNo: traveler.PassportNo || "",
      PLI: traveler.PLI || "",
      PDOE: traveler.PDOE || "",
      VisaType: traveler.VisaType || "",
    })),
    PLP: [],
    SSR: ssrPayload,
    CrossSell: [],
    NetAmount: netAmount,
    SSRAmount: ssrAmount,
    ClientID: "",
    DeviceID: "",
    AppVersion: "",
    CrossSellAmount: 0,
  };
};

const readPassengerId = (item = {}, fallback = 1) =>
  readNumber(
    item?.PaxID,
    item?.PaxId,
    item?.paxID,
    item?.paxId,
    item?.PaxRefNumber,
    item?.paxRefNumber,
    item?.passengerId,
    Number.isFinite(Number(item?.passengerIndex))
      ? Number(item.passengerIndex) + 1
      : undefined,
    fallback
  ) || fallback;

const readSsrId = (item = {}) =>
  pickFirst(
    item?.ssid,
    item?.SSID,
    item?.SSRId,
    item?.ssrId,
    item?.SeatID,
    item?.seatID,
    item?.MealID,
    item?.mealID,
    item?.BaggageID,
    item?.baggageID,
    item?.rawId
  );

const readFuid = (item = {}) =>
  pickFirst(
    item?.fuid,
    item?.FUID,
    item?.flight_uid,
    item?.flightUid,
    item?.flightId,
    item?.FlightID,
    item?.FlightId,
    Number.isFinite(Number(item?.journeyIndex))
      ? Number(item.journeyIndex) + 1
      : undefined,
    "1"
  );

const normalizeCreateBookingSeat = (seat = {}, index = 0) => {
  const seatNumber = String(
    pickFirst(seat?.seat_no, seat?.seatNumber, seat?.number, seat?.id, "")
  ).replace(/-/g, "");
  const ssid = readSsrId(seat);

  return {
    seat_no: seatNumber,
    status: seat?.status || seat?.statusLabel || "Open",
    available: seat?.available ?? true,
    type: seat?.type || "ALL",
    price: readNumber(seat?.price) || 0,
    row: readNumber(seat?.row, seat?.rowId) || 0,
    col: readNumber(seat?.col, seat?.column, seat?.coordinateColumn) || 0,
    ssid: readNumber(ssid) ?? ssid ?? "",
    PaxID: readPassengerId(seat, index + 1),
  };
};

const normalizeCreateBookingMeal = (meal = {}, index = 0) => {
  const ssid = readSsrId(meal);

  return {
    id: readNumber(ssid, meal?.id) ?? ssid ?? meal?.id ?? "",
    ssid: readNumber(ssid) ?? ssid ?? "",
    fuid: String(readFuid(meal) || "1"),
    name: meal?.name || meal?.title || meal?.label || "",
    piece_description: meal?.piece_description ?? meal?.pieceDescription ?? null,
    pieceDescription: meal?.pieceDescription ?? meal?.piece_description ?? null,
    price: readNumber(meal?.price) || 0,
    code: meal?.code || meal?.Code || "",
    type: meal?.type || meal?.tag || "",
    PaxID: readPassengerId(meal, index + 1),
  };
};

const normalizeCreateBookingBaggage = (baggage = {}, index = 0) => {
  const ssid = readSsrId(baggage);

  return {
    id: readNumber(ssid, baggage?.id) ?? ssid ?? baggage?.id ?? "",
    ssid: readNumber(ssid) ?? ssid ?? "",
    fuid: String(readFuid(baggage) || "1"),
    name: baggage?.name || baggage?.label || "",
    price: readNumber(baggage?.price) || 0,
    code: baggage?.code || baggage?.Code || "",
    weight: baggage?.weight || "",
    PaxID: readPassengerId(baggage, index + 1),
  };
};

export const buildCreateBookingPayload = (session = {}, prices = {}) => {
  const priceResponse = unwrapPayload(session?.priceResponse);
  const priceRequest = session?.priceRequest || {};
  const travelers = Array.isArray(session?.travelerDetails)
    ? session.travelerDetails
    : [];
  const contact = session?.bookingContactDetails || {};
  const primaryTraveler = travelers[0] || {};
  const searchKey = pickFirst(
    priceRequest?.search_key,
    priceRequest?.SearchKey,
    priceRequest?.searchKey,
    priceResponse?.search_key,
    priceResponse?.SearchKey,
    priceResponse?.data?.search_key,
    session?.priceResponse?.search_key,
    session?.priceResponse?.SearchKey,
    session?.priceResponse?.data?.search_key,
    session?.ssrResponse?.data?.search_key,
    session?.ssrResponse?.search_key,
    session?.selectedFlight?.booking?.searchKey,
    ""
  );
  const tui = pickFirst(
    priceResponse?.tui,
    priceResponse?.TUI,
    priceResponse?.raw?.TUI,
    session?.priceResponse?.tui,
    session?.priceResponse?.TUI,
    session?.priceResponse?.data?.tui,
    session?.priceResponse?.data?.TUI,
    session?.ssrResponse?.data?.tui,
    session?.ssrResponse?.data?.TUI,
    session?.ssrResponse?.tui,
    session?.ssrResponse?.TUI,
    ""
  );
  const netAmount =
    readNumber(
      prices?.total,
      priceResponse?.raw?.NetAmount,
      priceResponse?.raw?.AirlineNetFare,
      priceResponse?.NetAmount,
      priceResponse?.AirlineNetFare,
      priceResponse?.fare_breakdown?.[0]?.net,
      priceResponse?.fare_breakdown?.[0]?.NetAmount,
      priceResponse?.formatted?.base_price,
      priceResponse?.formatted?.final_price,
      priceResponse?.final_price,
      priceResponse?.TotalAmount,
      session?.selectedFare?.netAmount,
      session?.selectedFare?.price,
      session?.selectedFare?.pricePerAdult
    ) || 0;
  const contactPhone = String(
    pickFirst(contact.MobileNumber, contact.Phone, primaryTraveler.MobileNumber, "")
  );
  const contactCountryCode = String(
    pickFirst(contact.CountryCode, primaryTraveler.CountryCode, "IN")
  );
  const mobileCountryCode = String(
    pickFirst(contact.MobileCountryCode, contact.CountryCode, primaryTraveler.CountryCode, "+91")
  );
  const selectedSeats = Array.isArray(session?.seats)
    ? session.seats.map(normalizeCreateBookingSeat)
    : [];
  const selectedMeals = Array.isArray(session?.meals)
    ? session.meals.map(normalizeCreateBookingMeal)
    : [];
  const selectedBaggage = Array.isArray(session?.baggage)
    ? session.baggage.map(normalizeCreateBookingBaggage)
    : [];

  return {
    search_key: searchKey,
    domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337",
    channel: makeV2CreateBookingChannel(),
    TUI: tui,
    selectedSeats,
    selectedMeals,
    selectedBaggage,
    otherSsr: Array.isArray(session?.otherSsr) ? session.otherSsr : [],
    passengers: travelers.map((traveler, index) => ({
      id: index + 1,
      title: traveler?.Title || "",
      firstName: traveler?.FName || "",
      lastName: traveler?.LName || "",
      type: traveler?.PTC || traveler?.type || "",
      gender: normalizeGenderCode(traveler?.Gender),
      dob: traveler?.DOB || "",
    })),
    contact: {
      phone: contactPhone,
      email: String(pickFirst(contact.Email, primaryTraveler.Email, "")),
      address: String(pickFirst(contact.Address, "")),
      countryCode: contactCountryCode,
      state: String(pickFirst(contact.State, contact.state, "")),
      city: String(pickFirst(contact.City, contact.city, "")),
      pin: String(pickFirst(contact.Pin, contact.PIN, contact.pin, "")),
    },
    payment: {
      netAmount,
    },
  };
};

const getCreateBookingRaw = (createBookingResponse = {}) =>
  createBookingResponse?.data?.result?.raw ||
  createBookingResponse?.data?.result?.data ||
  createBookingResponse?.result?.raw ||
  createBookingResponse?.result?.data ||
  createBookingResponse?.data?.raw ||
  createBookingResponse?.raw ||
  {};

const normalizePaymentGatewayId = (paymentGateway) => {
  if (paymentGateway && typeof paymentGateway === "object") {
    return String(
      paymentGateway.id ||
        paymentGateway.slug ||
        paymentGateway.code ||
        paymentGateway.name ||
        paymentGateway.payment_gateway ||
        paymentGateway.paymentGateway ||
        paymentGateway.gateway ||
        ""
    )
      .trim()
      .toLowerCase();
  }

  return String(paymentGateway || "").trim().toLowerCase();
};

export const buildFlightGatewayPaymentPayload = ({
  session = {},
  createBookingPayload = {},
  createBookingResponse = {},
  paymentGateway = "",
} = {}) => {
  const gateway = normalizePaymentGatewayId(paymentGateway);
  const responseData = createBookingResponse?.data || createBookingResponse || {};
  const raw = getCreateBookingRaw(createBookingResponse);
  const netAmount = readNumber(
    raw?.NetAmount,
    raw?.AirlineNetFare,
    responseData?.result?.raw?.NetAmount,
    responseData?.result?.data?.NetAmount,
    responseData?.NetAmount,
    createBookingPayload?.payment?.netAmount
  ) || 0;
  const configuredRedirectUrl = `${window.location.origin}/payment-status?booking_type=flight`
  const redirectUrl = configuredRedirectUrl

  return {
    domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337",
    booking_type: "flight",
    payment_gateway: gateway,
    payment_mode: gateway,
    search_key: String(
      pickFirst(
        responseData?.search_key,
        responseData?.searchKey,
        createBookingPayload?.search_key,
        session?.priceRequest?.search_key,
        ""
      )
    ),
    TUI: String(
      pickFirst(
        raw?.TUI,
        responseData?.result?.raw?.TUI,
        responseData?.result?.data?.TUI,
        responseData?.TUI,
        createBookingPayload?.TUI,
        ""
      )
    ),
    TransactionID:
      raw?.TransactionID ??
      responseData?.result?.raw?.TransactionID ??
      responseData?.result?.data?.TransactionID ??
      responseData?.TransactionID ??
      "",
    NetAmount: netAmount,
    amount: netAmount,
    redirectUrl: redirectUrl,
    message: "Flight booking payment",
  };
};

export const buildStartPaymentPayload = (session) => {
  const createItineraryResponse = session?.createItineraryResponse || {};
  const raw =
    createItineraryResponse?.data?.raw ||
    createItineraryResponse?.raw ||
    {};
  const itineraryTui = String(raw?.TUI || "").trim();
  const itineraryTransactionId = raw?.TransactionID ?? "";
  const itineraryNetAmount = readNumber(
    raw?.NetAmount
  );

  return {
    domain: process.env.NEXT_PUBLIC_DOMAIN || "",
    TUI: itineraryTui,
    ClientID: process.env.NEXT_PUBLIC_ClientID?.replace(/^"|"$/g, "") || "",
    TransactionID: itineraryTransactionId,
    PaymentType: "",
    PaymentAmount: 0,
    NetAmount: itineraryNetAmount ?? 0,
    BrowserKey: null,
    Hold: true,
    Promo: null,
    BankCode: "",
    GateWayCode: "",
    MerchantID: "",
    PaymentCharge: 0,
    ReleaseDate: "",
    CardType: "default",
    OnlinePayment: false,
    DepositPayment: true,
    VPA: "",
    CardAlias: "",
    QuickPay: null,
    BookingType: "HP",
    RMSSignature: "",
    TargetCurrency: "",
    TargetAmount: 0,
    ServiceType: "ITI",
    Card: {
      Number: "",
      Expiry: "",
      CVV: "",
      CHName: "",
      Address: "",
      City: "",
      State: "",
      Country: "",
      PIN: "",
      International: false,
      SaveCard: false,
      FName: "",
      LName: "",
      EMIMonths: "0",
    },
  };
};

export const buildRetrieveBookingPayload = (session) => {
  const startPaymentResponse = session?.startPaymentResponse || {};
  const startPaymentData = startPaymentResponse?.data || {};
  const createItineraryResponse = session?.createItineraryResponse || {};
  const createRaw =
    createItineraryResponse?.data?.raw ||
    createItineraryResponse?.raw ||
    {};

  return {
    domain: process.env.NEXT_PUBLIC_DOMAIN || "",
    ReferenceNumber: pickFirst(
      startPaymentData?.transactionId,
      startPaymentData?.TransactionID,
      startPaymentData?.BookingID,
      startPaymentData?.bookingId,
      startPaymentData?.ReferenceNumber,
      startPaymentData?.referenceNumber,
      ""
    ),
    ReferenceType: "T",
    ClientID: process.env.NEXT_PUBLIC_ClientID?.replace(/^"|"$/g, "") || "",
    TUI: String(
      pickFirst(
        startPaymentData?.TUI,
        startPaymentData?.tui,
        createRaw?.TUI,
        ""
      )
    ).trim(),
  };
};

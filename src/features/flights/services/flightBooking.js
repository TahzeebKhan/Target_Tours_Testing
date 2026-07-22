import api from "@/lib/axios";
import {
  extractFlightPricingPayload,
  hasFlightPricingPayload,
  isFlightPricingResult,
} from "./flightPricingPayload.mjs";

export const FLIGHT_FARE_EXPIRED_EVENT = "target-tours:flight-fare-expired";

export const isFareExpiredResponse = (payload) =>
  Boolean(
    payload?.fare_expired ??
      payload?.fareExpired ??
      payload?.data?.fare_expired ??
      payload?.data?.fareExpired
  );

const emitFareExpired = (payload) => {
  if (typeof window === "undefined" || !isFareExpiredResponse(payload)) return;

  window.dispatchEvent(
    new CustomEvent(FLIGHT_FARE_EXPIRED_EVENT, {
      detail: {
        message:
          payload?.message ||
          payload?.data?.message ||
          "Fares expired please search again",
        searchKey:
          payload?.search_key ||
          payload?.searchKey ||
          payload?.data?.search_key ||
          payload?.data?.searchKey ||
          "",
      },
    })
  );
};

const normalizeProvider = (provider) =>
  String(provider || "akbar").trim().toLowerCase();

const getProviderFromSearchKey = (searchKey) => {
  const parts = String(searchKey || "").split("_").filter(Boolean);
  const originalLength = parts.length;

  while (["true", "false"].includes(parts.at(-1)?.toLowerCase())) {
    parts.pop();
  }

  return parts.length < originalLength ? parts.at(-1) || "" : "";
};

const makePricingChannel = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `fare-options:${crypto.randomUUID()}`;
  }

  return `fare-options:${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const makeV2PricingChannel = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `pricing:${crypto.randomUUID()}`;
  }

  return `pricing:${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const makeSsrChannel = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `ssr-${crypto.randomUUID()}`;
  }

  return `ssr-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const makeSeatLayoutChannel = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `seatLayout-${crypto.randomUUID()}`;
  }

  return `seatLayout-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const parseMaybeJson = (value) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const unwrapPricingPayload = (payload) => {
  let current = payload;

  for (let index = 0; index < 5; index += 1) {
    const parsed = parseMaybeJson(current);
    if (parsed !== current) {
      current = parsed;
      continue;
    }

    const next = current?.received?.message || current?.data?.message || null;
    if (!next || next === current) return current;

    const parsedNext = parseMaybeJson(next);
    if (parsedNext && typeof parsedNext === "object" && parsedNext !== current) {
      current = parsedNext;
      continue;
    }

    return current;
  }

  return current;
};

const getPayloadChannel = (payload) =>
  payload?.channel ||
  payload?.data?.channel ||
  "";

const getPayloadType = (payload) =>
  String(payload?.type || payload?.data?.type || "").toUpperCase();

const getApiMessage = (payload) =>
  payload?.error?.message ||
  payload?.data?.error?.message ||
  payload?.data?.result?.message ||
  payload?.result?.message ||
  payload?.message ||
  payload?.data?.message ||
  "Flight request failed. Please try again.";

const isPricingComplete = (payload) => {
  const type = getPayloadType(payload);
  return (
    type.includes("COMPLETE") ||
    type.includes("COMPLETED") ||
    type.includes("RESULT") ||
    type.includes("DONE")
  );
};

const isFareOptionsComplete = (payload) => {
  const type = getPayloadType(payload);

  return (
    type.includes("FARE_OPTIONS") &&
    !type.includes("PROVIDER") &&
    (type.includes("COMPLETE") ||
      type.includes("COMPLETED") ||
      type.includes("DONE"))
  );
};

const isPricingError = (payload) => {
  const type = getPayloadType(payload);
  return Boolean(payload?.error || payload?.data?.error) ||
    (type.includes("FARE_OPTIONS") && type.includes("ERROR")) ||
    (type.includes("PRICING") && type.includes("ERROR")) ||
    (type.includes("SSR") && type.includes("ERROR")) ||
    (type.includes("SEAT") && type.includes("LAYOUT") && type.includes("ERROR")) ||
    type === "ERROR";
};

const isFlightSsrComplete = (payload) => {
  const type = getPayloadType(payload);
  return (
    type.includes("SSR") &&
    (type.includes("COMPLETE") || type.includes("COMPLETED"))
  );
};

const toArray = (value) => (Array.isArray(value) ? value : []);

const hasSsrItems = (payload) => {
  const root = payload?.data || payload || {};
  const containers = [
    root,
    root?.data,
    root?.result,
    root?.formatted,
    root?.raw,
    root?.data?.formatted,
    root?.data?.raw,
  ].filter(Boolean);

  return containers.some((container) =>
    Boolean(
      container?.tui ||
        container?.TUI ||
        container?.trackid ||
        container?.TrackId ||
        container?.SSRSource ||
        container?.ssrSource ||
        container?.ssr ||
        container?.SSR ||
        container?.meals ||
        container?.baggage ||
        container?.seats ||
        container?.journeys ||
        container?.Flights ||
        container?.flights ||
        Array.isArray(container?.Meal) ||
        Array.isArray(container?.Baggage) ||
        Array.isArray(container?.Seat)
    )
  );
};

const extractFlightSsrPayload = (payload) => {
  if (!payload || typeof payload !== "object") return null;

  const directCandidates = [
    payload,
    payload?.data,
    payload?.data?.data,
  ];

  for (const candidate of directCandidates) {
    if (hasSsrItems(candidate)) return candidate;
  }

  const resultContainers = [
    payload?.results,
    payload?.data?.results,
    payload?.data?.data?.results,
  ];

  for (const results of resultContainers) {
    for (const result of toArray(results)) {
      const status = String(result?.status || "").toLowerCase();
      if (status && status !== "fulfilled" && status !== "success") continue;
      if (result?.success === false || result?.data?.success === false) continue;

      const candidates = [
        result?.data,
        result?.data?.data,
        result,
      ];
      const ssrPayload = candidates.find(hasSsrItems);
      if (ssrPayload) return ssrPayload;
    }
  }

  return null;
};

const hasSeatLayoutItems = (payload) => {
  if (!payload || typeof payload !== "object") return false;

  if (Array.isArray(payload)) {
    return payload.some((item) => hasSeatLayoutItems(item));
  }

  const containers = [
    payload,
    payload?.formatted,
    payload?.data?.formatted,
    payload?.data?.data?.formatted,
  ].filter(Boolean);

  return containers.some((container) => {
    if (Array.isArray(container)) {
      return container.some((item) => hasSeatLayoutItems(item));
    }

    const seatCollections = [
      container?.seat_layout,
      container?.seatLayout,
      container?.SeatLayout,
      container?.seat_map,
      container?.seatMap,
      container?.seats,
      container?.Seats,
      container?.rows,
      container?.Rows,
      container?.decks,
      container?.Decks,
      container?.Seat,
      container?.journeys,
      container?.Journeys,
      container?.Journey,
    ];

    return seatCollections.some((value) =>
      Array.isArray(value)
        ? value.length > 0 && value.some((item) => hasSeatLayoutItems(item) || Boolean(item))
        : Boolean(value)
    );
  });
};

const getSeatLayoutFormatted = (payload) => {
  if (!payload || typeof payload !== "object") return null;

  const candidates = [
    payload?.formatted,
    payload?.data?.formatted,
    payload?.data?.data?.formatted,
    payload,
  ];

  return candidates.find(hasSeatLayoutItems) || null;
};

const normalizeSeatLayoutPayload = (payload) => {
  const formatted = getSeatLayoutFormatted(payload);
  if (!formatted) return null;

  return {
    ...(payload || {}),
    formatted,
  };
};

const extractFlightSeatLayoutPayload = (payload) => {
  if (!payload || typeof payload !== "object") return null;

  const directCandidates = [
    payload,
    payload?.data,
    payload?.data?.data,
  ];

  for (const candidate of directCandidates) {
    const normalized = normalizeSeatLayoutPayload(candidate);
    if (normalized) return normalized;
  }

  const resultContainers = [
    payload?.results,
    payload?.data?.results,
    payload?.data?.data?.results,
  ];

  for (const results of resultContainers) {
    for (const result of toArray(results)) {
      const status = String(result?.status || "").toLowerCase();
      if (status && status !== "fulfilled" && status !== "success") continue;
      if (result?.success === false || result?.data?.success === false) continue;

      const candidates = [
        result?.data?.data,
        result?.data,
        result,
      ];
      const seatLayoutPayload = candidates
        .map(normalizeSeatLayoutPayload)
        .find(Boolean);
      if (seatLayoutPayload) return seatLayoutPayload;
    }
  }

  return null;
};

const isFlightSeatLayoutComplete = (payload) => {
  const type = getPayloadType(payload);
  return (
    type.includes("SEAT") &&
    (type.includes("COMPLETE") || type.includes("COMPLETED"))
  );
};

const hasPricingItems = (payload) => {
  const root = payload?.data || payload || {};
  const containers = [
    root,
    root?.data,
    root?.result,
    root?.pricing,
    root?.fare_options,
    root?.fareOptions,
    root?.merged,
    root?.data?.merged,
    root?.data?.fare_options,
    root?.data?.fareOptions,
  ].filter(Boolean);

  return containers.some((container) =>
    [
      container?.fares,
      container?.fare_options,
      container?.fareOptions,
      container?.flights,
      container?.results,
    ].some((value) => Array.isArray(value) && value.length > 0) ||
    Object.values(container).some((value) => Array.isArray(value) && value.length > 0)
  );
};

const normalizePricingFlightNo = (...values) => {
  for (const value of values) {
    const text = String(value || "").trim();
    if (!text) continue;

    if (/^\d+$/.test(text)) return text;
    const trailing = text.match(/[A-Za-z]{1,3}[-\s]?(\d{1,4})$/);
    if (trailing) return trailing[1];
    if (text.includes("|")) return text.split("|").pop()?.trim() || text;

    return text;
  }

  return "";
};

const normalizePricingCabinClass = (...values) => {
  for (const value of values) {
    const text = String(value || "").trim().toUpperCase();
    if (!text) continue;

    if (["E", "B", "F", "P"].includes(text)) return text;
    if (text.includes("BUSINESS")) return "B";
    if (text.includes("FIRST")) return "F";
    if (text.includes("PREMIUM")) return "P";
    if (text.includes("ECONOMY")) return "E";
  }

  return "E";
};

const getPricingFlightContext = (request = {}, flight = {}) => {
  const trip = toArray(request?.Trips)[0] || {};

  return {
    flight_no: normalizePricingFlightNo(
      request?.flight_no,
      request?.flightNo,
      request?.FlightNumber,
      request?.FlightNo,
      trip?.flight_no,
      trip?.flightNo,
      trip?.FlightNumber,
      trip?.FlightNo,
      flight?.booking?.flightNo,
      flight?.details?.flightNo,
      flight?.airlines?.[0]?.flightNo,
      flight?.airlines?.[0]?.code
    ),
    cabin_class: normalizePricingCabinClass(
      request?.cabin_class,
      request?.cabinClass,
      request?.CabinClass,
      trip?.cabin_class,
      trip?.cabinClass,
      trip?.CabinClass,
      flight?.fare?.cabinClass,
      flight?.travelClass,
      flight?.cabinClass
    ),
  };
};

const buildPricingSearchKeys = (request = {}, flight = {}) => {
  const searchKey = request?.search_key || request?.SearchKey || request?.searchKey || "";
  const providedSearchKeys = toArray(request?.search_keys || request?.searchKeys);
  const flightContext = getPricingFlightContext(request, flight);
  const buildSearchKeyItem = (item = {}) => {
    const itemSearchKey = item?.search_key || item?.SearchKey || item?.searchKey || searchKey;
    const itemTui =
      String(request?.TripType || request?.tripType || "").toUpperCase() === "DM"
        ? item?.TUI || item?.tui || request?.TUI || request?.tui || ""
        : "";
    const itemFlightNo = normalizePricingFlightNo(
      item?.flight_no,
      item?.flightNo,
      item?.FlightNumber,
      item?.FlightNo,
      flightContext.flight_no
    );

    return {
      search_key: itemSearchKey,
      ...(itemFlightNo ? { flight_no: itemFlightNo } : {}),
      ...(itemTui ? { TUI: itemTui } : {}),
      cabin_class: normalizePricingCabinClass(
        item?.cabin_class,
        item?.cabinClass,
        item?.CabinClass,
        flightContext.cabin_class
      ),
    };
  };

  if (providedSearchKeys.length) {
    return providedSearchKeys.map(buildSearchKeyItem).filter((item) => item.search_key);
  }

  if (!searchKey) return [];

  return [buildSearchKeyItem({ search_key: searchKey })];
};

const buildV2PricingPayload = ({ request = {}, flight = {}, channel = makePricingChannel() } = {}) => {
  return {
    channel,
    domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337",
    search_keys: buildPricingSearchKeys(request, flight),
  };
};

const fareOptionsResponseCache = new Map();
const fareOptionsRequestCache = new Map();
const FARE_OPTIONS_CACHE_TTL_MS = 5 * 60 * 1000;

const getFareOptionsCacheKey = (payload = {}) => {
  try {
    return JSON.stringify({
      domain: payload.domain,
      search_keys: payload.search_keys,
    });
  } catch {
    return "";
  }
};

const getCachedFareOptionsResponse = (cacheKey) => {
  const cached = fareOptionsResponseCache.get(cacheKey);
  if (!cached) return null;
  if (Date.now() - cached.createdAt > FARE_OPTIONS_CACHE_TTL_MS) {
    fareOptionsResponseCache.delete(cacheKey);
    return null;
  }
  return cached.response;
};

const setCachedFareOptionsResponse = (cacheKey, response) => {
  if (!cacheKey || isFareExpiredResponse(response)) return;
  fareOptionsResponseCache.set(cacheKey, {
    response,
    createdAt: Date.now(),
  });
};

const readTripOrder = (trip, index) =>
  Number(trip?.Order ?? trip?.OrderID ?? trip?.order ?? trip?.orderId ?? index + 1);

const buildV2PriceTrip = (trip = {}, index = 0) => ({
  Index: trip?.Index ?? trip?.index ?? trip?.flightIndex,
  Order: Number.isFinite(readTripOrder(trip, index)) ? readTripOrder(trip, index) : index + 1,
});

const buildV2PriceSearchKeys = (request = {}) => {
  const requestTrips = toArray(request?.Trips).filter(
    (trip) => trip?.Index !== undefined && trip?.Index !== null && trip?.Index !== ""
  );
  const searchKey = request?.search_key || request?.SearchKey || request?.searchKey || "";
  const providedSearchKeys = toArray(request?.search_keys || request?.searchKeys);

  if (providedSearchKeys.length) {
    return providedSearchKeys.map((item, index) => ({
      search_key: item?.search_key || item?.SearchKey || item?.searchKey || searchKey,
      index: Number(item?.index || item?.tripIndex || index + 1),
      Trips: toArray(item?.Trips).length
        ? toArray(item.Trips).map(buildV2PriceTrip)
        : requestTrips.map(buildV2PriceTrip),
    }));
  }

  if (!searchKey || !requestTrips.length) return [];

  return [
    {
      search_key: searchKey,
      index: 1,
      Trips: requestTrips.map(buildV2PriceTrip),
    },
  ];
};

const buildV2PricePayload = (request = {}) => ({
  channel: makeV2PricingChannel(),
  domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337",
  search_keys: buildV2PriceSearchKeys(request),
});

const postV2Price = async (payload, signal) => {
  const response = await fetch("/api/flights/v2/pricing", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
    signal,
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(getApiMessage(data));
    error.status = response.status;
    throw error;
  }

  return data;
};

const postV2Pricing = async (payload) => {
  const response = await fetch("/api/flights/v2/fare-options", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(getApiMessage(data));
    error.status = response.status;
    throw error;
  }

  return data;
};

const getPricingEventsUrl = (channel) => {
  const url = new URL("/api/flights/v2/events", window.location.origin);
  url.searchParams.set("channel", channel);
  return url.toString();
};

const PRICING_SSE_EVENT_NAMES = [
  "FLIGHT_V2_FARE_OPTIONS_ACCEPTED",
  "FLIGHT_V2_FARE_OPTIONS_STARTED",
  "FLIGHT_V2_FARE_OPTIONS_RESULT",
  "FLIGHT_V2_FARE_OPTIONS_PROVIDER_STARTED",
  "FLIGHT_V2_FARE_OPTIONS_PROVIDER_RESULT",
  "FLIGHT_V2_FARE_OPTIONS_RULES_COMPLETE",
  "FLIGHT_V2_FARE_OPTIONS_COMPLETE",
  "FLIGHT_V2_FARE_OPTIONS_COMPLETED",
  "FLIGHT_V2_FARE_OPTIONS_ERROR",
  "FLIGHT_V2_PRICING_ACCEPTED",
  "FLIGHT_V2_PRICING_STARTED",
  "FLIGHT_V2_PRICING_RESULT",
  "FLIGHT_V2_PRICING_COMPLETE",
  "FLIGHT_V2_PRICING_COMPLETED",
  "FLIGHT_V2_PRICING_ERROR",
  "FLIGHT_V2_SSR_ACCEPTED",
  "FLIGHT_V2_SSR_STARTED",
  "FLIGHT_V2_SSR_RESULT",
  "FLIGHT_V2_SSR_COMPLETE",
  "FLIGHT_V2_SSR_COMPLETED",
  "FLIGHT_V2_SSR_ERROR",
  "FLIGHT_V2_SEAT_LAYOUT_ACCEPTED",
  "FLIGHT_V2_SEAT_LAYOUT_STARTED",
  "FLIGHT_V2_SEAT_LAYOUT_RESULT",
  "FLIGHT_V2_SEAT_LAYOUT_COMPLETE",
  "FLIGHT_V2_SEAT_LAYOUT_COMPLETED",
  "FLIGHT_V2_SEAT_LAYOUT_ERROR",
  "FLIGHT_V2_CREATE_BOOKING_ACCEPTED",
  "FLIGHT_V2_CREATE_BOOKING_PAYLOAD_READY",
  "FLIGHT_V2_CREATE_BOOKING_TRAVEL_CHECK_STARTED",
  "FLIGHT_V2_CREATE_BOOKING_TRAVEL_CHECK_RESULT",
  "FLIGHT_V2_CREATE_BOOKING_PROVIDER_STARTED",
  "FLIGHT_V2_CREATE_BOOKING_STARTED",
  "FLIGHT_V2_CREATE_BOOKING_RESULT",
  "FLIGHT_V2_CREATE_BOOKING_ITINERARY_STARTED",
  "FLIGHT_V2_CREATE_BOOKING_ITINERARY_RESULT",
  "FLIGHT_V2_CREATE_BOOKING_COMPLETE",
  "FLIGHT_V2_CREATE_BOOKING_COMPLETED",
  "FLIGHT_V2_CREATE_BOOKING_FAILED",
  "FLIGHT_V2_CREATE_BOOKING_ERROR",
  "pricing-result",
  "pricing-complete",
  "fare-options-result",
  "fare-options-complete",
  "ssr-result",
  "ssr-complete",
  "seat-layout-result",
  "seat-layout-complete",
  "create-booking-result",
  "create-booking-complete",
  "booking-result",
  "booking-complete",
  "result",
  "complete",
  "done",
  "error",
];

const waitForSseConnected = (events, channel, timeoutMs = 1500) =>
  new Promise((resolve) => {
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      events.removeEventListener("message", handleConnected);
      events.removeEventListener("CONNECTED", handleConnected);
      resolve();
    };

    const handleConnected = (event) => {
      const unwrappedPayload = unwrapPricingPayload(event.data);
      const parsedPayload =
        unwrappedPayload && typeof unwrappedPayload === "object"
          ? {
              ...unwrappedPayload,
              type:
                unwrappedPayload.type ||
                unwrappedPayload.data?.type ||
                event.type,
            }
          : unwrappedPayload;
      const payloadChannel = getPayloadChannel(parsedPayload);

      if (payloadChannel && payloadChannel !== channel) return;
      if (getPayloadType(parsedPayload) === "CONNECTED") finish();
    };

    const timer = window.setTimeout(finish, timeoutMs);

    events.addEventListener("message", handleConnected);
    events.addEventListener("CONNECTED", handleConnected);
  });

const isFlightCreateBookingComplete = (payload) => {
  const type = getPayloadType(payload);
  return (
    (type.includes("CREATE") && type.includes("BOOKING")) ||
    type.includes("BOOKING")
  ) && (
    type.includes("RESULT") ||
    type.includes("COMPLETE") ||
    type.includes("COMPLETED") ||
    type.includes("DONE")
  );
};

const isFlightCreateBookingFailed = (payload) => {
  const type = getPayloadType(payload);
  const isBookingFailureEvent = (
    (type.includes("CREATE") && type.includes("BOOKING")) ||
    type.includes("BOOKING")
  ) && (
    type.includes("FAILED") ||
    type.includes("ERROR")
  );

  return (
    isBookingFailureEvent ||
    payload?.success === false ||
    payload?.data?.success === false ||
    payload?.result?.success === false ||
    payload?.data?.result?.success === false
  );
};

const isRecoverableCreateBookingFareChange = (payload) =>
  String(
    payload?.data?.result?.code ||
    payload?.result?.code ||
    payload?.data?.code ||
    payload?.code ||
    ""
  ) === "8888";

const hasCreateBookingPayload = (payload) => {
  const root = payload?.data || payload || {};
  const containers = [
    root,
    root?.data,
    root?.result,
    root?.booking,
    root?.raw,
    root?.data?.booking,
    root?.data?.raw,
  ].filter(Boolean);

  return containers.some((container) =>
    Boolean(
      container?.bookingId ||
        container?.booking_id ||
        container?.bookingReference ||
        container?.booking_reference ||
        container?.pnr ||
        container?.PNR ||
        container?.TUI ||
        container?.tui
    )
  );
};

export const getFlightPrice = async (payload, { signal } = {}) => {
  const pricingPayload = buildV2PricePayload(payload);

  const channel = pricingPayload.channel;
  const isMultiCityPricing =
    String(payload?.TripType || payload?.tripType || "").toUpperCase() === "DM";

  if (!pricingPayload.search_keys.length) {
    throw new Error("Missing v2 pricing payload for the selected fare.");
  }

  if (typeof window === "undefined" || !window.EventSource) {
    return postV2Price(pricingPayload, signal);
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    const seenChunkKeys = new Set();
    const multiCityPricingResults = new Map();
    let settled = false;
    let initResponse = null;
    let idleTimer = null;
    let events = null;
    let abortHandler = null;

    const cleanup = () => {
      window.clearTimeout(idleTimer);
      window.clearTimeout(hardTimer);
      events?.close();
      if (abortHandler) signal?.removeEventListener("abort", abortHandler);
    };

    const settle = (callback, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      console.log("[pricing:sse] settle", {
        status: callback === resolve ? "resolve" : "reject",
        channel,
        hasPricing: callback === resolve ? hasFlightPricingPayload(value) : false,
      });
      callback(value);
    };

    const getPricingChunkKey = (payload, eventType = "") => {
      const type = getPayloadType(payload) || eventType;
      const eventData = payload?.data || payload || {};
      const resultKeys = toArray(payload?.data?.results || payload?.results)
        .map((result, index) =>
          [
            index,
            result?.search_key,
            result?.index,
            result?.provider,
            result?.status,
          ].join(":")
        )
        .join("|");

      return [
        payload?.requestId || payload?.data?.requestId || "",
        type,
        eventData?.tripIndex ?? eventData?.trip_index ?? eventData?.index ?? "",
        eventData?.search_key || eventData?.searchKey || "",
        payload?.sent_at || payload?.data?.sent_at || "",
        resultKeys,
      ].join("::");
    };

    const pushPricingChunk = (payload, eventType = "") => {
      const key = getPricingChunkKey(payload, eventType);
      if (seenChunkKeys.has(key)) return false;

      seenChunkKeys.add(key);
     
      chunks.push(payload);
      return true;
    };

    const storeMultiCityPricingResult = (payload) => {
      if (!isMultiCityPricing) return;

      const type = getPayloadType(payload);
      if (!type.includes("PRICING_RESULT")) return;

      const eventData = payload?.data || payload || {};
      const extractedPricing = extractFlightPricingPayload(payload);
      if (!extractedPricing) return;

      const tripIndex = Number(
        eventData?.tripIndex ??
          eventData?.trip_index ??
          eventData?.index ??
          multiCityPricingResults.size + 1
      );
      const searchKey =
        eventData?.search_key ||
        eventData?.searchKey ||
        extractedPricing?.search_key ||
        extractedPricing?.searchKey ||
        pricingPayload.search_keys[tripIndex - 1]?.search_key ||
        "";
      const resultKey = searchKey || `trip-${tripIndex}`;

      multiCityPricingResults.set(resultKey, {
        tripIndex,
        search_key: searchKey,
        payload: extractedPricing,
        event: payload,
      });
    };

    const getCompletedPricingPayload = () => {
      const reversedChunks = [...chunks].reverse();
      for (const chunk of reversedChunks) {
        const pricingPayload = extractFlightPricingPayload(chunk);
        if (pricingPayload) return pricingPayload;
      }

      return extractFlightPricingPayload(initResponse);
    };

    const buildResult = () => {
      const pricingResult = getCompletedPricingPayload();
      const pricingResults = [...multiCityPricingResults.values()].sort(
        (left, right) => left.tripIndex - right.tripIndex
      );

      return {
        ...(initResponse || {}),
        channel,
        pricingResult,
        data: {
          ...((initResponse || {})?.data || {}),
          ...(pricingResult || {}),
          ...(isMultiCityPricing ? { pricingResults } : {}),
          pricingChunks: chunks,
        },
        ...(isMultiCityPricing ? { pricingResults } : {}),
        pricingChunks: chunks,
      };
    };

    const scheduleResolve = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        settle(resolve, buildResult());
      }, 300);
    };

    const hardTimer = window.setTimeout(() => {
      const result = buildResult();
      if (!isMultiCityPricing && extractFlightPricingPayload(result)) {
        settle(resolve, result);
        return;
      }

      settle(reject, new Error("Flight pricing timed out. Please try again."));
    }, 45000);

    abortHandler = () => {
      settle(reject, new DOMException("Flight pricing was cancelled.", "AbortError"));
    };
    if (signal?.aborted) {
      abortHandler();
      return;
    }
    signal?.addEventListener("abort", abortHandler, { once: true });

    const handleMessage = (event) => {
      const unwrappedPayload = unwrapPricingPayload(event.data);
      const parsedPayload =
        unwrappedPayload && typeof unwrappedPayload === "object"
          ? {
              ...unwrappedPayload,
              type:
                unwrappedPayload.type ||
                unwrappedPayload.data?.type ||
                event.type,
          }
          : unwrappedPayload;
      const payloadChannel = getPayloadChannel(parsedPayload);
      const isCurrentChannel = !payloadChannel || payloadChannel === channel;
      const type = String(getPayloadType(parsedPayload) || event.type || "").toUpperCase();
      const extractedPricing = extractFlightPricingPayload(parsedPayload);
      const isCompletePricingEvent = isFlightPricingResult(parsedPayload);



      if (!isCurrentChannel) return;

      if (isPricingError(parsedPayload)) {
        const error = new Error(getApiMessage(parsedPayload));
        error.status =
          parsedPayload?.error?.status ||
          parsedPayload?.data?.error?.status;
        settle(reject, error);
        return;
      }

      if (type.includes("PRICING")) {
        pushPricingChunk(parsedPayload, event.type);
        storeMultiCityPricingResult(parsedPayload);
      }

      const isPricingCompleteEvent =
        type.includes("PRICING") &&
        (type.includes("COMPLETE") || type.includes("COMPLETED"));

      if (
        isPricingCompleteEvent &&
        (extractedPricing || multiCityPricingResults.size > 0)
      ) {
        settle(resolve, buildResult());
        return;
      }

      if (
        !isMultiCityPricing &&
        isCompletePricingEvent &&
        extractedPricing
      ) {
        settle(resolve, buildResult());
        return;
      }

      if (!isMultiCityPricing && type.includes("PRICING") && extractedPricing) {
        scheduleResolve();
      }
    };

    const startPricing = async () => {
      const eventsUrl = getPricingEventsUrl(channel);
    
      console.log("[Pricing] Creating EventSource", {
        channel,
        eventsUrl,
      });
    
      events = new EventSource(eventsUrl, {
        withCredentials: true,
      });
    
      events.addEventListener("open", () => {
        console.log("[Pricing] SSE connection opened", {
          channel,
          readyState: events.readyState,
        });
      });
    
      events.addEventListener("message", (event) => {
        console.log("[Pricing] Native message event received", {
          type: event.type,
          data: event.data,
        });
    
        handleMessage(event);
      });
    
      PRICING_SSE_EVENT_NAMES.forEach((eventName) => {
        events.addEventListener(eventName, (event) => {
          console.log("[Pricing] Named event received", {
            registeredEventName: eventName,
            nativeEventType: event.type,
            data: event.data,
          });
    
          handleMessage(event);
        });
      });
    
      events.addEventListener("error", (event) => {
        console.error("[Pricing] EventSource error", {
          readyState: events?.readyState,
          event,
          chunksCount: chunks.length,
          settled,
        });
    
        const result = buildResult();
        const extractedPricing = extractFlightPricingPayload(result);
    
        console.log("[Pricing] Result after SSE error", {
          result,
          extractedPricing,
        });
    
        if (!isMultiCityPricing && extractedPricing) {
          settle(resolve, result);
        }
      });
    
      try {

    
        await waitForSseConnected(events, channel);
    


    
        initResponse = await postV2Price(pricingPayload, signal);
    

    
        const extractedPricing =
          extractFlightPricingPayload(initResponse);
    
        if (isFlightPricingResult(initResponse) || extractedPricing) {
          pushPricingChunk(
            initResponse,
            "postV2Price"
          );
          storeMultiCityPricingResult(initResponse);

          if (!isMultiCityPricing) scheduleResolve();
        }
      } catch (error) {
        console.error("[Pricing] startPricing failed", {
          error,
          message: error?.message,
          stack: error?.stack,
        });
    
        settle(reject, error);
      }
    };

    startPricing();
  });
};

export const getFlightFareOptions = async ({ request, flight, onFareOptionsEvent } = {}) => {
  const channel = makePricingChannel();
  const payload = buildV2PricingPayload({ request, flight, channel });
  const cacheKey = getFareOptionsCacheKey(payload);
  const cachedResponse = cacheKey ? getCachedFareOptionsResponse(cacheKey) : null;

  if (cachedResponse) {
    return cachedResponse;
  }

  const inFlightRequest = cacheKey ? fareOptionsRequestCache.get(cacheKey) : null;
  if (inFlightRequest) {
    if (typeof onFareOptionsEvent === "function") {
      inFlightRequest.subscribers?.add(onFareOptionsEvent);
      if (inFlightRequest.lastResult) {
        onFareOptionsEvent(null, inFlightRequest.lastResult);
      }
    }
    return inFlightRequest.promise || inFlightRequest;
  }

  if (!payload.search_keys.length) {
    throw new Error("Missing fare-options payload for the selected flight.");
  }

  if (typeof window === "undefined" || !window.EventSource) {
    const data = await postV2Pricing(payload);
    emitFareExpired(data);
    setCachedFareOptionsResponse(cacheKey, data);
    return data;
  }

  const requestEntry = {
    promise: null,
    subscribers: new Set(
      typeof onFareOptionsEvent === "function" ? [onFareOptionsEvent] : []
    ),
    lastResult: null,
  };

  const notifyFareOptionsSubscribers = (eventPayload, accumulatedPayload) => {
    requestEntry.lastResult = accumulatedPayload;
    requestEntry.subscribers.forEach((subscriber) => {
      try {
        subscriber(eventPayload, accumulatedPayload);
      } catch (callbackError) {
        console.error("Fare-options event subscriber failed", callbackError);
      }
    });
  };

  const fareOptionsPromise = new Promise((resolve, reject) => {
    const chunks = [];
    let settled = false;
    let initResponse = null;
    let idleTimer = null;
    let events = null;

    const cleanup = () => {
      window.clearTimeout(idleTimer);
      window.clearTimeout(hardTimer);
      events?.close();
    };

    const settle = (callback, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      emitFareExpired(value);
      if (callback === resolve) {
        setCachedFareOptionsResponse(cacheKey, value);
      }
      callback(value);
    };

    const mergeFareOptionMaps = (...maps) => {
      const merged = {};

      maps.forEach((map) => {
        if (!map || typeof map !== "object" || Array.isArray(map)) return;

        Object.entries(map).forEach(([flightNo, fares]) => {
          if (!Array.isArray(fares)) return;
          merged[flightNo] = [...(merged[flightNo] || []), ...fares];
        });
      });

      Object.entries(merged).forEach(([flightNo, fares]) => {
        const uniqueFares = new Map();
        fares.forEach((fare) => {
          const key = [
            fare?.Index ?? fare?.index ?? fare?.id ?? fare?.ID ?? "",
            fare?.provider ?? fare?.Provider ?? "",
            fare?.FCType ?? fare?.FareType ?? fare?.fareType ?? fare?.name ?? "",
            fare?.price ?? fare?.Price ?? fare?.netAmount ?? fare?.NetAmount ?? "",
          ].join("|");
          uniqueFares.set(key, fare);
        });
        merged[flightNo] = Array.from(uniqueFares.values());
      });

      return merged;
    };

    const getChunkMergedFares = (chunk = {}) =>
      mergeFareOptionMaps(
        chunk?.merged,
        chunk?.data?.merged,
        ...toArray(chunk?.results).map((result) => result?.data?.merged || result?.merged),
        ...toArray(chunk?.data?.results).map((result) => result?.data?.merged || result?.merged)
      );

    const buildResult = () => {
      const merged = mergeFareOptionMaps(
        initResponse?.merged,
        initResponse?.data?.merged,
        ...chunks.map(getChunkMergedFares)
      );
      const hasMergedFares = Object.keys(merged).length > 0;

      return {
        ...(initResponse || {}),
        ...(hasMergedFares ? { merged } : {}),
        channel,
        data: {
          ...((initResponse || {})?.data || {}),
          ...(hasMergedFares ? { merged } : {}),
          pricingChunks: chunks,
        },
        pricingChunks: chunks,
      };
    };

    const hardTimer = window.setTimeout(() => {
      if (chunks.length || initResponse) {
        settle(resolve, buildResult());
        return;
      }

      settle(reject, new Error("Flight fare options timed out. Please try again."));
    }, 120000);

    const handleMessage = (event) => {
      const unwrappedPayload = unwrapPricingPayload(event.data);
      const parsedPayload =
        unwrappedPayload && typeof unwrappedPayload === "object"
          ? {
              ...unwrappedPayload,
              type:
                unwrappedPayload.type ||
                unwrappedPayload.data?.type ||
                event.type,
          }
          : unwrappedPayload;
      const payloadChannel = getPayloadChannel(parsedPayload);
      const isCurrentChannel =
        !payloadChannel || payloadChannel === channel;

      if (!isCurrentChannel) return;
    
      if (isPricingError(parsedPayload)) {
        const error = new Error(getApiMessage(parsedPayload));
        error.status =
          parsedPayload?.error?.status ||
          parsedPayload?.data?.error?.status;
        settle(reject, error);
        return;
      }
    
      const hasItems = hasPricingItems(parsedPayload);
      const isComplete = isPricingComplete(parsedPayload);
      const isFareOptionsCompleteEvent = isFareOptionsComplete(parsedPayload);
    
      if (hasItems || isComplete) {
        chunks.push(parsedPayload);
        notifyFareOptionsSubscribers(parsedPayload, buildResult());
        if (isFareOptionsCompleteEvent) {
          settle(resolve, buildResult());
          return;
        }
      }
    };

    const startPricing = async () => {
      events = new EventSource(getPricingEventsUrl(channel), {
        withCredentials: true,
      });

      events.addEventListener("message", handleMessage);
      PRICING_SSE_EVENT_NAMES.forEach((eventName) => {
        events.addEventListener(eventName, handleMessage);
      });
      events.addEventListener("error", () => {
        // EventSource reconnects automatically. Keep listening for the
        // explicit fare-options COMPLETE event or the hard timeout.
      });

      try {
        await waitForSseConnected(events, channel);
        initResponse = await postV2Pricing(payload);
        if (hasPricingItems(initResponse)) {
          chunks.push(initResponse);
          notifyFareOptionsSubscribers(initResponse, buildResult());
        }
      } catch (error) {
        settle(reject, error);
      }
    };

    startPricing();
  }).finally(() => {
    fareOptionsRequestCache.delete(cacheKey);
  });

  if (cacheKey) {
    requestEntry.promise = fareOptionsPromise;
    fareOptionsRequestCache.set(cacheKey, requestEntry);
  }
  return fareOptionsPromise;
};

export const getFlightInfo = async (payload) => {
  const response = await api.post("/api/flights/flight-info", {
    ...payload,
    domain: "localhost:1337",
  }, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response?.data;
};

const fareRuleRequestCache = new Map();

export const getFlightFareRules = async (payload) => {
  const requestPayload = {
    ...payload,
    domain:
      payload?.domain ||
      process.env.NEXT_PUBLIC_DOMAIN ||
      "localhost:1337",
  };
  const requestKey = JSON.stringify(requestPayload);
  const pendingRequest = fareRuleRequestCache.get(requestKey);
  if (pendingRequest) return pendingRequest;

  const request = fetch("/api/flights/v2/fare-rule", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(requestPayload),
  }).then(async (response) => {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(getApiMessage(data));
    }

    return data;
  }).finally(() => {
    window.setTimeout(() => fareRuleRequestCache.delete(requestKey), 1000);
  });

  fareRuleRequestCache.set(requestKey, request);
  return request;
};

export const getLegacyFlightFareRules = async (payload) => {
  const response = await api.post("/api/flights/fare-rule", {
    ...payload,
    domain: "localhost:1337",
  }, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response?.data;
};

export const getFlightSsr = async (payload) => {
  const provider = String(
    payload?.provider ||
      payload?.Provider ||
      getProviderFromSearchKey(payload?.search_key || payload?.SearchKey) ||
      ""
  )
    .trim()
    .toLowerCase();
  const response = await api.post("/api/flights/ssr", {
    ...payload,
    ...(provider ? { provider } : {}),
  }, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response?.data;
};

const postV2Ssr = async (payload) => {
  const response = await fetch("/api/flights/v2/ssr", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(getApiMessage(data));
    error.status = response.status;
    throw error;
  }

  return data;
};

const postV2SeatLayout = async (payload) => {
  const response = await fetch("/api/flights/v2/seat-layout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(getApiMessage(data));
    error.status = response.status;
    throw error;
  }

  return data;
};

export const getFlightV2Ssr = async (payload) => {
  const ssrPayload = {
    ...payload,
    channel: payload?.channel || makeSsrChannel(),
  };
  const channel = ssrPayload.channel;
  const isMultiCitySsr = ssrPayload?.ssr_requests?.every((request) =>
    String(request?.search_key || "").toUpperCase().startsWith("DM_")
  ) && ssrPayload?.ssr_requests?.length > 1;

  if (!Array.isArray(ssrPayload?.ssr_requests) || !ssrPayload.ssr_requests.length) {
    throw new Error("Missing v2 SSR payload for the selected booking.");
  }

  if (typeof window === "undefined" || !window.EventSource) {
    return postV2Ssr(ssrPayload);
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    const multiCitySsrResults = new Map();
    let settled = false;
    let initResponse = null;
    let idleTimer = null;
    let events = null;

    const cleanup = () => {
      window.clearTimeout(idleTimer);
      window.clearTimeout(hardTimer);
      events?.close();
    };

    const settle = (callback, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback(value);
    };

    const getCompletedSsrPayload = () => {
      const reversedChunks = [...chunks].reverse();
      for (const chunk of reversedChunks) {
        const ssrPayload = extractFlightSsrPayload(chunk);
        if (ssrPayload) return ssrPayload;
      }

      return extractFlightSsrPayload(initResponse);
    };

    const getSsrRouteKey = (searchKey = "", fallbackIndex = 0) => {
      const parts = String(searchKey).split("_");
      return parts.length >= 3
        ? `${parts[1]}-${parts[2]}`
        : `route-${fallbackIndex + 1}`;
    };

    const storeMultiCitySsrResult = (eventPayload) => {
      if (!isMultiCitySsr || !eventPayload || typeof eventPayload !== "object") return;

      const eventData = eventPayload?.data || eventPayload;
      const type = getPayloadType(eventPayload);
      const resultItems = type.includes("SSR_RESULT")
        ? [eventData]
        : toArray(eventData?.results || eventPayload?.results);

      resultItems.forEach((result, resultIndex) => {
        const status = String(result?.status || "").toLowerCase();
        if (status && status !== "fulfilled" && status !== "success") return;
        if (result?.success === false || result?.data?.success === false) return;

        const extracted = [
          result?.data?.data,
          result?.data,
          result?.result?.data,
          result?.result,
        ].find(hasSsrItems) || extractFlightSsrPayload(result);
        if (!extracted) return;

        const tripIndex = Number(
          result?.tripIndex ??
            result?.trip_index ??
            result?.index ??
            eventData?.tripIndex ??
            eventData?.trip_index ??
            eventData?.index ??
            resultIndex + 1
        );
        const request = ssrPayload.ssr_requests[tripIndex - 1];
        const searchKey =
          result?.search_key ||
          result?.searchKey ||
          result?.data?.search_key ||
          result?.data?.searchKey ||
          extracted?.search_key ||
          extracted?.searchKey ||
          request?.search_key ||
          "";
        const resultKey = searchKey || `trip-${tripIndex}`;

        multiCitySsrResults.set(resultKey, {
          tripIndex,
          search_key: searchKey,
          routeKey: getSsrRouteKey(searchKey, tripIndex - 1),
          payload: extracted,
          event: eventPayload,
        });
      });
    };

    const getMultiCityFormattedRoutes = (results) =>
      results.reduce((routes, result) => {
        const payload = result?.payload || {};
        const formatted = payload?.formatted || payload?.data?.formatted;

        if (formatted && typeof formatted === "object" && !Array.isArray(formatted)) {
          const entries = Object.entries(formatted);
          const looksRouteKeyed = entries.some(([key]) => key.includes("-") || key.includes("→"));

          if (looksRouteKeyed) {
            entries.forEach(([key, value]) => {
              routes[key] = value;
            });
          } else {
            routes[result.routeKey] = formatted;
          }
        } else {
          routes[result.routeKey] = payload;
        }

        return routes;
      }, {});

    const buildResult = () => {
      const ssrResult = getCompletedSsrPayload();
      const ssrResults = [...multiCitySsrResults.values()].sort(
        (left, right) => left.tripIndex - right.tripIndex
      );
      const multiCityFormatted = isMultiCitySsr
        ? getMultiCityFormattedRoutes(ssrResults)
        : null;

      return {
        ...(initResponse || {}),
        channel,
        ssrResult,
        data: {
          ...((initResponse || {})?.data || {}),
          ...(ssrResult || {}),
          ...(isMultiCitySsr
            ? {
                formatted: multiCityFormatted,
                ssrResults,
              }
            : {}),
          ssrChunks: chunks,
        },
        ...(isMultiCitySsr ? { ssrResults } : {}),
        ssrChunks: chunks,
      };
    };

    const scheduleResolve = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        settle(resolve, buildResult());
      }, 900);
    };

    const hardTimer = window.setTimeout(() => {
      if (chunks.length || initResponse) {
        settle(resolve, buildResult());
        return;
      }

      settle(reject, new Error("Flight SSR details timed out. Please try again."));
    }, 45000);

    const handleMessage = (event) => {
      const unwrappedPayload = unwrapPricingPayload(event.data);
      const parsedPayload =
        unwrappedPayload && typeof unwrappedPayload === "object"
          ? {
              ...unwrappedPayload,
              type:
                unwrappedPayload.type ||
                unwrappedPayload.data?.type ||
                event.type,
            }
          : unwrappedPayload;
      const payloadChannel = getPayloadChannel(parsedPayload);
      const isCurrentChannel = !payloadChannel || payloadChannel === channel;

      if (!isCurrentChannel) return;

      if (isPricingError(parsedPayload)) {
        const error = new Error(getApiMessage(parsedPayload));
        error.status =
          parsedPayload?.error?.status ||
          parsedPayload?.data?.error?.status;
        settle(reject, error);
        return;
      }

      const type = getPayloadType(parsedPayload);
      const isSsrEvent = type.includes("SSR");
      const hasItems = hasSsrItems(parsedPayload);

      if (isSsrEvent || hasItems) {
        chunks.push(parsedPayload);
      }
      storeMultiCitySsrResult(parsedPayload);

      if (
        isFlightSsrComplete(parsedPayload) &&
        (isMultiCitySsr
          ? multiCitySsrResults.size > 0
          : extractFlightSsrPayload(parsedPayload))
      ) {
        settle(resolve, buildResult());
        return;
      }

      if (hasItems && !isMultiCitySsr) {
        scheduleResolve();
      }
    };

    const startSsr = async () => {
      events = new EventSource(getPricingEventsUrl(channel), {
        withCredentials: true,
      });

      events.addEventListener("message", handleMessage);
      PRICING_SSE_EVENT_NAMES.forEach((eventName) => {
        events.addEventListener(eventName, handleMessage);
      });
      events.addEventListener("error", () => {
        if (chunks.length && !isMultiCitySsr) scheduleResolve();
      });

      try {
        await waitForSseConnected(events, channel);
        initResponse = await postV2Ssr(ssrPayload);
        storeMultiCitySsrResult(initResponse);
        if (isFlightSsrComplete(initResponse)) {
          chunks.push(initResponse);
          settle(resolve, buildResult());
          return;
        }
        if (hasSsrItems(initResponse)) {
          chunks.push(initResponse);
          if (!isMultiCitySsr) scheduleResolve();
        }
      } catch (error) {
        settle(reject, error);
      }
    };

    startSsr();
  });
};

export const getFlightSeatLayout = async (payload) => {
  if (Array.isArray(payload?.seat_layout_requests) && payload.seat_layout_requests.length) {
    const seatLayoutPayload = {
      ...payload,
      channel: payload?.channel || makeSeatLayoutChannel(),
    };
    const channel = seatLayoutPayload.channel;
    const isMultiCitySeatLayout =
      seatLayoutPayload.seat_layout_requests.length > 1 &&
      seatLayoutPayload.seat_layout_requests.every((request) =>
        String(request?.search_key || "").toUpperCase().startsWith("DM_")
      );

    if (typeof window === "undefined" || !window.EventSource) {
      return postV2SeatLayout(seatLayoutPayload);
    }

    return new Promise((resolve, reject) => {
      const chunks = [];
      const seenChunkKeys = new Set();
      const multiCityResults = new Map();
      let settled = false;
      let initResponse = null;
      let idleTimer = null;
      let events = null;

      const cleanup = () => {
        window.clearTimeout(idleTimer);
        window.clearTimeout(hardTimer);
        events?.close();
      };

      const settle = (callback, value) => {
        if (settled) return;
        settled = true;
        cleanup();
        callback(value);
      };

      const getSeatLayoutChunkKey = (chunk, eventType = "") => {
        const type = getPayloadType(chunk) || eventType;
        const resultKeys = toArray(chunk?.data?.results || chunk?.results)
          .map((result, index) =>
            [
              index,
              result?.search_key,
              result?.index,
              result?.provider,
              result?.status,
            ].join(":")
          )
          .join("|");

        return [
          chunk?.requestId || chunk?.data?.requestId || "",
          type,
          chunk?.sent_at || chunk?.data?.sent_at || "",
          resultKeys,
        ].join("::");
      };

      const pushSeatLayoutChunk = (chunk, eventType = "") => {
        const key = getSeatLayoutChunkKey(chunk, eventType);
        if (seenChunkKeys.has(key)) return false;

        seenChunkKeys.add(key);
        chunks.push(chunk);
        return true;
      };

      const collectMultiCitySeatLayouts = (payload, eventType = "") => {
        if (!isMultiCitySeatLayout || !payload || typeof payload !== "object") {
          return;
        }

        const type = String(getPayloadType(payload) || eventType || "").toUpperCase();
        const root = payload?.data || payload;
        const resultItems = type.includes("RESULT")
          ? [root]
          : toArray(root?.results || payload?.results);
        const seatLayoutRequests = seatLayoutPayload.seat_layout_requests;

        resultItems.forEach((result, resultIndex) => {
          const status = String(result?.status || "").toLowerCase();
          if (status && status !== "fulfilled" && status !== "success") return;
          if (result?.success === false || result?.data?.success === false) return;

          const normalized = [
            result?.data?.data,
            result?.data,
            result?.result?.data,
            result?.result,
            result,
          ]
            .map(normalizeSeatLayoutPayload)
            .find(Boolean);
          if (!normalized) return;

          const responseSearchKey = [
            result?.search_key,
            result?.searchKey,
            result?.data?.search_key,
            result?.data?.searchKey,
            result?.data?.data?.search_key,
            result?.data?.data?.searchKey,
            result?.result?.search_key,
            result?.result?.searchKey,
            result?.result?.data?.search_key,
            result?.result?.data?.searchKey,
            normalized?.search_key,
            normalized?.searchKey,
            normalized?.formatted?.search_key,
          ].find((value) => typeof value === "string" && value.trim());

          const responseTripIndex = Number(
            result?.tripIndex ??
              result?.trip_index ??
              result?.index ??
              root?.tripIndex ??
              root?.trip_index ??
              root?.index
          );

          let requestIndex = responseSearchKey
            ? seatLayoutRequests.findIndex(
                (request) => request?.search_key === responseSearchKey
              )
            : -1;

          if (
            requestIndex < 0 &&
            Number.isInteger(responseTripIndex) &&
            responseTripIndex >= 1 &&
            responseTripIndex <= seatLayoutRequests.length
          ) {
            requestIndex = responseTripIndex - 1;
          }

          // COMPLETE events contain results in request order. Use that order only
          // when the provider did not return a search key/trip index.
          if (
            requestIndex < 0 &&
            !type.includes("RESULT") &&
            resultIndex < seatLayoutRequests.length
          ) {
            requestIndex = resultIndex;
          }

          // Never create an additional synthetic route. A multi-city response may
          // repeat a RESULT inside COMPLETE, but the UI must have one layout per
          // requested route.
          if (requestIndex < 0 || requestIndex >= seatLayoutRequests.length) return;

          const tripIndex = requestIndex + 1;
          const request = seatLayoutRequests[requestIndex];
          const searchKey = request?.search_key || `trip-${tripIndex}`;

          multiCityResults.set(searchKey, {
            tripIndex,
            searchKey,
            payload: normalized,
          });
        });
      };

      const getMultiCityJourneys = () =>
        [...multiCityResults.values()]
          .sort((left, right) => left.tripIndex - right.tripIndex)
          .map(({ payload: resultPayload, searchKey, tripIndex }) => {
            const formatted = getSeatLayoutFormatted(resultPayload);
            const withRouteMetadata = (journey) =>
              journey && typeof journey === "object"
                ? {
                    ...journey,
                    __seatLayoutSearchKey: searchKey,
                    __seatLayoutTripIndex: tripIndex,
                  }
                : null;

            if (Array.isArray(formatted)) {
              return withRouteMetadata(formatted[0]);
            }

            const journeys =
              formatted?.journeys || formatted?.Journeys || formatted?.Journey;
            if (Array.isArray(journeys)) {
              return withRouteMetadata(journeys[0]);
            }

            return withRouteMetadata(formatted);
          })
          .filter(Boolean);

      const getCompletedSeatLayoutPayload = () => {
        const reversedChunks = [...chunks].reverse();
        for (const chunk of reversedChunks) {
          const seatLayoutResult = extractFlightSeatLayoutPayload(chunk);
          if (seatLayoutResult) return seatLayoutResult;
        }

        return extractFlightSeatLayoutPayload(initResponse);
      };

      const buildResult = () => {
        const seatLayoutResult = getCompletedSeatLayoutPayload();
        const multiCityJourneys = getMultiCityJourneys();
        const resolvedSeatLayout =
          isMultiCitySeatLayout && multiCityJourneys.length
            ? {
                ...(seatLayoutResult || {}),
                formatted: { journeys: multiCityJourneys },
                results: [...multiCityResults.values()].map((item) => item.payload),
              }
            : seatLayoutResult;

        return {
          ...(initResponse || {}),
          channel,
          seatLayoutResult: resolvedSeatLayout,
          data: {
            ...((initResponse || {})?.data || {}),
            ...(resolvedSeatLayout || {}),
            seatLayoutChunks: chunks,
          },
          seatLayoutChunks: chunks,
        };
      };

      const scheduleResolve = () => {
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(() => {
          settle(resolve, buildResult());
        }, 300);
      };

      const hardTimer = window.setTimeout(() => {
        const result = buildResult();
        if (extractFlightSeatLayoutPayload(result)) {
          settle(resolve, result);
          return;
        }

        settle(reject, new Error("Flight seat layout timed out. Please try again."));
      }, 45000);

      const handleMessage = (event) => {
        const unwrappedPayload = unwrapPricingPayload(event.data);
        const parsedPayload =
          unwrappedPayload && typeof unwrappedPayload === "object"
            ? {
                ...unwrappedPayload,
                type:
                  unwrappedPayload.type ||
                  unwrappedPayload.data?.type ||
                  event.type,
              }
            : unwrappedPayload;
        const payloadChannel = getPayloadChannel(parsedPayload);
        const isCurrentChannel = !payloadChannel || payloadChannel === channel;
        const type = String(getPayloadType(parsedPayload) || event.type || "").toUpperCase();
        const isSeatLayoutEvent = type.includes("SEAT") && type.includes("LAYOUT");
        const extractedSeatLayout = extractFlightSeatLayoutPayload(parsedPayload);

        if (!isCurrentChannel) return;

        if (isPricingError(parsedPayload)) {
          const error = new Error(getApiMessage(parsedPayload));
          error.status =
            parsedPayload?.error?.status ||
            parsedPayload?.data?.error?.status;
          settle(reject, error);
          return;
        }

        if (isSeatLayoutEvent || extractedSeatLayout) {
          pushSeatLayoutChunk(parsedPayload, event.type);
        }
        collectMultiCitySeatLayouts(parsedPayload, event.type);

        if (
          isFlightSeatLayoutComplete(parsedPayload) &&
          (extractedSeatLayout || multiCityResults.size)
        ) {
          settle(resolve, buildResult());
          return;
        }

        if (extractedSeatLayout && !isMultiCitySeatLayout) {
          scheduleResolve();
        }
      };

      const startSeatLayout = async () => {
        events = new EventSource(getPricingEventsUrl(channel), {
          withCredentials: true,
        });

        events.addEventListener("message", handleMessage);
        PRICING_SSE_EVENT_NAMES.forEach((eventName) => {
          events.addEventListener(eventName, handleMessage);
        });
        events.addEventListener("error", () => {
          if (!isMultiCitySeatLayout && extractFlightSeatLayoutPayload(buildResult())) {
            scheduleResolve();
          }
        });

        try {
          await waitForSseConnected(events, channel);
          initResponse = await postV2SeatLayout(seatLayoutPayload);

          if (isFlightSeatLayoutComplete(initResponse)) {
            pushSeatLayoutChunk(initResponse, "postV2SeatLayout");
            collectMultiCitySeatLayouts(initResponse, "postV2SeatLayout");
            settle(resolve, buildResult());
            return;
          }

          if (extractFlightSeatLayoutPayload(initResponse)) {
            pushSeatLayoutChunk(initResponse, "postV2SeatLayout");
            collectMultiCitySeatLayouts(initResponse, "postV2SeatLayout");
            if (!isMultiCitySeatLayout) scheduleResolve();
          }
        } catch (error) {
          settle(reject, error);
        }
      };

      startSeatLayout();
    });
  }

  const response = await api.post("/api/flights/seat-layout", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response?.data;
};

export const createFlightItinerary = async (payload) => {
  const response = await api.post("/api/flights/create-itinerary", {
    ...payload,
    domain: "localhost:1337",
  }, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response?.data;
};

export const createFlightV2Booking = async (payload) => {
  const bookingPayload = {
    ...payload,
    domain: payload?.domain || "localhost:1337",
  };
  const channel = bookingPayload.channel;

  const postCreateBooking = async () => {
    const response = await fetch("/api/flights/v2/create-booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify(bookingPayload),
    });
    const data = await response.json().catch(() => ({}));

    if (
      !response.ok ||
      (isFlightCreateBookingFailed(data) &&
        !isRecoverableCreateBookingFareChange(data))
    ) {
      const error = new Error(getApiMessage(data));
      error.status = response.status;
      throw error;
    }

    return data;
  };

  if (!channel || typeof window === "undefined" || !window.EventSource) {
    return postCreateBooking();
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    let settled = false;
    let initResponse = null;
    let idleTimer = null;
    let events = null;

    const cleanup = () => {
      window.clearTimeout(idleTimer);
      window.clearTimeout(hardTimer);
      events?.close();
    };

    const settle = (callback, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback(value);
    };

    const getFinalCreateBookingResponse = () => {
      const reversedChunks = [...chunks].reverse();
      return (
        reversedChunks.find((chunk) => isFlightCreateBookingComplete(chunk)) ||
        reversedChunks.find((chunk) =>
          isRecoverableCreateBookingFareChange(chunk)
        ) ||
        reversedChunks.find((chunk) => hasCreateBookingPayload(chunk)) ||
        (isFlightCreateBookingComplete(initResponse) ||
        hasCreateBookingPayload(initResponse)
          ? initResponse
          : null)
      );
    };

    const hasFinalCreateBookingResponse = () => Boolean(getFinalCreateBookingResponse());

    const buildResult = () => {
      const finalResponse = getFinalCreateBookingResponse() || initResponse || {};

      return {
        ...(finalResponse || {}),
        channel,
        data: {
          ...((finalResponse || {})?.data || {}),
          createBookingChunks: chunks,
        },
        createBookingChunks: chunks,
      };
    };

    const scheduleResolve = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        settle(resolve, buildResult());
      }, 900);
    };

    const hardTimer = window.setTimeout(() => {
      if (hasFinalCreateBookingResponse()) {
        settle(resolve, buildResult());
        return;
      }

      settle(reject, new Error("Flight booking did not complete. Please try again."));
    }, 45000);

    const handleMessage = (event) => {
      const unwrappedPayload = unwrapPricingPayload(event.data);
      const parsedPayload =
        unwrappedPayload && typeof unwrappedPayload === "object"
          ? {
              ...unwrappedPayload,
              type:
                unwrappedPayload.type ||
                unwrappedPayload.data?.type ||
                event.type,
            }
          : unwrappedPayload;
      const payloadChannel = getPayloadChannel(parsedPayload);

      if (payloadChannel && payloadChannel !== channel) return;

      if (isPricingError(parsedPayload)) {
        const error = new Error(getApiMessage(parsedPayload));
        error.status =
          parsedPayload?.error?.status ||
          parsedPayload?.data?.error?.status;
        settle(reject, error);
        return;
      }

      const type = getPayloadType(parsedPayload);
      const isBookingEvent = type.includes("BOOKING");
      const hasPayload = hasCreateBookingPayload(parsedPayload);

      if (isBookingEvent || hasPayload) {
        chunks.push(parsedPayload);
      }

      if (isFlightCreateBookingFailed(parsedPayload)) {
        if (isRecoverableCreateBookingFareChange(parsedPayload)) {
          settle(resolve, buildResult());
          return;
        }
        settle(reject, new Error(getApiMessage(parsedPayload)));
        return;
      }

      if (isFlightCreateBookingComplete(parsedPayload) || hasPayload) {
        scheduleResolve();
      }
    };

    const startCreateBooking = async () => {
      events = new EventSource(getPricingEventsUrl(channel), {
        withCredentials: true,
      });

      events.addEventListener("message", handleMessage);
      PRICING_SSE_EVENT_NAMES.forEach((eventName) => {
        events.addEventListener(eventName, handleMessage);
      });
      events.addEventListener("error", () => {
        if (
          chunks.some((chunk) =>
            isFlightCreateBookingComplete(chunk) || hasCreateBookingPayload(chunk)
          )
        ) {
          scheduleResolve();
        }
      });

      try {
        await waitForSseConnected(events, channel);
        initResponse = await postCreateBooking();

        if (isRecoverableCreateBookingFareChange(initResponse)) {
          chunks.push(initResponse);
          settle(resolve, buildResult());
          return;
        }

        if (
          isFlightCreateBookingFailed(initResponse) &&
          !isRecoverableCreateBookingFareChange(initResponse)
        ) {
          settle(reject, new Error(getApiMessage(initResponse)));
          return;
        }

        if (
          isFlightCreateBookingComplete(initResponse) ||
          hasCreateBookingPayload(initResponse)
        ) {
          chunks.push(initResponse);
          scheduleResolve();
        }
      } catch (error) {
        settle(reject, error);
      }
    };

    startCreateBooking();
  });
};

export const startFlightPayment = async (payload) => {
  const response = await api.post("/api/flights/start-pay", {
    ...payload,
    domain: "localhost:1337",
  }, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response?.data;
};

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

export const startFlightGatewayPayment = async (paymentGateway, payload) => {
  const gatewayId = normalizePaymentGatewayId(paymentGateway);
  const gateway = encodeURIComponent(gatewayId);
  if (!gateway) {
    throw new Error("Payment gateway is required.");
  }

  const response = await fetch(`/api/payment-gateways/${gateway}/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({
      ...payload,
      payment_gateway: gatewayId,
      payment_mode: gatewayId,
    }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(getApiMessage(data));
    error.status = response.status;
    error.response = { data };
    throw error;
  }

  return data;
};

export const retrieveFlightBooking = async (payload) => {
  const response = await api.post("/api/flights/retrieve-booking", {
    ...payload,
    domain: "localhost:1337",
  }, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response?.data;
};

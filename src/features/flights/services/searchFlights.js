import axios from "axios";

const FLIGHT_SOCKET_IDLE_TIMEOUT_MS = 2500;
const FLIGHT_SOCKET_HARD_TIMEOUT_MS = 60000;
const FLIGHT_SSE_EVENT_NAMES = [
  "CONNECTED",
  "PING",
  "FLIGHT_V2_SEARCH_ACCEPTED",
  "FLIGHT_V2_PROVIDER_STARTED",
  "FLIGHT_V2_PROVIDER_AUTHENTICATED",
  "FLIGHT_V2_PROVIDER_RESULT",
  "FLIGHT_V2_PROVIDER_ERROR",
  "FLIGHT_V2_SEARCH_COMPLETE",
  "FLIGHT_V2_SEARCH_COMPLETED",
  "flight-search-result",
  "flight_search_result",
  "FLIGHT_SEARCH_RESULT",
  "search-result",
  "SEARCH_RESULT",
  "result",
  "provider-result",
  "complete",
  "done",
  "error",
];

const getDomain = () => process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337";

const getUuid = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  const template = "10000000-1000-4000-8000-100000000000";
  const getRandomByte = () => {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      return crypto.getRandomValues(new Uint8Array(1))[0];
    }

    return Math.floor(Math.random() * 256);
  };

  return template.replace(/[018]/g, (character) =>
    (
      Number(character) ^
      (getRandomByte() & (15 >> (Number(character) / 4)))
    ).toString(16)
  );
};

const createFlightSearchChannel = () => `flight-search:${getUuid()}`;

const getFlightSearchEventsUrl = (channel) => {
  const url = new URL("/api/flights/v2/events", window.location.origin);
  url.searchParams.set("channel", channel);
  return url.toString();
};

const normalizeCabinClass = (value) => {
  const normalized = String(value || "").trim().toUpperCase();
  const map = {
    ECONOMY: "E",
    E: "E",
    BUSINESS: "B",
    B: "B",
    FIRST: "F",
    FIRST_CLASS: "F",
    F: "F",
    PREMIUM_ECONOMY: "PE",
    "PREMIUM ECONOMY": "PE",
    PE: "PE",
  };

  return map[normalized] || "E";
};

const normalizeSocketTrip = (trip = {}) => {
  const origin = String(trip.origin || trip.from || "").toUpperCase().trim();
  const destination = String(trip.destination || trip.to || "").toUpperCase().trim();
  const departureDate =
    trip.departure_date || trip.departureDate || trip.date || "";

  if (!origin || !destination || !departureDate) return null;

  return {
    origin,
    destination,
    departure_date: departureDate,
    ...(trip.return_date || trip.returnDate
      ? { return_date: trip.return_date || trip.returnDate }
      : {}),
  };
};

const parseTripsParam = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const buildSocketTrips = (params = {}) => {
  const providedTrips = parseTripsParam(params.Trips || params.trips)
    .map(normalizeSocketTrip)
    .filter(Boolean);

  if (providedTrips.length > 0) return providedTrips;

  const origin = params.origin || "";
  const destination = params.destination || "";
  const departureDate = params.departure_date || "";
  const returnDate = params.return_date || params.end || params.returnDate || "";
  const fareType = String(params.fareType || params.fare_type || "").toUpperCase();

  if (!origin || !destination || !departureDate) return [];

  if (fareType === "RT" && returnDate) {
    return [
      {
        origin,
        destination,
        departure_date: departureDate,
        return_date: returnDate,
      },
    ];
  }

  return [
    {
      origin,
      destination,
      departure_date: departureDate,
    },
  ];
};

const buildSocketSearchPayload = (params = {}, channel) => {
  const fareType = String(
    params.fareType ||
      params.fare_type ||
      (params.tripType === "multi" ? "DM" : "ON")
  ).toUpperCase();

  return {
    channel,
    domain: params.domain || getDomain(),
    fareType,
    return_date: params.return_date || params.end || params.returnDate || "",
    Trips: buildSocketTrips({ ...params, fareType }),
    adults: Number(params.adults ?? 1),
    children: Number(params.children ?? 0),
    infants: Number(params.infants ?? 0),
    cabin_class: normalizeCabinClass(params.cabin_class),
    page: Number(params.page || 1),
    limit: Number(params.limit || 20),
    ...(params.provider ? { provider: params.provider } : {}),
    ...(params.stops !== undefined && params.stops !== "" ? { stops: params.stops } : {}),
    ...(params.airlines ? { airlines: params.airlines } : {}),
    ...(params.aircrafts ? { aircrafts: params.aircrafts } : {}),
    ...(params.min_price !== undefined ? { min_price: params.min_price } : {}),
    ...(params.max_price !== undefined ? { max_price: params.max_price } : {}),
    ...(params.departure_slots ? { departure_slots: params.departure_slots } : {}),
    ...(params.arrival_slots ? { arrival_slots: params.arrival_slots } : {}),
    ...(params.sort_by ? { sort_by: params.sort_by } : {}),
    ...(params.IsSeniorCitizen ? { IsSeniorCitizen: true } : {}),
    ...(params.IsStudentFare ? { IsStudentFare: true } : {}),
  };
};

const parseMaybeJson = (value) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const unwrapSocketPayload = (payload) => {
  let current = payload;

  for (let index = 0; index < 5; index += 1) {
    const parsed = parseMaybeJson(current);
    if (parsed !== current) {
      current = parsed;
      continue;
    }

    if (
      current &&
      typeof current === "object" &&
      (current.type ||
        current.channel ||
        current.data?.mergedProviders ||
        current.data?.providerResults)
    ) {
      return current;
    }

    const next =
      current?.received?.message ||
      current?.data?.message ||
      null;

    if (!next || next === current) return current;
    current = next;
  }

  return current;
};

const toArray = (value) => (Array.isArray(value) ? value : []);

const getFlightResultEntries = (payload) => {
  const entries = [];

  const addTripResult = (tripItem) => {
    const tripData = tripItem?.data || {};
    const result = tripData?.result;

    if (!result || typeof result !== "object") return;

    const trip = tripData?.trip || null;
    const route =
      result?.meta?.route ||
      (trip?.origin && trip?.destination
        ? `${trip.origin} -> ${trip.destination}`
        : "");

    entries.push({
      result,
      routeKey: normalizeRouteKey(route),
      route: route || "",
      trip,
      flights: toArray(result?.flights),
    });
  };

  toArray(payload?.data?.mergedProviders?.trips).forEach(addTripResult);
  toArray(payload?.data?.providerResults).forEach((providerResult) => {
    toArray(providerResult?.data?.trips).forEach(addTripResult);
  });

  return entries;
};

const isUsableFlight = (flight) => {
  if (!flight || typeof flight !== "object") return false;
  if (flight.index || flight.flightNo) return true;
  if (Array.isArray(flight.onward) && flight.onward.length) return true;
  if (Array.isArray(flight.return) && flight.return.length) return true;
  return false;
};

const getFlightItems = (payload) =>
  getFlightResultEntries(payload).flatMap((entry) =>
    entry.flights.filter(isUsableFlight),
  );

const getPayloadChannel = (payload) =>
  payload?.channel ||
  payload?.data?.channel ||
  "";

const getPayloadType = (payload) =>
  String(
    payload?.type ||
      payload?.data?.type ||
      "",
  ).toUpperCase();

const normalizeRouteKey = (value = "") =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/\s*(?:->|→)\s*/g, " -> ");

const getPayloadResultData = (payload) => {
  const entries = getFlightResultEntries(payload);
  const entryWithFlights = entries.find((entry) =>
    entry.flights.some(isUsableFlight),
  );

  return entryWithFlights?.result || entries[0]?.result || {};
};

const isFlightSearchError = (payload) =>
  Boolean(payload?.error || payload?.data?.error) ||
  ["ERROR", "FLIGHT_SEARCH_ERROR", "SEARCH_ERROR"].includes(getPayloadType(payload));

const isFlightSearchComplete = (payload) => {
  const type = getPayloadType(payload);
  return (
    type.includes("COMPLETE") ||
    type.includes("COMPLETED") ||
    type.includes("DONE") ||
    type === "FLIGHT_SEARCH_RESULT" ||
    type === "SEARCH_RESULT"
  );
};

const getApiMessage = (payload) =>
  payload?.error?.message ||
  payload?.data?.error?.message ||
  payload?.message ||
  payload?.data?.message ||
  "Flight search failed. Please try again.";

const mergeSocketPayloads = ({ chunks, initResponse, params, channel }) => {
  const flights = [];
  const tripResults = {};
  const seen = new Set();
  let latestPayload = initResponse || {};

  chunks.forEach((chunk) => {
    latestPayload = chunk || latestPayload;
    const resultEntries = getFlightResultEntries(chunk);

    resultEntries.forEach((entry) => {
      const routeKey = entry.routeKey;
      const resultData = entry.result;

      if (routeKey && !tripResults[routeKey]) {
        tripResults[routeKey] = {
          route: entry.route || routeKey,
          trip: entry.trip,
          meta: resultData?.meta || {},
          cheapest: resultData?.cheapest || null,
          fastest: resultData?.fastest || null,
          filters: resultData?.filters || null,
          aircrafts: resultData?.aircrafts || [],
          airlines: resultData?.filters?.airlines || [],
          flights: [],
        };
      }

      entry.flights.filter(isUsableFlight).forEach((flight, index) => {
        const flightKey = String(
          flight?.index ||
            flight?.flightNo ||
            flight?.tui ||
            JSON.stringify(flight).slice(0, 500) ||
            index,
        );
        const key = `${routeKey || "ALL"}:${flightKey}`;

        if (seen.has(key)) return;
        seen.add(key);
        flights.push(flight);
        if (routeKey) {
          tripResults[routeKey].flights.push(flight);
        }
      });
    });
  });

  const payloadData = latestPayload?.data || latestPayload || {};
  const resultData = getPayloadResultData(latestPayload);
  const pagination = {
    page: Number(params.page || 1),
    limit: Number(params.limit || 20),
    total: Number(resultData?.meta?.total || flights.length),
  };

  return {
    ...latestPayload,
    channel,
    requestId: initResponse?.requestId || latestPayload?.requestId || "",
    websocketPath: initResponse?.websocketPath || "/api/flights/v2/events",
    ssePath: initResponse?.ssePath || "/api/flights/v2/events",
    streaming: true,
    data: {
      ...payloadData,
      flights,
      results: flights,
      tripResults,
      pagination,
      filters: resultData?.filters,
      meta: {
        ...(resultData?.meta || {}),
        pagination,
      },
    },
  };
};

const postSocketFlightSearch = async (payload) => {
  const response = await fetch("/api/flights/v2/search", {
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

const searchFlightsViaSocket = async (params = {}) => {
  const channel = createFlightSearchChannel();
  const searchPayload = buildSocketSearchPayload(params, channel);

  if (!searchPayload.Trips.length) {
    throw new Error("Missing flight route or departure date.");
  }

  if (searchPayload.fareType === "RT" && !searchPayload.Trips[0]?.return_date) {
    throw new Error("Missing return date for round trip search.");
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    let settled = false;
    let initResponse = null;
    let idleTimer = null;
    let events = null;
    let completionReceived = false;

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

    const scheduleIdleResolve = () => {
      if (!chunks.length && !completionReceived) return;

      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        settle(
          resolve,
          mergeSocketPayloads({
            chunks,
            initResponse,
            params,
            channel,
          }),
        );
      }, FLIGHT_SOCKET_IDLE_TIMEOUT_MS);
    };

    const hardTimer = window.setTimeout(() => {
      settle(
        chunks.length || completionReceived ? resolve : reject,
        chunks.length || completionReceived
          ? mergeSocketPayloads({
              chunks,
              initResponse,
              params,
              channel,
            })
          : new Error("Flight search timed out. Please try again."),
      );
    }, FLIGHT_SOCKET_HARD_TIMEOUT_MS);

    const handleMessage = (event) => {
      const payload = unwrapSocketPayload(event.data);
      const payloadChannel = getPayloadChannel(payload);
      const flights = getFlightItems(payload);
      const isCurrentChannel = !payloadChannel || payloadChannel === channel;

      if (!isCurrentChannel) return;

      if (isFlightSearchError(payload)) {
        const error = new Error(getApiMessage(payload));
        error.status = payload?.error?.status || payload?.data?.error?.status;
        settle(reject, error);
        return;
      }

      if (flights.length) {
        chunks.push(payload);
        scheduleIdleResolve();
      }

      if (isFlightSearchComplete(payload)) {
        completionReceived = true;
        scheduleIdleResolve();
      }
    };

    const startSearch = async () => {
      events = new EventSource(getFlightSearchEventsUrl(channel), {
        withCredentials: true,
      });

      events.addEventListener("message", handleMessage);
      FLIGHT_SSE_EVENT_NAMES.forEach((eventName) => {
        events.addEventListener(eventName, handleMessage);
      });
      events.addEventListener("error", () => {
        if (chunks.length || completionReceived) {
          scheduleIdleResolve();
        }
      });

      try {
        initResponse = await postSocketFlightSearch(searchPayload);
      } catch (error) {
        settle(reject, error);
      }
    };

    startSearch();
  });
};

const searchFlightsViaHttp = async (params = {}) => {
  const searchPayload = buildSocketSearchPayload(
    params,
    createFlightSearchChannel(),
  );
  const requestOptions = {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  };
  const searchResponse = await axios.post(
    "/api/flights/v2/search",
    searchPayload,
    requestOptions,
  );

  return searchResponse.data;
};

export const searchFlights = async (params = {}) => {
  try {
    if (typeof window !== "undefined" && window.EventSource) {
      return await searchFlightsViaSocket(params);
    }

    return await searchFlightsViaHttp(params);
  } catch (error) {
    const backendMessage =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "";
    const status = error?.response?.status || error?.status;
    const fallbackMessage =
      status === 500
        ? "Internal server error"
        : `Flight search failed: ${status || "unknown"}`;
    const nextError = new Error(backendMessage || fallbackMessage);
    nextError.status = status;
    throw nextError;
  }
};

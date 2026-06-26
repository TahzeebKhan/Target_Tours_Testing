import axios from "axios";

const FLIGHT_SOCKET_IDLE_TIMEOUT_MS = 2500;
const FLIGHT_SOCKET_HARD_TIMEOUT_MS = 60000;

const getBackendUrl = () =>
  String(process.env.NEXT_PUBLIC_BACKEND_URL || "https://sprintsell.com").replace(/\/$/, "");

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

const getFlightSearchWebSocketUrl = () =>
  `${getBackendUrl().replace(/^http/i, "ws")}/hotel-search/ws`;

const buildFlightsUrl = (path, params = {}) => {
  const url = new URL(`${getBackendUrl()}/api/flights/${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      const hasObjectItems = value.some((item) => item && typeof item === "object");
      if (hasObjectItems) {
        url.searchParams.set(key, JSON.stringify(value));
        return;
      }

      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          url.searchParams.append(key, String(item));
        }
      });
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url;
};

const extractRefreshTui = (payload) =>
  payload?.TUI ||
  payload?.tui ||
  payload?.data?.TUI ||
  payload?.data?.tui ||
  "";

const withRefreshTui = (searchPayload, refreshPayload) => {
  const refreshTui = extractRefreshTui(refreshPayload);
  if (!refreshTui) return searchPayload;

  const nextPayload =
    searchPayload && typeof searchPayload === "object"
      ? { ...searchPayload }
      : { data: searchPayload };

  nextPayload.TUI = refreshTui;
  nextPayload.tui = refreshTui;

  if (
    nextPayload.data &&
    typeof nextPayload.data === "object" &&
    !Array.isArray(nextPayload.data)
  ) {
    nextPayload.data = {
      ...nextPayload.data,
      TUI: refreshTui,
      tui: refreshTui,
    };
  }

  return nextPayload;
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

    const next =
      current?.received?.message ||
      current?.message ||
      current?.data?.message ||
      current?.data?.content ||
      null;

    if (!next || next === current) return current;
    current = next;
  }

  return current;
};

const findFirstArrayAtPaths = (source, paths) => {
  for (const path of paths) {
    let current = source;
    for (const key of path) {
      current = current?.[key];
    }
    if (Array.isArray(current)) return current;
  }

  return [];
};

const findFirstItemsAtPaths = (source, paths) => {
  for (const path of paths) {
    let current = source;
    for (const key of path) {
      current = current?.[key];
    }

    if (Array.isArray(current)) return current;
    if (current && typeof current === "object") return [current];
  }

  return [];
};

const getFlightItems = (payload) =>
  findFirstItemsAtPaths(payload, [
    ["data", "result", "flights"],
    ["data", "result", "results"],
    ["data", "flights"],
    ["data", "results"],
    ["data", "itineraries"],
    ["data", "content", "flights"],
    ["data", "content", "results"],
    ["result", "flights"],
    ["result", "results"],
    ["content", "flights"],
    ["content", "results"],
    ["flights"],
    ["results"],
    ["itineraries"],
  ]);

const getPayloadChannel = (payload) =>
  payload?.channel ||
  payload?.data?.channel ||
  payload?.content?.channel ||
  payload?.data?.content?.channel ||
  "";

const getPayloadType = (payload) =>
  String(
    payload?.type ||
      payload?.data?.type ||
      payload?.content?.type ||
      payload?.data?.content?.type ||
      "",
  ).toUpperCase();

const normalizeRouteKey = (value = "") =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/\s*(?:->|→)\s*/g, " -> ");

const getPayloadResultData = (payload) => {
  const payloadData = payload?.data || payload || {};
  return payloadData?.result && typeof payloadData.result === "object"
    ? payloadData.result
    : payloadData;
};

const getPayloadRouteKey = (payload) => {
  const resultData = getPayloadResultData(payload);
  const routeText =
    resultData?.route ||
    resultData?.meta?.route ||
    payload?.route ||
    payload?.data?.route ||
    payload?.data?.meta?.route ||
    "";

  if (routeText) return normalizeRouteKey(routeText);

  const origin =
    resultData?.trip?.origin ||
    resultData?.origin ||
    payload?.origin ||
    payload?.data?.origin ||
    "";
  const destination =
    resultData?.trip?.destination ||
    resultData?.destination ||
    payload?.destination ||
    payload?.data?.destination ||
    "";

  return origin && destination
    ? normalizeRouteKey(`${origin} -> ${destination}`)
    : "";
};

const isFlightSearchError = (payload) =>
  Boolean(payload?.error || payload?.data?.error) ||
  ["ERROR", "FLIGHT_SEARCH_ERROR", "SEARCH_ERROR"].includes(getPayloadType(payload));

const isFlightSearchComplete = (payload) => {
  const type = getPayloadType(payload);
  return (
    type.includes("COMPLETE") ||
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
    const routeKey = getPayloadRouteKey(chunk);
    const chunkFlights = getFlightItems(chunk);

    if (routeKey && !tripResults[routeKey]) {
      const resultData = getPayloadResultData(chunk);
      tripResults[routeKey] = {
        route: resultData?.route || resultData?.meta?.route || routeKey,
        trip: resultData?.trip || null,
        meta: resultData?.meta || {},
        cheapest: resultData?.cheapest || null,
        fastest: resultData?.fastest || null,
        filters: resultData?.filters || null,
        aircrafts: resultData?.aircrafts || resultData?.filters?.aircrafts || [],
        airlines: resultData?.airlines || resultData?.filters?.airlines || [],
        flights: [],
      };
    }

    chunkFlights.forEach((flight, index) => {
      const flightKey = String(
        flight?.id ||
          flight?.flightId ||
          flight?.resultIndex ||
          flight?.recommendationId ||
          flight?.TUI ||
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

  const payloadData = latestPayload?.data || latestPayload || {};
  const resultData = getPayloadResultData(latestPayload);
  const pagination = {
    page: Number(params.page || 1),
    limit: Number(params.limit || 20),
    total: Number(resultData?.pagination?.total || resultData?.total || flights.length),
  };

  return {
    ...latestPayload,
    channel,
    requestId: initResponse?.requestId || latestPayload?.requestId || "",
    websocketPath: initResponse?.websocketPath || "/hotel-search/ws",
    streaming: true,
    data: {
      ...payloadData,
      ...resultData,
      flights,
      results: flights,
      tripResults,
      pagination,
      filters: resultData?.filters || payloadData?.filters || latestPayload?.filters,
      meta: {
        ...(resultData?.meta || payloadData?.meta || latestPayload?.meta || {}),
        pagination,
      },
    },
  };
};

const postSocketFlightSearch = async (payload) => {
  const response = await fetch("/api/flights/searchflight", {
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
    const socket = new WebSocket(getFlightSearchWebSocketUrl());

    const cleanup = () => {
      window.clearTimeout(idleTimer);
      window.clearTimeout(hardTimer);
      socket.close();
    };

    const settle = (callback, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback(value);
    };

    const scheduleIdleResolve = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        if (!chunks.length) return;
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
      if (chunks.length) {
        settle(
          resolve,
          mergeSocketPayloads({
            chunks,
            initResponse,
            params,
            channel,
          }),
        );
        return;
      }

      settle(reject, new Error("Flight search timed out. Please try again."));
    }, FLIGHT_SOCKET_HARD_TIMEOUT_MS);

    socket.addEventListener("open", async () => {
      socket.send(
        JSON.stringify({
          type: "SUBSCRIBE",
          channel,
        }),
      );

      try {
        initResponse = await postSocketFlightSearch(searchPayload);
      } catch (error) {
        settle(reject, error);
      }
    });

    socket.addEventListener("message", (event) => {
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

      if (isFlightSearchComplete(payload) && chunks.length) {
        scheduleIdleResolve();
      }
    });

    socket.addEventListener("error", () => {
      settle(reject, new Error("Flight search socket connection failed."));
    });

    socket.addEventListener("close", () => {
      if (!settled && chunks.length) {
        settle(
          resolve,
          mergeSocketPayloads({
            chunks,
            initResponse,
            params,
            channel,
          }),
        );
      }
    });
  });
};

const searchFlightsViaHttp = async (params = {}) => {
  const searchUrl = buildFlightsUrl("search", params);
  const refreshTuiUrl = buildFlightsUrl("get-refresh-tui", params);
  const requestOptions = {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  };
  const [searchResponse, refreshTuiResponse] = await Promise.all([
    axios.get(searchUrl.toString(), requestOptions),
    axios.get(refreshTuiUrl.toString(), requestOptions),
  ]);

  return withRefreshTui(searchResponse.data, refreshTuiResponse.data);
};

export const searchFlights = async (params = {}) => {
  try {
    if (typeof window !== "undefined" && window.WebSocket) {
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

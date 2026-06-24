import Cookies from "js-cookie";

export const HOTEL_SEARCH_SESSION_KEY = "hotelSearchContext";
export const HOTEL_SEARCH_RESULTS_KEY = "hotelSearchResults";
export const HOTEL_SEARCH_RESULTS_EVENT = "hotel-search-results";
export const HOTEL_DETAILS_KEY = "hotelDetails";
export const HOTEL_BOOKING_SESSION_KEY = "hotelBookingSession";

const normalizeBaseUrl = () => {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (base) return base;
  return `http://${process.env.NEXT_PUBLIC_DOMAIN}`;
};

const getDomain = () => process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337";

const getAuthToken = () => Cookies.get("auth_token") || "";

const getHotelSearchHeaders = () => {
  const token = getAuthToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getApiMessage = (data) => {
  if (typeof data === "string") return data;

  const findMessage = (value, depth = 0, seen = new WeakSet()) => {
    if (!value || depth > 6) return "";
    if (typeof value === "string") return value;
    if (typeof value !== "object") return "";
    if (seen.has(value)) return "";
    seen.add(value);

    if (typeof value.message === "string" && value.message.trim()) {
      return value.message;
    }

    if (typeof value.error === "string" && value.error.trim()) {
      return value.error;
    }

    const entries = Array.isArray(value) ? value : Object.values(value);
    for (const entry of entries) {
      const message = findMessage(entry, depth + 1, seen);
      if (message) return message;
    }

    return "";
  };

  const candidates = [
    data?.error?.message,
    data?.error,
    data?.message,
    data?.data?.rooms,
    data?.rooms,
    data?.data?.content,
    data?.content,
    data?.data,
    data,
  ];
  const message = candidates
    .map((item) => findMessage(item))
    .find(Boolean);

  return message || "";
};

const createApiError = (data, fallbackMessage) => {
  const apiError = data?.error || {};
  const error = new Error(getApiMessage(data) || fallbackMessage);

  error.status = apiError.status;
  error.name = apiError.name || error.name;
  error.details = apiError.details || {};

  return error;
};

export const isMissingHotelAuthTokenError = (error) =>
  Number(error?.status) === 401 &&
  (error?.message === "JWT token missing" || error?.name === "UnauthorizedError");

const getUuid = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const createHotelSearchChannel = () =>
  `hotel-search:test-init:hotel-${getUuid()}`;

export const getHotelSearchWebSocketUrl = () => {
  const base = normalizeBaseUrl().replace(/^http/i, "ws").replace(/\/$/, "");
  return `${base}/hotel-search/ws`;
};

export const subscribeHotelSearchChannel = (channel, handlers = {}) => {
  if (typeof window === "undefined" || !channel) return null;

  const socket = new WebSocket(getHotelSearchWebSocketUrl());

  socket.addEventListener("open", () => {
    socket.send(
      JSON.stringify({
        type: "SUBSCRIBE",
        channel,
      }),
    );
    handlers.onOpen?.(socket);
  });

  socket.addEventListener("message", (event) => {
    let payload = event.data;

    try {
      payload = JSON.parse(event.data);
    } catch {
      // Keep raw socket text if the backend sends a non-JSON message.
    }

    handlers.onMessage?.(payload, socket);
  });

  socket.addEventListener("error", (event) => {
    handlers.onError?.(event, socket);
  });

  socket.addEventListener("close", (event) => {
    handlers.onClose?.(event, socket);
  });

  return socket;
};

const normalizeHotelLocation = (item = {}, index = 0) => {
  const coordinates = item.coordinates || item.geoCode || item.geo_code || {};
  const lat = coordinates.lat ?? coordinates.latitude ?? item.lat ?? item.latitude;
  const long =
    coordinates.long ??
    coordinates.lng ??
    coordinates.longitude ??
    item.long ??
    item.lng ??
    item.longitude;
  const name = item.name || item.city || item.fullName || item.label || "";
  const fullName = item.fullName || item.full_name || item.detail || name;
  const country = item.country || item.countryCode || item.country_code || "";
  const state = item.state || item.stateCode || item.state_code || "";
  const id = item.id || item.locationId || item.location_id || item.referenceId;

  return {
    id: id ? String(id) : `${name || "hotel-location"}-${index}`,
    label: name,
    detail: fullName,
    code: item.type || country || id || "",
    value: name,
    locationId: id ? String(id) : "",
    country,
    state,
    type: item.type || "",
    geoCode: {
      lat: lat !== undefined && lat !== null ? Number(lat) : undefined,
      long: long !== undefined && long !== null ? Number(long) : undefined,
    },
    raw: item,
  };
};

export const fetchHotelSearchSuggestions = async (query) => {
  const q = String(query || "").trim();
  if (!q) return [];

  const url = new URL("/api/hotel-search/searchSuggestions", normalizeBaseUrl());
  url.searchParams.set("query", q);
  url.searchParams.set("domain", getDomain());

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getHotelSearchHeaders(),
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Hotel suggestions failed with status ${response.status}`);
  }

  const payload = await response.json();
  const locations = Array.isArray(payload?.locations)
    ? payload.locations
    : Array.isArray(payload?.data?.locations)
      ? payload.data.locations
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

  return locations
    .map(normalizeHotelLocation)
    .filter((item) => item.label || item.detail);
};

export const initHotelSearch = async (payload) => {
  const url = new URL("/api/hotel-search/init", normalizeBaseUrl());

  console.log("[Hotel timing] init API fetch", {
    url: url.toString(),
    payload,
  });

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: getHotelSearchHeaders(),
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({
      domain: getDomain(),
      ...payload,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw createApiError(data, "Hotel search init failed");
  }

  return data;
};

export const fetchHotelDetails = async ({
  searchId,
  hotelId,
  priceProvider,
}) => {
  const url = new URL("/api/hotel-search/hotel-details", normalizeBaseUrl());

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: getHotelSearchHeaders(),
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({
      domain: getDomain(),
      searchId,
      hotelId,
      priceProvider,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw createApiError(data, "Hotel details failed");
  }

  return data;
};

export const fetchHotelRooms = async ({
  searchId,
  hotelId,
  priceProvider,
}) => {
  const url = new URL("/api/hotel-search/get-rooms", normalizeBaseUrl());
  const headers = getHotelSearchHeaders();

  const response = await fetch(url.toString(), {
    method: "POST",
    headers,
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({
      domain: getDomain(),
      searchId,
      hotelId,
      priceProvider,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw createApiError(data, "Hotel rooms failed");
  }

  return data;
};

export const changeHotelAvailability = async (payload = {}) => {
  const response = await fetch("/api/hotel-search/changehotelavailability", {
    method: "POST",
    headers: getHotelSearchHeaders(),
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({
      ...payload,
      domain: payload.domain || getDomain(),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw createApiError(data, "Hotel availability check failed");
  }

  return data;
};

export const startHotelBooking = async (payload = {}) => {
  const url = new URL("/api/hotel-search/start-booking", normalizeBaseUrl());

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: getHotelSearchHeaders(),
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({
      ...payload,
      domain: payload.domain || getDomain(),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw createApiError(data, "Hotel booking failed");
  }

  return data;
};

export const refreshHotelSession = async (payload = {}) => {
  const url = new URL("/api/hotel-search/refresh-session", normalizeBaseUrl());

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: getHotelSearchHeaders(),
    body: JSON.stringify({
      ...payload,
      domain: payload.domain || getDomain(),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw createApiError(data, "Hotel session refresh failed");
  }

  return data;
};

export const confirmHotelBooking = async (payload = {}) => {
  const url = new URL("/api/hotel-search/confirm-booking", normalizeBaseUrl());

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: getHotelSearchHeaders(),
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({
      ...payload,
      domain: payload.domain || getDomain(),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw createApiError(data, "Hotel booking confirmation failed");
  }

  return data;
};

export const retrieveHotelBookingDetails = async (bookingId) => {
  const url = new URL("/api/hotel-search/retrieve-booking-details", normalizeBaseUrl());

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: getHotelSearchHeaders(),
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({
      booking_id: bookingId,
      domain: getDomain(),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw createApiError(data, "Hotel booking details retrieval failed");
  }

  return data;
};

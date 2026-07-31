import Cookies from "js-cookie";

export const HOTEL_SEARCH_SESSION_KEY = "hotelSearchContext";
export const HOTEL_SEARCH_RESULTS_KEY = "hotelSearchResults";
export const HOTEL_SEARCH_RESULTS_EVENT = "hotel-search-results";
export const HOTEL_LAST_SEARCH_URL_KEY = "hotelLastSearchUrl";
export const HOTEL_DETAILS_KEY = "hotelDetails";
export const HOTEL_BOOKING_SESSION_KEY = "hotelBookingSession";
export const HOTEL_PENDING_CONFIRM_BOOKING_KEY = "hotelPendingConfirmBooking";
export const HOTEL_BOOKING_STATUS_KEY = "hotelBookingStatus";
export const HOTEL_BOOKING_STATUS_EVENT = "hotel-booking-status";
export const HOTEL_BOOKING_SESSION_DURATION_MS = 20 * 60 * 1000;

let inMemoryHotelBookingSession = null;
let hotelBookingSessionExpiryTimer = null;
const PAYMENT_GATEWAY_CACHE_TTL_MS = 5 * 60 * 1000;
const paymentGatewayRequestCache = new Map();

const normalizeBaseUrl = () => {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (base) return base;
  return `http://${process.env.NEXT_PUBLIC_DOMAIN}`;
};

const getDomain = () => process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337";

const getAuthToken = () => Cookies.get("auth_token") || "";

const removeStoredHotelBookingSession = () => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(HOTEL_BOOKING_SESSION_KEY);
  } catch {
    // Ignore storage failures.
  }
};

const clearHotelBookingSessionExpiryTimer = () => {
  if (typeof window === "undefined" || !hotelBookingSessionExpiryTimer) return;

  window.clearTimeout(hotelBookingSessionExpiryTimer);
  hotelBookingSessionExpiryTimer = null;
};

export const clearHotelBookingSession = () => {
  inMemoryHotelBookingSession = null;
  clearHotelBookingSessionExpiryTimer();
  removeStoredHotelBookingSession();
};

export const clearCompletedHotelFlowStorage = () => {
  if (typeof window === "undefined") return;

  clearHotelBookingSession();
  clearPendingHotelConfirmBooking();
  clearHotelBookingStatus();

  try {
    window.sessionStorage.removeItem(HOTEL_DETAILS_KEY);
    window.sessionStorage.removeItem(HOTEL_SEARCH_RESULTS_KEY);
    window.sessionStorage.removeItem(HOTEL_SEARCH_SESSION_KEY);
    window.localStorage.removeItem(HOTEL_LAST_SEARCH_URL_KEY);
  } catch {
    // Ignore storage failures.
  }
};

const scheduleHotelBookingSessionExpiry = (expiresAt) => {
  if (typeof window === "undefined") return;

  clearHotelBookingSessionExpiryTimer();

  const remainingMs = Number(expiresAt) - Date.now();
  if (!Number.isFinite(remainingMs) || remainingMs <= 0) {
    clearHotelBookingSession();
    return;
  }

  hotelBookingSessionExpiryTimer = window.setTimeout(() => {
    clearHotelBookingSession();
  }, remainingMs);
};

const storeHotelBookingSession = (value) => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(HOTEL_BOOKING_SESSION_KEY, JSON.stringify(value));
  } catch {
    // Ignore storage failures.
  }
};

export const getHotelBookingSessionExpiry = (session) => {
  const expiry = Number(session?.hotelBookingSessionExpiresAt);
  return Number.isFinite(expiry) && expiry > 0 ? expiry : null;
};

export const isHotelBookingSessionExpired = (session, now = Date.now()) => {
  const expiry = getHotelBookingSessionExpiry(session);
  return Boolean(expiry && now >= expiry);
};

export const withHotelBookingSessionExpiry = (value) => {
  if (!value) return value;

  const startedAt = Number(value.hotelBookingSessionStartedAt) || Date.now();
  const expiresAt =
    Number(value.hotelBookingSessionExpiresAt) ||
    startedAt + HOTEL_BOOKING_SESSION_DURATION_MS;

  return {
    ...value,
    hotelBookingSessionStartedAt: startedAt,
    hotelBookingSessionExpiresAt: expiresAt,
  };
};

export const writeHotelBookingSession = (value) => {
  if (!value) {
    clearHotelBookingSession();
    return;
  }

  const nextValue = withHotelBookingSessionExpiry(value);
  if (isHotelBookingSessionExpired(nextValue)) {
    clearHotelBookingSession();
    return;
  }

  inMemoryHotelBookingSession = nextValue;
  try {
    window.localStorage.removeItem(HOTEL_BOOKING_STATUS_KEY);
  } catch {
    // Ignore storage failures.
  }
  storeHotelBookingSession(nextValue);
  scheduleHotelBookingSessionExpiry(nextValue.hotelBookingSessionExpiresAt);
};

export const readHotelBookingSession = () => {
  if (inMemoryHotelBookingSession) {
    if (isHotelBookingSessionExpired(inMemoryHotelBookingSession)) {
      clearHotelBookingSession();
      return null;
    }

    return inMemoryHotelBookingSession;
  }

  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(HOTEL_BOOKING_SESSION_KEY);
    const parsed = raw ? JSON.parse(raw) : null;

    if (isHotelBookingSessionExpired(parsed)) {
      clearHotelBookingSession();
      return null;
    }

    inMemoryHotelBookingSession = parsed || null;
    if (inMemoryHotelBookingSession) {
      scheduleHotelBookingSessionExpiry(
        inMemoryHotelBookingSession.hotelBookingSessionExpiresAt,
      );
    }
    return inMemoryHotelBookingSession;
  } catch {
    return null;
  }
};

export const writePendingHotelConfirmBooking = (value) => {
  if (typeof window === "undefined") return;

  try {
    const serializedValue = JSON.stringify(value);
    window.sessionStorage.setItem(HOTEL_PENDING_CONFIRM_BOOKING_KEY, serializedValue);
    window.localStorage.setItem(HOTEL_PENDING_CONFIRM_BOOKING_KEY, serializedValue);
  } catch {
    // Ignore storage failures.
  }
};

export const readPendingHotelConfirmBooking = () => {
  if (typeof window === "undefined") return null;

  try {
    const raw =
      window.sessionStorage.getItem(HOTEL_PENDING_CONFIRM_BOOKING_KEY) ||
      window.localStorage.getItem(HOTEL_PENDING_CONFIRM_BOOKING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearPendingHotelConfirmBooking = () => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(HOTEL_PENDING_CONFIRM_BOOKING_KEY);
    window.localStorage.removeItem(HOTEL_PENDING_CONFIRM_BOOKING_KEY);
  } catch {
    // Ignore storage failures.
  }
};

const emitHotelBookingStatus = (status) => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(HOTEL_BOOKING_STATUS_EVENT, { detail: status }),
  );
};

export const readHotelBookingStatus = () => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(HOTEL_BOOKING_STATUS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;

    if (isHotelBookingSessionExpired(parsed)) {
      window.localStorage.removeItem(HOTEL_BOOKING_STATUS_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const writeHotelBookingStatus = (value = {}) => {
  if (typeof window === "undefined") return null;

  const nextValue = withHotelBookingSessionExpiry({
    ...value,
    updatedAt: Date.now(),
  });

  try {
    window.localStorage.setItem(HOTEL_BOOKING_STATUS_KEY, JSON.stringify(nextValue));
  } catch {
    // Ignore storage failures.
  }

  emitHotelBookingStatus(nextValue);
  return nextValue;
};

export const markHotelBookingPaymentStarted = (value = {}) =>
  writeHotelBookingStatus({
    ...value,
    status: "payment_started",
  });

export const markHotelBookingSubmitStarted = (value = {}) => {
  if (typeof window === "undefined") return null;

  const nextValue = withHotelBookingSessionExpiry({
    ...value,
    status: "submit_started",
    updatedAt: Date.now(),
  });

  try {
    window.localStorage.setItem(HOTEL_BOOKING_STATUS_KEY, JSON.stringify(nextValue));
  } catch {
    // Ignore storage failures.
  }

  return nextValue;
};

export const markHotelBookingConfirmed = (value = {}) => {
  const status = writeHotelBookingStatus({
    ...value,
    status: "confirmed",
  });

  clearHotelBookingSession();
  return status;
};

export const clearHotelBookingStatus = () => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(HOTEL_BOOKING_STATUS_KEY);
  } catch {
    // Ignore storage failures.
  }

  emitHotelBookingStatus(null);
};

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
  const nestedData = data?.data || {};
  const error = new Error(getApiMessage(data) || fallbackMessage);

  error.status = apiError.status || data?.status || nestedData?.status;
  error.code = apiError.code || data?.code || nestedData?.code;
  error.name = apiError.name || error.name;
  error.details = apiError.details || nestedData || {};
  error.data = data;
  error.provider_code =
    data?.provider_code || data?.details?.provider_code || data?.data?.Code;

  return error;
};

const isApiFailure = (data) =>
  String(data?.status || data?.data?.status || data?.error?.status || "").toLowerCase() === "failure" ||
  ["1211", "1216"].includes(String(data?.code || data?.data?.code || data?.error?.code || ""));

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
  if (q.length < 2) return [];

  const url = new URL("/api/hotel-search/searchSuggestions", normalizeBaseUrl());
  url.searchParams.set("query", q);
  url.searchParams.set("domain", getDomain());

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
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

export const fetchHotelDetails = async (fetchHotelDetailsPayload = {}) => {
  const { searchId, hotelSearchId, hotelId, priceProvider, signal } = fetchHotelDetailsPayload;
  const baseUrl = normalizeBaseUrl();
  const primaryUrl = baseUrl ? new URL("/api/hotel-search/hotel-details", baseUrl).toString() : "/api/hotel-search/hotel-details";

  const requestBody = JSON.stringify({
    domain: getDomain(),
    searchId: String(searchId || "").trim(),
    hotelSearchId: String(hotelSearchId || searchId || "").trim(),
    hotelId: String(hotelId || "").trim(),
    priceProvider: String(priceProvider || "akbar").trim(),
  });

  const response = await fetch(primaryUrl, {
    method: "POST",
    headers: getHotelSearchHeaders(),
    credentials: "include",
    cache: "no-store",
    signal,
    body: requestBody,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw createApiError(data, "Hotel details failed");
  }

  return data;
};

export const fetchHotelFilterData = async (searchId, { signal, payload = {} } = {}) => {
  const id = String(searchId || "").trim();
  if (!id) {
    throw new Error("Hotel search ID is required to load filters.");
  }

  const url = new URL(
    `/api/hotels/search/result/${encodeURIComponent(id)}/filterdata`,
    normalizeBaseUrl(),
  );


  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: getHotelSearchHeaders(),
      credentials: "include",
      cache: "no-store",
      signal,
      body: JSON.stringify({
        domain: payload.domain || getDomain(),
        searchId: payload.searchId || id,
        hotelSearchId: payload.hotelSearchId || payload.hotel_search_id || "",
        hotel_search_id: payload.hotelSearchId || payload.hotel_search_id || "",
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || isApiFailure(data)) {
      throw createApiError(data, "Hotel filter data failed");
    }

    return data?.data?.filterData || data?.data?.filters || data?.filterData || data?.filters || data?.data || data;
  } catch (error) {
    console.error("Error fetching hotel filter data:", error);
    throw error;
  }
};

export const fetchHotelRooms = async (fetchHotelRoomsPayload = {}) => {
  const { searchId, hotelSearchId, hotelId, priceProvider } = fetchHotelRoomsPayload;
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
      hotelSearchId,
      hotelId,
      priceProvider,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || isApiFailure(data)) {
    throw createApiError(data, "Hotel rooms failed");
  }

  return data;
};

export const changeHotelAvailability = async (changeHotelAvailabilityPayload = {}) => {
  const url = new URL("/api/hotel-search/changehotelavailability", normalizeBaseUrl());
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: getHotelSearchHeaders(),
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({
      ...changeHotelAvailabilityPayload,
      domain: changeHotelAvailabilityPayload.domain || getDomain(),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw createApiError(data, "Hotel availability check failed");
  }

  return data;
};

export const fetchHotelPricingDetails = async (hotelPricingDetailsPayload = {}) => {
  const url = new URL("/api/hotel-search/hotel-pricing-details", normalizeBaseUrl());

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: getHotelSearchHeaders(),
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({
      domain: hotelPricingDetailsPayload.domain || getDomain(),
      searchId: hotelPricingDetailsPayload.searchId,
      hotelSearchId: hotelPricingDetailsPayload.hotelSearchId,
      hotelId: hotelPricingDetailsPayload.hotelId,
      priceProvider: hotelPricingDetailsPayload.priceProvider,
      recommendationId: hotelPricingDetailsPayload.recommendationId,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (
    !response.ok ||
    data?.success === false ||
    String(data?.provider_code) === "5102" ||
    String(data?.details?.provider_code) === "5102"
  ) {
    throw createApiError(data, "Hotel pricing details failed");
  }

  return data;
};

export const startHotelBooking = async (startHotelBookingPayload = {}) => {
  const url = new URL("/api/hotel-search/start-booking", normalizeBaseUrl());

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: getHotelSearchHeaders(),
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({
      ...startHotelBookingPayload,
      domain: startHotelBookingPayload.domain || getDomain(),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (
    !response.ok ||
    data?.success === false ||
    String(data?.provider_code) === "5102" ||
    String(data?.details?.provider_code) === "5102"
  ) {
    throw createApiError(data, "Hotel booking failed");
  }

  return data;
};

export const getHotelPaymentGateways = async ({ domain } = {}) => {
  const gatewayDomain = domain || getDomain();
  const cacheKey = String(gatewayDomain || "").trim();
  const cachedRequest = cacheKey ? paymentGatewayRequestCache.get(cacheKey) : null;

  if (
    cachedRequest &&
    Date.now() - cachedRequest.createdAt <= PAYMENT_GATEWAY_CACHE_TTL_MS
  ) {
    return cachedRequest.promise;
  }

  if (cacheKey && cachedRequest) {
    paymentGatewayRequestCache.delete(cacheKey);
  }

  const url = new URL("/api/payment-gateways", normalizeBaseUrl());
  url.searchParams.set("domain", gatewayDomain);

  const requestPromise = (async () => {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getHotelSearchHeaders(),
      credentials: "include",
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw createApiError(data, "Unable to load payment gateways");
    }

    return data;
  })();

  if (cacheKey) {
    paymentGatewayRequestCache.set(cacheKey, {
      createdAt: Date.now(),
      promise: requestPromise,
    });

    requestPromise.catch(() => {
      if (paymentGatewayRequestCache.get(cacheKey)?.promise === requestPromise) {
        paymentGatewayRequestCache.delete(cacheKey);
      }
    });
  }

  return requestPromise;
};

export const HotelPaymentStart = async (payload = {}) => {
  const paymentGateway = String(
    payload.payment_gateway || payload.payment_mode || "",
  )
    .trim()
    .toLowerCase();

  if (!paymentGateway) {
    throw new Error("Payment gateway is required");
  }

  const url = new URL(
    `/api/payment-gateways/${paymentGateway}/pay`,
    normalizeBaseUrl(),
  );

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: getHotelSearchHeaders(),
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({
      ...payload,
      domain: payload.domain || getDomain(),
      payment_gateway: paymentGateway,
      payment_mode: paymentGateway,
    }),
  });

  const data = await response.json().catch(() => ({}));
  console.log("inPaymentResponse",data)

  if (!response.ok) {
    throw createApiError(data, "Hotel booking Payment failed");
  }

  return data;
};

export const refreshHotelSession = async (payload = {}) => {
  const url = new URL("/api/hotel-search/refresh-session", normalizeBaseUrl());

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
    throw createApiError(data, "Hotel session refresh failed");
  }

  return data;
};

export const confirmHotelBooking = async (confirmHotelBookingPayload = {}) => {
  const url = new URL("/api/hotel-search/confirm-booking", normalizeBaseUrl());

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: getHotelSearchHeaders(),
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({
      ...confirmHotelBookingPayload,
      domain: confirmHotelBookingPayload.domain || getDomain(),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw createApiError(data, "Hotel booking confirmation failed");
  }

  return data;
};

export const retrieveHotelBookingDetails = async (request = {}) => {
  const url = new URL("/api/hotel-search/retrieve-booking-details", normalizeBaseUrl());
  const payload =
    typeof request === "string"
      ? { booking_id: request }
      : {
          booking_id:
            request.booking_id ||
            request.bookingId ||
            request.bookingConfirmationId ||
            request.booking?.booking_id ||
            request.booking?.bookingId ||
            request.booking?.id ||
            request.merchantOrderId ||
            "",
          TUI: request.TUI || request.tui || "",
          ReferenceNumber:
            request.ReferenceNumber ||
            request.referenceNumber ||
            request.provider_reference ||
            request.providerReference ||
            request.booking?.provider_reference ||
            request.booking?.providerReference ||
            request.TransactionID ||
            request.transactionId ||
            "",
        };

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: getHotelSearchHeaders(),
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({
      ...payload,
      domain: getDomain(),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw createApiError(data, "Hotel booking details retrieval failed");
  }

  return data;
};

import api from "@/lib/axios";

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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetryRequest = (error) => {
  const status = error?.response?.status;
  const isInvalidTravellerChecklist = error?.code === "INVALID_TRAVELLER_CHECKLIST";

  if (isInvalidTravellerChecklist) {
    return true;
  }

  if (!status) {
    return true;
  }

  return status >= 500;
};

const postWithRetry = async (
  url,
  payload,
  options,
  { retries = 2, retryDelayMs = 800 } = {}
) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await api.post(url, payload, options);
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt === retries;
      if (isLastAttempt || !shouldRetryRequest(error)) {
        throw error;
      }

      await wait(retryDelayMs * (attempt + 1));
    }
  }

  throw lastError;
};

const getTravellerChecklist = (responseData) =>
  responseData?.data?.raw?.TravellerCheckList ||
  responseData?.data?.data?.raw?.TravellerCheckList ||
  responseData?.raw?.TravellerCheckList ||
  responseData?.data?.TravellerCheckList ||
  responseData?.TravellerCheckList;

const hasValidTravellerChecklist = (responseData) =>
  Array.isArray(getTravellerChecklist(responseData));

const normalizeTravellerChecklistResponse = (responseData) => {
  if (!hasValidTravellerChecklist(responseData)) return responseData;
  if (Array.isArray(responseData?.data?.raw?.TravellerCheckList)) return responseData;

  const nestedData = responseData?.data?.data || {};
  const raw = nestedData?.raw || responseData?.raw || {
    TravellerCheckList: getTravellerChecklist(responseData),
  };

  return {
    ...responseData,
    data: {
      ...(responseData?.data || {}),
      ...nestedData,
      raw,
    },
  };
};

const createInvalidTravellerChecklistError = (responseData) => {
  const error = new Error("TravellerCheckList is not an array");

  error.code = "INVALID_TRAVELLER_CHECKLIST";
  error.response = { data: responseData };

  return error;
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
    return `pricing:${crypto.randomUUID()}`;
  }

  return `pricing:${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
    current = next;
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
  payload?.message ||
  payload?.data?.message ||
  "Flight pricing failed. Please try again.";

const isPricingComplete = (payload) => {
  const type = getPayloadType(payload);
  return (
    type.includes("COMPLETE") ||
    type.includes("COMPLETED") ||
    type.includes("RESULT") ||
    type.includes("DONE")
  );
};

const isPricingError = (payload) => {
  const type = getPayloadType(payload);
  return Boolean(payload?.error || payload?.data?.error) ||
    (type.includes("PRICING") && type.includes("ERROR")) ||
    type === "ERROR";
};

const toArray = (value) => (Array.isArray(value) ? value : []);

const hasPricingItems = (payload) => {
  const root = payload?.data || payload || {};
  const containers = [
    root,
    root?.data,
    root?.result,
    root?.pricing,
    root?.fare_options,
    root?.fareOptions,
  ].filter(Boolean);

  return containers.some((container) =>
    [
      container?.fares,
      container?.fare_options,
      container?.fareOptions,
      container?.flights,
      container?.results,
    ].some((value) => Array.isArray(value) && value.length > 0)
  );
};

const readTripOrder = (trip, index) =>
  Number(trip?.Order ?? trip?.OrderID ?? trip?.order ?? trip?.orderId ?? index + 1);

const buildPricingTrip = (trip = {}, index = 0) => ({
  Index: trip?.Index ?? trip?.index ?? trip?.flightIndex,
  Order: Number.isFinite(readTripOrder(trip, index)) ? readTripOrder(trip, index) : index + 1,
});

const buildPricingSearchKeys = (request = {}) => {
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
        ? toArray(item.Trips).map(buildPricingTrip)
        : requestTrips.map(buildPricingTrip),
    }));
  }

  if (!searchKey || !requestTrips.length) return [];

  return [
    {
      search_key: searchKey,
      index: 1,
      Trips: requestTrips.map(buildPricingTrip),
    },
  ];
};

const buildV2PricingPayload = ({ request = {}, channel = makePricingChannel() } = {}) => {
  return {
    channel,
    domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337",
    search_keys: buildPricingSearchKeys(request),
  };
};

const postV2Pricing = async (payload) => {
  const response = await fetch("/api/flights/v2/pricing", {
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
  "FLIGHT_V2_PRICING_ACCEPTED",
  "FLIGHT_V2_PRICING_STARTED",
  "FLIGHT_V2_PRICING_RESULT",
  "FLIGHT_V2_PRICING_COMPLETE",
  "FLIGHT_V2_PRICING_COMPLETED",
  "FLIGHT_V2_PRICING_ERROR",
  "pricing-result",
  "pricing-complete",
  "result",
  "complete",
  "done",
  "error",
];

export const getFlightPrice = async (payload) => {
  const response = await api.post("/api/flights/price", {
    ...payload,
    domain: "localhost:1337",
  }, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response?.data;
};

export const getFlightFareOptions = async ({ request } = {}) => {
  const channel = makePricingChannel();
  const payload = buildV2PricingPayload({ request, channel });

  if (!payload.search_keys.length) {
    throw new Error("Missing pricing payload for the selected flight.");
  }

  if (typeof window === "undefined" || !window.EventSource) {
    const data = await postV2Pricing(payload);
    emitFareExpired(data);
    return data;
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
      emitFareExpired(value);
      callback(value);
    };

    const buildResult = () => ({
      ...(initResponse || {}),
      channel,
      data: {
        ...((initResponse || {})?.data || {}),
        pricingChunks: chunks,
      },
      pricingChunks: chunks,
    });

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

      settle(reject, new Error("Flight pricing timed out. Please try again."));
    }, 45000);

    const handleMessage = (event) => {
      const unwrappedPayload = unwrapPricingPayload(event.data);
      const parsedPayload =
        unwrappedPayload && typeof unwrappedPayload === "object"
          ? {
              ...unwrappedPayload,
              type: unwrappedPayload.type || unwrappedPayload.data?.type || event.type,
            }
          : unwrappedPayload;
      const payloadChannel = getPayloadChannel(parsedPayload);
      const isCurrentChannel = !payloadChannel || payloadChannel === channel;

      if (!isCurrentChannel) return;

      if (isPricingError(parsedPayload)) {
        const error = new Error(getApiMessage(parsedPayload));
        error.status = parsedPayload?.error?.status || parsedPayload?.data?.error?.status;
        settle(reject, error);
        return;
      }

      if (hasPricingItems(parsedPayload) || isPricingComplete(parsedPayload)) {
        chunks.push(parsedPayload);
        scheduleResolve();
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
        if (chunks.length) scheduleResolve();
      });

      try {
        initResponse = await postV2Pricing(payload);
        if (hasPricingItems(initResponse)) {
          chunks.push(initResponse);
          scheduleResolve();
        }
      } catch (error) {
        settle(reject, error);
      }
    };

    startPricing();
  });
};

export const getFlightFareOptionsUntilCached = async (
  { searchParams, request },
  { maxAttempts = 12, delayMs = 700 } = {}
) => {
  let lastResponse = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    lastResponse = await getFlightFareOptions({ searchParams, request });
    if (isFareExpiredResponse(lastResponse)) {
      return lastResponse;
    }

    const cached = Boolean(
      lastResponse?.cached ?? lastResponse?.data?.cached ?? lastResponse?.data?.data?.cached
    );

    if (cached) {
      return lastResponse;
    }

    await wait(delayMs * (attempt + 1));
  }

  return lastResponse;
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

export const getFlightFareRules = async (payload) => {
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

export const getFlightWebSettings = async (payload) => {
  const response = await api.post("/api/flights/web-settings", {
    ...payload,
    provider: normalizeProvider(payload?.provider || payload?.Provider),
    domain: "localhost:1337",
  }, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response?.data;
};

export const getFlightTravelChecklist = async (payload) => {
  const requestPayload = {
    ...payload,
    provider: normalizeProvider(payload?.provider || payload?.Provider),
    domain: "localhost:1337",
  };
  const requestOptions = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  let lastError;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await postWithRetry(
        "/api/flights/travel-check-list",
        requestPayload,
        requestOptions,
        {
          retries: 2,
          retryDelayMs: 1000,
        }
      );

      if (hasValidTravellerChecklist(response?.data)) {
        return normalizeTravellerChecklistResponse(response?.data);
      }

      lastError = createInvalidTravellerChecklistError(response?.data);
    } catch (error) {
      lastError = error;
    }

    const isLastAttempt = attempt === 2;
    if (isLastAttempt || !shouldRetryRequest(lastError)) {
      throw lastError;
    }

    await wait(1000 * (attempt + 1));
  }

  throw lastError;
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

export const getFlightSeatLayout = async (payload) => {
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

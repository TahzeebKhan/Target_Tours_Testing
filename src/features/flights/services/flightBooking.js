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

const isPricingError = (payload) => {
  const type = getPayloadType(payload);
  return Boolean(payload?.error || payload?.data?.error) ||
    (type.includes("FARE_OPTIONS") && type.includes("ERROR")) ||
    (type.includes("PRICING") && type.includes("ERROR")) ||
    type === "ERROR";
};

const isFlightPricingResult = (payload) => {
  const type = getPayloadType(payload);
  return (
    type.includes("PRICING") &&
    (type.includes("COMPLETE") || type.includes("COMPLETED"))
  );
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

const postV2Price = async (payload) => {
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
  "pricing-result",
  "pricing-complete",
  "fare-options-result",
  "fare-options-complete",
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

export const getFlightPrice = async (payload) => {
  const pricingPayload = buildV2PricePayload(payload);
  const channel = pricingPayload.channel;

  if (!pricingPayload.search_keys.length) {
    throw new Error("Missing v2 pricing payload for the selected fare.");
  }

  if (typeof window === "undefined" || !window.EventSource) {
    return postV2Price(pricingPayload);
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    let settled = false;
    let initResponse = null;
    let events = null;

    const cleanup = () => {
      events?.close();
    };

    const settle = (callback, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback(value);
    };

    const getCompletedPricingPayload = () =>
      [...chunks].reverse().find((chunk) => {
        return isFlightPricingResult(chunk);
      }) || null;

    const buildResult = () => {
      const completedPayload = getCompletedPricingPayload();
      const completedData = completedPayload?.data || {};

      return {
        ...(initResponse || {}),
        ...(completedPayload || {}),
        channel,
        data: {
          ...((initResponse || {})?.data || {}),
          ...completedData,
          pricingChunks: chunks,
        },
        pricingChunks: chunks,
      };
    };

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
      if (type.includes("PRICING")) {
        chunks.push(parsedPayload);
      }

      if (isFlightPricingResult(parsedPayload)) {
        settle(resolve, buildResult());
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
        if (chunks.length) settle(resolve, buildResult());
      });

      try {
        await waitForSseConnected(events, channel);
        initResponse = await postV2Price(pricingPayload);
        if (isFlightPricingResult(initResponse)) {
          chunks.push(initResponse);
          settle(resolve, buildResult());
        }
      } catch (error) {
        settle(reject, error);
      }
    };

    startPricing();
  });
};

export const getFlightFareOptions = async ({ request, flight, onFareOptionsEvent } = {}) => {
  const channel = makePricingChannel();
  const payload = buildV2PricingPayload({ request, flight, channel });

  if (!payload.search_keys.length) {
    throw new Error("Missing fare-options payload for the selected flight.");
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

    const mergeFareOptionMaps = (...maps) => {
      const merged = {};

      maps.forEach((map) => {
        if (!map || typeof map !== "object" || Array.isArray(map)) return;

        Object.entries(map).forEach(([flightNo, fares]) => {
          if (!Array.isArray(fares)) return;
          merged[flightNo] = [...(merged[flightNo] || []), ...fares];
        });
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

      settle(reject, new Error("Flight fare options timed out. Please try again."));
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
      const isCurrentChannel =
        !payloadChannel || payloadChannel === channel;

      if (!isCurrentChannel) return;
    
      if (typeof onFareOptionsEvent === "function") {
        onFareOptionsEvent(parsedPayload);
      }
    
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
    
      if (hasItems || isComplete) {
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
        await waitForSseConnected(events, channel);
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

export const getFlightV2Ssr = async (payload) => {
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

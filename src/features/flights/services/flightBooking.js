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

export const getFlightFareOptions = async ({ search_key, flight_no }) => {
  const response = await api.get("/api/flights/fare-options", {
    params: {
      search_key,
      flight_no,
    },
    headers: {
      "Content-Type": "application/json",
    },
  });

  emitFareExpired(response?.data);
  return response?.data;
};

export const getFlightFareOptionsUntilCached = async (
  { search_key, flight_no },
  { maxAttempts = 12, delayMs = 700 } = {}
) => {
  let lastResponse = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    lastResponse = await getFlightFareOptions({ search_key, flight_no });
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

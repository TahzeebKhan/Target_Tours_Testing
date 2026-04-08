import api from "@/lib/axios";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetryRequest = (error) => {
  const status = error?.response?.status;

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

export const getFlightWebSettings = async (payload) => {
  const response = await api.post("/api/flights/web-settings", {
    ...payload,
    domain: "localhost:1337",
  }, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response?.data;
};

export const getFlightTravelChecklist = async (payload) => {
  const response = await postWithRetry(
    "/api/flights/travel-check-list",
    {
      ...payload,
      domain: "localhost:1337",
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
    {
      retries: 2,
      retryDelayMs: 1000,
    }
  );

  return response?.data;
};

export const getFlightSsr = async (payload) => {
  const response = await api.post("/api/flights/ssr", payload, {
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

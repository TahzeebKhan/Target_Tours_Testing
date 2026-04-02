import api from "@/lib/axios";

export const getFlightPrice = async (payload) => {
  const response = await api.post("/api/flights/price", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

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
  const response = await api.post("/api/flights/create-itinerary", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response?.data;
};

export const startFlightPayment = async (payload) => {
  const response = await api.post("/api/flights/start-pay", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response?.data;
};

export const retrieveFlightBooking = async (payload) => {
  const response = await api.post("/api/flights/retrieve-booking", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response?.data;
};

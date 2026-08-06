import api from "@/lib/axios";

let passengerRequest = null;
let passengerCache = null;
let passengerCacheTime = 0;
const PASSENGER_CACHE_MS = 30 * 1000;

export const createPassenger = async (payload) => {
  const response = await api.post("/api/create-passenger", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response?.data;
};

export const getPassengers = async ({ force = false } = {}) => {
  if (!force && passengerCache && Date.now() - passengerCacheTime < PASSENGER_CACHE_MS) {
    return passengerCache;
  }
  if (!force && passengerRequest) return passengerRequest;

  passengerRequest = api.get("/api/passengers").then((response) => {
    passengerCache = response?.data;
    passengerCacheTime = Date.now();
    return passengerCache;
  }).finally(() => {
    passengerRequest = null;
  });

  return passengerRequest;
};

export const deletePassenger = async (passengerId) => {
  const response = await api.delete(
    `/api/passengers/${encodeURIComponent(passengerId)}`,
  );

  passengerCache = null;
  passengerCacheTime = 0;
  return response?.data;
};

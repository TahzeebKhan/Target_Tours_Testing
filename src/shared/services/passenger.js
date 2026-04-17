import api from "@/lib/axios";

export const createPassenger = async (payload) => {
  const response = await api.post("/api/create-passenger", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response?.data;
};

export const getPassengers = async () => {
  const response = await api.get("/api/passengers");

  return response?.data;
};

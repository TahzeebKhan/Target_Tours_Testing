import api from "@/lib/axios";

export const createPackageBooking = async (payload) => {
  const response = await api.post("/api/package-booking", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response?.data;
};

import api from "@/lib/axios";

export const getTourBookingPackage = async (packageId, withFlight) => {
  const params = {
    domain: process.env.NEXT_PUBLIC_DOMAIN,
  };

  if (typeof withFlight === "boolean") {
    params.with_flight = withFlight;
  }

  const response = await api.get(`/api/holiday-packages/${packageId}`, {
    params,
  });

  return response?.data?.data || null;
};

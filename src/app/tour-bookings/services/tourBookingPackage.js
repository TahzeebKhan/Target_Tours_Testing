import api from "@/lib/axios";

export const getTourBookingPackage = async (packageId) => {
  const response = await api.get(`/api/holiday-packages/${packageId}`, {
    params: {
      domain: process.env.NEXT_PUBLIC_DOMAIN,
    },
  });

  return response?.data?.data || null;
};

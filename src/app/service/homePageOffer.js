import api from "@/lib/axios";

export const fetchHomePageOffer = async () => {
  const response = await api.get("api/home-page-offer/company");
  return response.data;
};

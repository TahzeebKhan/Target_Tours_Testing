import api from "@/lib/axios";

export const fetchHomePageOffer = async () => {
  const response = await api.get("api/home-page-offer/company", {
    params: {
      domain: process.env.NEXT_PUBLIC_DOMAIN,
    },
  });

  return response.data?.data;
};

import { useQuery } from "@tanstack/react-query"
import { fetchHomePageOffer } from "@/shared/services/homePageOffer"
const BASE_MEDIA_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export const useHomePageOffer = () => {
  return useQuery({
    queryKey: ["home-page-offer"],
    queryFn: fetchHomePageOffer,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5, // 5 min cache
    select: (data) => {
      return {
        startPrice: data?.start_price,

        backgroundVideo: data?.background_media?.url
          ? `${BASE_MEDIA_URL}${data.background_media.url}`
          : null,

        sliderData: (data?.holiday_packages || []).map((pkg) => {
          const media =
            pkg?.media?.[0]?.package_media?.[0];

          return {
            id: pkg.id,
            title: pkg.title,
            subtitle: pkg.description,
            image: media
              ? `${BASE_MEDIA_URL}${media.url}`
              : "/images/placeholder.jpg",
          };
        }),
      };
    },
  });
};

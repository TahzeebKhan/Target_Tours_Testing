import { useQuery } from "@tanstack/react-query"
import { fetchHomePageOffer } from "@/shared/services/homePageOffer"
const BASE_MEDIA_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const toMediaUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${BASE_MEDIA_URL}${url}`;
};

export const useHomePageOffer = () => {
  return useQuery({
    queryKey: ["home-page-offer"],
    queryFn: fetchHomePageOffer,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5, // 5 min cache
    select: (data) => {
      return {
        startPrice: data?.start_price,

        backgroundVideo: toMediaUrl(data?.background_media?.url),

        sliderData: (data?.holiday_packages || []).map((pkg) => {
          const media =
            pkg?.ro_image ||
            pkg?.hero_image ||
            pkg?.main_image ||
            pkg?.media?.[0]?.package_media?.[0];

          return {
            id: pkg.id,
            title: pkg.title || "N/A",
            city:pkg?.location?.city,
            state:pkg?.location?.state,
            subtitle: pkg.description || "N/A",
            image: toMediaUrl(media?.url) || "/fallback.jpg",
          };
        }),
      };
    },
  });
};

// import api from "@/lib/axios";

import api from "@/lib/axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getTourImage = (item) => {
  if (item?.main_image?.url) {
    return API_BASE_URL + item.main_image.url;
  }

  const media = item?.package_media?.[0]?.package_media?.[0]?.url;
  return media ? API_BASE_URL + media : "/tourList/cardItem1.jpg";
};

const normalizeTour = (item) => ({
  id: item.id,
  image: getTourImage(item),
  title: item.title || "Untitled Package",
  route: item.start_location
    ? `${item.start_location.city} TO ${item.end_location?.city}`
    : "MULTI CITY",
  days:
    item.duration_days && item.duration_nights
      ? `${item.duration_days} DAYS & ${item.duration_nights} NIGHTS`
      : "CUSTOM DURATION",
  meals: "SELECTED MEALS",
  hotel: item.is_premium_package ? "PREMIUM HOTEL" : "HOTEL INCLUDED",
  activities: `${item.package_itinerarie?.length || 0} ACTIVITIES`,
  price: item.started_price
    ? `₹ ${item.started_price.toLocaleString()}`
    : "ON REQUEST",
  raw: item,
});

export const fetchTours = async ({pageParam = 1, queryKey }) => {
  const [_key, { filters, page }] = queryKey;

  const params = {
    page:pageParam,
    perPage: 10,
    domain: "localhost:1337",
    ...filters,
  };

  Object.keys(params).forEach(
    (k) => (params[k] === undefined || params[k] === "") && delete params[k]
  );

  const res = await api.get("api/holiday-packages/company", { params });

  return {
    data: (res.data?.data || []).map(normalizeTour),
    meta: res.data?.meta || null,
  };
};

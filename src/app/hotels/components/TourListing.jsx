"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./TourListing.module.css";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import SearchResults from "../components/searchResult/SearchResults";
import CreateWishlistModal from "@/shared/components/wishlistModals/CreateWishlistModal";
import SaveToWishlistModal from "@/shared/components/wishlistModals/SaveToWishlistModal";
import {
  HOTEL_DETAILS_KEY,
  HOTEL_SEARCH_SESSION_KEY,
  HOTEL_SEARCH_RESULTS_EVENT,
  HOTEL_SEARCH_RESULTS_KEY,
  fetchHotelDetails,
  fetchHotelFilterData,
  isMissingHotelAuthTokenError,
} from "@/shared/services/hotelSearch";
import LoginPopup from "@/app/account/loginPopUp/LoginPopup";
import SignupPopup from "@/app/account/signUpPopUp/SignupPopup";
import { useHotelsContext } from "../context/HotelsContext";

const parseSocketValue = (value) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export const getMessageData = (payload = {}) => {
  const parsedPayload = parseSocketValue(payload);
  const data = parseSocketValue(parsedPayload?.data);

  return data || parsedPayload;
};

export const getMessageContent = (payload = {}) => {
  const data = getMessageData(payload);
  const content = parseSocketValue(data?.content || data?.data?.content);

  return content || data;
};

const HOTEL_ARRAY_KEYS = new Set([
  "mergedHotels",
  "curatedHotels",
  "hotels",
  "hotelResults",
  "hotel_results",
  "results",
  "items",
  "data",
]);

const getHotelArraySource = (key = "") => {
  if (key === "mergedHotels") return "merged";
  if (key === "curatedHotels") return "curated";
  return "hotels";
};

const getHotelDisplayName = (hotel = {}) =>
  String(hotel.name || hotel.hotelName || hotel.title || "").trim();

const isRenderableHotel = (hotel = {}) => {
  const displayName = getHotelDisplayName(hotel);

  return Boolean(displayName && displayName.toLowerCase() !== "hotel");
};

const sanitizeHotelResult = (source = "", hotels = []) => ({
  source,
  hotels: Array.isArray(hotels) ? hotels.filter(isRenderableHotel) : [],
});

const isHotelArray = (value) =>
  Array.isArray(value) && value.some((item) => isRenderableHotel(item));

const findHotelArrays = (value, depth = 0, visited = new Set()) => {
  const parsedValue = parseSocketValue(value);

  if (!parsedValue || depth > 7 || typeof parsedValue !== "object") {
    return [];
  }

  if (visited.has(parsedValue)) return [];
  visited.add(parsedValue);

  if (isHotelArray(parsedValue)) {
    return [sanitizeHotelResult("hotels", parsedValue)];
  }

  if (Array.isArray(parsedValue)) {
    return parsedValue.flatMap((item) =>
      findHotelArrays(item, depth + 1, visited),
    );
  }

  const directMatches = Object.entries(parsedValue).flatMap(([key, item]) => {
    const parsedItem = parseSocketValue(item);

    if (HOTEL_ARRAY_KEYS.has(key) && isHotelArray(parsedItem)) {
      return [sanitizeHotelResult(getHotelArraySource(key), parsedItem)];
    }

    return [];
  });

  if (directMatches.length) return directMatches;

  return Object.values(parsedValue).flatMap((item) =>
    findHotelArrays(item, depth + 1, visited),
  );
};

const pickBestHotelResult = (results = []) => {
  const merged = results.find((result) => result.source === "merged");
  if (merged) return merged;

  const curated = results.find((result) => result.source === "curated");
  if (curated) return curated;

  return results[0] || { source: "", hotels: [] };
};

const getHotelSearchMeta = (...sources) => {
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;

    const candidates = [
      source,
      source.init,
      source.data?.init,
      source.content?.init,
      source.data?.content?.init,
    ].filter(Boolean);
    const findMetaValue = (...keys) => {
      for (const item of candidates) {
        for (const key of keys) {
          if (item?.[key]) return item[key];
        }
      }

      return "";
    };
    const searchId = findMetaValue("searchId", "search_id");
    const hotelSearchId =
      findMetaValue(
        "hotelSearchId",
        "hotel_search_id",
        "HotelSearchId",
        "hotelSearchID",
        "hotel_search_key",
        "hotelSearchKey",
      );
    const requestId = findMetaValue("requestId", "request_id");
    const hotelSearchKey = findMetaValue("hotel_search_key", "hotelSearchKey");

    if (searchId || hotelSearchId || requestId || hotelSearchKey) {
      return { searchId, hotelSearchId, requestId, hotelSearchKey };
    }
  }

  return {};
};

const HOTEL_RESULT_SOURCE_PRIORITY = {
  merged: 3,
  curated: 2,
  hotels: 1,
};

export const shouldApplyHotelResults = (currentSource = "", nextSource = "") =>
  (HOTEL_RESULT_SOURCE_PRIORITY[nextSource] || 0) >=
  (HOTEL_RESULT_SOURCE_PRIORITY[currentSource] || 0);

export const getHotelsFromMessage = (payload = {}) => {
  const data = getMessageData(payload);
  const content = getMessageContent(payload);
  const nestedData = parseSocketValue(data?.data);
  const nestedDataContent = parseSocketValue(nestedData?.content);
  const nestedContent = parseSocketValue(content?.content || content?.data?.content);
  const mergedHotels =
    data?.mergedHotels ||
    content?.mergedHotels ||
    data?.hotels?.mergedHotels ||
    content?.hotels?.mergedHotels ||
    nestedData?.mergedHotels ||
    nestedDataContent?.mergedHotels ||
    nestedContent?.mergedHotels;
  const curatedHotels =
    content?.curatedHotels ||
    data?.curatedHotels ||
    data?.hotels?.curatedHotels ||
    content?.hotels?.curatedHotels ||
    nestedData?.curatedHotels ||
    nestedDataContent?.curatedHotels ||
    nestedContent?.curatedHotels;

  const meta = getHotelSearchMeta(
    content,
    data,
    nestedData,
    nestedDataContent,
    nestedContent,
    payload,
  );

  if (Array.isArray(mergedHotels) && mergedHotels.length) {
    const result = sanitizeHotelResult("merged", mergedHotels);
    result.meta = meta;
    if (result.hotels.length) return result;
  }

  if (Array.isArray(curatedHotels) && curatedHotels.length) {
    const result = sanitizeHotelResult("curated", curatedHotels);
    result.meta = meta;
    if (result.hotels.length) return result;
  }

  if (Array.isArray(data?.hotels) && data.hotels.length) {
    const result = sanitizeHotelResult("hotels", data.hotels);
    result.meta = meta;
    if (result.hotels.length) return result;
  }

  if (Array.isArray(content?.hotels) && content.hotels.length) {
    const result = sanitizeHotelResult("hotels", content.hotels);
    result.meta = meta;
    if (result.hotels.length) return result;
  }

  return pickBestHotelResult(
    findHotelArrays([payload, data, content, nestedData, nestedDataContent, nestedContent]),
  );
};

export const getHotelImage = (hotel = {}) => {
  console.log("hotel",hotel)
  const image =
    hotel.image ||
    hotel.imageUrl ||
    hotel.thumbnail ||
    hotel.heroImage ||
    hotel.mainImage ||
    hotel.images?.[0]?.url ||
    hotel.images?.[0]?.imageUrl ||
    hotel.images?.[0];

  return typeof image === "string" && image ? image : "/images/hotelImg.jpg";
};

const findPriceValue = (value, depth = 0, visitedCount = { current: 0 }) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" || typeof value === "string") return value;
  if (depth > 4 || typeof value !== "object" || visitedCount.current > 80) {
    return null;
  }

  visitedCount.current += 1;

  const priceKeys = [
    "total",
    "totalRate",
    "finalRate",
    "netRate",
    "amount",
    "price",
    "minRate",
    "baseRate",
    "publishedRate",
    "sellingRate",
    "roomRate",
    "rate",
  ];

  if (Array.isArray(value)) {
    for (const nestedValue of value.slice(0, 5)) {
      const price = findPriceValue(nestedValue, depth + 1, visitedCount);
      if (price !== null) return price;
    }

    return null;
  }

  for (const key of priceKeys) {
    const nestedValue = findPriceValue(value[key], depth + 1, visitedCount);
    if (nestedValue !== null) return nestedValue;
  }

  for (const nestedValue of Object.values(value).slice(0, 20)) {
    const price = findPriceValue(nestedValue, depth + 1, visitedCount);
    if (price !== null) return price;
  }

  return null;
};

export const formatHotelPrice = (hotel = {}) => {
  const price = [
    hotel.price,
    hotel.amount,
    hotel.minRate,
    hotel.totalRate,
    hotel.baseRate,
    hotel.rate,
    hotel.pricing,
    hotel.rates,
    hotel.rooms,
  ].reduce((foundPrice, candidate) => {
    if (foundPrice !== null) return foundPrice;
    return findPriceValue(candidate);
  }, null);

  if (price === null || price === undefined || price === "") return "₹ --";

  const numericPrice = Number(price);
  if (!Number.isNaN(numericPrice)) {
    return `₹ ${numericPrice.toLocaleString("en-IN")}`;
  }

  return String(price).startsWith("₹") ? String(price) : `₹ ${price}`;
};

export const getHotelRating = (hotel = {}) => {
  const rating = Number(hotel.starRating || hotel.rating || hotel.stars || 5);
  if (!Number.isFinite(rating)) return 5;
  return Math.max(0, Math.min(5, Math.round(rating)));
};

export const getHotelCoordinates = (hotel = {}) => {
  const coordinates =
    hotel.coordinates ||
    hotel.geoCode ||
    hotel.geo_code ||
    hotel.location?.coordinates ||
    hotel.location?.geoCode ||
    {};
  const lat =
    coordinates.lat ??
    coordinates.latitude ??
    hotel.lat ??
    hotel.latitude ??
    hotel.geoLat;
  const lng =
    coordinates.lng ??
    coordinates.long ??
    coordinates.longitude ??
    hotel.lng ??
    hotel.long ??
    hotel.longitude ??
    hotel.geoLong;
  const latitude = Number(lat);
  const longitude = Number(lng);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
};

const pickProviderValue = (value) => {
  if (!value) return "";

  const normalizeProvider = (provider) => {
    const normalizedProvider = String(provider || "").trim();
    return /^\d+$/.test(normalizedProvider) ? "" : normalizedProvider;
  };

  if (typeof value === "string" || typeof value === "number") {
    return normalizeProvider(value);
  }

  if (typeof value !== "object") return "";

  return normalizeProvider(
    value.priceProvider ||
      value.price_provider ||
      value.priceProviderCode ||
      value.price_provider_code ||
      value.providerName ||
      value.provider_name ||
      value.supplierName ||
      value.supplier_name ||
      value.provider ||
      value.supplier ||
      value.name ||
      value.code ||
      "",
  ).trim();
};

export const getHotelPriceProvider = (hotel = {}) => {
  const directProvider = pickProviderValue(hotel.priceProvider) ||
    pickProviderValue(hotel.price_provider) ||
    pickProviderValue(hotel.providerName) ||
    pickProviderValue(hotel.provider_name) ||
    pickProviderValue(hotel.supplierName) ||
    pickProviderValue(hotel.supplier_name) ||
    pickProviderValue(hotel.priceProviderCode) ||
    pickProviderValue(hotel.price_provider_code) ||
    pickProviderValue(hotel.provider) ||
    pickProviderValue(hotel.supplier) ||
    pickProviderValue(hotel.rate?.priceProvider) ||
    pickProviderValue(hotel.rate?.price_provider) ||
    pickProviderValue(hotel.rate?.providerName) ||
    pickProviderValue(hotel.rate?.provider_name) ||
    pickProviderValue(hotel.rate?.provider) ||
    pickProviderValue(hotel.pricing?.priceProvider) ||
    pickProviderValue(hotel.pricing?.providerName) ||
    pickProviderValue(hotel.pricing?.provider);

  if (directProvider) return directProvider;

  const providerLists = [
    hotel.availableSuppliers,
    hotel.suppliers,
    hotel.providers,
    hotel.rates,
    hotel.rooms,
  ];

  for (const list of providerLists) {
    if (!Array.isArray(list)) continue;

    for (const item of list) {
      const provider = pickProviderValue(item);
      if (provider) return provider;
    }
  }

  return "";
};

export const getHotelDetailsPayload = (hotel = {}) => ({
  searchId: String(
    hotel.searchId ||
      hotel.search_id ||
      hotel.raw?.searchId ||
      hotel.raw?.search_id ||
      "",
  ).trim(),
  hotelSearchId: String(
    hotel.hotelSearchId ||
      hotel.hotel_search_id ||
      hotel.HotelSearchId ||
      hotel.hotelSearchID ||
      hotel.raw?.hotelSearchId ||
      hotel.raw?.hotel_search_id ||
      hotel.raw?.HotelSearchId ||
      hotel.raw?.hotelSearchID ||
      "",
  ).trim(),
  hotelId: String(
    hotel.hotelId ||
      hotel.id ||
      hotel.hotelCode ||
      hotel.code ||
      hotel.api_hotel_id ||
      hotel.raw?.hotelId ||
      hotel.raw?.id ||
      hotel.raw?.hotelCode ||
      hotel.raw?.code ||
      hotel.raw?.api_hotel_id ||
      "",
  ).trim(),
  priceProvider: getHotelPriceProvider(hotel) || getHotelPriceProvider(hotel.raw),
});

export const normalizeHotelCard = (hotel = {}, index = 0) => {
  const addressParts = [
    hotel.address,
    hotel.addressLine1,
    hotel.locality,
    hotel.city,
    hotel.locationName,
    hotel.country,
  ]
    .filter(Boolean)
    .map((part) => String(part).trim());

  const coordinates = getHotelCoordinates(hotel);
  const price = formatHotelPrice(hotel);
  const hasPrice = /\d/.test(price);
  const hotelId =
    hotel.id || hotel.hotelId || hotel.api_hotel_id || hotel.hotelCode;
  const priceProvider = getHotelPriceProvider(hotel);

  return {
    id:
      hotelId ||
      `${hotel.name || "hotel"}-${index}`,
    hotelId: hotelId ? String(hotelId) : "",
    searchId: hotel.searchId || hotel.search_id || "",
    hotelSearchId:
      hotel.hotelSearchId ||
      hotel.hotel_search_id ||
      hotel.HotelSearchId ||
      hotel.hotelSearchID ||
      "",
    priceProvider: priceProvider ? String(priceProvider) : "",
    image: getHotelImage(hotel),
    route: addressParts.join(", ") || "Address not available",
    title: hotel.name || hotel.hotelName || hotel.title || "Hotel",
    price,
    hasPrice,
    facilities: normalizeHotelFacilities(hotel),
    benefits: normalizeHotelBenefits(hotel),
    rating: getHotelRating(hotel),
    latitude: coordinates?.latitude,
    longitude: coordinates?.longitude,
    raw: hotel,
  };
};

const HOTEL_TERMINAL_MESSAGE_TYPES = new Set([
  "HOTEL_INIT_COMPLETE",
  "HOTEL_STREAM_FAILED",
  "HOTEL_INIT_ERROR",
  "HOTEL_MERGED_RESPONSE",
]);

export const isHotelTerminalPayload = (payload = {}) => {
  const data = getMessageData(payload);
  const type = payload?.type || data?.type;
  const status = data?.status || getMessageContent(payload)?.status;

  return (
    HOTEL_TERMINAL_MESSAGE_TYPES.has(type) ||
    status === "completed" ||
    status === "failed"
  );
};

const skeletonCards = Array.from({ length: 6 }, (_, index) => index);
const FIRST_HOTEL_RENDER_BATCH_SIZE = 40;
const HOTEL_RENDER_BATCH_SIZE = 300;
const LIST_ROW_HEIGHT = 310;
const GRID_ROW_HEIGHT = 650;
const VIRTUAL_OVERSCAN_ROWS = 5;
const INITIAL_VIRTUAL_ITEM_COUNT = 24;

const STATIC_HOTEL_RESULTS = [
  {
    id: "static-grand-alpine",
    name: "Grand Alpine Retreat",
    address: "12 Lakeview Road",
    city: "Banff",
    country: "Canada",
    image: "/hotelList/hotelCardImg.png",
    price: 66945,
    rating: 5,
    facilities: ["Air conditioning", "Wifi", "Kitchen", "Pool", "Mixer"],
    freeCancellation: true,
    freeBreakfast: true,
    propertyType: "Hotel",
  },
  {
    id: "static-mountain-hideaway",
    name: "Mountain Hideaway Inn",
    address: "456 Summit Road",
    city: "Canmore",
    country: "Canada",
    image: "/hotelList/nextTrip1.png",
    price: 55300,
    rating: 4,
    facilities: ["Air conditioning", "Wifi", "Kitchen", "Pool", "Mixer"],
    freeCancellation: true,
    propertyType: "Resort",
  },
  {
    id: "static-sunny-coast",
    name: "Sunny Coast Resort",
    address: "123 Ocean Drive",
    city: "Vancouver",
    country: "Canada",
    image: "/hotelList/nextTrip2.png",
    price: 85500,
    rating: 4,
    facilities: ["Air conditioning", "Wifi", "Kitchen", "Pool", "Mixer"],
    freeBreakfast: true,
    propertyType: "Resort",
  },
];

export const getHotelDetailUrl = ({
  hotelId,
  searchId,
  hotelSearchId,
  priceProvider,
  checkIn,
  checkOut,
}) => {
  const params = new URLSearchParams();
  params.set("hotelId", hotelId || "");
  params.set("searchId", searchId || "");
  if (hotelSearchId) params.set("hotelSearchId", hotelSearchId);
  params.set("priceProvider", priceProvider || "");
  if (checkIn) params.set("checkIn", checkIn);
  if (checkOut) params.set("checkOut", checkOut);

  return `/hotel-detail?${params.toString()}`;
};

const getHotelPriceNumber = (hotel = {}) => {
  const priceText = String(hotel.price || "").replace(/[^\d.]/g, "");
  if (!priceText) return null;

  const price = Number(priceText);

  return Number.isFinite(price) ? price : null;
};

const emptyHotelFilterCounts = () => ({
  price: { min: 0, max: 25000 },
  suggested: {},
  priceBuckets: {},
  starCategory: {},
  guestRating: {},
  propertyType: {},
  roomViews: {},
  roomAmenities: {},
  hotelAmenities: {},
  houseRules: {},
  flexibleCheckIn: {},
  hotelChains: {},
});

const incrementCount = (target, group, key) => {
  if (!key) return;
  target[group][key] = (target[group][key] || 0) + 1;
};

const hasText = (hotel, ...needles) => {
  const normalizeText = (value) => String(value || "").toLowerCase();
  const raw = hotel.raw || {};
  const rawFacilities = Array.isArray(raw.facilities)
    ? raw.facilities
    : Array.isArray(raw.amenities)
      ? raw.amenities
      : [];
  const rawFacilityText = rawFacilities
    .map((facility) =>
      typeof facility === "string"
        ? facility
        : facility?.name ||
          facility?.facilityName ||
          facility?.label ||
          facility?.description ||
          "",
    )
    .filter(Boolean);
  const text = [
    hotel.title,
    hotel.route,
    hotel.raw?.propertyType,
    hotel.raw?.type,
    hotel.raw?.chainName,
    hotel.raw?.brandName,
    hotel.raw?.hotelChain,
    hotel.raw?.chain,
    hotel.raw?.name,
    hotel.raw?.hotelName,
    hotel.raw?.address,
    hotel.raw?.city,
    hotel.raw?.locality,
    ...rawFacilityText,
    ...(hotel.facilities || []).map((facility) => facility.name),
    ...(hotel.benefits || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return needles.some((needle) => text.includes(normalizeText(needle)));
};

const buildHotelFilterCounts = (hotels = []) => {
  const counts = emptyHotelFilterCounts();
  const prices = hotels
    .map(getHotelPriceNumber)
    .filter((price) => Number.isFinite(price));

  if (prices.length) {
    counts.price = {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  hotels.forEach((hotel) => {
    const rating = Number(hotel.rating || 0);
    const price = getHotelPriceNumber(hotel);

    if (rating >= 5) {
      incrementCount(counts, "suggested", "fiveStar");
      incrementCount(counts, "starCategory", "5");
    } else if (rating >= 4) {
      incrementCount(counts, "suggested", "fourStar");
      incrementCount(counts, "starCategory", "4");
    } else if (rating >= 3) {
      incrementCount(counts, "starCategory", "3");
    }

    if (rating >= 4.8) incrementCount(counts, "guestRating", "4.8");
    if (rating >= 4.7) incrementCount(counts, "guestRating", "4.7");
    if (rating >= 4.2) incrementCount(counts, "guestRating", "4.2");
    if (rating >= 3.5) incrementCount(counts, "guestRating", "3.5");
    if (rating >= 3) incrementCount(counts, "guestRating", "3");

    if (price !== null) {
      if (price < 2500) incrementCount(counts, "priceBuckets", "0-2500");
      else if (price < 4500) incrementCount(counts, "priceBuckets", "2500-4500");
      else if (price < 7000) incrementCount(counts, "priceBuckets", "4500-7000");
      else if (price < 11000) incrementCount(counts, "priceBuckets", "7000-11000");
      else if (price < 17000) incrementCount(counts, "priceBuckets", "11000-17000");
      else incrementCount(counts, "priceBuckets", "17000+");
    }

    if (hasText(hotel, "breakfast")) incrementCount(counts, "suggested", "breakfastIncluded");
    if (hasText(hotel, "deal", "discount")) incrementCount(counts, "suggested", "lastMinuteDeals");
    if (hasText(hotel, "reward")) incrementCount(counts, "suggested", "oneClickRewards");

    if (hasText(hotel, "homestay")) incrementCount(counts, "propertyType", "homestay");
    else if (hasText(hotel, "villa")) incrementCount(counts, "propertyType", "villa");
    else if (hasText(hotel, "cottage")) incrementCount(counts, "propertyType", "cottage");
    else if (hasText(hotel, "resort")) incrementCount(counts, "propertyType", "resort");
    else if (hasText(hotel, "apartment")) incrementCount(counts, "propertyType", "apartment");
    else if (hasText(hotel, "hostel")) incrementCount(counts, "propertyType", "hostel");
    else if (hasText(hotel, "guest house")) incrementCount(counts, "propertyType", "guestHouse");
    else incrementCount(counts, "propertyType", "hotel");

    if (hasText(hotel, "garden")) incrementCount(counts, "roomViews", "garden");
    if (hasText(hotel, "mountain")) incrementCount(counts, "roomViews", "mountain");
    if (hasText(hotel, "valley")) incrementCount(counts, "roomViews", "valley");
    if (hasText(hotel, "lake")) incrementCount(counts, "roomViews", "lake");
    if (hasText(hotel, "city")) incrementCount(counts, "roomViews", "city");
    if (hasText(hotel, "forest")) incrementCount(counts, "roomViews", "forest");

    if (hasText(hotel, "balcony")) incrementCount(counts, "roomAmenities", "balcony");
    if (hasText(hotel, "bathtub")) incrementCount(counts, "roomAmenities", "bathtub");
    if (hasText(hotel, "fireplace")) incrementCount(counts, "roomAmenities", "fireplace");
    if (hasText(hotel, "kitchenette", "kitchen")) incrementCount(counts, "roomAmenities", "kitchenette");
    if (hasText(hotel, "coffee")) incrementCount(counts, "roomAmenities", "coffeeMachine");
    if (hasText(hotel, "room service")) incrementCount(counts, "roomAmenities", "roomService");
    if (hasText(hotel, "private pool")) incrementCount(counts, "roomAmenities", "privatePool");
    if (hasText(hotel, "jacuzzi")) incrementCount(counts, "roomAmenities", "jacuzzi");
    if (hasText(hotel, "air conditioning")) incrementCount(counts, "roomAmenities", "airConditioning");
    if (hasText(hotel, "mini bar", "minibar")) incrementCount(counts, "roomAmenities", "miniBar");
    if (hasText(hotel, "smart tv")) incrementCount(counts, "roomAmenities", "smartTv");

    if (hasText(hotel, "wi-fi", "wifi", "internet")) incrementCount(counts, "hotelAmenities", "wifi");
    if (hasText(hotel, "pool")) incrementCount(counts, "hotelAmenities", "swimmingPool");
    if (hasText(hotel, "spa")) incrementCount(counts, "hotelAmenities", "spa");
    if (hasText(hotel, "gym", "fitness")) incrementCount(counts, "hotelAmenities", "gym");
    if (hasText(hotel, "restaurant")) incrementCount(counts, "hotelAmenities", "restaurant");
    if (hasText(hotel, "bar")) incrementCount(counts, "hotelAmenities", "bar");
    if (hasText(hotel, "parking")) incrementCount(counts, "hotelAmenities", "parking");
    if (hasText(hotel, "shuttle")) incrementCount(counts, "hotelAmenities", "airportShuttle");
    if (hasText(hotel, "pet")) incrementCount(counts, "hotelAmenities", "petFriendly");
    if (hasText(hotel, "business")) incrementCount(counts, "hotelAmenities", "businessCentre");
    if (hasText(hotel, "laundry")) incrementCount(counts, "hotelAmenities", "laundry");

    if (hasText(hotel, "marriott")) incrementCount(counts, "hotelChains", "marriott");
    if (hasText(hotel, "hilton")) incrementCount(counts, "hotelChains", "hilton");
    if (hasText(hotel, "ihg")) incrementCount(counts, "hotelChains", "ihg");
    if (hasText(hotel, "hyatt")) incrementCount(counts, "hotelChains", "hyatt");
    if (hasText(hotel, "radisson")) incrementCount(counts, "hotelChains", "radisson");
    if (hasText(hotel, "accor")) incrementCount(counts, "hotelChains", "accor");
    if (hasText(hotel, "taj")) incrementCount(counts, "hotelChains", "taj");
  });

  return counts;
};

const hasSelectedValues = (group = {}) =>
  Object.values(group || {}).some(Boolean);

const selectedKeys = (group = {}) =>
  Object.entries(group || {})
    .filter(([, isSelected]) => isSelected)
    .map(([key]) => key);

const PRICE_FILTER_BUCKETS = {
  "0-2500": [0, 2500],
  "2500-4500": [2500, 4500],
  "4500-7000": [4500, 7000],
  "7000-11000": [7000, 11000],
  "11000-17000": [11000, 17000],
  "17000+": [17000, Infinity],
};

const getPriceFilterRange = (key) => {
  if (PRICE_FILTER_BUCKETS[key]) return PRICE_FILTER_BUCKETS[key];

  const value = String(key || "").trim();
  const plusMatch = value.match(/^(\d+(?:\.\d+)?)\+$/);
  if (plusMatch) return [Number(plusMatch[1]), Infinity];

  const rangeMatch = value.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
  if (rangeMatch) return [Number(rangeMatch[1]), Number(rangeMatch[2])];

  return [];
};

const TEXT_FILTER_NEEDLES = {
  suggested: {
    lastMinuteDeals: ["deal", "discount"],
    breakfastIncluded: ["breakfast"],
    oneClickRewards: ["reward"],
  },
  propertyType: {
    hotel: ["hotel"],
    homestay: ["homestay"],
    villa: ["villa"],
    cottage: ["cottage"],
    resort: ["resort"],
    apartment: ["apartment"],
    hostel: ["hostel"],
    guestHouse: ["guest house"],
    servicedApartment: ["serviced apartment"],
    vacationHome: ["vacation home"],
  },
  roomViews: {
    garden: ["garden"],
    mountain: ["mountain"],
    valley: ["valley"],
    lake: ["lake"],
    city: ["city"],
    forest: ["forest"],
  },
  roomAmenities: {
    balcony: ["balcony"],
    bathtub: ["bathtub"],
    fireplace: ["fireplace"],
    kitchenette: ["kitchenette", "kitchen"],
    coffeeMachine: ["coffee"],
    roomService: ["room service"],
    privatePool: ["private pool"],
    jacuzzi: ["jacuzzi"],
    airConditioning: ["air conditioning"],
    miniBar: ["mini bar", "minibar"],
    smartTv: ["smart tv"],
  },
  hotelAmenities: {
    wifi: ["wi-fi", "wifi", "internet"],
    swimmingPool: ["pool"],
    spa: ["spa"],
    gym: ["gym", "fitness"],
    restaurant: ["restaurant"],
    bar: ["bar"],
    kidsPlayArea: ["kids", "play area"],
    parking: ["parking"],
    airportShuttle: ["shuttle"],
    petFriendly: ["pet"],
    businessCentre: ["business"],
    evCharging: ["electric vehicle", "ev charging"],
    laundry: ["laundry"],
    roomService: ["room service"],
  },
  houseRules: {
    unmarriedCouples: ["unmarried"],
    familyFriendly: ["family"],
    alcoholAllowed: ["alcohol"],
    smokingAllowed: ["smoking"],
    petsAllowed: ["pet"],
    selfCheckIn: ["self check"],
    maleGroups: ["male group"],
    coupleFriendly: ["couple"],
  },
  flexibleCheckIn: {
    earlyCheckIn: ["early check"],
    lateCheckOut: ["late check"],
    twentyFourHour: ["24-hour", "24 hour"],
  },
  hotelChains: {
    marriott: ["marriott"],
    hilton: ["hilton"],
    ihg: ["ihg"],
    hyatt: ["hyatt"],
    radisson: ["radisson"],
    accor: ["accor"],
    taj: ["taj"],
  },
  attractions: {},
};

const matchesAnyTextFilter = (hotel, group, keys) =>
  keys.some((key) => {
    if (group === "suggested" && ["fiveStar", "fourStar"].includes(key)) {
      return true;
    }

    const needles = TEXT_FILTER_NEEDLES[group]?.[key] || [key];
    return hasText(hotel, ...needles);
  });

const matchesHotelFilters = (hotel, filters = {}) => {
  const price = getHotelPriceNumber(hotel);
  const rating = Number(hotel.rating || 0);

  if (
    filters.budget &&
    price !== null &&
    (price < Number(filters.budget.min || 0) ||
      price > Number(filters.budget.max || Infinity))
  ) {
    return false;
  }

  if (hasSelectedValues(filters.price)) {
    const matchesPrice = selectedKeys(filters.price).some((key) => {
      const [min, max] = getPriceFilterRange(key);
      return price !== null && price >= min && price < max;
    });
    if (!matchesPrice) return false;
  }

  if (hasSelectedValues(filters.starCategory)) {
    const matchesStar = selectedKeys(filters.starCategory).some(
      (key) => Math.round(rating) === Number(key),
    );
    if (!matchesStar) return false;
  }

  if (hasSelectedValues(filters.guestRating)) {
    const matchesGuestRating = selectedKeys(filters.guestRating).some(
      (key) => rating >= Number(key),
    );
    if (!matchesGuestRating) return false;
  }

  if (filters.suggested?.fiveStar && Math.round(rating) !== 5) return false;
  if (filters.suggested?.fourStar && Math.round(rating) !== 4) return false;

  return Object.keys(TEXT_FILTER_NEEDLES).every((group) => {
    if (!hasSelectedValues(filters[group])) return true;
    return matchesAnyTextFilter(hotel, group, selectedKeys(filters[group]));
  });
};

const getFacilityIcon = (name = "") => {
  const normalizedName = name.toLowerCase();

  if (
    normalizedName.includes("air") ||
    normalizedName.includes("conditioning")
  ) {
    return "/icons/AirConditioning.svg";
  }

  if (
    normalizedName.includes("wifi") ||
    normalizedName.includes("internet")
  ) {
    return "/icons/Wifi.svg";
  }

  if (
    normalizedName.includes("kitchen") ||
    normalizedName.includes("restaurant") ||
    normalizedName.includes("food") ||
    normalizedName.includes("drink") ||
    normalizedName.includes("breakfast")
  ) {
    return "/icons/Kitchen.svg";
  }

  if (
    normalizedName.includes("pool") ||
    normalizedName.includes("swimming") ||
    normalizedName.includes("spa")
  ) {
    return "/icons/Pool.svg";
  }

  if (
    normalizedName.includes("parking") ||
    normalizedName.includes("elevator") ||
    normalizedName.includes("laundry") ||
    normalizedName.includes("terrace") ||
    normalizedName.includes("accessible") ||
    normalizedName.includes("convenience")
  ) {
    return "/icons/pool.svg";
  }

  return "/icons/pool.svg";
};

const normalizeHotelFacilities = (hotel = {}) => {
  const rawFacilities = Array.isArray(hotel.facilities)
    ? hotel.facilities
    : Array.isArray(hotel.amenities)
      ? hotel.amenities
      : [];

  const facilities = rawFacilities
    .map((facility) => {
      const name =
        typeof facility === "string"
          ? facility
          : facility?.name || facility?.facilityName || facility?.label || "";

      return String(name).trim();
    })
    .filter(Boolean);

  const uniqueFacilities = [...new Set(facilities)];

  return uniqueFacilities.slice(0, 5).map((name) => ({
    name,
    icon: getFacilityIcon(name),
  }));
};

const HotelFacilities = ({ facilities = [] }) => {
  const visibleFacilities = facilities.length
    ? facilities
    : [
        { name: "Air conditioning", icon: "/icons/AirConditioning.svg" },
        { name: "Wifi", icon: "/icons/Wifi.svg" },
        { name: "Kitchen", icon: "/icons/Kitchen.svg" },
        { name: "Pool", icon: "/icons/Pool.svg" },
        { name: "Mixer", icon: "/icons/pool.svg" },
      ];

  return (
    <div className={styles.featuresCont}>
      {visibleFacilities.map((facility, index) => (
        <div className={styles.featureItem} key={`${facility.name}-${index}`}>
          <img src={facility.icon} alt="" />
          <p>{facility.name}</p>
          {index < visibleFacilities.length - 1 && <span>•</span>}
        </div>
      ))}
    </div>
  );
};

const getSearchLocationLabel = (searchParams) => {
  const rawLocation =
    searchParams.get("city") ||
    searchParams.get("location") ||
    searchParams.get("destination") ||
    searchParams.get("whereTo") ||
    "";

  return rawLocation
    ? rawLocation.replace(/\+/g, " ").replace(/\s+/g, " ").trim()
    : "this location";
};

const EmptyHotelState = ({ locationLabel }) => (
  <div className={styles.emptyState}>
    <img
      className={styles.emptyStateImage}
      src="/images/CouldntFind.svg"
      alt="No hotels found"
    />
    <div className={styles.emptyStateText}>
      <h3>No hotels found for {locationLabel || "this location"}</h3>
      <p>
        We could not find stays for this search. Try a nearby area, different
        dates, or update your rooms and guests.
      </p>
    </div>
  </div>
);

const normalizeHotelBenefits = (hotel = {}) => {
  const benefits = [];

  if (hotel.freeCancellation === true || hotel.isRefundable === true) {
    benefits.push("Free Cancellation");
  }

  if (hotel.freeBreakfast === true) {
    benefits.push("Free Breakfast");
  }

  return benefits;
};

export const HotelBenefits = ({ benefits = [], classes = styles }) => {
  if (!benefits.length) return null;

  return (
    <ul className={classes.freeList}>
      {benefits.map((benefit) => (
        <li key={benefit}>
          <div className={classes.tickCont}>
            <img src="/icons/checkIcon.svg" alt="" />
          </div>
          {benefit}
        </li>
      ))}
    </ul>
  );
};

const sortHotels = (hotels = [], sortType = "recent") => {
  if (sortType === "low_to_high") {
    return [...hotels].sort((left, right) => {
      const leftPrice = getHotelPriceNumber(left);
      const rightPrice = getHotelPriceNumber(right);

      if (leftPrice === null) return 1;
      if (rightPrice === null) return -1;
      return leftPrice - rightPrice;
    });
  }

  if (sortType === "high_to_low") {
    return [...hotels].sort((left, right) => {
      const leftPrice = getHotelPriceNumber(left);
      const rightPrice = getHotelPriceNumber(right);

      if (leftPrice === null) return 1;
      if (rightPrice === null) return -1;
      return rightPrice - leftPrice;
    });
  }

  if (sortType === "popular") {
    return [...hotels].sort((left, right) => right.rating - left.rating);
  }

  return hotels;
};

export const getStaySummary = (searchParams) => {
  const checkIn = searchParams.get("checkIn") || searchParams.get("checkin");
  const checkOut = searchParams.get("checkOut") || searchParams.get("checkout");
  const adults = Number(searchParams.get("adults") || 0);
  const children = Number(searchParams.get("children") || 0);
  const rooms = Number(searchParams.get("rooms") || 0);
  const checkInDate = checkIn ? new Date(checkIn) : null;
  const checkOutDate = checkOut ? new Date(checkOut) : null;
  const nights =
    checkInDate &&
    checkOutDate &&
    Number.isFinite(checkInDate.getTime()) &&
    Number.isFinite(checkOutDate.getTime())
      ? Math.max(
          1,
          Math.round((checkOutDate.getTime() - checkInDate.getTime()) / 86400000),
        )
      : 1;
  const guestParts = [];

  if (adults > 0) {
    guestParts.push(`${adults} ${adults === 1 ? "adult" : "adults"}`);
  }

  if (children > 0) {
    guestParts.push(`${children} ${children === 1 ? "child" : "children"}`);
  }

  if (!guestParts.length) {
    guestParts.push("1 guest");
  }

  if (rooms > 1) {
    guestParts.push(`${rooms} rooms`);
  }

  return `${nights} ${nights === 1 ? "night" : "nights"}, ${guestParts.join(", ")}`;
};

const readStoredHotelSearch = () => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(HOTEL_SEARCH_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const readStoredHotelResults = () => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(HOTEL_SEARCH_RESULTS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const findDeepValue = (value, key, depth = 0, seen = new WeakSet()) => {
  if (!value || typeof value !== "object" || depth > 7) return "";
  if (seen.has(value)) return "";
  seen.add(value);

  if (!Array.isArray(value) && value[key]) return value[key];

  const entries = Array.isArray(value) ? value : Object.values(value);
  for (const entry of entries) {
    const found = findDeepValue(entry, key, depth + 1, seen);
    if (found) return found;
  }

  return "";
};

const getSearchParam = (searchParams, ...keys) => {
  for (const key of keys) {
    const value =
      searchParams?.get?.(key) ||
      (typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get(key)
        : "");
    if (value) return value;
  }

  return "";
};

export const getHotelDetailsRequest = (hotel = {}, searchParams) => {
  const storedHotelSearch = readStoredHotelSearch() || {};
  const storedHotelResults = readStoredHotelResults() || {};
  const payload = getHotelDetailsPayload(hotel);

  return {
    ...payload,
    searchId:
      payload.searchId ||
      getSearchParam(searchParams, "searchId", "searchid") ||
      findDeepValue(storedHotelSearch, "searchId") ||
      findDeepValue(storedHotelSearch, "search_id"),
    hotelSearchId:
      payload.hotelSearchId ||
      getSearchParam(
        searchParams,
        "hotelSearchId",
        "hotelsearchid",
        "hotel_search_id",
        "hotel_search_key",
        "hotelSearchKey",
      ) ||
      findDeepValue(hotel, "hotelSearchId") ||
      findDeepValue(hotel, "hotel_search_id") ||
      findDeepValue(hotel, "hotel_search_key") ||
      findDeepValue(hotel, "hotelSearchKey") ||
      findDeepValue(storedHotelSearch, "hotelSearchId") ||
      findDeepValue(storedHotelSearch, "hotel_search_id") ||
      findDeepValue(storedHotelSearch, "hotel_search_key") ||
      findDeepValue(storedHotelSearch, "hotelSearchKey") ||
      findDeepValue(storedHotelResults, "hotelSearchId") ||
      findDeepValue(storedHotelResults, "hotel_search_id") ||
      findDeepValue(storedHotelResults, "hotel_search_key") ||
      findDeepValue(storedHotelResults, "hotelSearchKey"),
    hotelId:
      payload.hotelId ||
      String(
        hotel.hotelId ||
          hotel.id ||
          hotel.hotelCode ||
          hotel.code ||
          hotel.raw?.hotelId ||
          hotel.raw?.id ||
          hotel.raw?.hotelCode ||
          hotel.raw?.code ||
          "",
      ).trim(),
    priceProvider:
      payload.priceProvider ||
      getHotelPriceProvider(hotel.raw) ||
      pickProviderValue(hotel.providerName) ||
      pickProviderValue(hotel.priceProviderCode) ||
      pickProviderValue(hotel.raw?.providerName) ||
      pickProviderValue(hotel.raw?.priceProviderCode),
    checkIn: getSearchParam(searchParams, "checkIn", "checkin"),
    checkOut: getSearchParam(searchParams, "checkOut", "checkout"),
  };
};

const TourListing = () => {
  const {
    appliedFilters,
    setDisplayHotels,
    setFilterData,
    setHotels,
    setIsLoading,
    setMeta,
    setTotalResults,
  } = useHotelsContext();
  const searchParams = useSearchParams();
  const hotelSearchChannel = searchParams.get("channel") || "";
  const [likedTours, setLikedTours] = useState([]);
  const [viewType, setViewType] = useState("grid");
  const [expandedId, setExpandedId] = useState(null);

  const [isCreateWishlistOpen, setIsCreateWishlistOpen] = useState(false);
  const [isSaveWishlistOpen, setIsSaveWishlistOpen] = useState(false);
  const [wishlists, setWishlists] = useState([]); // fetch later from backend
  const [selectedTourId, setSelectedTourId] = useState(null);
  const [hotelResults, setHotelResults] = useState([]);
  const [apiFilterData, setApiFilterData] = useState(null);
  const [totalHotelResults, setTotalHotelResults] = useState(0);
  const [isHotelLoading, setIsHotelLoading] = useState(Boolean(hotelSearchChannel));
  const [hotelResultSource, setHotelResultSource] = useState("");
  const [loadingHotelDetailsId, setLoadingHotelDetailsId] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [sortType, setSortType] = useState("recent");
  const [scrollState, setScrollState] = useState({
    scrollY: 0,
    viewportHeight: 0,
    viewportWidth: 0,
  });
  const staySummary = useMemo(() => getStaySummary(searchParams), [searchParams]);
  const searchIdFromUrl =
    searchParams.get("searchId") ||
    searchParams.get("searchid") ||
    searchParams.get("SearchId") ||
    "";
  const activeSearchId = useMemo(() => {
    if (searchIdFromUrl) return searchIdFromUrl;

    const hotelSearchId = hotelResults.find((hotel) => hotel.searchId)?.searchId;
    if (hotelSearchId) return hotelSearchId;

    const storedHotelSearch = readStoredHotelSearch() || {};
    const storedHotelResults = readStoredHotelResults() || {};

    return (
      findDeepValue(storedHotelSearch, "searchId") ||
      findDeepValue(storedHotelSearch, "search_id") ||
      findDeepValue(storedHotelResults, "searchId") ||
      findDeepValue(storedHotelResults, "search_id") ||
      ""
    );
  }, [hotelResults, searchIdFromUrl]);
  const searchLocationLabel = useMemo(
    () => getSearchLocationLabel(searchParams),
    [searchParams],
  );
  const filterDataPayload = useMemo(
    () => ({
      searchId: activeSearchId,
      hotelSearchId:
        searchParams.get("hotelSearchId") ||
        searchParams.get("hotelsearchid") ||
        "",
      city: searchParams.get("city") || "",
      checkIn: searchParams.get("checkIn") || "",
      checkOut: searchParams.get("checkOut") || "",
      channel: hotelSearchChannel,
      rooms: searchParams.get("rooms") || "",
      adults: searchParams.get("adults") || "",
      children: searchParams.get("children") || "",
      childAges: searchParams.get("childAges") || "",
      locationId: searchParams.get("locationId") || "",
      country: searchParams.get("country") || "",
      state: searchParams.get("state") || "",
    }),
    [activeSearchId, hotelSearchChannel, searchParams],
  );
  const hotelResultSourceRef = useRef("");
  const normalizeRunRef = useRef(0);
  const listSectionRef = useRef(null);
  const hotelDetailsAbortRef = useRef(null);
  const hotelDetailsRequestRef = useRef(0);

  const handleHeartClick = (hotel) => {
    const hotelId = getHotelDetailsPayload(hotel).hotelId;

    setSelectedTourId(hotelId || hotel?.id || null);

    if (!wishlists.length) {
      setIsCreateWishlistOpen(true);
    } else {
      setIsSaveWishlistOpen(true);
    }
  };

  const handleCreateWishlist = (name) => {
    const newWishlist = {
      id: Date.now(),
      name,
      count: 0,
    };

    setWishlists((prev) => [...prev, newWishlist]);

    setIsCreateWishlistOpen(false);
    setIsSaveWishlistOpen(true);
  };
  const router = useRouter();

  const getHotelLoadingKey = (hotel = {}) =>
    getHotelDetailsPayload(hotel).hotelId || hotel?.id || "";

  const openLoginModal = () => {
    setAuthView("login");
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthView("login");
  };

  const handleBookNow = async (hotel) => {
    if (!hotel) return;

    hotelDetailsAbortRef.current?.abort();

    const controller = new AbortController();
    const requestId = hotelDetailsRequestRef.current + 1;
    hotelDetailsRequestRef.current = requestId;
    hotelDetailsAbortRef.current = controller;

    const payload = getHotelDetailsRequest(hotel, searchParams);
    const loadingKey = getHotelLoadingKey(hotel);

    if (!payload.searchId || !payload.hotelSearchId || !payload.hotelId || !payload.priceProvider) {
      console.warn("Missing hotel details payload fields:", payload);
      if (hotelDetailsRequestRef.current === requestId) {
        setLoadingHotelDetailsId("");
      }
      return;
    }

    setLoadingHotelDetailsId(loadingKey);

    try {
      const details = await fetchHotelDetails({
        ...payload,
        signal: controller.signal,
      });

      if (hotelDetailsRequestRef.current !== requestId) return;

      window.sessionStorage.setItem(
        HOTEL_DETAILS_KEY,
        JSON.stringify({
          request: payload,
          hotel,
          details,
        }),
      );
      router.push(getHotelDetailUrl(payload));
    } catch (error) {
      if (error?.name === "AbortError") return;

      if (hotelDetailsRequestRef.current !== requestId) return;

      console.error("Hotel details request failed:", error);
      if (isMissingHotelAuthTokenError(error)) {
        openLoginModal();
      }
    } finally {
      if (hotelDetailsRequestRef.current === requestId) {
        setLoadingHotelDetailsId("");
        hotelDetailsAbortRef.current = null;
      }
    }
  };
  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const rating = 5;

  useEffect(() => {
    normalizeRunRef.current += 1;
    setHotelResults([]);
    setTotalHotelResults(0);
    setIsHotelLoading(Boolean(hotelSearchChannel));
    setHotelResultSource("");
    hotelResultSourceRef.current = "";

    const normalizeHotelsInBatches = (hotels, meta = {}) => {
      const runId = normalizeRunRef.current + 1;
      normalizeRunRef.current = runId;
      setTotalHotelResults(hotels.length);
      const withSearchMeta = (hotel) => ({
        ...hotel,
        searchId: hotel.searchId || hotel.search_id || meta.searchId,
        hotelSearchId:
          hotel.hotelSearchId || hotel.hotel_search_id || meta.hotelSearchId,
        requestId: hotel.requestId || hotel.request_id || meta.requestId,
        hotelSearchKey:
          hotel.hotelSearchKey || hotel.hotel_search_key || meta.hotelSearchKey,
      });

      const firstBatch = hotels
        .slice(0, FIRST_HOTEL_RENDER_BATCH_SIZE)
        .map((hotel, index) => normalizeHotelCard(withSearchMeta(hotel), index));

      setHotelResults(firstBatch);
      setIsHotelLoading(false);

      let nextIndex = FIRST_HOTEL_RENDER_BATCH_SIZE;

      const appendNextBatch = () => {
        if (normalizeRunRef.current !== runId || nextIndex >= hotels.length) {
          return;
        }

        const batchStart = nextIndex;
        const batch = hotels
          .slice(batchStart, batchStart + HOTEL_RENDER_BATCH_SIZE)
          .map((hotel, index) =>
            normalizeHotelCard(withSearchMeta(hotel), batchStart + index),
          );

        nextIndex += HOTEL_RENDER_BATCH_SIZE;
        setHotelResults((prev) => [...prev, ...batch]);

        if (nextIndex < hotels.length) {
          window.setTimeout(appendNextBatch, 0);
        }
      };

      window.setTimeout(appendNextBatch, 0);
    };

    const applyHotelResults = (payload) => {
      if (payload?.channel && payload.channel !== hotelSearchChannel) {
        return;
      }

      const nextResults = getHotelsFromMessage(payload);
      console.log("Hotel result source:", {
        source: nextResults.source,
        count: nextResults.hotels.length,
      });

      if (!nextResults.hotels.length) {
        if (isHotelTerminalPayload(payload)) {
          setIsHotelLoading(false);
        }
        return;
      }
      if (
        !shouldApplyHotelResults(
          hotelResultSourceRef.current,
          nextResults.source,
        )
      ) {
        console.log("Hotel result ignored lower priority source:", {
          currentSource: hotelResultSourceRef.current,
          nextSource: nextResults.source,
        });
        return;
      }

      normalizeHotelsInBatches(nextResults.hotels, nextResults.meta);
      hotelResultSourceRef.current = nextResults.source;
      setHotelResultSource(nextResults.source);
    };

    const handleHotelResults = (event) => {
      applyHotelResults(event.detail);
    };

    window.addEventListener(HOTEL_SEARCH_RESULTS_EVENT, handleHotelResults);

    const cachedResults = window.sessionStorage.getItem(HOTEL_SEARCH_RESULTS_KEY);
    if (cachedResults) {
      try {
        const cachedPayload = JSON.parse(cachedResults);
        if (!hotelSearchChannel || cachedPayload?.channel === hotelSearchChannel) {
          applyHotelResults(cachedPayload);
        }
      } catch {
        // Ignore stale malformed session data.
      }
    }

    return () => {
      normalizeRunRef.current += 1;
      window.removeEventListener(HOTEL_SEARCH_RESULTS_EVENT, handleHotelResults);
    };
  }, [hotelSearchChannel]);

  useEffect(() => {
    if (!activeSearchId) {
      setApiFilterData(null);
      return;
    }

    const controller = new AbortController();

    fetchHotelFilterData(activeSearchId, {
      signal: controller.signal,
      payload: filterDataPayload,
    })
      .then((data) => {
        setApiFilterData(data || null);
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;

        console.error("Hotel filter data request failed:", error);
        setApiFilterData(null);
      });

    return () => controller.abort();
  }, [activeSearchId, filterDataPayload]);

  const staticHotelResults = useMemo(
    () =>
      STATIC_HOTEL_RESULTS.map((hotel, index) =>
        normalizeHotelCard(hotel, index),
      ),
    [],
  );
  const hasActiveHotelSearch = Boolean(hotelSearchChannel);
  const sourceHotels = useMemo(
    () =>
      hotelResults.length || hasActiveHotelSearch
        ? hotelResults
        : staticHotelResults,
    [hasActiveHotelSearch, hotelResults, staticHotelResults],
  );

  const sortedHotels = useMemo(
    () => sortHotels(sourceHotels, sortType),
    [sourceHotels, sortType],
  );

  const displayHotels = useMemo(
    () =>
      sortedHotels.filter((hotel) =>
        matchesHotelFilters(hotel, appliedFilters),
      ),
    [appliedFilters, sortedHotels],
  );

  useEffect(() => {
    setFilterData(apiFilterData || buildHotelFilterCounts(sourceHotels));
    setHotels(hotelResults);
    setMeta({
      channel: hotelSearchChannel,
      searchId: activeSearchId,
      source: hotelResultSource,
      hasApiResults: hotelResults.length > 0,
    });
    setTotalResults(totalHotelResults || sourceHotels.length);
  }, [
    hotelResultSource,
    hotelResults,
    hotelSearchChannel,
    activeSearchId,
    apiFilterData,
    setFilterData,
    setHotels,
    setMeta,
    setTotalResults,
    sourceHotels,
    totalHotelResults,
  ]);

  useEffect(() => {
    setDisplayHotels(displayHotels);
  }, [displayHotels, setDisplayHotels]);

  useEffect(() => {
    setIsLoading(isHotelLoading);
  }, [isHotelLoading, setIsLoading]);

  useEffect(
    () => () => {
      hotelDetailsAbortRef.current?.abort();
    },
    [],
  );

  useEffect(() => {
    const updateScrollState = () => {
      const scrollContainer = listSectionRef.current;

      setScrollState({
        scrollY:
          scrollContainer?.scrollTop ||
          window.scrollY ||
          window.pageYOffset ||
          0,
        viewportHeight:
          scrollContainer?.clientHeight || window.innerHeight || 0,
        viewportWidth: window.innerWidth || 0,
      });
    };

    const scrollContainer = listSectionRef.current;

    updateScrollState();
    scrollContainer?.addEventListener("scroll", updateScrollState, {
      passive: true,
    });
    window.addEventListener("resize", updateScrollState);

    return () => {
      scrollContainer?.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    listSectionRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [sortType, viewType, hotelSearchChannel]);

  const virtualWindow = useMemo(() => {
    const itemCount = displayHotels.length;
    const columns =
      viewType === "grid"
        ? scrollState.viewportWidth > 1180
          ? 3
          : scrollState.viewportWidth > 991
            ? 2
            : 1
        : 1;
    const rowHeight = viewType === "grid" ? GRID_ROW_HEIGHT : LIST_ROW_HEIGHT;
    const totalRows = Math.ceil(itemCount / columns);
    const scrollTop = Math.max(0, scrollState.scrollY);
    const viewportHeight = scrollState.viewportHeight || 900;

    if (!itemCount || !listSectionRef.current) {
      const endIndex = Math.min(INITIAL_VIRTUAL_ITEM_COUNT, itemCount);

      return {
        startIndex: 0,
        endIndex,
        paddingTop: 0,
        paddingBottom: Math.max(
          0,
          Math.ceil((itemCount - endIndex) / columns) * rowHeight,
        ),
      };
    }

    const startRow = Math.max(
      0,
      Math.floor(scrollTop / rowHeight) - VIRTUAL_OVERSCAN_ROWS,
    );
    const endRow = Math.min(
      totalRows,
      Math.ceil((scrollTop + viewportHeight) / rowHeight) +
        VIRTUAL_OVERSCAN_ROWS,
    );

    return {
      startIndex: startRow * columns,
      endIndex: Math.min(itemCount, endRow * columns),
      paddingTop: startRow * rowHeight,
      paddingBottom: Math.max(0, (totalRows - endRow) * rowHeight),
    };
  }, [displayHotels.length, scrollState, viewType]);

  const visibleHotels = useMemo(
    () =>
      displayHotels.slice(
        virtualWindow.startIndex,
        virtualWindow.endIndex,
      ),
    [displayHotels, virtualWindow.endIndex, virtualWindow.startIndex],
  );

  const toggleLike = (id) => {
    setLikedTours((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };
  const showEmptyState =
    !isHotelLoading && !displayHotels.length && Boolean(hotelSearchChannel || hotelResultSource);

  return (
    <>
      <section className={styles.tourListSection} ref={listSectionRef}>
        <SearchResults
          viewType={viewType}
          setViewType={setViewType}
          totalResults={totalHotelResults || sourceHotels.length}
          locationLabel={searchLocationLabel}
          sort={sortType}
          setSort={setSortType}
        />

          {showEmptyState && (
            <EmptyHotelState locationLabel={searchLocationLabel} />
          )}


          {/* =================card view==================================================================== */}

          {viewType === "grid" && !showEmptyState && (
            <motion.div
              className={styles.gridWrapper}
              key="grid"
              style={{
                paddingTop: virtualWindow.paddingTop,
                paddingBottom: virtualWindow.paddingBottom,
              }}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {!displayHotels.length &&
                isHotelLoading &&
                skeletonCards.map((item) => (
                  <div
                    key={`hotel-grid-skeleton-${item}`}
                    className={`${styles.gridCard} ${styles.skeletonCard}`}
                  >
                    <div className={styles.skeletonImage}></div>
                    <div className={styles.skeletonContent}>
                      <div className={`${styles.skeletonLine} ${styles.skeletonStars}`}></div>
                      <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`}></div>
                      <div className={`${styles.skeletonLine} ${styles.skeletonAddress}`}></div>
                      <div className={styles.skeletonFeatures}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <div className={`${styles.skeletonLine} ${styles.skeletonBenefit}`}></div>
                      <div className={styles.skeletonFooter}>
                        <div className={`${styles.skeletonLine} ${styles.skeletonPrice}`}></div>
                        <div className={`${styles.skeletonLine} ${styles.skeletonButton}`}></div>
                      </div>
                    </div>
                  </div>
                ))}
              {visibleHotels.map((item, index) => (
                <div
                  key={item?.id || item?.api_hotel_id || item?.title || `hotel-grid-${index}`}
                  className={styles.gridCard}
                >
                  <div className={styles.gridCardImage}>
                    <img
                      className={styles.ListViewCardImage}
                      src={item.image}
                      alt={item.title}
                    />
                    <div
                      className={`${styles.cardItemHeader} ${styles.ListViewCardHeader} ${styles.CardViewCardHeader}`}
                    >
                      <div className={styles.headerLeft}>
                        <div className={styles.new}>New</div>
                        <div className={styles.private}>Flagship</div>
                      </div>

                      <img
                        src={
                          likedTours.includes(item.id)
                            ? "/icons/heartIconFilled.svg"
                            : "/icons/heartIcon.svg"
                        }
                        alt="wishlist"
                        className={`${styles.heartIcon} ${styles.ListViewHeartIcon}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(item.id); // change icon
                          handleHeartClick(item); // open modal
                        }}
                      />
                    </div>
                  </div>
                  <div className={styles.gridCardText}>
                    <div className={styles.cartListTop}>
                      <div className={styles.ListViewCardTextTop}>
                        <div className={styles.topTextHead}>
                          <div className={styles.rating}>
                           
                            {[...Array(5)].map((_, index) => (
                              <img
                                key={index}
                                src={
                                  index < (item.rating ?? rating)
                                    ? "/icons/conicstar.svg"
                                    : "/icons/star-gray.svg"
                                }
                                alt="star"
                              />
                            ))}
                             <div className={styles.ReviewCount}>
                              <span>4.5</span>
                               (128 reviews)</div>
                          </div>
                          <h2>{item.title}</h2>

                          <div className={styles.topTextHeadAddress}>
                            <img src="/icons/blackAddress.svg" alt="" />
                            <span>{item.route}</span>
                          </div>
                        </div>
                        <HotelFacilities facilities={item.facilities} />
                        <HotelBenefits benefits={item.benefits} />
                      </div>
                    </div>

                    <div className={styles.cardViewCardTextBottom}>
                      <div className={styles.cardpriceContainer}>
                        {item.hasPrice ? (
                          <>
                            <div className={styles.priceSec}>{item.price}</div>

                            <div className={styles.totalPrice}>
                              <span>{staySummary}</span>
                            </div>
                          </>
                        ) : (
                          <div className={styles.priceLoading}>
                            <span className={styles.priceLoadingAmount}></span>
                            <span className={styles.priceLoadingMeta}></span>
                          </div>
                        )}
                      </div>

                      <button
                        className={styles.bookNowBtn}
                        disabled={loadingHotelDetailsId === getHotelLoadingKey(item)}
                        onClick={() => handleBookNow(item)}
                      >
                        {loadingHotelDetailsId === getHotelLoadingKey(item)
                          ? "LOADING"
                          : "SEE AVAILABILITY"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
            // </div>
          )}
{/* =====================================================list view===================================== */}

          {viewType === "list" && !showEmptyState && (
            <motion.div
              className={styles.ListViewWrapper}
              key="list"
              style={{
                paddingTop: virtualWindow.paddingTop,
                paddingBottom: virtualWindow.paddingBottom,
              }}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {!displayHotels.length &&
                isHotelLoading &&
                skeletonCards.map((item) => (
                  <div
                    key={`hotel-list-skeleton-${item}`}
                    className={`${styles.ListViewCardContainer} ${styles.skeletonCard}`}
                  >
                    <div className={styles.skeletonListImage}></div>
                    <div className={styles.skeletonListContent}>
                      <div className={`${styles.skeletonLine} ${styles.skeletonStars}`}></div>
                      <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`}></div>
                      <div className={`${styles.skeletonLine} ${styles.skeletonAddress}`}></div>
                      <div className={styles.skeletonFeatures}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <div className={`${styles.skeletonLine} ${styles.skeletonBenefit}`}></div>
                      <div className={styles.skeletonFooter}>
                        <div className={`${styles.skeletonLine} ${styles.skeletonPrice}`}></div>
                        <div className={`${styles.skeletonLine} ${styles.skeletonButton}`}></div>
                      </div>
                    </div>
                  </div>
                ))}
              {visibleHotels.map((item, index) => (
                <div
                  className={styles.ListViewCardContainer}
                  key={item.id}
                >
                  <div className={styles.ListViewCardImageContainer}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className={styles.ListViewCardImage}
                    />

                    <div
                      className={`${styles.cardItemHeader} ${styles.ListViewCardHeader}`}
                    >
                      <div className={styles.headerLeft}>
                        <div className={styles.new}>New</div>
                        <div className={styles.private}>Flagship</div>
                      </div>

                      <img
                        src={
                          likedTours.includes(item.id)
                            ? "/icons/heartIconFilled.svg"
                            : "/icons/heartIcon.svg"
                        }
                        alt="wishlist"
                        className={styles.heartIcon}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(item.id); // change icon
                          handleHeartClick(item); // open modal
                        }}
                      />
                    </div>
                  </div>

                  <div className={styles.ListViewCardText}>
                    <div className={styles.cartListTop}>
                      <div className={styles.ListViewCardTextTop}>
                        <div className={styles.topTextHead}>
                          <div className={styles.rating}>
                            {[...Array(5)].map((_, index) => (
                              <img
                                key={index}
                                src={
                                  index < (item.rating ?? rating)
                                    ? "/icons/conicstar.svg"
                                    : "/icons/star-gray.svg"
                                }
                                alt="star"
                              />
                            ))}
                          </div>
                          <h2>{item.title}</h2>

                          <div className={styles.topTextHeadAddress}>
                            <img src="/icons/blackAddress.svg" alt="" />
                            <span>{item.route}</span>
                          </div>
                        </div>
                        <HotelFacilities facilities={item.facilities} />
                        <HotelBenefits benefits={item.benefits} />
                      </div>
                    </div>

                    <div className={styles.ListViewCardTextBottom}>
                      <div className={styles.priceContainer}>
                        {item.hasPrice ? (
                          <>
                            <div
                              className={`${styles.priceSec} ${styles.ListViewPriceSec}`}
                            >
                              {item.price}
                            </div>

                            <div
                              className={`${styles.totalPrice} ${styles.ListViewTotalPrice}`}
                            >
                              <span>{staySummary}</span>
                            </div>
                          </>
                        ) : (
                          <div className={styles.priceLoading}>
                            <span className={styles.priceLoadingAmount}></span>
                            <span className={styles.priceLoadingMeta}></span>
                          </div>
                        )}
                      </div>

                      <button
                        className={`${styles.bookNowBtn} ${styles.ListViewBookNowBtn}`}
                        disabled={loadingHotelDetailsId === getHotelLoadingKey(item)}
                        onClick={() => handleBookNow(item)}
                      >
                        {loadingHotelDetailsId === getHotelLoadingKey(item)
                          ? "LOADING"
                          : "SEE AVAILABILITY"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
      </section>
      <section className={styles.tourListSectionMobileView}></section>

      <CreateWishlistModal
        isOpen={isCreateWishlistOpen}
        onClose={() => setIsCreateWishlistOpen(false)}
        onCreate={handleCreateWishlist}
        type="hotel"
        ids={selectedTourId ? [selectedTourId] : []}
      />

      <SaveToWishlistModal
        onCreateNew={() => setIsCreateWishlistOpen(true)}
        isOpen={isSaveWishlistOpen}
        wishlists={wishlists}
        type="hotel"
        ids={selectedTourId ? [selectedTourId] : []}
        onClose={() => setIsSaveWishlistOpen(false)}
      />
      {showAuthModal && authView === "login" && (
        <LoginPopup onClose={closeAuthModal} onNavigate={setAuthView} />
      )}

      {showAuthModal && authView === "signup" && (
        <SignupPopup onClose={closeAuthModal} onNavigate={setAuthView} />
      )}
    </>
  );
};

export default TourListing;

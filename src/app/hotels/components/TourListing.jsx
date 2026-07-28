"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./TourListing.module.css";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import SearchResults from "../components/searchResult/SearchResults";
import CreateWishlistModal, {
  createWishlist,
} from "@/shared/components/wishlistModals/CreateWishlistModal";
import SaveToWishlistModal, {
  fetchUserWishlists,
} from "@/shared/components/wishlistModals/SaveToWishlistModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appToast } from "@/shared/components/appToast/AppToast";
import {
  HOTEL_DETAILS_KEY,
  HOTEL_SEARCH_SESSION_KEY,
  HOTEL_SEARCH_RESULTS_EVENT,
  HOTEL_SEARCH_RESULTS_KEY,
  fetchHotelDetails,
  isMissingHotelAuthTokenError,
} from "@/shared/services/hotelSearch";
import LoginPopup from "@/app/account/loginPopUp/LoginPopup";
import SignupPopup from "@/app/account/signUpPopUp/SignupPopup";
import { useHotelsContext } from "../context/HotelsContext";
import { useBodyScrollLock } from "@/shared/hooks/useBodyScrollLock";

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

const stripRawFields = (value, depth = 0) => {
  if (!value || typeof value !== "object" || depth > 10) return value;

  if (Array.isArray(value)) {
    return value.map((item) => stripRawFields(item, depth + 1));
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== "raw")
      .map(([key, item]) => [key, stripRawFields(item, depth + 1)]),
  );
};

const writeHotelDetailsForNavigation = ({ payload, hotel, details }) => {
  const fullDetail = {
    request: payload,
    hotel: stripRawFields(hotel),
    details: stripRawFields(details),
  };

  try {
    window.sessionStorage.setItem(
      HOTEL_DETAILS_KEY,
      JSON.stringify(fullDetail),
    );
    return;
  } catch (error) {
    console.warn(
      "Hotel details payload exceeded session storage; storing slim payload.",
      error,
    );
  }

  try {
    window.sessionStorage.setItem(
      HOTEL_DETAILS_KEY,
      JSON.stringify({
        request: payload,
        hotel,
      }),
    );
  } catch {
    try {
      window.sessionStorage.removeItem(HOTEL_DETAILS_KEY);
    } catch {
      // Ignore storage cleanup failures.
    }
  }
};

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
    const searchId = findMetaValue("searchId", "search_id", "searchid");
    const hotelSearchId = findMetaValue(
      "hotelSearchId",
      "hotel_search_id",
      "HotelSearchId",
      "hotelSearchID",
      "hotel_search_key",
      "hotelSearchKey",
    );
    const requestId = findMetaValue("requestId", "request_id");
    const hotelSearchKey = findMetaValue("hotel_search_key", "hotelSearchKey");
    const searchTracingKey = findMetaValue(
      "searchTracingKey",
      "SearchTracingKey",
      "searchTracingkey",
      "search_tracing_key",
      "roomsSearchTracingKey",
      "RoomsSearchTracingKey",
      "TUI",
      "tui",
    );

    if (
      searchId ||
      hotelSearchId ||
      requestId ||
      hotelSearchKey ||
      searchTracingKey
    ) {
      return {
        searchId,
        hotelSearchId,
        requestId,
        hotelSearchKey,
        searchTracingKey,
      };
    }
  }

  return {};
};

const compactHotelInit = (init = {}, fallback = {}) => ({
  searchId:
    init?.searchId ||
    init?.search_id ||
    init?.searchid ||
    fallback?.searchId ||
    "",
  hotelSearchId:
    init?.hotelSearchId ||
    init?.hotel_search_id ||
    init?.hotel_search_key ||
    fallback?.hotelSearchId ||
    "",
  searchTracingKey:
    init?.searchTracingKey ||
    init?.search_tracing_key ||
    init?.roomsSearchTracingKey ||
    init?.TUI ||
    fallback?.searchTracingKey ||
    "",
});

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
  const nestedContent = parseSocketValue(
    content?.content || content?.data?.content,
  );
  const mergedHotels =
    data?.mergedHotels ||
    content?.mergedHotels ||
    data?.init?.mergedHotels ||
    content?.init?.mergedHotels ||
    payload?.init?.mergedHotels ||
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

  if (Array.isArray(payload?.hotels) && payload.hotels.length) {
    const result = sanitizeHotelResult(
      payload.source || "hotels",
      payload.hotels,
    );
    result.meta = meta;
    if (result.hotels.length) return result;
  }

  if (Array.isArray(data?.hotels) && data.hotels.length) {
    const result = sanitizeHotelResult(data.source || "hotels", data.hotels);
    result.meta = meta;
    if (result.hotels.length) return result;
  }

  if (Array.isArray(content?.hotels) && content.hotels.length) {
    const result = sanitizeHotelResult("hotels", content.hotels);
    result.meta = meta;
    if (result.hotels.length) return result;
  }

  const fallbackResult = pickBestHotelResult(
    findHotelArrays([
      payload,
      data,
      content,
      nestedData,
      nestedDataContent,
      nestedContent,
    ]),
  );
  fallbackResult.meta = meta;
  return fallbackResult;
};

const getHotelFiltersFromMessage = (payload = {}) => {
  const data = getMessageData(payload);
  const content = getMessageContent(payload);
  const nestedData = parseSocketValue(data?.data);
  const nestedContent = parseSocketValue(
    content?.content || content?.data?.content,
  );

  const filters =
    data?.filterData ||
    data?.filters ||
    data?.content?.filterData ||
    data?.content?.filters ||
    content?.filterData ||
    content?.filters ||
    nestedData?.filterData ||
    nestedData?.filters ||
    nestedData?.content?.filterData ||
    nestedData?.content?.filters ||
    nestedContent?.filterData ||
    nestedContent?.filters ||
    payload?.filterData ||
    payload?.filters;

  return filters && typeof filters === "object" ? filters : null;
};

export const getHotelImage = (hotel = {}) => {
  const image =
    hotel.image ||
    hotel.imageUrl ||
    hotel.thumbnail ||
    hotel.heroImage ||
    hotel.mainImage ||
    hotel.images?.[0]?.url ||
    hotel.images?.[0]?.imageUrl ||
    hotel.images?.[0];

  return typeof image === "string" && image
    ? image
    : "/images/hotelFallback.png";
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

  const numericPrice =
    typeof price === "string"
      ? Number(price.replace(/[^\d.-]/g, ""))
      : Number(price);

  if (Number.isFinite(numericPrice)) {
    return `₹ ${Math.round(numericPrice).toLocaleString("en-IN")}`;
  }

  return String(price).startsWith("₹") ? String(price) : `₹ ${price}`;
};

export const getHotelRating = (hotel = {}) => {
  const rating = Number(
    hotel.starRating ||
      hotel.star_rating ||
      hotel.stars ||
      hotel.rate?.starRating ||
      hotel.rate?.star_rating ||
      hotel.rating ||
      0,
  );
  if (!Number.isFinite(rating)) return 0;
  return Math.max(0, Math.min(5, Math.round(rating)));
};

const getNumberValue = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;

    const numericValue = Number(String(value).replace(/[^\d.-]/g, ""));
    if (Number.isFinite(numericValue)) return numericValue;
  }

  return null;
};

const formatRatingScore = (value) => {
  const rating = getNumberValue(value);
  if (rating === null) return "-";

  return rating.toFixed(1).replace(/\.0$/, "");
};

const formatReviewText = (count) => {
  const reviewCount = getNumberValue(count);
  if (!reviewCount) return "No reviews yet";

  return `${reviewCount.toLocaleString("en-IN")} review${reviewCount === 1 ? "" : "s"}`;
};

export const getHotelReviewSummary = (hotel = {}) => {
  const reviews = Array.isArray(hotel.reviews)
    ? hotel.reviews
    : Array.isArray(hotel.raw?.reviews)
      ? hotel.raw.reviews
      : [];
  const firstReview = reviews[0] || {};
  const reviewSummary =
    hotel.reviewSummary ||
    hotel.review_summary ||
    hotel.guestReview ||
    hotel.guest_review ||
    hotel.raw?.reviewSummary ||
    hotel.raw?.review_summary ||
    {};
  const reviewScore = getNumberValue(
    hotel.reviewRating,
    hotel.review_rating,
    hotel.guestRating,
    hotel.guest_rating,
    hotel.ratingScore,
    hotel.rating_score,
    reviewSummary.rating,
    reviewSummary.averageRating,
    reviewSummary.average_rating,
    firstReview.rating,
    firstReview.score,
  );
  const reviewCount = getNumberValue(
    hotel.reviewCount,
    hotel.review_count,
    hotel.reviewsCount,
    hotel.reviews_count,
    hotel.totalReviews,
    hotel.total_reviews,
    reviewSummary.count,
    reviewSummary.reviewCount,
    reviewSummary.totalReviews,
    firstReview.count,
    reviews.length &&
      reviews.some((review) => review.comment || review.review || review.text)
      ? reviews.length
      : "",
  );

  return {
    score: reviewScore,
    scoreText: formatRatingScore(reviewScore),
    text: formatReviewText(reviewCount),
  };
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
  const directProvider =
    pickProviderValue(hotel.priceProvider) ||
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
  searchTracingKey: String(
    hotel.searchTracingKey ||
      hotel.SearchTracingKey ||
      hotel.searchTracingkey ||
      hotel.search_tracing_key ||
      hotel.roomsSearchTracingKey ||
      hotel.RoomsSearchTracingKey ||
      hotel.TUI ||
      hotel.tui ||
      hotel.raw?.searchTracingKey ||
      hotel.raw?.SearchTracingKey ||
      hotel.raw?.searchTracingkey ||
      hotel.raw?.search_tracing_key ||
      hotel.raw?.roomsSearchTracingKey ||
      hotel.raw?.RoomsSearchTracingKey ||
      hotel.raw?.TUI ||
      hotel.raw?.tui ||
      "",
  ).trim(),
  roomsSearchTracingKey: String(
    hotel.roomsSearchTracingKey ||
      hotel.RoomsSearchTracingKey ||
      hotel.searchTracingKey ||
      hotel.SearchTracingKey ||
      hotel.searchTracingkey ||
      hotel.search_tracing_key ||
      hotel.TUI ||
      hotel.tui ||
      hotel.raw?.roomsSearchTracingKey ||
      hotel.raw?.RoomsSearchTracingKey ||
      hotel.raw?.searchTracingKey ||
      hotel.raw?.SearchTracingKey ||
      hotel.raw?.searchTracingkey ||
      hotel.raw?.search_tracing_key ||
      hotel.raw?.TUI ||
      hotel.raw?.tui ||
      "",
  ).trim(),
  TUI: String(
    hotel.TUI ||
      hotel.tui ||
      hotel.searchTracingKey ||
      hotel.SearchTracingKey ||
      hotel.searchTracingkey ||
      hotel.search_tracing_key ||
      hotel.roomsSearchTracingKey ||
      hotel.RoomsSearchTracingKey ||
      hotel.raw?.TUI ||
      hotel.raw?.tui ||
      hotel.raw?.searchTracingKey ||
      hotel.raw?.SearchTracingKey ||
      hotel.raw?.searchTracingkey ||
      hotel.raw?.search_tracing_key ||
      hotel.raw?.roomsSearchTracingKey ||
      hotel.raw?.RoomsSearchTracingKey ||
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
  priceProvider:
    getHotelPriceProvider(hotel) || getHotelPriceProvider(hotel.raw),
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
  const reviewSummary = getHotelReviewSummary(hotel);
  const rating = getHotelRating(hotel);
  const reviewScore = reviewSummary.score ?? rating;

  return {
    id: hotelId || `${hotel.name || "hotel"}-${index}`,
    hotelId: hotelId ? String(hotelId) : "",
    searchId: hotel.searchId || hotel.search_id || "",
    hotelSearchId:
      hotel.hotelSearchId ||
      hotel.hotel_search_id ||
      hotel.HotelSearchId ||
      hotel.hotelSearchID ||
      "",
    hotelSearchKey:
      hotel.hotelSearchKey ||
      hotel.hotel_search_key ||
      hotel.raw?.hotelSearchKey ||
      hotel.raw?.hotel_search_key ||
      hotel.hotelSearchId ||
      hotel.hotel_search_id ||
      "",
    searchTracingKey:
      hotel.searchTracingKey ||
      hotel.SearchTracingKey ||
      hotel.searchTracingkey ||
      hotel.search_tracing_key ||
      hotel.roomsSearchTracingKey ||
      hotel.RoomsSearchTracingKey ||
      hotel.TUI ||
      hotel.tui ||
      "",
    priceProvider: priceProvider ? String(priceProvider) : "",
    image: getHotelImage(hotel),
    route: addressParts.join(", ") || "Address not available",
    title: hotel.name || hotel.hotelName || hotel.title || "Hotel",
    price,
    hasPrice,
    facilities: normalizeHotelFacilities(hotel),
    benefits: normalizeHotelBenefits(hotel),
    rating,
    reviewScore,
    reviewScoreText: formatRatingScore(reviewScore),
    reviewText: reviewSummary.text,
    latitude: coordinates?.latitude,
    longitude: coordinates?.longitude,
    freeCancellation: Boolean(
      hotel.freeCancellation ??
      hotel.free_cancellation ??
      hotel.isFreeCancellation,
    ),
    isRefundable: Boolean(hotel.isRefundable ?? hotel.refundable),
    freeBreakfast: Boolean(hotel.freeBreakfast ?? hotel.breakfastIncluded),
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

const getHotelSocketType = (payload = {}) => {
  const data = getMessageData(payload);
  const content = getMessageContent(payload);

  return payload?.type || data?.type || content?.type || "";
};

const getInitCompleteSearchMeta = (payload = {}) => {
  if (getHotelSocketType(payload) !== "HOTEL_INIT_COMPLETE") {
    return { searchId: "", hotelSearchId: "" };
  }

  const data = getMessageData(payload);
  const content = getMessageContent(payload);
  const init = data?.init || content?.init || payload?.init || {};
  console.log("init", init);
  const searchId =
    init.searchId ||
    init.search_id ||
    init.searchid ||
    content?.searchId ||
    content?.search_id ||
    content?.searchid ||
    data?.content?.searchId ||
    data?.content?.search_id ||
    data?.content?.searchid ||
    data?.searchId ||
    data?.search_id ||
    data?.searchid ||
    "";
  console.log("searchId", searchId);
  const hotelSearchId =
    init.hotelSearchId ||
    init.hotel_search_id ||
    init.hotel_search_key ||
    content?.hotelSearchId ||
    content?.hotel_search_id ||
    content?.hotel_search_key ||
    data?.content?.hotelSearchId ||
    data?.content?.hotel_search_id ||
    data?.content?.hotel_search_key ||
    data?.hotelSearchId ||
    data?.hotel_search_id ||
    data?.hotel_search_key ||
    "";

  const searchTracingKey =
    init.searchTracingKey ||
    init.SearchTracingKey ||
    init.searchTracingkey ||
    init.search_tracing_key ||
    init.roomsSearchTracingKey ||
    init.RoomsSearchTracingKey ||
    init.TUI ||
    init.tui ||
    data?.searchTracingKey ||
    data?.SearchTracingKey ||
    data?.search_tracing_key ||
    content?.searchTracingKey ||
    content?.SearchTracingKey ||
    content?.search_tracing_key ||
    "";

  return { searchId, hotelSearchId, searchTracingKey };
};

const getFilterSearchMetaFromPayload = (payload = {}, hotels = []) => {
  const data = getMessageData(payload);
  const content = getMessageContent(payload);
  const init = data?.init || content?.init || payload?.init || {};
  const firstHotelWithSearchId = hotels.find(
    (hotel) => hotel?.searchId || hotel?.search_id,
  );
  const firstHotelWithHotelSearchId = hotels.find(
    (hotel) => hotel?.hotelSearchId || hotel?.hotel_search_id,
  );

  return {
    searchId:
      init?.searchId ||
      init?.search_id ||
      init?.searchid ||
      content?.searchId ||
      content?.search_id ||
      content?.searchid ||
      data?.content?.searchId ||
      data?.content?.search_id ||
      data?.content?.searchid ||
      payload?.content?.searchId ||
      payload?.content?.search_id ||
      payload?.content?.searchid ||
      data?.searchId ||
      data?.search_id ||
      data?.searchid ||
      payload?.searchId ||
      payload?.search_id ||
      firstHotelWithSearchId?.searchId ||
      firstHotelWithSearchId?.search_id ||
      "",
    hotelSearchId:
      init?.hotelSearchId ||
      init?.hotel_search_id ||
      init?.hotel_search_key ||
      content?.hotelSearchId ||
      content?.hotel_search_id ||
      content?.hotel_search_key ||
      data?.content?.hotelSearchId ||
      data?.content?.hotel_search_id ||
      data?.content?.hotel_search_key ||
      payload?.content?.hotelSearchId ||
      payload?.content?.hotel_search_id ||
      payload?.content?.hotel_search_key ||
      data?.hotelSearchId ||
      data?.hotel_search_id ||
      data?.hotel_search_key ||
      payload?.hotelSearchId ||
      payload?.hotel_search_id ||
      firstHotelWithHotelSearchId?.hotelSearchId ||
      firstHotelWithHotelSearchId?.hotel_search_id ||
      "",
  };
};

const isFilterSearchPayloadReady = (payload = {}, resultSource = "") => {
  const socketType = getHotelSocketType(payload);

  return (
    resultSource === "merged" ||
    socketType === "HOTEL_MERGED_RESPONSE" ||
    socketType === "HOTEL_INIT_COMPLETE"
  );
};

const hasUsableFilterData = (data) => {
  if (!data) return false;
  if (Array.isArray(data)) return data.length > 0;
  if (typeof data !== "object") return false;

  const candidates = [
    data.filters,
    data.filterData,
    data.price,
    data.priceRange,
    data.starCategory,
    data.guestRating,
    data.facilities,
    data.amenities,
    data.propertyType,
    data.neighbourhoods,
  ];

  if (
    candidates.some((value) =>
      Array.isArray(value)
        ? value.length > 0
        : value && typeof value === "object" && Object.keys(value).length > 0,
    )
  ) {
    return true;
  }

  return Object.keys(data).some((key) => {
    const value = data[key];
    return (
      key !== "code" &&
      key !== "message" &&
      key !== "status" &&
      (Array.isArray(value)
        ? value.length > 0
        : value && typeof value === "object" && Object.keys(value).length > 0)
    );
  });
};

const getHotelFailureMessage = (payload = {}) => {
  const findMessage = (value, depth = 0, seen = new WeakSet()) => {
    const parsedValue = parseSocketValue(value);

    if (!parsedValue || depth > 6) return "";
    if (typeof parsedValue === "string") return parsedValue;
    if (typeof parsedValue !== "object") return "";
    if (seen.has(parsedValue)) return "";
    seen.add(parsedValue);

    if (typeof parsedValue.message === "string" && parsedValue.message.trim()) {
      return parsedValue.message;
    }

    const entries = Array.isArray(parsedValue)
      ? parsedValue
      : Object.values(parsedValue);

    for (const entry of entries) {
      const message = findMessage(entry, depth + 1, seen);
      if (message) return message;
    }

    return "";
  };

  const candidates = [
    payload,
    getMessageData(payload),
    getMessageContent(payload),
  ];
  const hasFailure = candidates.some((item) => {
    const parsedItem = parseSocketValue(item);

    return (
      String(parsedItem?.status || "").toLowerCase() === "failure" ||
      String(parsedItem?.code || "") === "1216"
    );
  });

  if (!hasFailure) return "";

  return candidates.map((item) => findMessage(item)).find(Boolean) || "";
};

const skeletonCards = Array.from({ length: 6 }, (_, index) => index);
const FIRST_HOTEL_RENDER_BATCH_SIZE = 40;
const HOTEL_RENDER_BATCH_SIZE = 300;
const MAX_FILTER_REQUEST_ATTEMPTS = 3;
const LIST_ROW_HEIGHT = 310;
const GRID_ROW_HEIGHT = 650;
const VIRTUAL_OVERSCAN_ROWS = 5;
const INITIAL_VIRTUAL_ITEM_COUNT = 24;

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

export const buildHotelFilterCounts = (hotels = []) => {
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
      else if (price < 4500)
        incrementCount(counts, "priceBuckets", "2500-4500");
      else if (price < 7000)
        incrementCount(counts, "priceBuckets", "4500-7000");
      else if (price < 11000)
        incrementCount(counts, "priceBuckets", "7000-11000");
      else if (price < 17000)
        incrementCount(counts, "priceBuckets", "11000-17000");
      else incrementCount(counts, "priceBuckets", "17000+");
    }

    if (hasText(hotel, "breakfast"))
      incrementCount(counts, "suggested", "breakfastIncluded");
    if (hasText(hotel, "deal", "discount"))
      incrementCount(counts, "suggested", "lastMinuteDeals");
    if (hasText(hotel, "reward"))
      incrementCount(counts, "suggested", "oneClickRewards");

    if (hasText(hotel, "homestay"))
      incrementCount(counts, "propertyType", "homestay");
    else if (hasText(hotel, "villa"))
      incrementCount(counts, "propertyType", "villa");
    else if (hasText(hotel, "cottage"))
      incrementCount(counts, "propertyType", "cottage");
    else if (hasText(hotel, "resort"))
      incrementCount(counts, "propertyType", "resort");
    else if (hasText(hotel, "apartment"))
      incrementCount(counts, "propertyType", "apartment");
    else if (hasText(hotel, "hostel"))
      incrementCount(counts, "propertyType", "hostel");
    else if (hasText(hotel, "guest house"))
      incrementCount(counts, "propertyType", "guestHouse");
    else incrementCount(counts, "propertyType", "hotel");

    if (hasText(hotel, "garden")) incrementCount(counts, "roomViews", "garden");
    if (hasText(hotel, "mountain"))
      incrementCount(counts, "roomViews", "mountain");
    if (hasText(hotel, "valley")) incrementCount(counts, "roomViews", "valley");
    if (hasText(hotel, "lake")) incrementCount(counts, "roomViews", "lake");
    if (hasText(hotel, "city")) incrementCount(counts, "roomViews", "city");
    if (hasText(hotel, "forest")) incrementCount(counts, "roomViews", "forest");

    if (hasText(hotel, "balcony"))
      incrementCount(counts, "roomAmenities", "balcony");
    if (hasText(hotel, "bathtub"))
      incrementCount(counts, "roomAmenities", "bathtub");
    if (hasText(hotel, "fireplace"))
      incrementCount(counts, "roomAmenities", "fireplace");
    if (hasText(hotel, "kitchenette", "kitchen"))
      incrementCount(counts, "roomAmenities", "kitchenette");
    if (hasText(hotel, "coffee"))
      incrementCount(counts, "roomAmenities", "coffeeMachine");
    if (hasText(hotel, "room service"))
      incrementCount(counts, "roomAmenities", "roomService");
    if (hasText(hotel, "private pool"))
      incrementCount(counts, "roomAmenities", "privatePool");
    if (hasText(hotel, "jacuzzi"))
      incrementCount(counts, "roomAmenities", "jacuzzi");
    if (hasText(hotel, "air conditioning"))
      incrementCount(counts, "roomAmenities", "airConditioning");
    if (hasText(hotel, "mini bar", "minibar"))
      incrementCount(counts, "roomAmenities", "miniBar");
    if (hasText(hotel, "smart tv"))
      incrementCount(counts, "roomAmenities", "smartTv");

    if (hasText(hotel, "wi-fi", "wifi", "internet"))
      incrementCount(counts, "hotelAmenities", "wifi");
    if (hasText(hotel, "pool"))
      incrementCount(counts, "hotelAmenities", "swimmingPool");
    if (hasText(hotel, "spa")) incrementCount(counts, "hotelAmenities", "spa");
    if (hasText(hotel, "gym", "fitness"))
      incrementCount(counts, "hotelAmenities", "gym");
    if (hasText(hotel, "restaurant"))
      incrementCount(counts, "hotelAmenities", "restaurant");
    if (hasText(hotel, "bar")) incrementCount(counts, "hotelAmenities", "bar");
    if (hasText(hotel, "parking"))
      incrementCount(counts, "hotelAmenities", "parking");
    if (hasText(hotel, "shuttle"))
      incrementCount(counts, "hotelAmenities", "airportShuttle");
    if (hasText(hotel, "pet"))
      incrementCount(counts, "hotelAmenities", "petFriendly");
    if (hasText(hotel, "business"))
      incrementCount(counts, "hotelAmenities", "businessCentre");
    if (hasText(hotel, "laundry"))
      incrementCount(counts, "hotelAmenities", "laundry");

    if (hasText(hotel, "marriott"))
      incrementCount(counts, "hotelChains", "marriott");
    if (hasText(hotel, "hilton"))
      incrementCount(counts, "hotelChains", "hilton");
    if (hasText(hotel, "ihg")) incrementCount(counts, "hotelChains", "ihg");
    if (hasText(hotel, "hyatt")) incrementCount(counts, "hotelChains", "hyatt");
    if (hasText(hotel, "radisson"))
      incrementCount(counts, "hotelChains", "radisson");
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

const getFilterNumber = (value) => {
  const directNumber = Number(value);
  if (Number.isFinite(directNumber)) return directNumber;

  const matchedNumber = String(value || "").match(/\d+(?:\.\d+)?/)?.[0];
  return matchedNumber === undefined ? NaN : Number(matchedNumber);
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
  breakfastIncluded: {
    BreakfastIncluded: ["breakfast"],
  },
  freeCancellation: {
    FreeCancellation: ["free cancellation", "free cancellation available"],
  },
  refundable: {
    Refundable: ["refundable"],
  },
  neighbourhoods: {},
  providers: {},
};

const matchesAnyTextFilter = (hotel, group, keys) =>
  keys.some((key) => {
    if (group === "suggested" && key === "fiveStar") {
      return Math.round(Number(hotel?.rating || 0)) === 5;
    }
    if (group === "suggested" && key === "fourStar") {
      return Math.round(Number(hotel?.rating || 0)) === 4;
    }

    if (group === "freeCancellation") {
      const val =
        hotel?.freeCancellation ??
        hotel?.raw?.freeCancellation ??
        hotel?.raw?.free_cancellation;
      if (val !== undefined && val !== null) {
        return Boolean(val);
      }
    }

    if (group === "refundable") {
      const val =
        hotel?.isRefundable ??
        hotel?.raw?.isRefundable ??
        hotel?.raw?.refundable;
      if (val !== undefined && val !== null) {
        return Boolean(val);
      }
    }

    if (group === "breakfastIncluded") {
      const val =
        hotel?.freeBreakfast ??
        hotel?.raw?.freeBreakfast ??
        hotel?.raw?.breakfastIncluded;
      if (val !== undefined && val !== null) {
        return Boolean(val);
      }
    }

    if (group === "propertyType") {
      const propType = String(
        hotel?.propertyType ||
          hotel?.raw?.propertyType ||
          hotel?.raw?.property_type ||
          hotel?.raw?.type ||
          "",
      )
        .trim()
        .toLowerCase();
      const targetKey = String(key || "")
        .trim()
        .toLowerCase();

      if (propType) {
        return propType === targetKey;
      }
    }

    if (group === "providers") {
      const provider = String(
        hotel?.priceProvider ||
          hotel?.raw?.sourceProvider ||
          hotel?.raw?.provider ||
          "",
      )
        .trim()
        .toLowerCase();
      const rawProviders = Array.isArray(hotel?.raw?.providers)
        ? hotel.raw.providers.map((p) => String(p).trim().toLowerCase())
        : [];
      const targetKey = String(key || "")
        .trim()
        .toLowerCase();

      return provider === targetKey || rawProviders.includes(targetKey);
    }

    if (group === "hotelChains") {
      const chain = String(
        hotel?.raw?.chainName ||
          hotel?.raw?.brandName ||
          hotel?.raw?.hotelChain ||
          hotel?.raw?.chain ||
          "",
      )
        .trim()
        .toLowerCase();
      const targetKey = String(key || "")
        .trim()
        .toLowerCase();

      if (chain) {
        return chain.includes(targetKey);
      }
    }

    if (group === "hotelAmenities") {
      const targetKey = String(key || "")
        .trim()
        .toLowerCase();
      const needles = TEXT_FILTER_NEEDLES.hotelAmenities?.[key] || [targetKey];
      const rawFacilities = Array.isArray(hotel?.raw?.facilities)
        ? hotel.raw.facilities
        : Array.isArray(hotel?.raw?.amenities)
          ? hotel.raw.amenities
          : [];

      const facilityNames = [
        ...(hotel?.facilities || []).map((f) =>
          String(f.name || f).toLowerCase(),
        ),
        ...rawFacilities.map((f) =>
          typeof f === "string"
            ? f.toLowerCase()
            : String(
                f?.name || f?.facilityName || f?.label || f?.description || "",
              ).toLowerCase(),
        ),
      ].filter(Boolean);

      if (facilityNames.length) {
        return facilityNames.some((name) =>
          needles.some((needle) => name.includes(needle.toLowerCase())),
        );
      }
    }

    const needles = TEXT_FILTER_NEEDLES[group]?.[key] || [key];
    return hasText(hotel, ...needles);
  });

export const matchesHotelFilters = (hotel, filters = {}) => {
  const price = getHotelPriceNumber(hotel);
  const rating = Number(hotel.rating || 0);
  const hotelSearchText = String(filters.hotelSearchText || "").trim();

  if (hotelSearchText && !hasText(hotel, hotelSearchText)) {
    return false;
  }

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
    console.log("start rating", filters.starCategory);
    const matchesStar = selectedKeys(filters.starCategory).some(
      (key) => Math.round(rating) === getFilterNumber(key),
    );
    if (!matchesStar) return false;
  }

  if (hasSelectedValues(filters.guestRating)) {
    const matchesGuestRating = selectedKeys(filters.guestRating).some(
      (key) => rating >= getFilterNumber(key),
    );
    if (!matchesGuestRating) return false;
  }

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

  if (normalizedName.includes("wifi") || normalizedName.includes("internet")) {
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

  return uniqueFacilities.map((name) => ({
    name,
    icon: getFacilityIcon(name),
  }));
};

export const HotelFacilities = ({ facilities = [], onShowMore }) => {
  const hasMoreFacilities = facilities.length > 6;
  const visibleFacilities = facilities.slice(0, 6);

  if (!facilities.length) {
    return <div className={styles.noFacilities}>No facilities available</div>;
  }

  return (
    <div className={styles.featuresCont}>
      {visibleFacilities.map((facility, index) => (
        <div className={styles.featureItem} key={`${facility.name}-${index}`}>
          <img src={facility.icon} alt="" />
          <p>{facility.name}</p>
          {index < visibleFacilities.length - 1 && <span>•</span>}
        </div>
      ))}
      {hasMoreFacilities && (
        <button
          type="button"
          className={styles.facilitiesToggle}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onShowMore?.(facilities);
          }}
        >
          ...see more
        </button>
      )}
    </div>
  );
};

const HotelFacilitiesModal = ({ facilities = [], onClose }) =>
  createPortal(
    <div
      className={styles.facilitiesModalOverlay}
      role="dialog"
      aria-modal="true"
      aria-label="All hotel facilities"
      onClick={onClose}
    >
      <div
        className={styles.facilitiesModal}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.facilitiesModalHeader}>
          <h3>Amenities</h3>
          <button type="button" aria-label="Close facilities" onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.facilitiesModalBody}>
          {facilities.map((facility, index) => (
            <div
              className={styles.facilitiesModalItem}
              key={`${facility.name}-${index}`}
            >
              <span className={styles.facilitiesModalIcon}>
                <img src={facility.icon} alt="" />
              </span>
              <span>{facility.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );

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

const EmptyHotelState = ({
  locationLabel,
  searchText = "",
  hasActiveFilters = false,
}) => (
  <div className={styles.emptyState}>
    <img
      className={styles.emptyStateImage}
      src="/images/CouldntFind.svg"
      alt="No hotels found"
    />
    <div className={styles.emptyStateText}>
      <h3>
        {searchText
          ? `No hotels found matching “${searchText}”`
          : hasActiveFilters
            ? "No hotels found matching your selected filters"
            : `No hotels found for ${locationLabel || "this location"}`}
      </h3>
      <p>
        {searchText
          ? "Try another hotel name or clear the search filter."
          : hasActiveFilters
            ? "Try clearing or adjusting some of your sidebar filters to see more results."
            : "We could not find stays for this search. Try a nearby area, different dates, or update your rooms and guests."}
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
            <img src="/icons/hotelCheck.svg" alt="" />
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

const normalizeHotelSearchText = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getHotelNameMatchScore = (hotel, selectedHotelName) => {
  const hotelName = normalizeHotelSearchText(getHotelDisplayName(hotel));
  const searchName = normalizeHotelSearchText(selectedHotelName);

  if (!hotelName || !searchName) return 0;
  if (hotelName === searchName) return 1000;
  if (hotelName.startsWith(searchName)) return 800;
  if (hotelName.includes(searchName)) return 600;

  const searchWords = searchName.split(" ").filter(Boolean);
  const matchingWordCount = searchWords.filter((word) =>
    hotelName.includes(word),
  ).length;

  if (matchingWordCount === searchWords.length) return 400;
  return matchingWordCount * 50;
};

const prioritizeSelectedHotel = (hotels = [], selectedHotelName = "") =>
  hotels
    .map((hotel, originalIndex) => ({
      hotel,
      originalIndex,
      matchScore: getHotelNameMatchScore(hotel, selectedHotelName),
    }))
    .sort(
      (left, right) =>
        right.matchScore - left.matchScore ||
        left.originalIndex - right.originalIndex,
    )
    .map(({ hotel }) => hotel);

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
          Math.round(
            (checkOutDate.getTime() - checkInDate.getTime()) / 86400000,
          ),
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

const writeSlimStoredHotelResults = (payload = {}, result = {}, meta = {}) => {
  if (typeof window === "undefined" || !result?.hotels?.length) return;

  try {
    window.sessionStorage.setItem(
      HOTEL_SEARCH_RESULTS_KEY,
      JSON.stringify({
        channel: payload?.channel || "",
        type: getHotelSocketType(payload) || payload?.type || "HOTEL_RESULTS",
        source: result.source || "hotels",
        hotelCount: result.hotels.length,
        searchId: meta.searchId || result.meta?.searchId || "",
        hotelSearchId: meta.hotelSearchId || result.meta?.hotelSearchId || "",
        searchTracingKey:
          meta.searchTracingKey || result.meta?.searchTracingKey || "",
      }),
    );
  } catch {
    // Keep rendering even if session storage is unavailable.
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
    searchTracingKey:
      payload.searchTracingKey ||
      getSearchParam(searchParams, "searchTracingKey", "tui", "TUI") ||
      findDeepValue(hotel, "searchTracingKey") ||
      findDeepValue(hotel, "SearchTracingKey") ||
      findDeepValue(hotel, "searchTracingkey") ||
      findDeepValue(hotel, "search_tracing_key") ||
      findDeepValue(hotel, "roomsSearchTracingKey") ||
      findDeepValue(hotel, "RoomsSearchTracingKey") ||
      findDeepValue(hotel, "TUI") ||
      findDeepValue(hotel, "tui") ||
      findDeepValue(storedHotelSearch, "searchTracingKey") ||
      findDeepValue(storedHotelSearch, "SearchTracingKey") ||
      findDeepValue(storedHotelSearch, "searchTracingkey") ||
      findDeepValue(storedHotelSearch, "search_tracing_key") ||
      findDeepValue(storedHotelSearch, "roomsSearchTracingKey") ||
      findDeepValue(storedHotelSearch, "RoomsSearchTracingKey") ||
      findDeepValue(storedHotelSearch, "TUI") ||
      findDeepValue(storedHotelSearch, "tui") ||
      findDeepValue(storedHotelResults, "searchTracingKey") ||
      findDeepValue(storedHotelResults, "SearchTracingKey") ||
      findDeepValue(storedHotelResults, "searchTracingkey") ||
      findDeepValue(storedHotelResults, "search_tracing_key") ||
      findDeepValue(storedHotelResults, "roomsSearchTracingKey") ||
      findDeepValue(storedHotelResults, "RoomsSearchTracingKey") ||
      findDeepValue(storedHotelResults, "TUI") ||
      findDeepValue(storedHotelResults, "tui"),
    roomsSearchTracingKey:
      payload.roomsSearchTracingKey ||
      payload.searchTracingKey ||
      findDeepValue(storedHotelSearch, "roomsSearchTracingKey") ||
      findDeepValue(storedHotelSearch, "searchTracingKey") ||
      findDeepValue(storedHotelResults, "roomsSearchTracingKey") ||
      findDeepValue(storedHotelResults, "searchTracingKey"),
    TUI:
      payload.TUI ||
      payload.searchTracingKey ||
      findDeepValue(storedHotelSearch, "TUI") ||
      findDeepValue(storedHotelSearch, "searchTracingKey") ||
      findDeepValue(storedHotelResults, "TUI") ||
      findDeepValue(storedHotelResults, "searchTracingKey"),
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
  const [selectedHotelSearchKey, setSelectedHotelSearchKey] = useState("");
  const [modalFacilities, setModalFacilities] = useState([]);
  useBodyScrollLock(modalFacilities.length > 0);
  const [hotelResults, setHotelResults] = useState([]);
  const [apiFilterData, setApiFilterData] = useState(null);
  const [totalHotelResults, setTotalHotelResults] = useState(0);
  const [isHotelLoading, setIsHotelLoading] = useState(
    Boolean(hotelSearchChannel),
  );
  const [hotelResultSource, setHotelResultSource] = useState("");
  const [socketSearchMeta, setSocketSearchMeta] = useState({
    searchId: "",
    hotelSearchId: "",
    searchTracingKey: "",
  });
  const [mergedFilterSearchMeta, setMergedFilterSearchMeta] = useState({
    searchId: "",
    hotelSearchId: "",
  });
  const [hasMergedHotelResponse, setHasMergedHotelResponse] = useState(false);
  const [hasHotelInitComplete, setHasHotelInitComplete] =
    useState(!hotelSearchChannel);
  const [shouldShowEmptyHotelState, setShouldShowEmptyHotelState] =
    useState(false);
  const [isFilterLoading, setIsFilterLoading] = useState(
    Boolean(hotelSearchChannel),
  );
  const [filterRetryNonce, setFilterRetryNonce] = useState(0);
  const [filterRefreshNonce, setFilterRefreshNonce] = useState(0);
  const [loadingHotelDetailsId, setLoadingHotelDetailsId] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [sortType, setSortType] = useState("recent");
  const [scrollState, setScrollState] = useState({
    scrollY: 0,
    viewportHeight: 0,
    viewportWidth: 0,
  });
  const searchQueryString = searchParams.toString();
  const filterSearchParams = useMemo(() => {
    const params = new URLSearchParams(searchQueryString);

    return {
      city: params.get("city") || "",
      checkIn: params.get("checkIn") || "",
      checkOut: params.get("checkOut") || "",
      rooms: params.get("rooms") || "",
      adults: params.get("adults") || "",
      children: params.get("children") || "",
      childAges: params.get("childAges") || "",
      locationId: params.get("locationId") || "",
      country: params.get("country") || "",
      state: params.get("state") || "",
      hotelSearchId:
        params.get("hotelSearchId") || params.get("hotelsearchid") || "",
    };
  }, [searchQueryString]);
  const staySummary = useMemo(
    () => getStaySummary(searchParams),
    [searchParams],
  );
  const searchIdFromUrl =
    searchParams.get("searchId") ||
    searchParams.get("searchid") ||
    searchParams.get("SearchId") ||
    "";
  const activeSearchId = useMemo(() => {
    if (socketSearchMeta.searchId) return socketSearchMeta.searchId;

    if (searchIdFromUrl) return searchIdFromUrl;

    const hotelSearchId = hotelResults.find(
      (hotel) => hotel.searchId,
    )?.searchId;
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
  }, [
    hotelResults,
    hotelSearchChannel,
    searchIdFromUrl,
    socketSearchMeta.searchId,
  ]);
  const filterSearchId = hotelSearchChannel
    ? mergedFilterSearchMeta.searchId
    : activeSearchId;
  const filterHotelSearchId = hotelSearchChannel
    ? mergedFilterSearchMeta.hotelSearchId
    : socketSearchMeta.hotelSearchId || filterSearchParams.hotelSearchId;
  useEffect(() => {
    latestFilterSearchMetaRef.current = {
      searchId: filterSearchId,
      hotelSearchId: filterHotelSearchId,
    };
  }, [filterHotelSearchId, filterSearchId]);
  const searchLocationLabel = useMemo(
    () => getSearchLocationLabel(searchParams),
    [searchParams],
  );
  const selectedHotelSearch = useMemo(() => {
    const storedSearch = readStoredHotelSearch() || {};
    const storedLocation = storedSearch.location || {};
    const selectedType = String(
      searchParams.get("searchType") ||
        storedSearch.searchType ||
        storedLocation.type ||
        storedLocation.raw?.type ||
        "",
    )
      .trim()
      .toLowerCase();

    if (selectedType !== "hotel") return null;

    return {
      name: String(
        searchParams.get("hotelName") ||
          storedSearch.selectedHotelName ||
          storedLocation.value ||
          storedLocation.label ||
          storedLocation.name ||
          filterSearchParams.city ||
          "",
      ).trim(),
    };
  }, [filterSearchParams.city, searchParams]);
  const filterDataPayload = useMemo(
    () => ({
      searchId: filterSearchId,
      hotelSearchId: filterHotelSearchId,
      city: filterSearchParams.city,
      checkIn: filterSearchParams.checkIn,
      checkOut: filterSearchParams.checkOut,
      channel: hotelSearchChannel,
      rooms: filterSearchParams.rooms,
      adults: filterSearchParams.adults,
      children: filterSearchParams.children,
      childAges: filterSearchParams.childAges,
      locationId: filterSearchParams.locationId,
      country: filterSearchParams.country,
      state: filterSearchParams.state,
    }),
    [
      filterHotelSearchId,
      filterSearchId,
      filterSearchParams,
      hotelSearchChannel,
    ],
  );
  const filterDataRequestKey = useMemo(
    () => JSON.stringify(filterDataPayload),
    [filterDataPayload],
  );
  const hotelResultSourceRef = useRef("");
  const normalizeRunRef = useRef(0);
  const listSectionRef = useRef(null);
  const hotelDetailsAbortRef = useRef(null);
  const hotelDetailsRequestRef = useRef(0);
  const lastFilterRequestKeyRef = useRef("");
  const latestFilterSearchMetaRef = useRef({ searchId: "", hotelSearchId: "" });
  const initCompleteFilterSearchIdRef = useRef("");
  const lastMergedFilterPayloadKeyRef = useRef("");
  const filterRetryTimerRef = useRef(null);
  const filterRequestSeriesRef = useRef("");
  const filterRequestAttemptRef = useRef(0);
  const hasLoadedFilterDataRef = useRef(false);
  const queryClient = useQueryClient();

  const { data: wishlistData } = useQuery({
    queryKey: ["user-wishlists", "hotel"],
    queryFn: () => fetchUserWishlists("hotel"),
  });

  useEffect(() => {
    const wishlistGroups = Object.entries(wishlistData || {});
    const wishlistHotelIds = wishlistGroups.flatMap(([, group]) =>
      (group?.data || []).map((item) =>
        String(
          item.hotelId || item.hotel_id || item.id || item.documentId || "",
        ),
      ),
    );

    setLikedTours([...new Set(wishlistHotelIds.filter(Boolean))]);
    setWishlists(wishlistGroups);
  }, [wishlistData]);

  const { mutate: addHotelToWishlist, isPending: isAddingToWishlist } =
    useMutation({
      mutationFn: ({ hotelId, hotelSearchKey }) =>
        createWishlist({
          type: "hotel",
          ids: [hotelId],
          hotelSearchKey,
        }),
      onSuccess: (_data, { hotelId }) => {
        setLikedTours((prev) =>
          prev.includes(hotelId) ? prev : [...prev, hotelId],
        );
        queryClient.invalidateQueries({
          queryKey: ["user-wishlists", "hotel"],
        });
      },
      onError: (error) => {
        if (
          error?.message === "Not authenticated" ||
          error?.response?.status === 401 ||
          error?.response?.status === 403
        ) {
          openLoginModal();
          return;
        }

        appToast.error(
          error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            error?.message ||
            "Failed to add hotel to wishlist",
        );
      },
    });

  const handleHeartClick = (hotel) => {
    const hotelId = getHotelDetailsPayload(hotel).hotelId;
    const wishlistHotelId = String(hotelId || hotel?.id || "");

    if (!wishlistHotelId) return;

    setSelectedTourId(wishlistHotelId);
    const hotelSearchKey = String(
      hotel?.hotelSearchKey ||
        hotel?.hotel_search_key ||
        hotel?.raw?.hotelSearchKey ||
        hotel?.raw?.hotel_search_key ||
        hotel?.hotelSearchId ||
        hotel?.hotel_search_id ||
        "",
    );
    setSelectedHotelSearchKey(hotelSearchKey);
    addHotelToWishlist({ hotelId: wishlistHotelId, hotelSearchKey });
  };

  const handleCreateWishlist = () => {
    const hotelId = String(selectedTourId || "");
    if (hotelId) {
      setLikedTours((prev) =>
        prev.includes(hotelId) ? prev : [...prev, hotelId],
      );
    }

    const newWishlist = {
      id: Date.now(),
      name: "Wishlist",
      count: 0,
    };

    setWishlists((prev) => [...prev, newWishlist]);

    setIsCreateWishlistOpen(false);
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
    if (hotelSearchChannel && !hasHotelInitComplete) return;

    hotelDetailsAbortRef.current?.abort();

    const controller = new AbortController();
    const requestId = hotelDetailsRequestRef.current + 1;
    hotelDetailsRequestRef.current = requestId;
    hotelDetailsAbortRef.current = controller;

    const payload = getHotelDetailsRequest(hotel, searchParams);
    const loadingKey = getHotelLoadingKey(hotel);

    if (
      !payload.searchId ||
      !payload.hotelSearchId ||
      !payload.hotelId ||
      !payload.priceProvider
    ) {
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

      writeHotelDetailsForNavigation({ payload, hotel, details });
      router.push(getHotelDetailUrl(payload), { scroll: true });
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
    setSocketSearchMeta({
      searchId: "",
      hotelSearchId: "",
      searchTracingKey: "",
    });
    setMergedFilterSearchMeta({ searchId: "", hotelSearchId: "" });
    setHasMergedHotelResponse(false);
    setHasHotelInitComplete(!hotelSearchChannel);
    setShouldShowEmptyHotelState(false);
    setIsFilterLoading(Boolean(hotelSearchChannel));
    setFilterRetryNonce(0);
    setApiFilterData(null);
    hotelResultSourceRef.current = "";
    lastFilterRequestKeyRef.current = "";
    latestFilterSearchMetaRef.current = { searchId: "", hotelSearchId: "" };
    initCompleteFilterSearchIdRef.current = "";
    lastMergedFilterPayloadKeyRef.current = "";
    hasLoadedFilterDataRef.current = false;
    if (filterRetryTimerRef.current) {
      window.clearTimeout(filterRetryTimerRef.current);
      filterRetryTimerRef.current = null;
    }

    const normalizeHotelsInBatches = (hotels, meta = {}) => {
      const runId = normalizeRunRef.current + 1;
      normalizeRunRef.current = runId;
      setTotalHotelResults(hotels.length);
      const withSearchMeta = (hotel) => ({
        ...hotel,
        searchId: hotel.searchId || hotel.search_id || meta.searchId,
        hotelSearchId:
          hotel.hotelSearchId || hotel.hotel_search_id || meta.hotelSearchId,
        searchTracingKey:
          hotel.searchTracingKey ||
          hotel.search_tracing_key ||
          hotel.roomsSearchTracingKey ||
          hotel.TUI ||
          meta.searchTracingKey,
        requestId: hotel.requestId || hotel.request_id || meta.requestId,
        hotelSearchKey:
          hotel.hotelSearchKey || hotel.hotel_search_key || meta.hotelSearchKey,
      });

      const firstBatch = hotels
        .slice(0, FIRST_HOTEL_RENDER_BATCH_SIZE)
        .map((hotel, index) =>
          normalizeHotelCard(withSearchMeta(hotel), index),
        );

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

    const applyHotelResults = (payload, { fromCache = false } = {}) => {
      if (payload?.channel && payload.channel !== hotelSearchChannel) {
        return;
      }

      const initCompleteMeta = getInitCompleteSearchMeta(payload);
      if (getHotelSocketType(payload) === "HOTEL_INIT_COMPLETE" && !fromCache) {
        setHasHotelInitComplete(true);
      }
      if (initCompleteMeta.searchId && !fromCache) {
        if (filterRetryTimerRef.current) {
          window.clearTimeout(filterRetryTimerRef.current);
          filterRetryTimerRef.current = null;
        }
        hasLoadedFilterDataRef.current = false;
        lastFilterRequestKeyRef.current = "";
        filterRequestAttemptRef.current = 0;
        const initFilterKey = [
          initCompleteMeta.searchId,
          initCompleteMeta.hotelSearchId,
          getHotelSocketType(payload),
        ].join("|");
        initCompleteFilterSearchIdRef.current = initCompleteMeta.searchId;
        lastMergedFilterPayloadKeyRef.current = initFilterKey;
        setMergedFilterSearchMeta({
          searchId: initCompleteMeta.searchId,
          hotelSearchId: initCompleteMeta.hotelSearchId,
        });
        latestFilterSearchMetaRef.current = {
          searchId: initCompleteMeta.searchId,
          hotelSearchId: initCompleteMeta.hotelSearchId,
        };
        setSocketSearchMeta({
          searchId: initCompleteMeta.searchId,
          hotelSearchId: initCompleteMeta.hotelSearchId,
          searchTracingKey: initCompleteMeta.searchTracingKey,
        });
        setFilterRefreshNonce((value) => value + 1);
      }

      const payloadMeta = getHotelSearchMeta(
        getMessageContent(payload),
        getMessageData(payload),
        payload,
      );

      if (
        (payloadMeta.searchId || payloadMeta.hotelSearchId) &&
        (!fromCache || !hotelSearchChannel)
      ) {
        setSocketSearchMeta((prev) => ({
          searchId: payloadMeta.searchId || prev.searchId,
          hotelSearchId: payloadMeta.hotelSearchId || prev.hotelSearchId,
          searchTracingKey:
            payloadMeta.searchTracingKey || prev.searchTracingKey,
        }));
      }

      const failureMessage = getHotelFailureMessage(payload);
      if (failureMessage) {
        setIsHotelLoading(false);
        toast.error(failureMessage, { toastId: "hotel-search-result-failure" });
        return;
      }

      const nextResults = getHotelsFromMessage(payload);
      const streamedFilters = getHotelFiltersFromMessage(payload);

      if (hasUsableFilterData(streamedFilters)) {
        hasLoadedFilterDataRef.current = true;
        setApiFilterData(streamedFilters);
        setIsFilterLoading(false);
      }

      const filterMeta = getFilterSearchMetaFromPayload(
        payload,
        nextResults.hotels,
      );
      const firstResultWithMeta = nextResults.hotels.find(
        (hotel) =>
          hotel?.searchId ||
          hotel?.search_id ||
          hotel?.hotelSearchId ||
          hotel?.hotel_search_id,
      );
      const resultMeta = {
        searchId:
          firstResultWithMeta?.searchId ||
          firstResultWithMeta?.search_id ||
          nextResults.meta?.searchId ||
          "",
        hotelSearchId:
          firstResultWithMeta?.hotelSearchId ||
          firstResultWithMeta?.hotel_search_id ||
          nextResults.meta?.hotelSearchId ||
          "",
        searchTracingKey:
          firstResultWithMeta?.searchTracingKey ||
          firstResultWithMeta?.search_tracing_key ||
          firstResultWithMeta?.roomsSearchTracingKey ||
          firstResultWithMeta?.TUI ||
          nextResults.meta?.searchTracingKey ||
          "",
      };

      writeSlimStoredHotelResults(payload, nextResults, resultMeta);

      const sessionMeta = {
        searchId:
          initCompleteMeta.searchId ||
          payloadMeta.searchId ||
          resultMeta.searchId ||
          "",
        hotelSearchId:
          initCompleteMeta.hotelSearchId ||
          payloadMeta.hotelSearchId ||
          resultMeta.hotelSearchId ||
          "",
        searchTracingKey:
          initCompleteMeta.searchTracingKey ||
          payloadMeta.searchTracingKey ||
          resultMeta.searchTracingKey ||
          "",
      };

      if (
        !fromCache &&
        typeof window !== "undefined" &&
        (sessionMeta.searchId ||
          sessionMeta.hotelSearchId ||
          sessionMeta.searchTracingKey)
      ) {
        try {
          const storedSearch = window.sessionStorage.getItem(
            HOTEL_SEARCH_SESSION_KEY,
          );
          const currentSearchContext = storedSearch
            ? JSON.parse(storedSearch)
            : {};
          const data = getMessageData(payload);
          const init =
            data?.init ||
            data?.content?.init ||
            payload?.init ||
            currentSearchContext?.init;

          if (
            !currentSearchContext?.channel ||
            currentSearchContext.channel === hotelSearchChannel
          ) {
            window.sessionStorage.setItem(
              HOTEL_SEARCH_SESSION_KEY,
              JSON.stringify({
                ...currentSearchContext,
                channel: currentSearchContext?.channel || hotelSearchChannel,
                searchId:
                  sessionMeta.searchId || currentSearchContext?.searchId || "",
                hotelSearchId:
                  sessionMeta.hotelSearchId ||
                  currentSearchContext?.hotelSearchId ||
                  "",
                searchTracingKey:
                  sessionMeta.searchTracingKey ||
                  currentSearchContext?.searchTracingKey ||
                  "",
                roomsSearchTracingKey:
                  sessionMeta.searchTracingKey ||
                  currentSearchContext?.roomsSearchTracingKey ||
                  "",
                TUI:
                  sessionMeta.searchTracingKey ||
                  currentSearchContext?.TUI ||
                  "",
                init: compactHotelInit(init, sessionMeta),
                initResponse: null,
                initStatus:
                  getHotelSocketType(payload) === "HOTEL_INIT_COMPLETE"
                    ? "complete"
                    : currentSearchContext?.initStatus,
              }),
            );
          }
        } catch {
          // Keep rendering even if session storage is unavailable.
        }
      }

      if (
        isFilterSearchPayloadReady(payload, nextResults.source) &&
        filterMeta.searchId &&
        (!initCompleteFilterSearchIdRef.current ||
          filterMeta.searchId === initCompleteFilterSearchIdRef.current)
      ) {
        const nextMergedFilterPayloadKey = [
          filterMeta.searchId,
          filterMeta.hotelSearchId,
          nextResults.hotels.length,
          payloadMeta.requestId ||
            nextResults.meta?.requestId ||
            getHotelSocketType(payload),
        ].join("|");

        setMergedFilterSearchMeta((prev) => ({
          searchId: filterMeta.searchId,
          hotelSearchId: filterMeta.hotelSearchId || prev.hotelSearchId,
        }));
        latestFilterSearchMetaRef.current = {
          searchId: filterMeta.searchId,
          hotelSearchId:
            filterMeta.hotelSearchId ||
            latestFilterSearchMetaRef.current.hotelSearchId,
        };
        if (
          lastMergedFilterPayloadKeyRef.current !== nextMergedFilterPayloadKey
        ) {
          lastMergedFilterPayloadKeyRef.current = nextMergedFilterPayloadKey;
          hasLoadedFilterDataRef.current = false;
          lastFilterRequestKeyRef.current = "";
          setFilterRefreshNonce((value) => value + 1);
        }
        setHasMergedHotelResponse(true);
      }

      if (
        (resultMeta.searchId ||
          resultMeta.hotelSearchId ||
          resultMeta.searchTracingKey) &&
        (!fromCache || !hotelSearchChannel)
      ) {
        setSocketSearchMeta((prev) => ({
          searchId: resultMeta.searchId || prev.searchId,
          hotelSearchId: resultMeta.hotelSearchId || prev.hotelSearchId,
          searchTracingKey:
            resultMeta.searchTracingKey || prev.searchTracingKey,
        }));
      }

      if (!nextResults.hotels.length) {
        if (isHotelTerminalPayload(payload) && !fromCache) {
          setShouldShowEmptyHotelState(true);
          setIsHotelLoading(false);
        }
        return;
      }
      setShouldShowEmptyHotelState(false);
      if (
        !shouldApplyHotelResults(
          hotelResultSourceRef.current,
          nextResults.source,
        )
      ) {
        return;
      }

      normalizeHotelsInBatches(nextResults.hotels, {
        ...nextResults.meta,
        ...resultMeta,
      });
      hotelResultSourceRef.current = nextResults.source;
      setHotelResultSource(nextResults.source);
    };

    const handleHotelResults = (event) => {
      applyHotelResults(event.detail);
    };

    window.addEventListener(HOTEL_SEARCH_RESULTS_EVENT, handleHotelResults);

    const cachedResults = window.sessionStorage.getItem(
      HOTEL_SEARCH_RESULTS_KEY,
    );
    if (cachedResults) {
      try {
        const cachedPayload = JSON.parse(cachedResults);
        if (
          !hotelSearchChannel ||
          cachedPayload?.channel === hotelSearchChannel
        ) {
          applyHotelResults(cachedPayload, { fromCache: true });
        }
      } catch {
        // Ignore stale malformed session data.
      }
    }

    return () => {
      normalizeRunRef.current += 1;
      window.removeEventListener(
        HOTEL_SEARCH_RESULTS_EVENT,
        handleHotelResults,
      );
    };
  }, [hotelSearchChannel]);

  useEffect(() => {
    setIsFilterLoading(
      Boolean(hotelSearchChannel) && !hasUsableFilterData(apiFilterData),
    );
  }, [apiFilterData, hotelSearchChannel]);

  const hasActiveHotelSearch = Boolean(hotelSearchChannel);
  const sourceHotels = useMemo(
    () => (hotelResults.length || hasActiveHotelSearch ? hotelResults : []),
    [hasActiveHotelSearch, hotelResults],
  );

  const sortedHotels = useMemo(() => {
    const normallySortedHotels = sortHotels(sourceHotels, sortType);

    if (sortType !== "recent" || !selectedHotelSearch?.name) {
      return normallySortedHotels;
    }

    return prioritizeSelectedHotel(
      normallySortedHotels,
      selectedHotelSearch.name,
    );
  }, [selectedHotelSearch, sourceHotels, sortType]);

  const displayHotels = useMemo(
    () =>
      sortedHotels.filter((hotel) =>
        matchesHotelFilters(hotel, appliedFilters),
      ),
    [appliedFilters, sortedHotels],
  );

  useEffect(() => {
    setFilterData(apiFilterData || null);
    setHotels(hotelResults);
    setMeta({
      channel: hotelSearchChannel,
      searchId: activeSearchId,
      source: hotelResultSource,
      hasApiResults: hotelResults.length > 0,
      isFilterLoading,
    });
    setTotalResults(displayHotels.length);
  }, [
    displayHotels.length,
    hotelResultSource,
    hotelResults,
    hotelSearchChannel,
    activeSearchId,
    apiFilterData,
    isFilterLoading,
    setFilterData,
    setHotels,
    setMeta,
    setTotalResults,
    sourceHotels,
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
    () => displayHotels.slice(virtualWindow.startIndex, virtualWindow.endIndex),
    [displayHotels, virtualWindow.endIndex, virtualWindow.startIndex],
  );

  const hotelNameSearchText = String(
    appliedFilters.hotelSearchText || "",
  ).trim();
  const hasNoHotelNameMatches =
    Boolean(hotelNameSearchText) &&
    sourceHotels.length > 0 &&
    displayHotels.length === 0;
  const hasActiveFilters = Boolean(
    hotelNameSearchText ||
    Object.values(appliedFilters).some((group) => {
      if (!group) return false;
      if (typeof group === "object") {
        return Object.values(group).some(Boolean);
      }
      return Boolean(group);
    }),
  );
  const showEmptyState = !isHotelLoading && displayHotels.length === 0;

  return (
    <>
      <section className={styles.tourListSection} ref={listSectionRef}>
        <SearchResults
          viewType={viewType}
          setViewType={setViewType}
          totalResults={displayHotels.length}
          locationLabel={searchLocationLabel}
          sort={sortType}
          setSort={setSortType}
        />

        {showEmptyState && (
          <EmptyHotelState
            locationLabel={searchLocationLabel}
            searchText={hasNoHotelNameMatches ? hotelNameSearchText : ""}
            hasActiveFilters={hasActiveFilters}
          />
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
                    <div
                      className={`${styles.skeletonLine} ${styles.skeletonStars}`}
                    ></div>
                    <div
                      className={`${styles.skeletonLine} ${styles.skeletonTitle}`}
                    ></div>
                    <div
                      className={`${styles.skeletonLine} ${styles.skeletonAddress}`}
                    ></div>
                    <div className={styles.skeletonFeatures}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <div
                      className={`${styles.skeletonLine} ${styles.skeletonBenefit}`}
                    ></div>
                    <div className={styles.skeletonFooter}>
                      <div
                        className={`${styles.skeletonLine} ${styles.skeletonPrice}`}
                      ></div>
                      <div
                        className={`${styles.skeletonLine} ${styles.skeletonButton}`}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            {visibleHotels.map((item, index) => (
              <div
                key={
                  item?.id ||
                  item?.api_hotel_id ||
                  item?.title ||
                  `hotel-grid-${index}`
                }
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
                    {/* <div className={styles.headerLeft}>
                      <div className={styles.new}>New</div>
                      <div className={styles.private}>Flagship</div>
                    </div> */}

                    <img
                      src={
                        likedTours.includes(String(item.id))
                          ? "/icons/heartIconFilled.svg"
                          : "/icons/heartIcon.svg"
                      }
                      alt="wishlist"
                      className={`${styles.heartIcon} ${styles.ListViewHeartIcon}`}
                      aria-disabled={isAddingToWishlist}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAddingToWishlist) return;
                        handleHeartClick(item);
                      }}
                    />
                  </div>
                </div>
                <div className={styles.gridCardText}>
                  <div className={styles.cartListTop}>
                    <div className={styles.ListViewCardTextTop}>
                      <div className={styles.topTextHead}>
                        <div className={styles.rating}>
                          <div>
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
                              <span>{item.reviewScoreText}</span>
                            </div>
                          </div>
                          <div className={styles.ReviewCount}>
                            ({item.reviewText})
                          </div>
                        </div>
                        <h2>{item.title}</h2>

                        <div className={styles.topTextHeadAddress}>
                          <img src="/icons/location.svg" alt="" />
                          <span>{item.route}</span>
                        </div>
                      </div>
                      <HotelFacilities
                        facilities={item.facilities}
                        onShowMore={setModalFacilities}
                      />
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
                      className={`${styles.bookNowBtn} ${styles.bookNowBtn2}`}
                      disabled={
                        (hotelSearchChannel && !hasHotelInitComplete) ||
                        loadingHotelDetailsId === getHotelLoadingKey(item)
                      }
                      onClick={() => handleBookNow(item)}
                    >
                      {loadingHotelDetailsId === getHotelLoadingKey(item)
                        ? "LOADING..."
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
                    <div
                      className={`${styles.skeletonLine} ${styles.skeletonStars}`}
                    ></div>
                    <div
                      className={`${styles.skeletonLine} ${styles.skeletonTitle}`}
                    ></div>
                    <div
                      className={`${styles.skeletonLine} ${styles.skeletonAddress}`}
                    ></div>
                    <div className={styles.skeletonFeatures}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <div
                      className={`${styles.skeletonLine} ${styles.skeletonBenefit}`}
                    ></div>
                    <div className={styles.skeletonFooter}>
                      <div
                        className={`${styles.skeletonLine} ${styles.skeletonPrice}`}
                      ></div>
                      <div
                        className={`${styles.skeletonLine} ${styles.skeletonButton}`}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            {visibleHotels.map((item, index) => (
              <div className={styles.ListViewCardContainer} key={item.id}>
                <div className={styles.ListViewCardImageContainer}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className={styles.ListViewCardImage}
                  />

                  <div
                    className={`${styles.cardItemHeader} ${styles.ListViewCardHeader}`}
                  >
                    {/* <div className={styles.headerLeft}>
                      <div className={styles.new}>New</div>
                      <div className={styles.private}>Flagship</div>
                    </div> */}

                    <img
                      src={
                        likedTours.includes(String(item.id))
                          ? "/icons/heartIconFilled.svg"
                          : "/icons/heartIcon.svg"
                      }
                      alt="wishlist"
                      className={styles.heartIcon}
                      aria-disabled={isAddingToWishlist}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAddingToWishlist) return;
                        handleHeartClick(item);
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
                          <div className={styles.ReviewCount}>
                            <span>{item.reviewScoreText}</span>(
                            {item.reviewText})
                          </div>
                        </div>
                        <h2>{item.title}</h2>

                        <div className={styles.topTextHeadAddress}>
                          <img src="/icons/location.svg" alt="" />
                          <span>{item.route}</span>
                        </div>
                      </div>
                      <HotelFacilities
                        facilities={item.facilities}
                        onShowMore={setModalFacilities}
                      />
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
                      disabled={
                        (hotelSearchChannel && !hasHotelInitComplete) ||
                        loadingHotelDetailsId === getHotelLoadingKey(item)
                      }
                      onClick={() => handleBookNow(item)}
                    >
                      {loadingHotelDetailsId === getHotelLoadingKey(item)
                        ? "LOADING..."
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

      {modalFacilities.length > 0 && (
        <HotelFacilitiesModal
          facilities={modalFacilities}
          onClose={() => setModalFacilities([])}
        />
      )}

      <CreateWishlistModal
        isOpen={isCreateWishlistOpen}
        onClose={() => setIsCreateWishlistOpen(false)}
        onCreate={handleCreateWishlist}
        onAuthRequired={openLoginModal}
        type="hotel"
        ids={selectedTourId ? [selectedTourId] : []}
        hotelSearchKey={selectedHotelSearchKey}
      />

      <SaveToWishlistModal
        onCreateNew={() => setIsCreateWishlistOpen(true)}
        isOpen={isSaveWishlistOpen}
        wishlists={wishlists}
        type="hotel"
        ids={selectedTourId ? [selectedTourId] : []}
        onAuthRequired={openLoginModal}
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

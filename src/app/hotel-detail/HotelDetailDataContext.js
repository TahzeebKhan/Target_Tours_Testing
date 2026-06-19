"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  HOTEL_DETAILS_KEY,
  fetchHotelDetails,
} from "@/shared/services/hotelSearch";

const FALLBACK_IMAGES = [
  "/images/hotelArt1.png",
  "/images/hotelArt2.png",
  "/images/hotelArt3.png",
  "/images/hotelArt2.png",
  "/images/hotelArt4.png",
];

const HotelDetailDataContext = createContext({
  hotelDetail: null,
  loading: true,
});

const readStoredHotelDetail = () => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(HOTEL_DETAILS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeStoredHotelDetail = (payload) => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(HOTEL_DETAILS_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage failures and keep the in-memory response.
  }
};

const getDetailRequestFromParams = (params) => {
  const request = {
    hotelId: params.get("hotelId") || "",
    searchId: params.get("searchId") || "",
    priceProvider: params.get("priceProvider") || "",
  };

  return request.hotelId && request.searchId && request.priceProvider
    ? request
    : null;
};

const getStoredHotelId = (stored) =>
  String(
    stored?.request?.hotelId ||
      stored?.hotel?.hotelId ||
      stored?.hotel?.id ||
      stored?.hotel?.raw?.id ||
      "",
  );

const getFirst = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const findFirstObject = (value, predicate, depth = 0, seen = new WeakSet()) => {
  if (!value || typeof value !== "object" || depth > 6) return null;
  if (seen.has(value)) return null;
  seen.add(value);

  if (!Array.isArray(value) && predicate(value)) return value;

  const entries = Array.isArray(value) ? value : Object.values(value);
  for (const entry of entries) {
    const found = findFirstObject(entry, predicate, depth + 1, seen);
    if (found) return found;
  }

  return null;
};

const collectImages = (value, images = [], depth = 0, seen = new WeakSet()) => {
  if (!value || images.length >= 12 || depth > 6) return images;

  if (typeof value === "string") {
    if (/^https?:\/\//.test(value) || value.startsWith("/images/")) {
      images.push(value);
    }
    return images;
  }

  if (typeof value !== "object" || seen.has(value)) return images;
  seen.add(value);

  if (Array.isArray(value)) {
    value.forEach((item) => collectImages(item, images, depth + 1, seen));
    return images;
  }

  [
    value.url,
    value.src,
    value.image,
    value.imageUrl,
    value.heroImage,
    value.thumbnail,
    value.links?.["1000px"]?.href,
    value.links?.["350px"]?.href,
  ].forEach((candidate) => collectImages(candidate, images, depth + 1, seen));

  ["images", "photos", "gallery", "media", "hotelImages"].forEach((key) => {
    collectImages(value[key], images, depth + 1, seen);
  });

  return images;
};

const normalizeRating = (rating) => {
  const numericRating = Number(rating);
  if (!Number.isFinite(numericRating)) return 5;
  return Math.max(0, Math.min(5, Math.round(numericRating)));
};

const formatCurrency = (value) => {
  const numericValue = Number(String(value || "").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numericValue)) return "₹ --";
  return `₹ ${numericValue.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const getRateValue = (hotel = {}) =>
  getFirst(
    hotel.rate?.ratePerNight,
    hotel.rate?.total,
    hotel.rate?.baseRate,
    hotel.rate?.publishedRate,
    hotel.rate?.net,
    hotel.rate?.amount,
    hotel.price?.total,
    hotel.price?.amount,
    hotel.price?.ratePerNight,
    hotel.total,
    hotel.totalAmount,
    hotel.totalFare,
    hotel.amount,
    hotel.price,
    hotel.minRate,
    hotel.totalRate,
    hotel.baseRate,
  );

const normalizeFacilities = (facilities = []) =>
  facilities
    .map((facility) =>
      typeof facility === "string" ? facility : facility?.name || facility?.label,
    )
    .filter(Boolean);

const getRecommendationRooms = (data = {}) => {
  const directRooms = [
    data.roomRates,
    data.roomTypes,
    data.availableRooms,
    data.rates,
  ].find(Array.isArray);

  if (directRooms) return directRooms.map((room) => ({ room }));

  if (Array.isArray(data.rooms)) {
    return data.rooms.map((room) => ({ room }));
  }

  const recommendations = data.rooms?.recommendations;
  if (!Array.isArray(recommendations)) return [];

  return recommendations.flatMap((recommendation, recommendationIndex) => {
    const roomGroup = Array.isArray(recommendation.roomGroup)
      ? recommendation.roomGroup
      : [];

    if (!roomGroup.length) {
      return [{ room: recommendation, recommendation, recommendationIndex }];
    }

    return roomGroup.map((room, roomIndex) => ({
      room,
      recommendation,
      recommendationIndex,
      roomIndex,
    }));
  });
};

const getRoomFeatureTexts = (room = {}, recommendation = {}, hotel = {}) => {
  const roomFacilities = normalizeFacilities(
    room.facilities || room.amenities || room.facilityGroups || [],
  );
  const hotelFacilities = normalizeFacilities(hotel.facilities || []);
  const inclusions = [
    room.boardBasis?.description,
    room.boardBasis,
    room.mealPlan,
    room.roomBasis,
    room.cancellationPolicy,
    recommendation.cancellationPolicy,
    ...(Array.isArray(room.inclusions) ? room.inclusions : []),
    ...(Array.isArray(recommendation.inclusions) ? recommendation.inclusions : []),
  ]
    .map((item) => (typeof item === "string" ? item : item?.description || item?.name))
    .filter(Boolean);

  return [...roomFacilities, ...inclusions, ...hotelFacilities]
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index)
    .slice(0, 10)
    .map((text) => ({
      icon: "/icons/greenTick.svg",
      text,
    }));
};

const normalizeRooms = (data = {}, hotel = {}) => {
  const rooms = getRecommendationRooms(data);
  const images = collectImages(data).length ? collectImages(data) : FALLBACK_IMAGES;
  const fallbackPrice = getRateValue(hotel);

  if (!rooms.length) {
    return [
      {
        id: hotel.id || hotel.hotelId || "selected-room",
        title: getFirst(hotel.roomName, "Selected Room"),
        image: images.map((img) => ({ img })),
        beds: getFirst(hotel.beds, hotel.bedType, "Room"),
        persons: getFirst(hotel.persons, hotel.occupancy, "Guests"),
        featuresLeft: normalizeFacilities(hotel.facilities).slice(0, 10).map((text) => ({
          icon: "/icons/greenTick.svg",
          text,
        })),
        benefits: [
          hotel.freeBreakfast ? "Free Breakfast" : "",
          hotel.freeCancellation || hotel.isRefundable ? "Free Cancellation" : "",
        ].filter(Boolean),
        cancellation:
          hotel.freeCancellation || hotel.isRefundable
            ? "Free Cancellation"
            : "Cancellation policy applies",
        rating: {
          label: "Excellent",
          reviews: "No reviews yet",
          score: String(normalizeRating(hotel.starRating || hotel.rating)),
        },
        price: {
          actual: formatCurrency(fallbackPrice),
          offer: formatCurrency(fallbackPrice),
          nights: "per night",
          taxes: hotel.rate?.taxes ? `+ ${formatCurrency(hotel.rate.taxes)} Taxes & fees` : "",
          bookWith: "₹ 0",
        },
      },
    ];
  }

  return rooms.map(({ room = {}, recommendation = {}, recommendationIndex, roomIndex }, index) => {
    const roomImages = collectImages(room);
    const roomPrice = getRateValue(room) || getRateValue(recommendation) || fallbackPrice;
    const taxes = getFirst(
      room.rate?.taxes,
      room.taxes,
      recommendation.rate?.taxes,
      recommendation.taxes,
    );
    const roomTitle = getFirst(
      room.name,
      room.title,
      room.roomName,
      room.description,
      recommendation.name,
      `Room Option ${index + 1}`,
    );
    const recommendationId = getFirst(recommendation.id, recommendation.recommendationId);

    return {
      id:
        room.id ||
        room.roomId ||
        `${recommendationId || "recommendation"}-${recommendationIndex ?? index}-${roomIndex ?? 0}`,
      title: roomTitle,
      image: (roomImages.length ? roomImages : images).map((img) => ({ img })),
      beds: getFirst(room.beds, room.bedType, room.bed, room.roomType, "Room"),
      persons: getFirst(room.persons, room.occupancy, room.guests, "Guests"),
      featuresLeft: getRoomFeatureTexts(room, recommendation, hotel),
      benefits: [
        room.freeBreakfast || recommendation.freeBreakfast || hotel.freeBreakfast ? "Free Breakfast" : "",
        room.freeCancellation ||
        recommendation.freeCancellation ||
        hotel.freeCancellation ||
        hotel.isRefundable
          ? "Free Cancellation"
          : "",
      ].filter(Boolean),
      cancellation:
        room.freeCancellation ||
        recommendation.freeCancellation ||
        hotel.freeCancellation ||
        hotel.isRefundable
          ? "Free Cancellation"
          : "Cancellation policy applies",
      rating: {
        label: "Excellent",
        reviews: "No reviews yet",
        score: String(normalizeRating(hotel.starRating || hotel.rating)),
      },
      price: {
        actual: formatCurrency(roomPrice),
        offer: formatCurrency(roomPrice),
        nights: "per night",
        taxes: taxes ? `+ ${formatCurrency(taxes)} Taxes & fees` : "",
        bookWith: "₹ 0",
      },
    };
  });
};

const normalizePolicies = (data = {}, hotel = {}) => {
  const policies = data.policies || data.hotelPolicies || data.policy || {};
  const policyArray = Array.isArray(policies) ? policies : [];

  if (policyArray.length) {
    return policyArray.map((policy) => ({
      title: String(policy.title || policy.name || "POLICY").toUpperCase(),
      description: policy.description || policy.text || policy.value || "",
    }));
  }

  return [
    {
      title: "CHECK-IN",
      description: getFirst(policies.checkIn, policies.checkin, "Check-in time varies by room"),
    },
    {
      title: "CHECK-OUT",
      description: getFirst(policies.checkOut, policies.checkout, "Check-out time varies by room"),
    },
    {
      title: "CANCELLATION/PREPAYMENT",
      description:
        hotel.freeCancellation || hotel.isRefundable
          ? "Free cancellation is available for this hotel."
          : "Cancellation and prepayment policies vary by room and rate.",
    },
    {
      title: "CHILDREN AND BEDS",
      description: "Child and extra bed policies depend on your selected room.",
    },
    {
      title: "PETS",
      description: "Pet policy depends on the property.",
    },
  ];
};

const findFirstArray = (value, predicate, depth = 0, seen = new WeakSet()) => {
  if (!value || typeof value !== "object" || depth > 6) return [];
  if (seen.has(value)) return [];
  seen.add(value);

  if (Array.isArray(value) && value.some(predicate)) return value;

  const entries = Array.isArray(value) ? value : Object.values(value);
  for (const entry of entries) {
    const found = findFirstArray(entry, predicate, depth + 1, seen);
    if (found.length) return found;
  }

  return [];
};

const normalizeReviewRating = (rating) => {
  const numericRating = Number(rating);
  if (!Number.isFinite(numericRating)) return 5;
  return Math.max(1, Math.min(5, Math.round(numericRating)));
};

const normalizeReviews = (data = {}, hotel = {}) => {
  const reviewSource =
    data.reviews ||
    data.customerReviews ||
    data.guestReviews ||
    data.reviewList ||
    hotel.reviews ||
    findFirstArray(data, (item) =>
      Boolean(item?.comment || item?.text || item?.review || item?.reviewText),
    );
  const reviewList = Array.isArray(reviewSource) ? reviewSource : [];

  return reviewList
    .map((review, index) => ({
      id: review.id || review.reviewId || `review-${index}`,
      name:
        review.name ||
        review.userName ||
        review.guestName ||
        review.author ||
        review.reviewerName ||
        "Guest",
      rating: normalizeReviewRating(
        review.rating || review.score || review.starRating || review.stars,
      ),
      time:
        review.time ||
        review.date ||
        review.createdAt ||
        review.reviewDate ||
        "",
      comment:
        review.comment ||
        review.text ||
        review.review ||
        review.reviewText ||
        review.description ||
        "",
      helpful: Number(review.helpful || review.helpfulCount || review.likes || 0),
    }))
    .filter((review) => review.comment);
};

const normalizeRatingBars = (data = {}, reviews = []) => {
  const histogram =
    data.ratingBars ||
    data.ratingHistogram ||
    data.reviewSummary?.ratingBars ||
    data.reviewSummary?.ratingHistogram ||
    data.ratings;

  if (Array.isArray(histogram) && histogram.length) {
    const maxValue = Math.max(
      ...histogram.map((item) => Number(item.value || item.count || 0)),
      1,
    );

    return histogram.map((item) => {
      const value = Number(item.value || item.count || 0);
      return {
        star: Number(item.star || item.rating || item.score || 0),
        value,
        percent: Number(item.percent || Math.round((value / maxValue) * 100)),
      };
    });
  }

  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    value: reviews.filter((review) => review.rating === star).length,
  }));
  const maxValue = Math.max(...counts.map((item) => item.value), 1);

  return counts.map((item) => ({
    ...item,
    percent: Math.round((item.value / maxValue) * 100),
  }));
};

const normalizeScoreDetails = (data = {}, hotel = {}) => {
  const scores =
    data.scoreDetails ||
    data.reviewSummary?.scoreDetails ||
    data.reviewSummary?.categories ||
    data.ratingCategories ||
    data.categoryRatings ||
    hotel.ratingCategories;

  if (Array.isArray(scores) && scores.length) {
    return scores
      .map((item) => ({
        label: item.label || item.name || item.category,
        score: Number(item.score || item.rating || item.value || 0),
      }))
      .filter((item) => item.label && Number.isFinite(item.score));
  }

  const rating = normalizeRating(getFirst(hotel.starRating, hotel.rating, data.starRating));
  return [
    { label: "Amenities", score: rating },
    { label: "Cleanliness", score: rating },
    { label: "Communication", score: rating },
    { label: "Location", score: rating },
    { label: "Value", score: rating },
  ];
};

const normalizeHotelDetail = (stored, routeHotelId = "") => {
  const detailsPayload = stored?.details || stored || {};
  const data = detailsPayload.data || detailsPayload;
  const foundHotel = findFirstObject(data, (item) => item.name && (item.address || item.heroImage));
  const hotel = {
    ...(stored?.hotel?.raw || {}),
    ...(foundHotel || {}),
    ...(stored?.hotel || {}),
  };
  const images = [
    hotel.heroImage,
    hotel.image,
    ...collectImages(data),
    ...collectImages(hotel),
  ].filter(Boolean);
  const uniqueImages = [...new Set(images)].slice(0, 12);
  const facilities = normalizeFacilities(
    getFirst(hotel.facilities, data.facilities, data.amenities, []),
  );
  const reviews = normalizeReviews(data, hotel);
  const ratingBars = normalizeRatingBars(data, reviews);
  const scoreDetails = normalizeScoreDetails(data, hotel);

  return {
    id: String(getFirst(hotel.id, hotel.hotelId, routeHotelId, "")),
    name: getFirst(hotel.name, hotel.title, data.name, "Hotel"),
    address: getFirst(hotel.address, data.address, hotel.route, hotel.locationName, ""),
    rating: normalizeRating(getFirst(hotel.starRating, hotel.rating, data.starRating)),
    reviewText: getFirst(data.reviewText, data.reviewsText, "No reviews yet"),
    images: uniqueImages.length ? uniqueImages : FALLBACK_IMAGES,
    description:
      getFirst(
        data.description,
        data.overview,
        data.about,
        hotel.description,
        hotel.overview,
      ) || `${getFirst(hotel.name, "This hotel")} details are being updated.`,
    amenities: facilities,
    policies: normalizePolicies(data, hotel),
    rooms: normalizeRooms(data, hotel),
    reviews,
    ratingBars,
    scoreDetails,
    request: stored?.request || {},
  };
};

export const HotelDetailDataProvider = ({ children }) => {
  const [routeHotelId, setRouteHotelId] = useState("");
  const [storedDetail, setStoredDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const params = new URLSearchParams(window.location.search);
    const request = getDetailRequestFromParams(params);
    const hotelId = request?.hotelId || params.get("hotelId") || "";
    const stored = readStoredHotelDetail();
    const storedHotelId = getStoredHotelId(stored);
    const canUseStored =
      stored && (!hotelId || !storedHotelId || storedHotelId === String(hotelId));

    setRouteHotelId(hotelId);

    if (canUseStored) {
      setStoredDetail(stored);
      setLoading(false);
      return undefined;
    }

    if (!request) {
      setStoredDetail(stored);
      setLoading(false);
      return undefined;
    }

    const loadHotelDetails = async () => {
      setLoading(true);

      try {
        const details = await fetchHotelDetails(request);
        const nextStoredDetail = {
          request,
          hotel: {},
          details,
        };

        writeStoredHotelDetail(nextStoredDetail);
        if (isMounted) setStoredDetail(nextStoredDetail);
      } catch (error) {
        console.error("Hotel details refresh failed:", error);
        if (isMounted) setStoredDetail(stored);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadHotelDetails();

    return () => {
      isMounted = false;
    };
  }, []);

  const hotelDetail = useMemo(
    () => normalizeHotelDetail(storedDetail, routeHotelId),
    [storedDetail, routeHotelId],
  );

  return (
    <HotelDetailDataContext.Provider value={{ hotelDetail, loading }}>
      {children}
    </HotelDetailDataContext.Provider>
  );
};

export const useHotelDetailData = () => useContext(HotelDetailDataContext);

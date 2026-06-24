"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  HOTEL_DETAILS_KEY,
  changeHotelAvailability,
  fetchHotelDetails,
  fetchHotelRooms,
  isMissingHotelAuthTokenError,
} from "@/shared/services/hotelSearch";

const roomsRequestCache = new Map();

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
  roomsLoading: false,
  refreshHotelAvailability: async () => null,
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
    checkIn: params.get("checkIn") || "",
    checkOut: params.get("checkOut") || "",
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

const getApiFailureMessage = (payload) => {
  const candidates = [
    payload?.data?.rooms,
    payload?.rooms,
    payload?.data?.content,
    payload?.content,
    payload?.data,
    payload,
  ];

  const failure = candidates.find(
    (item) =>
      item &&
      typeof item === "object" &&
      String(item.status || "").toLowerCase() === "failure" &&
      item.message,
  );

  return failure?.message || "";
};

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

  ["images", "photos", "gallery", "media", "hotelImages", "room", "roomGroup"].forEach((key) => {
    collectImages(value[key], images, depth + 1, seen);
  });

  return images;
};

const collectFacilities = (
  value,
  facilities = [],
  depth = 0,
  seen = new WeakSet(),
  fromFacilityList = false,
) => {
  if (!value || depth > 7) return facilities;

  if (typeof value === "string") {
    if (fromFacilityList) facilities.push(value);
    return facilities;
  }

  if (typeof value !== "object" || seen.has(value)) return facilities;
  seen.add(value);

  if (Array.isArray(value)) {
    value.forEach((item) =>
      collectFacilities(item, facilities, depth + 1, seen, fromFacilityList),
    );
    return facilities;
  }

  if (fromFacilityList && (value.name || value.label || value.description)) {
    facilities.push(value.name || value.label || value.description);
  }

  Object.entries(value).forEach(([key, entry]) => {
    const normalizedKey = key.toLowerCase();
    const isFacilityKey =
      normalizedKey.includes("facilit") ||
      normalizedKey.includes("amenit") ||
      normalizedKey === "facilitygroups";

    collectFacilities(
      entry,
      facilities,
      depth + 1,
      seen,
      fromFacilityList || isFacilityKey,
    );
  });

  return facilities;
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

const getCurrencyNumber = (value) => {
  const numericValue = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numericValue) ? numericValue : 0;
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

const getTaxValue = (...sources) =>
  sources.reduce((total, source) => {
    if (!source) return total;

    if (Array.isArray(source)) {
      return (
        total +
        source.reduce((sum, item) => sum + Number(item?.amount || item?.value || 0), 0)
      );
    }

    if (typeof source === "object") {
      return total + Number(source.amount || source.value || 0);
    }

    return total + Number(source || 0);
  }, 0);

const isSameAmount = (left, right) => {
  const leftAmount = getCurrencyNumber(left);
  const rightAmount = getCurrencyNumber(right);

  return leftAmount > 0 && rightAmount > 0 && Math.abs(leftAmount - rightAmount) < 0.01;
};

const normalizeGalleryTitle = (...values) =>
  values.find((value) => value !== undefined && value !== null && String(value).trim()) ||
  "";

const normalizeGalleryItem = (value, fallbackTitle = "", depth = 0) => {
  if (!value || depth > 3) return null;

  if (typeof value === "string") {
    if (/^https?:\/\//.test(value) || value.startsWith("/")) {
      return {
        image: value,
        title: fallbackTitle,
      };
    }

    return null;
  }

  if (typeof value !== "object") return null;

  const image =
    value.url ||
    value.src ||
    value.image ||
    value.imageUrl ||
    value.heroImage ||
    value.thumbnail ||
    value.links?.["1000px"]?.href ||
    value.links?.["350px"]?.href ||
    "";

  if (!image) return null;

  const title = normalizeGalleryTitle(
    value.caption,
    value.title,
    value.name,
    value.label,
    value.category,
    value.roomType,
    value.type,
    fallbackTitle,
  );

  return {
    image,
    title: String(title || "").trim(),
  };
};

const collectGalleryItems = (value, items = [], depth = 0, seen = new WeakSet()) => {
  if (!value || items.length >= 20 || depth > 6) return items;

  if (typeof value === "string") {
    const item = normalizeGalleryItem(value);
    if (item) items.push(item);
    return items;
  }

  if (typeof value !== "object" || seen.has(value)) return items;
  seen.add(value);

  if (Array.isArray(value)) {
    value.forEach((item) => collectGalleryItems(item, items, depth + 1, seen));
    return items;
  }

  const currentItem = normalizeGalleryItem(value);
  if (currentItem) items.push(currentItem);

  [
    value.images,
    value.galleryImages,
    value.photos,
    value.media,
    value.hotelImages,
    value.room,
    value.roomGroup,
    value.details,
    value.hotel,
  ].forEach((candidate) => collectGalleryItems(candidate, items, depth + 1, seen));

  return items;
};

const extractGalleryImages = (stored = {}, routeHotelId = "") => {
  const detailsPayload = stored?.details || stored || {};
  const data = detailsPayload.data || detailsPayload;
  const foundHotel = findFirstObject(data, (item) => item.name && (item.address || item.heroImage));
  const hotel = {
    ...(stored?.hotel?.raw || {}),
    ...(foundHotel || {}),
    ...(stored?.hotel || {}),
  };

  const galleryItems = [
    ...collectGalleryItems(data),
    ...collectGalleryItems(hotel),
  ].filter((item) => item?.image);
  const uniqueItems = [];
  const seenImages = new Set();

  galleryItems.forEach((item) => {
    if (seenImages.has(item.image)) return;
    seenImages.add(item.image);
    uniqueItems.push(item);
  });

  if (!uniqueItems.length) {
    return [
      { image: FALLBACK_IMAGES[0], title: "Lobby" },
      { image: FALLBACK_IMAGES[1], title: "Room" },
      { image: FALLBACK_IMAGES[2], title: "Bathroom" },
      { image: FALLBACK_IMAGES[3], title: "Dining" },
      { image: FALLBACK_IMAGES[4], title: "Exterior" },
    ];
  }

  return uniqueItems.slice(0, 12);
};

const normalizeFacilities = (facilities = []) =>
  facilities
    .map((facility) =>
      typeof facility === "string" ? facility : facility?.name || facility?.label,
    )
    .filter(Boolean)
    .filter((facility, index, list) => list.indexOf(facility) === index);

const getRecommendationRooms = (data = {}) => {
  const source = data?.content || data?.data || data;

  if (Array.isArray(source.roomCategories)) {
    return source.roomCategories.flatMap((category, categoryIndex) => {
      const categoryRooms = Array.isArray(category.room) ? category.room : [];

      if (!categoryRooms.length) {
        return [{ room: category, recommendation: category, recommendationIndex: categoryIndex }];
      }

      return categoryRooms.map((room, roomIndex) => ({
        room,
        recommendation: category,
        recommendationIndex: categoryIndex,
        roomIndex,
      }));
    });
  }

  const directRooms = [
    source.roomRates,
    source.roomTypes,
    source.availableRooms,
    source.rates,
  ].find(Array.isArray);

  if (directRooms) return directRooms.map((room) => ({ room }));

  if (Array.isArray(source.rooms)) {
    return source.rooms.map((room) => ({ room }));
  }

  const recommendations = source.rooms?.recommendations || source.recommendations;
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

const getRoomFeatureTexts = (room = {}, recommendation = {}) => {
  const roomFacilities = normalizeFacilities(
    [
      ...(Array.isArray(room.facilities) ? room.facilities : []),
      ...(Array.isArray(room.amenities) ? room.amenities : []),
      ...(Array.isArray(room.facilityGroups) ? room.facilityGroups : []),
      ...(Array.isArray(recommendation.facilities) ? recommendation.facilities : []),
      ...(Array.isArray(recommendation.amenities) ? recommendation.amenities : []),
      ...(Array.isArray(recommendation.facilityGroups) ? recommendation.facilityGroups : []),
    ],
  );

  return roomFacilities
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index)
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
    return [];
  }

  return rooms.map(({ room = {}, recommendation = {}, recommendationIndex, roomIndex }, index) => {
    const roomDetail = room.room && typeof room.room === "object" ? room.room : room;
    const roomImages = collectImages(roomDetail);
    const roomPrice =
      getRateValue(room) ||
      getRateValue(roomDetail) ||
      getRateValue(recommendation) ||
      fallbackPrice;
    const taxes = getTaxValue(
      roomDetail.rate?.taxes,
      roomDetail.taxes,
      roomDetail.fees,
      room.rate?.taxes,
      room.taxes,
      room.fees,
      recommendation.rate?.taxes,
      recommendation.taxes,
      recommendation.fees,
    );
    const totalRate = getFirst(
      room.totalRate,
      roomDetail.totalRate,
      room.recommendationMeta?.totalRate,
      recommendation.totalRate,
      recommendation.recommendationMeta?.totalRate,
      room.rate?.totalRate,
      roomDetail.rate?.totalRate,
      recommendation.rate?.totalRate,
    );
    const rateIncludesTax = Boolean(taxes && isSameAmount(roomPrice, totalRate));
    const publishedRate = getFirst(
      room.publishedRate,
      roomDetail.publishedRate,
      room.recommendationMeta?.publishedRate,
      recommendation.publishedRate,
      recommendation.recommendationMeta?.publishedRate,
      roomPrice,
    );
    const roomTitle = getFirst(
      roomDetail.name,
      roomDetail.title,
      roomDetail.roomName,
      roomDetail.standardRoomName,
      roomDetail.description,
      room.name,
      recommendation.standardRoomName,
      recommendation.name,
      `Room Option ${index + 1}`,
    );
    const recommendationId = getFirst(
      room.recommendationId,
      recommendation.id,
      recommendation.recommendationId,
      recommendation.standardRoomId,
    );
    const occupancies = Array.isArray(room.occupancies)
      ? room.occupancies
      : Array.isArray(roomDetail.occupancies)
        ? roomDetail.occupancies
        : [];
    const occupancy = occupancies[0] || null;
    const guestCount =
      Number(roomDetail.maxGuestAllowed || 0) ||
      Number(occupancy?.numOfAdults || 0) + Number(occupancy?.numOfChildren || 0);
    const isRefundable = Boolean(
      roomDetail.freeCancellation ||
        room.freeCancellation ||
        recommendation.freeCancellation ||
        room.refundable ||
        room.refundability === "Refundable" ||
        hotel.freeCancellation ||
        hotel.isRefundable,
    );

    return {
      id:
        room.id ||
        room.roomGroupId ||
        roomDetail.id ||
        room.roomId ||
        roomDetail.roomId ||
        `${recommendationId || "recommendation"}-${recommendationIndex ?? index}-${roomIndex ?? 0}`,
      title: roomTitle,
      availability: Number(room.availability || roomDetail.availability || 1),
      roomId: room.roomId || roomDetail.roomId || roomDetail.id || "",
      roomGroupId: room.roomGroupId || room.id || "",
      recommendationId: room.recommendationId || recommendation.recommendationId || "",
      supplierName: room.providerName || recommendation.providerName || "",
      guestCode: room.guestCode || room.GuestCode || "",
      occupancies,
      raw: room,
      image: (roomImages.length ? roomImages : images).map((img) => ({ img })),
      beds: getFirst(
        Array.isArray(roomDetail.beds) && roomDetail.beds.length
          ? roomDetail.beds
              .map((bed) =>
                [bed.count, bed.description || bed.type].filter(Boolean).join(" "),
              )
              .join(", ")
          : "",
        roomDetail.standardRoomName,
        recommendation.standardRoomName,
        roomDetail.bedType,
        roomDetail.bed,
        roomDetail.roomType,
        "Room",
      ),
      persons: getFirst(
        roomDetail.maxGuestAllowed ? `${roomDetail.maxGuestAllowed} Guests` : "",
        guestCount ? `${guestCount} Guest${guestCount === 1 ? "" : "s"}` : "",
        roomDetail.persons,
        roomDetail.occupancy,
        roomDetail.guests,
        "Guests",
      ),
      featuresLeft: getRoomFeatureTexts(roomDetail, recommendation, hotel),
      benefits: [
        room.boardBasis?.description || roomDetail.boardBasis?.description || "",
        room.providerName ? `Provider: ${room.providerName}` : "",
        room.needsPriceCheck ? "Price check required before booking" : "",
        room.payAtHotel ? "Pay at hotel" : "",
        isRefundable ? "Refundable" : "Non refundable",
      ].filter(Boolean),
      cancellation: isRefundable ? "Refundable booking" : "Non refundable booking",
      rating: {
        label: "Excellent",
        reviews: "No reviews yet",
        score: String(normalizeRating(hotel.starRating || hotel.rating)),
      },
      price: {
        actual: formatCurrency(publishedRate),
        offer: formatCurrency(roomPrice),
        actualAmount: getCurrencyNumber(publishedRate),
        offerAmount: getCurrencyNumber(roomPrice),
        taxAmount: getCurrencyNumber(taxes),
        rateIncludesTax,
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

const normalizeHotelDetail = (
  stored,
  routeHotelId = "",
  roomsPayload = null,
  roomsErrorMessage = "",
) => {
  const detailsPayload = stored?.details || stored || {};
  const data = detailsPayload.data || detailsPayload;
  const foundHotel = findFirstObject(data, (item) => item.name && (item.address || item.heroImage));
  const hotel = {
    ...(stored?.hotel?.raw || {}),
    ...(foundHotel || {}),
    ...(stored?.hotel || {}),
  };
  const galleryImages = extractGalleryImages(stored, routeHotelId);
  const uniqueImages = galleryImages.map((item) => item.image);
  const facilities = normalizeFacilities(
    collectFacilities(data),
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
    rooms: roomsPayload ? normalizeRooms(roomsPayload, { ...hotel, facilities }) : [],
    roomsErrorMessage: roomsErrorMessage || (roomsPayload ? getApiFailureMessage(roomsPayload) : ""),
    reviews,
    ratingBars,
    scoreDetails,
    galleryImages,
    request: stored?.request || {},
  };
};

export const HotelDetailDataProvider = ({ children, onUnauthorized }) => {
  const [routeHotelId, setRouteHotelId] = useState("");
  const [storedDetail, setStoredDetail] = useState(null);
  const [roomsPayload, setRoomsPayload] = useState(null);
  const [roomsErrorMessage, setRoomsErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(false);

  const refreshHotelAvailability = useCallback(
    async (payload) => {
      setRoomsLoading(true);

      try {
        const response = await changeHotelAvailability(payload);
        setRoomsPayload(response);
        setRoomsErrorMessage("");
        return response;
      } catch (error) {
        console.error("Hotel availability check failed:", error);
        if (isMissingHotelAuthTokenError(error)) {
          onUnauthorized?.();
        }
        setRoomsPayload(null);
        setRoomsErrorMessage(error.message || "Unable to check hotel availability.");
        throw error;
      } finally {
        setRoomsLoading(false);
      }
    },
    [onUnauthorized],
  );

  useEffect(() => {
    let isMounted = true;
    const params = new URLSearchParams(window.location.search);
    const request = getDetailRequestFromParams(params);
    const hotelId = request?.hotelId || params.get("hotelId") || "";
    const stored = readStoredHotelDetail();
    const storedHotelId = getStoredHotelId(stored);
    const canUseStored =
      stored && (!hotelId || !storedHotelId || storedHotelId === String(hotelId));
    const roomsRequest = request || stored?.request || null;

    setRouteHotelId(hotelId);

    if (canUseStored) {
      setStoredDetail(stored);
      setLoading(false);
    } else if (!request) {
      setStoredDetail(stored);
      setLoading(false);
    } else {
      const loadHotelDetails = async () => {
        setLoading(true);

        try {
          const details = await fetchHotelDetails(request);
          const nextStoredDetail = {
            request,
            hotel: {},
            details,
            galleryImages: extractGalleryImages({ request, hotel: {}, details }, hotelId),
          };

          writeStoredHotelDetail(nextStoredDetail);
          if (isMounted) setStoredDetail(nextStoredDetail);
        } catch (error) {
          console.error("Hotel details refresh failed:", error);
          if (isMissingHotelAuthTokenError(error)) {
            onUnauthorized?.();
          }
          if (isMounted) setStoredDetail(stored);
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      loadHotelDetails();
    }

    const hasRoomsRequest =
      roomsRequest?.searchId && roomsRequest?.hotelId && roomsRequest?.priceProvider;

    if (hasRoomsRequest) {
      const loadHotelRooms = async () => {
        const requestKey = JSON.stringify(roomsRequest);
        setRoomsLoading(true);

        try {
          const roomsPromise =
            roomsRequestCache.get(requestKey) || fetchHotelRooms(roomsRequest);

          roomsRequestCache.set(requestKey, roomsPromise);
          const rooms = await roomsPromise;
          if (isMounted) {
            setRoomsPayload(rooms);
            setRoomsErrorMessage("");
          }
        } catch (error) {
          roomsRequestCache.delete(requestKey);
          console.error("Hotel rooms request failed:", error);
          if (isMissingHotelAuthTokenError(error)) {
            onUnauthorized?.();
          }
          if (isMounted) {
            setRoomsPayload(null);
            setRoomsErrorMessage(error.message || "Unable to load available rooms.");
          }
        } finally {
          if (isMounted) setRoomsLoading(false);
        }
      };

      loadHotelRooms();
    } else {
      setRoomsPayload(null);
      setRoomsErrorMessage("");
      setRoomsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [onUnauthorized]);

  const hotelDetail = useMemo(
    () => normalizeHotelDetail(storedDetail, routeHotelId, roomsPayload, roomsErrorMessage),
    [storedDetail, routeHotelId, roomsPayload, roomsErrorMessage],
  );
  const contextValue = useMemo(
    () => ({
      hotelDetail,
      loading,
      roomsLoading,
      refreshHotelAvailability,
    }),
    [hotelDetail, loading, refreshHotelAvailability, roomsLoading],
  );

  return (
    <HotelDetailDataContext.Provider value={contextValue}>
      {children}
    </HotelDetailDataContext.Provider>
  );
};

export const useHotelDetailData = () => useContext(HotelDetailDataContext);

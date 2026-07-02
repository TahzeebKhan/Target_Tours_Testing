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

const normalizeImageUrl = (value = "") => {
  const rawUrl = String(value || "").trim();
  if (!rawUrl) return "";

  let url = rawUrl.replace(/\\\//g, "/").replace(/\s/g, "%20");

  try {
    url = decodeURI(url);
  } catch {
    // Keep the original URL if it is not safely decodable.
  }

  return url.replace(/\s/g, "%20");
};

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
    hotelSearchId: params.get("hotelSearchId") || params.get("hotelsearchid") || "",
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

const findFirstDeepField = (value, keys = [], depth = 0, seen = new WeakSet()) => {
  if (!value || typeof value !== "object" || depth > 7 || seen.has(value)) return "";
  seen.add(value);

  for (const key of keys) {
    const directValue = value[key];
    if (directValue !== undefined && directValue !== null && directValue !== "") {
      return directValue;
    }
  }

  const entries = Array.isArray(value) ? value : Object.values(value);
  for (const entry of entries) {
    const found = findFirstDeepField(entry, keys, depth + 1, seen);
    if (found) return found;
  }

  return "";
};

const getRoomsResponseSearchId = (payload = {}) =>
  getFirst(
    payload?.data?.searchId,
    payload?.data?.SearchId,
    payload?.data?.search_id,
    payload?.data?.content?.searchId,
    payload?.data?.content?.SearchId,
    payload?.content?.searchId,
    payload?.content?.SearchId,
    payload?.searchId,
    payload?.SearchId,
    payload?.search_id,
    findFirstDeepField(payload, [
      "roomsSearchId",
      "RoomsSearchId",
      "searchId",
      "SearchId",
      "search_id",
      "SearchID",
    ]),
  );

const getRoomsResponseSearchTracingKey = (payload = {}) =>
  getFirst(
    payload?.data?.searchTracingKey,
    payload?.data?.SearchTracingKey,
    payload?.data?.searchTracingkey,
    payload?.data?.search_tracing_key,
    payload?.data?.content?.searchTracingKey,
    payload?.data?.content?.SearchTracingKey,
    payload?.content?.searchTracingKey,
    payload?.content?.SearchTracingKey,
    payload?.searchTracingKey,
    payload?.SearchTracingKey,
    payload?.searchTracingkey,
    payload?.search_tracing_key,
    payload?.TUI,
    payload?.tui,
    findFirstDeepField(payload, [
      "roomsSearchTracingKey",
      "RoomsSearchTracingKey",
      "searchTracingKey",
      "SearchTracingKey",
      "searchTracingkey",
      "search_tracing_key",
      "TUI",
      "tui",
    ]),
  );

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
    const imageUrl = normalizeImageUrl(value);
    if (/^https?:\/\//.test(imageUrl) || imageUrl.startsWith("/images/")) {
      images.push(imageUrl);
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

const getNumericValue = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;

    const numericValue = Number(String(value).replace(/[^\d.-]/g, ""));
    if (Number.isFinite(numericValue)) return numericValue;
  }

  return null;
};

const formatReviewText = (count) => {
  const reviewCount = getNumericValue(count);
  if (!reviewCount) return "No reviews yet";

  return `${reviewCount.toLocaleString("en-IN")} review${reviewCount === 1 ? "" : "s"}`;
};

const formatCurrency = (value) => {
  const numericValue = Number(String(value || "").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numericValue)) return "₹ --";
  return `₹ ${Math.round(numericValue).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
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
    const imageUrl = normalizeImageUrl(value);

    if (/^https?:\/\//.test(imageUrl) || imageUrl.startsWith("/")) {
      return {
        image: imageUrl,
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

  const imageUrl = normalizeImageUrl(image);

  if (!imageUrl) return null;

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
    image: imageUrl,
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
  const preferredGalleryItems = [
    data.galleryImages,
    data.hotelImages,
    data.photos,
    data.media,
    foundHotel?.galleryImages,
    foundHotel?.hotelImages,
    foundHotel?.photos,
    foundHotel?.media,
    hotel.galleryImages,
    hotel.hotelImages,
    hotel.photos,
    hotel.media,
  ].flatMap((item) => collectGalleryItems(item));

  const galleryItems = [
    ...preferredGalleryItems,
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

// const getRecommendationRooms = (data = {}) => {
//   const source = data?.content || data?.data || data;

//   if (Array.isArray(source.roomCategories)) {
//     return source.roomCategories.map((category, categoryIndex) => {
//       const categoryRooms = Array.isArray(category.room) ? category.room : [];
//       const primaryRoom = categoryRooms[0] || category;

//       return {
//         room: primaryRoom,
//         recommendation: category,
//         recommendationIndex: categoryIndex,
//         roomIndex: 0,
//         categoryRooms,
//       };
//     });
//   }

//   const directRooms = [
//     source.roomRates,
//     source.roomTypes,
//     source.availableRooms,
//     source.rates,
//   ].find(Array.isArray);

//   if (directRooms) return directRooms.map((room) => ({ room }));

//   if (Array.isArray(source.rooms)) {
//     return source.rooms.map((room) => ({ room }));
//   }

//   const recommendations = source.rooms?.recommendations || source.recommendations;
//   if (!Array.isArray(recommendations)) return [];
//   console.log("recommendations", recommendations);

//   return recommendations.flatMap((recommendation, recommendationIndex) => {
//     const roomGroup = Array.isArray(recommendation.roomGroup)
//       ? recommendation.roomGroup
//       : [];

//     if (!roomGroup.length) {
//       return [{ room: recommendation, recommendation, recommendationIndex }];
//     }

//     const isCombo =
//       roomGroup.length > 1 ||
//       roomGroup.some((room) => getRoomGroupRoomCount(room) > 1);

//     if (isCombo) {
//       return [{
//         room: roomGroup[0],
//         recommendation,
//         recommendationIndex,
//         roomIndex: 0,
//         comboRoomGroups: roomGroup,
//       }];
//     }

//     return roomGroup.map((room, roomIndex) => ({
//       room,
//       recommendation,
//       recommendationIndex,
//       roomIndex,
//     }));
//   });
// };


const getRecommendationRooms = (data = {}) => {
  const source = data?.content || data?.raw || data?.data || data;

  if (Array.isArray(source.recommendations)) {
    return source.recommendations.map((recommendation, recommendationIndex) => {
      const roomGroup = Array.isArray(recommendation.roomGroup)
        ? recommendation.roomGroup
        : [];

      return {
        recommendation,
        recommendationIndex,
        roomGroup,
      };
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

  return recommendations.map((recommendation, recommendationIndex) => {
    const roomGroup = Array.isArray(recommendation.roomGroup)
      ? recommendation.roomGroup
      : [];

    return {
      recommendation,
      recommendationIndex,
      roomGroup,
    };
  });
};
const getRoomGroupRoomCount = (roomGroupItem = {}) =>
  Math.max(
    1,
    Number(
      getFirst(
        roomGroupItem.roomCount,
        roomGroupItem.RoomCount,
        roomGroupItem.room_count,
        roomGroupItem.room?.roomCount,
        roomGroupItem.room?.RoomCount,
        roomGroupItem.room?.room_count,
      ),
    ) || 1,
  );

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

const formatPolicyText = (value) => {
  const text = String(value || "").trim();
  const normalizedText = text.replace(/[\s_-]+/g, "").toLowerCase();

  if (normalizedText === "nonrefundable") return "Non refundable";
  if (normalizedText === "refundable") return "Refundable";

  return text;
};

const getPolicyTextKey = (value) =>
  formatPolicyText(value).replace(/[^a-z0-9]/gi, "").toLowerCase();

const uniqueTexts = (items = []) => {
  const seen = new Set();

  return items
    .map(formatPolicyText)
    .filter(Boolean)
    .filter((item) => {
      const key = getPolicyTextKey(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const normalizeTextItems = (value) => {
  if (!value) return [];

  if (typeof value === "string") return [value];

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeTextItems(item));
  }

  if (typeof value !== "object") return [];

  const text = getFirst(
    value.text,
    value.description,
    value.desc,
    value.value,
    value.name,
    value.label,
  );
  const type = getFirst(value.type, value.title, value.category);

  if (text && type && text !== type) return [`${type}: ${text}`];
  if (text) return [text];
  if (type) return [type];

  return [];
};

const getRoomPolicyTexts = (room = {}, roomDetail = {}, recommendation = {}, isRefundable = false) => {
  const policies = [
    room.policies,
    roomDetail.policies,
    recommendation.policies,
    room.cancellationPolicies,
    roomDetail.cancellationPolicies,
    recommendation.cancellationPolicies,
    room.cancellationPolicy,
    roomDetail.cancellationPolicy,
    recommendation.cancellationPolicy,
  ].flatMap((item) => normalizeTextItems(item));

  const includes = [
    room.includes,
    roomDetail.includes,
    recommendation.includes,
  ].flatMap((item) => normalizeTextItems(item).map((text) => `Includes: ${text}`));

  const rateRules = [
    getFirst(room.refundability, roomDetail.refundability, recommendation.refundability),
    getFirst(room.boardBasis?.description, roomDetail.boardBasis?.description),
    room.needsPriceCheck ? "Price check required before booking" : "",
    room.payAtHotel ? "Pay at hotel" : "",
    isRefundable ? "Refundable" : "Non refundable",
  ];

  return uniqueTexts([...policies, ...includes, ...rateRules]);
};

const normalizeRooms = (data = {}, hotel = {}) => {
  const roomsGroup = getRecommendationRooms(data);
  const images = collectImages(data).length ? collectImages(data) : FALLBACK_IMAGES;
  const fallbackPrice = getRateValue(hotel);
  const roomsSearchId = getRoomsResponseSearchId(data);
  const roomsSearchTracingKey = getRoomsResponseSearchTracingKey(data);

  if (!roomsGroup.length) {
    return [];
  }

  return roomsGroup.map((group = {}, index) => {
    const recommendation = group.recommendation || {};
    const roomGroup = Array.isArray(group.roomGroup)
      ? group.roomGroup
      : Array.isArray(group.comboRoomGroups)
        ? group.comboRoomGroups
        : group.room
          ? [group.room]
          : [];
    const primaryRoomGroup = roomGroup[0] || group.room || recommendation || {};
    const roomDetail =
      primaryRoomGroup.room && typeof primaryRoomGroup.room === "object"
        ? primaryRoomGroup.room
        : primaryRoomGroup;
    const roomImages = collectImages(roomDetail);
    const roomPrice =
      getRateValue(primaryRoomGroup) ||
      getRateValue(roomDetail) ||
      getRateValue(recommendation) ||
      fallbackPrice;
    const taxes = getTaxValue(
      roomDetail.rate?.taxes,
      roomDetail.taxes,
      roomDetail.fees,
      primaryRoomGroup.rate?.taxes,
      primaryRoomGroup.taxes,
      primaryRoomGroup.fees,
      recommendation.rate?.taxes,
      recommendation.taxes,
      recommendation.fees,
    );
    const totalRate = getFirst(
      primaryRoomGroup.totalRate,
      roomDetail.totalRate,
      primaryRoomGroup.recommendationMeta?.totalRate,
      recommendation.totalRate,
      recommendation.recommendationMeta?.totalRate,
      primaryRoomGroup.rate?.totalRate,
      roomDetail.rate?.totalRate,
      recommendation.rate?.totalRate,
    );
    const rateIncludesTax = Boolean(taxes && isSameAmount(roomPrice, totalRate));
    const publishedRate = getFirst(
      primaryRoomGroup.publishedRate,
      roomDetail.publishedRate,
      primaryRoomGroup.recommendationMeta?.publishedRate,
      recommendation.publishedRate,
      recommendation.recommendationMeta?.publishedRate,
      roomPrice,
    );
    const comboRoomCount = roomGroup.reduce(
      (total, item) => total + getRoomGroupRoomCount(item),
      0,
    );
    const isCombo = roomGroup.length > 1 || comboRoomCount > 1;
    const roomTitle = getFirst(
      roomDetail.name,
      roomDetail.title,
      roomDetail.roomName,
      roomDetail.standardRoomName,
      roomDetail.description,
      primaryRoomGroup.name,
      recommendation.standardRoomName,
      recommendation.name,
      `Room Option ${index + 1}`,
    );
    const recommendationId = getFirst(
      primaryRoomGroup.recommendationId,
      recommendation.id,
      recommendation.recommendationId,
      recommendation.standardRoomId,
    );
    const occupancies = Array.isArray(primaryRoomGroup.occupancies)
      ? primaryRoomGroup.occupancies
      : Array.isArray(roomDetail.occupancies)
        ? roomDetail.occupancies
        : [];
    const occupancy = occupancies[0] || null;
    const guestCount =
      Number(roomDetail.maxGuestAllowed || 0) ||
      Number(occupancy?.numOfAdults || 0) + Number(occupancy?.numOfChildren || 0);
    const isRefundable = Boolean(
      roomDetail.freeCancellation ||
        primaryRoomGroup.freeCancellation ||
        recommendation.freeCancellation ||
        primaryRoomGroup.refundable ||
        primaryRoomGroup.refundability === "Refundable" ||
        hotel.freeCancellation ||
        hotel.isRefundable,
    );
    const sourceRoomId = getFirst(
      primaryRoomGroup.id,
      primaryRoomGroup.roomGroupId,
      roomDetail.id,
      primaryRoomGroup.roomId,
      roomDetail.roomId,
      recommendationId,
      "room",
    );
    const uiRoomId = [
      sourceRoomId,
      group.recommendationIndex ?? index,
      0,
      index,
    ].join("-");
    const comboRooms = roomGroup.map((comboRoom, comboIndex) => {
      const comboRoomDetail =
        comboRoom.room && typeof comboRoom.room === "object"
          ? comboRoom.room
          : comboRoom;
      const repeatCount = getRoomGroupRoomCount(comboRoom);
      const comboOccupancies = Array.isArray(comboRoom.occupancies)
        ? comboRoom.occupancies
        : [];
      const comboGuestCount =
        Number(comboRoomDetail.maxGuestAllowed || 0) ||
        comboOccupancies.reduce(
          (total, occupancy) =>
            total +
            Number(occupancy?.numOfAdults || occupancy?.NumOfAdults || 0) +
            Number(occupancy?.numOfChildren || occupancy?.NumOfChildren || 0),
          0,
        );
      const comboTitle = getFirst(
        comboRoomDetail.name,
        comboRoomDetail.title,
        comboRoomDetail.roomName,
        comboRoomDetail.standardRoomName,
        comboRoomDetail.description,
        `Room ${comboIndex + 1}`,
      );
      const comboImages = collectImages(comboRoomDetail);
      const comboRoomPrice = getRateValue(comboRoom) || getRateValue(comboRoomDetail) || 0;
      const comboTaxes = getTaxValue(
        comboRoomDetail.rate?.taxes,
        comboRoomDetail.taxes,
        comboRoomDetail.fees,
        comboRoom.rate?.taxes,
        comboRoom.taxes,
        comboRoom.fees,
      );
      const comboPublishedRate = getFirst(
        comboRoom.publishedRate,
        comboRoomDetail.publishedRate,
        comboRoom.recommendationMeta?.publishedRate,
        comboRoomPrice,
      );

      return {
        id: `${uiRoomId}-combo-${comboIndex}`,
        count: repeatCount,
        roomCount: repeatCount,
        title: `${repeatCount} x ${comboTitle}`,
        image: (comboImages.length ? comboImages : roomImages.length ? roomImages : images).map(
          (img) => ({ img }),
        ),
        beds: getFirst(
          Array.isArray(comboRoomDetail.beds) && comboRoomDetail.beds.length
            ? comboRoomDetail.beds
                .map((bed) =>
                  [bed.count, bed.description || bed.type].filter(Boolean).join(" "),
                )
                .join(", ")
            : "",
          comboRoomDetail.standardRoomName,
          comboRoomDetail.bedType,
          comboRoomDetail.bed,
          comboRoomDetail.roomType,
          "Room",
        ),
        persons: getFirst(
          comboRoomDetail.maxGuestAllowed
            ? `${comboRoomDetail.maxGuestAllowed} Guests`
            : "",
          comboGuestCount ? `${comboGuestCount} Guest${comboGuestCount === 1 ? "" : "s"}` : "",
          comboRoomDetail.persons,
          comboRoomDetail.occupancy,
          comboRoomDetail.guests,
          "Guests",
        ),
        occupancies: comboOccupancies,
        featuresLeft: getRoomFeatureTexts(comboRoomDetail, recommendation, hotel),
        benefits: getRoomPolicyTexts(
          comboRoom,
          comboRoomDetail,
          recommendation,
          Boolean(
            comboRoomDetail.freeCancellation ||
              comboRoom.freeCancellation ||
              comboRoom.refundable ||
              comboRoom.refundability === "Refundable" ||
              isRefundable,
          ),
        ),
        pricePerNight: getCurrencyNumber(comboRoomPrice),
        publishedRate: getCurrencyNumber(comboPublishedRate),
        taxPerNight: getCurrencyNumber(comboTaxes),
        netAmount: getCurrencyNumber(comboRoomPrice),
        raw: comboRoom,
      };
    });

    return {
      id: uiRoomId,
      title:
        isCombo
          ? `${comboRoomCount} Room Combo${isRefundable ? " with Free Cancellation" : ""}`
          : roomTitle,
      isCombo,
      comboRoomCount: comboRoomCount || 1,
      roomUnits: comboRoomCount || 1,
      comboRooms,
      availability: isCombo ? 1 : Number(primaryRoomGroup.availability || roomDetail.availability || 1),
      roomId: primaryRoomGroup.roomId || roomDetail.roomId || roomDetail.id || "",
      roomGroupId: primaryRoomGroup.roomGroupId || primaryRoomGroup.id || "",
      recommendationId: primaryRoomGroup.recommendationId || recommendation.recommendationId || recommendation.id || "",
      supplierName: primaryRoomGroup.providerName || recommendation.providerName || "",
      guestCode: primaryRoomGroup.guestCode || primaryRoomGroup.GuestCode || "",
      roomsSearchId,
      roomsSearchTracingKey,
      occupancies,
      raw: primaryRoomGroup,
      rawRecommendation: recommendation,
      rawRoomGroup: roomGroup,
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
      benefits: getRoomPolicyTexts(primaryRoomGroup, roomDetail, recommendation, isRefundable),
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
        nights: isCombo ? `per night for ${comboRoomCount} rooms` : "per night",
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

const normalizeReviewSummary = (data = {}, hotel = {}) => {
  const reviews = Array.isArray(data.reviews)
    ? data.reviews
    : Array.isArray(hotel.reviews)
      ? hotel.reviews
      : [];
  const firstReview = reviews[0] || {};
  const summary =
    data.reviewSummary ||
    data.review_summary ||
    hotel.reviewSummary ||
    hotel.review_summary ||
    {};
  const score = getNumericValue(
    data.reviewRating,
    data.review_rating,
    data.guestRating,
    data.guest_rating,
    summary.rating,
    summary.averageRating,
    summary.average_rating,
    firstReview.rating,
    firstReview.score,
  );
  const count = getNumericValue(
    data.reviewCount,
    data.review_count,
    data.reviewsCount,
    data.reviews_count,
    data.totalReviews,
    data.total_reviews,
    summary.count,
    summary.reviewCount,
    summary.totalReviews,
    firstReview.count,
    reviews.length && reviews.some((review) => review.comment || review.review || review.text)
      ? reviews.length
      : "",
  );

  return {
    score,
    text: formatReviewText(count),
  };
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
  const reviewSummary = normalizeReviewSummary(data, hotel);
  const ratingBars = normalizeRatingBars(data, reviews);
  const scoreDetails = normalizeScoreDetails(data, hotel);
  const starRating = normalizeRating(
    getFirst(
      hotel.starRating,
      hotel.star_rating,
      hotel.rate?.starRating,
      hotel.rate?.star_rating,
      data.starRating,
      data.star_rating,
      hotel.rating,
    ),
  );

  return {
    id: String(getFirst(hotel.id, hotel.hotelId, routeHotelId, "")),
    name: getFirst(hotel.name, hotel.title, data.name, "Hotel"),
    address: getFirst(hotel.address, data.address, hotel.route, hotel.locationName, ""),
    rating: starRating,
    starRating,
    reviewScore: reviewSummary.score,
    reviewText: getFirst(data.reviewText, data.reviewsText, reviewSummary.text),
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
    roomGroups: roomsPayload ? getRecommendationRooms(roomsPayload) : [],
    roomsSearchId: roomsPayload ? getRoomsResponseSearchId(roomsPayload) : "",
    roomsSearchTracingKey: roomsPayload ? getRoomsResponseSearchTracingKey(roomsPayload) : "",
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
      roomsRequest?.searchId &&
      roomsRequest?.hotelSearchId &&
      roomsRequest?.hotelId &&
      roomsRequest?.priceProvider;

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

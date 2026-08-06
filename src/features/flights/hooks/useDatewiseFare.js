"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDatewiseFare } from "@/features/flights/services/datewiseFare";

const parseCodeFromLabel = (label = "") => {
  const value = String(label || "").trim();
  const match = value.match(/\(([^)]+)\)/);
  if (match) return match[1].toUpperCase();
  if (/^[A-Za-z]{3}$/.test(value)) return value.toUpperCase();
  return "";
};

const getCodeFromUrl = (key) => {
  if (typeof window === "undefined") return "";
  const value = new URLSearchParams(window.location.search).get(key) || "";
  return value.toUpperCase().trim();
};

const normalizeDate = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const formatTileDate = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
};

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const getDatewiseList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.date_wise)) return payload.date_wise;
  if (Array.isArray(payload?.fares)) return payload.fares;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.datewise_fare)) return payload.datewise_fare;
  return [];
};

const getDatewiseMap = (payload) => {
  const raw = payload?.data;
  if (raw && !Array.isArray(raw) && typeof raw === "object") {
    const mapped = {};
    Object.entries(raw).forEach(([dateKey, fareValue]) => {
      const normalizedFare = toNumber(fareValue);
      if (normalizedFare !== null) mapped[dateKey] = normalizedFare;
    });
    return mapped;
  }

  const list = getDatewiseList(payload);
  if (!list.length) return {};

  return list.reduce((acc, item) => {
    const rawDate =
      item?.date ||
      item?.departure_date ||
      item?.departureDate ||
      item?.travel_date ||
      item?.travelDate;

    const normalizedDate = normalizeDate(rawDate);
    const normalizedFare =
      toNumber(item?.price) ??
      toNumber(item?.fare) ??
      toNumber(item?.amount) ??
      toNumber(item?.min_fare) ??
      toNumber(item?.minimum_fare);

    if (normalizedDate && normalizedFare !== null) {
      acc[normalizedDate] = normalizedFare;
    }
    return acc;
  }, {});
};

const mapDatewiseFareToTiles = (payload) => {
  const mapPayload = getDatewiseMap(payload);
  if (Object.keys(mapPayload).length > 0) {
    const mapped = Object.entries(mapPayload).map(([dateKey, price]) => ({
      date: dateKey,
      label: formatTileDate(dateKey),
      price,
    }));

    const allPrices = mapped.map((item) => item.price);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);

    return mapped.map((item) => ({
      ...item,
      trend: item.price === min ? "down" : item.price === max ? "up" : "neutral",
    }));
  }

  const list = getDatewiseList(payload);
  if (!list.length) return [];

  const mapped = list
    .map((item) => {
      const rawDate =
        item?.date ||
        item?.departure_date ||
        item?.departureDate ||
        item?.travel_date ||
        item?.travelDate;

      const price =
        toNumber(item?.price) ??
        toNumber(item?.fare) ??
        toNumber(item?.amount) ??
        toNumber(item?.min_fare) ??
        toNumber(item?.minimum_fare);

      const label = formatTileDate(rawDate);
      if (!label || price === null) return null;

      return {
        date: normalizeDate(rawDate),
        label,
        price,
      };
    })
    .filter(Boolean);

  if (!mapped.length) return [];

  const allPrices = mapped.map((item) => item.price);
  const min = Math.min(...allPrices);
  const max = Math.max(...allPrices);

  return mapped.map((item) => ({
    ...item,
    trend: item.price === min ? "down" : item.price === max ? "up" : "neutral",
  }));
};

const buildDatewiseFareParams = ({
  tripType,
  from,
  to,
  fromCode,
  toCode,
  startDate,
  endDate,
  provider = "both",
  domain = process.env.NEXT_PUBLIC_DOMAIN,
}) => {
  const origin = String(
    fromCode || parseCodeFromLabel(from) || getCodeFromUrl("origin")
  )
    .toUpperCase()
    .trim();
  const destination = String(
    toCode || parseCodeFromLabel(to) || getCodeFromUrl("destination")
  )
    .toUpperCase()
    .trim();
  const departure_date = normalizeDate(startDate);
  const return_date = normalizeDate(endDate);
  const fareType = tripType === "multi" ? "DM" : tripType === "round" ? "RT" : "ON";

  return {
    fareType,
    origin,
    destination,
    departure_date,
    return_date,
    provider,
    domain,
  };
};

export const useDatewiseFare = ({
  tripType,
  from,
  to,
  fromCode,
  toCode,
  startDate,
  endDate,
  provider = "both",
  domain = process.env.NEXT_PUBLIC_DOMAIN,
  enabled = true,
}) => {
  const params = buildDatewiseFareParams({
    tripType,
    from,
    to,
    fromCode,
    toCode,
    startDate,
    endDate,
    provider,
    domain,
  });

  const hasRequiredParams =
    Boolean(params.origin) &&
    Boolean(params.destination) &&
    Boolean(params.departure_date) &&
    (params.fareType !== "RT" || Boolean(params.return_date));

  return useQuery({
    queryKey: ["datewise-fare", params],
    queryFn: () => fetchDatewiseFare(params),
    enabled: enabled && hasRequiredParams,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    select: (data) => ({
      raw: data,
      tiles: mapDatewiseFareToTiles(data),
      faresByDate: getDatewiseMap(data),
      params,
    }),
  });
};

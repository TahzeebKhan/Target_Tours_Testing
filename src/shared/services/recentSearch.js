"use client";

export const RECENT_SEARCHES_QUERY_KEY = ["recent-searches"];

const getAuthToken = () => {
  if (typeof document === "undefined") return "";

  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1] || ""
  );
};

const normalizeBaseUrl = () => {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (base) return base;
  return `http://${process.env.NEXT_PUBLIC_DOMAIN}`;
};

const toArray = (value) => (Array.isArray(value) ? value : []);

const parseAirportCode = (value = "") => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  const bracketMatch = trimmed.match(/\(([^)]+)\)/);
  if (bracketMatch?.[1]) return bracketMatch[1].trim().toUpperCase();

  if (/^[A-Za-z]{3}$/.test(trimmed)) return trimmed.toUpperCase();

  return "";
};

const pickFirst = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
};

const toRecord = (item = {}) => item?.attributes || item;

const toAirportPayload = (airport = {}, fallbackCode = "") => ({
  name: String(airport?.name || "").trim(),
  city: String(airport?.city || "").trim(),
  country: String(airport?.country || "").trim(),
  iata_code: String(airport?.iata_code || fallbackCode || "").trim().toUpperCase(),
});

const fetchAirportByCode = async (code = "") => {
  const normalizedCode = String(code || "").trim().toLowerCase();
  if (!normalizedCode) return null;

  const url = new URL("/api/airports/search", normalizeBaseUrl());
  url.searchParams.set("q", normalizedCode);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Airport lookup failed with status ${response.status}`);
  }

  const payload = await response.json();
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];

  const match = list.find(
    (airport) =>
      String(airport?.iata_code || "")
        .trim()
        .toUpperCase() === normalizedCode.toUpperCase(),
  );

  return match || list[0] || null;
};

const normalizeLabel = (city, country, fallback) => {
  const parts = [city, country].filter(Boolean).map((part) => String(part).trim());
  if (parts.length) return parts.join(", ").toUpperCase();
  return String(fallback || "").trim().toUpperCase();
};

const normalizeDetail = (...parts) =>
  parts
    .flatMap((part) => (Array.isArray(part) ? part : [part]))
    .filter(Boolean)
    .map((part) => String(part).trim())
    .join(", ");

const mapRecentFlightSearch = (item = {}) => {
  const record = toRecord(item);
  const searchData = record?.search_data || record?.searchData || {};
  const originAirport =
    record?.origin && typeof record.origin === "object" ? record.origin : {};

  const city = pickFirst(
    originAirport?.city,
    record?.city,
    record?.from_city,
    record?.origin_city,
    record?.departure_city,
    searchData?.from?.city,
    searchData?.origin?.city,
    searchData?.departure?.city,
  );

  const country = pickFirst(
    originAirport?.country,
    record?.country,
    record?.from_country,
    record?.origin_country,
    record?.departure_country,
    searchData?.from?.country,
    searchData?.origin?.country,
    searchData?.departure?.country,
  );

  const airportName = pickFirst(
    originAirport?.name,
    record?.airport,
    record?.airport_name,
    record?.from_airport,
    record?.origin_airport,
    record?.departure_airport,
    searchData?.from?.airport,
    searchData?.origin?.airport,
    searchData?.departure?.airport,
    record?.name,
  );

  const code = String(
    pickFirst(
      originAirport?.iata_code,
      record?.iata_code,
      record?.iataCode,
      record?.code,
      record?.from_code,
      record?.origin_code,
      record?.departure_code,
      searchData?.from?.iataCode,
      searchData?.from?.code,
      searchData?.origin?.iataCode,
      searchData?.origin?.code,
      searchData?.departure?.iataCode,
      searchData?.departure?.code,
    ),
  )
    .trim()
    .toUpperCase();

  const value = pickFirst(
    record?.value,
    record?.from,
    record?.origin,
    originAirport?.city ? `${originAirport.city} (${originAirport.iata_code || code})` : "",
    record?.departure,
    searchData?.from?.value,
    searchData?.origin?.value,
    searchData?.departure?.value,
    city ? `${city}${code ? ` (${code})` : ""}` : "",
    airportName,
    code,
  );

  const label = normalizeLabel(city, country, airportName || code);
  const detail = normalizeDetail(
    airportName,
    [city, country].filter(Boolean).length ? [city, country] : [],
  );

  if (!label || !value || !code) return null;

  return {
    label,
    detail,
    code,
    iataCode: code,
    value,
  };
};

export const fetchRecentSearches = async ({ type = "flight" } = {}) => {
  const url = new URL("/api/recent-search", normalizeBaseUrl());
  url.searchParams.set("type", type);
  const token = getAuthToken();

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Recent search fetch failed with status ${response.status}`);
  }

  const payload = await response.json();

  const list = toArray(payload)
    .concat(toArray(payload?.data))
    .concat(toArray(payload?.results));

  return list.map(mapRecentFlightSearch).filter(Boolean);
};

export const saveRecentFlightSearch = async ({
  origin,
  destination,
  departureDate,
  returnDate,
} = {}) => {
  const normalizedOrigin = parseAirportCode(origin);
  const normalizedDestination = parseAirportCode(destination);

  if (!normalizedOrigin || !normalizedDestination || !departureDate) {
    return null;
  }

  const url = new URL("/api/recent-search", normalizeBaseUrl());
  const token = getAuthToken();
  const [originAirport, destinationAirport] = await Promise.all([
    fetchAirportByCode(normalizedOrigin),
    fetchAirportByCode(normalizedDestination),
  ]);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
    keepalive: true,
    body: JSON.stringify({
      type: "flight",
      search_data: {
        origin: normalizedOrigin,
        destination: normalizedDestination,
        departure_date: departureDate,
        return_date: returnDate || null,
      },
      origin: toAirportPayload(originAirport, normalizedOrigin),
      destination: toAirportPayload(destinationAirport, normalizedDestination),
    }),
  });

  if (!response.ok) {
    // throw new Error(`Recent search save failed with status ${response.status}`);
  }

  return response.json().catch(() => null);
};

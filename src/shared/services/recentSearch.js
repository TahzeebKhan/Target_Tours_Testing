"use client";

export const RECENT_SEARCHES_QUERY_KEY = ["recent-searches"];
const RECENT_SEARCH_CACHE_PREFIX = "target_tours_recent_searches";

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

const getRecentSearchCacheKey = (type = "flight", airport = "") =>
  [RECENT_SEARCH_CACHE_PREFIX, type, airport].filter(Boolean).join("_");

const readRecentSearchCache = (type = "flight", airport = "") => {
  if (typeof window === "undefined") return [];

  try {
    const rawValue = window.localStorage.getItem(
      getRecentSearchCacheKey(type, airport),
    );
    if (!rawValue) return [];
    const parsed = JSON.parse(rawValue);
    return toArray(parsed?.data);
  } catch {
    return [];
  }
};

const writeRecentSearchCache = (type = "flight", data = [], airport = "") => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      getRecentSearchCacheKey(type, airport),
      JSON.stringify({
        savedAt: new Date().toISOString(),
        data,
      }),
    );
  } catch {
    // localStorage can be unavailable in private browsing or quota-limited.
  }
};

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

const getAirportCode = (airport = {}, fallbackCode = "") =>
  String(airport?.iata_code || fallbackCode || "").trim().toUpperCase();

const getAirportDisplayValue = (airport = {}, fallbackCode = "") => {
  const code = getAirportCode(airport, fallbackCode);
  const city = String(airport?.city || "").trim();
  const name = String(airport?.name || "").trim();

  if (city && code) return `${city} (${code})`;
  if (city) return city;
  if (name && code) return `${name} (${code})`;
  return name || code;
};

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

const mapRecentFlightSearch = (item = {}, airport = "") => {
  const record = toRecord(item);
  const searchData = record?.search_data || record?.searchData || {};
  const originAirport =
    record?.origin && typeof record.origin === "object" ? record.origin : {};
  const destinationAirport =
    record?.destination && typeof record.destination === "object"
      ? record.destination
      : {};
  const isDestinationAirport = airport === "destination";
  const selectedAirport = isDestinationAirport
    ? destinationAirport
    : originAirport;
  const selectedSearchData = isDestinationAirport
    ? searchData?.destination
    : searchData?.origin;

  const city = pickFirst(
    selectedAirport?.city,
    record?.city,
    isDestinationAirport ? record?.to_city : record?.from_city,
    isDestinationAirport ? record?.destination_city : record?.origin_city,
    record?.departure_city,
    searchData?.from?.city,
    selectedSearchData?.city,
    searchData?.departure?.city,
  );

  const country = pickFirst(
    selectedAirport?.country,
    record?.country,
    isDestinationAirport ? record?.to_country : record?.from_country,
    isDestinationAirport
      ? record?.destination_country
      : record?.origin_country,
    record?.departure_country,
    searchData?.from?.country,
    selectedSearchData?.country,
    searchData?.departure?.country,
  );

  const airportName = pickFirst(
    selectedAirport?.name,
    record?.airport,
    record?.airport_name,
    isDestinationAirport ? record?.to_airport : record?.from_airport,
    isDestinationAirport
      ? record?.destination_airport
      : record?.origin_airport,
    record?.departure_airport,
    searchData?.from?.airport,
    selectedSearchData?.airport,
    searchData?.departure?.airport,
    record?.name,
  );

  const code = String(
    pickFirst(
      selectedAirport?.iata_code,
      record?.iata_code,
      record?.iataCode,
      record?.code,
      isDestinationAirport ? record?.to_code : record?.from_code,
      isDestinationAirport ? record?.destination_code : record?.origin_code,
      record?.departure_code,
      searchData?.from?.iataCode,
      searchData?.from?.code,
      selectedSearchData?.iataCode,
      selectedSearchData?.code,
      searchData?.departure?.iataCode,
      searchData?.departure?.code,
      typeof selectedSearchData === "string" ? selectedSearchData : "",
    ),
  )
    .trim()
    .toUpperCase();

  const value = pickFirst(
    record?.value,
    isDestinationAirport ? record?.to : record?.from,
    selectedAirport?.city
      ? `${selectedAirport.city} (${selectedAirport.iata_code || code})`
      : "",
    typeof (isDestinationAirport ? record?.destination : record?.origin) ===
      "string"
      ? isDestinationAirport
        ? record?.destination
        : record?.origin
      : "",
    record?.departure,
    searchData?.from?.value,
    selectedSearchData?.value,
    searchData?.departure?.value,
    city ? `${city}${code ? ` (${code})` : ""}` : "",
    airportName,
    code,
  );

  const label = normalizeLabel(city, country, airportName || code);
  const originCode = getAirportCode(originAirport, searchData?.origin);
  const originValue = getAirportDisplayValue(originAirport, originCode) || value;
  const destinationCode = getAirportCode(
    destinationAirport,
    searchData?.destination,
  );
  const destinationValue = getAirportDisplayValue(
    destinationAirport,
    destinationCode,
  );
  const routeLabel =
    originValue && destinationValue
      ? `${originValue} to ${destinationValue}`
      : "";
  const detail = routeLabel
    ? normalizeDetail(
        routeLabel,
        searchData?.departure_date,
        searchData?.return_date,
      )
    : normalizeDetail(
        airportName,
        [city, country].filter(Boolean).length ? [city, country] : [],
      );

  if (!label || !value || !code) return null;

  return {
    label: routeLabel || label,
    detail,
    code,
    iataCode: code,
    value,
    route: destinationCode
      ? {
          origin: originValue || (isDestinationAirport ? "" : value),
          originCode: originCode || code,
          destination: destinationValue || (isDestinationAirport ? value : ""),
          destinationCode,
          departureDate: searchData?.departure_date || "",
          returnDate: searchData?.return_date || "",
          searchKey: record?.search_key || "",
        }
      : null,
  };
};

export const fetchRecentSearches = async ({
  type = "flight",
  airport = "",
} = {}) => {
  const token = getAuthToken();
  if (!token) {
    return readRecentSearchCache(type, airport);
  }

  const url = new URL("/api/recent-search", normalizeBaseUrl());
  url.searchParams.set("type", type);
  if (airport) url.searchParams.set("airport", airport);

  let response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });
  } catch (error) {
    const cachedSearches = readRecentSearchCache(type, airport);
    if (cachedSearches.length) return cachedSearches;
    throw error;
  }

  if (!response.ok) {
    const cachedSearches = readRecentSearchCache(type, airport);
    if (cachedSearches.length) return cachedSearches;
    throw new Error(`Recent search fetch failed with status ${response.status}`);
  }

  const payload = await response.json();

  const list = toArray(payload)
    .concat(toArray(payload?.data))
    .concat(toArray(payload?.results));

  const searches = list
    .map((item) => mapRecentFlightSearch(item, airport))
    .filter(Boolean);
  writeRecentSearchCache(type, searches, airport);
  return searches;
};

export const saveRecentFlightSearch = async ({
  origin,
  destination,
  departureDate,
  returnDate,
} = {}) => {
  const token = getAuthToken();
  if (!token) {
    return null;
  }

  const normalizedOrigin = parseAirportCode(origin);
  const normalizedDestination = parseAirportCode(destination);

  if (!normalizedOrigin || !normalizedDestination || !departureDate) {
    return null;
  }

  const url = new URL("/api/recent-search", normalizeBaseUrl());
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
    return readRecentSearchCache("flight", "origin")[0] || null;
  }

  const savedSearch = await response.json().catch(() => null);
  const mappedOriginSearch = mapRecentFlightSearch(savedSearch, "origin");
  const mappedDestinationSearch = mapRecentFlightSearch(
    savedSearch,
    "destination",
  );

  if (mappedOriginSearch) {
    const cachedSearches = readRecentSearchCache("flight", "origin");
    const nextSearches = [
      mappedOriginSearch,
      ...cachedSearches.filter(
        (search) =>
          search?.route?.searchKey !== mappedOriginSearch?.route?.searchKey ||
          !mappedOriginSearch?.route?.searchKey,
      ),
    ];
    writeRecentSearchCache("flight", nextSearches, "origin");
  }

  if (mappedDestinationSearch) {
    const cachedSearches = readRecentSearchCache("flight", "destination");
    const nextSearches = [
      mappedDestinationSearch,
      ...cachedSearches.filter(
        (search) =>
          search?.route?.searchKey !==
            mappedDestinationSearch?.route?.searchKey ||
          !mappedDestinationSearch?.route?.searchKey,
      ),
    ];
    writeRecentSearchCache("flight", nextSearches, "destination");
  }

  return savedSearch;
};

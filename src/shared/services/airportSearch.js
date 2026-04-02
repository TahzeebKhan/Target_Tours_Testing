export const AIRPORT_SUGGESTIONS_QUERY_KEY = ["airport-suggestions"];

const normalizeBaseUrl = () => {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (base) return base;
  return `http://${process.env.NEXT_PUBLIC_DOMAIN}`;
};

const toSuggestion = (airport = {}) => {
  const name = String(airport?.name || "").trim();
  const city = String(airport?.city || "").trim();
  const country = String(airport?.country || "").trim();
  const iata = String(airport?.iata_code || "").trim().toUpperCase();

  const primaryText = city || name;
  const label = primaryText
    ? `${primaryText.toUpperCase()}${country ? `, ${country.toUpperCase()}` : ""}`
    : iata;

  const detailParts = [name, city, country].filter(Boolean);
  const detail = detailParts.join(", ");

  const value = city || name || iata;

  return {
    label,
    detail,
    code: iata || value,
    iataCode: iata,
    value,
  };
};

export const fetchAirportSuggestions = async (query) => {
  const q = String(query || "").trim();
  if (!q) return [];

  const url = new URL("/api/airports/search", normalizeBaseUrl());
  url.searchParams.set("q", q);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Airport search failed with status ${response.status}`);
  }

  const payload = await response.json();

  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];

  return list.map(toSuggestion).filter((item) => item.value && item.code);
};

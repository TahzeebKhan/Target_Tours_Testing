"use client";
import React, { useEffect, useRef } from "react";
import { fetchAirportSuggestions } from "@/shared/services/airportSearch";

export const CITY_IATA_MAP = {
  Ahmedabad: "AMD",
  Amritsar: "ATQ",
  Bangkok: "BKK",
  Bangalore: "BLR",
  Bengaluru: "BLR",
  Bhubaneswar: "BBI",
  Chandigarh: "IXC",
  Delhi: "DEL",
  Dubai: "DXB",
  Goa: "GOI",
  Gurugram: "DEL",
  Gurgaon: "DEL",
  Hyderabad: "HYD",
  Indore: "IDR",
  Jaipur: "JAI",
  Chennai: "MAA",
  Kolkata: "CCU",
  Lucknow: "LKO",
  London: "LHR",
  Mumbai: "BOM",
  "New York": "JFK",
  Noida: "DEL",
  Paris: "CDG",
  Pune: "PNQ",
  Singapore: "SIN",
  Sydney: "SYD",
  Tokyo: "HND",
};

const CITY_ALIASES = {
  "Bangalore Urban": "Bengaluru",
  Bombay: "Mumbai",
  Calcutta: "Kolkata",
  Gurgaon: "Gurugram",
  "New Delhi": "Delhi",
};

export const DEFAULT_CITY = "Delhi";

const LOCATION_CACHE_KEY = "popularFlightsOriginCity";
const GEOLOCATION_TIMEOUT_MS = 8000;

export const getCodeFromValue = (value = "") => {
  const trimmed = String(value || "").trim();
  if (/^[A-Za-z]{3}$/.test(trimmed)) return trimmed.toUpperCase();
  return "";
};

export const normalizeCityName = (value = "") => {
  const city = String(value || "").trim();
  if (!city) return "";
  return CITY_ALIASES?.[city] || city;
};

export const getCityIataCode = (city = "") => {
  const normalizedCity = normalizeCityName(city);
  return CITY_IATA_MAP?.[normalizedCity] || "";
};

const getSupportedCity = (city = "") => {
  const normalizedCity = normalizeCityName(city);
  return getCityIataCode(normalizedCity) ? normalizedCity : "";
};

const getCachedLocation = () => {
  if (typeof localStorage === "undefined") return null;

  try {
    const cachedValue = localStorage.getItem(LOCATION_CACHE_KEY);
    if (!cachedValue) return null;

    const parsedValue = JSON.parse(cachedValue);
    if (typeof parsedValue === "string") {
      return {
        city: getSupportedCity(parsedValue),
        iataCode: getCityIataCode(parsedValue),
      };
    }

    const city = normalizeCityName(parsedValue?.city);
    const iataCode =
      getCodeFromValue(parsedValue?.iataCode) || getCityIataCode(city);

    return city && iataCode ? { city, iataCode } : null;
  } catch {
    const cachedCity = getSupportedCity(localStorage.getItem(LOCATION_CACHE_KEY));
    return cachedCity
      ? { city: cachedCity, iataCode: getCityIataCode(cachedCity) }
      : null;
  }
};

export const cacheLocation = (city = "", iataCode = "") => {
  if (typeof localStorage === "undefined") return;

  const normalizedCity = normalizeCityName(city);
  const normalizedIataCode =
    getCodeFromValue(iataCode) || getCityIataCode(normalizedCity);

  if (!normalizedCity || !normalizedIataCode) return;

  localStorage.setItem(
    LOCATION_CACHE_KEY,
    JSON.stringify({
      city: normalizedCity,
      iataCode: normalizedIataCode,
    })
  );
};

const resolveAirportForCity = async (city = "") => {
  const normalizedCity = normalizeCityName(city);
  if (!normalizedCity) return null;

  const knownCode = getCityIataCode(normalizedCity);
  if (knownCode) {
    return {
      city: normalizedCity,
      iataCode: knownCode,
    };
  }

  try {
    const suggestions = await fetchAirportSuggestions(normalizedCity);
    const airport = suggestions.find((item) =>
      getCodeFromValue(item?.iataCode || item?.code)
    );
    const iataCode = getCodeFromValue(airport?.iataCode || airport?.code);

    if (iataCode) {
      return {
        city: normalizeCityName(airport?.value) || normalizedCity,
        iataCode,
      };
    }
  } catch {
    // Keep the default origin if the backend airport lookup is unavailable.
  }

  return null;
};

const getPosition = () =>
  new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is unavailable"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: 30 * 60 * 1000,
      timeout: GEOLOCATION_TIMEOUT_MS,
    });
  });

const getCityFromGoogleAddress = (components = []) => {
  const priorityTypes = [
    "locality",
    "postal_town",
    "administrative_area_level_3",
    "administrative_area_level_2",
  ];

  for (const type of priorityTypes) {
    const component = components.find((item) => item?.types?.includes(type));
    const city = normalizeCityName(component?.long_name);
    if (city) return city;
  }

  return "";
};

const fetchCityFromCoordinates = async (latitude, longitude) => {
  const apiKey = process.env.NEXT_PUBLIC_MAP_KEY;
  if (!apiKey) return "";

  const params = new URLSearchParams({
    latlng: `${latitude},${longitude}`,
    key: apiKey,
  });
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
  );
  if (!response.ok) return "";

  const data = await response.json();
  const results = Array.isArray(data?.results) ? data.results : [];

  for (const result of results) {
    const city = getCityFromGoogleAddress(result?.address_components || []);
    if (city) return city;
  }

  return "";
};

const fetchCityFromIp = async () => {
  const providers = [
    {
      url: "https://ipapi.co/json/",
      pickCity: (data) => data?.city,
    },
    {
      url: "https://ipwho.is/",
      pickCity: (data) => data?.city,
    },
  ];

  for (const provider of providers) {
    try {
      const response = await fetch(provider.url);
      if (!response.ok) continue;

      const data = await response.json();
      const city = normalizeCityName(provider.pickCity(data));
      if (city) return city;
    } catch {
      // Try the next provider.
    }
  }

  return "";
};

const detectOriginCity = async () => {
  try {
    const position = await getPosition();
    const city = await fetchCityFromCoordinates(
      position.coords.latitude,
      position.coords.longitude
    
    );
    if (city) return city;
  } catch {
    // Fall back to IP-based location when precise location is blocked or fails.
  }

  return fetchCityFromIp();
};

const CurrentCityDetector = ({ onLocationResolved }) => {
  const onLocationResolvedRef = useRef(onLocationResolved);

  useEffect(() => {
    onLocationResolvedRef.current = onLocationResolved;
  }, [onLocationResolved]);

  useEffect(() => {
    let isMounted = true;

    const updateOrigin = (location) => {
      const normalizedCity = normalizeCityName(location?.city);
      const normalizedIataCode =
        getCodeFromValue(location?.iataCode) || getCityIataCode(normalizedCity);
      if (!normalizedCity || !normalizedIataCode || !isMounted) return;

      cacheLocation(normalizedCity, normalizedIataCode);
      onLocationResolvedRef.current?.({
        city: normalizedCity,
        iataCode: normalizedIataCode,
      });
    };

    const cachedLocation = getCachedLocation();
    if (cachedLocation) {
      updateOrigin(cachedLocation);
    }

    detectOriginCity()
      .then(resolveAirportForCity)
      .then((location) => {
        if (location) updateOrigin(location);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return null;
};

export default CurrentCityDetector;

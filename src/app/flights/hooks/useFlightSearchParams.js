"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const FLIGHT_SEARCH_PARAMS_KEY = "target_tours_flight_search_params";
const FLIGHT_SEARCH_PARAMS_EVENT = "target-tours-flight-search-params";

const readStoredSearch = () => {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(FLIGHT_SEARCH_PARAMS_KEY) || "";
  } catch {
    return "";
  }
};

export const storeFlightSearchParams = (value) => {
  if (typeof window === "undefined") return;
  const query =
    value instanceof URLSearchParams
      ? value.toString()
      : String(value || "").replace(/^\?/, "");
  try {
    window.sessionStorage.setItem(FLIGHT_SEARCH_PARAMS_KEY, query);
    window.dispatchEvent(
      new CustomEvent(FLIGHT_SEARCH_PARAMS_EVENT, { detail: query })
    );
  } catch {
  }
};

export const useFlightSearchParams = () => {
  const urlSearchParams = useSearchParams();
  const urlQuery = urlSearchParams?.toString() || "";
  const [storedQuery, setStoredQuery] = useState(readStoredSearch);

  useEffect(() => {
    if (urlQuery) {
      storeFlightSearchParams(urlQuery);
      setStoredQuery(urlQuery);
      window.history.replaceState(window.history.state, "", "/flights");
      return;
    }

    setStoredQuery(readStoredSearch());
  }, [urlQuery]);

  useEffect(() => {
    const handleStoredSearchChange = (event) => {
      setStoredQuery(String(event.detail || ""));
    };
    window.addEventListener(
      FLIGHT_SEARCH_PARAMS_EVENT,
      handleStoredSearchChange
    );
    return () =>
      window.removeEventListener(
        FLIGHT_SEARCH_PARAMS_EVENT,
        handleStoredSearchChange
      );
  }, []);

  return useMemo(
    () => new URLSearchParams(urlQuery || storedQuery),
    [storedQuery, urlQuery]
  );
};

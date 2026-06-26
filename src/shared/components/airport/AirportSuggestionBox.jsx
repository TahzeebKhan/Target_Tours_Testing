"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SuggestionBox from "@/app/home-page/components/homePage/SuggestionBox";
import {
  AIRPORT_SUGGESTIONS_QUERY_KEY,
  fetchAirportSuggestions,
} from "@/shared/services/airportSearch";
import {
  RECENT_SEARCHES_QUERY_KEY,
  fetchRecentSearches,
} from "@/shared/services/recentSearch";

const useDebouncedValue = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
};

const AirportSuggestionBox = ({
  boxRef,
  query,
  onSelect,
  minChars = 2,
  recentType = "flight",
  field = "",
}) => {
  const normalizedQuery = String(query || "").trim();
  const debouncedQuery = useDebouncedValue(normalizedQuery, 300);
  const shouldFetch = debouncedQuery.length >= minChars;
  const recentAirport =
    field === "to" || field === "destination" ? "destination" : "origin";

  const { data = [] } = useQuery({
    queryKey: [...AIRPORT_SUGGESTIONS_QUERY_KEY, debouncedQuery.toLowerCase()],
    queryFn: () => fetchAirportSuggestions(debouncedQuery),
    enabled: shouldFetch,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const { data: recentSuggestions = [] } = useQuery({
    queryKey: [...RECENT_SEARCHES_QUERY_KEY, recentType, recentAirport],
    queryFn: () =>
      fetchRecentSearches({ type: recentType, airport: recentAirport }),
    enabled: !shouldFetch,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const getFieldRecentSuggestion = (suggestion) => {
    if (!suggestion?.route || !field) return suggestion;

    const route = suggestion.route;
    const isDestination = field === "to" || field === "destination";
    const value = isDestination ? route.destination : route.origin;
    const code = isDestination ? route.destinationCode : route.originCode;

    if (!value || !code) return null;

    return {
      label: value,
      detail: suggestion.detail,
      code,
      iataCode: code,
      value,
    };
  };

  const suggestions = shouldFetch
    ? data
    : recentSuggestions.map(getFieldRecentSuggestion).filter(Boolean);
  const heading = shouldFetch ? "SUGGESTIONS" : "RECENT SEARCH";

  if (!suggestions?.length) return null;

  return (
    <SuggestionBox
      boxRef={boxRef}
      heading={heading}
      suggestions={suggestions}
      onSelect={onSelect}
    />
  );
};

export default AirportSuggestionBox;

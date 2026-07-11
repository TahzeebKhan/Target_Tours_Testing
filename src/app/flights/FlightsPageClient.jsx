"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import MultiCityTrip from "./components/multiTrip/MultiCityTrip";
import OnewayFlightBooking from "./components/onewayTrip/OnewayFlightBooking";
import RoundTrip from "./components/roundTrip/RoundTrip";
import SessionExpiredModal from "./components/SessionExpiredModal";
import { useTripType } from "./TripTypeContext";
import { useSearchFlights } from "@/features/flights/hooks/useSearchFlights";
import { useDatewiseFare } from "@/features/flights/hooks/useDatewiseFare";
import { useFlightFilters } from "@/app/context/FlightFilterContext";
import { FLIGHT_FARE_EXPIRED_EVENT } from "@/features/flights/services/flightBooking";
import {
  buildSearchParams,
  mapFlightSearchResponse,
} from "@/features/flights/utils/flightSearchMappers";

const appendUniqueById = (existing = [], incoming = []) => {
  if (!Array.isArray(existing) || existing.length === 0) {
    return Array.isArray(incoming) ? incoming : [];
  }
  if (!Array.isArray(incoming) || incoming.length === 0) return existing;

  const seen = new Set(
    existing.map((item, index) =>
      String(item?.id ?? item?.flightId ?? item?.index ?? `existing-${index}`)
    )
  );

  const merged = [...existing];
  incoming.forEach((item, index) => {
    const key = String(item?.id ?? item?.flightId ?? item?.index ?? `incoming-${index}`);
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(item);
  });

  return merged;
};

const mergeMultiRouteResults = (previous = {}, incoming = {}) => {
  const merged = { ...(previous || {}) };

  Object.entries(incoming || {}).forEach(([routeKey, routeData]) => {
    const current = merged[routeKey] || {};
    merged[routeKey] = {
      ...current,
      ...routeData,
      multi: appendUniqueById(current.multi, routeData?.multi),
      multiTripCards: appendUniqueById(
        current.multiTripCards,
        routeData?.multiTripCards,
      ),
    };
  });

  return merged;
};

const getTripCount = (mapped, tripType) => {
  if (!mapped) return 0;
  if (tripType === "oneway") return mapped.oneway?.length || 0;
  if (tripType === "round") {
    return Math.max(mapped.round?.length || 0, mapped.roundTripCards?.length || 0);
  }
  return Math.max(mapped.multi?.length || 0, mapped.multiTripCards?.length || 0);
};

const parseCurrencyValue = (value) => {
  const numeric = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
};

const parseTimeValue = (value) => {
  const match = String(value || "").match(/(\d{1,2}):(\d{2})/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(match[1]) * 60 + Number(match[2]);
};

const getDurationValue = (duration = {}) => {
  const hasDuration = duration?.hours !== undefined || duration?.minutes !== undefined;
  if (!hasDuration) return Number.MAX_SAFE_INTEGER;

  const hours = Number(duration?.hours || 0);
  const minutes = Number(duration?.minutes || 0);
  return hours * 60 + minutes;
};

const getFlightSortValue = (flight, sortBy) => {
  const primaryLeg = flight?.outbound || flight?.depart?.flight || flight;

  switch (sortBy) {
    case "lowest":
      return parseCurrencyValue(flight?.fare?.totalFare || primaryLeg?.fare?.totalFare) ?? Number.MAX_SAFE_INTEGER;
    case "highest":
      return -(parseCurrencyValue(flight?.fare?.totalFare || primaryLeg?.fare?.totalFare) ?? 0);
    case "early_dep":
      return parseTimeValue(primaryLeg?.departure?.time);
    case "late_dep": {
      const departureTime = parseTimeValue(primaryLeg?.departure?.time);
      return departureTime === Number.MAX_SAFE_INTEGER
        ? Number.MAX_SAFE_INTEGER
        : -departureTime;
    }
    case "early_arr":
      return parseTimeValue(primaryLeg?.arrival?.time);
    case "shortest":
      return getDurationValue(primaryLeg?.duration);
    case "airline":
      return String(
        primaryLeg?.airlines?.[0]?.name ||
          primaryLeg?.airline?.name ||
          flight?.airlines?.[0]?.name ||
          "",
      ).toLowerCase();
    default:
      return 0;
  }
};

const sortFlightsByOption = (items = [], sortBy) => {
  if (!sortBy || !Array.isArray(items)) return items;

  return [...items].sort((left, right) => {
    const leftValue = getFlightSortValue(left, sortBy);
    const rightValue = getFlightSortValue(right, sortBy);

    if (typeof leftValue === "string" || typeof rightValue === "string") {
      return String(leftValue).localeCompare(String(rightValue));
    }

    return leftValue - rightValue;
  });
};

const sortCardsByFlightOrder = (cards = [], sortedFlights = []) => {
  if (!Array.isArray(cards) || !Array.isArray(sortedFlights) || !sortedFlights.length) {
    return cards;
  }

  const order = new Map(
    sortedFlights.map((flight, index) => [String(flight?.id || ""), index]),
  );

  return [...cards].sort((left, right) => {
    const leftOrder = order.get(String(left?.id || "")) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = order.get(String(right?.id || "")) ?? Number.MAX_SAFE_INTEGER;
    return leftOrder - rightOrder;
  });
};

const FlightsPageClient = () => {
  const { tripType, committedRequest, searchRefreshToken: contextSearchRefreshToken } = useTripType();
  const { filters, setApiFilterData } = useFlightFilters();
  const urlSearchParams = useSearchParams();

  const request = committedRequest || {};
  const requestTripType = request.tripType || tripType;
  const hasCommittedSearch = Boolean(request?.from && request?.to);

  const [currentPage, setCurrentPage] = useState(1);
  const [aggregatedMappedData, setAggregatedMappedData] = useState(null);
  const [searchRefreshToken, setSearchRefreshToken] = useState(0);
  const [expiredSession, setExpiredSession] = useState(null);
  const isLoadingMoreRef = useRef(false);
  const lastApiFilterDataRef = useRef("");
  const lastDatewiseRefreshRef = useRef(0);
  const lastExpiredFareRef = useRef("");

  const rawQueryParams = useMemo(
    () => Object.fromEntries(urlSearchParams?.entries?.() || []),
    [urlSearchParams]
  );

  const apiFilters = useMemo(() => {
    const { sortBy, ...apiRelevantFilters } = filters;
    return apiRelevantFilters;
  }, [filters]);

  const baseSearchParams = useMemo(
    () =>
      buildSearchParams({
        tripType: requestTripType,
        from: request.from,
        to: request.to,
        fromCode: request.fromCode,
        toCode: request.toCode,
        startDate: request.startDate,
        endDate: request.endDate,
        passengers: request.passengers,
        travelClass: request.travelClass,
        fareTypes: request.fareTypes,
        searchParams: rawQueryParams,
        filters: apiFilters,
      }),
    [
      requestTripType,
      request.from,
      request.to,
      request.fromCode,
      request.toCode,
      request.startDate,
      request.endDate,
      request.passengers,
      request.travelClass,
      request.fareTypes,
      rawQueryParams,
      apiFilters,
    ]
  );

  const searchParams = useMemo(
    () => ({
      ...baseSearchParams,
      page: currentPage,
    }),
    [baseSearchParams, currentPage]
  );

  const baseSearchKey = useMemo(
    () => JSON.stringify(baseSearchParams),
    [baseSearchParams]
  );
  const combinedRefreshToken = useMemo(
    () => `${searchRefreshToken}:${contextSearchRefreshToken || 0}`,
    [contextSearchRefreshToken, searchRefreshToken],
  );

  useEffect(() => {
    setCurrentPage(1);
    setAggregatedMappedData(null);
    setApiFilterData(null);
    isLoadingMoreRef.current = false;
  }, [baseSearchKey, combinedRefreshToken, setApiFilterData]);

  const {
    data,
    isLoading,
    isFetching,
    error,
    errorUpdatedAt,
    dataUpdatedAt: searchDataUpdatedAt,
  } = useSearchFlights({
    params: searchParams,
    enabled: Boolean(tripType && hasCommittedSearch),
    filterTrigger: apiFilters,
    refreshTrigger: combinedRefreshToken,
  });

  const {
    data: datewiseFareData,
    refetch: refetchDatewiseFare,
  } = useDatewiseFare({
    tripType: requestTripType,
    from: request.from,
    to: request.to,
    fromCode: request.fromCode,
    toCode: request.toCode,
    startDate: request.startDate,
    endDate: request.endDate,
    provider: "both",
    domain: process.env.NEXT_PUBLIC_DOMAIN,
    enabled: Boolean(requestTripType && hasCommittedSearch),
  });

  useEffect(() => {
    if (!searchDataUpdatedAt || currentPage !== 1 || !hasCommittedSearch) return;
    if (lastDatewiseRefreshRef.current === searchDataUpdatedAt) return;

    lastDatewiseRefreshRef.current = searchDataUpdatedAt;
    refetchDatewiseFare();
  }, [currentPage, hasCommittedSearch, refetchDatewiseFare, searchDataUpdatedAt]);

  useEffect(() => {
    const handleFareExpired = (event) => {
      const detail = event?.detail || {};
      const message = detail?.message || "Fares expired please search again";
      const searchKey = detail?.searchKey || "";
      const eventKey = `${searchKey}:${message}`;

      if (lastExpiredFareRef.current !== eventKey) {
        lastExpiredFareRef.current = eventKey;
        toast.warn(message);
      }

      setExpiredSession({ message });
      setCurrentPage(1);
      setAggregatedMappedData(null);
      setSearchRefreshToken(Date.now());
    };

    window.addEventListener(FLIGHT_FARE_EXPIRED_EVENT, handleFareExpired);
    return () =>
      window.removeEventListener(FLIGHT_FARE_EXPIRED_EVENT, handleFareExpired);
  }, []);

  const fallbackDatewiseFareTiles = useMemo(() => {
    const list = Array.isArray(data?.date_wise) ? data.date_wise : [];
    if (!list.length) return [];

    return list
      .map((item) => {
        const date = item?.date ? new Date(item.date) : null;
        const price = Number(item?.price);
        if (!date || Number.isNaN(date.getTime()) || !Number.isFinite(price)) {
          return null;
        }

        return {
          date: item?.date,
          label: date.toLocaleDateString("en-US", {
            weekday: "short",
            day: "2-digit",
            month: "short",
          }),
          price,
          trend: "neutral",
        };
      })
      .filter(Boolean);
  }, [data]);

  const mappedPageData = useMemo(
    () =>
      mapFlightSearchResponse({
        response: data,
        tripType: requestTripType,
        passengers: request.passengers,
        travelClass: request.travelClass,
        returnDate: request.endDate,
        fromLabel: request.from,
        toLabel: request.to,
        page: searchParams.page,
        limit: searchParams.limit,
      }),
    [
      data,
      requestTripType,
      request.passengers,
      request.travelClass,
      request.endDate,
      request.from,
      request.to,
      searchParams.page,
      searchParams.limit,
    ]
  );

  useEffect(() => {
    if (!data || !mappedPageData) return;

    setAggregatedMappedData((prev) => {
      if (currentPage === 1 || !prev) return mappedPageData;

      const merged = {
        ...mappedPageData,
        oneway: appendUniqueById(prev.oneway, mappedPageData.oneway),
        round: appendUniqueById(prev.round, mappedPageData.round),
        roundTripCards: appendUniqueById(prev.roundTripCards, mappedPageData.roundTripCards),
        multi: appendUniqueById(prev.multi, mappedPageData.multi),
        multiTripCards: appendUniqueById(prev.multiTripCards, mappedPageData.multiTripCards),
        multiRouteResults: mergeMultiRouteResults(
          prev.multiRouteResults,
          mappedPageData.multiRouteResults,
        ),
      };

      const total = Number(
        mappedPageData?.pagination?.total ?? prev?.pagination?.total ?? 0
      );
      const combinedCount = getTripCount(merged, requestTripType);
      merged.pagination = {
        ...(mappedPageData?.pagination || prev?.pagination || {}),
        total,
        from: combinedCount > 0 ? 1 : 0,
        to: total > 0 ? Math.min(combinedCount, total) : combinedCount,
      };

      return merged;
    });
  }, [data, mappedPageData, currentPage, requestTripType]);

  const mappedData = aggregatedMappedData || mappedPageData || {
    oneway: [],
    round: [],
    roundTripCards: [],
    multi: [],
    multiTripCards: [],
    multiRouteResults: {},
    pagination: { from: 0, to: 0, total: 0 },
    sortHighlights: null,
  };

  const sortedMappedData = useMemo(() => {
    const sortBy = filters.sortBy;
    if (!sortBy) return mappedData;

    const oneway = sortFlightsByOption(mappedData.oneway, sortBy);
    const round = sortFlightsByOption(mappedData.round, sortBy);
    const multi = sortFlightsByOption(mappedData.multi, sortBy);
    const multiRouteResults = Object.fromEntries(
      Object.entries(mappedData.multiRouteResults || {}).map(([routeKey, routeData]) => {
        const routeMulti = sortFlightsByOption(routeData?.multi, sortBy);
        return [
          routeKey,
          {
            ...routeData,
            multi: routeMulti,
            multiTripCards: sortCardsByFlightOrder(routeData?.multiTripCards, routeMulti),
          },
        ];
      }),
    );

    return {
      ...mappedData,
      oneway,
      round,
      roundTripCards: sortCardsByFlightOrder(mappedData.roundTripCards, round),
      multi,
      multiTripCards: sortCardsByFlightOrder(mappedData.multiTripCards, multi),
      multiRouteResults,
    };
  }, [filters.sortBy, mappedData]);

  const selectedDateTilePrice = useMemo(() => {
    if (requestTripType !== "oneway" || !request.startDate) return null;
    if (currentPage === 1 && isFetching) return null;

    const candidates = (sortedMappedData.oneway || [])
      .map((flight) =>
        parseCurrencyValue(
          flight?.fare?.pricePerAdult || flight?.fare?.totalFare || ""
        )
      )
      .filter((value) => Number.isFinite(value));

    if (!candidates.length) return null;
    return Math.min(...candidates);
  }, [currentPage, isFetching, request.startDate, requestTripType, sortedMappedData.oneway]);

  const resolvedDatewiseFareTiles = useMemo(() => {
    const baseTiles =
      datewiseFareData?.tiles?.length > 0 ? datewiseFareData.tiles : fallbackDatewiseFareTiles;

    if (
      requestTripType !== "oneway" ||
      !request.startDate ||
      !Number.isFinite(selectedDateTilePrice)
    ) {
      return baseTiles;
    }

    const hasSelectedDateTile = baseTiles.some(
      (tile) => String(tile?.date || "") === String(request.startDate)
    );

    if (hasSelectedDateTile) return baseTiles;

    const selectedDate = new Date(request.startDate);
    if (Number.isNaN(selectedDate.getTime())) return baseTiles;

    return [
      ...baseTiles,
      {
        date: request.startDate,
        label: selectedDate.toLocaleDateString("en-US", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        }),
        price: selectedDateTilePrice,
        trend: "neutral",
      },
    ];
  }, [
    datewiseFareData?.tiles,
    fallbackDatewiseFareTiles,
    request.startDate,
    requestTripType,
    selectedDateTilePrice,
  ]);
  const isInitialLoad = !aggregatedMappedData && !data && (isLoading || isFetching);
  const isRefreshingResults = currentPage === 1 && !isInitialLoad && isFetching;

  useEffect(() => {
    const resolvedFilters =
      mappedPageData?.raw?.filters ||
      mappedPageData?.raw?.data?.filters ||
      data?.filters ||
      data?.data?.filters ||
      null;
    const resolvedAircrafts =
      mappedPageData?.raw?.aircrafts ||
      mappedPageData?.raw?.data?.aircrafts ||
      data?.aircrafts ||
      data?.data?.aircrafts ||
      [];
    const resolvedMeta =
      mappedPageData?.raw?.meta ||
      mappedPageData?.raw?.data?.meta ||
      data?.meta ||
      data?.data?.meta ||
      {};
    const priceMin = Number(resolvedMeta?.price_min);
    const priceMax = Number(resolvedMeta?.price_max);

    const mergedFilterData = {
      ...(resolvedFilters || {}),
      aircrafts: Array.isArray(resolvedAircrafts) ? resolvedAircrafts : [],
      price_min: Number.isFinite(priceMin) ? priceMin : undefined,
      price_max: Number.isFinite(priceMax) ? priceMax : undefined,
    };

    const hasValidSlots =
      mergedFilterData &&
      (mergedFilterData.departure_slots ||
        mergedFilterData.arrival_slots ||
        mergedFilterData.return_departure_slots ||
        mergedFilterData.return_arrival_slots);
    const hasAircrafts =
      Array.isArray(mergedFilterData?.aircrafts) &&
      mergedFilterData.aircrafts.length > 0;
    const hasAirlines =
      Array.isArray(mergedFilterData?.airlines) &&
      mergedFilterData.airlines.length > 0;
    const hasPriceBounds =
      Number.isFinite(mergedFilterData.price_min) &&
      Number.isFinite(mergedFilterData.price_max);

    if (hasValidSlots || hasAircrafts || hasAirlines || hasPriceBounds) {
      const nextSerialized = JSON.stringify(mergedFilterData);
      if (lastApiFilterDataRef.current === nextSerialized) return;

      lastApiFilterDataRef.current = nextSerialized;
      setApiFilterData(mergedFilterData);
    }
  }, [mappedPageData?.raw, data, setApiFilterData]);

  useEffect(() => {
    if (!error) return;

    const status = error?.status;
    const baseMessage =
      error?.message ||
      error?.response?.data?.error?.message ||
      "Flight search failed. Please try again.";
    const message = status ? `${status}: ${baseMessage}` : baseMessage;

    toast.error(message);
  }, [errorUpdatedAt, error]);

  const activePagination = mappedData?.pagination;
  const hasMorePages = Boolean(
    hasCommittedSearch &&
      activePagination &&
      Number(activePagination.to || 0) < Number(activePagination.total || 0)
  );

  useEffect(() => {
    if (!hasMorePages) return;

    const onScroll = () => {
      if (isFetching || isLoadingMoreRef.current) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const viewport = window.innerHeight || document.documentElement.clientHeight;
      const fullHeight = document.documentElement.scrollHeight;
      const nearBottom = scrollTop + viewport >= fullHeight - 500;

      if (!nearBottom) return;

      isLoadingMoreRef.current = true;
      setCurrentPage((prev) => prev + 1);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasMorePages, isFetching]);

  useEffect(() => {
    if (!isFetching) {
      isLoadingMoreRef.current = false;
    }
  }, [isFetching]);

  if (!tripType) return null;

  return (
    <>
      <SessionExpiredModal
        isOpen={Boolean(expiredSession)}
        message={expiredSession?.message}
        onClose={() => setExpiredSession(null)}
      />

      {tripType === "oneway" && (
        <OnewayFlightBooking
          flightData={sortedMappedData.oneway}
          datewiseFareTiles={resolvedDatewiseFareTiles}
          selectedDepartureDate={request.startDate}
          travellerSummary={request?.passengers}
          pagination={sortedMappedData.pagination}
          sortHighlights={sortedMappedData.sortHighlights}
          hasSearched={hasCommittedSearch}
          isLoading={isInitialLoad}
          isRefreshing={isRefreshingResults}
          queryError={error}
        />
      )}

      {tripType === "round" && (
        <RoundTrip
          flightData={sortedMappedData.round}
          tripCards={sortedMappedData.roundTripCards}
          datewiseFareTiles={resolvedDatewiseFareTiles}
          selectedDepartureDate={request.startDate}
          pagination={sortedMappedData.pagination}
          sortHighlights={sortedMappedData.sortHighlights}
          hasSearched={hasCommittedSearch}
          isLoading={isInitialLoad}
          isRefreshing={isRefreshingResults}
          queryError={error}
        />
      )}

      {tripType === "multi" && (
        <MultiCityTrip
          flightData={sortedMappedData.multi}
          tripCards={sortedMappedData.multiTripCards}
          routeResults={sortedMappedData.multiRouteResults}
          datewiseFareTiles={resolvedDatewiseFareTiles}
          selectedDepartureDate={request.startDate}
          pagination={sortedMappedData.pagination}
          sortHighlights={sortedMappedData.sortHighlights}
          hasSearched={hasCommittedSearch}
          isLoading={isInitialLoad}
          isRefreshing={isRefreshingResults}
          queryError={error}
        />
      )}
    </>
  );
};

export default FlightsPageClient;

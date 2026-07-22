"use client";

import { useQuery } from "@tanstack/react-query";
import { searchFlights } from "@/features/flights/services/searchFlights";

export const useSearchFlights = ({
  params,
  enabled = true,
  filterTrigger = null,
  refreshTrigger = 0,
}) => {
  return useQuery({
    queryKey: ["search-flights", params, filterTrigger, refreshTrigger],
    queryFn: () => searchFlights(params),
    enabled,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};

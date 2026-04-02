"use client";

import { useQuery } from "@tanstack/react-query";
import { searchFlights } from "@/features/flights/services/searchFlights";

export const useSearchFlights = ({
  params,
  enabled = true,
  filterTrigger = null,
}) => {
  return useQuery({
    queryKey: ["search-flights", params, filterTrigger],
    queryFn: () => searchFlights(params),
    enabled,
    staleTime: 1000 * 60,
    placeholderData: (previousData) => previousData,
  });
};

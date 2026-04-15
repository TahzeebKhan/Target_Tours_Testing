"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchTours } from "@/shared/services/tourPackage";

export const useInfiniteTours = ({ filters = {} }) => {
  return useInfiniteQuery({
    queryKey: ["tours", { filters }],
    queryFn: fetchTours,
    keepPreviousData: true,
    staleTime: 0,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.meta?.pagination;
      if (!pagination) return undefined;

      const { page, pageCount } = pagination;
      return page < pageCount ? page + 1 : undefined;
    },
  });
};

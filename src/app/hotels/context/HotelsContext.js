"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const HotelsContext = createContext(null);

export const HotelsProvider = ({ children }) => {
  const [filterData, setFilterData] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [hotels, setHotels] = useState([]);
  const [displayHotels, setDisplayHotels] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [meta, setMeta] = useState({});

  const resetFilters = useCallback(() => {
    setAppliedFilters({});
  }, []);

  const value = useMemo(
    () => ({
      filterData,
      setFilterData,
      appliedFilters,
      setAppliedFilters,
      resetFilters,
      hotels,
      setHotels,
      displayHotels,
      setDisplayHotels,
      totalResults,
      setTotalResults,
      isLoading,
      setIsLoading,
      meta,
      setMeta,
    }),
    [
      appliedFilters,
      displayHotels,
      filterData,
      hotels,
      isLoading,
      meta,
      resetFilters,
      totalResults,
    ],
  );

  return (
    <HotelsContext.Provider value={value}>{children}</HotelsContext.Provider>
  );
};

export const useHotelsContext = () => {
  const context = useContext(HotelsContext);

  if (!context) {
    throw new Error("useHotelsContext must be used inside HotelsProvider");
  }

  return context;
};

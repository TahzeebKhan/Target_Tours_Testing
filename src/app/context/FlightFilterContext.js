"use client";
import { createContext, useContext, useEffect, useState } from "react";

const FlightFilterContext = createContext(null);

const DEFAULT_PRICE = [11307, 57295];

const initialFilters = {
  price: DEFAULT_PRICE,
  popular: {
    refundable: false,
    oneStop: false,
    lateDeparture: false,
    nonStop: false,
  },
  stops: {
    nonStop: false,
    oneStop: false,
    twoPlus: false,
  },
  departureJakarta: null,
  departureSingapore: null,
  aircraft: {},
  airlines: {},
};

export function FlightFilterProvider({ children }) {
  const [filters, setFilters] = useState(initialFilters);
  const [filterChips, setFilterChips] = useState([]);

  /* ========================
     HELPERS
  ======================== */

  const toggleCheckbox = (group, key) => {
    setFilters((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: !prev[group][key],
      },
    }));
  };

  const toggleMapCheckbox = (group, key) => {
    setFilters((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: !prev[group]?.[key],
      },
    }));
  };

  const selectDeparture = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type] === value ? null : value,
    }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  /* ========================
     BUILD FILTER CHIPS
  ======================== */

  useEffect(() => {
    const chips = [];

    /* POPULAR */
    Object.entries(filters.popular).forEach(([key, value]) => {
      if (value) {
        const labelMap = {
          refundable: "Refundable Fare",
          oneStop: "1 Stop",
          lateDeparture: "Late Departure",
          nonStop: "Non Stop",
        };
        chips.push({
          label: labelMap[key],
          onRemove: () => toggleCheckbox("popular", key),
        });
      }
    });

    /* STOPS */
    Object.entries(filters.stops).forEach(([key, value]) => {
      if (value) {
        const labelMap = {
          nonStop: "Non Stop",
          oneStop: "1 Stop",
          twoPlus: "2+ Stops",
        };
        chips.push({
          label: labelMap[key],
          onRemove: () => toggleCheckbox("stops", key),
        });
      }
    });

    /* DEPARTURE */
    const timeMap = {
      before6: "Before 6AM",
      "6to12": "6AM – 12PM",
      "12to6": "12PM – 6PM",
      after6: "After 6PM",
    };

    if (filters.departureJakarta) {
      chips.push({
        label: `Jakarta: ${timeMap[filters.departureJakarta]}`,
        onRemove: () => setFilters((p) => ({ ...p, departureJakarta: null })),
      });
    }

    if (filters.departureSingapore) {
      chips.push({
        label: `Singapore: ${timeMap[filters.departureSingapore]}`,
        onRemove: () => setFilters((p) => ({ ...p, departureSingapore: null })),
      });
    }

    /* AIRCRAFT */
    Object.keys(filters.aircraft).forEach((key) => {
      if (filters.aircraft[key]) {
        chips.push({
          label: key,
          onRemove: () => toggleMapCheckbox("aircraft", key),
        });
      }
    });

    /* AIRLINES */
    Object.keys(filters.airlines).forEach((key) => {
      if (filters.airlines[key]) {
        chips.push({
          label: key,
          onRemove: () => toggleMapCheckbox("airlines", key),
        });
      }
    });

    setFilterChips(chips);
  }, [filters]);

  return (
    <FlightFilterContext.Provider
      value={{
        filters,
        setFilters,
        filterChips,
        toggleCheckbox,
        toggleMapCheckbox,
        selectDeparture,
        resetFilters,
      }}
    >
      {children}
    </FlightFilterContext.Provider>
  );
}

/* ========================
   HOOK
======================== */

export const useFlightFilters = () => {
  const context = useContext(FlightFilterContext);
  if (!context) {
    throw new Error(
      "useFlightFilters must be used inside FlightFilterProvider"
    );
  }
  return context;
};

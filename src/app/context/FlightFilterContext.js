"use client";
import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { useSearchParams } from "next/navigation";

const FlightFilterContext = createContext(null);

const DEFAULT_PRICE = [0, 1000000];

const POPULAR_LABELS = {
  refundable: "Refundable Fare",
  oneStop: "1 Stop",
  lateDeparture: "Late Departure",
  nonStop: "Non Stop",
};

const STOPS_LABELS = {
  nonStop: "Non Stop",
  oneStop: "1 Stop",
  twoPlus: "2+ Stops",
};

const TIME_SLOT_LABELS = {
  before6: "Before 6AM",
  "6to12": "6AM - 12PM",
  "12to6": "12PM - 6PM",
  after6: "After 6PM",
};

const FILTER_ACTIONS = {
  TOGGLE_GROUP_CHECKBOX: "TOGGLE_GROUP_CHECKBOX",
  TOGGLE_MAP_CHECKBOX: "TOGGLE_MAP_CHECKBOX",
  SELECT_DEPARTURE: "SELECT_DEPARTURE",
  CLEAR_DEPARTURE: "CLEAR_DEPARTURE",
  SET_PRICE_RANGE: "SET_PRICE_RANGE",
  SET_POPULAR_FILTER: "SET_POPULAR_FILTER",
  SET_STOPS_FILTER: "SET_STOPS_FILTER",
  SET_SORT_BY: "SET_SORT_BY",
  RESET_FILTERS: "RESET_FILTERS",
};

const createDefaultFilters = () => ({
  price: [...DEFAULT_PRICE],
  priceTouched: false,
  sortBy: null,
  popularTouched: false,
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
  stopsTouched: false,
  departureJakarta: null,
  departureSingapore: null,
  aircraft: {},
  airlines: {},
});

const filterReducer = (state, action) => {
  switch (action.type) {
    case FILTER_ACTIONS.TOGGLE_GROUP_CHECKBOX: {
      const { group, key } = action.payload;
      const isStopsFilter =
        group === "stops" ||
        (group === "popular" && (key === "nonStop" || key === "oneStop"));
      return {
        ...state,
        [group]: {
          ...state[group],
          [key]: !state[group]?.[key],
        },
        popularTouched: group === "popular" ? true : state.popularTouched,
        stopsTouched: isStopsFilter ? true : state.stopsTouched,
      };
    }
    case FILTER_ACTIONS.TOGGLE_MAP_CHECKBOX: {
      const { group, key } = action.payload;
      return {
        ...state,
        [group]: {
          ...state[group],
          [key]: !state[group]?.[key],
        },
      };
    }
    case FILTER_ACTIONS.SELECT_DEPARTURE: {
      const { type, value } = action.payload;
      return {
        ...state,
        [type]: state[type] === value ? null : value,
      };
    }
    case FILTER_ACTIONS.CLEAR_DEPARTURE: {
      const { type } = action.payload;
      return {
        ...state,
        [type]: null,
      };
    }
    case FILTER_ACTIONS.SET_PRICE_RANGE: {
      const { min, max } = action.payload;
      return {
        ...state,
        price: [min, max],
        priceTouched: true,
      };
    }
    case FILTER_ACTIONS.SET_POPULAR_FILTER: {
      const nextPopular = {
        ...state.popular,
        ...action.payload,
      };
      const hasChanged = Object.keys(nextPopular).some(
        (key) => nextPopular[key] !== state.popular[key],
      );
      if (!hasChanged) return state;

      return {
        ...state,
        popular: nextPopular,
      };
    }
    case FILTER_ACTIONS.SET_STOPS_FILTER: {
      const nextStops = {
        ...createDefaultFilters().stops,
        ...action.payload,
      };
      const hasChanged = Object.keys(nextStops).some(
        (key) => nextStops[key] !== state.stops[key],
      );
      if (!hasChanged) return state;

      return {
        ...state,
        stops: nextStops,
      };
    }
    case FILTER_ACTIONS.SET_SORT_BY: {
      return {
        ...state,
        sortBy: action.payload || null,
      };
    }
    case FILTER_ACTIONS.RESET_FILTERS: {
      return createDefaultFilters();
    }
    default:
      return state;
  }
};

export function FlightFilterProvider({ children }) {
  const searchParams = useSearchParams();
  const [filters, dispatch] = useReducer(filterReducer, undefined, createDefaultFilters);
  const [apiFilterData, setApiFilterData] = useState(null);
  const refundableParam = searchParams?.get("refundable");
  const stopsParam = searchParams?.get("stops") || "";

  useEffect(() => {
    dispatch({
      type: FILTER_ACTIONS.SET_POPULAR_FILTER,
      payload: {
        refundable: String(refundableParam || "").trim().toLowerCase() === "true",
      },
    });
  }, [refundableParam]);

  useEffect(() => {
    const selectedStops = String(stopsParam)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    dispatch({
      type: FILTER_ACTIONS.SET_STOPS_FILTER,
      payload: {
        nonStop: selectedStops.includes("0"),
        oneStop: selectedStops.includes("1"),
        twoPlus: selectedStops.includes("2"),
      },
    });
  }, [stopsParam]);

  const toggleCheckbox = (group, key) => {
    dispatch({
      type: FILTER_ACTIONS.TOGGLE_GROUP_CHECKBOX,
      payload: { group, key },
    });
  };

  const toggleMapCheckbox = (group, key) => {
    dispatch({
      type: FILTER_ACTIONS.TOGGLE_MAP_CHECKBOX,
      payload: { group, key },
    });
  };

  const selectDeparture = (type, value) => {
    dispatch({
      type: FILTER_ACTIONS.SELECT_DEPARTURE,
      payload: { type, value },
    });
  };

  const clearDeparture = (type) => {
    dispatch({
      type: FILTER_ACTIONS.CLEAR_DEPARTURE,
      payload: { type },
    });
  };

  const setPriceRange = (min, max) => {
    dispatch({
      type: FILTER_ACTIONS.SET_PRICE_RANGE,
      payload: { min, max },
    });
  };

  const resetFilters = () => {
    dispatch({ type: FILTER_ACTIONS.RESET_FILTERS });
  };

  const setSortBy = (value) => {
    dispatch({ type: FILTER_ACTIONS.SET_SORT_BY, payload: value });
  };

  // Build chips from active filters; keep this derived from `filters`
  // so it always stays in sync without extra state management.
  const filterChips = useMemo(() => {
    const chips = [];

    Object.entries(filters.popular).forEach(([key, isSelected]) => {
      if (isSelected && POPULAR_LABELS[key]) {
        chips.push({
          label: POPULAR_LABELS[key],
          onRemove: () => toggleCheckbox("popular", key),
        });
      }
    });

    Object.entries(filters.stops).forEach(([key, isSelected]) => {
      if (isSelected && STOPS_LABELS[key]) {
        chips.push({
          label: STOPS_LABELS[key],
          onRemove: () => toggleCheckbox("stops", key),
        });
      }
    });

    if (filters.departureJakarta) {
      chips.push({
        label: `Departure: ${TIME_SLOT_LABELS[filters.departureJakarta]}`,
        onRemove: () => clearDeparture("departureJakarta"),
      });
    }

    if (filters.departureSingapore) {
      chips.push({
        label: `Arrival: ${TIME_SLOT_LABELS[filters.departureSingapore]}`,
        onRemove: () => clearDeparture("departureSingapore"),
      });
    }

    Object.entries(filters.aircraft).forEach(([key, isSelected]) => {
      if (isSelected) {
        chips.push({
          label: key,
          onRemove: () => toggleMapCheckbox("aircraft", key),
        });
      }
    });

    Object.entries(filters.airlines).forEach(([key, isSelected]) => {
      if (isSelected) {
        chips.push({
          label: key,
          onRemove: () => toggleMapCheckbox("airlines", key),
        });
      }
    });

    return chips;
  }, [filters]);

  return (
    <FlightFilterContext.Provider
      value={{
        filters,
        apiFilterData,
        setApiFilterData,
        filterChips,
        toggleCheckbox,
        toggleMapCheckbox,
        selectDeparture,
        clearDeparture,
        setPriceRange,
        setSortBy,
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

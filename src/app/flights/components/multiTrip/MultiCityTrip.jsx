"use client";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import styles from "./MultiCityTrip.module.css";
import MultiCityFlightCard from "./MultiCityFlightCard";
import OfferBanner from "../offerComponent/OfferBanner";
import DatePriceSlider from "../DatePriceSlider";
import { useTripType } from "../../TripTypeContext";
import SortBySheet from "../SortBySheet";
import SortByDropdown from "../SortByDropdown";
import FlightSearchLoader from "../FlightSearchLoader";
import FlightNoResults from "../FlightNoResults";
import { useFlightFilters } from "@/app/context/FlightFilterContext";
import { X } from "lucide-react";
import FlightDetailsCard from "../PhoneViewComponents/multiTripPhoneView/FlightDetailsCard";
import { SidebarContext } from "../../SidebarContext";
import FareComparisonModalRoundTrip from "./FareComparisonModalMulticity";
import FareComparisonModalMulticity from "./FareComparisonModalMulticity";
import MobileFareComparisonModalMulticity from "./MobileFareComparisonModalMulticity";
import { getFlightWebSettings } from "@/features/flights/services/flightBooking";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";
const MultiCityTrip = ({
  flightData = [],
  tripCards = [],
  routeResults = {},
  datewiseFareTiles = [],
  pagination = null,
  sortHighlights = null,
  hasSearched = false,
  isLoading = false,
  isRefreshing = false,
}) => {
  const { committedSearches, multiSegments } = useTripType();
  const [openSort, setOpenSort] = useState(false);
  const sortTriggerRef = useRef(null);
  const isSortSheetMobile = useMediaQuery("(max-width: 629px)");
  const { from, to } = committedSearches.multi;
  const {
    filters,
    filterChips,
    toggleCheckbox,
    toggleMapCheckbox,
    selectDeparture,
    resetFilters,
    setSortBy,
    setApiFilterData,
  } = useFlightFilters();
  const quickSort = filters.sortBy === "lowest"
    ? "cheapest"
    : filters.sortBy === "shortest"
      ? "fastest"
      : "";
  const { setIsSidebarOpen } = useContext(SidebarContext);
  const [fareModalOpen, setFareModalOpen] = useState(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [selectedRouteFlights, setSelectedRouteFlights] = useState({});
  const [routeSort, setRouteSort] = useState({
    key: "",
    direction: "asc",
  });

  const openFareModal = async (flight) => {
    const searchTui =
      flight?.tripCard?.booking?.tui || flight?.booking?.tui;
    const provider =
      flight?.tripCard?.booking?.provider ||
      flight?.booking?.provider ||
      flight?.provider;

    if (searchTui) {
      try {
        await getFlightWebSettings({ TUI: searchTui, provider });
      } catch (error) {
        console.error("Failed to fetch flight web settings", error);
      }
    }

    setSelectedFlightId(flight?.id ?? null);
    setFareModalOpen(flight?.id ?? null);
  };
  const flightResults = [
    {
      id: 1,
      fare: {
        totalFare: "₹ 3,22,000",
        cabinClass: "ECONOMY",
      },

      outbound: {
        airlines: [
          {
            name: "Batik Air, Indonesia",
            code: "6E-541",
            logo: "/images/flightCompanyLogos/batikAirlines.png",
          },
        ],
        dateLabel: "WED, 17 DEC",
        departure: {
          time: "06:45",
          city: "JAKARTA (CGK)",
        },
        arrival: {
          time: "08:00",
          city: "SINGAPORE (SIN)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "Non Stop",
        },
      },

      inbound: {
        airlines: [
          {
            name: "Indonesia Airasia",
            code: "6E-541",
            logo: "/images/flightCompanyLogos/airAsia.png",
          },
        ],
        dateLabel: "THU, 31 DEC",
        departure: {
          time: "06:45",
          city: "SINGAPORE (SIN)",
        },
        arrival: {
          time: "08:00",
          city: "JAKARTA (CGK)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "Non Stop",
        },
      },
    },
    {
      id: 2,
      fare: {
        totalFare: "₹ 3,22,000",
        cabinClass: "ECONOMY",
      },

      outbound: {
        airlines: [
          {
            name: "Indigo",
            code: "6E-541",
            logo: "/images/dummyFlightlogo.png",
          },
        ],
        dateLabel: "WED, 17 DEC",
        departure: {
          time: "06:45",
          city: "JAKARTA (CGK)",
        },
        arrival: {
          time: "08:00",
          city: "SINGAPORE (SIN)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "Non Stop",
        },
      },

      inbound: {
        airlines: [
          {
            name: "Indonesia Airasia",
            code: "6E-541",
            logo: "/images/flightCompanyLogos/airAsia.png",
          },
        ],
        dateLabel: "THU, 31 DEC",
        departure: {
          time: "06:45",
          city: "SINGAPORE (SIN)",
        },
        arrival: {
          time: "08:00",
          city: "JAKARTA (CGK)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "Non Stop",
        },
      },
    },
    {
      id: 3,
      fare: {
        totalFare: "₹ 3,22,000",
        cabinClass: "ECONOMY",
      },

      outbound: {
        airlines: [
          {
            name: "Indonesia AirAsia",
            code: "6E-541",
            logo: "/images/flightCompanyLogos/airAsia.png",
          },
        ],
        dateLabel: "WED, 17 DEC",
        departure: {
          time: "06:45",
          city: "JAKARTA (CGK)",
        },
        arrival: {
          time: "08:00",
          city: "SINGAPORE (SIN)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "Non Stop",
        },
      },

      inbound: {
        airlines: [
          {
            name: "Indonesia Airasia",
            code: "6E-541",
            logo: "/images/flightCompanyLogos/airAsia.png",
          },
        ],
        dateLabel: "THU, 31 DEC",
        departure: {
          time: "06:45",
          city: "SINGAPORE (SIN)",
        },
        arrival: {
          time: "08:00",
          city: "JAKARTA (CGK)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "Non Stop",
        },
      },
    },
    {
      id: 4,
      fare: {
        totalFare: "₹ 3,22,000",
        cabinClass: "ECONOMY",
      },

      outbound: {
        airlines: [
          {
            name: "Batik Air, Indonesia",
            code: "6E-541",
            logo: "/images/flightCompanyLogos/batikAirlines.png",
          },
        ],
        dateLabel: "WED, 17 DEC",
        departure: {
          time: "06:45",
          city: "JAKARTA (CGK)",
        },
        arrival: {
          time: "08:00",
          city: "SINGAPORE (SIN)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "Non Stop",
        },
      },

      inbound: {
        airlines: [
          {
            name: "Indonesia Airasia",
            code: "6E-541",
            logo: "/images/flightCompanyLogos/airAsia.png",
          },
        ],
        dateLabel: "THU, 31 DEC",
        departure: {
          time: "06:45",
          city: "SINGAPORE (SIN)",
        },
        arrival: {
          time: "08:00",
          city: "JAKARTA (CGK)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "Non Stop",
        },
      },
    },
    {
      id: 5,
      fare: {
        totalFare: "₹ 3,22,000",
        cabinClass: "ECONOMY",
      },

      outbound: {
        airlines: [
          {
            name: "Indigo",
            code: "6E-541",
            logo: "/images/dummyFlightlogo.png",
          },
        ],
        dateLabel: "WED, 17 DEC",
        departure: {
          time: "06:45",
          city: "JAKARTA (CGK)",
        },
        arrival: {
          time: "08:00",
          city: "SINGAPORE (SIN)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "Non Stop",
        },
      },

      inbound: {
        airlines: [
          {
            name: "Indonesia Airasia",
            code: "6E-541",
            logo: "/images/flightCompanyLogos/airAsia.png",
          },
        ],
        dateLabel: "THU, 31 DEC",
        departure: {
          time: "06:45",
          city: "SINGAPORE (SIN)",
        },
        arrival: {
          time: "08:00",
          city: "JAKARTA (CGK)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "Non Stop",
        },
      },
    },
  ];
  const resolvedFlightResults = Array.isArray(flightData) ? flightData : [];
  const resolvedTripCards = Array.isArray(tripCards) ? tripCards : [];
  const parseFareValue = (fare) => {
    const raw = String(fare?.totalFare || "").replace(/[^\d]/g, "");
    const amount = Number(raw);
    return Number.isFinite(amount) ? amount : Number.MAX_SAFE_INTEGER;
  };
  const getTotalDurationMinutes = (flight) =>
    Number(flight?.outbound?.duration?.hours || 0) * 60 +
    Number(flight?.outbound?.duration?.minutes || 0) +
    Number(flight?.inbound?.duration?.hours || 0) * 60 +
    Number(flight?.inbound?.duration?.minutes || 0);
  const resolveByHighlight = (highlight) => {
    if (!highlight || !resolvedFlightResults.length) return null;
    const token = String(highlight.id || highlight.index || "").trim();
    const byId =
      token
        ? resolvedFlightResults.find((flight) => String(flight?.id || "").trim() === token)
        : null;
    if (byId) return byId;
    if (token) {
      const byCode = resolvedFlightResults.find((flight) => {
        const outboundCodes = (flight?.outbound?.airlines || []).map((a) =>
          String(a?.code || "").trim()
        );
        const inboundCodes = (flight?.inbound?.airlines || []).map((a) =>
          String(a?.code || "").trim()
        );
        return [...outboundCodes, ...inboundCodes].includes(token);
      });
      if (byCode) return byCode;
    }
    const time = (value) => {
      const s = String(value || "");
      const m = s.match(/(\d{2}:\d{2})/);
      return m ? m[1] : "";
    };
    const dep = time(highlight?.departure);
    const arr = time(highlight?.arrival);
    if (dep && arr) {
      const byTime = resolvedFlightResults.find(
        (flight) =>
          String(flight?.outbound?.departure?.time || "") === dep &&
          String(flight?.outbound?.arrival?.time || "") === arr
      );
      if (byTime) return byTime;
    }
    return null;
  };
  const cheapestFallback =
    resolvedFlightResults.length > 0
      ? resolvedFlightResults.reduce((min, current) =>
          parseFareValue(current?.fare) < parseFareValue(min?.fare)
            ? current
            : min
        )
      : null;
  const fastestFallback =
    resolvedFlightResults.length > 0
      ? resolvedFlightResults.reduce((min, current) =>
          getTotalDurationMinutes(current) < getTotalDurationMinutes(min)
            ? current
            : min
        )
      : null;
  const cheapestHighlightedFlight = resolveByHighlight(sortHighlights?.cheapest);
  const fastestHighlightedFlight = resolveByHighlight(sortHighlights?.fastest);
  const cheapestFlight = cheapestHighlightedFlight || cheapestFallback;
  const fastestFlight = fastestHighlightedFlight || fastestFallback;
  const normalizeRouteKey = (value = "") =>
    String(value || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, " ")
      .replace(/\s*->\s*/g, " -> ");
  const routeSegments = useMemo(() => {
    const completedSegments = (multiSegments || [])
      .filter((segment) => segment?.from && segment?.to)
      .map((segment, index) => ({
        ...segment,
        index,
      }));

    if (completedSegments.length) return completedSegments;

    return [
      {
        index: 0,
        from: from || "Jakarta (CGK)",
        to: to || "Singapore (SIN)",
        date: "",
      },
    ];
  }, [from, multiSegments, to]);
  const routeLabel = (value = "") => String(value || "").trim() || "Select city";
  const routeShortLabel = (value = "") => {
    const text = routeLabel(value);
    const code = text.match(/\(([^)]+)\)/)?.[1];
    return code || text.split(",")[0] || text;
  };
  const activeRoute =
    routeSegments[selectedRouteIndex] || routeSegments[0] || {};
  const activeRouteKey = normalizeRouteKey(
    `${routeShortLabel(activeRoute.from)} -> ${routeShortLabel(activeRoute.to)}`
  );
  const activeRouteResult =
    routeResults?.[activeRouteKey] ||
    Object.entries(routeResults || {}).find(([routeKey, routeData]) => {
      const candidates = [
        routeKey,
        routeData?.route,
        routeData?.meta?.route,
        routeData?.trip?.origin && routeData?.trip?.destination
          ? `${routeData.trip.origin} -> ${routeData.trip.destination}`
          : "",
      ];

      return candidates.some(
        (candidate) => normalizeRouteKey(candidate) === activeRouteKey
      );
    })?.[1] ||
    null;
  useEffect(() => {
    if (!activeRouteResult) return;

    const routeMeta = activeRouteResult.meta || {};
    const routeFilters = activeRouteResult.filters || {};
    const toRouteArray = (primary, fallback) =>
      Array.isArray(primary)
        ? primary
        : Array.isArray(fallback)
          ? fallback
          : [];
    const readRoutePrice = (...values) => {
      for (const value of values) {
        const number = Number(value);
        if (Number.isFinite(number)) return number;
      }
      return undefined;
    };
    const nextFilterData = {
      ...routeFilters,
      route: activeRouteResult.route || activeRouteKey,
      trip: activeRouteResult.trip || null,
      meta: routeMeta,
      aircrafts: toRouteArray(activeRouteResult.aircrafts, routeFilters.aircrafts),
      airlines: toRouteArray(activeRouteResult.airlines, routeFilters.airlines),
      price_min: readRoutePrice(
        routeMeta.price_min,
        routeFilters.price_min,
        routeFilters.min_price
      ),
      price_max: readRoutePrice(
        routeMeta.price_max,
        routeFilters.price_max,
        routeFilters.max_price
      ),
    };

    setApiFilterData(nextFilterData);
  }, [activeRouteKey, activeRouteResult, setApiFilterData]);
  const visibleFlights =
    activeRouteResult?.multi?.length > 0
      ? activeRouteResult.multi
      : selectedRouteIndex === 0
        ? resolvedFlightResults
        : [];
  const visibleTripCards =
    activeRouteResult?.multiTripCards?.length > 0
      ? activeRouteResult.multiTripCards
      : selectedRouteIndex === 0
        ? resolvedTripCards
        : [];
  const parseTimeToMinutes = (value = "") => {
    const match = String(value || "").match(/(\d{1,2}):(\d{2})/);
    if (!match) return Number.MAX_SAFE_INTEGER;

    return Number(match[1]) * 60 + Number(match[2]);
  };
  const parseMoney = (value = "") => {
    const amount = Number(String(value || "").replace(/[^\d.]/g, ""));
    return Number.isFinite(amount) ? amount : Number.MAX_SAFE_INTEGER;
  };
  const getCardSortValue = (card, key) => {
    const flight = card?.depart?.flight || {};
    const airline = card?.depart?.airline || {};

    if (key === "airline") return String(airline.name || "").toLowerCase();
    if (key === "departure") return parseTimeToMinutes(flight.departure?.time);
    if (key === "duration") {
      return (
        Number(flight.duration?.hours || 0) * 60 +
        Number(flight.duration?.minutes || 0)
      );
    }
    if (key === "arrival") return parseTimeToMinutes(flight.arrival?.time);
    if (key === "price") return parseMoney(card?.fare?.totalFare);

    return 0;
  };
  const sortedTripCards = useMemo(() => {
    if (!routeSort.key) return visibleTripCards;

    return [...visibleTripCards].sort((left, right) => {
      const leftValue = getCardSortValue(left, routeSort.key);
      const rightValue = getCardSortValue(right, routeSort.key);
      const result =
        typeof leftValue === "string"
          ? leftValue.localeCompare(String(rightValue))
          : Number(leftValue) - Number(rightValue);

      return routeSort.direction === "asc" ? result : -result;
    });
  }, [routeSort.direction, routeSort.key, visibleTripCards]);
  const handleRouteSort = (key) => {
    setRouteSort((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };
  const activeSortHighlights =
    activeRouteResult?.sortHighlights || sortHighlights || null;
  const selectedCards = routeSegments
    .map((segment, index) => ({
      segment,
      card: selectedRouteFlights[index],
    }))
    .filter((item) => item.card);
  const selectedTotal = selectedCards.reduce((total, item) => {
    const fare = String(item.card?.fare?.totalFare || "").replace(/[^\d.]/g, "");
    const amount = Number(fare);
    return total + (Number.isFinite(amount) ? amount : 0);
  }, 0);
  const selectedForActiveRoute = selectedRouteFlights[selectedRouteIndex];
  const isSelectionComplete = routeSegments.every((_, index) => selectedRouteFlights[index]);
  const formatRouteDate = (value = "") => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  const formatSelectedTotal = (value) =>
    `₹ ${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  const getCardFlight = (card = {}) => card?.depart?.flight || card?.outbound || {};
  const getCardAirline = (card = {}) => card?.depart?.airline || {};
  const getCardPrice = (card = {}) =>
    card?.fare?.totalFare || card?.fare?.pricePerAdult || "";
  const handleSelectTripCard = (card) => {
    setSelectedRouteFlights((prev) => ({
      ...prev,
      [selectedRouteIndex]: card,
    }));
  };
  const handleNextRoute = () => {
    if (!selectedForActiveRoute) return;

    const nextUnselectedIndex = routeSegments.findIndex(
      (_, index) => index > selectedRouteIndex && !selectedRouteFlights[index],
    );
    const firstUnselectedIndex = routeSegments.findIndex(
      (_, index) => !selectedRouteFlights[index],
    );

    if (nextUnselectedIndex >= 0 || firstUnselectedIndex >= 0) {
      setSelectedRouteIndex(
        nextUnselectedIndex >= 0 ? nextUnselectedIndex : firstUnselectedIndex,
      );
      return;
    }

    setFareModalOpen(selectedForActiveRoute.id);
  };
  const sortColumns = [
    { key: "airline", label: "Airline" },
    { key: "departure", label: "Departure" },
    { key: "duration", label: "Duration" },
    { key: "arrival", label: "Arrival" },
    { key: "price", label: "Price" },
  ];
  const cheapestMeta = {
    price: activeSortHighlights?.cheapest?.priceLabel || "N/A",
    duration: activeSortHighlights?.cheapest?.durationLabel || "N/A",
  };
  const fastestMeta = {
    price: activeSortHighlights?.fastest?.priceLabel || "N/A",
    duration: activeSortHighlights?.fastest?.durationLabel || "N/A",
  };
  const totalResults = Number(pagination?.total || 0);
  const resultsText = `Total ${totalResults} result${totalResults === 1 ? "" : "s"}`;
  const applyQuickSort = (type) => {
    const targetSortBy = type === "cheapest" ? "lowest" : "shortest";
    setSortBy(filters.sortBy === targetSortBy ? null : targetSortBy);
  };
  const hasNoData =
    hasSearched &&
    !isLoading &&
    visibleFlights.length === 0 &&
    visibleTripCards.length === 0;
  const showLoadingState = isLoading || isRefreshing;

  return (
    <>
      <section className={styles.container}>
        <div className={styles.FlightBookingTextContainer}>
          <h2 className={styles.heading}>
            Flight from <span>{routeLabel(activeRoute.from)}</span> to{" "}
            <span>{routeLabel(activeRoute.to)}</span>
          </h2>
          <div className={styles.subTextContainer}>
            <span className={styles.priceInfo}>
              The price is average for one person. Included all taxes and fees.
            </span>
            <span className={styles.itemsResult}>
              {resultsText}
            </span>
          </div>
        </div>
        <DatePriceSlider tiles={datewiseFareTiles} />

        <div className={styles.sortContainer}>
          <div className={styles.sortSubContainer}>
            <div className={styles.sortedItemMainContainer}>
              <div className={styles.sortedItemContainer}>
                <div
                  className={`${styles.sortedItem} ${quickSort === "cheapest" ? styles.activeSortedItem : ""
                    }`}
                  onClick={() => applyQuickSort("cheapest")}
                >
                  <img src="/images/dummyFlightlogo.png" alt="" />
                  <div className={styles.sortedTextContainer}>
                    <span className={styles.budget}>CHEAPEST</span>
                    <div className={styles.priceContainer}>
                      <span className={styles.price}>{cheapestMeta.price}</span>
                      <div className={styles.dot}></div>
                      <span className={styles.duration}>{cheapestMeta.duration}</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`${styles.sortedItem} ${quickSort === "fastest" ? styles.activeSortedItem : ""
                    }`}
                  onClick={() => applyQuickSort("fastest")}
                >
                  <img
                    height={36}
                    width={36}
                    src="/images/flightCompanyLogos/airIndia.png"
                    alt=""
                  />
                  <div className={styles.sortedTextContainer}>
                    <span className={styles.budget}>FASTEST</span>
                    <div className={styles.priceContainer}>
                      <span className={styles.price}>{fastestMeta.price}</span>
                      <div className={styles.dot}></div>
                      <span className={styles.duration}>{fastestMeta.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              ref={sortTriggerRef}
              onClick={() => setOpenSort(true)}
              className={styles.sortByContainer}
            >
              <img src="/icons/sort.svg" alt="" />
              <span className={styles.sortByText}>Sort by</span>
            </div>
          </div>
        </div>
        <div className={styles.routeTabsWrap}>
          {routeSegments.map((segment, index) => {
            const selectedCard = selectedRouteFlights[index];
            return (
              <button
                key={`${segment.from}-${segment.to}-${index}`}
                className={`${styles.routeTab} ${
                  selectedRouteIndex === index ? styles.routeTabActive : ""
                } ${selectedCard ? styles.routeTabComplete : ""}`}
                type="button"
                onClick={() => setSelectedRouteIndex(index)}
              >
                <span className={styles.routeTabStatus}>
                  {selectedCard ? "✓" : index + 1}
                </span>

                <span className={styles.routeTabText}>
                  {routeShortLabel(segment.from)} → {routeShortLabel(segment.to)}
                </span>
                <span className={styles.routeTabDate}>
                  {formatRouteDate(segment.date) || "Select Flight"}
                </span>
              </button>
            );
          })}
        </div>
        <div className={styles.routeSortBand}>
          <div className={styles.routeSortHeader}>
            {sortColumns.map((column) => (
              <button
                key={column.key}
                type="button"
                className={`${styles.routeSortCell} ${
                  routeSort.key === column.key ? styles.routeSortCellActive : ""
                }`}
                onClick={() => handleRouteSort(column.key)}
              >
                <span className={styles.routeSortLabel}>{column.label}</span>
                <span className={styles.routeSortArrow}>
                  {routeSort.key === column.key
                    ? routeSort.direction === "asc"
                      ? "↑"
                      : "↓"
                    : "↓↑"}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className={styles.tripCardsContainer}>
          {showLoadingState ? (
            <FlightSearchLoader />
          ) : hasNoData ? (
            <FlightNoResults />
          ) : (
            sortedTripCards.map((card, index) => (
              <div key={card.id || index}>
                <MultiCityFlightCard
                  cardData={card}
                  isSelected={selectedForActiveRoute?.id === card.id}
                  onSelect={handleSelectTripCard}
                  actionLabel="SELECT FLIGHT"
                />
                {index === 2 && <OfferBanner />}
              </div>
            ))
          )}
        </div>
        {
          <FareComparisonModalMulticity
            isOpen={fareModalOpen}
            onClose={() => setFareModalOpen(null)}
            flightData={resolvedFlightResults.find((f) => f.id === fareModalOpen)}
          />
        }
        {selectedCards.length > 0 && (
          <div className={styles.selectedFlightBar}>
            <div className={styles.selectedSegments}>
              {routeSegments.map((segment, index) => {
                const card = selectedRouteFlights[index];
                const cardFlight = getCardFlight(card);
                const airline = getCardAirline(card);
                const price = getCardPrice(card);

                return (
                  <button
                    key={`selected-${segment.from}-${index}`}
                    className={`${styles.selectedSegment} ${
                      selectedRouteIndex === index ? styles.selectedSegmentActive : ""
                    }`}
                    type="button"
                    onClick={() => setSelectedRouteIndex(index)}
                  >
                    <span className={styles.selectedLogo}>
                      {card?.depart?.airline?.logo ? (
                        <img src={card.depart.airline.logo} alt="" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span>
                      <strong>
                        {routeShortLabel(segment.from)} → {routeShortLabel(segment.to)}
                      </strong>
                      <small>
                        {card
                          ? `${airline?.code || ""} ${cardFlight?.departure?.time || ""}`
                          : "Select flight"}
                      </small>
                      {price ? (
                        <span className={styles.selectedSegmentPrice}>{price}</span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className={styles.selectedTotal}>
              <span>Total flight cost</span>
              <strong>{formatSelectedTotal(selectedTotal)}</strong>
            </div>
            <button
              className={styles.nextFlightBtn}
              type="button"
              disabled={!selectedForActiveRoute}
              onClick={handleNextRoute}
            >
              {isSelectionComplete ? "VIEW FARES" : "NEXT FLIGHT"}
            </button>
          </div>
        )}
      </section>

      <section className={styles.isMobileView}>
        <div className={styles.mobileFlightContainer}>
          <p className={styles.mobileSubTextContainer}>
            {resultsText}
          </p>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={styles.filterBtn}
          >
            Filter
          </button>
        </div>
        {/* <div className={styles.flightChipContainer}>
          <div className={styles.chips}>
          
            <p>No. of stops: Direct</p>
            <div className={styles.mobileCloseBtn}>
              <img src="/icons/Close.svg" alt="" />
            </div>
          </div>
          <div className={styles.chips}>
            <p>Departure time: Morning, 06:00 - 12:00</p>
            <div className={styles.mobileCloseBtn}>
              <img src="/icons/Close.svg" alt="" />
            </div>
          </div>
          <div className={styles.chips}>
            <p>Departure time: Morning, 06:00 - 12:00</p>
            <div className={styles.mobileCloseBtn}>
              <img src="/icons/Close.svg" alt="" />
            </div>
          </div>
          <div className={styles.chips}>
            <p>Departure time: Morning, 06:00 - 12:00</p>
            <div className={styles.mobileCloseBtn}>
              <img src="/icons/Close.svg" alt="" />
            </div>
          </div>
        </div> */}
        {filterChips.length > 0 && (
          <div className={styles.filterChips}>
            {filterChips.map((chip, index) => (
              <div key={index} className={styles.chip}>
                <div className={styles.name}>{chip.label}</div>
                <span onClick={chip.onRemove}>
                  <X size={16} color="#4A5565" />
                </span>
              </div>
            ))}
          </div>
        )}
        <div className={styles.sortContainer}>
          <div className={styles.sortSubContainer}>
            <div className={styles.sortedItemMainContainer}>
              <div className={styles.sortedItemContainer}>
                <div
                  className={`${styles.sortedItem} ${quickSort === "cheapest" ? styles.activeSortedItem : ""
                    }`}
                  onClick={() => applyQuickSort("cheapest")}
                >
                  <img src="/images/dummyFlightlogo.png" alt="" />
                  <div className={styles.sortedTextContainer}>
                    <span className={styles.budget}>CHEAPEST</span>
                    <div className={styles.priceContainer}>
                      <span className={styles.price}>{cheapestMeta.price}</span>
                      <div className={styles.dot}></div>
                      <span className={styles.duration}>{cheapestMeta.duration}</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`${styles.sortedItem} ${quickSort === "fastest" ? styles.activeSortedItem : ""
                    }`}
                  onClick={() => applyQuickSort("fastest")}
                >
                  <img
                    src="/images/flightCompanyLogos/airIndia.png"
                    height={36}
                    width={36}
                    alt=""
                  />
                  <div className={styles.sortedTextContainer}>
                    <span className={styles.budget}>fastest</span>
                    <div className={styles.priceContainer}>
                      <span className={styles.price}>{fastestMeta.price}</span>
                      <div className={styles.dot}></div>
                      <span className={styles.duration}>{fastestMeta.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              onClick={() => setOpenSort(true)}
              className={styles.sortByContainer}
            >
              <span className={styles.sortByText}>Sort by</span>
              <img
                className={`${styles.chevronSort} ${openSort === true ? styles.open : ""
                  }`}
                src="/icons/DownArrows.svg"
                alt=""
              />
            </div>
          </div>
        </div>
        {showLoadingState ? (
          <FlightSearchLoader />
        ) : hasNoData ? (
          <FlightNoResults />
        ) : (
          visibleFlights.map((flight, index) => (
            <FlightDetailsCard
              setFareModalOpen={() => openFareModal(flight)}
              key={flight.id + index}
              flight={flight}
            />
          ))
        )}

        {fareModalOpen && (
          <MobileFareComparisonModalMulticity
            isOpen={fareModalOpen}
            onClose={() => {
              setFareModalOpen(null);
            }}
            flightData={resolvedFlightResults.find((f) => f.id === fareModalOpen)}
          />
        )}
      </section>
      {isSortSheetMobile ? (
        <SortBySheet
          open={openSort}
          onClose={() => setOpenSort(false)}
          selectedValue={filters.sortBy}
          onApply={(value) => {
            setSortBy(value);
          }}
        />
      ) : (
        <SortByDropdown
          open={openSort}
          onClose={() => setOpenSort(false)}
          selectedValue={filters.sortBy}
          anchorRef={sortTriggerRef}
          onApply={(value) => {
            setSortBy(value);
          }}
        />
      )}
    </>
  );
};

export default MultiCityTrip;

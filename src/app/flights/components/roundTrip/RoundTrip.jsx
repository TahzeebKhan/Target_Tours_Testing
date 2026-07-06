"use client";
import React, { useContext, useRef, useState } from "react";
import styles from "./RoundTrip.module.css";
import TripCard from "./tripCard/TripCard";
import OfferBanner from "../offerComponent/OfferBanner";
import DatePriceSlider from "../DatePriceSlider";
import { useTripType } from "../../TripTypeContext";
import SortBySheet from "../SortBySheet";
import SortByDropdown from "../SortByDropdown";
import { SidebarContext } from "../../SidebarContext";
import { useFlightFilters } from "@/app/context/FlightFilterContext";
import { X } from "lucide-react";
import FlightSearchLoader from "../FlightSearchLoader";
import FlightNoResults from "../FlightNoResults";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import MobileFareComparisonModalRoundTrip from "./MobileFareComparisonModalRoundTrip";
import { resolveAirlineLogo } from "@/features/flights/utils/airlineLogos";
import { useRouter, useSearchParams } from "next/navigation";

const getAirportCode = (city = "") => {
  const match = String(city).match(/\(([^)]+)\)/);
  return match?.[1] || String(city).split(" ")[0] || "";
};

const formatSegmentDuration = (duration = {}) => {
  const hours = Number(duration.hours || 0);
  const minutes = Number(duration.minutes || 0);
  return `${hours ? `${hours} h ` : ""}${minutes} m`.trim() || "0 m";
};

const parseAmount = (value) => {
  const amount = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
};

const formatMobileFare = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "N/A";

  return `₹ ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
};

const getMobileSegmentAmount = (flight, type) => {
  const tripIndex = type === "outbound" ? 0 : 1;
  const fallbackTripIndex = type === "outbound" ? 0 : 0;
  const tripAmount =
    flight?.booking?.priceRequest?.Trips?.[tripIndex]?.Amount ??
    flight?.booking?.priceRequest?.Trips?.[fallbackTripIndex]?.Amount;
  const segmentAmount =
    type === "outbound"
      ? flight?.outbound?.fare?.displayAmount
      : flight?.inbound?.fare?.displayAmount;

  return parseAmount(segmentAmount ?? tripAmount ?? flight?.fare?.pricePerAdult);
};

const getMobileSegmentFareLabel = (flight, type) =>
  formatMobileFare(getMobileSegmentAmount(flight, type) || parseAmount(flight?.fare?.totalFare));

const buildMobileRoundTripSelection = (departFlight, returnFlight) => {
  if (!departFlight || !returnFlight) return null;

  const departAmount = getMobileSegmentAmount(departFlight, "outbound");
  const returnAmount = getMobileSegmentAmount(returnFlight, "inbound");
  const totalAmount = departAmount + returnAmount;
  const totalFare = totalAmount > 0
    ? formatMobileFare(totalAmount)
    : departFlight?.fare?.totalFare || returnFlight?.fare?.totalFare || "N/A";
  const departTrip = departFlight?.booking?.priceRequest?.Trips?.[0];
  const returnTrip =
    returnFlight?.booking?.priceRequest?.Trips?.[1] ||
    returnFlight?.booking?.priceRequest?.Trips?.[0];

  return {
    ...departFlight,
    id: `mobile-${departFlight.id || "depart"}-${returnFlight.id || "return"}`,
    outbound: departFlight.outbound,
    inbound: returnFlight.inbound,
    fare: {
      ...(departFlight.fare || {}),
      totalFare,
      pricePerAdult: totalFare,
    },
    booking: {
      ...(departFlight.booking || {}),
      priceRequest: {
        ...(departFlight.booking?.priceRequest || {}),
        Trips: [departTrip, returnTrip].filter(Boolean),
      },
    },
  };
};

const CompactRoundTripCard = ({
  segment,
  priceLabel,
  selected,
  onSelect,
  onDetail,
}) => {
  const airline = segment?.airlines?.[0] || {};
  const logo = resolveAirlineLogo({
    name: airline.name,
    code: airline.code,
    logo: airline.logo,
  });

  return (
    <div
      role="button"
      tabIndex={0}
      className={`${styles.mobileSegmentCard} ${selected ? styles.mobileSegmentCardSelected : ""}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <div className={styles.mobileSegmentTop}>
        <div className={styles.mobileAirline}>
          <img src={logo} alt="" />
          <div>
            <p>{airline.name || "Airline"}</p>
            <span>{airline.code || ""}</span>
          </div>
        </div>
        <strong>{priceLabel || "N/A"}</strong>
      </div>

      <div className={styles.mobileSegmentTimes}>
        <span>{segment?.departure?.time || "--:--"}</span>
        <div className={styles.mobileSegmentMeta}>
          <span>{formatSegmentDuration(segment?.duration)}</span>
          <i />
          <small>{segment?.stops?.type || "Non-Stop"}</small>
        </div>
        <span>{segment?.arrival?.time || "--:--"}</span>
      </div>
      <button
        type="button"
        className={styles.mobileSeeDetailBtn}
        onClick={(event) => {
          event.stopPropagation();
          onDetail();
        }}
      >
        SEE DETAIL
      </button>
    </div>
  );
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
        type: "Non-Stop",
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
        type: "Non-Stop",
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
        type: "Non-Stop",
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
        type: "Non-Stop",
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
        type: "Non-Stop",
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
        type: "Non-Stop",
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
        type: "Non-Stop",
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
        type: "Non-Stop",
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
        type: "Non-Stop",
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
        type: "Non-Stop",
      },
    },
  },
];
const tripCardsData = [
  {
    id: 1,
    depart: {
      airline: {
        name: "Batik Air, Indones....",
        code: "6E- 541",
        logo: "/images/Flight1.png",
      },
      date: "WED, 17 DEC",
      flight: {
        departure: {
          time: "06:45",
          city: "Jakarta (CGK)",
        },
        arrival: {
          time: "08:00",
          city: "Singapore (SIN)",
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
    return: {
      airline: {
        name: "Indonesia Airasia",
        code: "6E- 541",
        logo: "/images/Flight2.png",
      },
      date: "THU, 31 DEC",
      flight: {
        departure: {
          time: "06:45",
          city: "Singapore (SIN)",
        },
        arrival: {
          time: "08:00",
          city: "Jakarta (CGK)",
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
    fare: {
      totalFare: "₹ 3,22,000",
      pricePerAdult: "₹ 12,000",
      cabinClass: "ECONOMY",
    },
  },

  {
    id: 2,
    depart: {
      airline: {
        name: "Batik Air, Indones....",
        code: "6E- 541",
        logo: "/images/Flight1.png",
      },
      date: "WED, 17 DEC",
      flight: {
        departure: {
          time: "09:15",
          city: "Jakarta (CGK)",
        },
        arrival: {
          time: "08:30",
          city: "Singapore (SIN)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "1 stop via KUL",
        },
      },
    },
    return: {
      airline: {
        name: "Indonesia Airasia",
        code: "6E- 541",
        logo: "/images/Flight2.png",
      },
      date: "THU, 31 DEC",
      flight: {
        departure: {
          time: "09:15",
          city: "Singapore (SIN)",
        },
        arrival: {
          time: "09:45",
          city: "Jakarta (CGK)",
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
    fare: {
      totalFare: "₹ 3,22,000",
      pricePerAdult: "₹ 12,000",
      cabinClass: "ECONOMY",
    },
  },

  {
    id: 3,
    depart: {
      airline: {
        name: "Batik Air, Indones....",
        code: "6E- 541",
        logo: "/images/Flight1.png",
      },
      date: "WED, 17 DEC",
      flight: {
        departure: {
          time: "09:15",
          city: "Jakarta (CGK)",
        },
        arrival: {
          time: "09:45",
          city: "Singapore (SIN)",
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
    return: {
      airline: {
        name: "Indonesia Airasia",
        code: "6E- 541",
        logo: "/images/Flight2.png",
      },
      date: "THU, 31 DEC",
      flight: {
        departure: {
          time: "09:15",
          city: "Singapore (SIN)",
        },
        arrival: {
          time: "09:45",
          city: "Jakarta (CGK)",
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
    fare: {
      totalFare: "₹ 3,22,000",
      pricePerAdult: "₹ 12,000",
      cabinClass: "ECONOMY",
    },
  },
  {
    id: 4,
    depart: {
      airline: {
        name: "Batik Air, Indones....",
        code: "6E- 541",
        logo: "/images/Flight1.png",
      },
      date: "WED, 17 DEC",
      flight: {
        departure: {
          time: "09:15",
          city: "Jakarta (CGK)",
        },
        arrival: {
          time: "08:30",
          city: "Singapore (SIN)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "1 stop via KUL",
        },
      },
    },
    return: {
      airline: {
        name: "Indonesia Airasia",
        code: "6E- 541",
        logo: "/images/Flight2.png",
      },
      date: "THU, 31 DEC",
      flight: {
        departure: {
          time: "09:15",
          city: "Singapore (SIN)",
        },
        arrival: {
          time: "09:45",
          city: "Jakarta (CGK)",
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
    fare: {
      totalFare: "₹ 3,22,000",
      pricePerAdult: "₹ 12,000",
      cabinClass: "ECONOMY",
    },
  },
  {
    id: 5,
    depart: {
      airline: {
        name: "Batik Air, Indones....",
        code: "6E- 541",
        logo: "/images/Flight1.png",
      },
      date: "WED, 17 DEC",
      flight: {
        departure: {
          time: "09:15",
          city: "Jakarta (CGK)",
        },
        arrival: {
          time: "08:30",
          city: "Singapore (SIN)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "1 stop via KUL",
        },
      },
    },
    return: {
      airline: {
        name: "Indonesia Airasia",
        code: "6E- 541",
        logo: "/images/Flight2.png",
      },
      date: "THU, 31 DEC",
      flight: {
        departure: {
          time: "09:15",
          city: "Singapore (SIN)",
        },
        arrival: {
          time: "09:45",
          city: "Jakarta (CGK)",
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
    fare: {
      totalFare: "₹ 3,22,000",
      pricePerAdult: "₹ 12,000",
      cabinClass: "ECONOMY",
    },
  },
];
const RoundTrip = ({
  flightData = [],
  tripCards = [],
  datewiseFareTiles = [],
  selectedDepartureDate = "",
  pagination = null,
  sortHighlights = null,
  hasSearched = false,
  isLoading = false,
  isRefreshing = false,
}) => {
  const { committedSearches, refreshFlightSearch, setStartDate } = useTripType();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openSort, setOpenSort] = useState(false);
  const { from, to } = committedSearches.round;
  const [fareModalOpen, setFareModalOpen] = useState(null);
  const [selectedFlightId, setSelectedFlightId] = useState(null);
  const [selectedMobileDepartId, setSelectedMobileDepartId] = useState(null);
  const [selectedMobileReturnId, setSelectedMobileReturnId] = useState(null);
  const [mobileFareModalFlight, setMobileFareModalFlight] = useState(null);
  const { setIsSidebarOpen } = useContext(SidebarContext);
  const sortTriggerRef = useRef(null);
  const isSortSheetMobile = useMediaQuery("(max-width: 629px)");
  const {
    filters,
    filterChips,
    toggleCheckbox,
    toggleMapCheckbox,
    selectDeparture,
    resetFilters,
    setSortBy,
  } = useFlightFilters();
  const quickSort = filters.sortBy === "lowest"
    ? "cheapest"
    : filters.sortBy === "shortest"
      ? "fastest"
      : "";
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
  const visibleFlights = resolvedFlightResults;
  const visibleTripCards = resolvedTripCards;
  const cheapestMeta = {
    price: sortHighlights?.cheapest?.priceLabel || "N/A",
    duration: sortHighlights?.cheapest?.durationLabel || "N/A",
  };
  const fastestMeta = {
    price: sortHighlights?.fastest?.priceLabel || "N/A",
    duration: sortHighlights?.fastest?.durationLabel || "N/A",
  };
  const cheapestLogo = resolveAirlineLogo({
    name: cheapestFlight?.outbound?.airlines?.[0]?.name,
    code: cheapestFlight?.outbound?.airlines?.[0]?.code,
    logo: cheapestFlight?.outbound?.airlines?.[0]?.logo,
  });
  const fastestLogo = resolveAirlineLogo({
    name: fastestFlight?.outbound?.airlines?.[0]?.name,
    code: fastestFlight?.outbound?.airlines?.[0]?.code,
    logo: fastestFlight?.outbound?.airlines?.[0]?.logo,
  });
  const resultsText = pagination
    ? `Showing ${pagination.from}-${pagination.to} of ${pagination.total} results`
    : "Showing 1-10 of 100 results";
  const applyQuickSort = (type) => {
    const targetSortBy = type === "cheapest" ? "lowest" : "shortest";
    setSortBy(filters.sortBy === targetSortBy ? null : targetSortBy);
  };
  const handleDateSelect = (dateKey) => {
    setStartDate(dateKey);
    const nextParams = new URLSearchParams(searchParams?.toString() || "");
    nextParams.set("start", dateKey);
    nextParams.set("tripType", "round");
    nextParams.set("searchToken", String(Date.now()));
    router.replace(`/flights?${nextParams.toString()}`, { scroll: false });
    window.setTimeout(refreshFlightSearch, 50);
  };
  const hasNoData =
    hasSearched &&
    !isLoading &&
    visibleFlights.length === 0 &&
    visibleTripCards.length === 0;
  const showLoadingState = isLoading || isRefreshing;
  const selectedMobileDepartFlight =
    visibleFlights.find((flight) => flight.id === selectedMobileDepartId) || null;
  const selectedMobileReturnFlight =
    visibleFlights.find((flight) => flight.id === selectedMobileReturnId) || null;
  const selectedMobileFlight = buildMobileRoundTripSelection(
    selectedMobileDepartFlight,
    selectedMobileReturnFlight,
  );
  const openMobileFareDetails = (departFlight, returnFlight) => {
    const nextFlight = buildMobileRoundTripSelection(departFlight, returnFlight);
    if (!nextFlight) return;

    setMobileFareModalFlight(nextFlight);
    setFareModalOpen(nextFlight.id);
  };
  const outboundRouteLabel = visibleFlights[0]?.outbound
    ? `${getAirportCode(visibleFlights[0].outbound.departure?.city)} -> ${getAirportCode(visibleFlights[0].outbound.arrival?.city)}`
    : "Departure";
  const inboundRouteLabel = visibleFlights[0]?.inbound
    ? `${getAirportCode(visibleFlights[0].inbound.departure?.city)} -> ${getAirportCode(visibleFlights[0].inbound.arrival?.city)}`
    : "Return";
  const outboundDateLabel = visibleFlights[0]?.outbound?.dateLabel || "";
  const inboundDateLabel = visibleFlights[0]?.inbound?.dateLabel || "";

  return (
    <>
      {" "}
      <section className={styles.container}>
        <div className={styles.FlightBookingTextContainer}>
          <h2 className={styles.heading}>
            Flight from <span>{from || "Jakarta (CGK)"}</span> to{" "}
            <span>{to || "Singapore (SIN)"}</span>
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
        {/* <DatePriceSlider
          tiles={datewiseFareTiles}
          selectedDate={selectedDepartureDate}
          onSelectDate={handleDateSelect}
        /> */}

        <div className={styles.sortContainer}>
          <div className={styles.sortSubContainer}>
            <div className={styles.sortedItemMainContainer}>
              <div className={styles.sortedItemContainer}>
                <div
                  className={`${styles.sortedItem} ${quickSort === "cheapest" ? styles.activeSortedItem : ""
                    }`}
                  onClick={() => applyQuickSort("cheapest")}
                >
                  <img src={cheapestLogo} alt="" />
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
                  <img src={fastestLogo} alt="" />
                  <div className={styles.sortedTextContainer}>
                    <span className={styles.budget}>Fastest</span>
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
        <div>
          {showLoadingState ? (
            <FlightSearchLoader />
          ) : hasNoData ? (
            <FlightNoResults />
          ) : (
            <TripCard
              fareModalOpen={fareModalOpen}
              selectedFlightId={selectedFlightId}
              setSelectedFlightId={setSelectedFlightId}
              setFareModalOpen={setFareModalOpen}
              tripCardsData={visibleTripCards}
            ></TripCard>
          )}
        </div>
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
                  <img src={cheapestLogo} alt="" />
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
                  <img src={fastestLogo} height={36} width={36} alt="" />
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
          <div className={styles.mobileSplitResults}>
            <div className={styles.mobileSplitHeader}>
              <div>
                <strong>{outboundRouteLabel}</strong>
                <span>{outboundDateLabel}</span>
              </div>
              <div>
                <strong>{inboundRouteLabel}</strong>
                <span>{inboundDateLabel}</span>
              </div>
            </div>

            <div className={styles.mobileSplitGrid}>
              {visibleFlights.map((flight, index) => {
                const isDepartSelected = selectedMobileDepartId === flight.id;
                const isReturnSelected = selectedMobileReturnId === flight.id;

                return (
                  <React.Fragment key={flight.id || index}>
                    <CompactRoundTripCard
                      segment={flight.outbound}
                      priceLabel={getMobileSegmentFareLabel(flight, "outbound")}
                      selected={isDepartSelected}
                      onSelect={() => setSelectedMobileDepartId(flight.id)}
                      onDetail={() =>
                        openMobileFareDetails(
                          flight,
                          selectedMobileReturnFlight || flight,
                        )
                      }
                    />
                    <CompactRoundTripCard
                      segment={flight.inbound}
                      priceLabel={getMobileSegmentFareLabel(flight, "inbound")}
                      selected={isReturnSelected}
                      onSelect={() => setSelectedMobileReturnId(flight.id)}
                      onDetail={() =>
                        openMobileFareDetails(
                          selectedMobileDepartFlight || flight,
                          flight,
                        )
                      }
                    />
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
        {selectedMobileFlight && (
          <div className={styles.mobileBookingBar}>
            <div>
              <span>TOTAL AMOUNT</span>
              <strong>{selectedMobileFlight.fare?.totalFare || "N/A"}</strong>
            </div>
            <button
              type="button"
              onClick={() => openMobileFareDetails(
                selectedMobileDepartFlight,
                selectedMobileReturnFlight,
              )}
            >
              BOOK NOW
            </button>
          </div>
        )}
        {fareModalOpen && (
          <MobileFareComparisonModalRoundTrip
            isOpen={fareModalOpen}
            onClose={() => {
              setFareModalOpen(null);
              setSelectedFlightId(null);
              setMobileFareModalFlight(null);
            }}
            flightData={
              mobileFareModalFlight ||
              resolvedFlightResults.find((f) => f.id === fareModalOpen)
            }
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

export default RoundTrip;

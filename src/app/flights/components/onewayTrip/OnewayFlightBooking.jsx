"use client";
import React, { useEffect, useContext, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./OnewayFlightBooking.module.css";
import ExpandableTabs from "./expendableTabs/ExpandableTabs";
import OfferBanner from "../offerComponent/OfferBanner";
import FareComparisonModal from "./FareComparisonModal";
import DatePriceSlider from "../DatePriceSlider";
import { useTripType } from "../../TripTypeContext";
import FlightDetailsCard from "../PhoneViewComponents/oneWayPhoneView/FlightDetailsCard";
import { SidebarContext } from "../../SidebarContext";
import SortBySheet from "../SortBySheet";
import OnewaySkeleton from "./OnewaySkeleton";
import { useFlightFilters } from "@/app/context/FlightFilterContext";
import { X } from "lucide-react";
import MobileFareComparisonModal from "./expendableTabs/MobileFareComparisonModal";
import { getFlightWebSettings } from "@/features/flights/services/flightBooking";

const OnewayFlightBooking = ({
  flightData = [],
  datewiseFareTiles = [],
  selectedDepartureDate = "",
  travellerSummary = null,
  pagination = null,
  sortHighlights = null,
  hasSearched = false,
  isLoading = false,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { committedSearches } = useTripType();
  const { from, to } = committedSearches.oneway;
  // track which flight's details are open (by id) so only that item expands
  const [openId, setOpenId] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [fareModalOpen, setFareModalOpen] = useState(null); // Track which flight's fare modal is open
  const OFFER_INDEX = 3;
  const [openSort, setOpenSort] = useState(false);
  const { setIsSidebarOpen } = useContext(SidebarContext);

  const [isMobile, setIsMobile] = useState(false);

  const [mounted, setMounted] = useState(false);

  const openFareModal = async (flight) => {
    const searchTui = flight?.booking?.tui;

    if (searchTui) {
      try {
        await getFlightWebSettings({ TUI: searchTui });
      } catch (error) {
        console.error("Failed to fetch flight web settings", error);
      }
    }

    setFareModalOpen(flight?.id ?? null);
  };

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 900);
    };

    checkScreen();
    setMounted(true);

    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const flightResults = [
    {
      id: 1,
      airlines: [
        {
          name: "IndiGo",
          code: "6E-541",
          logo: "/images/Flight.png",
        },
      ],
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
        count: 0,
        via: null,
        nextDay: false,
      },
      fare: {
        totalFare: "₹ 3,22,000",
        pricePerAdult: "₹ 12,000",
        cabinClass: "ECONOMY",
      },
    },

    {
      id: 2,
      airlines: [
        {
          name: "IndiGo",
          code: "AI-2441",
          logo: "/images/Flight.png",
        },
      ],
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
        count: 1,
        via: "Kolkata",
        nextDay: false,
      },
      fare: {
        totalFare: "₹ 3,22,000",
        pricePerAdult: "₹ 12,000",
        cabinClass: "ECONOMY",
      },
    },

    {
      id: 3,
      airlines: [
        {
          name: "Air India",
          code: "AI-541",
          logo: "/images/AirIndia.png",
        },
        {
          name: "IndiGo",
          code: "6E-234",
          logo: "/images/Flight.png",
        },
      ],
      departure: {
        time: "20:15",
        city: "Jakarta (CGK)",
      },
      arrival: {
        time: "21:30",
        city: "Singapore (SIN)",
      },
      duration: {
        hours: 2,
        minutes: 51,
      },
      stops: {
        type: "1 Stop",
        count: 0,
        via: "Kolkata",
        nextDay: true,
      },
      fare: {
        totalFare: "₹ 3,22,000",
        pricePerAdult: "₹ 12,000",
        cabinClass: "ECONOMY",
      },
    },

    {
      id: 4,
      airlines: [
        {
          name: "Air India",
          code: "6E-541",
          logo: "/images/flightCompanyLogos/airIndia.png",
        },
      ],
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
        count: 0,
        via: null,
        nextDay: false,
      },
      fare: {
        totalFare: "₹ 3,22,000",
        pricePerAdult: "₹ 12,000",
        cabinClass: "ECONOMY",
      },
    },
    {
      id: 5,
      airlines: [
        {
          name: "AkasaAir",
          code: "6E- 541",
          logo: "/images/flightCompanyLogos/akasaair.png",
        },
      ],
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
        count: 0,
        via: null,
        nextDay: false,
      },
      fare: {
        totalFare: "₹ 3,22,000",
        pricePerAdult: "₹ 12,000",
        cabinClass: "ECONOMY",
      },
    },
    {
      id: 6,
      airlines: [
        {
          name: "Air India Express",
          code: "6E- 541",
          logo: "/images/flightCompanyLogos/airIndiaExpress.png",
        },
      ],
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
        count: 0,
        via: null,
        nextDay: false,
      },
      fare: {
        totalFare: "₹ 3,22,000",
        pricePerAdult: "₹ 12,000",
        cabinClass: "ECONOMY",
      },
    },
    {
      id: 7,
      airlines: [
        {
          name: "IndiGo",
          code: "AI-2441",
          logo: "/images/Flight.png",
        },
      ],
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
        count: 1,
        via: "Kolkata",
        nextDay: false,
      },
      fare: {
        totalFare: "₹ 3,22,000",
        pricePerAdult: "₹ 12,000",
        cabinClass: "ECONOMY",
      },
    },
    {
      id: 8,
      airlines: [
        {
          name: "Air India Express",
          code: "6E- 541",
          logo: "/images/flightCompanyLogos/airIndiaExpress.png",
        },
      ],
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
        count: 0,
        via: null,
        nextDay: false,
      },
      fare: {
        totalFare: "₹ 3,22,000",
        pricePerAdult: "₹ 12,000",
        cabinClass: "ECONOMY",
      },
    },
  ];
  const resolvedFlightResults = Array.isArray(flightData) ? flightData : [];

  const parseFareValue = (fare) => {
    const raw = String(fare?.totalFare || "").replace(/[^\d]/g, "");
    const amount = Number(raw);
    return Number.isFinite(amount) ? amount : Number.MAX_SAFE_INTEGER;
  };

  const getDurationMinutes = (flight) =>
    (Number(flight?.duration?.hours || 0) * 60) +
    Number(flight?.duration?.minutes || 0);

  const resolveHighlightedFlight = (highlight) => {
    if (!highlight || !resolvedFlightResults.length) return null;
    const highlightId = String(highlight.id || highlight.index || "").trim();
    if (highlightId) {
      const byId = resolvedFlightResults.find(
        (flight) => String(flight?.id || "").trim() === highlightId
      );
      if (byId) return byId;
      const byCode = resolvedFlightResults.find((flight) =>
        (flight?.airlines || []).some(
          (airline) => String(airline?.code || "").trim() === highlightId
        )
      );
      if (byCode) return byCode;
    }
    const time = (value) => {
      const s = String(value || "");
      const m = s.match(/(\d{2}:\d{2})/);
      return m ? m[1] : "";
    };
    const dep = time(highlight?.departure);
    const arr = time(highlight?.arrival);
    const byTime = resolvedFlightResults.find(
      (flight) =>
        String(flight?.departure?.time || "") === dep &&
        String(flight?.arrival?.time || "") === arr
    );
    if (byTime) return byTime;
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
          getDurationMinutes(current) < getDurationMinutes(min)
            ? current
            : min
        )
      : null;

  const cheapestHighlightedFlight = resolveHighlightedFlight(sortHighlights?.cheapest);
  const fastestHighlightedFlight = resolveHighlightedFlight(sortHighlights?.fastest);
  const cheapestFlight = cheapestHighlightedFlight || cheapestFallback;
  const fastestFlight = fastestHighlightedFlight || fastestFallback;

  const formatDurationText = (durationLabel = "") => {
    const str = String(durationLabel || "").trim();
    if (!str) return "";
    const hm = str.match(/(\d+)\s*h(?:ours?)?\s*(\d+)\s*m/i);
    if (hm) {
      return `${String(hm[1]).padStart(2, "0")}h ${String(hm[2]).padStart(2, "0")}m`;
    }
    return str;
  };
  const renderDurationParts = (flight) => {
    const hours = Number(flight?.duration?.hours);
    const minutes = Number(flight?.duration?.minutes);
    if (!Number.isFinite(hours) && !Number.isFinite(minutes)) {
      return "N/A";
    }

    return `${Number.isFinite(hours) ? hours : "N/A"}h ${Number.isFinite(minutes) ? minutes : "N/A"}m`;
  };

  const cheapestMeta = {
    logo: cheapestFlight?.airlines?.[0]?.logo || "/images/Flight.png",
    price:
      sortHighlights?.cheapest?.priceLabel ||
      cheapestFlight?.fare?.pricePerAdult ||
      "₹ 8500",
    duration:
      formatDurationText(sortHighlights?.cheapest?.durationLabel) ||
      `${String(cheapestFlight?.duration?.hours ?? 0).padStart(2, "0")}h ${String(
        cheapestFlight?.duration?.minutes ?? 0
      ).padStart(2, "0")}m`,
  };

  const fastestMeta = {
    logo:
      fastestFlight?.airlines?.[0]?.logo ||
      "/images/flightCompanyLogos/airIndia.png",
    price:
      sortHighlights?.fastest?.priceLabel ||
      fastestFlight?.fare?.pricePerAdult ||
      "₹ 8500",
    duration:
      formatDurationText(sortHighlights?.fastest?.durationLabel) ||
      `${String(fastestFlight?.duration?.hours ?? 0).padStart(2, "0")}h ${String(
        fastestFlight?.duration?.minutes ?? 0
      ).padStart(2, "0")}m`,
  };

  const visibleFlights = resolvedFlightResults;
  const hasNoData = hasSearched && !isLoading && visibleFlights.length === 0;

  const resultsText = pagination
    ? `Showing ${pagination.from}-${pagination.to} of ${pagination.total} results`
    : "Showing 1-10 of 100 results";

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
  const applyQuickSort = (type) => {
    const targetSortBy = type === "cheapest" ? "lowest" : "shortest";
    setSortBy(filters.sortBy === targetSortBy ? null : targetSortBy);
  };

  const handleDateSelect = (dateKey) => {
    const nextParams = new URLSearchParams(searchParams?.toString() || "");
    nextParams.set("start", dateKey);
    nextParams.set("tripType", "oneway");
    nextParams.delete("end");
    router.replace(`/flights?${nextParams.toString()}`, { scroll: false });
  };
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
        <DatePriceSlider
          tiles={datewiseFareTiles}
          selectedDate={selectedDepartureDate}
          onSelectDate={handleDateSelect}
        />

        <div className={styles.sortContainer}>
          <div className={styles.sortSubContainer}>
            <div className={styles.sortedItemMainContainer}>
              <div className={styles.sortedItemContainer}>
                <div
                  className={`${styles.sortedItem} ${
                    quickSort === "cheapest" ? styles.activeSortedItem : ""
                  }`}
                  onClick={() => applyQuickSort("cheapest")}
                >
                  <img
                    src={cheapestMeta.logo}
                    alt=""
                  />
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
                  className={`${styles.sortedItem} ${
                    quickSort === "fastest" ? styles.activeSortedItem : ""
                  }`}
                  onClick={() => applyQuickSort("fastest")}
                >
                  <img
                    src={fastestMeta.logo}
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
              <img src="/icons/sort.svg" alt="" />
              <span className={styles.sortByText}>Sort by</span>
            </div>
          </div>
        </div>
        {isLoading ? (
          <OnewaySkeleton />
        ) : hasNoData ? (
          <p style={{ padding: "16px 0", color: "#4A5565" }}>No data found</p>
        ) : (
          visibleFlights.map((flight, index) => (
            <React.Fragment key={index}>
              {" "}
              <div
                key={flight.id}
                className={`${styles.expendableContainer} ${
                  openId === flight.id ? styles.flightOpenHoverNone : ""
                }`}
              >
                <div
                  key={flight.id}
                  className={`${styles.flightFareDetailsContainer} ${
                    openId === flight.id
                      ? styles.flightFareDetailsContainerOpen
                      : ""
                  }`}
                >
                  <div className={styles.flightFareDetails}>
                    <div className={styles.flightDetail}>
                      <div className={styles.flightNameContainer}>
                        {flight.airlines.length > 1 ? (
                          <div className={styles.multiImageCont}>
                            {flight.airlines.map((airline) => (
                              <img
                                key={airline.code}
                                src={airline.logo}
                                alt={airline.name}
                              />
                            ))}
                          </div>
                        ) : (
                          <img
                            src={flight.airlines[0].logo}
                            alt={flight.airlines[0].name}
                          />
                        )}
                        <div className={styles.flightName}>
                          <div className={styles.airlineName}>
                            {flight.airlines.map((a) => a.name).join(", ")}
                          </div>
                          <div className={styles.flightNumber}>
                            {flight.airlines.map((a) => a.code).join(", ")}
                          </div>
                        </div>
                      </div>
                      <div className={styles.departureDetail}>
                        <div className={styles.departureTimeContainer}>
                          <div className={styles.departureTime}>
                            {flight.departure.time}{" "}
                          </div>
                          <div className={styles.flightAnimation}>
                            <div className={styles.flightDotedcontainer}>
                              <div className={styles.bigDot}></div>
                              <div className={styles.dashBorder}></div>
                            </div>
                            <img src="/icons/flightIcon.svg" alt="" />
                            <div className={styles.flightDotedcontainer}>
                              <div className={styles.dashBorder}></div>
                              <div className={styles.bigDot}></div>
                            </div>
                          </div>
                          <div className={styles.departureTime}>
                            {flight.stops.nextDay && (
                              <span className={styles.nextDay}>+1 day </span>
                            )}
                            {flight.arrival.time}{" "}
                          </div>
                        </div>
                        <div className={styles.departureName}>
                          <span className={styles.fromName}>
                            {flight.departure.city}
                          </span>
                          <div className={styles.priceContainer}>
                            <span className={styles.duration}>
                              {renderDurationParts(flight)}
                            </span>
                            <div className={styles.dot}></div>
                            <span className={styles.nonStop}>
                              {flight.stops.type}
                            </span>
                          </div>
                          <span className={styles.fromName}>
                            {flight.arrival.city}
                          </span>
                        </div>
                        {flight.stops.via && (
                          <div className={styles.goingVia}>
                            via ({flight.stops.via})
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      className={styles.seeDetailsBtn}
                      onClick={() =>
                        setOpenId((prev) =>
                          prev === flight.id ? null : flight.id
                        )
                      }
                    >
                      See Details
                      <svg
                        className={`${styles.downArrow} ${
                          openId === flight.id ? styles.rotate : ""
                        }`}
                        width="8"
                        height="5"
                        viewBox="0 0 8 5"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.55967 4.01408C3.47933 4.01408 3.40454 4.00126 3.33532 3.97562C3.26609 3.94997 3.20028 3.90596 3.13789 3.84357L0.141737 0.847416C0.0494254 0.755116 0.0022032 0.639094 6.98646e-05 0.49935C-0.00207458 0.359606 0.0451476 0.241444 0.141737 0.144866C0.238314 0.0482881 0.355403 0 0.493003 0C0.630603 0 0.747692 0.0482881 0.84427 0.144866L3.55967 2.86027L6.27507 0.144866C6.36737 0.0525659 6.48339 0.0053437 6.62314 0.00319926C6.76287 0.00106593 6.88102 0.0482881 6.9776 0.144866C7.07419 0.241444 7.12249 0.358539 7.12249 0.49615C7.12249 0.63375 7.07419 0.750838 6.9776 0.847416L3.98145 3.84357C3.91906 3.90596 3.85325 3.94997 3.78402 3.97562C3.7148 4.00126 3.64001 4.01408 3.55967 4.01408Z"
                          fill="#000033"
                        />
                      </svg>
                    </div>
                  </div>
                <div className={styles.fareDetailsResponsive}>
                  <div
                    className={styles.seeDetailsBtn}
                    onClick={() =>
                      setOpenId((prev) =>
                        prev === flight.id ? null : flight.id
                      )
                    }
                  >
                    See Details
                    <svg
                      className={`${styles.downArrow} ${
                        openId === flight.id ? styles.rotate : ""
                      }`}
                      width="8"
                      height="5"
                      viewBox="0 0 8 5"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.55967 4.01408C3.47933 4.01408 3.40454 4.00126 3.33532 3.97562C3.26609 3.94997 3.20028 3.90596 3.13789 3.84357L0.141737 0.847416C0.0494254 0.755116 0.0022032 0.639094 6.98646e-05 0.49935C-0.00207458 0.359606 0.0451476 0.241444 0.141737 0.144866C0.238314 0.0482881 0.355403 0 0.493003 0C0.630603 0 0.747692 0.0482881 0.84427 0.144866L3.55967 2.86027L6.27507 0.144866C6.36737 0.0525659 6.48339 0.0053437 6.62314 0.00319926C6.76287 0.00106593 6.88102 0.0482881 6.9776 0.144866C7.07419 0.241444 7.12249 0.358539 7.12249 0.49615C7.12249 0.63375 7.07419 0.750838 6.9776 0.847416L3.98145 3.84357C3.91906 3.90596 3.85325 3.94997 3.78402 3.97562C3.7148 4.00126 3.64001 4.01408 3.55967 4.01408Z"
                        fill="#000033"
                      />
                    </svg>
                  </div>

                  <div className={styles.fareDetails}>
                    <div className={styles.totalFare}>
                      <span className={styles.fareText}>
                        {flight.fare.totalFare}
                      </span>
                    </div>
                    <div className={styles.fareAmount}>
                      <span className={styles.fare}>
                        {flight.fare.pricePerAdult}{" "}
                        <span className={styles.adult}> /ADULT</span>
                      </span>
                      <div className={styles.dot}></div>
                      <span className={styles.economy}>
                        {flight.fare.cabinClass}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.fareDetails}>
                  <div className={styles.totalFare}>
                    <span className={styles.fareText}>
                      {flight.fare.totalFare}
                    </span>
                    <button
                      className={styles.viewBtn}
                      onClick={() => openFareModal(flight)}
                    >
                      VIEW FARES
                    </button>
                  </div>
                  <div className={styles.fareAmount}>
                    <span className={styles.fare}>
                      {flight.fare.pricePerAdult}{" "}
                      <span className={styles.adult}> /ADULT</span>
                    </span>
                    <div className={styles.dot}></div>
                    <span className={styles.economy}>
                      {flight.fare.cabinClass}
                    </span>
                  </div>
                </div>
              </div>

              {/* ===== EXPANDABLE PANEL ===== */}
              <div
                className={`${styles.expandWrap} ${
                  openId === flight.id ? styles.open : ""
                }`}
              >
                <ExpandableTabs
                  flightData={flight}
                  selectedDepartureDate={selectedDepartureDate}
                  travellerSummary={travellerSummary}
                />
              </div>
            </div>
              {index === OFFER_INDEX && <OfferBanner />}
            </React.Fragment>
          ))
        )}

        {/* Fare Comparison Modal */}
        {/* Fare Comparison Modal */}
        {mounted && fareModalOpen !== null && (
          <>
            (
            <FareComparisonModal
              isOpen={fareModalOpen}
              onClose={() => setFareModalOpen(null)}
              flightData={resolvedFlightResults.find((f) => f.id === fareModalOpen)}
            />
            )
          </>
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
                  className={`${styles.sortedItem} ${
                    quickSort === "cheapest" ? styles.activeSortedItem : ""
                  }`}
                  onClick={() => applyQuickSort("cheapest")}
                >
                  <img
                    src={cheapestMeta.logo}
                    alt=""
                  />
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
                  className={`${styles.sortedItem} ${
                    quickSort === "fastest" ? styles.activeSortedItem : ""
                  }`}
                  onClick={() => applyQuickSort("fastest")}
                >
                  <img
                    src={fastestMeta.logo}
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
                className={`${styles.chevronSort} ${
                  openSort === true ? styles.open : ""
                }`}
                src="/icons/DownArrows.svg"
                alt=""
              />
            </div>
          </div>
        </div>
        <MobileFareComparisonModal
          isOpen={fareModalOpen}
          onClose={() => setFareModalOpen(null)}
          flightData={resolvedFlightResults.find((f) => f.id === fareModalOpen)}
        />
        {isLoading ? (
          <OnewaySkeleton />
        ) : hasNoData ? (
          <p style={{ padding: "16px 0", color: "#4A5565" }}>No data found</p>
        ) : (
          visibleFlights.map((flight, index) => (
            <FlightDetailsCard
              setFareModalOpen={() => openFareModal(flight)}
              key={flight.id + index}
              flight={flight}
            />
          ))
        )}
      </section>
      <SortBySheet
        open={openSort}
        onClose={() => setOpenSort(false)}
        selectedValue={filters.sortBy}
        onApply={(value) => {
          setSortBy(value);
        }}
      />
    </>
  );
};

export default OnewayFlightBooking;

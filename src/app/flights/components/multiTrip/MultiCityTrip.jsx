"use client";
import { useContext, useState } from "react";
import styles from "./MultiCityTrip.module.css";
import TripCard from "./tripCard/TripCard";
import OfferBanner from "../offerComponent/OfferBanner";
import DatePriceSlider from "../DatePriceSlider";
import { useTripType } from "../../TripTypeContext";
import SortBySheet from "../SortBySheet";
import RoundTripSkeleton from "../roundTrip/RoundTripSkeleton";
import { useFlightFilters } from "@/app/context/FlightFilterContext";
import { X } from "lucide-react";
import FlightDetailsCard from "../phoneViewComponents/multiTripPhoneView/FlightDetailsCard";
import { SidebarContext } from "../../SidebarContext";
import FareComparisonModalRoundTrip from "./FareComparisonModalMulticity";
import FareComparisonModalMulticity from "./FareComparisonModalMulticity";
import MobileFareComparisonModalMulticity from "./MobileFareComparisonModalMulticity";
const MultiCityTrip = ({
  flightData = [],
  tripCards = [],
  datewiseFareTiles = [],
  pagination = null,
  sortHighlights = null,
  hasSearched = false,
  isLoading = false,
}) => {
  const { committedSearches, handleSearch } = useTripType();
  const [openSort, setOpenSort] = useState(false);
  const { from, to } = committedSearches.multi;
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
  const { setIsSidebarOpen } = useContext(SidebarContext);
  const [fareModalOpen, setFareModalOpen] = useState(null);
  const [selectedFlightId, setSelectedFlightId] = useState(null);
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
            logo: "/images/Flight.png",
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
            logo: "/images/Flight.png",
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
  const visibleFlights = resolvedFlightResults;
  const visibleTripCards = resolvedTripCards;
  const cheapestMeta = {
    price: sortHighlights?.cheapest?.priceLabel || "₹ 8500",
    duration: sortHighlights?.cheapest?.durationLabel || "01h 50m",
  };
  const fastestMeta = {
    price: sortHighlights?.fastest?.priceLabel || "₹ 8500",
    duration: sortHighlights?.fastest?.durationLabel || "01h 50m",
  };
  const resultsText = pagination
    ? `Showing ${pagination.from}-${pagination.to} of ${pagination.total} results`
    : "Showing 1-10 of 100 results";
  const applyQuickSort = (type) => {
    const targetSortBy = type === "cheapest" ? "lowest" : "shortest";
    setSortBy(filters.sortBy === targetSortBy ? null : targetSortBy);
  };
  const hasNoData =
    hasSearched &&
    !isLoading &&
    visibleFlights.length === 0 &&
    visibleTripCards.length === 0;

  return (
    <>
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
                  <img src="/images/Flight.png" alt="" />
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
              onClick={() => setOpenSort(true)}
              className={styles.sortByContainer}
            >
              <img src="/icons/sort.svg" alt="" />
              <span className={styles.sortByText}>Sort by</span>
            </div>
          </div>
        </div>
        <div className={styles.tripCardsContainer}>
          {isLoading ? (
            <RoundTripSkeleton />
          ) : hasNoData ? (
            <p style={{ padding: "16px 0", color: "#4A5565" }}>No data found</p>
          ) : (
            visibleTripCards.map((card, index) => (
              <div key={card.id || index}>
                <TripCard cardData={card} setFareModalOpen={setFareModalOpen} />
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
                  <img src="/images/Flight.png" alt="" />
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
        {isLoading ? (
          <RoundTripSkeleton />
        ) : hasNoData ? (
          <p style={{ padding: "16px 0", color: "#4A5565" }}>No data found</p>
        ) : (
          visibleFlights.map((flight, index) => (
            <FlightDetailsCard
              setFareModalOpen={setFareModalOpen}
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
              setSelectedFlightId(null);
            }}
            flightData={resolvedFlightResults.find((f) => f.id === fareModalOpen)}
          />
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

export default MultiCityTrip;

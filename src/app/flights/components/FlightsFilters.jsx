"use client";
import { useContext, useMemo, useState } from "react";
import styles from "./FlightFilters.module.css";
import { ListFilter, X } from "lucide-react";
import { MoonCloudSVG, MoonSVG, SunriseSVG, SunSVG } from "./SVGFile";
import { SidebarContext } from "../SidebarContext";
import useLockBodyScroll from "@/app/hooks/useLockBodyScroll";
import { useFlightFilters } from "@/app/context/FlightFilterContext";
import { useTripType } from "../TripTypeContext";
import { resolveAirlineLogo } from "@/features/flights/utils/airlineLogos";

const toFiniteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const TIME_SLOT_OPTIONS = [
  { uiKey: "before6", apiKey: "before_6am", label: "Before 6AM", Icon: SunriseSVG },
  { uiKey: "6to12", apiKey: "morning", label: "6AM – 12PM", Icon: SunSVG },
  { uiKey: "12to6", apiKey: "afternoon", label: "12PM – 6PM", Icon: MoonCloudSVG },
  { uiKey: "after6", apiKey: "evening", label: "After 6PM", Icon: MoonSVG },
];

const STOP_FILTER_OPTIONS = {
  0: { key: "nonStop", label: "Non-Stop" },
  1: { key: "oneStop", label: "1 Stop" },
  2: { key: "twoPlus", label: "2+ Stops" },
};

export default function FlightFilters() {
  const { setIsSidebarOpen, isSidebarOpen } = useContext(SidebarContext);
  const [activePriceTooltip, setActivePriceTooltip] = useState(null);
  const [roundTripTimingTab, setRoundTripTimingTab] = useState("departure");

  useLockBodyScroll(isSidebarOpen);

  const {
    filters,
    apiFilterData,
    filterChips,
    toggleCheckbox,
    toggleMapCheckbox,
    selectDeparture,
    setPriceRange,
    resetFilters,
  } = useFlightFilters();
  const { tripType, committedSearches } = useTripType();

  const apiMinPrice = toFiniteNumber(apiFilterData?.price_min);
  const apiMaxPrice = toFiniteNumber(apiFilterData?.price_max);
  const hasApiPriceRange =
    apiMinPrice !== null && apiMaxPrice !== null && apiMaxPrice > apiMinPrice;
  const minPrice = hasApiPriceRange ? apiMinPrice : 0;
  const maxPrice = hasApiPriceRange ? apiMaxPrice : 0;
  const priceStep = 1000;
  const clampPrice = (value) => Math.min(Math.max(Number(value), minPrice), maxPrice);
  const price = filters.priceTouched
    ? [
        clampPrice(filters.price?.[0] ?? minPrice),
        clampPrice(filters.price?.[1] ?? maxPrice),
      ]
    : [minPrice, maxPrice];
  const rangeSize = Math.max(maxPrice - minPrice, 1);
  const minPricePercent = ((price[0] - minPrice) / rangeSize) * 100;
  const maxPricePercent = ((price[1] - minPrice) / rangeSize) * 100;
  const isMinTooltipAtEdge = minPricePercent < 8;
  const isMaxTooltipAtEdge = maxPricePercent > 92;
  const formatPrice = (value) => `Rs. ${Number(value).toLocaleString("en-IN")}`;
  const activeFilterRouteText =
    apiFilterData?.route || apiFilterData?.meta?.route || "";
  const activeFilterRouteParts = String(activeFilterRouteText)
    .split(/\s*(?:->|→)\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  const activeFilterTrip = apiFilterData?.trip || {};
  const activeRoute =
    activeFilterRouteParts.length >= 2
      ? {
          from: activeFilterRouteParts[0],
          to: activeFilterRouteParts[1],
        }
      : activeFilterTrip.origin && activeFilterTrip.destination
        ? {
            from: activeFilterTrip.origin,
            to: activeFilterTrip.destination,
          }
        : committedSearches?.[tripType] || committedSearches?.oneway || {};

  const getRouteLabel = (value, defaultLabel = "") => {
    const raw = String(value || "").trim();
    if (!raw) return defaultLabel;
    const cityOnly = raw.replace(/\s*\([^)]+\)\s*$/, "").trim();
    if (cityOnly) return cityOnly.toUpperCase();
    return raw.toUpperCase();
  };

  const fromLabel = getRouteLabel(activeRoute.from, "JAKARTA");
  const toLabel = getRouteLabel(activeRoute.to, "SINGAPORE");
  const isRoundTrip = tripType === "round";

  const formatSlotPrice = (value) => {
    const normalizedValue =
      typeof value === "object" && value !== null
        ? value.price ?? value.amount ?? value.value
        : value;

    if (normalizedValue === undefined || normalizedValue === null || normalizedValue === "") {
      return null;
    }

    const amount = Number(normalizedValue);
    if (!Number.isFinite(amount)) return null;
    return `₹ ${amount.toLocaleString("en-IN")}`;
  };

  const getSlotPrice = (bucket, uiSlot) => {
    const key = TIME_SLOT_OPTIONS.find((slot) => slot.uiKey === uiSlot)?.apiKey;
    const slots = apiFilterData?.[bucket] || {};
    const rawValue =
      slots?.[key] ??
      slots?.[key?.replace("_", "")] ??
      slots?.[uiSlot] ??
      slots?.[String(uiSlot).toLowerCase()];
    return formatSlotPrice(rawValue);
  };

  const apiAircraftOptions = Array.isArray(apiFilterData?.aircrafts)
    ? apiFilterData.aircrafts
        .map((item) => {
          const code = String(item?.code || "").trim();
          const name = String(item?.name || "").trim();
          const key = code || name;
          if (!key) return null;
          return {
            key,
            label: name || code,
          };
        })
        .filter(Boolean)
    : [];

  const aircraftOptions = apiAircraftOptions;

  const apiAirlineOptions = Array.isArray(apiFilterData?.airlines)
    ? apiFilterData.airlines
        .map((item) => {
          const name =
            typeof item === "string"
              ? item
              : item?.name || item?.airline || item?.label || "";
          const code =
            typeof item === "string" ? "" : item?.code || item?.id || item?.airline_code || "";
          const label = String(name || code || "").trim();
          if (!label) return null;

          return {
            key: label,
            label,
            logo: resolveAirlineLogo({
              name: label,
              code,
              logo: typeof item === "string" ? "" : item?.logo,
            }),
          };
        })
        .filter(Boolean)
    : [];

  const airlineOptions = apiAirlineOptions;

  const stopOptions = useMemo(() => {
    if (!Array.isArray(apiFilterData?.stops)) return [];

    return apiFilterData.stops
      .map((stop) => {
        const stopNumber = Number(stop);
        if (!Number.isFinite(stopNumber)) return null;
        return STOP_FILTER_OPTIONS[stopNumber >= 2 ? 2 : stopNumber] || null;
      })
      .filter(Boolean)
      .filter(
        (option, index, list) =>
          list.findIndex((item) => item.key === option.key) === index,
      );
  }, [apiFilterData?.stops]);

  const getAvailableSlots = (bucket) =>
    TIME_SLOT_OPTIONS.map((slot) => ({
      ...slot,
      price: getSlotPrice(bucket, slot.uiKey),
    })).filter((slot) => slot.price !== null);

  const activeDepartureBucket =
    isRoundTrip && roundTripTimingTab === "return"
      ? "return_departure_slots"
      : "departure_slots";
  const activeArrivalBucket =
    isRoundTrip && roundTripTimingTab === "return"
      ? "return_arrival_slots"
      : "arrival_slots";
  const departureSlots = getAvailableSlots(activeDepartureBucket);
  const arrivalSlots = getAvailableSlots(activeArrivalBucket);

  const renderHeader = () => (
    <div className={styles.header}>
      <div className={styles.titleAndCrossContainer}>
        <div className={styles.title}>
          <span className={styles.icon}>
            <ListFilter size={20} />
          </span>
          FILTER
        </div>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className={styles.filterClose}
        >
          <X size={20} color="#1A2029" />
        </button>
        <button onClick={resetFilters} className={styles.reset}>
          RESET
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
    </div>
  );

  const renderSlotButton = (slot, selectedKey, bucketKey) => {
    const Icon = slot.Icon;
    const isUnavailable = slot.price === null;

    return (
      <button
        key={`${bucketKey}-${slot.uiKey}`}
        onClick={() => selectDeparture(selectedKey, slot.uiKey)}
        disabled={isUnavailable}
        className={`${styles.departureCard} ${
          filters[selectedKey] === slot.uiKey ? styles.activeDepartureCard : ""
        } ${isUnavailable ? styles.disabledDepartureCard : ""}`}
      >
        <span className={styles.departureIcon}>
          <Icon />
        </span>
        <span className={styles.departureTime}>{slot.label}</span>
        <span className={styles.departurePrice}>{slot.price || "—"}</span>
      </button>
    );
  };

  return (
    <aside className={`${styles.sidebar} ${isRoundTrip ? styles.roundSidebar : ""}`}>
      {renderHeader()}

      {/* Popular Filters */}
      <section className={styles.sectionPopularFilter}>
        <h4 className={styles.sectionTitle}>POPULAR FILTERS</h4>

        <label className={styles.checkbox}>
          <input
            checked={filters.popular.refundable}
            onChange={() => toggleCheckbox("popular", "refundable")}
            type="checkbox"
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          Refundable Fare
        </label>

        <label className={styles.checkbox}>
          <input
            checked={filters.popular.oneStop}
            onChange={() => toggleCheckbox("popular", "oneStop")}
            type="checkbox"
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          1 Stop
        </label>

        <label className={styles.checkbox}>
          <input
            checked={filters.popular.lateDeparture}
            onChange={() => toggleCheckbox("popular", "lateDeparture")}
            type="checkbox"
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          Late Departure
        </label>

        <label className={styles.checkbox}>
          <input
            checked={filters.popular.nonStop}
            onChange={() => toggleCheckbox("popular", "nonStop")}
            type="checkbox"
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          Non Stop
        </label>
      </section>
      <div className={styles.border} />

      {/* Price Range */}
      {hasApiPriceRange && (
        <section className={`${styles.section} ${isRoundTrip ? styles.roundPriceSection : ""}`}>
        <h4 className={`${styles.sectionTitle} ${styles.titlePriceRange}`}>
          PRICE RANGE
        </h4>

        <div className={styles.rangeContainer}>
          {/* Track */}
          <div className={styles.sliderTrack} />

          {/* Active range */}
          <div
            className={styles.sliderRange}
            style={{
              left: `calc(${minPricePercent}% + ${13 - 26 * (minPricePercent / 100)}px)`,
              right: `calc(${100 - maxPricePercent}% + ${13 - 26 * ((100 - maxPricePercent) / 100)}px)`,
            }}
          />

          <div
            className={`${styles.rangeTooltip} ${styles.rangeTooltipMin} ${
              activePriceTooltip === "min" ? styles.rangeTooltipActive : ""
            } ${
              isMinTooltipAtEdge ? styles.rangeTooltipStartEdge : ""
            }`}
            style={{ left: `${minPricePercent}%` }}
          >
            {formatPrice(price[0])}
          </div>
          <div
            className={`${styles.rangeTooltip} ${styles.rangeTooltipMax} ${
              activePriceTooltip === "max" ? styles.rangeTooltipActive : ""
            } ${
              isMaxTooltipAtEdge ? styles.rangeTooltipEndEdge : ""
            }`}
            style={{ left: `${maxPricePercent}%` }}
          >
            {formatPrice(price[1])}
          </div>

          {/* Min thumb */}
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            step={priceStep}
            value={price[0]}
            onPointerEnter={() => setActivePriceTooltip("min")}
            onPointerLeave={() => setActivePriceTooltip(null)}
            onFocus={() => setActivePriceTooltip("min")}
            onBlur={() => setActivePriceTooltip(null)}
            onPointerDown={() => setPriceRange(price[0], price[1])}
            onChange={(e) => {
              const nextMin = Math.min(Number(e.target.value), price[1] - priceStep);
              setPriceRange(nextMin, price[1]);
            }}
            className={`${styles.rangeInput} ${styles.rangeLeft}`}
          />

          {/* Max thumb */}
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            step={priceStep}
            value={price[1]}
            onPointerEnter={() => setActivePriceTooltip("max")}
            onPointerLeave={() => setActivePriceTooltip(null)}
            onFocus={() => setActivePriceTooltip("max")}
            onBlur={() => setActivePriceTooltip(null)}
            onPointerDown={() => setPriceRange(price[0], price[1])}
            onChange={(e) => {
              const nextMax = Math.max(Number(e.target.value), price[0] + priceStep);
              setPriceRange(price[0], nextMax);
            }}
            className={`${styles.rangeInput} ${styles.rangeRight}`}
          />
        </div>

        <div className={styles.rangeValue}>
          {formatPrice(price[0])} – {formatPrice(price[1])}
        </div>
      </section>
      )}

      {hasApiPriceRange && <div className={styles.border} />}

      {/* Stops */}
      <section className={`${styles.section} ${isRoundTrip ? styles.roundStopsSection : ""}`}>
        <h4 className={`${styles.sectionTitle} ${styles.stops}`}>STOPS</h4>
        {stopOptions.length > 0 ? stopOptions.map((option) => (
          <label key={option.key} className={styles.checkbox}>
            <input
              checked={filters.stops[option.key]}
              onChange={() => toggleCheckbox("stops", option.key)}
              type="checkbox"
            />
            <span className={styles.customCheckbox}>
              <span className={styles.checkIcon}></span>
            </span>
            {option.label}
          </label>
        )) : <div className={styles.emptyFilters}>No stop filters available</div>}
      </section>

      <div className={styles.border} />

      {isRoundTrip && (
        <section className={`${styles.section} ${styles.roundTimingTabsSection}`}>
          <div className={styles.roundTimingTabs}>
            <button
              type="button"
              className={`${styles.roundTimingTab} ${
                roundTripTimingTab === "departure" ? styles.activeRoundTimingTab : ""
              }`}
              onClick={() => setRoundTripTimingTab("departure")}
            >
              Departure
            </button>
            <button
              type="button"
              className={`${styles.roundTimingTab} ${
                roundTripTimingTab === "return" ? styles.activeRoundTimingTab : ""
              }`}
              onClick={() => setRoundTripTimingTab("return")}
            >
              Return
            </button>
          </div>
        </section>
      )}

      {/* departure slots */}
      <section className={`${styles.section} ${isRoundTrip ? styles.roundDepartureFromSection : ""}`}>
        <h4 className={styles.sectionTitle}>
          {isRoundTrip && roundTripTimingTab === "return"
            ? `DEPARTURE FROM ${toLabel}`
            : `DEPARTURE FROM ${fromLabel}`}
        </h4>

        <div className={styles.departureGrid}>
          {TIME_SLOT_OPTIONS.map((baseSlot) => {
            const slot =
              departureSlots.find((item) => item.uiKey === baseSlot.uiKey) || {
                ...baseSlot,
                price: null,
              };
            return renderSlotButton(slot, "departureJakarta", activeDepartureBucket);
          })}
        </div>
      </section>

      <div className={styles.border} />

      <section className={`${styles.section} ${isRoundTrip ? styles.roundArrivalSection : ""}`}>
        <h4 className={styles.sectionTitle}>
          {isRoundTrip && roundTripTimingTab === "return"
            ? `ARRIVAL IN ${fromLabel}`
            : isRoundTrip
              ? `ARRIVAL IN ${toLabel}`
              : `DEPARTURE IN ${toLabel}`}
        </h4>

        <div className={styles.departureGrid}>
          {TIME_SLOT_OPTIONS.map((baseSlot) => {
            const slot =
              arrivalSlots.find((item) => item.uiKey === baseSlot.uiKey) || {
                ...baseSlot,
                price: null,
              };
            return renderSlotButton(slot, "departureSingapore", activeArrivalBucket);
          })}
        </div>
      </section>

      <div className={styles.border} />

      {/* aircraft model */}
      <section className={`${styles.section} ${isRoundTrip ? styles.roundAircraftSection : ""}`}>
        <h4 className={`${styles.sectionTitle} ${styles.stops}`}>
          Aircraft Model
        </h4>
        {aircraftOptions.length > 0 ? aircraftOptions.map((aircraft) => (
          <label key={aircraft.key} className={styles.checkbox}>
            <input
              type="checkbox"
              checked={!!filters.aircraft[aircraft.key]}
              onChange={() => toggleMapCheckbox("aircraft", aircraft.key)}
            />
            <span className={styles.customCheckbox}>
              <span className={styles.checkIcon}></span>
            </span>
            {aircraft.label}
          </label>
        )) : <div className={styles.emptyFilters}>No aircraft filters available</div>}
      </section>
      <div className={styles.border} />

      {/* preferred airline */}

      <section
        className={`${styles.section} ${styles.sectionPrefferedAirline} ${
          isRoundTrip ? styles.roundAirlineSection : ""
        }`}
      >
        <h4 className={`${styles.sectionTitle} ${styles.stops}`}>
          Preferred Airline
        </h4>
        {airlineOptions.length > 0 ? airlineOptions.map((airline, index) => (
          <label
            key={airline.key}
            style={index === airlineOptions.length - 1 ? { marginBottom: 0 } : undefined}
            className={styles.checkbox}
          >
            <input
              type="checkbox"
              checked={!!filters.airlines[airline.key]}
              onChange={() => toggleMapCheckbox("airlines", airline.key)}
            />
            <span className={styles.customCheckbox}>
              <span className={styles.checkIcon}></span>
            </span>
            <div className={styles.airlineLogoDiv}>
              <img
                src={airline.logo}
                alt={airline.label}
                width={16}
                height={16}
              />
              <span>{airline.label}</span>
            </div>
          </label>
        )) : <div className={styles.emptyFilters}>No airline filters available</div>}
      </section>
      <div className={styles.actionBar}>
        <button onClick={resetFilters} className={styles.resetBtn}>
          RESET
        </button>
        <button className={styles.applyBtn}>APPLY</button>
      </div>
    </aside>
  );
}

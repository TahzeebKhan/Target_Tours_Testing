"use client";
import { useContext, useState } from "react";
import styles from "./FlightFilters.module.css";
import { ListFilter, X } from "lucide-react";
import Image from "next/image";
import { MoonCloudSVG, MoonSVG, SunriseSVG, SunSVG } from "./SVGFile";
import { SidebarContext } from "../SidebarContext";
import useLockBodyScroll from "@/app/hooks/useLockBodyScroll";
import { useFlightFilters } from "@/app/context/FlightFilterContext";
import { useTripType } from "../TripTypeContext";

const FALLBACK_PRICE_RANGE = [0, 1000000];

const toFiniteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export default function FlightFilters() {
  const { setIsSidebarOpen, isSidebarOpen } = useContext(SidebarContext);
  const [activePriceTooltip, setActivePriceTooltip] = useState(null);

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
  const minPrice = hasApiPriceRange ? apiMinPrice : FALLBACK_PRICE_RANGE[0];
  const maxPrice = hasApiPriceRange ? apiMaxPrice : FALLBACK_PRICE_RANGE[1];
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
  const activeRoute = committedSearches?.[tripType] || committedSearches?.oneway || {};

  const getRouteLabel = (value, fallback) => {
    const raw = String(value || "").trim();
    if (!raw) return fallback;
    const cityOnly = raw.replace(/\s*\([^)]+\)\s*$/, "").trim();
    if (cityOnly) return cityOnly.toUpperCase();
    return raw.toUpperCase();
  };

  const fromLabel = getRouteLabel(activeRoute.from, "JAKARTA");
  const toLabel = getRouteLabel(activeRoute.to, "SINGAPORE");

  const slotKeyMap = {
    before6: "before_6am",
    "6to12": "morning",
    "12to6": "afternoon",
    after6: "evening",
    after12: "evening",
  };

  const formatSlotPrice = (value) => {
    const normalizedValue =
      typeof value === "object" && value !== null
        ? value.price ?? value.amount ?? value.value
        : value;

    if (normalizedValue === undefined || normalizedValue === null || normalizedValue === "") {
      return "₹ 0";
    }

    const amount = Number(normalizedValue);
    if (!Number.isFinite(amount)) return "₹ 0";
    return `₹ ${amount.toLocaleString("en-IN")}`;
  };

  const getSlotPrice = (bucket, uiSlot) => {
    const key = slotKeyMap[uiSlot];
    const slots = apiFilterData?.[bucket] || {};
    const rawValue =
      slots?.[key] ??
      slots?.[key?.replace("_", "")] ??
      slots?.[uiSlot] ??
      slots?.[String(uiSlot).toLowerCase()];
    return formatSlotPrice(rawValue);
  };

  const fallbackAircraftOptions = [
    { key: "A380", label: "Airbus A380" },
    { key: "B787", label: "Boeing 787" },
    { key: "E190", label: "Embraer E190" },
    { key: "CRJ", label: "Bombardier CRJ" },
    { key: "ATR72", label: "ATR 72" },
    { key: "C172", label: "Cessna 172" },
    { key: "LJ60", label: "Learjet 60" },
  ];

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

  const aircraftOptions =
    apiAircraftOptions.length > 0 ? apiAircraftOptions : fallbackAircraftOptions;

  return (
    <aside className={styles.sidebar}>
      {/* Header */}
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
      <section className={styles.section}>
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
              left: `${minPricePercent}%`,
              right: `${100 - maxPricePercent}%`,
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

      <div className={styles.border} />

      {/* Stops */}
      <section className={styles.section}>
        <h4 className={`${styles.sectionTitle} ${styles.stops}`}>STOPS</h4>
        <label className={styles.checkbox}>
          <input
            checked={filters.stops.nonStop}
            onChange={() => toggleCheckbox("stops", "nonStop")}
            type="checkbox"
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          Non-Stop
        </label>
        <label className={styles.checkbox}>
          <input
            checked={filters.stops.oneStop}
            onChange={() => toggleCheckbox("stops", "oneStop")}
            type="checkbox"
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          1 Stop
        </label>
        <label className={styles.checkbox}>
          <input
            checked={filters.stops.twoPlus}
            onChange={() => toggleCheckbox("stops", "twoPlus")}
            type="checkbox"
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          2+ Stops
        </label>
      </section>

      <div className={styles.border} />

      {/* departure from jakarta */}
      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>DEPARTURE FROM {fromLabel}</h4>

        <div className={styles.departureGrid}>
          <button
            onClick={() => selectDeparture("departureJakarta", "before6")}
            className={`${styles.departureCard} ${
              filters.departureJakarta === "before6"
                ? styles.activeDepartureCard
                : ""
            }`}
          >
            <span className={styles.departureIcon}>
              <SunriseSVG />
            </span>
            <span className={styles.departureTime}>Before 6AM</span>
            <span className={styles.departurePrice}>
              {getSlotPrice("departure_slots", "before6")}
            </span>
          </button>

          <button
            onClick={() => selectDeparture("departureJakarta", "6to12")}
            className={`${styles.departureCard} ${
              filters.departureJakarta === "6to12"
                ? styles.activeDepartureCard
                : ""
            }`}
          >
            <span className={styles.departureIcon}>
              <SunSVG />
            </span>
            <span className={styles.departureTime}>6AM – 12PM</span>
            <span className={styles.departurePrice}>
              {getSlotPrice("departure_slots", "6to12")}
            </span>
          </button>

          <button
            onClick={() => selectDeparture("departureJakarta", "12to6")}
            className={`${styles.departureCard} ${
              filters.departureJakarta === "12to6"
                ? styles.activeDepartureCard
                : ""
            }`}
          >
            <span className={styles.departureIcon}>
              <MoonCloudSVG />
            </span>
            <span className={styles.departureTime}>12PM – 6PM</span>
            <span className={styles.departurePrice}>
              {getSlotPrice("departure_slots", "12to6")}
            </span>
          </button>

          <button
            onClick={() => selectDeparture("departureJakarta", "after6")}
            className={`${styles.departureCard} ${
              filters.departureJakarta === "after6"
                ? styles.activeDepartureCard
                : ""
            }`}
          >
            <span className={styles.departureIcon}>
              <MoonSVG />
            </span>
            <span className={styles.departureTime}>After 6PM</span>
            <span className={styles.departurePrice}>
              {getSlotPrice("departure_slots", "after6")}
            </span>
          </button>
        </div>
      </section>

      <div className={styles.border} />

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>DEPARTURE IN {toLabel}</h4>

        <div className={styles.departureGrid}>
          <button
            onClick={() => selectDeparture("departureSingapore", "before6")}
            className={`${styles.departureCard} ${
              filters.departureSingapore === "before6"
                ? styles.activeDepartureCard
                : ""
            }`}
          >
            <span className={styles.departureIcon}>
              <SunriseSVG />
            </span>
            <span className={styles.departureTime}>Before 6AM</span>
            <span className={styles.departurePrice}>
              {getSlotPrice("arrival_slots", "before6")}
            </span>
          </button>

          <button
            onClick={() => selectDeparture("departureSingapore", "6to12")}
            className={`${styles.departureCard} ${
              filters.departureSingapore === "6to12"
                ? styles.activeDepartureCard
                : ""
            }`}
          >
            <span className={styles.departureIcon}>
              <SunSVG />
            </span>
            <span className={styles.departureTime}>6AM – 12PM</span>
            <span className={styles.departurePrice}>
              {getSlotPrice("arrival_slots", "6to12")}
            </span>
          </button>

          <button
            onClick={() => selectDeparture("departureSingapore", "12to6")}
            className={`${styles.departureCard} ${
              filters.departureSingapore === "12to6"
                ? styles.activeDepartureCard
                : ""
            }`}
          >
            <span className={styles.departureIcon}>
              <MoonCloudSVG />
            </span>
            <span className={styles.departureTime}>12PM – 6PM</span>
            <span className={styles.departurePrice}>
              {getSlotPrice("arrival_slots", "12to6")}
            </span>
          </button>

          <button
            onClick={() => selectDeparture("departureSingapore", "after6")}
            className={`${styles.departureCard} ${
              filters.departureSingapore === "after6"
                ? styles.activeDepartureCard
                : ""
            }`}
          >
            <span className={styles.departureIcon}>
              <MoonSVG />
            </span>
            <span className={styles.departureTime}>After 6PM</span>
            <span className={styles.departurePrice}>
              {getSlotPrice("arrival_slots", "after6")}
            </span>
          </button>
        </div>
      </section>

      <div className={styles.border} />

      {/* aircraft model */}
      <section className={styles.section}>
        <h4 className={`${styles.sectionTitle} ${styles.stops}`}>
          Aircraft Model
        </h4>
        {aircraftOptions.map((aircraft) => (
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
        ))}
      </section>
      <div className={styles.border} />

      {/* preferred airline */}

      <section
        className={`${styles.section} ${styles.sectionPrefferedAirline}`}
      >
        <h4 className={`${styles.sectionTitle} ${styles.stops}`}>
          Preferred Airline
        </h4>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.airlines["IndiGo"]}
            onChange={() => toggleMapCheckbox("airlines", "IndiGo")}
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          <div className={styles.airlineLogoDiv}>
            <Image
              src="/images/indigo.svg"
              alt="IndiGo"
              width={16}
              height={16}
            />
            <span>IndiGo</span>
          </div>
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.airlines["AirIndia"]}
            onChange={() => toggleMapCheckbox("airlines", "AirIndia")}
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          <div className={styles.airlineLogoDiv}>
            <Image
              src="/images/airindia.svg"
              alt="Air India"
              width={16}
              height={16}
            />
            <span>Air India</span>
          </div>
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.airlines["AirIndiaExpress"]}
            onChange={() => toggleMapCheckbox("airlines", "AirIndiaExpress")}
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          <div className={styles.airlineLogoDiv}>
            <Image
              src="/images/airindiaexpress.svg"
              alt="Air India Express"
              width={16}
              height={16}
            />
            <span>Air India Express</span>
          </div>
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.airlines["AkasaAir"]}
            onChange={() => toggleMapCheckbox("airlines", "AkasaAir")}
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          <div className={styles.airlineLogoDiv}>
            <Image
              src="/images/akasaair.svg"
              alt="Akasa Air"
              width={16}
              height={16}
            />
            <span>AkasaAir</span>
          </div>
        </label>

        <label style={{ marginBottom: 0 }} className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.airlines["SpiceJet"]}
            onChange={() => toggleMapCheckbox("airlines", "SpiceJet")}
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          <div className={styles.airlineLogoDiv}>
            <Image
              src="/images/spicejet.svg"
              alt="SpiceJet"
              width={16}
              height={16}
            />
            <span>SpiceJet</span>
          </div>
        </label>
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

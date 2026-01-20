"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import styles from "./FlightFilters.module.css";
import { ListFilter, X } from "lucide-react";
import Image from "next/image";
import { MoonCloudSVG, MoonSVG, SunriseSVG, SunSVG } from "@/app/flights/components/SVGFile";

export default function FlightFilters({ onClose, onReset, onApply, filterData }) {
  const DEFAULT_NIGHTS = [1, 10];
  const DEFAULT_PRICE = [11307, 57295];
  const isResettingRef = useRef(false);
  const [filters, setFilters] = useState({
    nights: DEFAULT_NIGHTS,
    flightType: null,
    packageType: null,          // ✅ for buttons
    premiumPackages: {},        // ✅ for checkbox
    hotelCategory: null, // ✅ ADD

    price: DEFAULT_PRICE,
    cities: {},
    themes: {},
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
  });






  const buildApiFilters = (filters) => {
    const api = {};

    if (Array.isArray(filters.nights)) {
      api.min_nights = filters.nights[0];
      api.max_nights = filters.nights[1];
    }

    if (Array.isArray(filters.price)) {
      api.min_price = filters.price[0];
      api.max_price = filters.price[1];
    }

    if (filters.flightType === "with") api.with_flight = true;
    if (filters.flightType === "without") api.with_flight = false;

    if (filters.packageType) {
      api.package_type = filters.packageType;
    }

    if (filters.premiumPackages?.Premium) {
      api.is_premium_package = true;
    }

    if (filters.hotelCategory) {
      api.hotel_category = filters.hotelCategory;
    }

    const cities = Object.keys(filters.cities || {}).filter(
      (c) => filters.cities[c]
    );
    if (cities.length) api.city = cities.join(",");

    const themes = Object.keys(filters.themes || {}).filter(
      (t) => filters.themes[t]
    );
    if (themes.length) api.theme = themes.join(",");

    return api;
  };

  //  const apiFilters = buildApiFilters(filters);
  // onApply(apiFilters);

  useEffect(() => {
    if (isResettingRef.current) {
      isResettingRef.current = false; // reset flag
      return; // ❌ skip auto apply
    }

    const apiFilters = buildApiFilters(filters);
    onApply?.(apiFilters);
  }, [filters]);


  const price = filters.price;
  const toggleCheckbox = (group, key) => {
    setFilters((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: !prev[group][key],
      },
    }));
  };
  const selectDeparture = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type] === value ? null : value,
    }));
  };
  // const handleReset = () => {
  //   setFilters({
  //     nights: DEFAULT_NIGHTS,
  //     flightType: null,
  //     packageType: null,          // ✅ for buttons
  //     premiumPackages: {},        // ✅ for checkbox

  //     price: DEFAULT_PRICE,
  //     cities: {},
  //     themes: {},
  //     popular: {
  //       refundable: false,
  //       oneStop: false,
  //       lateDeparture: false,
  //       nonStop: false,
  //     },
  //     stops: {
  //       nonStop: false,
  //       oneStop: false,
  //       twoPlus: false,
  //     },
  //     departureJakarta: null,
  //     departureSingapore: null,
  //     aircraft: {},
  //     airlines: {},
  //   });
  //   onReset?.(); // 🔥 notify parent if needed
  // };

  const handleReset = () => {
    isResettingRef.current = true; // 🔥 tell effect to skip

    const resetFilters = {
      nights: DEFAULT_NIGHTS,
      flightType: null,
      packageType: null,
      premiumPackages: {},
      hotelCategory: null,
      price: DEFAULT_PRICE,
      cities: {},
      themes: {},
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

    setFilters(resetFilters);

    onReset?.();              // optional UI sync
    onApply?.({});            // ✅ manual reset apply
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

  const { nights } = filters;

  const selectFlightType = (value) => {
    setFilters((prev) => ({
      ...prev,
      flightType: prev.flightType === value ? null : value,
    }));
  };
  const selectPackageType = (value) => {
    setFilters((prev) => ({
      ...prev,
      packageType: prev.packageType === value ? null : value,
    }));
  };

  const selectHotelCategory = (value) => {
    setFilters((prev) => ({
      ...prev,
      hotelCategory: prev.hotelCategory === value ? null : value,
    }));
  };

  // Generate filter chips from selected filters
  const filterChips = useMemo(() => {
    const chips = [];

    // Flight type chips
    if (filters.flightType === "with") {
      chips.push({ label: "With Flights", onRemove: () => selectFlightType("with") });
    }
    if (filters.flightType === "without") {
      chips.push({ label: "Without Flights", onRemove: () => selectFlightType("without") });
    }

    // Package type chips
    if (filters.packageType === "customizable") {
      chips.push({ label: "Customizable", onRemove: () => selectPackageType("customizable") });
    }
    if (filters.packageType === "group") {
      chips.push({ label: "Group Packages", onRemove: () => selectPackageType("group") });
    }

    // Hotel category chips
    if (filters.hotelCategory) {
      const categoryLabels = { "<3": "<3 Star", "3": "3 Star", "4": "4 Star", "5": "5 Star" };
      chips.push({
        label: categoryLabels[filters.hotelCategory] || filters.hotelCategory + " Star",
        onRemove: () => selectHotelCategory(filters.hotelCategory)
      });
    }

    // City chips
    Object.entries(filters.cities).forEach(([city, isSelected]) => {
      if (isSelected) {
        chips.push({ label: city, onRemove: () => toggleMapCheckbox("cities", city) });
      }
    });

    // Theme chips
    Object.entries(filters.themes).forEach(([theme, isSelected]) => {
      if (isSelected) {
        chips.push({ label: theme, onRemove: () => toggleMapCheckbox("themes", theme) });
      }
    });

    // Premium packages chips
    Object.entries(filters.premiumPackages).forEach(([pkg, isSelected]) => {
      if (isSelected) {
        chips.push({ label: "Premium Packages", onRemove: () => toggleMapCheckbox("premiumPackages", pkg) });
      }
    });

    return chips;
  }, [filters]);

  return (
    <aside className={styles.sidebar}>
      {/* Header */}
      <div className={styles.headerMobile}>
        <div className={styles.headerMobileFilter}>
          <p>FILTER</p>
          <X onClick={onClose} />
        </div>
        {filterChips.length > 0 && (
          <div className={styles.filterChips}>
            {filterChips.map((chip, index) => (
              <div key={index} className={styles.chip}>
                <div className={styles.chipName}>{chip.label}</div>
                <span onClick={chip.onRemove}>
                  <X size={16} color="#4A5565" />
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={styles.header}>
        <div className={styles.titleAndCrossContainer}>
          <div className={styles.title}>
            <span className={styles.icon}>
              <ListFilter size={20} />
            </span>
            FILTER
          </div>
          <button onClick={handleReset} className={styles.reset}>
            RESET
          </button>
        </div>

      </div>

      <div className={styles.border} />

      {/* Price Range */}
      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>DURATION (IN NIGHTS)</h4>

        <div className={styles.rangeContainer}>
          <div className={styles.sliderTrack} />

          <div
            className={styles.sliderRange}
            style={{
              left: `${((nights[0] - 1) / 9) * 100}%`,
              right: `${100 - ((nights[1] - 1) / 9) * 100}%`,
            }}
          />

          <input
            type="range"
            min={1}
            max={10}
            value={nights[0]}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                nights: [
                  Math.min(+e.target.value, prev.nights[1] - 1),
                  prev.nights[1],
                ],
              }))
            }
            className={`${styles.rangeInput} ${styles.rangeLeft}`}
          />

          <input
            type="range"
            min={1}
            max={10}
            value={nights[1]}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                nights: [
                  prev.nights[0],
                  Math.max(+e.target.value, prev.nights[0] + 1),
                ],
              }))
            }
            className={`${styles.rangeInput} ${styles.rangeRight}`}
          />
        </div>

        <div className={styles.rangeValue}>
          <span>{nights[0]}N  </span>  <span>{nights[1]}N</span>
        </div>
      </section>


      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>FLIGHTS</h4>

        <div className={styles.departureGrid}>
          <button
            onClick={() => selectFlightType("with")}
            className={`${styles.departureCard} ${filters.flightType === "with" ? styles.activeDepartureCard : ""
              }`}
          >
            <span className={styles.departureTime}>WITH FLIGHTS</span>
            <span className={styles.departurePrice}>({filterData?.with_flight || 0})</span>
          </button>

          <button
            onClick={() => selectFlightType("without")}
            className={`${styles.departureCard} ${filters.flightType === "without" ? styles.activeDepartureCard : ""
              }`}
          >
            <span className={styles.departureTime}>WITHOUT FLIGHTS</span>
            <span className={styles.departurePrice}>({filterData?.without_flight || 0})</span>
          </button>
        </div>
      </section>



      <div className={styles.border} />


      {/* Price Range */}
      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>PRICE RANGE</h4>

        <div className={styles.rangeContainer}>
          {/* Track */}
          <div className={styles.sliderTrack} />

          {/* Active range */}
          <div
            className={styles.sliderRange}
            style={{
              left: `${((price[0] - 11307) / (57295 - 11307)) * 100}%`,
              right: `${100 - ((price[1] - 11307) / (57295 - 11307)) * 100}%`,
            }}
          />

          {/* Min thumb */}
          <input
            type="range"
            min={11307}
            max={57295}
            value={price[0]}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                price: [
                  Math.min(+e.target.value, prev.price[1] - 1000),
                  prev.price[1],
                ],
              }))
            }
            className={`${styles.rangeInput} ${styles.rangeLeft}`}
          />

          {/* Max thumb */}
          <input
            type="range"
            min={11307}
            max={57295}
            value={price[1]}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                price: [
                  prev.price[0],
                  Math.max(+e.target.value, prev.price[0] + 1000),
                ],
              }))
            }
            className={`${styles.rangeInput} ${styles.rangeRight}`}
          />
        </div>

        <div className={styles.rangeValue}>
          Rs. {price[0].toLocaleString()} – Rs. {price[1].toLocaleString()}
        </div>
      </section>

      <div className={styles.border} />

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>HOTEL CATEGORY</h4>

        <div className={`${styles.departureGrid} ${styles.hotelCategoryGrid}`}>
          {/* < 3 Star */}
          <button
            onClick={() => selectHotelCategory("<3")}
            className={`${styles.departureCard} ${filters.hotelCategory === "<3" ? styles.activeDepartureCard : ""
              }`}
          >
            <span className={styles.departureTime}>
              &lt;3 <img src="/icons/star.svg" alt="" />
            </span>
            <span className={styles.departurePrice}>(240)</span>
          </button>

          {/* 3 Star */}
          <button
            onClick={() => selectHotelCategory("3")}
            className={`${styles.departureCard} ${filters.hotelCategory === "3" ? styles.activeDepartureCard : ""
              }`}
          >
            <span className={styles.departureTime}>
              3 <img src="/icons/star.svg" alt="" />
            </span>
            <span className={styles.departurePrice}>(240)</span>
          </button>

          {/* 4 Star */}
          <button
            onClick={() => selectHotelCategory("4")}
            className={`${styles.departureCard} ${filters.hotelCategory === "4" ? styles.activeDepartureCard : ""
              }`}
          >
            <span className={styles.departureTime}>
              4 <img src="/icons/star.svg" alt="" />
            </span>
            <span className={styles.departurePrice}>(240)</span>
          </button>

          {/* 5 Star */}
          <button
            onClick={() => selectHotelCategory("5")}
            className={`${styles.departureCard} ${filters.hotelCategory === "5" ? styles.activeDepartureCard : ""
              }`}
          >
            <span className={styles.departureTime}>
              5 <img src="/icons/star.svg" alt="" />
            </span>
            <span className={styles.departurePrice}>(240)</span>
          </button>
        </div>
      </section>


      <div className={styles.border} />

      {/* Stops */}
      <section className={styles.section}>
        <h4 className={`${styles.sectionTitle} ${styles.stops}`}>CITIES</h4>

        {filterData?.package_location_city_count &&
          Object.entries(filterData.package_location_city_count).map(
            ([city, count]) => (
              <label key={city} className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={!!filters.cities[city]}
                  onChange={() => toggleMapCheckbox("cities", city)}
                />
                <span className={styles.customCheckbox}>
                  <span className={styles.checkIcon}></span>
                </span>
                {city} ({count})
              </label>
            )
          )}
      </section>


      <div className={styles.border} />
      <div className={styles.border} />
      <section className={styles.section}>
        <h4 className={`${styles.sectionTitle} ${styles.stops}`}>THEME</h4>

        {filterData?.theme &&
          Object.entries(filterData.theme).map(([theme, count]) => (
            <label key={theme} className={styles.checkbox}>
              <input
                type="checkbox"
                checked={!!filters.themes[theme]}
                onChange={() => toggleMapCheckbox("themes", theme)}
              />
              <span className={styles.customCheckbox}>
                <span className={styles.checkIcon}></span>
              </span>
              {theme} ({count})
            </label>
          ))}
      </section>

      <div className={styles.border} />

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>PACKAGE TYPES</h4>

        <div className={styles.departureGrid}>
          <button
            onClick={() => selectPackageType("customizable")}
            className={`${styles.departureCard} ${filters.packageType === "customizable" ? styles.activeDepartureCard : ""
              }`}
          >
            <span className={styles.departureTime}>CUSTOMIZABLE</span>
            <span className={styles.departurePrice}>(240)</span>
          </button>

          <button
            onClick={() => selectPackageType("group")}
            className={`${styles.departureCard} ${filters.packageType === "group" ? styles.activeDepartureCard : ""
              }`}
          >
            <span className={styles.departureTime}>GROUP PACKAGES</span>
            <span className={styles.departurePrice}>(240)</span>
          </button>
        </div>
      </section>

      <div className={styles.border} />




      {/* aircraft model */}
      <section className={styles.section}>
        <h4 className={`${styles.sectionTitle} ${styles.stops}`}>
          PREMIUM PACKAGES
        </h4>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.premiumPackages["Premium"]}
            onChange={() => toggleMapCheckbox("premiumPackages", "Premium")}
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          Premium Packages ({filterData?.premium_package_count?.["true"] || 0})
        </label>
      </section>

    </aside >
  );
}

"use client";
import { useState } from "react";
import styles from "./FlightFilters.module.css";
import { ListFilter } from "lucide-react";
import Image from "next/image";
import { MoonCloudSVG, MoonSVG, SunriseSVG, SunSVG } from "@/app/flights/components/SVGFile";

export default function FlightFilters() {
  const DEFAULT_NIGHTS = [1, 10];
  const DEFAULT_PRICE = [11307, 57295];


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
  const handleReset = () => {
    setFilters({
      nights: DEFAULT_NIGHTS,
      flightType: null,
      packageType: null,          // ✅ for buttons
      premiumPackages: {},        // ✅ for checkbox

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

  return (
    <aside className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
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
            <span className={styles.departurePrice}>(240)</span>
          </button>

          <button
            onClick={() => selectFlightType("without")}
            className={`${styles.departureCard} ${filters.flightType === "without" ? styles.activeDepartureCard : ""
              }`}
          >
            <span className={styles.departureTime}>WITHOUT FLIGHTS</span>
            <span className={styles.departurePrice}>(240)</span>
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

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.cities["Toronto"]}
            onChange={() => toggleMapCheckbox("cities", "Toronto")}
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          Toronto (32)
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.cities["Vancouver"]}
            onChange={() => toggleMapCheckbox("cities", "Vancouver")}
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          Vancouver (52)
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.cities["Calgary"]}
            onChange={() => toggleMapCheckbox("cities", "Calgary")}
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          Calgary (52)
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.cities["Ottawa"]}
            onChange={() => toggleMapCheckbox("cities", "Ottawa")}
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          Ottawa (52)
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.cities["Montreal"]}
            onChange={() => toggleMapCheckbox("cities", "Montreal")}
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          Montreal (52)
        </label>
      </section>


      <div className={styles.border} />
      <section className={styles.section}>
        <h4 className={`${styles.sectionTitle} ${styles.stops}`}>THEME</h4>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.themes["Culture"]}
            onChange={() => toggleMapCheckbox("themes", "Culture")}
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          Culture (32)
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.themes["Offbeat"]}
            onChange={() => toggleMapCheckbox("themes", "Offbeat")}
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          Offbeat (15)
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.themes["Pahalgam"]}
            onChange={() => toggleMapCheckbox("themes", "Pahalgam")}
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          Pahalgam (26)
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.themes["Honeymoon"]}
            onChange={() => toggleMapCheckbox("themes", "Honeymoon")}
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          Honeymoon (52)
        </label>
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
          Premium Packages (112)
        </label>
      </section>

    </aside>
  );
}

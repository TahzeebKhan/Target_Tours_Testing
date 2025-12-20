"use client";
import { useState } from "react";
import styles from "./FlightFilters.module.css";
import { ListFilter } from "lucide-react";
import Image from "next/image";
import { MoonCloudSVG, MoonSVG, SunriseSVG, SunSVG } from "./SVGFile";

export default function FlightFilters() {
  const DEFAULT_PRICE = [11307, 57295];

  const [filters, setFilters] = useState({
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
    departureJakarta: null, // 'before6', '6to12', '12to6', 'after6'
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

      {/* Popular Filters */}
      <section>
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
        <h4 className={styles.sectionTitle}>PRICE RANGE</h4>

        <div className={styles.rangeContainer}>
          {/* Track */}
          <div className={styles.sliderTrack} />

          {/* Active range */}
          <div
            className={styles.sliderRange}
            style={{
              left: `${((price[0] - 10000) / (60000 - 10000)) * 100}%`,
              right: `${100 - ((price[1] - 10000) / (60000 - 10000)) * 100}%`,
            }}
          />

          {/* Min thumb */}
          <input
            type="range"
            min={10000}
            max={60000}
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
            min={10000}
            max={60000}
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
        <h4 className={styles.sectionTitle}>DEPARTURE FROM JAKARTA</h4>

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
            <span className={styles.departurePrice}>₹ 712,000</span>
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
            <span className={styles.departurePrice}>₹ 712,000</span>
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
            <span className={styles.departurePrice}>₹ 712,000</span>
          </button>

          <button
            onClick={() => selectDeparture("departureJakarta", "after12")}
            className={`${styles.departureCard} ${
              filters.departureJakarta === "after12"
                ? styles.activeDepartureCard
                : ""
            }`}
          >
            <span className={styles.departureIcon}>
              <MoonSVG />
            </span>
            <span className={styles.departureTime}>After 6PM</span>
            <span className={styles.departurePrice}>₹ 712,000</span>
          </button>
        </div>
      </section>

      <div className={styles.border} />

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>DEPARTURE In Singapore</h4>

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
            <span className={styles.departurePrice}>₹ 712,000</span>
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
            <span className={styles.departurePrice}>₹ 712,000</span>
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
            <span className={styles.departurePrice}>₹ 712,000</span>
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
            <span className={styles.departurePrice}>₹ 712,000</span>
          </button>
        </div>
      </section>

      <div className={styles.border} />

      {/* aircraft model */}
      <section className={styles.section}>
        <h4 className={`${styles.sectionTitle} ${styles.stops}`}>
          Aircraft Model
        </h4>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.aircraft["A380"]}
            onChange={() => toggleMapCheckbox("aircraft", "A380")}
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          Airbus A380
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.aircraft["B787"]}
            onChange={() => toggleMapCheckbox("aircraft", "B787")}
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          Boeing 787
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.aircraft["E190"]}
            onChange={() => toggleMapCheckbox("aircraft", "E190")}
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          Embraer E190
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.aircraft["CRJ"]}
            onChange={() => toggleMapCheckbox("aircraft", "CRJ")}
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          Bombardier CRJ
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.aircraft["ATR72"]}
            onChange={() => toggleMapCheckbox("aircraft", "ATR72")}
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          ATR 72
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.aircraft["C172"]}
            onChange={() => toggleMapCheckbox("aircraft", "C172")}
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          Cessna 172
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.aircraft["LJ60"]}
            onChange={() => toggleMapCheckbox("aircraft", "LJ60")}
          />
          <span className={styles.customCheckbox}>
            <span className={styles.checkIcon}></span>
          </span>
          Learjet 60
        </label>
      </section>
      <div className={styles.border} />

      {/* preferred airline */}

      <section className={styles.section}>
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
    </aside>
  );
}

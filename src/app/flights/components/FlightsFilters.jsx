"use client";
import { useState } from "react";
import styles from "./FlightFilters.module.css";
import { ListFilter } from "lucide-react";
import Image from "next/image";

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
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.3333 12.6667H12.6147C12.2952 12.6656 11.9868 12.5499 11.7455 12.3405C11.5043 12.1312 11.3462 11.8422 11.3 11.5261C11.178 10.7384 10.7783 10.0203 10.1731 9.50159C9.56788 8.98288 8.79708 8.69777 8 8.69777C7.20292 8.69777 6.43212 8.98288 5.82691 9.50159C5.22169 10.0203 4.82198 10.7384 4.7 11.5261C4.65386 11.842 4.49585 12.131 4.25472 12.3403C4.01358 12.5496 3.70532 12.6655 3.386 12.6667H0.666667C0.489856 12.6667 0.320286 12.5965 0.195262 12.4715C0.0702379 12.3465 0 12.1769 0 12.0001C0 11.8233 0.0702379 11.6537 0.195262 11.5287C0.320286 11.4036 0.489856 11.3334 0.666667 11.3334H3.386C3.43706 10.966 3.53288 10.6062 3.67133 10.2621L1.32133 8.89941C1.24275 8.85712 1.17346 8.79948 1.11756 8.72992C1.06166 8.66035 1.0203 8.58027 0.995933 8.49442C0.97156 8.40857 0.964672 8.31871 0.975676 8.23015C0.98668 8.14159 1.01535 8.05614 1.05999 7.97887C1.10463 7.90159 1.16433 7.83407 1.23555 7.7803C1.30678 7.72652 1.38807 7.6876 1.47461 7.66583C1.56116 7.64406 1.65119 7.63988 1.73938 7.65355C1.82756 7.66722 1.91211 7.69846 1.988 7.74541L4.34067 9.10941C4.56613 8.82561 4.82361 8.5688 5.108 8.34408L3.74533 5.98941C3.6632 5.83678 3.64373 5.65816 3.69107 5.49142C3.73841 5.32468 3.84882 5.18293 3.99891 5.09623C4.14899 5.00952 4.32694 4.98468 4.49504 5.02697C4.66313 5.06925 4.80814 5.17534 4.89933 5.32274L6.262 7.67408C6.60601 7.5337 6.96573 7.43544 7.33333 7.38141V4.66674C7.33333 4.48993 7.40357 4.32036 7.5286 4.19534C7.65362 4.07031 7.82319 4.00008 8 4.00008C8.17681 4.00008 8.34638 4.07031 8.47141 4.19534C8.59643 4.32036 8.66667 4.48993 8.66667 4.66674V7.38141C9.03421 7.43501 9.39393 7.53283 9.738 7.67274L11.1007 5.32074C11.1919 5.17334 11.3369 5.06725 11.505 5.02497C11.6731 4.98268 11.851 5.00752 12.0011 5.09423C12.1512 5.18093 12.2616 5.32268 12.3089 5.48942C12.3563 5.65616 12.3368 5.83478 12.2547 5.98741L10.89 8.34141C11.1744 8.56613 11.4319 8.82294 11.6573 9.10674L14.01 7.74274C14.1626 7.66061 14.3413 7.64114 14.508 7.68848C14.6747 7.73582 14.8165 7.84623 14.9032 7.99632C14.9899 8.1464 15.0147 8.32435 14.9724 8.49245C14.9302 8.66054 14.8241 8.80555 14.6767 8.89674L12.3333 10.2607C12.4739 10.6068 12.5716 10.9689 12.624 11.3387L15.3333 11.3334C15.5101 11.3334 15.6797 11.4036 15.8047 11.5287C15.9298 11.6537 16 11.8233 16 12.0001C16 12.1769 15.9298 12.3465 15.8047 12.4715C15.6797 12.5965 15.5101 12.6667 15.3333 12.6667Z"
                  fill="black"
                />
              </svg>
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_2149_3815)">
                  <path
                    d="M8 11.3333C6.16 11.3333 4.66667 9.84 4.66667 8C4.66667 6.16 6.16 4.66667 8 4.66667C9.84 4.66667 11.3333 6.16 11.3333 8C11.3333 9.84 9.84 11.3333 8 11.3333ZM8 6C6.9 6 6 6.9 6 8C6 9.1 6.9 10 8 10C9.1 10 10 9.1 10 8C10 6.9 9.1 6 8 6ZM8.66667 2.66667V0.666667C8.66667 0.3 8.36667 0 8 0C7.63333 0 7.33333 0.3 7.33333 0.666667V2.66667C7.33333 3.03333 7.63333 3.33333 8 3.33333C8.36667 3.33333 8.66667 3.03333 8.66667 2.66667ZM8.66667 15.3333V13.3333C8.66667 12.9667 8.36667 12.6667 8 12.6667C7.63333 12.6667 7.33333 12.9667 7.33333 13.3333V15.3333C7.33333 15.7 7.63333 16 8 16C8.36667 16 8.66667 15.7 8.66667 15.3333ZM3.33333 8C3.33333 7.63333 3.03333 7.33333 2.66667 7.33333H0.666667C0.3 7.33333 0 7.63333 0 8C0 8.36667 0.3 8.66667 0.666667 8.66667H2.66667C3.03333 8.66667 3.33333 8.36667 3.33333 8ZM16 8C16 7.63333 15.7 7.33333 15.3333 7.33333H13.3333C12.9667 7.33333 12.6667 7.63333 12.6667 8C12.6667 8.36667 12.9667 8.66667 13.3333 8.66667H15.3333C15.7 8.66667 16 8.36667 16 8ZM4.47333 4.47333C4.73333 4.21333 4.73333 3.79333 4.47333 3.53333L3.14 2.2C2.88 1.94 2.46 1.94 2.2 2.2C1.94 2.46 1.94 2.88 2.2 3.14L3.53333 4.47333C3.66667 4.60667 3.83333 4.66667 4.00667 4.66667C4.18 4.66667 4.34667 4.6 4.48 4.47333H4.47333ZM13.8067 13.8067C14.0667 13.5467 14.0667 13.1267 13.8067 12.8667L12.4733 11.5333C12.2133 11.2733 11.7933 11.2733 11.5333 11.5333C11.2733 11.7933 11.2733 12.2133 11.5333 12.4733L12.8667 13.8067C13 13.94 13.1667 14 13.34 14C13.5133 14 13.68 13.9333 13.8133 13.8067H13.8067ZM3.14 13.8067L4.47333 12.4733C4.73333 12.2133 4.73333 11.7933 4.47333 11.5333C4.21333 11.2733 3.79333 11.2733 3.53333 11.5333L2.2 12.8667C1.94 13.1267 1.94 13.5467 2.2 13.8067C2.33333 13.94 2.5 14 2.67333 14C2.84667 14 3.01333 13.9333 3.14667 13.8067H3.14ZM12.4733 4.47333L13.8067 3.14C14.0667 2.88 14.0667 2.46 13.8067 2.2C13.5467 1.94 13.1267 1.94 12.8667 2.2L11.5333 3.53333C11.2733 3.79333 11.2733 4.21333 11.5333 4.47333C11.6667 4.60667 11.8333 4.66667 12.0067 4.66667C12.18 4.66667 12.3467 4.6 12.48 4.47333H12.4733Z"
                    fill="black"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_2149_3815">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_2149_2634)">
                  <path
                    d="M2.23715 11.594C1.01222 10.5126 0.230003 9.01681 0.0407225 7.39385C-0.148558 5.77089 0.268449 4.13521 1.21165 2.80097C2.15486 1.46673 3.55775 0.527998 5.1509 0.165071C6.74404 -0.197856 8.41511 0.0406104 9.84315 0.834671L11.0285 1.49334L9.78249 2.02667C8.49949 2.61575 7.48182 3.66147 6.92782 4.96C6.35545 5.15685 5.82089 5.44995 5.34715 5.82667C5.48344 4.96568 5.79066 4.14068 6.25069 3.40024C6.71073 2.65981 7.31429 2.01892 8.02582 1.51534C7.57386 1.39272 7.10745 1.3315 6.63915 1.33334C5.59054 1.3329 4.56534 1.64337 3.69316 2.2255C2.82097 2.80764 2.14096 3.63529 1.7391 4.60385C1.33724 5.5724 1.23156 6.63835 1.43544 7.66696C1.63931 8.69556 2.14358 9.64062 2.88449 10.3827C2.60525 10.7492 2.38669 11.1582 2.23715 11.594ZM16.0005 12.3333C15.9997 11.3786 15.627 10.4618 14.9615 9.7773C14.2961 9.09278 13.3901 8.69441 12.4358 8.66667C12.12 7.77886 11.5009 7.03105 10.6877 6.55506C9.87442 6.07907 8.91924 5.90548 7.99052 6.06487C7.0618 6.22427 6.21916 6.70643 5.61117 7.42634C5.00317 8.14625 4.66885 9.0577 4.66715 10C4.6673 10.1622 4.67888 10.3241 4.70182 10.4847C4.15968 10.8371 3.7459 11.3552 3.52214 11.9618C3.29838 12.5685 3.27661 13.2312 3.46007 13.8512C3.64354 14.4713 4.02243 15.0154 4.54027 15.4026C5.05812 15.7898 5.68722 15.9994 6.33382 16H12.3338C13.306 15.9989 14.238 15.6123 14.9254 14.9249C15.6128 14.2375 15.9994 13.3055 16.0005 12.3333ZM11.2825 9.498L11.4005 10.118L12.0965 10.024C12.175 10.0106 12.2543 10.0025 12.3338 10C12.9527 10 13.5462 10.2458 13.9837 10.6834C14.4213 11.121 14.6672 11.7145 14.6672 12.3333C14.6672 12.9522 14.4213 13.5457 13.9837 13.9833C13.5462 14.4208 12.9527 14.6667 12.3338 14.6667H6.33382C5.94846 14.6651 5.57554 14.5301 5.27854 14.2845C4.98155 14.039 4.77881 13.6981 4.70486 13.3199C4.6309 12.9417 4.69028 12.5495 4.87291 12.2102C5.05553 11.8709 5.3501 11.6053 5.70649 11.4587L6.24782 11.2373L6.09915 10.672C6.03714 10.4533 6.00397 10.2273 6.00049 10C6.00504 9.33963 6.25447 8.70443 6.70048 8.21741C7.14649 7.73038 7.75736 7.42618 8.41479 7.36369C9.07222 7.30121 9.72945 7.4849 10.2592 7.87918C10.789 8.27347 11.1536 8.85031 11.2825 9.498Z"
                    fill="black"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_2149_2634">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_2149_3022)">
                  <path
                    d="M8.01091 15.9734C3.60731 15.9855 0.0276867 12.4254 0.0156554 8.02181C0.00362416 3.61822 3.56366 0.038596 7.96728 0.0265648C9.32872 0.022846 10.6684 0.367783 11.8588 1.0285L12.8907 1.60125L11.8648 2.18597C8.837 3.90513 7.77619 7.75328 9.49534 10.7811C10.1572 11.9467 11.1734 12.8711 12.3963 13.4199L13.4734 13.9057L12.4987 14.5701C11.1794 15.4816 9.61441 15.971 8.01091 15.9734ZM8.01091 1.35541C4.34122 1.35541 1.36634 4.33028 1.36634 7.99997C1.36634 11.6697 4.34122 14.6445 8.01091 14.6445C8.96462 14.6447 9.90684 14.4365 10.7717 14.0346C7.25581 11.7131 6.28756 6.98097 8.60903 3.46507C9.04303 2.80775 9.57622 2.22163 10.1897 1.72753C9.49003 1.47985 8.75309 1.35397 8.01091 1.35541ZM12.8614 6.47172L13.6368 8.02191L14.4129 6.47172L15.9631 5.69631L14.4129 4.92022L13.6375 3.37003L12.8614 4.92022L11.3119 5.69563L12.8614 6.47172ZM15.3199 11.3223C14.9529 11.3223 14.6554 11.6198 14.6554 11.9867C14.6554 12.3537 14.9529 12.6512 15.3199 12.6512C15.6869 12.6512 15.9844 12.3537 15.9844 11.9867C15.9844 11.6198 15.6869 11.3223 15.3199 11.3223ZM11.3332 8.66444C10.9662 8.66444 10.6687 8.96194 10.6687 9.32891C10.6687 9.69588 10.9662 9.99338 11.3332 9.99338C11.7002 9.99338 11.9977 9.69588 11.9977 9.32891C11.9977 8.96194 11.7002 8.66444 11.3332 8.66444Z"
                    fill="black"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_2149_3022">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.3333 12.6667H12.6147C12.2952 12.6656 11.9868 12.5499 11.7455 12.3405C11.5043 12.1312 11.3462 11.8422 11.3 11.5261C11.178 10.7384 10.7783 10.0203 10.1731 9.50159C9.56788 8.98288 8.79708 8.69777 8 8.69777C7.20292 8.69777 6.43212 8.98288 5.82691 9.50159C5.22169 10.0203 4.82198 10.7384 4.7 11.5261C4.65386 11.842 4.49585 12.131 4.25472 12.3403C4.01358 12.5496 3.70532 12.6655 3.386 12.6667H0.666667C0.489856 12.6667 0.320286 12.5965 0.195262 12.4715C0.0702379 12.3465 0 12.1769 0 12.0001C0 11.8233 0.0702379 11.6537 0.195262 11.5287C0.320286 11.4036 0.489856 11.3334 0.666667 11.3334H3.386C3.43706 10.966 3.53288 10.6062 3.67133 10.2621L1.32133 8.89941C1.24275 8.85712 1.17346 8.79948 1.11756 8.72992C1.06166 8.66035 1.0203 8.58027 0.995933 8.49442C0.97156 8.40857 0.964672 8.31871 0.975676 8.23015C0.98668 8.14159 1.01535 8.05614 1.05999 7.97887C1.10463 7.90159 1.16433 7.83407 1.23555 7.7803C1.30678 7.72652 1.38807 7.6876 1.47461 7.66583C1.56116 7.64406 1.65119 7.63988 1.73938 7.65355C1.82756 7.66722 1.91211 7.69846 1.988 7.74541L4.34067 9.10941C4.56613 8.82561 4.82361 8.5688 5.108 8.34408L3.74533 5.98941C3.6632 5.83678 3.64373 5.65816 3.69107 5.49142C3.73841 5.32468 3.84882 5.18293 3.99891 5.09623C4.14899 5.00952 4.32694 4.98468 4.49504 5.02697C4.66313 5.06925 4.80814 5.17534 4.89933 5.32274L6.262 7.67408C6.60601 7.5337 6.96573 7.43544 7.33333 7.38141V4.66674C7.33333 4.48993 7.40357 4.32036 7.5286 4.19534C7.65362 4.07031 7.82319 4.00008 8 4.00008C8.17681 4.00008 8.34638 4.07031 8.47141 4.19534C8.59643 4.32036 8.66667 4.48993 8.66667 4.66674V7.38141C9.03421 7.43501 9.39393 7.53283 9.738 7.67274L11.1007 5.32074C11.1919 5.17334 11.3369 5.06725 11.505 5.02497C11.6731 4.98268 11.851 5.00752 12.0011 5.09423C12.1512 5.18093 12.2616 5.32268 12.3089 5.48942C12.3563 5.65616 12.3368 5.83478 12.2547 5.98741L10.89 8.34141C11.1744 8.56613 11.4319 8.82294 11.6573 9.10674L14.01 7.74274C14.1626 7.66061 14.3413 7.64114 14.508 7.68848C14.6747 7.73582 14.8165 7.84623 14.9032 7.99632C14.9899 8.1464 15.0147 8.32435 14.9724 8.49245C14.9302 8.66054 14.8241 8.80555 14.6767 8.89674L12.3333 10.2607C12.4739 10.6068 12.5716 10.9689 12.624 11.3387L15.3333 11.3334C15.5101 11.3334 15.6797 11.4036 15.8047 11.5287C15.9298 11.6537 16 11.8233 16 12.0001C16 12.1769 15.9298 12.3465 15.8047 12.4715C15.6797 12.5965 15.5101 12.6667 15.3333 12.6667Z"
                  fill="black"
                />
              </svg>
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_2149_3815)">
                  <path
                    d="M8 11.3333C6.16 11.3333 4.66667 9.84 4.66667 8C4.66667 6.16 6.16 4.66667 8 4.66667C9.84 4.66667 11.3333 6.16 11.3333 8C11.3333 9.84 9.84 11.3333 8 11.3333ZM8 6C6.9 6 6 6.9 6 8C6 9.1 6.9 10 8 10C9.1 10 10 9.1 10 8C10 6.9 9.1 6 8 6ZM8.66667 2.66667V0.666667C8.66667 0.3 8.36667 0 8 0C7.63333 0 7.33333 0.3 7.33333 0.666667V2.66667C7.33333 3.03333 7.63333 3.33333 8 3.33333C8.36667 3.33333 8.66667 3.03333 8.66667 2.66667ZM8.66667 15.3333V13.3333C8.66667 12.9667 8.36667 12.6667 8 12.6667C7.63333 12.6667 7.33333 12.9667 7.33333 13.3333V15.3333C7.33333 15.7 7.63333 16 8 16C8.36667 16 8.66667 15.7 8.66667 15.3333ZM3.33333 8C3.33333 7.63333 3.03333 7.33333 2.66667 7.33333H0.666667C0.3 7.33333 0 7.63333 0 8C0 8.36667 0.3 8.66667 0.666667 8.66667H2.66667C3.03333 8.66667 3.33333 8.36667 3.33333 8ZM16 8C16 7.63333 15.7 7.33333 15.3333 7.33333H13.3333C12.9667 7.33333 12.6667 7.63333 12.6667 8C12.6667 8.36667 12.9667 8.66667 13.3333 8.66667H15.3333C15.7 8.66667 16 8.36667 16 8ZM4.47333 4.47333C4.73333 4.21333 4.73333 3.79333 4.47333 3.53333L3.14 2.2C2.88 1.94 2.46 1.94 2.2 2.2C1.94 2.46 1.94 2.88 2.2 3.14L3.53333 4.47333C3.66667 4.60667 3.83333 4.66667 4.00667 4.66667C4.18 4.66667 4.34667 4.6 4.48 4.47333H4.47333ZM13.8067 13.8067C14.0667 13.5467 14.0667 13.1267 13.8067 12.8667L12.4733 11.5333C12.2133 11.2733 11.7933 11.2733 11.5333 11.5333C11.2733 11.7933 11.2733 12.2133 11.5333 12.4733L12.8667 13.8067C13 13.94 13.1667 14 13.34 14C13.5133 14 13.68 13.9333 13.8133 13.8067H13.8067ZM3.14 13.8067L4.47333 12.4733C4.73333 12.2133 4.73333 11.7933 4.47333 11.5333C4.21333 11.2733 3.79333 11.2733 3.53333 11.5333L2.2 12.8667C1.94 13.1267 1.94 13.5467 2.2 13.8067C2.33333 13.94 2.5 14 2.67333 14C2.84667 14 3.01333 13.9333 3.14667 13.8067H3.14ZM12.4733 4.47333L13.8067 3.14C14.0667 2.88 14.0667 2.46 13.8067 2.2C13.5467 1.94 13.1267 1.94 12.8667 2.2L11.5333 3.53333C11.2733 3.79333 11.2733 4.21333 11.5333 4.47333C11.6667 4.60667 11.8333 4.66667 12.0067 4.66667C12.18 4.66667 12.3467 4.6 12.48 4.47333H12.4733Z"
                    fill="black"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_2149_3815">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_2149_2634)">
                  <path
                    d="M2.23715 11.594C1.01222 10.5126 0.230003 9.01681 0.0407225 7.39385C-0.148558 5.77089 0.268449 4.13521 1.21165 2.80097C2.15486 1.46673 3.55775 0.527998 5.1509 0.165071C6.74404 -0.197856 8.41511 0.0406104 9.84315 0.834671L11.0285 1.49334L9.78249 2.02667C8.49949 2.61575 7.48182 3.66147 6.92782 4.96C6.35545 5.15685 5.82089 5.44995 5.34715 5.82667C5.48344 4.96568 5.79066 4.14068 6.25069 3.40024C6.71073 2.65981 7.31429 2.01892 8.02582 1.51534C7.57386 1.39272 7.10745 1.3315 6.63915 1.33334C5.59054 1.3329 4.56534 1.64337 3.69316 2.2255C2.82097 2.80764 2.14096 3.63529 1.7391 4.60385C1.33724 5.5724 1.23156 6.63835 1.43544 7.66696C1.63931 8.69556 2.14358 9.64062 2.88449 10.3827C2.60525 10.7492 2.38669 11.1582 2.23715 11.594ZM16.0005 12.3333C15.9997 11.3786 15.627 10.4618 14.9615 9.7773C14.2961 9.09278 13.3901 8.69441 12.4358 8.66667C12.12 7.77886 11.5009 7.03105 10.6877 6.55506C9.87442 6.07907 8.91924 5.90548 7.99052 6.06487C7.0618 6.22427 6.21916 6.70643 5.61117 7.42634C5.00317 8.14625 4.66885 9.0577 4.66715 10C4.6673 10.1622 4.67888 10.3241 4.70182 10.4847C4.15968 10.8371 3.7459 11.3552 3.52214 11.9618C3.29838 12.5685 3.27661 13.2312 3.46007 13.8512C3.64354 14.4713 4.02243 15.0154 4.54027 15.4026C5.05812 15.7898 5.68722 15.9994 6.33382 16H12.3338C13.306 15.9989 14.238 15.6123 14.9254 14.9249C15.6128 14.2375 15.9994 13.3055 16.0005 12.3333ZM11.2825 9.498L11.4005 10.118L12.0965 10.024C12.175 10.0106 12.2543 10.0025 12.3338 10C12.9527 10 13.5462 10.2458 13.9837 10.6834C14.4213 11.121 14.6672 11.7145 14.6672 12.3333C14.6672 12.9522 14.4213 13.5457 13.9837 13.9833C13.5462 14.4208 12.9527 14.6667 12.3338 14.6667H6.33382C5.94846 14.6651 5.57554 14.5301 5.27854 14.2845C4.98155 14.039 4.77881 13.6981 4.70486 13.3199C4.6309 12.9417 4.69028 12.5495 4.87291 12.2102C5.05553 11.8709 5.3501 11.6053 5.70649 11.4587L6.24782 11.2373L6.09915 10.672C6.03714 10.4533 6.00397 10.2273 6.00049 10C6.00504 9.33963 6.25447 8.70443 6.70048 8.21741C7.14649 7.73038 7.75736 7.42618 8.41479 7.36369C9.07222 7.30121 9.72945 7.4849 10.2592 7.87918C10.789 8.27347 11.1536 8.85031 11.2825 9.498Z"
                    fill="black"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_2149_2634">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_2149_3022)">
                  <path
                    d="M8.01091 15.9734C3.60731 15.9855 0.0276867 12.4254 0.0156554 8.02181C0.00362416 3.61822 3.56366 0.038596 7.96728 0.0265648C9.32872 0.022846 10.6684 0.367783 11.8588 1.0285L12.8907 1.60125L11.8648 2.18597C8.837 3.90513 7.77619 7.75328 9.49534 10.7811C10.1572 11.9467 11.1734 12.8711 12.3963 13.4199L13.4734 13.9057L12.4987 14.5701C11.1794 15.4816 9.61441 15.971 8.01091 15.9734ZM8.01091 1.35541C4.34122 1.35541 1.36634 4.33028 1.36634 7.99997C1.36634 11.6697 4.34122 14.6445 8.01091 14.6445C8.96462 14.6447 9.90684 14.4365 10.7717 14.0346C7.25581 11.7131 6.28756 6.98097 8.60903 3.46507C9.04303 2.80775 9.57622 2.22163 10.1897 1.72753C9.49003 1.47985 8.75309 1.35397 8.01091 1.35541ZM12.8614 6.47172L13.6368 8.02191L14.4129 6.47172L15.9631 5.69631L14.4129 4.92022L13.6375 3.37003L12.8614 4.92022L11.3119 5.69563L12.8614 6.47172ZM15.3199 11.3223C14.9529 11.3223 14.6554 11.6198 14.6554 11.9867C14.6554 12.3537 14.9529 12.6512 15.3199 12.6512C15.6869 12.6512 15.9844 12.3537 15.9844 11.9867C15.9844 11.6198 15.6869 11.3223 15.3199 11.3223ZM11.3332 8.66444C10.9662 8.66444 10.6687 8.96194 10.6687 9.32891C10.6687 9.69588 10.9662 9.99338 11.3332 9.99338C11.7002 9.99338 11.9977 9.69588 11.9977 9.32891C11.9977 8.96194 11.7002 8.66444 11.3332 8.66444Z"
                    fill="black"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_2149_3022">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
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

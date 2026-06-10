"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import CustomDropdown from "./CustomDropdown";
import styles from "./FlightSwapModal.module.css";

const FLIGHT_OPTIONS = [
  {
    airline: "INDIGO",
    flightNumber: "6E - 541",
    logo: "/images/flightCompanyLogos/indigo.png",
    departureTime: "06:45",
    departureAirport: "JAKARTA (CGK)",
    arrivalTime: "08:00",
    arrivalAirport: "SINGAPORE (SIN)",
    duration: "01 h 50 m",
    stop: "Non Stop",
    totalPrice: "₹ 3,22,000",
    adultPrice: "₹ 12,000 / ADULT",
    cabin: "ECONOMY",
  },
  {
    airline: "INDIGO",
    flightNumber: "6E - 541",
    logo: "/images/flightCompanyLogos/indigo.png",
    departureTime: "07:30",
    departureAirport: "JAKARTA (CGK)",
    arrivalTime: "09:10",
    arrivalAirport: "SINGAPORE (SIN)",
    duration: "01 h 40 m",
    stop: "Non Stop",
    totalPrice: "₹ 3,18,500",
    adultPrice: "₹ 11,750 / ADULT",
    cabin: "ECONOMY",
  },
  {
    airline: "AIR INDIA",
    flightNumber: "AI - 428",
    logo: "/images/flightCompanyLogos/airIndia.png",
    departureTime: "09:45",
    departureAirport: "JAKARTA (CGK)",
    arrivalTime: "11:35",
    arrivalAirport: "SINGAPORE (SIN)",
    duration: "01 h 50 m",
    stop: "Non Stop",
    totalPrice: "₹ 3,30,000",
    adultPrice: "₹ 12,300 / ADULT",
    cabin: "ECONOMY",
  },
  {
    airline: "AKASA AIR",
    flightNumber: "QP - 119",
    logo: "/images/flightCompanyLogos/akasaair.png",
    departureTime: "12:15",
    departureAirport: "JAKARTA (CGK)",
    arrivalTime: "14:10",
    arrivalAirport: "SINGAPORE (SIN)",
    duration: "01 h 55 m",
    stop: "Non Stop",
    totalPrice: "₹ 3,25,500",
    adultPrice: "₹ 12,100 / ADULT",
    cabin: "ECONOMY",
  },
];

const getTransportText = (transport, keys, fallback = "") => {
  const value = keys.map((key) => transport?.[key]).find(Boolean);
  return String(value || fallback).replace(/<[^>]*>/g, " ").trim();
};

export default function FlightSwapModal({ isOpen, onClose, transport, city }) {
  const [selectedStop, setSelectedStop] = useState("non-stop");
  const [selectedDeparture, setSelectedDeparture] = useState("any");
  const [selectedArrival, setSelectedArrival] = useState("any");
  const [selectedAirline, setSelectedAirline] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const route = useMemo(() => {
    const from =
      getTransportText(transport, ["from", "origin", "pickup_location"]) ||
      city ||
      "Delhi";
    const to =
      getTransportText(transport, ["to", "destination", "drop_location"]) ||
      "Phuket";
    const fromAirport = getTransportText(
      transport,
      ["departure_airport", "from_airport", "origin_airport"],
      "Jakarta (CGK)",
    );
    const toAirport = getTransportText(
      transport,
      ["arrival_airport", "to_airport", "destination_airport"],
      "Singapore (SIN)",
    );

    return { from, to, fromAirport, toAirport };
  }, [city, transport]);

  const filteredFlights = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return FLIGHT_OPTIONS;

    return FLIGHT_OPTIONS.filter((flight) =>
      [
        flight.airline,
        flight.flightNumber,
        flight.departureTime,
        flight.arrivalTime,
        flight.totalPrice,
        flight.cabin,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className={styles.flightModalOverlay} onMouseDown={onClose}>
      <section
        className={styles.flightModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="flight-swap-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.flightModalClose}
          onClick={onClose}
          aria-label="Close flight selection"
        >
          <X size={18} />
        </button>

        <header className={styles.flightModalHero}>
          <div>
            <p>
              {route.from}→{route.to}
            </p>
            <h2 id="flight-swap-title">Select Flight To Change</h2>
          </div>
        </header>

        <div className={styles.flightModalContent}>
          <div className={styles.flightFilters}>
            <label>
              <span>Stop</span>
              <CustomDropdown
                label="Stop"
                options={[
                  { value: "non-stop", label: "Non Stop" },
                  { value: "one-stop", label: "One Stop" },
                ]}
                value={selectedStop}
                onChange={setSelectedStop}
              />
            </label>
            <label>
              <span>Departure time</span>
              <CustomDropdown
                label="Departure time"
                options={[
                  { value: "any", label: "Any" },
                  { value: "morning", label: "Morning" },
                  { value: "evening", label: "Evening" },
                ]}
                value={selectedDeparture}
                onChange={setSelectedDeparture}
              />
            </label>
            <label>
              <span>Arrival time</span>
              <CustomDropdown
                label="Arrival time"
                options={[
                  { value: "any", label: "Any" },
                  { value: "morning", label: "Morning" },
                  { value: "evening", label: "Evening" },
                ]}
                value={selectedArrival}
                onChange={setSelectedArrival}
              />
            </label>
            <label>
              <span>Airline</span>
              <CustomDropdown
                label="Airline"
                options={[
                  { value: "all", label: "All Airline" },
                  { value: "indigo", label: "Indigo" },
                  { value: "air-india", label: "Air India" },
                ]}
                value={selectedAirline}
                onChange={setSelectedAirline}
              />
            </label>
            <button type="button" className={styles.filterButton}>
              <img src="/icons/sort.svg" alt="" />
              Filter
            </button>
          </div>

          <div className={styles.flightHeadingRow}>
            <div>
              <h3>
                Flight from <span>{route.fromAirport}</span> to{" "}
                <span>{route.toAirport}</span>
              </h3>
              <p>The price is average for one person. Included all taxes and fees.</p>
            </div>
            <span>Showing 1-10 of 100 results</span>
          </div>

          <label className={styles.flightSearch}>
            <Search size={18} />
            <input
              type="search"
              placeholder="Search Flights.."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearSearchButton}
                onClick={() => setSearchQuery("")}
                aria-label="Clear flight search"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </label>

          <div className={styles.flightOptions}>
            {filteredFlights.map((flight, index) => (
              <article className={styles.flightOptionCard} key={`${flight.flightNumber}-${index}`}>
                <div className={styles.flightMainRow}>
                  <div className={styles.flightAirline}>
                    <img src={flight.logo} alt="" />
                    <span>
                      <strong>{flight.airline}</strong>
                      <small>{flight.flightNumber}</small>
                    </span>
                  </div>

                  <div className={styles.flightTimeBlock}>
                    <strong>{flight.departureTime}</strong>
                    <small>{flight.departureAirport}</small>
                  </div>

                  <div className={styles.flightTimeline}>
                    <span className={styles.flightDot} />
                    <span className={styles.flightDash} />
                    <img src="/icons/flightIconBlue.svg" alt="" />
                    <span className={styles.flightDash} />
                    <span className={styles.flightDot} />
                    <small>
                      {flight.duration} <b>•</b> {flight.stop}
                    </small>
                  </div>

                  <div className={styles.flightTimeBlock}>
                    <strong>{flight.arrivalTime}</strong>
                    <small>{flight.arrivalAirport}</small>
                  </div>

                  <div className={styles.flightPrice}>
                    <strong>{flight.totalPrice}</strong>
                    <span>
                      <div className={styles.adultPrice}>

                      {flight.adultPrice} 
                      </div>
                      <b>•</b> 
                      <div className={styles.cabinType}>
                        {flight.cabin}
                      </div>
                    </span>
                  </div>
                </div>

                <div className={styles.flightMetaRow}>
                  <span>
                    <img src="/icons/baggage.svg" alt="" />
                    Baggage 20 kg, Cabin Baggage 7kg
                  </span>
                  <span>
                    <img src="/icons/entertainment.svg" alt="" />
                    In-flight entertainment
                  </span>
                  <span>
                    <img src="/icons/usbPort.svg" alt="" />
                    Power & USB Port
                  </span>
                  <button type="button" onClick={onClose}>
                    <img src="/images/swap.svg" alt="" />
                    Replace
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

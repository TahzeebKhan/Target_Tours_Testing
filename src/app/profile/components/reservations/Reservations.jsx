"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import styles from "./Reservations.module.css";
import ActiveReservations from "@/features/profile/components/ActiveReservations";
import CorporateReservationCard from "./CorporateReservationCard";
import api from "@/shared/services/axios";

const reservationData = [
  {
    id: "173826",
    hotel: "Golden Tulip Hotel",
    checkIn: "12 Mar 2021",
    checkOut: "24 Mar 2025",
    guests: "4 Adults",
    status: "CONFIRMED",
    image: "/images/hotel-thumbnail.jpg",
  },
  {
    id: "173826",
    hotel: "Golden Tulip Hotel",
    checkIn: "12 Mar 2021",
    checkOut: "24 Mar 2025",
    guests: "4 Adults",
    status: "PENDING",
    image: "/images/hotel-thumbnail.jpg",
  },
];

const corporateReservationData = [
  {
    id: "173826",
    bkid: "#BK001235",
    bkDate: "10 Jan 2026",
    amt: "₹30,000",
    location: "Colaba, Mumbai",
    hotel: "Golden Tulip Hotel",
    checkIn: "12 Mar 2021",
    checkOut: "24 Mar 2025",
    guests: "4 Adults",
    status: "CONFIRMED",
    image: "/images/hotel-thumbnail.jpg",
  },
  {
    id: "173829",
    bkid: "#BK001235",
    bkDate: "10 Jan 2026",
    amt: "₹30,000",
    location: "Colaba, Mumbai",
    hotel: "Golden Tulip Hotel",
    checkIn: "12 Mar 2021",
    checkOut: "24 Mar 2025",
    guests: "4 Adults",
    status: "CONFIRMED",
    image: "/images/hotel-thumbnail.jpg",
  },
];
const packageData = [
  {
    id: "173826",
    hotel: "Maldives Magic",
    fromTo: "DEL - BLR",
    checkIn: "5 Jun 2026",
    checkOut: "9 Jun 2026",
    guests: "4 Adults",
    status: "CONFIRMED",
    image: "/images/packages.png",
  },
  {
    id: "173826",
    hotel: "Maldives Magic",
    fromTo: "DEL - BLR",
    checkIn: "15 Jun 2026",
    checkOut: "9 Jun 2026",
    guests: "4 Adults",
    status: "PENDING",
    image: "/images/packages.png",
  },
];

const travelInsuranceData = [
  {
    id: "173826",
    hotel: "Worldwide Health Cover",
    fromTo: "DEL - BLR",
    checkIn: "12 Mar 2021",
    checkOut: "24 Mar 2025",
    guests: "4 Adults",
    status: "CONFIRMED",
    image: "/images/travelInsurenceThumbnail.png",
  },
  {
    id: "173826",
    hotel: "Worldwide Health Cover",
    fromTo: "DEL - BLR",
    checkIn: "112 Mar 2021",
    checkOut: "24 Mar 2025",
    guests: "4 Adults",
    status: "PENDING",
    image: "/images/travelInsurenceThumbnail.png",
  },
];

const tabs = [
  "ALL",
  "HOTEL BOOKING",
  "FLIGHT BOOKING",
  "PACKAGES",
  "TRAVEL INSURANCE",
];

const isCorporate = false;

const extractBookingRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.bookings)) return payload.bookings;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.bookings)) return payload.data.bookings;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
};

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const dateLabel = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeLabel = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${dateLabel}, ${timeLabel}`;
};

const getPassengerSummary = (item) => {
  const passengers =
    item?.passengers ||
    item?.data?.passengers ||
    item?.raw?.Pax ||
    [];

  if (Array.isArray(passengers) && passengers.length > 0) {
    const counts = passengers.reduce((acc, passenger) => {
      const type = String(
        passenger?.type || passenger?.PTC || passenger?.pax_type || "ADT"
      ).toUpperCase();
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([type, count]) => {
        const label =
          type === "ADT" ? "Adult" : type === "CHD" ? "Child" : type === "INF" ? "Infant" : type;
        return `${count} ${label}${count > 1 ? "s" : ""}`;
      })
      .join(", ");
  }

  const adults = Number(item?.adults || item?.ADT || item?.raw?.ADT || 0);
  const children = Number(item?.children || item?.CHD || item?.raw?.CHD || 0);
  const infants = Number(item?.infants || item?.INF || item?.raw?.INF || 0);
  const labels = [
    adults ? `${adults} Adult${adults > 1 ? "s" : ""}` : "",
    children ? `${children} Child${children > 1 ? "ren" : ""}` : "",
    infants ? `${infants} Infant${infants > 1 ? "s" : ""}` : "",
  ].filter(Boolean);
  return labels.join(", ") || "N/A";
};

const mapFlightReservation = (item, index) => {
  const airline = item?.airline || item?.flight?.airline || item?.carrier || "Flight";
  const flightNo = String(
    item?.flight_no || item?.flightNo || item?.flight_number || item?.raw?.FlightNo || ""
  ).trim();
  const fromCode = String(item?.from || item?.origin || item?.from_code || item?.raw?.From || "").toUpperCase();
  const toCode = String(item?.to || item?.destination || item?.to_code || item?.raw?.To || "").toUpperCase();
  const rawStatus = String(
    item?.status || item?.booking_status || item?.payment_status || "PENDING"
  ).toUpperCase();
  const status =
    rawStatus === "TO0" || rawStatus === "CONFIRMED" || rawStatus === "T00"
      ? "CONFIRMED"
      : rawStatus === "I8" || rawStatus === "INITIATED"
        ? "PENDING"
        : rawStatus;

  return {
    id: String(item?.booking_id || item?.id || item?.reference_id || index + 1),
    hotel: flightNo ? `${airline} (${flightNo})` : airline,
    fromTo: `${fromCode || "N/A"} - ${toCode || "N/A"}`,
    checkIn: formatDateTime(item?.departure || item?.depart_at || item?.onward_date),
    checkOut: formatDateTime(item?.arrival || item?.arrive_at || item?.return_date),
    guests: getPassengerSummary(item),
    status,
    image: "/images/flightsReservations.png",
  };
};

export default function Reservations({
  onCheckDetails,
  activeTab,
  setActiveTab,
}) {
  const [flightReservationData, setFlightReservationData] = useState([]);

  useEffect(() => {
    let ignore = false;

    const loadFlightBookings = async () => {
      try {
        const response = await api.get("/bookings", {
          params: {
            type: "flight,package",
            domain: "localhost:1337",
            page: 1,
            per_page: 1,
          },
        });

        if (ignore) return;

        const rows = extractBookingRows(response?.data)
          .filter((item) => {
            const type = String(
              item?.type || item?.booking_type || item?.service_type || ""
            ).toLowerCase();
            return !type || type.includes("flight") || type === "flt";
          })
          .map(mapFlightReservation);

        setFlightReservationData(rows);
      } catch (error) {
        if (!ignore) {
          setFlightReservationData([]);
        }
      }
    };

    loadFlightBookings();

    return () => {
      ignore = true;
    };
  }, []);

  const allTabFlightData = useMemo(() => flightReservationData, [flightReservationData]);

  return (
    <>
      <section className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Active Reservations</h1>
          <p className={styles.subtitle}>
            View and manage your current bookings here.
          </p>
        </header>

        <nav className={styles.tabsContainer}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`${styles.tabButton} ${
                activeTab === tab ? styles.active : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {isCorporate && (
          <CorporateReservationCard data={corporateReservationData} />
        )}

        {activeTab === "ALL" && (
          <>
            {" "}
            <div className={styles.list}>
              {reservationData.map((item, index) => (
                <article key={index} className={styles.card}>
                  <div className={styles.cardMain}>
                    <div className={styles.imageWrapper}>
                      <Image
                        src={item.image}
                        alt={item.hotel}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>

                    <div className={styles.content}>
                      <div className={styles.cardHeader}>
                        <h2 className={styles.hotelName}>{item.hotel}</h2>
                      </div>

                      <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Check In:</span>
                          <span className={styles.value}>{item.checkIn}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Check out:</span>
                          <span className={styles.value}>{item.checkOut}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Guests:</span>
                          <span className={styles.value}>{item.guests}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.actionsWrapper}>
                    <div className={styles.statusGroup}>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[item.status.toLowerCase()]
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className={styles.idLabel}>ID {item.id}</span>
                    </div>

                    <button
                      className={styles.checkDetails}
                      onClick={onCheckDetails}
                    >
                      Check Details
                    </button>
                  </div>
                </article>
              ))}
              {packageData.map((item, index) => (
                <article key={index} className={styles.card}>
                  <div className={styles.cardMain}>
                    <div className={styles.imageWrapper}>
                      <Image
                        src={item.image}
                        alt={item.hotel}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>

                    <div className={styles.content}>
                      <div className={styles.cardHeader}>
                        <h2 className={styles.hotelName}>{item.hotel}</h2>
                      </div>

                      <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Start Date:</span>
                          <span className={styles.value}>{item.checkIn}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>End date:</span>
                          <span className={styles.value}>{item.checkOut}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Travellers:</span>
                          <span className={styles.value}>{item.guests}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.actionsWrapper}>
                    <div className={styles.statusGroup}>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[item.status.toLowerCase()]
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className={styles.idLabel}>ID {item.id}</span>
                    </div>

                    <button
                      className={styles.checkDetails}
                      onClick={onCheckDetails}
                    >
                      Check Details
                    </button>
                  </div>
                </article>
              ))}{" "}
              {allTabFlightData.map((item, index) => (
                <article key={index} className={styles.card}>
                  <div className={styles.cardMain}>
                    <div className={styles.imageWrapper}>
                      <Image
                        src={item.image}
                        alt={item.hotel}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>

                    <div className={styles.content}>
                      <div
                        className={`${styles.cardHeader} ${styles.flightCardHeader}`}
                      >
                        <h2 className={styles.hotelName}>{item.hotel}</h2>
                        <h2 className={styles.hotelName}>{item.fromTo}</h2>
                      </div>

                      <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Departure:</span>
                          <span className={styles.value}>{item.checkIn}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Arrival:</span>
                          <span className={styles.value}>{item.checkOut}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Passengers:</span>
                          <span className={styles.value}>{item.guests}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.actionsWrapper}>
                    <div className={styles.statusGroup}>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[item.status.toLowerCase()]
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className={styles.idLabel}>ID {item.id}</span>
                    </div>

                    <button
                      className={styles.checkDetails}
                      onClick={onCheckDetails}
                    >
                      Check Details
                    </button>
                  </div>
                </article>
              ))}{" "}
              {travelInsuranceData.map((item, index) => (
                <article key={index} className={styles.card}>
                  <div className={styles.cardMain}>
                    <div className={styles.imageWrapper}>
                      <Image
                        src={item.image}
                        alt={item.hotel}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>

                    <div className={styles.content}>
                      <div className={styles.cardHeader}>
                        <h2 className={styles.hotelName}>{item.hotel}</h2>
                      </div>

                      <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Policy Start:</span>
                          <span className={styles.value}>{item.checkIn}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Policy End:</span>
                          <span className={styles.value}>{item.checkOut}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Travellers:</span>
                          <span className={styles.value}>{item.guests}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.actionsWrapper}>
                    <div className={styles.statusGroup}>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[item.status.toLowerCase()]
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className={styles.idLabel}>ID {item.id}</span>
                    </div>

                    <button
                      className={styles.checkDetails}
                      onClick={onCheckDetails}
                    >
                      Check Details
                    </button>
                  </div>
                </article>
              ))}
            </div>{" "}
          </>
        )}
        {activeTab === "HOTEL BOOKING" && (
          <div className={styles.list}>
            {reservationData.map((item, index) => (
              <article key={index} className={styles.card}>
                <div className={styles.cardMain}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src={item.image}
                      alt={item.hotel}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>

                  <div className={styles.content}>
                    <div className={styles.cardHeader}>
                      <h2 className={styles.hotelName}>{item.hotel}</h2>
                    </div>

                    <div className={styles.detailsGrid}>
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Check In:</span>
                        <span className={styles.value}>{item.checkIn}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Check out:</span>
                        <span className={styles.value}>{item.checkOut}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Guests:</span>
                        <span className={styles.value}>{item.guests}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.actionsWrapper}>
                  <div className={styles.statusGroup}>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[item.status.toLowerCase()]
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className={styles.idLabel}>ID {item.id}</span>
                  </div>

                  <button
                    className={styles.checkDetails}
                    onClick={onCheckDetails}
                  >
                    Check Details
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
        {activeTab === "FLIGHT BOOKING" && (
          <div className={styles.list}>
            {flightReservationData.map((item, index) => (
              <article key={index} className={styles.card}>
                <div className={styles.cardMain}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src={item.image}
                      alt={item.hotel}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>

                  <div className={styles.content}>
                    <div
                      className={`${styles.cardHeader} ${styles.flightCardHeader}`}
                    >
                      <h2 className={styles.hotelName}>{item.hotel}</h2>
                      <h2 className={styles.hotelName}>{item.fromTo}</h2>
                    </div>

                    <div className={styles.detailsGrid}>
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Departure:</span>
                        <span className={styles.value}>{item.checkIn}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Arrival:</span>
                        <span className={styles.value}>{item.checkOut}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Passengers:</span>
                        <span className={styles.value}>{item.guests}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.actionsWrapper}>
                  <div className={styles.statusGroup}>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[item.status.toLowerCase()]
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className={styles.idLabel}>ID {item.id}</span>
                  </div>

                  <button
                    className={styles.checkDetails}
                    onClick={onCheckDetails}
                  >
                    Check Details
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
        {activeTab === "PACKAGES" && (
          <div className={styles.list}>
            {packageData.map((item, index) => (
              <article key={index} className={styles.card}>
                <div className={styles.cardMain}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src={item.image}
                      alt={item.hotel}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>

                  <div className={styles.content}>
                    <div className={styles.cardHeader}>
                      <h2 className={styles.hotelName}>{item.hotel}</h2>
                    </div>

                    <div className={styles.detailsGrid}>
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Start Date:</span>
                        <span className={styles.value}>{item.checkIn}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.label}>End date:</span>
                        <span className={styles.value}>{item.checkOut}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Travellers:</span>
                        <span className={styles.value}>{item.guests}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.actionsWrapper}>
                  <div className={styles.statusGroup}>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[item.status.toLowerCase()]
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className={styles.idLabel}>ID {item.id}</span>
                  </div>

                  <button
                    className={styles.checkDetails}
                    onClick={onCheckDetails}
                  >
                    Check Details
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
        {activeTab === "TRAVEL INSURANCE" && (
          <div className={styles.list}>
            {travelInsuranceData.map((item, index) => (
              <article key={index} className={styles.card}>
                <div className={styles.cardMain}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src={item.image}
                      alt={item.hotel}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>

                  <div className={styles.content}>
                    <div className={styles.cardHeader}>
                      <h2 className={styles.hotelName}>{item.hotel}</h2>
                    </div>

                    <div className={styles.detailsGrid}>
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Policy Start:</span>
                        <span className={styles.value}>{item.checkIn}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Policy End:</span>
                        <span className={styles.value}>{item.checkOut}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Travellers:</span>
                        <span className={styles.value}>{item.guests}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.actionsWrapper}>
                  <div className={styles.statusGroup}>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[item.status.toLowerCase()]
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className={styles.idLabel}>ID {item.id}</span>
                  </div>

                  <button
                    className={styles.checkDetails}
                    onClick={onCheckDetails}
                  >
                    Check Details
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.mobileView}>
        <ActiveReservations
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onCheckDetails={onCheckDetails}
        />
      </section>
    </>
  );
}

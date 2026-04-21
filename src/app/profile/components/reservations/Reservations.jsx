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
  if (Array.isArray(payload?.package_bookings)) return payload.package_bookings;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.bookings)) return payload.data.bookings;
  if (Array.isArray(payload?.data?.package_bookings)) return payload.data.package_bookings;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
};

const normalizeBookingStatus = (value) => {
  const rawStatus = String(value || "PENDING").toUpperCase();
  if (rawStatus === "TO0" || rawStatus === "T00" || rawStatus === "CONFIRMED") {
    return "CONFIRMED";
  }
  if (rawStatus === "I8" || rawStatus === "INITIATED") {
    return "PENDING";
  }
  return rawStatus;
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

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const buildMediaUrl = (value) => {
  if (!value) return "/images/packages.png";
  if (/^https?:\/\//i.test(value) || value.startsWith("/images/")) return value;
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  return `${baseUrl}${value.startsWith("/") ? value : `/${value}`}`;
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
  const status = normalizeBookingStatus(
    item?.status || item?.booking_status || item?.payment_status
  );

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

const getPackageImage = (item, packageInfo) => {
  const media =
    item?.image ||
    item?.package_image ||
    packageInfo?.image ||
    packageInfo?.thumbnail ||
    packageInfo?.media?.[0]?.package_media?.[0]?.url ||
    packageInfo?.package_media?.[0]?.package_media?.[0]?.url ||
    packageInfo?.package_media_entries?.[0]?.package_media?.[0]?.url;

  return buildMediaUrl(media);
};

const getPackageTravellerSummary = (item) => {
  const passengerSummary = getPassengerSummary(item);
  if (passengerSummary !== "N/A") return passengerSummary;

  const count =
    item?.travellers ||
    item?.travelers ||
    item?.traveller_count ||
    item?.traveler_count ||
    item?.no_of_travellers ||
    item?.total_travellers;

  return count ? `${count} Traveller${Number(count) > 1 ? "s" : ""}` : "N/A";
};

const mapPackageReservation = (item, index) => {
  const packageInfo =
    item?.package ||
    item?.holiday_package ||
    item?.package_details ||
    item?.package_data ||
    item?.data?.package ||
    {};

  return {
    id: String(
      item?.booking_id ||
        item?.booking_reference ||
        item?.reference_id ||
        item?.id ||
        index + 1
    ),
    hotel:
      item?.package_name ||
      item?.title ||
      packageInfo?.package_name ||
      packageInfo?.title ||
      packageInfo?.name ||
      "Package booking",
    checkIn: formatDate(
      item?.start_date_time ||
        item?.start_date ||
        item?.package_start_date ||
        item?.departure_date ||
        packageInfo?.start_date_time ||
        packageInfo?.start_date
    ),
    checkOut: formatDate(
      item?.end_date_time ||
        item?.end_date ||
        item?.package_end_date ||
        item?.return_date ||
        packageInfo?.end_date_time ||
        packageInfo?.end_date
    ),
    guests: getPackageTravellerSummary(item),
    status: normalizeBookingStatus(
      item?.status || item?.booking_status || item?.payment_status
    ),
    image: getPackageImage(item, packageInfo),
  };
};

export default function Reservations({
  onCheckDetails,
  activeTab,
  setActiveTab,
}) {
  const [flightReservationData, setFlightReservationData] = useState([]);
  const [packageReservationData, setPackageReservationData] = useState([]);

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

  useEffect(() => {
    let ignore = false;

    const loadPackageBookings = async () => {
      try {
        const response = await api.get("/bookings", {
          params: {
            type: "package",
            domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337",
            page: 1,
            per_page: 1,
          },
        });

        if (ignore) return;
        setPackageReservationData(
          extractBookingRows(response?.data).map(mapPackageReservation)
        );
      } catch (error) {
        if (!ignore) {
          setPackageReservationData([]);
        }
      }
    };

    loadPackageBookings();

    return () => {
      ignore = true;
    };
  }, []);

  const allTabFlightData = useMemo(() => flightReservationData, [flightReservationData]);
  const allTabPackageData = useMemo(
    () => packageReservationData,
    [packageReservationData]
  );

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
              {allTabPackageData.map((item, index) => (
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
            {packageReservationData.map((item, index) => (
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
          packageReservations={packageReservationData}
        />
      </section>
    </>
  );
}

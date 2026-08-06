"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import styles from "./Reservations.module.css";
import ActiveReservations from "@/features/profile/components/ActiveReservations";
import CorporateReservationCard from "./CorporateReservationCard";
import api from "@/shared/services/axios";
import { useProfile } from "../../context/ProfileContext";
import { resolveAirlineLogo } from "@/features/flights/utils/airlineLogos";

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

const getBookingStatusParam = (filter) => {
  const statusMap = {
    Active: "pending",
    Completed: "approved",
    Canceled: "cancelled",
  };

  return statusMap[filter] || null;
};

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

const buildMediaUrl = (value, fallback = "/images/packages.png") => {
  if (!value) return fallback;
  if (typeof value === "object") {
    return buildMediaUrl(value.url || value.path || value.src, fallback);
  }
  if (/^https?:\/\//i.test(value) || value.startsWith("/images/")) return value;
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  return `${baseUrl}${value.startsWith("/") ? value : `/${value}`}`;
};

const getHotelGuestSummary = (item, hotelBooking = {}) => {
  const guestCount = Number(
    item?.guests_count ??
      item?.guest_count ??
      item?.no_of_guests ??
      hotelBooking?.guests_count ??
      hotelBooking?.guest_count ??
      hotelBooking?.no_of_guests ??
      item?.data?.guests_count ??
      0
  );
  const adults = Number(
    item?.adults ??
      item?.adult_count ??
      item?.no_of_adults ??
      hotelBooking?.adults ??
      hotelBooking?.adult_count ??
      hotelBooking?.no_of_adults ??
      0
  );
  const children = Number(
    item?.children ??
      item?.child_count ??
      item?.no_of_children ??
      hotelBooking?.children ??
      hotelBooking?.child_count ??
      hotelBooking?.no_of_children ??
      0
  );
  const labels = [
    adults ? `${adults} Adult${adults > 1 ? "s" : ""}` : "",
    children ? `${children} Child${children > 1 ? "ren" : ""}` : "",
  ].filter(Boolean);

  if (labels.length) return labels.join(", ");
  if (guestCount) return `${guestCount} Guest${guestCount > 1 ? "s" : ""}`;
  return "N/A";
};

const getHotelImage = (item, hotelInfo = {}, hotelBooking = {}) => {
  const media =
    item?.image ||
    item?.hotel_image ||
    item?.hotel_image?.url ||
    hotelBooking?.hotel_image ||
    hotelBooking?.hotel_image?.url ||
    hotelInfo?.image ||
    hotelInfo?.thumbnail ||
    hotelInfo?.heroImage ||
    hotelInfo?.images?.[0] ||
    hotelInfo?.galleryImages?.[0]?.image ||
    hotelInfo?.media?.[0]?.url;

  return buildMediaUrl(media, "/fallback.png");
};

const mapHotelReservation = (item, index) => {
  const hotelBooking = item?.hotel_booking || item?.hotelBooking || {};
  const hotelInfo =
    hotelBooking?.hotel ||
    item?.hotel ||
    item?.hotel_details ||
    item?.hotelDetail ||
    item?.data?.hotel ||
    {};
  const hotelName =
    hotelBooking?.hotel_name ||
    hotelBooking?.hotelName ||
    item?.hotel_name ||
    item?.hotelName ||
    item?.name ||
    hotelInfo?.name ||
    hotelInfo?.title ||
    "Hotel booking";

  return {
    bookingType: "HOTEL BOOKING",
    detailId: String(item?.id || hotelBooking?.id || ""),
    id: String(
      hotelBooking?.booking_id ||
        item?.booking_id ||
        item?.booking_reference ||
        item?.reference_id ||
        item?.id ||
        index + 1
    ),
    hotel: hotelName,
    hotelName,
    checkIn: formatDate(
      hotelBooking?.check_in ||
        hotelBooking?.checkIn ||
        hotelBooking?.check_in_date ||
        item?.check_in ||
        item?.checkIn ||
        item?.check_in_date ||
        item?.start_date ||
        item?.request?.checkIn
    ),
    checkOut: formatDate(
      hotelBooking?.check_out ||
        hotelBooking?.checkOut ||
        hotelBooking?.check_out_date ||
        item?.check_out ||
        item?.checkOut ||
        item?.check_out_date ||
        item?.end_date ||
        item?.request?.checkOut
    ),
    guests: getHotelGuestSummary(item, hotelBooking),
    status: normalizeBookingStatus(
      item?.status ||
        item?.booking_status ||
        item?.payment_status ||
        hotelBooking?.status ||
        hotelBooking?.booking_status ||
        hotelBooking?.payment_status
    ),
    image: getHotelImage(item, hotelInfo, hotelBooking),
    raw: item,
  };
};

const getAirlineName = (airline, fallback = "Flight") => {
  if (typeof airline === "string") return airline;
  return airline?.name || airline?.airline_name || airline?.label || fallback;
};

const getAirlineCode = (item, flightSummary, airline) =>
  airline?.code ||
  airline?.carrierCode ||
  airline?.carrier_code ||
  flightSummary?.airline_code ||
  flightSummary?.carrier_code ||
  flightSummary?.carrierCode ||
  item?.airline_code ||
  item?.carrier_code ||
  item?.carrierCode ||
  "";

const getFlightLogo = (item, flightSummary, airline) => {
  const logo =
    airline?.logo ||
    airline?.airline_logo ||
    flightSummary?.logo ||
    flightSummary?.airline_logo ||
    flightSummary?.airlineLogo ||
    flightSummary?.carrier?.logo ||
    item?.logo ||
    item?.airline_logo ||
    item?.airlineLogo ||
    item?.flight?.airline?.logo ||
    item?.carrier?.logo;

  return buildMediaUrl(
    resolveAirlineLogo({
      name: getAirlineName(airline, flightSummary?.airline_name || item?.airline_name),
      code: getAirlineCode(item, flightSummary, airline),
      logo,
    }),
    "/images/dummyFlightlogo.png",
  );
};

const getPassengerList = (item) => {
  const flightBooking = item?.flight_booking || item?.flightBooking || {};
  const packageBooking = item?.package_booking || item?.packageBooking || {};
  const passengers =
    item?.passenger_details ||
    item?.user_passengers ||
    item?.passengers ||
    item?.data?.passengers ||
    flightBooking?.passenger_details ||
    flightBooking?.user_passengers ||
    packageBooking?.passenger_details ||
    packageBooking?.user_passengers ||
    packageBooking?.passengers ||
    item?.raw?.Pax ||
    [];

  return Array.isArray(passengers) ? passengers : [];
};

const getPassengerSummary = (item) => {
  const passengers = getPassengerList(item);

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
  const flightBooking = item?.flight_booking || item?.flightBooking || {};
  const flightSummary =
    flightBooking?.flight_summary ||
    flightBooking?.flightSummary ||
    item?.flight_summary ||
    item?.flightSummary ||
    item?.flight ||
    {};
  const airlineSource =
    flightSummary?.airline ||
    item?.airline ||
    item?.flight?.airline ||
    item?.carrier ||
    "Flight";
  const airline = getAirlineName(airlineSource, flightSummary?.airline_name || "Flight");
  const flightNo = String(
    flightSummary?.flight_no ||
      flightSummary?.flightNo ||
      flightSummary?.flight_number ||
      item?.flight_no ||
      item?.flightNo ||
      item?.flight_number ||
      item?.raw?.FlightNo ||
      ""
  ).trim();
  const fromCode = String(
    flightSummary?.origin ||
      flightSummary?.from ||
      flightSummary?.from_code ||
      item?.from ||
      item?.origin ||
      item?.from_code ||
      item?.raw?.From ||
      ""
  ).toUpperCase();
  const toCode = String(
    flightSummary?.destination ||
      flightSummary?.to ||
      flightSummary?.to_code ||
      item?.to ||
      item?.destination ||
      item?.to_code ||
      item?.raw?.To ||
      ""
  ).toUpperCase();
  const status = normalizeBookingStatus(
    item?.status ||
      item?.booking_status ||
      item?.payment_status ||
      flightBooking?.booking_status ||
      flightBooking?.payment_status
  );

  return {
    bookingType: "FLIGHT BOOKING",
    id: String(
      flightBooking?.booking_id ||
        item?.booking_id ||
        item?.id ||
        item?.reference_id ||
        index + 1
    ),
    hotel: flightNo ? `${airline} (${flightNo})` : airline,
    fromTo: `${fromCode || "N/A"} - ${toCode || "N/A"}`,
    checkIn: formatDateTime(
      flightSummary?.departure ||
        flightSummary?.depart_at ||
        item?.departure ||
        item?.depart_at ||
        item?.onward_date
    ),
    checkOut: formatDateTime(
      flightSummary?.arrival ||
        flightSummary?.arrive_at ||
        item?.arrival ||
        item?.arrive_at ||
        item?.return_date
    ),
    guests: getPassengerSummary(item),
    status,
    image: getFlightLogo(item, flightSummary, airlineSource),
  };
};

const getPackageImage = (item, packageInfo) => {
  const packageBooking = item?.package_booking || item?.packageBooking || {};
  const media =
    item?.image ||
    item?.package_image ||
    item?.package_image?.url ||
    packageBooking?.package_image ||
    packageBooking?.package_image?.url ||
    packageInfo?.image ||
    packageInfo?.thumbnail ||
    packageInfo?.media?.[0]?.package_media?.[0]?.url ||
    packageInfo?.package_media?.[0]?.package_media?.[0]?.url ||
    packageInfo?.package_media_entries?.[0]?.package_media?.[0]?.url;

  return buildMediaUrl(media);
};

const getPackageTravellerSummary = (item) => {
  const packageBooking = item?.package_booking || item?.packageBooking || {};
  const passengers = getPassengerList(item);

  if (passengers.length > 0) {
    return `${passengers.length} Traveller${passengers.length > 1 ? "s" : ""}`;
  }

  const count =
    item?.travellers ||
    item?.travelers ||
    item?.traveller_count ||
    item?.traveler_count ||
    item?.no_of_travellers ||
    item?.total_travellers ||
    packageBooking?.travellers ||
    packageBooking?.travelers ||
    packageBooking?.passenger_count;

  return count ? `${count} Traveller${Number(count) > 1 ? "s" : ""}` : "N/A";
};

const mapPackageReservation = (item, index) => {
  const packageBooking = item?.package_booking || item?.packageBooking || {};
  const packageInfo =
    packageBooking?.package ||
    packageBooking?.holiday_package ||
    item?.package ||
    item?.holiday_package ||
    item?.package_details ||
    item?.package_data ||
    item?.data?.package ||
    {};
  const packageName =
    packageBooking?.package_title ||
    packageBooking?.package_name ||
    item?.package_name ||
    item?.title ||
    packageInfo?.package_name ||
    packageInfo?.title ||
    packageInfo?.name ||
    "Package booking";
  const passengers = getPassengerList(item);
  const passengerCount =
    passengers.length ||
    Number(
      packageBooking?.passenger_count ||
        packageBooking?.travellers ||
        item?.passenger_count ||
        item?.travellers ||
        0,
    ) ||
    0;

  return {
    bookingType: "PACKAGES",
    id: String(
      packageBooking?.booking_id ||
        item?.booking_id ||
        item?.booking_reference ||
        item?.reference_id ||
        item?.id ||
        index + 1
    ),
    hotel: packageName,
    packageName,
    checkIn: formatDateTime(
      packageBooking?.start_date_time ||
        packageBooking?.start_date ||
        item?.start_date_time ||
        item?.start_date ||
        item?.package_start_date ||
        item?.departure_date ||
        packageInfo?.start_date_time ||
        packageInfo?.start_date
    ),
    checkOut: formatDateTime(
      packageBooking?.end_date_time ||
        packageBooking?.end_date ||
        item?.end_date_time ||
        item?.end_date ||
        item?.package_end_date ||
        item?.return_date ||
        packageInfo?.end_date_time ||
        packageInfo?.end_date
    ),
    guests: getPackageTravellerSummary(item),
    status: normalizeBookingStatus(
      item?.status ||
        item?.booking_status ||
        item?.payment_status ||
        packageBooking?.status ||
        packageBooking?.booking_status ||
        packageBooking?.payment_status
    ),
    image: getPackageImage(item, packageInfo),
    passengers,
    passengerCount,
    raw: item,
  };
};

export default function Reservations({
  onCheckDetails,
  activeTab,
  setActiveTab,
}) {
  const [hotelReservationData, setHotelReservationData] = useState([]);
  const [flightReservationData, setFlightReservationData] = useState([]);
  const [packageReservationData, setPackageReservationData] = useState([]);
  const [hotelBookingsLoading, setHotelBookingsLoading] = useState(true);
  const [flightBookingsLoading, setFlightBookingsLoading] = useState(true);
  const [packageBookingsLoading, setPackageBookingsLoading] = useState(true);
  const [hotelBookingsError, setHotelBookingsError] = useState("");
  const [flightBookingsError, setFlightBookingsError] = useState("");
  const [packageBookingsError, setPackageBookingsError] = useState("");
  const { tripFilter } = useProfile();
  const bookingStatus = getBookingStatusParam(tripFilter);

  useEffect(() => {
    let ignore = false;
    setHotelBookingsLoading(true);
    setHotelBookingsError("");

    const loadHotelBookings = async () => {
      try {
        const response = await api.get("/bookings", {
          params: {
            type: "hotel",
            domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337",
            page: 1,
            per_page: 20,
            ...(bookingStatus ? { status: bookingStatus } : {}),
          },
        });

        if (ignore) return;

        setHotelReservationData(
          extractBookingRows(response?.data).map(mapHotelReservation)
        );
      } catch (error) {
        if (!ignore) {
          setHotelReservationData([]);
          setHotelBookingsError("Unable to load hotel bookings.");
        }
      } finally {
        if (!ignore) setHotelBookingsLoading(false);
      }
    };

    loadHotelBookings();

    return () => {
      ignore = true;
    };
  }, [bookingStatus]);

  useEffect(() => {
    let ignore = false;
    setFlightBookingsLoading(true);
    setFlightBookingsError("");

    const loadFlightBookings = async () => {
      try {
        const response = await api.get("/bookings", {
          params: {
            type: "flight",
            domain: process.env.NEXT_PUBLIC_DOMAIN,
            page: 1,
            per_page: 20,
            ...(bookingStatus ? { status: bookingStatus } : {}),
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
          setFlightBookingsError("Unable to load flight bookings.");
        }
      } finally {
        if (!ignore) setFlightBookingsLoading(false);
      }
    };

    loadFlightBookings();

    return () => {
      ignore = true;
    };
  }, [bookingStatus]);

  useEffect(() => {
    let ignore = false;
    setPackageBookingsLoading(true);
    setPackageBookingsError("");

    const loadPackageBookings = async () => {
      try {
        const response = await api.get("/bookings", {
          params: {
            type: "package",
            domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337",
            page: 1,
            per_page: 20,
            ...(bookingStatus ? { status: bookingStatus } : {}),
          },
        });

        if (ignore) return;
        setPackageReservationData(
          extractBookingRows(response?.data).map(mapPackageReservation)
        );
      } catch (error) {
        if (!ignore) {
          setPackageReservationData([]);
          setPackageBookingsError("Unable to load package bookings.");
        }
      } finally {
        if (!ignore) setPackageBookingsLoading(false);
      }
    };

    loadPackageBookings();

    return () => {
      ignore = true;
    };
  }, [bookingStatus]);

  const allTabHotelData = useMemo(() => hotelReservationData, [hotelReservationData]);
  const allTabFlightData = useMemo(() => flightReservationData, [flightReservationData]);
  const allTabPackageData = useMemo(
    () => packageReservationData,
    [packageReservationData]
  );
  const activeTabLoading =
    activeTab === "ALL"
      ? hotelBookingsLoading || flightBookingsLoading || packageBookingsLoading
      : activeTab === "HOTEL BOOKING"
        ? hotelBookingsLoading
        : activeTab === "FLIGHT BOOKING"
          ? flightBookingsLoading
          : activeTab === "PACKAGES"
            ? packageBookingsLoading
            : false;
  const activeTabError =
    activeTab === "ALL"
      ? hotelBookingsError || flightBookingsError || packageBookingsError
      : activeTab === "HOTEL BOOKING"
        ? hotelBookingsError
        : activeTab === "FLIGHT BOOKING"
          ? flightBookingsError
          : activeTab === "PACKAGES"
            ? packageBookingsError
            : "";

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

        {activeTabLoading && (
          <div className={styles.bookingsLoadingState} role="status" aria-live="polite">
            <span className={styles.bookingsSpinner} aria-hidden="true" />
            <h2>Loading your bookings</h2>
            <p>Please wait while we retrieve your latest reservations.</p>
          </div>
        )}

        {!activeTabLoading && activeTabError && (
          <div className={styles.bookingsErrorState} role="alert">
            {activeTabError}
          </div>
        )}

        {activeTab === "ALL" && !activeTabLoading && !activeTabError && (
          <>
            {" "}
            <div className={styles.list}>
              {allTabHotelData.map((item, index) => (
                <article key={`hotel-${item.id}-${index}`} className={styles.card}>
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
                      onClick={() => onCheckDetails(item)}
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
                        alt={item.packageName || item.hotel}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>

                    <div className={styles.content}>
                      <div className={styles.cardHeader}>
                        <h2 className={styles.hotelName}>
                          {item.packageName || item.hotel}
                        </h2>
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
                      onClick={() => onCheckDetails(item)}
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
        {activeTab === "HOTEL BOOKING" && !activeTabLoading && !activeTabError && (
          <div className={styles.list}>
            {!hotelReservationData.length && (
              <div className={styles.emptyBookingState}>
                <div className={styles.emptyBookingIllustration}>
                  <Image
                    src="/images/empty_trip.png"
                    alt=""
                    width={150}
                    height={150}
                  />
                </div>
                <h2>No hotel bookings found</h2>
                <p>
                  You don&apos;t have any hotel reservations yet. A comfortable
                  stay is waiting whenever you&apos;re ready to travel.
                </p>
              </div>
            )}
            {hotelReservationData.map((item, index) => (
              <article key={`hotel-${item.id}-${index}`} className={styles.card}>
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
                    onClick={() => onCheckDetails(item)}
                  >
                    Check Details
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
        {activeTab === "FLIGHT BOOKING" && !activeTabLoading && !activeTabError && (
          <div className={styles.list}>
            {!flightReservationData.length && (
              <div className={styles.emptyBookingState}>
                <div className={styles.emptyBookingIllustration}>
                  <Image
                    src="/images/empty_trip.png"
                    alt=""
                    width={150}
                    height={150}
                  />
                </div>
                <h2>No flight bookings found</h2>
                <p>
                  You don&apos;t have any flight reservations yet. Your next
                  journey can start whenever you&apos;re ready.
                </p>
              </div>
            )}
            {flightReservationData.map((item, index) => (
              <article key={index} className={styles.card}>
                <div className={styles.cardMain}>
                  <div className={styles.imageWrapper}>
	                    <img
	                      src={item.image}
	                      alt={item.hotel}
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
                    onClick={() => onCheckDetails(item)}
                  >
                    Check Details
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
        {activeTab === "PACKAGES" && !activeTabLoading && !activeTabError && (
          <div className={styles.list}>
            {!packageReservationData.length && (
              <div className={styles.emptyBookingState}>
                <div className={styles.emptyBookingIllustration}>
                  <Image
                    src="/images/empty_trip.png"
                    alt=""
                    width={150}
                    height={150}
                  />
                </div>
                <h2>No package bookings found</h2>
                <p>
                  You haven&apos;t booked a holiday package yet. Explore a new
                  destination and make your next trip unforgettable.
                </p>
              </div>
            )}
            {packageReservationData.map((item, index) => (
              <article key={index} className={styles.card}>
                <div className={styles.cardMain}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src={item.image}
                      alt={item.packageName || item.hotel}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>

                  <div className={styles.content}>
                    <div className={styles.cardHeader}>
                      <h2 className={styles.hotelName}>
                        {item.packageName || item.hotel}
                      </h2>
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
                    onClick={() => onCheckDetails(item)}
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
          hotelReservations={hotelReservationData}
          flightReservations={flightReservationData}
          packageReservations={packageReservationData}
        />
      </section>
    </>
  );
}

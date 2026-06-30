"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import {
  Car,
  ChevronDown,
  MapPin,
  Plane,
  Hotel,
} from "lucide-react";
import {
  GoogleMap,
  LoadScriptNext,
  OverlayView,
  Polyline,
} from "@react-google-maps/api";
import styles from "./DailyJourneyItinerary.module.css";
import HotelSwapModal from "./HotelSwapModal";
import FlightSwapModal from "./FlightSwapModal";

const FALLBACK_DAYS = [
  {
    id: "fallback-1",
    day_number: 1,
    title: "Jaipur | Design Your Day",
    location: { city: "Jaipur" },
    description:
      "Arrive to a warm welcome and begin discovering Jaipur's royal landmarks, colorful bazaars, and celebrated local cuisine.",
  },
  {
    id: "fallback-2",
    day_number: 2,
    title: "Agra | Unveil The Wonders",
    location: { city: "Agra" },
    description:
      "Travel to Agra and witness the timeless beauty of the Taj Mahal before enjoying a thoughtfully curated evening.",
  },
  {
    id: "fallback-3",
    day_number: 3,
    title: "Delhi | Explore The Capital",
    location: { city: "Delhi" },
    description:
      "Journey through Delhi, where ancient monuments, lively neighborhoods, and contemporary culture meet.",
  },
];

const FALLBACK_IMAGES = [
  "/images/jaipur.png",
  "/images/day1.png",
  "/images/day2.png",
];

const stripHtml = (value = "") =>
  String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

const toMediaUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}${path}`;
};

const getImageUrl = (image) => {
  const source = Array.isArray(image) ? image[0] : image;
  const path =
    source?.formats?.medium?.url ||
    source?.formats?.small?.url ||
    source?.formats?.thumbnail?.url ||
    source?.url;

  return toMediaUrl(path);
};

const getActivities = (day) => {
  const activities = Array.isArray(day?.package_activities)
    ? day.package_activities
    : day?.builder_data?.activities;

  return Array.isArray(activities)
    ? activities.filter((activity) => activity?.enabled !== false)
    : [];
};

const getTransports = (day) =>
  Array.isArray(day?.builder_data?.transports)
    ? day.builder_data.transports.filter((item) => item?.enabled !== false)
    : [];

const getFlightTransport = (day) =>
  getTransports(day).find((item) => item?.mode === "flight") || null;

const getTransferTransport = (day) =>
  getTransports(day).find((item) => item?.mode !== "flight") || null;

const getHotel = (day) =>
  day?.hotel ||
  day?.available_hotels?.[0] ||
  day?.builder_data?.hotel ||
  null;

const getDayCity = (day) =>
  day?.location?.city ||
  day?.location?.name ||
  getHotel(day)?.city ||
  day?.city ||
  `Day ${day?.day_number || ""}`;

const CITY_COORDINATES = {
  agra: { lat: 27.1767, lng: 78.0081 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  delhi: { lat: 28.6139, lng: 77.209 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  jodhpur: { lat: 26.2389, lng: 73.0243 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  narlai: { lat: 25.3416, lng: 73.5794 },
  "new delhi": { lat: 28.6139, lng: 77.209 },
  phuket: { lat: 7.8804, lng: 98.3923 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  udaipur: { lat: 24.5854, lng: 73.7125 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
};

const normalizeCityName = (value = "") =>
  stripHtml(value).toLowerCase().replace(/\s+/g, " ").trim();

const toCoordinate = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const getDayCoordinates = (day) => {
  const hotel = getHotel(day);
  const location = day?.location || {};
  const candidatePairs = [
    [location.latitude, location.longitude],
    [location.lat, location.lng],
    [day?.latitude, day?.longitude],
    [day?.lat, day?.lng],
    [hotel?.latitude, hotel?.longitude],
    [hotel?.lat, hotel?.lng],
  ];

  for (const [latValue, lngValue] of candidatePairs) {
    const lat = toCoordinate(latValue);
    const lng = toCoordinate(lngValue);
    if (lat !== null && lng !== null) return { lat, lng };
  }

  return CITY_COORDINATES[normalizeCityName(getDayCity(day))] || null;
};

const getDayImage = (day, index) => {
  const activity = getActivities(day)[0];
  const hotel = getHotel(day);

  return (
    getImageUrl(activity?.images) ||
    getImageUrl(day?.main_image) ||
    getImageUrl(hotel?.main_image) ||
    FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
  );
};

const getMeals = (day) => {
  const selectedMeals = day?.builder_data?.meals?.selected;
  if (Array.isArray(selectedMeals) && selectedMeals.length) {
    return selectedMeals.map((meal) =>
      typeof meal === "string" ? meal : meal?.name || meal?.title,
    ).filter(Boolean);
  }

  if (Array.isArray(day?.package_itinerarie_meals)) {
    return day.package_itinerarie_meals.map((meal) =>
      typeof meal === "string" ? meal : meal?.name || meal?.title,
    ).filter(Boolean);
  }

  return [];
};

const getIncludedItems = (day) => {
  const activities = getActivities(day)
    .map((activity) => activity?.name || activity?.description)
    .filter(Boolean);
  const transfers = Array.isArray(day?.builder_data?.transports)
    ? day.builder_data.transports
        .filter((item) => item?.enabled !== false)
        .map((item) => {
          if (item?.mode === "flight") return "International flight";
          return (
            item?.title ||
            item?.vehicle_type ||
            [item?.pickup_location, item?.drop_location]
              .filter(Boolean)
              .join(" to ")
          );
        })
        .filter(Boolean)
    : [];

  const hotel = getHotel(day);
  const hotelItem = hotel?.name ? [`Accommodation at ${hotel.name}`] : [];
  const items = [...transfers, ...activities, ...hotelItem];

  return items.length
    ? items.slice(0, 4)
    : [
        "Private transfer with local assistance",
        "Curated sightseeing with an expert guide",
        "Comfortable overnight accommodation",
      ];
};

const getTransportText = (transport, keys, fallback = "") => {
  const value = keys.map((key) => transport?.[key]).find(Boolean);
  return stripHtml(value) || fallback;
};

const FlightDetail = ({ transport, city }) => {
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  const from =
    getTransportText(transport, ["from", "origin", "pickup_location"]) ||
    city;
  const to =
    getTransportText(transport, ["to", "destination", "drop_location"]) ||
    "Toronto";
  const airline = getTransportText(
    transport,
    ["airline", "airline_name", "carrier"],
    "Indigo",
  );
  const flightNumber = getTransportText(
    transport,
    ["flight_number", "flightNo", "number"],
    "6E - 541",
  );
  const departTime = getTransportText(
    transport,
    ["departure_time", "depart_time"],
    "06:45",
  );
  const arriveTime = getTransportText(
    transport,
    ["arrival_time", "arrive_time"],
    "08:00",
  );
  const duration = getTransportText(
    transport,
    ["duration", "travel_time"],
    "01 h 50 m",
  );
  const stops = getTransportText(transport, ["stops", "stop"], "Non Stop");
  const departAirport = getTransportText(
    transport,
    ["departure_airport", "from_airport", "origin_airport"],
    "Jakarta (CGK)",
  );
  const arriveAirport = getTransportText(
    transport,
    ["arrival_airport", "to_airport", "destination_airport"],
    "Singapore (SIN)",
  );

  return (
    <div>
      <div className={styles.flightRouteRow}>
        <span>
          {from} <span aria-hidden="true">→</span> {to}
        </span>
        <button
          type="button"
          className={styles.swapButton}
          onClick={() => setIsFlightModalOpen(true)}
          aria-label="Swap flight"
        >
          <span aria-hidden="true">
            <img src="/images/swap.svg" alt="" />
          </span>
          Swap Flight
        </button>
      </div>

      <div className={styles.flightCard}>
        <div className={styles.flightAirline}>
          <img
            src="/images/flightCompanyLogos/indigo.png"
            alt=""
          />
          <span>
            <strong>{airline}</strong>
            <small>{flightNumber}</small>
          </span>
        </div>

        <div className={styles.flightTimeline}>
          <div className={styles.flightEndpoint}>
            <strong>{departTime}</strong>
            <small>{departAirport}</small>
          </div>
          <span className={styles.flightPath}>
            <span />
            <Plane size={13} />
            <span />
            <small>
              {duration} <b>•</b> {stops}
            </small>
          </span>
          <div className={styles.flightEndpoint}>
            <strong>{arriveTime}</strong>
            <small>{arriveAirport}</small>
          </div>
        </div>
      </div>

      <FlightSwapModal
        isOpen={isFlightModalOpen}
        onClose={() => setIsFlightModalOpen(false)}
        transport={transport}
        city={city}
      />
    </div>
  );
};

const TransferDetail = ({ transport }) => {
  const title = getTransportText(
    transport,
    ["title", "name"],
    "Private Chauffeur Transfer",
  );
  const vehicle = getTransportText(
    transport,
    ["vehicle_class", "vehicle_type", "vehicle"],
    "Mercedes-Benz S-Class Luxury Sedan",
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "52px 1fr",
        gap: 14,
        padding: 14,
        border: "1px solid #E7E7EC",
        background: "#FAFAFB",
      }}
    >
      <span
        style={{
          width: 42,
          height: 42,
          display: "grid",
          placeItems: "center",
          border: "1px solid #E1E1E6",
          background: "#fff",
          color: "#616145",
        }}
      >
        <Car size={20} />
      </span>
      <span style={{ display: "grid", gap: 6 }}>
        <small
          style={{
            color: "#1A1A1A",
            fontWeight: 500,
            textTransform: "uppercase",
          }}
        >
          Transfer log
        </small>
        <strong style={{ color: "#000033", fontSize: 14 }}>{title}</strong>
        <span>
          <strong style={{ color: "#8A9AB0", textTransform: "uppercase" }}>
            Vehicle class:
          </strong>{" "}
          <em>{vehicle}</em>
        </span>
      </span>
    </div>
  );
};

const DetailRow = ({ label, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div className={styles.detailRow}>
      <button
        type="button"
        className={styles.detailButton}
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span>{label}</span>
        <ChevronDown
          size={15}
          className={isOpen ? styles.chevronOpen : styles.chevron}
        />
      </button>
      <div
        id={contentId}
        className={`${styles.detailContent} ${
          !isOpen ? styles.detailContentCollapsed : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
};

const mapContainerStyle = { width: "100%", height: "100%" };

const RouteMap = ({ days }) => {
  const [map, setMap] = useState(null);
  const points = days;
  const apiKey = process.env.NEXT_PUBLIC_MAP_KEY;
  const routePoints = useMemo(
    () =>
      points
        .map((day, index) => ({
          day,
          index,
          city: getDayCity(day),
          position: getDayCoordinates(day),
        }))
        .filter((point) => point.position),
    [points],
  );
  const mapCenter = routePoints[0]?.position || CITY_COORDINATES.delhi;

  useEffect(() => {
    if (!map || !routePoints.length || !window.google?.maps) return;

    const bounds = new window.google.maps.LatLngBounds();
    routePoints.forEach((point) => bounds.extend(point.position));

    if (routePoints.length === 1) {
      map.setCenter(routePoints[0].position);
      map.setZoom(11);
      return;
    }

    map.fitBounds(bounds, 44);
  }, [map, routePoints]);

  const fallbackQuery =
    routePoints.map((point) => point.city).filter(Boolean).join(" to ") ||
    "India tour route";
  const fallbackMapUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    fallbackQuery,
  )}&output=embed`;

  return (
    <aside className={styles.mapCard}>
      <div className={styles.mapHeader}>
        <p>Interactive route map</p>
      </div>

      <div className={styles.mapCanvas}>
        {apiKey ? (
          <LoadScriptNext googleMapsApiKey={apiKey}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={7}
              onLoad={setMap}
              options={{
                clickableIcons: false,
                fullscreenControl: false,
                mapTypeControl: false,
                streetViewControl: false,
                gestureHandling: "greedy",
              }}
            >
              {routePoints.length > 1 && (
                <Polyline
                  path={routePoints.map((point) => point.position)}
                  options={{
                    strokeColor: "#000033",
                    strokeOpacity: 0.85,
                    strokeWeight: 2,
                    icons: [
                      {
                        icon: {
                          path: "M 0,-1 0,1",
                          strokeOpacity: 1,
                          scale: 3,
                        },
                        offset: "0",
                        repeat: "14px",
                      },
                    ],
                  }}
                />
              )}
              {routePoints.map((point) => (
                <OverlayView
                  key={point.day?.id || `route-${point.index}`}
                  position={point.position}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <a
                    className={styles.mapMarker}
                    href={`#itinerary-day-${point.index + 1}`}
                    style={{ transform: "translate(-50%, -100%)" }}
                    aria-label={`Jump to day ${
                      point.day?.day_number || point.index + 1
                    } in ${point.city}`}
                  >
                    <span>{point.day?.day_number || point.index + 1}</span>
                    <strong>{point.city}</strong>
                  </a>
                </OverlayView>
              ))}
            </GoogleMap>
          </LoadScriptNext>
        ) : (
          <iframe
            className={styles.mapFrame}
            title="Tour route Google map"
            src={fallbackMapUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </div>

      <p className={styles.mapHint}>
        Click map markers to instantly jump to that day's itinerary detail.
      </p>
    </aside>
  );
};

const DayCard = ({ day, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
  const hotel = getHotel(day);
  const meals = getMeals(day);
  const includedItems = getIncludedItems(day);
  const flightTransport = getFlightTransport(day);
  const transferTransport = getTransferTransport(day);
  const rating = Number(hotel?.star_rating || 0);
  const city = getDayCity(day);
  const dayImage = getDayImage(day, index);
  const cardBodyId = `itinerary-day-${index + 1}-body`;

  const airline = getTransportText(
    flightTransport,
    ["airline", "airline_name", "carrier"],
    "Indigo",
  );
  const flightNumber = getTransportText(
    flightTransport,
    ["flight_number", "flightNo", "number"],
    "6E - 541",
  );
  const hotelName = hotel?.name || "Curated Luxury Hotel";

  return (
    <article className={styles.dayCard} id={`itinerary-day-${index + 1}`}>
      <header
        className={`${styles.cardHeader} ${
          !isOpen ? styles.cardHeaderCollapsed : ""
        }`}
      >
        <div className={styles.headerContent}>
          <div className={styles.dayMeta}>
            <div className={styles.dayMetaLeft}>
              <span className={styles.dayBadge}>
                Day {day?.day_number || index + 1}
              </span>
              <span className={styles.location}>
                <MapPin size={12} />
                {city}
              </span>
            </div>
            {(flightTransport || hotel) && (
              <div className={styles.dayMetaRight}>
                {flightTransport && (
                  <span className={styles.metaInfo}>
                    <Plane size={12} />
                    Flight {airline}-{flightNumber}
                  </span>
                )}
                {hotel && (
                  <span className={styles.metaInfo}>
                    <Hotel size={12} />
                    Hotel {hotelName}
                  </span>
                )}
              </div>
            )}
          </div>
          <h3>{day?.title || `${city} | Discover The Destination`}</h3>
          <p>
            {day?.subtitle ||
              day?.short_description ||
              "Handpicked landmarks, local culture and memorable experiences"}
          </p>
        </div>
        <button
          type="button"
          className={`${styles.cardChevron} ${
            isOpen ? styles.cardChevronOpen : ""
          }`}
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-controls={cardBodyId}
          aria-label={`${isOpen ? "Collapse" : "Expand"} day ${
            day?.day_number || index + 1
          } itinerary`}
        >
          <ChevronDown size={16} />
        </button>
      </header>

      <div
        id={cardBodyId}
        className={`${styles.cardBody} ${
          !isOpen ? styles.cardBodyCollapsed : ""
        }`}
      >
        <div className={styles.dayCopy}>
          <p className={styles.description}>
            {stripHtml(day?.description) ||
              "Enjoy a thoughtfully planned day combining iconic sights, local stories, and time to explore at your own pace."}
          </p>

          <DetailRow label="International Flight" defaultOpen>
            <FlightDetail transport={flightTransport} city={city} />
          </DetailRow>
          <DetailRow label="Private Transfer" defaultOpen>
            <TransferDetail transport={transferTransport} />
          </DetailRow>
          <DetailRow label="Included Experiences" defaultOpen>
            <ul className={styles.inclusionList}>
              {includedItems.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>
                  <span aria-hidden="true">
                    <img src="/images/check.svg" alt="" />
                  </span>
                  {stripHtml(item)}
                </li>
              ))}
            </ul>
          </DetailRow>

          {/* <div className={styles.leisureBox}>
            <div>
              <strong>Leisure window active</strong>
              <span>Add a personal experience to your free time.</span>
            </div>
            <button type="button" className={styles.addActivityButton}>
              + Add activity
            </button>
          </div> */}

          <div className={styles.hotelCard}>
            <img src={dayImage} alt="" />
            <div>
              <span>{[hotel?.city, hotel?.country].filter(Boolean).join(" • ") || city}</span>
              <strong>{hotel?.name || "Curated Luxury Hotel"}</strong>
              <p>
                {stripHtml(hotel?.description) ||
                  "A comfortable stay selected for its location and service."}
              </p>
              {/* <button type="button">View hotel options</button> */}
              <button
                type="button"
                className={styles.swapButton}
                onClick={() => setIsHotelModalOpen(true)}
                aria-label="Swap hotel"
              >
                <span aria-hidden="true">
                  <img src="/images/swap.svg" alt="" />
                </span>
                Swap Hotel
              </button>
            </div>
            <div className={styles.rating} aria-label={`${rating || 4} star hotel`}>
              {Array.from({ length: 5 }, (_, starIndex) => (
                <img
                  key={starIndex}
                  src="/images/star.svg"
                  alt=""
                  style={{
                    width: 13,
                    height: 13,
                    opacity: starIndex < (rating || 4) ? 1 : 0.3,
                    filter:
                      starIndex < (rating || 4) ? "none" : "grayscale(1)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <aside className={styles.dayAside}>
          <img
            className={styles.dayImage}
            src={dayImage}
            alt={`${city} itinerary`}
          />
          <div className={styles.mealBox}>
            <div className={styles.mealTitle}>
              {/* <Utensils size={14} /> */}
              <strong>Meals included</strong>
            </div>
            <div className={styles.mealTags}>
              {(meals.length ? meals : ["Breakfast", "Dinner"]).map((meal) => (
                <span key={meal}>{meal}</span>
              ))}
            </div>
            <small>Regional tastes and restaurant water choices included.</small>
          </div>
          <div className={styles.flightNote}>
            <Plane size={14} />
            <span>Transfers arranged around your itinerary.</span>
          </div>
        </aside>
      </div>
      <HotelSwapModal
        isOpen={isHotelModalOpen}
        onClose={() => setIsHotelModalOpen(false)}
        currentHotel={hotel}
        city={city}
        dayImage={dayImage}
      />
    </article>
  );
};

const DailyJourneyItinerary = ({ data }) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const days = useMemo(() => {
    const itinerary = Array.isArray(data?.package_itinerarie)
      ? [...data.package_itinerarie].sort(
          (a, b) => (a?.day_number ?? 0) - (b?.day_number ?? 0),
        )
      : [];

    return itinerary.length ? itinerary : FALLBACK_DAYS;
  }, [data]);

  useEffect(() => {
    const dayElements = days
      .map((_, index) => document.getElementById(`itinerary-day-${index + 1}`))
      .filter(Boolean);

    if (!dayElements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visibleEntry) return;

        const index = dayElements.indexOf(visibleEntry.target);
        if (index !== -1) {
          setActiveDayIndex(index);
        }
      },
      {
        rootMargin: "-28% 0px -55% 0px",
        threshold: [0, 0.15, 0.35, 0.6],
      },
    );

    dayElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [days]);

  return (
    <section className={styles.section} aria-label="Daily journey itinerary">
      <div className={styles.headingSticky} id="day-itinerary">
        <div className={styles.itineraryHeading}>
          <p className={styles.headingEyebrow}>Curated experience</p>
          <h2>Daily Journey Itinerary</h2>
          <p className={styles.headingDescription}>
            Toggle specific days to read granular guides and highlight
            accommodation details
          </p>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.stickyColumn}>
          <RouteMap days={days} activeDayIndex={activeDayIndex} />
        </div>
        <div className={styles.cards}>
          {days.map((day, index) => (
            <DayCard key={day?.id || `day-${index + 1}`} day={day} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DailyJourneyItinerary;

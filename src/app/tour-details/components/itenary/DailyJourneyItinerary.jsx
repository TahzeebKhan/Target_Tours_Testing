"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import {
  Car,
  Check,
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Plane,
  Utensils,
} from "lucide-react";
import styles from "./DailyJourneyItinerary.module.css";

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

const HOTEL_SWAP_OPTIONS = [
  {
    name: "Banyan Cove Beach Resort - Deluxe Ocean View",
    image: "/images/hotel1.png",
    price: "₹ 6,945",
    oldPrice: "₹66,945",
    rating: "5.0",
    reviews: "1,260 reviews",
  },
  {
    name: "Banyan Cove Beach Resort - Deluxe Ocean View",
    image: "/images/hotelImage1.png",
    price: "₹ 3,945",
    oldPrice: "₹66,945",
    rating: "5.0",
    reviews: "1,260 reviews",
  },
  {
    name: "Banyan Cove Beach Resort - Deluxe Ocean View",
    image: "/images/hotelImage2.png",
    price: "₹ 9,945",
    oldPrice: "₹66,945",
    rating: "5.0",
    reviews: "1,260 reviews",
  },
  {
    name: "Banyan Cove Beach Resort - Deluxe Ocean View",
    image: "/images/hotelImage3.png",
    price: "₹ 2,945",
    oldPrice: "₹66,945",
    rating: "5.0",
    reviews: "1,260 reviews",
  },
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
        <button type="button" className={styles.swapButton} aria-label="Swap flight">
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

const RouteMap = ({ days }) => {
  const points = days.slice(0, 8);

  return (
    <aside className={styles.mapCard}>
      <div className={styles.mapHeader}>
        <p>Interactive route map</p>
        <span>
          Active: <strong>{getDayCity(points[0])}</strong> (Day 1)
        </span>
      </div>

      <div className={styles.mapCanvas}>
        <svg
          viewBox="0 0 360 430"
          className={styles.routeSvg}
          role="img"
          aria-label="Tour route"
        >
          <path
            className={styles.countryShape}
            d="M116 39c32 18 48 1 73 13 31 15 42 42 67 60 32 24 43 64 24 94-15 25-6 58-26 78-23 24-34 69-69 97-22 18-43-2-54-29-11-29-37-40-47-71-10-30 11-48 5-75-6-31-21-55-12-87 8-29 10-62 39-80Z"
          />
          {points.length > 1 && (
            <polyline
              className={styles.routeLine}
              points={points
                .map((_, index) => {
                  const x = 118 + ((index * 53) % 140);
                  const y = 88 + index * (260 / (points.length - 1));
                  return `${x},${y}`;
                })
                .join(" ")}
            />
          )}
          {points.map((day, index) => {
            const x = 118 + ((index * 53) % 140);
            const y =
              88 + index * (points.length > 1 ? 260 / (points.length - 1) : 1);

            return (
              <g key={day.id || index}>
                <circle
                  cx={x}
                  cy={y}
                  r={index === 0 ? 10 : 6}
                  className={index === 0 ? styles.activePoint : styles.routePoint}
                />
                <text
                  x={x + (index % 2 ? 11 : -11)}
                  y={y - 10}
                  textAnchor={index % 2 ? "start" : "end"}
                  className={styles.routeLabel}
                >
                  {getDayCity(day)}
                </text>
                <text
                  x={x + (index % 2 ? 11 : -11)}
                  y={y + 6}
                  textAnchor={index % 2 ? "start" : "end"}
                  className={styles.dayLabel}
                >
                  Day {day.day_number || index + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className={styles.mapHint}>
        Select a day card to explore its itinerary details.
      </p>
    </aside>
  );
};

const HotelSwapModal = ({ isOpen, onClose, currentHotel, city, dayImage }) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const hotelOptions = useMemo(() => {
    const currentName = currentHotel?.name || "Banyan Cove Beach Resort";
    return HOTEL_SWAP_OPTIONS.map((hotel, optionIndex) => ({
      ...hotel,
      name: optionIndex === 0 && currentHotel?.name ? currentName : hotel.name,
      image: optionIndex === 0 ? dayImage || hotel.image : hotel.image,
    }));
  }, [currentHotel, dayImage]);

  if (!isOpen) return null;

  return (
    <div className={styles.hotelModalOverlay} onMouseDown={onClose}>
      <section
        className={styles.hotelModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hotel-swap-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.hotelModalClose}
          onClick={onClose}
          aria-label="Close hotel selection"
        >
          <X size={18} />
        </button>

        <header className={styles.hotelModalHero}>
          <div>
            <p>{currentHotel?.name || "Banyan Cove Beach Resort"}</p>
            <h2 id="hotel-swap-title">Select Hotel To Change</h2>
          </div>
        </header>

        <div className={styles.hotelModalContent}>
          <div className={styles.hotelFilters}>
            <label>
              <span>Hotel category</span>
              <div className={styles.segmentedFilter}>
                <button type="button">3 ★</button>
                <button type="button">4 ★</button>
                <button type="button">5 ★</button>
              </div>
            </label>
            <label>
              <span>Cities</span>
              <select defaultValue="all">
                <option value="all">All Cities</option>
                <option value={city}>{city}</option>
              </select>
            </label>
            <label>
              <span>User rating</span>
              <div className={styles.segmentedFilter}>
                <button type="button">3 ★</button>
                <button type="button">4 ★</button>
                <button type="button">5 ★</button>
              </div>
            </label>
            <label>
              <span>Theme</span>
              <select defaultValue="all">
                <option value="all">All Theme</option>
                <option value="luxury">Luxury</option>
              </select>
            </label>
            <button type="button" className={styles.filterButton}>
              <SlidersHorizontal size={14} />
              Filter
            </button>
          </div>

          <strong className={styles.hotelCount}>
            Showing <span>64 Hotels</span>
          </strong>

          <label className={styles.hotelSearch}>
            <Search size={18} />
            <input type="search" placeholder="Search Hotels.." />
            <X size={14} aria-hidden="true" />
          </label>

          <div className={styles.hotelOptions}>
            {hotelOptions.map((hotel, hotelIndex) => (
              <article className={styles.hotelOptionCard} key={`${hotel.name}-${hotelIndex}`}>
                <div className={styles.hotelOptionImage}>
                  <img src={hotel.image} alt="" />
                  <button type="button" aria-label="Previous hotel image">
                    ‹
                  </button>
                  <button type="button" aria-label="Next hotel image">
                    ›
                  </button>
                </div>
                <div className={styles.hotelOptionInfo}>
                  <small>Phuket stay • 3 nights</small>
                  <h3>{hotel.name}</h3>
                  <p>Deluxe Ocean View · King bed</p>
                  <div className={styles.hotelAmenities}>
                    <span>1 King Bed</span>
                    <span>
                      <Check size={12} /> Valley View
                    </span>
                    <span>
                      <Check size={12} /> Iron/Ironing Board
                    </span>
                  </div>
                  <ul>
                    <li>Free stay for the kid</li>
                    <li>1 Extra bed/mattress will be provided at no extra cost</li>
                  </ul>
                  <span className={styles.cancellation}>
                    <Check size={13} /> Free Cancellation before 19 Jan 02:59 PM
                  </span>
                </div>
                <div className={styles.hotelOptionPrice}>
                  <div>
                    <strong>Excellent</strong>
                    <span>{hotel.reviews}</span>
                    <b>{hotel.rating}</b>
                  </div>
                  <p>
                    <del>{hotel.oldPrice}</del>
                    <strong>{hotel.price}</strong>
                    <span>x 5 night</span>
                    <small>+ ₹ 226 Taxes & fees</small>
                  </p>
                  <a href="#">See Details</a>
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
};

const DayCard = ({ day, index }) => {
  const [isOpen, setIsOpen] = useState(true);
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

  return (
    <article className={styles.dayCard} id={`itinerary-day-${index + 1}`}>
      <header
        className={`${styles.cardHeader} ${
          !isOpen ? styles.cardHeaderCollapsed : ""
        }`}
      >
        <div>
          <div className={styles.dayMeta}>
            <span className={styles.dayBadge}>
              Day {day?.day_number || index + 1}
            </span>
            <span className={styles.location}>
              <MapPin size={12} />
              {city}
            </span>
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
  const days = useMemo(() => {
    const itinerary = Array.isArray(data?.package_itinerarie)
      ? [...data.package_itinerarie].sort(
          (a, b) => (a?.day_number ?? 0) - (b?.day_number ?? 0),
        )
      : [];

    return itinerary.length ? itinerary : FALLBACK_DAYS;
  }, [data]);

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
          <RouteMap days={days} />
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

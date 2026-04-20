"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import styles from "./PopularFlights.module.css";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion, AnimatePresence } from "framer-motion";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

const CITY_IATA_MAP = {
  Ahmedabad: "AMD",
  Bangkok: "BKK",
  Bangalore: "BLR",
  Bengaluru: "BLR",
  Delhi: "DEL",
  Dubai: "DXB",
  Hyderabad: "HYD",
  Chennai: "MAA",
  Kolkata: "CCU",
  London: "LHR",
  Mumbai: "BOM",
  "New York": "JFK",
  Paris: "CDG",
  Pune: "PNQ",
  Singapore: "SIN",
  Sydney: "SYD",
  Tokyo: "HND",
};

const TAB_TYPE_MAP = {
  Domestic: "domestic",
  International: "international",
};

const formatPrice = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "N/A";
  return `₹${amount.toLocaleString("en-IN")}`;
};

const pickValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const toAbsoluteImageUrl = (value) => {
  const url = String(value || "").trim();
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`;
};

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTomorrowDateParam = () => {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 1);
  return formatLocalDate(nextDate);
};

const getCodeFromValue = (value = "") => {
  const trimmed = String(value || "").trim();
  if (/^[A-Za-z]{3}$/.test(trimmed)) return trimmed.toUpperCase();
  return "";
};

const getRouteLabel = (city = "", code = "") => {
  const trimmedCity = String(city || "").trim();
  const normalizedCode = String(code || "").trim().toUpperCase();

  if (!trimmedCity) return normalizedCode;
  if (!normalizedCode) return trimmedCity;
  if (trimmedCity.includes(`(${normalizedCode})`)) return trimmedCity;

  return `${trimmedCity} (${normalizedCode})`;
};

const PopularFlights = () => {
  const router = useRouter();
  const [swiperRef, setSwiperRef] = useState(null);
  const [activeTab, setActiveTab] = useState("Domestic");

  const domesticData = [
    {
      id: 1,
      img: "/images/hyderabad.png",
      city: "Hyderabad",
      date: "24 Mar 2026 - 14 Apr 2026",
      price: "₹20,000",
    },
    {
      id: 2,
      img: "/images/chennai2.png",
      city: "Chennai",
      date: "24 Mar 2026 - 14 Apr 2026",
      price: "₹20,000",
    },
    {
      id: 3,
      img: "/images/pune2.png",
      city: "Pune",
      date: "24 Mar 2026 - 14 Apr 2026",
      price: "₹20,000",
    },
    {
      id: 4,
      img: "/images/ahamdabad2.png",
      city: "Ahmedabad",
      date: "24 Mar 2026 - 14 Apr 2026",
      price: "₹20,000",
    },
    {
      id: 5,
      img: "/images/hyderabad.png",
      city: "Mumbai",
      date: "24 Mar 2026 - 14 Apr 2026",
      price: "₹20,000",
    },
    {
      id: 6,
      img: "/images/pune2.png",
      city: "Bangalore",
      date: "24 Mar 2026 - 14 Apr 2026",
      price: "₹20,000",
    },
    {
      id: 7,
      img: "/images/hyderabad.png",
      city: "Kolkata",
      date: "24 Mar 2026 - 14 Apr 2026",
      price: "₹20,000",
    },
    {
      id: 8,
      img: "/images/hyderabad.png",
      city: "Delhi",
      date: "24 Mar 2026 - 14 Apr 2026",
      price: "₹20,000",
    },
  ];

  const internationalData = [
    {
      id: 1,
      img: "/images/ahamdabad2.png",
      city: "Dubai",
      date: "24 Mar 2026 - 14 Apr 2026",
      price: "₹45,000",
    },
    {
      id: 2,
      img: "/images/hyderabad.png",
      city: "Singapore",
      date: "24 Mar 2026 - 14 Apr 2026",
      price: "₹35,000",
    },
    {
      id: 3,
      img: "/images/chennai2.png",
      city: "Bangkok",
      date: "24 Mar 2026 - 14 Apr 2026",
      price: "₹28,000",
    },
    {
      id: 4,
      img: "/images/hyderabad.png",
      city: "London",
      date: "24 Mar 2026 - 14 Apr 2026",
      price: "₹85,000",
    },
    {
      id: 5,
      img: "/images/hyderabad.png",
      city: "New York",
      date: "24 Mar 2026 - 14 Apr 2026",
      price: "₹95,000",
    },
    {
      id: 6,
      img: "/images/pune2.png",
      city: "Paris",
      date: "24 Mar 2026 - 14 Apr 2026",
      price: "₹80,000",
    },
    {
      id: 7,
      img: "/images/hyderabad.png",
      city: "Tokyo",
      date: "24 Mar 2026 - 14 Apr 2026",
      price: "₹75,000",
    },
    {
      id: 8,
      img: "/images/pune2.png",
      city: "Sydney",
      date: "24 Mar 2026 - 14 Apr 2026",
      price: "₹90,000",
    },
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset swiper to first slide when tab changes
    if (swiperRef) {
      swiperRef.slideTo(0, 0);
    }
  };

  const tabsRef = useRef(null);

  useEffect(() => {
    if (!tabsRef.current) return; // ✅ prevent crash

    const tabs = tabsRef.current;
    const activeTabEl = tabs.querySelector(`.${styles.active}`);

    if (!activeTabEl) return;

    tabs.style.setProperty("--indicator-width", `${activeTabEl.offsetWidth}px`);
    tabs.style.setProperty("--indicator-left", `${activeTabEl.offsetLeft}px`);
  }, [activeTab]);

  const [selectedCity, setSelectedCity] = useState("Delhi");
  const [isCityOpen, setIsCityOpen] = useState(false);
  const cityRef = useRef(null);

  const metroCities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata"];
  const selectedIataCode = CITY_IATA_MAP?.[selectedCity] || "DEL";

  const { data: apiPopularFlights } = useQuery({
    queryKey: ["destination-flights-public", process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337", selectedCity, activeTab],
    queryFn: async () => {
      const query = new URLSearchParams({
        domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337",
        type: TAB_TYPE_MAP?.[activeTab] || "domestic",
        from_iata_code: selectedIataCode,
      }).toString();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/destination-flights/public?${query}`
      );
      const json = await response.json();

      if (!response.ok) {
        throw new Error(
          json?.error?.message ||
            json?.message ||
            "Failed to fetch destination flights"
        );
      }

      const flights = Array.isArray(json?.destination_flights)
        ? json.destination_flights
        : [];

      return flights.map((item, index) => ({
        id: pickValue(item?.id, `destination-flight-${index}`),
        img:
          toAbsoluteImageUrl(
            pickValue(
              item?.thumbnail?.url,
              item?.destination_image?.url,
              item?.image?.url
            )
          ) || (activeTab === "Domestic"
            ? domesticData?.[index % domesticData.length]?.img
            : internationalData?.[index % internationalData.length]?.img),
        city:
          pickValue(
            item?.city,
            item?.destination_city,
            item?.to_city,
            item?.to,
            item?.to_iata_code
          ) || "N/A",
        toCode: getCodeFromValue(
          pickValue(item?.to_iata_code, item?.destination_iata_code)
        ),
        date:
          pickValue(
            item?.travel_date_range,
            item?.date_range,
            item?.validity,
            item?.travel_dates
          ) || "N/A",
        price: formatPrice(
          pickValue(item?.economy_start_from, item?.price, item?.amount)
        ),
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setIsCityOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cardData =
    apiPopularFlights?.length > 0
      ? apiPopularFlights
      : activeTab === "Domestic"
      ? domesticData
      : internationalData;

  const handleFlightCardClick = (item) => {
    const origin = CITY_IATA_MAP?.[selectedCity] || selectedIataCode;
    const destination =
      getCodeFromValue(item?.toCode) ||
      CITY_IATA_MAP?.[item?.city] ||
      getCodeFromValue(item?.city);
    const params = new URLSearchParams({
      from: getRouteLabel(selectedCity, origin),
      to: getRouteLabel(item?.city, destination),
      tripType: "oneway",
      start: getTomorrowDateParam(),
      adults: "1",
      children: "0",
      infants: "0",
      travelClass: "ECONOMY",
    });

    if (origin) params.set("origin", origin);
    if (destination) params.set("destination", destination);

    router.push(`/flights?${params.toString()}`);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.heading}>
          Popular Flights to Destination From
          <span className={styles.headingMult} ref={cityRef}>
            <button
              className={styles.cityBtnn}
              onClick={() => setIsCityOpen((prev) => !prev)}
            >
              <span>{selectedCity}</span>
              <img
                src="/icons/dropdown.svg"
                alt=""
                className={isCityOpen ? styles.rotate : ""}
              />
            </button>

            {isCityOpen && (
              <ul className={styles.cityDropdown}>
                {metroCities.map((city) => (
                  <li
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setIsCityOpen(false);
                    }}
                  >
                    {city}
                  </li>
                ))}
              </ul>
            )}
          </span>
        </div>

        <nav className={styles.tabsWrap}>
          <ul className={styles.tabs} ref={tabsRef}>
            {["Domestic", "International"].map((t) => (
              <li
                key={t}
                className={`${styles.tab} ${
                  activeTab === t ? styles.active : ""
                }`}
                onClick={() => handleTabChange(t)}
              >
                <button
                  className={styles.tabBtn}
                  // onClick={() => handleTabChange(t)}
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div
          style={{ margin: "0 auto" }}
          className="popularFlightsCarouselWrapper"
        >
          {/* <Swiper
                        key={activeTab}
                        modules={[Navigation]}
                        onSwiper={setSwiperRef}
                        slidesPerView={4}
                        slidesPerGroup={1}
                        spaceBetween={30}
                        navigation={true}
                        loop={true}
                        loopAdditionalSlides={2}
                    > */}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{
                duration: 0.25,
                ease: [0.4, 0, 0.2, 1], 
              }}
            >
              <Swiper
                key={activeTab}
                modules={[Navigation]}
                onSwiper={setSwiperRef}
                navigation={true}
                loop={true}
                loopAdditionalSlides={2}
                slidesPerGroup={1}
                spaceBetween={16}
                breakpoints={{
                  0: {
                    slidesPerView: 1.1, // 👈 show next slide partially
                    spaceBetween: 16,
                  },
                  576: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                  },
                  767: {
                    slidesPerView: 3,
                    spaceBetween: 24,
                  },
                  991: {
                    slidesPerView: 4,
                    spaceBetween: 30,
                  },
                }}
              >
                {cardData.map((item, index) => (
                  <SwiperSlide key={item.id}>
                    <div
                      className={styles.carouselContainer}
                      onClick={() => handleFlightCardClick(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleFlightCardClick(item);
                        }
                      }}
                    >
                      <div className={styles.itemsCard}>
                        <img src={item.img} alt="" />

                        {/* Show text overlay on all cards */}
                        {item.city && (
                          <>
                            <div className={styles.overlay}></div>

                            <div className={styles.textContainer}>
                              <div className={styles.textTop}>
                                <span>{item.city}</span>
                                <p>{item.date}</p>
                              </div>

                              <div className={styles.textBottom}>
                                <p className={styles.economy}>
                                  Economy From <span>{item.price}</span>
                                </p>
                                <p className={styles.discoverText}>
                                  DISCOVER FLIGHTS
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Buttons */}
        {/* <div className={styles.btnContainer}>
                    <div className={styles.btn}>
                        <img src="/icons/left.svg" alt="" />
                    </div>
                    <div className={styles.btn}>
                        <img src="/icons/right.svg" alt="" />
                    </div>
                </div> */}
        <div className={styles.btnContainer}>
          <div
            className={styles.btn}
            onClick={() => {
              if (swiperRef) {
                swiperRef.slidePrev();
              }
            }}
          >
            <img src="/icons/left.svg" alt="" />
          </div>

          <div
            className={styles.btn}
            onClick={() => {
              if (swiperRef) {
                swiperRef.slideNext();
              }
            }}
          >
            <img src="/icons/right.svg" alt="" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularFlights;

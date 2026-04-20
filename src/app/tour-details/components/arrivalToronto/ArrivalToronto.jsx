"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./ArrivalToronto.module.css";
import DaySlider from "./DaySlider";
import FlightTimingDetail from "./flightTimingDetails/FlightTimingDetail";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import HotelRoom from "./hotelRoom/HotelRoom";
import { motion, AnimatePresence } from "framer-motion";
import HotelPopup from "./hotelRoom/HotelPopup";
import YourActivityPop from "./YourActivityPop";
import {
  readTourBookingPackage,
  writeTourBookingPackage,
} from "@/app/tour-bookings/utils/tourBookingSession";

const ACTIVITY_FALLBACK_IMAGE = "/fallback.jpg";
const NO_ACTIVITY_TEXT = "No activity on this day";

const ArrivalToronto = ({ data }) => {
  const tabsRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activitySwiperRef, setActivitySwiperRef] = useState(null);
  const [mobileActivitySwiperRef, setMobileActivitySwiperRef] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [isHotelPopupOpen, setIsHotelPopupOpen] = useState(false);
  const [isYourActivityPopupOpen, setIsYourActivityPopupOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [expandedActivityText, setExpandedActivityText] = useState([]);
  const [selectedActivityIds, setSelectedActivityIds] = useState([]);
  const [activityNavState, setActivityNavState] = useState({
    isBeginning: true,
    isEnd: true,
  });
  const [mobileActivityNavState, setMobileActivityNavState] = useState({
    isBeginning: true,
    isEnd: true,
  });

  const openHotelPopup = (hotel) => {
    setSelectedHotel(hotel);
    setIsHotelPopupOpen(true);
  };

  const closeHotelPopup = () => {
    setIsHotelPopupOpen(false);
    setSelectedHotel(null);
  };
  const closeYourActivityPopup = () => {
    setIsYourActivityPopupOpen(false);
    setSelectedHotel(null);
  };

  // Open YourActivityPop with the selected activity object
  const openYourActivityPopup = (activity) => {
    setSelectedHotel(activity);
    setIsYourActivityPopupOpen(true);
  };

  const updateActivityNavState = (swiper, setNavState = setActivityNavState) => {
    setActiveIndex(swiper?.activeIndex || 0);
    setNavState({
      isBeginning: swiper?.isBeginning ?? true,
      isEnd: swiper?.isEnd ?? true,
    });
  };

  const handleActivitySwiper = (swiper) => {
    setActivitySwiperRef(swiper);
    updateActivityNavState(swiper);
  };

  const handleMobileActivitySwiper = (swiper) => {
    setMobileActivitySwiperRef(swiper);
    updateActivityNavState(swiper, setMobileActivityNavState);
  };

  const handleActivityPrev = () => {
    if (!hasMultipleActivities || activityNavState.isBeginning) return;
    activitySwiperRef?.slidePrev();
  };

  const handleActivityNext = () => {
    if (!hasMultipleActivities || activityNavState.isEnd) return;
    activitySwiperRef?.slideNext();
  };

  const handleMobileActivityPrev = () => {
    if (!hasMultipleActivities || mobileActivityNavState.isBeginning) return;
    mobileActivitySwiperRef?.slidePrev();
  };

  const handleMobileActivityNext = () => {
    if (!hasMultipleActivities || mobileActivityNavState.isEnd) return;
    mobileActivitySwiperRef?.slideNext();
  };

  const toggleExpand = (key) => {
    setOpenAccordion((prev) => (prev === key ? null : key));
  };

  const toggleActivityText = (id) => {
    setExpandedActivityText((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectedActivity = (activity) => {
    if (!activity?.id || String(activity.id).startsWith("activity-empty")) return;

    setSelectedActivityIds((prev) => {
      const activityId = activity.id;
      const nextIds = prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId];
      const currentPackage = readTourBookingPackage();

      writeTourBookingPackage({
        ...currentPackage,
        id: data?.id ?? currentPackage?.id,
        selectedActivities: nextIds.map((id) => ({ id })),
      });

      return nextIds;
    });
  };

  const renderActivityText = (item) => {
    const words = String(item?.title || "").trim().split(/\s+/).filter(Boolean);
    const isLongText = words.length > 40;
    const isExpandedText = expandedActivityText.includes(item?.id);

    if (!isLongText || isExpandedText) return item?.title;

    return (
      <>
        {words.slice(0, 10).join(" ")}...{" "}
        <span
          onClick={(event) => {
            event.stopPropagation();
            toggleActivityText(item?.id);
          }}
        >
          more
        </span>
      </>
    );
  };

  const items = [
    "DAY Itinerary",
    "Hotels",
    "Transport",
    "ACTIVITIES",
    "INCLUSION & EXCLUSION",
    "TOUR POLICY",
  ];

  const tabVariants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.4, // aane me thoda time
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.35, // jaane me soft fade
        ease: "easeIn",
      },
    },
  };

  const flight = {
    departure: {
      time: "06:45",
      city: "Jakarta (CGK)",
    },
    arrival: {
      time: "08:00",
      city: "Singapore (SIN)",
    },
    duration: {
      hours: 1,
      minutes: 50,
    },
    stops: {
      type: "Non Stop",
    },
    fare: {
      totalFare: "₹ 3,22,000",
      pricePerAdult: "₹ 12,000",
      cabinClass: "ECONOMY",
    },
  };

  const dayImgeFilter = [
    {
      image: "/images/day0.webp",
      day: "Day 1",
      desc: "Toronto demain",
    },
    {
      image: "/images/day1.png",
      day: "Day 2",
      desc: "Toronto demain",
    },
    {
      image: "/images/day2.png",
      day: "Day 3",
      desc: "Toronto demain",
    },
  ];

  const itineraryDays = Array.isArray(data?.package_itinerarie)
    ? [...data.package_itinerarie].sort(
        (a, b) => (a?.day_number ?? 0) - (b?.day_number ?? 0),
      )
    : [];

  const currentDayData = itineraryDays[activeDayIndex] || itineraryDays[0] || null;
  const activeDayNumber = currentDayData?.day_number || 1;
  const currentDayTitle = currentDayData?.title
    ? `Day ${activeDayNumber} – ${currentDayData.title}`
    : "Day 1 – Arrival in Toronto";
  const currentDayDescription =
    currentDayData?.description ||
    "Our journey begins with a scenic arrival in Toronto, where vibrant city energy meets the calm of waterfront views. After a smooth airport welcome, settle into your hotel and enjoy time to unwind from your flight. In the evening, explore the city at a relaxed pace or enjoy a curated din odern Canadian cuisine, setting the tone for the adventure";
  const getMediaUrl = (url) =>
    url
      ? url.startsWith("http")
        ? url
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`
      : "";
  const getHotelImage = (hotel) => {
    const image = Array.isArray(hotel?.main_image)
      ? hotel.main_image[0]
      : hotel?.main_image;
    const url =
      image?.formats?.large?.url ||
      image?.formats?.small?.url ||
      image?.formats?.thumbnail?.url ||
      image?.url;

    return getMediaUrl(url) || "/images/yourAtivityImage1.png";
  };
  const currentHotel = currentDayData?.hotel || currentDayData?.available_hotels?.[0] || null;
  const currentHotelData = {
    title: currentHotel?.name || "N/A",
    location: [currentHotel?.city, currentHotel?.country].filter(Boolean).join(", ") || "N/A",
    desc:
      currentHotel?.description ||
      currentHotel?.hotel_category ||
      currentDayData?.builder_data?.hotel?.notes ||
      "N/A",
    images: [getHotelImage(currentHotel)],
    rating: Number(currentHotel?.star_rating || 0),
    options: (Array.isArray(currentDayData?.available_hotels)
      ? currentDayData.available_hotels
      : currentHotel
        ? [currentHotel]
        : []
    ).map((item) => ({
      title: [item?.name, item?.city].filter(Boolean).join(", ") || "N/A",
      description: item?.description || item?.hotel_category || "N/A",
      images: [getHotelImage(item)],
    })),
    availableHotels: Array.isArray(currentDayData?.available_hotels)
      ? currentDayData.available_hotels
      : [],
  };
  const currentBuilderData = currentDayData?.builder_data || {};
  const currentTransports = Array.isArray(currentBuilderData?.transports)
    ? currentBuilderData.transports.filter((transport) => transport?.enabled !== false)
    : [];
  const currentFlightTransport = currentTransports.find(
    (transport) => transport?.mode === "flight",
  );
  const currentPrivateTransfer = currentTransports.find(
    (transport) => transport?.mode === "private_transfer",
  );
  const formatTransportTime = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };
  const getTransportDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return { hours: 0, minutes: 0 };
    }

    const diffMinutes = Math.max(0, Math.round((endDate - startDate) / 60000));

    return {
      hours: Math.floor(diffMinutes / 60),
      minutes: diffMinutes % 60,
    };
  };
  const currentFlight = currentFlightTransport
    ? {
        departure: {
          time: formatTransportTime(currentFlightTransport?.departure_datetime),
          city: currentFlightTransport?.departure_airport || "N/A",
        },
        arrival: {
          time: formatTransportTime(currentFlightTransport?.arrival_datetime),
          city: currentFlightTransport?.arrival_airport || "N/A",
        },
        duration: {
          ...getTransportDuration(
            currentFlightTransport?.departure_datetime,
            currentFlightTransport?.arrival_datetime,
          ),
        },
        stops: {
          type: currentFlightTransport?.stops || "Non Stop",
        },
        fare: {
          totalFare: currentFlightTransport?.flight_base_price || "",
          pricePerAdult: currentFlightTransport?.flight_base_price || "",
          cabinClass: currentFlightTransport?.cabin_class || "",
        },
      }
    : flight;
  const hasHotelId = (hotel) =>
    hotel?.hotel_id !== undefined &&
    hotel?.hotel_id !== null &&
    String(hotel.hotel_id).trim() !== "";
  const hotelCount = Array.isArray(currentBuilderData?.hotels)
    ? currentBuilderData.hotels.filter(hasHotelId).length
    : hasHotelId(currentBuilderData?.hotel)
      ? 1
      : 0;
  const mealCount = Array.isArray(currentBuilderData?.meals?.selected)
    ? currentBuilderData.meals.selected.filter(Boolean).length
    : Array.isArray(currentDayData?.package_itinerarie_meals)
      ? currentDayData.package_itinerarie_meals.filter(Boolean).length
      : 0;
  const transportCount = Array.isArray(currentBuilderData?.transports)
    ? currentBuilderData.transports.filter(
        (transport) =>
          transport?.enabled !== false &&
          (transport?.mode ||
            transport?.vehicle_type ||
            transport?.pickup_location ||
            transport?.drop_location),
      ).length
    : 0;
  const countLabel = (count, label) =>
    count > 0 ? `${count} ${label}${count > 1 ? "s" : ""}` : null;
  const currentDaySummary =
    [
      countLabel(hotelCount, "Hotel"),
      countLabel(mealCount, "Meal"),
      countLabel(transportCount, "Transfer"),
    ]
      .filter(Boolean)
      .join(", ") || "N/A";
  const currentDayActivitiesSource = Array.isArray(currentDayData?.package_activities)
    && currentDayData.package_activities.length
      ? currentDayData.package_activities
      : Array.isArray(currentDayData?.builder_data?.activities)
        ? currentDayData.builder_data.activities
        : [];
  const mappedActivities = currentDayActivitiesSource
    .filter((item) => item?.enabled !== false)
    .map((item) => {
      const activityImages =
        (item?.images || []).map((image) => getMediaUrl(image?.url)).filter(Boolean);

      return {
        id: item?.id,
        isEmpty: false,
        image: activityImages[0] || ACTIVITY_FALLBACK_IMAGE,
        category: item?.time_slot
          ? `${item.time_slot} activity`
          : "Activity",
        title: item?.description || item?.name || "Activity",
        popupTitle: item?.name || "Activity",
        description: item?.description || currentDayDescription,
        startTime: item?.start_time || "",
        endTime: item?.end_time || "",
        images: activityImages.length ? activityImages : [ACTIVITY_FALLBACK_IMAGE],
        actions: [
          {
            label: "view",
            type: "view",
          },
          {
            label: selectedActivityIds.includes(item?.id) ? "remove" : "add +",
            type: "add",
          },
        ],
      };
    });
  const hasMultipleActivities = mappedActivities.length > 1;
  const activitiesData = mappedActivities.length
    ? mappedActivities
    : [
        {
          id: `activity-empty-${activeDayNumber}`,
          isEmpty: true,
          image: ACTIVITY_FALLBACK_IMAGE,
          category: "Activity",
          title: NO_ACTIVITY_TEXT,
          popupTitle: NO_ACTIVITY_TEXT,
          description: NO_ACTIVITY_TEXT,
          startTime: "",
          endTime: "",
          images: [ACTIVITY_FALLBACK_IMAGE],
          actions: [],
        },
      ];

  useEffect(() => {
    if (!hasMultipleActivities) {
      setActivityNavState({ isBeginning: true, isEnd: true });
      setMobileActivityNavState({ isBeginning: true, isEnd: true });
      return;
    }

    activitySwiperRef?.slideTo(0, 0);
    mobileActivitySwiperRef?.slideTo(0, 0);
    updateActivityNavState(activitySwiperRef);
    updateActivityNavState(mobileActivitySwiperRef, setMobileActivityNavState);
  }, [
    activeDayNumber,
    hasMultipleActivities,
    activitySwiperRef,
    mobileActivitySwiperRef,
  ]);

  const safeImageIndex = dayImgeFilter.length
    ? activeDayIndex % dayImgeFilter.length
    : 0;
  const currentDayImageUrl =
    currentDayData?.day_image?.formats?.large?.url ||
    currentDayData?.day_image?.formats?.small?.url ||
    currentDayData?.day_image?.formats?.thumbnail?.url ||
    currentDayData?.day_image?.url;
  const currentDayImage =
    getMediaUrl(currentDayImageUrl) || dayImgeFilter[safeImageIndex]?.image;

  const handleNextDayImage = () => {
    setActiveDayIndex((prev) =>
      itineraryDays.length ? (prev === itineraryDays.length - 1 ? 0 : prev + 1) : 0,
    );
  };

  useEffect(() => {
    if (!itineraryDays.length) return;
    if (activeDayIndex > itineraryDays.length - 1) {
      setActiveDayIndex(0);
    }
  }, [activeDayIndex, itineraryDays.length]);

  useEffect(() => {
    const currentPackage = readTourBookingPackage();
    if (currentPackage?.id !== data?.id) {
      setSelectedActivityIds([]);
      return;
    }

    setSelectedActivityIds(
      Array.isArray(currentPackage?.selectedActivities)
        ? currentPackage.selectedActivities
            .map((activity) => activity?.id)
            .filter(Boolean)
        : [],
    );
  }, [data?.id]);

  const [activeTab, setActiveTab] = useState("DAY Itinerary");

  const onTabClick = (item, index) => {
    setActiveTab(item);
    // optional: swiperRef?.slideTo(index)
  };
  useEffect(() => {
    if (!tabsRef.current) return;

    const activeEl = tabsRef.current.querySelector(`.${styles.active}`);
    if (!activeEl) return;

    tabsRef.current.style.setProperty(
      "--indicator-width",
      `${activeEl.offsetWidth}px`,
    );
    tabsRef.current.style.setProperty(
      "--indicator-left",
      `${activeEl.offsetLeft}px`,
    );
  }, [activeTab]);
  return (
    <section className={styles.section}>
      {/* MONTH TABS */}
      <nav className={styles.tabsWrap}>
        <ul className={styles.tabs} ref={tabsRef}>
          {items.map((item, index) => (
            <li
              key={item}
              className={`${styles.tab} ${
                activeTab === item ? styles.active : ""
              }`}
              onClick={() => onTabClick(item, index)}
            >
              <button className={styles.tabBtn}>{item}</button>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.container}>
        <div className={styles.leftContainer}>
          {activeTab !== "INCLUSION & EXCLUSION" &&
            activeTab !== "TOUR POLICY" && (
              <DaySlider
                days={itineraryDays.map((item) => item?.day_number)}
                activeDay={activeDayNumber}
                onDaySelect={(dayNumber) => {
                  const nextIndex = itineraryDays.findIndex(
                    (item) => item?.day_number === dayNumber,
                  );
                  if (nextIndex !== -1) setActiveDayIndex(nextIndex);
                }}
              />
            )}

          <AnimatePresence mode="wait">
            {activeTab === "DAY Itinerary" && (
              <div className={styles.leftBottomCont}>
                <div
                  className={`${styles.ArrivalContainer} ${styles.ArrivalContainerDayIn}`}
                >
                  <div className={styles.ArrivalRight}>
                    <h2>{currentDayTitle}</h2>
                  </div>
                  <div className={styles.ArrivalLeft}>
                    {currentDaySummary}
                  </div>
                </div>
                <motion.div
                  key="day"
                  variants={tabVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={styles.leftBottomCont}
                >
                  <div className={styles.paraCoontainer}>
                    <p>{currentDayDescription}</p>
                    {/* <HotelRoom/> */}
                  </div>

                  <div
                    className={`${styles.expandableMainContainer} ${styles.expandableArrival}`}
                  >
                    <div
                      className={`${styles.expandableTab} ${openAccordion === "arrival" ? styles.activeTabs : ""}`}
                      onClick={() => toggleExpand("arrival")}
                    >
                      <div className={`${styles.ArrivalContainerMobile}`}>
                        <div className={styles.ArrivalRight}>
                          <h2>{currentDayTitle}</h2>
                        </div>
                        <div className={styles.ArrivalLeft}>
                          {currentDaySummary}
                        </div>
                      </div>
                      <img
                        className={`${styles.arrow} ${
                          openAccordion === "arrival" ? styles.rotate : ""
                        }`}
                        src="/icons/DownArrows.svg"
                        alt=""
                      />
                    </div>
                    <div
                      className={`${styles.expandableContent} ${
                        openAccordion === "arrival" ? styles.open : ""
                      }`}
                    >
                      <div className={styles.expandableContentWrapper}>
                        <div
                          className={`${styles.paraCoontainer} ${styles.paraCoontainerMobile}`}
                        >
                          <p>{currentDayDescription}</p>
                          {/* <HotelRoom/> */}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.expandableMainContainerMobileWrapper}>
                    {currentFlightTransport && (
                    <div className={styles.expandableMainContainer}>
                      <div
                        className={`${styles.expandableTab} ${openAccordion === "flight" ? styles.activeTabs : ""}`}
                        onClick={() => toggleExpand("flight")}
                      >
                        <h2> Flight</h2>
                        <img
                          className={`${styles.arrow} ${
                            openAccordion === "flight" ? styles.rotate : ""
                          }`}
                          src="/icons/DownArrows.svg"
                          alt=""
                        />
                      </div>
                      <div
                        className={`${styles.expandableContent} ${
                          openAccordion === "flight" ? styles.open : ""
                        }`}
                      >
                        <div className={styles.expandableContentWrapper}>
                          <div className={styles.expandableTop}>
                            <div className={styles.fromToContainer}>
                              <span>{currentFlightTransport?.departure_airport || "N/A"} </span>
                              <img src="/icons/rightArrow1.svg" alt="" />
                              <span>{currentFlightTransport?.arrival_airport || "N/A"}</span>
                            </div>
                            <div>
                              <button className={styles.viewDetails}>
                                View Details
                              </button>
                            </div>
                          </div>
                          <div className={styles.flightDetailsCont}>
                            <div className={styles.flightDetailsSubCont}>
                              <div className={styles.flightDetails}>
                                <img src="/images/Flight.png" alt="" />
                                <div className={styles.flightNameContainer}>
                                  <h2>{currentFlightTransport?.airline_name || "N/A"}</h2>
                                  <span>{currentFlightTransport?.flight_number || "N/A"}</span>
                                </div>
                              </div>
                              <div className={styles.flightTimingContainer}>
                                <FlightTimingDetail flight={currentFlight} />
                              </div>
                            </div>
                            <div className={styles.br}></div>
                            <div className={styles.cabinCont}>
                              <div className={styles.cabinRow}>
                                <img src="/icons/cabinSvg.svg" alt="" />
                                <span>Cabin: {currentFlightTransport?.cabin_weight || "N/A"}</span>
                              </div>
                              <div className={styles.cabinRow}>
                                <img src="/icons/checkSvg.svg" alt="" />
                                <span>{currentFlightTransport?.baggage_info || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    )}

                    {currentPrivateTransfer && (
                    <div className={styles.expandableMainContainer}>
                      <div
                        className={`${styles.expandableTab} ${openAccordion === "transfer" ? styles.activeTabs : ""}`}
                        onClick={() => toggleExpand("transfer")}
                      >
                        <h2>Private Transfer</h2>
                        <img
                          className={`${styles.arrow} ${
                            openAccordion === "transfer" ? styles.rotate : ""
                          }`}
                          src="/icons/DownArrows.svg"
                          alt=""
                        />
                      </div>
                      <div
                        className={`${styles.expandableContent} ${
                          openAccordion === "transfer" ? styles.open : ""
                        }`}
                      >
                        <div className={styles.expandableContentWrapper}>
                          <div className={styles.PremiumContainer}>
                            <img src="/images/cardImg.png" alt="" />
                            <div className={styles.PremiumTextContainer}>
                              <h3>{currentPrivateTransfer?.vehicle_type || "Private Transfer"}</h3>
                              <p>
                                {currentPrivateTransfer?.notes ||
                                  `${currentPrivateTransfer?.pickup_location || "N/A"} to ${currentPrivateTransfer?.drop_location || "N/A"}`}
                              </p>
                              <div className={styles.ApproximatelyTime}>
                                <img src="/icons/watchBlack.svg" alt="" />
                                <span>{currentPrivateTransfer?.pickup_time ? `Pickup: ${formatTransportTime(currentPrivateTransfer.pickup_time)}` : "N/A"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    )}

                    <div
                      className={`${styles.expandableMainContainer} ${styles.expandableMainContainerMobile}`}
                    >
                      <div
                        className={`${styles.expandableTab} ${openAccordion === "yourHotel" ? styles.activeTabs : ""}`}
                        onClick={() => toggleExpand("yourHotel")}
                      >
                        <h2>Your hotel</h2>
                        <img
                          className={`${styles.arrow} ${
                            openAccordion === "yourHotel" ? styles.rotate : ""
                          }`}
                          src="/icons/DownArrows.svg"
                          alt=""
                        />
                      </div>
                      <div
                        className={`${styles.expandableContent} ${
                          openAccordion === "yourHotel" ? styles.open : ""
                        }`}
                      >
                        <div className={styles.expandableContentWrapper}>
                          <div className={styles.card}>
                            <img
                              className={styles.cardImage}
                              src={currentHotelData.images[0]}
                              alt=""
                            />
                            <div className={styles.cardTextContainer}>
                              <span className={styles.cardTextAddress}>
                                {currentHotelData.location}
                              </span>
                              <h3 className={styles.cardTextTitle}>
                                {currentHotelData.title}
                              </h3>
                              <button
                                className={styles.cardTextButton}
                                onClick={() => openHotelPopup(currentHotelData)}
                              >
                                view hotel options
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`${styles.expandableMainContainer} ${styles.expandableMainContainerMobile}`}
                    >
                      <div
                        className={`${styles.expandableTab} ${openAccordion === "yourActivity" ? styles.activeTabs : ""}`}
                        onClick={() => toggleExpand("yourActivity")}
                      >
                        <h2>Your ACTIVITY</h2>
                        <img
                          className={`${styles.arrow} ${
                            openAccordion === "yourActivity"
                              ? styles.rotate
                              : ""
                          }`}
                          src="/icons/DownArrows.svg"
                          alt=""
                        />
                      </div>
                      <div
                        className={`${styles.expandableContent} ${
                          openAccordion === "yourActivity" ? styles.open : ""
                        }`}
                      >
                        <div className={styles.expandableContentWrapper}>
                          <div
                            className={styles.yourActivityContainerBottomRight}
                          >
	                            <Swiper
	                              modules={[Navigation]}
	                              onSwiper={handleMobileActivitySwiper}
	                              onSlideChange={(swiper) =>
	                                updateActivityNavState(
	                                  swiper,
	                                  setMobileActivityNavState,
	                                )
	                              }
                              slidesPerView={"auto"}
                              spaceBetween={12}
                              className={styles.carousel}
                            >
                              {activitiesData.map((item) => (
                                <SwiperSlide
                                  key={item.id}
                                  className={styles.slide}
                                >
                                  <div
                                    key={item.id}
                                    className={`${styles.cardCarousell} ${
                                      item.isEmpty ? styles.emptyActivityCard : ""
                                    }`}
                                  >
                                    <img
                                      className={`${styles.cardImage} ${
                                        item.isEmpty ? styles.emptyActivityImage : ""
                                      }`}
                                      src={item.image}
                                      alt={item.title}
                                    />

                                    <div
                                      className={`${styles.cardTextContainer} ${styles.cardTextContainer2} ${
                                        item.isEmpty ? styles.emptyActivityTextContainer : ""
                                      }`}
                                    >
                                      <span
                                        className={`${styles.cardTextAddress} ${
                                          item.isEmpty ? styles.emptyActivityLabel : ""
                                        }`}
                                      >
                                        {item.category}
                                      </span>
                                      <h3
                                        className={`${styles.TextTitle} ${
                                          item.isEmpty ? styles.emptyActivityTitle : ""
                                        }`}
                                      >
                                        {renderActivityText(item)}
                                      </h3>

                                      <div className={styles.btnsCon}>
                                        {item.actions.map((btn, i) => (
                                          <button
                                            key={i}
                                            className={styles.cardButton}
                                            onClick={() => {
                                              if (btn.type === "view")
                                                openYourActivityPopup(item);
                                              else if (btn.type === "add") {
                                                toggleSelectedActivity(item);
                                              }
                                            }}
                                          >
                                            {btn.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </SwiperSlide>
                              ))}
                            </Swiper>
                          </div>
                        </div>
                      </div>
                    </div>

	                    {hasMultipleActivities && (
	                      <div
	                        className={`${styles.btnContainer} ${styles.btnContainerMobileView}`}
	                      >
	                        <div
	                          className={`${styles.btn} ${
	                            mobileActivityNavState.isBeginning
	                              ? styles.disabledBtn
	                              : ""
	                          }`}
	                          onClick={handleMobileActivityPrev}
	                          aria-disabled={mobileActivityNavState.isBeginning}
	                        >
	                          <img src="/icons/left.svg" alt="Previous" />
	                        </div>
	                        <div
	                          className={`${styles.btn} ${
	                            mobileActivityNavState.isEnd
	                              ? styles.disabledBtn
	                              : ""
	                          }`}
	                          onClick={handleMobileActivityNext}
	                          aria-disabled={mobileActivityNavState.isEnd}
	                        >
	                          <img src="/icons/right.svg" alt="Next" />
	                        </div>
	                      </div>
	                    )}
                  </div>

                  <div className={styles.yourActivityContainer}>
                    <div className={styles.yourActivityContainerTop}>
                      <div className={styles.yourActivityContainerTopLeft}>
                        <h2 className={styles.youHeading}>your hotel</h2>
                      </div>
                      <div className={styles.yourActivityContainerTopRight}>
                        <h2 className={styles.youHeading}>your ACTIVITY</h2>
	                        {hasMultipleActivities && (
	                          <div className={styles.btnContainer}>
	                            <div
	                              className={`${styles.btn} ${
	                                activityNavState.isBeginning
	                                  ? styles.disabledBtn
	                                  : ""
	                              }`}
	                              onClick={handleActivityPrev}
	                              aria-disabled={activityNavState.isBeginning}
	                            >
	                              <img src="/icons/left.svg" alt="Previous" />
	                            </div>
	                            <div
	                              className={`${styles.btn} ${
	                                activityNavState.isEnd
	                                  ? styles.disabledBtn
	                                  : ""
	                              }`}
	                              onClick={handleActivityNext}
	                              aria-disabled={activityNavState.isEnd}
	                            >
	                              <img src="/icons/right.svg" alt="Next" />
	                            </div>
	                          </div>
	                        )}
                      </div>
                    </div>
                    <div className={styles.yourActivityContainerBottom}>
                      <div className={styles.yourActivityContainerBottomLeft}>
                        <div className={styles.card}>
                          <img
                            className={styles.cardImage}
                            src={currentHotelData.images[0]}
                            alt=""
                          />
                          <div className={styles.cardTextContainer}>
                            <span className={styles.cardTextAddress}>
                              {currentHotelData.location}
                            </span>
                            <h3 className={styles.cardTextTitle}>
                              {currentHotelData.title}
                            </h3>
                            <button
                              className={styles.cardTextButton}
                              onClick={() => openHotelPopup(currentHotelData)}
                            >
                              view hotel options
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className={styles.yourActivityContainerBottomRight}>
	                        <Swiper
	                          modules={[Navigation]}
	                          onSwiper={handleActivitySwiper}
	                          onSlideChange={updateActivityNavState}
                          slidesPerView={"auto"}
                          spaceBetween={12}
                          className={styles.carousel}
                        >
                          {activitiesData.map((item) => (
                            <SwiperSlide key={item.id} className={styles.slide}>
                              <div
                                key={item.id}
                                className={`${styles.cardCarousell} ${
                                  item.isEmpty ? styles.emptyActivityCard : ""
                                }`}
                              >
                                <img
                                  className={`${styles.cardImage} ${
                                    item.isEmpty ? styles.emptyActivityImage : ""
                                  }`}
                                  src={item.image}
                                  alt={item.title}
                                />

                                <div
                                  className={`${styles.cardTextContainer} ${styles.cardTextContainer2} ${
                                    item.isEmpty ? styles.emptyActivityTextContainer : ""
                                  }`}
                                >
                                  <span
                                    className={`${styles.cardTextAddress} ${
                                      item.isEmpty ? styles.emptyActivityLabel : ""
                                    }`}
                                  >
                                    {item.category}
                                  </span>
                                  <h3
                                    className={`${styles.TextTitle} ${
                                      item.isEmpty ? styles.emptyActivityTitle : ""
                                    }`}
                                  >
                                    {renderActivityText(item)}
                                  </h3>

                                  <div className={styles.btnsCon}>
                                    {item.actions.map((btn, i) => (
                                      <button
                                        key={i}
                                        className={styles.cardButton}
                                        onClick={() => {
                                          if (btn.type === "view")
                                            openYourActivityPopup(item);
                                          else if (btn.type === "add") {
                                            toggleSelectedActivity(item);
                                          }
                                        }}
                                      >
                                        {btn.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === "Hotels" && (
              <div className={styles.leftBottomCont}>
                <div className={styles.ArrivalContainer}>
                  <div className={styles.ArrivalRight}>
                    <h2>{currentDayTitle}</h2>
                  </div>
                  <div className={styles.ArrivalLeft}>
                    {currentDaySummary}
                  </div>
                </div>
                <motion.div
                  key="hotels"
                  variants={tabVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={styles.leftBottomCont}
                >
                  {/* <div className={styles.paraCoontainer}> */}
                  <HotelRoom hotel={currentHotelData} onViewHotel={openHotelPopup} />
                  {/* </div> */}
                </motion.div>
              </div>
            )}

            {activeTab === "Transport" && (
              <div className={styles.leftBottomCont}>
                <div className={styles.ArrivalContainer}>
                  <div className={styles.ArrivalRight}>
                    <h2>{currentDayTitle}</h2>
                  </div>
                  <div className={styles.ArrivalLeft}>
                    {currentDaySummary}
                  </div>
                </div>
                <motion.div
                  key="day"
                  variants={tabVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={styles.leftBottomCont}
                >
                  {currentFlightTransport && (
                  <div className={styles.expandableMainContainer}>
                    <div
                      className={`${styles.expandableTab} ${openAccordion === "flight" ? styles.activeTabs : ""}`}
                      onClick={() => toggleExpand("flight")}
                    >
                      <h2>International Flight</h2>
                      <img
                        className={`${styles.arrow} ${
                          openAccordion === "flight" ? styles.rotate : ""
                        }`}
                        src="/icons/DownArrows.svg"
                        alt=""
                      />
                    </div>
                    <div
                      className={`${styles.expandableContent} ${
                        openAccordion === "flight" ? styles.open : ""
                      }`}
                    >
                      <div className={styles.expandableContentWrapper}>
                        <div className={styles.expandableTop}>
                          <div className={styles.fromToContainer}>
                            <span>{currentFlightTransport?.departure_airport || "N/A"} </span>
                            <img src="/icons/rightArrow1.svg" alt="" />
                            <span>{currentFlightTransport?.arrival_airport || "N/A"}</span>
                          </div>
                          <div>
                            <button className={styles.viewDetails}>
                              View Details
                            </button>
                          </div>
                        </div>
                        <div className={styles.flightDetailsCont}>
                          <div className={styles.flightDetailsSubCont}>
                            <div className={styles.flightDetails}>
                              <img src="/images/Flight.png" alt="" />
                              <div className={styles.flightNameContainer}>
                                <h2>{currentFlightTransport?.airline_name || "N/A"}</h2>
                                <span>{currentFlightTransport?.flight_number || "N/A"}</span>
                              </div>
                            </div>
                            <div className={styles.flightTimingContainer}>
                              <FlightTimingDetail flight={currentFlight} />
                            </div>
                          </div>
                          <div className={styles.br}></div>
                          <div className={styles.cabinCont}>
                            <div className={styles.cabinRow}>
                              <img src="/icons/cabinSvg.svg" alt="" />
                              <span>Cabin: {currentFlightTransport?.cabin_weight || "N/A"}</span>
                            </div>
                            <div className={styles.cabinRow}>
                              <img src="/icons/checkSvg.svg" alt="" />
                              <span>{currentFlightTransport?.baggage_info || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  )}

                  {currentPrivateTransfer && (
                  <div className={styles.expandableMainContainer}>
                    <div
                      className={`${styles.expandableTab} ${openAccordion === "transfer" ? styles.activeTabs : ""}`}
                      onClick={() => toggleExpand("transfer")}
                    >
                      <h2>Private Transfer</h2>
                      <img
                        className={`${styles.arrow} ${
                          openAccordion === "transfer" ? styles.rotate : ""
                        }`}
                        src="/icons/DownArrows.svg"
                        alt=""
                      />
                    </div>
                    <div
                      className={`${styles.expandableContent} ${
                        openAccordion === "transfer" ? styles.open : ""
                      }`}
                    >
                      <div className={styles.expandableContentWrapper}>
                        <div className={styles.PremiumContainer}>
                          <img src="/images/cardImg.png" alt="" />
                          <div className={styles.PremiumTextContainer}>
                            <h3>{currentPrivateTransfer?.vehicle_type || "Private Transfer"}</h3>
                            <p>
                              {currentPrivateTransfer?.notes ||
                                `${currentPrivateTransfer?.pickup_location || "N/A"} to ${currentPrivateTransfer?.drop_location || "N/A"}`}
                            </p>
                            <div className={styles.ApproximatelyTime}>
                              <img src="/icons/watchBlack.svg" alt="" />
                              <span>{currentPrivateTransfer?.pickup_time ? `Pickup: ${formatTransportTime(currentPrivateTransfer.pickup_time)}` : "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  )}
                </motion.div>
              </div>
            )}

            {activeTab === "ACTIVITIES" && (
              <div className={styles.leftBottomCont}>
                <div className={styles.ArrivalContainer}>
                  <div className={styles.ArrivalRight}>
                    <h2>{currentDayTitle}</h2>
                  </div>
                  <div className={styles.ArrivalLeft}>
                    {currentDaySummary}
                  </div>
                </div>
                <motion.div
                  key="day"
                  variants={tabVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={styles.leftBottomCont}
                >
                  <div className={styles.yourActivityContainer}>
                    <div className={styles.yourActivityContainerTop}>
                      <div className={styles.yourActivityContainerTopLeft}>
                        <h2 className={styles.youHeading}>your hotel</h2>
                      </div>
                      <div className={styles.yourActivityContainerTopRight}>
                        <h2 className={styles.youHeading}>your ACTIVITY</h2>
	                        {hasMultipleActivities && (
	                          <div className={styles.btnContainer}>
	                            <div
	                              className={`${styles.btn} ${
	                                activityNavState.isBeginning
	                                  ? styles.disabledBtn
	                                  : ""
	                              }`}
	                              onClick={handleActivityPrev}
	                              aria-disabled={activityNavState.isBeginning}
	                            >
	                              <img src="/icons/left.svg" alt="Previous" />
	                            </div>
	                            <div
	                              className={`${styles.btn} ${
	                                activityNavState.isEnd
	                                  ? styles.disabledBtn
	                                  : ""
	                              }`}
	                              onClick={handleActivityNext}
	                              aria-disabled={activityNavState.isEnd}
	                            >
	                              <img src="/icons/right.svg" alt="Next" />
	                            </div>
	                          </div>
	                        )}
                      </div>
                    </div>
                    <div className={styles.yourActivityContainerBottom}>
                      <div className={styles.yourActivityContainerBottomLeft}>
                        <div className={styles.card}>
                          <img
                            className={styles.cardImage}
                            src={currentHotelData.images[0]}
                            alt=""
                          />
                          <div className={styles.cardTextContainer}>
                            <span className={styles.cardTextAddress}>
                              {currentHotelData.location}
                            </span>
                            <h3 className={styles.cardTextTitle}>
                              {currentHotelData.title}
                            </h3>
                            <button
                              className={styles.cardTextButton}
                              onClick={() => openHotelPopup(currentHotelData)}
                            >
                              view hotel options
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className={styles.yourActivityContainerBottomRight}>
	                        <Swiper
	                          modules={[Navigation]}
	                          onSwiper={handleActivitySwiper}
	                          onSlideChange={updateActivityNavState}
                          slidesPerView={"auto"}
                          spaceBetween={12}
                          className={styles.carousel}
                        >
                          {activitiesData.map((item) => (
                            <SwiperSlide key={item.id} className={styles.slide}>
                              <div
                                key={item.id}
                                className={`${styles.cardCarousell} ${
                                  item.isEmpty ? styles.emptyActivityCard : ""
                                }`}
                              >
                                <img
                                  className={`${styles.cardImage} ${
                                    item.isEmpty ? styles.emptyActivityImage : ""
                                  }`}
                                  src={item.image}
                                  alt={item.title}
                                />

                                <div
                                  className={`${styles.cardTextContainer} ${styles.cardTextContainer2} ${
                                    item.isEmpty ? styles.emptyActivityTextContainer : ""
                                  }`}
                                >
                                  <span
                                    className={`${styles.cardTextAddress} ${
                                      item.isEmpty ? styles.emptyActivityLabel : ""
                                    }`}
                                  >
                                    {item.category}
                                  </span>
                                  <h3
                                    className={`${styles.TextTitle} ${
                                      item.isEmpty ? styles.emptyActivityTitle : ""
                                    }`}
                                  >
                                    {renderActivityText(item)}
                                  </h3>

                                  <div className={styles.btnsCon}>
                                    {item.actions.map((btn, i) => (
                                      <button
                                        key={i}
                                        className={styles.cardButton}
                                        onClick={() => {
                                          if (btn.type === "view")
                                            openYourActivityPopup(item);
                                          else if (btn.type === "add") {
                                            toggleSelectedActivity(item);
                                          }
                                        }}
                                      >
                                        {btn.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`${styles.expandableMainContainer} ${styles.expandableMainContainerMobile}`}
                  >
                    <div
                      className={`${styles.expandableTab} ${openAccordion === "yourHotel" ? styles.activeTabs : ""}`}
                      onClick={() => toggleExpand("yourHotel")}
                    >
                      <h2>Your hotel</h2>
                      <img
                        className={`${styles.arrow} ${
                          openAccordion === "yourHotel" ? styles.rotate : ""
                        }`}
                        src="/icons/DownArrows.svg"
                        alt=""
                      />
                    </div>
                    <div
                      className={`${styles.expandableContent} ${
                        openAccordion === "yourHotel" ? styles.open : ""
                      }`}
                    >
                      <div className={styles.expandableContentWrapper}>
                        <div className={styles.card}>
                          <img
                            className={styles.cardImage}
                            src={currentHotelData.images[0]}
                            alt=""
                          />
                          <div className={styles.cardTextContainer}>
                            <span className={styles.cardTextAddress}>
                              {currentHotelData.location}
                            </span>
                            <h3 className={styles.cardTextTitle}>
                              {currentHotelData.title}
                            </h3>
                            <button
                              className={styles.cardTextButton}
                              onClick={() => openHotelPopup(currentHotelData)}
                            >
                              view hotel options
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`${styles.expandableMainContainer} ${styles.expandableMainContainerMobile}`}
                  >
                    <div
                      className={`${styles.expandableTab} ${openAccordion === "yourActivity" ? styles.activeTabs : ""}`}
                      onClick={() => toggleExpand("yourActivity")}
                    >
                      <h2>Your ACTIVITY</h2>
                      <img
                        className={`${styles.arrow} ${
                          openAccordion === "yourActivity" ? styles.rotate : ""
                        }`}
                        src="/icons/DownArrows.svg"
                        alt=""
                      />
                    </div>
                    <div
                      className={`${styles.expandableContent} ${
                        openAccordion === "yourActivity" ? styles.open : ""
                      }`}
                    >
                      <div className={styles.expandableContentWrapper}>
                        <div
                          className={styles.yourActivityContainerBottomRight}
                        >
	                          <Swiper
	                            modules={[Navigation]}
	                            onSwiper={handleMobileActivitySwiper}
	                            onSlideChange={(swiper) =>
	                              updateActivityNavState(
	                                swiper,
	                                setMobileActivityNavState,
	                              )
	                            }
                            slidesPerView={"auto"}
                            spaceBetween={12}
                            className={styles.carousel}
                          >
                            {activitiesData.map((item) => (
                              <SwiperSlide
                                key={item.id}
                                className={styles.slide}
                              >
                                <div
                                  key={item.id}
                                  className={`${styles.cardCarousell} ${
                                    item.isEmpty ? styles.emptyActivityCard : ""
                                  }`}
                                >
                                  <img
                                    className={`${styles.cardImage} ${
                                      item.isEmpty ? styles.emptyActivityImage : ""
                                    }`}
                                    src={item.image}
                                    alt={item.title}
                                  />

                                  <div
                                    className={`${styles.cardTextContainer} ${styles.cardTextContainer2} ${
                                      item.isEmpty ? styles.emptyActivityTextContainer : ""
                                    }`}
                                  >
                                    <span
                                      className={`${styles.cardTextAddress} ${
                                        item.isEmpty ? styles.emptyActivityLabel : ""
                                      }`}
                                    >
                                      {item.category}
                                    </span>
                                    <h3
                                      className={`${styles.TextTitle} ${
                                        item.isEmpty ? styles.emptyActivityTitle : ""
                                      }`}
                                    >
                                      {renderActivityText(item)}
                                    </h3>

                                    <div className={styles.btnsCon}>
                                      {item.actions.map((btn, i) => (
                                        <button
                                          key={i}
                                          className={styles.cardButton}
                                          onClick={() => {
                                            if (btn.type === "view")
                                              openYourActivityPopup(item);
                                            else if (btn.type === "add") {
                                              toggleSelectedActivity(item);
                                            }
                                          }}
                                        >
                                          {btn.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
            {activeTab === "INCLUSION & EXCLUSION" && (
              <InclusionExclusion data={data} />
            )}
            {activeTab === "TOUR POLICY" && <TourPolicy data={data} />}
          </AnimatePresence>
        </div>
        <div className={styles.rightContainer}>
          <div className={styles.dayImageContainer}>
            <AnimatePresence>
              <motion.img
                key={`bg-${activeDayIndex}`}
                src={currentDayImage}
                alt=""
                className={styles.bgImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </AnimatePresence>
          </div>

          <div className={styles.dayImageCarousel}>
            <AnimatePresence>
              <motion.img
                key={`carousel-${activeDayIndex}`}
                src={currentDayImage}
                alt=""
                className={styles.carouselImage}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.5 }}
                transition={{ duration: 0, ease: "easeInOut" }}
              />
            </AnimatePresence>

            <div className={styles.DayImageTextCont}>
              <div className={styles.textCont}>
                <h4>{`Day ${String(activeDayNumber).padStart(2, "0")}`}</h4>
                <h4>{currentDayData?.location?.city || dayImgeFilter[safeImageIndex]?.desc}</h4>
              </div>

              <div className={styles.leftRightBtn} onClick={handleNextDayImage}>
                <img src="/icons/right.svg" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <HotelPopup
        isOpen={isHotelPopupOpen}
        hotel={selectedHotel}
        onClose={closeHotelPopup}
      />
      <YourActivityPop
        isOpen={isYourActivityPopupOpen}
        hotel={selectedHotel}
        onClose={closeYourActivityPopup}
      />
    </section>
  );
};

export default ArrivalToronto;

const InclusionExclusion = ({ data }) => {
  const parseListFromDescription = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return [];

    return [...arr]
      .sort((a, b) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0))
      .flatMap((item) =>
        String(item?.description || "")
          .split(/\n+/)
          .map((line) => line.trim())
          .filter(Boolean),
      );
  };

  const inclusions = parseListFromDescription(data?.inclusions);
  const exclusions = parseListFromDescription(data?.exclusions);
  

  return (
    <section className={styles.inclusionWrapper}>
      <h2 className={styles.inclusionHeading}>INCLUSIONS & EXCLUSIONS</h2>

      {/* INCLUSIONS */}
      <div className={styles.block}>
        <h3 className={styles.inclusionSubHeading}>INCLUSION</h3>

        {data?.inclusions.length === 0 ? (
          <p className={styles.emptyText}>No inclusions available.</p>
        ) : (
          <ul className={styles.inclusionList}>
            {inclusions.map((item, index) => (
              <li key={index} className={styles.inclusionItem}>
                <div className={`${styles.icon} ${styles.check}`}>
                  <img src="/icons/greenTick.svg" alt="" />
                </div>
                <span className={styles.inclusionText}>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* EXCLUSIONS */}
      <div className={styles.block}>
        <h3 className={styles.inclusionSubHeading}>EXCLUSION</h3>

        {exclusions.length === 0 ? (
          <p className={styles.emptyText}>No exclusions available.</p>
        ) : (
          <ul className={styles.inclusionList}>
            {exclusions.map((item, index) => (
              <li key={index} className={styles.inclusionItem}>
                <div className={`${styles.icon} ${styles.cross}`}>
                  <img src="/icons/redCross.svg" alt="" />
                </div>
                <span className={styles.inclusionText}>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

const TourPolicy = ({ data }) => {
  const tripPolicies = Array.isArray(data?.trip_policies)
    ? [...data.trip_policies]
        .filter((policy) => policy?.enabled !== false)
        .sort((a, b) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0))
    : [];

  return (
    <section className={styles.tourPolicyWrapper}>
      <h2 className={styles.inclusionHeading}>TOUR POLICY</h2>

      {tripPolicies.length === 0 ? (
        <p className={styles.emptyText}>No tour policies available.</p>
      ) : (
        tripPolicies.map((policy) => (
          <div
            key={policy?.id ?? `${policy?.title}-${policy?.sort_order}`}
            className={styles.tourBlock}
          >
            <h3 className={styles.inclusionSubHeading}>
              {policy?.title || "Policy"}
            </h3>
            <div
              className={styles.tourPolicyPara}
              dangerouslySetInnerHTML={{
                __html: policy?.description || "<p>No description available.</p>",
              }}
            />
          </div>
        ))
      )}
    </section>
  );
};

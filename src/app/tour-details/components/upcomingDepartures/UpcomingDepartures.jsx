"use client";
import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import styles from "./UpcomingDepartures.module.css";
import { Navigation } from "swiper/modules";
import { useRouter } from "next/navigation";
import { saveTourBookingPackage } from "@/app/tour-bookings/utils/tourBookingSession";
import { useAuth } from "@/app/context/AuthContext";
import LoginPopup from "@/app/account/loginPopUp/LoginPopup";
import SignupPopup from "@/app/account/signUpPopUp/SignupPopup";
import { toast } from "react-toastify";
const safeDate = (value) => {
  const d = new Date(value);
  return isNaN(d) ? null : d;
};

const formatDate = (isoDate) => {
  const d = safeDate(isoDate);
  if (!d) return "--";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatMonth = (isoDate) => {
  const d = safeDate(isoDate);
  if (!d) return "UNKNOWN";
  return d
    .toLocaleDateString("en-US", { month: "short", year: "numeric" })
    .toUpperCase();
};

const UpcomingDepartures = ({ data }) => {
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [pendingDeparture, setPendingDeparture] = useState(null);

  const departures = Array.isArray(data?.package_departures)
    ? data.package_departures
    : [];
  const BookingData = departures.map((d = {}) => ({
    id: d.id ?? `${d.departure_date}-${d.return_date}`,

    month: formatMonth(d.departure_date),
    departureDate: formatDate(d.departure_date),
    returnDate: formatDate(d.return_date),
    pricePerPerson: d.base_price ?? 0,
    raw: d,
    singleOccupantCharge:
      typeof d.base_price === "number" ? Math.round(d.base_price * 0.1) : 0,
    availability:
      d.status === "available"
        ? "Available"
        : d.status
          ? d.status
          : "Unavailable",
  }));
  const months =
    BookingData.length > 0
      ? [...new Set(BookingData.map((b) => b.month))]
      : ["NO DEPARTURES"];
  const [swiperRef, setSwiperRef] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(months[0] ?? "NO DEPARTURES");

  const groupedData =
    months[0] === "NO DEPARTURES"
      ? [{ month: "NO DEPARTURES", items: [] }]
      : months.map((month) => ({
          month,
          items: BookingData.filter((b) => b.month === month),
        }));
  const hasDepartureMonths = BookingData.length > 0 && groupedData.length > 1;
  const canShowPrev = hasDepartureMonths && activeIndex > 0;
  const canShowNext = hasDepartureMonths && activeIndex < groupedData.length - 1;

  const tabsRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);

  // useEffect(() => {
  //     const calculateOffset = () => {
  //         const screenWidth = window.innerWidth;
  //         const maxContentWidth = 1400; // tumhara design width

  //         const calculated =
  //             screenWidth > maxContentWidth
  //                 ? (screenWidth - maxContentWidth) / 2
  //                 : 16; // mobile padding

  //         setOffset(calculated);
  //     };

  //     calculateOffset();
  //     window.addEventListener("resize", calculateOffset);

  //     return () => window.removeEventListener("resize", calculateOffset);
  // }, []);

  useEffect(() => {
    const calculate = () => {
      const screen = window.innerWidth;
      let content;
      if (screen >= 1920) content = 1400;
      else if (screen >= 1600) content = 1200;
      else if (screen >= 1440) content = 1080;
      else if (screen >= 1280) content = 960;
      else if (screen >= 1200) content = 840;
      else if (screen >= 1156) content = 800;
      else if (screen >= 991) content = 720;
      else content = screen - 32;

      const offsetVal = (screen - content) / 2;

      setSlideWidth(content);
      setOffset(offsetVal);
    };

    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, []);

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.activeIndex);
  };

  // underline animation
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
  const handlePrev = () => {
    swiperRef?.slidePrev();
  };

  const handleNext = () => {
    swiperRef?.slideNext();
  };

  const continueBooking = (departure) => {
    saveTourBookingPackage(data, departure?.raw || departure);
    router.push("/tour-bookings");
  };

  const handleBookNow = (departure) => {
    if (authLoading) return;

    if (!departures.length || !departure) {
      toast.error("No departures available.");
      return;
    }

    if (!isLoggedIn) {
      setPendingDeparture(departure);
      setAuthView("login");
      setShowLogin(true);
      return;
    }

    continueBooking(departure);
  };

  useEffect(() => {
    if (!isLoggedIn || !pendingDeparture) return;

    setShowLogin(false);
    continueBooking(pendingDeparture);
    setPendingDeparture(null);
  }, [isLoggedIn, pendingDeparture]);

  return (
    <>
      <section
        id="upcoming-departures"
        className={styles.section}
        style={{ "--slide-width": `${slideWidth}px` }}
      >
      <h3 className={styles.heading}>Upcoming Departures</h3>

      {/* MONTH TABS */}
      <nav className={styles.tabsWrap}>
        <ul className={styles.tabs} ref={tabsRef}>
          {months.map((m, index) => (
            <li
              key={m}
              className={`${styles.tab} ${
                activeTab === m ? styles.active : ""
              }`}
              onClick={() => {
                if (!swiperRef) return;
                swiperRef.slideTo(index);
                setActiveTab(m);
              }}
            >
              <button className={styles.tabBtn}>{m}</button>
            </li>
          ))}
        </ul>
      </nav>

      {/* CAROUSEL */}
      <div className={styles.swiperWrapper}>
        {/* <Swiper
                    modules={[Navigation]}
                    onSwiper={setSwiperRef}
                    onSlideChange={handleSlideChange}
                    slidesPerView={'auto'}
                    spaceBetween={24}
                    className={styles.carousel}
                > */}
        <Swiper
          modules={[Navigation]}
          onSwiper={setSwiperRef}
          onSlideChange={(s) => {
            setActiveIndex(s.activeIndex);
            setActiveTab(months[s.activeIndex]);
          }}
          slidesPerView="auto"
          centeredSlides={false}
          slidesOffsetBefore={offset}
          slidesOffsetAfter={offset}
          spaceBetween={24}
          breakpoints={{
            0: {
              spaceBetween: 9, // mobile
            },
            768: {
              spaceBetween: 16, // tablet & desktop
            },
          }}
          className={styles.carousel}
        >
          {groupedData.map((group) => (
            <SwiperSlide key={group.month} className={styles.slide}>
              <div className={styles.container}>
                {group.items.length === 0 ? (
                  <p className={styles.noData}></p>
                ) : (
                  group.items.map((item) => (
                    <React.Fragment key={item.id}>
                      {" "}
                      <div className={styles.row}>
                        {/* DATE */}

                        <div className={styles.col}>
                          <p className={styles.departure_date}>
                            {item.departureDate}
                          </p>
                          <p className={styles.return_date}>
                            Return: {item.returnDate}
                          </p>
                        </div>

                        {/* PRICE */}
                        <div className={styles.col}>
                          <p className={styles.price}>
                            From <span>₹ {item.pricePerPerson}</span>{" "}
                            <small>/ PERSON</small>
                          </p>
                          <p className={styles.extra}>
                            + ₹ {item.singleOccupantCharge} Single occupant
                          </p>
                        </div>

                        {/* STATUS */}
                        <div className={styles.col}>
                          <span className={styles.available}>
                            {item.availability}
                          </span>
                        </div>

                        {/* CTA */}
                        <div className={styles.col}>
                          <button
                            onClick={() => handleBookNow(item)}
                            className={styles.bookBtn}
                          >
                            BOOK NOW
                          </button>
                        </div>
                      </div>
                      <div className={styles.rowMobile}>
                        {/* DATE */}

                        <div className={styles.mobileColContainer}>
                          <div className={styles.col}>
                            <p className={styles.departure_date}>
                              {item.departureDate}
                            </p>
                            <p className={styles.return_date}>
                              Return: {item.returnDate}
                            </p>
                          </div>

                          {/* PRICE */}
                          <div className={styles.col}>
                            <p className={styles.price}>
                              From <span>₹ {item.pricePerPerson}</span>{" "}
                              <small>/ PERSON</small>
                            </p>
                            <p className={styles.extra}>
                              + ₹ {item.singleOccupantCharge} Single occupant
                            </p>
                          </div>

                          {/* STATUS */}
                          <div
                            className={`${styles.colmobileLastChild} ${styles.col}`}
                          >
                            <span className={styles.available}>
                              {item.availability}
                            </span>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className={styles.colmobile}>
                          <button
                            onClick={() => handleBookNow(item)}
                            className={styles.bookBtn}
                          >
                            BOOK NOW
                          </button>
                        </div>
                      </div>
                    </React.Fragment>
                  ))
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {hasDepartureMonths && (
        <div className={styles.btnContainer}>
          {canShowPrev && (
            <div className={styles.btn} onClick={handlePrev}>
              <img src="/icons/left.svg" alt="Previous" />
            </div>
          )}
          {canShowNext && (
            <div className={styles.btn} onClick={handleNext}>
              <img src="/icons/right.svg" alt="Next" />
            </div>
          )}
        </div>
      )}
      </section>

      {showLogin && authView === "login" && (
        <LoginPopup
          onClose={() => {
            setShowLogin(false);
            setPendingDeparture(null);
          }}
          onNavigate={setAuthView}
        />
      )}

      {showLogin && authView === "signup" && (
        <SignupPopup
          onClose={() => {
            setShowLogin(false);
            setPendingDeparture(null);
          }}
          onNavigate={setAuthView}
        />
      )}
    </>
  );
};

export default UpcomingDepartures;

"use client";
import React from "react";
import Link from "next/link";
import styles from "./TourBookingHeroSection.module.css";

const TourBookingHeroSection = ({ data, onViewItinerary }) => {
  const fromLocation = data?.start_location?.name || "Mumbai";
  const toLocation = data?.end_location?.name || "Delhi";
  const title = data?.title || "Taj Mahal & The Treasures Of India 2026";
  const days = data?.duration_days || 14;
  const destinations =
    data?.destinations_count ||
    data?.destinations?.length ||
    data?.package_locations?.length ||
    7;
  const maxGuests = data?.max_travelers || data?.max_people || 24;
  const routeStops = Array.isArray(data?.package_itinerarie)
    ? [
        ...new Set(
          data.package_itinerarie
            .map((day) => day?.location?.city || day?.city)
            .filter(Boolean),
        ),
      ]
    : [];
  const routeLabel =
    routeStops.length > 1
      ? routeStops.join(" • ")
      : "Mumbai • Udaipur • Jaipur • Agra • Panna National Park • Khajuraho • Varanasi • Delhi";

  const imageUrl =
    data?.main_image?.formats?.large?.url ||
    data?.main_image?.formats?.small?.url ||
    data?.main_image?.formats?.thumbnail?.url ||
    data?.main_image?.url;

  const backgroundImage = imageUrl
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${imageUrl}`
    : "/tourList/cardItem1.jpg";

  const tags = Array.isArray(data?.package_type) && data.package_type.length
    ? data.package_type.slice(0, 3)
    : ["Nature", "Adventure", "Scenic Road Trips"];

  return (
    <section
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
      className={styles.tourBookingSection}
    >
      <div className={styles.overlay}></div>

      <div className={styles.topBar}>
        <Link href="/" aria-label="Go to home">
          <img className={styles.logo} src="/images/tour-logo.svg" alt="Target Tours" />
        </Link>
        <div className={styles.topActions}>
          <button type="button" className={styles.downloadButton}>
            Download The App
          </button>
          <button type="button" className={styles.signInButton}>
            Sign In
          </button>
        </div>
      </div>

      <div className={styles.heroContainer}>
        <div className={styles.container}>
          <div className={styles.copyBlock}>
            <div className={styles.tagsCont}>
              {tags.map((item) => (
                <span key={item} className={styles.tags}>
                  {item}
                </span>
              ))}
            </div>

            <div className={styles.fromToCont}>
              <span>{fromLocation}</span>
              <span aria-hidden="true">→</span>
              <span>{toLocation}</span>
            </div>

            <h1 className={styles.header}>{title}</h1>

            <p className={styles.routeLabel}>{routeLabel}</p>

            {/* <div className={styles.customizeBar}>
              <span aria-hidden="true"><img src="/images/shineStar.svg" alt="Customize" /></span>
              <p>Want to customize this iconic journey privately for your own personal group?</p>
              <button type="button" onClick={onViewItinerary}>
                Customize This Package
              </button>
            </div> */}

            
          </div>


          <div className={styles.statsContParent}>

          <div className={styles.statsPanel} aria-label="Tour summary">
            <div>
              <strong>{days}</strong>
              <span>Days</span>
            </div>
            <div>
              <strong>{destinations}</strong>
              <span>Destinations</span>
            </div>
            <div>
              <strong>{maxGuests}</strong>
              <span>Guests (Max)</span>
            </div>
          </div>
             </div>
        </div>
      </div>
    </section>
  );
};

export default TourBookingHeroSection;

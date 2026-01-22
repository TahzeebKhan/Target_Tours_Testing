"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Reservations.module.css";
import ActiveReservations from "@/app/profile_components/ActiveReservations";

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
const flightReservationData = [
  {
    id: "173826",
    hotel: "IndiGo (6E- 541)",
    fromTo: "DEL - BLR",
    checkIn: "7 Apr 2026, 06:00",
    checkOut: "7 Apr 2026, 08:40",
    guests: "4 Adults",
    status: "CONFIRMED",
    image: "/images/flightsReservations.png",
  },
  {
    id: "173826",
    hotel: "IndiGo (6E- 541)",
    fromTo: "DEL - BLR",
    checkIn: "17 Apr 2026, 06:00",
    checkOut: "7 Apr 2026, 08:40",
    guests: "4 Adults",
    status: "PENDING",
    image: "/images/flightsReservations.png",
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

export default function Reservations({
  onCheckDetails,
  activeTab,
  setActiveTab,
}) {
  // const [activeTab, setActiveTab] = useState("HOTEL BOOKING");
  // const { setMobileTitle, mobileTile } = useProfile();
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

import Image from "next/image";
import styles from "./FlightBooking.module.css";

const RESERVATIONS = [
  {
    id: "173826",
    flightName: "IndiGo 6E- 541",
    status: "Confirmed",
    checkIn: "12 Mar 2021",
    checkOut: "24 Mar 2025",
    guests: "4 Adults",
    fromTo: "DEL - BLR",
    image: "/images/flightsReservations.png",
  },
  {
    id: "173826",
    fromTo: "DEL - BLR",
    flightName: "IndiGo 6E- 541",
    status: "Confirmed",
    checkIn: "12 Mar 2021",
    checkOut: "24 Mar 2025",
    guests: "4 Adults",
    image: "/images/flightsReservations.png",
  },
];

const FlightBooking = ({ setMobileTitle, onCheckDetails }) => {
  return (
    <div>
      <div className={styles.cardList}>
        {RESERVATIONS.map((res, index) => (
          <section key={index} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.imageWrapper}>
                <Image
                  src={res.image}
                  alt={res.flightName}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className={styles.hotelInfo}>
                <div className={styles.h2Container}>
                  <h2 className={styles.hotelName}>{res.flightName}</h2>

                  <h2 className={styles.hotelName}>{res.fromTo}</h2>
                </div>

                <span className={styles.statusBadge}>{res.status}</span>
              </div>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailRow}>
                <span className={styles.label}>ID</span>
                <span className={styles.dash}>---------</span>

                <span className={styles.value}>{res.id}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Departure:</span>
                <span className={styles.dash}>---------</span>

                <span className={styles.value}>{res.checkIn}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Arrival:</span>
                <span className={styles.dash}>---------</span>

                <span className={styles.value}>{res.checkOut}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Passengers:</span>
                <span className={styles.dash}>---------</span>

                <span className={styles.value}>{res.guests}</span>
              </div>
              <button
                onClick={() => {
                  setMobileTitle?.("Booking Details");
                  onCheckDetails();
                }}
                className={styles.detailsButton}
              >
                Check Details
              </button>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default FlightBooking;

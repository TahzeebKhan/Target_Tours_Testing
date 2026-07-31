import Image from "next/image";
import styles from "./FlightBooking.module.css";

const FlightBooking = ({ setMobileTitle, onCheckDetails, reservations = [] }) => {
  const rows = reservations.map((reservation) => ({
    ...reservation,
    flightName: reservation.hotel,
  }));

  return (
    <div>
      <div className={styles.cardList}>
        {rows.map((res, index) => (
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

                <span
                  className={`${styles.statusBadge} ${
                    styles[String(res.status || "").toLowerCase()] || ""
                  }`}
                >
                  {res.status}
                </span>
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
                  onCheckDetails(res);
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

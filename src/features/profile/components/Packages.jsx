import Image from "next/image";
import styles from "./Packages.module.css";

const Packages = ({ setMobileTitle, onCheckDetails, reservations = [] }) => {
  return (
    <div>
      <div className={styles.cardList}>
        {reservations.map((res, index) => (
          <section key={index} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.imageWrapper}>
                <Image
                  src={res.image}
                  alt={res.hotel}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className={styles.hotelInfo}>
                <div className={styles.h2Container}>
                  <h2 className={styles.hotelName}>{res.hotel}</h2>
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
                <span className={styles.label}>Start Date:</span>
                <span className={styles.dash}>---------</span>

                <span className={styles.value}>{res.checkIn}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>End Date:</span>
                <span className={styles.dash}>---------</span>

                <span className={styles.value}>{res.checkOut}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Travellers:</span>
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

export default Packages;

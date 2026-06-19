import Image from "next/image";
import styles from "./CorporateReservationCard.module.css";
import { Download, Eye } from "lucide-react";
const CorporateReservationCard = ({ data }) => {
  return (
    <>
      {data.map((item, index) => (
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
                <span
                  className={`${styles.statusBadge} ${
                    styles[item.status.toLowerCase()]
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Booking ID</span>
                  <span className={styles.value}>{item.bkid}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Booked On</span>
                  <span className={styles.value}>{item.bkDate}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Amount Deducted</span>
                  <span className={`${styles.value} ${styles.valueBold}`}>{item.amt}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Location</span>
                  <span className={styles.value}>{item.location}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Check In</span>
                  <span className={styles.value}>{item.checkIn}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Check out: </span>
                  <span className={styles.value}>{item.checkOut}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Guest</span>
                  <span className={styles.value}>{item.guests}</span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.cardBottom}>
            <div className={styles.budgetUpdated}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 2H12"
                  stroke="#4A5565"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M4 5.33333H12"
                  stroke="#4A5565"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M4 8.66667L9.66667 14"
                  stroke="#4A5565"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M4 8.66667H6"
                  stroke="#4A5565"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M6 8.66667C10.4447 8.66667 10.4447 2 6 2"
                  stroke="#4A5565"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <p>Budget updated after this booking</p>
            </div>
            <div className={styles.bottomRightBtnsConatiner}>
              <button className={styles.viewBtn}>
                <Eye size={16} /> View
              </button>
              <button className={styles.pdfBtn}>
                <Download size={16} /> PDF
              </button>
              <button className={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
          {/* <div className={styles.actionsWrapper}>
            <div className={styles.statusGroup}>
              <span className={styles.idLabel}>ID {item.id}</span>
            </div>

            <button
              className={styles.checkDetails}
            >
              Check Details
            </button>
          </div> */}
        </article>
      ))}
    </>
  );
};

export default CorporateReservationCard;

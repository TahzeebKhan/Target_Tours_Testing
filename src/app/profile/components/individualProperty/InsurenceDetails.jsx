import styles from "./InsurenceDetails.module.css";
import { useState } from "react";
import Image from "next/image";
const InsurenceDetails = () => {
  const [isActive, setIsActive] = useState(true);
  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        {/* Header Section */}
        <header className={styles.header}>
          <div className={styles.hotelInfo}>
            <div className={styles.imageWrapper}>
              <Image
                src="/images/travelInsurenceThumbnail.png"
                alt="Hotel Arts Barcelona"
                fill
                className={styles.objectFit}
              />
            </div>
            <div className={styles.details}>
              <h1 className={styles.hotelName}>Worldwide Health Cover</h1>
              <p className={styles.textSecondary}>
                <span className={styles.infoLabel}>Plan Type:</span>
                <span className={styles.infoValue}>Single Trip</span>
              </p>

              <p className={styles.textSecondary}>
                <span className={styles.infoLabel}>Trip Type:</span>
                <span className={styles.infoValue}>International Trip</span>
              </p>

              <p className={styles.textSecondary}>
                <span className={styles.infoLabel}>Travellers:</span>
                <span className={styles.infoValue}>4 Adults</span>
              </p>
            </div>
          </div>

          <div className={styles.bookingMeta}>
            <div className={styles.metaBox}>
              <span className={styles.label}>Policy Start</span>
              <span className={styles.dateNumber}>14</span>
              <span className={styles.month}>August</span>
              {/* <div className={styles.timeWrapper}>
                <Image
                  src="/icons/alarm-clock.svg"
                  alt="Time"
                  width={18}
                  height={18}
                  className={styles.timeIcon}
                />
                <span className={styles.time}>14:00 </span>
              </div> */}
            </div>
            <div className={styles.divider} />
            <div className={styles.metaBox}>
              <span className={styles.label}>Policy End</span>
              <span className={styles.dateNumber}>19</span>
              <span className={styles.month}>August</span>
              {/* <div className={styles.timeWrapper}>
                <Image
                  src="/icons/alarm-clock.svg"
                  alt="Time"
                  width={18}
                  height={18}
                  className={styles.timeIcon}
                />
                <span className={styles.time}>08:00 </span>
              </div> */}
            </div>
            <div className={styles.divider} />
            <div className={styles.statusSection}>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`${styles.statusBadge} ${
                  isActive ? styles.active : ""
                }`}
              >
                CONFIRMED
              </button>
              <div className={styles.roomCount}>
                <div className={styles.countGroup}>
                  <span className={styles.label}>Duration</span>
                  <span className={styles.value}>5 Days</span>
                </div>
                {/* <span className={styles.slash}>/</span>
                <div className={styles.countGroup}>
                  <span className={styles.label}>Days</span>
                  <span className={styles.value}>5</span>
                </div> */}
              </div>
            </div>
          </div>
        </header>

        <div className={styles.detailsWrapper}>

            <section className={styles.summarySection}>
            <h2 className={styles.sectionTitle}>COVERAGE DETAILS</h2>
            <div className={styles.priceTable}>
              {[
                // { label: "₹2245.5 x 1 Room x 8 Nights", value: "₹ 64,126" },
                { label: "Medical Expenses", value: "₹ 64,126" },
                { label: "Emergency Hospitalization", value: "₹ 64,126" },
                { label: "Trip Cancellation", value: "₹ 64,126" },
                { label: "Trip Delay", value: "₹ 64,126" },
                { label: "Baggage Loss", value: "₹ 64,126" },
                { label: "Passport Loss", value: "₹ 64,126" },
                { label: "Personal Accident", value: "₹ 64,126" },
              ].map((item, idx) => (
                <div key={idx} className={styles.priceRow}>
                  <span className={styles.priceLabel}>{item.label}</span>
                  <span className={styles.textPrimary}>{item.value}</span>
                </div>
              ))}
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total Amount</span>
                <span className={styles.totalValue}>₹ 66,945</span>
              </div>
            </div>
          </section>

          {/* Booking Summary */}
          <section className={styles.summarySection}>
            <h2 className={styles.sectionTitle}>premium summary</h2>
            <div className={styles.priceTable}>
              {[
                // { label: "₹2245.5 x 1 Room x 8 Nights", value: "₹ 64,126" },
                { label: "Base Price", value: "₹ 64,126" },
                { label: "Discount", value: "₹ 64,126" },
                { label: "Coupon Discount", value: "₹ 64,126" },
                { label: "Taxes & Fees", value: "₹ 64,126" },
              ].map((item, idx) => (
                <div key={idx} className={styles.priceRow}>
                  <span className={styles.priceLabel}>{item.label}</span>
                  <span className={styles.textPrimary}>{item.value}</span>
                </div>
              ))}
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total Amount</span>
                <span className={styles.totalValue}>₹ 66,945</span>
              </div>
            </div>
          </section>

          {/* Passenger Details */}
          <section className={styles.passengerDetailsSection}>
            <div className={styles.passengerHeader}>
              <h2 className={styles.passengerTitle}>
                PASSENGER DETAILS{" "}
                <span className={styles.passengerCount}>4 Adults</span>
              </h2>
            </div>

            <div className={styles.passengerList}>
              {[
                { name: "Mr Ayush Kumar", status: "CONFIRMED" },
                { name: "Mr Ayush Kumar", status: "CONFIRMED" },
              ].map((passenger, index) => (
                <div key={index} className={styles.passengerRow}>
                  <div className={styles.passengerInfo}>
                    <div className={styles.passengerAvatar}>
                      <span className={styles.avatarIcon}>
                        <img src={"/images/passenger-avatar.png"} />
                      </span>
                    </div>
                    <span className={styles.passengerName}>
                      {passenger.name}
                    </span>
                  </div>

                  <span className={styles.passengerStatus}>
                    {passenger.status}
                  </span>
                </div>
              ))}
            </div>

            {/* <div className={styles.mealPlanInfo}>
              <span className={styles.mealLabel}>Meal Plan</span>
              <span className={styles.mealText}>
                There is no meal included in the rate for this flight.
              </span>
            </div> */}
          </section>

          {/* Footer Actions */}
          <footer className={styles.footerActions}>
            <button className={styles.btnSecondary}>CANCEL BOOKING</button>
            <button className={styles.btnPrimary}>DOWNLOAD INVOICE</button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default InsurenceDetails;

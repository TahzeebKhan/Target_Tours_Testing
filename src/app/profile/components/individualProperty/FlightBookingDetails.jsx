import { useState } from "react";
import styles from "./FlightBookingDetails.module.css";
import Image from "next/image";
import CancelBookingModal from "./CancelBookingModal";
const FlightBookingDetails = ({ onBack }) => {
  const [isActive, setIsActive] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const openCancelModal = () => setShowCancelModal(true);
  const closeCancelModal = () => setShowCancelModal(false);

  const isCorporate = false;
  return (
    <>
      {" "}
      <div className={styles.container}>
        <div className={styles.innerContainer}>
          {onBack && (
            <button
              type="button"
              className={styles.backButton}
              onClick={onBack}
            >
              <span aria-hidden="true">←</span>
              Back
            </button>
          )}

          {/* Header Section */}
          <header className={styles.header}>
            <div className={styles.hotelInfo}>
              <div className={styles.imageWrapper}>
                <Image
                  src="/images/flightsReservations.png"
                  alt="Hotel Arts Barcelona"
                  fill
                  className={styles.objectFit}
                />
              </div>
              <div className={styles.details}>
                <h1 className={styles.hotelName}>
                  IndiGo 6E- 541 <span>DEL - BLR</span>
                </h1>
                <p className={styles.textSecondary}>
                  <span className={styles.infoLabel}>Address:</span>
                  <span className={styles.infoValue}>
                    Marina, 19-21, Ciutat Vella, 08005 Barcelona, Spain
                  </span>
                </p>

                <p className={styles.textSecondary}>
                  <span className={styles.infoLabel}>Phone:</span>
                  <span className={styles.infoValue}>+38 540 979 5428</span>
                </p>

                <p className={styles.textSecondary}>
                  <span className={styles.infoLabel}>GPS coordinates:</span>
                  <span className={styles.infoValue}>
                    N 040* 50.963, E 14* 15.348
                  </span>
                </p>
              </div>
            </div>

            <div className={styles.bookingMeta}>
              <div className={styles.metaBox}>
                <span className={styles.label}>Departure</span>
                <span className={styles.dateNumber}>14</span>
                <span className={styles.month}>August</span>
                <div className={styles.timeWrapper}>
                  <Image
                    src="/icons/alarm-clock.svg"
                    alt="Time"
                    width={18}
                    height={18}
                    className={styles.timeIcon}
                  />
                  <span className={styles.time}>14:00 </span>
                </div>
              </div>
              <div className={styles.divider} />
              <div className={styles.metaBox}>
                <span className={styles.label}>Arrival</span>
                <span className={styles.dateNumber}>19</span>
                <span className={styles.month}>August</span>
                <div className={styles.timeWrapper}>
                  <Image
                    src="/icons/alarm-clock.svg"
                    alt="Time"
                    width={18}
                    height={18}
                    className={styles.timeIcon}
                  />
                  <span className={styles.time}>08:00 </span>
                </div>
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
                    <span className={styles.label}>PNR</span>
                    <span className={styles.value}>E0267</span>
                  </div>
                  {/* <span className={styles.slash}>/</span>
                <div className={styles.countGroup}>
                  <span className={styles.label}>Nights</span>
                  <span className={styles.value}>5</span>
                </div> */}
                </div>
              </div>
            </div>
          </header>

          <div className={styles.detailsWrapper}>
            {/* About Section */}
            {/* Flight Summary */}
            <section className={styles.flightSummarySection}>
              <h2 className={styles.flightSummaryTitle}>FLIGHT SUMMARY</h2>

              <div className={styles.flightSummaryCard}>
                {/* Departure */}
                <div className={styles.flightPoint}>
                  <span className={styles.flightLabel}>Departure</span>
                  <h3 className={styles.flightCity}>New Delhi (DEL)</h3>
                  <p className={styles.flightDate}>Thu, 18 Dec 2025</p>
                  <p className={styles.flightTerminal}>
                    Terminal 3 Indira Gandhi Airport, Delhi
                  </p>
                </div>

                {/* Timeline */}
                <div className={styles.flightTimeline}>
                  <div className={styles.flightPath}>
                    <span className={styles.pathDot} />
                    <span className={styles.pathLine} />
                    <span className={styles.flightIcon}>
                      <img src={"/icons/flightIcon.svg"} alt="flight" />
                    </span>
                    <span className={styles.pathLine} />
                    <span className={styles.pathDot} />
                  </div>
                  <span className={styles.flightDuration}>01 h 30 m</span>
                </div>

                {/* Arrival */}
                <div
                  className={`${styles.flightPoint} ${styles.flightPointRight}`}
                >
                  <span className={styles.flightLabel}>Arrival</span>
                  <h3 className={styles.flightCity}>Bengaluru (BLR)</h3>
                  <p className={styles.flightDate}>Thu, 18 Dec 2025</p>
                  <p className={styles.flightTerminal}>
                    Terminal 2 Kempegowda Airport, Bengaluru
                  </p>
                </div>
              </div>
            </section>

            {/* Booking Summary */}
            <section className={styles.summarySection}>
              <h2 className={styles.sectionTitle}>BOOKING SUMMARY</h2>
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

              <div className={styles.mealPlanInfo}>
                <span className={styles.mealLabel}>Meal Plan</span>
                <span className={styles.mealText}>
                  There is no meal included in the rate for this flight.
                </span>
              </div>
            </section>

            {/* Footer Actions */}
            <footer className={styles.footerActions}>
              <button onClick={openCancelModal} className={styles.btnSecondary}>
                CANCEL BOOKING
              </button>
              <button className={styles.btnPrimary}>DOWNLOAD INVOICE</button>
            </footer>
          </div>
        </div>
      </div>
      {showCancelModal && (
        <CancelBookingModal
          airline="Air India"
          route="DEL to BOM"
          bookingId="BK001234"
          onClose={closeCancelModal}
        />
      )}
    </>
  );
};

export default FlightBookingDetails;

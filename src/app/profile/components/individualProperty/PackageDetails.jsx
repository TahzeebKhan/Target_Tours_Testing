import styles from "./PackageDetails.module.css";
import { useState } from "react";
import Image from "next/image";

const getPassengerName = (passenger) =>
  passenger?.full_name ||
  [passenger?.title, passenger?.first_name, passenger?.last_name]
    .filter(Boolean)
    .join(" ") ||
  passenger?.name ||
  "Passenger";

const getPassengerCountLabel = (passengers = [], fallbackCount) => {
  const count = passengers.length || Number(fallbackCount) || 0;
  if (!count) return "0 Travellers";
  return `${count} Traveller${count > 1 ? "s" : ""}`;
};

const getDateParts = (value) => {
  if (!value || value === "N/A") {
    return { day: "N/A", month: "" };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const [day, month] = String(value).split(" ");
    return { day: day || "N/A", month: month || "" };
  }

  return {
    day: date.toLocaleDateString("en-GB", { day: "numeric" }),
    month: date.toLocaleDateString("en-GB", { month: "long" }),
  };
};

const PackageDetails = ({ booking, onBack }) => {
  const [isActive, setIsActive] = useState(true);
  const passengers = booking?.passengers?.length ? booking.passengers : [];
  const passengerCountLabel = getPassengerCountLabel(
    passengers,
    booking?.passengerCount,
  );
  const fallbackPassengerCount = Number(booking?.passengerCount) || 0;
  const displayPassengers = passengers.length
    ? passengers
    : Array.from({ length: fallbackPassengerCount }, (_, index) => ({
        full_name: `Passenger ${index + 1}`,
      }));
  const packageName = booking?.packageName || booking?.hotel || "Package";
  const packageImage = booking?.image || "/images/packages.png";
  const status = booking?.status || "CONFIRMED";
  const startDate = booking?.checkIn || "N/A";
  const endDate = booking?.checkOut || "N/A";
  const startDateParts = getDateParts(startDate);
  const endDateParts = getDateParts(endDate);

  return (
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
                src={packageImage}
                alt={packageName}
                fill
                className={styles.objectFit}
              />
            </div>
            <div className={styles.details}>
              <h1 className={styles.hotelName}>{packageName}</h1>
              <p className={styles.textSecondary}>
                <span className={styles.infoLabel}>Date:</span>
                <span className={styles.infoValue}>
                  {startDate} - {endDate}
                </span>
              </p>

              <p className={styles.textSecondary}>
                <span className={styles.infoLabel}>Travellers:</span>
                <span className={styles.infoValue}>{passengerCountLabel}</span>
              </p>

              <p className={styles.textSecondary}>
                <span className={styles.infoLabel}>Package Type:</span>
                <span className={styles.infoValue}>Couple Package</span>
              </p>
            </div>
          </div>

          <div className={styles.bookingMeta}>
            <div className={styles.metaBox}>
              <span className={styles.label}>Start Date</span>
              <span className={styles.dateNumber}>{startDateParts.day}</span>
              <span className={styles.month}>{startDateParts.month}</span>
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
              <span className={styles.label}>End Date</span>
              <span className={styles.dateNumber}>{endDateParts.day}</span>
              <span className={styles.month}>{endDateParts.month}</span>
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
                {status}
              </button>
              <div className={styles.roomCount}>
                <div className={styles.countGroup}>
                  <span className={styles.label}>Nights</span>
                  <span className={styles.value}>5</span>
                </div>
                <span className={styles.slash}>/</span>
                <div className={styles.countGroup}>
                  <span className={styles.label}>Days</span>
                  <span className={styles.value}>5</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.detailsWrapper}>
          {/* About Section */}
          {/* Flight Summary */}
          <section className={styles.flightSummarySection}>
            <h2 className={styles.flightSummaryTitle}>About this holiday</h2>
            <h3 className={styles.flightsHead}>Flights</h3>
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

            <div className={styles.br} />

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
          <section className={styles.aboutSection}>
            <div className={styles.description}>
              <h2 className={styles.sectionTitle}>ABOUT THIS PROPERTY</h2>
              <h3 className={styles.subTitle}>
                2 guests · Studio · 1 bed · 1.5 baths
              </h3>
              <p className={`${styles.textSecondary} ${styles.textSecondary2}`}>
                Welcome to my fully refurbished 17 m² studio, ideally located in
                Versailles, only a 10-minute walk to the Palace of Versailles
                and a 5-minute walk to the Rive Gauche train station.
              </p>
            </div>
            <div className={styles.mapWrapper}>
              <Image
                src="/images/map-view.png"
                alt="Map Location"
                fill
                className={styles.objectFit}
              />

              {/* Map Pin Icon */}
              <Image
                src="/icons/map-pin.svg"
                alt="Location Pin"
                width={24}
                height={28}
                className={styles.mapPin}
              />
            </div>
          </section>

          {/* Activities & Transfers */}
          <section className={styles.activitiesSection}>
            <h2 className={styles.activitiesTitle}>Activities & Transfers</h2>

            <ul className={styles.activitiesList}>
              <li className={styles.activityItem}>Airport Transfers</li>
              <li className={styles.activityItem}>Full Day Island Tour</li>
              <li className={styles.activityItem}>Snorkelling Trip</li>
              <li className={styles.activityItem}>Sunset Dolphin Cruise</li>
            </ul>
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
                <span className={styles.passengerCount}>
                  {passengerCountLabel}
                </span>
              </h2>
            </div>

            <div className={styles.passengerList}>
              {displayPassengers.map((passenger, index) => (
                <div key={index} className={styles.passengerRow}>
                  <div className={styles.passengerInfo}>
                    <div className={styles.passengerAvatar}>
                      <span className={styles.avatarIcon}>
                        <img src={"/images/passenger-avatar.png"} />
                      </span>
                    </div>
                    <span className={styles.passengerName}>
                      {getPassengerName(passenger)}
                    </span>
                  </div>

                  <span className={styles.passengerStatus}>
                    {passenger.status || status}
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

export default PackageDetails;

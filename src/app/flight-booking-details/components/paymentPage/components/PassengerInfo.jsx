import styles from "./PassengerInfo.module.css";
import { useFlightBooking } from "@/app/flight-booking-details/FlightBookingContext";

const GENDER_MAP = {
  M: "MALE",
  F: "FEMALE",
};

const TYPE_MAP = {
  ADT: "Adult",
  CHD: "Child",
  INF: "Infant",
};

const getGenderFromTitle = (traveler) => {
  const title = String(traveler?.Title || "").trim().toUpperCase();
  if (title === "MR") return "MALE";
  if (title === "MS" || title === "MRS") return "FEMALE";

  const gender = String(traveler?.Gender || "").trim().toUpperCase();
  return GENDER_MAP[gender] || (gender === "MALE" || gender === "FEMALE" ? gender : "N/A");
};

const formatPassengerName = (traveler) => {
  const typeLabel = TYPE_MAP[traveler?.PTC] || traveler?.PTC || "Passenger";
  return `${traveler?.Title || ""} ${traveler?.FName || ""} ${traveler?.LName || ""} (${typeLabel})`
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
};

const PassengerInfo = () => {
  const { travelerDetails, bookingContactDetails } = useFlightBooking();
  const travelers = Array.isArray(travelerDetails)
    ? travelerDetails
    : [];
  const contact = bookingContactDetails || {};

  const passengers = travelers.map((traveler) => ({
    name: formatPassengerName(traveler),
    gender: getGenderFromTitle(traveler),
    email: traveler?.Email || contact?.Email || "N/A",
    contact: traveler?.MobileNumber || contact?.MobileNumber || "N/A",
    type: TYPE_MAP[traveler?.PTC] || traveler?.PTC || "Passenger",
  }));

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.table}>
          <div className={`${styles.row} ${styles.header}`}>
            <span>NAME</span>
            <span>GENDER</span>
            <span>EMAIL</span>
            <span>CONTACT NUMBER</span>
          </div>

          <div className={styles.tableBody}>
            {passengers.map((passenger, index) => (
              <div key={index} className={styles.row}>
                <span title={passenger.name}>{passenger.name}</span>
                <span title={passenger.gender}>{passenger.gender}</span>
                <span title={passenger.email}>{passenger.email}</span>
                <span title={passenger.contact}>{passenger.contact}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <span className={styles.footerLabel}>
            Booking details will be sent to
          </span>

          <div className={styles.footerRight}>
            <span className={styles.primary}>
              {(contact?.FName || contact?.Email || "Primary Contact")}
              {travelers.length > 0
                ? ` (primary), +${Math.max(travelers.length - 1, 0)} Traveller`
                : ""}
            </span>
            <span className={styles.secondary}>
              {[contact?.Email, contact?.MobileNumber].filter(Boolean).join(", ") || "N/A"}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.wrapperMobile}>
        {passengers.map((passenger, index) => (
          <div key={index}>
            <div
              className={`${styles.passengerItemMobile} ${
                index !== passengers.length - 1 ? styles.withBorderMobile : ""
              }`}
            >
              <div className={styles.leftMobile}>
                <p className={styles.nameMobile}>{passenger.name}</p>
                <p className={styles.metaMobile}>
                  {passenger.type}
                  <span className={styles.dotMobile}></span>
                  {passenger.gender}
                </p>
              </div>

              <div className={styles.rightMobile}>
                <p className={styles.emailMobile}>{passenger.email}</p>
                <p className={styles.phoneMobile}>{passenger.contact}</p>
              </div>
            </div>
            {index !== passengers.length - 1 && (
              <div className={styles.dashedBorder} />
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default PassengerInfo;

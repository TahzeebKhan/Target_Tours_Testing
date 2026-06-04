import { useFlightBooking } from "../../../FlightBookingContext";
import styles from "./PassengerInfo.module.css";

const formatName = (traveler, index) => {
  const name = [traveler?.first_name, traveler?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return `${name || `Traveler ${index + 1}`} (ADULT)`;
};

const formatContact = (traveler) =>
  [traveler?.country_code, traveler?.phone_no].filter(Boolean).join(" ");

const formatBookingContact = (contactInfo) =>
  [contactInfo?.country_code, contactInfo?.mobile_number]
    .filter(Boolean)
    .join(" ");

const PassengerInfo = () => {
  const { travelerDetails: travelers, bookingContactInfo } = useFlightBooking();
  const primaryTraveler = travelers?.[0] || {};
  const companionCount = Math.max((travelers?.length || 1) - 1, 0);
  const bookingContact = formatBookingContact(bookingContactInfo);

  return (
    <div className={styles.wrapper}>
      {/* TABLE */}
      <div className={styles.table}>
        <div className={`${styles.row} ${styles.header}`}>
          <span>NAME</span>
          <span>GENDER</span>
          <span>EMAIL</span>
          <span>CONTACT NUMBER</span>
        </div>

        {travelers.map((traveler, index) => (
          <div key={traveler.id || index} className={styles.row}>
            <span>{formatName(traveler, index)}</span>
            <span>{traveler.gender || "-"}</span>
            <span>{traveler.email || "-"}</span>
            <span>{formatContact(traveler) || "-"}</span>
          </div>
        ))}
      </div>

      {/* FOOTER INFO */}
      <div className={styles.footer}>
        <span className={styles.footerLabel}>
          Booking details will be sent to
        </span>

        <div className={styles.footerRight}>
          <span className={styles.primary}>
            {formatName(primaryTraveler, 0).replace(" (ADULT)", "")}
            {companionCount > 0 ? ` (primary), +${companionCount} Traveller` : " (primary)"}
          </span>
          <span className={styles.secondary}>
            {[bookingContactInfo.email, bookingContact]
              .filter(Boolean)
              .join(", ") || "-"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PassengerInfo;

import React from "react";
import styles from "./FlightFacilities.module.css";

const facilitiesData = [
  {
    id: 1,
    icon: "/icons/baggage.svg",
    text: "Baggage 20 kg, Cabin Baggage 7kg",
  },
  {
    id: 2,
    icon: "/icons/entertainment.svg",
    text: "In-flight entertainment",
  },
  {
    id: 3,
    icon: "/icons/flightMeal.svg",
    text: "In-flight meal",
  },
  {
    id: 4,
    icon: "/icons/usbPort.svg",
    text: "Power & USB Port",
  },
];

const FlightFacilities = ({ title = "Facilities", facilities = facilitiesData, className }) => {
  return (
    <div className={styles.flightDepartureFacilities}>
      <h3 className={styles.flightDepartureFacilitiesHeader}>{title}</h3>

      <div className={`${styles.flightDepartureFacilitiesList} ${className}`}>
        {facilities.map((item) => (
          <div key={item.id} className={styles.flightDepartureFacilitiesItem}>
            <img src={item.icon} alt={item.text} />
            <p className={styles.facilitiesText}>{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlightFacilities;

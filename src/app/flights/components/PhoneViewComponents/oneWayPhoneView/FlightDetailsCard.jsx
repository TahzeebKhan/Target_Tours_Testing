import React from 'react'
import styles from './FlightDetailsCard.module.css'
import FlightTimingDetail from '@/app/tour-booking/components/arrivalToronto/flightTimingDetails/FlightTimingDetail';


const FlightDetailsCard = ({ flight }) => {
  // Get the first airline (or handle multiple airlines)
  const primaryAirline = flight.airlines[0];
  const airlineNames = flight.airlines.map(a => a.name).join(', ');
  const airlineCodes = flight.airlines.map(a => a.code).join(', ');

  return (
    <div className={styles.mobileFlightContainer}>
      <div className={styles.flightDetails}>
        <div className={styles.flightDetailsLeft}>
          <img className={styles.flightLogo} src={primaryAirline.logo} alt={primaryAirline.name} />
          <div className={styles.flightDetailsLeftText}>
            <span className={styles.flightName}>{airlineNames}</span>
            <span className={styles.flightCode}>{airlineCodes}</span>
          </div>
        </div>
        <div className={styles.bookingPrice}>{flight.fare.totalFare}</div>
      </div>
      <FlightTimingDetail flight={flight} />
    </div>
  )
}

export default FlightDetailsCard
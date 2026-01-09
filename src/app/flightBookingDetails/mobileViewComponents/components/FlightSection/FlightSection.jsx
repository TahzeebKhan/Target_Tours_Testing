import React from 'react'
import styles from './FlightSection.module.css'
import FlightFacilities from '../flightFacilities/FlightFacilities'

const FlightSection = () => {
  return (
    <div className={styles.FlightSection}>
      <h2>DEPARTURE</h2>
      <div className={styles.FlightSectionDetails}>
        <div className={styles.FlightSectionDetailsTop}>
          <div className={styles.aboutFlightContainer}>
            <div className={styles.aboutFlightContainerLeft}>
              <img
                className={styles.flightIcon}
                src="/images/GarudaIndonesia.png"
              // alt={flight.airline.name}
              />
              <div className={styles.flightInfoTextContainer}>
                <div className={styles.flightInfoTextTitle}>
                  Garuda Indonesia
                  <span> (6E- 541)</span>
                </div>
                <div className={styles.flightInfoTextChips}>
                  Boeing 737
                </div>
              </div>
            </div>
            <div className={styles.aboutFlightContainerRight}>
              <div className={styles.flightInfomClass}>
                <div className={`${styles.economyChip}`}>Economy</div>
                <div className={`${styles.flexiPlusFare}`}>Flexi Plus Fare</div>
              </div>
              <div className={styles.dashedLine}></div>
              <span className={styles.flightDate}>Thu, 06 Jul 2025</span>
            </div>
          </div>

          <div className={styles.flightDateTimeLine}>
            <div className={styles.flightDateTimeLineLeft}>
              <span className={styles.time}>10:30</span>
              <div className={styles.flightAnimation}>
                <div className={styles.dotDashed}>
                  <div className={styles.dot}></div>
                  <img src="/icons/flightDash.svg" alt="" />
                </div>
                <img src="/icons/flightIcon.svg" alt="" />
                <div className={styles.dotDashed}>
                  <img src="/icons/flightDash.svg" alt="" />
                  <div className={styles.dot}></div>
                  
                </div>
                
              </div>
              <span className={styles.time}>10:30</span>
            </div>
            <div className={styles.flightDateTimeLineRight}>
              <span className={styles.airPortName}>Jakarta (JKTC)</span>
              <div className={styles.flightDateTimeLineRightDetails}>
                <p>01 <span>h</span> 50 <span>m</span></p>
                <div className={styles.smallDot}></div>
                <span className={styles.direct}>Direct</span>
              </div>
              <span className={styles.airPortName}>Surabaya (SUB)</span>
            </div>
          </div>
        </div>
      </div>
      <FlightFacilities />
    </div>
  )
}

export default FlightSection
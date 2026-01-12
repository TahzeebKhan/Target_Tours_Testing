"use client"
import TripDetailsHeader from '@/app/components/tripDetailsHeader/TripDetailsHeader'
import React, { useState } from 'react'
import styles from './TravelerDetailsMobileView.module.css'

const TravelerDetailsMobileView = () => {
  const [travelers, setTravelers] = useState([1]); // start with 1 traveler

  // ➕ Add Traveler
  const addTraveler = () => {
    setTravelers(prev => [...prev, prev.length + 1]);
  };

  // ➖ Remove Traveler
  const removeTraveler = (index) => {
    setTravelers(prev => prev.filter((_, i) => i !== index));
  };
  return (
    <div className={styles.TriipWrapper}>
      <TripDetailsHeader title='Passenger Info' />
      <div className={styles.tripDetailsContainer}>
        <div className={styles.tripDetailsHeader}>
          <h2 className={styles.heading}>TRAVELER Details</h2>
          <div className={styles.addTraveler} onClick={addTraveler}>
            +Add Traveler
          </div>
        </div>

        {travelers.map((traveler, index) => (
          <div key={traveler} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>TRAVELER {index + 1} - ADULT</h3>

              {/* Remove button (hide for first traveler) */}
              {index > 0 && (
                <span
                  className={styles.collapse}
                  onClick={() => removeTraveler(index)}
                  style={{ cursor: "pointer" }}
                >
                  —
                </span>
              )}
            </div>

            <div className={styles.cardBody}>
              <div className={styles.grid}>
                <div className={styles.field}>
                  <label className={styles.label}>First Name</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Enter First Name"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Last Name</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Enter Last Name"
                  />
                </div>

                <div className={`${styles.field} ${styles.selectField}`}>
                  <label className={styles.label}>Gender</label>
                  <select className={styles.select} defaultValue="">
                    <option value="" disabled hidden>Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className={styles.grid}>
                <div className={styles.field}>
                  <label className={styles.label}>Country Code</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Country Code (optional)"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Mobile Number</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Mobile number (optional)"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input
                    className={styles.input}
                    type="email"
                    placeholder="Email (Optional)"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Booking Details */}
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>
            BOOKING DETAILS WILL BE SENT TO
          </h3>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Country Code</label>
              <input
                className={`${styles.input} ${styles.bookingInput}`}
                placeholder="Country Code (optional)"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Mobile Number</label>
              <input
                className={`${styles.input} ${styles.bookingInput}`}
                placeholder="Mobile number (optional)"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                className={`${styles.input} ${styles.bookingInput}`}
                placeholder="Email (Optional)"
              />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        {/* LEFT */}
        <div className={styles.footerContainer}>
          <div className={styles.amountSection}>
            <div className={styles.Btnlabel}>
              Total Amount
              <span className={styles.infoIcon}>!</span>
            </div>
            <div className={styles.amount}>₹ 66,945</div>
          </div>

          {/* RIGHT */}
          <button
            onClick={() => setCurrentStep(3)}
            className={styles.continueBtn}
          >
            CONTINUE BOOKING
          </button>
        </div>
      </div>
    </div>
  )
}

export default TravelerDetailsMobileView
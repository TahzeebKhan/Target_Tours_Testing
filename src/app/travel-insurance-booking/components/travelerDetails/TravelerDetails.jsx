import React, { useState } from "react";
import styles from "./TravelerDetails.module.css";
import { useFlightBooking } from "../../FlightBookingContext";

const TravelerDetails = () => {
    const [travelers, setTravelers] = useState([1, 2, 3]); // start with 1 traveler
    const { setCurrentStep } = useFlightBooking();

    // ➕ Add Traveler
    // const addTraveler = () => {
    //     setTravelers(prev => [...prev, prev.length + 1]);
    // };

    // ➖ Remove Traveler
    const removeTraveler = (index) => {
        setTravelers(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div>
            <div className={styles.wrapper}>
                <div className={styles.heading}>
                    ADD TRAVELLER DETAILS
                </div>
                {/* Add Traveler */}
                {/* <div className={styles.addTraveler} onClick={addTraveler}>
                +Add Traveler
            </div> */}

                {/* Traveler Cards */}
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
            </div>

             <div
                onClick={() => setCurrentStep(4)}
                className={styles.continueButtonContainer}
            >
                <button className={styles.continueButton}>CONTINUE</button>
            </div>
        </div>
    );
};

export default TravelerDetails;

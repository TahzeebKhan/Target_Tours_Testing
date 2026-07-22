import React from "react";
import styles from "./TravelerDetails.module.css";
import { useFlightBooking } from "../../FlightBookingContext";

const TravelerDetails = () => {
    const {
        setCurrentStep,
        travelerDetails: travelers,
        setTravelerDetails: setTravelers,
        setBookingContactInfo,
    } = useFlightBooking();

    // ➕ Add Traveler
    // const addTraveler = () => {
    //     setTravelers(prev => [...prev, prev.length + 1]);
    // };
    const addTraveler = () => {
        setTravelers(prev => [
            ...prev,
            {
                id: Math.max(0, ...prev.map((traveler) => Number(traveler.id) || 0)) + 1,
                isOpen: true,
                first_name: "",
                last_name: "",
                gender: "",
                country_code: "+91",
                phone_no: "",
                email: "",
            }
        ]);
    };


    const toggleTraveler = (index) => {
        setTravelers(prev =>
            prev.map((t, i) =>
                i === index
                    ? { ...t, isOpen: !t.isOpen }
                    : t
            )
        );
    };

    const updateTravelerField = (index, field, value) => {
        setTravelers(prev => {
            const nextTravelers = prev.map((traveler, travelerIndex) =>
                travelerIndex === index ? { ...traveler, [field]: value } : traveler
            );
            const primaryTraveler = nextTravelers[0] || {};
            setBookingContactInfo({
                country_code: primaryTraveler.country_code || "+91",
                mobile_number: primaryTraveler.phone_no || "",
                email: primaryTraveler.email || "",
            });
            return nextTravelers;
        });
    };

    return (
        <>
            <div className={styles.wrapper}>
                {/* Add Traveler */}
                <div className={styles.topAddTravelerWrapper}>
                    <div className={styles.addTravellerHeading}>
                        ADD TRAVELLER DETAILS
                    </div>
                    <div className={styles.addTraveler} onClick={addTraveler}>

                        +Add Traveler
                    </div>
                </div>

                {/* Traveler Cards */}
                <div className={styles.travelerCards}>
                    {travelers.map((traveler, index) => (
                        <div key={traveler.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h3>TRAVELER {index + 1} - ADULT</h3>

                                {/* Remove button (hide for first traveler) */}
                                {/* {index > 0 && ( */}
                                {/* <span
                                className={styles.collapse}
                                // onClick={() => removeTraveler(index)}
                                onClick={() => toggleTraveler(index)}
                            >
                                {traveler.isOpen ? "—" : "+"}
                            </span> */}
                                {/* )} */}

                                <span className={styles.iconWrapper} onClick={() => toggleTraveler(index)}>
                                    <span className={`${styles.icon} ${traveler.isOpen ? styles.hide : styles.show}`}>
                                        +
                                    </span>
                                    <span className={`${styles.icon} ${traveler.isOpen ? styles.show : styles.hide}`}>
                                        —
                                    </span>
                                </span>
                            </div>

                            <div
                                className={`${styles.cardBody} ${traveler.isOpen ? styles.open : styles.closed
                                    }`}
                            >
                                <div className={styles.grid}>
                                    <div className={styles.field}>
                                        <label className={styles.label}>First Name</label>
                                        <input
                                            className={styles.input}
                                            type="text"
                                            placeholder="Enter First Name"
                                            value={traveler.first_name || ""}
                                            onChange={(event) =>
                                                updateTravelerField(index, "first_name", event.target.value)
                                            }
                                        />
                                    </div>

                                    <div className={styles.field}>
                                        <label className={styles.label}>Last Name</label>
                                        <input
                                            className={styles.input}
                                            type="text"
                                            placeholder="Enter Last Name"
                                            value={traveler.last_name || ""}
                                            onChange={(event) =>
                                                updateTravelerField(index, "last_name", event.target.value)
                                            }
                                        />
                                    </div>

                                    <div className={`${styles.field} ${styles.selectField}`}>
                                        <label className={styles.label}>Gender</label>
                                        <select
                                            className={styles.select}
                                            value={traveler.gender || ""}
                                            onChange={(event) =>
                                                updateTravelerField(index, "gender", event.target.value)
                                            }
                                        >
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
                                            value={traveler.country_code || ""}
                                            onChange={(event) =>
                                                updateTravelerField(index, "country_code", event.target.value)
                                            }
                                        />
                                    </div>

                                    <div className={styles.field}>
                                        <label className={styles.label}>Mobile Number</label>
                                        <input
                                            className={styles.input}
                                            type="text"
                                            placeholder="Mobile number (optional)"
                                            value={traveler.phone_no || ""}
                                            onChange={(event) =>
                                                updateTravelerField(index, "phone_no", event.target.value)
                                            }
                                        />
                                    </div>

                                    <div className={styles.field}>
                                        <label className={styles.label}>Email</label>
                                        <input
                                            className={styles.input}
                                            type="email"
                                            placeholder="Email (Optional)"
                                            value={traveler.email || ""}
                                            onChange={(event) =>
                                                updateTravelerField(index, "email", event.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}

                    {/* Booking Details */}
                    {/* <div className={styles.card}>
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
            </div> */}
                </div>

            </div>
            <div
                onClick={() => setCurrentStep(4)}
                className={styles.continueButtonContainer}
            >
                <button className={styles.continueButton}>CONTINUE</button>
            </div>

        </>
    );
};

export default TravelerDetails;

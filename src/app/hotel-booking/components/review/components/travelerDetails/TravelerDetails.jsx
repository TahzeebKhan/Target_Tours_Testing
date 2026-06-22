import React, { useEffect, useState } from "react";
import styles from "./TravelerDetails.module.css";

const createTraveler = () => ({
    title: "Mr",
    firstName: "",
    lastName: "",
    gender: "",
    countryCode: "",
    mobile: "",
    email: "",
});

const fallbackRooms = [{ id: "default-room", title: "Room" }];

const TravelerDetails = ({ rooms = [], onChange }) => {
    const [roomGuests, setRoomGuests] = useState({});
    const [bookingContact, setBookingContact] = useState({
        title: "Mr",
        firstName: "",
        lastName: "",
        countryCode: "",
        mobile: "",
        email: "",
        address: "",
        state: "",
        city: "",
        pin: "",
    });

    useEffect(() => {
        setRoomGuests(prev => {
            const next = {};
            const activeRooms = rooms.length ? rooms : fallbackRooms;
            let hasChanges = false;

            activeRooms.forEach(room => {
                if (prev[room.id]?.length) {
                    next[room.id] = prev[room.id];
                    return;
                }

                hasChanges = true;
                next[room.id] = [createTraveler()];
            });

            const prevKeys = Object.keys(prev);
            if (prevKeys.length !== activeRooms.length) {
                hasChanges = true;
            }

            if (!hasChanges) {
                return prev;
            }

            return next;
        });
    }, [rooms]);

    useEffect(() => {
        onChange?.({ roomGuests, bookingContact });
    }, [roomGuests, bookingContact, onChange]);

    // ➕ Add Traveler
    const addTraveler = (roomId) => {
        setRoomGuests(prev => ({
            ...prev,
            [roomId]: [...(prev[roomId] || []), createTraveler()],
        }));
    };

    // ➖ Remove Traveler
    const removeTraveler = (roomId, index) => {
        setRoomGuests(prev => ({
            ...prev,
            [roomId]: (prev[roomId] || []).filter((_, i) => i !== index),
        }));
    };

    const updateTraveler = (roomId, index, field, value) => {
        setRoomGuests(prev => ({
            ...prev,
            [roomId]: (prev[roomId] || []).map((traveler, travelerIndex) =>
                travelerIndex === index ? { ...traveler, [field]: value } : traveler,
            ),
        }));
    };

    const updateBookingContact = (field, value) => {
        setBookingContact(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className={styles.wrapper}>
            {/* Traveler Cards */}
            {(rooms.length ? rooms : fallbackRooms).map((room) => (
                <div key={room.id}>
                    <div className={styles.addTraveler} onClick={() => addTraveler(room.id)}>
                        +Add Guest for {room.title}
                    </div>

                    {(roomGuests[room.id] || [createTraveler()]).map((traveler, index) => (
                        <div key={`${room.id}-${index}`} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h3>{room.title} - GUEST {index + 1} - ADULT</h3>

                                {/* Remove button (hide for first traveler) */}
                                {index > 0 && (
                                    <span
                                        className={styles.collapse}
                                        onClick={() => removeTraveler(room.id, index)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        —
                                    </span>
                                )}
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.grid}>
                                    <div className={`${styles.field} ${styles.selectField}`}>
                                        <label className={styles.label}>Title</label>
                                        <select
                                            className={styles.select}
                                            required
                                            value={traveler.title}
                                            onChange={(event) =>
                                                updateTraveler(room.id, index, "title", event.target.value)
                                            }
                                        >
                                            <option value="Mr">Mr</option>
                                            <option value="Ms">Ms</option>
                                            <option value="Mrs">Mrs</option>
                                        </select>
                                    </div>

                                    <div className={styles.field}>
                                        <label className={styles.label}>First Name</label>
                                        <input
                                            className={styles.input}
                                            type="text"
                                            required
                                            value={traveler.firstName}
                                            onChange={(event) =>
                                                updateTraveler(room.id, index, "firstName", event.target.value)
                                            }
                                            placeholder="Enter First Name"
                                        />
                                    </div>

                                    <div className={styles.field}>
                                        <label className={styles.label}>Last Name</label>
                                        <input
                                            className={styles.input}
                                            type="text"
                                            required
                                            value={traveler.lastName}
                                            onChange={(event) =>
                                                updateTraveler(room.id, index, "lastName", event.target.value)
                                            }
                                            placeholder="Enter Last Name"
                                        />
                                    </div>

                                    <div className={`${styles.field} ${styles.selectField}`}>
                                        <label className={styles.label}>Gender</label>
                                        <select
                                            className={styles.select}
                                            required
                                            value={traveler.gender}
                                            onChange={(event) =>
                                                updateTraveler(room.id, index, "gender", event.target.value)
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
                                            value={traveler.countryCode}
                                            onChange={(event) =>
                                                updateTraveler(room.id, index, "countryCode", event.target.value)
                                            }
                                            placeholder="Country Code (optional)"
                                        />
                                    </div>

                                    <div className={styles.field}>
                                        <label className={styles.label}>Mobile Number</label>
                                        <input
                                            className={styles.input}
                                            type="text"
                                            value={traveler.mobile}
                                            onChange={(event) =>
                                                updateTraveler(room.id, index, "mobile", event.target.value)
                                            }
                                            placeholder="Mobile number (optional)"
                                        />
                                    </div>

                                    <div className={styles.field}>
                                        <label className={styles.label}>Email</label>
                                        <input
                                            className={styles.input}
                                            type="email"
                                            value={traveler.email}
                                            onChange={(event) =>
                                                updateTraveler(room.id, index, "email", event.target.value)
                                            }
                                            placeholder="Email (Optional)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}

            {/* Booking Details */}
            <div className={styles.card}>
                <h3 className={styles.sectionTitle}>
                    BOOKING DETAILS WILL BE SENT TO
                </h3>

                <div className={styles.grid}>
                    <div className={`${styles.field} ${styles.selectField}`}>
                        <label className={styles.label}>Title</label>
                        <select
                            className={styles.select}
                            required
                            value={bookingContact.title}
                            onChange={(event) =>
                                updateBookingContact("title", event.target.value)
                            }
                        >
                            <option value="Mr">Mr</option>
                            <option value="Ms">Ms</option>
                            <option value="Mrs">Mrs</option>
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>First Name</label>
                        <input
                            className={`${styles.input} ${styles.bookingInput}`}
                            required
                            value={bookingContact.firstName}
                            onChange={(event) =>
                                updateBookingContact("firstName", event.target.value)
                            }
                            placeholder="Enter First Name"
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Last Name</label>
                        <input
                            className={`${styles.input} ${styles.bookingInput}`}
                            required
                            value={bookingContact.lastName}
                            onChange={(event) =>
                                updateBookingContact("lastName", event.target.value)
                            }
                            placeholder="Enter Last Name"
                        />
                    </div>
                </div>

                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label className={styles.label}>Country Code</label>
                        <input
                            className={`${styles.input} ${styles.bookingInput}`}
                            required
                            value={bookingContact.countryCode}
                            onChange={(event) =>
                                updateBookingContact("countryCode", event.target.value)
                            }
                            placeholder="Country Code (optional)"
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Mobile Number</label>
                        <input
                            className={`${styles.input} ${styles.bookingInput}`}
                            required
                            value={bookingContact.mobile}
                            onChange={(event) =>
                                updateBookingContact("mobile", event.target.value)
                            }
                            placeholder="Mobile number (optional)"
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Email</label>
                        <input
                            className={`${styles.input} ${styles.bookingInput}`}
                            required
                            type="email"
                            value={bookingContact.email}
                            onChange={(event) =>
                                updateBookingContact("email", event.target.value)
                            }
                            placeholder="Email (Optional)"
                        />
                    </div>
                </div>

                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label className={styles.label}>Address</label>
                        <input
                            className={`${styles.input} ${styles.bookingInput}`}
                            required
                            value={bookingContact.address}
                            onChange={(event) =>
                                updateBookingContact("address", event.target.value)
                            }
                            placeholder="Enter Address"
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>State</label>
                        <input
                            className={`${styles.input} ${styles.bookingInput}`}
                            required
                            value={bookingContact.state}
                            onChange={(event) =>
                                updateBookingContact("state", event.target.value)
                            }
                            placeholder="Enter State"
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>City</label>
                        <input
                            className={`${styles.input} ${styles.bookingInput}`}
                            required
                            value={bookingContact.city}
                            onChange={(event) =>
                                updateBookingContact("city", event.target.value)
                            }
                            placeholder="Enter City"
                        />
                    </div>
                </div>

                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label className={styles.label}>PIN</label>
                        <input
                            className={`${styles.input} ${styles.bookingInput}`}
                            required
                            value={bookingContact.pin}
                            onChange={(event) =>
                                updateBookingContact("pin", event.target.value)
                            }
                            placeholder="Enter PIN"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TravelerDetails;

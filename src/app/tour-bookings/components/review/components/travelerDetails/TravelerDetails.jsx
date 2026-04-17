import React, { useEffect, useMemo, useState } from "react";
import styles from "./TravelerDetails.module.css";
import { useTourBooking } from "@/app/tour-bookings/TourBookingContext";
import { useAuth } from "@/app/context/AuthContext";
import { getPassengers } from "@/shared/services/passenger";
import Cookies from "js-cookie";

const normalizePassengers = (payload) => {
    const source =
        payload?.data?.data ||
        payload?.data ||
        payload?.passengers ||
        payload ||
        [];

    if (!Array.isArray(source)) return [];

    return source.map((passenger) => ({
        id: passenger?.id ?? passenger?.documentId,
        title: passenger?.title || "Mr",
        first_name: passenger?.first_name || passenger?.firstName || "",
        last_name: passenger?.last_name || passenger?.lastName || "",
        gender: passenger?.gender || "",
        country_code: passenger?.country_code || passenger?.countryCode || "+91",
        phone_no: passenger?.phone_no || passenger?.phone || passenger?.mobile || "",
        email: passenger?.email || "",
        dob: passenger?.dob || passenger?.date_of_birth || "",
    }));
};

const getPassengerName = (passenger) =>
    [passenger?.title, passenger?.first_name, passenger?.last_name]
        .filter(Boolean)
        .join(" ")
        .trim() || "Saved traveler";

const getTravelerHeaderLabel = (traveler) => {
    const name = [traveler?.title, traveler?.first_name, traveler?.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();

    return name || "ADULT";
};

const isTravelerEmpty = (traveler) =>
    !traveler?.first_name &&
    !traveler?.last_name &&
    !traveler?.gender &&
    !traveler?.phone_no &&
    !traveler?.email &&
    !traveler?.dob;

const buildTravelerFromPassenger = (passenger, id) => ({
    id,
    savedPassengerId: passenger.id,
    isOpen: true,
    title: passenger.title || "Mr",
    first_name: passenger.first_name || "",
    last_name: passenger.last_name || "",
    gender: passenger.gender || "",
    country_code: passenger.country_code || "+91",
    phone_no: passenger.phone_no || "",
    email: passenger.email || "",
    dob: passenger.dob || "",
});

const TravelerDetails = () => {
    const { travelerDetails: travelers, setTravelerDetails: setTravelers } = useTourBooking();
    const { isLoggedIn, loading: authLoading } = useAuth();
    const [savedPassengers, setSavedPassengers] = useState([]);
    const [passengerSearch, setPassengerSearch] = useState("");
    const [passengerError, setPassengerError] = useState("");

    const addTraveler = () => {
        setTravelers(prev => [
            ...prev,
            {
                id: Math.max(0, ...prev.map((traveler) => Number(traveler.id) || 0)) + 1,
                isOpen: true,
                title: "Mr",
                first_name: "",
                last_name: "",
                gender: "",
                country_code: "+91",
                phone_no: "",
                email: "",
                dob: "",
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
        setTravelers(prev =>
            prev.map((traveler, travelerIndex) =>
                travelerIndex === index
                    ? { ...traveler, [field]: value }
                    : traveler
            )
        );
    };



    const removeTraveler = (index) => {
        setTravelers(prev => {
            if (prev.length <= 1) return prev;
            return prev.filter((_, i) => i !== index);
        });
    };

    const addPassengerAsTraveler = (passenger) => {
        setTravelers(prev => {
            const emptyOpenIndex = prev.findIndex(
                (traveler) => traveler.isOpen && isTravelerEmpty(traveler)
            );
            const nextId =
                Math.max(0, ...prev.map((traveler) => Number(traveler.id) || 0)) + 1;

            if (emptyOpenIndex >= 0) {
                return prev.map((traveler, index) =>
                    index === emptyOpenIndex
                        ? buildTravelerFromPassenger(passenger, traveler.id)
                        : traveler
                );
            }

            return [
                ...prev.map((traveler) => ({ ...traveler, isOpen: false })),
                buildTravelerFromPassenger(passenger, nextId),
            ];
        });
    };

    const filteredPassengers = useMemo(() => {
        const query = passengerSearch.trim().toLowerCase();
        if (!query) return savedPassengers.slice(0, 6);

        return savedPassengers
            .filter((passenger) => {
                const haystack = [
                    getPassengerName(passenger),
                    passenger.email,
                    passenger.phone_no,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return haystack.includes(query);
            })
            .slice(0, 6);
    }, [passengerSearch, savedPassengers]);

    const selectedPassengerIds = useMemo(
        () =>
            new Set(
                travelers
                    .map((traveler) => traveler.savedPassengerId)
                    .filter(Boolean)
            ),
        [travelers]
    );

    useEffect(() => {
        if (authLoading) return;

        const hasToken = Boolean(Cookies.get("auth_token"));
        const isAuthenticated = Boolean(isLoggedIn || hasToken);

        if (!isAuthenticated) {
            setSavedPassengers([]);
            setPassengerError("");
            return;
        }

        let isActive = true;

        const loadPassengers = async () => {
            try {
                const response = await getPassengers();
                if (!isActive) return;
                setSavedPassengers(normalizePassengers(response));
                setPassengerError("");
            } catch (error) {
                if (!isActive) return;
                setPassengerError(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Unable to load saved passengers."
                );
            }
        };

        loadPassengers();

        return () => {
            isActive = false;
        };
    }, [authLoading, isLoggedIn]);

    return (
        <div className={styles.wrapper}>
            {/* Add Traveler */}
            <div className={styles.addTraveler} onClick={addTraveler}>
                +Add Traveler
            </div>

            {savedPassengers.length > 0 && (
                <div className={styles.savedPassengers}>
                    <div className={styles.savedHeader}>
                        <h4>Saved Travelers</h4>
                        <span className={styles.savedHint}>Click a traveler to add</span>
                        <input
                            type="search"
                            value={passengerSearch}
                            onChange={(event) => setPassengerSearch(event.target.value)}
                            placeholder="Search saved travelers"
                            className={styles.savedSearch}
                        />
                    </div>
                    <div className={styles.savedList}>
                        {filteredPassengers.map((passenger) => (
                            <button
                                type="button"
                                key={passenger.id || `${passenger.email}-${passenger.phone_no}`}
                                className={`${styles.savedPassenger} ${
                                    selectedPassengerIds.has(passenger.id)
                                        ? styles.savedPassengerSelected
                                        : ""
                                }`}
                                onClick={() => addPassengerAsTraveler(passenger)}
                            >
                                <span>{getPassengerName(passenger)}</span>
                                <small>
                                    {[passenger.email, passenger.phone_no].filter(Boolean).join(" | ")}
                                </small>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {passengerError && (
                <p className={styles.passengerError}>{passengerError}</p>
            )}

            {/* Traveler Cards */}
            <div className={styles.travelerCards}>
                {travelers.map((traveler, index) => (
                <div key={traveler.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>TRAVELER {index + 1} - {getTravelerHeaderLabel(traveler)}</h3>

                        <div className={styles.cardActions}>
                            {index > 0 && (
                                <button
                                    type="button"
                                    className={styles.removeTraveler}
                                    onClick={() => removeTraveler(index)}
                                >
                                    Remove
                                </button>
                            )}
                            <span className={styles.iconWrapper} onClick={() => toggleTraveler(index)}>
                                <span className={`${styles.icon} ${traveler.isOpen ? styles.hide : styles.show}`}>
                                    +
                                </span>
                                <span className={`${styles.icon} ${traveler.isOpen ? styles.show : styles.hide}`}>
                                    —
                                </span>
                            </span>
                        </div>
                    </div>

                    <div
                        className={`${styles.cardBody} ${traveler.isOpen ? styles.open : styles.closed
                        }`}
                    >
                        {traveler.savedPassengerId && (
                            <p className={styles.lockedTravelerNote}>
                                Saved traveler details cannot be edited.
                            </p>
                        )}
                        <div className={styles.grid}>
                            <div className={`${styles.field} ${styles.selectField}`}>
                                <label className={styles.label}>Title</label>
                                <select
                                    className={styles.select}
                                    value={traveler.title}
                                    disabled={!!traveler.savedPassengerId}
                                    onChange={(event) => updateTravelerField(index, "title", event.target.value)}
                                >
                                    <option value="Mr">Mr</option>
                                    <option value="Mrs">Mrs</option>
                                    <option value="Ms">Ms</option>
                                </select>
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>First Name</label>
                                <input
                                    className={styles.input}
                                    type="text"
                                    placeholder="Enter First Name"
                                    value={traveler.first_name}
                                    disabled={!!traveler.savedPassengerId}
                                    onChange={(event) => updateTravelerField(index, "first_name", event.target.value)}
                                />
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Last Name</label>
                                <input
                                    className={styles.input}
                                    type="text"
                                    placeholder="Enter Last Name"
                                    value={traveler.last_name}
                                    disabled={!!traveler.savedPassengerId}
                                    onChange={(event) => updateTravelerField(index, "last_name", event.target.value)}
                                />
                            </div>

                            <div className={`${styles.field} ${styles.selectField}`}>
                                <label className={styles.label}>Gender</label>
                                <select
                                    className={styles.select}
                                    value={traveler.gender}
                                    disabled={!!traveler.savedPassengerId}
                                    onChange={(event) => updateTravelerField(index, "gender", event.target.value)}
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
                                    value={traveler.country_code}
                                    disabled={!!traveler.savedPassengerId}
                                    onChange={(event) => updateTravelerField(index, "country_code", event.target.value)}
                                />
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Mobile Number</label>
                                <input
                                    className={styles.input}
                                    type="text"
                                    placeholder="Mobile number (optional)"
                                    value={traveler.phone_no}
                                    disabled={!!traveler.savedPassengerId}
                                    onChange={(event) => updateTravelerField(index, "phone_no", event.target.value)}
                                />
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Email</label>
                                <input
                                    className={styles.input}
                                    type="email"
                                    placeholder="Email (Optional)"
                                    value={traveler.email}
                                    disabled={!!traveler.savedPassengerId}
                                    onChange={(event) => updateTravelerField(index, "email", event.target.value)}
                                />
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>DOB</label>
                                <input
                                    className={styles.input}
                                    type="date"
                                    value={traveler.dob}
                                    disabled={!!traveler.savedPassengerId}
                                    onChange={(event) => updateTravelerField(index, "dob", event.target.value)}
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
        </div>
    );
};

export default TravelerDetails;

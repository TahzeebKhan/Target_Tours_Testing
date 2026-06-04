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
    const {
        travelerDetails: travelers,
        setTravelerDetails: setTravelers,
        bookingContactInfo,
        setBookingContactInfo,
        travelerFormErrors,
        setTravelerFormErrors,
    } = useTourBooking();
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

    const clearTravelerFieldError = (travelerId, field) => {
        setTravelerFormErrors((prev) => {
            const currentTravelerErrors = prev?.travelers?.[travelerId];
            if (!currentTravelerErrors?.[field]) return prev;

            const nextTravelers = { ...(prev?.travelers || {}) };
            const nextFieldErrors = { ...currentTravelerErrors };
            delete nextFieldErrors[field];

            if (Object.keys(nextFieldErrors).length === 0) {
                delete nextTravelers[travelerId];
            } else {
                nextTravelers[travelerId] = nextFieldErrors;
            }

            return {
                ...(prev || {}),
                travelers: nextTravelers,
                bookingContact: prev?.bookingContact || {},
            };
        });
    };

    const clearBookingContactFieldError = (field) => {
        setTravelerFormErrors((prev) => {
            if (!prev?.bookingContact?.[field]) return prev;
            const nextBookingContact = { ...(prev?.bookingContact || {}) };
            delete nextBookingContact[field];
            return {
                ...(prev || {}),
                travelers: prev?.travelers || {},
                bookingContact: nextBookingContact,
            };
        });
    };

    const getTravelerFieldError = (traveler, field) =>
        travelerFormErrors?.travelers?.[traveler.id]?.[field] || "";

    const getBookingContactFieldError = (field) =>
        travelerFormErrors?.bookingContact?.[field] || "";

    const getFieldClassName = (error) =>
        `${styles.input} ${error ? styles.inputError : ""}`;

    const getSelectClassName = (error) =>
        `${styles.select} ${error ? styles.inputError : ""}`;

    const updateTravelerField = (index, field, value) => {
        const nextValue =
            field === "phone_no" ? value.replace(/[^\d]/g, "").slice(0, 10) : value;

        setTravelers(prev =>
            prev.map((traveler, travelerIndex) =>
                travelerIndex === index
                    ? { ...traveler, [field]: nextValue }
                    : traveler
                )
        );
        clearTravelerFieldError(travelers[index]?.id, field);
    };

    const updateBookingContactField = (field, value) => {
        const nextValue =
            field === "mobile_number"
                ? value.replace(/[^\d]/g, "").slice(0, 10)
                : value;

        setBookingContactInfo((prev) => ({
            ...prev,
            [field]: nextValue,
        }));
        clearBookingContactFieldError(field);
    };



    const removeTraveler = (index) => {
        setTravelers(prev => {
            if (prev.length <= 1) return prev;
            return prev.filter((_, i) => i !== index);
        });
    };

    const addPassengerAsTraveler = (passenger) => {
        if (!passenger?.id) return;

        setTravelers(prev => {
            if (
                prev.some(
                    (traveler) => String(traveler.savedPassengerId) === String(passenger.id)
                )
            ) {
                return prev;
            }

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

        setTravelerFormErrors((prev) => ({
            ...(prev || {}),
            travelers: {},
            bookingContact: prev?.bookingContact || {},
        }));

        setBookingContactInfo((prev) => ({
            country_code: prev.country_code || passenger.country_code || "+91",
            mobile_number: prev.mobile_number || String(passenger.phone_no || "").replace(/[^\d]/g, "").slice(0, 10),
            email: prev.email || passenger.email || "",
        }));
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
                    .map(String)
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
                                    selectedPassengerIds.has(String(passenger.id))
                                        ? styles.savedPassengerSelected
                                        : ""
                                }`}
                                disabled={selectedPassengerIds.has(String(passenger.id))}
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
                                    className={getSelectClassName(getTravelerFieldError(traveler, "title"))}
                                    value={traveler.title}
                                    disabled={!!traveler.savedPassengerId}
                                    onChange={(event) => updateTravelerField(index, "title", event.target.value)}
                                >
                                    <option value="Mr">Mr</option>
                                    <option value="Mrs">Mrs</option>
                                    <option value="Ms">Ms</option>
                                </select>
                                {getTravelerFieldError(traveler, "title") && (
                                    <p className={styles.fieldError}>{getTravelerFieldError(traveler, "title")}</p>
                                )}
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>First Name</label>
                                <input
                                    className={getFieldClassName(getTravelerFieldError(traveler, "first_name"))}
                                    type="text"
                                    placeholder="Enter First Name"
                                    value={traveler.first_name}
                                    disabled={!!traveler.savedPassengerId}
                                    onChange={(event) => updateTravelerField(index, "first_name", event.target.value)}
                                />
                                {getTravelerFieldError(traveler, "first_name") && (
                                    <p className={styles.fieldError}>{getTravelerFieldError(traveler, "first_name")}</p>
                                )}
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Last Name</label>
                                <input
                                    className={getFieldClassName(getTravelerFieldError(traveler, "last_name"))}
                                    type="text"
                                    placeholder="Enter Last Name"
                                    value={traveler.last_name}
                                    disabled={!!traveler.savedPassengerId}
                                    onChange={(event) => updateTravelerField(index, "last_name", event.target.value)}
                                />
                                {getTravelerFieldError(traveler, "last_name") && (
                                    <p className={styles.fieldError}>{getTravelerFieldError(traveler, "last_name")}</p>
                                )}
                            </div>

                            <div className={`${styles.field} ${styles.selectField}`}>
                                <label className={styles.label}>Gender</label>
                                <select
                                    className={getSelectClassName(getTravelerFieldError(traveler, "gender"))}
                                    value={traveler.gender}
                                    disabled={!!traveler.savedPassengerId}
                                    onChange={(event) => updateTravelerField(index, "gender", event.target.value)}
                                >
                                    <option value="" disabled hidden>Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                                {getTravelerFieldError(traveler, "gender") && (
                                    <p className={styles.fieldError}>{getTravelerFieldError(traveler, "gender")}</p>
                                )}
                            </div>
                        </div>

                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label className={styles.label}>Country Code</label>
                                <input
                                    className={getFieldClassName(getTravelerFieldError(traveler, "country_code"))}
                                    type="text"
                                    placeholder="Country Code"
                                    value={traveler.country_code}
                                    disabled={!!traveler.savedPassengerId}
                                    onChange={(event) => updateTravelerField(index, "country_code", event.target.value)}
                                />
                                {getTravelerFieldError(traveler, "country_code") && (
                                    <p className={styles.fieldError}>{getTravelerFieldError(traveler, "country_code")}</p>
                                )}
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Mobile Number</label>
                                <input
                                    className={getFieldClassName(getTravelerFieldError(traveler, "phone_no"))}
                                    type="text"
                                    placeholder="Mobile number"
                                    value={traveler.phone_no}
                                    disabled={!!traveler.savedPassengerId}
                                    onChange={(event) => updateTravelerField(index, "phone_no", event.target.value)}
                                />
                                {getTravelerFieldError(traveler, "phone_no") && (
                                    <p className={styles.fieldError}>{getTravelerFieldError(traveler, "phone_no")}</p>
                                )}
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Email</label>
                                <input
                                    className={getFieldClassName(getTravelerFieldError(traveler, "email"))}
                                    type="email"
                                    placeholder="Email"
                                    value={traveler.email}
                                    disabled={!!traveler.savedPassengerId}
                                    onChange={(event) => updateTravelerField(index, "email", event.target.value)}
                                />
                                {getTravelerFieldError(traveler, "email") && (
                                    <p className={styles.fieldError}>{getTravelerFieldError(traveler, "email")}</p>
                                )}
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>DOB</label>
                                <input
                                    className={getFieldClassName(getTravelerFieldError(traveler, "dob"))}
                                    type="date"
                                    value={traveler.dob}
                                    disabled={!!traveler.savedPassengerId}
                                    onChange={(event) => updateTravelerField(index, "dob", event.target.value)}
                                />
                                {getTravelerFieldError(traveler, "dob") && (
                                    <p className={styles.fieldError}>{getTravelerFieldError(traveler, "dob")}</p>
                                )}
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
                            className={`${getFieldClassName(getBookingContactFieldError("country_code"))} ${styles.bookingInput}`}
                            placeholder="Country Code"
                            value={bookingContactInfo.country_code}
                            onChange={(event) =>
                                updateBookingContactField("country_code", event.target.value)
                            }
                        />
                        {getBookingContactFieldError("country_code") && (
                            <p className={styles.fieldError}>{getBookingContactFieldError("country_code")}</p>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Mobile Number</label>
                        <input
                            className={`${getFieldClassName(getBookingContactFieldError("mobile_number"))} ${styles.bookingInput}`}
                            placeholder="Mobile number"
                            value={bookingContactInfo.mobile_number}
                            onChange={(event) =>
                                updateBookingContactField("mobile_number", event.target.value)
                            }
                        />
                        {getBookingContactFieldError("mobile_number") && (
                            <p className={styles.fieldError}>{getBookingContactFieldError("mobile_number")}</p>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Email</label>
                        <input
                            className={`${getFieldClassName(getBookingContactFieldError("email"))} ${styles.bookingInput}`}
                            placeholder="Email"
                            value={bookingContactInfo.email}
                            onChange={(event) =>
                                updateBookingContactField("email", event.target.value)
                            }
                        />
                        {getBookingContactFieldError("email") && (
                            <p className={styles.fieldError}>{getBookingContactFieldError("email")}</p>
                        )}
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default TravelerDetails;

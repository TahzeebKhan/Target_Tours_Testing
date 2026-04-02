import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./TravelerDetails.module.css";
import { useFlightBooking } from "@/app/flight-booking-details/FlightBookingContext";
import { EMPTY_TRAVELER_FORM_ERRORS } from "@/app/flight-booking-details/utils/travelerValidation";

const buildPassengerSlots = (bookingSession) => {
    const priceRequest = bookingSession?.priceRequest || {};
    const searchKey = String(priceRequest?.search_key || bookingSession?.selectedFlight?.booking?.searchKey || "").trim();
    const parts = searchKey.split("_");
    const adults = Math.max(Number(parts[4] || 1), 1);
    const children = Math.max(Number(parts[5] || 0), 0);
    const infants = Math.max(Number(parts[6] || 0), 0);
    const slots = [];

    for (let index = 0; index < adults; index += 1) {
        slots.push({ id: `adult-${index + 1}`, type: "ADULT" });
    }
    for (let index = 0; index < children; index += 1) {
        slots.push({ id: `child-${index + 1}`, type: "CHILD" });
    }
    for (let index = 0; index < infants; index += 1) {
        slots.push({ id: `infant-${index + 1}`, type: "INFANT" });
    }

    return slots.length > 0 ? slots : [{ id: "adult-1", type: "ADULT" }];
};

const buildTravelerPayload = (slot, isOpen = true) => ({
    id: slot?.id || "adult-1",
    type: slot?.type || "ADULT",
    isOpen,
    Title: "Mr",
    FName: "",
    LName: "",
    Age: "",
    DOB: "2000-01-01",
    Gender: "",
    PTC: slot?.type === "CHILD" ? "CHD" : slot?.type === "INFANT" ? "INF" : "ADT",
    Nationality: "IN",
    PassportNo: "1234567",
    PLI: "",
    PDOE: "2026-04-28",
    VisaType: "Business",
    CountryCode: "IN",
    MobileNumber: "8532907106",
    Email: "MUKUL.MISHRA@WEBNINJAZ.COM",
});

const hydrateTravelers = (savedTravelers = [], passengerSlots = []) => {
    if (!Array.isArray(savedTravelers) || savedTravelers.length === 0) {
        return [buildTravelerPayload(passengerSlots[0], true)];
    }

    return savedTravelers.map((traveler, index) => {
        const slot = passengerSlots[index] || {
            id: traveler?.id || `traveler-${index + 1}`,
            type: traveler?.type || "ADULT",
        };

        return {
            ...buildTravelerPayload(slot, true),
            ...traveler,
            id: slot.id,
            type: slot.type,
            isOpen: true,
        };
    });
};

const serializeTravelers = (travelers = []) =>
    travelers.map(({ isOpen, id, type, ...payload }) => ({
        id,
        type,
        ...payload,
    }));

const DEFAULT_BOOKING_CONTACT = {
    Address: "ETAH",
    CountryCode: "IN",
    State: "UP",
    City: "NOIDA",
    PIN: "207001",
    MobileNumber: "8532907106",
    Email: "MUKUL.MISHRA@WEBNINJAZ.COM",
};

const getBookingContactState = (value) =>
    value && Object.keys(value).length > 0 ? value : DEFAULT_BOOKING_CONTACT;

const TravelerDetails = () => {
    const {
        bookingSession,
        travelerDetails,
        setTravelerDetails,
        bookingContactDetails,
        setBookingContactDetails,
        travelerFormErrors,
        setTravelerFormErrors,
    } = useFlightBooking();
    const passengerSlots = useMemo(() => buildPassengerSlots(bookingSession), [bookingSession]);
    const [bookingContact, setBookingContact] = useState(
        getBookingContactState(bookingContactDetails)
    );
    const [travelers, setTravelers] = useState(() =>
        hydrateTravelers(travelerDetails, passengerSlots)
    );
    const lastSyncedTravelersRef = useRef(JSON.stringify(serializeTravelers(hydrateTravelers(travelerDetails, passengerSlots))));
    const lastSyncedBookingContactRef = useRef(JSON.stringify(getBookingContactState(bookingContactDetails)));

    useEffect(() => {
        const nextTravelers = hydrateTravelers(travelerDetails, passengerSlots);
        const nextSerialized = JSON.stringify(serializeTravelers(nextTravelers));
        if (lastSyncedTravelersRef.current === nextSerialized) {
            return;
        }
        lastSyncedTravelersRef.current = nextSerialized;
        setTravelers(nextTravelers);
    }, [passengerSlots, travelerDetails]);

    useEffect(() => {
        const nextBookingContact = getBookingContactState(bookingContactDetails);
        const nextSerialized = JSON.stringify(nextBookingContact);
        if (lastSyncedBookingContactRef.current === nextSerialized) {
            return;
        }
        lastSyncedBookingContactRef.current = nextSerialized;
        setBookingContact(nextBookingContact);
    }, [bookingContactDetails]);

    useEffect(() => {
        if (Array.isArray(travelerDetails) && travelerDetails.length > 0) {
            return;
        }
        const serializedTravelers = serializeTravelers(travelers);
        const nextSerialized = JSON.stringify(serializedTravelers);
        lastSyncedTravelersRef.current = nextSerialized;
        setTravelerDetails(serializedTravelers);
    }, [setTravelerDetails, travelerDetails, travelers]);

    useEffect(() => {
        if (bookingContactDetails && Object.keys(bookingContactDetails).length > 0) {
            return;
        }
        const nextSerialized = JSON.stringify(bookingContact);
        lastSyncedBookingContactRef.current = nextSerialized;
        setBookingContactDetails(bookingContact);
    }, [bookingContact, bookingContactDetails, setBookingContactDetails]);

    const clearTravelerFieldError = (travelerId, field) => {
        setTravelerFormErrors((prev) => {
            const travelerErrorFields = prev?.travelers?.[travelerId];
            if (!travelerErrorFields?.[field]) return prev;

            const nextTravelerErrors = { ...(prev?.travelers || {}) };
            const nextFieldErrors = { ...travelerErrorFields };
            delete nextFieldErrors[field];

            if (Object.keys(nextFieldErrors).length === 0) {
                delete nextTravelerErrors[travelerId];
            } else {
                nextTravelerErrors[travelerId] = nextFieldErrors;
            }

            return {
                ...(prev || EMPTY_TRAVELER_FORM_ERRORS),
                travelers: nextTravelerErrors,
            };
        });
    };

    const clearBookingFieldError = (field) => {
        setTravelerFormErrors((prev) => {
            if (!prev?.bookingContact?.[field]) return prev;
            const nextBookingErrors = { ...(prev?.bookingContact || {}) };
            delete nextBookingErrors[field];
            return {
                ...(prev || EMPTY_TRAVELER_FORM_ERRORS),
                bookingContact: nextBookingErrors,
            };
        });
    };

    const updateTravelerField = (index, field, value) => {
        setTravelers((prev) => {
            const next = prev.map((traveler, travelerIndex) =>
                travelerIndex === index
                    ? { ...traveler, [field]: value }
                    : traveler
            );
            const serializedNext = serializeTravelers(next);
            lastSyncedTravelersRef.current = JSON.stringify(serializedNext);
            setTravelerDetails(serializedNext);
            return next;
        });
        clearTravelerFieldError(travelers[index]?.id, field);
    };

    const addTraveler = () => {
        setTravelers((prev) => {
            if (prev.length >= passengerSlots.length) return prev;
            const nextSlot = passengerSlots[prev.length];
            if (!nextSlot) return prev;

            const next = [
                ...prev,
                buildTravelerPayload(nextSlot, true)
            ];
            const serializedNext = serializeTravelers(next);
            lastSyncedTravelersRef.current = JSON.stringify(serializedNext);
            setTravelerDetails(serializedNext);
            return next;
        });
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

    const updateBookingContactField = (field, value) => {
        setBookingContact((prev) => {
            const next = {
                ...prev,
                [field]: value,
            };
            lastSyncedBookingContactRef.current = JSON.stringify(next);
            setBookingContactDetails(next);
            return next;
        });
        clearBookingFieldError(field);
    };

    const getTravelerFieldError = (travelerId, field) =>
        travelerFormErrors?.travelers?.[travelerId]?.[field] || "";

    const getBookingFieldError = (field) =>
        travelerFormErrors?.bookingContact?.[field] || "";
    return (
        <div className={styles.wrapper}>
            {/* Add Traveler */}
            {travelers.length < passengerSlots.length && (
                <div className={styles.addTraveler} onClick={addTraveler}>
                    +Add Traveler
                </div>
            )}

            {/* Traveler Cards */}
            <div className={styles.travelerCards}>
                {travelers.map((traveler, index) => (
                <div key={traveler.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>TRAVELER {index + 1} - {traveler.type}</h3>

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
                            <div className={`${styles.field} ${styles.selectField}`}>
                                <label className={styles.label}>Title</label>
                                <select
                                    className={`${styles.select} ${getTravelerFieldError(traveler.id, "Title") ? styles.fieldError : ""}`}
                                    value={traveler.Title}
                                    onChange={(event) => updateTravelerField(index, "Title", event.target.value)}
                                >
                                    <option value="Mr">Mr</option>
                                    <option value="Mrs">Mrs</option>
                                    <option value="Ms">Ms</option>
                                </select>
                                {getTravelerFieldError(traveler.id, "Title") && (
                                    <span className={styles.errorText}>{getTravelerFieldError(traveler.id, "Title")}</span>
                                )}
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>First Name</label>
                                <input
                                    className={`${styles.input} ${getTravelerFieldError(traveler.id, "FName") ? styles.fieldError : ""}`}
                                    type="text"
                                    placeholder="Enter First Name"
                                    value={traveler.FName}
                                    onChange={(event) => updateTravelerField(index, "FName", event.target.value)}
                                />
                                {getTravelerFieldError(traveler.id, "FName") && (
                                    <span className={styles.errorText}>{getTravelerFieldError(traveler.id, "FName")}</span>
                                )}
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Last Name</label>
                                <input
                                    className={`${styles.input} ${getTravelerFieldError(traveler.id, "LName") ? styles.fieldError : ""}`}
                                    type="text"
                                    placeholder="Enter Last Name"
                                    value={traveler.LName}
                                    onChange={(event) => updateTravelerField(index, "LName", event.target.value)}
                                />
                                {getTravelerFieldError(traveler.id, "LName") && (
                                    <span className={styles.errorText}>{getTravelerFieldError(traveler.id, "LName")}</span>
                                )}
                            </div>

                        </div>

                        <div className={styles.grid}>
                            <div className={`${styles.field} ${styles.selectField}`}>
                                <label className={styles.label}>Gender</label>
                                <select
                                    className={`${styles.select} ${getTravelerFieldError(traveler.id, "Gender") ? styles.fieldError : ""}`}
                                    value={traveler.Gender}
                                    onChange={(event) => updateTravelerField(index, "Gender", event.target.value)}
                                >
                                    <option value="" disabled hidden>Select</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </select>
                                {getTravelerFieldError(traveler.id, "Gender") && (
                                    <span className={styles.errorText}>{getTravelerFieldError(traveler.id, "Gender")}</span>
                                )}
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Country Code</label>
                                <input
                                    className={`${styles.input} ${getTravelerFieldError(traveler.id, "CountryCode") ? styles.fieldError : ""}`}
                                    type="text"
                                    placeholder="Country Code (optional)"
                                    value={traveler.CountryCode}
                                    onChange={(event) => updateTravelerField(index, "CountryCode", event.target.value)}
                                />
                                {getTravelerFieldError(traveler.id, "CountryCode") && (
                                    <span className={styles.errorText}>{getTravelerFieldError(traveler.id, "CountryCode")}</span>
                                )}
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Mobile Number</label>
                                <input
                                    className={`${styles.input} ${getTravelerFieldError(traveler.id, "MobileNumber") ? styles.fieldError : ""}`}
                                    type="text"
                                    placeholder="Mobile number (optional)"
                                    value={traveler.MobileNumber}
                                    onChange={(event) => updateTravelerField(index, "MobileNumber", event.target.value)}
                                />
                                {getTravelerFieldError(traveler.id, "MobileNumber") && (
                                    <span className={styles.errorText}>{getTravelerFieldError(traveler.id, "MobileNumber")}</span>
                                )}
                            </div>

                        </div>

                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label className={styles.label}>Email</label>
                                <input
                                    className={`${styles.input} ${getTravelerFieldError(traveler.id, "Email") ? styles.fieldError : ""}`}
                                    type="email"
                                    placeholder="Email (Optional)"
                                    value={traveler.Email}
                                    onChange={(event) => updateTravelerField(index, "Email", event.target.value)}
                                />
                                {getTravelerFieldError(traveler.id, "Email") && (
                                    <span className={styles.errorText}>{getTravelerFieldError(traveler.id, "Email")}</span>
                                )}
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Age</label>
                                <input
                                    className={`${styles.input} ${getTravelerFieldError(traveler.id, "Age") ? styles.fieldError : ""}`}
                                    type="number"
                                    placeholder="Enter Age"
                                    value={traveler.Age}
                                    onChange={(event) => updateTravelerField(index, "Age", event.target.value)}
                                />
                                {getTravelerFieldError(traveler.id, "Age") && (
                                    <span className={styles.errorText}>{getTravelerFieldError(traveler.id, "Age")}</span>
                                )}
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>DOB</label>
                                <input
                                    className={`${styles.input} ${getTravelerFieldError(traveler.id, "DOB") ? styles.fieldError : ""}`}
                                    type="date"
                                    value={traveler.DOB}
                                    onChange={(event) => updateTravelerField(index, "DOB", event.target.value)}
                                    onFocus={(event) => event.target.showPicker?.()}
                                    onClick={(event) => event.target.showPicker?.()}
                                />
                                {getTravelerFieldError(traveler.id, "DOB") && (
                                    <span className={styles.errorText}>{getTravelerFieldError(traveler.id, "DOB")}</span>
                                )}
                            </div>
                        </div>

                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label className={styles.label}>Nationality</label>
                                <input
                                    className={`${styles.input} ${getTravelerFieldError(traveler.id, "Nationality") ? styles.fieldError : ""}`}
                                    type="text"
                                    placeholder="Nationality"
                                    value={traveler.Nationality}
                                    onChange={(event) => updateTravelerField(index, "Nationality", event.target.value)}
                                />
                                {getTravelerFieldError(traveler.id, "Nationality") && (
                                    <span className={styles.errorText}>{getTravelerFieldError(traveler.id, "Nationality")}</span>
                                )}
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Passport No</label>
                                <input
                                    className={`${styles.input} ${getTravelerFieldError(traveler.id, "PassportNo") ? styles.fieldError : ""}`}
                                    type="text"
                                    placeholder="Passport Number"
                                    value={traveler.PassportNo}
                                    onChange={(event) => updateTravelerField(index, "PassportNo", event.target.value)}
                                />
                                {getTravelerFieldError(traveler.id, "PassportNo") && (
                                    <span className={styles.errorText}>{getTravelerFieldError(traveler.id, "PassportNo")}</span>
                                )}
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Passport Issue Place</label>
                                <input
                                    className={`${styles.input} ${getTravelerFieldError(traveler.id, "PLI") ? styles.fieldError : ""}`}
                                    type="text"
                                    placeholder="Passport Issue Place"
                                    value={traveler.PLI}
                                    onChange={(event) => updateTravelerField(index, "PLI", event.target.value)}
                                />
                                {getTravelerFieldError(traveler.id, "PLI") && (
                                    <span className={styles.errorText}>{getTravelerFieldError(traveler.id, "PLI")}</span>
                                )}
                            </div>
                        </div>

                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label className={styles.label}>Passport Expiry</label>
                                <input
                                    className={`${styles.input} ${getTravelerFieldError(traveler.id, "PDOE") ? styles.fieldError : ""}`}
                                    type="date"
                                    value={traveler.PDOE}
                                    onChange={(event) => updateTravelerField(index, "PDOE", event.target.value)}
                                    onFocus={(event) => event.target.showPicker?.()}
                                    onClick={(event) => event.target.showPicker?.()}
                                />
                                {getTravelerFieldError(traveler.id, "PDOE") && (
                                    <span className={styles.errorText}>{getTravelerFieldError(traveler.id, "PDOE")}</span>
                                )}
                            </div>

                            <div className={`${styles.field} ${styles.selectField}`}>
                                <label className={styles.label}>Visa Type</label>
                                <select
                                    className={`${styles.select} ${getTravelerFieldError(traveler.id, "VisaType") ? styles.fieldError : ""}`}
                                    value={traveler.VisaType}
                                    onChange={(event) => updateTravelerField(index, "VisaType", event.target.value)}
                                >
                                    <option value="" disabled hidden>Select</option>
                                    <option value="Visiting">Visiting</option>
                                    <option value="Tourist">Tourist</option>
                                    <option value="Business">Business</option>
                                    <option value="Student">Student</option>
                                    <option value="Work">Work</option>
                                    <option value="Transit">Transit</option>
                                </select>
                                {getTravelerFieldError(traveler.id, "VisaType") && (
                                    <span className={styles.errorText}>{getTravelerFieldError(traveler.id, "VisaType")}</span>
                                )}
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>PTC</label>
                                <input
                                    className={styles.input}
                                    type="text"
                                    value={traveler.PTC}
                                    readOnly
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

                <div className={styles.cardBody}>
                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label className={styles.label}>Country Code</label>
                            <input
                                className={`${styles.input} ${styles.bookingInput} ${getBookingFieldError("CountryCode") ? styles.fieldError : ""}`}
                                placeholder="Country Code (optional)"
                                value={bookingContact.CountryCode}
                                onChange={(event) => updateBookingContactField("CountryCode", event.target.value)}
                            />
                            {getBookingFieldError("CountryCode") && (
                                <span className={styles.errorText}>{getBookingFieldError("CountryCode")}</span>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Mobile Number</label>
                            <input
                                className={`${styles.input} ${styles.bookingInput} ${getBookingFieldError("MobileNumber") ? styles.fieldError : ""}`}
                                placeholder="Mobile number (optional)"
                                value={bookingContact.MobileNumber}
                                onChange={(event) => updateBookingContactField("MobileNumber", event.target.value)}
                            />
                            {getBookingFieldError("MobileNumber") && (
                                <span className={styles.errorText}>{getBookingFieldError("MobileNumber")}</span>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Email</label>
                            <input
                                className={`${styles.input} ${styles.bookingInput} ${getBookingFieldError("Email") ? styles.fieldError : ""}`}
                                placeholder="Email (Optional)"
                                value={bookingContact.Email}
                                onChange={(event) => updateBookingContactField("Email", event.target.value)}
                            />
                            {getBookingFieldError("Email") && (
                                <span className={styles.errorText}>{getBookingFieldError("Email")}</span>
                            )}
                        </div>
                    </div>

                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label className={styles.label}>Address</label>
                            <input
                                className={`${styles.input} ${styles.bookingInput} ${getBookingFieldError("Address") ? styles.fieldError : ""}`}
                                placeholder="Address"
                                value={bookingContact.Address}
                                onChange={(event) => updateBookingContactField("Address", event.target.value)}
                            />
                            {getBookingFieldError("Address") && (
                                <span className={styles.errorText}>{getBookingFieldError("Address")}</span>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>State</label>
                            <input
                                className={`${styles.input} ${styles.bookingInput} ${getBookingFieldError("State") ? styles.fieldError : ""}`}
                                placeholder="State"
                                value={bookingContact.State}
                                onChange={(event) => updateBookingContactField("State", event.target.value)}
                            />
                            {getBookingFieldError("State") && (
                                <span className={styles.errorText}>{getBookingFieldError("State")}</span>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>City</label>
                            <input
                                className={`${styles.input} ${styles.bookingInput} ${getBookingFieldError("City") ? styles.fieldError : ""}`}
                                placeholder="City"
                                value={bookingContact.City}
                                onChange={(event) => updateBookingContactField("City", event.target.value)}
                            />
                            {getBookingFieldError("City") && (
                                <span className={styles.errorText}>{getBookingFieldError("City")}</span>
                            )}
                        </div>
                    </div>

                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label className={styles.label}>PIN</label>
                            <input
                                className={`${styles.input} ${styles.bookingInput} ${getBookingFieldError("PIN") ? styles.fieldError : ""}`}
                                placeholder="PIN"
                                value={bookingContact.PIN}
                                onChange={(event) => updateBookingContactField("PIN", event.target.value)}
                            />
                            {getBookingFieldError("PIN") && (
                                <span className={styles.errorText}>{getBookingFieldError("PIN")}</span>
                            )}
                        </div>

                        <div className={styles.field}></div>
                        <div className={styles.field}></div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default TravelerDetails;

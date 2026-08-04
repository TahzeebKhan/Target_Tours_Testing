import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./TravelerDetails.module.css";
import { useFlightBooking } from "@/app/flight-booking-details/FlightBookingContext";
import { getBookingPassengerCounts } from "@/features/flights/utils/flightBookingSession";
import {
    EMPTY_TRAVELER_FORM_ERRORS,
    getBookingJourney,
    getTravelerDobError,
    validateTravelerForm,
} from "@/app/flight-booking-details/utils/travelerValidation";
import Cookies from "js-cookie";
import { useAuth } from "@/app/context/AuthContext";
import CountryCodeSelect from "@/app/flight-booking-details/components/CountryCodeSelect/CountryCodeSelect";
import NationalitySelect from "@/app/flight-booking-details/components/NationalitySelect/NationalitySelect";
import { createPassenger, getPassengers } from "@/shared/services/passenger";
import { toast } from "react-toastify";

const buildPassengerSlots = (bookingSession) => {
    const { adult: adults, child: children, infant: infants } =
        getBookingPassengerCounts(bookingSession);
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

const getPtcForTravelerType = (type) =>
    type === "CHILD" ? "CHD" : type === "INFANT" ? "INF" : "ADT";

const buildTravelerPayload = (slot, isOpen = true) => ({
    id: slot?.id || "adult-1",
    type: slot?.type || "ADULT",
    isOpen,
    Title: "Mr",
    FName: "",
    LName: "",
    Age: "",
    DOB: "",
    Gender: "",
    PTC: getPtcForTravelerType(slot?.type),
    Nationality: "",
    PassportNo: "",
    PLI: "",
    PDOE: "",
    VisaType: "",
    CountryCode: "",
    MobileNumber: "",
    Email: "",
});

const hydrateTravelers = (savedTravelers = [], passengerSlots = []) => {
    if (!Array.isArray(savedTravelers) || savedTravelers.length === 0) {
        return passengerSlots.map((slot) => buildTravelerPayload(slot, true));
    }

    return passengerSlots.map((slot, index) => {
        const traveler = savedTravelers[index];
        if (!traveler) {
            return buildTravelerPayload(slot, true);
        }

        return {
            ...buildTravelerPayload(slot, true),
            ...traveler,
            id: slot.id,
            type: slot.type,
            PTC: getPtcForTravelerType(slot.type),
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

const getUserBookingContact = () => {
    try {
        const user = JSON.parse(Cookies.get("user") || "{}");
        return {
            CountryCode: user.dail_code || "",
            MobileNumber: user.phone_no || "",
            Email: user.email || "",
        };
    } catch {
        return { CountryCode: "", MobileNumber: "", Email: "" };
    }
};

const getBookingContactState = (value) =>
    value && Object.keys(value).length > 0 ? value : getUserBookingContact();

const openNativeDatePicker = (event) => {
    try {
        event.currentTarget.showPicker?.();
    } catch {
        // Ignore browsers that reject programmatic picker opening.
    }
};

const TravelerDetails = () => {
    const { user } = useAuth();
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
    const journey = getBookingJourney(bookingSession);
    const isDomestic = journey === "domestic";
    const [bookingContact, setBookingContact] = useState(
        getBookingContactState(bookingContactDetails)
    );
    const [travelers, setTravelers] = useState(() =>
        hydrateTravelers(travelerDetails, passengerSlots)
    );
    const [savedTravelers, setSavedTravelers] = useState([]);
    const [savedTravelerSearch, setSavedTravelerSearch] = useState("");
    const [savedTravelersLoading, setSavedTravelersLoading] = useState(true);
    const [savingTravelerId, setSavingTravelerId] = useState("");
    const lastSyncedTravelersRef = useRef(JSON.stringify(serializeTravelers(hydrateTravelers(travelerDetails, passengerSlots))));
    const lastSyncedBookingContactRef = useRef(JSON.stringify(getBookingContactState(bookingContactDetails)));

    const loadSavedTravelers = async () => {
        setSavedTravelersLoading(true);
        try {
            const response = await getPassengers();
            const rows =
                (Array.isArray(response) && response) ||
                (Array.isArray(response?.data) && response.data) ||
                response?.data?.passengers ||
                response?.passengers ||
                response?.results ||
                [];
            setSavedTravelers(Array.isArray(rows) ? rows : []);
        } catch (error) {
            toast.error(error?.response?.data?.error?.message || error?.response?.data?.message || "Unable to load saved travelers.");
        } finally {
            setSavedTravelersLoading(false);
        }
    };

    useEffect(() => {
        loadSavedTravelers();
    }, []);

    const filteredSavedTravelers = useMemo(() => {
        const query = savedTravelerSearch.trim().toLowerCase();
        if (!query) return savedTravelers;
        return savedTravelers.filter((passenger) =>
            [passenger?.title, passenger?.first_name, passenger?.last_name, passenger?.email]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [savedTravelerSearch, savedTravelers]);

    useEffect(() => {
        if (!user) return;

        setBookingContact((current) => ({
            ...current,
            CountryCode: current.CountryCode || user.dail_code || "",
            MobileNumber: current.MobileNumber || user.phone_no || "",
            Email: current.Email || user.email || "",
        }));
    }, [user]);

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

    useEffect(() => {
        const currentErrors = JSON.stringify(travelerFormErrors || EMPTY_TRAVELER_FORM_ERRORS);
        if (currentErrors === JSON.stringify(EMPTY_TRAVELER_FORM_ERRORS)) {
            return;
        }

        const validation = validateTravelerForm({
            travelerDetails: serializeTravelers(travelers),
            bookingContactDetails: bookingContact,
            checklistResponse: bookingSession?.checklistResponse,
            journey,
        });
        const nextErrors = JSON.stringify(validation.errors || EMPTY_TRAVELER_FORM_ERRORS);
        if (currentErrors !== nextErrors) {
            setTravelerFormErrors(validation.errors);
        }
    }, [bookingContact, journey, setTravelerFormErrors, travelerFormErrors, travelers]);

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

    const setTravelerFieldError = (travelerId, field, message) => {
        setTravelerFormErrors((prev) => {
            const nextTravelers = { ...(prev?.travelers || {}) };
            const nextFields = { ...(nextTravelers[travelerId] || {}) };
            if (message) nextFields[field] = message;
            else delete nextFields[field];
            if (Object.keys(nextFields).length) nextTravelers[travelerId] = nextFields;
            else delete nextTravelers[travelerId];
            return { ...(prev || EMPTY_TRAVELER_FORM_ERRORS), travelers: nextTravelers };
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
        const normalizedValue =
            field === "Age" ? String(value).replace(/[^\d]/g, "").slice(0, 2) : value;
        const nextTravelers = travelers.map((traveler, travelerIndex) =>
            travelerIndex === index
                ? { ...traveler, [field]: normalizedValue }
                : traveler
        );
        const serializedNext = serializeTravelers(nextTravelers);

        lastSyncedTravelersRef.current = JSON.stringify(serializedNext);
        setTravelers(nextTravelers);
        setTravelerDetails(serializedNext);
        if (field === "DOB") {
            setTravelerFieldError(
                nextTravelers[index]?.id,
                field,
                getTravelerDobError(nextTravelers[index]),
            );
        } else {
            clearTravelerFieldError(nextTravelers[index]?.id, field);
        }
    };

    const selectSavedTraveler = (passenger) => {
        const targetIndex = travelers.findIndex((traveler) => !traveler.FName && !traveler.LName);
        const index = targetIndex >= 0 ? targetIndex : 0;
        const current = travelers[index];
        if (!current) return;
        const nextTravelers = travelers.map((traveler, travelerIndex) =>
            travelerIndex === index
                ? {
                    ...traveler,
                    Title: passenger?.title || "Mr",
                    FName: passenger?.first_name || "",
                    LName: passenger?.last_name || "",
                    Gender: passenger?.gender || "",
                    DOB: passenger?.dob || "",
                    Nationality: passenger?.nationality || "",
                    PassportNo: passenger?.passport_no || "",
                    PDOE: passenger?.passport_expiry || "",
                    Email: passenger?.email || traveler.Email || "",
                    isOpen: true,
                }
                : traveler
        );
        const serializedNext = serializeTravelers(nextTravelers);
        lastSyncedTravelersRef.current = JSON.stringify(serializedNext);
        setTravelers(nextTravelers);
        setTravelerDetails(serializedNext);
        setTravelerFormErrors(EMPTY_TRAVELER_FORM_ERRORS);
    };

    const saveSpecificTraveler = async (traveler) => {
        const nullable = (value) => {
            if (value === undefined || value === null) return null;
            const normalized = String(value).trim();
            return normalized || null;
        };

        setSavingTravelerId(traveler.id);
        try {
            await createPassenger({
                type: "flight",
                title: nullable(traveler.Title),
                first_name: nullable(traveler.FName),
                last_name: nullable(traveler.LName),
                gender: nullable(traveler.Gender)?.toLowerCase() || null,
                dob: nullable(traveler.DOB),
                nationality: nullable(traveler.Nationality),
                passport_no: nullable(traveler.PassportNo),
                passport_expiry: nullable(traveler.PDOE),
            });
            toast.success("Traveler saved successfully.");
            await loadSavedTravelers();
        } catch (error) {
            toast.error(
                error?.response?.data?.error?.message ||
                error?.response?.data?.message ||
                "Unable to save traveler."
            );
        } finally {
            setSavingTravelerId("");
        }
    };

    const addTraveler = () => {
        if (travelers.length >= passengerSlots.length) return;
        const nextSlot = passengerSlots[travelers.length];
        if (!nextSlot) return;

        const nextTravelers = [
            ...travelers,
            buildTravelerPayload(nextSlot, true)
        ];
        const serializedNext = serializeTravelers(nextTravelers);

        lastSyncedTravelersRef.current = JSON.stringify(serializedNext);
        setTravelers(nextTravelers);
        setTravelerDetails(serializedNext);
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
        const nextBookingContact = {
            ...bookingContact,
            [field]: value,
        };

        lastSyncedBookingContactRef.current = JSON.stringify(nextBookingContact);
        setBookingContact(nextBookingContact);
        setBookingContactDetails(nextBookingContact);
        clearBookingFieldError(field);
    };

    const getTravelerFieldError = (travelerId, field) =>
        travelerFormErrors?.travelers?.[travelerId]?.[field] || "";

    const getBookingFieldError = (field) =>
        travelerFormErrors?.bookingContact?.[field] || "";
    return (
        <div className={styles.wrapper}>
            <section className={styles.savedTravelersSection}>
                <div className={styles.savedTravelersHeader}>
                    <div>
                        <h3>Saved Travelers</h3>

                    </div>
                    <input
                        type="search"
                        value={savedTravelerSearch}
                        onChange={(event) => setSavedTravelerSearch(event.target.value)}
                        placeholder="Search saved travelers"
                        aria-label="Search saved travelers"
                    />
                </div>
                {savedTravelersLoading ? (
                    <p className={styles.savedTravelerState}>Loading saved travelers…</p>
                ) : filteredSavedTravelers.length ? (
                    <div className={styles.savedTravelerGrid}>
                        {filteredSavedTravelers.map((passenger, index) => (
                            <button
                                type="button"
                                className={styles.savedTravelerCard}
                                key={passenger?.id || `${passenger?.first_name}-${index}`}
                                onClick={() => selectSavedTraveler(passenger)}
                            >
                                <strong>{[passenger?.title, passenger?.first_name, passenger?.last_name].filter(Boolean).join(" ") || "Traveler"}</strong>
                                <span>{passenger?.email || passenger?.phone || passenger?.mobile || "Saved flight traveler"}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className={styles.savedTravelerState}>No saved travelers found.</p>
                )}
            </section>

            {/* Add Traveler */}
            {travelers.length < passengerSlots.length && (
                <div className={styles.addTraveler} onClick={addTraveler}>
                    +Add Traveler
                </div>
            )}

            {/* Traveler Cards */}
            <div className={styles.travelerCards}>
                {travelers.map((traveler, index) => (
                <div key={traveler.id} className={`${styles.card} ${styles.travelerCard}`}>
                    <div className={styles.cardHeader}>

                        <h3>TRAVELER {index + 1} - {traveler.type}</h3>

                     <div className={styles.saveButtonParent}>
                     <button
                            type="button"
                            className={styles.savedTravellerButton}
                            disabled={savingTravelerId === traveler.id}
                            onClick={() => saveSpecificTraveler(traveler)}
                        >
                            {savingTravelerId === traveler.id ? "Saving…" : "Save traveller"}
                        </button>

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

                        {!isDomestic && (
                        <div className={styles.internationalFields}>
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

                        </div>

                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label className={styles.label}>Nationality</label>
                                <NationalitySelect
                                    value={traveler.Nationality}
                                    onChange={(value) => updateTravelerField(index, "Nationality", value)}
                                    hasError={Boolean(getTravelerFieldError(traveler.id, "Nationality"))}
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
                                    onClick={openNativeDatePicker}
                                />
                                {getTravelerFieldError(traveler.id, "PDOE") && (
                                    <span className={styles.errorText}>{getTravelerFieldError(traveler.id, "PDOE")}</span>
                                )}
                            </div>

                            <div className={`${styles.field} ${styles.selectField}`}>
                                <label className={styles.label}>Visa Type</label>
                                <select
                                    className={styles.select}
                                    value={traveler.VisaType}
                                    onChange={(event) => updateTravelerField(index, "VisaType", event.target.value)}
                                >
                                    <option value="">Select Visa Type</option>
                                    <option value="Tourist Visa">Tourist Visa</option>
                                    <option value="Visiting Visa">Visiting Visa</option>
                                    <option value="Business Visa">Business Visa</option>
                                    <option value="Transit Visa">Transit Visa</option>
                                    <option value="Student Visa">Student Visa</option>
                                </select>
                            </div>

                        </div>
                        </div>
                        )}
                    </div>

                </div>
            ))}

            {/* Booking Details */}
            <div className={styles.card}>
                <h3 className={styles.sectionTitle}>
                    BOOKING DETAILS WILL BE SENT TO
                </h3>

                <div className={`${styles.cardBody} ${styles.bookingCardBody}`}>
                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label className={styles.label}>Country Code</label>
                            <CountryCodeSelect
                                value={bookingContact.CountryCode}
                                hasError={Boolean(getBookingFieldError("CountryCode"))}
                                onChange={(value) => updateBookingContactField("CountryCode", value)}
                            />
                            {getBookingFieldError("CountryCode") && (
                                <span className={styles.errorText}>{getBookingFieldError("CountryCode")}</span>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Mobile Number</label>
                            <input
                                className={`${styles.input} ${styles.bookingInput} ${getBookingFieldError("MobileNumber") ? styles.fieldError : ""}`}
                                placeholder="Mobile number "
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
                                placeholder="Email "
                                value={bookingContact.Email}
                                onChange={(event) => updateBookingContactField("Email", event.target.value)}
                            />
                            {getBookingFieldError("Email") && (
                                <span className={styles.errorText}>{getBookingFieldError("Email")}</span>
                            )}
                        </div>
                    </div>

                    <div className={styles.gstSection}>
                        <label className={styles.gstCheckboxLabel}>
                            <input
                                type="checkbox"
                                checked={Boolean(bookingContact.HasGST)}
                                onChange={(event) => updateBookingContactField("HasGST", event.target.checked)}
                            />
                            <span>I have a GST number <em>(Optional)</em></span>
                        </label>

                        {bookingContact.HasGST && (
                            <div className={styles.gstFields}>
                                <div className={styles.field}>
                                    <label className={styles.label}>GSTIN</label>
                                    <input
                                        className={`${styles.input} ${styles.bookingInput}`}
                                        placeholder="GSTIN"
                                        value={bookingContact.GSTRegistrationNo || ""}
                                        onChange={(event) => updateBookingContactField("GSTRegistrationNo", event.target.value)}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>GST Holder Name</label>
                                    <input
                                        className={`${styles.input} ${styles.bookingInput}`}
                                        placeholder="GST Holder Name"
                                        value={bookingContact.GSTHolderName || ""}
                                        onChange={(event) => updateBookingContactField("GSTHolderName", event.target.value)}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>GST Email Address</label>
                                    <input
                                        className={`${styles.input} ${styles.bookingInput}`}
                                        type="email"
                                        placeholder="GST Email Address"
                                        value={bookingContact.GSTEmail || ""}
                                        onChange={(event) => updateBookingContactField("GSTEmail", event.target.value)}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>GST Phone Number</label>
                                    <input
                                        className={`${styles.input} ${styles.bookingInput}`}
                                        type="tel"
                                        placeholder="GST Phone Number"
                                        value={bookingContact.GSTPhone || ""}
                                        onChange={(event) => updateBookingContactField("GSTPhone", event.target.value)}
                                    />
                                </div>

                                <label className={`${styles.gstCheckboxLabel} ${styles.saveGstCheckbox}`}>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(bookingContact.SaveGST)}
                                        onChange={(event) => updateBookingContactField("SaveGST", event.target.checked)}
                                    />
                                    <span>Save GST Details</span>
                                </label>
                            </div>
                        )}
                    </div>

                </div>
            </div>
            </div>
        </div>
    );
};

export default TravelerDetails;

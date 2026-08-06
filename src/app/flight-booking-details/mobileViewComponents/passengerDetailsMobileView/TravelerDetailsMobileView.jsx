"use client";
import TripDetailsHeader from "@/shared/components/tripDetailsHeader/TripDetailsHeader";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./TravelerDetailsMobileView.module.css";
import { useFlightBooking } from "../../FlightBookingContext";
import PriceSummary from "@/features/profile/components/PriceSummary";
import { getBookingPassengerCounts } from "@/features/flights/utils/flightBookingSession";
import {
  EMPTY_TRAVELER_FORM_ERRORS,
  getBookingJourney,
  getPassportNoError,
  getTravelerDobError,
  validateTravelerForm,
} from "@/app/flight-booking-details/utils/travelerValidation";
import { toast } from "react-toastify";
import { buildMobilePriceSummary } from "../../utils/mobilePriceSummary";
import Cookies from "js-cookie";
import { useAuth } from "@/app/context/AuthContext";
import CountryCodeSelect from "@/app/flight-booking-details/components/CountryCodeSelect/CountryCodeSelect";
import NationalitySelect from "@/app/flight-booking-details/components/NationalitySelect/NationalitySelect";
import VisaTypeSelect from "@/app/flight-booking-details/components/VisaTypeSelect/VisaTypeSelect";

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

const buildTravelerPayload = (slot) => ({
  id: slot?.id || "adult-1",
  type: slot?.type || "ADULT",
  Title: "Mr",
  FName: "",
  LName: "",
  Age: "26",
  DOB: "",
  Gender: "Male",
  PTC: getPtcForTravelerType(slot?.type),
  Nationality: "IN",
  PassportNo: "1234567",
  PLI: "NOIDA",
  PDOE: "2026-04-28",
  VisaType: "",
  CountryCode: "IN",
  MobileNumber: "8532907106",
  Email: "MUKUL.MISHRA@WEBNINJAZ.COM",
});

const hydrateTravelers = (savedTravelers = [], passengerSlots = []) => {
  if (!Array.isArray(savedTravelers) || savedTravelers.length === 0) {
    return passengerSlots.map((slot) => buildTravelerPayload(slot));
  }

  return passengerSlots.map((slot, index) => {
    const traveler = savedTravelers[index];
    if (!traveler) {
      return buildTravelerPayload(slot);
    }

    return {
      ...buildTravelerPayload(slot),
      ...traveler,
      id: slot.id,
      type: slot.type,
      PTC: getPtcForTravelerType(slot.type),
    };
  });
};

const serializeTravelers = (travelers = []) =>
  travelers.map(({ id, type, ...payload }) => ({
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

const TravelerDetailsMobileView = ({ onClose }) => {
  const { user } = useAuth();
  const {
    setCurrentStep,
    bookingSession,
    loadSsrForBooking,
    ssrLoading,
    travelerDetails,
    setTravelerDetails,
    bookingContactDetails,
    setBookingContactDetails,
    travelerFormErrors,
    setTravelerFormErrors,
    prices,
  } = useFlightBooking();
  const passengerSlots = useMemo(
    () => buildPassengerSlots(bookingSession),
    [bookingSession]
  );
  const journey = getBookingJourney(bookingSession);
  const isDomestic = journey === "domestic";
  const [bookingContact, setBookingContact] = useState(
    getBookingContactState(bookingContactDetails)
  );
  const [travelers, setTravelers] = useState(() =>
    hydrateTravelers(travelerDetails, passengerSlots)
  );
  const lastSyncedTravelersRef = useRef(
    JSON.stringify(serializeTravelers(hydrateTravelers(travelerDetails, passengerSlots)))
  );
  const lastSyncedBookingContactRef = useRef(
    JSON.stringify(getBookingContactState(bookingContactDetails))
  );

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

  const [showPriceSummaryPopup, setShowPriceSummaryPopup] = useState(false);
  const priceSummary = useMemo(
    () => buildMobilePriceSummary({ prices, bookingSession, travelerDetails }),
    [bookingSession, prices, travelerDetails]
  );
  const addTraveler = () => {
    setTravelers((prev) => {
      if (prev.length >= passengerSlots.length) return prev;
      const nextSlot = passengerSlots[prev.length];
      if (!nextSlot) return prev;
      const next = [...prev, buildTravelerPayload(nextSlot)];
      const serializedNext = serializeTravelers(next);
      lastSyncedTravelersRef.current = JSON.stringify(serializedNext);
      setTravelerDetails(serializedNext);
      return next;
    });
  };

  const removeTraveler = (index) => {
    setTravelers((prev) => {
      const next = prev.filter((_, i) => i !== index);
      const serializedNext = serializeTravelers(next);
      lastSyncedTravelersRef.current = JSON.stringify(serializedNext);
      setTravelerDetails(serializedNext);
      return next;
    });
  };

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
    setTravelers((prev) => {
      const next = prev.map((traveler, travelerIndex) =>
        travelerIndex === index
          ? { ...traveler, [field]: normalizedValue }
          : traveler
      );
      const serializedNext = serializeTravelers(next);
      lastSyncedTravelersRef.current = JSON.stringify(serializedNext);
      setTravelerDetails(serializedNext);
      return next;
    });
    const travelerId = travelers[index]?.id;
    const fieldAlreadyHasError = Boolean(
      travelerFormErrors?.travelers?.[travelerId]?.[field]
    );
    if (field === "DOB" && fieldAlreadyHasError) {
      const nextTraveler = { ...travelers[index], DOB: normalizedValue };
      setTravelerFieldError(
        nextTraveler.id,
        field,
        getTravelerDobError(nextTraveler),
      );
    } else if (field === "PassportNo" && fieldAlreadyHasError) {
      setTravelerFieldError(
        travelerId,
        field,
        getPassportNoError(normalizedValue),
      );
    } else {
      clearTravelerFieldError(travelerId, field);
    }
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

  const handleContinue = async () => {
    const validation = validateTravelerForm({
      travelerDetails: serializeTravelers(travelers),
      bookingContactDetails: bookingContact,
      checklistResponse: bookingSession?.checklistResponse,
      journey,
    });

    setTravelerFormErrors(validation.errors);
    if (!validation.isValid) {
      toast.error(validation.message || "Please complete traveler details.");
      return;
    }

    if (!bookingSession?.priceResponse) {
      setCurrentStep(6);
      return;
    }

    const loaded = await loadSsrForBooking({
      travelerDetailsOverride: serializeTravelers(travelers),
    });
    if (loaded) {
      setCurrentStep(6);
    }
  };

  const getTravelerFieldError = (travelerId, field) =>
    travelerFormErrors?.travelers?.[travelerId]?.[field] || "";

  const getBookingFieldError = (field) =>
    travelerFormErrors?.bookingContact?.[field] || "";
  return (
    <div className={styles.TriipWrapper}>
      <TripDetailsHeader onBack={onClose} title="Passenger Info" />
      <div className={styles.tripDetailsContainer}>
        <div className={styles.tripDetailsHeader}>
          <h2 className={styles.heading}>TRAVELER Details</h2>
          {travelers.length < passengerSlots.length && (
            <div className={styles.addTraveler} onClick={addTraveler}>
              +Add Traveler
            </div>
          )}
        </div>

        {travelers.map((traveler, index) => (
          <div key={traveler.id} className={`${styles.card} ${styles.travelerCard}`}>
            <div className={styles.cardHeader}>
              <h3>
                TRAVELER {index + 1} - {traveler.type}
              </h3>

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
                <div className={`${styles.field} ${styles.selectField}`}>
                  <label className={styles.label}>Title</label>
                  <select
                    className={`${styles.select} ${getTravelerFieldError(traveler.id, "Title") ? styles.fieldError : ""}`}
                    value={traveler.Title}
                    onChange={(event) =>
                      updateTravelerField(index, "Title", event.target.value)
                    }
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
                    onChange={(event) =>
                      updateTravelerField(index, "FName", event.target.value)
                    }
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
                    onChange={(event) =>
                      updateTravelerField(index, "LName", event.target.value)
                    }
                  />
                  {getTravelerFieldError(traveler.id, "LName") && (
                    <span className={styles.errorText}>{getTravelerFieldError(traveler.id, "LName")}</span>
                  )}
                </div>

              </div>

              {isDomestic && (traveler.type === "CHILD" || traveler.PTC === "CHD") && (
                <div className={`${styles.grid} ${styles.childDobGrid}`}>
                  <div className={styles.field}>
                    <label className={styles.label}>DOB</label>
                    <input
                      className={`${styles.input} ${getTravelerFieldError(traveler.id, "DOB") ? styles.fieldError : ""}`}
                      type="date"
                      value={traveler.DOB}
                      onChange={(event) =>
                        updateTravelerField(index, "DOB", event.target.value)
                      }
                      onFocus={(event) => event.target.showPicker?.()}
                      onClick={(event) => event.target.showPicker?.()}
                    />
                    {getTravelerFieldError(traveler.id, "DOB") && (
                      <span className={styles.errorText}>{getTravelerFieldError(traveler.id, "DOB")}</span>
                    )}
                  </div>
                </div>
              )}

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
                    onChange={(event) =>
                      updateTravelerField(index, "Email", event.target.value)
                    }
                  />
                  {getTravelerFieldError(traveler.id, "Email") && (
                    <span className={styles.errorText}>{getTravelerFieldError(traveler.id, "Email")}</span>
                  )}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>DOB</label>
                  <input
                    className={`${styles.input} ${getTravelerFieldError(traveler.id, "DOB") ? styles.fieldError : ""}`}
                    type="date"
                    value={traveler.DOB}
                    onChange={(event) =>
                      updateTravelerField(index, "DOB", event.target.value)
                    }
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
                  <NationalitySelect
                    value={traveler.Nationality}
                    onChange={(value) =>
                      updateTravelerField(index, "Nationality", value)
                    }
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
                    minLength={6}
                    maxLength={20}
                    pattern="[A-Za-z0-9]{6,20}"
                    autoCapitalize="characters"
                    value={traveler.PassportNo}
                    onChange={(event) =>
                      updateTravelerField(
                        index,
                        "PassportNo",
                        event.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 20)
                      )
                    }
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
                    maxLength={50}
                    value={traveler.PLI}
                    onChange={(event) =>
                      updateTravelerField(
                        index,
                        "PLI",
                        event.target.value.replace(/[^A-Za-z .'-]/g, "").slice(0, 50)
                      )
                    }
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
                    onChange={(event) =>
                      updateTravelerField(index, "PDOE", event.target.value)
                    }
                    onFocus={(event) => event.target.showPicker?.()}
                    onClick={(event) => event.target.showPicker?.()}
                  />
                  {getTravelerFieldError(traveler.id, "PDOE") && (
                    <span className={styles.errorText}>{getTravelerFieldError(traveler.id, "PDOE")}</span>
                  )}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Visa Type</label>
                  <VisaTypeSelect
                    value={traveler.VisaType}
                    onChange={(value) =>
                      updateTravelerField(index, "VisaType", value)
                    }
                    hasError={Boolean(getTravelerFieldError(traveler.id, "VisaType"))}
                  />
                  {getTravelerFieldError(traveler.id, "VisaType") && (
                    <span className={styles.errorText}>{getTravelerFieldError(traveler.id, "VisaType")}</span>
                  )}
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

          <div className={styles.cardBody}>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label}>Country Code</label>
                <CountryCodeSelect
                  value={bookingContact.CountryCode}
                  hasError={Boolean(getBookingFieldError("CountryCode"))}
                  onChange={(value) =>
                    updateBookingContactField("CountryCode", value)
                  }
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
                  onChange={(event) =>
                    updateBookingContactField("MobileNumber", event.target.value)
                  }
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
                  onChange={(event) =>
                    updateBookingContactField("Email", event.target.value)
                  }
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
                  onChange={(event) =>
                    updateBookingContactField("HasGST", event.target.checked)
                  }
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
                      onChange={(event) =>
                        updateBookingContactField("GSTRegistrationNo", event.target.value)
                      }
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>GST Holder Name</label>
                    <input
                      className={`${styles.input} ${styles.bookingInput}`}
                      placeholder="GST Holder Name"
                      value={bookingContact.GSTHolderName || ""}
                      onChange={(event) =>
                        updateBookingContactField("GSTHolderName", event.target.value)
                      }
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>GST Email Address</label>
                    <input
                      className={`${styles.input} ${styles.bookingInput}`}
                      type="email"
                      placeholder="GST Email Address"
                      value={bookingContact.GSTEmail || ""}
                      onChange={(event) =>
                        updateBookingContactField("GSTEmail", event.target.value)
                      }
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>GST Phone Number</label>
                    <input
                      className={`${styles.input} ${styles.bookingInput}`}
                      type="tel"
                      placeholder="GST Phone Number"
                      value={bookingContact.GSTPhone || ""}
                      onChange={(event) =>
                        updateBookingContactField("GSTPhone", event.target.value)
                      }
                    />
                  </div>

                  <label className={`${styles.gstCheckboxLabel} ${styles.saveGstCheckbox}`}>
                    <input
                      type="checkbox"
                      checked={Boolean(bookingContact.SaveGST)}
                      onChange={(event) =>
                        updateBookingContactField("SaveGST", event.target.checked)
                      }
                    />
                    <span>Save GST Details</span>
                  </label>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      {showPriceSummaryPopup && (
        <PriceSummary
          onClose={() => setShowPriceSummaryPopup(false)}
          lineItems={priceSummary.lineItems}
          totalAmount={priceSummary.totalAmount}
        />
      )}
      <div className={styles.footer}>
        {/* LEFT */}
        <div className={styles.footerContainer}>
          <div className={styles.amountSection}>
            <div className={styles.Btnlabel}>
              Total Amount
              <span
                onClick={() => setShowPriceSummaryPopup(true)}
                className={styles.infoIcon}
              >
                !
              </span>
            </div>
            <div className={styles.amount}>{priceSummary.totalAmount}</div>
          </div>

          {/* RIGHT */}
          <button
            type="button"
            onClick={handleContinue}
            className={styles.continueBtn}
            disabled={ssrLoading}
          >
            {ssrLoading ? "LOADING..." : "CONTINUE BOOKING"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TravelerDetailsMobileView;

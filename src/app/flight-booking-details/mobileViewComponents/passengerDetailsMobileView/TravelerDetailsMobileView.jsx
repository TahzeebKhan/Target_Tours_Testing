"use client";
import TripDetailsHeader from "@/shared/components/tripDetailsHeader/TripDetailsHeader";
import React, { useEffect, useMemo, useState } from "react";
import styles from "./TravelerDetailsMobileView.module.css";
import { useFlightBooking } from "../../FlightBookingContext";
import PriceSummary from "@/features/profile/components/PriceSummary";

const buildPassengerSlots = (bookingSession) => {
  const priceRequest = bookingSession?.priceRequest || {};
  const searchKey = String(
    priceRequest?.search_key || bookingSession?.selectedFlight?.booking?.searchKey || ""
  ).trim();
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

const buildTravelerPayload = (slot) => ({
  id: slot?.id || "adult-1",
  type: slot?.type || "ADULT",
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
    return [buildTravelerPayload(passengerSlots[0])];
  }

  return savedTravelers.map((traveler, index) => {
    const slot = passengerSlots[index] || {
      id: traveler?.id || `traveler-${index + 1}`,
      type: traveler?.type || "ADULT",
    };

    return {
      ...buildTravelerPayload(slot),
      ...traveler,
      id: slot.id,
      type: slot.type,
    };
  });
};

const serializeTravelers = (travelers = []) =>
  travelers.map(({ id, type, ...payload }) => ({
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

const TravelerDetailsMobileView = ({ onClose }) => {
  const {
    setCurrentStep,
    bookingSession,
    loadSsrForBooking,
    ssrLoading,
    travelerDetails,
    setTravelerDetails,
    bookingContactDetails,
    setBookingContactDetails,
  } = useFlightBooking();
  const passengerSlots = useMemo(
    () => buildPassengerSlots(bookingSession),
    [bookingSession]
  );
  const [bookingContact, setBookingContact] = useState(
    getBookingContactState(bookingContactDetails)
  );
  const [travelers, setTravelers] = useState(() =>
    hydrateTravelers(travelerDetails, passengerSlots)
  );
  useEffect(() => {
    setTravelers(hydrateTravelers(travelerDetails, passengerSlots));
  }, [passengerSlots, travelerDetails]);

  useEffect(() => {
    setBookingContact(getBookingContactState(bookingContactDetails));
  }, [bookingContactDetails]);

  const [showPriceSummaryPopup, setShowPriceSummaryPopup] = useState(false);
  const addTraveler = () => {
    setTravelers((prev) => {
      if (prev.length >= passengerSlots.length) return prev;
      const nextSlot = passengerSlots[prev.length];
      const next = nextSlot ? [...prev, buildTravelerPayload(nextSlot)] : prev;
      setTravelerDetails(serializeTravelers(next));
      return next;
    });
  };

  const removeTraveler = (index) => {
    setTravelers((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setTravelerDetails(serializeTravelers(next));
      return next;
    });
  };

  const updateTravelerField = (index, field, value) => {
    setTravelers((prev) => {
      const next = prev.map((traveler, travelerIndex) =>
        travelerIndex === index
          ? { ...traveler, [field]: value }
          : traveler
      );
      setTravelerDetails(serializeTravelers(next));
      return next;
    });
  };

  const updateBookingContactField = (field, value) => {
    setBookingContact((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };
      setBookingContactDetails(next);
      return next;
    });
  };

  const handleContinue = async () => {
    const loaded = await loadSsrForBooking();
    if (loaded) {
      setCurrentStep(3);
    }
  };
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
          <div key={traveler.id} className={styles.card}>
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
                    className={styles.select}
                    value={traveler.Title}
                    onChange={(event) =>
                      updateTravelerField(index, "Title", event.target.value)
                    }
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
                    value={traveler.FName}
                    onChange={(event) =>
                      updateTravelerField(index, "FName", event.target.value)
                    }
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Last Name</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Enter Last Name"
                    value={traveler.LName}
                    onChange={(event) =>
                      updateTravelerField(index, "LName", event.target.value)
                    }
                  />
                </div>

              </div>

              <div className={styles.grid}>
                <div className={`${styles.field} ${styles.selectField}`}>
                  <label className={styles.label}>Gender</label>
                  <select
                    className={styles.select}
                    value={traveler.Gender}
                    onChange={(event) =>
                      updateTravelerField(index, "Gender", event.target.value)
                    }
                  >
                    <option value="" disabled hidden>
                      Select
                    </option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Country Code</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Country Code (optional)"
                    value={traveler.CountryCode}
                    onChange={(event) =>
                      updateTravelerField(index, "CountryCode", event.target.value)
                    }
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Mobile Number</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Mobile number (optional)"
                    value={traveler.MobileNumber}
                    onChange={(event) =>
                      updateTravelerField(index, "MobileNumber", event.target.value)
                    }
                  />
                </div>

              </div>

              <div className={styles.grid}>
                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input
                    className={styles.input}
                    type="email"
                    placeholder="Email (Optional)"
                    value={traveler.Email}
                    onChange={(event) =>
                      updateTravelerField(index, "Email", event.target.value)
                    }
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Age</label>
                  <input
                    className={styles.input}
                    type="number"
                    placeholder="Enter Age"
                    value={traveler.Age}
                    onChange={(event) =>
                      updateTravelerField(index, "Age", event.target.value)
                    }
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>DOB</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={traveler.DOB}
                    onChange={(event) =>
                      updateTravelerField(index, "DOB", event.target.value)
                    }
                  />
                </div>
              </div>

              <div className={styles.grid}>
                <div className={styles.field}>
                  <label className={styles.label}>Nationality</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Nationality"
                    value={traveler.Nationality}
                    onChange={(event) =>
                      updateTravelerField(index, "Nationality", event.target.value)
                    }
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Passport No</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Passport Number"
                    value={traveler.PassportNo}
                    onChange={(event) =>
                      updateTravelerField(index, "PassportNo", event.target.value)
                    }
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Passport Issue Place</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Passport Issue Place"
                    value={traveler.PLI}
                    onChange={(event) =>
                      updateTravelerField(index, "PLI", event.target.value)
                    }
                  />
                </div>
              </div>

              <div className={styles.grid}>
                <div className={styles.field}>
                  <label className={styles.label}>Passport Expiry</label>
                  <input
                    className={styles.input}
                    type="date"
                    value={traveler.PDOE}
                    onChange={(event) =>
                      updateTravelerField(index, "PDOE", event.target.value)
                    }
                    onFocus={(event) => event.target.showPicker?.()}
                    onClick={(event) => event.target.showPicker?.()}
                  />
                </div>

                <div className={`${styles.field} ${styles.selectField}`}>
                  <label className={styles.label}>Visa Type</label>
                  <select
                    className={styles.select}
                    value={traveler.VisaType}
                    onChange={(event) =>
                      updateTravelerField(index, "VisaType", event.target.value)
                    }
                  >
                    <option value="" disabled hidden>
                      Select
                    </option>
                    <option value="Visiting">Visiting</option>
                    <option value="Tourist">Tourist</option>
                    <option value="Business">Business</option>
                    <option value="Student">Student</option>
                    <option value="Work">Work</option>
                    <option value="Transit">Transit</option>
                  </select>
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
                  className={`${styles.input} ${styles.bookingInput}`}
                  placeholder="Country Code (optional)"
                  value={bookingContact.CountryCode}
                  onChange={(event) =>
                    updateBookingContactField("CountryCode", event.target.value)
                  }
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Mobile Number</label>
                <input
                  className={`${styles.input} ${styles.bookingInput}`}
                  placeholder="Mobile number (optional)"
                  value={bookingContact.MobileNumber}
                  onChange={(event) =>
                    updateBookingContactField("MobileNumber", event.target.value)
                  }
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                  className={`${styles.input} ${styles.bookingInput}`}
                  placeholder="Email (Optional)"
                  value={bookingContact.Email}
                  onChange={(event) =>
                    updateBookingContactField("Email", event.target.value)
                  }
                />
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label}>Address</label>
                <input
                  className={`${styles.input} ${styles.bookingInput}`}
                  placeholder="Address"
                  value={bookingContact.Address}
                  onChange={(event) =>
                    updateBookingContactField("Address", event.target.value)
                  }
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>State</label>
                <input
                  className={`${styles.input} ${styles.bookingInput}`}
                  placeholder="State"
                  value={bookingContact.State}
                  onChange={(event) =>
                    updateBookingContactField("State", event.target.value)
                  }
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>City</label>
                <input
                  className={`${styles.input} ${styles.bookingInput}`}
                  placeholder="City"
                  value={bookingContact.City}
                  onChange={(event) =>
                    updateBookingContactField("City", event.target.value)
                  }
                />
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label}>PIN</label>
                <input
                  className={`${styles.input} ${styles.bookingInput}`}
                  placeholder="PIN"
                  value={bookingContact.PIN}
                  onChange={(event) =>
                    updateBookingContactField("PIN", event.target.value)
                  }
                />
              </div>

              <div className={styles.field}></div>
              <div className={styles.field}></div>
            </div>
          </div>
        </div>
      </div>
      {showPriceSummaryPopup && (
        <PriceSummary onClose={() => setShowPriceSummaryPopup(false)} />
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
            <div className={styles.amount}>₹ 66,945</div>
          </div>

          {/* RIGHT */}
          <button
            onClick={handleContinue}
            className={styles.continueBtn}
          >
            {ssrLoading ? "LOADING..." : "CONTINUE BOOKING"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TravelerDetailsMobileView;

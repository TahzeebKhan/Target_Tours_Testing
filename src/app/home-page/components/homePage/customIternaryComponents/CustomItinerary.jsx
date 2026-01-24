"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./CustomItinerary.module.css";
import Stepper from "./stepper/Stepper";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import CustomCheckbox from "@/app/components/CustomCheckbox";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

const CustomItinerary = ({ type, isOpen, hotel, onClose }) => {
  const [selected, setSelected] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);

  //   const [travelDateType, setTravelDateType] = useState(null);
  // values: "fixed" | "flexible"
  const [formData, setFormData] = useState({
    // step 1
    travelDateType: null, // "fixed" | "flexible"
    departureCity: "",
    departureDate: "",
    adults: 1,
    children: 0,
    childrenAgeGroup: "",

    // step 2

    notes: "",
    budget: "",
    tnc: false,

    // step 3
    internationalFlight: null,
    flexibleBudget: null,
    stageInPlanning: "",
    whatToSee: "",
    bestTimeToTalk: "",
    country: "",

    firstName: "",
    email: "",
    phone: "",
    contactPreference: [], // phone / whatsapp / email
  });

  // customization state
  const [hotelCategory, setHotelCategory] = useState("");
  const addonOptions = [
    "Cruise",
    "Safari",
    "Adventure",
    "Cultural",
    "Wine & Dine",
    "Photography",
  ];
  const [selectedAddons, setSelectedAddons] = useState([]);

  // two-thumb range values (in rupees)
  const [minPrice, setMinPrice] = useState(5000);
  const [maxPrice, setMaxPrice] = useState(100000);

  const [notes, setNotes] = useState("");
  const initialFormData = {
    travelDateType: null,
    departureCity: "",
    departureDate: "",
    adults: 1,
    children: 0,
    childrenAgeGroup: "",

    budget: "",
    tnc: false,

    internationalFlight: null,
    flexibleBudget: null,
    stageInPlanning: "",
    whatToSee: "",
    bestTimeToTalk: "",
    country: "",

    firstName: "",
    email: "",
    phone: "",
    contactPreference: [],
  };
  const resetAllStates = () => {
    setCurrentStep(1);
    setFormData(initialFormData);
    setHotelCategory("");
    setSelectedAddons([]);
    setMinPrice(5000);
    setMaxPrice(100000);
    setNotes("");
  };

  const toggleAddon = (name) => {
    setSelectedAddons((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
    else handleClose?.();
  };
  const formatForBackend = (date) => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  const parseFromBackend = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr);
  };

  const handleMinChange = (e) => {
    const val = Number(e.target.value);
    const clamped = Math.min(val, maxPrice - 1000);
    setMinPrice(clamped);
  };
  const selectHotelCategory = (category) => {
    setHotelCategory(category);
  };

  const handleMaxChange = (e) => {
    const val = Number(e.target.value);
    const clamped = Math.max(val, minPrice + 1000);
    setMaxPrice(clamped);
  };

  const selectTravelDateType = (type) => {
    setFormData((prev) => ({ ...prev, travelDateType: type }));
  };

  const validateGroupTrip = () => {
    if (!formData.travelDateType)
      return "Please select travel date preference (Fixed or Flexible)";

    if (!formData.departureCity) return "Departure city is required";
    if (!formData.departureDate) return "Departure date is required";
    if (!formData.adults) return "Number of adults is required";

    if (!formData.childrenAgeGroup && formData.children > 0)
      return "Children age group is required";

    if (!formData.budget) return "Budget is required";
    if (formData.internationalFlight === null)
      return "International flight selection required";

    if (formData.flexibleBudget === null)
      return "Flexible budget selection required";

    if (!formData.stageInPlanning) return "Stage in planning is required";

    if (!formData.whatToSee)
      return "Please tell us what you want to see and do";

    if (!formData.firstName) return "First name is required";
    const email = formData.email?.trim().toLowerCase();

    if (!email) return "Email is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email format";

    if (!formData.phone) return "Phone number is required";
    if (!/^[6-9]\d{9}$/.test(formData.phone))
      return "Please enter a valid 10-digit phone number";
    if (!formData.bestTimeToTalk) return "Best time to talk is required";
    if (!formData.country) return "Country of residence is required";
    if (!formData.tnc) return "Please accept Terms & Conditions";

    return null;
  };
  const validatePrivateTrip = () => {
    if (!formData.travelDateType) return "Please select travel date preference";

    if (!formData.departureCity) return "Departure city is required";

    if (!formData.adults) return "Number of adults is required";
    if (!hotelCategory) return "Please select hotel category";

    if (!formData.firstName) return "First name is required";

    if (!formData.email) return "Email is required";

    if (!formData.phone) return "Phone number is required";

    if (!/^[6-9]\d{9}$/.test(formData.phone))
      return "Please enter a valid 10-digit phone number";

    if (!formData.bestTimeToTalk) return "Best time to talk is required";
    if (formData.travelDateType === "fixed" && !formData.departureDate) {
      return "Departure date is required for fixed dates";
    }
    if (!formData.country) return "Country of residence is required";

    if (!formData.tnc) return "Please accept Terms & Conditions";
    if (!formData.whatToSee)
      return "Please tell us what you want to see and do";

    return null;
  };

  const buildGroupPayload = () => ({
    travel_dates_preference: formData.travelDateType,
    departure_date: formData.departureDate,
    adults_no: formData.adults,
    children_no: formData.children || 0,
    children_age_group: formData.childrenAgeGroup || "",
    budget: Number(formData.budget),
    international_flight: formData.internationalFlight,
    flexible_budget: formData.flexibleBudget,
    stage_in_planning: formData.stageInPlanning,
    what_like_to_see_and_do: formData.whatToSee,
    first_name: formData.firstName,
    email: formData.email,
    phone_no: formData.phone,
    tnc_agreeement: formData.tnc,
    departure_city: formData.departureCity,
    best_time_to_talk: formData.bestTimeToTalk,
    country_of_residence: formData.country,
  });

  const buildPrivatePayload = () => {
    const payload = {
      travel_dates_preference: formData.travelDateType,
      adults_no: formData.adults,
      hotel_category: hotelCategory.toLowerCase(),
      budget_start_range: minPrice,
      budget_end_range: maxPrice,
      experience_add_ons: selectedAddons.map((a) => a.toLowerCase()),
      special_request: notes,
      first_name: formData.firstName,
      email: formData.email,
      phone_no: formData.phone,
      tnc_agreeement: formData.tnc,
      departure_city: formData.departureCity,
      best_time_to_talk: formData.bestTimeToTalk,
      country_of_residence: formData.country,
    };

    // 🔴 FIX: include departure_date ONLY if fixed
    if (formData.travelDateType === "fixed") {
      payload.departure_date = formData.departureDate;
    }

    return payload;
  };

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep((s) => s + 1);
      return;
    }

    // STEP 3 → SUBMIT
    const error =
      type === "group" ? validateGroupTrip() : validatePrivateTrip();

    if (error) {
      toast.error(error);
      return;
    }

    const payload =
      type === "group" ? buildGroupPayload() : buildPrivatePayload();
    const authToken = Cookies.get("auth_token");
    if (!authToken) {
      toast.error("Login before proceeding.");
      return; // ⬅️ VERY IMPORTANT
    }
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/custom-itinerary/${type}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      toast.success("Your trip request has been submitted!");
      handleClose?.();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    }
  };
  const handleClose = () => {
    resetAllStates();
    onClose?.();
  };
  useEffect(() => {
    console.log("form data ", formData);
  }, [formData]);
  useEffect(() => {
    if (!isOpen) {
      resetAllStates();
    }
  }, [isOpen]);

  return (
    <>
      {type === "group" && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className={styles.popupOverlay}
              onClick={handleClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={styles.popupCard}
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: -40, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -40, height: 0 }}
                transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
              >
                {/* HEADER */}
                <div className={styles.popupHeader}>
                  <h4>Group Trip Preference</h4>
                  <button onClick={handleClose} className={styles.closeBtn}>
                    ✕
                  </button>
                </div>

                {/* CONTENT */}
                <div className={styles.popupContent}>
                  <Stepper currentStep={currentStep} />

                  {currentStep === 1 && (
                    <div className={styles.TravelPreferences}>
                      <div className={styles.TravelPreferencesTop}>
                        <h3 className={styles.TravelPreferencesHeading}>
                          Travel Preferences
                        </h3>
                        <p className={styles.TravelPreferencesDescription}>
                          Tell us about your ideal travel dates and departure
                          details
                        </p>
                      </div>
                      <div className={styles.TravelPreferencesCenter}>
                        <h4 className={styles.TravelPreferencesSubHeading}>
                          Travel Dates
                        </h4>
                        <div className={styles.calenderTabContainer}>
                          <div
                            className={`${styles.calenderTab} ${
                              formData.travelDateType === "fixed"
                                ? styles.calenderTabActive
                                : ""
                            }`}
                            onClick={() => selectTravelDateType("fixed")}
                          >
                            <img src="/icons/blackCalendar.svg" alt="" />
                            <span className={styles.calenderTabText}>
                              Fixed Dates
                            </span>
                          </div>

                          <div
                            className={`${styles.calenderTab} ${
                              formData.travelDateType === "flexible"
                                ? styles.calenderTabActive
                                : ""
                            }`}
                            onClick={() => selectTravelDateType("flexible")}
                          >
                            <img src="/icons/blackCalendar.svg" alt="" />
                            <span className={styles.calenderTabText}>
                              Flexible Dates
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.travelGrid}>
                        {/* Departure City */}
                        <div className={styles.TravelPreferencesCenter}>
                          <h4 className={styles.TravelPreferencesSubHeading}>
                            DEPARTURE CITY
                          </h4>
                          <input
                            className={styles.inputField}
                            type="text"
                            placeholder="e.g., New York, London, Singapore"
                            value={formData.departureCity}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                departureCity: e.target.value,
                              }))
                            }
                          />
                        </div>

                        {/* Departure Date */}
                        <div className={styles.TravelPreferencesCenter}>
                          <h4 className={styles.TravelPreferencesSubHeading}>
                            DEPARTURE DATE
                          </h4>

                          <Popover modal={false}>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className={styles.inputField}
                                style={{ textAlign: "left" }}
                              >
                                {formData.departureDate
                                  ? format(
                                      parseFromBackend(formData.departureDate),
                                      "dd MMM yyyy",
                                    )
                                  : "Select departure date"}
                              </button>
                            </PopoverTrigger>

                            <PopoverContent
                              side="bottom"
                              align="start"
                              sideOffset={6}
                              className="w-auto p-0 z-[9999]"
                            >
                              <Calendar
                                mode="single"
                                selected={parseFromBackend(
                                  formData.departureDate,
                                )}
                                onSelect={(date) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    departureDate: formatForBackend(date),
                                  }))
                                }
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Number of Adults */}
                        <div className={styles.TravelPreferencesCenter}>
                          <h4 className={styles.TravelPreferencesSubHeading}>
                            NUMBER OF ADULTS
                          </h4>
                          <input
                            className={styles.inputField}
                            type="number"
                            min={1}
                            placeholder="e.g., 2"
                            value={formData.adults}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                adults: Number(e.target.value),
                              }))
                            }
                          />
                        </div>

                        {/* Number of Children */}
                        <div className={styles.TravelPreferencesCenter}>
                          <h4 className={styles.TravelPreferencesSubHeading}>
                            NO OF CHILDREN
                          </h4>
                          <input
                            className={styles.inputField}
                            type="number"
                            min={0}
                            placeholder="e.g., 1"
                            value={formData.children}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                children: Number(e.target.value),
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className={styles.TravelPreferences}>
                      {/* TOP */}
                      <div className={styles.TravelPreferencesTop}>
                        <h3 className={styles.TravelPreferencesHeading}>
                          Customize Your Experience
                        </h3>
                        <p className={styles.TravelPreferencesDescription}>
                          Tell us about your ideal travel dates and departure
                          details
                        </p>
                      </div>

                      {/* GRID */}
                      <div className={styles.step2Grid}>
                        {/* AGE GROUP */}
                        <div className={styles.item2}>
                          <h4 className={styles.TravelPreferencesSubHeading}>
                            AGE GROUP OF CHILDREN
                          </h4>
                          <div className={styles.checkboxRow}>
                            {["0-2", "3-7", "8-12", "13-17"].map((age) => (
                              <label key={age} className={styles.checkboxItem}>
                                <CustomCheckbox
                                  checked={formData.childrenAgeGroup === age}
                                  onChange={() =>
                                    setFormData((p) => ({
                                      ...p,
                                      childrenAgeGroup: age,
                                    }))
                                  }
                                  labelColor="#4A5565"
                                  gap={6}
                                  label={age}
                                />
                                {/* <span>{age}</span> */}
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* PER PERSON BUDGET */}
                        <div className={styles.item2}>
                          <h4 className={styles.TravelPreferencesSubHeading}>
                            PER PERSON BUDGET FOR ENTIRE TRIP
                          </h4>
                          <input
                            className={styles.inputField}
                            type="number"
                            value={formData.budget}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                budget: e.target.value,
                              }))
                            }
                          />
                        </div>

                        {/* INTERNATIONAL FLIGHTS */}
                        <div className={styles.item2}>
                          <h4 className={styles.TravelPreferencesSubHeading}>
                            INTERNATIONAL FLIGHTS INCLUDED IN BUDGET?
                          </h4>
                          <select
                            className={styles.inputField}
                            value={
                              formData.internationalFlight === null
                                ? ""
                                : formData.internationalFlight
                                  ? "Yes"
                                  : "No"
                            }
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                internationalFlight: e.target.value === "Yes",
                              }))
                            }
                          >
                            <option value="" disabled>
                              Select
                            </option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>

                        {/* BUDGET FLEXIBLE */}
                        <div className={styles.item2}>
                          <h4 className={styles.TravelPreferencesSubHeading}>
                            IS BUDGET FLEXIBLE?
                          </h4>
                          <select
                            className={styles.inputField}
                            value={
                              formData.flexibleBudget === null
                                ? ""
                                : formData.flexibleBudget
                                  ? "Yes"
                                  : "No"
                            }
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                flexibleBudget: e.target.value === "Yes",
                              }))
                            }
                          >
                            <option value="" disabled>
                              Select
                            </option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>

                        {/* STAGE IN PLANNING */}
                        <div className={`${styles.fullWidth} ${styles.item2}`}>
                          <h4 className={styles.TravelPreferencesSubHeading}>
                            STAGE IN PLANNING
                          </h4>
                          <input
                            className={styles.inputField}
                            type="text"
                            placeholder="e.g. Just exploring, Ready to book"
                            value={formData.stageInPlanning}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                stageInPlanning: e.target.value,
                              }))
                            }
                          />
                        </div>

                        {/* WHAT TO SEE & DO */}
                        <div className={`${styles.fullWidth} ${styles.item2}`}>
                          <h4 className={styles.TravelPreferencesSubHeading}>
                            WHAT WOULD YOU LIKE TO SEE AND DO?
                          </h4>
                          <textarea
                            className={styles.notes}
                            value={formData.whatToSee}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                whatToSee: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div
                      className={`${styles.TravelPreferences} ${styles.step3Grid}`}
                    >
                      <div
                        className={`${styles.TravelPreferencesTop} ${styles.fullWidth}`}
                      >
                        <h3 className={styles.TravelPreferencesHeading}>
                          Customize Your Experience
                        </h3>
                        <p className={styles.TravelPreferencesDescription}>
                          Tailor your journey to match your preferences
                        </p>
                      </div>
                      <div
                        className={`${styles.TravelPreferencesCenter}  ${styles.fullWidth}`}
                      >
                        <h4 className={styles.TravelPreferencesSubHeading}>
                          First Name *
                        </h4>
                        <input
                          className={styles.inputField}
                          type="text"
                          placeholder="Enter First Name"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              firstName: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className={styles.TravelPreferencesCenter}>
                        <h4 className={styles.TravelPreferencesSubHeading}>
                          Email Address *
                        </h4>
                        <input
                          className={styles.inputField}
                          type="text"
                          placeholder="Enter Email Address"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              email: e.target.value,
                            }))
                          }
                          onBlur={() => {
                            const email = formData.email?.trim().toLowerCase();
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            if (email && !emailRegex.test(email)) {
                              toast.error("Invalid email format");
                            }
                          }}
                        />
                      </div>
                      <div className={styles.TravelPreferencesCenter}>
                        <h4 className={styles.TravelPreferencesSubHeading}>
                          Phone Number *
                        </h4>
                        <input
                          className={styles.inputField}
                          type="tel"
                          placeholder="Enter 10-digit Phone Number"
                          value={formData.phone}
                          maxLength={10}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            if (val.length <= 10) {
                              setFormData((p) => ({
                                ...p,
                                phone: val,
                              }));
                            }
                          }}
                        />
                      </div>
                      <div className={styles.TravelPreferencesCenter}>
                        <h4 className={styles.TravelPreferencesSubHeading}>
                          BEST TIME TO TALK *
                        </h4>
                        <input
                          className={styles.inputField}
                          type="text"
                          placeholder="Enter Time"
                          value={formData.bestTimeToTalk}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              bestTimeToTalk: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className={styles.TravelPreferencesCenter}>
                        <h4 className={styles.TravelPreferencesSubHeading}>
                          COUNTRY OF RESIDENCE *
                        </h4>
                        <input
                          className={styles.inputField}
                          type="text"
                          placeholder="Enter Country"
                          value={formData.country}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              country: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div
                        className={`${styles.declaration} ${styles.fullWidth}`}
                      >
                        <CustomCheckbox
                          gap={6}
                          checked={formData.tnc}
                          onChange={() =>
                            setFormData((p) => ({ ...p, tnc: !p.tnc }))
                          }
                          alignItemsStart={true}
                          labelColor="#4A5565"
                          label={`Yes! I'd like to receive Target Tour newsletter on travel news & specials.
  <br />
  By clicking "Get My Trip Planned" below, I agree to the Terms of Use and Privacy Policy.`}
                          labelStyle={{
                            fontFamily: "Poppins",
                            fontSize: "14px",
                            fontWeight: 400,
                            lineHeight: "1.4",
                            textTransform: "none",
                          }}
                        />
                      </div>
                      {/* <div className={styles.section}>
                        <h4 className={styles.TravelPreferencesSubHeading}>
                          HOTEL CATEGORY
                        </h4>
                        <div className={styles.hotelCategory}>
                          {["Phone Call", "WhatsApp", "Email"].map((c) => (
                            <button
                              key={c}
                              className={`${styles.categoryOption} ${hotelCategory.includes(c) ? styles.activeCategory : ""}`}
                              onClick={() => toggleHotelCategory(c)}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div> */}
                    </div>
                  )}

                  <div className={styles.TravelPreferencesButtonContainer}>
                    <div
                      className={styles.TravelPreferencesBackButton}
                      onClick={handleBack}
                    >
                      <div className={styles.arrowCont}>
                        <svg
                          width="12"
                          height="11"
                          viewBox="0 0 12 11"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2.55414 4.51888L12.0034 4.51889L12.0034 5.85202L2.55461 5.85248L6.13021 9.42808L5.1874 10.3709L0.00195277 5.18545L5.1874 -2.41939e-06L6.13021 0.942805L2.55414 4.51888Z"
                            fill="#A5A5A5"
                          />
                        </svg>
                      </div>

                      <span className={styles.backBtn}>
                        {currentStep === 1 ? "CLOSE" : "BACK"}
                      </span>
                    </div>
                    <button
                      className={styles.TravelPreferencesNextButton}
                      onClick={handleNext}
                    >
                      {currentStep === 3 ? "CONFIRM" : "CONTINUE"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      {type === "private" && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className={styles.popupOverlay}
              onClick={handleClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={styles.popupCard}
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: -40, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -40, height: 0 }}
                transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
              >
                {/* HEADER */}
                <div className={styles.popupHeader}>
                  <h4>Private Trip Preference</h4>
                  <button onClick={handleClose} className={styles.closeBtn}>
                    ✕
                  </button>
                </div>

                {/* CONTENT */}
                <div className={styles.popupContent}>
                  <Stepper currentStep={currentStep} />

                  {currentStep === 1 && (
                    <div className={styles.TravelPreferences}>
                      <div className={styles.TravelPreferencesTop}>
                        <h3 className={styles.TravelPreferencesHeading}>
                          Travel Preferences
                        </h3>
                        <p className={styles.TravelPreferencesDescription}>
                          Tell us about your ideal travel dates and departure
                          details
                        </p>
                      </div>
                      <div className={styles.TravelPreferencesCenter}>
                        <h4 className={styles.TravelPreferencesSubHeading}>
                          Travel Dates
                        </h4>
                        <div className={styles.calenderTabContainer}>
                          <div
                            className={`${styles.calenderTab} ${
                              formData.travelDateType === "fixed"
                                ? styles.calenderTabActive
                                : ""
                            }`}
                            onClick={() => selectTravelDateType("fixed")}
                          >
                            <img src="/icons/blackCalendar.svg" alt="" />
                            <span className={styles.calenderTabText}>
                              Fixed Dates
                            </span>
                          </div>

                          <div
                            className={`${styles.calenderTab} ${
                              formData.travelDateType === "flexible"
                                ? styles.calenderTabActive
                                : ""
                            }`}
                            onClick={() => selectTravelDateType("flexible")}
                          >
                            <img src="/icons/blackCalendar.svg" alt="" />
                            <span className={styles.calenderTabText}>
                              Flexible Dates
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.travelGrid}>
                        {/* Departure City */}
                        <div className={styles.TravelPreferencesCenter}>
                          <h4 className={styles.TravelPreferencesSubHeading}>
                            DEPARTURE CITY
                          </h4>
                          <input
                            className={styles.inputField}
                            type="text"
                            placeholder="e.g., New York, London, Singapore"
                            value={formData.departureCity}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                departureCity: e.target.value,
                              }))
                            }
                          />
                        </div>

                        {/* Departure Date */}
                        <div className={styles.TravelPreferencesCenter}>
                          <h4 className={styles.TravelPreferencesSubHeading}>
                            DEPARTURE DATE
                          </h4>

                          <Popover modal={false}>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className={styles.inputField}
                                style={{ textAlign: "left" }}
                              >
                                {formData.departureDate
                                  ? format(
                                      parseFromBackend(formData.departureDate),
                                      "dd MMM yyyy",
                                    )
                                  : "Select departure date"}
                              </button>
                            </PopoverTrigger>

                            <PopoverContent
                              side="bottom"
                              align="start"
                              sideOffset={6}
                              className="w-auto p-0 z-9999"
                            >
                              <Calendar
                                mode="single"
                                selected={parseFromBackend(
                                  formData.departureDate,
                                )}
                                onSelect={(date) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    departureDate: formatForBackend(date),
                                  }))
                                }
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Number of Adults */}
                        <div className={styles.TravelPreferencesCenter}>
                          <h4 className={styles.TravelPreferencesSubHeading}>
                            NUMBER OF ADULTS
                          </h4>
                          <input
                            className={styles.inputField}
                            type="number"
                            min={1}
                            placeholder="e.g., 2"
                            value={formData.adults}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                adults: Number(e.target.value),
                              }))
                            }
                          />
                        </div>

                        {/* Number of Children */}
                        <div className={styles.TravelPreferencesCenter}>
                          <h4 className={styles.TravelPreferencesSubHeading}>
                            NO OF CHILDREN
                          </h4>
                          <input
                            className={styles.inputField}
                            type="number"
                            min={0}
                            placeholder="e.g., 1"
                            value={formData.children}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                children: Number(e.target.value),
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <>
                      <div
                        className={`${styles.TravelPreferences} ${styles.privateStep2}`}
                      >
                        <div className={styles.TravelPreferencesTop}>
                          <h3 className={styles.TravelPreferencesHeading}>
                            Customize Your Experience
                          </h3>
                          <p className={styles.TravelPreferencesDescription}>
                            Tell us about your ideal travel dates and departure
                            details
                          </p>
                        </div>

                        <div className={styles.step2Grid}>
                          {/* AGE GROUP */}
                          <div className={styles.item2}>
                            <h4 className={styles.TravelPreferencesSubHeading}>
                              AGE GROUP OF CHILDREN
                            </h4>
                            <div className={styles.checkboxRow}>
                              {["0-2", "3-7", "8-12", "13-17"].map((age) => (
                                <label
                                  key={age}
                                  className={styles.checkboxItem}
                                >
                                  <CustomCheckbox
                                    checked={formData.childrenAgeGroup === age}
                                    onChange={() =>
                                      setFormData((p) => ({
                                        ...p,
                                        childrenAgeGroup: age,
                                      }))
                                    }
                                    labelColor="#4A5565"
                                    gap={6}
                                    label={age}
                                  />
                                  {/* <span>{age}</span> */}
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* PER PERSON BUDGET */}
                          <div className={styles.item2}>
                            <h4 className={styles.TravelPreferencesSubHeading}>
                              PER PERSON BUDGET FOR ENTIRE TRIP
                            </h4>
                            <input
                              className={styles.inputField}
                              type="number"
                              value={formData.budget}
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  budget: e.target.value,
                                }))
                              }
                            />
                          </div>

                          {/* INTERNATIONAL FLIGHTS */}
                          <div className={styles.item2}>
                            <h4 className={styles.TravelPreferencesSubHeading}>
                              INTERNATIONAL FLIGHTS INCLUDED IN BUDGET?
                            </h4>
                            <select
                              className={styles.inputField}
                              value={
                                formData.internationalFlight === null
                                  ? ""
                                  : formData.internationalFlight
                                    ? "Yes"
                                    : "No"
                              }
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  internationalFlight: e.target.value === "Yes",
                                }))
                              }
                            >
                              <option value="" disabled>
                                Select
                              </option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>

                          {/* BUDGET FLEXIBLE */}
                          <div className={styles.item2}>
                            <h4 className={styles.TravelPreferencesSubHeading}>
                              IS BUDGET FLEXIBLE?
                            </h4>
                            <select
                              className={styles.inputField}
                              value={
                                formData.flexibleBudget === null
                                  ? ""
                                  : formData.flexibleBudget
                                    ? "Yes"
                                    : "No"
                              }
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  flexibleBudget: e.target.value === "Yes",
                                }))
                              }
                            >
                              <option value="" disabled>
                                Select
                              </option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>

                          {/* STAGE IN PLANNING */}
                          <div
                            className={`${styles.fullWidth} ${styles.item2}`}
                          >
                            <h4 className={styles.TravelPreferencesSubHeading}>
                              STAGE IN PLANNING
                            </h4>
                            <input
                              className={styles.inputField}
                              type="text"
                              placeholder="e.g. Just exploring, Ready to book"
                              value={formData.stageInPlanning}
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  stageInPlanning: e.target.value,
                                }))
                              }
                            />
                          </div>

                          {/* WHAT TO SEE & DO */}
                          <div
                            className={`${styles.fullWidth} ${styles.item2}`}
                          >
                            <h4 className={styles.TravelPreferencesSubHeading}>
                              WHAT WOULD YOU LIKE TO SEE AND DO?
                            </h4>
                            <textarea
                              className={styles.notes}
                              value={formData.whatToSee}
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  whatToSee: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className={styles.section}>
                          <h4 className={styles.TravelPreferencesSubHeading}>
                            HOTEL CATEGORY
                          </h4>

                          <div className={styles.hotelCategory}>
                            {["Standard", "Premium", "Luxury"].map((c) => (
                              <button
                                key={c}
                                type="button"
                                className={`${styles.categoryOption} ${
                                  hotelCategory === c
                                    ? styles.activeCategory
                                    : ""
                                }`}
                                onClick={() => selectHotelCategory(c)}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className={styles.section}>
                          <h4 className={styles.TravelPreferencesSubHeading}>
                            EXPERIENCE ADD-ONS
                          </h4>
                          <div className={styles.addons}>
                            {addonOptions.map((a) => (
                              <button
                                key={a}
                                onClick={() => toggleAddon(a)}
                                className={`${styles.addonPill} ${selectedAddons.includes(a) ? styles.addonActive : ""}`}
                              >
                                {a}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className={styles.section}>
                          <h4 className={styles.TravelPreferencesSubHeading}>
                            trip budget (Per person)
                          </h4>
                          <div className={styles.rangeRow}>
                            <div
                              className={styles.rangeContainer}
                              style={{
                                "--left": `${(minPrice / 100000) * 100}%`,
                                "--right": `${100 - (maxPrice / 100000) * 100}%`,
                              }}
                            >
                              <div className={styles.sliderTrack}>
                                <div className={styles.sliderRange}></div>
                              </div>
                              <input
                                className={styles.rangeInput}
                                type="range"
                                min={0}
                                max={100000}
                                step={1000}
                                value={minPrice}
                                onChange={handleMinChange}
                              />
                              <input
                                className={styles.rangeInput}
                                type="range"
                                min={0}
                                max={100000}
                                step={1000}
                                value={maxPrice}
                                onChange={handleMaxChange}
                              />
                              <div className={styles.rangeValues}>
                                <div className={styles.rangeValueLeft}>
                                  ₹{minPrice.toLocaleString()}
                                </div>
                                <div className={styles.rangeValueRight}>
                                  Up ₹{maxPrice.toLocaleString()}+
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className={styles.section}>
                          <h4 className={styles.TravelPreferencesSubHeading}>
                            SPECIAL REQUESTS OR NOTES
                          </h4>
                          <textarea
                            className={styles.notes}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any special dietary requirement, accessibility needs or something we should know about..."
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {currentStep === 3 && (
                    <div
                      className={`${styles.TravelPreferences} ${styles.step3Grid}`}
                    >
                      <div
                        className={`${styles.TravelPreferencesTop} ${styles.fullWidth}`}
                      >
                        <h3 className={styles.TravelPreferencesHeading}>
                          Customize Your Experience
                        </h3>
                        <p className={styles.TravelPreferencesDescription}>
                          Tailor your journey to match your preferences
                        </p>
                      </div>
                      <div
                        className={`${styles.TravelPreferencesCenter}  ${styles.fullWidth}`}
                      >
                        <h4 className={styles.TravelPreferencesSubHeading}>
                          First Name *
                        </h4>
                        <input
                          className={styles.inputField}
                          type="text"
                          placeholder="Enter First Name"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              firstName: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className={styles.TravelPreferencesCenter}>
                        <h4 className={styles.TravelPreferencesSubHeading}>
                          Email Address *
                        </h4>
                        <input
                          className={styles.inputField}
                          type="text"
                          placeholder="Enter Email Address"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              email: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className={styles.TravelPreferencesCenter}>
                        <h4 className={styles.TravelPreferencesSubHeading}>
                          Phone Number *
                        </h4>
                        <input
                          className={styles.inputField}
                          type="tel"
                          value={formData.phone}
                          maxLength={10}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            if (val.length <= 10) {
                              setFormData((p) => ({ ...p, phone: val }));
                            }
                          }}
                          placeholder="Enter Phone Number"
                        />
                      </div>
                      <div className={styles.TravelPreferencesCenter}>
                        <h4 className={styles.TravelPreferencesSubHeading}>
                          BEST TIME TO TALK *
                        </h4>
                        <input
                          className={styles.inputField}
                          type="text"
                          placeholder="Enter Time"
                          value={formData.bestTimeToTalk}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              bestTimeToTalk: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className={styles.TravelPreferencesCenter}>
                        <h4 className={styles.TravelPreferencesSubHeading}>
                          COUNTRY OF RESIDENCE *
                        </h4>
                        <input
                          className={styles.inputField}
                          type="text"
                          placeholder="Enter Country"
                          value={formData.country}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              country: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div
                        className={`${styles.declaration} ${styles.fullWidth}`}
                      >
                        <CustomCheckbox
                          gap={6}
                          alignItemsStart={true}
                          labelColor="#4A5565"
                          label={`Yes! I'd like to receive Target Tour newsletter on travel news & specials.
  <br />
  By clicking "Get My Trip Planned" below, I agree to the Terms of Use and Privacy Policy.`}
                          labelStyle={{
                            fontFamily: "Poppins",
                            fontSize: "14px",
                            fontWeight: 400,
                            lineHeight: "1.4",
                            textTransform: "none",
                          }}
                          checked={formData.tnc}
                          onChange={() =>
                            setFormData((p) => ({ ...p, tnc: !p.tnc }))
                          }
                        />
                      </div>
                      {/* <div className={styles.section}>
                        <h4 className={styles.TravelPreferencesSubHeading}>
                          HOTEL CATEGORY
                        </h4>
                        <div className={styles.hotelCategory}>
                          {["Phone Call", "WhatsApp", "Email"].map((c) => (
                            <button
                              key={c}
                              className={`${styles.categoryOption} ${hotelCategory.includes(c) ? styles.activeCategory : ""}`}
                              onClick={() => toggleHotelCategory(c)}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div> */}
                    </div>
                  )}

                  <div className={styles.TravelPreferencesButtonContainer}>
                    <div
                      className={styles.TravelPreferencesBackButton}
                      onClick={handleBack}
                    >
                      <div className={styles.arrowCont}>
                        <svg
                          width="12"
                          height="11"
                          viewBox="0 0 12 11"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2.55414 4.51888L12.0034 4.51889L12.0034 5.85202L2.55461 5.85248L6.13021 9.42808L5.1874 10.3709L0.00195277 5.18545L5.1874 -2.41939e-06L6.13021 0.942805L2.55414 4.51888Z"
                            fill="#A5A5A5"
                          />
                        </svg>
                      </div>

                      <span className={styles.backBtn}>
                        {currentStep === 1 ? "CLOSE" : "BACK"}
                      </span>
                    </div>
                    <button
                      className={styles.TravelPreferencesNextButton}
                      onClick={handleNext}
                    >
                      {currentStep === 3 ? "CONFIRM" : "CONTINUE"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
};

export default CustomItinerary;

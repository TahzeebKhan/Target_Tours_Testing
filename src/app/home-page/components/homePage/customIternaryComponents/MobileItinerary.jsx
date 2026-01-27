"use client";
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import styles from "./MobileItinerary.module.css";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import CustomCheckbox from "@/app/components/CustomCheckbox";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

/* ✅ REQUIRED CONSTANTS (WERE MISSING) */
const MIN = 5000;
const MAX = 100000;
const GAP = 5000;
const STEP = 1000;

const MobileItinerary = ({ type, isOpen, onClose, hotel }) => {
  const [currentStep, setCurrentStep] = useState(1);

  // 🔒 Lock background scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ===== FORM STATE (UNCHANGED) =====
  const [travelDateType, setTravelDateType] = useState(null);
  const [departureCity, setDepartureCity] = useState("");
  const [hotelCategory, setHotelCategory] = useState("Standard");
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [minPrice, setMinPrice] = useState(MIN);
  const [maxPrice, setMaxPrice] = useState(MAX);
  const [notes, setNotes] = useState("");
  const [contactPreference, setContactPreference] = useState("Email");
  const [departureDate, setDepartureDate] = useState(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [childrenAgeGroup, setChildrenAgeGroup] = useState("");
  const [flightsIncluded, setFlightsIncluded] = useState(null); // true | false
  const [budgetFlexible, setBudgetFlexible] = useState(null); // true | falseconst [phone, setPhone] = useState("");
  const [bestTimeToCall, setBestTimeToCall] = useState("");
  const [countryOfResidence, setCountryOfResidence] = useState("");
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState("");
  const [stageInPlanning, setStageInPlanning] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");

  const formatForBackend = (date) => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };
  const validateGroupTrip = () => {
    if (!travelDateType) return "Please select travel date preference";

    if (!departureCity) return "Departure city is required";

    if (!departureDate) return "Departure date is required";

    if (!adults || adults < 1) return "Number of adults is required";

    if (children > 0 && !childrenAgeGroup)
      return "Children age group is required";

    if (!budget) return "Budget is required";

    if (flightsIncluded === null)
      return "Please select international flights option";

    if (budgetFlexible === null) return "Please select if budget is flexible";

    if (!stageInPlanning) return "Stage in planning is required";

    if (!notes) return "Please tell us what you want to see and do";

    if (!firstName) return "First name is required";

    if (!email) return "Email is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email address";

    if (!/^[6-9]\d{9}$/.test(phone))
      return "Please enter a valid 10-digit phone number";

    if (!bestTimeToCall) return "Best time to talk is required";

    if (!countryOfResidence) return "Country of residence is required";

    if (!newsletterConsent) return "Please accept Terms & Conditions";

    return null;
  };

  const validatePrivateTrip = () => {
    if (!travelDateType) return "Please select travel date preference";

    if (travelDateType === "fixed" && !departureDate)
      return "Departure date is required for fixed dates";

    if (!departureCity) return "Departure city is required";

    if (!adults || adults < 1) return "Number of adults is required";

    if (!hotelCategory) return "Please select hotel category";

    if (!minPrice || !maxPrice) return "Please select your budget range";

    if (!firstName) return "First name is required";

    if (!email) return "Email is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email address";

    if (!/^[6-9]\d{9}$/.test(phone))
      return "Please enter a valid 10-digit phone number";

    if (!bestTimeToCall) return "Best time to talk is required";

    if (!countryOfResidence) return "Country of residence is required";

    if (!newsletterConsent) return "Please accept Terms & Conditions";

    return null;
  };
  const buildPrivatePayload = () => {
    const payload = {
      travel_dates_preference: travelDateType,
      adults_no: adults,
      hotel_category: hotelCategory.toLowerCase(),
      budget_start_range: minPrice,
      budget_end_range: maxPrice,
      experience_add_ons: selectedAddons.map((a) => a.toLowerCase()),
      special_request: notes,
      first_name: firstName,
      email,
      phone_no: phone,
      tnc_agreeement: newsletterConsent,
      departure_city: departureCity,
      best_time_to_talk: bestTimeToCall,
      country_of_residence: countryOfResidence,
    };

    if (travelDateType === "fixed") {
      payload.departure_date = formatForBackend(departureDate);
    }

    return payload;
  };

  const buildGroupPayload = () => ({
    travel_dates_preference: travelDateType, // fixed | flexible
    departure_date: formatForBackend(departureDate),
    adults_no: adults,
    children_no: children || 0,
    children_age_group: childrenAgeGroup || "",
    budget: Number(budget),
    international_flight: flightsIncluded, // true | false
    flexible_budget: budgetFlexible, // true | false
    stage_in_planning: stageInPlanning,
    what_like_to_see_and_do: notes,
    first_name: firstName,
    email: email,
    phone_no: phone,
    tnc_agreeement: newsletterConsent,
    departure_city: departureCity,
    best_time_to_talk: bestTimeToCall,
    country_of_residence: countryOfResidence,
  });

  const resetForm = () => {
    setCurrentStep(1);
    setBudget("");
    setStageInPlanning("");
    setFirstName("");
    setEmail("");

    setTravelDateType(null);
    setDepartureCity("");
    setDepartureDate(null);

    setAdults(1);
    setChildren(0);
    setChildrenAgeGroup("");

    setMinPrice(MIN);
    setMaxPrice(MAX);

    setHotelCategory("Standard");
    setSelectedAddons([]);

    setNotes("");

    setFlightsIncluded(null);
    setBudgetFlexible(null);

    setPhone("");
    setBestTimeToCall("");
    setCountryOfResidence("");
    setNewsletterConsent(false);

    setContactPreference("Email");
  };
  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const addonOptions = [
    "Cruise",
    "Safari",
    "Adventure",
    "Cultural",
    "Wine & Dine",
    "Photography",
  ];

  const toggleAddon = (name) => {
    setSelectedAddons((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
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

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    } else {
      handleClose?.();
    }
  };

  return (
    <>
      {type === "group" && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className={styles.popupOverlay}
              onClick={handleClose} /* ✅ FIXED */
            >
              <motion.div
                className={styles.popupCard}
                onClick={(e) => e.stopPropagation()}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                <div className={styles.popupHeader}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepLabel}>
                      Private Trip Preference
                    </span>
                    <h4 className={styles.stepNumber}>STEP {currentStep}-3</h4>
                  </div>
                  <button
                    onClick={handleClose} /* ✅ FIXED */
                    className={styles.closeBtn}
                  >
                    ✕
                  </button>
                </div>

                <div className={styles.scrollableContent}>
                  <div className={styles.headingDiv}>
                    <h3 className={styles.mainHeading}>
                      {currentStep === 1
                        ? "Travel Preferences"
                        : "Customize Your Experience"}
                    </h3>
                    <p className={styles.subText}>
                      {currentStep === 1 || currentStep === 2
                        ? "Tell us about your ideal travel dates and departure details"
                        : "Tailor your journey to match your preferences"}
                    </p>
                  </div>

                  {currentStep === 1 && (
                    <div className={styles.formSection}>
                      {/* Travel Dates Type */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          TRAVEL DATES
                        </label>

                        <div className={styles.tabGrid}>
                          <div
                            className={`${styles.tabItem} ${
                              travelDateType === "fixed" ? styles.activeTab : ""
                            }`}
                            onClick={() => setTravelDateType("fixed")}
                          >
                            <Image
                              src="/icons/blackCalendar.svg"
                              width={20}
                              height={20}
                              alt="cal"
                            />
                            <span>Fixed Dates</span>
                          </div>

                          <div
                            className={`${styles.tabItem} ${
                              travelDateType === "flexible"
                                ? styles.activeTab
                                : ""
                            }`}
                            onClick={() => setTravelDateType("flexible")}
                          >
                            <Image
                              src="/icons/blackCalendar.svg"
                              width={20}
                              height={20}
                              alt="cal"
                            />
                            <span>Flexible Dates</span>
                          </div>
                        </div>
                      </div>

                      {/* Departure City */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          DEPARTURE CITY
                        </label>
                        <input
                          className={styles.textInput}
                          placeholder="e.g., New York, London, Singapore"
                          value={departureCity}
                          onChange={(e) => setDepartureCity(e.target.value)}
                        />
                      </div>

                      {/* Departure Date (shadcn date picker) */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          DEPARTURE DATE
                        </label>

                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className={`${styles.textInput} text-left`}
                            >
                              {departureDate
                                ? format(departureDate, "dd MMM yyyy")
                                : "Select date"}
                            </button>
                          </PopoverTrigger>

                          <PopoverContent
                            side="bottom"
                            sideOffset={8}
                            className="p-0 z-[9999]"
                            portalled
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={departureDate}
                              onSelect={setDepartureDate}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Adults */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          NUMBER OF ADULTS
                        </label>
                        <input
                          type="number"
                          min={1}
                          className={styles.textInput}
                          value={adults}
                          onChange={(e) =>
                            setAdults(Math.max(1, Number(e.target.value)))
                          }
                        />
                      </div>

                      {/* Children */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          NUMBER OF CHILDREN
                        </label>
                        <input
                          type="number"
                          min={0}
                          className={styles.textInput}
                          value={children}
                          onChange={(e) =>
                            setChildren(Math.max(0, Number(e.target.value)))
                          }
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className={styles.formSection}>
                      {/* AGE GROUP OF CHILDREN */}
                      <div className={`flex flex-col gap-1.5`}>
                        <h4 className={`text-[13px] font-medium `}>
                          AGE GROUP OF CHILDREN
                        </h4>

                        <div
                          className={`flex items-center justify-start gap-12`}
                        >
                          {["0-2", "3-7", "8-12", "13-17"].map((age) => (
                            <label key={age} className={styles.checkboxItem}>
                              <CustomCheckbox
                                checked={childrenAgeGroup === age}
                                onChange={() => setChildrenAgeGroup(age)}
                                label={age}
                                labelColor="#4A5565"
                                gap={6}
                              />
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* PER PERSON BUDGET */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          PER PERSON BUDGET FOR ENTIRE TRIP
                        </label>
                        <input
                          className={styles.textInput}
                          type="number"
                          placeholder="Enter amount"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                        />
                      </div>

                      {/* INTERNATIONAL FLIGHTS INCLUDED */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          INTERNATIONAL FLIGHTS INCLUDED IN BUDGET?
                        </label>

                        <select
                          className={styles.textInput}
                          value={
                            flightsIncluded === null
                              ? ""
                              : flightsIncluded
                                ? "yes"
                                : "no"
                          }
                          onChange={(e) =>
                            setFlightsIncluded(e.target.value === "yes")
                          }
                        >
                          <option value="">Select</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>

                      {/* IS BUDGET FLEXIBLE */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          IS BUDGET FLEXIBLE?
                        </label>

                        <select
                          className={styles.textInput}
                          value={
                            budgetFlexible === null
                              ? ""
                              : budgetFlexible
                                ? "yes"
                                : "no"
                          }
                          onChange={(e) =>
                            setBudgetFlexible(e.target.value === "yes")
                          }
                        >
                          <option value="">Select</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>

                      {/* STAGE IN PLANNING */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          STAGE IN PLANNING
                        </label>
                        <input
                          className={styles.textInput}
                          placeholder="Researching / Booked flights / Finalizing"
                          value={stageInPlanning}
                          onChange={(e) => setStageInPlanning(e.target.value)}
                        />
                      </div>

                      {/* NOTES */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          WHAT WOULD YOU LIKE TO SEE AND DO?
                        </label>
                        <textarea
                          className={styles.textArea2}
                          placeholder="Tell us your preferences..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className={styles.formSection}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          FIRST NAME *
                        </label>
                        <input
                          className={styles.textInput}
                          placeholder="Enter First Name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          EMAIL ADDRESS *
                        </label>
                        <input
                          className={styles.textInput}
                          type="email"
                          placeholder="Enter Email Address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      {/* PHONE NUMBER – 10 DIGIT ONLY */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          PHONE NUMBER *
                        </label>
                        <input
                          className={styles.textInput}
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]{10}"
                          maxLength={10}
                          placeholder="Enter 10 digit number"
                          value={phone}
                          onChange={(e) =>
                            setPhone(
                              e.target.value.replace(/\D/g, "").slice(0, 10),
                            )
                          }
                        />
                      </div>

                      {/* BEST TIME TO CALL */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          BEST TIME TO TALK *
                        </label>
                        <input
                          className={styles.textInput}
                          placeholder="e.g. 10 AM – 1 PM"
                          value={bestTimeToCall}
                          onChange={(e) => setBestTimeToCall(e.target.value)}
                        />
                      </div>

                      {/* COUNTRY OF RESIDENCE */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          COUNTRY OF RESIDENCE *
                        </label>
                        <input
                          className={styles.textInput}
                          placeholder="Enter Country"
                          value={countryOfResidence}
                          onChange={(e) =>
                            setCountryOfResidence(e.target.value)
                          }
                        />
                      </div>

                      {/* CONTACT PREFERENCE */}
                      {/* <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          CONTACT PREFERENCE *
                        </label>
                        <div className={styles.buttonGrid}>
                          {["Phone Call", "WhatsApp", "Email"].map((method) => (
                            <button
                              key={method}
                              className={`${styles.gridBtn} ${
                                contactPreference === method
                                  ? styles.activeGridBtn
                                  : ""
                              }`}
                              onClick={() => setContactPreference(method)}
                            >
                              {method}
                            </button>
                          ))}
                        </div>
                      </div> */}

                      {/* DECLARATION */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.checkboxItem}>
                          <CustomCheckbox
                            checked={newsletterConsent}
                            onChange={() => setNewsletterConsent((p) => !p)}
                            labelColor="#4A5565"
                            alignItemsStart={true}
                            gap={8}
                            label={` Yes! I'd like to receive Target Tour newsletter on travel news & specials. <br/>
By clicking "Get My Trip Planned" below, I agree to the Terms of Use and Privacy Policy.`}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.footer}>
                  <button
                    className={styles.backButton}
                    onClick={() =>
                      currentStep > 1
                        ? setCurrentStep(currentStep - 1)
                        : handleClose?.()
                    }
                  >
                    BACK
                  </button>
                  <button
                    className={styles.continueButton}
                    onClick={handleNext}
                  >
                    CONTINUE
                  </button>
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
              onClick={handleClose} /* ✅ FIXED */
            >
              <motion.div
                className={styles.popupCard}
                onClick={(e) => e.stopPropagation()}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                <div className={styles.popupHeader}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepLabel}>
                      Private Trip Preference
                    </span>
                    <h4 className={styles.stepNumber}>STEP {currentStep}-3</h4>
                  </div>
                  <button
                    onClick={handleClose} /* ✅ FIXED */
                    className={styles.closeBtn}
                  >
                    ✕
                  </button>
                </div>

                <div className={styles.scrollableContent}>
                  <div className={styles.headingDiv}>
                    <h3 className={styles.mainHeading}>
                      {currentStep === 1
                        ? "Travel Preferences"
                        : "Customize Your Experience"}
                    </h3>
                    <p className={styles.subText}>
                      {currentStep === 1 || currentStep === 2
                        ? "Tell us about your ideal travel dates and departure details"
                        : "Tailor your journey to match your preferences"}
                    </p>
                  </div>

                  {currentStep === 1 && (
                    <div className={styles.formSection}>
                      {/* Travel Dates Type */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          TRAVEL DATES
                        </label>

                        <div className={styles.tabGrid}>
                          <div
                            className={`${styles.tabItem} ${
                              travelDateType === "fixed" ? styles.activeTab : ""
                            }`}
                            onClick={() => setTravelDateType("fixed")}
                          >
                            <Image
                              src="/icons/blackCalendar.svg"
                              width={20}
                              height={20}
                              alt="cal"
                            />
                            <span>Fixed Dates</span>
                          </div>

                          <div
                            className={`${styles.tabItem} ${
                              travelDateType === "flexible"
                                ? styles.activeTab
                                : ""
                            }`}
                            onClick={() => setTravelDateType("flexible")}
                          >
                            <Image
                              src="/icons/blackCalendar.svg"
                              width={20}
                              height={20}
                              alt="cal"
                            />
                            <span>Flexible Dates</span>
                          </div>
                        </div>
                      </div>

                      {/* Departure City */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          DEPARTURE CITY
                        </label>
                        <input
                          className={styles.textInput}
                          placeholder="e.g., New York, London, Singapore"
                          value={departureCity}
                          onChange={(e) => setDepartureCity(e.target.value)}
                        />
                      </div>

                      {/* Departure Date (shadcn date picker) */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          DEPARTURE DATE
                        </label>

                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className={`${styles.textInput} text-left`}
                            >
                              {departureDate
                                ? format(departureDate, "dd MMM yyyy")
                                : "Select date"}
                            </button>
                          </PopoverTrigger>

                          <PopoverContent
                            side="bottom"
                            sideOffset={8}
                            className="p-0 z-[9999]"
                            portalled
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={departureDate}
                              onSelect={setDepartureDate}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Adults */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          NUMBER OF ADULTS
                        </label>
                        <input
                          type="number"
                          min={1}
                          className={styles.textInput}
                          value={adults}
                          onChange={(e) =>
                            setAdults(Math.max(1, Number(e.target.value)))
                          }
                        />
                      </div>

                      {/* Children */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          NUMBER OF CHILDREN
                        </label>
                        <input
                          type="number"
                          min={0}
                          className={styles.textInput}
                          value={children}
                          onChange={(e) =>
                            setChildren(Math.max(0, Number(e.target.value)))
                          }
                        />
                      </div>
                    </div>
                  )}
                  {currentStep === 2 && (
                    <div className={styles.formSection}>
                      <div className={`flex flex-col gap-1.5`}>
                        <h4 className={`text-[13px] font-medium `}>
                          AGE GROUP OF CHILDREN
                        </h4>

                        <div
                          className={`flex items-center justify-start gap-12`}
                        >
                          {["0-2", "3-7", "8-12", "13-17"].map((age) => (
                            <label key={age} className={styles.checkboxItem}>
                              <CustomCheckbox
                                checked={childrenAgeGroup === age}
                                onChange={() => setChildrenAgeGroup(age)}
                                label={age}
                                labelColor="#4A5565"
                                gap={6}
                              />
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* PER PERSON BUDGET */}
                      {/* <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          PER PERSON BUDGET FOR ENTIRE TRIP
                        </label>
                        <input
                          className={styles.textInput}
                          type="number"
                          placeholder="Enter amount"
                        />
                      </div> */}

                      {/* INTERNATIONAL FLIGHTS INCLUDED */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          INTERNATIONAL FLIGHTS INCLUDED IN BUDGET?
                        </label>

                        <select
                          className={styles.textInput}
                          value={
                            flightsIncluded === null
                              ? ""
                              : flightsIncluded
                                ? "yes"
                                : "no"
                          }
                          onChange={(e) =>
                            setFlightsIncluded(e.target.value === "yes")
                          }
                        >
                          <option value="">Select</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>

                      {/* IS BUDGET FLEXIBLE */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          IS BUDGET FLEXIBLE?
                        </label>

                        <select
                          className={styles.textInput}
                          value={
                            budgetFlexible === null
                              ? ""
                              : budgetFlexible
                                ? "yes"
                                : "no"
                          }
                          onChange={(e) =>
                            setBudgetFlexible(e.target.value === "yes")
                          }
                        >
                          <option value="">Select</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>

                      {/* STAGE IN PLANNING */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          STAGE IN PLANNING
                        </label>
                        <input
                          className={styles.textInput}
                          placeholder="Researching / Booked flights / Finalizing"
                        />
                      </div>

                      {/* NOTES */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          WHAT WOULD YOU LIKE TO SEE AND DO?
                        </label>
                        <textarea
                          className={styles.textArea2}
                          placeholder="Tell us your preferences..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          HOTEL CATEGORY
                        </label>
                        <div className={styles.buttonGrid}>
                          {["Standard", "Premium", "Luxury"].map((cat) => (
                            <button
                              key={cat}
                              className={`${styles.gridBtn} ${
                                hotelCategory === cat
                                  ? styles.activeGridBtn
                                  : ""
                              }`}
                              onClick={() => setHotelCategory(cat)}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          EXPERIENCE ADD-ONS
                        </label>
                        <div className={styles.pillContainer}>
                          {addonOptions.map((addon) => (
                            <button
                              key={addon}
                              className={`${styles.pill} ${
                                selectedAddons.includes(addon)
                                  ? styles.activePill
                                  : ""
                              }`}
                              onClick={() => toggleAddon(addon)}
                            >
                              {addon}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          EXPERIENCE ADD-ONS
                        </label>
                        <div className={styles.rangeWrapper}>
                          <div className={styles.rangeContainer}>
                            {/* Track */}
                            <div className={styles.sliderTrack} />

                            {/* Active range */}
                            <div
                              className={styles.sliderRange}
                              style={{
                                left: `${((minPrice - MIN) / (MAX - MIN)) * 100}%`,
                                right: `${
                                  100 - ((maxPrice - MIN) / (MAX - MIN)) * 100
                                }%`,
                              }}
                            />

                            {/* Min thumb */}
                            <input
                              type="range"
                              min={MIN}
                              max={MAX}
                              step={STEP}
                              value={minPrice}
                              onChange={(e) => {
                                const value = Math.min(
                                  Number(e.target.value),
                                  maxPrice - GAP,
                                );
                                setMinPrice(value);
                              }}
                              className={styles.rangeInput}
                              style={{ zIndex: minPrice > MAX - GAP ? 5 : 4 }}
                            />

                            {/* Max thumb */}
                            <input
                              type="range"
                              min={MIN}
                              max={MAX}
                              step={STEP}
                              value={maxPrice}
                              onChange={(e) => {
                                const value = Math.max(
                                  Number(e.target.value),
                                  minPrice + GAP,
                                );
                                setMaxPrice(value);
                              }}
                              className={styles.rangeInput}
                            />
                          </div>

                          <div className={styles.rangeLabels}>
                            <span>₹{minPrice.toLocaleString()}</span>
                            <span>Up ₹{maxPrice.toLocaleString()}+</span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          SPECIAL REQUESTS OR NOTES
                        </label>
                        <textarea
                          className={styles.textArea2}
                          placeholder="Any special dietary requirement, accessibility needs or something we should know about..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className={styles.formSection}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          FIRST NAME *
                        </label>
                        <input
                          className={styles.textInput}
                          placeholder="Enter First Name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          EMAIL ADDRESS *
                        </label>
                        <input
                          className={styles.textInput}
                          type="email"
                          placeholder="Enter Email Address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      {/* PHONE NUMBER – 10 DIGIT ONLY */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          PHONE NUMBER *
                        </label>
                        <input
                          className={styles.textInput}
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]{10}"
                          maxLength={10}
                          placeholder="Enter 10 digit number"
                          value={phone}
                          onChange={(e) =>
                            setPhone(
                              e.target.value.replace(/\D/g, "").slice(0, 10),
                            )
                          }
                        />
                      </div>

                      {/* BEST TIME TO CALL */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          BEST TIME TO TALK *
                        </label>
                        <input
                          className={styles.textInput}
                          placeholder="e.g. 10 AM – 1 PM"
                          value={bestTimeToCall}
                          onChange={(e) => setBestTimeToCall(e.target.value)}
                        />
                      </div>

                      {/* COUNTRY OF RESIDENCE */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          COUNTRY OF RESIDENCE *
                        </label>
                        <input
                          className={styles.textInput}
                          placeholder="Enter Country"
                          value={countryOfResidence}
                          onChange={(e) =>
                            setCountryOfResidence(e.target.value)
                          }
                        />
                      </div>

                      {/* CONTACT PREFERENCE */}
                      {/* <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          CONTACT PREFERENCE *
                        </label>
                        <div className={styles.buttonGrid}>
                          {["Phone Call", "WhatsApp", "Email"].map((method) => (
                            <button
                              key={method}
                              className={`${styles.gridBtn} ${
                                contactPreference === method
                                  ? styles.activeGridBtn
                                  : ""
                              }`}
                              onClick={() => setContactPreference(method)}
                            >
                              {method}
                            </button>
                          ))}
                        </div>
                      </div> */}

                      {/* DECLARATION */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.checkboxItem}>
                          <CustomCheckbox
                            checked={newsletterConsent}
                            onChange={() => setNewsletterConsent((p) => !p)}
                            labelColor="#4A5565"
                            alignItemsStart={true}
                            gap={8}
                            label={` Yes! I'd like to receive Target Tour newsletter on travel news & specials. <br/>
By clicking "Get My Trip Planned" below, I agree to the Terms of Use and Privacy Policy.`}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.footer}>
                  <button
                    className={styles.backButton}
                    onClick={() =>
                      currentStep > 1
                        ? setCurrentStep(currentStep - 1)
                        : handleClose?.()
                    }
                  >
                    BACK
                  </button>
                  <button
                    className={styles.continueButton}
                    onClick={handleNext}
                  >
                    CONTINUE
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
};

export default MobileItinerary;

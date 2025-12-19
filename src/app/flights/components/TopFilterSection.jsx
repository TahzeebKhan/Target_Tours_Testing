"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "./TopFilterSection.module.css";
// import Switch from "@/app/home-page/components/Switch";
// import TravellerSelector from "@/app/home-page/components/homePage/TravellerSelector";
import { ArrowLeftRight, ChevronDown } from "lucide-react";
import CustomCheckbox from "@/app/components/CustomCheckbox";
import PassengerClassSelector from "./PassengerClassSelector";
import { CalendarSVG } from "./SVGFile";
// import calendarSVG from "/icons/calendar.svg";

const travellerOptions = [
  { value: "1_traveller_econ", label: "1 Traveller, Economy" },
  { value: "2_traveller_econ", label: "2 Travellers, Economy" },
  { value: "3_traveller_business", label: "3 Traveller, Business" },
];

const truncate = (str) => {
  return str.length > 10 ? str.slice(0, 10) + "..." : str;
};
const passengerTypes = [
  "REGULAR",
  "SENIOR CITIZEN",
  "STUDENT",
  "ARMED FORCES",
  "MEDICAL PROFESSIONAL",
];

const TopFilterSection = () => {
  const [directOnly, setDirectOnly] = useState(true);
  const [tripType, setTripType] = useState("oneway"); // NEW
  const [bookingType, setBookingType] = useState("flight");
  // Passenger type checkbox state
  const [selectedTypes, setSelectedTypes] = useState([]); // default checked (optional)
  const [multiSegments, setMultiSegments] = useState([
    { from: "", to: "", date: "" },
    { from: "", to: "", date: "" },
  ]);

  // refs for the date inputs
  const departureRef = useRef(null);
  const returnRef = useRef(null);
  const multiDateRef1 = useRef(null);
  const multiDateRef0 = useRef(null);

  const [activeFeature, setActiveFeature] = useState(1); // default: 1 = Flights

  // state for travellers dropdown
  const [travellerClass, setTravellerClass] = useState("1_traveller_econ");
  const [travellerOpen, setTravellerOpen] = useState(false);
  const travellerRef = useRef(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [passengers, setPassengers] = useState({
    adult: 1,
    child: 0,
    infant: 0,
  });
  const [travelClass, setTravelClass] = useState("ECONOMY");
  // Direction for main tab (hotel/flight/holiday/insurance) animation
  const [direction, setDirection] = useState("right");

  // Direction for flight trip-type animation (round / oneway / multi)
  const [flightDirection, setFlightDirection] = useState("right");

  const swapLocations = () => {
    setFrom(to);
    setTo(from);
  };
  const updateSegment = (index, field, value) => {
    setMultiSegments((prev) =>
      prev.map((seg, i) => (i === index ? { ...seg, [field]: value } : seg))
    );
  };
  const openMultiDatePicker1 = () => {
    const input = multiDateRef1.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.focus();
      input.click();
    }
  };
  const openMultiDatePicker0 = () => {
    const input = multiDateRef0.current;
    if (!input) return;
    input.showPicker?.() || input.focus();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (travellerRef.current && !travellerRef.current.contains(e.target)) {
        setTravellerOpen(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") setTravellerOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);
  const toggleType = (type) => {
    setSelectedTypes(
      (prev) =>
        prev.includes(type)
          ? prev.filter((t) => t !== type) // uncheck
          : [...prev, type] // check
    );
  };

  const tripOrder = ["round", "oneway", "multi"];

  const handleTripTypeChange = (nextType) => {
    const prevIndex = tripOrder.indexOf(tripType);
    const nextIndex = tripOrder.indexOf(nextType);

    if (prevIndex < nextIndex) {
      setFlightDirection("right");
    } else if (prevIndex > nextIndex) {
      setFlightDirection("left");
    }

    setTripType(nextType);
  };

  // handlers to open the native date picker (if supported)
  const openDeparturePicker = () => {
    const input = departureRef.current;
    if (!input) return;
    // preferred: showPicker if available
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      // fallback: focus then click (some browsers will open)
      input.focus();
      input.click();
    }
  };

  const openReturnPicker = () => {
    const input = returnRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.focus();
      input.click();
    }
  };

  return (
    <>
      <div
        className={`${styles.searchSec} ${
          tripType === "multi" ? styles.isMulti : ""
        } flex flex-col gap-[127px] items-center`}
      >
        <div
          className={`${styles.searchPanelWrapper} ${
            bookingType === "holiday" || bookingType === "insurance"
              ? styles.noAnimation
              : ""
          }`}
        >
          {bookingType === "flight" && (
            <div className={`${styles.serarchingCont} ${styles.glass_panel}`}>
              <div className={styles.serarchingContTop}>
                <div className={styles.tripTypeWrapper}>
                  <label className={styles.tripOption}>
                    <input
                      type="radio"
                      name="tripType"
                      value="oneway"
                      checked={tripType === "oneway"}
                      onChange={() => handleTripTypeChange("oneway")}
                    />
                    <span className={styles.customRadio}></span>
                    <span className={styles.labelText}>ONE WAY</span>
                  </label>

                  <label className={styles.tripOption}>
                    <input
                      type="radio"
                      name="tripType"
                      value="round"
                      checked={tripType === "round"}
                      onChange={() => handleTripTypeChange("round")}
                    />
                    <span className={styles.customRadio}></span>
                    <span className={styles.labelText}>ROUND TRIP</span>
                  </label>

                  <label className={styles.tripOption}>
                    <input
                      type="radio"
                      name="tripType"
                      value="multi"
                      checked={tripType === "multi"}
                      onChange={() => handleTripTypeChange("multi")}
                    />
                    <span className={styles.customRadio}></span>
                    <span className={styles.labelText}>MULTI CITY</span>
                  </label>
                </div>

                {/* <div className={styles.serarchingContTop_right}>
                  <Switch
                    checked={directOnly}
                    onChange={setDirectOnly}
                    label="DIRECT FLIGHTS ONLY"
                  />
                </div> */}
              </div>
              {/* Flight trip-type forms (round / oneway / multi) with smart-animate style transition */}
              <div className={styles.flightSearchFormContainer}>
                {/* One-way form */}
                {tripType === "oneway" && (
                  <div
                    className={`${styles.serarchingContBottom} ${
                      styles.flightSearchFormWrapper
                    } ${styles.formVisible} ${
                      flightDirection === "right"
                        ? styles.slideRight
                        : styles.slideLeft
                    }`}
                  >
                    <div
                      className={`${styles.fromBtn} ${
                        tripType === "oneway" ? styles.growRight : ""
                      }`}
                    >
                      <div className={styles.lable}>From</div>
                      <input
                        type="text"
                        className={styles.contant}
                        placeholder="Departure"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                      />
                    </div>
                    <div className={styles.arrowbox} onClick={swapLocations}>
                      <ArrowLeftRight size={16} color="black" />
                    </div>
                    <div
                      className={`${styles.fromBtn} ${styles.toBtn} ${
                        styles.toBtn
                      } ${tripType === "oneway" ? styles.growRight : ""}`}
                    >
                      <div className={styles.lable}>To</div>
                      <input
                        type="text"
                        className={styles.contant}
                        placeholder="Destination"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                      />
                    </div>

                    <div
                      className={`${styles.fromBtn} ${
                        tripType === "oneway" ? styles.growRight : ""
                      }`}
                    >
                      <div className={styles.lable}>Departure Date</div>
                      <div
                        className={styles.dateInputWrapper}
                        onClick={openDeparturePicker}
                      >
                        {/* attach ref */}
                        <input
                          ref={departureRef}
                          type="date"
                          className={styles.contant}
                          data-placeholder="ADD DATES"
                          required
                        />
                        {/* use button for accessibility; call handler that uses the ref */}
                        <button
                          type="button"
                          aria-label="Open departure date picker"
                          className={styles.calendarIcon}
                          onClick={openDeparturePicker}
                        >
                          {/* same SVG */}
                          <CalendarSVG />
                        </button>
                      </div>
                    </div>
                    <div
                      className={styles.fromBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTravellerOpen(true);
                      }}
                    >
                      <div className={styles.lable}>Travellers & Class</div>
                      <div className={styles.iconCont}>
                        <div className={styles.contant}>
                          {passengers.adult +
                            passengers.child +
                            passengers.infant}{" "}
                          Traveller(s), {travelClass}
                        </div>
                        <ChevronDown
                          className={`${styles.chevron} ${
                            travellerOpen
                              ? styles.openChevron
                              : styles.closeChevron
                          }`}
                          size={16}
                          color="#FFFFFF"
                        />
                      </div>

                      <PassengerClassSelector
                        open={travellerOpen}
                        setOpen={setTravellerOpen}
                        passengers={passengers}
                        setPassengers={setPassengers}
                        travelClass={travelClass}
                        setTravelClass={setTravelClass}
                      />
                    </div>

                    <div className={styles.searchBtn}>
                      <img src="/icons/searchIconBlue.svg" alt="" />
                    </div>
                  </div>
                )}

                {/* Round-trip form (render only when round-trip is active) */}
                {tripType === "round" && (
                  <div
                    className={`${styles.serarchingContBottom} ${
                      styles.flightSearchFormWrapper
                    } ${styles.formVisible} ${
                      flightDirection === "right"
                        ? styles.slideRight
                        : styles.slideLeft
                    }`}
                  >
                    <div className={`${styles.fromBtn} ${styles.fromBtn2}`}>
                      <div className={styles.lable}>From</div>
                      <input
                        type="text"
                        className={styles.contant}
                        placeholder="Departure"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                      />
                    </div>
                    <div
                      className={`${styles.arrowbox} ${styles.arrowbox2}`}
                      onClick={swapLocations}
                    >
                      <ArrowLeftRight size={16} color="black" />
                    </div>
                    <div
                      className={`${styles.fromBtn} ${styles.fromBtn2} ${styles.toBtn}`}
                    >
                      <div className={styles.lable}>To</div>
                      <input
                        type="text"
                        className={styles.contant}
                        placeholder="Destination"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                      />
                    </div>

                    <div className={`${styles.fromBtn} ${styles.fromBtn2}`}>
                      <div className={styles.lable}>Departure Date</div>
                      <div
                        className={styles.dateInputWrapper}
                        onClick={openDeparturePicker}
                      >
                        {/* attach ref */}
                        <input
                          ref={departureRef}
                          type="date"
                          className={styles.contant}
                          data-placeholder="ADD DATES"
                          required
                        />
                        {/* use button for accessibility; call handler that uses the ref */}
                        <button
                          type="button"
                          aria-label="Open departure date picker"
                          className={styles.calendarIcon}
                          onClick={openDeparturePicker}
                        >
                          {/* same SVG */}
                          <CalendarSVG />
                        </button>
                      </div>
                    </div>
                    <div className={`${styles.fromBtn} ${styles.fromBtn2}`}>
                      <div className={styles.lable}>Return Date</div>
                      <div
                        className={styles.dateInputWrapper}
                        onClick={openReturnPicker}
                      >
                        {/* attach ref */}
                        <input
                          ref={returnRef}
                          type="date"
                          className={styles.contant}
                          data-placeholder="ADD DATES"
                          required
                        />
                        {/* use button for accessibility; call handler that uses the ref */}
                        <button
                          type="button"
                          aria-label="Open return date picker"
                          className={styles.calendarIcon}
                          onClick={openReturnPicker}
                        >
                          {/* same SVG */}
                          <svg
                            width="13"
                            height="14"
                            viewBox="0 0 13 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12.3902 3.343C12.3112 2.02925 11.2142 1 9.89291 1H9.24966V0.5C9.24966 0.224 9.02566 0 8.74966 0C8.47366 0 8.24966 0.224 8.24966 0.5V1H4.24966V0.5C4.24966 0.224 4.02566 0 3.74966 0C3.47366 0 3.24966 0.224 3.24966 0.5V1H2.60641C1.28491 1 0.187913 2.02925 0.109163 3.343C-0.0390874 5.814 -0.0363374 8.3205 0.117413 10.7928C0.195413 12.0483 1.20116 13.054 2.45666 13.132C3.71491 13.2102 4.98216 13.2493 6.24941 13.2493C7.51641 13.2493 8.78391 13.2102 10.0422 13.132C11.2977 13.054 12.3034 12.0483 12.3814 10.7928C12.5354 8.32175 12.5382 5.8155 12.3902 3.343ZM11.3837 10.7308C11.3367 11.484 10.7334 12.0872 9.98041 12.134C7.50491 12.2878 4.99441 12.2878 2.51891 12.134C1.76566 12.087 1.16241 11.4838 1.11566 10.7308C0.997412 8.83 0.973163 6.90925 1.03641 5H11.4632C11.5262 6.91 11.5019 8.83075 11.3837 10.7308ZM3.74966 3C4.02566 3 4.24966 2.776 4.24966 2.5V2H8.24966V2.5C8.24966 2.776 8.47366 3 8.74966 3C9.02566 3 9.24966 2.776 9.24966 2.5V2H9.89291C10.6862 2 11.3447 2.61625 11.3919 3.40275C11.4037 3.60125 11.4087 3.801 11.4184 4H1.08091C1.09091 3.801 1.09566 3.60125 1.10741 3.40275C1.15466 2.61625 1.81291 2 2.60641 2H3.24966V2.5C3.24966 2.776 3.47366 3 3.74966 3Z"
                              fill="white"
                            />
                            <path
                              d="M3.74951 8C4.16373 8 4.49951 7.66421 4.49951 7.25C4.49951 6.83579 4.16373 6.5 3.74951 6.5C3.3353 6.5 2.99951 6.83579 2.99951 7.25C2.99951 7.66421 3.3353 8 3.74951 8Z"
                              fill="white"
                            />
                            <path
                              d="M6.24951 8C6.66373 8 6.99951 7.66421 6.99951 7.25C6.99951 6.83579 6.66373 6.5 6.24951 6.5C5.8353 6.5 5.49951 6.83579 5.49951 7.25C5.49951 7.66421 5.8353 8 6.24951 8Z"
                              fill="white"
                            />
                            <path
                              d="M3.74951 10.5C4.16373 10.5 4.49951 10.1642 4.49951 9.75C4.49951 9.33579 4.16373 9 3.74951 9C3.3353 9 2.99951 9.33579 2.99951 9.75C2.99951 10.1642 3.3353 10.5 3.74951 10.5Z"
                              fill="white"
                            />
                            <path
                              d="M8.74951 8C9.16373 8 9.49951 7.66421 9.49951 7.25C9.49951 6.83579 9.16373 6.5 8.74951 6.5C8.3353 6.5 7.99951 6.83579 7.99951 7.25C7.99951 7.66421 8.3353 8 8.74951 8Z"
                              fill="white"
                            />
                            <path
                              d="M8.74951 10.5C9.16373 10.5 9.49951 10.1642 9.49951 9.75C9.49951 9.33579 9.16373 9 8.74951 9C8.3353 9 7.99951 9.33579 7.99951 9.75C7.99951 10.1642 8.3353 10.5 8.74951 10.5Z"
                              fill="white"
                            />
                            <path
                              d="M6.24951 10.5C6.66373 10.5 6.99951 10.1642 6.99951 9.75C6.99951 9.33579 6.66373 9 6.24951 9C5.8353 9 5.49951 9.33579 5.49951 9.75C5.49951 10.1642 5.8353 10.5 6.24951 10.5Z"
                              fill="white"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* <div className={styles.fromBtn}>
                <div className={styles.lable}>Travellers & Class</div>
                <div className={styles.dateInputWrapper}>
                  <div className={styles.contant}>1 Traveller, Econ...</div>
                  <img src="/images/Vector.svg" alt="" /></div>
              </div> */}
                    <div
                      className={`${styles.fromBtn} ${styles.fromBtn2}`}
                      onClick={() => setTravellerOpen((o) => !o)}
                    >
                      <div className={styles.lable}>Travellers & Class</div>
                      <div className={styles.iconCont}>
                        <div className={styles.contant}>
                          {passengers.adult +
                            passengers.child +
                            passengers.infant}{" "}
                          Traveller(s), {travelClass}
                        </div>

                        <ChevronDown
                          className={`${styles.chevron} ${
                            travellerOpen
                              ? styles.openChevron
                              : styles.closeChevron
                          }`}
                          size={16}
                          color="#FFFFFF"
                        />
                      </div>

                      <PassengerClassSelector
                        open={travellerOpen}
                        setOpen={setTravellerOpen}
                        passengers={passengers}
                        setPassengers={setPassengers}
                        travelClass={travelClass}
                        setTravelClass={setTravelClass}
                      />
                    </div>

                    <div className={styles.searchBtn}>
                      <img src="/icons/searchIconBlue.svg" alt="" />
                    </div>
                  </div>
                )}

                {/* Multi-city form */}
                {tripType === "multi" && (
                  <div
                    className={`${styles.serarchingContBottom} ${
                      styles.multiSearch
                    } ${styles.flightSearchFormWrapper} ${styles.formVisible} ${
                      flightDirection === "right"
                        ? styles.slideRight
                        : styles.slideLeft
                    }`}
                  >
                    <div className={styles.serarchingContBottom}>
                      <div className={`${styles.fromBtn} ${styles.fromBtn3}`}>
                        <div className={styles.lable}>From</div>
                        <input
                          type="text"
                          className={styles.contant}
                          placeholder="Departure"
                          value={multiSegments[0].from}
                          onChange={(e) =>
                            updateSegment(0, "from", e.target.value)
                          }
                        />
                      </div>

                      <div
                        className={`${styles.arrowbox} ${styles.arrowbox3}`}
                        onClick={() => {
                          const { from, to } = multiSegments[0];
                          updateSegment(0, "from", to);
                          updateSegment(0, "to", from);
                        }}
                      >
                        <ArrowLeftRight size={16} color="black" />
                      </div>

                      <div
                        className={`${styles.fromBtn} ${styles.fromBtn3} ${styles.toBtn}`}
                      >
                        <div className={styles.lable}>To</div>
                        <input
                          type="text"
                          className={styles.contant}
                          placeholder="Destination"
                          value={multiSegments[0].to}
                          onChange={(e) =>
                            updateSegment(0, "to", e.target.value)
                          }
                        />
                      </div>

                      <div className={`${styles.fromBtn} ${styles.fromBtn3}`}>
                        <div className={styles.lable}>Departure Date</div>

                        <div
                          className={styles.dateInputWrapper}
                          onClick={openMultiDatePicker1}
                        >
                          <input
                            ref={multiDateRef1}
                            type="date"
                            className={styles.contant}
                            data-placeholder="ADD DATES"
                            value={multiSegments[1].date}
                            onChange={(e) =>
                              updateSegment(1, "date", e.target.value)
                            }
                            required
                          />

                          <button
                            type="button"
                            aria-label="Open departure date picker"
                            className={styles.calendarIcon}
                            onClick={openMultiDatePicker1}
                          >
                            {/* SAME SVG – unchanged */}
                            <CalendarSVG />
                          </button>
                        </div>
                      </div>

                      <div
                        className={styles.fromBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setTravellerOpen(true);
                        }}
                      >
                        <div className={styles.lable}>Travellers & Class</div>
                        <div className={styles.iconCont}>
                          <div className={styles.contant}>
                            {passengers.adult +
                              passengers.child +
                              passengers.infant}{" "}
                            Traveller(s), {travelClass}
                          </div>
                          <ChevronDown
                            className={`${styles.chevron} ${
                              travellerOpen
                                ? styles.openChevron
                                : styles.closeChevron
                            }`}
                            size={16}
                            color="#FFFFFF"
                          />
                        </div>

                        <PassengerClassSelector
                          open={travellerOpen}
                          setOpen={setTravellerOpen}
                          passengers={passengers}
                          setPassengers={setPassengers}
                          travelClass={travelClass}
                          setTravelClass={setTravelClass}
                        />
                      </div>
                    </div>

                    <div
                      className={`${styles.serarchingContBottom} ${
                        styles.bottomRowAnimate
                      } ${
                        tripType === "multi"
                          ? styles.animateIn
                          : styles.animateOut
                      }`}
                    >
                      <div className={`${styles.fromBtn} ${styles.fromBtn3}`}>
                        <div className={styles.lable}>From</div>
                        <input
                          type="text"
                          className={styles.contant}
                          placeholder="Departure"
                          value={multiSegments[1].from}
                          onChange={(e) =>
                            updateSegment(1, "from", e.target.value)
                          }
                        />
                      </div>

                      <div
                        className={`${styles.arrowbox} ${styles.arrowbox3}`}
                        onClick={() => {
                          const { from, to } = multiSegments[1];
                          updateSegment(1, "from", to);
                          updateSegment(1, "to", from);
                        }}
                      >
                        <ArrowLeftRight size={16} color="black" />
                      </div>

                      <div
                        className={`${styles.fromBtn} ${styles.fromBtn3} ${styles.toBtn}`}
                      >
                        <div className={styles.lable}>To</div>
                        <input
                          type="text"
                          className={styles.contant}
                          placeholder="Destination"
                          value={multiSegments[1].to}
                          onChange={(e) =>
                            updateSegment(1, "to", e.target.value)
                          }
                        />
                      </div>

                      <div className={`${styles.fromBtn} ${styles.fromBtn3}`}>
                        <div className={styles.lable}>Departure Date</div>

                        <div
                          className={styles.dateInputWrapper}
                          onClick={openMultiDatePicker0}
                        >
                          <input
                            ref={multiDateRef0}
                            type="date"
                            className={styles.contant}
                            data-placeholder="ADD DATES"
                            value={multiSegments[0].date}
                            onChange={(e) =>
                              updateSegment(0, "date", e.target.value)
                            }
                            required
                          />

                          <button
                            type="button"
                            aria-label="Open departure date picker"
                            className={styles.calendarIcon}
                            onClick={openMultiDatePicker0}
                          >
                            {/* SAME SVG – unchanged */}
                            <CalendarSVG />
                          </button>
                        </div>
                      </div>
                      <div className={styles.searchBtn}>
                        <img src="/icons/searchIconBlue.svg" alt="" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.passengerTypeRow}>
                {passengerTypes.map((type) => (
                  <CustomCheckbox
                    key={type}
                    label={type}
                    checked={selectedTypes.includes(type)}
                    onChange={() => toggleType(type)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TopFilterSection;

// "use client";
// import React, { useState, useRef, useEffect } from "react";
// import styles from "./TopFilterSection.module.css";
// // import Switch from "@/app/home-page/components/Switch";
// // import TravellerSelector from "@/app/home-page/components/homePage/TravellerSelector";
// import { ArrowLeftRight, ChevronDown } from "lucide-react";
// import CustomCheckbox from "@/app/components/CustomCheckbox";
// import PassengerClassSelector from "./PassengerClassSelector";
// import { CalendarSVG } from "./SVGFile";
// import { useTripType } from "../TripTypeContext";
// import DateCalendarModal from "@/app/components/calendar/DateCalendarModal";
// import CalendarMonths from "@/app/components/calendar/CalendarMonths";
// // import calendarSVG from "/icons/calendar.svg";

// const travellerOptions = [
//   { value: "1_traveller_econ", label: "1 Traveller, Economy" },
//   { value: "2_traveller_econ", label: "2 Travellers, Economy" },
//   { value: "3_traveller_business", label: "3 Traveller, Business" },
// ];

// const truncate = (str) => {
//   return str.length > 10 ? str.slice(0, 10) + "..." : str;
// };
// const passengerTypes = [
//   "REGULAR",
//   "SENIOR CITIZEN",
//   "STUDENT",
//   "ARMED FORCES",
//   "MEDICAL PROFESSIONAL",
// ];

// const TopFilterSection = ({ isScrolled: parentScrolled = false,scrollProgress }) => {
//   const calendarRef = useRef(null);

//   const {
//     tripType,
//     setTripType,
//     from,
//     setFrom,
//     to,
//     setTo,
//     passengers,
//     setPassengers,
//     travelClass,
//     setTravelClass,
//     startDate,
//     setStartDate,
//     endDate,
//     setEndDate,
//     handleSearch,
//   } = useTripType();
//   const [directOnly, setDirectOnly] = useState(true);
//   const isScrolled = parentScrolled || false;
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [activeMultiIndex, setActiveMultiIndex] = useState(null);

//   // Direction for flight trip-type animation (round / oneway / multi)
//   const [flightDirection, setFlightDirection] = useState("right");

//   const [bookingType, setBookingType] = useState("flight");
//   const [selectedTypes, setSelectedTypes] = useState([]);
//   const [multiSegments, setMultiSegments] = useState([
//     { from: "", to: "", date: "" },
//     { from: "", to: "", date: "" },
//   ]);

//   const departureRef = useRef(null);
//   const returnRef = useRef(null);
//   const multiDateRef1 = useRef(null);
//   const multiDateRef0 = useRef(null);

//   const [travellerOpen, setTravellerOpen] = useState(false);
//   const travellerRef = useRef(null);

//   const [calendarTripType, setCalendarTripType] = useState("oneway");

//   const handleDateClick = (date) => {
//     if (tripType === "multi" && activeMultiIndex !== null) {
//       setMultiSegments((prev) =>
//         prev.map((seg, i) => (i === activeMultiIndex ? { ...seg, date } : seg))
//       );
//       setShowCalendar(false);
//       setActiveMultiIndex(null);
//       return;
//     }

//     if (calendarTripType === "oneway") {
//       setStartDate(date);
//       setEndDate(null);
//       return;
//     }

//     // ROUND TRIP
//     if (!startDate || endDate) {
//       // first click OR restart selection
//       setStartDate(date);
//       setEndDate(null);
//     } else if (new Date(date) >= new Date(startDate)) {
//       // valid end date
//       setEndDate(date);
//       setShowCalendar(false);
//     } else {
//       // clicked date before start → restart range
//       setStartDate(date);
//       setEndDate(null);
//     }
//   };

//   useEffect(() => {
//     if (tripType === "round") {
//       setCalendarTripType("round");
//     } else {
//       setCalendarTripType("oneway");
//     }
//   }, [tripType]);

//   const swapLocations = () => {
//     setFrom(to);
//     setTo(from);
//   };
//   const updateSegment = (index, field, value) => {
//     setMultiSegments((prev) =>
//       prev.map((seg, i) => (i === index ? { ...seg, [field]: value } : seg))
//     );
//   };
//   const openMultiDatePicker1 = () => {
//     const input = multiDateRef1.current;
//     if (!input) return;

//     if (typeof input.showPicker === "function") {
//       input.showPicker();
//     } else {
//       input.focus();
//       input.click();
//     }
//   };
//   const openMultiDatePicker0 = () => {
//     const input = multiDateRef0.current;
//     if (!input) return;
//     input.showPicker?.() || input.focus();
//   };

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (travellerRef.current && !travellerRef.current.contains(e.target)) {
//         setTravellerOpen(false);
//       }
//     };

//     const handleEsc = (e) => {
//       if (e.key === "Escape") setTravellerOpen(false);
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     document.addEventListener("keydown", handleEsc);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//       document.removeEventListener("keydown", handleEsc);
//     };
//   }, []);
//   const toggleType = (type) => {
//     setSelectedTypes(
//       (prev) =>
//         prev.includes(type)
//           ? prev.filter((t) => t !== type) // uncheck
//           : [...prev, type] // check
//     );
//   };
//   useEffect(() => {
//     if (!showCalendar) return;

//     const handleClickOutside = (e) => {
//       if (calendarRef.current && !calendarRef.current.contains(e.target)) {
//         // setShowCalendar(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [showCalendar]);

//   const tripOrder = ["round", "oneway", "multi"];

//   const handleTripTypeChange = (nextType) => {
//     const prevIndex = tripOrder.indexOf(tripType);
//     const nextIndex = tripOrder.indexOf(nextType);

//     if (prevIndex < nextIndex) {
//       setFlightDirection("right");
//     } else if (prevIndex > nextIndex) {
//       setFlightDirection("left");
//     }

//     setTripType(nextType);
//   };
//   const formatDate = (dateStr) => {
//     if (!dateStr) return "";

//     const date = new Date(dateStr);
//     if (isNaN(date)) return "";

//     const day = String(date.getDate()).padStart(2, "0");
//     const month = date
//       .toLocaleString("en-US", { month: "short" })
//       .toUpperCase();
//     const year = date.getFullYear();

//     return `${day}-${month}-${year}`;
//   };

//   // handlers to open the native date picker (if supported)
//   const openDeparturePicker = () => {
//     const input = departureRef.current;
//     if (!input) return;
//     // preferred: showPicker if available
//     if (typeof input.showPicker === "function") {
//       input.showPicker();
//     } else {
//       // fallback: focus then click (some browsers will open)
//       input.focus();
//       input.click();
//     }
//   };

//   const openReturnPicker = () => {
//     const input = returnRef.current;
//     if (!input) return;
//     if (typeof input.showPicker === "function") {
//       input.showPicker();
//     } else {
//       input.focus();
//       input.click();
//     }
//   };
//   const openRoundTripCalendar = () => {
//     setCalendarTripType("round");
//     setShowCalendar(true);
//   };
// const [scrollY, setScrollY] = useState(0);

// useEffect(() => {
//   let ticking = false;

//   const onScroll = () => {
//     if (!ticking) {
//       requestAnimationFrame(() => {
//         setScrollY(window.scrollY || 0);
//         ticking = false;
//       });
//       ticking = true;
//     }
//   };

//   window.addEventListener("scroll", onScroll, { passive: true });
//   onScroll();

//   return () => window.removeEventListener("scroll", onScroll);
// }, []);
// const MAX_MARGIN = 76;
// const MIN_PADDING = 16;
// const MAX_PADDING = 20;
// const MAX_MARGIN_BOTTOM = 28;
// const clampedScroll = Math.min(scrollY, MAX_MARGIN);
// const progress = clampedScroll / MAX_MARGIN;

// const marginTop = MAX_MARGIN * (1 - progress);
// const marginBottom = MAX_MARGIN_BOTTOM * (1 - progress);
// const padding = MAX_PADDING - (MAX_PADDING - MIN_PADDING) * progress;



//   return (
//     <>
//       <div  style={{
//     marginTop: `${marginTop}px`,
//     padding: `${padding}px`,
//      marginBottom: `${marginBottom}px`,
//     transition: "none", // 👈 IMPORTANT
//   }}
//         className={`${styles.searchSec} ${tripType === "multi" ? styles.isMulti : ""}
//         ${scrollProgress===1 ? styles.scrolledSearchSec : ""}
//          sticky top-0 flex flex-col gap-[127px] items-center`}
//       >
//         <div
//           className={`${styles.searchPanelWrapper} ${bookingType === "holiday" || bookingType === "insurance"
//             ? styles.noAnimation
//             : ""
//             }`}
//         >
//           {bookingType === "flight" && (
//               <div className={`${styles.serarchingCont} ${styles.glass_panel}
//               ${scrollProgress===1 ? styles.scrolledSerarchingCont : ""}
//               //  ${isScrolled ? styles.scrolledGap : ""}

//                `}>
//               <div className={styles.serarchingContTop}>
//                 <div className={styles.tripTypeWrapper}>
//                   <label
//                     className={`${styles.tripOption} ${tripType === "oneway" ? styles.active : ""
//                       }`}
//                   >
//                     <input
//                       type="radio"
//                       name="tripType"
//                       value="oneway"
//                       checked={tripType === "oneway"}
//                       onChange={() => handleTripTypeChange("oneway")}
//                     />
//                     <span className={styles.customRadio}></span>
//                     <span className={styles.labelText}>ONE WAY</span>
//                   </label>

//                   <label
//                     className={`${styles.tripOption} ${tripType === "round" ? styles.active : ""
//                       }`}
//                   >
//                     <input
//                       type="radio"
//                       name="tripType"
//                       value="round"
//                       checked={tripType === "round"}
//                       onChange={() => handleTripTypeChange("round")}
//                     />
//                     <span className={styles.customRadio}></span>
//                     <span className={styles.labelText}>ROUND TRIP</span>
//                   </label>

//                   <label
//                     className={`${styles.tripOption} ${tripType === "multi" ? styles.active : ""
//                       }`}
//                   >
//                     <input
//                       type="radio"
//                       name="tripType"
//                       value="multi"
//                       checked={tripType === "multi"}
//                       onChange={() => handleTripTypeChange("multi")}
//                     />
//                     <span className={styles.customRadio}></span>
//                     <span className={styles.labelText}>MULTI CITY</span>
//                   </label>
//                 </div>

//                 {/* <div className={styles.serarchingContTop_right}>
//                   <Switch
//                     checked={directOnly}
//                     onChange={setDirectOnly}
//                     label="DIRECT FLIGHTS ONLY"
//                   />
//                 </div> */}
//               </div>
//               {/* Flight trip-type forms (round / oneway / multi) with smart-animate style transition */}
//               <div className={styles.flightSearchFormContainer}>
//                 {/* Unified One-way, Round-trip, and Multi-city (first row) form */}
//                 {(tripType === "oneway" || tripType === "round" || tripType === "multi") && (
//                   <div
//                     className={`${styles.serarchingContBottom}  ${styles.flightSearchFormWrapper} ${styles.formVisible}`}
//                   >
//                     <div
//                       className={`${styles.fromBtn} ${styles.fromBtn2} ${tripType === "oneway" || tripType === "multi" ? styles.growRight : ""
//                         }`}
//                     >
//                       <div className={styles.lable}>From</div>
//                       <input
//                         type="text"
//                         className={styles.contant}
//                         placeholder="Departure"
//                         value={tripType === "multi" ? multiSegments[0].from : from}
//                         onChange={(e) => {
//                           if (tripType === "multi") {
//                             updateSegment(0, "from", e.target.value);
//                           } else {
//                             setFrom(e.target.value);
//                           }
//                         }}
//                       />
//                     </div>
//                     <div
//                       className={`${styles.arrowbox} ${tripType === "round" ? styles.arrowbox2 : ""} ${tripType === "multi" ? styles.arrowbox3 : ""}`}
//                       onClick={() => {
//                         if (tripType === "multi") {
//                           const { from, to } = multiSegments[0];
//                           updateSegment(0, "from", to);
//                           updateSegment(0, "to", from);
//                         } else {
//                           swapLocations();
//                         }
//                       }}
//                     >
//                       <ArrowLeftRight size={16} className={styles.arrowIcon} />
//                     </div>
//                     <div
//                       className={`${styles.fromBtn} ${styles.fromBtn2} ${styles.toBtn
//                         } ${tripType === "oneway" || tripType === "multi" ? styles.growRight : ""}`}
//                     >
//                       <div className={styles.lable}>To</div>
//                       <input
//                         type="text"
//                         className={styles.contant}
//                         placeholder="Destination"
//                         value={tripType === "multi" ? multiSegments[0].to : to}
//                         onChange={(e) => {
//                           if (tripType === "multi") {
//                             updateSegment(0, "to", e.target.value);
//                           } else {
//                             setTo(e.target.value);
//                           }
//                         }}
//                       />
//                     </div>

//                     <div
//                       className={`${styles.fromBtn} ${styles.fromBtn2} ${tripType === "oneway" || tripType === "multi" ? styles.growRight : ""
//                         } ${styles.calendarAnchor}`}
//                     >
//                       <div className={styles.lable}>Departure Date</div>
//                       {showCalendar && (
//                         <DateCalendarModal
//                           mode={
//                             calendarTripType === "round"
//                               ? "roundtrip"
//                               : "oneway"
//                           }
//                           onModeChange={(mode) =>
//                             setCalendarTripType(
//                               mode === "roundtrip" ? "round" : "oneway"
//                             )
//                           }
//                           onClose={() => {
//                             setShowCalendar(false);
//                             setActiveMultiIndex(null);
//                           }}
//                         >
//                           <div ref={calendarRef}>
//                             <CalendarMonths
//                               startDate={startDate}
//                               endDate={endDate}
//                               onDateClick={handleDateClick}
//                             />
//                           </div>
//                         </DateCalendarModal>
//                       )}
//                       <div
//                         className={styles.dateInputWrapper}
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           if (tripType === "multi") {
//                             setCalendarTripType("oneway");
//                             setActiveMultiIndex(0);
//                             setShowCalendar(true);
//                           } else {
//                             setCalendarTripType("oneway");
//                             if (tripType === "round") setCalendarTripType("round");
//                             setShowCalendar(true);
//                           }
//                         }}
//                       >
//                         <input
//                           type="text"
//                           readOnly
//                           className={styles.contant}
//                           placeholder="ADD DATE"
//                           value={
//                             tripType === "multi"
//                               ? formatDate(multiSegments[0].date)
//                               : (formatDate(startDate) || "")
//                           }
//                         />

//                         <button type="button" className={styles.calendarIcon}>
//                           <CalendarSVG />
//                         </button>
//                       </div>
//                     </div>

//                     {/* Return Date - conditionally hidden with CSS */}
//                     <div
//                       className={`${styles.fromBtn} ${styles.fromBtn2} ${styles.returnDateField} ${tripType === "oneway" || tripType === "multi" ? styles.hiddenField : ""
//                         }`}
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         openRoundTripCalendar();
//                       }}
//                     >
//                       <div className={styles.lable}>Return Date</div>

//                       <div
//                         className={styles.dateInputWrapper}
//                       >
//                         <input
//                           type="text"
//                           readOnly
//                           className={styles.contant}
//                           placeholder="ADD DATE"
//                           value={formatDate(endDate) || ""}
//                         />

//                         <button type="button" className={styles.calendarIcon}>
//                           <CalendarSVG />
//                         </button>
//                       </div>
//                     </div>

//                     <div
//                       className={`${styles.fromBtn} ${styles.fromBtn2} ${tripType === "oneway" || tripType === "multi" ? styles.growRight : ""
//                         }`}
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setTravellerOpen((o) => !o);
//                       }}
//                     >
//                       <div className={styles.lable}>Travellers & Class</div>
//                       <div className={styles.iconCont}>
//                         <div className={styles.contant}>
//                           {passengers.adult +
//                             passengers.child +
//                             passengers.infant}{" "}
//                           Traveller(s), {travelClass}
//                         </div>

//                         <ChevronDown
//                           className={`${styles.chevron} ${travellerOpen
//                             ? styles.openChevron
//                             : styles.closeChevron
//                             }`}
//                           size={16}
//                           color="#FFFFFF"
//                         />
//                       </div>

//                       <PassengerClassSelector
//                         open={travellerOpen}
//                         setOpen={setTravellerOpen}
//                         passengers={passengers}
//                         setPassengers={setPassengers}
//                         travelClass={travelClass}
//                         setTravelClass={setTravelClass}
//                       />
//                     </div>

//                     {tripType !== "multi" && (
//                       <div className={styles.searchBtn} onClick={handleSearch}>
//                         <svg
//                           width="24"
//                           height="24"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           xmlns="http://www.w3.org/2000/svg"
//                         >
//                           <path
//                             d="M16.9994 16.2923L20.8536 20.1464C21.0488 20.3417 21.0488 20.6583 20.8536 20.8536C20.6583 21.0488 20.3417 21.0488 20.1464 20.8536L16.2923 16.9994C14.882 18.2445 13.0292 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11C19 13.0292 18.2445 14.882 16.9994 16.2923ZM11 18C14.866 18 18 14.866 18 11C18 7.13401 14.866 4 11 4C7.13401 4 4 7.13401 4 11C4 14.866 7.13401 18 11 18Z"
//                             fill="#000033"
//                           />
//                         </svg>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Multi-city form - Additional Rows */}
//                 {tripType === "multi" && (
//                   <>
//                     <div
//                       className={`${styles.serarchingContBottom} ${styles.multiSearch} ${styles.flightSearchFormWrapper} ${styles.formVisible}`}
//                       style={{ pointerEvents: 'none' }}
//                     >
//                       {/* First row is now handled by the unified block above. 
//                           We use paddingTop to space the second row. */}

//                       <div
//                         className={`${styles.serarchingContBottom} ${styles.bottomRowAnimate
//                           } ${tripType === "multi"
//                             ? styles.animateIn
//                             : styles.animateOut
//                           }`}
//                         style={{ pointerEvents: 'auto' }}
//                       >
//                         <div className={`${styles.fromBtn} ${styles.fromBtn3}`}>
//                           <div className={styles.lable}>From</div>
//                           <input
//                             type="text"
//                             className={styles.contant}
//                             placeholder="Departure"
//                             value={multiSegments[1].from}
//                             onChange={(e) =>
//                               updateSegment(1, "from", e.target.value)
//                             }
//                           />
//                         </div>

//                         <div
//                           className={`${styles.arrowbox} ${styles.arrowbox3}`}
//                           onClick={() => {
//                             const { from, to } = multiSegments[1];
//                             updateSegment(1, "from", to);
//                             updateSegment(1, "to", from);
//                           }}
//                         >
//                           <ArrowLeftRight size={16} className={styles.arrowIcon} />
//                         </div>

//                         <div
//                           className={`${styles.fromBtn} ${styles.fromBtn3} ${styles.toBtn}`}
//                         >
//                           <div className={styles.lable}>To</div>
//                           <input
//                             type="text"
//                             className={styles.contant}
//                             placeholder="Destination"
//                             value={multiSegments[1].to}
//                             onChange={(e) =>
//                               updateSegment(1, "to", e.target.value)
//                             }
//                           />
//                         </div>

//                         <div className={`${styles.fromBtn} ${styles.fromBtn3}`}>
//                           <div className={styles.lable}>Departure Date</div>
//                           {showCalendar && (
//                             <DateCalendarModal
//                               mode="oneway"
//                               onClose={() => {
//                                 setShowCalendar(false);
//                                 setActiveMultiIndex(null);
//                               }}
//                             >
//                               <div ref={calendarRef}>
//                                 <CalendarMonths
//                                   startDate={null}
//                                   endDate={null}
//                                   onDateClick={handleDateClick}
//                                 />
//                               </div>
//                             </DateCalendarModal>
//                           )}
//                           <div
//                             className={styles.dateInputWrapper}
//                             onClick={() => {
//                               setCalendarTripType("oneway");
//                               setActiveMultiIndex(1);
//                               setShowCalendar(true);
//                             }}
//                           >
//                             <input
//                               type="text"
//                               readOnly
//                               className={styles.contant}
//                               placeholder="ADD DATE"
//                               value={formatDate(multiSegments[1].date)}
//                             />
//                             <button
//                               type="button"
//                               aria-label="Open departure date picker"
//                               className={styles.calendarIcon}
//                               onClick={openMultiDatePicker0}
//                             >
//                               {/* SAME SVG – unchanged */}
//                               <CalendarSVG />
//                             </button>
//                           </div>
//                         </div>
//                         <div className={styles.searchBtn} onClick={handleSearch}>
//                           <svg
//                             width="24"
//                             height="24"
//                             viewBox="0 0 24 24"
//                             fill="none"
//                             xmlns="http://www.w3.org/2000/svg"
//                           >
//                             <path
//                               d="M16.9994 16.2923L20.8536 20.1464C21.0488 20.3417 21.0488 20.6583 20.8536 20.8536C20.6583 21.0488 20.3417 21.0488 20.1464 20.8536L16.2923 16.9994C14.882 18.2445 13.0292 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11C19 13.0292 18.2445 14.882 16.9994 16.2923ZM11 18C14.866 18 18 14.866 18 11C18 7.13401 14.866 4 11 4C7.13401 4 4 7.13401 4 11C4 14.866 7.13401 18 11 18Z"
//                               fill="#000033"
//                             />
//                           </svg>
//                         </div>
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </div>

//               <div className={styles.passengerTypeRow}>
//                 {passengerTypes.map((type) => (
//                   <CustomCheckbox
//                     key={type}
//                     label={type}
//                     checked={selectedTypes.includes(type)}
//                     onChange={() => toggleType(type)}
//                   />
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default TopFilterSection;


"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "./TopFilterSection.module.css";
// import Switch from "@/app/home-page/components/Switch";
// import TravellerSelector from "@/app/home-page/components/homePage/TravellerSelector";
import { ArrowLeftRight, ChevronDown } from "lucide-react";
import CustomCheckbox from "@/app/components/CustomCheckbox";
import PassengerClassSelector from "./PassengerClassSelector";
import { CalendarSVG } from "./SVGFile";
import { useTripType } from "../TripTypeContext";
import DateCalendarModal from "@/app/components/calendar/DateCalendarModal";
import CalendarMonths from "@/app/components/calendar/CalendarMonths";
import SuggestionBox from "@/app/home-page/components/homePage/SuggestionBox";
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



const TopFilterSection = ({ isScrolled: parentScrolled = false, scrollProgress }) => {
  const calendarRef = useRef(null);
  const [fromSuggestionsOpen, setFromSuggestionsOpen] = useState(false);
  const [toSuggestionsOpen, setToSuggestionsOpen] = useState(false);
  const fromInputRef = useRef(null);
  const fromSuggestionRef = useRef(null);
  const toSuggestionRef = useRef(null);

  const {
    tripType,
    setTripType,
    from,
    setFrom,
    to,
    setTo,
    passengers,
    setPassengers,
    travelClass,
    setTravelClass,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleSearch,
  } = useTripType();

  const [directOnly, setDirectOnly] = useState(true);
  const isScrolled = parentScrolled || false;
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeMultiIndex, setActiveMultiIndex] = useState(null);

  // Direction for flight trip-type animation (round / oneway / multi)
  const [flightDirection, setFlightDirection] = useState("right");

  const [bookingType, setBookingType] = useState("flight");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [multiSegments, setMultiSegments] = useState([
    { from: "", to: "", date: "" },
    { from: "", to: "", date: "" },
  ]);

  // Sample suggestions data
  const recentSearches = [
    { label: 'CHENNAI, INDIA', detail: 'Chennai International Airport, India', code: 'CEN', value: 'Chennai, India' },
    { label: 'MUMBAI, INDIA', detail: 'Mumbai Chhatrapati Shivaji Maharaj International Airport, India', code: 'BOM', value: 'Mumbai, India' },
    { label: 'KOLKATA, INDIA', detail: 'Kolkata Netaji Subhas Chandra Bose International Airport, India', code: 'KLG', value: 'Kolkata, India' },
    { label: 'BENGALURU, INDIA', detail: 'Bengaluru Kempegowda International Airport, India', code: 'BLR', value: 'Bengaluru, India' },
  ];

  const departureRef = useRef(null);
  const returnRef = useRef(null);
  const multiDateRef1 = useRef(null);
  const multiDateRef0 = useRef(null);

  const [travellerOpen, setTravellerOpen] = useState(false);
  const travellerRef = useRef(null);

  const [calendarTripType, setCalendarTripType] = useState("oneway");

  // Filter suggestions based on input
  const getFilteredSuggestions = (input) => {
    const query =
      typeof input === "string"
        ? input
        : input?.label || "";   // 🔥 object case handle

    if (!query) return recentSearches;

    const q = query.toLowerCase();

    return recentSearches.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.detail.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
    );
  };


  // Handle suggestion selection
  const selectSuggestion = (suggestion, field) => {
    const value = suggestion.label; // ya suggestion.value

    if (tripType === "multi") {
      updateSegment(0, field, value);
    } else {
      field === "from" ? setFrom(value) : setTo(value);
    }

    setFromSuggestionsOpen(false);
    setToSuggestionsOpen(false);
  };


  const handleDateClick = (date) => {
    if (tripType === "multi" && activeMultiIndex !== null) {
      setMultiSegments((prev) =>
        prev.map((seg, i) => (i === activeMultiIndex ? { ...seg, date } : seg))
      );
      setShowCalendar(false);
      setActiveMultiIndex(null);
      return;
    }

    if (calendarTripType === "oneway") {
      setStartDate(date);
      setEndDate(null);
      return;
    }

    // ROUND TRIP
    if (!startDate || endDate) {
      // first click OR restart selection
      setStartDate(date);
      setEndDate(null);
    } else if (new Date(date) >= new Date(startDate)) {
      // valid end date
      setEndDate(date);
      setShowCalendar(false);
    } else {
      // clicked date before start → restart range
      setStartDate(date);
      setEndDate(null);
    }
  };

  useEffect(() => {
    if (tripType === "round") {
      setCalendarTripType("round");
    } else {
      setCalendarTripType("oneway");
    }
  }, [tripType]);

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
      if (fromSuggestionRef.current && !fromSuggestionRef.current.contains(e.target) &&
        fromInputRef.current && !fromInputRef.current.contains(e.target)) {
        setFromSuggestionsOpen(false);
      }
      if (toSuggestionRef.current && !toSuggestionRef.current.contains(e.target)) {
        setToSuggestionsOpen(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setTravellerOpen(false);
        setFromSuggestionsOpen(false);
        setToSuggestionsOpen(false);
      }
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

  useEffect(() => {
    if (!showCalendar) return;

    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        // setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar]);

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

  const formatDate = (dateStr) => {
    if (!dateStr) return "";

    const date = new Date(dateStr);
    if (isNaN(date)) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = date
      .toLocaleString("en-US", { month: "short" })
      .toUpperCase();
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
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

  const openRoundTripCalendar = () => {
    setCalendarTripType("round");
    setShowCalendar(true);
  };

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY || 0);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const MAX_MARGIN = 76;
  const MIN_PADDING = 16;
  const MAX_PADDING = 20;
  const MAX_MARGIN_BOTTOM = 28;
  const clampedScroll = Math.min(scrollY, MAX_MARGIN);
  const progress = clampedScroll / MAX_MARGIN;

  const marginTop = MAX_MARGIN * (1 - progress);
  const marginBottom = MAX_MARGIN_BOTTOM * (1 - progress);
  const padding = MAX_PADDING - (MAX_PADDING - MIN_PADDING) * progress;

  return (
    <>
      <div style={{
        marginTop: `${marginTop}px`,
        padding: `${padding}px`,
        marginBottom: `${marginBottom}px`,
        transition: "none", // 👈 IMPORTANT
      }}
        className={`${styles.searchSec} ${tripType === "multi" ? styles.isMulti : ""}
        ${scrollProgress === 1 ? styles.scrolledSearchSec : ""}
         sticky top-0 flex flex-col gap-[127px] items-center`}
      >
        <div
          className={`${styles.searchPanelWrapper} ${bookingType === "holiday" || bookingType === "insurance"
            ? styles.noAnimation
            : ""
            }`}
        >
          {bookingType === "flight" && (
            <div className={`${styles.serarchingCont} ${styles.glass_panel}
              ${scrollProgress === 1 ? styles.scrolledSerarchingCont : ""}
              //  ${isScrolled ? styles.scrolledGap : ""}
               
               `}>
              <div className={styles.serarchingContTop}>
                <div className={styles.tripTypeWrapper}>
                  <label
                    className={`${styles.tripOption} ${tripType === "oneway" ? styles.active : ""
                      }`}
                  >
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

                  <label
                    className={`${styles.tripOption} ${tripType === "round" ? styles.active : ""
                      }`}
                  >
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

                  <label
                    className={`${styles.tripOption} ${tripType === "multi" ? styles.active : ""
                      }`}
                  >
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
                {/* Unified One-way, Round-trip, and Multi-city (first row) form */}
                {(tripType === "oneway" || tripType === "round" || tripType === "multi") && (
                  <div
                    className={`${styles.serarchingContBottom}  ${styles.flightSearchFormWrapper} ${styles.formVisible}`}
                  >
                    <div
                      className={`${styles.fromBtn} ${styles.fromBtn2} ${tripType === "oneway" || tripType === "multi" ? styles.growRight : ""
                        }`}
                    >
                      <div className={styles.lable}>From</div>
                      <input
                        ref={fromInputRef}
                        type="text"
                        className={styles.contant}
                        placeholder="Departure"
                        value={tripType === 'multi' ? multiSegments[0].from : from}
                        onFocus={() => setFromSuggestionsOpen(true)}
                        onClick={() => setFromSuggestionsOpen(true)}
                        onChange={(e) => {
                          if (tripType === 'multi') {
                            updateSegment(0, 'from', e.target.value);
                          } else {
                            setFrom(e.target.value);
                            setFromSuggestionsOpen(true);
                          }
                        }}
                      />

                      {fromSuggestionsOpen && (
                        <SuggestionBox
                          boxRef={fromSuggestionRef}
                          heading="RECENT SEARCH"
                          suggestions={getFilteredSuggestions(tripType === 'multi' ? multiSegments[0].from : from)}
                          onSelect={(s) => selectSuggestion(s, "from")}
                        />
                      )}
                    </div>
                    <div
                      className={`${styles.arrowbox} ${tripType === "round" ? styles.arrowbox2 : ""} ${tripType === "multi" ? styles.arrowbox3 : ""}`}
                      onClick={() => {
                        if (tripType === "multi") {
                          const { from, to } = multiSegments[0];
                          updateSegment(0, "from", to);
                          updateSegment(0, "to", from);
                        } else {
                          swapLocations();
                        }
                      }}
                    >
                      <ArrowLeftRight size={16} className={styles.arrowIcon} />
                    </div>
                    <div
                      className={`${styles.fromBtn} ${styles.fromBtn2} ${styles.toBtn
                        } ${tripType === "oneway" || tripType === "multi" ? styles.growRight : ""}`}
                    >
                      <div className={styles.lable}>To</div>
                      <input
                        type="text"
                        className={styles.contant}
                        placeholder="Destination"
                        value={tripType === "multi" ? multiSegments[0].to : to}
                        onFocus={() => setToSuggestionsOpen(true)}
                        onClick={() => setToSuggestionsOpen(true)}
                        onChange={(e) => {
                          if (tripType === "multi") {
                            updateSegment(0, "to", e.target.value);
                          } else {
                            setTo(e.target.value);
                            setToSuggestionsOpen(true);
                          }
                        }}
                      />

                      {toSuggestionsOpen && (
                        <SuggestionBox
                          boxRef={toSuggestionRef}
                          heading="RECENT SEARCH"
                          suggestions={getFilteredSuggestions(tripType === 'multi' ? multiSegments[0].to : to)}
                          onSelect={(s) => selectSuggestion(s, "to")}
                        />
                      )}
                    </div>

                    <div
                      className={`${styles.fromBtn} ${styles.fromBtn2} ${tripType === "oneway" || tripType === "multi" ? styles.growRight : ""
                        } ${styles.calendarAnchor}`}
                    >
                      <div className={styles.lable}>Departure Date</div>
                      {showCalendar && (
                        <DateCalendarModal
                          mode={
                            calendarTripType === "round"
                              ? "roundtrip"
                              : "oneway"
                          }
                          onModeChange={(mode) =>
                            setCalendarTripType(
                              mode === "roundtrip" ? "round" : "oneway"
                            )
                          }
                          onClose={() => {
                            setShowCalendar(false);
                            setActiveMultiIndex(null);
                          }}
                        >
                          <div ref={calendarRef}>
                            <CalendarMonths
                              startDate={startDate}
                              endDate={endDate}
                              onDateClick={handleDateClick}
                            />
                          </div>
                        </DateCalendarModal>
                      )}
                      <div
                        className={styles.dateInputWrapper}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (tripType === "multi") {
                            setCalendarTripType("oneway");
                            setActiveMultiIndex(0);
                            setShowCalendar(true);
                          } else {
                            setCalendarTripType("oneway");
                            if (tripType === "round") setCalendarTripType("round");
                            setShowCalendar(true);
                          }
                        }}
                      >
                        <input
                          type="text"
                          readOnly
                          className={styles.contant}
                          placeholder="ADD DATE"
                          value={
                            tripType === "multi"
                              ? formatDate(multiSegments[0].date)
                              : (formatDate(startDate) || "")
                          }
                        />

                        <button type="button" className={styles.calendarIcon}>
                          <CalendarSVG />
                        </button>
                      </div>
                    </div>

                    {/* Return Date - conditionally hidden with CSS */}
                    <div
                      className={`${styles.fromBtn} ${styles.fromBtn2} ${styles.returnDateField} ${tripType === "oneway" || tripType === "multi" ? styles.hiddenField : ""
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        openRoundTripCalendar();
                      }}
                    >
                      <div className={styles.lable}>Return Date</div>

                      <div
                        className={styles.dateInputWrapper}
                      >
                        <input
                          type="text"
                          readOnly
                          className={styles.contant}
                          placeholder="ADD DATE"
                          value={formatDate(endDate) || ""}
                        />

                        <button type="button" className={styles.calendarIcon}>
                          <CalendarSVG />
                        </button>
                      </div>
                    </div>

                    <div
                      className={`${styles.fromBtn} ${styles.fromBtn2} ${tripType === "oneway" || tripType === "multi" ? styles.growRight : ""
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTravellerOpen((o) => !o);
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
                          className={`${styles.chevron} ${travellerOpen
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

                    {tripType !== "multi" && (
                      <div className={styles.searchBtn} onClick={handleSearch}>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M16.9994 16.2923L20.8536 20.1464C21.0488 20.3417 21.0488 20.6583 20.8536 20.8536C20.6583 21.0488 20.3417 21.0488 20.1464 20.8536L16.2923 16.9994C14.882 18.2445 13.0292 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11C19 13.0292 18.2445 14.882 16.9994 16.2923ZM11 18C14.866 18 18 14.866 18 11C18 7.13401 14.866 4 11 4C7.13401 4 4 7.13401 4 11C4 14.866 7.13401 18 11 18Z"
                            fill="#000033"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                )}

                {/* Multi-city form - Additional Rows */}
                {tripType === "multi" && (
                  <>
                    <div
                      className={`${styles.serarchingContBottom} ${styles.multiSearch} ${styles.flightSearchFormWrapper} ${styles.formVisible}`}
                      style={{ pointerEvents: 'none' }}
                    >
                      {/* First row is now handled by the unified block above. 
                          We use paddingTop to space the second row. */}

                      <div
                        className={`${styles.serarchingContBottom} ${styles.bottomRowAnimate
                          } ${tripType === "multi"
                            ? styles.animateIn
                            : styles.animateOut
                          }`}
                        style={{ pointerEvents: 'auto' }}
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
                          <ArrowLeftRight size={16} className={styles.arrowIcon} />
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
                          {showCalendar && (
                            <DateCalendarModal
                              mode="oneway"
                              onClose={() => {
                                setShowCalendar(false);
                                setActiveMultiIndex(null);
                              }}
                            >
                              <div ref={calendarRef}>
                                <CalendarMonths
                                  startDate={null}
                                  endDate={null}
                                  onDateClick={handleDateClick}
                                />
                              </div>
                            </DateCalendarModal>
                          )}
                          <div
                            className={styles.dateInputWrapper}
                            onClick={() => {
                              setCalendarTripType("oneway");
                              setActiveMultiIndex(1);
                              setShowCalendar(true);
                            }}
                          >
                            <input
                              type="text"
                              readOnly
                              className={styles.contant}
                              placeholder="ADD DATE"
                              value={formatDate(multiSegments[1].date)}
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
                        <div className={styles.searchBtn} onClick={handleSearch}>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M16.9994 16.2923L20.8536 20.1464C21.0488 20.3417 21.0488 20.6583 20.8536 20.8536C20.6583 21.0488 20.3417 21.0488 20.1464 20.8536L16.2923 16.9994C14.882 18.2445 13.0292 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11C19 13.0292 18.2445 14.882 16.9994 16.2923ZM11 18C14.866 18 18 14.866 18 11C18 7.13401 14.866 4 11 4C7.13401 4 4 7.13401 4 11C4 14.866 7.13401 18 11 18Z"
                              fill="#000033"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </>
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

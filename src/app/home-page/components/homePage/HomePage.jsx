"use client";
import styles from './HomePage.module.css'
import Switch from '../Switch'
import { useState, useRef, useEffect } from 'react'
import TravellerSelector from './TravellerSelector';
import Navbar from '../../../flights/Navbar';
import Link from 'next/link';
import DateField from './DateField';
import { ArrowLeftRight, ChevronDown } from 'lucide-react';
import PassengerClassSelector from './PassengerClassSelector';
import SuggestionBox from './SuggestionBox';
import { CalendarSVG } from "@/app/flights/components/SVGFile";
import DateCalendarModal from './calendar/DateCalendarModal';
import CalendarMonths from './calendar/CalendarMonths';

const HomePage = () => {
  const [directOnly, setDirectOnly] = useState(true)
  const [tripType, setTripType] = useState("round");
  const [bookingType, setBookingType] = useState("flight")
  const [menuOpen, setMenuOpen] = useState(false);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturenDate] = useState("")
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("")

  // refs for the date inputs
  const departureRef = useRef(null)
  const returnRef = useRef(null)

  // Flight calendar modal controls
  const calendarRef = useRef(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [activeMultiIndex, setActiveMultiIndex] = useState(null)
  const [calendarTripType, setCalendarTripType] = useState("oneway")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Hotel calendar states
  const hotelCalendarRef = useRef(null)
  const [showHotelCalendar, setShowHotelCalendar] = useState(false)
  const [hotelStartDate, setHotelStartDate] = useState("")
  const [hotelEndDate, setHotelEndDate] = useState("")

  // Holiday calendar states
  const holidayCalendarRef = useRef(null)
  const [showHolidayCalendar, setShowHolidayCalendar] = useState(false)
  const [holidayStartDate, setHolidayStartDate] = useState("")

  // Insurance calendar states
  const insuranceCalendarRef = useRef(null)
  const [showInsuranceCalendar, setShowInsuranceCalendar] = useState(false)
  const [insuranceStartDate, setInsuranceStartDate] = useState("")
  const [insuranceEndDate, setInsuranceEndDate] = useState("")

  const [activeFeature, setActiveFeature] = useState(1);
  const featureRowRef = useRef(null);
  const progressRef = useRef(null);

  const [travellerDestination, setTravellerDestination] = useState("SELECT DESTINATION")
  const [travellerCount, setTravellerCount] = useState("1 TRAVELLER")
  const [guestRoomCount, setGuestRoomCount] = useState("SELECT ROOMS")
  const [hotelGuestRoomCount, setHotelGuestRoomCount] = useState("GUESTS & ROOMS")

  const [passengers, setPassengers] = useState({
    adult: 1,
    child: 0,
    infant: 0,
  });

  const totalPassengers = passengers.adult + passengers.child + passengers.infant;

  const recentSearches = [
    { label: 'CHENNAI, INDIA', detail: 'Chennai International Airport, India', code: 'CEN', value: 'Chennai, India' },
    { label: 'MUMBAI, INDIA', detail: 'Mumbai Chhatrapati Shivaji Maharaj International Airport, India', code: 'BOM', value: 'Mumbai, India' },
    { label: 'KOLKATA, INDIA', detail: 'Kolkata Netaji Subhas Chandra Bose International Airport, India', code: 'KLG', value: 'Kolkata, India' },
    { label: 'BENGALURU, INDIA', detail: 'Bengaluru Kempegowda International Airport, India', code: 'BLR', value: 'Bengaluru, India' },
  ];

  const [fromSuggestionsOpen, setFromSuggestionsOpen] = useState(false);
  const [toSuggestionsOpen, setToSuggestionsOpen] = useState(false);
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const fromSuggestionRef = useRef(null);
  const toSuggestionRef = useRef(null);

  const [activeSuggestion, setActiveSuggestion] = useState(null);
  const multiInputRefs = useRef([]);
  const multiSuggestionRefs = useRef([]);

  const getFilteredSuggestions = (query) => {
    if (!query) return recentSearches;
    const q = query.toLowerCase();
    return recentSearches.filter(s => s.label.toLowerCase().includes(q) || s.detail.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
  };

  const selectSuggestion = (sugg, field = 'from', index = null) => {
    if (typeof index === 'number') {
      updateMultiLeg(index, field, sugg.value);
      setActiveSuggestion(null);
      const wrapper = multiInputRefs.current[index];
      if (wrapper) {
        const inputEl = wrapper.querySelector('input');
        if (inputEl) inputEl.focus();
      }
      return;
    }

    if (field === 'from') {
      setFrom(sugg.value);
      setFromSuggestionsOpen(false);
      if (fromInputRef.current) fromInputRef.current.focus();
    } else {
      setTo(sugg.value);
      setToSuggestionsOpen(false);
      if (toInputRef.current) toInputRef.current.focus();
    }
  };

  const [travelClass, setTravelClass] = useState("Economy");
  const [travellerClass, setTravellerClass] = useState("1_traveller_econ");
  const [travellerOpen, setTravellerOpen] = useState(false);
  const travellerRef = useRef(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [multiCity, setMultiCity] = useState([
    { from: "", to: "" },
    { from: "", to: "" },
  ]);

  const [direction, setDirection] = useState("right");
  const [flightDirection, setFlightDirection] = useState("right");

  const swapLocations = (index) => {
    if (typeof index === 'number' && tripType === 'multi') {
      setMultiCity(prev => prev.map((leg, i) => i === index ? { ...leg, from: leg.to || '', to: leg.from || '' } : leg));
      return;
    }
    setFrom(to);
    setTo(from);
  };

  const addMultiLeg = () => {
    setMultiCity(prev => [...prev, { from: "", to: "", date: "" }]);
  };

  const updateMultiLeg = (index, field, value) => {
    setMultiCity(prev => prev.map((leg, i) => i === index ? { ...leg, [field]: value } : leg));
  };

  const removeMultiLeg = (index) => {
    setMultiCity(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev);
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

      if (toSuggestionRef.current && !toSuggestionRef.current.contains(e.target) &&
          toInputRef.current && !toInputRef.current.contains(e.target)) {
        setToSuggestionsOpen(false);
      }

      if (activeSuggestion?.index !== undefined) {
        const idx = activeSuggestion.index;
        const inputWrapper = multiInputRefs.current[idx];
        const suggestionBox = multiSuggestionRefs.current[idx];

        if (suggestionBox && inputWrapper &&
            !suggestionBox.contains(e.target) && !inputWrapper.contains(e.target)) {
          setActiveSuggestion(null);
        }
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setTravellerOpen(false);
        setFromSuggestionsOpen(false);
        setToSuggestionsOpen(false);
        setActiveSuggestion(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [activeSuggestion, travellerOpen]);

  const truncate = (str, max = 10) => {
    if (!str) return "";
    return str.length > max ? str.slice(0, max) + "..." : str;
  };

  const travellerOptions = [
    { value: "1_traveller_econ", label: "1 Traveller, Economy" },
    { value: "2_traveller_econ", label: "2 Travellers, Economy" },
    { value: "3_traveller_business", label: "3 Traveller, Business" },
  ];

  const TravellerDestinationOptions = [
    { value: "india", label: "india" },
    { value: "chennai", label: "Chennai" },
  ]

  const features = [
    { id: 0, label: "Hotels & Resorts", icon: "/icons/hotel.svg", type: "hotel" },
    { id: 1, label: "Flights", icon: "/icons/flight.svg", type: "flight" },
    { id: 2, label: "Holiday Gateways", icon: "/icons/holiday.svg", type: "holiday" },
    { id: 3, label: "Travel Insurance", icon: "/icons/insurance.svg", type: "insurance" },
  ];

  const tabOrder = ["hotel", "flight", "holiday", "insurance"];
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

  const handleFeatureClick = (feature) => {
    setActiveFeature(feature.id);

    const prevIndex = tabOrder.indexOf(bookingType);
    const nextIndex = tabOrder.indexOf(feature.type);
    if (prevIndex < nextIndex) {
      setDirection("right");
    } else if (prevIndex > nextIndex) {
      setDirection("left");
    }

    setBookingType(feature.type);
  }

  useEffect(() => {
    setFromSuggestionsOpen(false);
    setToSuggestionsOpen(false);
    setActiveSuggestion(null);
  }, [bookingType, tripType]);

  useEffect(() => {
    const update = () => {
      const row = featureRowRef.current;
      const prog = progressRef.current;
      if (!row || !prog) return;

      const buttons = Array.from(row.querySelectorAll('button'));
      const idx = features.findIndex(f => f.id === activeFeature);
      const target = buttons[idx];
      if (!target) return;

      const rowRect = row.getBoundingClientRect();
      const progRect = prog.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      const left = targetRect.left - progRect.left;
      const width = targetRect.width;

      const activeEl = prog.querySelector(`.${styles.progressActive}`) || prog.firstElementChild;
      if (activeEl) {
        activeEl.style.left = `${left}px`;
        activeEl.style.width = `${width}px`;
      }
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [activeFeature, features]);

  // Flight calendar outside click
  useEffect(() => {
    if (!showCalendar) return;

    const handleClickOutsideCalendar = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
        setActiveMultiIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideCalendar);
    return () => document.removeEventListener("mousedown", handleClickOutsideCalendar);
  }, [showCalendar]);

  // Hotel calendar outside click
  useEffect(() => {
    if (!showHotelCalendar) return;

    const handleClickOutside = (e) => {
      if (hotelCalendarRef.current && !hotelCalendarRef.current.contains(e.target)) {
        setShowHotelCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showHotelCalendar]);

  // Holiday calendar outside click
  useEffect(() => {
    if (!showHolidayCalendar) return;

    const handleClickOutside = (e) => {
      if (holidayCalendarRef.current && !holidayCalendarRef.current.contains(e.target)) {
        setShowHolidayCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showHolidayCalendar]);

  // Insurance calendar outside click
  useEffect(() => {
    if (!showInsuranceCalendar) return;

    const handleClickOutside = (e) => {
      if (insuranceCalendarRef.current && !insuranceCalendarRef.current.contains(e.target)) {
        setShowInsuranceCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showInsuranceCalendar]);

  const openDeparturePicker = () => {
    const input = departureRef.current
    if (!input) return
    if (typeof input.showPicker === 'function') {
      input.showPicker()
    } else {
      input.focus()
      input.click()
    }
  }

  const openReturnPicker = () => {
    const input = returnRef.current
    if (!input) return
    if (typeof input.showPicker === 'function') {
      input.showPicker()
    } else {
      input.focus()
      input.click()
    }
  }

  const handleFieldClick = (e) => {
    const target = e.currentTarget;
    const input = target.querySelector('input');

    if (!input) return;

    if (input.type === "date" && typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.focus();
    }
  };

  // Flight date handler
  const handleDateClick = (date) => {
    if (tripType === "multi" && activeMultiIndex !== null) {
      updateMultiLeg(activeMultiIndex, 'date', date);
      setShowCalendar(false);
      setActiveMultiIndex(null);
      return;
    }

    if (calendarTripType === "oneway") {
      setStartDate(date);
      setEndDate("");
      setShowCalendar(false);
      return;
    }

    if (!startDate || endDate) {
      setStartDate(date);
      setEndDate("");
    } else if (new Date(date) >= new Date(startDate)) {
      setEndDate(date);
      setShowCalendar(false);
    } else {
      setStartDate(date);
      setEndDate("");
    }
  };

  // Hotel date handler
  const handleHotelDateClick = (date) => {
    if (!hotelStartDate || hotelEndDate) {
      setHotelStartDate(date);
      setHotelEndDate("");
    } else if (new Date(date) >= new Date(hotelStartDate)) {
      setHotelEndDate(date);
      setShowHotelCalendar(false);
    } else {
      setHotelStartDate(date);
      setHotelEndDate("");
    }
  };

  // Holiday date handler
  const handleHolidayDateClick = (date) => {
    setHolidayStartDate(date);
    setShowHolidayCalendar(false);
  };

  // Insurance date handler
  const handleInsuranceDateClick = (date) => {
    if (!insuranceStartDate || insuranceEndDate) {
      setInsuranceStartDate(date);
      setInsuranceEndDate("");
    } else if (new Date(date) >= new Date(insuranceStartDate)) {
      setInsuranceEndDate(date);
      setShowInsuranceCalendar(false);
    } else {
      setInsuranceStartDate(date);
      setInsuranceEndDate("");
    }
  };

  useEffect(() => {
    if (tripType === "round") {
      setCalendarTripType("round");
    } else {
      setCalendarTripType("oneway");
    }
  }, [tripType]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date)) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  return (
    <section className='relative w-full h-[100vh]'>

      <div className={`${styles.menuSection} ${menuOpen ? styles.menuOpen : styles.menuClose}`}>
        <div className={`${styles.navContainer} top-0 z-20`}>
          <div className={`${styles.navbar}  w-full flex  justify-between items-center`}>
            <img src="./Logo.svg" alt="" />
            <div className={`${styles.navRight} flex gap-3`}>
              <button className={`${styles.glass_button} ${styles.downloadBtn}`} >Download the App</button>
              <button className={styles.hamBurger} onClick={() => setMenuOpen(false)}>
                <img src="/icons/XIcon.svg" alt="" />
              </button>
            </div>
          </div>
        </div>
        <div className={styles.menuContainer}>
          <div className={styles.menuItems}>
            <ul>
              <li><Link href="#">Home</Link></li>
              <li><Link href="#">Destinations</Link></li>
              <li><Link href="#">Tailor-Made Journeys</Link></li>
              <li><Link href="#">About Us</Link></li>
              <li><Link href="#">Flight Booking</Link></li>
              <li><Link href="#">Blogs</Link></li>
            </ul>
          </div>
          <div className={styles.menuBottom}>
            <button className={styles.accountBtn}>ACCOUNT LOGIN</button>
          </div>
        </div>
      </div>

      <header className={`${styles.homeSection} w-full h-[100vh]`}>
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/hero.mp4"
          poster="/images/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
        />
        <img className={styles.gradient} src="/images/gradient.png" />
      </header>
      <div className={`${styles.overlay} absolute inset-0`}></div>
      <div className={`${styles.navContainer} absolute top-0 z-20`}>
        <div className={`${styles.navbar}  w-full flex  justify-between items-center`}>
          <img src="./Logo.svg" alt="" />
          <div className={`${styles.navRight} flex gap-3`}>
            <button className={`${styles.glass_button} ${styles.downloadBtn}`} >Download the App</button>
            <button className={styles.signInBtn}>Sign In</button>
            <button className={styles.hamBurger} onClick={() => setMenuOpen(true)}>
              <img src="/icons/hamBurger.png" alt="" />
              menu
            </button>
          </div>
        </div>
      </div>

      <div className={styles.homePageContainer}>
        <div className={styles.InspiredSection}>
          <h1>Inspired travel for the <br />
            curious & cultured</h1>
          <p>Thoughtfully designed journeys for those who find beauty in the details.</p>
        </div>

        <div className={`${styles.searchSec} flex flex-col gap-[127px] items-center`}>
          <div className={`${styles.searchPanelWrapper} ${(bookingType === "holiday" || bookingType === "insurance") ? styles.noAnimation : ""}`}>
            {bookingType === "flight" && (
              <div className={`${styles.serarchingCont} ${styles.glass_panel}`}>
                <div className={styles.serarchingContTop}>
                  <div className={styles.serarchingContTop_left}>
                    <button
                      className={`${styles.round_tripBtn} ${tripType === "round" ? styles.activeTrip : ""}`}
                      onClick={() => handleTripTypeChange("round")}
                    >
                      Round-trip
                    </button>

                    <button
                      className={`${styles.round_tripBtn} ${tripType === "oneway" ? styles.activeTrip : ""}`}
                      onClick={() => handleTripTypeChange("oneway")}
                    >
                      One-way
                    </button>

                    <button
                      className={`${styles.round_tripBtn} ${tripType === "multi" ? styles.activeTrip : ""}`}
                      onClick={() => handleTripTypeChange("multi")}
                    >
                      Multi-City
                    </button>
                  </div>
                  <div className={styles.serarchingContTop_right}>
                    <Switch
                      checked={directOnly}
                      onChange={setDirectOnly}
                      label="DIRECT FLIGHTS ONLY"
                    />
                  </div>
                </div>
                <div className={styles.flightSearchFormContainer}>
                  {(tripType === "round" || tripType === "oneway" || tripType === "multi") && (
                    <div
                      key="row1"
                      className={`${styles.serarchingContBottom} ${styles.formVisible}`}
                    >
                      <div className={`${styles.arrowbox} ${tripType === "oneway" ? styles.arrowboxOneWay : tripType === "multi" ? styles.multiArrow : ""}`} onClick={() => swapLocations(tripType === 'multi' ? 0 : undefined)}>
                        <ArrowLeftRight size={16} className={styles.arrowIcon} />
                      </div>
                      <div className={`${styles.fromBtn} ${styles.fromInput}`} onClick={handleFieldClick} >
                        <div className={styles.lable}>From</div>
                        <input
                          ref={fromInputRef}
                          type="text"
                          className={styles.contant}
                          placeholder="Departure"
                          value={tripType === 'multi' ? (multiCity[0]?.from || '') : from}
                          onFocus={() => setFromSuggestionsOpen(true)}
                          onClick={() => setFromSuggestionsOpen(true)}
                          onChange={(e) => {
                            if (tripType === 'multi') {
                              updateMultiLeg(0, 'from', e.target.value);
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
                            suggestions={getFilteredSuggestions(from)}
                            onSelect={(s) => selectSuggestion(s, "from")}
                          />
                        )}
                      </div>
                      <div className={`${styles.fromBtn} ${styles.fromInput} ${styles.toInput}`} onClick={handleFieldClick} >
                        <div className={styles.lable}>To</div>
                        <input
                          ref={toInputRef}
                          type="text"
                          className={styles.contant}
                          placeholder="Destination"
                          value={tripType === 'multi' ? (multiCity[0]?.to || '') : to}
                          onFocus={() => setToSuggestionsOpen(true)}
                          onClick={() => setToSuggestionsOpen(true)}
                          onChange={(e) => {
                            if (tripType === 'multi') {
                              updateMultiLeg(0, 'to', e.target.value);
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
                            suggestions={getFilteredSuggestions(to)}
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
                            mode={calendarTripType === "round" ? "roundtrip" : "oneway"}
                            onModeChange={(mode) =>
                              setCalendarTripType(mode === "roundtrip" ? "round" : "oneway")
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
                                ? formatDate(multiCity[0]?.date)
                                : (formatDate(startDate) || "")
                            }
                          />

                          <button type="button" className={styles.calendarIcon}>
                            <CalendarSVG />
                          </button>
                        </div>
                      </div>

                      <div
                        className={`${styles.fromBtn} ${styles.fromInput} ${styles.returnDateField} ${(tripType === "oneway" || tripType === "multi") ? styles.hiddenField : ""
                          }`}
                        onClick={(e) => {
                          e.stopPropagation();

                          if (tripType === "round") {
                            setCalendarTripType("round");
                            setShowCalendar(true);
                          }
                        }}
                      >
                        <div className={styles.lable}>Return Date</div>
                        <div className={styles.dateInputWrapper} onClick={openReturnPicker}>
                          <input
                            type="text"
                            readOnly
                            className={styles.contant}
                            placeholder="ADD DATE"
                            value={formatDate(endDate)}
                          />
                          <button
                            type="button"
                            aria-label="Open return date picker"
                            className={styles.calendarIcon}
                            onClick={openReturnPicker}
                          >
                            <img src="/icons/calander.svg" alt="" />
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
                            {truncate(`${totalPassengers} Traveller${totalPassengers > 1 ? 's' : ''}, ${travelClass}`, 17)}
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

                      <div className={`${styles.searchBtn} ${tripType === 'multi' ? styles.hiddenField : ""}`}>
                        <img src="/images/searchIcon.svg" alt="" />
                      </div>
                    </div>
                  )}

                  {tripType === "multi" && (
                    <div className={styles.multiSearch}>
                      {multiCity.slice(1).map((leg, idx) => {
                        const actualIndex = idx + 1;
                        return (
                          <div key={actualIndex} ref={(el) => multiInputRefs.current[actualIndex] = el} className={styles.serarchingContBottom} style={{ position: 'relative' }}>
                            <div className={`${styles.arrowboxOneWay} ${styles.arrowbox}  ${styles.multiArrow}`} onClick={() => swapLocations(actualIndex)}>
                              <ArrowLeftRight size={16} className={styles.arrowIcon} />
                            </div>
                            <div className={`${styles.fromBtn} ${styles.travellerClass}`} onClick={handleFieldClick}>
                              <div className={styles.lable}>From</div>
                              <input
                                type="text"
                                className={styles.contant}
                                placeholder='Departure'
                                value={leg.from || ''}
                                onFocus={() => setActiveSuggestion({ field: 'from', index: actualIndex })}
                                onClick={() => setActiveSuggestion({ field: 'from', index: actualIndex })}
                                onChange={(e) => updateMultiLeg(actualIndex, 'from', e.target.value)}
                              />

                              {activeSuggestion && activeSuggestion.index === actualIndex && activeSuggestion.field === 'from' && (
                                <SuggestionBox
                                  boxRef={(el) => multiSuggestionRefs.current[actualIndex] = el}
                                  heading="RECENT SEARCH"
                                  suggestions={getFilteredSuggestions(leg.from || '')}
                                  onSelect={(s) => selectSuggestion(s, 'from', actualIndex)}
                                />
                              )}
                            </div>
                            <div className={`${styles.fromBtn} ${styles.travellerClass} ${styles.toInput}`} onClick={handleFieldClick}>
                              <div className={styles.lable}>To</div>
                              <input
                                type="text"
                                className={styles.contant}
                                placeholder='Destination'
                                value={leg.to || ''}
                                onFocus={() => setActiveSuggestion({ field: 'to', index: actualIndex })}
                                onClick={() => setActiveSuggestion({ field: 'to', index: actualIndex })}
                                onChange={(e) => updateMultiLeg(actualIndex, 'to', e.target.value)}
                              />

                              {activeSuggestion && activeSuggestion.index === actualIndex && activeSuggestion.field === 'to' && (
                                <SuggestionBox
                                  boxRef={(el) => multiSuggestionRefs.current[actualIndex] = el}
                                  heading="RECENT SEARCH"
                                  suggestions={getFilteredSuggestions(leg.to || '')}
                                  onSelect={(s) => selectSuggestion(s, 'to', actualIndex)}
                                />
                              )}
                            </div>

                            <div className={`${styles.fromBtn} ${styles.travellerClass}`} onClick={handleFieldClick}>
                              <div className={styles.lable}>Departure Date</div>

                              {showCalendar && activeMultiIndex === actualIndex && (
                                <DateCalendarModal
                                  mode="oneway"
                                  onModeChange={() => { }}
                                  onClose={() => { setShowCalendar(false); setActiveMultiIndex(null); }}
                                  anchorEl={multiInputRefs.current[actualIndex]}
                                >
                                  <div>
                                    <CalendarMonths
                                      startDate={leg.date}
                                      endDate={null}
                                      onDateClick={(date) => {
                                        updateMultiLeg(actualIndex, 'date', date);
                                        setShowCalendar(false);
                                        setActiveMultiIndex(null);
                                      }}
                                    />
                                  </div>
                                </DateCalendarModal>
                              )}

                              <div
                                className={styles.dateInputWrapper}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCalendarTripType("oneway");
                                  setActiveMultiIndex(actualIndex);
                                  setShowCalendar(true);
                                }}
                              >
                                <input
                                  type="text"
                                  readOnly
                                  className={styles.contant}
                                  placeholder="ADD DATES"
                                  value={formatDate(leg.date) || ''}
                                  required
                                />
                                <button
                                  type="button"
                                  aria-label="Open departure date picker"
                                  className={styles.calendarIcon}
                                  onClick={(e) => { e.stopPropagation(); setActiveMultiIndex(actualIndex); setShowCalendar(true); }}
                                >
                                  <img src="/icons/calander.svg" alt="" />
                                </button>
                              </div>
                            </div>

                            {actualIndex === multiCity.length - 1 ? (
                              <div className={styles.multisearchBtn}>
                                Search
                              </div>
                            ) : (
                              <div className={`${styles.multisearchBtn} opacity-0 pointer-events-none`}>
                                Search
                              </div>
                            )}

                            {multiCity.length > 2 && (
                              <button
                                className="absolute -right-8 top-1/2 -translate-y-1/2 text-white hover:text-red-500"
                                onClick={() => removeMultiLeg(actualIndex)}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {((bookingType === "hotel") || bookingType === "holiday" || bookingType === "insurance") && (
              <div className={`${styles.serarchingCont} ${styles.glass_panel} ${styles.searchFormContainer}`}>
                <div className={`${styles.serarchingContBottom} ${bookingType === 'holiday' ? styles.swapActive : ''}`}>

                  {bookingType === "insurance" ? (
                    <TravellerSelector
                      travellerClass={travellerDestination}
                      setTravellerClass={setTravellerDestination}
                      travellerOptions={TravellerDestinationOptions}
                      styles={styles}
                      name="TRAVEL DESTINATION"
                      className={`${styles.pos1}`}
                      enableEllipsis={false}
                    />
                  ) : (
                    <div className={`${styles.fromBtn} ${styles.pos1}`} onClick={handleFieldClick}>
                      <div className={`${styles.lable} ${styles.labelFade}`}>
                        {bookingType === "hotel" ? "WHERE TO" : "From CITY"}
                      </div>

                      <input
                        ref={bookingType === "hotel" ? toInputRef : fromInputRef}
                        type="text"
                        className={`${styles.contant} ${styles.contentFade}`}
                        placeholder={bookingType === "hotel" ? "Where to" : "From city"}
                        value={bookingType === "hotel" ? to : from}
                        onChange={(e) => {
                          if (bookingType === "hotel") {
                            setTo(e.target.value);
                            setToSuggestionsOpen(true);
                          } else {
                            setFrom(e.target.value);
                            setFromSuggestionsOpen(true);
                          }
                        }}
                        onFocus={() => {
                          if (bookingType === "hotel") {
                            setToSuggestionsOpen(true);
                          } else {
                            setFromSuggestionsOpen(true);
                          }
                        }}
                      />

                      {bookingType === "hotel" && toSuggestionsOpen && (
                        <SuggestionBox
                          boxRef={toSuggestionRef}
                          heading="RECENT SEARCH"
                          suggestions={getFilteredSuggestions(to)}
                          onSelect={(s) => selectSuggestion(s, "to")}
                        />
                      )}

                      {bookingType === "holiday" && fromSuggestionsOpen && (
                        <SuggestionBox
                          boxRef={fromSuggestionRef}
                          heading="RECENT SEARCH"
                          suggestions={getFilteredSuggestions(from)}
                          onSelect={(s) => selectSuggestion(s, "from")}
                        />
                      )}
                    </div>
                  )}

                  {/* SLOT 2: Check In / Departure Date / Travel Date with Calendar */}
                  <div className={`${styles.fromBtn} ${styles.pos2} ${styles.swapField} ${styles.calendarAnchor}`}>
                    <div className={`${styles.lable} ${styles.labelFade}`}>
                      {bookingType === "hotel" ? "Check In" : bookingType === "holiday" ? "Departure Date" : "Travel Date"}
                    </div>

                    {/* Hotel Calendar */}
                    {bookingType === "hotel" && showHotelCalendar && (
                      <DateCalendarModal
                        mode="roundtrip"
                        onModeChange={() => {}}
                        onClose={() => setShowHotelCalendar(false)}
                      >
                        <div ref={hotelCalendarRef}>
                          <CalendarMonths
                            startDate={hotelStartDate}
                            endDate={hotelEndDate}
                            onDateClick={handleHotelDateClick}
                          />
                        </div>
                      </DateCalendarModal>
                    )}

                    {/* Holiday Calendar */}
                    {bookingType === "holiday" && showHolidayCalendar && (
                      <DateCalendarModal
                        mode="oneway"
                        onModeChange={() => {}}
                        onClose={() => setShowHolidayCalendar(false)}
                      >
                        <div ref={holidayCalendarRef}>
                          <CalendarMonths
                            startDate={holidayStartDate}
                            endDate={null}
                            onDateClick={handleHolidayDateClick}
                          />
                        </div>
                      </DateCalendarModal>
                    )}

                    {/* Insurance Calendar */}
                    {bookingType === "insurance" && showInsuranceCalendar && (
                      <DateCalendarModal
                        mode="roundtrip"
                        onModeChange={() => {}}
                        onClose={() => setShowInsuranceCalendar(false)}
                      >
                        <div ref={insuranceCalendarRef}>
                          <CalendarMonths
                            startDate={insuranceStartDate}
                            endDate={insuranceEndDate}
                            onDateClick={handleInsuranceDateClick}
                          />
                        </div>
                      </DateCalendarModal>
                    )}

                    <div 
                      className={`${styles.dateInputWrapper} ${styles.contentFade}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (bookingType === "hotel") {
                          setShowHotelCalendar(true);
                        } else if (bookingType === "holiday") {
                          setShowHolidayCalendar(true);
                        } else if (bookingType === "insurance") {
                          setShowInsuranceCalendar(true);
                        }
                      }}
                    >
                      <input
                        type="text"
                        readOnly
                        className={styles.contant}
                        placeholder="ADD DATES"
                        value={
                          bookingType === "hotel" 
                            ? formatDate(hotelStartDate)
                            : bookingType === "holiday"
                            ? formatDate(holidayStartDate)
                            : formatDate(insuranceStartDate)
                        }
                      />
                      <button type="button" className={styles.calendarIcon}>
                        <CalendarSVG />
                      </button>
                    </div>
                  </div>

                  {/* SLOT 3: Check Out / To City / Return Date */}
                  <div className={`${styles.fromBtn} ${styles.pos3} ${styles.swapField} ${bookingType === "holiday" ? '' : styles.calendarAnchor}`}>
                    <div className={`${styles.lable} ${styles.labelFade}`}>
                      {bookingType === "hotel"
                        ? "Check Out"
                        : bookingType === "holiday"
                          ? "To CITY/COUNTRY, CATEGORY"
                          : "Return Date"}
                    </div>

                    {bookingType === "holiday" ? (
                      <>
                        <input
                          ref={toInputRef}
                          type="text"
                          className={`${styles.contant} ${styles.contentFade}`}
                          placeholder="Destination"
                          value={to}
                          onChange={(e) => {
                            setTo(e.target.value);
                            setToSuggestionsOpen(true);
                          }}
                          onFocus={() => setToSuggestionsOpen(true)}
                        />

                        {toSuggestionsOpen && (
                          <SuggestionBox
                            boxRef={toSuggestionRef}
                            heading="RECENT SEARCH"
                            suggestions={getFilteredSuggestions(to)}
                            onSelect={(s) => selectSuggestion(s, "to")}
                          />
                        )}
                      </>
                    ) : (
                      <div 
                        className={`${styles.dateInputWrapper} ${styles.contentFade}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (bookingType === "hotel") {
                            setShowHotelCalendar(true);
                          } else if (bookingType === "insurance") {
                            setShowInsuranceCalendar(true);
                          }
                        }}
                      >
                        <input
                          type="text"
                          readOnly
                          className={styles.contant}
                          placeholder="ADD DATES"
                          value={
                            bookingType === "hotel"
                              ? formatDate(hotelEndDate)
                              : formatDate(insuranceEndDate)
                          }
                        />
                        <button type="button" className={styles.calendarIcon}>
                          <CalendarSVG />
                        </button>
                      </div>
                    )}
                  </div>

                  <div
                    className={`${styles.fromBtn} ${styles.pos4} ${styles.fromBtn2}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTravellerOpen((o) => !o);
                    }}
                  >
                    <div className={styles.lable}>
                      {bookingType === "hotel"
                        ? "GUESTS & ROOMS"
                        : bookingType === "holiday"
                          ? "ROOMS & GUESTS"
                          : "TRAVELLERS"}
                    </div>
                    <div className={styles.iconCont}>
                      <div className={styles.contant}>
                        {truncate(
                          bookingType === "hotel"
                            ? `${totalPassengers} Guest${totalPassengers > 1 ? 's' : ''}, ${totalPassengers} Room${totalPassengers > 1 ? 's' : ''}`
                            : bookingType === "holiday"
                              ? `${totalPassengers} Room${totalPassengers > 1 ? 's' : ''}, ${totalPassengers} Guest${totalPassengers > 1 ? 's' : ''}`
                              : `${totalPassengers} Traveller${totalPassengers > 1 ? 's' : ''}, ${travelClass}`,
                          17
                        )}
                      </div>
                      <ChevronDown
                        className={`${styles.chevron} ${travellerOpen ? styles.openChevron : styles.closeChevron}`}
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

                  <div className={`${styles.searchBtn} ${styles.pos5}`}>
                    <img src="/images/searchIcon.svg" alt="" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.featureStrip}>
          <div
            className={styles.progress}
            ref={progressRef}
            style={{
              '--active-index': String(activeFeature),
              '--count': String(features.length)
            }}
          >
            <div className={styles.progressActive}></div>
          </div>

          <div className={styles.featureRow} ref={featureRowRef}>
            {features.map((f) => (
              <button
                key={f.id}
                className={`${styles.feature} ${activeFeature === f.id ? styles.featureActive : ''}`}
                onClick={() => handleFeatureClick(f)}
                type="button"
              >
                <img src={f.icon} className={styles.icon} alt="" />
                <div className={styles.featurelabel}>{f.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile sections remain same as original with DateField */}
      {bookingType === "flight" && (
        <div className={styles.flightSectionMain}>
          <button type="button" className={styles.swapBtn} onClick={swapLocations}>
            <img src="/icons/leftRrighArrow.svg" alt="swap" />
          </button>
          <div className={styles.flightSearchCard}>
            <div className={styles.field}>
              <label className={styles.label}>FROM</label>
              <input
                type="text"
                placeholder="Departure"
                className={styles.input}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>TO</label>
              <input
                type="text"
                placeholder="Destination"
                className={styles.input}
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <DateField
              label="DEPARTURE DATE"
              placeholder="ADD DATES"
              value={departureDate}
              name="departureDate"
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDepartureDate(e.target.value)}
            />
            <DateField
              label="RETURN DATE"
              placeholder="ADD DATES"
              value={returnDate}
              name="departureDate"
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setReturenDate(e.target.value)}
            />

            <div
              className={`${styles.fromBtn} ${styles.fromBtn2}`}
              onClick={(e) => {
                e.stopPropagation();
                setTravellerOpen((o) => !o);
              }}
            >
              <div className={styles.lable}>Travellers & Class</div>
              <div className={styles.iconCont}>
                <div className={styles.contant}>
                  {truncate(`${totalPassengers} Traveller${totalPassengers > 1 ? 's' : ''}, ${travelClass}`, 17)}
                </div>

                <ChevronDown
                  className={`${styles.chevron} ${travellerOpen ? styles.openChevron : styles.closeChevron}`}
                  size={20}
                  color="#000000"
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

            <button className={styles.searchBtna}>SEARCH</button>
          </div>
        </div>
      )}

      {bookingType === "hotel" && (
        <div className={styles.flightSectionMain}>
          <div className={styles.flightSearchCard}>
            <div className={styles.field}>
              <label className={styles.label}>Where to</label>
              <input type="text" placeholder="Departure" className={styles.input} value={to} onChange={(e) => setTo(e.target.value)} />
            </div>

            <DateField
              label="Check in"
              placeholder="ADD DATES"
              value={checkIn}
              name="departureDate"
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setCheckIn(e.target.value)}
            />
            <DateField
              label="Check out"
              placeholder="ADD DATES"
              value={checkOut}
              name="returnDate"
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setCheckOut(e.target.value)}
            />

            <div
              className={`${styles.fromBtn} ${styles.fromBtn2}`}
              onClick={(e) => {
                e.stopPropagation();
                setTravellerOpen((o) => !o);
              }}
            >
              <div className={styles.lable}>ROOMS & GUESTS</div>
              <div className={styles.iconCont}>
                <div className={styles.contant}>
                  {truncate(`${totalPassengers} Guest${totalPassengers > 1 ? 's' : ''}, ${totalPassengers} Room${totalPassengers > 1 ? 's' : ''}`, 17)}
                </div>

                <ChevronDown
                  className={`${styles.chevron} ${travellerOpen ? styles.openChevron : styles.closeChevron}`}
                  size={20}
                  color="#000000"
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

            <button className={styles.searchBtna}>SEARCH</button>
          </div>
        </div>
      )}

      {bookingType === "holiday" && (
        <div className={styles.flightSectionMain}>
          <button type="button" className={styles.swapBtn}>
            <img src="/icons/leftRrighArrow.svg" alt="swap" />
          </button>
          <div className={styles.flightSearchCard}>
            <div className={styles.field}>
              <label className={styles.label}>From CITY</label>
              <input type="text" placeholder="Departure" className={styles.input} value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>To CITY/COUNTRY,CATEGORY</label>
              <input type="text" placeholder="Destination" className={styles.input} value={to} onChange={(e) => setTo(e.target.value)} />
            </div>

            <DateField
              label="DEPARTURE DATE"
              placeholder="ADD DATES"
              value={departureDate}
              name="departureDate"
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDepartureDate(e.target.value)}
            />

            <div
              className={`${styles.fromBtn} ${styles.fromBtn2}`}
              onClick={(e) => {
                e.stopPropagation();
                setTravellerOpen((o) => !o);
              }}
            >
              <div className={styles.lable}>ROOMS & GUESTS</div>
              <div className={styles.iconCont}>
                <div className={styles.contant}>
                  {truncate(`${totalPassengers} Room${totalPassengers > 1 ? 's' : ''}, ${totalPassengers} Guest${totalPassengers > 1 ? 's' : ''}`, 17)}
                </div>

                <ChevronDown
                  className={`${styles.chevron} ${travellerOpen ? styles.openChevron : styles.closeChevron}`}
                  size={20}
                  color="#000000"
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

            <button className={styles.searchBtna}>SEARCH</button>
          </div>
        </div>
      )}

      {bookingType === "insurance" && (
        <div className={styles.flightSectionMain}>
          <div className={styles.flightSearchCard}>
            <TravellerSelector
              travellerClass={travellerDestination}
              setTravellerClass={setTravellerDestination}
              travellerOptions={TravellerDestinationOptions}
              styles={styles}
              name="TRAVEL DESTINATION"
              enableEllipsis={false}
            />

            <DateField
              label="TRAVEL DATE"
              placeholder="ADD DATES"
              value={departureDate}
              name="TRAVELDATE"
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDepartureDate(e.target.value)}
            />

            <DateField
              label="TRAVEL DATE"
              placeholder="ADD DATES"
              value={returnDate}
              name="TRAVELDATE"
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setReturenDate(e.target.value)}
            />

            <div
              className={`${styles.fromBtn} ${styles.fromBtn2}`}
              onClick={(e) => {
                e.stopPropagation();
                setTravellerOpen((o) => !o);
              }}
            >
              <div className={styles.lable}>TRAVELLERS</div>
              <div className={styles.iconCont}>
                <div className={styles.contant}>
                  {truncate(`${totalPassengers} Traveller${totalPassengers > 1 ? 's' : ''}, ${travelClass}`, 17)}
                </div>

                <ChevronDown
                  className={`${styles.chevron} ${travellerOpen ? styles.openChevron : styles.closeChevron}`}
                  size={20}
                  color="#000000"
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

            <button className={styles.searchBtna}>SEARCH</button>
          </div>
        </div>
      )}
    </section>
  )
}

export default HomePage

"use client";
import styles from './HomePage.module.css'
import Switch from '../Switch'
import { useState, useRef, useEffect } from 'react'
import TravellerSelector from './TravellerSelector';
import Navbar from '../../../flights/Navbar';
import Link from 'next/link';
import DateField from './DateField';
import { ArrowLeftRight } from 'lucide-react';

const HomePage = () => {
  const [directOnly, setDirectOnly] = useState(true)
  const [tripType, setTripType] = useState("round"); // NEW
  const [bookingType, setBookingType] = useState("flight")
  const [menuOpen, setMenuOpen] = useState(false);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturenDate] = useState("")
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("")



  // refs for the date inputs
  const departureRef = useRef(null)
  const returnRef = useRef(null)

  const [activeFeature, setActiveFeature] = useState(1); // default: 1 = Flights
  const featureRowRef = useRef(null);
  const progressRef = useRef(null);

  const [travellerDestination, setTravellerDestination] = useState("SELECT DESTINATION")
  const [travellerCount, setTravellerCount] = useState("1 TRAVELLER")
  const [guestRoomCount, setGuestRoomCount] = useState("SELECT ROOMS")
  const [hotelGuestRoomCount, setHotelGuestRoomCount] = useState("GUESTS & ROOMS")

  // state for travellers dropdown
  const [travellerClass, setTravellerClass] = useState("1_traveller_econ");
  const [travellerOpen, setTravellerOpen] = useState(false);
  const travellerRef = useRef(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [multiCity, setMultiCity] = useState([
    { from: "", to: "" },
    { from: "", to: "" },
  ]);


  // Direction for main tab (hotel/flight/holiday/insurance) animation
  const [direction, setDirection] = useState("right");

  // Direction for flight trip-type animation (round / oneway / multi)
  const [flightDirection, setFlightDirection] = useState("right");

  const swapLocations = (index) => {
    // If index is provided and we're in multi-city, swap that leg's from/to
    if (typeof index === 'number' && tripType === 'multi') {
      setMultiCity(prev => prev.map((leg, i) => i === index ? { ...leg, from: leg.to || '', to: leg.from || '' } : leg));
      return;
    }

    // default behavior for round/oneway
    setFrom(to);
    setTo(from);
  };

  // Multi-city handlers
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
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') setTravellerOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const truncate = (str) => {
    return str.length > 10 ? str.slice(0, 10) + "..." : str;
  };


  // options list (you can change labels/values)
  const travellerOptions = [
    { value: "1_traveller_econ", label: "1 Traveller, Economy" },
    { value: "2_traveller_econ", label: "2 Travellers, Economy" },
    { value: "3_traveller_business", label: "3 Traveller, Business" },
  ];

  const TravellerDestinationOptions = [
    {
      value: "india", label: "india"
    },
    {
      value: "chennai", label: "Chennai"
    },

  ]

  // inside HomePage component, replace your existing features with this:
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
    // set the active circular button
    setActiveFeature(feature.id);

    // determine direction based on previous and next tab positions
    const prevIndex = tabOrder.indexOf(bookingType);
    const nextIndex = tabOrder.indexOf(feature.type);
    if (prevIndex < nextIndex) {
      setDirection("right");
    } else if (prevIndex > nextIndex) {
      setDirection("left");
    }

    // switch which search UI is shown
    // `type` is "flight" | "hotel" | "holiday" | "insurance" (you can adapt)
    setBookingType(feature.type);

    // optional: scroll the search section into view (smooth)
    const searchEl = document.querySelector(`.${styles.serarchingCont}`);
    if (searchEl) {
      // searchEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // optional: focus first input inside the search area
      const firstInput = searchEl.querySelector('input[type="text"], input[type="date"]');
      if (firstInput) firstInput.focus();
    }
  }

  // update progress indicator position/width to match active feature button
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
      // apply inline styles to progressActive for pixel-perfect alignment
      if (activeEl) {
        activeEl.style.left = `${left}px`;
        activeEl.style.width = `${width}px`;
      }
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [activeFeature, features]);



  // handlers to open the native date picker (if supported)
  const openDeparturePicker = () => {
    const input = departureRef.current
    if (!input) return
    // preferred: showPicker if available
    if (typeof input.showPicker === 'function') {
      input.showPicker()
    } else {
      // fallback: focus then click (some browsers will open)
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

    // Check if it's a date input
    if (input.type === "date" && typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      // For text inputs, just focus
      input.focus();
    }
  };

  return (
    <section className='relative w-full h-[100vh]'>

      <div className={`${styles.menuSection} ${menuOpen ? styles.menuOpen : styles.menuClose
        }`}>
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
              <li>
                <Link href="#">Home</Link>
              </li>
              <li>
                <Link href="#">Destinations</Link>
              </li>
              <li>
                <Link href="#">Tailor-Made Journeys</Link>
              </li>
              <li>
                <Link href="#">About Us</Link>
              </li>
              <li>
                <Link href="#">Flight Booking</Link>
              </li>
              <li>
                <Link href="#">Blogs</Link>
              </li>
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
                {/* Flight trip-type forms (round / oneway / multi) with smart-animate style transition */}
                <div className={styles.flightSearchFormContainer}>
                  {/* Unified form for all trip types (Row 1) */}
                  {(tripType === "round" || tripType === "oneway" || tripType === "multi") && (
                    <div
                      key="row1"
                      className={`${styles.serarchingContBottom} ${styles.formVisible}`}
                    >
                      <div className={`${styles.arrowbox} ${tripType === "oneway" ? styles.arrowboxOneWay : tripType === "multi" ? styles.multiArrow : ""}`} onClick={() => swapLocations(tripType === 'multi' ? 0 : undefined)}>
                        {/* <img src="/icons/leftRrighArrow.svg" alt="" /> */}
                        <ArrowLeftRight size={16}  className={styles.arrowIcon} />
                      </div>
                      <div
                        className={`${styles.fromBtn} ${styles.fromInput}`}
                        onClick={handleFieldClick}
                      >
                        <div className={styles.lable}>From</div>
                        <input
                          type="text"
                          className={styles.contant}
                          placeholder="Departure"
                          value={tripType === 'multi' ? (multiCity[0]?.from || '') : from}
                          onChange={(e) => tripType === 'multi' ? updateMultiLeg(0, 'from', e.target.value) : setFrom(e.target.value)}
                        />
                      </div>
                      <div className={`${styles.fromBtn} ${styles.fromInput} ${styles.toInput}`} onClick={handleFieldClick}>
                        <div className={styles.lable}>To</div>
                        <input
                          type="text"
                          className={styles.contant}
                          placeholder="Destination"
                          value={tripType === 'multi' ? (multiCity[0]?.to || '') : to}
                          onChange={(e) => tripType === 'multi' ? updateMultiLeg(0, 'to', e.target.value) : setTo(e.target.value)}
                        />
                      </div>

                      <div className={`${styles.fromBtn} ${styles.fromInput}`} onClick={handleFieldClick}>
                        <div className={styles.lable}>Departure Date</div>
                        <div className={styles.dateInputWrapper} onClick={openDeparturePicker}>
                          <input
                            ref={departureRef}
                            type="date"
                            className={styles.contant}
                            data-placeholder="ADD DATES"
                            value={tripType === 'multi' ? (multiCity[0]?.date || '') : undefined}
                            onChange={(e) => tripType === 'multi' ? updateMultiLeg(0, 'date', e.target.value) : undefined}
                            required
                          />
                          <button
                            type="button"
                            aria-label="Open departure date picker"
                            className={styles.calendarIcon}
                            onClick={openDeparturePicker}
                          >
                            <img src="/icons/calander.svg" alt="" />
                          </button>
                        </div>
                      </div>

                      {/* Return Date field with smooth transition - hidden in Multi-city and One-way */}
                      <div className={`${styles.fromBtn} ${styles.fromInput} ${styles.returnDateField} ${(tripType === "oneway" || tripType === "multi") ? styles.hiddenField : ""}`} onClick={handleFieldClick}>
                        <div className={styles.lable}>Return Date</div>
                        <div className={styles.dateInputWrapper} onClick={openReturnPicker}>
                          <input
                            ref={returnRef}
                            type="date"
                            className={styles.contant}
                            data-placeholder="ADD DATES"
                            required={tripType === "round"}
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

                      <TravellerSelector
                        travellerClass={travellerClass}
                        setTravellerClass={setTravellerClass}
                        travellerOptions={travellerOptions}
                        styles={styles}
                        name="Travellers & Class"
                        className={styles.fromInput}
                      />

                      <div className={`${styles.searchBtn} ${tripType === 'multi' ? styles.hiddenField : ""}`}>
                        <img src="/images/searchIcon.svg" alt="" />
                      </div>
                    </div>
                  )}

                  {/* Multi-city additional legs (Starting from Row 2) */}
                  {tripType === "multi" && (
                    <div className={styles.multiSearch}>
                      {multiCity.slice(1).map((leg, idx) => {
                        const actualIndex = idx + 1;
                        return (
                          <div key={actualIndex} className={styles.serarchingContBottom}>
                            <div className={`${styles.arrowboxOneWay} ${styles.arrowbox}  ${styles.multiArrow}`} onClick={() => swapLocations(actualIndex)}>
                              {/* <img src="/icons/leftRrighArrow.svg" alt="" /> */}
                              <ArrowLeftRight size={16}  className={styles.arrowIcon} />
                            </div>
                            <div className={`${styles.fromBtn} ${styles.travellerClass}`} onClick={handleFieldClick}>
                              <div className={styles.lable}>From</div>
                              <input type="text" className={styles.contant} placeholder='Departure' value={leg.from || ''} onChange={(e) => updateMultiLeg(actualIndex, 'from', e.target.value)} />
                            </div>
                            <div className={`${styles.fromBtn} ${styles.travellerClass} ${styles.toInput}`} onClick={handleFieldClick}>
                              <div className={styles.lable}>To</div>
                              <input type="text" className={styles.contant} placeholder='Destination' value={leg.to || ''} onChange={(e) => updateMultiLeg(actualIndex, 'to', e.target.value)} />
                            </div>

                            <div className={`${styles.fromBtn} ${styles.travellerClass}`} onClick={handleFieldClick}>
                              <div className={styles.lable}>Departure Date</div>
                              <div className={styles.dateInputWrapper} onClick={openReturnPicker}>
                                <input
                                  ref={actualIndex === 1 ? returnRef : null}
                                  type="date"
                                  className={styles.contant}
                                  data-placeholder="ADD DATES"
                                  value={leg.date || ''}
                                  onChange={(e) => updateMultiLeg(actualIndex, 'date', e.target.value)}
                                  required
                                />
                                <button
                                  type="button"
                                  aria-label="Open departure date picker"
                                  className={styles.calendarIcon}
                                  onClick={openReturnPicker}
                                >
                                  <img src="/icons/calander.svg" alt="" />
                                </button>
                              </div>
                            </div>

                            {/* Show search button only on the last row of multi-city */}
                            {actualIndex === multiCity.length - 1 ? (
                              <div className={styles.multisearchBtn}>
                                Search
                              </div>
                            ) : (
                              /* Placeholder to keep alignment if search button is missing */
                              <div className={`${styles.multisearchBtn} opacity-0 pointer-events-none`}>
                                Search
                              </div>
                            )}

                            {/* Add a remove button if needed (optional based on original UI, but good for UX) */}
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

                      {/* Add leg button */}
                      {/* <div className="flex justify-start">
                        <button
                          className="text-[#fcc800] text-xs font-medium uppercase tracking-wider hover:underline"
                          onClick={addMultiLeg}
                        >
                          + Add City
                        </button>
                      </div> */}
                    </div>
                  )}
                </div>

              </div>
            )}


            {((bookingType === "hotel") || bookingType === "holiday" || bookingType === "insurance") && (
              <div className={`${styles.serarchingCont} ${styles.glass_panel} ${styles.searchFormContainer}`}>
                <div className={`${styles.serarchingContBottom} ${bookingType === 'holiday' ? styles.swapActive : ''}`}>

                  {/* Slot 1: Location 1 (Always at Pos 1) */}
                  {/* Slot 1: Location 1 (Always at Pos 1) */}
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
                        type="text"
                        className={`${styles.contant} ${styles.contentFade}`}
                        placeholder="Departure"
                        value={bookingType === "hotel" ? (to || "") : (from || "")}
                        onChange={(e) => bookingType === "hotel" ? setTo(e.target.value) : setFrom(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Slot 2: Hotel: Check In | Holiday: Departure Date | Insurance: Travel Date */}
                  <div className={`${styles.fromBtn} ${styles.pos2} ${styles.swapField}`} onClick={handleFieldClick}>
                    <div className={`${styles.lable} ${styles.labelFade}`}>
                      {bookingType === "hotel" ? "Check In" : "Departure Date"}
                    </div>
                    <div className={`${styles.dateInputWrapper} ${styles.contentFade}`} onClick={openDeparturePicker}>
                      <input
                        ref={departureRef}
                        type="date"
                        className={styles.contant}
                        data-placeholder="ADD DATES"
                        value={bookingType === "hotel" ? checkIn : departureDate}
                        onChange={(e) => bookingType === "hotel" ? setCheckIn(e.target.value) : setDepartureDate(e.target.value)}
                        required
                      />
                      <button type="button" className={styles.calendarIcon} onClick={openDeparturePicker}>
                        <img src="/icons/calander.svg" alt="" />
                      </button>
                    </div>
                  </div>

                  {/* Slot 3: Hotel: Check Out | Holiday: To City | Insurance: Departure Date */}
                  <div className={`${styles.fromBtn} ${styles.pos3} ${styles.swapField}`} onClick={handleFieldClick}>
                    <div className={`${styles.lable} ${styles.labelFade}`}>
                      {bookingType === "hotel" ? "Check Out" :
                        bookingType === "holiday" ? "To CITY/COUNTRY, CATEGORY" :
                          "Departure Date"}
                    </div>
                    {bookingType === "holiday" ? (
                      <input
                        type="text"
                        className={`${styles.contant} ${styles.contentFade}`}
                        placeholder="Destination"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                      />
                    ) : (
                      <div className={`${styles.dateInputWrapper} ${styles.contentFade}`} onClick={openReturnPicker}>
                        <input
                          ref={returnRef}
                          type="date"
                          className={styles.contant}
                          data-placeholder="ADD DATES"
                          value={bookingType === "hotel" ? checkOut : returnDate}
                          onChange={(e) => bookingType === "hotel" ? setCheckOut(e.target.value) : setReturenDate(e.target.value)}
                          required
                        />
                        <button type="button" className={styles.calendarIcon} onClick={openReturnPicker}>
                          <img src="/icons/calander.svg" alt="" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Slot 4: Guests & Rooms */}
                  <TravellerSelector
                    travellerClass={bookingType === "hotel" ? hotelGuestRoomCount : bookingType === "holiday" ? guestRoomCount : travellerCount}
                    setTravellerClass={bookingType === "hotel" ? setHotelGuestRoomCount : bookingType === "holiday" ? setGuestRoomCount : setTravellerCount}
                    travellerOptions={travellerOptions}
                    styles={styles}
                    name={bookingType === "hotel" ? "GUESTS & ROOMS" : bookingType === "holiday" ? "ROOMS & GUESTS" : "TRAVELLERS"}
                    className={`${styles.pos4}`}
                  />

                  {/* Search Button */}
                  <div className={`${styles.searchBtn} ${styles.pos5}`}>
                    <img src="/images/searchIcon.svg" alt="" />
                  </div>
                </div>
              </div>
            )}
          </div>



          {/* ---------- feature strip (replace your previous block) ---------- */}

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
      {bookingType === "flight" && (
        <div className={styles.flightSectionMain}>
          <button type="button" className={styles.swapBtn} onClick={swapLocations}>
            <img src="/icons/leftRrighArrow.svg" alt="swap" />
          </button>
          <div className={styles.flightSearchCard}>

            {/* FROM */}
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

            {/* SWAP */}


            {/* TO */}
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
            {/* RETURN DATE */}
            <DateField
              label="RETURN DATE"
              placeholder="ADD DATES"
              value={returnDate}
              name="departureDate"
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setReturenDate(e.target.value)}
            />

            {/* TRAVELLERS */}
            <TravellerSelector
              travellerClass={travellerClass}
              setTravellerClass={setTravellerClass}
              travellerOptions={travellerOptions}
              styles={styles}
              name="Travellers & Class"
            />

            {/* SEARCH */}
            <button className={styles.searchBtna}>
              SEARCH
            </button>

          </div>
        </div>
      )}

      {bookingType === "hotel" && (
        <div className={styles.flightSectionMain}>
          {/* <button type="button" className={styles.swapBtn}>
            <img src="/icons/leftRrighArrow.svg" alt="swap" />
          </button> */}
          <div className={styles.flightSearchCard}>

            {/* FROM */}
            <div className={styles.field}>
              <label className={styles.label}>Where to</label>
              <input
                type="text"
                placeholder="Departure"
                className={styles.input}
              />
            </div>

            <DateField
              label="Check in"
              placeholder="ADD DATES"
              value={checkIn}
              name="departureDate"
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setCheckIn(e.target.value)}
            />
            {/* RETURN DATE */}
            <DateField
              label="Check out"
              placeholder="ADD DATES"
              value={checkOut}
              name="returnDate"
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setCheckOut(e.target.value)}
            />

            {/* TRAVELLERS */}
            <TravellerSelector
              travellerClass={travellerClass}
              setTravellerClass={setTravellerClass}
              travellerOptions={travellerOptions}
              styles={styles}
              name="One adult | one room"
            />

            {/* SEARCH */}
            <button className={styles.searchBtna}>
              SEARCH
            </button>

          </div>
        </div>
      )}

      {bookingType === "holiday" && (
        <div className={styles.flightSectionMain}>
          <button type="button" className={styles.swapBtn}>
            <img src="/icons/leftRrighArrow.svg" alt="swap" />
          </button>
          <div className={styles.flightSearchCard}>

            {/* FROM */}
            <div className={styles.field}>
              <label className={styles.label}>From CITY</label>
              <input
                type="text"
                placeholder="Departure"
                className={styles.input}

              />
            </div>

            {/* SWAP */}


            {/* TO */}
            <div className={styles.field}>
              <label className={styles.label}>To CITY/COUNTRY,CATEGORY</label>
              <input
                type="text"
                placeholder="Destination"
                className={styles.input}
              />
            </div>

            {/* DEPARTURE DATE */}
            <DateField
              label="DEPARTURE DATE"
              placeholder="ADD DATES"
              value={departureDate}
              name="departureDate"
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDepartureDate(e.target.value)}
            />

            <TravellerSelector
              travellerClass={guestRoomCount}
              setTravellerClass={setGuestRoomCount}
              travellerOptions={travellerOptions}
              styles={styles}
              name="ROOMS & GUESTS"
              enableEllipsis={false}
            />

            {/* SEARCH */}
            <button className={styles.searchBtna}>
              SEARCH
            </button>

          </div>
        </div>
      )}

      {bookingType === "insurance" && (
        <div className={styles.flightSectionMain}>
          <div className={styles.flightSearchCard}>

            {/* FROM */}
            {/* <div className={styles.field}>
              <label className={styles.label}>TRAVEL DESTINATION</label>
              <input
                type="text"
                placeholder="SELECT DESTINATION"
                readOnly
                className={styles.input}
              />
            </div> */}
            <TravellerSelector
              travellerClass={travellerDestination}
              setTravellerClass={setTravellerDestination}
              travellerOptions={TravellerDestinationOptions}
              styles={styles}
              name="TRAVEL DESTINATION"
              enableEllipsis={false}
            />
            {/* SWAP */}


            <DateField
              label="TRAVEL DATE"
              placeholder="ADD DATES"
              value={departureDate}
              name="TRAVELDATE"
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDepartureDate(e.target.value)}
            />

            {/* RETURN DATE */}
            <DateField
              label="TRAVEL DATE"
              placeholder="ADD DATES"
              value={returnDate}
              name="TRAVELDATE"
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setReturenDate(e.target.value)}
            />

            {/* TRAVELLERS */}
            <TravellerSelector
              travellerClass={travellerCount}
              setTravellerClass={setTravellerCount}
              travellerOptions={travellerOptions}
              styles={styles}
              name="TRAVELLERS"
            />



            {/* SEARCH */}
            <button className={styles.searchBtna}>
              SEARCH
            </button>

          </div>
        </div>
      )}



    </section>
  )
}

export default HomePage


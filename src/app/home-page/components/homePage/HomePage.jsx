"use client";
import styles from './HomePage.module.css'
import Switch from '../Switch'
import { useState, useRef, useEffect } from 'react'
import TravellerSelector from './TravellerSelector';
import Navbar from '../../../flights/Navbar';

const HomePage = () => {
  const [directOnly, setDirectOnly] = useState(true)
  const [tripType, setTripType] = useState("round"); // NEW
  const [bookingType, setBookingType] = useState("flight")



  // refs for the date inputs
  const departureRef = useRef(null)
  const returnRef = useRef(null)

  const [activeFeature, setActiveFeature] = useState(1); // default: 1 = Flights

  // state for travellers dropdown
  const [travellerClass, setTravellerClass] = useState("1_traveller_econ");
  const [travellerOpen, setTravellerOpen] = useState(false);
  const travellerRef = useRef(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  

  // Direction for main tab (hotel/flight/holiday/insurance) animation
  const [direction, setDirection] = useState("right");

  // Direction for flight trip-type animation (round / oneway / multi)
  const [flightDirection, setFlightDirection] = useState("right");

  const swapLocations = () => {
    setFrom(to);
    setTo(from);
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

  const TravellerDestination = [
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

  return (
    <section className='relative w-full h-[100vh]'>
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
            <button className={styles.hamBurger}>
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
                  {/* Round-trip form (render only when round-trip is active) */}
                  {tripType === "round" && (
                    <div
                      className={`${styles.serarchingContBottom} ${styles.flightSearchFormWrapper} ${styles.formVisible
                        } ${flightDirection === "right" ? styles.slideRight : styles.slideLeft}`}
                    >
                      <div className={styles.arrowbox} onClick={swapLocations}>
                        <img src="/icons/leftRrighArrow.svg" alt="" />
                      </div>
                      <div className={styles.fromBtn}>
                        <div className={styles.lable}>From</div>
                        <input
                          type="text"
                          className={styles.contant}
                          placeholder="Departure"
                          value={from}
                          onChange={(e) => setFrom(e.target.value)}
                        />
                      </div>
                      <div className={styles.fromBtn}>
                        <div className={styles.lable}>To</div>
                        <input
                          type="text"
                          className={styles.contant}
                          placeholder="Destination"
                          value={to}
                          onChange={(e) => setTo(e.target.value)}
                        />
                      </div>

                      <div className={styles.fromBtn}>
                        <div className={styles.lable}>Departure Date</div>
                        <div className={styles.dateInputWrapper} onClick={openDeparturePicker}>
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
                            <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.3902 3.343C12.3112 2.02925 11.2142 1 9.89291 1H9.24966V0.5C9.24966 0.224 9.02566 0 8.74966 0C8.47366 0 8.24966 0.224 8.24966 0.5V1H4.24966V0.5C4.24966 0.224 4.02566 0 3.74966 0C3.47366 0 3.24966 0.224 3.24966 0.5V1H2.60641C1.28491 1 0.187913 2.02925 0.109163 3.343C-0.0390874 5.814 -0.0363374 8.3205 0.117413 10.7928C0.195413 12.0483 1.20116 13.054 2.45666 13.132C3.71491 13.2102 4.98216 13.2493 6.24941 13.2493C7.51641 13.2493 8.78391 13.2102 10.0422 13.132C11.2977 13.054 12.3034 12.0483 12.3814 10.7928C12.5354 8.32175 12.5382 5.8155 12.3902 3.343ZM11.3837 10.7308C11.3367 11.484 10.7334 12.0872 9.98041 12.134C7.50491 12.2878 4.99441 12.2878 2.51891 12.134C1.76566 12.087 1.16241 11.4838 1.11566 10.7308C0.997412 8.83 0.973163 6.90925 1.03641 5H11.4632C11.5262 6.91 11.5019 8.83075 11.3837 10.7308ZM3.74966 3C4.02566 3 4.24966 2.776 4.24966 2.5V2H8.24966V2.5C8.24966 2.776 8.47366 3 8.74966 3C9.02566 3 9.24966 2.776 9.24966 2.5V2H9.89291C10.6862 2 11.3447 2.61625 11.3919 3.40275C11.4037 3.60125 11.4087 3.801 11.4184 4H1.08091C1.09091 3.801 1.09566 3.60125 1.10741 3.40275C1.15466 2.61625 1.81291 2 2.60641 2H3.24966V2.5C3.24966 2.776 3.47366 3 3.74966 3Z" fill="white" />
                              <path d="M3.74951 8C4.16373 8 4.49951 7.66421 4.49951 7.25C4.49951 6.83579 4.16373 6.5 3.74951 6.5C3.3353 6.5 2.99951 6.83579 2.99951 7.25C2.99951 7.66421 3.3353 8 3.74951 8Z" fill="white" />
                              <path d="M6.24951 8C6.66373 8 6.99951 7.66421 6.99951 7.25C6.99951 6.83579 6.66373 6.5 6.24951 6.5C5.8353 6.5 5.49951 6.83579 5.49951 7.25C5.49951 7.66421 5.8353 8 6.24951 8Z" fill="white" />
                              <path d="M3.74951 10.5C4.16373 10.5 4.49951 10.1642 4.49951 9.75C4.49951 9.33579 4.16373 9 3.74951 9C3.3353 9 2.99951 9.33579 2.99951 9.75C2.99951 10.1642 3.3353 10.5 3.74951 10.5Z" fill="white" />
                              <path d="M8.74951 8C9.16373 8 9.49951 7.66421 9.49951 7.25C9.49951 6.83579 9.16373 6.5 8.74951 6.5C8.3353 6.5 7.99951 6.83579 7.99951 7.25C7.99951 7.66421 8.3353 8 8.74951 8Z" fill="white" />
                              <path d="M8.74951 10.5C9.16373 10.5 9.49951 10.1642 9.49951 9.75C9.49951 9.33579 9.16373 9 8.74951 9C8.3353 9 7.99951 9.33579 7.99951 9.75C7.99951 10.1642 8.3353 10.5 8.74951 10.5Z" fill="white" />
                              <path d="M6.24951 10.5C6.66373 10.5 6.99951 10.1642 6.99951 9.75C6.99951 9.33579 6.66373 9 6.24951 9C5.8353 9 5.49951 9.33579 5.49951 9.75C5.49951 10.1642 5.8353 10.5 6.24951 10.5Z" fill="white" />
                            </svg>

                          </button>
                        </div>
                      </div>
                      <div className={styles.fromBtn}>
                        <div className={styles.lable}>Return Date</div>
                        <div className={styles.dateInputWrapper} onClick={openReturnPicker}>
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
                            <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.3902 3.343C12.3112 2.02925 11.2142 1 9.89291 1H9.24966V0.5C9.24966 0.224 9.02566 0 8.74966 0C8.47366 0 8.24966 0.224 8.24966 0.5V1H4.24966V0.5C4.24966 0.224 4.02566 0 3.74966 0C3.47366 0 3.24966 0.224 3.24966 0.5V1H2.60641C1.28491 1 0.187913 2.02925 0.109163 3.343C-0.0390874 5.814 -0.0363374 8.3205 0.117413 10.7928C0.195413 12.0483 1.20116 13.054 2.45666 13.132C3.71491 13.2102 4.98216 13.2493 6.24941 13.2493C7.51641 13.2493 8.78391 13.2102 10.0422 13.132C11.2977 13.054 12.3034 12.0483 12.3814 10.7928C12.5354 8.32175 12.5382 5.8155 12.3902 3.343ZM11.3837 10.7308C11.3367 11.484 10.7334 12.0872 9.98041 12.134C7.50491 12.2878 4.99441 12.2878 2.51891 12.134C1.76566 12.087 1.16241 11.4838 1.11566 10.7308C0.997412 8.83 0.973163 6.90925 1.03641 5H11.4632C11.5262 6.91 11.5019 8.83075 11.3837 10.7308ZM3.74966 3C4.02566 3 4.24966 2.776 4.24966 2.5V2H8.24966V2.5C8.24966 2.776 8.47366 3 8.74966 3C9.02566 3 9.24966 2.776 9.24966 2.5V2H9.89291C10.6862 2 11.3447 2.61625 11.3919 3.40275C11.4037 3.60125 11.4087 3.801 11.4184 4H1.08091C1.09091 3.801 1.09566 3.60125 1.10741 3.40275C1.15466 2.61625 1.81291 2 2.60641 2H3.24966V2.5C3.24966 2.776 3.47366 3 3.74966 3Z" fill="white" />
                              <path d="M3.74951 8C4.16373 8 4.49951 7.66421 4.49951 7.25C4.49951 6.83579 4.16373 6.5 3.74951 6.5C3.3353 6.5 2.99951 6.83579 2.99951 7.25C2.99951 7.66421 3.3353 8 3.74951 8Z" fill="white" />
                              <path d="M6.24951 8C6.66373 8 6.99951 7.66421 6.99951 7.25C6.99951 6.83579 6.66373 6.5 6.24951 6.5C5.8353 6.5 5.49951 6.83579 5.49951 7.25C5.49951 7.66421 5.8353 8 6.24951 8Z" fill="white" />
                              <path d="M3.74951 10.5C4.16373 10.5 4.49951 10.1642 4.49951 9.75C4.49951 9.33579 4.16373 9 3.74951 9C3.3353 9 2.99951 9.33579 2.99951 9.75C2.99951 10.1642 3.3353 10.5 3.74951 10.5Z" fill="white" />
                              <path d="M8.74951 8C9.16373 8 9.49951 7.66421 9.49951 7.25C9.49951 6.83579 9.16373 6.5 8.74951 6.5C8.3353 6.5 7.99951 6.83579 7.99951 7.25C7.99951 7.66421 8.3353 8 8.74951 8Z" fill="white" />
                              <path d="M8.74951 10.5C9.16373 10.5 9.49951 10.1642 9.49951 9.75C9.49951 9.33579 9.16373 9 8.74951 9C8.3353 9 7.99951 9.33579 7.99951 9.75C7.99951 10.1642 8.3353 10.5 8.74951 10.5Z" fill="white" />
                              <path d="M6.24951 10.5C6.66373 10.5 6.99951 10.1642 6.99951 9.75C6.99951 9.33579 6.66373 9 6.24951 9C5.8353 9 5.49951 9.33579 5.49951 9.75C5.49951 10.1642 5.8353 10.5 6.24951 10.5Z" fill="white" />
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
                      <TravellerSelector
                        travellerClass={travellerClass}
                        setTravellerClass={setTravellerClass}
                        travellerOptions={travellerOptions}
                        styles={styles}
                        name="Travellers & Class"
                      />



                      <div className={styles.searchBtn}>
                        <img src="/images/searchIcon.svg" alt="" />
                      </div>
                    </div>
                  )}

                  {/* One-way form */}
                  {tripType === "oneway" && (
                    <div
                      className={`${styles.serarchingContBottom} ${styles.flightSearchFormWrapper} ${styles.formVisible
                        } ${flightDirection === "right" ? styles.slideRight : styles.slideLeft}`}
                    >
                      <div className={styles.arrowboxOneWay} onClick={swapLocations}>
                        <img src="/icons/leftRrighArrow.svg" alt="" />
                      </div>
                      <div className={`${styles.fromBtn} ${tripType === 'oneway' ? styles.growRight : ''}`}>
                        <div className={styles.lable}>From</div>
                        <input
                          type="text"
                          className={styles.contant}
                          placeholder="Departure"
                          value={from}
                          onChange={(e) => setFrom(e.target.value)}
                        />
                      </div>
                      <div className={`${styles.fromBtn} ${tripType === 'oneway' ? styles.growRight : ''}`}>
                        <div className={styles.lable}>To</div>
                        <input
                          type="text"
                          className={styles.contant}
                          placeholder="Destination"
                          value={to}
                          onChange={(e) => setTo(e.target.value)}
                        />
                      </div>

                      <div className={`${styles.fromBtn} ${tripType === 'oneway' ? styles.growRight : ''}`}>
                        <div className={styles.lable}>Departure Date</div>
                        <div className={styles.dateInputWrapper} onClick={openDeparturePicker}>
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
                            <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.3902 3.343C12.3112 2.02925 11.2142 1 9.89291 1H9.24966V0.5C9.24966 0.224 9.02566 0 8.74966 0C8.47366 0 8.24966 0.224 8.24966 0.5V1H4.24966V0.5C4.24966 0.224 4.02566 0 3.74966 0C3.47366 0 3.24966 0.224 3.24966 0.5V1H2.60641C1.28491 1 0.187913 2.02925 0.109163 3.343C-0.0390874 5.814 -0.0363374 8.3205 0.117413 10.7928C0.195413 12.0483 1.20116 13.054 2.45666 13.132C3.71491 13.2102 4.98216 13.2493 6.24941 13.2493C7.51641 13.2493 8.78391 13.2102 10.0422 13.132C11.2977 13.054 12.3034 12.0483 12.3814 10.7928C12.5354 8.32175 12.5382 5.8155 12.3902 3.343ZM11.3837 10.7308C11.3367 11.484 10.7334 12.0872 9.98041 12.134C7.50491 12.2878 4.99441 12.2878 2.51891 12.134C1.76566 12.087 1.16241 11.4838 1.11566 10.7308C0.997412 8.83 0.973163 6.90925 1.03641 5H11.4632C11.5262 6.91 11.5019 8.83075 11.3837 10.7308ZM3.74966 3C4.02566 3 4.24966 2.776 4.24966 2.5V2H8.24966V2.5C8.24966 2.776 8.47366 3 8.74966 3C9.02566 3 9.24966 2.776 9.24966 2.5V2H9.89291C10.6862 2 11.3447 2.61625 11.3919 3.40275C11.4037 3.60125 11.4087 3.801 11.4184 4H1.08091C1.09091 3.801 1.09566 3.60125 1.10741 3.40275C1.15466 2.61625 1.81291 2 2.60641 2H3.24966V2.5C3.24966 2.776 3.47366 3 3.74966 3Z" fill="white" />
                              <path d="M3.74951 8C4.16373 8 4.49951 7.66421 4.49951 7.25C4.49951 6.83579 4.16373 6.5 3.74951 6.5C3.3353 6.5 2.99951 6.83579 2.99951 7.25C2.99951 7.66421 3.3353 8 3.74951 8Z" fill="white" />
                              <path d="M6.24951 8C6.66373 8 6.99951 7.66421 6.99951 7.25C6.99951 6.83579 6.66373 6.5 6.24951 6.5C5.8353 6.5 5.49951 6.83579 5.49951 7.25C5.49951 7.66421 5.8353 8 6.24951 8Z" fill="white" />
                              <path d="M3.74951 10.5C4.16373 10.5 4.49951 10.1642 4.49951 9.75C4.49951 9.33579 4.16373 9 3.74951 9C3.3353 9 2.99951 9.33579 2.99951 9.75C2.99951 10.1642 3.3353 10.5 3.74951 10.5Z" fill="white" />
                              <path d="M8.74951 8C9.16373 8 9.49951 7.66421 9.49951 7.25C9.49951 6.83579 9.16373 6.5 8.74951 6.5C8.3353 6.5 7.99951 6.83579 7.99951 7.25C7.99951 7.66421 8.3353 8 8.74951 8Z" fill="white" />
                              <path d="M8.74951 10.5C9.16373 10.5 9.49951 10.1642 9.49951 9.75C9.49951 9.33579 9.16373 9 8.74951 9C8.3353 9 7.99951 9.33579 7.99951 9.75C7.99951 10.1642 8.3353 10.5 8.74951 10.5Z" fill="white" />
                              <path d="M6.24951 10.5C6.66373 10.5 6.99951 10.1642 6.99951 9.75C6.99951 9.33579 6.66373 9 6.24951 9C5.8353 9 5.49951 9.33579 5.49951 9.75C5.49951 10.1642 5.8353 10.5 6.24951 10.5Z" fill="white" />
                            </svg>

                          </button>
                        </div>
                      </div>
                      <TravellerSelector
                        travellerClass={travellerClass}
                        setTravellerClass={setTravellerClass}
                        travellerOptions={travellerOptions}
                        styles={styles}
                        name="Travellers & Class"
                      />
                      <div className={styles.searchBtn}>
                        <img src="/images/searchIcon.svg" alt="" />
                      </div>
                    </div>
                  )}

                  {/* Multi-city form */}
                  {tripType === "multi" && (
                    <div
                      className={`${styles.serarchingContBottom} ${styles.multiSearch} ${styles.flightSearchFormWrapper} ${styles.formVisible
                        } ${flightDirection === "right" ? styles.slideRight : styles.slideLeft}`}
                    >
                      <div className={styles.serarchingContBottom}>
                        <div className={`${styles.arrowboxOneWay} ${styles.multiArrow}`} onClick={swapLocations}>
                          <img src="/icons/leftRrighArrow.svg" alt="" />
                        </div>
                        <div className={`${styles.fromBtn} ${tripType === 'multi' ? styles.growRight : ''}`}>
                          <div className={styles.lable}>From</div>
                          <input type="text" className={styles.contant} placeholder='Departure ' value={from}
                            onChange={(e) => setFrom(e.target.value)} />
                        </div>
                        <div className={`${styles.fromBtn} ${tripType === 'multi' ? styles.growRight : ''}`}>
                          <div className={styles.lable}>To</div>
                          <input type="text" className={styles.contant} placeholder='Destination' value={to}
                            onChange={(e) => setFrom(e.target.value)} />
                        </div>

                        <div className={`${styles.fromBtn} ${tripType === 'multi' ? styles.growRight : ''}`}>
                          <div className={styles.lable}>Departure Date</div>
                          <div className={styles.dateInputWrapper} onClick={openDeparturePicker}>
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
                              <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.3902 3.343C12.3112 2.02925 11.2142 1 9.89291 1H9.24966V0.5C9.24966 0.224 9.02566 0 8.74966 0C8.47366 0 8.24966 0.224 8.24966 0.5V1H4.24966V0.5C4.24966 0.224 4.02566 0 3.74966 0C3.47366 0 3.24966 0.224 3.24966 0.5V1H2.60641C1.28491 1 0.187913 2.02925 0.109163 3.343C-0.0390874 5.814 -0.0363374 8.3205 0.117413 10.7928C0.195413 12.0483 1.20116 13.054 2.45666 13.132C3.71491 13.2102 4.98216 13.2493 6.24941 13.2493C7.51641 13.2493 8.78391 13.2102 10.0422 13.132C11.2977 13.054 12.3034 12.0483 12.3814 10.7928C12.5354 8.32175 12.5382 5.8155 12.3902 3.343ZM11.3837 10.7308C11.3367 11.484 10.7334 12.0872 9.98041 12.134C7.50491 12.2878 4.99441 12.2878 2.51891 12.134C1.76566 12.087 1.16241 11.4838 1.11566 10.7308C0.997412 8.83 0.973163 6.90925 1.03641 5H11.4632C11.5262 6.91 11.5019 8.83075 11.3837 10.7308ZM3.74966 3C4.02566 3 4.24966 2.776 4.24966 2.5V2H8.24966V2.5C8.24966 2.776 8.47366 3 8.74966 3C9.02566 3 9.24966 2.776 9.24966 2.5V2H9.89291C10.6862 2 11.3447 2.61625 11.3919 3.40275C11.4037 3.60125 11.4087 3.801 11.4184 4H1.08091C1.09091 3.801 1.09566 3.60125 1.10741 3.40275C1.15466 2.61625 1.81291 2 2.60641 2H3.24966V2.5C3.24966 2.776 3.47366 3 3.74966 3Z" fill="white" />
                                <path d="M3.74951 8C4.16373 8 4.49951 7.66421 4.49951 7.25C4.49951 6.83579 4.16373 6.5 3.74951 6.5C3.3353 6.5 2.99951 6.83579 2.99951 7.25C2.99951 7.66421 3.3353 8 3.74951 8Z" fill="white" />
                                <path d="M6.24951 8C6.66373 8 6.99951 7.66421 6.99951 7.25C6.99951 6.83579 6.66373 6.5 6.24951 6.5C5.8353 6.5 5.49951 6.83579 5.49951 7.25C5.49951 7.66421 5.8353 8 6.24951 8Z" fill="white" />
                                <path d="M3.74951 10.5C4.16373 10.5 4.49951 10.1642 4.49951 9.75C4.49951 9.33579 4.16373 9 3.74951 9C3.3353 9 2.99951 9.33579 2.99951 9.75C2.99951 10.1642 3.3353 10.5 3.74951 10.5Z" fill="white" />
                                <path d="M8.74951 8C9.16373 8 9.49951 7.66421 9.49951 7.25C9.49951 6.83579 9.16373 6.5 8.74951 6.5C8.3353 6.5 7.99951 6.83579 7.99951 7.25C7.99951 7.66421 8.3353 8 8.74951 8Z" fill="white" />
                                <path d="M8.74951 10.5C9.16373 10.5 9.49951 10.1642 9.49951 9.75C9.49951 9.33579 9.16373 9 8.74951 9C8.3353 9 7.99951 9.33579 7.99951 9.75C7.99951 10.1642 8.3353 10.5 8.74951 10.5Z" fill="white" />
                                <path d="M6.24951 10.5C6.66373 10.5 6.99951 10.1642 6.99951 9.75C6.99951 9.33579 6.66373 9 6.24951 9C5.8353 9 5.49951 9.33579 5.49951 9.75C5.49951 10.1642 5.8353 10.5 6.24951 10.5Z" fill="white" />
                              </svg>

                            </button>
                          </div>
                        </div>
                        <TravellerSelector
                          travellerClass={travellerClass}
                          setTravellerClass={setTravellerClass}
                          travellerOptions={travellerOptions}
                          styles={styles}
                          name="Travellers & Class"
                        />
                      </div>
                      <div className={styles.serarchingContBottom}>
                        <div className={`${styles.arrowboxOneWay} ${styles.multiArrow}`} onClick={swapLocations}>
                          <img src="/icons/leftRrighArrow.svg" alt="" />
                        </div>
                        <div className={`${styles.fromBtn} ${tripType === 'multi' ? styles.growRight : ''}`}>
                          <div className={styles.lable}>From</div>
                          <input type="text" className={styles.contant} placeholder='Departure' value={from} onChange={(e) => setFrom(e.target.value)} />
                        </div>
                        <div className={`${styles.fromBtn} ${tripType === 'multi' ? styles.growRight : ''}`}>
                          <div className={styles.lable}>To</div>
                          <input type="text" className={styles.contant} placeholder='Destination' value={to} onChange={(e) => setFrom(e.target.value)} />
                        </div>

                        <div className={`${styles.fromBtn} ${tripType === 'multi' ? styles.growRight : ''}`}>
                          <div className={styles.lable}>Departure Date</div>
                          <div className={styles.dateInputWrapper} onClick={openReturnPicker}>

                            <input
                              ref={returnRef}
                              type="date"
                              className={styles.contant}
                              data-placeholder="ADD DATES"
                              required
                            />

                            <button
                              type="button"
                              aria-label="Open departure date picker"
                              className={styles.calendarIcon}
                              onClick={openReturnPicker}
                            >

                              <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.3902 3.343C12.3112 2.02925 11.2142 1 9.89291 1H9.24966V0.5C9.24966 0.224 9.02566 0 8.74966 0C8.47366 0 8.24966 0.224 8.24966 0.5V1H4.24966V0.5C4.24966 0.224 4.02566 0 3.74966 0C3.47366 0 3.24966 0.224 3.24966 0.5V1H2.60641C1.28491 1 0.187913 2.02925 0.109163 3.343C-0.0390874 5.814 -0.0363374 8.3205 0.117413 10.7928C0.195413 12.0483 1.20116 13.054 2.45666 13.132C3.71491 13.2102 4.98216 13.2493 6.24941 13.2493C7.51641 13.2493 8.78391 13.2102 10.0422 13.132C11.2977 13.054 12.3034 12.0483 12.3814 10.7928C12.5354 8.32175 12.5382 5.8155 12.3902 3.343ZM11.3837 10.7308C11.3367 11.484 10.7334 12.0872 9.98041 12.134C7.50491 12.2878 4.99441 12.2878 2.51891 12.134C1.76566 12.087 1.16241 11.4838 1.11566 10.7308C0.997412 8.83 0.973163 6.90925 1.03641 5H11.4632C11.5262 6.91 11.5019 8.83075 11.3837 10.7308ZM3.74966 3C4.02566 3 4.24966 2.776 4.24966 2.5V2H8.24966V2.5C8.24966 2.776 8.47366 3 8.74966 3C9.02566 3 9.24966 2.776 9.24966 2.5V2H9.89291C10.6862 2 11.3447 2.61625 11.3919 3.40275C11.4037 3.60125 11.4087 3.801 11.4184 4H1.08091C1.09091 3.801 1.09566 3.60125 1.10741 3.40275C1.15466 2.61625 1.81291 2 2.60641 2H3.24966V2.5C3.24966 2.776 3.47366 3 3.74966 3Z" fill="white" />
                                <path d="M3.74951 8C4.16373 8 4.49951 7.66421 4.49951 7.25C4.49951 6.83579 4.16373 6.5 3.74951 6.5C3.3353 6.5 2.99951 6.83579 2.99951 7.25C2.99951 7.66421 3.3353 8 3.74951 8Z" fill="white" />
                                <path d="M6.24951 8C6.66373 8 6.99951 7.66421 6.99951 7.25C6.99951 6.83579 6.66373 6.5 6.24951 6.5C5.8353 6.5 5.49951 6.83579 5.49951 7.25C5.49951 7.66421 5.8353 8 6.24951 8Z" fill="white" />
                                <path d="M3.74951 10.5C4.16373 10.5 4.49951 10.1642 4.49951 9.75C4.49951 9.33579 4.16373 9 3.74951 9C3.3353 9 2.99951 9.33579 2.99951 9.75C2.99951 10.1642 3.3353 10.5 3.74951 10.5Z" fill="white" />
                                <path d="M8.74951 8C9.16373 8 9.49951 7.66421 9.49951 7.25C9.49951 6.83579 9.16373 6.5 8.74951 6.5C8.3353 6.5 7.99951 6.83579 7.99951 7.25C7.99951 7.66421 8.3353 8 8.74951 8Z" fill="white" />
                                <path d="M8.74951 10.5C9.16373 10.5 9.49951 10.1642 9.49951 9.75C9.49951 9.33579 9.16373 9 8.74951 9C8.3353 9 7.99951 9.33579 7.99951 9.75C7.99951 10.1642 8.3353 10.5 8.74951 10.5Z" fill="white" />
                                <path d="M6.24951 10.5C6.66373 10.5 6.99951 10.1642 6.99951 9.75C6.99951 9.33579 6.66373 9 6.24951 9C5.8353 9 5.49951 9.33579 5.49951 9.75C5.49951 10.1642 5.8353 10.5 6.24951 10.5Z" fill="white" />
                              </svg>

                            </button>
                          </div>
                        </div>
                        <div className={styles.multisearchBtn}>
                          Search
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}


            {((bookingType === "hotel") || bookingType === "holiday" || bookingType === "insurance") && (
              <div className={`${styles.serarchingCont} ${styles.glass_panel} ${styles.searchFormContainer}`}>
                {/* Hotel form */}
                <div
                  key="hotel"
                  className={`${styles.searchFormWrapper} ${bookingType === "hotel" ? styles.formVisible : styles.formHidden
                    } ${styles.slideRight}`}
                >
                  <div className={styles.serarchingContBottom}>
                    {/* <div className={styles.arrowboxOneWay}>
                  <img src="/icons/leftRrighArrow.svg" alt="" />
                </div> */}
                    <div className={styles.fromBtn}>
                      <div className={styles.lable}>WHERE TO</div>
                      <input type="text" className={styles.contant} placeholder='Departure' />
                    </div>

                    <div className={styles.fromBtn}>
                      <div className={styles.lable}>Check In</div>
                      <div className={styles.dateInputWrapper} onClick={openDeparturePicker}>
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
                          <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.3902 3.343C12.3112 2.02925 11.2142 1 9.89291 1H9.24966V0.5C9.24966 0.224 9.02566 0 8.74966 0C8.47366 0 8.24966 0.224 8.24966 0.5V1H4.24966V0.5C4.24966 0.224 4.02566 0 3.74966 0C3.47366 0 3.24966 0.224 3.24966 0.5V1H2.60641C1.28491 1 0.187913 2.02925 0.109163 3.343C-0.0390874 5.814 -0.0363374 8.3205 0.117413 10.7928C0.195413 12.0483 1.20116 13.054 2.45666 13.132C3.71491 13.2102 4.98216 13.2493 6.24941 13.2493C7.51641 13.2493 8.78391 13.2102 10.0422 13.132C11.2977 13.054 12.3034 12.0483 12.3814 10.7928C12.5354 8.32175 12.5382 5.8155 12.3902 3.343ZM11.3837 10.7308C11.3367 11.484 10.7334 12.0872 9.98041 12.134C7.50491 12.2878 4.99441 12.2878 2.51891 12.134C1.76566 12.087 1.16241 11.4838 1.11566 10.7308C0.997412 8.83 0.973163 6.90925 1.03641 5H11.4632C11.5262 6.91 11.5019 8.83075 11.3837 10.7308ZM3.74966 3C4.02566 3 4.24966 2.776 4.24966 2.5V2H8.24966V2.5C8.24966 2.776 8.47366 3 8.74966 3C9.02566 3 9.24966 2.776 9.24966 2.5V2H9.89291C10.6862 2 11.3447 2.61625 11.3919 3.40275C11.4037 3.60125 11.4087 3.801 11.4184 4H1.08091C1.09091 3.801 1.09566 3.60125 1.10741 3.40275C1.15466 2.61625 1.81291 2 2.60641 2H3.24966V2.5C3.24966 2.776 3.47366 3 3.74966 3Z" fill="white" />
                            <path d="M3.74951 8C4.16373 8 4.49951 7.66421 4.49951 7.25C4.49951 6.83579 4.16373 6.5 3.74951 6.5C3.3353 6.5 2.99951 6.83579 2.99951 7.25C2.99951 7.66421 3.3353 8 3.74951 8Z" fill="white" />
                            <path d="M6.24951 8C6.66373 8 6.99951 7.66421 6.99951 7.25C6.99951 6.83579 6.66373 6.5 6.24951 6.5C5.8353 6.5 5.49951 6.83579 5.49951 7.25C5.49951 7.66421 5.8353 8 6.24951 8Z" fill="white" />
                            <path d="M3.74951 10.5C4.16373 10.5 4.49951 10.1642 4.49951 9.75C4.49951 9.33579 4.16373 9 3.74951 9C3.3353 9 2.99951 9.33579 2.99951 9.75C2.99951 10.1642 3.3353 10.5 3.74951 10.5Z" fill="white" />
                            <path d="M8.74951 8C9.16373 8 9.49951 7.66421 9.49951 7.25C9.49951 6.83579 9.16373 6.5 8.74951 6.5C8.3353 6.5 7.99951 6.83579 7.99951 7.25C7.99951 7.66421 8.3353 8 8.74951 8Z" fill="white" />
                            <path d="M8.74951 10.5C9.16373 10.5 9.49951 10.1642 9.49951 9.75C9.49951 9.33579 9.16373 9 8.74951 9C8.3353 9 7.99951 9.33579 7.99951 9.75C7.99951 10.1642 8.3353 10.5 8.74951 10.5Z" fill="white" />
                            <path d="M6.24951 10.5C6.66373 10.5 6.99951 10.1642 6.99951 9.75C6.99951 9.33579 6.66373 9 6.24951 9C5.8353 9 5.49951 9.33579 5.49951 9.75C5.49951 10.1642 5.8353 10.5 6.24951 10.5Z" fill="white" />
                          </svg>

                        </button>
                      </div>
                    </div>

                    <TravellerSelector
                      travellerClass={travellerClass}
                      setTravellerClass={setTravellerClass}
                      travellerOptions={travellerOptions}
                      styles={styles}
                      name="Travellers & Class"
                    />
                    <div className={styles.searchBtn}>
                      <img src="/images/searchIcon.svg" alt="" />
                    </div>
                  </div>
                </div>

                {/* Holiday form */}
                <div
                  key="holiday"
                  className={`${styles.searchFormWrapper} ${bookingType === "holiday" ? styles.formVisible : styles.formHidden
                    } ${styles.slideRight}`}
                >


                  <div className={styles.serarchingContBottom}>
                    {/* <div className={styles.arrowboxOneWay} onClick={swapLocations}>
                  <img src="/icons/leftRrighArrow.svg" alt="" />
                </div> */}
                    <div className={styles.fromBtn}>
                      <div className={styles.lable}>From CITY</div>
                      <input
                        type="text"
                        className={styles.contant}
                        placeholder="Departure"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                      />
                    </div>
                    <div className={styles.fromBtn}>
                      <div className={styles.lable}>To CITY/COUNTRY, CATEGORY</div>
                      <input
                        type="text"
                        className={styles.contant}
                        placeholder="Destination"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                      />
                    </div>

                    <div className={styles.fromBtn}>
                      <div className={styles.lable}>Departure Date</div>
                      <div className={styles.dateInputWrapper} onClick={openDeparturePicker}>
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
                          <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.3902 3.343C12.3112 2.02925 11.2142 1 9.89291 1H9.24966V0.5C9.24966 0.224 9.02566 0 8.74966 0C8.47366 0 8.24966 0.224 8.24966 0.5V1H4.24966V0.5C4.24966 0.224 4.02566 0 3.74966 0C3.47366 0 3.24966 0.224 3.24966 0.5V1H2.60641C1.28491 1 0.187913 2.02925 0.109163 3.343C-0.0390874 5.814 -0.0363374 8.3205 0.117413 10.7928C0.195413 12.0483 1.20116 13.054 2.45666 13.132C3.71491 13.2102 4.98216 13.2493 6.24941 13.2493C7.51641 13.2493 8.78391 13.2102 10.0422 13.132C11.2977 13.054 12.3034 12.0483 12.3814 10.7928C12.5354 8.32175 12.5382 5.8155 12.3902 3.343ZM11.3837 10.7308C11.3367 11.484 10.7334 12.0872 9.98041 12.134C7.50491 12.2878 4.99441 12.2878 2.51891 12.134C1.76566 12.087 1.16241 11.4838 1.11566 10.7308C0.997412 8.83 0.973163 6.90925 1.03641 5H11.4632C11.5262 6.91 11.5019 8.83075 11.3837 10.7308ZM3.74966 3C4.02566 3 4.24966 2.776 4.24966 2.5V2H8.24966V2.5C8.24966 2.776 8.47366 3 8.74966 3C9.02566 3 9.24966 2.776 9.24966 2.5V2H9.89291C10.6862 2 11.3447 2.61625 11.3919 3.40275C11.4037 3.60125 11.4087 3.801 11.4184 4H1.08091C1.09091 3.801 1.09566 3.60125 1.10741 3.40275C1.15466 2.61625 1.81291 2 2.60641 2H3.24966V2.5C3.24966 2.776 3.47366 3 3.74966 3Z" fill="white" />
                            <path d="M3.74951 8C4.16373 8 4.49951 7.66421 4.49951 7.25C4.49951 6.83579 4.16373 6.5 3.74951 6.5C3.3353 6.5 2.99951 6.83579 2.99951 7.25C2.99951 7.66421 3.3353 8 3.74951 8Z" fill="white" />
                            <path d="M6.24951 8C6.66373 8 6.99951 7.66421 6.99951 7.25C6.99951 6.83579 6.66373 6.5 6.24951 6.5C5.8353 6.5 5.49951 6.83579 5.49951 7.25C5.49951 7.66421 5.8353 8 6.24951 8Z" fill="white" />
                            <path d="M3.74951 10.5C4.16373 10.5 4.49951 10.1642 4.49951 9.75C4.49951 9.33579 4.16373 9 3.74951 9C3.3353 9 2.99951 9.33579 2.99951 9.75C2.99951 10.1642 3.3353 10.5 3.74951 10.5Z" fill="white" />
                            <path d="M8.74951 8C9.16373 8 9.49951 7.66421 9.49951 7.25C9.49951 6.83579 9.16373 6.5 8.74951 6.5C8.3353 6.5 7.99951 6.83579 7.99951 7.25C7.99951 7.66421 8.3353 8 8.74951 8Z" fill="white" />
                            <path d="M8.74951 10.5C9.16373 10.5 9.49951 10.1642 9.49951 9.75C9.49951 9.33579 9.16373 9 8.74951 9C8.3353 9 7.99951 9.33579 7.99951 9.75C7.99951 10.1642 8.3353 10.5 8.74951 10.5Z" fill="white" />
                            <path d="M6.24951 10.5C6.66373 10.5 6.99951 10.1642 6.99951 9.75C6.99951 9.33579 6.66373 9 6.24951 9C5.8353 9 5.49951 9.33579 5.49951 9.75C5.49951 10.1642 5.8353 10.5 6.24951 10.5Z" fill="white" />
                          </svg>

                        </button>
                      </div>
                    </div>

                    <TravellerSelector
                      travellerClass={travellerClass}
                      setTravellerClass={setTravellerClass}
                      travellerOptions={travellerOptions}
                      styles={styles}
                      name="Travellers & Class"
                    />
                    <div className={styles.searchBtn}>
                      <img src="/images/searchIcon.svg" alt="" />
                    </div>
                  </div>
                </div>

                {/* Insurance form */}
                <div
                  key="insurance"
                  className={`${styles.searchFormWrapper} ${bookingType === "insurance" ? styles.formVisible : styles.formHidden
                    } ${styles.slideRight}`}
                >
                  <div className={styles.serarchingContBottom}>
                    {/* <div className={styles.arrowboxOneWay}>
                  <img src="/icons/leftRrighArrow.svg" alt="" />
                </div> */}
                    <div className={styles.fromBtn}>
                      <div className={styles.lable}>TRAVEL DESTINATION</div>
                      <div className={styles.dateInputWrapper}>
                        <div className={styles.contant}>SELECT DESTINATION</div>
                        <img src="/images/Vector.svg" alt="" /></div>
                    </div>

                    <div className={styles.fromBtn}>
                      <div className={styles.lable}>TRAVEL DATE</div>
                      <div className={styles.dateInputWrapper} onClick={openDeparturePicker}>

                        <input
                          ref={departureRef}
                          type="date"
                          className={styles.contant}
                          data-placeholder="ADD DATES"
                          required
                        />

                        <button
                          type="button"
                          aria-label="Open departure date picker"
                          className={styles.calendarIcon}
                          onClick={openDeparturePicker}
                        >

                          <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.3902 3.343C12.3112 2.02925 11.2142 1 9.89291 1H9.24966V0.5C9.24966 0.224 9.02566 0 8.74966 0C8.47366 0 8.24966 0.224 8.24966 0.5V1H4.24966V0.5C4.24966 0.224 4.02566 0 3.74966 0C3.47366 0 3.24966 0.224 3.24966 0.5V1H2.60641C1.28491 1 0.187913 2.02925 0.109163 3.343C-0.0390874 5.814 -0.0363374 8.3205 0.117413 10.7928C0.195413 12.0483 1.20116 13.054 2.45666 13.132C3.71491 13.2102 4.98216 13.2493 6.24941 13.2493C7.51641 13.2493 8.78391 13.2102 10.0422 13.132C11.2977 13.054 12.3034 12.0483 12.3814 10.7928C12.5354 8.32175 12.5382 5.8155 12.3902 3.343ZM11.3837 10.7308C11.3367 11.484 10.7334 12.0872 9.98041 12.134C7.50491 12.2878 4.99441 12.2878 2.51891 12.134C1.76566 12.087 1.16241 11.4838 1.11566 10.7308C0.997412 8.83 0.973163 6.90925 1.03641 5H11.4632C11.5262 6.91 11.5019 8.83075 11.3837 10.7308ZM3.74966 3C4.02566 3 4.24966 2.776 4.24966 2.5V2H8.24966V2.5C8.24966 2.776 8.47366 3 8.74966 3C9.02566 3 9.24966 2.776 9.24966 2.5V2H9.89291C10.6862 2 11.3447 2.61625 11.3919 3.40275C11.4037 3.60125 11.4087 3.801 11.4184 4H1.08091C1.09091 3.801 1.09566 3.60125 1.10741 3.40275C1.15466 2.61625 1.81291 2 2.60641 2H3.24966V2.5C3.24966 2.776 3.47366 3 3.74966 3Z" fill="white" />
                            <path d="M3.74951 8C4.16373 8 4.49951 7.66421 4.49951 7.25C4.49951 6.83579 4.16373 6.5 3.74951 6.5C3.3353 6.5 2.99951 6.83579 2.99951 7.25C2.99951 7.66421 3.3353 8 3.74951 8Z" fill="white" />
                            <path d="M6.24951 8C6.66373 8 6.99951 7.66421 6.99951 7.25C6.99951 6.83579 6.66373 6.5 6.24951 6.5C5.8353 6.5 5.49951 6.83579 5.49951 7.25C5.49951 7.66421 5.8353 8 6.24951 8Z" fill="white" />
                            <path d="M3.74951 10.5C4.16373 10.5 4.49951 10.1642 4.49951 9.75C4.49951 9.33579 4.16373 9 3.74951 9C3.3353 9 2.99951 9.33579 2.99951 9.75C2.99951 10.1642 3.3353 10.5 3.74951 10.5Z" fill="white" />
                            <path d="M8.74951 8C9.16373 8 9.49951 7.66421 9.49951 7.25C9.49951 6.83579 9.16373 6.5 8.74951 6.5C8.3353 6.5 7.99951 6.83579 7.99951 7.25C7.99951 7.66421 8.3353 8 8.74951 8Z" fill="white" />
                            <path d="M8.74951 10.5C9.16373 10.5 9.49951 10.1642 9.49951 9.75C9.49951 9.33579 9.16373 9 8.74951 9C8.3353 9 7.99951 9.33579 7.99951 9.75C7.99951 10.1642 8.3353 10.5 8.74951 10.5Z" fill="white" />
                            <path d="M6.24951 10.5C6.66373 10.5 6.99951 10.1642 6.99951 9.75C6.99951 9.33579 6.66373 9 6.24951 9C5.8353 9 5.49951 9.33579 5.49951 9.75C5.49951 10.1642 5.8353 10.5 6.24951 10.5Z" fill="white" />
                          </svg>

                        </button>
                      </div>
                    </div>
                    <div className={styles.fromBtn}>
                      <div className={styles.lable}>Departure Date</div>
                      <div className={styles.dateInputWrapper} onClick={openDeparturePicker}>

                        <input
                          ref={departureRef}
                          type="date"
                          className={styles.contant}
                          data-placeholder="ADD DATES"
                          required
                        />

                        <button
                          type="button"
                          aria-label="Open departure date picker"
                          className={styles.calendarIcon}
                          onClick={openDeparturePicker}
                        >

                          <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.3902 3.343C12.3112 2.02925 11.2142 1 9.89291 1H9.24966V0.5C9.24966 0.224 9.02566 0 8.74966 0C8.47366 0 8.24966 0.224 8.24966 0.5V1H4.24966V0.5C4.24966 0.224 4.02566 0 3.74966 0C3.47366 0 3.24966 0.224 3.24966 0.5V1H2.60641C1.28491 1 0.187913 2.02925 0.109163 3.343C-0.0390874 5.814 -0.0363374 8.3205 0.117413 10.7928C0.195413 12.0483 1.20116 13.054 2.45666 13.132C3.71491 13.2102 4.98216 13.2493 6.24941 13.2493C7.51641 13.2493 8.78391 13.2102 10.0422 13.132C11.2977 13.054 12.3034 12.0483 12.3814 10.7928C12.5354 8.32175 12.5382 5.8155 12.3902 3.343ZM11.3837 10.7308C11.3367 11.484 10.7334 12.0872 9.98041 12.134C7.50491 12.2878 4.99441 12.2878 2.51891 12.134C1.76566 12.087 1.16241 11.4838 1.11566 10.7308C0.997412 8.83 0.973163 6.90925 1.03641 5H11.4632C11.5262 6.91 11.5019 8.83075 11.3837 10.7308ZM3.74966 3C4.02566 3 4.24966 2.776 4.24966 2.5V2H8.24966V2.5C8.24966 2.776 8.47366 3 8.74966 3C9.02566 3 9.24966 2.776 9.24966 2.5V2H9.89291C10.6862 2 11.3447 2.61625 11.3919 3.40275C11.4037 3.60125 11.4087 3.801 11.4184 4H1.08091C1.09091 3.801 1.09566 3.60125 1.10741 3.40275C1.15466 2.61625 1.81291 2 2.60641 2H3.24966V2.5C3.24966 2.776 3.47366 3 3.74966 3Z" fill="white" />
                            <path d="M3.74951 8C4.16373 8 4.49951 7.66421 4.49951 7.25C4.49951 6.83579 4.16373 6.5 3.74951 6.5C3.3353 6.5 2.99951 6.83579 2.99951 7.25C2.99951 7.66421 3.3353 8 3.74951 8Z" fill="white" />
                            <path d="M6.24951 8C6.66373 8 6.99951 7.66421 6.99951 7.25C6.99951 6.83579 6.66373 6.5 6.24951 6.5C5.8353 6.5 5.49951 6.83579 5.49951 7.25C5.49951 7.66421 5.8353 8 6.24951 8Z" fill="white" />
                            <path d="M3.74951 10.5C4.16373 10.5 4.49951 10.1642 4.49951 9.75C4.49951 9.33579 4.16373 9 3.74951 9C3.3353 9 2.99951 9.33579 2.99951 9.75C2.99951 10.1642 3.3353 10.5 3.74951 10.5Z" fill="white" />
                            <path d="M8.74951 8C9.16373 8 9.49951 7.66421 9.49951 7.25C9.49951 6.83579 9.16373 6.5 8.74951 6.5C8.3353 6.5 7.99951 6.83579 7.99951 7.25C7.99951 7.66421 8.3353 8 8.74951 8Z" fill="white" />
                            <path d="M8.74951 10.5C9.16373 10.5 9.49951 10.1642 9.49951 9.75C9.49951 9.33579 9.16373 9 8.74951 9C8.3353 9 7.99951 9.33579 7.99951 9.75C7.99951 10.1642 8.3353 10.5 8.74951 10.5Z" fill="white" />
                            <path d="M6.24951 10.5C6.66373 10.5 6.99951 10.1642 6.99951 9.75C6.99951 9.33579 6.66373 9 6.24951 9C5.8353 9 5.49951 9.33579 5.49951 9.75C5.49951 10.1642 5.8353 10.5 6.24951 10.5Z" fill="white" />
                          </svg>

                        </button>
                      </div>
                    </div>

                    <TravellerSelector
                      travellerClass={travellerClass}
                      setTravellerClass={setTravellerClass}
                      travellerOptions={travellerOptions}
                      styles={styles}
                      name="Travellers & Class"
                    />
                    <div className={styles.searchBtn}>
                      <img src="/images/searchIcon.svg" alt="" />
                    </div>
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
            style={{
              '--active-index': String(activeFeature),
              '--count': String(features.length)
            }}
          >
            <div className={styles.progressActive}></div>
          </div>

          <div className={styles.featureRow}>
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
                onChange={(e) => setTo(e.target.value)}
              />
            </div>

            {/* DEPARTURE DATE */}
            <div className={styles.field}>
              <label className={styles.label}>DEPARTURE DATE</label>
              <input
                type="date"
                className={styles.input}
              />
            </div>

            {/* RETURN DATE */}
            <div className={styles.field}>
              <label className={styles.label}>RETURN DATE</label>
              <input
                type="date"
                className={styles.input}
              />
            </div>

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

            {/* SWAP */}




            {/* DEPARTURE DATE */}
            <div className={styles.field}>
              <label className={styles.label}>Check in</label>
              <input
                type="date"
                className={styles.input}
                placeholder='Add Date'
              />
            </div>

            {/* RETURN DATE */}
            <div className={styles.field}>
              <label className={styles.label}>Check out</label>
              <input
                type="date"
                className={styles.input}
              />
            </div>

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
            <div className={styles.field}>
              <label className={styles.label}>Departure Date</label>
              <input
                type="date"
                className={styles.input}
              />
            </div>

            {/* RETURN DATE */}
            {/* <div className={styles.field}>
              <label className={styles.label}>Check out</label>
              <input
                type="date"
                className={styles.input}
              />
            </div> */}

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

      {bookingType === "insurance" && (
        <div className={styles.flightSectionMain}>
          {/* <button type="button" className={styles.swapBtn}>
            <img src="/icons/leftRrighArrow.svg" alt="swap" />
          </button> */}
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
              travellerClass={travellerClass}
              setTravellerClass={setTravellerClass}
              travellerOptions={TravellerDestination}
              styles={styles}
              name="TRAVEL DESTINATION"
            />
            {/* SWAP */}




            {/* DEPARTURE DATE */}
            <div className={styles.field}>
              <label className={styles.label}>TRAVEL DATE</label>
              <input
                type="date"
                className={styles.input}
              />
            </div>

            {/* RETURN DATE */}
            <div className={styles.field}>
              <label className={styles.label}>Return Date</label>
              <input
                type="date"
                className={styles.input}
              />
            </div>

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



    </section>
  )
}

export default HomePage


// display: flex;
// flex-direction: column;
// background: white;
// width: 100%;
// box-shadow: -2px -3px 9.2px 0px #00000014, 0px 5px 8px 0px #0000001A;
// padding: 12px;
// position: relative;
// top: 153px;
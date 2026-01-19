"use client";
import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import FromLocationSheet from "@/app/components/fromLocationSheet/FromLocationSheet";
import MobileViewCalender from "@/app/components/mobileViewCalendar/MobileViewCalender";
import PassengersPopup from "@/app/components/passengersPopUp/PassengersPopup";
import SeatClassPopup from "@/app/components/seatClassPopup/SeatClassPopup";
import MultiCityMobile from "./MultiCityMobile";
import DateField from "@/app/home-page/components/homePage/DateField";
// import styles from "@/app/home-page/components/homePage/HomePage.module.css"
import styles from './FlightEditFieldPopup.module.css'
import { useTripType } from "@/app/flights/TripTypeContext";

const FlightSearchMobile = ({ setIsOpecEditFields }) => {
  const {
    tripType,
    setTripType,
    from,
    setFrom,
    to,
    setTo,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    passengers,
    setPassengers,
    travelClass,
    setTravelClass,
    handleSearch: contextHandleSearch,
  } = useTripType();

  // Mapping context dates to local names for consistency with existing JSX if needed, 
  // or just use context names directly. I'll use context names.
  const departureDate = startDate;
  const setDepartureDate = setStartDate;
  const returnDate = endDate;
  const setReturnDate = setEndDate;


  const [multiFlights, setMultiFlights] = useState([
    { from: "", to: "", departureDate: null },
    { from: "", to: "", departureDate: null },
  ]);

  const [activeFlightIndex, setActiveFlightIndex] = useState(0);

  const [openCalendar, setOpenCalendar] = useState(false);
  const [calendarType, setCalendarType] = useState("departure"); // "departure" | "return"
  const [openSeatClass, setOpenSeatClass] = useState(false);
  const [openPassengers, setOpenPassengers] = useState(false);
  const [openTo, setOpenTo] = useState(false);
  const [openFrom, setOpenFrom] = useState(false);
  const travellerRef = useRef(null);
  const handleTripTypeChange = (type) => {
    setTripType(type);
  };
  const isMultiTripMobile = tripType === "multi";

  const formatDate = (date) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "";

    return dateObj.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalPassengers =
    passengers.adult + (passengers.children || passengers.child || 0) + passengers.infant;

  const passengerText = `${passengers.adult} Adult${passengers.adult > 1 ? "s" : ""
    }, ${(passengers.children || passengers.child || 0)} Child${(passengers.children || passengers.child || 0) > 1 ? "ren" : ""}`;
  // useEffect(() => {
  //   setIsMultiTripMobile(tripType === "multi");
  // }, [tripType]);

  const truncate = (text = "", max = 20) =>
    text.length > max ? text.slice(0, max) + "..." : text;


  const swapLocations = () => {
    setFrom((prevFrom) => {
      setTo(prevFrom);
      return to;
    });
  };

  const handleMultiSearch = () => {
    console.log({
      tripType: "multi",
      multiFlights,
      passengers,
      travelClass,
    });
  };


  const handleSearch = () => {
    const payload = {
      tripType,
      from,
      to,
      departureDate,
      returnDate: tripType === "round" ? returnDate : null,
      passengers,
      travelClass,
    };

    console.log("SEARCH PAYLOAD 👉", payload);
  };

  return (
    <div className={styles.flightSectionMain}>

      <div className={styles.closeBtn} onClick={() => setIsOpecEditFields(false)}>
        <img src="/icons/Close.svg" alt="" />
      </div>
      {tripType !== "multi" && (
        <button
          type="button"
          className={`${styles.swapBtn} ${tripType === "round" ? styles.swapBtnRound : ""} ${tripType === "oneway" ? styles.swapBtnRound : ""}`}
          onClick={swapLocations}
        >
          <img src="/icons/leftRrighArrow.svg" alt="swap" />
        </button>
      )}

      <div className={styles.flightSearchCard}>
        <div className={styles.serarchingContTop_left}>
          <button
            className={`${styles.round_tripBtnMbl} ${tripType === "round" ? styles.activeTrip : ""
              }`}
            onClick={() => handleTripTypeChange("round")}
          >
            Round-trip
          </button>

          <button
            className={`${styles.round_tripBtnMbl} ${tripType === "oneway" ? styles.activeTrip : ""
              }`}
            onClick={() => handleTripTypeChange("oneway")}
          >
            One-way
          </button>

          <button
            className={`${styles.round_tripBtnMbl} ${tripType === "multi" ? styles.activeTrip : ""
              }`}
            onClick={() => handleTripTypeChange("multi")}
          >
            Multi-City
          </button>
        </div>
        {tripType === "round" && (
          <>
            <div className={styles.fromToCont}>
              <div className={styles.field} onClick={() => setOpenFrom(true)}>
                <label className={styles.label}>FROM</label>
                <input
                  type="text"
                  placeholder="Departure"
                  className={styles.input}
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              {openFrom && (
                <FromLocationSheet
                  onClose={() => setOpenFrom(false)}
                  inputType="from"
                  onSelectCity={(value) => setFrom(value)}
                />
              )}

              <div
                className={`${styles.field} ${styles.field2}`}
                onClick={() => setOpenTo(true)}
              >
                <label className={styles.label}>TO</label>
                <input
                  type="text"
                  placeholder="Destination"
                  className={styles.input}
                  value={to}
                  readOnly
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
              {openTo && (
                <FromLocationSheet
                  onClose={() => setOpenTo(false)}
                  inputType="to"
                  onSelectCity={(value) => setTo(value)}
                />
              )}
            </div>
            <div className={styles.fromToCont}>
              <div
                className={styles.fromtoConSub}
                onClick={() => {
                  setCalendarType("departure");
                  setOpenCalendar(true);
                }}
              >
                <DateField
                  label="DEPARTURE DATE"
                  placeholder="ADD DATES"
                  value={formatDate(departureDate)}
                />
              </div>

              <div
                className={styles.fromtoConSub}
                onClick={() => {
                  setCalendarType("return");
                  setOpenCalendar(true);
                }}
              >
                <DateField
                  label="RETURN DATE"
                  placeholder="ADD DATES"
                  value={formatDate(returnDate)}
                />
              </div>
            </div>

            <div
              ref={travellerRef}
              className={`${styles.fromBtn} ${styles.fromBtn2}`}
              onClick={(e) => {
                e.stopPropagation();
                setOpenPassengers(true);
              }}
            >
              <div className={styles.label}>Passengers</div>

              <div className={styles.iconCont}>
                <div className={styles.contant}>
                  {truncate(passengerText, 22)}
                </div>

                <ChevronDown
                  className={`${styles.chevron} ${openPassengers ? styles.openChevron : styles.closeChevron
                    }`}
                  size={20}
                />
              </div>

              {openPassengers && (
                <PassengersPopup
                  passengers={passengers}
                  setPassengers={setPassengers}
                  onClose={() => setOpenPassengers(false)}
                />
              )}
            </div>

            <div
              ref={travellerRef}
              className={`${styles.fromBtn} ${styles.fromBtn2}`}
              onClick={(e) => {
                e.stopPropagation();
                setOpenSeatClass(true);
              }}
            >
              <div className={styles.lable}>Seat Class</div>

              <div className={styles.iconCont}>
                <div className={styles.contant}>
                  {truncate(travelClass, 17)}
                </div>

                <ChevronDown
                  className={`${styles.chevron} ${openSeatClass ? styles.openChevron : styles.closeChevron
                    }`}
                  size={20}
                />
              </div>

              {openSeatClass && (
                <SeatClassPopup
                  value={travelClass}
                  onChange={(val) => {
                    setTravelClass(val);
                    setOpenSeatClass(false); // 🔥 auto close
                  }}
                  onClose={() => setOpenSeatClass(false)}
                  inputType="Seat Class"
                />
              )}
            </div>

            <button onClick={handleSearch} className={styles.searchBtna}>
              SEARCH
            </button>
          </>
        )}
        {tripType === "oneway" && (
          <>
            <div className={styles.fromToCont}>
              <div className={styles.field} onClick={() => setOpenFrom(true)}>
                <label className={styles.label}>FROM</label>
                <input
                  type="text"
                  placeholder="Departure"
                  className={styles.input}
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              {openFrom && (
                <FromLocationSheet
                  onClose={() => setOpenFrom(false)}
                  inputType="from"
                  onSelectCity={(value) => setFrom(value)}
                />
              )}

              <div
                className={`${styles.field} ${styles.field2}`}
                onClick={() => setOpenTo(true)}
              >
                <label className={styles.label}>TO</label>
                <input
                  type="text"
                  placeholder="Destination"
                  className={styles.input}
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
              {openTo && (
                <FromLocationSheet
                  onClose={() => setOpenTo(false)}
                  inputType="to"
                  onSelectCity={(value) => setTo(value)}
                />
              )}
            </div>
            <div
              className={styles.fromToCont}
              onClick={() => {
                setCalendarType("departure");
                setOpenCalendar(true);
              }}
            >
              <DateField
                label="DEPARTURE DATE"
                placeholder="ADD DATES"
                value={formatDate(departureDate)}
                name="departureDate"
              />
            </div>

            <div
              ref={travellerRef}
              className={`${styles.fromBtn} ${styles.fromBtn2}`}
              onClick={(e) => {
                e.stopPropagation();
                setOpenPassengers(true);
              }}
            >
              <div className={styles.lable}>Passengers</div>

              <div className={styles.iconCont}>
                <div className={styles.contant}>
                  {truncate(passengerText, 22)}
                </div>

                <ChevronDown
                  className={`${styles.chevron} ${openPassengers ? styles.openChevron : styles.closeChevron
                    }`}
                  size={20}
                />
              </div>

              {openPassengers && (
                <PassengersPopup
                  passengers={passengers}
                  setPassengers={setPassengers}
                  onClose={() => setOpenPassengers(false)}
                />
              )}
            </div>

            <div
              ref={travellerRef}
              className={`${styles.fromBtn} ${styles.fromBtn2}`}
              onClick={(e) => {
                e.stopPropagation();
                setOpenSeatClass(true);
              }}
            >
              <div className={styles.lable}>Seat Class</div>

              <div className={styles.iconCont}>
                <div className={styles.contant}>
                  {truncate(travelClass, 17)}
                </div>

                <ChevronDown
                  className={`${styles.chevron} ${openSeatClass ? styles.openChevron : styles.closeChevron
                    }`}
                  size={20}
                />
              </div>

              {openSeatClass && (
                <SeatClassPopup
                  value={travelClass}
                  onChange={(val) => {
                    setTravelClass(val);
                    setOpenSeatClass(false); // 🔥 auto close
                  }}
                  onClose={() => setOpenSeatClass(false)}
                  inputType="Seat Class"
                />
              )}
            </div>

            <button onClick={handleSearch} className={styles.searchBtna}>
              SEARCH
            </button>
          </>
        )}
        {openCalendar && (
          <MobileViewCalender
            onClose={() => setOpenCalendar(false)}
            inputType={tripType === "oneway" ? "oneway" : "roundtrip"}
            selectedDeparture={departureDate}
            selectedReturn={returnDate}
            onSelectDate={({ departure, returnDate }) => {
              if (departure) setDepartureDate(departure);
              if (returnDate !== undefined) setReturnDate(returnDate);
              setOpenCalendar(false);
            }}
          />
        )}
        {tripType === "multi" && (
          <MultiCityMobile
            multiFlights={multiFlights}
            setMultiFlights={setMultiFlights}
            setActiveFlightIndex={setActiveFlightIndex}
            setOpenFrom={setOpenFrom}
            setOpenTo={setOpenTo}
            setOpenCalendar={setOpenCalendar}
            setCalendarType={setCalendarType}
            setOpenPassengers={setOpenPassengers}
            setOpenSeatClass={setOpenSeatClass}
            passengerText={passengerText}
            travelClass={travelClass}
            swapLocations={swapLocations}
            onSearch={() =>
              handleSearch({
                tripType: "multi",
                multiFlights,
              })
            }
            formatDate={formatDate}
          />
        )}
        {tripType === "multi" && (
          <>
            {/* FROM */}
            {openFrom && (
              <FromLocationSheet
                onClose={() => setOpenFrom(false)}
                inputType="from"
                onSelectCity={(value) => {
                  setMultiFlights((prev) => {
                    const updated = [...prev];
                    updated[activeFlightIndex].from = value;
                    return updated;
                  });
                }}
              />
            )}

            {/* TO */}
            {openTo && (
              <FromLocationSheet
                onClose={() => setOpenTo(false)}
                inputType="to"
                onSelectCity={(value) => {
                  setMultiFlights((prev) => {
                    const updated = [...prev];
                    updated[activeFlightIndex].to = value;
                    return updated;
                  });
                }}
              />
            )}

            {/* PASSENGERS */}
            {openPassengers && (
              <PassengersPopup
                passengers={passengers}
                setPassengers={setPassengers}
                onClose={() => setOpenPassengers(false)}
              />
            )}

            {/* SEAT CLASS */}
            {openSeatClass && (
              <SeatClassPopup
                value={travelClass}
                onChange={(val) => {
                  setTravelClass(val);
                  setOpenSeatClass(false);
                }}
                onClose={() => setOpenSeatClass(false)}
                inputType="Seat Class"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FlightSearchMobile;

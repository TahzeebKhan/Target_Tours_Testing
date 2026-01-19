"use client";
import React, { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import DateField from "../DateField";
import FromLocationSheet from "@/app/components/fromLocationSheet/FromLocationSheet";
import MobileViewCalender from "@/app/components/mobileViewCalendar/MobileViewCalender";
import PassengersPopup from "@/app/components/passengersPopUp/PassengersPopup";

const HolidaySearchMobile = ({
  styles,
  handleSearch,
  from,
  setFrom,
  to,
  setTo,
  departureDate,
  setDepartureDate,
  truncate,
}) => {
  const travellerRef = useRef(null);
  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openPassengers, setOpenPassengers] = useState(false);

  // Internal passenger state for Holiday search
  const [passengers, setPassengers] = useState({
    adult: 1,
    children: 0,
    infant: 0,
  });

  const totalPassengers =
    passengers.adult + passengers.children + passengers.infant;

  const ensureDate = (date) => {
    if (!date) return null;
    if (date instanceof Date) return date;
    return new Date(date);
  };

  const formatDate = (date) => {
    const d = ensureDate(date);
    return d
      ? d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "";
  };

  return (
    <div className={styles.flightSectionMain}>
      <button
        type="button"
        className={`${styles.swapBtn} ${styles.HolidaySwapBtn}`}
      >
        <img src="/icons/leftRrighArrow.svg" alt="swap" />
      </button>
      <div className={styles.flightSearchCard}>
        <div className={styles.fromToCont}>
          <div className={styles.field} onClick={() => setOpenFrom(true)}>
            <label className={styles.label}>From CITY</label>
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
              inputType="From CITY"
              onSelectCity={(value) => setFrom(value)}
            />
          )}

          <div
            className={`${styles.field} ${styles.field2}`}
            onClick={() => setOpenTo(true)}
          >
            <label className={styles.label}>To CITY/COUNTRY</label>
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
              inputType="To CITY/COUNTRY,CATEGORY"
              onSelectCity={(value) => setTo(value)}
            />
          )}
        </div>

        <div onClick={() => setOpenCalendar(true)}>
          <DateField
            label="DEPARTURE DATE"
            placeholder="ADD DATES"
            value={formatDate(departureDate)}
            name="departureDate"
          />
        </div>
        {openCalendar && (
          <MobileViewCalender
            onClose={() => setOpenCalendar(false)}
            inputType="oneway"
            selectedDeparture={ensureDate(departureDate)}
            selectedReturn={null}
            onSelectDate={({ departure }) => {
              if (departure) setDepartureDate(departure);
              setOpenCalendar(false);
            }}
          />
        )}

        <div
          ref={travellerRef}
          className={`${styles.fromBtn} ${styles.fromBtn2}`}
          onClick={(e) => {
            e.stopPropagation();
            setOpenPassengers(true);
          }}
        >
          <div className={styles.lable}>ROOMS & GUESTS</div>
          <div className={styles.iconCont}>
            <div className={styles.contant}>
              {truncate(
                `${totalPassengers} Room${
                  totalPassengers > 1 ? "s" : ""
                }, ${totalPassengers} Guest${totalPassengers > 1 ? "s" : ""}`,
                17
              )}
            </div>

            <ChevronDown
              className={`${styles.chevron} ${
                openPassengers ? styles.openChevron : styles.closeChevron
              }`}
              size={20}
              color="#000000"
            />
          </div>

          {openPassengers && (
            <PassengersPopup
              passengers={passengers}
              setPassengers={setPassengers}
              onClose={() => setOpenPassengers(false)}
              inputType="ROOMS & GUESTS"
            />
          )}
        </div>

        <button onClick={handleSearch} className={styles.searchBtna}>
          SEARCH
        </button>
      </div>
    </div>
  );
};

export default HolidaySearchMobile;

"use client";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import DateField from "../DateField";
import HotelLocationSheet from "@/shared/components/hotelLocationSheet/HotelLocationSheet";
import MobileViewCalender from "@/shared/components/mobileViewCalendar/MobileViewCalender";
import HotelPassengersPopup from "@/shared/components/hotelPassengersPopup/HotelPassengersPopup";

const HotelSearchMobile = ({
  styles,
  to,
  setTo,
  onHotelSelect,
  handleSearch,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  passengers,
  setPassengers,
  truncate,
}) => {
  const [openTo, setOpenTo] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openPassengers, setOpenPassengers] = useState(false);

  const adultCount = Number(passengers?.adult ?? passengers?.adults) || 1;
  const childCount = Number(passengers?.child ?? passengers?.children) || 0;
  const roomCount = Number(passengers?.room || passengers?.rooms?.length || 1);
  const totalPassengers = adultCount + childCount;

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

  const getNextDate = (date) => {
    const nextDate = ensureDate(date);
    if (!nextDate) return null;

    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate;
  };

  return (
    <div className={styles.flightSectionMain}>
      <div className={styles.flightSearchCard}>
        <div
          className={`${styles.field} ${styles.field3}`}
          onClick={() => setOpenTo(true)}
        >
          <label className={styles.label}>Where to</label>
          <input
            type="text"
            placeholder="Departure"
            className={styles.input}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        {openTo && (
          <HotelLocationSheet
            onClose={() => setOpenTo(false)}
            inputType="Where to"
            onSelectCity={(value, item) => {
              setTo(value);
              onHotelSelect?.(item?.hotelLocation || item);
            }}
          />
        )}

        <div
          className={styles.fromToCont}
          onClick={() => setOpenCalendar(true)}
        >
          <DateField
            label="Check in"
            placeholder="ADD DATES"
            value={formatDate(checkIn)}
            name="departureDate"
            // min={new Date().toISOString().split("T")[0]}
            // onChange={(e) => setCheckIn(e.target.value)}
          />
          <DateField
            label="Check out"
            placeholder="ADD DATES"
            value={formatDate(checkOut)}
            name="returnDate"
            // min={new Date().toISOString().split("T")[0]}
            // onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>

        <div
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
                `${totalPassengers} Guest${
                  totalPassengers > 1 ? "s" : ""
                }, ${roomCount} Room${roomCount > 1 ? "s" : ""}`,
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
            <HotelPassengersPopup
              passengers={passengers}
              setPassengers={setPassengers}
              onClose={() => setOpenPassengers(false)}
              inputType="ROOMS & GUESTS"
            />
          )}
        </div>

        <button onClick={handleSearch} className={styles.searchBtna}>SEARCH</button>
      </div>
      {openCalendar && (
        <MobileViewCalender
          onClose={() => setOpenCalendar(false)}
          inputType="roundtrip"
          selectedDeparture={ensureDate(checkIn)}
          selectedReturn={ensureDate(checkOut)}
          onSelectDate={({ departure, returnDate }) => {
            if (departure) setCheckIn(departure);
            if (returnDate) {
              const departureDate = ensureDate(departure || checkIn);
              const selectedReturnDate = ensureDate(returnDate);

              setCheckOut(
                departureDate &&
                  selectedReturnDate &&
                  selectedReturnDate <= departureDate
                  ? getNextDate(departureDate)
                  : returnDate
              );
            }
            setOpenCalendar(false);
          }}
        />
      )}
    </div>
  );
};

export default HotelSearchMobile;

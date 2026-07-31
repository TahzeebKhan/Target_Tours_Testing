"use client";
import React, { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import DateField from "../DateField";
import HotelLocationSheet from "@/shared/components/hotelLocationSheet/HotelLocationSheet";
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
  const [openPassengers, setOpenPassengers] = useState(false);
  const checkInInputRef = useRef(null);
  const checkOutInputRef = useRef(null);

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
    const sourceDate = ensureDate(date);
    if (!sourceDate) return null;

    const nextDate = new Date(sourceDate.getTime());
    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate;
  };

  const toDateInputValue = (date) => {
    const value = ensureDate(date);
    if (!value || Number.isNaN(value.getTime())) return "";

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayInputValue = toDateInputValue(new Date());

  const openNativeDatePicker = (event) => {
    if (typeof event.currentTarget.showPicker !== "function") return;

    event.preventDefault();
    event.currentTarget.showPicker();
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

        <div className={styles.fromToCont}>
          <div style={{ position: "relative" }}>
            <DateField
              label="Check in"
              placeholder="ADD DATES"
              value={formatDate(checkIn)}
              name="departureDate"
            />
            <input
              ref={checkInInputRef}
              type="date"
              aria-label="Check in"
              value={toDateInputValue(checkIn)}
              min={todayInputValue}
              onPointerDown={openNativeDatePicker}
              onChange={(event) => {
                const nextCheckIn = ensureDate(event.target.value);
                if (!nextCheckIn) return;

                setCheckIn(nextCheckIn);
                const currentCheckOut = ensureDate(checkOut);
                if (currentCheckOut && currentCheckOut <= nextCheckIn) {
                  setCheckOut(getNextDate(nextCheckIn));
                }
              }}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
                cursor: "pointer",
                zIndex: 2,
              }}
            />
          </div>
          <div style={{ position: "relative" }}>
            <DateField
              label="Check out"
              placeholder="ADD DATES"
              value={formatDate(checkOut)}
              name="returnDate"
            />
            <input
              ref={checkOutInputRef}
              type="date"
              aria-label="Check out"
              value={toDateInputValue(checkOut)}
              min={
                toDateInputValue(
                  getNextDate(checkIn) || ensureDate(todayInputValue),
                )
              }
              onPointerDown={openNativeDatePicker}
              onChange={(event) => {
                const nextCheckOut = ensureDate(event.target.value);
                if (nextCheckOut) setCheckOut(nextCheckOut);
              }}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
                cursor: "pointer",
                zIndex: 2,
              }}
            />
          </div>
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
    </div>
  );
};

export default HotelSearchMobile;

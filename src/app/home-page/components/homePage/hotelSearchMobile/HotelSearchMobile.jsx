"use client"
import React, { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import DateField from '../DateField';
import FromLocationSheet from '@/app/components/fromLocationSheet/FromLocationSheet';
import MobileViewCalender from '@/app/components/mobileViewCalendar/MobileViewCalender';
import PassengersPopup from '@/app/components/passengersPopUp/PassengersPopup';

const HotelSearchMobile = ({
    styles,
    to,
    setTo,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    truncate
}) => {
    const travellerRef = useRef(null);
    const [openTo, setOpenTo] = useState(false);
    const [openCalendar, setOpenCalendar] = useState(false);
    const [openPassengers, setOpenPassengers] = useState(false);

    // Internal passenger state for Hotel search
    const [passengers, setPassengers] = useState({
        adult: 1,
        children: 0,
        infant: 0,
    });

    const totalPassengers = passengers.adult + passengers.children + passengers.infant;

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
            <div className={styles.flightSearchCard}>
                <div className={`${styles.field} ${styles.field3}`} onClick={() => setOpenTo(true)}>
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
                    <FromLocationSheet onClose={() => setOpenTo(false)} inputType="Where to" onSelectCity={(value) => setTo(value)} />
                )}

                <div className={styles.fromToCont} onClick={() => setOpenCalendar(true)}>
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
                            {truncate(`${totalPassengers} Guest${totalPassengers > 1 ? 's' : ''}, ${totalPassengers} Room${totalPassengers > 1 ? 's' : ''}`, 17)}
                        </div>

                        <ChevronDown
                            className={`${styles.chevron} ${openPassengers ? styles.openChevron : styles.closeChevron}`}
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

                <button className={styles.searchBtna}>SEARCH</button>
            </div>
            {openCalendar && (
                <MobileViewCalender
                    onClose={() => setOpenCalendar(false)}
                    inputType="roundtrip"
                    selectedDeparture={ensureDate(checkIn)}
                    selectedReturn={ensureDate(checkOut)}
                    onSelectDate={({ departure, returnDate }) => {
                        if (departure) setCheckIn(departure);
                        if (returnDate) setCheckOut(returnDate);
                        setOpenCalendar(false);
                    }}
                />
            )}
        </div>
    );
};

export default HotelSearchMobile;

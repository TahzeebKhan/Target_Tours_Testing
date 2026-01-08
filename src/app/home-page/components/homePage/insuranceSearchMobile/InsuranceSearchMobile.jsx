"use client"
import React, { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import DateField from '../DateField';
import TravellerSelector from '../TravellerSelector';
import MobileViewCalender from '@/app/components/mobileViewCalendar/MobileViewCalender';
import PassengersPopup from '@/app/components/passengersPopUp/PassengersPopup';

const InsuranceSearchMobile = ({
    styles,
    travellerDestination,
    setTravellerDestination,
    TravellerDestinationOptions,
    departureDate,
    setDepartureDate,
    returnDate,
    setReturnDate,
    truncate
}) => {
    const travellerRef = useRef(null);
    const [openCalendar, setOpenCalendar] = useState(false);
    const [openPassengers, setOpenPassengers] = useState(false);

    // Internal passenger state for Insurance search
    const [passengers, setPassengers] = useState({
        adult: 1,
        children: 0,
        infant: 0,
    });
    const [travelClass, setTravelClass] = useState("Economy");

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
                <TravellerSelector
                    travellerClass={travellerDestination}
                    setTravellerClass={setTravellerDestination}
                    travellerOptions={TravellerDestinationOptions}
                    styles={styles}
                    name="TRAVEL DESTINATION"
                    enableEllipsis={false}
                />

                <div className={styles.fromToCont} onClick={() => setOpenCalendar(true)}>
                    <DateField
                        label="TRAVEL DATE"
                        placeholder="ADD DATES"
                        value={formatDate(departureDate)}
                        name="TRAVELDATE"
                    // min={new Date().toISOString().split("T")[0]}
                    // onChange={(e) => setDepartureDate(e.target.value)}
                    />

                    <DateField
                        label="TRAVEL DATE"
                        placeholder="ADD DATES"
                        value={formatDate(returnDate)}
                        name="TRAVELDATE"
                    // min={new Date().toISOString().split("T")[0]}
                    // onChange={(e) => setReturnDate(e.target.value)}
                    />
                </div>
                {openCalendar && (
                    <MobileViewCalender
                        onClose={() => setOpenCalendar(false)}
                        inputType="roundtrip"
                        selectedDeparture={ensureDate(departureDate)}
                        selectedReturn={ensureDate(returnDate)}
                        onSelectDate={({ departure, returnDate }) => {
                            if (departure) setDepartureDate(departure);
                            if (returnDate) setReturnDate(returnDate);
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
                    <div className={styles.lable}>TRAVELLERS</div>
                    <div className={styles.iconCont}>
                        <div className={styles.contant}>
                            {truncate(`${totalPassengers} Traveller${totalPassengers > 1 ? 's' : ''}, ${travelClass}`, 17)}
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
                            inputType="TRAVELLERS"
                        />
                    )}
                </div>

                <button className={styles.searchBtna}>SEARCH</button>
            </div>
        </div>
    );
};

export default InsuranceSearchMobile;

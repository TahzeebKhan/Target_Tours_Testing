"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./TravelInsurance.module.css";
import { ChevronDown } from "lucide-react";
import { CalendarSVG } from "@/app/flights/components/SVGFile";

import TravellerSelector from "@/app/home-page/components/homePage/TravellerSelector";
import PassengerClassSelector from "@/app/home-page/components/homePage/PassengerClassSelector";
import DateCalendarModal from "@/app/home-page/components/homePage/calendar/DateCalendarModal";
import CalendarMonths from "@/app/home-page/components/homePage/calendar/CalendarMonths";

const TravelInsuranceSearch = () => {
    const travellerRef = useRef(null);
    const calendarRef = useRef(null);

    const [travellerDestination, setTravellerDestination] = useState("SELECT DESTINATION");
    const [travellerOpen, setTravellerOpen] = useState(false);

    const [insuranceStartDate, setInsuranceStartDate] = useState("");
    const [insuranceEndDate, setInsuranceEndDate] = useState("");
    const [showInsuranceCalendar, setShowInsuranceCalendar] = useState(false);
    const [activeCalendarField, setActiveCalendarField] = useState("start"); // 'start' or 'end'

    const [passengers, setPassengers] = useState({
        adult: 1,
        child: 0,
    });

    const totalPassengers = passengers.adult + passengers.child;

    const TravellerDestinationOptions = [
        { value: "india", label: "India" },
        { value: "international", label: "International" },
    ];

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return `${String(d.getDate()).padStart(2, "0")}-${d
            .toLocaleString("en-US", { month: "short" })
            .toUpperCase()}-${d.getFullYear()}`;
    };

    const handleInsuranceDateClick = (date) => {
        if (activeCalendarField === "start") {
            setInsuranceStartDate(date);
            // If end date is before new start date, clear it
            if (insuranceEndDate && new Date(date) > new Date(insuranceEndDate)) {
                setInsuranceEndDate("");
            }
            setShowInsuranceCalendar(false);
        } else {
            // For end date
            if (insuranceStartDate && new Date(date) >= new Date(insuranceStartDate)) {
                setInsuranceEndDate(date);
                setShowInsuranceCalendar(false);
            }
        }
    };

    const handleStartDateClick = (e) => {
        e.stopPropagation();
        setActiveCalendarField("start");
        setShowInsuranceCalendar(true);
    };

    const handleEndDateClick = (e) => {
        e.stopPropagation();
        setActiveCalendarField("end");
        setShowInsuranceCalendar(true);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                travellerRef.current &&
                !travellerRef.current.contains(e.target)
            ) {
                setTravellerOpen(false);
            }

            if (
                calendarRef.current &&
                !calendarRef.current.contains(e.target)
            ) {
                setShowInsuranceCalendar(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [travelClass, setTravelClass] = useState("Economy");
    const [travellerOpend, setTravellerOpend] = useState(false);

    return (
        <div className={styles.glass_panel}>
            <div className={styles.searchRow}>

                {/* Travel Destination */}
                <TravellerSelector
                    travellerClass={travellerDestination}
                    setTravellerClass={setTravellerDestination}
                    travellerOptions={TravellerDestinationOptions}
                    styles={styles}
                    name="TRAVEL DESTINATION"
                    className={`${styles.pos1}`}
                    enableEllipsis={false}
                />

                {/* Start Date */}
                <div className={`${styles.fromBtn} ${styles.pos2} ${styles.swapField} ${styles.calendarAnchor}`}>
                    <div className={`${styles.lable} ${styles.labelFade}`}>
                       START DATE
                    </div>

                    <div
                      className={`${styles.dateInputWrapper} ${styles.contentFade}`}
                      onClick={handleStartDateClick}
                    >
                      <input
                        type="text"
                        readOnly
                        className={styles.contant}
                        placeholder="ADD DATES"
                        value={formatDate(insuranceStartDate)}
                      />
                      <button type="button" className={styles.calendarIcon}>
                        <CalendarSVG />
                      </button>
                    </div>
                </div>

                {/* Return Date */}
                <div className={`${styles.fromBtn} ${styles.pos3} ${styles.swapField} ${styles.calendarAnchor}`}>
                    <div className={`${styles.lable} ${styles.labelFade}`}>
                       RETURN DATE
                    </div>

                    <div
                      className={`${styles.dateInputWrapper} ${styles.contentFade}`}
                      onClick={handleEndDateClick}
                    >
                      <input
                        type="text"
                        readOnly
                        className={styles.contant}
                        placeholder="ADD DATES"
                        value={formatDate(insuranceEndDate)}
                      />
                      <button type="button" className={styles.calendarIcon}>
                        <CalendarSVG />
                      </button>
                    </div>
                </div>

                {/* Insurance Calendar Modal */}
                {showInsuranceCalendar && (
                  <DateCalendarModal
                    mode="roundtrip"
                    onModeChange={() => { }}
                    onClose={() => setShowInsuranceCalendar(false)}
                  >
                    <div ref={calendarRef}>
                      <CalendarMonths
                        startDate={insuranceStartDate}
                        endDate={insuranceEndDate}
                        onDateClick={handleInsuranceDateClick}
                      />
                    </div>
                  </DateCalendarModal>
                )}

                {/* Travellers */}
                <div
                    ref={travellerRef}
                    className={`${styles.fromBtn} ${styles.fromBtn2}`}
                    onClick={() => setTravellerOpend((o) => !o)}
                >
                    <div className={styles.lable}>TRAVELLERS</div>
                    <div className={styles.iconCont}>
                        <div className={styles.contant}>
                            {totalPassengers} Traveller{totalPassengers > 1 ? "s" : ""}
                        </div>
                        <ChevronDown
                            size={16}
                            className={`${styles.chevron} ${travellerOpend ? styles.openChevron : ""
                                }`}
                        />
                    </div>

                    <PassengerClassSelector
                        open={travellerOpend}
                        setOpen={setTravellerOpend}
                        passengers={passengers}
                        setPassengers={setPassengers}
                        travelClass={travelClass}
                        setTravelClass={setTravelClass}
                      />
                </div>

                {/* Search */}
                <div className={styles.searchBtn}>
                    SEARCH
                </div>
            </div>
        </div>
    );
};

export default TravelInsuranceSearch;
"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./TravelInsurance.module.css";
import { ChevronDown } from "lucide-react";
import { CalendarSVG } from "@/app/flights/components/SVGFile";

import TravellerSelector from "@/app/home-page/components/homePage/TravellerSelector";
import PassengerClassSelector from "@/app/home-page/components/homePage/PassengerClassSelector";
import DateCalendarModal from "@/app/home-page/components/homePage/calendar/DateCalendarModal";
import CalendarMonths from "@/app/home-page/components/homePage/calendar/CalendarMonths";
import MobileViewCalender from "@/app/components/mobileViewCalendar/MobileViewCalender";
import SuggestionBox from "@/app/home-page/components/homePage/SuggestionBox";
import { useRouter } from "next/navigation";

const TravelInsuranceSearch = () => {
  const travellerRef = useRef(null);
  const calendarRef = useRef(null);

  const [travellerDestination, setTravellerDestination] =
    useState("SELECT DESTINATION");
  const [travellerOpen, setTravellerOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);

  const [insuranceStartDate, setInsuranceStartDate] = useState("");
  const [insuranceEndDate, setInsuranceEndDate] = useState("");
  const [showInsuranceCalendar, setShowInsuranceCalendar] = useState(false);
  const [activeCalendarField, setActiveCalendarField] = useState("start"); // 'start' or 'end'

  const [passengers, setPassengers] = useState({
    adult: 1,
    child: 0,
  });

  const totalPassengers = passengers.adult + passengers.child;

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
      if (
        insuranceStartDate &&
        new Date(date) >= new Date(insuranceStartDate)
      ) {
        setInsuranceEndDate(date);
        setShowInsuranceCalendar(false);
      }
    }
  };

  const handleStartDateClick = (e) => {
    e.stopPropagation();
    setActiveCalendarField("start");

    if (isMobile) {
      setOpenMobileCalendar(true);
    } else {
      setShowInsuranceCalendar(true);
    }
  };

  const handleEndDateClick = (e) => {
    e.stopPropagation();
    setActiveCalendarField("end");

    if (isMobile) {
      setOpenMobileCalendar(true);
    } else {
      setShowInsuranceCalendar(true);
    }
  };

  const useIsMobile = (breakpoint = 1024) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const check = () => setIsMobile(window.innerWidth < breakpoint);
      check(); // initial
      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }, [breakpoint]);

    return isMobile;
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (travellerRef.current && !travellerRef.current.contains(e.target)) {
        setTravellerOpen(false);
      }

      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowInsuranceCalendar(false);
        setOpenMobileCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [travelClass, setTravelClass] = useState("Economy");
  const [travellerOpend, setTravellerOpend] = useState(false);

  const isMobile = (() => {
    const [mobile, setMobile] = useState(false);

    useEffect(() => {
      const check = () => setMobile(window.innerWidth < 1024);
      check();
      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }, []);

    return mobile;
  })();
  const [openMobileCalendar, setOpenMobileCalendar] = useState(false);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (travellerRef.current && !travellerRef.current.contains(e.target)) {
        setTravellerOpend(false);
        setDestinationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const destinationSuggestions = [
    {
      label: "MUMBAI, INDIA",
      detail: "Chhatrapati Shivaji Maharaj International Airport",
      code: "BOM",
      value: "Mumbai",
    },
    {
      label: "PUNE, INDIA",
      detail: "Pune International Airport",
      code: "PNQ",
      value: "Pune",
    },
    {
      label: "DELHI, INDIA",
      detail: "Indira Gandhi International Airport",
      code: "DEL",
      value: "Delhi",
    },
    {
      label: "INTERNATIONAL",
      detail: "Travel outside India",
      code: "INTL",
      value: "International",
    },
  ];
  const destinationRef = useRef(null);
  const router = useRouter();
  return (
    <>
      <div className={styles.glass_panel}>
        <div className={styles.searchRow}>
          {/* Travel Destination */}
          {/* <TravellerSelector
            travellerClass={travellerDestination}
            setTravellerClass={setTravellerDestination}
            travellerOptions={TravellerDestinationOptions}
            styles={styles}
            name="TRAVEL DESTINATION"
            className={`${styles.pos1}`}
            enableEllipsis={false}
          /> */}
          <div
            ref={destinationRef}
            className={`${styles.fromBtn} ${styles.pos2} ${styles.swapField}`}
            style={{ position: "relative" }}
            onClick={() => setDestinationOpen(true)}
          >
            <div className={`${styles.lable} ${styles.labelFade}`}>
              TRAVEL DESTINATION
            </div>

            <div className={`${styles.dateInputWrapper} ${styles.contentFade}`}>
              <input
                type="text"
                readOnly
                className={styles.contant}
                placeholder="SELECT DESTINATION"
                value={travellerDestination}
              />
              <ChevronDown
                className={`${styles.chevron} ${
                  destinationOpen ? styles.openChevron : ""
                }`}
                size={14}
              />
            </div>

            {destinationOpen && (
              <SuggestionBox
                boxRef={destinationRef}
                heading="POPULAR DESTINATIONS"
                suggestions={destinationSuggestions}
                onSelect={(s) => {
                  setTravellerDestination(s.value);
                  setDestinationOpen(false);
                }}
              />
            )}
          </div>

          <div className={styles.dateGroup}>
            {/* Start Date */}
            <div
              className={`${styles.fromBtn} ${styles.pos2} ${styles.swapField} ${styles.calendarAnchor}`}
            >
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
            <div
              className={`${styles.fromBtn} ${styles.pos3} ${styles.swapField} ${styles.calendarAnchor}`}
            >
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
              <div className={styles.calendarContainer}>
                {" "}
                <DateCalendarModal
                  mode="roundtrip"
                  onModeChange={() => {}}
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
              </div>
            )}
          </div>
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
                className={`${styles.chevron} ${
                  travellerOpend ? styles.openChevron : ""
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
          <div
            onClick={() => router && router.push("/travel-insurance-booking")}
            className={styles.searchBtn}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.9994 16.2923L20.8536 20.1464C21.0488 20.3417 21.0488 20.6583 20.8536 20.8536C20.6583 21.0488 20.3417 21.0488 20.1464 20.8536L16.2923 16.9994C14.882 18.2445 13.0292 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11C19 13.0292 18.2445 14.882 16.9994 16.2923ZM11 18C14.866 18 18 14.866 18 11C18 7.13401 14.866 4 11 4C7.13401 4 4 7.13401 4 11C4 14.866 7.13401 18 11 18Z"
                fill="#E4E6E8"
              />
            </svg>
          </div>
        </div>
      </div>
      {openMobileCalendar && isMobile && (
        <MobileViewCalender
          onClose={() => setOpenMobileCalendar(false)}
          inputType="roundtrip"
          selectedDeparture={insuranceStartDate}
          selectedReturn={insuranceEndDate}
          onSelectDate={({ departure, returnDate }) => {
            if (departure) setInsuranceStartDate(departure);
            if (returnDate) setInsuranceEndDate(returnDate);
            setOpenMobileCalendar(false);
          }}
        />
      )}
    </>
  );
};

export default TravelInsuranceSearch;

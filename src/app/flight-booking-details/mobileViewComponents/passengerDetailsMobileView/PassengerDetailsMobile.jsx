"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./PassengerDetailsMobile.module.css";
import FlightTimeline from "../components/flightTimeline/FlightTimeline";
import FlightTabs from "../components/FlightTabs/FlightTabs";
import FlightSection from "../components/FlightSection/FlightSection";
import TravelInsuranceOption from "../../components/passengerDetails/fareDetailsExpandable/component/travelInsuranceOption/TravelInsuranceOption";
import CancellationPenalty from "../../components/passengerDetails/fareDetailsExpandable/component/cancellationPenalty/CancellationPenalty";
import { useFlightBooking } from "../../FlightBookingContext";
import FareDetailsPop from "../components/fareDetailsPop/FareDetailsPop";
import BaggageRules from "../components/baggageRules/BaggageRules";
import { useRouter } from "next/navigation";
import PriceSummary from "@/features/profile/components/PriceSummary";
import TravelerDetailsMobileView from "./TravelerDetailsMobileView";
import {
  buildMobileFareDetails,
  buildMobilePriceSummary,
} from "../../utils/mobilePriceSummary";
import { getBookingDetailsView } from "@/features/flights/utils/flightBookingSession";

const getFlightTimelineData = (flight) => ({
  departure: flight?.departure || {
    date: "N/A",
    time: "N/A",
    airport: "N/A",
    terminal: "Terminal N/A",
    city: "N/A",
  },
  arrival: flight?.arrival || {
    date: "N/A",
    time: "N/A",
    airport: "N/A",
    terminal: "Terminal N/A",
    city: "N/A",
  },
  duration: flight?.duration || {
    hours: "00",
    minutes: "00",
  },
  stops: flight?.stops || "N/A",
});

const getFlightSectionData = (flight, type) => {
  if (!flight) return null;

  return {
    type,
    airline: flight.airline || {
      name: "N/A",
      code: "N/A",
      logo: "/images/dummyFlightlogo.png",
    },
    aircraft: flight.aircraft || "N/A",
    cabinClass: flight.travelClass || "N/A",
    fareType: flight.flexiPlusFare || "",
    date: flight.departure?.date || "N/A",
    departure: {
      time: flight.departure?.time || "N/A",
      city: flight.departure?.airport || flight.departure?.city || "N/A",
    },
    arrival: {
      time: flight.arrival?.time || "N/A",
      city: flight.arrival?.airport || flight.arrival?.city || "N/A",
    },
    duration: flight.duration || {
      hours: "00",
      minutes: "00",
    },
    stops: flight.stops || "N/A",
  };
};

const PassengerDetailsMobile = ({ fromBaggage }) => {
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [showFareDetailsPopup, setShowFareDetailsPopup] = useState(false);
  const [showPriceSummaryPopup, setShowPriceSummaryPopup] = useState(false);
  const [showBaggageRulesPopup, setShowaggageRulesPopup] = useState(false);

  const [showPassengerInfo, setShowPassengerInfo] = useState(false);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(0);
  const { setCurrentStep, prices, bookingSession, travelerDetails } = useFlightBooking();
  const priceSummary = useMemo(
    () => buildMobilePriceSummary({ prices, bookingSession, travelerDetails }),
    [bookingSession, prices, travelerDetails]
  );
  const fareDetails = useMemo(
    () => buildMobileFareDetails({ prices, bookingSession, travelerDetails }),
    [bookingSession, prices, travelerDetails]
  );
  const bookingView = useMemo(
    () => getBookingDetailsView(bookingSession),
    [bookingSession]
  );
  const header = bookingView?.header || {};
  const departureFlight = bookingView?.departureFlight || {};
  const returnFlight = bookingView?.returnFlight || null;
  const multiCityFlightSections = bookingView?.isMultiCity
    ? (bookingView?.multiCityFlights || []).map((flight, index) =>
        getFlightSectionData(flight, `ROUTE ${index + 1}`)
      )
    : [];
  const summaryFlight = getFlightTimelineData(departureFlight);
  const departureFlightSection = getFlightSectionData(
    departureFlight,
    "DEPARTURE"
  );
  const returnFlightSection = getFlightSectionData(returnFlight, "RETURN");
  const airline = departureFlight?.airline || {};
  const flightDetailsRef = useRef(null);
  const travelInsuranceRef = useRef(null);
  const cancellationRef = useRef(null);
  const tabsRef = useRef(null);
  const scrollWithStickyOffset = (element) => {
    if (!element) return;

    const stickyHeight = tabsRef.current?.offsetHeight || 0;

    const y =
      element.getBoundingClientRect().top +
      window.pageYOffset -
      stickyHeight -
      12; // small breathing space

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (activeTab === 0 && flightDetailsRef.current) {
      scrollWithStickyOffset(flightDetailsRef.current);
    }

    if (activeTab === 2 && travelInsuranceRef.current) {
      scrollWithStickyOffset(travelInsuranceRef.current);
    }

    if (activeTab === 3 && cancellationRef.current) {
      scrollWithStickyOffset(cancellationRef.current);
    }
  }, [activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setShowStickyHeader(true);
      } else {
        setShowStickyHeader(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (showPassengerInfo) {
    return (
      <TravelerDetailsMobileView onClose={() => setShowPassengerInfo(false)} />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tripDetailsContainer}>
        <div className={styles.tripDetailsHeader}>
          <img
            style={{ cursor: "pointer" }}
            onClick={() => {
              if (!router) return;
              else {
                router.push("/flights");
              }
            }}
            src="/icons/leftArrowTrip.svg"
            alt=""
          />
          <p className={styles.tripDetails}>Trip Details</p>
        </div>
      </div>
      <div
        className={`${styles.tripDetailsContainer} ${
          showStickyHeader ? styles.stickyVisible : styles.stickyHidden
        }`}
      >
        <div className={styles.tripDetailsHeader}>
          <img
            style={{ cursor: "pointer" }}
            onClick={() => {
              if (!router) return;
              else {
                router.push("/flights");
              }
            }}
            src="/icons/leftArrowTrip.svg"
            alt=""
          />
          <div
            className={`${styles.TripCardHeader} ${styles.TripCardHeaderNav}`}
          >
            <div className={styles.TripCardHeaderDetails}>
              <p className={styles.TripCardHeaderDetailsItemText}>{header.fromName || "N/A"}</p>
              <span className={styles.TripCardHeaderDetailsItemCode}>
                ({header.fromCode || "N/A"})
              </span>

              <img src="/icons/right-arrow.svg" alt="" />
              <p className={styles.TripCardHeaderDetailsItemText}>{header.toName || "N/A"}</p>
              <span className={styles.TripCardHeaderDetailsItemCode}>
                ({header.toCode || "N/A"})
              </span>
            </div>

            <div className={styles.TripCardHeaderBookingDate}>
              <p>{header.date || "N/A"}</p>
              <div className={styles.PassengerDetailsMobile_navDot_M_nar}>
                <span className={styles.navDot}></span>
                <p>1 Traveller</p>
              </div>
              <div className={styles.PassengerDetailsMobile_navDot_M_nar}>
                <span className={styles.navDot}></span>
                <p>{header.cabinClass || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.TripCardContainer}>
        <div className={styles.TripCard}>
          <div className={styles.TripCardHeader}>
            <div className={styles.TripCardHeaderDetails}>
              <p className={styles.TripCardHeaderDetailsItemText}>{header.fromName || "N/A"}</p>
              <span className={styles.TripCardHeaderDetailsItemCode}>
                ({header.fromCode || "N/A"})
              </span>

              <img src="/icons/right-arrow.svg" alt="" />
              <p className={styles.TripCardHeaderDetailsItemText}>{header.toName || "N/A"}</p>
              <span className={styles.TripCardHeaderDetailsItemCode}>
                ({header.toCode || "N/A"})
              </span>
            </div>
            <div className={styles.TripCardHeaderDate}>{header.date || "N/A"}</div>
          </div>
          <div className={styles.TripFlightDetailsCard}>
            <div className={styles.TripFlightDetailsCardCont}>
              <div className={styles.TripFlightDetailsCardImage}>
                <img src={airline.logo || "/images/dummyFlightlogo.png"} alt={airline.name || ""} />
              </div>
              <div className={styles.AirLineDetails}>
                <div className={styles.AirLineDetailsItem}>
                  <span className={styles.AirLineDetailsItemText}>
                    {airline.name || "N/A"}
                  </span>
                  <div className={styles.dot}></div>
                  <span className={styles.AirLineCode}>{airline.code || "N/A"}</span>
                </div>
                <div className={styles.AirLineDetailsItem}>
                  <span className={styles.AirLineBoeing}>
                    {departureFlight?.aircraft || "N/A"}
                  </span>
                  <div className={styles.dot}></div>
                  <span className={styles.AirLineDetailsItemCode}>
                    {header.cabinClass || departureFlight?.travelClass || "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.br}></div>
            <FlightTimeline flight={summaryFlight} />
            <div className={styles.br}></div>

            <div className={styles.FareDetailsTag}>
              <span onClick={() => setShowFareDetailsPopup(true)}>
                Fare Details
              </span>
              <div className={styles.blueDot}></div>
              <span onClick={() => setShowaggageRulesPopup(true)}>
                {" "}
                Baggage Rules
              </span>
            </div>
          </div>
        </div>
        {/* <div> */}
        <div className={styles.stickytabsCont} ref={tabsRef}>
          <FlightTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onFlightDetailsClick={() => setShowFareDetailsPopup(true)}
            onTravelerDetailsClick={() => setShowPassengerInfo(true)}
          />
        </div>

        {showFareDetailsPopup && (
          <FareDetailsPop
            onClose={() => setShowFareDetailsPopup(false)}
            fareDetails={fareDetails}
          />
        )}
        {showBaggageRulesPopup && (
          <BaggageRules onClose={() => setShowaggageRulesPopup(false)} />
        )}
        {/* </div> */}

        <div className={styles.flightDepartureReturenDetailsContianerWrapper}>
          <div
            ref={flightDetailsRef}
            className={styles.flightDepartureReturenDetailsContianer}
          >
            {bookingView?.isMultiCity ? (
              multiCityFlightSections.map((flightSection, index) => (
                <React.Fragment key={`${flightSection?.type || "route"}-${index}`}>
                  {index > 0 && <div className={styles.br}></div>}
                  <FlightSection flight={flightSection} />
                </React.Fragment>
              ))
            ) : (
              <FlightSection flight={departureFlightSection} />
            )}
            {!bookingView?.isMultiCity && returnFlightSection && (
              <>
                <div className={styles.br}></div>
                <FlightSection flight={returnFlightSection} />
              </>
            )}
          </div>

          <div
            ref={travelInsuranceRef}
            className={styles.travelInsuranceContainer}
          >
            <h2 className={styles.travelInsuranceHeading}>
              Add Travel Insurance (₹399/Person)
            </h2>
            <div>
              <TravelInsuranceOption />
            </div>
          </div>

          <div
            ref={cancellationRef}
            className={`${styles.travelInsuranceContainer} `}
          >
            <h2 className={styles.travelInsuranceHeading}>
              Cancellation & Date Change Policy
            </h2>
            <div>
              <CancellationPenalty />
            </div>
          </div>
        </div>
      </div>
      {showPriceSummaryPopup && (
        <PriceSummary
          onClose={() => setShowPriceSummaryPopup(false)}
          lineItems={priceSummary.lineItems}
          totalAmount={priceSummary.totalAmount}
        />
      )}
      <div className={styles.footer}>
        {/* LEFT */}
        <div className={styles.footerContainer}>
          <div className={styles.amountSection}>
            <div className={styles.label}>
              Total Amount
              <span
                onClick={() => setShowPriceSummaryPopup(true)}
                className={styles.infoIcon}
              >
                !
              </span>
            </div>
            <div className={styles.amount}>{priceSummary.totalAmount}</div>
          </div>

          {/* RIGHT */}
          <button
            onClick={() => setShowPassengerInfo(true)}
            className={styles.continueBtn}
          >
            CONTINUE BOOKING
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassengerDetailsMobile;

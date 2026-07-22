"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFlightBooking } from "../../FlightBookingContext";
import styles from "./PaymentPage.module.css";
import TripSummaryExpandable from "./components/TripSummaryExpandable";
import PassengerInfo from "./components/PassengerInfo";
import ExtrasSummary from "./components/ExtrasSummary";
import PayWithOptions from "./components/PayWithOptions";
import BookingSuccessModal from "./components/BookingSuccessModal";
import PriceSummary from "@/features/profile/components/PriceSummary";
import {
  clearFlightBookingSession,
  getBookingDetailsView,
} from "@/features/flights/utils/flightBookingSession";
import { resolveAirlineLogo } from "@/features/flights/utils/airlineLogos";
import { buildMobilePriceSummary } from "../../utils/mobilePriceSummary";
import { useAuth } from "@/app/context/AuthContext";
import LoginPopup from "@/app/account/loginPopUp/LoginPopup";
import SignupPopup from "@/app/account/signUpPopUp/SignupPopup";

const formatSummaryDuration = (duration = {}) =>
  `${duration.hours || "00"}h ${duration.minutes || "00"}m`;

const cleanValue = (value) => {
  const text = String(value || "").trim();
  return text && text.toUpperCase() !== "N/A" ? text : "";
};

const getAirportCode = (airport) => {
  const value = cleanValue(airport);
  if (!value) return "";
  return value.split(" - ")[0].split(" → ")[0].trim();
};

const formatAirportLabel = (endpoint = {}) => {
  const code = getAirportCode(endpoint.airport);
  const city = cleanValue(endpoint.city);
  if (city && code && city.toUpperCase() !== code.toUpperCase()) {
    return `${city} (${code})`;
  }
  return city || code || "Airport unavailable";
};

const getDynamicAirlineLogo = (airline = {}) =>
  resolveAirlineLogo({
    name: airline?.name,
    code: airline?.carrierCode || airline?.code || airline?.flightNo,
    logo:
      airline?.logo === "/images/dummyFlightlogo.png" ||
      airline?.logo === "/images/AirlineLogos.png"
        ? ""
        : airline?.logo,
  });

const buildTripCardData = (flight, selectedFare) => {
  if (!flight) return null;

  return {
    airline: {
      name: flight.airline?.name || "N/A",
      code: flight.airline?.code || "N/A",
      aircraft: flight.aircraft || "N/A",
      logo: getDynamicAirlineLogo(flight.airline),
    },
    fareType:
      selectedFare?.name ||
      selectedFare?.fareName ||
      selectedFare?.FCType ||
      flight.flexiPlusFare ||
      "N/A",
    cabin: String(flight.travelClass || "N/A").toUpperCase(),
    segments: [
      {
        date: String(flight.departure?.date || "N/A").toUpperCase(),
        time: flight.departure?.time || "N/A",
        city: flight.departure?.airport || "N/A",
        terminal: flight.departure?.terminal || "Terminal N/A",
        terminalName: flight.departure?.city || "N/A",
      },
      {
        duration: {
          hours: flight.duration?.hours || "00",
          mins: flight.duration?.minutes || "00",
        },
        nonStop: /non/i.test(flight.stops || ""),
      },
      {
        date: String(flight.arrival?.date || "N/A").toUpperCase(),
        time: flight.arrival?.time || "N/A",
        city: flight.arrival?.airport || "N/A",
        terminal: flight.arrival?.terminal || "Terminal N/A",
        terminalName: flight.arrival?.city || "N/A",
      },
    ],
    facilities: [
      "Baggage 15 kg, Cabin 7 kg",
      "In-flight entertainment",
      "Power & USB Port",
    ],
  };
};

const PaymentPage = () => {
  const { isLoggedIn } = useAuth();
  const {
    setCurrentStep,
    submitItinerary,
    itineraryLoading,
    bookingSession,
    setBookingSession,
    paymentSuccessData,
    setPaymentSuccessData,
    prices,
    travelerDetails,
    setTravelerDetails,
    bookingContactDetails,
    setBookingContactDetails,
    baggage,
    setBaggage,
    meals,
    setMeals,
    setSeats,
    paymentMethod,
    setPaymentMethod,
  } = useFlightBooking();
  const router = useRouter();
  const [openTab, setOpenTab] = useState("passengerInfo");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState("login");
  const bookingView = useMemo(() => getBookingDetailsView(bookingSession), [bookingSession]);
  const selectedFare = bookingSession?.selectedFare || {};
  const header = bookingView?.header || {};
  const isMultiCity = Boolean(bookingView?.isMultiCity);
  const multiCityFlights = isMultiCity
    ? bookingView?.multiCityFlights || []
    : [];
  const multiCityFares = Array.isArray(selectedFare?.multiCityFares)
    ? selectedFare.multiCityFares
    : [];
  const tripSummaryData = useMemo(() => {
    if (isMultiCity) {
      return {
        isMultiCity: true,
        onwardCards: multiCityFlights
          .map((flight, index) =>
            buildTripCardData(flight, multiCityFares[index] || selectedFare)
          )
          .filter(Boolean),
        returnCards: [],
      };
    }

    return {
      isMultiCity: false,
      onwardCards: [
        buildTripCardData(bookingView?.departureFlight, selectedFare),
      ].filter(Boolean),
      returnCards: [
        buildTripCardData(bookingView?.returnFlight, selectedFare),
      ].filter(Boolean),
    };
  }, [bookingView, isMultiCity, multiCityFares, multiCityFlights, selectedFare]);
  const priceSummary = useMemo(
    () => buildMobilePriceSummary({ prices, bookingSession, travelerDetails }),
    [bookingSession, prices, travelerDetails]
  );
  const summaryFlight = bookingView?.departureFlight;

  const [showPriceSummaryPopup, setShowPriceSummaryPopup] = useState(false);
  const handleContinuePayment = () => {
    if (!isLoggedIn) {
      setAuthView("login");
      setShowAuthModal(true);
      return;
    }

    submitItinerary(paymentMethod);
  };
  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthView("login");
  };
  const toggleTab = (tabName) => {
    setOpenTab((prev) => (prev === tabName ? null : tabName));
  };
  const handleBookingSuccessClose = () => {
    clearFlightBookingSession();
    setPaymentSuccessData(null);
    setBookingSession(null);
    setTravelerDetails([]);
    setBookingContactDetails({});
    setBaggage([]);
    setMeals([]);
    setSeats([]);
    router.push("/");
  };

  return (
    <>
      <BookingSuccessModal
        isOpen={Boolean(paymentSuccessData)}
        onClose={handleBookingSuccessClose}
        bookingView={bookingView}
        paymentSuccessData={paymentSuccessData}
        prices={prices}
        travelerDetails={travelerDetails}
        bookingContactDetails={bookingContactDetails}
        baggage={baggage}
        meals={meals}
      />
      {showAuthModal && authView === "login" && (
        <LoginPopup onClose={closeAuthModal} onNavigate={setAuthView} />
      )}
      {showAuthModal && authView === "signup" && (
        <SignupPopup onClose={closeAuthModal} onNavigate={setAuthView} />
      )}
      <div className={styles.tripDetailsContainer}>
        <div className={styles.tripDetailsHeader}>
          <img
            onClick={() => setCurrentStep(5)}
            className={styles.backArrow}
            src="/icons/leftArrowTrip.svg"
            alt=""
          />
          <p className={styles.tripDetails}>Review and Payment</p>
        </div>
      </div>
      <div className={styles.container}>
        {/* HEADER */}

        <div className={styles.passengerDetailsHeader}>
          <div className={styles.fromToContainer}>
            <h2 className={styles.from}>Review and Payment</h2>
            {/* <span className={styles.to}>To</span>
            <h2 className={styles.to}>
              Singapore <span className={styles.cityCode}>(SIN)</span>
            </h2> */}
          </div>

          <div className={styles.aboutFlightContainerRight}>
            <span className={styles.subInfoText}>
              Confirm and complete booking.
            </span>
          </div>
        </div>

        {/* Trip Summary */}
        <div className={styles.flightExpandableContainer}>
          <div
            className={`${styles.flightExpandableCard} ${
              openTab === "tripSummary" ? styles.open : ""
            }`}
            onClick={() => toggleTab("tripSummary")}
          >
            <div className={styles.firstCard}>
              <div
                className={`${styles.flightExpandableContainer} ${styles.flightExpandableContainer2}`}
              >
                <h3 className={styles.flightExpandableHeader}>trip summary</h3>
                <img
                  src="/icons/DownArrows.svg"
                  alt=""
                  className={`${styles.arrow} ${
                    openTab === "tripSummary" ? styles.arrowRotate : ""
                  }`}
                />
              </div>

              <div
                className={`${styles.card} ${isMultiCity ? styles.multiCitySummaryList : ""} ${
                  openTab === "tripSummary"
                    ? styles.tripSummaryHidden
                    : styles.tripSummaryVisible
                }`}
              >
                {isMultiCity ? (
                  multiCityFlights.map((flight, index) => (
                    <div className={styles.multiCitySummaryCard} key={`summary-route-${index}`}>
                      <div className={styles.left}>
                        <img
                          src={getDynamicAirlineLogo(flight?.airline)}
                          alt={`${flight?.airline?.name || "Airline"} logo`}
                          className={styles.logo}
                        />
                      </div>
                      <div className={styles.right}>
                        <span className={styles.routeNumber}>Route {index + 1}</span>
                        <div className={styles.route}>
                          <span className={styles.city}>
                            {formatAirportLabel(flight?.departure)}
                          </span>
                          <span className={styles.arrowCard}>→</span>
                          <span className={styles.city}>
                            {formatAirportLabel(flight?.arrival)}
                          </span>
                        </div>
                        <div className={styles.meta}>
                          <span>{flight?.departure?.date || "Date unavailable"}</span>
                          <span className={styles.dot}>|</span>
                          <span>{flight?.airline?.name || "Airline unavailable"}</span>
                          <span className={styles.dot}>•</span>
                          <span>{`${flight?.departure?.time || "--:--"}-${flight?.arrival?.time || "--:--"}`}</span>
                          <span className={styles.dot}>•</span>
                          <span>
                            {multiCityFares[index]?.name ||
                              multiCityFares[index]?.fareName ||
                              multiCityFares[index]?.FCType ||
                              flight?.flexiPlusFare ||
                              flight?.travelClass ||
                              "Fare unavailable"}
                          </span>
                          <span className={styles.dot}>•</span>
                          <span>{flight?.stops || "Stops unavailable"}</span>
                          <span className={styles.dot}>•</span>
                          <span>{formatSummaryDuration(flight?.duration)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                <div className={styles.left}>
                  <img
                    src={getDynamicAirlineLogo(summaryFlight?.airline)}
                    alt="Airline Logo"
                    className={styles.logo}
                  />
                </div>

                <div className={styles.right}>
                  <div className={styles.route}>
                    <span className={styles.city}>
                      {header.fromName || "N/A"} ({header.fromCode || "N/A"})
                    </span>
                    <span className={styles.arrowCard}>
                      <svg
                        width="24"
                        height="15"
                        viewBox="0 0 24 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 6.36395H0V8.36395H1V7.36395V6.36395ZM23.7071 8.07106C24.0976 7.68054 24.0976 7.04737 23.7071 6.65685L17.3431 0.292885C16.9526 -0.0976396 16.3195 -0.0976396 15.9289 0.292885C15.5384 0.683409 15.5384 1.31657 15.9289 1.7071L21.5858 7.36395L15.9289 13.0208C15.5384 13.4113 15.5384 14.0445 15.9289 14.435C16.3195 14.8255 16.9526 14.8255 17.3431 14.435L23.7071 8.07106ZM1 7.36395V8.36395H23V7.36395V6.36395H1V7.36395Z"
                          fill="black"
                        />
                      </svg>
                    </span>
                    <span className={styles.city}>
                      {header.toName || "N/A"} ({header.toCode || "N/A"})
                    </span>
                  </div>

                  <div className={styles.meta}>
                    <span>{header.date || "N/A"}</span>
                    <span className={styles.dot}>|</span>
                    <span>{summaryFlight?.airline?.name || "N/A"}</span>
                    <span className={styles.dot}>•</span>
                    <span>{`${summaryFlight?.departure?.time || "N/A"}-${summaryFlight?.arrival?.time || "N/A"}`}</span>
                    <span className={styles.dot}>•</span>
                    <span>{header.cabinClass || "N/A"}</span>
                    <span className={styles.dot}>•</span>
                    <span>{header.stops || "N/A"}</span>
                    <span className={styles.dot}>•</span>
                    <span>{formatSummaryDuration(summaryFlight?.duration)}</span>
                  </div>
                </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div
            className={`${styles.expandWrap} ${
              openTab === "tripSummary" ? styles.expandOpen : ""
            }`}
          >
            <TripSummaryExpandable data={tripSummaryData} />
          </div>
        </div>

        {/* Passenger info */}
        <div className={styles.flightExpandableContainer}>
          <div
            className={`${styles.flightExpandableCard} ${
              openTab === "passengerInfo" ? styles.open : ""
            }`}
            onClick={() => toggleTab("passengerInfo")}
          >
            <h3 className={styles.flightExpandableHeader}>
              Passenger information
            </h3>
            <img
              src="/icons/DownArrows.svg"
              alt=""
              className={`${styles.arrow} ${
                openTab === "passengerInfo" ? styles.arrowRotate : ""
              }`}
            />
          </div>

          <div
            className={`${styles.expandWrap} ${
              openTab === "passengerInfo" ? styles.expandOpen : ""
            }`}
          >
            <PassengerInfo />
          </div>
        </div>

        <div className={styles.flightExpandableContainer}>
          <div
            className={`${styles.flightExpandableCard} ${
              openTab === "extras" ? styles.open : ""
            }`}
            onClick={() => toggleTab("extras")}
          >
            <h3 className={styles.flightExpandableHeader}>extras</h3>
            <img
              src="/icons/DownArrows.svg"
              alt=""
              className={`${styles.arrow} ${
                openTab === "extras" ? styles.arrowRotate : ""
              }`}
            />
          </div>

          <div
            className={`${styles.expandWrap} ${
              openTab === "extras" ? styles.expandOpen : ""
            }`}
          >
            <ExtrasSummary />
          </div>
        </div>

        <div className={`${styles.flightExpandableContainer} `}>
          <div
            className={`${`${styles.flightExpandableCard}`} ${
              styles.payWithContainer
            }`}
          >
            <h3 className={styles.flightExpandableHeader}>Pay with</h3>
          </div>
          <PayWithOptions
            selected={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />
        </div>

        {/* <div
          onClick={() => setCurrentStep(3)}
          className={styles.continueButtonContainer}
        >a
          <button className={styles.continueButton}>CONTINUE</button>
        </div> */}
      </div>
      <div className={styles.mobileView}>
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
              className={styles.continueBtn}
              onClick={handleContinuePayment}
              disabled={itineraryLoading}
            >
              {itineraryLoading ? "LOADING..." : "CONTINUE PAYMENT"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentPage;

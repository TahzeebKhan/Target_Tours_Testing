"use client";
import React, { useEffect, useState } from "react";
import styles from "./TripCard.module.css";
import FlightTimingDetail from "../../flightTimingDetails/FlightTimingDetail";
import RoundTripExpendable from "../roundTripExpendable/RoundTripExpendable";
import OfferBanner from "../../offerComponent/OfferBanner";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import MobileFareComparisonModalRoundTrip from "../MobileFareComparisonModalRoundTrip";
import FareComparisonModalRoundTrip from "../FareComparisonModalRoundTrip";
import {
  getFlightInfo,
  getFlightWebSettings,
} from "@/features/flights/services/flightBooking";
import { resolveAirlineLogo } from "@/features/flights/utils/airlineLogos";
import { toast } from "react-toastify";
import { useAuth } from "@/app/context/AuthContext";
import LoginPopup from "@/app/account/loginPopUp/LoginPopup";
import SignupPopup from "@/app/account/signUpPopUp/SignupPopup";

const TripCard = ({
  tripCardsData,
  fareModalOpen,
  setFareModalOpen,
  selectedFlightId,
  setSelectedFlightId,
}) => {
  const isMobileViewport = useMediaQuery("(max-width: 430px)");
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [openId, setOpenId] = useState(null);
  const [prefetchedFareData, setPrefetchedFareData] = useState({});
  const [prefetchingFlightId, setPrefetchingFlightId] = useState(null);
  const [flightInfoData, setFlightInfoData] = useState({});
  const [loadingFlightInfoId, setLoadingFlightInfoId] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [pendingFareFlight, setPendingFareFlight] = useState(null);

  const flightResults = [
    {
      id: "AI2380-DEL-HKT",
      airline: {
        code: "AI",
        name: "Air India",
        logo: "/images/dummyFlightlogo.png",
      },
      aircraft: "Boeing 787-9 Dreamliner",
      cabinClass: "Economy",

      route: {
        from: {
          city: "New Delhi",
          airportCode: "DEL",
          airportName: "Indira Gandhi International Airport",
          terminal: "T2",
          date: "THU, 18 DEC 2025",
          time: "06:45",
        },
        to: {
          city: "Phuket City",
          airportCode: "HKT",
          airportName: "Phuket International Airport",
          terminal: "T3",
          date: "THU, 18 DEC 2025",
          time: "08:00",
        },
      },

      duration: {
        hours: 1,
        minutes: 50,
        stops: "Non-Stop",
      },

      fares: [
        {
          id: "saver",
          name: "SAVER FARE",
          totalPrice: 760000,
          pricePerAdult: 6083,
          isPremium: false,
          baggage: {
            cabin: "7 Kg Cabin Bag Allowance",
            checkin: "15 Kg Check-in Bag Allowance",
          },
          changes: {
            changeCharges: "Change Charges up to ₹2,999",
            cancellationCharges: "Cancellation Charges up to ₹4,999",
          },
          addons: {
            seats: "Chargeable Seats",
            meals: "Chargeable Meals",
          },
        },
        {
          id: "flexi",
          name: "FLEXI PLUS FARE",
          totalPrice: 780000,
          pricePerAdult: 6200,
          isPremium: true,
          baggage: {
            cabin: "7 Kg Cabin Bag Allowance",
            checkin: "15 Kg Check-in Bag Allowance",
          },
          changes: {
            changeCharges: "Change Charges up to ₹3,499",
            cancellationCharges: "Cancellation Charges up to ₹3,499",
          },
          addons: {
            seats: "Complimentary XL Legroom Seat",
            meals: "Complimentary Meals",
          },
        },
        {
          id: "premium",
          name: "PREMIUM FARE",
          totalPrice: 820000,
          pricePerAdult: 6500,
          isPremium: false,
          baggage: {
            cabin: "7 Kg Cabin Bag Allowance",
            checkin: "20 Kg Check-in Bag Allowance",
          },
          changes: {
            changeCharges: "Change Charges up to ₹2,999",
            cancellationCharges: "Cancellation Charges up to ₹4,999",
          },
          addons: {
            seats: "Complimentary XL Legroom Seat",
            meals: "Chargeable Meals",
          },
        },
      ],
    },
  ];
  const [isMobile, setIsMobile] = useState(false);

  const buildFlightInfoPayload = (flight) => {
    const priceRequest = flight?.booking?.priceRequest || {};

    return {
      search_key: priceRequest?.search_key || flight?.booking?.searchKey,
      TripType: priceRequest?.TripType || flight?.booking?.tripType || "RT",
      Trips: (priceRequest?.Trips || []).map((trip) => ({
        TUI: trip?.TUI,
        Amount: trip?.Amount,
        Index: trip?.Index,
        OrderID: trip?.OrderID,
        ChannelCode: trip?.ChannelCode ?? null,
      })),
    };
  };

  const toggleDetails = async (flight) => {
    const flightId = flight?.id;
    if (!flightId) return;

    const isClosing = openId === flightId;
    setOpenId(isClosing ? null : flightId);
    if (isClosing || flightInfoData[flightId] || loadingFlightInfoId === flightId) return;

    const payload = buildFlightInfoPayload(flight);
    const hasRequiredPayload =
      payload.search_key &&
      payload.Trips?.length > 0 &&
      payload.Trips.every(
        (trip) =>
          trip?.TUI &&
          trip?.Index !== undefined &&
          trip?.Index !== null
      );

    if (!hasRequiredPayload) return;

    setLoadingFlightInfoId(flightId);
    try {
      const response = await getFlightInfo(payload);
      setFlightInfoData((prev) => ({
        ...prev,
        [flightId]: response,
      }));
    } catch (error) {
      console.error("Failed to fetch round-trip flight info", error);
      setFlightInfoData((prev) => ({
        ...prev,
        [flightId]: { error: true },
      }));
    } finally {
      setLoadingFlightInfoId(null);
    }
  };

  const openFareModal = async (flight) => {
    const searchTui = flight?.booking?.tui;
    const provider = flight?.booking?.provider || flight?.provider;

    setPrefetchingFlightId(flight?.id ?? null);

    try {
      const webSettingsResponse = searchTui
        ? await getFlightWebSettings({ TUI: searchTui, provider })
        : null;

      setPrefetchedFareData((prev) => ({
        ...prev,
        [flight.id]: {
          webSettingsResponse,
        },
      }));
      setSelectedFlightId(flight?.id ?? null);
      setFareModalOpen(flight?.id ?? null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load fare details right now."
      );
    } finally {
      setPrefetchingFlightId(null);
    }
  };

  const handleViewFares = (flight) => {
    if (authLoading) {
      setPendingFareFlight(flight);
      return;
    }

    if (!isLoggedIn) {
      setPendingFareFlight(flight);
      setAuthView("login");
      setShowLogin(true);
      return;
    }

    openFareModal(flight);
  };

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 430);
    };

    checkScreen();

    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    if (authLoading || !pendingFareFlight) return;

    if (!isLoggedIn) {
      setAuthView("login");
      setShowLogin(true);
      return;
    }

    const flightToOpen = pendingFareFlight;
    setShowLogin(false);
    setPendingFareFlight(null);
    openFareModal(flightToOpen);
  }, [authLoading, isLoggedIn, pendingFareFlight]);

  return (
    <>
      <div className={styles.cardPairent}>
        {tripCardsData.map((item, index) => (
          <div key={item.id}>
            <div
              className={`${styles.card} ${
                openId === item.id ? styles.cardOpen : ""
              }`}
            >
              <div className={styles.cardLeftMainCont}>
                <div className={styles.cardLeft}>
                  {/* DEPART */}
                  <div className={styles.departContainer}>
                    <div className={styles.HeadingCont}>
                      <img
                        src={resolveAirlineLogo(item.depart.airline)}
                        alt={item.depart.airline.name}
                      />
                      <h3 className={styles.ariLineName}>
                        {item.depart.airline.name}
                        <span className={styles.ariLineNumber}>
                          ({item.depart.airline.code})
                        </span>
                      </h3>
                    </div>

                    <div className={styles.departureDetails}>
                      <div className={styles.departTextHeading}>
                        <h3>Depart</h3>
                        <span>{item.depart.date}</span>
                      </div>
                      <div className={styles.departTimeContainer}>
                        <FlightTimingDetail flight={item.depart.flight} />
                      </div>
                    </div>
                  </div>

                  {/* RETURN */}
                  <div className={styles.returnContainer}>
                    <div className={styles.HeadingCont}>
                      <img
                        src={resolveAirlineLogo(item.return.airline)}
                        alt={item.return.airline.name}
                      />
                      <h3 className={styles.ariLineName}>
                        {item.return.airline.name}
                        <span className={styles.ariLineNumber}>
                          ({item.return.airline.code})
                        </span>
                      </h3>
                    </div>

                    <div className={styles.departureDetails}>
                      <div className={styles.departTextHeading}>
                        <h3>Return</h3>
                        <span>{item.return.date}</span>
                      </div>
                      <div className={styles.departTimeContainer}>
                        <FlightTimingDetail flight={item.return.flight} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEE DETAILS */}
                <div
                  className={styles.seeDetailsBtn}
                  onClick={() => toggleDetails(item)}
                >
                  See Details
                  <svg
                    className={`${styles.downArrow} ${
                      openId === item.id ? styles.rotate : ""
                    }`}
                    width="8"
                    height="5"
                    viewBox="0 0 8 5"
                  >
                    <path
                      d="M3.55967 4.01408L0.141737 0.847416C0.0494254 0.755116 0.0022032 0.639094 6.98646e-05 0.49935C-0.00207458 0.359606 0.0451476 0.241444 0.141737 0.144866C0.238314 0.0482881 0.355403 0 0.493003 0C0.630603 0 0.747692 0.0482881 0.84427 0.144866L3.55967 2.86027L6.27507 0.144866C6.36737 0.0525659 6.48339 0.0053437 6.62314 0.00319926C6.76287 0.00106593 6.88102 0.0482881 6.9776 0.144866C7.07419 0.241444 7.12249 0.358539 7.12249 0.49615C7.12249 0.63375 7.07419 0.750838 6.9776 0.847416L3.98145 3.84357Z"
                      fill="#000033"
                    />
                  </svg>
                </div>
              </div>

              {/* RIGHT FARE */}
              <div className={styles.cardRight}>
                <div
                  className={styles.seeDetailsBtn}
                  onClick={() => toggleDetails(item)}
                >
                  See Details
                  <svg
                    className={`${styles.downArrow} ${
                      openId === item.id ? styles.rotate : ""
                    }`}
                    width="8"
                    height="5"
                    viewBox="0 0 8 5"
                  >
                    <path
                      d="M3.55967 4.01408L0.141737 0.847416C0.0494254 0.755116 0.0022032 0.639094 6.98646e-05 0.49935C-0.00207458 0.359606 0.0451476 0.241444 0.141737 0.144866C0.238314 0.0482881 0.355403 0 0.493003 0C0.630603 0 0.747692 0.0482881 0.84427 0.144866L3.55967 2.86027L6.27507 0.144866C6.36737 0.0525659 6.48339 0.0053437 6.62314 0.00319926C6.76287 0.00106593 6.88102 0.0482881 6.9776 0.144866C7.07419 0.241444 7.12249 0.358539 7.12249 0.49615C7.12249 0.63375 7.07419 0.750838 6.9776 0.847416L3.98145 3.84357Z"
                      fill="#000033"
                    />
                  </svg>
                </div>
                <div className={styles.fareDetails}>
                  <div className={styles.totalFare}>
                    <span className={styles.fareText}>
                      {item.fare.totalFare}
                    </span>
                    <button
                      disabled={prefetchingFlightId === item.id}
                      onClick={() => {
                        handleViewFares(item);
                      }}
                      className={styles.viewBtn}
                    >
                      {prefetchingFlightId === item.id ? "LOADING..." : "VIEW FARES"}
                    </button>
                  </div>
                  <div className={styles.fareAmount}>
                    <span className={styles.fare}>
                      {item.fare.pricePerAdult}
                      <span className={styles.adult}> /ADULT</span>
                    </span>
                    <div className={styles.dot}></div>
                    <span className={styles.economy}>
                      {item.fare.cabinClass}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* EXPANDABLE */}
            <div
              className={`${styles.expandWrap} ${
                openId === item.id ? styles.open : ""
              }`}
            >
              <RoundTripExpendable
                flightData={item}
                flightInfoData={flightInfoData[item.id]}
                isFlightInfoLoading={loadingFlightInfoId === item.id}
              />
            </div>

            {index === 2 && (
              <div className={styles.offerBannerWrap}>
                <OfferBanner />
              </div>
            )}
          </div>
        ))}
      </div>

      {isMobileViewport ? (
        <MobileFareComparisonModalRoundTrip
          isOpen={fareModalOpen}
          onClose={() => setFareModalOpen(false)}
          flightData={tripCardsData.find((item) => item.id === fareModalOpen) || null}
        />
      ) : (
        <FareComparisonModalRoundTrip
          isOpen={fareModalOpen}
          onClose={() => setFareModalOpen(false)}
          flightData={tripCardsData.find((item) => item.id === fareModalOpen) || null}
          prefetchedData={prefetchedFareData[fareModalOpen] || null}
        />
      )}
      {showLogin && authView === "login" && (
        <LoginPopup
          onClose={() => {
            setShowLogin(false);
            setPendingFareFlight(null);
          }}
          onNavigate={setAuthView}
        />
      )}
      {showLogin && authView === "signup" && (
        <SignupPopup
          onClose={() => {
            setShowLogin(false);
            setPendingFareFlight(null);
          }}
          onNavigate={setAuthView}
        />
      )}
    </>
  );
};

export default TripCard;

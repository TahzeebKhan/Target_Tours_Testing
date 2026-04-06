"use client";
import React, { useEffect, useState } from "react";
import styles from "./TripCard.module.css";
import FlightTimingDetail from "../../flightTimingDetails/FlightTimingDetail";
import RoundTripExpendable from "../roundTripExpendable/RoundTripExpendable";
import OfferBanner from "../../offerComponent/OfferBanner";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import MobileFareComparisonModal from "../MobileFareComparisonModalRoundTrip";
import FareComparisonModal from "../FareComparisonModalRoundTrip";
import MobileFareComparisonModalRoundTrip from "../MobileFareComparisonModalRoundTrip";
import FareComparisonModalRoundTrip from "../FareComparisonModalRoundTrip";
import {
  getFlightPrice,
  getFlightTravelChecklist,
  getFlightWebSettings,
} from "@/features/flights/services/flightBooking";
import { toast } from "react-toastify";

const TripCard = ({
  tripCardsData,
  fareModalOpen,
  setFareModalOpen,
  selectedFlightId,
  setSelectedFlightId,
}) => {
  const [openId, setOpenId] = useState(null);
  const [prefetchedFareData, setPrefetchedFareData] = useState({});
  const [prefetchingFlightId, setPrefetchingFlightId] = useState(null);

  const flightResults = [
    {
      id: "AI2380-DEL-HKT",
      airline: {
        code: "AI",
        name: "Air India",
        logo: "/images/Flight.png",
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

  const openFareModal = async (flight) => {
    const searchTui = flight?.booking?.tui;
    const priceRequest = flight?.booking?.priceRequest;

    if (!priceRequest?.search_key || !priceRequest?.Trips?.[0]?.Index) {
      toast.error("Missing booking payload for the selected flight.");
      return;
    }

    setPrefetchingFlightId(flight?.id ?? null);

    try {
      const webSettingsResponse = searchTui
        ? await getFlightWebSettings({ TUI: searchTui })
        : null;
      const priceResponse = await getFlightPrice(priceRequest);
      const checklistTui =
        priceResponse?.data?.raw?.TUI ||
        priceResponse?.raw?.TUI ||
        priceResponse?.data?.tui ||
        priceResponse?.data?.TUI ||
        priceResponse?.tui ||
        priceResponse?.TUI;
      const checklistResponse = checklistTui
        ? await getFlightTravelChecklist({
            TUI: checklistTui,
            ClientID:
              flight?.booking?.clientId ||
              priceRequest?.ClientID ||
              "FVI6V120g22Ei5ztGK0FIQ==",
          })
        : null;

      setPrefetchedFareData((prev) => ({
        ...prev,
        [flight.id]: {
          webSettingsResponse,
          priceResponse,
          checklistResponse,
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

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 430);
    };

    checkScreen();

    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

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
                      <img src={item.depart.airline.logo} alt="" />
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
                      <img src={item.return.airline.logo} alt="" />
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
                  onClick={() =>
                    setOpenId((prev) => (prev === item.id ? null : item.id))
                  }
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
                  onClick={() =>
                    setOpenId((prev) => (prev === item.id ? null : item.id))
                  }
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
                        openFareModal(item);
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
              <RoundTripExpendable />
            </div>

            {index === 2 && (
              <div className={styles.offerBannerWrap}>
                <OfferBanner />
              </div>
            )}
          </div>
        ))}
      </div>

      {
        <FareComparisonModalRoundTrip
          isOpen={fareModalOpen}
          onClose={() => setFareModalOpen(false)}
          flightData={tripCardsData.find((item) => item.id === fareModalOpen) || null}
          prefetchedData={prefetchedFareData[fareModalOpen] || null}
        />
      }
    </>
  );
};

export default TripCard;

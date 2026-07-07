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
import { Armchair } from "lucide-react";

const cleanCity = (cityStr) => {
  if (!cityStr) return "";
  return cityStr.split("(")[0].trim().toUpperCase();
};

const formatColumnDate = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.replace(",", "").toUpperCase();
};

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
  const [selectedDepartId, setSelectedDepartId] = useState(null);
  const [selectedReturnId, setSelectedReturnId] = useState(null);
  const [fareModalFlight, setFareModalFlight] = useState(null);
  const [detailFlight, setDetailFlight] = useState(null);
  const [detailRowId, setDetailRowId] = useState(null);

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

  const selectedDepart =
    tripCardsData.find((item) => item.id === selectedDepartId) ||
    tripCardsData[0] ||
    null;
  const selectedReturn =
    tripCardsData.find((item) => item.id === selectedReturnId) ||
    selectedDepart ||
    null;

  const selectedDepartAmount =
    selectedDepart?.depart?.flight?.fare?.displayAmount ??
    selectedDepart?.booking?.priceRequest?.Trips?.[0]?.Amount ??
    null;
  const selectedReturnAmount =
    selectedReturn?.return?.flight?.fare?.displayAmount ??
    selectedReturn?.booking?.priceRequest?.Trips?.[1]?.Amount ??
    selectedReturn?.booking?.priceRequest?.Trips?.[0]?.Amount ??
    null;
  const selectedTotalAmount =
    Number.isFinite(Number(selectedDepartAmount)) &&
    Number.isFinite(Number(selectedReturnAmount))
      ? Number(selectedDepartAmount) + Number(selectedReturnAmount)
      : null;
  const formatCurrencyLabel = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "N/A";

    return `₹ ${new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  const selectedRoundTrip =
    selectedDepart && selectedReturn
      ? {
          ...selectedDepart,
          id: `${selectedDepart.id}-${selectedReturn.id}-selected`,
          return: selectedReturn.return,
          fare: {
            ...selectedDepart.fare,
            totalFare:
              selectedTotalAmount !== null
                ? formatCurrencyLabel(selectedTotalAmount)
                : selectedDepart.fare?.totalFare,
            pricePerAdult:
              selectedTotalAmount !== null
                ? formatCurrencyLabel(selectedTotalAmount)
                : selectedDepart.fare?.pricePerAdult,
          },
          booking: {
            ...selectedDepart.booking,
            priceRequest: {
              ...(selectedDepart.booking?.priceRequest || {}),
              Trips: [
                selectedDepart.booking?.priceRequest?.Trips?.[0],
                selectedReturn.booking?.priceRequest?.Trips?.[1] ||
                  selectedReturn.booking?.priceRequest?.Trips?.[0],
              ].filter(Boolean),
            },
          },
        }
      : null;

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

  const toggleDetails = async (flight, rowId) => {
    const flightId = flight?.id;
    if (!flightId) return;

    const isClosing = openId === flightId;
    setOpenId(isClosing ? null : flightId);
    setDetailFlight(isClosing ? null : flight);
    setDetailRowId(isClosing ? null : rowId);
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
      setFareModalFlight(flight);
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

  useEffect(() => {
    if (!tripCardsData.length) return;

    setSelectedDepartId((current) => current || tripCardsData[0]?.id || null);
    setSelectedReturnId((current) => current || tripCardsData[0]?.id || null);
  }, [tripCardsData]);

  const renderLegOption = (item, type) => {
    const isDepart = type === "depart";
    const leg = isDepart ? item.depart : item.return;
    const seats = Number(leg.flight?.details?.seats);
    const hasSeatCount = Number.isFinite(seats) && seats > 0;
    const isRefundable = Boolean(leg.flight?.details?.refundable);
    const selectedPeer = isDepart ? selectedReturn : selectedDepart;
    const detailItem = isDepart
      ? {
          ...item,
          id: `${item.id}-${selectedPeer?.id || "return"}-details`,
          return: selectedPeer?.return || item.return,
          booking: {
            ...item.booking,
            priceRequest: {
              ...(item.booking?.priceRequest || {}),
              Trips: [
                item.booking?.priceRequest?.Trips?.[0],
                selectedPeer?.booking?.priceRequest?.Trips?.[1] ||
                  selectedPeer?.booking?.priceRequest?.Trips?.[0],
              ].filter(Boolean),
            },
          },
        }
      : {
          ...(selectedPeer || item),
          id: `${selectedPeer?.id || "depart"}-${item.id}-details`,
          return: item.return,
          booking: {
            ...(selectedPeer?.booking || item.booking),
            priceRequest: {
              ...((selectedPeer?.booking || item.booking)?.priceRequest || {}),
              Trips: [
                selectedPeer?.booking?.priceRequest?.Trips?.[0] ||
                  item.booking?.priceRequest?.Trips?.[0],
                item.booking?.priceRequest?.Trips?.[1] ||
                  item.booking?.priceRequest?.Trips?.[0],
              ].filter(Boolean),
            },
          },
        };
    const isSelected = isDepart
      ? selectedDepartId === item.id
      : selectedReturnId === item.id;
    const onSelect = () =>
      isDepart ? setSelectedDepartId(item.id) : setSelectedReturnId(item.id);

    return (
      <div
        key={`${type}-${item.id}`}
        className={`${styles.roundOptionCard} ${
          isSelected ? styles.selectedRoundOption : ""
        }`}
        onClick={onSelect}
      >
        <div className={styles.roundOptionTop}>
          <div className={styles.HeadingCont}>
            <img
              src={resolveAirlineLogo(leg.airline)}
              alt={leg.airline.name}
            />
            <h3 className={styles.ariLineName}>
              {leg.airline.name}
            </h3>
          </div>
          <span className={styles.radioMark} />
        </div>

        <div className={styles.cardMiddleRow}>
          {/* Column 1: Departure */}
          <div className={styles.timeCol}>
            <div className={styles.largeTime}>{leg.flight.departure.time}</div>
            <div className={styles.cityText}>{leg.flight.departure.city}</div>
          </div>

          {/* Column 2: Duration */}
          <div className={styles.durationCol}>
            <div className={styles.flightAnimation}>
              <div className={styles.flightDot}></div>
              <div className={styles.flightLine}></div>
              <img src="/icons/flightIcon.svg" alt="flight" className={styles.planeIcon} />
              <div className={styles.flightLine}></div>
              <div className={styles.flightDot}></div>
            </div>
            <div className={styles.durationText}>
              <span>{leg.flight.duration.hours} <span>h</span> {leg.flight.duration.minutes} <span>m</span></span>
              <span className={styles.dotSeparator}>●</span>
              <span>{leg.flight.stops.type}</span>
            </div>
          </div>

          {/* Column 3: Arrival */}
          <div className={styles.arrivalTimeCol}>
            <div className={styles.largeTime}>{leg.flight.arrival.time}</div>
            <div className={styles.cityText}>{leg.flight.arrival.city}</div>
          </div>

          {/* Column 4: Price */}
          <div className={styles.priceCol}>
            <div className={styles.priceText}>
              {leg.flight?.fare?.totalFare || item.fare.pricePerAdult}
            </div>
            <div className={styles.adultText}>/ ADULT</div>
          </div>
        </div>

        <div className={styles.roundOptionFooter}>
          <div className={styles.footerLeft}>
            <button
              type="button"
              className={styles.inlineDetailsBtn}
              onClick={(event) => {
                event.stopPropagation();
                toggleDetails(detailItem, item.id);
              }}
            >
              See Details
              <svg
                className={`${styles.downArrow} ${
                  openId === detailItem.id ? styles.rotate : ""
                }`}
                width="8"
                height="5"
                viewBox="0 0 8 5"
              >
                <path
                  d="M3.55967 4.01408L0.141737 0.847416C0.0494254 0.755116 0.0022032 0.639094 6.98646e-05 0.49935C-0.00207458 0.359606 0.0451476 0.241444 0.141737 0.144866C0.238314 0.0482881 0.355403 0 0.493003 0C0.630603 0 0.747692 0 0.84427 0.144866L3.55967 2.86027L6.27507 0.144866C6.36737 0.0525659 6.48339 0.0053437 6.62314 0.00319926C6.76287 0.00106593 6.88102 0.0482881 6.9776 0.144866C7.07419 0.241444 7.12249 0.358539 7.12249 0.49615C7.12249 0.63375 7.07419 0.750838 6.9776 0.847416L3.98145 3.84357Z"
                  fill="#000033"
                />
              </svg>
            </button>
          </div>
          <div className={styles.footerRight}>
            {isRefundable && <span className={styles.refundableBadge}>R</span>}
            {hasSeatCount && (
              <span className={styles.seatBadge}>
                {/* <Armchair size={20} strokeWidth={2.2} /> */}
                <img src="icons/flight-seat.svg" alt="seatIcon" />
                {seats} Left
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={styles.roundTripShell}>
        <div className={styles.roundTripGrid}>
          <section className={styles.roundColumn}>
            <div className={styles.roundColumnTitle}>
              {selectedDepart?.depart?.flight?.departure?.city ? (
                <span>
                  {cleanCity(selectedDepart.depart.flight.departure.city)} → {cleanCity(selectedDepart.depart.flight.arrival.city)} . {formatColumnDate(selectedDepart.depart.date)}
                </span>
              ) : (
                <span>DEPARTURE → ARRIVAL</span>
              )}
            </div>
            <div className={styles.roundColumnHeader}>
              <span>Departure ↑↓</span>
              <span>Duration ↑↓</span>
              <span>Arrival ↑↓</span>
              <span>Price ↑↓</span>
            </div>
          </section>

          <section className={styles.roundColumn}>
            <div className={styles.roundColumnTitle}>
              {selectedReturn?.return?.flight?.departure?.city ? (
                <span>
                  {cleanCity(selectedReturn.return.flight.departure.city)} → {cleanCity(selectedReturn.return.flight.arrival.city)} . {formatColumnDate(selectedReturn.return.date)}
                </span>
              ) : (
                <span>RETURN → ARRIVAL</span>
              )}
            </div>
            <div className={styles.roundColumnHeader}>
              <span>Departure ↑↓</span>
              <span>Duration ↑↓</span>
              <span>Arrival ↑↓</span>
              <span>Price ↑↓</span>
            </div>
          </section>

          {tripCardsData.map((item) => {
            const isRowOpen =
              detailRowId === item.id && detailFlight && openId === detailFlight.id;

            return (
              <React.Fragment key={item.id}>
                <div className={styles.roundOptionList}>
                  {renderLegOption(item, "depart")}
                </div>
                <div className={styles.roundOptionList}>
                  {renderLegOption(item, "return")}
                </div>
                <div
                  className={`${styles.expandWrap} ${styles.roundRowExpand} ${
                    isRowOpen ? styles.open : ""
                  }`}
                >
                  {isRowOpen && (
                    <RoundTripExpendable
                      flightData={detailFlight}
                      flightInfoData={flightInfoData[detailFlight.id]}
                      isFlightInfoLoading={loadingFlightInfoId === detailFlight.id}
                    />
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {tripCardsData.length > 2 && (
          <div className={styles.offerBannerWrap}>
            <OfferBanner />
          </div>
        )}

        {selectedRoundTrip && (
          <div className={styles.selectionBar}>
            <div className={styles.selectionLeg}>
              <span className={styles.selectionLabel}>Departure</span>
              <strong>{selectedRoundTrip.depart.airline.name}</strong>
              <span>
                {selectedRoundTrip.depart.flight.departure.time} →{" "}
                {selectedRoundTrip.depart.flight.arrival.time}
              </span>
              <small>
                {selectedRoundTrip.depart.flight.departure.city} to{" "}
                {selectedRoundTrip.depart.flight.arrival.city}
              </small>
            </div>
            <div className={styles.selectionDivider} />
            <div className={styles.selectionLeg}>
              <span className={styles.selectionLabel}>Return</span>
              <strong>{selectedRoundTrip.return.airline.name}</strong>
              <span>
                {selectedRoundTrip.return.flight.departure.time} →{" "}
                {selectedRoundTrip.return.flight.arrival.time}
              </span>
              <small>
                {selectedRoundTrip.return.flight.departure.city} to{" "}
                {selectedRoundTrip.return.flight.arrival.city}
              </small>
            </div>
            <div className={styles.selectionFare}>
              <span>Total amount</span>
              <strong>{selectedRoundTrip.fare.totalFare}</strong>
              <small>Taxes may apply</small>
            </div>
            <button
              type="button"
              disabled={prefetchingFlightId === selectedRoundTrip.id}
              onClick={() => handleViewFares(selectedRoundTrip)}
              className={styles.bookNowBtn}
            >
              {prefetchingFlightId === selectedRoundTrip.id ? "Loading..." : "Book Now"}
            </button>
          </div>
        )}
      </div>

      {isMobileViewport ? (
        <MobileFareComparisonModalRoundTrip
          isOpen={fareModalOpen}
          onClose={() => {
            setFareModalOpen(false);
            setFareModalFlight(null);
          }}
          flightData={
            fareModalFlight ||
            tripCardsData.find((item) => item.id === fareModalOpen) ||
            null
          }
        />
      ) : (
        <FareComparisonModalRoundTrip
          isOpen={fareModalOpen}
          onClose={() => {
            setFareModalOpen(false);
            setFareModalFlight(null);
          }}
          flightData={
            fareModalFlight ||
            tripCardsData.find((item) => item.id === fareModalOpen) ||
            null
          }
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

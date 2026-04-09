"use client";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./FareComparisonModalRoundTrip.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import useLockBodyScroll from "@/app/hooks/useLockBodyScroll";
import { toast } from "react-toastify";
import {
  getFlightPrice,
  getFlightTravelChecklist,
} from "@/features/flights/services/flightBooking";
import {
  buildBookingFallbackQuery,
  writeFlightBookingSession,
} from "@/features/flights/utils/flightBookingSession";
import { useAuth } from "@/app/context/AuthContext";
import LoginPopup from "@/app/account/loginPopUp/LoginPopup";
import SignupPopup from "@/app/account/signUpPopUp/SignupPopup";

const readNumber = (...values) => {
  for (const value of values) {
    const normalized =
      typeof value === "string"
        ? Number(value.replace(/[^\d.]/g, ""))
        : Number(value);
    if (Number.isFinite(normalized)) return normalized;
  }
  return null;
};

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₹ 0";
  return `₹ ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
};

const normalizeFareType = (value = "") => String(value || "").trim().toUpperCase();

const getAdultCount = (flightData) => {
  const searchKey = String(flightData?.booking?.priceRequest?.search_key || "").trim();
  const parts = searchKey.split("_");
  return Math.max(Number(parts[4] || 1), 1);
};

const getFareTemplate = (fareType) => {
  const normalized = normalizeFareType(fareType);

  if (normalized.includes("FLEXI")) {
    return {
      id: "flexi",
      name: "FLEXI PLUS FARE",
      isPremium: true,
      baggage: { cabin: "7 Kg", checkin: "15 Kg" },
      changes: {
        charges: "Change up to ₹3,499",
        cancellation: "Cancel up to ₹3,499",
      },
      addons: {
        seats: "Complimentary meal",
        meals: "Complimentary standard seat",
      },
    };
  }

  if (normalized.includes("PREMIUM")) {
    return {
      id: "premium",
      name: "PREMIUM FARE",
      isPremium: false,
      baggage: { cabin: "7 Kg", checkin: "15 Kg" },
      changes: {
        charges: "Change up to ₹3,499",
        cancellation: "Cancel up to ₹3,499",
      },
      addons: {
        seats: "Chargeable Meals",
        meals: "Complimentary XL (Extra legroom) Seat",
      },
    };
  }

  return {
    id: "saver",
    name: "SAVER FARE",
    isPremium: false,
    baggage: { cabin: "7 Kg", checkin: "15 Kg" },
    changes: {
      charges: "Change up to ₹2,999",
      cancellation: "Cancel up to ₹4,999",
    },
    addons: { seats: "Chargeable Seats", meals: "Chargeable Meals" },
  };
};

const STATIC_ROUND_TRIP_FARE_OPTIONS = [
  {
    ...getFareTemplate("FLEXI PLUS FARE"),
    price: "₹ 78,000",
    pricePerAdult: "₹ 6,200",
  },
  {
    ...getFareTemplate("PREMIUM FARE"),
    price: "₹ 78,000",
    pricePerAdult: "₹ 6,200",
  },
];

const readRoundTripAdultFareBreakdown = (priceResponse) => {
  const breakdown =
    priceResponse?.data?.raw?.fare_breakdown ||
    priceResponse?.raw?.fare_breakdown ||
    priceResponse?.data?.fare_breakdown ||
    priceResponse?.fare_breakdown ||
    priceResponse?.data?.formatted?.fare_breakdown ||
    priceResponse?.formatted?.fare_breakdown ||
    [];

  if (!Array.isArray(breakdown) || breakdown.length === 0) {
    return null;
  }

  let totalPerAdult = 0;
  let foundAdultFare = false;

  breakdown.forEach((item) => {
    const adultFare = item?.ADT;
    const perPerson = readNumber(
      adultFare?.per_person,
      adultFare?.perPerson,
      adultFare?.total,
      adultFare?.fare
    );

    if (!Number.isFinite(perPerson)) return;
    totalPerAdult += perPerson;
    foundAdultFare = true;
  });

  return foundAdultFare ? totalPerAdult : null;
};

const buildRoundTripSaverFare = (priceResponse, flightData) => {
  const trips =
    priceResponse?.data?.raw?.Trips ||
    priceResponse?.raw?.Trips ||
    priceResponse?.data?.Trips ||
    priceResponse?.Trips ||
    [];

  let totalNetFare = 0;

  trips.forEach((trip) => {
    const journeys = Array.isArray(trip?.Journey) ? trip.Journey : [];
    journeys.forEach((journey) => {
      const netFare = readNumber(
        journey?.NetFare,
        journey?.netfare,
        journey?.netFare,
        journey?.GrossFare,
        journey?.grossFare
      );

      if (!Number.isFinite(netFare)) return;
      totalNetFare += netFare;
    });
  });

  if (!Number.isFinite(totalNetFare) || totalNetFare <= 0) {
    return null;
  }

  const adults = getAdultCount(flightData);
  const adultFareBreakdown = readRoundTripAdultFareBreakdown(priceResponse);
  return {
    ...getFareTemplate("SAVER"),
    price: formatCurrency(totalNetFare),
    pricePerAdult: formatCurrency(
      Number.isFinite(adultFareBreakdown)
        ? adultFareBreakdown
        : Math.round(totalNetFare / adults)
    ),
  };
};

const parseCityLabel = (value = "") => {
  const text = String(value || "").trim();
  const match = text.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return {
    city: match?.[1]?.trim() || text || "N/A",
    code: match?.[2]?.trim() || "",
  };
};

const compactAirportName = (value = "", fallback = "N/A") => {
  const text = String(value || "").trim();
  if (!text) return fallback;
  return (
    text
      .split("|")[0]
      ?.trim()
      .split(",")
      .map((part) => part.trim())
      .find(Boolean) || fallback
  );
};

const buildSegmentLabel = (prefix, flight) => {
  const from = parseCityLabel(flight?.departure?.city);
  const to = parseCityLabel(flight?.arrival?.city);
  return `${prefix} (${from.code || "N/A"}-${to.code || "N/A"})`;
};

const buildModalSegment = (item, labelPrefix, fallbackDate) => {
  const departure = parseCityLabel(item?.flight?.departure?.city);
  const arrival = parseCityLabel(item?.flight?.arrival?.city);
  const details = item?.flight?.details || {};
  const departureTerminal = String(details?.departureTerminal || "").trim();
  const arrivalTerminal = String(details?.arrivalTerminal || "").trim();

  return {
    label: buildSegmentLabel(labelPrefix, item?.flight),
    flight: {
      departure: {
        date: item?.date || fallbackDate,
        time: item?.flight?.departure?.time || "N/A",
        airport: `${departure.code || "N/A"} - ${(departure.city || "N/A").toUpperCase()}`,
        terminal: departureTerminal ? `Terminal ${departureTerminal}` : "Terminal N/A",
        city: compactAirportName(details?.fromName, departure.city || "N/A"),
      },
      arrival: {
        date: item?.date || fallbackDate,
        time: item?.flight?.arrival?.time || "N/A",
        airport: `${arrival.code || "N/A"} - ${(arrival.city || "N/A").toUpperCase()}`,
        terminal: arrivalTerminal ? `Terminal ${arrivalTerminal}` : "Terminal N/A",
        city: compactAirportName(details?.toName, arrival.city || "N/A"),
      },
      duration: item?.flight?.duration || { hours: 0, minutes: 0 },
      stops: item?.flight?.stops?.type || "N/A",
    },
  };
};

const FareComparisonModalRoundTrip = ({
  isOpen,
  onClose,
  flightData,
  prefetchedData = null,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [pendingFare, setPendingFare] = useState(null);
  const [selected, setSelected] = useState("onward");

  const performBookNow = useCallback(async (selectedFare) => {
    const priceRequest = flightData?.booking?.priceRequest;
    const routeContext = {
      fromName: String(searchParams?.get("from") || "")
        .replace(/\s*\([^)]+\)\s*$/, "")
        .trim(),
      fromCode: String(searchParams?.get("origin") || "").trim().toUpperCase(),
      toName: String(searchParams?.get("to") || "")
        .replace(/\s*\([^)]+\)\s*$/, "")
        .trim(),
      toCode: String(searchParams?.get("destination") || "").trim().toUpperCase(),
    };
    if (!priceRequest?.search_key || !priceRequest?.Trips?.[0]?.Index) {
      toast.error("Missing booking payload for the selected flight.");
      return;
    }

    setIsSubmitting(true);
    try {
      const priceResponse =
        prefetchedData?.priceResponse || (await getFlightPrice(priceRequest));
      const checklistResponse = prefetchedData?.checklistResponse || null;

      if (!checklistResponse) {
        const checklistTui =
          priceResponse?.data?.raw?.TUI ||
          priceResponse?.raw?.TUI ||
          priceResponse?.data?.tui ||
          priceResponse?.data?.TUI ||
          priceResponse?.tui ||
          priceResponse?.TUI;

        if (checklistTui) {
          await getFlightTravelChecklist({
            TUI: checklistTui,
            ClientID:
              flightData?.booking?.clientId ||
              priceRequest?.ClientID ||
              "FVI6V120g22Ei5ztGK0FIQ==",
          });
        }
      }
      const nextSession = {
        selectedFlight: flightData,
        selectedFare,
        routeContext,
        priceRequest,
        priceResponse,
        ssrRequest: null,
        ssrResponse: null,
      };
      writeFlightBookingSession(nextSession);
      const fallbackQuery = buildBookingFallbackQuery(nextSession);
      router.push(
        fallbackQuery
          ? `/flight-booking-details?${fallbackQuery}`
          : "/flight-booking-details"
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to continue with this flight right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [flightData, prefetchedData, router, searchParams]);

  useEffect(() => {
    if (!pendingFare || !isLoggedIn) return;
    const selectedFare = pendingFare;
    setPendingFare(null);
    setShowLogin(false);
    performBookNow(selectedFare);
  }, [isLoggedIn, pendingFare, performBookNow]);

  const handleBookNow = async (selectedFare) => {
    if (loading) return;
    if (!isLoggedIn) {
      setPendingFare(selectedFare);
      setAuthView("login");
      setShowLogin(true);
      return;
    }
    performBookNow(selectedFare);
  };

  const flightSegments = {
    onward: {
      ...buildModalSegment(flightData?.depart, "ONWARD FLIGHT", "N/A"),
      fares: [],
    },

    return: {
      ...buildModalSegment(flightData?.return, "RETURN FLIGHT", "N/A"),
      fares: [],
    },
  };

  const saverFare =
    buildRoundTripSaverFare(prefetchedData?.priceResponse, flightData) || {
      ...getFareTemplate("SAVER"),
      price: flightData?.fare?.totalFare || "₹ 0",
      pricePerAdult:
        flightData?.fare?.pricePerAdult || flightData?.fare?.totalFare || "₹ 0",
    };
  const combinedFareOptions = [saverFare, ...STATIC_ROUND_TRIP_FARE_OPTIONS];

  const activeSegment = flightSegments[selected];
  const { flight } = activeSegment;
  const fares = combinedFareOptions;
  useLockBodyScroll();
  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            Compare fares and choose what fits your journey
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {/* Flight Info */}
        <div className={styles.flightInfo}>
          <div className={styles.toggleBtnsContainer}>
            {Object.entries(flightSegments).map(([key, seg]) => (
              <div
                key={key}
                onClick={() => setSelected(key)}
                className={`${styles.toggleBtn} ${
                  selected === key ? styles.active : ""
                }`}
              >
                {seg.label}
              </div>
            ))}
          </div>

          <div className={styles.flightDuration}>
            <div className={styles.flightInfoStatus}>
              <img
                className={styles.flightIconStatus}
                src={selected === "onward" ? flightData?.depart?.airline?.logo || "/images/Flight.png" : flightData?.return?.airline?.logo || "/images/Flight.png"}
                alt=""
              />
              <div className={styles.flightInfoNameDatesContainer}>
                <span className={styles.flightInfoNameDates}>{selected === "onward" ? flightData?.depart?.airline?.name || "N/A" : flightData?.return?.airline?.name || "N/A"}</span>
                <div className={styles.smallestDot}></div>
                <span className={styles.flightInfoNameDates}>{selected === "onward" ? flightData?.depart?.airline?.code || "N/A" : flightData?.return?.airline?.code || "N/A"}</span>
                <div className={styles.smallestDot}></div>
                <span className={styles.flightInfoNameDates}>
                  N/A
                </span>
                <div className={styles.smallestDot}></div>
                <span className={styles.flightInfoNameDates}>
                  {flightData?.fare?.cabinClass || "N/A"}
                </span>
              </div>
            </div>
            <div className={styles.timelineContainer}>
              {/* LEFT */}
              <div className={styles.side}>
                <div className={styles.date}>{flight.departure.date}</div>
                <div className={styles.time}>{flight.departure.time}</div>
                <div className={styles.airport}>{flight.departure.airport}</div>
                <div className={styles.terminal}>
                  {flight.departure.terminal}
                </div>
                <div className={styles.city}>{flight.departure.city}</div>
              </div>

              {/* CENTER */}
              <div className={styles.center}>
                <div className={styles.flightAnimation}>
                  <div className={styles.flightDotedcontainer}>
                    <div className={styles.bigDot}></div>
                    <div className={styles.dashBorder} />
                    {/* <img src="/images/popupDash.svg" alt="" /> */}
                  </div>

                  <img
                    className={styles.flightSvg}
                    src="/icons/flightIconBlue.svg"
                    height={20}
                    width={20}
                    alt="flight"
                  />

                  <div className={styles.flightDotedcontainer}>
                    <div className={styles.dashBorder}></div>
                    <div className={styles.bigDot}></div>
                  </div>
                </div>

                <div className={styles.priceContainer}>
                  <span className={styles.duration}>
                    {flight.duration.hours}
                    <span className={styles.hours}> h </span>
                    {flight.duration.minutes}
                    <span className={styles.hours}> m </span>
                  </span>

                  <div className={styles.dot}></div>

                  <span className={styles.nonStop}>{flight.stops}</span>
                </div>
              </div>

              {/* RIGHT */}
              <div className={styles.sideRight}>
                <div className={styles.date}>{flight.arrival.date}</div>
                <div className={styles.time}>{flight.arrival.time}</div>
                <div className={styles.airport}>{flight.arrival.airport}</div>
                <div className={styles.terminal}>{flight.arrival.terminal}</div>
                <div className={styles.city}>{flight.arrival.city}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Fare Cards */}
        <div className={styles.fareCardsOverflowAuto}>
          <div className={styles.fareCards}>
            {fares.map((fare) => (
              <div
                key={fare.id}
                className={`${styles.fareCardContainer} ${
                  fare.isPremium ? styles.premiumContainer : ""
                }`}
              >
                {fare.isPremium && (
                  <div className={styles.premiumBadge}>PREMIUM</div>
                )}

                <div className={styles.fareCard}>
                  <div className={styles.fareHeader}>
                    <h3
                      className={`${styles.fareName} ${
                        fare.isPremium ? styles.fareNamePremium : ""
                      }`}
                    >
                      {fare.name}
                    </h3>
                    <div className={styles.farePrice}>
                      <span className={styles.price}>{fare.price}</span>
                      <img src="/icons/Group.svg" alt="" />
                    </div>
                    <span className={styles.pricePerAdult}>
                      {fare.pricePerAdult}{" "}
                      <span className={styles.adult}>/ ADULT</span>
                    </span>
                  </div>
                  <div className={styles.hr}></div>

                  {/* Baggage */}
                  <div className={styles.featureSection}>
                    <div className={styles.featureTitle}>BAGGAGE</div>
                    <div className={styles.featureItem}>
                      <img src="/icons/bigBag.svg" alt="" />
                      <span>{fare.baggage.cabin} Cabin bag allowance</span>
                    </div>
                    <div className={styles.featureItem}>
                      <img src="/icons/bag.svg" alt="" />
                      <span>{fare.baggage.checkin} Check-in bag allowance</span>
                    </div>
                  </div>

                  <div className={styles.hr}></div>

                  {/* Change/Cancellation */}
                  <div className={styles.featureSection}>
                    <div className={styles.featureTitle}>
                      CHANGE / CANCELLATION
                    </div>
                    <div className={styles.featureItem}>
                      <img src="/icons/change.svg" alt="" />
                      <span>{fare.changes.charges}</span>
                    </div>
                    <div className={styles.featureItem}>
                      <img src="/icons/cancellation.svg" alt="" />
                      <span>{fare.changes.cancellation}</span>
                    </div>
                  </div>

                  <div className={styles.hr}></div>

                  {/* Add-ons */}
                  <div className={styles.featureSection}>
                    <div className={styles.featureTitle}>
                      ADD-ONS AND SERVICES
                    </div>
                    <div className={styles.featureItem}>
                      <img
                        src={
                          fare.isPremium
                            ? "/icons/MEAL.svg"
                            : "/icons/change.svg"
                        }
                        alt=""
                      />
                      <span>{fare.addons.seats}</span>
                    </div>
                    <div className={styles.featureItem}>
                      <img
                        src={
                          fare.isPremium
                            ? "/icons/couch.svg"
                            : "/icons/cancellation.svg"
                        }
                        alt=""
                      />
                      <span>{fare.addons.meals}</span>
                    </div>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className={styles.fareActions}>
                  <button className={styles.lockPriceBtn}>LOCK PRICE</button>
                  <button className={styles.bookNowBtn} disabled={isSubmitting} onClick={() => handleBookNow(fare)}>
                    {isSubmitting ? "LOADING..." : "BOOK NOW"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {showLogin && authView === "login" && (
          <LoginPopup
            onClose={() => {
              setShowLogin(false);
              setPendingFare(null);
            }}
            onNavigate={setAuthView}
          />
        )}
        {showLogin && authView === "signup" && (
          <SignupPopup
            onClose={() => {
              setShowLogin(false);
              setPendingFare(null);
            }}
            onNavigate={setAuthView}
          />
        )}
      </div>
    </div>
  );
};

export default FareComparisonModalRoundTrip;

"use client";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./FareComparisonModalRoundTrip.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import useLockBodyScroll from "@/app/hooks/useLockBodyScroll";
import { toast } from "react-toastify";
import {
  getFlightPrice,
  getFlightTravelChecklist,
  getFlightFareOptions,
} from "@/features/flights/services/flightBooking";
import {
  buildBookingFallbackQuery,
  buildSelectedFarePriceRequest,
  writeFlightBookingSession,
} from "@/features/flights/utils/flightBookingSession";
import { buildFareOptions } from "../onewayTrip/FareComparisonModal";
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

const renderLoadingCards = (styles) =>
  Array.from({ length: 3 }).map((_, index) => (
    <div key={index} className={styles.loadingCard}>
      <div className={styles.loadingHeader}>
        <div className={styles.skeletonLogo} />
        <div className={styles.loadingHeaderText}>
          <div className={styles.skeletonLineShort} />
          <div className={styles.skeletonLineTiny} />
        </div>
        <div className={styles.skeletonBadge} />
      </div>
      <div className={styles.loadingBaggage}>
        <div className={styles.skeletonLineMedium} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLineMedium} />
      </div>
      <div className={styles.loadingActions}>
        <div className={styles.skeletonButton} />
        <div className={styles.skeletonButtonDark} />
      </div>
    </div>
  ));

const normalizeFlightNo = (value) => {
  const text = String(value || "").trim();
  if (!text) return "";

  if (text.includes("|")) {
    return text.split("|").pop()?.trim() || "";
  }

  const exact = text.match(/^\d+$/);
  if (exact) return exact[0];

  const trailing = text.match(/[A-Za-z]{1,3}[-\s]?(\d{1,4})$/);
  if (trailing) return trailing[1];

  return text;
};

const pickFlightNo = (...values) => {
  for (const value of values) {
    const text = normalizeFlightNo(value);
    if (text) return text;
  }

  return "";
};

const extractRoundTripFlightNos = (flightData) => {
  const onwardFlightNo = pickFlightNo(
    flightData?.booking?.priceRequest?.Trips?.[0]?.flightNo,
    flightData?.booking?.priceRequest?.Trips?.[0]?.flight_no,
    flightData?.depart?.flight?.details?.flightNo,
    flightData?.tripCard?.depart?.flight?.details?.flightNo,
    flightData?.outbound?.details?.flightNo,
    flightData?.outbound?.flightNo,
    flightData?.depart?.airline?.flightNo,
    flightData?.outbound?.airlines?.[0]?.flightNo,
    flightData?.outbound?.airlines?.[0]?.code,
    flightData?.booking?.flightNo
  );
  const returnFlightNo = pickFlightNo(
    flightData?.booking?.priceRequest?.Trips?.[1]?.flightNo,
    flightData?.booking?.priceRequest?.Trips?.[1]?.flight_no,
    flightData?.return?.flight?.details?.flightNo,
    flightData?.tripCard?.return?.flight?.details?.flightNo,
    flightData?.inbound?.details?.flightNo,
    flightData?.inbound?.flightNo,
    flightData?.return?.airline?.flightNo,
    flightData?.inbound?.airlines?.[0]?.flightNo,
    flightData?.inbound?.airlines?.[0]?.code
  );
  const fareOptionsFlightNoParam = [onwardFlightNo, returnFlightNo]
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
    .join(",");

  return {
    onwardFlightNo,
    returnFlightNo,
    fareOptionsFlightNoParam,
  };
};

const getSelectedFlightNo = (flightNos, selected) => {
  if (selected === "return") {
    return flightNos.returnFlightNo || flightNos.onwardFlightNo || "";
  }

  return flightNos.onwardFlightNo || flightNos.returnFlightNo || "";
};

const sameFare = (left, right) =>
  String(left?.id || "") === String(right?.id || "") &&
  String(left?.name || "") === String(right?.name || "");

const buildRoundTripSelectedFare = (onwardFare, returnFare) => {
  const onwardAmount = readNumber(onwardFare?.netAmount);
  const returnAmount = readNumber(returnFare?.netAmount);
  const netAmount =
    onwardAmount !== null && returnAmount !== null
      ? onwardAmount + returnAmount
      : undefined;

  return {
    ...(onwardFare || {}),
    id: `${onwardFare?.id || "onward"}-${returnFare?.id || "return"}`,
    name:
      sameFare(onwardFare, returnFare)
        ? onwardFare?.name || returnFare?.name || ""
        : [onwardFare?.name, returnFare?.name].filter(Boolean).join(" / "),
    price: netAmount !== undefined ? formatCurrency(netAmount) : onwardFare?.price,
    netAmount,
    roundTripFares: {
      onward: onwardFare,
      return: returnFare,
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
  const [selectedFares, setSelectedFares] = useState({
    onward: null,
    return: null,
  });
  const [fareOptionsPayload, setFareOptionsPayload] = useState(
    prefetchedData?.fareOptionsResponse || null
  );
  const [isFareOptionsLoading, setIsFareOptionsLoading] = useState(false);
  const [hasResolvedFareOptions, setHasResolvedFareOptions] = useState(
    Boolean(prefetchedData?.fareOptionsResponse)
  );

  const flightNos = React.useMemo(
    () => extractRoundTripFlightNos(flightData),
    [flightData]
  );
  const activeFlightNo = getSelectedFlightNo(flightNos, selected);

  useEffect(() => {
    if (!isOpen) return;

    setFareOptionsPayload(prefetchedData?.fareOptionsResponse || null);
    setIsFareOptionsLoading(false);
    setHasResolvedFareOptions(Boolean(prefetchedData?.fareOptionsResponse));
    setSelected("onward");
    setSelectedFares({ onward: null, return: null });

    const searchKey = flightData?.booking?.priceRequest?.search_key;
    if (!searchKey || !flightNos.fareOptionsFlightNoParam) {
      setHasResolvedFareOptions(true);
      return;
    }

    let cancelled = false;

    const loadFareOptions = async () => {
      try {
        setIsFareOptionsLoading(true);
        const response = await getFlightFareOptions({
          search_key: searchKey,
          flight_no: flightNos.fareOptionsFlightNoParam,
        });

        if (cancelled) return;
        setFareOptionsPayload(response);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load round-trip fare options", error);
        }
      } finally {
        if (!cancelled) {
          setIsFareOptionsLoading(false);
          setHasResolvedFareOptions(true);
        }
      }
    };

    loadFareOptions();

    return () => {
      cancelled = true;
    };
  }, [flightData, flightNos.fareOptionsFlightNoParam, isOpen, prefetchedData?.fareOptionsResponse]);

  const performBookNow = useCallback(async (selectedFare) => {
    const priceRequest = buildSelectedFarePriceRequest(
      flightData?.booking?.priceRequest,
      selectedFare
    );
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
    const nextSelectedFares = {
      ...selectedFares,
      [selected]: selectedFare,
    };
    setSelectedFares(nextSelectedFares);

    if (selected === "onward" && !nextSelectedFares.return) {
      setSelected("return");
      return;
    }

    if (selected === "return" && !nextSelectedFares.onward) {
      setSelected("onward");
      toast.info("Please select an onward fare to continue.");
      return;
    }

    const roundTripFare = buildRoundTripSelectedFare(
      nextSelectedFares.onward,
      nextSelectedFares.return
    );

    if (loading) return;
    if (!isLoggedIn) {
      setPendingFare(roundTripFare);
      setAuthView("login");
      setShowLogin(true);
      return;
    }
    performBookNow(roundTripFare);
  };

  const getBookNowLabel = () => {
    if (isSubmitting) return "LOADING...";
    if (selected === "onward" && !selectedFares.return) return "SELECT RETURN";
    if (selected === "return" && !selectedFares.onward) return "SELECT ONWARD";
    return "BOOK NOW";
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

  const activeSegment = flightSegments[selected];
  const { flight } = activeSegment;
  const fareSourcePayload = fareOptionsPayload || prefetchedData?.fareOptionsResponse || null;
  const hasFareOptionItems = Boolean(fareSourcePayload);
  const fareOptionsFlightData = React.useMemo(() => {
    if (!activeFlightNo) return flightData;
    return {
      ...flightData,
      booking: {
        ...(flightData?.booking || {}),
        flightNo: activeFlightNo,
      },
    };
  }, [activeFlightNo, flightData]);
  const fares = hasFareOptionItems
    ? buildFareOptions({
        flightData: fareOptionsFlightData,
        prefetchedData: {
          ...(prefetchedData || {}),
          fareOptionsResponse: fareSourcePayload,
        },
        adults: searchParams?.get("adults") || 1,
        allowFallbackCards: false,
      })
    : [];
  const showEmptyFareOptions =
    hasResolvedFareOptions && !isFareOptionsLoading && fares.length === 0;
  useLockBodyScroll(isOpen);
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
            {isFareOptionsLoading && !hasFareOptionItems
              ? renderLoadingCards(styles)
              : null}
            {showEmptyFareOptions ? (
              <div className={styles.emptyFareOptions}>
                No fare option available
              </div>
            ) : null}
            {fares.map((fare) => (
              <div
                key={fare.id}
                className={`${styles.fareCardContainer} ${
                  fare.isPremium ? styles.premiumContainer : ""
                } ${
                  sameFare(selectedFares[selected], fare)
                    ? styles.selectedFareCard
                    : ""
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
                  {/* <button className={styles.lockPriceBtn}>LOCK PRICE</button> */}
                  <button className={styles.bookNowBtn} disabled={isSubmitting} onClick={() => handleBookNow(fare)}>
                    {getBookNowLabel()}
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

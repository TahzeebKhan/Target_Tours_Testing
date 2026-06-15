"use client";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./MobileFareComparisonModalRoundTrip.module.css";
import FlightTimeline from "@/app/flight-booking-details/mobileViewComponents/components/flightTimeline/FlightTimeline";
import { useRouter, useSearchParams } from "next/navigation";
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
import { isFareExpiredPayload } from "../onewayTrip/fareOptionsStreaming";
import { useAuth } from "@/app/context/AuthContext";
import LoginPopup from "@/app/account/loginPopUp/LoginPopup";
import SignupPopup from "@/app/account/signUpPopUp/SignupPopup";
import useLockBodyScroll from "@/app/hooks/useLockBodyScroll";

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

const buildMobileSegment = (flight, dateLabel) => {
  const departure = parseCityLabel(flight?.departure?.city);
  const arrival = parseCityLabel(flight?.arrival?.city);
  const details = flight?.details || {};
  const departureTerminal = String(details?.departureTerminal || "").trim();
  const arrivalTerminal = String(details?.arrivalTerminal || "").trim();
  return {
    route: {
      fromName: departure.city || "N/A",
      fromCode: departure.code || "",
      toName: arrival.city || "N/A",
      toCode: arrival.code || "",
    },
    airline: {
      name: flight?.airlines?.[0]?.name || "N/A",
      code: flight?.airlines?.[0]?.code || "N/A",
      logo: flight?.airlines?.[0]?.logo || "/images/Flight.png",
      aircraft: "N/A",
      cabinClass: flight?.fare?.cabinClass || "N/A",
    },
    departure: {
      date: dateLabel || "N/A",
      time: flight?.departure?.time || "N/A",
      airport: `${departure.code || "N/A"} - ${(departure.city || "N/A").toUpperCase()}`,
      terminal: departureTerminal ? `Terminal ${departureTerminal}` : "Terminal N/A",
      city: compactAirportName(details?.fromName, departure.city || "N/A"),
    },
    arrival: {
      date: dateLabel || "N/A",
      time: flight?.arrival?.time || "N/A",
      airport: `${arrival.code || "N/A"} - ${(arrival.city || "N/A").toUpperCase()}`,
      terminal: arrivalTerminal ? `Terminal ${arrivalTerminal}` : "Terminal N/A",
      city: compactAirportName(details?.toName, arrival.city || "N/A"),
    },
    duration: flight?.duration || { hours: 0, minutes: 0 },
    stops: flight?.stops?.type || "N/A",
    mobileDate: dateLabel || "N/A",
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

const getSelectedFlightNo = (flightNos, activeTab) => {
  if (activeTab === "return") {
    return flightNos.returnFlightNo || flightNos.onwardFlightNo || "";
  }

  return flightNos.onwardFlightNo || flightNos.returnFlightNo || "";
};

const readNumber = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null || value === "") continue;

    const normalizedText =
      typeof value === "string" ? value.replace(/[^\d.]/g, "") : null;
    if (typeof value === "string" && !normalizedText) continue;

    const normalized =
      typeof value === "string" ? Number(normalizedText) : Number(value);
    if (Number.isFinite(normalized)) return normalized;
  }
  return null;
};

const formatCurrency = (value) => {
  const amount = readNumber(value);
  if (amount === null) return "";
  return `₹ ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
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

const getSelectedFareIndex = (fare) =>
  fare?.rawFare?.index ??
  fare?.rawFare?.Index ??
  fare?.rawFare?.flightIndex ??
  fare?.index ??
  fare?.Index ??
  fare?.flightIndex ??
  fare?.id;

const getPricePayload = (priceResponse) => {
  const nestedPayload = priceResponse?.data?.data;
  const directPayload = priceResponse?.data;

  if (nestedPayload?.formatted || nestedPayload?.fare_breakdown || nestedPayload?.tui) {
    return nestedPayload;
  }

  if (directPayload?.formatted || directPayload?.fare_breakdown || directPayload?.tui) {
    return directPayload;
  }

  return priceResponse || {};
};

const getFormattedPricePayload = (priceResponse) => getPricePayload(priceResponse)?.formatted || null;

const buildFormattedOnlyPriceResponse = (priceResponse) => {
  const payload = getPricePayload(priceResponse);
  const formatted = getFormattedPricePayload(priceResponse);
  const fareBreakdown = Array.isArray(payload?.fare_breakdown) ? payload.fare_breakdown : [];
  const tui =
    payload?.tui ||
    payload?.TUI ||
    priceResponse?.tui ||
    priceResponse?.TUI;
  const trackid =
    payload?.trackid ||
    payload?.trackId ||
    payload?.TrackId ||
    priceResponse?.trackid ||
    priceResponse?.trackId ||
    priceResponse?.TrackId;
  const provider =
    payload?.provider ||
    payload?.Provider ||
    priceResponse?.provider ||
    priceResponse?.Provider;

  return {
    success: priceResponse?.success ?? payload?.success,
    message: priceResponse?.message ?? payload?.message,
    provider,
    tui,
    trackid,
    data: {
      success: payload?.success,
      cached: payload?.cached,
      provider,
      tui,
      trackid,
      search_key: payload?.search_key || payload?.SearchKey,
      SSRSource: payload?.SSRSource,
      ssrSource: payload?.ssrSource,
      formatted,
      fare_breakdown: fareBreakdown,
      total_tax: payload?.total_tax,
      totalTax: payload?.totalTax,
      Tax: payload?.Tax,
      tax: payload?.tax,
    },
    formatted,
    fare_breakdown: fareBreakdown,
    total_tax: payload?.total_tax,
    totalTax: payload?.totalTax,
    Tax: payload?.Tax,
    tax: payload?.tax,
  };
};

const getFormattedJourneyByType = (formatted, journeyType, fallbackIndex) => {
  const journeys = Array.isArray(formatted?.journeys) ? formatted.journeys : [];
  const type = String(journeyType || "").toUpperCase();

  return (
    journeys.find((journey) =>
      String(journey?.journey_type || journey?.journeyType || "").toUpperCase() === type
    ) ||
    journeys[fallbackIndex] ||
    null
  );
};

const getFormattedRuleLabel = (journey, matchText, fallback) => {
  const match = String(matchText || "").toLowerCase();
  const rule = (journey?.rules || [])
    .flatMap((group) => (Array.isArray(group?.Rule) ? group.Rule : []))
    .find((item) => {
      const head = String(item?.Head || "").toLowerCase();
      const hasMatchingDescription = (item?.Info || []).some((info) =>
        String(info?.Description || "").toLowerCase().includes(match)
      );

      return head.includes(match) || hasMatchingDescription;
    });
  const amount =
    rule?.Info?.find((item) =>
      String(item?.Description || "").toLowerCase().includes(match)
    )?.AdultAmount || rule?.Info?.find((item) => item?.AdultAmount)?.AdultAmount;

  if (!amount) return fallback;
  return `${match === "reissue" ? "Change" : "Cancellation"} Charges ${amount}`;
};

const buildFareFromFormattedJourney = (fare, journey) => {
  if (!journey) return fare;

  const totalPrice = readNumber(
    journey?.total_pricing?.net,
    journey?.total_pricing?.gross
  );
  const perAdultPrice = readNumber(journey?.per_adult?.net, journey?.per_adult?.gross);
  const fareName = String(journey?.fctype || fare?.name || "").toUpperCase();

  return {
    ...fare,
    name: fareName || fare?.name,
    price: totalPrice !== null ? formatCurrency(totalPrice) : fare?.price,
    pricePerAdult: perAdultPrice !== null ? formatCurrency(perAdultPrice) : fare?.pricePerAdult,
    netAmount: totalPrice ?? fare?.netAmount,
    netPerAdult: perAdultPrice ?? fare?.netPerAdult,
    formattedFare: journey,
    baggage: {
      cabin:
        journey?.baggage?.cabin ||
        journey?.baggage?.Cabin ||
        fare?.baggage?.cabin ||
        "Cabin baggage as per airline rules",
      checkin:
        journey?.baggage?.checkin ||
        journey?.baggage?.CheckIn ||
        fare?.baggage?.checkin ||
        "Check-in baggage as per airline rules",
    },
    changes: {
      charges: getFormattedRuleLabel(
        journey,
        "reissue",
        fare?.changes?.charges || "Change charges as per airline rules"
      ),
      cancellation: getFormattedRuleLabel(
        journey,
        "cancellation",
        fare?.changes?.cancellation || "Cancellation charges as per airline rules"
      ),
    },
    addons: fare?.addons,
  };
};

const buildRoundTripFareFromFormattedPrice = (selectedFare, priceResponse) => {
  const formatted = getFormattedPricePayload(priceResponse);
  if (!formatted) return selectedFare;

  const onwardFare = buildFareFromFormattedJourney(
    selectedFare?.roundTripFares?.onward || selectedFare,
    getFormattedJourneyByType(formatted, "ONWARD", 0)
  );
  const returnFare = buildFareFromFormattedJourney(
    selectedFare?.roundTripFares?.return || selectedFare,
    getFormattedJourneyByType(formatted, "RETURN", 1)
  );
  const finalPrice = readNumber(formatted?.final_price);
  const combinedFare = buildRoundTripSelectedFare(onwardFare, returnFare);

  return {
    ...combinedFare,
    price: finalPrice !== null ? formatCurrency(finalPrice) : combinedFare.price,
    netAmount: finalPrice ?? combinedFare.netAmount,
  };
};

const MobileFareComparisonModalRoundTrip = ({
  isOpen,
  onClose,
  flightData,
}) => {
  useLockBodyScroll(isOpen);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [pendingFare, setPendingFare] = useState(null);
  const [activeTab, setActibeTab] = useState("onward");
  const [selectedFares, setSelectedFares] = useState({
    onward: null,
    return: null,
  });
  const [fareOptionsPayload, setFareOptionsPayload] = useState(null);
  const [isFareOptionsLoading, setIsFareOptionsLoading] = useState(false);

  const flightNos = React.useMemo(
    () => extractRoundTripFlightNos(flightData),
    [flightData]
  );
  const activeFlightNo = getSelectedFlightNo(flightNos, activeTab);

  useEffect(() => {
    if (!isOpen) return;

    setFareOptionsPayload(null);
    setIsFareOptionsLoading(false);
    setActibeTab("onward");
    setSelectedFares({ onward: null, return: null });

    const searchKey = flightData?.booking?.priceRequest?.search_key;
    if (!searchKey || !flightNos.fareOptionsFlightNoParam) return;

    let cancelled = false;

    const loadFareOptions = async () => {
      try {
        setIsFareOptionsLoading(true);
        const response = await getFlightFareOptions({
          search_key: searchKey,
          flight_no: flightNos.fareOptionsFlightNoParam,
        });
        if (!cancelled) {
          if (isFareExpiredPayload(response)) {
            setFareOptionsPayload(response);
            return;
          }
          setFareOptionsPayload(response);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load mobile round-trip fare options", error);
        }
      } finally {
        if (!cancelled) {
          setIsFareOptionsLoading(false);
        }
      }
    };

    loadFareOptions();

    return () => {
      cancelled = true;
    };
  }, [flightData, flightNos.fareOptionsFlightNoParam, isOpen]);

  const performBookNow = useCallback(async (selectedFare) => {
    const selectedPriceRequest = buildSelectedFarePriceRequest(
      flightData?.booking?.priceRequest,
      selectedFare
    );
    const priceRequest = {
      ...selectedPriceRequest,
      Trips: (selectedPriceRequest?.Trips || []).map((trip, index) => ({
        ...trip,
        Index:
          index === 0
            ? getSelectedFareIndex(selectedFare?.roundTripFares?.onward) ?? trip?.Index
            : getSelectedFareIndex(selectedFare?.roundTripFares?.return) ?? trip?.Index,
      })),
    };
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
    const hasTripIndexes =
      Array.isArray(priceRequest?.Trips) &&
      priceRequest.Trips.length > 0 &&
      priceRequest.Trips.every(
        (trip) => trip?.Index !== undefined && trip?.Index !== null
      );

    if (!priceRequest?.search_key || !hasTripIndexes) {
      toast.error("Missing booking payload for the selected flight.");
      return;
    }

    setIsSubmitting(true);
    try {
      const priceResponse = await getFlightPrice(priceRequest);
      const formattedOnlyPriceResponse = buildFormattedOnlyPriceResponse(priceResponse);
      const selectedFareFromFormattedPrice = buildRoundTripFareFromFormattedPrice(
        selectedFare,
        formattedOnlyPriceResponse
      );
      const checklistTui =
        formattedOnlyPriceResponse?.data?.tui ||
        formattedOnlyPriceResponse?.data?.TUI ||
        formattedOnlyPriceResponse?.tui ||
        formattedOnlyPriceResponse?.TUI ||
        formattedOnlyPriceResponse?.data?.formatted?.TUI ||
        formattedOnlyPriceResponse?.data?.formatted?.tui ||
        formattedOnlyPriceResponse?.formatted?.TUI ||
        formattedOnlyPriceResponse?.formatted?.tui;
      const provider =
        priceRequest?.provider ||
        flightData?.booking?.provider ||
        flightData?.provider ||
        formattedOnlyPriceResponse?.data?.provider ||
        formattedOnlyPriceResponse?.provider;

      let checklistResponse = null;
      if (checklistTui) {
        try {
          checklistResponse = await getFlightTravelChecklist({
            TUI: checklistTui,
            provider,
            ClientID:
              flightData?.booking?.clientId ||
              priceRequest?.ClientID ||
              "FVI6V120g22Ei5ztGK0FIQ==",
          });
        } catch (error) {
          console.warn("Travel checklist unavailable", error);
        }
      }
      const nextSession = {
        selectedFlight: flightData,
        selectedFare: selectedFareFromFormattedPrice,
        routeContext,
        priceRequest,
        priceResponse: formattedOnlyPriceResponse,
        checklistResponse,
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
  }, [flightData, router, searchParams]);

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
      [activeTab]: selectedFare,
    };
    setSelectedFares(nextSelectedFares);

    if (activeTab === "onward" && !nextSelectedFares.return) {
      setActibeTab("return");
      return;
    }

    if (activeTab === "return" && !nextSelectedFares.onward) {
      setActibeTab("onward");
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
    if (activeTab === "onward" && !selectedFares.return) return "BOOK NOW";
    if (activeTab === "return" && !selectedFares.onward) return "BOOK NOW";
    return "BOOK NOW";
  };
  if (!isOpen) return null;
  const fareOptionsFlightData = activeFlightNo
    ? {
        ...flightData,
        booking: {
          ...(flightData?.booking || {}),
          flightNo: activeFlightNo,
        },
      }
    : flightData;
  const fareOptions = fareOptionsPayload
    ? buildFareOptions({
        flightData: fareOptionsFlightData,
        prefetchedData: {
          fareOptionsResponse: fareOptionsPayload,
        },
        adults: searchParams?.get("adults") || 1,
        allowFallbackCards: false,
      })
    : [];

  const flight = activeTab === "onward"
    ? buildMobileSegment(flightData?.outbound, flightData?.outbound?.dateLabel)
    : buildMobileSegment(flightData?.inbound, flightData?.inbound?.dateLabel);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.tripDetailsContainer}>
          <div className={styles.tripDetailsHeader}>
            <img
              src="/icons/leftArrowTrip.svg"
              alt="back"
              onClick={onClose} // or router.back() if needed
              style={{ cursor: "pointer" }}
            />
            <p className={styles.tripDetails}>
              Compare fares and choose what fits your journey
            </p>
          </div>
        </div>

        <div className={styles.TripCard}>
          {/* Header Section: Dark blue background with Route and Date */}
          <div className={styles.TripCardHeader}>
            <div className={styles.TripCardHeaderDetails}>
              <p className={styles.TripCardHeaderDetailsItemText}>{flight.route.fromName.toUpperCase()}</p>
              <span className={styles.TripCardHeaderDetailsItemCode}>
                ({flight.route.fromCode})
              </span>

              <img src="/icons/right-arrow.svg" alt="arrow" />

              <p className={styles.TripCardHeaderDetailsItemText}>
                {flight.route.toName.toUpperCase()}
              </p>
              <span className={styles.TripCardHeaderDetailsItemCode}>
                ({flight.route.toCode})
              </span>
            </div>
            <div className={styles.TripCardHeaderDate}>{flight.mobileDate}</div>
          </div>

          {/* Content Section: White background with Airline, Timeline, and Links */}
          <div className={styles.TripFlightDetailsCard}>
            <div className={styles.TripFlightDetailsCardCont}>
              <div className={styles.TripFlightDetailsCardImage}>
                <img src={flight.airline.logo} alt="" />
              </div>
              <div className={styles.AirLineDetails}>
                <div className={styles.AirLineDetailsItem}>
                  <span className={styles.AirLineDetailsItemText}>
                    {flight.airline.name}
                  </span>
                  <div className={styles.dot}></div>
                  <span className={styles.AirLineCode}>{flight.airline.code}</span>
                </div>
                <div className={styles.AirLineDetailsItem}>
                  <span className={styles.AirLineBoeing}>
                    {flight.airline.aircraft}
                  </span>
                  <div className={styles.dot}></div>
                  <span className={styles.AirLineDetailsItemCode}>
                    {flight.airline.cabinClass}
                  </span>
                </div>
              </div>
            </div>
            <FlightTimeline flight={flight} />
            <div className={styles.Airportname}>
              <span>{flight.departure.city}</span>
              <span>{flight.arrival.city}</span>
            </div>
          </div>
        </div>
        {/* Header */}

        <div className={styles.header}>
          <h2 className={styles.title}>Select Service</h2>
        </div>

        {/* Fare Cards */}
        <div className={styles.toggleTabContainer}>
          <div
            onClick={() => setActibeTab("onward")}
            className={`${styles.toggleTab} ${
              activeTab === "onward" ? styles.activeTab : ""
            }`}
          >
            ONWARD FLIGHT ({parseCityLabel(flightData?.outbound?.departure?.city).code || "N/A"}-{parseCityLabel(flightData?.outbound?.arrival?.city).code || "N/A"})
          </div>
          <div
            onClick={() => setActibeTab("return")}
            className={`${styles.toggleTab} ${
              activeTab === "return" ? styles.activeTab : ""
            }`}
          >
            RETURN FLIGHT ({parseCityLabel(flightData?.inbound?.departure?.city).code || "N/A"}-{parseCityLabel(flightData?.inbound?.arrival?.city).code || "N/A"})
          </div>
        </div>
        <div className={styles.fareCards}>
          {isFareOptionsLoading && fareOptions.length === 0
            ? renderLoadingCards(styles)
            : null}
          {fareOptions.map((fare) => (
            <div
              key={fare.id}
              className={`${styles.fareCardContainer} ${
                fare.isPremium ? styles.premiumContainer : ""
              } ${
                sameFare(selectedFares[activeTab], fare)
                  ? styles.selectedFareCard
                  : ""
              }`}
            >
              {fare.isPremium && (
                <div className={styles.premiumBadge}>PREMIUM</div>
              )}

              <div className={styles.fareCard}>
                <div className={styles.fareHeader}>
                  <h3 className={styles.fareName}>{fare.name}</h3>
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
                    <span>{fare.baggage.cabin}</span>
                  </div>
                  <div className={styles.featureItem}>
                    <img src="/icons/bag.svg" alt="" />
                    <span>{fare.baggage.checkin}</span>
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
                        fare.isPremium ? "/icons/MEAL.svg" : "/icons/change.svg"
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
                <button onClick={() => handleBookNow(fare)} className={styles.bookNowBtn} disabled={isSubmitting}>
                  {getBookNowLabel()}
                </button>
              </div>
            </div>
          ))}
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

export default MobileFareComparisonModalRoundTrip;

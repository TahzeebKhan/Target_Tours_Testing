"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./FareComparisonModalRoundTrip.module.css";
import { useRouter } from "next/navigation";
import { useFlightSearchParams } from "../../hooks/useFlightSearchParams";
import useLockBodyScroll from "@/app/hooks/useLockBodyScroll";
import { toast } from "react-toastify";
import {
  getFlightPrice,
  getFlightFareOptions,
} from "@/features/flights/services/flightBooking";
import {
  buildBookingFallbackQuery,
  buildSelectedFarePriceRequest,
  writeFlightBookingSession,
} from "@/features/flights/utils/flightBookingSession";
import { buildFareOptions } from "../onewayTrip/FareComparisonModal";
import {
  getFareOptionItems,
  mergeProviderFareOptionResponses,
} from "../onewayTrip/fareOptionsStreaming";
import { useAuth } from "@/app/context/AuthContext";
import LoginPopup from "@/app/account/loginPopUp/LoginPopup";
import SignupPopup from "@/app/account/signUpPopUp/SignupPopup";

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

const renderLoadingCards = (styles, count = 3) =>
  Array.from({ length: count }).map((_, index) => (
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

const buildLegFareOptionsRequest = (priceRequest = {}, leg, flightNos = {}) => {
  const trips = Array.isArray(priceRequest?.Trips) ? priceRequest.Trips : [];
  const tripIndex = leg === "return" ? 1 : 0;
  const selectedTrip = trips[tripIndex] || trips[0] || null;
  const flightNo = getSelectedFlightNo(flightNos, leg);
  const providedSearchKeys = Array.isArray(
    priceRequest?.search_keys || priceRequest?.searchKeys,
  )
    ? priceRequest.search_keys || priceRequest.searchKeys
    : [];
  const matchingSearchKeys = providedSearchKeys.filter((item) => {
    const itemFlightNo = pickFlightNo(
      item?.flight_no,
      item?.flightNo,
      item?.FlightNumber,
      item?.FlightNo,
    );

    return flightNo && itemFlightNo === flightNo;
  });
  const legSearchKeys = matchingSearchKeys.length
    ? matchingSearchKeys
    : providedSearchKeys[tripIndex]
      ? [providedSearchKeys[tripIndex]]
      : [];

  return {
    ...priceRequest,
    Trips: selectedTrip ? [selectedTrip] : [],
    ...(providedSearchKeys.length
      ? { search_keys: legSearchKeys, searchKeys: undefined }
      : {}),
    ...(flightNo ? { flight_no: flightNo, flightNo } : {}),
  };
};

const buildLegFareOptionsFlightData = (flightData, leg, flightNos = {}) => {
  const flightNo = getSelectedFlightNo(flightNos, leg);

  if (!flightNo) return flightData;

  return {
    ...flightData,
    booking: {
      ...(flightData?.booking || {}),
      flightNo,
    },
  };
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

const FareComparisonModalRoundTrip = ({
  isOpen,
  onClose,
  flightData,
  prefetchedData = null,
}) => {
  const router = useRouter();
  const searchParams = useFlightSearchParams();
  const { isLoggedIn, loading } = useAuth();
  const [loadingFareKey, setLoadingFareKey] = useState("");
  const activeBookingRequestRef = useRef(null);
  const [showLogin, setShowLogin] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [pendingFare, setPendingFare] = useState(null);
  const [selected, setSelected] = useState("onward");
  const [selectedFares, setSelectedFares] = useState({
    onward: null,
    return: null,
  });
  const [fareOptionsPayloads, setFareOptionsPayloads] = useState({
    onward: null,
    return: null,
  });
  const [fareOptionsLoading, setFareOptionsLoading] = useState({
    onward: false,
    return: false,
  });
  const [fareOptionsResolved, setFareOptionsResolved] = useState({
    onward: false,
    return: false,
  });

  const flightNos = React.useMemo(
    () => extractRoundTripFlightNos(flightData),
    [flightData]
  );

  useEffect(() => {
    if (!isOpen) return;

    setFareOptionsPayloads({
      onward: null,
      return: null,
    });
    setFareOptionsLoading({ onward: false, return: false });
    setFareOptionsResolved({
      onward: false,
      return: false,
    });
    setSelected("onward");
    setSelectedFares({ onward: null, return: null });

    const priceRequest = flightData?.booking?.priceRequest;
    if (!priceRequest) {
      setFareOptionsResolved({ onward: true, return: true });
      return;
    }

    let cancelled = false;

    const loadFareOptions = async (leg) => {
      try {
        setFareOptionsLoading((prev) => ({ ...prev, [leg]: true }));
        const legRequest = buildLegFareOptionsRequest(priceRequest, leg, flightNos);
        const legFlight = buildLegFareOptionsFlightData(flightData, leg, flightNos);
        const legFlightNo =
          legFlight?.booking?.flightNo ||
          legFlight?.details?.flightNo ||
          legFlight?.airlines?.[0]?.flightNo ||
          legFlight?.airlines?.[0]?.code;
        const response = await getFlightFareOptions({
          searchParams,
          request: legRequest,
          flight: legFlight,
          onFareOptionsEvent: (_eventPayload, accumulatedPayload) => {
            if (cancelled || !accumulatedPayload) return;
            setFareOptionsPayloads((prev) => ({
              ...prev,
              [leg]: mergeProviderFareOptionResponses(
                prev[leg],
                accumulatedPayload,
                legFlightNo
              ),
            }));
          },
        });

        if (cancelled) return;
        setFareOptionsPayloads((prev) => ({
          ...prev,
          [leg]: mergeProviderFareOptionResponses(prev[leg], response, legFlightNo),
        }));
      } catch (error) {
        if (!cancelled) {
          console.error(`Failed to load ${leg} round-trip fare options`, error);
        }
      } finally {
        if (!cancelled) {
          setFareOptionsLoading((prev) => ({ ...prev, [leg]: false }));
          setFareOptionsResolved((prev) => ({ ...prev, [leg]: true }));
        }
      }
    };

    ["onward", "return"].forEach((leg) => loadFareOptions(leg));

    return () => {
      cancelled = true;
    };
  }, [flightData, flightNos, isOpen, prefetchedData?.fareOptionsResponse, searchParams]);

  const performBookNow = useCallback(async (selectedFare, fareKey = "pending") => {
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
      departureDate: String(searchParams?.get("start") || "").trim(),
      returnDate: String(searchParams?.get("end") || "").trim(),
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

    activeBookingRequestRef.current?.abort();
    const controller = new AbortController();
    activeBookingRequestRef.current = controller;
    setLoadingFareKey(fareKey);
    try {
      const priceResponse = await getFlightPrice(priceRequest, {
        signal: controller.signal,
      });
      const formattedOnlyPriceResponse = buildFormattedOnlyPriceResponse(priceResponse);
      const selectedFareFromFormattedPrice = buildRoundTripFareFromFormattedPrice(
        selectedFare,
        formattedOnlyPriceResponse
      );
      const nextSession = {
        selectedFlight: flightData,
        selectedFare: selectedFareFromFormattedPrice,
        routeContext,
        priceRequest,
        priceResponse: formattedOnlyPriceResponse,
        checklistResponse: null,
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
      if (error?.name === "AbortError") return;
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Unable to continue with this flight right now."
      );
    } finally {
      if (activeBookingRequestRef.current === controller) {
        activeBookingRequestRef.current = null;
        setLoadingFareKey("");
      }
    }
  }, [flightData, router, searchParams]);

  useEffect(() => {
    return () => activeBookingRequestRef.current?.abort();
  }, []);

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
    performBookNow(roundTripFare, `${selected}:${selectedFare?.id || "fare"}`);
  };

  const getBookNowLabel = (fare) => {
    if (loadingFareKey === `${selected}:${fare?.id || "fare"}`) return "LOADING...";
    if (selected === "onward" && !selectedFares.return) return "BOOK NOW";
    if (selected === "return" && !selectedFares.onward) return "BOOK NOW";
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
  const fareSourcePayload =
    fareOptionsPayloads[selected] || null;
  const fareOptionsFlightData = React.useMemo(() => {
    return buildLegFareOptionsFlightData(flightData, selected, flightNos);
  }, [flightData, flightNos, selected]);
  const fareOptionsFlightNo =
    fareOptionsFlightData?.booking?.flightNo ||
    fareOptionsFlightData?.details?.flightNo ||
    fareOptionsFlightData?.airlines?.[0]?.flightNo ||
    fareOptionsFlightData?.airlines?.[0]?.code;
  const hasFareOptionItems =
    getFareOptionItems(fareSourcePayload, fareOptionsFlightNo).length > 0;
  const fares = hasFareOptionItems
    ? buildFareOptions({
      flightData: fareOptionsFlightData,
      prefetchedData: {
        ...(prefetchedData || {}),
        fareOptionsResponse: fareSourcePayload,
      },
      adults: searchParams?.get("adults") || 1,
    })
    : [];
  const isFareOptionsLoading = Boolean(fareOptionsLoading[selected]);
  const hasResolvedFareOptions = Boolean(fareOptionsResolved[selected]);
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
                className={`${styles.toggleBtn} ${selected === key ? styles.active : ""
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
                src={selected === "onward" ? flightData?.depart?.airline?.logo || "/images/dummyFlightlogo.png" : flightData?.return?.airline?.logo || "/images/dummyFlightlogo.png"}
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
            {showEmptyFareOptions ? (
              <div className={styles.emptyFareOptions}>
                No fare option available
              </div>
            ) : null}
            {fares.map((fare) => (
              <div
                key={fare.id}
                className={`${styles.fareCardContainer} ${fare.isPremium ? styles.premiumContainer : ""
                  } ${sameFare(selectedFares[selected], fare)
                    ? styles.selectedFareCard
                    : ""
                  }`}
              >
                {fare.isPremium && (
                  <div className={styles.premiumBadge}>PREMIUM</div>
                )}

                <div className={styles.fareCard}>
                  <div className={styles.fareHeader}>
                    {/* <span className={styles.radioOutline}></span> */}
                    <h3
                      className={`${styles.fareName} ${fare.isPremium ? styles.fareNamePremium : ""
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
                  <button
                    className={styles.bookNowBtn}
                    disabled={loadingFareKey === `${selected}:${fare?.id || "fare"}`}
                    onClick={() => handleBookNow(fare)}
                  >
                    {getBookNowLabel(fare)}
                  </button>
                </div>
              </div>
            ))}
            {isFareOptionsLoading && fares.length === 0
              ? renderLoadingCards(styles, 3)
              : null}
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

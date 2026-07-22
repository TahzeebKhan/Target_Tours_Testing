"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useLockBodyScroll from "@/app/hooks/useLockBodyScroll";
import {
  getFlightFareOptions,
  getFlightPrice,
} from "@/features/flights/services/flightBooking";
import {
  buildBookingFallbackQuery,
  writeFlightBookingSession,
} from "@/features/flights/utils/flightBookingSession";
import { toast } from "react-toastify";
import { buildFareOptions } from "../onewayTrip/FareComparisonModal";
import styles from "./FareComparisonModalMulticity.module.css";

const money = (value) => {
  const amount = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(amount)
    ? `₹ ${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
    : "N/A";
};

const routeCode = (value = "") => {
  const text = String(value || "");
  return text.match(/\(([^)]+)\)/)?.[1]?.trim().toUpperCase() || text.trim().toUpperCase();
};

const airportName = (value, fallback) =>
  String(value || fallback || "N/A").split("|")[0].trim() || "N/A";

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "N/A";
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).toUpperCase();
};

const renderLoadingCards = () =>
  Array.from({ length: 3 }, (_, index) => (
    <div key={`multi-fare-skeleton-${index}`} className={styles.loadingCard}>
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

const fallbackFare = (card, index) => ({
  id: `selected-${index}`,
  name: card?.fare?.cabinClass || "SELECTED FARE",
  price: card?.fare?.totalFare || "N/A",
  pricePerAdult: card?.fare?.pricePerAdult || "N/A",
  isPremium: false,
  baggage: { cabin: "As per airline rules", checkin: "As per airline rules" },
  changes: {
    charges: "Change charges as per airline rules",
    cancellation: "Cancellation charges as per airline rules",
  },
  addons: {
    seats: "Seats as per availability",
    meals: "Meals as per airline rules",
  },
});

const getCardFlightNumber = (card = {}) =>
  String(
    card?.booking?.flightNo ||
      card?.depart?.flight?.details?.flightNo ||
      card?.depart?.airline?.flightNo ||
      card?.depart?.airline?.code ||
      "",
  )
    .split("|")
    .pop()
    ?.trim() || "";

const isMultiCityFareOption = (item) =>
  Boolean(
    item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      (item.FCType || item.fareName) &&
      (item.price !== undefined || item.grossFare !== undefined) &&
      item.departure === undefined &&
      item.arrival === undefined &&
      item.origin === undefined &&
      item.destination === undefined,
  );

const findFareOptionsForFlight = (payload, flightNo) => {
  const seen = new WeakSet();
  const fallbackLists = [];

  const visit = (value) => {
    if (!value || typeof value !== "object" || seen.has(value)) return null;
    seen.add(value);

    if (Array.isArray(value)) {
      const fareItems = value.filter(isMultiCityFareOption);
      if (fareItems.length) fallbackLists.push(fareItems);

      for (const item of value) {
        const found = visit(item);
        if (found) return found;
      }
      return null;
    }

    for (const mapKey of ["merged", "fare_options"]) {
      const fareMap = value?.[mapKey];
      if (!fareMap || typeof fareMap !== "object") continue;

      const exact = fareMap?.[flightNo];
      if (Array.isArray(exact) && exact.length) {
        const exactFareOptions = exact.filter(isMultiCityFareOption);
        if (exactFareOptions.length) return exactFareOptions;
      }
    }

    for (const child of Object.values(value)) {
      const found = visit(child);
      if (found) return found;
    }
    return null;
  };

  return visit(payload) || fallbackLists[0] || [];
};

const normalizeMultiCityFarePayload = (payload, card) => {
  const flightNo = getCardFlightNumber(card);
  const fareOptions = findFareOptionsForFlight(payload, flightNo);
  if (!fareOptions.length) return null;

  return {
    merged: { [flightNo || "selected"]: fareOptions },
    data: { merged: { [flightNo || "selected"]: fareOptions } },
  };
};

const getFareIndex = (fare = {}) =>
  fare?.rawFare?.index ?? fare?.rawFare?.Index ?? fare?.index ?? fare?.Index ?? fare?.id;

const getFareAmount = (fare = {}) => {
  const value =
    fare?.rawFare?.price ?? fare?.rawFare?.grossFare ?? fare?.netAmount ?? fare?.price;
  const amount = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
};

const getRouteSearchKey = (route = {}) =>
  route?.card?.booking?.providerOptions?.[0]?.search_key ||
  route?.card?.booking?.priceRequest?.search_key ||
  route?.card?.booking?.searchKey ||
  "";

const getRouteTui = (route = {}) =>
  route?.card?.booking?.providerOptions?.[0]?.TUI ||
  route?.card?.booking?.priceRequest?.Trips?.[0]?.TUI ||
  route?.card?.booking?.tui ||
  "";

const buildMultiCityPriceRequest = (routes, selectedFares) => {
  const firstRequest = routes[0]?.card?.booking?.priceRequest || {};
  const routeRequests = routes.map((route, index) => {
    const fare = selectedFares[route.key];
    const searchKey = getRouteSearchKey(route);
    const tui = getRouteTui(route);
    const fareIndex = getFareIndex(fare);

    return {
      search_key: searchKey,
      TUI: tui,
      Trips: [{
        Index: String(fareIndex ?? ""),
        Order: 1,
        OrderID: String(index + 1),
        TUI: tui,
        Amount: getFareAmount(fare),
      }],
    };
  });

  return {
    ...firstRequest,
    TripType: "DM",
    tripType: "DM",
    FareType: "DM",
    search_key: routeRequests[0]?.search_key || firstRequest?.search_key,
    search_keys: routeRequests,
    Trips: routeRequests.map((request, index) => ({
      ...request.Trips[0],
      search_key: request.search_key,
      OrderID: String(index + 1),
    })),
  };
};

const mergeMultiCityFarePayload = (currentPayload, nextPayload, card) => {
  const flightNo = getCardFlightNumber(card) || "selected";
  const currentFares = findFareOptionsForFlight(currentPayload, flightNo);
  const nextFares = findFareOptionsForFlight(nextPayload, flightNo);
  const uniqueFares = new Map();

  [...currentFares, ...nextFares].forEach((fare, index) => {
    const key = String(
      fare?.index ||
        `${fare?.fareName || fare?.FCType || "fare"}-${fare?.price ?? fare?.grossFare ?? index}`,
    );
    uniqueFares.set(key, fare);
  });

  const fares = [...uniqueFares.values()];
  if (!fares.length) return currentPayload || nextPayload || null;

  return {
    merged: { [flightNo]: fares },
    data: { merged: { [flightNo]: fares } },
  };
};

const buildRoute = ({ segment = {}, card = {} }, index) => {
  const flight = card?.depart?.flight || card?.outbound || {};
  const details = flight?.details || card?.details || {};
  const airline = card?.depart?.airline || card?.airlines?.[0] || {};
  const from = routeCode(segment.from || flight?.departure?.city);
  const to = routeCode(segment.to || flight?.arrival?.city);

  return {
    key: `${from}-${to}-${index}`,
    label: `${from || "N/A"}-${to || "N/A"}`,
    card,
    airline,
    flight: {
      departure: {
        date: formatDate(details?.departureDateTime || segment.date),
        time: flight?.departure?.time || "N/A",
        airport: `${from || "N/A"} - ${String(segment.from || from || "N/A").replace(/\s*\([^)]+\)\s*$/, "").toUpperCase()}`,
        terminal: details?.departureTerminal ? `Terminal ${details.departureTerminal}` : "Terminal N/A",
        city: airportName(details?.fromName, segment.from),
      },
      arrival: {
        date: formatDate(details?.arrivalDateTime || segment.date),
        time: flight?.arrival?.time || "N/A",
        airport: `${to || "N/A"} - ${String(segment.to || to || "N/A").replace(/\s*\([^)]+\)\s*$/, "").toUpperCase()}`,
        terminal: details?.arrivalTerminal ? `Terminal ${details.arrivalTerminal}` : "Terminal N/A",
        city: airportName(details?.toName, segment.to),
      },
      duration: flight?.duration || { hours: 0, minutes: 0 },
      stops: flight?.stops?.type || "N/A",
    },
  };
};

const FareComparisonModalMulticity = ({
  isOpen,
  onClose,
  selectedRoutes = [],
}) => {
  const router = useRouter();
  useLockBodyScroll(Boolean(isOpen));
  const routes = useMemo(() => selectedRoutes.map(buildRoute), [selectedRoutes]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [farePayloads, setFarePayloads] = useState({});
  const [loadingRoutes, setLoadingRoutes] = useState({});
  const [resolvedRoutes, setResolvedRoutes] = useState({});
  const [selectedFares, setSelectedFares] = useState({});
  const [continuing, setContinuing] = useState(false);
  const requestGenerationRef = useRef(0);
  const requestedRouteKeysRef = useRef(new Set());
  const wasOpenRef = useRef(false);

  useEffect(() => {
    const open = Boolean(isOpen);

    if (open && !wasOpenRef.current) {
      requestGenerationRef.current += 1;
      requestedRouteKeysRef.current.clear();
      setSelectedIndex(0);
      setFarePayloads({});
      setLoadingRoutes({});
      setResolvedRoutes({});
      setSelectedFares({});
      setContinuing(false);
    } else if (!open && wasOpenRef.current) {
      requestGenerationRef.current += 1;
      requestedRouteKeysRef.current.clear();
    }

    wasOpenRef.current = open;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || routes.length === 0) return;

    const requestGeneration = requestGenerationRef.current;
    const loadRouteFares = async (route, routeIndex) => {
      const routeKey = route.key;
      const routeRequest = route?.card?.booking?.moreFares
        ? route?.card?.booking?.priceRequest
        : null;

      if (!routeRequest) {
        setResolvedRoutes((current) => ({ ...current, [routeKey]: true }));
        return;
      }

      setLoadingRoutes((current) => ({ ...current, [routeKey]: true }));
      try {
        const response = await getFlightFareOptions({
          request: routeRequest,
          flight: route.card,
          onFareOptionsEvent: (eventPayload) => {
            if (requestGeneration !== requestGenerationRef.current) return;
            const normalizedEventPayload = normalizeMultiCityFarePayload(
              eventPayload,
              route.card,
            );
            if (!normalizedEventPayload) return;

            setFarePayloads((current) => ({
              ...current,
              [routeKey]: mergeMultiCityFarePayload(
                current[routeKey],
                normalizedEventPayload,
                route.card,
              ),
            }));
          },
        });
        if (requestGeneration === requestGenerationRef.current) {
          const normalizedResponse = normalizeMultiCityFarePayload(
            response,
            route.card,
          );
          if (normalizedResponse) {
            setFarePayloads((current) => ({
              ...current,
              [routeKey]: mergeMultiCityFarePayload(
                current[routeKey],
                normalizedResponse,
                route.card,
              ),
            }));
          }
        }
      } catch (error) {
        if (requestGeneration === requestGenerationRef.current) {
          console.error(
            `Failed to load multi-city route ${routeIndex + 1} fares`,
            error,
          );
        }
      } finally {
        if (requestGeneration === requestGenerationRef.current) {
          setLoadingRoutes((current) => ({
            ...current,
            [routeKey]: false,
          }));
          setResolvedRoutes((current) => ({
            ...current,
            [routeKey]: true,
          }));
        }
      }
    };

    routes.forEach((route, routeIndex) => {
      const routeKey = route?.key;
      if (
        !routeKey ||
        requestedRouteKeysRef.current.has(routeKey) ||
        loadingRoutes[routeKey] ||
        resolvedRoutes[routeKey]
      ) {
        return;
      }

      requestedRouteKeysRef.current.add(routeKey);
      loadRouteFares(route, routeIndex);
    });
  }, [isOpen, routes, loadingRoutes, resolvedRoutes]);

  if (!isOpen || routes.length === 0) return null;

  const activeRoute = routes[selectedIndex] || routes[0];
  const { card, airline, flight } = activeRoute;
  const adults = Number(card?.booking?.priceRequest?.adults || 1);
  const normalizedFarePayload = normalizeMultiCityFarePayload(
    farePayloads[activeRoute.key],
    card,
  );
  const dynamicFares = buildFareOptions({
    flightData: card,
    prefetchedData: { fareOptionsResponse: normalizedFarePayload },
    adults,
  });
  const fares = dynamicFares.length ? dynamicFares : [fallbackFare(card, selectedIndex)];

  const handleBookNow = async (fare) => {
    if (continuing) return;

    const nextSelectedFares = {
      ...selectedFares,
      [activeRoute.key]: fare,
    };
    setSelectedFares(nextSelectedFares);

    const nextRouteIndex = routes.findIndex(
      (route, index) => index > selectedIndex && !nextSelectedFares[route.key],
    );
    const firstUnselectedIndex = routes.findIndex(
      (route) => !nextSelectedFares[route.key],
    );
    const targetIndex = nextRouteIndex >= 0 ? nextRouteIndex : firstUnselectedIndex;

    if (targetIndex >= 0) {
      setSelectedIndex(targetIndex);
      return;
    }

    const priceRequest = buildMultiCityPriceRequest(routes, nextSelectedFares);
    const hasCompletePayload = priceRequest.search_keys.every(
      (request) => request.search_key && request.TUI && request.Trips?.[0]?.Index,
    );

    if (!hasCompletePayload) {
      toast.error("Missing fare details for one or more routes.");
      return;
    }

    setContinuing(true);
    try {
      const priceResponse = await getFlightPrice(priceRequest);
      const selectedFareList = routes.map((route) => nextSelectedFares[route.key]);
      const selectedFlight = {
        ...routes[0].card,
        tripType: "DM",
        multiCityRoutes: routes.map((route) => route.card),
        booking: {
          ...(routes[0].card?.booking || {}),
          priceRequest,
        },
      };
      const nextSession = {
        selectedFlight,
        selectedFare: {
          ...selectedFareList[0],
          multiCityFares: selectedFareList,
        },
        priceRequest,
        priceResponse,
        checklistResponse: null,
        ssrRequest: null,
        ssrResponse: null,
      };

      writeFlightBookingSession(nextSession);
      const fallbackQuery = buildBookingFallbackQuery(nextSession);
      router.push(
        fallbackQuery
          ? `/flight-booking-details?${fallbackQuery}`
          : "/flight-booking-details",
      );
    } catch (error) {
      toast.error(error?.message || "Unable to continue with these fares.");
    } finally {
      setContinuing(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Compare fares and choose what fits your journey</h2>
          <button className={styles.closeButton} onClick={onClose} type="button">×</button>
        </div>

        <div className={styles.flightInfo}>
          <div className={styles.toggleBtnsContainer}>
            {routes.map((route, index) => (
              <button
                key={route.key}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`${styles.toggleBtn} ${selectedIndex === index ? styles.active : ""}`}
              >
                {route.label}
              </button>
            ))}
          </div>

          <div className={styles.flightDuration}>
            <div className={styles.flightInfoStatus}>
              <img className={styles.flightIconStatus} src={airline?.logo || "/images/dummyFlightlogo.png"} alt="" />
              <div className={styles.flightInfoNameDatesContainer}>
                <span className={styles.flightInfoNameDates}>{airline?.name || "Airline"}</span>
                <div className={styles.smallestDot} />
                <span className={styles.flightInfoNameDates}>{airline?.code || card?.booking?.flightNo || "N/A"}</span>
                <div className={styles.smallestDot} />
                <span className={styles.flightInfoNameDates}>{card?.fare?.cabinClass || "Economy"}</span>
              </div>
            </div>

            <div className={styles.timelineContainer}>
              <div className={styles.side}>
                <div className={styles.date}>{flight.departure.date}</div>
                <div className={styles.time}>{flight.departure.time}</div>
                <div className={styles.airport}>{flight.departure.airport}</div>
                <div className={styles.terminal}>{flight.departure.terminal}</div>
                <div className={styles.city}>{flight.departure.city}</div>
              </div>
              <div className={styles.center}>
                <div className={styles.flightAnimation}>
                  <div className={styles.flightDotedcontainer}><div className={styles.bigDot} /><div className={styles.dashBorder} /></div>
                  <img className={styles.flightSvg} src="/icons/flightIconBlue.svg" height={20} width={20} alt="flight" />
                  <div className={styles.flightDotedcontainer}><div className={styles.dashBorder} /><div className={styles.bigDot} /></div>
                </div>
                <div className={styles.priceContainer}>
                  <span className={styles.duration}>{flight.duration.hours || 0}<span className={styles.hours}> h </span>{flight.duration.minutes || 0}<span className={styles.hours}> m </span></span>
                  <div className={styles.dot} />
                  <span className={styles.nonStop}>{flight.stops}</span>
                </div>
              </div>
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

        <div className={styles.fareCardsOverflowAuto}>
          <div className={styles.fareCards}>
            {loadingRoutes[activeRoute.key] ? renderLoadingCards() : fares.map((fare) => (
              <div key={fare.id} className={`${styles.fareCardContainer} ${fare.isPremium ? styles.premiumContainer : ""} ${selectedFares[activeRoute.key]?.id === fare.id ? styles.selectedFareCard : ""}`}>
                {fare.isPremium && <div className={styles.premiumBadge}>PREMIUM</div>}
                <div className={styles.fareCard}>
                  <div className={styles.fareHeader}>
                    <h3 className={`${styles.fareName} ${fare.isPremium ? styles.fareNamePremium : ""}`}>
                    {/* <span className={styles.radioOutline} /> */}
                    {fare.name}</h3>
                    <div className={styles.farePrice}><span className={styles.price}>{fare.price || money(fare.netAmount)}</span><img src="/icons/Group.svg" alt="" /></div>
                    <span className={styles.pricePerAdult}>{fare.pricePerAdult}<span className={styles.adult}> / ADULT</span></span>
                  </div>
                  <div className={styles.hr} />
                  <div className={styles.featureSection}>
                    <div className={styles.featureTitle}>BAGGAGE</div>
                    <div className={styles.featureItem}><img src="/icons/bigBag.svg" alt="" /><span>{fare.baggage?.cabin || "As per airline rules"}</span></div>
                    <div className={styles.featureItem}><img src="/icons/bag.svg" alt="" /><span>{fare.baggage?.checkin || "As per airline rules"}</span></div>
                  </div>
                  <div className={styles.hr} />
                  <div className={styles.featureSection}>
                    <div className={styles.featureTitle}>CHANGE / CANCELLATION</div>
                    <div className={styles.featureItem}><img src="/icons/change.svg" alt="" /><span>{fare.changes?.charges}</span></div>
                    <div className={styles.featureItem}><img src="/icons/cancellation.svg" alt="" /><span>{fare.changes?.cancellation}</span></div>
                  </div>
                  <div className={styles.hr} />
                  <div className={styles.featureSection}>
                    <div className={styles.featureTitle}>ADD-ONS AND SERVICES</div>
                    <div className={styles.featureItem}><img src="/icons/couch.svg" alt="" /><span>{fare.addons?.seats}</span></div>
                    <div className={styles.featureItem}><img src="/icons/MEAL.svg" alt="" /><span>{fare.addons?.meals}</span></div>
                  </div>
                </div>
                <div className={styles.fareActions}>
                  <button className={styles.bookNowBtn} type="button" disabled={continuing} onClick={() => handleBookNow(fare)}>{continuing ? "LOADING..." : "BOOK NOW"}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FareComparisonModalMulticity;

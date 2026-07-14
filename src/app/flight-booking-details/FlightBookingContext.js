"use client";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createFlightItinerary, getFlightSeatLayout, getFlightSsr, getFlightV2Ssr, retrieveFlightBooking, startFlightPayment } from "@/features/flights/services/flightBooking";
import { toast } from "react-toastify";
import {
  buildCreateItineraryPayload,
  buildRetrieveBookingPayload,
  buildSeatLayoutPayload,
  buildStartPaymentPayload,
  buildSsrPayload,
  buildV2SsrPayload,
  extractBaseFareAmount,
  extractTaxAmount,
  readBookingFallbackFromSearch,
  readFlightBookingSession,
  withFlightPricingSessionExpiry,
  writeFlightBookingSession,
} from "@/features/flights/utils/flightBookingSession";

const FlightBookingContext = createContext(null);

const getApiMessage = (payload, fallback) => {
  return (
    payload?.data?.message ||
    payload?.message ||
    fallback
  );
};

const getSsrRequestKey = (payload = {}) => {
  try {
    return JSON.stringify({
      provider: payload?.provider,
      search_key: payload?.search_key,
      Source: payload?.Source,
      FareType: payload?.FareType,
      ssr_requests: Array.isArray(payload?.ssr_requests)
        ? payload.ssr_requests.map((request) => ({
            search_key: request?.search_key,
            Trips: Array.isArray(request?.Trips)
              ? request.Trips.map((trip) => ({
                  Index: trip?.Index,
                  Order: trip?.Order,
                  TUI: trip?.TUI,
                }))
              : [],
          }))
        : [],
      Trips: Array.isArray(payload?.Trips)
        ? payload.Trips.map((trip) => ({
            Amount: trip?.Amount,
            Index: trip?.Index,
            OrderID: trip?.OrderID,
            TUI: trip?.TUI,
          }))
        : [],
    });
  } catch {
    return "";
  }
};

const unwrapFlightPayload = (response = {}) =>
  response?.data?.data || response?.data || response || {};

const normalizePriceFormattedRoutes = (priceResponse = {}) => {
  const payload = unwrapFlightPayload(priceResponse);
  const formatted = payload?.formatted || {};

  if (Array.isArray(formatted?.journeys)) {
    return formatted.journeys.reduce((acc, journey, index) => {
      const flightDetails = journey?.flight_details || {};
      const routeKey =
        journey?.route ||
        (flightDetails?.from && flightDetails?.to
          ? `${flightDetails.from}-${flightDetails.to}`
          : `journey-${index + 1}`);
      const mealItems = Array.isArray(journey?.meal)
        ? journey.meal
        : Array.isArray(journey?.meals)
          ? journey.meals
          : Array.isArray(journey?.ssr)
            ? journey.ssr.filter((item) => item?.MealID || item?.meal_id)
            : [];
      const baggageItems = Array.isArray(journey?.baggage)
        ? journey.baggage
        : Array.isArray(journey?.ssr)
          ? journey.ssr.filter((item) => item?.BaggageID || item?.baggage_id)
          : [];

      acc[routeKey] = {
        ...journey,
        meals: mealItems,
        meal: mealItems,
        baggage: baggageItems,
      };
      return acc;
    }, {});
  }

  return Object.entries(formatted).reduce((acc, [routeKey, value]) => {
    if (!value || typeof value !== "object") return acc;
    const mealItems = Array.isArray(value?.meals)
      ? value.meals
      : Array.isArray(value?.meal)
        ? value.meal
        : [];
    const baggageItems = Array.isArray(value?.baggage) ? value.baggage : [];

    acc[routeKey] = {
      ...value,
      meals: mealItems,
      meal: mealItems,
      baggage: baggageItems,
    };
    return acc;
  }, {});
};

const buildSsrResponseFromPrice = (priceResponse = {}) => {
  const formattedRoutes = normalizePriceFormattedRoutes(priceResponse);
  const hasAncillaryData = Object.values(formattedRoutes).some(
    (route) => (route?.meals?.length || 0) > 0 || (route?.baggage?.length || 0) > 0
  );

  if (!hasAncillaryData) return null;

  return {
    success: true,
    provider: unwrapFlightPayload(priceResponse)?.provider || priceResponse?.provider,
    data: {
      formatted: formattedRoutes,
      raw: unwrapFlightPayload(priceResponse)?.raw || priceResponse?.raw || null,
      source: "price",
    },
  };
};

export function FlightBookingProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(2);
  const skipNextHistoryPushRef = useRef(false);
  const ssrRequestInFlightRef = useRef(false);
  const initialSsrLoadRef = useRef(false);
  const seatLayoutRequestInFlightRef = useRef(false);

  const [baggage, setBaggage] = useState([]);
  const [meals, setMeals] = useState([]);
  const [seats, setSeats] = useState([]);
  const [bookingSession, setBookingSession] = useState(null);
  const [bookingSessionReady, setBookingSessionReady] = useState(false);
  const [travelerDetails, setTravelerDetails] = useState([]);
  const [bookingContactDetails, setBookingContactDetails] = useState({});
  const [travelerFormErrors, setTravelerFormErrors] = useState({
    travelers: {},
    bookingContact: {},
  });
  const [bookingError, setBookingError] = useState("");
  const [ssrLoading, setSsrLoading] = useState(false);
  const [seatLayoutLoading, setSeatLayoutLoading] = useState(false);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);






  useEffect(() => {
    if (typeof window === "undefined") return;

    const historyState = window.history.state || {};
    window.history.replaceState(
      {
        ...historyState,
        flightBookingStep: 2,
      },
      ""
    );

    const handlePopState = (event) => {
      const nextStep = Number(event.state?.flightBookingStep);
      if (!Number.isFinite(nextStep) || nextStep < 2 || nextStep > 6) {
        return;
      }

      skipNextHistoryPushRef.current = true;
      setCurrentStep(nextStep);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (skipNextHistoryPushRef.current) {
      skipNextHistoryPushRef.current = false;
      return;
    }

    const existingStep = Number(window.history.state?.flightBookingStep);
    if (existingStep === currentStep) return;

    window.history.pushState(
      {
        ...(window.history.state || {}),
        flightBookingStep: currentStep,
      },
      ""
    );
  }, [currentStep]);

  useEffect(() => {
    const savedSession = readFlightBookingSession() || null;
    const fallbackView =
      typeof window !== "undefined"
        ? readBookingFallbackFromSearch(window.location.search)
        : null;
    const nextSession =
      savedSession || fallbackView
        ? withFlightPricingSessionExpiry({
            ...(savedSession || {}),
            ...(fallbackView ? { urlFallback: fallbackView } : {}),
          })
        : null;
        console.log("nextSession2",nextSession)
    setBookingSession(nextSession);
    setBookingSessionReady(true);
  }, []);

  useEffect(() => {
    if (!bookingSessionReady) return;
    writeFlightBookingSession(bookingSession);
  }, [bookingSession, bookingSessionReady]);

  const loadSsrForBooking = async ({
    travelerDetailsOverride,
    includeSeatLayout = true,
  } = {}) => {
    console.log("bookingSession?.priceResponse",bookingSession?.priceResponse)
    if (!bookingSession?.priceResponse) return false;
    const activeTravelerDetails = Array.isArray(travelerDetailsOverride)
      ? travelerDetailsOverride
      : travelerDetails;

    const v2SsrPayload = buildV2SsrPayload(bookingSession);
    const hasV2SsrPayload =
      Array.isArray(v2SsrPayload?.ssr_requests) &&
      v2SsrPayload.ssr_requests.length > 0;
    const cachedV2SsrRequestKey = getSsrRequestKey(bookingSession?.ssrRequest);
    const v2SsrRequestKey = getSsrRequestKey(v2SsrPayload);
    const canReuseV2SsrResponse =
      bookingSession?.ssrResponse &&
      cachedV2SsrRequestKey &&
      cachedV2SsrRequestKey === v2SsrRequestKey;

    if (hasV2SsrPayload) {
      ssrRequestInFlightRef.current = true;
      setSsrLoading(true);
      setBookingError("");

      try {
        console.log("v2 SSR payload", v2SsrPayload);
        const ssrResponse = canReuseV2SsrResponse
          ? bookingSession.ssrResponse
          : await getFlightV2Ssr(v2SsrPayload);
           console.log("ssrResponse",ssrResponse)

        let seatLayoutResponse = bookingSession?.seatLayoutResponse || null;
        let seatLayoutRequest = bookingSession?.seatLayoutRequest || null;
        if (includeSeatLayout && bookingSession?.seatLayoutRequest?.seat_layout_requests?.length) {
          seatLayoutResponse = null;
          seatLayoutRequest = null;
        }

        if (includeSeatLayout && !seatLayoutResponse && !seatLayoutRequestInFlightRef.current) {
          seatLayoutRequestInFlightRef.current = true;
          setSeatLayoutLoading(true);
          const sessionWithSsr = {
            ...(bookingSession || {}),
            ssrRequest: v2SsrPayload,
            ssrResponse,
          };
          seatLayoutRequest = buildSeatLayoutPayload(
            sessionWithSsr,
            activeTravelerDetails
          );

          if (
            seatLayoutRequest?.Trips?.[0]?.TUI ||
            seatLayoutRequest?.TrackId ||
            seatLayoutRequest?.seat_layout_requests?.length
          ) {
            try {
              seatLayoutResponse = await getFlightSeatLayout(seatLayoutRequest);
            } catch (seatLayoutError) {
              console.error("Unable to load seat layout", seatLayoutError);
            }
          }
        }

        setBookingSession((prev) => ({
          ...(prev || {}),
          ssrRequest: v2SsrPayload,
          ssrResponse,
          ssrSource: "v2",
          seatLayoutRequest,
          seatLayoutResponse,
        }));
        return true;
      } catch (error) {
        console.warn("Unable to load v2 SSR details", error);
      } finally {
        ssrRequestInFlightRef.current = false;
        seatLayoutRequestInFlightRef.current = false;
        setSsrLoading(false);
        setSeatLayoutLoading(false);
      }
    }

    const priceSsrResponse = buildSsrResponseFromPrice(bookingSession.priceResponse);
    if (priceSsrResponse) {
      let seatLayoutResponse = bookingSession?.seatLayoutResponse || null;
      let seatLayoutRequest = bookingSession?.seatLayoutRequest || null;

      try {
        if (includeSeatLayout && !seatLayoutResponse && !seatLayoutRequestInFlightRef.current) {
          seatLayoutRequestInFlightRef.current = true;
          setSeatLayoutLoading(true);

          const sessionWithPriceSsr = {
            ...(bookingSession || {}),
            ssrRequest: null,
            ssrResponse: priceSsrResponse,
          };
          seatLayoutRequest = buildSeatLayoutPayload(
            sessionWithPriceSsr,
            activeTravelerDetails
          );
   console.log("Seat layout request built from price SSR", seatLayoutRequest);
          if (
            seatLayoutRequest?.Trips?.[0]?.TUI ||
            seatLayoutRequest?.TrackId ||
            seatLayoutRequest?.seat_layout_requests?.length
          ) {
            try {
              seatLayoutResponse = await getFlightSeatLayout(seatLayoutRequest);
            } catch (seatLayoutError) {
              console.error("Unable to load seat layout", seatLayoutError);
            }
          }
        }

        setBookingSession((prev) => ({
          ...(prev || {}),
          ssrRequest: null,
          ssrResponse: priceSsrResponse,
          ssrSource: "price",
          seatLayoutRequest,
          seatLayoutResponse,
        }));
        return true;
      } finally {
        seatLayoutRequestInFlightRef.current = false;
        setSeatLayoutLoading(false);
      }
    }

    const ssrPayload = buildSsrPayload(bookingSession);
    const ssrRequestKey = getSsrRequestKey(ssrPayload);
    const cachedSsrRequestKey = getSsrRequestKey(bookingSession?.ssrRequest);
    const canReuseSsrResponse =
      bookingSession?.ssrResponse &&
      cachedSsrRequestKey &&
      cachedSsrRequestKey === ssrRequestKey;

    if (canReuseSsrResponse && bookingSession?.seatLayoutResponse) return true;

    const hasCompleteSsrTrips =
      Array.isArray(ssrPayload?.Trips) &&
      ssrPayload.Trips.length > 0 &&
      ssrPayload.Trips.every(
        (trip) =>
          trip?.TUI &&
          trip?.OrderID !== undefined &&
          trip?.OrderID !== null &&
          trip?.OrderID !== ""
      );

    if (!ssrPayload?.search_key || !hasCompleteSsrTrips) {
      setBookingError("SSR payload is incomplete for this booking.");
      return false;
    }

    ssrRequestInFlightRef.current = true;
    setSsrLoading(true);
    setBookingError("");
    try {
      const ssrResponse = canReuseSsrResponse
        ? bookingSession.ssrResponse
        : await getFlightSsr(ssrPayload);
      if (
        ssrResponse?.success === false ||
        ssrResponse?.data?.success === false
      ) {
        throw new Error(
          getApiMessage(ssrResponse, "Unable to load baggage and SSR details.")
        );
      }
      let seatLayoutResponse = bookingSession?.seatLayoutResponse || null;
      let seatLayoutRequest = bookingSession?.seatLayoutRequest || null;

      if (includeSeatLayout && !seatLayoutResponse && !seatLayoutRequestInFlightRef.current) {
        seatLayoutRequestInFlightRef.current = true;
        setSeatLayoutLoading(true);
        const sessionWithSsr = {
          ...(bookingSession || {}),
          ssrRequest: ssrPayload,
          ssrResponse,
        };
        seatLayoutRequest = buildSeatLayoutPayload(
          sessionWithSsr,
          activeTravelerDetails
        );

        if (
          seatLayoutRequest?.Trips?.[0]?.TUI ||
          seatLayoutRequest?.TrackId ||
          seatLayoutRequest?.seat_layout_requests?.length
        ) {
          try {
            seatLayoutResponse = await getFlightSeatLayout(seatLayoutRequest);
          } catch (seatLayoutError) {
            console.error("Unable to load seat layout", seatLayoutError);
          }
        }
      }

      setBookingSession((prev) => ({
        ...(prev || {}),
        ssrRequest: ssrPayload,
        ssrResponse,
        seatLayoutRequest,
        seatLayoutResponse,
      }));
      return true;
    } catch (error) {
      const message =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Unable to load baggage and SSR details.";
      toast.warn(message);
      setBookingError(message);
      setBookingSession((prev) => ({
        ...(prev || {}),
        ssrRequest: ssrPayload,
        ssrResponse: null,
        seatLayoutRequest: null,
        seatLayoutResponse: null,
        ssrError: message,
      }));
      return true;
    } finally {
      ssrRequestInFlightRef.current = false;
      seatLayoutRequestInFlightRef.current = false;
      setSsrLoading(false);
      setSeatLayoutLoading(false);
    }
  };

  useEffect(() => {
    if (
      !bookingSessionReady ||
      !bookingSession?.priceResponse ||
      initialSsrLoadRef.current
    ) {
      return;
    }

    initialSsrLoadRef.current = true;
    loadSsrForBooking({ includeSeatLayout: false });
  }, [bookingSession?.priceResponse, bookingSessionReady]);

  const prices = useMemo(() => {
    const baseFare = extractBaseFareAmount(bookingSession);
    const tax = extractTaxAmount(bookingSession);
    const baggagePrice = baggage.reduce((s, b) => s + b.price, 0);
    const mealsPrice = meals.reduce((s, m) => s + m.price, 0);
    const seatsPrice = seats.reduce((s, s1) => s + s1.price, 0);

    return {
      baseFare,
      tax,
      baggage: baggagePrice,
      meals: mealsPrice,
      seats: seatsPrice,
      total: baseFare + baggagePrice + mealsPrice + seatsPrice,
    };
  }, [baggage, bookingSession, meals, seats]);

  const submitItinerary = async () => {
    if (itineraryLoading) return false;

    const payload = buildCreateItineraryPayload(
      {
        ...(bookingSession || {}),
        travelerDetails,
        bookingContactDetails,
        baggage,
        meals,
        seats,
      },
      prices
    );
    const provider = String(payload?.provider || payload?.Provider || "")
      .trim()
      .toLowerCase();
    const hasAkbarPayload = Boolean(payload?.TUI && payload?.Travellers?.length);
    const hasRiyaPayload = Boolean(
      provider === "riya" &&
        payload?.TrackId &&
        payload?.ItineraryFlightsInfo?.length &&
        payload?.PaxDetailsInfo?.length
    );

    if (!hasAkbarPayload && !hasRiyaPayload) {
      setBookingError("Passenger or booking data is incomplete.");
      return false;
    }

    setBookingError("");
    setPaymentSuccessData(null);
    setItineraryLoading(true);
    try {
      const createItineraryResponse = await createFlightItinerary(payload);
      if (
        createItineraryResponse?.success === false ||
        createItineraryResponse?.data?.success === false
      ) {
        throw new Error(
          getApiMessage(createItineraryResponse, "Unable to create itinerary.")
        );
      }

      const nextSession = {
        ...(bookingSession || {}),
        createItineraryRequest: payload,
        createItineraryResponse,
      };
      const startPaymentPayload = buildStartPaymentPayload(nextSession);
      if (!startPaymentPayload?.TUI) {
        throw new Error("TUI missing in create-itinerary response.");
      }
      setBookingSession((prev) => ({
        ...(prev || {}),
        createItineraryRequest: payload,
        createItineraryResponse,
        startPaymentRequest: startPaymentPayload,
      }));
      const startPaymentResponse = await startFlightPayment(startPaymentPayload);
      const retrieveBookingPayload = buildRetrieveBookingPayload({
        ...(bookingSession || {}),
        createItineraryRequest: payload,
        createItineraryResponse,
        startPaymentRequest: startPaymentPayload,
        startPaymentResponse,
      });
      const retrieveBookingResponse = await retrieveFlightBooking(retrieveBookingPayload);

      setBookingSession((prev) => ({
        ...(prev || {}),
        createItineraryRequest: payload,
        createItineraryResponse,
        startPaymentRequest: startPaymentPayload,
        startPaymentResponse,
        retrieveBookingRequest: retrieveBookingPayload,
        retrieveBookingResponse,
      }));
      setPaymentSuccessData({
        createItinerary: createItineraryResponse?.data || null,
        startPayment: startPaymentResponse?.data || null,
        retrieveBooking: retrieveBookingResponse || null,
      });
      toast.success("Payment session started successfully");
      return true;
    } catch (error) {
      const message =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Unable to create itinerary.";
      toast.error(
        message
      );
      setBookingError(message);
      return false;
    } finally {
      setItineraryLoading(false);
    }
  };

  return (
    <FlightBookingContext.Provider
      value={{
        currentStep,
        setCurrentStep,

        baggage,
        setBaggage,
        meals,
        setMeals,
        seats,
        setSeats,
        bookingSession,
        setBookingSession,
        travelerDetails,
        setTravelerDetails,
        bookingContactDetails,
        setBookingContactDetails,
        travelerFormErrors,
        setTravelerFormErrors,
        bookingError,
        ssrLoading,
        seatLayoutLoading,
        loadSsrForBooking,
        itineraryLoading,
        submitItinerary,
        paymentSuccessData,
        setPaymentSuccessData,

        prices,
      }}
    >
      {children}
    </FlightBookingContext.Provider>
  );
}

export function useFlightBooking() {
  const ctx = useContext(FlightBookingContext);
  if (!ctx) {
    throw new Error(
      "useFlightBooking must be used inside FlightBookingProvider"
    );
  }
  return ctx;
}

export function useOptionalFlightBooking() {
  return useContext(FlightBookingContext);
}

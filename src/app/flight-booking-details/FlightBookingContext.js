"use client";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createFlightV2Booking, getFlightSeatLayout, getFlightSsr, getFlightV2Ssr, startFlightGatewayPayment } from "@/features/flights/services/flightBooking";
import { toast } from "react-toastify";
import {
  buildCreateBookingPayload,
  buildFlightGatewayPaymentPayload,
  buildSeatLayoutPayload,
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

const getPaymentRedirectUrl = (payload = {}) => {
  const data = payload?.data || {};
  const nestedData = data?.data || {};
  return (
    payload?.redirecturl ||
    payload?.redirectUrl ||
    payload?.redirect_url ||
    payload?.paymentUrl ||
    payload?.payment_url ||
    payload?.paymentLink ||
    payload?.url ||
    data?.redirecturl ||
    data?.redirectUrl ||
    data?.redirect_url ||
    data?.paymentUrl ||
    data?.payment_url ||
    data?.paymentLink ||
    data?.url ||
    nestedData?.redirecturl ||
    nestedData?.redirectUrl ||
    nestedData?.redirect_url ||
    nestedData?.paymentUrl ||
    nestedData?.payment_url ||
    nestedData?.paymentLink ||
    nestedData?.url ||
    ""
  );
};

const getPaymentResponseData = (payload = {}) =>
  payload?.data?.data && typeof payload.data.data === "object"
    ? payload.data.data
    : payload?.data && typeof payload.data === "object"
      ? payload.data
      : payload && typeof payload === "object"
        ? payload
        : {};

const getCashfreePaymentSessionId = (payload = {}) => {
  const data = payload?.data || {};
  const nestedData = data?.data || {};
  return (
    payload?.payment_session_id ||
    payload?.paymentSessionId ||
    data?.payment_session_id ||
    data?.paymentSessionId ||
    nestedData?.payment_session_id ||
    nestedData?.paymentSessionId ||
    ""
  );
};

const normalizePaymentGateway = (paymentGateway = "") =>
  String(
    paymentGateway && typeof paymentGateway === "object"
      ? paymentGateway.id ||
          paymentGateway.slug ||
          paymentGateway.code ||
          paymentGateway.name ||
          paymentGateway.payment_gateway ||
          paymentGateway.paymentGateway ||
          paymentGateway.gateway ||
          ""
      : paymentGateway || ""
  )
    .trim()
    .toLowerCase();

let cashfreeSdkPromise;

const loadCashfreeSdk = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Cashfree checkout is only available in the browser."));
  }

  if (typeof window.Cashfree === "function") {
    return Promise.resolve(window.Cashfree);
  }

  if (cashfreeSdkPromise) return cashfreeSdkPromise;

  cashfreeSdkPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]'
    );
    const script = existingScript || document.createElement("script");

    const handleLoad = () => {
      if (typeof window.Cashfree === "function") {
        resolve(window.Cashfree);
        return;
      }

      cashfreeSdkPromise = null;
      reject(new Error("Cashfree checkout SDK is unavailable."));
    };

    const handleError = () => {
      cashfreeSdkPromise = null;
      reject(new Error("Unable to load Cashfree checkout."));
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existingScript) {
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return cashfreeSdkPromise;
};

const normalizeCashfreeMode = (value) => {
  const mode = String(value || "").trim().toLowerCase();
  if (mode === "sandbox" || mode === "production") return mode;
  return "";
};

const getCashfreeMode = (paymentResponse = {}) => {
  const data = paymentResponse?.data || {};
  const nestedData = data?.data || {};
  const responseMode = normalizeCashfreeMode(
    paymentResponse?.environment ||
      paymentResponse?.checkout_mode ||
      paymentResponse?.checkoutMode ||
      data?.environment ||
      data?.checkout_mode ||
      data?.checkoutMode ||
      nestedData?.environment ||
      nestedData?.checkout_mode ||
      nestedData?.checkoutMode
  );

  if (responseMode) return responseMode;

  if (process.env.NEXT_PUBLIC_CASHFREE_MODE) {
    return normalizeCashfreeMode(process.env.NEXT_PUBLIC_CASHFREE_MODE) || "production";
  }

  return typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "sandbox"
    : "production";
};

const writeFlightPaymentSnapshot = ({
  paymentGateway,
  paymentResponse,
  gatewayPaymentPayload,
  createBookingResponse,
}) => {
  if (typeof window === "undefined") return;

  const paymentData = getPaymentResponseData(paymentResponse);
  const createBookingData = getPaymentResponseData(createBookingResponse);

  try {
    window.localStorage.setItem(
      "flightPaymentSnapshot",
      JSON.stringify({
        paymentGateway: normalizePaymentGateway(paymentGateway),
        bookingId:
          paymentData.booking_id ||
          paymentData.bookingId ||
          paymentData.merchant_order_id ||
          paymentData.merchantOrderId ||
          "",
        merchantOrderId:
          paymentData.merchant_order_id ||
          paymentData.merchantOrderId ||
          "",
        orderId:
          paymentData.order_id ||
          paymentData.orderId ||
          "",
        paymentOrderId:
          paymentData.payment_order_id ||
          paymentData.paymentOrderId ||
          "",
        transactionId:
          gatewayPaymentPayload?.TransactionID ||
          paymentData.TransactionID ||
          paymentData.transactionId ||
          "",
        TUI: gatewayPaymentPayload?.TUI || paymentData.TUI || createBookingData.TUI || "",
        searchKey:
          gatewayPaymentPayload?.search_key ||
          paymentData.search_key ||
          createBookingData.search_key ||
          "",
        amount:
          gatewayPaymentPayload?.NetAmount ||
          paymentData.amount ||
          paymentData.NetAmount ||
          "",
        paymentResponse,
        createdAt: Date.now(),
      })
    );
  } catch {
    // Best-effort storage for the return page.
  }
};

const redirectToFlightGatewayPayment = async (paymentResponse, paymentGateway) => {
  const gateway = normalizePaymentGateway(paymentGateway);

  if (gateway === "cashfree") {
    const paymentSessionId = getCashfreePaymentSessionId(paymentResponse);
    if (!paymentSessionId) {
      throw new Error("Cashfree payment session ID is missing.");
    }

    const Cashfree = await loadCashfreeSdk();
    const cashfree = Cashfree({ mode: getCashfreeMode(paymentResponse) });
    const checkoutResult = await cashfree.checkout({
      paymentSessionId,
      redirectTarget: "_self",
    });

    if (checkoutResult?.error) {
      throw new Error(
        checkoutResult.error.message || "Unable to open Cashfree checkout."
      );
    }
    return;
  }

  const paymentRedirectUrl = getPaymentRedirectUrl(paymentResponse);
  if (!paymentRedirectUrl) {
    throw new Error("Payment URL is missing.");
  }

  window.open(paymentRedirectUrl, "_blank", "noopener,noreferrer");
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
  const [paymentMethod, setPaymentMethod] = useState("");






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

  const submitItinerary = async (paymentGateway = "") => {
    if (itineraryLoading) return false;
    const selectedPaymentGateway =
      typeof paymentGateway === "string" && paymentGateway.trim()
        ? paymentGateway.trim().toLowerCase()
        : "";

    if (!selectedPaymentGateway) {
      setBookingError("Payment gateway is required.");
      toast.error("Payment gateway is required.", {
        toastId: "flight-payment-gateway-required",
      });
      return false;
    }

    const sessionPayload = {
      ...(bookingSession || {}),
      travelerDetails,
      bookingContactDetails,
      baggage,
      meals,
      seats,
    };
    const createBookingPayload = buildCreateBookingPayload(
      sessionPayload,
      prices
    );

    if (
      !createBookingPayload?.search_key ||
      !createBookingPayload?.TUI ||
      !createBookingPayload?.passengers?.length
    ) {
      setBookingError("Passenger or booking data is incomplete.");
      return false;
    }

    setBookingError("");
    setPaymentSuccessData(null);
    setItineraryLoading(true);
    try {
      const createBookingResponse = await createFlightV2Booking(createBookingPayload);
      if (
        createBookingResponse?.success === false ||
        createBookingResponse?.data?.success === false
      ) {
        throw new Error(
          getApiMessage(createBookingResponse, "Unable to create booking.")
        );
      }
      const gatewayPaymentPayload = buildFlightGatewayPaymentPayload({
        session: sessionPayload,
        createBookingPayload,
        createBookingResponse,
        paymentGateway: selectedPaymentGateway,
      });

      if (
        !gatewayPaymentPayload?.search_key ||
        !gatewayPaymentPayload?.TUI ||
        !gatewayPaymentPayload?.TransactionID ||
        !gatewayPaymentPayload?.NetAmount
      ) {
        throw new Error("Payment payload is incomplete.");
      }

      const gatewayPaymentResponse = await startFlightGatewayPayment(
        selectedPaymentGateway,
        gatewayPaymentPayload
      );
      writeFlightPaymentSnapshot({
        paymentGateway: selectedPaymentGateway,
        paymentResponse: gatewayPaymentResponse,
        gatewayPaymentPayload,
        createBookingResponse,
      });

      setBookingSession((prev) => ({
        ...(prev || {}),
        createBookingRequest: createBookingPayload,
        createBookingResponse,
        gatewayPaymentRequest: gatewayPaymentPayload,
        gatewayPaymentResponse,
      }));
      setPaymentSuccessData(null);
      toast.success("Payment session started successfully");

      if (typeof window !== "undefined") {
        await redirectToFlightGatewayPayment(
          gatewayPaymentResponse,
          selectedPaymentGateway
        );
      }

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
        paymentMethod,
        setPaymentMethod,

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

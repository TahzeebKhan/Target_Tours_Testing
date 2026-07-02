"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./MobileFareComparisonModal.module.css";
import FlightTimeline from "@/app/flight-booking-details/mobileViewComponents/components/flightTimeline/FlightTimeline";
import { useRouter, useSearchParams } from "next/navigation";
import { getSelectedFlightSummary } from "../fareComparisonUtils";
import { buildFareOptions } from "../FareComparisonModal";
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
import { useAuth } from "@/app/context/AuthContext";
import LoginPopup from "@/app/account/loginPopUp/LoginPopup";
import SignupPopup from "@/app/account/signUpPopUp/SignupPopup";
import {
  getCachedFareOptionsRequest,
  getFareOptionItems,
  isFareExpiredPayload,
} from "../fareOptionsStreaming";
import useLockBodyScroll from "@/app/hooks/useLockBodyScroll";

const pickValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const getSelectedFareIndex = (fare) =>
  pickValue(
    fare?.rawFare?.index,
    fare?.rawFare?.Index,
    fare?.rawFare?.flightIndex,
    fare?.index,
    fare?.Index,
    fare?.flightIndex,
    fare?.id
  );

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

const buildFormattedOnlyPriceResponse = (priceResponse) => {
  const payload = getPricePayload(priceResponse);
  const formatted = payload?.formatted || null;
  const fareBreakdown = Array.isArray(payload?.fare_breakdown) ? payload.fare_breakdown : [];
  const tui = payload?.tui || payload?.TUI || priceResponse?.tui || priceResponse?.TUI;
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

const MobileFareComparisonModal = ({ isOpen, onClose, flightData, prefetchedData = null, isLoadingFareOptions = false }) => {
  useLockBodyScroll(isOpen);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingFareId, setSubmittingFareId] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [pendingFare, setPendingFare] = useState(null);
  const [fareOptionsPayload, setFareOptionsPayload] = useState(prefetchedData?.fareOptionsResponse || null);
  const [isPollingFareOptions, setIsPollingFareOptions] = useState(false);

  const flightNo = useMemo(() => {
    return String(
      flightData?.booking?.flightNo ||
        flightData?.details?.flightNo ||
        flightData?.airlines?.[0]?.code ||
        ""
    ).match(/\d+/)?.[0] || "";
  }, [flightData]);

  useEffect(() => {
    if (!isOpen) return;

    setFareOptionsPayload(prefetchedData?.fareOptionsResponse || null);
    setIsPollingFareOptions(false);

    const priceRequest = flightData?.booking?.priceRequest;
    const searchKey = priceRequest?.search_key;
    if (!searchKey || !flightNo) return;

    let cancelled = false;

    const loadFareOptions = async () => {
      try {
        setIsPollingFareOptions(true);
        const response = await getCachedFareOptionsRequest(
          `${searchKey}:${flightNo}`,
          () => getFlightFareOptions({
            search_key: searchKey,
            flight_no: flightNo,
          })
        );

        if (cancelled) return;

        if (isFareExpiredPayload(response)) {
          setFareOptionsPayload(response);
          return;
        }

        setFareOptionsPayload(response);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to refresh fare options", error);
        }
      } finally {
        if (!cancelled) {
          setIsPollingFareOptions(false);
        }
      }
    };

    if (!prefetchedData?.fareOptionsResponse) {
      loadFareOptions();
    }

    return () => {
      cancelled = true;
    };
  }, [flightData, flightNo, isOpen, prefetchedData?.fareOptionsResponse]);

  const performBookNow = useCallback(async (selectedFare) => {
    const selectedFareIndex = getSelectedFareIndex(selectedFare);
    const priceRequest = buildSelectedFarePriceRequest(
      flightData?.booking?.priceRequest,
      selectedFare?.rawFare
    );
    if (priceRequest?.Trips?.[0] && selectedFareIndex !== undefined) {
      priceRequest.Trips[0].Index = selectedFareIndex;
    }
    const hasPricePayload =
      Boolean(priceRequest?.search_key) &&
      priceRequest?.Trips?.[0]?.Index !== undefined &&
      priceRequest?.Trips?.[0]?.Index !== null;
    const routeContext = {
      fromName: String(searchParams?.get("from") || "").replace(/\s*\([^)]+\)\s*$/, "").trim(),
      fromCode: String(searchParams?.get("origin") || "").trim().toUpperCase(),
      toName: String(searchParams?.get("to") || "").replace(/\s*\([^)]+\)\s*$/, "").trim(),
      toCode: String(searchParams?.get("destination") || "").trim().toUpperCase(),
    };
    if (!hasPricePayload) {
      toast.error("Missing booking payload for the selected flight.");
      return;
    }

    setIsSubmitting(true);
    setSubmittingFareId(selectedFare?.id ?? null);
    let shouldResetSubmitting = true;
    try {
      const priceResponse =
        prefetchedData?.priceResponse || (await getFlightPrice(priceRequest));
      const formattedOnlyPriceResponse = buildFormattedOnlyPriceResponse(priceResponse);
      const checklistTui =
        formattedOnlyPriceResponse?.data?.tui ||
        formattedOnlyPriceResponse?.tui ||
        getPricePayload(priceResponse)?.raw?.TUI ||
        priceResponse?.raw?.TUI;
      const provider =
        priceRequest?.provider ||
        flightData?.booking?.provider ||
        flightData?.provider ||
        formattedOnlyPriceResponse?.data?.provider ||
        formattedOnlyPriceResponse?.provider;

      let checklistResponse = prefetchedData?.checklistResponse || null;
      if (!checklistResponse && checklistTui) {
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
        selectedFare,
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
      shouldResetSubmitting = false;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to continue with this flight right now."
      );
    } finally {
      if (shouldResetSubmitting) {
        setIsSubmitting(false);
        setSubmittingFareId(null);
      }
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

  if (!isOpen) return null;

  const fareSourcePayload = fareOptionsPayload || prefetchedData?.fareOptionsResponse || null;
  const hasFareOptionItems = getFareOptionItems(fareSourcePayload, flightNo).length > 0;
  const isStreamingFareOptions = isLoadingFareOptions || isPollingFareOptions;
  const showFareSkeleton = isStreamingFareOptions && !hasFareOptionItems;
  const fareOptions = showFareSkeleton
    ? []
    : buildFareOptions({
        flightData,
        prefetchedData: {
          ...(prefetchedData || {}),
          fareOptionsResponse: fareSourcePayload,
        },
        adults: searchParams?.get("adults") || 1,
      });
  const streamingSkeletonCount = showFareSkeleton
    ? 3
    : (isStreamingFareOptions && fareOptions.length > 0
        ? Math.max(3 - fareOptions.length, 1)
        : 0);
  const streamingSkeletonCards = Array.from({ length: streamingSkeletonCount });

  const flight = getSelectedFlightSummary(flightData, searchParams?.get("start"));

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
        {showFareSkeleton ? (
          <div className={styles.fareLoadingState}>
            {streamingSkeletonCards.map((_, index) => (
              <div key={index} className={styles.fareSkeletonCard}>
                <div className={styles.skeletonLineShort} />
                <div className={styles.skeletonPriceRow}>
                  <div className={styles.skeletonPrice} />
                  <div className={styles.skeletonIcon} />
                </div>
                <div className={styles.skeletonLineTiny} />
                <div className={styles.skeletonDivider} />
                <div className={styles.skeletonBlock}>
                  <div className={styles.skeletonLineShort} />
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLine} />
                </div>
                <div className={styles.skeletonDivider} />
                <div className={styles.skeletonBlock}>
                  <div className={styles.skeletonLineShort} />
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLine} />
                </div>
                <div className={styles.skeletonActions}>
                  <div className={styles.skeletonButton} />
                  <div className={styles.skeletonButton} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.fareCards}>
            {fareOptions.map((fare) => {
              const isCurrentFareSubmitting =
                isSubmitting && submittingFareId === fare.id;

              return (
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
                  <h3 className={styles.fareName}>
                    <span className={styles.radioOutline}></span>
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
                <button
                  onClick={() => handleBookNow(fare)}
                  className={styles.bookNowBtn}
                  disabled={isSubmitting}
                >
                  {isCurrentFareSubmitting ? "LOADING..." : "BOOK NOW"}
                </button>
              </div>
              </div>
              );
            })}
            {isStreamingFareOptions && streamingSkeletonCount > 0 &&
              Array.from({ length: streamingSkeletonCount }).map((_, index) => (
                <div key={`streaming-skeleton-${index}`} className={styles.fareSkeletonCard}>
                  <div className={styles.skeletonLineShort} />
                  <div className={styles.skeletonPriceRow}>
                    <div className={styles.skeletonPrice} />
                    <div className={styles.skeletonIcon} />
                  </div>
                  <div className={styles.skeletonLineTiny} />
                  <div className={styles.skeletonDivider} />
                  <div className={styles.skeletonBlock}>
                    <div className={styles.skeletonLineShort} />
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLine} />
                  </div>
                  <div className={styles.skeletonDivider} />
                  <div className={styles.skeletonBlock}>
                    <div className={styles.skeletonLineShort} />
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLine} />
                  </div>
                  <div className={styles.skeletonActions}>
                    <div className={styles.skeletonButton} />
                    <div className={styles.skeletonButton} />
                  </div>
                </div>
              ))}
          </div>
        )}
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

export default MobileFareComparisonModal;

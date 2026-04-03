"use client";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./MobileFareComparisonModal.module.css";
import FlightTimeline from "@/app/flight-booking-details/mobileViewComponents/components/flightTimeline/FlightTimeline";
import { useRouter, useSearchParams } from "next/navigation";
import { getSelectedFlightSummary } from "../fareComparisonUtils";
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

const MobileFareComparisonModal = ({ isOpen, onClose, flightData }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pendingFare, setPendingFare] = useState(null);

  const performBookNow = useCallback(async (selectedFare) => {
    const priceRequest = flightData?.booking?.priceRequest;
    const routeContext = {
      fromName: String(searchParams?.get("from") || "").replace(/\s*\([^)]+\)\s*$/, "").trim(),
      fromCode: String(searchParams?.get("origin") || "").trim().toUpperCase(),
      toName: String(searchParams?.get("to") || "").replace(/\s*\([^)]+\)\s*$/, "").trim(),
      toCode: String(searchParams?.get("destination") || "").trim().toUpperCase(),
    };
    if (!priceRequest?.search_key || !priceRequest?.Trips?.[0]?.Index) {
      toast.error("Missing booking payload for the selected flight.");
      return;
    }

    setIsSubmitting(true);
    try {
      const priceResponse = await getFlightPrice(priceRequest);
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
  }, [flightData, router, searchParams]);

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
      setShowLogin(true);
      return;
    }
    performBookNow(selectedFare);
  };

  if (!isOpen) return null;

  const fareOptions = [
    {
      id: "saver",
      name: "SAVER FARE",
      price: "₹ 760,000",
      pricePerAdult: "₹ 6,083",
      isPremium: false,
      baggage: {
        cabin: "7 Kg Cabin Bag Allowance",
        checkin: "15 Kg Check-in Bag Allowance",
      },
      changes: {
        charges: "Change Charges Upto INR 2999",
        cancellation: "Cancellation Charges Upto INR 4999",
      },
      addons: {
        seats: "Chargeable Seats",
        meals: "Chargeable Meals",
      },
    },
    {
      id: "flexi",
      name: "FLEXI PLUS FARE",
      price: "₹ 760,000",
      pricePerAdult: "₹ 6,083",
      isPremium: true,
      baggage: {
        cabin: "7 Kg Cabin Bag Allowance",
        checkin: "15 Kg Check-in Bag Allowance",
      },
      changes: {
        charges: "Change Charges Upto INR 3499",
        cancellation: "Cancellation Charges Upto INR 3499",
      },
      addons: {
        seats: "Complimentary XL Bomb Legroom Seat",
        meals: "Complimentary Standard Seat",
      },
    },
    {
      id: "premium",
      name: "PREMIUM FARE",
      price: "₹ 760,000",
      pricePerAdult: "₹ 6,083",
      isPremium: false,
      baggage: {
        cabin: "7 Kg Cabin Bag Allowance",
        checkin: "15 Kg Check-in Bag Allowance",
      },
      changes: {
        charges: "Change Charges Upto INR 2999",
        cancellation: "Cancellation Charges Upto INR 4999",
      },
      addons: {
        seats: "Complimentary XL Bomb Legroom Seat",
        meals: "Chargeable Meals",
      },
    },
  ];

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
        <div className={styles.fareCards}>
          {fareOptions.map((fare) => (
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
                <button className={styles.lockPriceBtn}>LOCK PRICE</button>
                <button onClick={() => handleBookNow(fare)} className={styles.bookNowBtn}>
                  {isSubmitting ? "LOADING..." : "BOOK NOW"}
                </button>
              </div>
            </div>
          ))}
        </div>
        {showLogin && (
          <LoginPopup
            onClose={() => {
              setShowLogin(false);
              setPendingFare(null);
            }}
            onNavigate={() => {}}
          />
        )}
      </div>
    </div>
  );
};

export default MobileFareComparisonModal;

"use client";
import React, { useState, useEffect, useCallback } from "react";
import styles from "./MealsDetails.module.css";
import Expandable from "./Components/Expandable";
import MealGuidelineExpandable from "./Components/mealGuidelineExpandable/MealGuidelineExpandable";
import MobileFlightMeals from "./Components/MobileFlightMeals";
import { useFlightBooking } from "../../FlightBookingContext";
import { meals, beverages } from "./mealsData";
import TripDetailsHeader from "@/shared/components/tripDetailsHeader/TripDetailsHeader";
import PriceSummary from "@/features/profile/components/PriceSummary";
import { getBookingDetailsView } from "@/features/flights/utils/flightBookingSession";
import { buildMobilePriceSummary } from "../../utils/mobilePriceSummary";
import { toast } from "react-toastify";

const areEqual = (left, right) => JSON.stringify(left) === JSON.stringify(right);

const MAIN_MEAL_IMAGES = meals.map((item) => item.image);
const BEVERAGE_IMAGES = beverages.map((item) => item.image);

const buildMealRouteCards = (bookingSession, bookingView) => {
  const formatted = bookingSession?.ssrResponse?.data?.formatted || {};
  const entries = Object.entries(formatted);

  const normalizeMealItem = (item, index) => {
    const title = String(item?.name || "").trim() || "Meal";
    const isBeverage = /beverage|tea|coffee|drink|juice/i.test(title);
    const imagePool = isBeverage ? BEVERAGE_IMAGES : MAIN_MEAL_IMAGES;

    return {
      id: item?.id ?? index + 1,
      ssid: item?.ssid ?? item?.id ?? index + 1,
      fuid: item?.fuid ?? item?.FUID ?? item?.flight_uid ?? item?.flightId ?? "",
      selectionKey: [
        item?.id ?? index + 1,
        item?.ssid ?? item?.id ?? index + 1,
        item?.fuid ?? item?.FUID ?? item?.flight_uid ?? item?.flightId ?? "",
      ].join("::"),
      image: imagePool[index % imagePool.length] || MAIN_MEAL_IMAGES[0],
      title,
      price: Number(item?.price || 0),
      tag: item?.type ? String(item.type).replace(/(^\w|\-\w)/g, (match) => match.replace("-", " ").toUpperCase()) : "",
      isBeverage,
    };
  };

  const routeCards = entries.map(([routeKey, value], index) => {
    const flight =
      index === 0 ? bookingView?.departureFlight : bookingView?.returnFlight;
    const routeMeals = Array.isArray(value?.meals) ? value.meals.map(normalizeMealItem) : [];

    return {
      key: routeKey,
      routeLabel: routeKey.replace(/-/g, "–"),
      date: flight?.departure?.date || "N/A",
      time: `${flight?.departure?.time || "N/A"} - ${flight?.arrival?.time || "N/A"}`,
      meals: routeMeals.filter((item) => !item.isBeverage),
      beverages: routeMeals.filter((item) => item.isBeverage),
    };
  });

  if (routeCards.length > 0) return routeCards;

  const fallback = [];
  if (bookingView?.departureFlight) {
    fallback.push({
      key: "departure",
      routeLabel: `${bookingView.header?.fromCode || "N/A"}–${bookingView.header?.toCode || "N/A"}`,
      date: bookingView.departureFlight.departure.date,
      time: `${bookingView.departureFlight.departure.time} - ${bookingView.departureFlight.arrival.time}`,
      meals: [],
      beverages: [],
    });
  }
  if (bookingView?.returnFlight) {
    fallback.push({
      key: "return",
      routeLabel: `${bookingView.header?.toCode || "N/A"}–${bookingView.header?.fromCode || "N/A"}`,
      date: bookingView.returnFlight.departure.date,
      time: `${bookingView.returnFlight.departure.time} - ${bookingView.returnFlight.arrival.time}`,
      meals: [],
      beverages: [],
    });
  }
  return fallback;
};

const getMealInfo = (routeCards, routeKey, selectionKey) => {
  const route = routeCards.find((item) => item.key === routeKey);
  return [...(route?.meals || []), ...(route?.beverages || [])].find(
    (item) => item.selectionKey === selectionKey
  );
};

const MealsDetails = () => {
  const { setMeals, setCurrentStep, currentStep, bookingSession, prices, travelerDetails } = useFlightBooking();
  const [openTab, setOpenTab] = useState("flight");
  const bookingView = React.useMemo(
    () => getBookingDetailsView(bookingSession),
    [bookingSession]
  );
  const routeCards = React.useMemo(
    () => buildMealRouteCards(bookingSession, bookingView),
    [bookingSession, bookingView]
  );
  const priceSummary = React.useMemo(
    () => buildMobilePriceSummary({ prices, bookingSession, travelerDetails }),
    [bookingSession, prices, travelerDetails]
  );

  const [showPriceSummaryPopup, setShowPriceSummaryPopup] = useState(false);
  // State: { "DEL-BOM::meal-key": 1 }
  const [mealQuantities, setMealQuantities] = useState({});

  const toggleTab = (tabName) => {
    setOpenTab((prev) => (prev === tabName ? null : tabName));
  };

  // Sync with Context
  useEffect(() => {
    const selectedMeals = [];
    Object.entries(mealQuantities).forEach(([key, qty]) => {
      if (qty > 0) {
        const [segment, ...selectionParts] = key.split("::");
        const selectionKey = selectionParts.join("::");
        const info = getMealInfo(routeCards, segment, selectionKey);

        if (info) {
          for (let i = 0; i < qty; i++) {
            selectedMeals.push({
              ...info,
              id: `${key}-${i}`,
              segment, // useful for tracking
              label: `${info.title} (${segment})`,
            });
          }
        }
      }
    });
    setMeals((current) => (areEqual(current, selectedMeals) ? current : selectedMeals));
  }, [mealQuantities, routeCards, setMeals]);

  const handleUpdateQuantity = useCallback((segment, selectionKey, newQty) => {
    const key = `${segment}::${selectionKey}`;
    setMealQuantities((prev) => {
      const currentQty = prev[key] || 0;
      const isIncreasing = newQty > currentQty;
      const selectedMealKey = Object.entries(prev).find(([, qty]) => qty > 0)?.[0];

      if (isIncreasing && currentQty >= 1) {
        toast.info("Only 1 quantity is allowed for a meal.", {
          toastId: "single-meal-quantity-limit",
        });
        return prev;
      }

      if (isIncreasing && selectedMealKey && selectedMealKey !== key) {
        toast.info("Only 1 meal can be selected for this booking.", {
          toastId: "single-meal-selection-limit",
        });
        return prev;
      }

      const nextQty = Math.min(Math.max(0, newQty), 1);
      if (nextQty === 0) {
        const next = { ...prev };
        delete next[key];
        return next;
      }

      return {
        [key]: nextQty,
      };
    });
  }, []);

  // Filter quantities for a specific segment to pass to Expandable
  // Expandable expects { mealId: qty }
  const getSegmentQuantities = (segment) => {
    const segmentQty = {};
    Object.entries(mealQuantities).forEach(([key, val]) => {
      if (key.startsWith(`${segment}::`)) {
        const mealKey = key.split("::").slice(1).join("::");
        segmentQty[mealKey] = val;
      }
    });
    return segmentQty;
  };

  return (
    <>
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.passengerDetailsHeader}>
          <div className={styles.fromToContainer}>
            <h2 className={styles.from}>Select Your Meals</h2>
          </div>

          <div className={styles.aboutFlightContainerRight}>
            <span className={styles.subInfoText}>
              Pre-book your meals and save time onboard. Fresh meals prepared
              with quality ingredients.
            </span>
          </div>
        </div>

        {/* FLIGHT DETAILS */}
        {routeCards.map((routeCard, index) => {
          const tabName = index === 0 ? "flight" : `flight-${index}`;
          return (
            <div
              key={routeCard.key}
              className={`${styles.flightExpandableContainer} ${
                openTab === tabName ? styles.flightActiveBorder : ""
              }`}
            >
              <div
                className={styles.flightExpandableCard}
                onClick={() => toggleTab(tabName)}
              >
                <div className={styles.flightExpandableHeaderContainer}>
                  <h3 className={styles.flightExpandableHeader}>{routeCard.routeLabel}</h3>
                  <img
                    src="/icons/DownArrows.svg"
                    alt=""
                    className={`${styles.arrow} ${
                      openTab === tabName ? styles.arrowRotate : ""
                    }`}
                  />
                </div>
                <div className={styles.aboutFlightContainerRight}>
                  <span>{routeCard.date}</span>
                  <div className={styles.dot}></div>
                  <span>{routeCard.time}</span>
                </div>
              </div>

              <div
                className={`${styles.expandWrap} ${
                  openTab === tabName ? styles.expandOpen : ""
                }`}
              >
                <Expandable
                  meals={routeCard.meals}
                  beverages={routeCard.beverages}
                  quantities={getSegmentQuantities(routeCard.key)}
                  onUpdateQuantity={(id, qty) =>
                    handleUpdateQuantity(routeCard.key, id, qty)
                  }
                />
              </div>
            </div>
          );
        })}

        <div
          className={`${styles.flightExpandableContainer} ${
            openTab === "mealGuidelines" ? styles.flightActiveBorder : ""
          }`}
        >
          <div
            className={styles.flightExpandableCard}
            onClick={() => toggleTab("mealGuidelines")}
          >
            <div className={styles.flightExpandableHeaderContainer}>
              <h3 className={styles.flightExpandableHeader}>MEAL GUIDELINES</h3>
              <img
                src="/icons/DownArrows.svg"
                alt=""
                className={`${styles.arrow} ${
                  openTab === "mealGuidelines" ? styles.arrowRotate : ""
                }`}
              />
            </div>
          </div>

          <div
            className={`${styles.expandWrap} ${
              openTab === "mealGuidelines" ? styles.expandOpen : ""
            }`}
          >
            <MealGuidelineExpandable />
          </div>
        </div>

        <div
          onClick={() => setCurrentStep(5)}
          className={styles.continueButtonContainer}
        >
          <button className={styles.skipButton}>SKIP MEAL</button>
          <button className={styles.continueButton}>CONTINUE</button>
        </div>
      </div>
      <div className={styles.mobileView}>
        <TripDetailsHeader
          onBack={() => setCurrentStep((prev) => prev - 1)}
          title="Choose Your Meals"
        />
        <div className={styles.mobileViewContainer}>
          {routeCards.map((routeCard) => (
            <MobileFlightMeals
              key={routeCard.key}
              flightSegment={routeCard.routeLabel}
              date={routeCard.date}
              time={routeCard.time}
              meals={routeCard.meals}
              beverages={routeCard.beverages}
              segmentQuantities={getSegmentQuantities(routeCard.key)}
              onUpdateQuantity={(id, qty) =>
                handleUpdateQuantity(routeCard.key, id, qty)
              }
            />
          ))}

          <div className={styles.mealGuideLineMobileView}>
            <h3 className={styles.mealHeading}>MEAL GUIDELINES</h3>
            <div className={styles.wrapper}>
              <ol className={styles.mealNotes}>
                <li>
                  All vegetarian meals are prepared separately and do not
                  contain meat, fish, or eggs. We use high-quality ingredients
                  and follow strict preparation guidelines.
                </li>

                <li>
                  Our non-vegetarian meals are prepared with premium quality
                  chicken and meat. All meats are sourced from certified
                  suppliers.
                </li>

                <li>
                  Pre-booked meals are served first, followed by general meal
                  service. Hot meals are served approximately 30 minutes after
                  takeoff.
                </li>

                <li>
                  You can modify your meal selection up to 24 hours before
                  departure. Cancellations receive full refund if done 24 hours
                  prior.
                </li>
              </ol>
            </div>
          </div>
        </div>

        {showPriceSummaryPopup && (
          <PriceSummary
            onClose={() => setShowPriceSummaryPopup(false)}
            lineItems={priceSummary.lineItems}
            totalAmount={priceSummary.totalAmount}
          />
        )}
        <div className={styles.footer}>
          {/* LEFT */}
          <div className={styles.footerContainer}>
            <div className={styles.amountSection}>
              <div className={styles.label}>
                Total Amount
                <span
                  onClick={() => setShowPriceSummaryPopup(true)}
                  className={styles.infoIcon}
                >
                  !
                </span>
              </div>
              <div className={styles.amount}>{priceSummary.totalAmount}</div>
            </div>

            {/* RIGHT */}
            <button
              onClick={() => setCurrentStep(5)}
              className={styles.continueBtn}
            >
              CONTINUE BOOKING
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MealsDetails;

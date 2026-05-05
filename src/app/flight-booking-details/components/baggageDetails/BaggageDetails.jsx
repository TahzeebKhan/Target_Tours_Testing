"use client";
import React, { useState, useCallback, useMemo } from "react";
import styles from "./BaggageDetails.module.css";
import { useRouter } from "next/navigation";

import CabinBaggageInfo from "./Components/cabinBaggageInfo/CabinBaggageInfo";
import ExtraBaggageItem from "./Components/extraBaggageItem/ExtraBaggageItem";

import { useFlightBooking } from "../../FlightBookingContext";
import TripDetailsHeader from "@/shared/components/tripDetailsHeader/TripDetailsHeader";
import PriceSummary from "@/features/profile/components/PriceSummary";
import { getBookingDetailsView, getBookingPassengerCounts } from "@/features/flights/utils/flightBookingSession";
import { buildMobilePriceSummary } from "../../utils/mobilePriceSummary";
import { toast } from "react-toastify";

const CABIN_IMAGES = ["/bags/redBag.png", "/bags/pinkBag.svg"];
const CHECKED_IMAGES = ["/bags/boxBag.png", "/bags/trolly.svg"];

const areEqual = (left, right) => JSON.stringify(left) === JSON.stringify(right);

const pickFirst = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
};

const parseWeightValue = (value) => {
  const match = String(value || "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
};

const formatWeight = (value, fallback) => {
  const text = String(value || "").trim();
  const match = text.match(/(\d+(?:\.\d+)?)\s*(kg|kgs|kilogram|kilograms)\b/i);
  if (!match) return fallback;
  return `${match[1]} kg`;
};

const findBaggageText = (source, type, depth = 0, seen = new Set()) => {
  if (!source || depth > 6 || seen.has(source)) return "";
  if (typeof source === "object") seen.add(source);

  if (typeof source === "string") {
    const text = source.trim();
    const normalized = text.toLowerCase();
    const hasWeight = /\d+(?:\.\d+)?\s*(kg|kgs|kilogram|kilograms)\b/i.test(text);
    if (!hasWeight) return "";
    if (type === "cabin" && /(cabin|hand|carry)/i.test(normalized)) return text;
    if (type === "checked" && /(check|checked|check-in|checkin)/i.test(normalized)) return text;
    return "";
  }

  if (!Array.isArray(source) && typeof source !== "object") return "";

  if (Array.isArray(source)) {
    for (const item of source) {
      const found = findBaggageText(item, type, depth + 1, seen);
      if (found) return found;
    }
    return "";
  }

  for (const [key, value] of Object.entries(source)) {
    const normalizedKey = key.toLowerCase();
    if (
      type === "cabin" &&
      /(cabin|hand|carry).*bag|bag.*(cabin|hand|carry)|cabin_baggage|cabinbaggage/.test(normalizedKey)
    ) {
      const text = typeof value === "string" ? value : findBaggageText(value, type, depth + 1, seen);
      if (text) return text;
    }
    if (
      type === "checked" &&
      /(check|checked|check-in|checkin).*bag|bag.*(check|checked|check-in|checkin)|checkin_baggage|checked_baggage/.test(normalizedKey)
    ) {
      const text = typeof value === "string" ? value : findBaggageText(value, type, depth + 1, seen);
      if (text) return text;
    }
  }

  for (const value of Object.values(source)) {
    const found = findBaggageText(value, type, depth + 1, seen);
    if (found) return found;
  }
  return "";
};

const buildIncludedBaggage = (routeSsr = {}, bookingSession = {}) => {
  const selectedFareBaggage = bookingSession?.selectedFare?.baggage || {};
  const sources = [
    routeSsr,
    bookingSession?.ssrResponse?.data?.raw,
    bookingSession?.ssrResponse?.raw,
    bookingSession?.priceResponse?.data?.raw,
    bookingSession?.priceResponse?.raw,
    selectedFareBaggage,
  ];
  const cabinText =
    pickFirst(
      routeSsr?.cabin_baggage,
      routeSsr?.cabinBaggage,
      routeSsr?.cabin,
      selectedFareBaggage?.cabin,
      ...sources.map((source) => findBaggageText(source, "cabin"))
    ) || "";
  const checkedText =
    pickFirst(
      routeSsr?.checked_baggage,
      routeSsr?.checkin_baggage,
      routeSsr?.checkedBaggage,
      routeSsr?.checkinBaggage,
      routeSsr?.checkin,
      selectedFareBaggage?.checkin,
      ...sources.map((source) => findBaggageText(source, "checked"))
    ) || "";
  const cabinWeight = formatWeight(cabinText, "7 kg");
  const checkedWeight = formatWeight(checkedText, "15 kg");

  return {
    cabin: {
      ...cabinBagData,
      title: "1× Cabin Bag",
      points: [
        { label: "Stored in the overhead compartment" },
        { label: "Max weight", value: cabinWeight },
        { label: "Max size", value: "25 × 35 × 55 cm" },
      ],
    },
    checked: {
      ...checkedBagData,
      title: "1× Checked Bag",
      points: [
        { label: "Checked in at the airport counter before security" },
        { label: "Weight allowance", value: checkedWeight },
        { label: "Max size", value: "28 × 52 × 78 cm" },
      ],
    },
  };
};

const buildExtraBaggageData = (routeBaggage = []) => {
  const normalized = routeBaggage.map((item, index) => {
    const weightLabel = String(item?.weight || item?.name || "0 Kg").trim();
    const weightValue = parseWeightValue(weightLabel);
    const bucket = weightValue < 10 ? "cabin" : "checked";
    const imagePool = bucket === "cabin" ? CABIN_IMAGES : CHECKED_IMAGES;

    return {
      id: item?.id || `${bucket}-${index}`,
      ssid: item?.ssid ?? item?.id ?? `${bucket}-${index}`,
      fuid: item?.fuid ?? item?.FUID ?? item?.flight_uid ?? item?.flightId ?? "",
      code: item?.code || `${bucket}-${index}`,
      selectionKey: [
        item?.code || `${bucket}-${index}`,
        item?.ssid ?? item?.id ?? `${bucket}-${index}`,
        item?.fuid ?? item?.FUID ?? item?.flight_uid ?? item?.flightId ?? "",
      ].join("::"),
      image: imagePool[index % imagePool.length],
      weight: weightLabel,
      price: Number(item?.price || 0),
      name: item?.name || weightLabel,
      bucket,
    };
  });

  const cabin = normalized.filter((item) => item.bucket === "cabin");
  const checked = normalized.filter((item) => item.bucket === "checked");
  const maxRows = Math.max(cabin.length, checked.length);
  const rows = [];

  for (let index = 0; index < maxRows; index += 1) {
    rows.push([cabin[index], checked[index]].filter(Boolean));
  }

  return rows;
};

const buildRouteCards = (bookingSession, bookingView) => {
  const formatted = bookingSession?.ssrResponse?.data?.formatted || {};
  const entries = Object.entries(formatted);
  const routes = entries.map(([routeKey, value], index) => {
    const journey = routeKey.split("-");
    const departureFlight =
      index === 0 ? bookingView?.departureFlight : bookingView?.returnFlight;
    const departureCode = journey[0] || "";
    const arrivalCode = journey[1] || "";

    return {
      key: routeKey,
      routeLabel: routeKey.replace(/-/g, "–"),
      date: departureFlight?.departure?.date || "N/A",
      time: `${departureFlight?.departure?.time || "N/A"} - ${departureFlight?.arrival?.time || "N/A"}`,
      includedBaggage: buildIncludedBaggage(value, bookingSession),
      baggageRows: buildExtraBaggageData(value?.baggage || []),
    };
  });

  if (routes.length > 0) return routes;

  const fallbackRoutes = [];
  if (bookingView?.departureFlight) {
    fallbackRoutes.push({
      key: "departure",
      routeLabel: `${bookingView.header?.fromCode || "N/A"}–${bookingView.header?.toCode || "N/A"}`,
      date: bookingView.departureFlight.departure.date,
      time: `${bookingView.departureFlight.departure.time} - ${bookingView.departureFlight.arrival.time}`,
      includedBaggage: buildIncludedBaggage({}, bookingSession),
      baggageRows: [],
    });
  }
  if (bookingView?.returnFlight) {
    fallbackRoutes.push({
      key: "return",
      routeLabel: `${bookingView.header?.toCode || "N/A"}–${bookingView.header?.fromCode || "N/A"}`,
      date: bookingView.returnFlight.departure.date,
      time: `${bookingView.returnFlight.departure.time} - ${bookingView.returnFlight.arrival.time}`,
      includedBaggage: buildIncludedBaggage({}, bookingSession),
      baggageRows: [],
    });
  }
  return fallbackRoutes;
};

const cabinBagData = {
  icon: "/images/cabinBag.png",
  title: "1× Cabin Bag",
  status: "INCLUDED",
  points: [
    { label: "Stored in the overhead compartment" },
    { label: "Max weight", value: "7 kg" },
    { label: "Max size", value: "25 × 35 × 55 cm" },
  ],
};

const checkedBagData = {
  icon: "/images/checkeBag.png",
  title: "1× Checked Bag",
  status: "INCLUDED",
  points: [
    { label: "Checked in at the airport counter before security" },
    { label: "Weight allowance", value: "15 kg" },
    { label: "Max size", value: "28 × 52 × 78 cm" },
  ],
};

/* ================== FLIGHT CARD ================== */

const FlightExpandableCard = ({
  flightCard,
  quantities,
  onIncrease,
  onDecrease,
}) => {
  return (
    <div className={styles.flightExpandableCard}>
      <div className={styles.flightExpandableHeader}>
        <h3>{flightCard.routeLabel}</h3>
        <div className={styles.aboutFlightContainerRight}>
          <span>{flightCard.date}</span>
          <div className={styles.dot}></div>
          <span>{flightCard.time}</span>
        </div>
      </div>

      <div className={styles.flightExpandableBottom}>
        {/* Cabin baggage */}
        <div className={styles.flightExpandableRows}>
          <CabinBaggageInfo data={flightCard.includedBaggage?.cabin || cabinBagData} />
          <CabinBaggageInfo data={flightCard.includedBaggage?.checked || checkedBagData} />
        </div>

        {/* Extra baggage */}
        {flightCard.baggageRows.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.flightExpandableRows}>
            {row.map((item) => {
              const key = `${flightCard.key}::${item.selectionKey}`;
              return (
                <ExtraBaggageItem
                  key={key}
                  image={item.image}
                  weight={item.weight}
                  price={item.price}
                  quantity={quantities[key] || 0}
                  onIncrease={() => onIncrease(key)}
                  onDecrease={() => onDecrease(key)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const MobileFlightCard = ({
  flightCard,
  quantities,
  onIncrease,
  onDecrease,
}) => {
  return (
    <div className={styles.baggageMobileCard}>
      <div className={styles.flightExpandableHeader}>
        <h3 className={styles.mobileFlightDestinationName}>{flightCard.routeLabel}</h3>
        <div className={styles.aboutFlightContainerRight}>
          <span>{flightCard.date}</span>
          <div className={styles.dot}></div>
          <span>{flightCard.time}</span>
        </div>
      </div>
      <div className={styles.br}></div>
      <div className={styles.baggageMobileItems}>
        <div className={styles.baggageMobileItem}>
          <CabinBaggageInfo data={flightCard.includedBaggage?.cabin || cabinBagData} />
          <CabinBaggageInfo data={flightCard.includedBaggage?.checked || checkedBagData} />
        </div>
        {flightCard.baggageRows.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.flightExpandableRows}>
            {row.map((item) => {
              const key = `${flightCard.key}::${item.selectionKey}`;

              return (
                <ExtraBaggageItem
                  key={key}
                  image={item.image}
                  weight={item.weight}
                  price={item.price}
                  quantity={quantities[key] || 0}
                  onIncrease={() => onIncrease(key)}
                  onDecrease={() => onDecrease(key)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ================== MAIN COMPONENT ================== */

const BaggageDetails = () => {
  const router = useRouter();
  const { setBaggage, setCurrentStep, currentStep, bookingSession, prices, travelerDetails } = useFlightBooking();
  const bookingView = useMemo(() => getBookingDetailsView(bookingSession), [bookingSession]);
  const routeCards = useMemo(
    () => buildRouteCards(bookingSession, bookingView),
    [bookingSession, bookingView]
  );
  const priceSummary = useMemo(
    () => buildMobilePriceSummary({ prices, bookingSession, travelerDetails }),
    [bookingSession, prices, travelerDetails]
  );
  const baggageSelectionLimit = useMemo(() => {
    const counts = getBookingPassengerCounts(bookingSession);
    return Math.max((counts.adult || 0) + (counts.child || 0), 1);
  }, [bookingSession]);

  const [showPriceSummaryPopup, setShowPriceSummaryPopup] = useState(false);
  // 🔥 Quantity state (per flight + per baggage)
  const [quantities, setQuantities] = useState({});

  // Sync with Context whenever quantities change
  React.useEffect(() => {
    const newBaggageList = [];
    Object.entries(quantities).forEach(([key, qty]) => {
      if (qty > 0) {
        const selectionKey = key.split("::").slice(1).join("::");
        const matchedItem = routeCards
          .flatMap((card) => card.baggageRows.flat())
          .find((item) => item.selectionKey === selectionKey);

        const info = matchedItem || null;
        if (info) {
          for (let i = 0; i < qty; i++) {
            newBaggageList.push({
              ...info,
              id: `${key}-${i}`, // unique id
              label: `Extra Baggage ${info.weight}`,
            });
          }
        }
      }
    });
    setBaggage((current) => (areEqual(current, newBaggageList) ? current : newBaggageList));
  }, [quantities, routeCards, setBaggage]);

  const increaseQty = useCallback((key) => {
    setQuantities((prev) => {
      const totalSelected = Object.values(prev).reduce(
        (sum, qty) => sum + Number(qty || 0),
        0
      );

      if (totalSelected >= baggageSelectionLimit) {
        toast.info(`Extra baggage can be added for up to ${baggageSelectionLimit} passenger(s).`, {
          toastId: "baggage-passenger-limit",
        });
        return prev;
      }

      return {
        ...prev,
        [key]: (prev[key] || 0) + 1,
      };
    });
  }, [baggageSelectionLimit]);

  const decreaseQty = useCallback((key) => {
    setQuantities((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) - 1),
    }));
  }, []);

  return (
    <>
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.passengerDetailsHeader}>
          <div className={styles.fromToContainer}>
            <h2 className={styles.from}>Choose Your Baggage</h2>
          </div>

          <div className={styles.aboutFlightContainerRight}>
            <span>
              Select additional baggage for your journey. Save more when you add
              baggage now.
            </span>
          </div>
        </div>

        <div className={styles.flightExpandableContainer}>
          {routeCards.map((flightCard) => (
            <FlightExpandableCard
              key={flightCard.key}
              flightCard={flightCard}
              quantities={quantities}
              onIncrease={increaseQty}
              onDecrease={decreaseQty}
            />
          ))}

          {/* BAGGAGE GUIDELINES */}
          <div className={styles.flightExpandableCard}>
            <div className={styles.flightExpandableHeader}>
              <h3>BAGGAGE GUIDELINES</h3>
            </div>

            <div className={styles.baggageBottomCard}>
              <div className={styles.baggageGuide}>
                <div className={styles.CabinBaggageGuide}>
                  <div className={styles.CabinBaggageGuideHeader}>
                    <img src="/icons/cabinBagGray.svg" alt="" />
                    <h3>Cabin Baggage</h3>
                  </div>
                  <ul className={styles.guideList}>
                    <li>Maximum dimensions: 55cm × 40cm × 20cm</li>
                    <li>Maximum weight: 7 kg</li>
                    <li>Must fit in overhead bin or under seat</li>
                    <li>One personal item also allowed</li>
                  </ul>
                </div>

                <div className={styles.CheckInBaggageGuide}>
                  <div className={styles.CabinBaggageGuideHeader}>
                    <img src="/icons/cabinBagGray.svg" alt="" />
                    <h3>Check-in Baggage</h3>
                  </div>
                  <ul className={styles.guideList}>
                    <li>Maximum dimensions: 158 cm (L+W+H)</li>
                    <li>Weight depends on fare</li>
                    <li>Additional baggage chargeable</li>
                    <li>No fragile items</li>
                  </ul>
                </div>
              </div>

              <div className={styles.proTip}>
                <span className={styles.proTipText}>Pro Tip:</span>
                <p className={styles.paraTipText}>
                  Book baggage now and save up to 40% compared to airport rates.
                  You can always modify your baggage up to 4 hours before
                  departure.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTINUE BUTTON */}
        <div className={styles.continueButtonContainer}>
          <button
            type="button"
            onClick={() => setCurrentStep(4)}
            className={styles.continueButton}
          >
            CONTINUE
          </button>
        </div>
      </div>

      <div className={styles.mobileView}>
        <TripDetailsHeader
          onBack={() => setCurrentStep(currentStep - 1)}
          title="Choose Your Baggage"
        />
        <div className={styles.mobileViewContainer}>
          {routeCards.map((flightCard) => (
            <MobileFlightCard
              key={flightCard.key}
              flightCard={flightCard}
              quantities={quantities}
              onIncrease={increaseQty}
              onDecrease={decreaseQty}
            />
          ))}

          {/* BAGGAGE GUIDELINES */}
          <div className={styles.flightExpandableCard}>
            <div className={styles.flightExpandableHeader}>
              <h3>BAGGAGE GUIDELINES</h3>
            </div>

            <div className={styles.baggageBottomCard}>
              <div className={styles.baggageGuide}>
                <div className={styles.CabinBaggageGuide}>
                  <div className={styles.CabinBaggageGuideHeader}>
                    <img src="/icons/cabinBagGray.svg" alt="" />
                    <h3>Cabin Baggage</h3>
                  </div>
                  <ul className={styles.guideList}>
                    <li>Maximum dimensions: 55cm × 40cm × 20cm</li>
                    <li>Maximum weight: 7 kg</li>
                    <li>Must fit in overhead bin or under seat</li>
                    <li>One personal item also allowed</li>
                  </ul>
                </div>

                <div className={styles.CheckInBaggageGuide}>
                  <div className={styles.CabinBaggageGuideHeader}>
                    <img src="/icons/cabinBagGray.svg" alt="" />
                    <h3>Check-in Baggage</h3>
                  </div>
                  <ul className={styles.guideList}>
                    <li>Maximum dimensions: 158 cm (L+W+H)</li>
                    <li>Weight depends on fare</li>
                    <li>Additional baggage chargeable</li>
                    <li>No fragile items</li>
                  </ul>
                </div>
              </div>

              <div className={styles.proTip}>
                <span className={styles.proTipText}>Pro Tip:</span>
                <p className={styles.paraTipText}>
                  Book baggage now and save up to 40% compared to airport rates.
                  You can always modify your baggage up to 4 hours before
                  departure.
                </p>
              </div>
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
              onClick={(e) => {
                e.stopPropagation();
                setCurrentStep(4);
              }}
              type="button"
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

export default BaggageDetails;

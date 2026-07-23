import React, { useEffect, useMemo, useState } from "react";
import styles from "./CancellationPenalty.module.css";
import { getFlightFareRules } from "@/features/flights/services/flightBooking";
import {
  buildV2SsrPayload,
  getBookingDetailsView,
  writeFlightBookingSession,
} from "@/features/flights/utils/flightBookingSession";
import { useFlightBooking } from "@/app/flight-booking-details/FlightBookingContext";
import CancellationPolicyModal from "./CancellationPolicyModal";

const toArray = (value) => (Array.isArray(value) ? value : []);

const readNumber = (...values) => {
  for (const value of values) {
    const amount = Number(String(value || "").replace(/[^\d.]/g, ""));
    if (Number.isFinite(amount) && amount > 0) return amount;
  }
  return null;
};

const unwrapFareRulesPayload = (fareRulesData) =>
  fareRulesData?.data && typeof fareRulesData.data === "object"
    ? fareRulesData.data
    : {};

const getPlatformCharges = (fareRulesData) => {
  const payload = unwrapFareRulesPayload(fareRulesData);
  return readNumber(
    payload?.platform_charges,
    payload?.platformCharges,
    fareRulesData?.data?.platform_charges,
    fareRulesData?.platform_charges
  );
};

const cleanRuleText = (value) =>
  String(value || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const cleanRuleLines = (value) =>
  String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

const normalizeTimeFrame = (value = "") => {
  const text = cleanRuleText(value);
  if (!text || text.toLowerCase() === "cancellation") return "Cancellation";

  const normalizedText = text
    .replace(/\s+TO\s+DEPARTURE\b/gi, "")
    .replace(/\bHRS\b/gi, "Hours")
    .replace(/\bHR\b/gi, "Hour")
    .replace(/\bDAYS\b/gi, "Days")
    .replace(/\s+/g, " ")
    .trim();
  const rangeMatch = normalizedText.match(
    /\b0*(\d+)\s*(Hours?|Days?)\s*(?:-|to|–|—)\s*0*(\d+)\s*(Hours?|Days?)\b/i
  );

  if (rangeMatch) {
    const [, start, startUnit, end, endUnit] = rangeMatch;
    const normalizedStartUnit = startUnit.toLowerCase().startsWith("hour")
      ? "Hours"
      : "Days";
    const normalizedEndUnit = endUnit.toLowerCase().startsWith("hour")
      ? "Hours"
      : "Days";

    if (normalizedStartUnit === normalizedEndUnit) {
      return `${Number(start)}-${Number(end)} ${normalizedEndUnit}`;
    }
  }

  return normalizedText;
};

const formatCurrency = (amount, currency = "INR") => {
  const value = readNumber(amount);
  if (!value) return "";
  const symbol = String(currency || "INR").toUpperCase() === "INR" ? "₹" : currency;
  return `${symbol} ${value.toLocaleString("en-IN")}`;
};

const formatPenalty = (amount, currency) => {
  const airlineFee = formatCurrency(amount, currency);

  if (airlineFee) return airlineFee;
  return "Non-Refundable";
};

const parseRawRows = (rawText, currency = "INR", platformCharges = null) => {
  const lines = cleanRuleLines(rawText);
  const rows = [];
  let inCancellationSection = false;
  let pendingDescription = "";

  lines.forEach((line, index) => {
    const nextLine = lines[index + 1] || "";
    const contextText = lines.slice(index, index + 5).join(" ");
    const effectiveLine = /\bFOR$/i.test(line) && nextLine ? `${line} ${nextLine}` : line;
    const upperLine = line.toUpperCase();
    const upperEffectiveLine = effectiveLine.toUpperCase();

    if (
      upperLine === "CANCELLATIONS" ||
      /^CANCELLATION\s*:/i.test(effectiveLine) ||
      upperEffectiveLine.includes("CANCEL/REFUND") ||
      upperEffectiveLine.includes("CANCELLATION CHARGES") ||
      upperEffectiveLine.includes("CANCELLATION FEE")
    ) {
      inCancellationSection = true;
    }
    if (inCancellationSection && upperLine.includes("NO SHOW")) {
      inCancellationSection = false;
    }

    const bookingWindowMatch = effectiveLine.match(
      /(?:BOOKED|WITHIN|MORE THAN)\s+(.+?)\s+(?:PRIOR TO|OF)\s+COMMENCEMENT/i
    );
    if (inCancellationSection && bookingWindowMatch) {
      pendingDescription = cleanRuleText(bookingWindowMatch[1].replace(/\bWITHIN\b/i, ""));
    }

    const atoMatch = effectiveLine.match(
      /cancellation\s*:\s*adult\s*([0-9][\d.,]*)\s*([A-Z]{3})?/i
    );
    if (atoMatch) {
      rows.push({
        timeFrame: "Cancellation",
        penalty: formatPenalty(atoMatch[1], atoMatch[2] || currency, platformCharges),
      });
      return;
    }

    if (!inCancellationSection) return;

    const simpleWindowChargeMatch = effectiveLine.match(
      /^(.+?)\s+([A-Z]{3})\s+([0-9][\d.,]*)\b/i
    );
    if (simpleWindowChargeMatch) {
      rows.push({
        timeFrame: normalizeTimeFrame(simpleWindowChargeMatch[1]),
        penalty: formatPenalty(
          simpleWindowChargeMatch[3],
          simpleWindowChargeMatch[2] || currency,
          platformCharges
        ),
      });
      return;
    }

    const chargeMatch =
      effectiveLine.match(
        /^(?:(TILL\s+[^,.;]+?)\s+)?CHARGE\s+([A-Z]{3})?\s*([0-9][\d.,]*)\s+(?:PER\s+COMPONENT\s+)?FOR\s+(?:CANCEL|CANCELLATION|REFUND)/i
      ) ||
      contextText.match(/AGAINST\s+A\s+CHARGE\s+OF\s+([A-Z]{3})?\s*([0-9][\d.,]*)/i) ||
      effectiveLine.match(
        /(?:CANCELLATION|CANCEL|REFUND)[^0-9A-Z]*(?:CHARGE|FEE|FEES)?[^0-9A-Z]*([A-Z]{3})?\s*([0-9][\d.,]*)/i
      );

    if (!chargeMatch) return;

    const amount = chargeMatch[3] || chargeMatch[2];
    const rowCurrency = chargeMatch[2] && chargeMatch[3] ? chargeMatch[2] : chargeMatch[1] || currency;
    const description =
      cleanRuleText(chargeMatch[1]) ||
      pendingDescription ||
      contextText.match(/BEFORE\s+24\s+HOURS\s+OF\s+DEPARTURE/i)?.[0] ||
      "Before departure";

    rows.push({
      timeFrame: normalizeTimeFrame(description),
      penalty: formatPenalty(amount, rowCurrency, platformCharges),
    });
  });

  return rows;
};

const extractCancellationRowsFromNode = (payload, platformCharges, currency) => {
  const rows = [];

  const visit = (node, context = {}) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach((item) => visit(item, context));
      return;
    }

    const title = node?.title || node?.Title || node?.head || node?.Head || context.title || "";
    const sections = toArray(node?.sections || node?.Sections);
    sections.forEach((section) => {
      const sectionTitle = section?.title || section?.Title || title;
      toArray(section?.items || section?.Items).forEach((item) => {
        if (!/cancel|ato service/i.test(sectionTitle)) return;
        rows.push({
          timeFrame: normalizeTimeFrame(item?.description || sectionTitle),
          penalty: formatPenalty(
            item?.adultAmount || item?.AdultAmount,
            item?.currencyCode || item?.CurrencyCode || currency,
            platformCharges
          ),
        });
      });
    });

    const rawRows = parseRawRows(
      node?.FareRuleText,
      currency,
      platformCharges
    );
    rows.push(...rawRows);

    Object.values(node).forEach((value) => visit(value, { title }));
  };

  visit(payload);

  const seen = new Set();
  return rows.filter((row) => {
    const key = `${row.timeFrame}|${row.penalty}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return row.penalty;
  });
};

const extractCancellationRows = (fareRulesData) => {
  const payload = unwrapFareRulesPayload(fareRulesData);
  const platformCharges = getPlatformCharges(fareRulesData);
  const currency = payload?.CurrencyCode || payload?.currencyCode || "INR";

  return extractCancellationRowsFromNode(payload, platformCharges, currency);
};

const getRulesPayload = (fareRulesData) => {
  const payload = unwrapFareRulesPayload(fareRulesData);
  return payload?.Rules || payload?.rules || {};
};

const getRouteLabelForIndex = (bookingView, index) => {
  if (index === 1) {
    return `${bookingView?.header?.toCode || "N/A"}-${bookingView?.header?.fromCode || "N/A"}`;
  }

  return `${bookingView?.header?.fromCode || "N/A"}-${bookingView?.header?.toCode || "N/A"}`;
};

const getFlightForIndex = (bookingView, index) =>
  index === 1 ? bookingView?.returnFlight : bookingView?.departureFlight;

const formatCompletePenalty = (amount, currency = "INR") => {
  const text = String(amount ?? "").trim();
  const numericText = text.replace(/[^\d.]/g, "");
  const numericAmount = Number(numericText);
  if (numericText && Number.isFinite(numericAmount)) {
    const symbol = String(currency || "INR").toUpperCase() === "INR" ? "₹" : currency;
    return `${symbol} ${numericAmount.toLocaleString("en-IN")}`;
  }
  return text || "Not Available";
};

const isCancellationPenaltyGroup = (heading) => {
  const normalizedHeading = String(heading || "")
    .replace(/[^a-z]+/gi, " ")
    .trim()
    .toLowerCase();

  return (
    /\bcancel(?:lation)?\b/.test(normalizedHeading) &&
    /\b(?:fee|penalty|charge|charges)\b/.test(normalizedHeading) &&
    !/\b(?:change|reissue|ato|service)\b/.test(normalizedHeading)
  );
};

const getCompleteRouteRows = (routeRules = []) =>
  toArray(routeRules).flatMap((fareRule) =>
    toArray(fareRule?.Rule || fareRule?.rule)
      .filter((ruleGroup) =>
        isCancellationPenaltyGroup(ruleGroup?.Head || ruleGroup?.head)
      )
      .flatMap((ruleGroup) =>
        toArray(ruleGroup?.Info || ruleGroup?.info).map((info) => ({
          timeFrame: normalizeTimeFrame(info?.Description || info?.description),
          penalty: formatCompletePenalty(
            info?.AdultAmount ?? info?.adultAmount,
            info?.CurrencyCode || info?.currencyCode || "INR"
          ),
        }))
      )
  );

const normalizeRouteKey = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

const getRuleRouteLabel = (source) =>
  source?.originDestination ||
  source?.OriginDestination ||
  source?.origin_destination ||
  source?.route ||
  source?.Route ||
  "";

const buildCancellationCards = (fareRulesData, bookingView, fallbackRows) => {
  const payload = unwrapFareRulesPayload(fareRulesData);
  const rules = getRulesPayload(fareRulesData);
  const routeEntries =
    rules && typeof rules === "object" && !Array.isArray(rules)
      ? Object.entries(rules).filter(([, value]) => Array.isArray(value))
      : [];

  if (routeEntries.length) {
    return routeEntries.map(([routeLabel, routeRules], index) => ({
      key: `${routeLabel}-${index}`,
      routeLabel,
      flight: getFlightForIndex(bookingView, index),
      rows: getCompleteRouteRows(routeRules),
    }));
  }

  const trips = toArray(rules?.trips || rules?.Trips);
  const flatRules = toArray(rules?.flat || rules?.Flat);
  const platformCharges = getPlatformCharges(fareRulesData);
  const currency = payload?.CurrencyCode || payload?.currencyCode || rules?.currencyCode || "INR";

  if (trips.length > 1 || flatRules.length > 1) {
    const sources = trips.length > 0 ? trips : [null, null];

    return sources.slice(0, 2).map((trip, index) => {
      const fallbackRouteLabel = getRouteLabelForIndex(bookingView, index);
      const routeLabel =
        getRuleRouteLabel(trip) ||
        getRuleRouteLabel(flatRules.find((item) => Number(item?.tripIndex) === index)) ||
        fallbackRouteLabel;
      const routeKey = normalizeRouteKey(routeLabel);
      const matchingFlatRules = flatRules.filter((item) => {
        const itemRouteKey = normalizeRouteKey(getRuleRouteLabel(item));
        const tripIndex = Number(item?.tripIndex ?? item?.TripIndex);
        return itemRouteKey
          ? itemRouteKey === routeKey
          : Number.isFinite(tripIndex) && tripIndex === index;
      });
      const rows = extractCancellationRowsFromNode(
        {
          trip,
          flat: matchingFlatRules,
        },
        platformCharges,
        currency
      );

      return {
        key: `${routeLabel}-${index}`,
        routeLabel,
        flight: getFlightForIndex(bookingView, index),
        rows,
      };
    });
  }

  return [
    {
      key: "departure",
      routeLabel: getRouteLabelForIndex(bookingView, 0),
      flight: getFlightForIndex(bookingView, 0),
      rows: fallbackRows,
    },
  ];
};

const buildFareRulesPayload = (bookingSession) => {
  const priceRequest = bookingSession?.priceRequest || {};
  const priceResponse = bookingSession?.priceResponse || {};
  const selectedFlight = bookingSession?.selectedFlight || {};
  const fallbackAmount = readNumber(
    bookingSession?.selectedFare?.netAmount,
    bookingSession?.selectedFare?.price,
    selectedFlight?.fare?.totalFare,
    selectedFlight?.fare?.pricePerAdult
  );
  const tripSource = toArray(priceRequest?.Trips).length
    ? toArray(priceRequest.Trips)
    : toArray(priceResponse?.data?.Trips || priceResponse?.Trips);
  const rootTui =
    priceResponse?.data?.TUI ||
    priceResponse?.TUI;

  return {
    search_key: priceRequest?.search_key || selectedFlight?.booking?.searchKey,
    Trips: tripSource.map((trip, index) => ({
      Amount: trip?.Amount ?? trip?.NetFare ?? trip?.GrossFare ?? fallbackAmount,
      Index: trip?.Index,
      OrderID: trip?.OrderID || trip?.orderId || index + 1,
      TUI: trip?.TUI || trip?.tui || rootTui,
    })),
  };
};

const buildFareRulesPayloads = (bookingSession) => {
  const priceRequest = bookingSession?.priceRequest || {};
  const isMultiCity =
    String(priceRequest?.TripType || priceRequest?.tripType || "").toUpperCase() === "DM";

  if (!isMultiCity) return [buildFareRulesPayload(bookingSession)];

  const ssrRequests = toArray(buildV2SsrPayload(bookingSession)?.ssr_requests);
  const routeRequests = toArray(priceRequest?.search_keys || priceRequest?.searchKeys);
  const routeFares = toArray(bookingSession?.selectedFare?.multiCityFares);

  return ssrRequests.map((ssrRequest, routeIndex) => {
    const requestRoute = routeRequests[routeIndex] || {};
    const routeFare = routeFares[routeIndex] || {};
    const fallbackAmount = readNumber(
      routeFare?.netAmount,
      routeFare?.rawFare?.netAmount,
      routeFare?.rawFare?.price,
      routeFare?.rawFare?.grossFare,
      routeFare?.price,
      routeFare?.pricePerAdult,
      requestRoute?.Trips?.[0]?.Amount
    );

    return {
      search_key: ssrRequest?.search_key,
      Trips: toArray(ssrRequest?.Trips).map((trip, tripIndex) => ({
        Amount:
          fallbackAmount ??
          requestRoute?.Trips?.[tripIndex]?.Amount ??
          requestRoute?.Trips?.[0]?.Amount,
        Index: trip?.Index,
        OrderID:
          trip?.OrderID ||
          trip?.OrderId ||
          trip?.Order ||
          requestRoute?.Trips?.[tripIndex]?.OrderID ||
          1,
        TUI: trip?.TUI,
      })),
    };
  });
};

const mergeMultiCityFareRuleResponses = (responses) => {
  const successfulResponses = toArray(responses).filter(Boolean);
  const firstResponse = successfulResponses[0] || {};
  const mergedRules = successfulResponses.reduce((rules, response) => ({
    ...rules,
    ...(response?.data?.rules || response?.data?.Rules || {}),
  }), {});

  return {
    ...firstResponse,
    data: {
      ...(firstResponse?.data || {}),
      rules: mergedRules,
    },
  };
};

const hasValidFareRulesPayload = (payload) =>
  payload?.search_key &&
  toArray(payload?.Trips).length > 0 &&
  toArray(payload?.Trips).every(
    (trip) =>
      trip?.TUI &&
      trip?.Amount !== undefined &&
      trip?.Amount !== null &&
      trip?.Index !== undefined &&
      trip?.Index !== null
  );

const CancellationPenalty = () => {
  const { bookingSession, setBookingSession } = useFlightBooking();
  const [fareRulesData, setFareRulesData] = useState(
    bookingSession?.fareRulesResponse || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const bookingView = useMemo(
    () => getBookingDetailsView(bookingSession),
    [bookingSession]
  );
  const payloads = useMemo(() => buildFareRulesPayloads(bookingSession), [bookingSession]);
  const isMultiCityFareRules = payloads.length > 1;
  const rows = useMemo(() => extractCancellationRows(fareRulesData), [fareRulesData]);
  const fallbackRows = rows.length
    ? rows
    : [{ timeFrame: error || "Cancellation rules", penalty: isLoading ? "Please wait" : "Not Available" }];
  const policyCards = useMemo(
    () => buildCancellationCards(fareRulesData, bookingView, fallbackRows),
    [bookingView, fallbackRows, fareRulesData]
  );

  useEffect(() => {
    const hasCompleteCachedMultiCityRules =
      isMultiCityFareRules &&
      toArray(bookingSession?.fareRulesResponses).length === payloads.length;
    if (
      bookingSession?.fareRulesResponse &&
      (!isMultiCityFareRules || hasCompleteCachedMultiCityRules)
    ) {
      setFareRulesData(bookingSession.fareRulesResponse);
      return;
    }

    if (!payloads.length || !payloads.every(hasValidFareRulesPayload)) {
      setError("Cancellation rules are not available for this flight.");
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError("");

    Promise.all(payloads.map((payload) => getFlightFareRules(payload)))
      .then((responses) => {
        if (!isMounted) return;
        const response = isMultiCityFareRules
          ? mergeMultiCityFareRuleResponses(responses)
          : responses[0];
        setFareRulesData(response);
        setBookingSession?.((prev) => {
          const next = {
            ...(prev || {}),
            fareRulesRequest: isMultiCityFareRules ? undefined : payloads[0],
            fareRulesRequests: isMultiCityFareRules ? payloads : undefined,
            fareRulesResponse: response,
            fareRulesResponses: isMultiCityFareRules ? responses : undefined,
          };
          writeFlightBookingSession(next);
          return next;
        });
      })
      .catch((fetchError) => {
        if (!isMounted) return;
        console.error("Unable to load booking cancellation rules", fetchError);
        setError("Unable to load cancellation rules.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    bookingSession?.fareRulesResponse,
    bookingSession?.fareRulesResponses,
    isMultiCityFareRules,
    payloads,
    setBookingSession,
  ]);

  return (
    <div className={styles.wrapper}>
      {policyCards.map((card) => {
        const emptyRows = [
          {
            timeFrame: "Cancellation rules",
            penalty: "Not Available",
          },
        ];
        const displayRows = card.rows.length
          ? card.rows.slice(0, 3)
          : policyCards.length > 1
            ? emptyRows
            : fallbackRows.slice(0, 3);
        const markRows = card.rows.length ? card.rows.slice(0, 3) : [];

        return (
          <div className={styles.policyCard} key={card.key}>
            <div className={styles.header}>
              <div className={styles.route}>
                <img
                  src={card.flight?.airline?.logo || "/images/dummyFlightlogo.png"}
                  alt=""
                  aria-hidden
                  className={styles.airlineIcon}
                />
                <span>{card.routeLabel}</span>
              </div>
            </div>

            <div className={styles.penaltyContainer}>
              <div className={styles.gridOverlay}>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
              <div className={styles.penaltyRow}>
                <span className={styles.label}>Cancellation Penalty:</span>

                <div className={styles.penaltyValues}>
                  {displayRows.map((row, index) => (
                    <span key={`${row.timeFrame}-${index}`}>{row.penalty}</span>
                  ))}
                  <span className={styles.nonRefundable}>Non-Refundable</span>
                </div>
              </div>

              <div className={styles.timelineRow}>
                <span className={styles.label}>Cancel Between(IST):</span>

                <div className={styles.timeline}>
                  <div className={styles.bar} />

                  <div className={styles.marks}>
                    <span className={styles.now}>Now</span>
                    {markRows.map((row, index) => (
                      <span
                        className={styles.durationMark}
                        key={`${row.timeFrame}-mark-${index}`}
                      >
                        {row.timeFrame}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        className={styles.viewPolicy}
        onClick={() => setShowPolicyModal(true)}
      >
        View Policy
      </button>
      {showPolicyModal && (
        <CancellationPolicyModal
          fareRulesData={fareRulesData}
          onClose={() => setShowPolicyModal(false)}
        />
      )}
    </div>
  );
};

export default CancellationPenalty;

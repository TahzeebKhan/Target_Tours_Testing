"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ExpandableTabs.module.css";
import {
  getFlightFareRules,
  getFlightSsr,
} from "@/features/flights/services/flightBooking";

const parseCityLabel = (label = "") => {
  const text = String(label || "").trim();
  const match = text.match(/^(.*?)(?:\s*\(([^)]+)\))?$/);

  return {
    city: match?.[1]?.trim() || text || "-",
    code: match?.[2]?.trim() || "",
  };
};

const formatDate = (value, options) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", options).toUpperCase();
};

const formatFareHeaderDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const day = date.toLocaleDateString("en-US", { day: "2-digit" }).toUpperCase();
  const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const year = date.toLocaleDateString("en-US", { year: "numeric" }).toUpperCase();

  return `${day} ${month} ${year}`;
};

const formatDuration = (duration = {}) => {
  const hours = Number(duration?.hours || 0);
  const minutes = Number(duration?.minutes || 0);
  return `${hours} h ${minutes} m`;
};

const formatTimeValue = (value) => {
  if (!value) return "N/A";
  if (typeof value === "string") {
    const hhmm = value.match(/(\d{2}:\d{2})/);
    if (hhmm) return hhmm[1];
  }

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  return "N/A";
};

const displayValue = (value) => {
  if (value === undefined || value === null) return "N/A";
  const text = String(value).trim();
  return text ? text : "N/A";
};

const parseCurrencyAmount = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const normalized = String(value || "").replace(/[^\d.-]/g, "");
  if (!normalized) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
};

const formatCurrencyAmount = (value, fallback = "-") => {
  const amount = parseCurrencyAmount(value);
  if (amount === null) return fallback;
  return `₹ ${amount.toLocaleString("en-IN")}`;
};

const displayTerminal = (value) => {
  const resolved = displayValue(value);
  return resolved === "N/A" ? "Terminal N/A" : `Terminal ${resolved}`;
};

const parseDurationMinutes = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const text = String(value).trim();
  if (!text) return null;

  const hoursMatch = text.match(/(\d+)\s*h/i);
  const minutesMatch = text.match(/(\d+)\s*m/i);
  const colonMatch = text.match(/^(\d{1,2}):(\d{2})$/);

  if (colonMatch) {
    return Number(colonMatch[1]) * 60 + Number(colonMatch[2]);
  }

  const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;

  if (!hours && !minutes) return null;
  return hours * 60 + minutes;
};

const addDurationToDateTime = (dateTime, duration) => {
  const durationMinutes = parseDurationMinutes(duration);
  if (!dateTime || durationMinutes === null) return null;

  if (typeof dateTime === "string") {
    const timeOnly = dateTime.match(/^(\d{2}):(\d{2})$/);
    if (timeOnly) {
      const totalMinutes =
        (Number(timeOnly[1]) * 60 + Number(timeOnly[2]) + durationMinutes) %
        (24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }
  }

  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) return null;

  date.setMinutes(date.getMinutes() + durationMinutes);
  return date.toISOString();
};

const pickFirst = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
};

const getByPath = (obj, path) =>
  path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);

const getFirstArrayAtPaths = (obj, paths) => {
  for (const path of paths) {
    const value = path.length ? getByPath(obj, path) : obj;
    if (Array.isArray(value)) return value;
  }
  return [];
};

const compactAirportName = (value) => {
  const text = String(value || "").trim();
  if (!text) return "N/A";
  return text.split("|")[0]?.trim() || "N/A";
};

const getConnectionCode = (connection = {}) =>
  displayValue(
    connection?.Airport ||
      connection?.airport ||
      connection?.ArrAirport ||
      connection?.arrAirport ||
      connection?.To ||
      connection?.to
  );

const getConnectionName = (connection = {}) =>
  compactAirportName(
    connection?.ArrAirportName ||
      connection?.arrAirportName ||
      connection?.AirportName ||
      connection?.airportName ||
      connection?.Airport ||
      connection?.airport
  );

const getConnectionTerminal = (connection = {}) =>
  displayTerminal(
    connection?.ArrTerminal ||
      connection?.arrTerminal ||
      connection?.Terminal ||
      connection?.terminal
  );

const getConnectionDate = (connection = {}) =>
  connection?.arrival ||
  connection?.Arrival ||
  connection?.ArrDateTime ||
  connection?.arrDateTime ||
  connection?.departure ||
  connection?.Departure ||
  connection?.DepDateTime ||
  connection?.depDateTime;

const getConnectionArrivalDate = (connection = {}) =>
  connection?.arrival ||
  connection?.Arrival ||
  connection?.ArrDate ||
  connection?.arrDate ||
  connection?.ArrDateTime ||
  connection?.arrDateTime ||
  connection?.ArrivalDateTime ||
  connection?.arrivalDateTime;

const getConnectionDepartureDate = (connection = {}) =>
  connection?.departure ||
  connection?.Departure ||
  connection?.DepDate ||
  connection?.depDate ||
  connection?.DepDateTime ||
  connection?.depDateTime ||
  connection?.DepartureDateTime ||
  connection?.departureDateTime;

const parseAirportDetail = (label = "") => {
  const text = String(label || "").trim();
  if (!text) return { code: "N/A", city: "N/A", airport: "N/A" };

  const [airportPart = "", cityPart = ""] = text.split("|");
  const city =
    cityPart.trim() ||
    airportPart
      .replace(/\bInternational Airport\b/i, "")
      .replace(/\bAirport\b/i, "")
      .trim();
  const codeMatch = text.match(/\(([A-Z]{3})\)/);

  return {
    code: codeMatch?.[1] || "N/A",
    city: city || "N/A",
    airport: airportPart.trim() || cityPart.trim() || "N/A",
  };
};

const unwrapFlightInfoPayload = (flightInfoData) =>
  flightInfoData?.data?.raw ||
  flightInfoData?.raw ||
  flightInfoData?.data ||
  flightInfoData ||
  {};

const extractFlightInfoRoot = (flightInfoData) => {
  const payload = unwrapFlightInfoPayload(flightInfoData);
  return (
    getByPath(payload, ["flight", 0]) ||
    getByPath(payload, ["flights", 0]) ||
    getByPath(payload, ["data", "flight", 0]) ||
    getByPath(payload, ["data", "flights", 0]) ||
    payload
  );
};

const extractFlightInfoConnections = (flightInfoData) => {
  const root = extractFlightInfoRoot(flightInfoData);
  if (Array.isArray(root?.Connections)) return root.Connections;
  if (Array.isArray(root?.connections)) return root.connections;
  return [];
};

const extractRawFlightInfoSegmentFlights = (flightInfoData) => {
  const payload = unwrapFlightInfoPayload(flightInfoData);
  const segments = getFirstArrayAtPaths(payload, [
    ["raw_flight_info_response", "Trips", 0, "Journey", 0, "Segments"],
    ["rawFlightInfoResponse", "Trips", 0, "Journey", 0, "Segments"],
    ["raw_flight_info_response", "Trips", 0, "Journeys", 0, "Segments"],
    ["rawFlightInfoResponse", "Trips", 0, "Journeys", 0, "Segments"],
    ["raw_flight_info_response", "Trips", 0, "Segments"],
    ["rawFlightInfoResponse", "Trips", 0, "Segments"],
    ["Trips", 0, "Journey", 0, "Segments"],
    ["Trips", 0, "Journeys", 0, "Segments"],
    ["Trips", 0, "Segments"],
  ]);

  return segments.map((segment) => segment?.Flight || segment?.flight || segment);
};

const extractFlightInfoSegments = (flightInfoData) => {
  const payload = unwrapFlightInfoPayload(flightInfoData);
  return getFirstArrayAtPaths(payload, [
    ["Trips", 0, "Journey", 0, "Segments"],
    ["Trips", 0, "Journeys", 0, "Segments"],
    ["Trips", 0, "Segments"],
    ["trips", 0, "journey", 0, "segments"],
    ["trips", 0, "journeys", 0, "segments"],
    ["trips", 0, "segments"],
    ["Journey", 0, "Segments"],
    ["Journeys", 0, "Segments"],
    ["Segments"],
    ["segments"],
    ["FlightInfo", "Segments"],
    ["flightInfo", "segments"],
  ]);
};

const extractFlightInfoLayovers = (flightInfoData) => {
  const payload = unwrapFlightInfoPayload(flightInfoData);
  return getFirstArrayAtPaths(payload, [
    ["Trips", 0, "Journey", 0, "Layovers"],
    ["Trips", 0, "Journeys", 0, "Layovers"],
    ["Trips", 0, "Layovers"],
    ["Layovers"],
    ["layovers"],
  ]);
};

const unwrapFareRulesPayload = (fareRulesData) =>
  fareRulesData?.data?.raw ||
  fareRulesData?.raw ||
  fareRulesData?.data ||
  fareRulesData ||
  {};

const getFareRulesMessage = (fareRulesData) =>
  displayValue(
    fareRulesData?.data?.message ||
      fareRulesData?.message ||
      fareRulesData?.data?.data?.message ||
      fareRulesData?.data?.raw?.message
  );

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

const toFareRuleAmount = (value) => {
  const amount = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) && amount > 0 ? amount : null;
};

const getPlatformCharges = (fareRulesData) => {
  const payload = unwrapFareRulesPayload(fareRulesData);
  return toFareRuleAmount(
    payload?.platform_charges ||
      payload?.platformCharges ||
      fareRulesData?.data?.platform_charges ||
      fareRulesData?.platform_charges
  );
};

const parseRawCancellationRuleRows = (text, context = {}) => {
  const lines = Array.isArray(text)
    ? text.map(cleanRuleText).filter(Boolean)
    : cleanRuleLines(text);
  const rows = [];
  let inCancellationSection = false;
  let pendingCancellationDescription = "";
  let cancellationFeeIndex = 0;

  lines.forEach((line, index) => {
    const nextLine = lines[index + 1] || "";
    const contextText = lines.slice(index, index + 6).join(" ");
    const effectiveLine =
      /\bFOR$/i.test(line) && nextLine
        ? `${line} ${nextLine}`
        : line;
    const upperLine = line.toUpperCase();
    const upperEffectiveLine = effectiveLine.toUpperCase();

    if (/^-+$/.test(line)) return;
    if (
      upperLine === "CANCELLATIONS" ||
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
      pendingCancellationDescription = cleanRuleText(
        bookingWindowMatch[1].replace(/\bWITHIN\b/i, "")
      );
    }

    const atoMatch = effectiveLine.match(
      /cancellation\s*:\s*adult\s*([0-9][\d.,]*)\s*([A-Z]{3})?/i
    );
    if (atoMatch) {
      rows.push({
        ...context,
        head: "ATO Service Fee(Per Pax/ Per Journey)",
        Description: "Cancellation",
        adultAmount: toFareRuleAmount(atoMatch[1]),
        currencyCode: atoMatch[2] || "INR",
      });
      return;
    }

    if (!inCancellationSection) return;

    if (
      upperEffectiveLine.includes("TO DEPARTURE") ||
      /^TILL\s+/i.test(effectiveLine)
    ) {
      pendingCancellationDescription = cleanRuleText(
        effectiveLine.replace(/\bCHARGE\b.*$/i, "")
      );
    }

    const isExplicitCancellationCharge =
      /FOR\s+(?:CANCEL|CANCELLATION|REFUND)/i.test(effectiveLine);
    const chargeMatch = isExplicitCancellationCharge
      ? effectiveLine.match(
          /^(?:(TILL\s+[^,.;]+?)\s+)?CHARGE\s+([A-Z]{3})?\s*([0-9][\d.,]*)\s+(?:PER\s+COMPONENT\s+)?FOR\s+(?:CANCEL|CANCELLATION|REFUND)/i
        )
      : null;
    const genericCancellationAmountMatch = !chargeMatch
      ? effectiveLine.match(
          /(?:CANCELLATION|CANCEL|REFUND)[^0-9A-Z]*(?:CHARGE|FEE|FEES)?[^0-9A-Z]*([A-Z]{3})?\s*([0-9][\d.,]*)/i
        )
      : null;
    const cancellationMadeMatch =
      !chargeMatch && !genericCancellationAmountMatch
        ? contextText.match(
            /CHARGE\s+([A-Z]{3})?\s*([0-9][\d.,]*)\s+WHEN\s+CANCELLATION\s+ARE\s+MADE/i
          )
        : null;
    const againstChargeMatch =
      !chargeMatch && !genericCancellationAmountMatch
        ? contextText.match(/AGAINST\s+A\s+CHARGE\s+OF\s+([A-Z]{3})?\s*([0-9][\d.,]*)/i)
        : null;

    if (
      !chargeMatch &&
      !genericCancellationAmountMatch &&
      !cancellationMadeMatch &&
      !againstChargeMatch
    ) {
      return;
    }

    const amount =
      cancellationMadeMatch?.[2] ||
      againstChargeMatch?.[2] ||
      chargeMatch?.[3] ||
      genericCancellationAmountMatch?.[2];
    const currency =
      cancellationMadeMatch?.[1] ||
      againstChargeMatch?.[1] ||
      chargeMatch?.[2] ||
      genericCancellationAmountMatch?.[1] ||
      "INR";
    const contextualDescription =
      contextText.match(/BEFORE\s+24\s+HOURS\s+OF\s+DEPARTURE/i)
        ? "Before 24 hours of departure"
        : contextText.match(/WITHIN\s+24\s+HRS?.*?(?:02|2)\s+HRS?.*?DEPARTURE/i)
          ? "Within 24 hrs until 02 hrs before departure"
          : "";

    const parsedDescription =
      contextualDescription ||
      cleanRuleText(chargeMatch?.[1]) ||
      pendingCancellationDescription ||
      (cancellationFeeIndex === 0 ? "Before departure" : "Cancellation");
    cancellationFeeIndex += 1;

    rows.push({
      ...context,
      head: "Cancellation Fee(Per Pax/ Per Journey)",
      Description: parsedDescription,
      adultAmount: toFareRuleAmount(amount),
      currencyCode: currency,
    });
  });

  return rows.filter((row) => row.adultAmount);
};

const getFallbackCancellationTimeFrame = (rule = {}) => {
  const amount = toFareRuleAmount(
    rule?.adultAmount || rule?.AdultAmount || rule?.amount || rule?.Amount
  );
  const description = String(
    rule?.Description || rule?.description || ""
  ).trim();

  if (!description || description.toLowerCase() === "cancellation") {
    return amount && amount <= 100
      ? "Cancellation"
      : "Before departure";
  }

  return description;
};

const extractFareRuleRows = (fareRulesData) => {
  const payload = unwrapFareRulesPayload(fareRulesData);
  const recursiveRows = [];
  const visitFareRuleNode = (node, context = {}) => {
    if (!node || typeof node !== "object") return;

    if (Array.isArray(node)) {
      node.forEach((item) => visitFareRuleNode(item, context));
      return;
    }

    const nextContext = {
      originDestination:
        node?.OrginDestination ||
        node?.OriginDestination ||
        node?.orginDestination ||
        node?.originDestination ||
        context.originDestination,
      head: node?.Head || node?.head || node?.title || node?.Title || context.head,
    };

    const sections = Array.isArray(node?.sections)
      ? node.sections
      : Array.isArray(node?.Sections)
        ? node.Sections
        : [];

    sections.forEach((section) => {
      const sectionContext = {
        ...nextContext,
        head: section?.title || section?.Title || nextContext.head,
      };
      const items = Array.isArray(section?.items)
        ? section.items
        : Array.isArray(section?.Items)
          ? section.Items
          : [];

      items.forEach((item) => {
        recursiveRows.push({
          ...sectionContext,
          ...item,
        });
      });
    });

    const infoItems = Array.isArray(node?.Info)
      ? node.Info
      : Array.isArray(node?.info)
        ? node.info
        : [];

    infoItems.forEach((item) => {
      recursiveRows.push({
        ...nextContext,
        ...item,
      });
    });

    const textLines = Array.isArray(node?.textLines)
      ? node.textLines
      : Array.isArray(node?.TextLines)
        ? node.TextLines
        : [];
    const rawText = node?.rawText || node?.RawText || node?.FareRuleText;
    const rawRows = parseRawCancellationRuleRows(
      rawText || textLines,
      nextContext
    );

    recursiveRows.push(...rawRows);

    Object.values(node).forEach((value) => visitFareRuleNode(value, nextContext));
  };

  const dedupeRows = (rows = []) => {
    const seen = new Set();
    const meaningfulRows = rows.filter((row) => {
      const frame = getFareRuleTimeFrame(row).toLowerCase();
      const fee = getFareRuleFee(row).toLowerCase();

      if (frame === "before departure") {
        return !rows.some((candidate) => {
          const candidateFrame = getFareRuleTimeFrame(candidate).toLowerCase();
          const candidateFee = getFareRuleFee(candidate).toLowerCase();
          return (
            candidate !== row &&
            candidateFee === fee &&
            candidateFrame !== frame &&
            candidateFrame !== "cancellation"
          );
        });
      }

      return true;
    });

    return meaningfulRows.filter((row) => {
      const key = [
        row?.head || row?.Head || "",
        getFareRuleTimeFrame(row),
        getFareRuleFee(row),
      ].join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  visitFareRuleNode(payload);
  if (recursiveRows.length) return dedupeRows(recursiveRows);

  const flattenSegments = (segments = []) =>
    segments.flatMap((segment) => {
      const fareRules = Array.isArray(segment?.fareRules)
        ? segment.fareRules
        : Array.isArray(segment?.FareRules)
          ? segment.FareRules
          : [];
      const sectionRows = fareRules.flatMap((fareRule) => {
        const sections = Array.isArray(fareRule?.sections)
          ? fareRule.sections
          : Array.isArray(fareRule?.Sections)
            ? fareRule.Sections
            : [];

        return sections.flatMap((section) => {
          const items = Array.isArray(section?.items)
            ? section.items
            : Array.isArray(section?.Items)
              ? section.Items
              : [];

          return items.map((item) => ({
            originDestination:
              fareRule?.originDestination ||
              fareRule?.OriginDestination ||
              fareRule?.orginDestination ||
              fareRule?.OrginDestination,
            head: section?.title || section?.Title || fareRule?.title || fareRule?.Title,
            ...item,
          }));
        });
      });

      if (sectionRows.length) return sectionRows;

      const rules = Array.isArray(segment?.Rules)
        ? segment.Rules
        : Array.isArray(segment?.rules)
          ? segment.rules
          : [];

      return rules.flatMap((rulesGroup) => {
        const ruleItems = Array.isArray(rulesGroup?.Rule)
          ? rulesGroup.Rule
          : Array.isArray(rulesGroup?.rule)
            ? rulesGroup.rule
            : [];

        return ruleItems.flatMap((rule) => {
          const infoItems = Array.isArray(rule?.Info)
            ? rule.Info
            : Array.isArray(rule?.info)
              ? rule.info
              : [];

          return infoItems.map((info) => ({
            originDestination:
              rulesGroup?.OrginDestination ||
              rulesGroup?.OriginDestination ||
              rulesGroup?.orginDestination ||
              rulesGroup?.originDestination,
            head: rule?.Head || rule?.head,
            ...info,
          }));
        });
      });
    });

  const flights = getFirstArrayAtPaths(payload, [
    ["flight"],
    ["flights"],
    ["data", "flight"],
    ["data", "flights"],
  ]);
  const flightRows = flights.flatMap((flight) =>
    flattenSegments(
      Array.isArray(flight?.Segments)
        ? flight.Segments
        : Array.isArray(flight?.segments)
          ? flight.segments
          : []
    )
  );

  if (flightRows.length) return flightRows;

  const topLevelSegments = getFirstArrayAtPaths(payload, [
    ["Segments"],
    ["segments"],
    ["data", "Segments"],
    ["data", "segments"],
  ]);
  const topLevelSegmentRows = flattenSegments(topLevelSegments);

  if (topLevelSegmentRows.length) return topLevelSegmentRows;

  const trips = getFirstArrayAtPaths(payload, [
    ["Trips"],
    ["trips"],
    ["data", "Trips"],
    ["data", "trips"],
  ]);
  const tripRows = trips.flatMap((trip) => {
    const journeys = Array.isArray(trip?.Journey)
      ? trip.Journey
      : Array.isArray(trip?.journey)
        ? trip.journey
        : Array.isArray(trip?.Journeys)
          ? trip.Journeys
          : Array.isArray(trip?.journeys)
            ? trip.journeys
            : [];

    return journeys.flatMap((journey) => {
      const segments = Array.isArray(journey?.Segments)
        ? journey.Segments
        : Array.isArray(journey?.segments)
          ? journey.segments
          : [];

      return flattenSegments(segments);
    });
  });

  if (tripRows.length) return tripRows;

  const journeys = getFirstArrayAtPaths(payload, [
    ["journeys"],
    ["Journeys"],
    ["data", "journeys"],
    ["data", "Journeys"],
  ]);
  const journeyRows = journeys.flatMap((journey) => {
    const segments = Array.isArray(journey?.segments)
      ? journey.segments
      : Array.isArray(journey?.Segments)
        ? journey.Segments
        : [];

    return flattenSegments(segments);
  });

  if (journeyRows.length) return journeyRows;

  const candidates = getFirstArrayAtPaths(payload, [
    ["FareRules"],
    ["fareRules"],
    ["Rules"],
    ["rules"],
    ["CancellationRules"],
    ["cancellationRules"],
    ["data", "FareRules"],
    ["data", "fareRules"],
    ["data", "rules"],
    ["data"],
  ]);

  const rows = candidates.flatMap((item) => {
    const nestedRules =
      item?.rules ||
      item?.Rules ||
      item?.cancellationRules ||
      item?.CancellationRules ||
      item?.items ||
      item?.Items ||
      item?.details ||
      item?.Details;

    if (Array.isArray(nestedRules)) {
      return nestedRules.map((rule) => ({ ...item, ...rule }));
    }

    return item;
  });

  return rows.filter((row) => row && typeof row === "object");
};

const getFareRuleTimeFrame = (rule = {}) =>
  displayValue(
    getFallbackCancellationTimeFrame(rule) ||
      rule?.Description ||
      rule?.description ||
      rule?.timeDay ||
      rule?.TimeDay ||
      rule?.timeFrame ||
      rule?.TimeFrame ||
      rule?.period ||
      rule?.Period ||
      rule?.hours ||
      rule?.Hours ||
      rule?.rule ||
      rule?.Rule
  );

const getFareRuleFee = (rule = {}, platformCharges = null) => {
  const platform = toFareRuleAmount(platformCharges);
  const suffix = platform ? ` + INR ${platform}` : "";
  const amount = toFareRuleAmount(
    rule?.AdultAmount ||
      rule?.adultAmount ||
      rule?.amount ||
      rule?.Amount ||
      rule?.airlineFee ||
      rule?.AirlineFee ||
      rule?.charge ||
      rule?.Charge ||
      rule?.charges ||
      rule?.Charges ||
      rule?.cancellationCharge ||
      rule?.CancellationCharge
  );

  if (amount) {
    return `ADULT : ${rule.CurrencyCode || rule.currencyCode || rule?.currency || "INR"} ${amount}${suffix}`;
  }

  const feeText =
    rule?.feeText ||
    rule?.fee ||
    rule?.Fee ||
    rule?.text ||
    rule?.Text;
  if (/non[-\s]?refundable/i.test(String(feeText || ""))) {
    return displayValue(feeText || "ADULT : NON REFUNDABLE");
  }

  return displayValue(
    feeText || "ADULT : NON REFUNDABLE"
  );
};

const isCancellationFareRule = (rule = {}) => {
  const haystack = String(
    [
      rule?.head,
      rule?.Head,
      rule?.title,
      rule?.Title,
      rule?.Description,
      rule?.description,
      rule?.rawText,
      rule?.text,
      rule?.Text,
    ]
      .filter(Boolean)
      .join(" ")
  ).toLowerCase();

  return haystack.includes("cancel") || haystack.includes("penalt");
};

const unwrapSsrPayload = (ssrData) =>
  ssrData?.data?.raw ||
  ssrData?.raw ||
  ssrData?.data ||
  ssrData ||
  {};

const findBaggageText = (source, type, depth = 0, seen = new Set()) => {
  if (!source || depth > 7) return "";
  if (typeof source === "object") {
    if (seen.has(source)) return "";
    seen.add(source);
  }

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
    const keyMatchesCabin =
      type === "cabin" &&
      /(cabin|hand|carry).*bag|bag.*(cabin|hand|carry)|cabin_baggage|cabinbaggage/.test(
        normalizedKey
      );
    const keyMatchesChecked =
      type === "checked" &&
      /(check|checked|check-in|checkin).*bag|bag.*(check|checked|check-in|checkin)|checkin_baggage|checked_baggage/.test(
        normalizedKey
      );

    if (keyMatchesCabin || keyMatchesChecked) {
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

const normalizeBaggageValue = (value) => {
  const text = String(value || "").trim();
  if (!text) return "-";
  const weight = text.match(/(\d+(?:\.\d+)?)\s*(kg|kgs|kilogram|kilograms)\b/i);
  return weight ? `${weight[1]} KG` : text;
};

const getIncludedBaggageName = (value = {}) => {
  const baggageItems = Array.isArray(value?.baggage)
    ? value.baggage
    : Array.isArray(value?.Baggage)
      ? value.Baggage
      : [];
  const included = baggageItems.find((item) => {
    const price = Number(item?.price || item?.Price || 0);
    const code = String(item?.code || item?.Code || "").toUpperCase();
    const name = String(item?.name || item?.Name || "").trim();
    return name && (price === 0 || code === "BAG");
  });

  return included?.name || included?.Name || "";
};

const splitBaggageName = (name) => {
  const parts = String(name || "")
    .split(",")
    .map((item) => normalizeBaggageValue(item))
    .filter((item) => item && item !== "-");

  if (!parts.length) return { checkin: "-", cabin: "-" };

  return {
    checkin: parts[0] || "-",
    cabin: parts[1] || parts[0] || "-",
  };
};

const extractBaggageRows = (ssrData, fallbackRow) => {
  const payload = unwrapSsrPayload(ssrData);
  const formatted =
    ssrData?.data?.formatted ||
    ssrData?.formatted ||
    payload?.formatted ||
    {};
  const formattedEntries =
    formatted && typeof formatted === "object" && !Array.isArray(formatted)
      ? Object.entries(formatted)
      : [];

  const routeRows = formattedEntries
    .filter(([, value]) => value && typeof value === "object")
    .map(([route, value]) => {
      const includedBaggage = splitBaggageName(getIncludedBaggageName(value));
      return {
        ...fallbackRow,
        id: `baggage-${route}`,
        route,
        checkin: normalizeBaggageValue(
        pickFirst(
          value?.checked_baggage,
          value?.checkin_baggage,
          value?.checkedBaggage,
          value?.checkinBaggage,
          value?.checkin,
          findBaggageText(value, "checked"),
          includedBaggage.checkin
        )
        ),
        cabin: normalizeBaggageValue(
        pickFirst(
          value?.cabin_baggage,
          value?.cabinBaggage,
          value?.cabin,
          findBaggageText(value, "cabin"),
          includedBaggage.cabin
        )
        ),
      };
    });

  if (routeRows.length) return routeRows;

  const checkin = normalizeBaggageValue(findBaggageText(payload, "checked"));
  const cabin = normalizeBaggageValue(findBaggageText(payload, "cabin"));

  if (checkin !== "-" || cabin !== "-") {
    return [
      {
        ...fallbackRow,
        id: "baggage-ssr",
        checkin,
        cabin,
      },
    ];
  }

  return [];
};

const getSegmentDateTime = (segment = {}, type) => {
  const isDeparture = type === "departure";
  const source = isDeparture
    ? segment?.Departure || segment?.departure || segment?.Dep || segment?.dep || {}
    : segment?.Arrival || segment?.arrival || segment?.Arr || segment?.arr || {};

  return pickFirst(
    source?.DateTime,
    source?.dateTime,
    source?.Time,
    source?.time,
    source?.Date,
    source?.date,
    isDeparture
      ? segment?.DepartureTime || segment?.departureTime || segment?.DepTime || segment?.depTime
      : segment?.ArrivalTime || segment?.arrivalTime || segment?.ArrTime || segment?.arrTime,
    isDeparture
      ? segment?.DepartureDateTime || segment?.departureDateTime || segment?.DepDateTime || segment?.depDateTime
      : segment?.ArrivalDateTime || segment?.arrivalDateTime || segment?.ArrDateTime || segment?.arrDateTime
  );
};

const getSegmentAirportCode = (segment = {}, type) => {
  const isDeparture = type === "departure";
  const source = isDeparture
    ? segment?.Departure || segment?.departure || segment?.Origin || segment?.origin || {}
    : segment?.Arrival || segment?.arrival || segment?.Destination || segment?.destination || {};

  return pickFirst(
    source?.AirportCode,
    source?.airportCode,
    source?.Code,
    source?.code,
    source?.Airport,
    source?.airport,
    isDeparture
      ? segment?.From || segment?.from || segment?.Origin || segment?.origin
      : segment?.To || segment?.to || segment?.Destination || segment?.destination
  );
};

const getSegmentAirportName = (segment = {}, type) => {
  const isDeparture = type === "departure";
  const source = isDeparture
    ? segment?.Departure || segment?.departure || segment?.Origin || segment?.origin || {}
    : segment?.Arrival || segment?.arrival || segment?.Destination || segment?.destination || {};

  return pickFirst(
    source?.AirportName,
    source?.airportName,
    source?.Name,
    source?.name,
    isDeparture
      ? segment?.FromName || segment?.fromName || segment?.OriginName || segment?.originName
      : segment?.ToName || segment?.toName || segment?.DestinationName || segment?.destinationName
  );
};

const getSegmentCity = (segment = {}, type, fallback) => {
  const isDeparture = type === "departure";
  const source = isDeparture
    ? segment?.Departure || segment?.departure || segment?.Origin || segment?.origin || {}
    : segment?.Arrival || segment?.arrival || segment?.Destination || segment?.destination || {};

  return pickFirst(source?.City, source?.city, source?.CityName, source?.cityName, fallback);
};

const getSegmentTerminal = (segment = {}, type) => {
  const isDeparture = type === "departure";
  const source = isDeparture
    ? segment?.Departure || segment?.departure || segment?.Origin || segment?.origin || {}
    : segment?.Arrival || segment?.arrival || segment?.Destination || segment?.destination || {};

  return pickFirst(
    source?.Terminal,
    source?.terminal,
    isDeparture
      ? segment?.DepartureTerminal || segment?.departureTerminal || segment?.DepTerminal || segment?.depTerminal
      : segment?.ArrivalTerminal || segment?.arrivalTerminal || segment?.ArrTerminal || segment?.arrTerminal
  );
};

const getSegmentDuration = (segment = {}) =>
  pickFirst(
    segment?.Duration,
    segment?.duration,
    segment?.FlightDuration,
    segment?.flightDuration,
    segment?.JourneyTime,
    segment?.journeyTime
  );

const ExpandableTabs = ({
  flightData = null,
  flightInfoData = null,
  isFlightInfoLoading = false,
  selectedDepartureDate = "",
  travellerSummary = null,
}) => {
  const [activeTab, setActiveTab] = useState("flight");
  const [fareRulesData, setFareRulesData] = useState(null);
  const [fareRulesRequestKey, setFareRulesRequestKey] = useState("");
  const [isFareRulesLoading, setIsFareRulesLoading] = useState(false);
  const [fareRulesError, setFareRulesError] = useState("");
  const [ssrData, setSsrData] = useState(null);
  const [ssrRequestKey, setSsrRequestKey] = useState("");
  const [isSsrLoading, setIsSsrLoading] = useState(false);
  const [ssrError, setSsrError] = useState("");
  const tabsRef = useRef(null);

  const departure = useMemo(
    () => parseCityLabel(flightData?.departure?.city),
    [flightData?.departure?.city]
  );
  const arrival = useMemo(
    () => parseCityLabel(flightData?.arrival?.city),
    [flightData?.arrival?.city]
  );

  const displayShortDate = formatDate(selectedDepartureDate, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
  const displayLongDate = formatFareHeaderDate(selectedDepartureDate);

  const airlineNames =
    flightData?.airlines?.map((airline) => airline?.name).filter(Boolean).join(", ") || "-";
  const airlineCodes =
    flightData?.airlines?.map((airline) => airline?.code).filter(Boolean).join(", ") || "-";
  const airlineLogo = flightData?.airlines?.[0]?.logo || "/images/Flight.png";
  const durationLabel = formatDuration(flightData?.duration);
  const totalFare = flightData?.fare?.totalFare || "-";
  const grossFare = flightData?.fare?.grossFare || totalFare;
  const taxAmount = flightData?.fare?.tax || "-";
  const totalFareAmount = parseCurrencyAmount(totalFare);
  const taxFareAmount = parseCurrencyAmount(taxAmount);
  const baseFare =
    totalFareAmount !== null && taxFareAmount !== null
      ? formatCurrencyAmount(Math.max(totalFareAmount - taxFareAmount, 0))
      : totalFare;
  const cabinClass = flightData?.fare?.cabinClass || "-";
  const stopsLabel = flightData?.stops?.type || "-";
  const layoverCity = flightData?.stops?.via || "";
  const showLayover = Number(flightData?.stops?.count || 0) > 0 && layoverCity;
  const details = flightData?.details || {};
  const detailDeparture = parseAirportDetail(details?.fromName);
  const detailArrival = parseAirportDetail(details?.toName);
  const connectionSegments = Array.isArray(details?.connections?.segments)
    ? details.connections.segments
    : [];
  const connectionLayovers = Array.isArray(details?.connections?.layovers)
    ? details.connections.layovers
    : Array.isArray(details?.connections)
      ? details.connections
      : [];
  const flightInfoSegments = useMemo(
    () => extractFlightInfoSegments(flightInfoData),
    [flightInfoData]
  );
  const flightInfoConnections = useMemo(
    () => extractFlightInfoConnections(flightInfoData),
    [flightInfoData]
  );
  const rawFlightInfoSegmentFlights = useMemo(
    () => extractRawFlightInfoSegmentFlights(flightInfoData),
    [flightInfoData]
  );
  const flightInfoLayovers = useMemo(
    () => extractFlightInfoLayovers(flightInfoData),
    [flightInfoData]
  );
  const flightInfoRoot = useMemo(
    () => extractFlightInfoRoot(flightInfoData),
    [flightInfoData]
  );
  const firstLegDuration = pickFirst(
    flightInfoRoot?.duration,
    flightInfoRoot?.Duration,
    flightData?.details?.duration,
    flightData?.details?.flightDuration
  );
  const getLegDuration = (index, segment, fallbackDuration) => {
    if (index === 0) {
      return displayValue(firstLegDuration || getSegmentDuration(segment) || fallbackDuration);
    }

    const previousConnection = connectionLayovers[index - 1];
    return displayValue(
      previousConnection?.Duration ||
        previousConnection?.duration ||
        getSegmentDuration(segment) ||
        fallbackDuration
    );
  };
  const formatSegmentDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date
      .toLocaleDateString("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "2-digit",
      })
      .toUpperCase();
  };
  const formatTimelineDate = (value) => {
    const formatted = formatSegmentDate(value);
    return formatted === "N/A" ? displayValue(value) : formatted;
  };
  const segmentDetails = useMemo(() => {
    if (flightInfoConnections.length) {
      return flightInfoConnections.map((connection, index) => {
        const duration = displayValue(
          connection?.flightDuration || connection?.Duration || connection?.duration
        );
        const departureDateTime = connection?.departure || connection?.Departure;
        const arrivalDateTime =
          connection?.arrival ||
          connection?.Arrival ||
          addDurationToDateTime(departureDateTime, duration);
        const departureAirport = compactAirportName(
          connection?.FromName ||
            connection?.fromName ||
            (index === 0 ? details?.fromName : "")
        );
        const arrivalAirport = compactAirportName(
          connection?.ToName ||
            connection?.toName ||
            connection?.ArrAirportName ||
            connection?.arrAirportName ||
            connection?.AirportName ||
            connection?.airportName
        );
        const departureDetail = parseAirportDetail(
          connection?.FromName || connection?.fromName
        );
        const arrivalDetail = parseAirportDetail(
          connection?.ToName ||
            connection?.toName ||
            connection?.ArrAirportName ||
            connection?.arrAirportName
        );
        const layover = connection?.layover || {};

        return {
          id: `flight-info-connection-${index}`,
          departureDate: formatTimelineDate(departureDateTime),
          departureTime: displayValue(formatTimeValue(departureDateTime)),
          departureCode: displayValue(
            connection?.From || connection?.from || (index === 0 ? departure.code : "")
          ),
          departureCity: displayValue(
            departureDetail.city !== "N/A"
              ? departureDetail.city
              : index === 0
                ? departure.city
                : departureAirport
          ),
          departureAirport: displayValue(departureAirport),
          departureTerminal: displayTerminal(
            connection?.departureTerminal ||
              connection?.DepartureTerminal ||
              connection?.terminal?.departure ||
              connection?.Terminal?.Departure
          ),
          arrivalDate: formatTimelineDate(arrivalDateTime),
          arrivalTime: displayValue(formatTimeValue(arrivalDateTime)),
          arrivalCode: displayValue(
            connection?.To ||
              connection?.to ||
              connection?.Airport ||
              connection?.airport ||
              (index === flightInfoConnections.length - 1 ? arrival.code : "")
          ),
          arrivalCity: displayValue(
            arrivalDetail.city !== "N/A"
              ? arrivalDetail.city
              : index === flightInfoConnections.length - 1
                ? arrival.city
                : arrivalAirport
          ),
          arrivalAirport: displayValue(arrivalAirport),
          arrivalTerminal: displayTerminal(
            connection?.arrivalTerminal ||
              connection?.ArrivalTerminal ||
              connection?.terminal?.arrival ||
              connection?.Terminal?.Arrival
          ),
          duration,
          stops: "Non Stop",
          layoverAirport: displayValue(
            compactAirportName(
              layover?.airportName ||
                layover?.AirportName ||
                connection?.ArrAirportName ||
                connection?.Airport
            )
          ),
          layoverDuration: displayValue(
            connection?.layoverDuration || layover?.duration || layover?.Duration
          ),
        };
      });
    }

    if (rawFlightInfoSegmentFlights.length) {
      return rawFlightInfoSegmentFlights.map((segment, index) => {
        const duration = displayValue(
          segment?.Duration || segment?.duration || segment?.FlightDuration
        );
        const departureDateTime =
          segment?.DepartureTime || segment?.departureTime || segment?.DepartureDateTime;
        const arrivalDateTime =
          segment?.ArrivalTime ||
          segment?.arrivalTime ||
          segment?.ArrivalDateTime ||
          addDurationToDateTime(departureDateTime, duration);
        const departureAirport = compactAirportName(
          segment?.DepAirportName || segment?.depAirportName
        );
        const arrivalAirport = compactAirportName(
          segment?.ArrAirportName || segment?.arrAirportName
        );
        const departureDetail = parseAirportDetail(
          segment?.DepAirportName || segment?.depAirportName
        );
        const arrivalDetail = parseAirportDetail(
          segment?.ArrAirportName || segment?.arrAirportName
        );
        const nextSegment = rawFlightInfoSegmentFlights[index + 1];
        const nextDepartureTime =
          nextSegment?.DepartureTime || nextSegment?.departureTime;
        const layoverGap =
          arrivalDateTime && nextDepartureTime
            ? new Date(nextDepartureTime).getTime() -
              new Date(arrivalDateTime).getTime()
            : null;
        const layoverMinutes =
          layoverGap !== null && Number.isFinite(layoverGap)
            ? Math.max(0, Math.round(layoverGap / 60000))
            : null;
        const layoverDuration =
          layoverMinutes === null
            ? "N/A"
            : `${String(Math.floor(layoverMinutes / 60)).padStart(2, "0")}h ${String(
                layoverMinutes % 60
              ).padStart(2, "0")}m`;

        return {
          id: `raw-flight-info-segment-${index}`,
          departureDate: formatTimelineDate(departureDateTime),
          departureTime: displayValue(formatTimeValue(departureDateTime)),
          departureCode: displayValue(
            segment?.DepartureCode ||
              segment?.departureCode ||
              (index === 0 ? departure.code : "")
          ),
          departureCity: displayValue(
            departureDetail.city !== "N/A"
              ? departureDetail.city
              : index === 0
                ? departure.city
                : departureAirport
          ),
          departureAirport: displayValue(departureAirport),
          departureTerminal: displayTerminal(
            segment?.DepartureTerminal || segment?.departureTerminal
          ),
          arrivalDate: formatTimelineDate(arrivalDateTime),
          arrivalTime: displayValue(formatTimeValue(arrivalDateTime)),
          arrivalCode: displayValue(
            segment?.ArrivalCode ||
              segment?.arrivalCode ||
              (index === rawFlightInfoSegmentFlights.length - 1 ? arrival.code : "")
          ),
          arrivalCity: displayValue(
            arrivalDetail.city !== "N/A"
              ? arrivalDetail.city
              : index === rawFlightInfoSegmentFlights.length - 1
                ? arrival.city
                : arrivalAirport
          ),
          arrivalAirport: displayValue(arrivalAirport),
          arrivalTerminal: displayTerminal(
            segment?.ArrivalTerminal || segment?.arrivalTerminal
          ),
          duration,
          stops: "Non Stop",
          layoverAirport: displayValue(arrivalAirport),
          layoverDuration,
        };
      });
    }

    if (flightInfoSegments.length) {
      return flightInfoSegments.map((segment, index) => {
        const layover = flightInfoLayovers[index] || connectionLayovers[index];
        const previousLayover = flightInfoLayovers[index - 1] || connectionLayovers[index - 1];
        const departureDateTime = getSegmentDateTime(segment, "departure");
        const arrivalDateTime = getSegmentDateTime(segment, "arrival");
        const segmentDuration = getLegDuration(
          index,
          segment,
          layover?.Duration || layover?.duration
        );
        const resolvedDepartureDateTime =
          departureDateTime ||
          (index > 0
            ? getConnectionDepartureDate(previousLayover)
            : details?.departureDateTime || flightData?.departure?.time);
        const computedArrivalDateTime = addDurationToDateTime(
          resolvedDepartureDateTime,
          segmentDuration
        );
        const resolvedArrivalDateTime =
          computedArrivalDateTime ||
          arrivalDateTime ||
          (index < flightInfoSegments.length - 1
            ? getConnectionArrivalDate(layover)
            : details?.arrivalDateTime || flightData?.arrival?.time);
        const departureAirportName = compactAirportName(
          getSegmentAirportName(segment, "departure") ||
            (index === 0 ? details?.fromName : connectionLayovers[index - 1]?.ArrAirportName)
        );
        const arrivalAirportName = compactAirportName(
          getSegmentAirportName(segment, "arrival") ||
            (index === flightInfoSegments.length - 1
              ? details?.toName
              : connectionLayovers[index]?.ArrAirportName)
        );

        return {
          id: `flight-info-segment-${index}`,
          departureDate: formatTimelineDate(resolvedDepartureDateTime),
          departureTime: displayValue(formatTimeValue(resolvedDepartureDateTime)),
          departureCode: displayValue(getSegmentAirportCode(segment, "departure")),
          departureCity: displayValue(
            getSegmentCity(
              segment,
              "departure",
              index === 0 ? departure.city : departureAirportName
            )
          ),
          departureAirport: displayValue(departureAirportName),
          departureTerminal: displayTerminal(getSegmentTerminal(segment, "departure")),
          arrivalDate: formatTimelineDate(resolvedArrivalDateTime),
          arrivalTime: displayValue(formatTimeValue(resolvedArrivalDateTime)),
          arrivalCode: displayValue(getSegmentAirportCode(segment, "arrival")),
          arrivalCity: displayValue(
            getSegmentCity(
              segment,
              "arrival",
              index === flightInfoSegments.length - 1 ? arrival.city : arrivalAirportName
            )
          ),
          arrivalAirport: displayValue(arrivalAirportName),
          arrivalTerminal: displayTerminal(getSegmentTerminal(segment, "arrival")),
          duration: segmentDuration,
          stops: "Non Stop",
          layoverAirport: displayValue(
            layover?.ArrAirportName || layover?.AirportName || layover?.Airport
          ),
          layoverDuration: displayValue(layover?.Duration || layover?.duration),
        };
      });
    }

    if (!connectionSegments.length && connectionLayovers.length) {
      const routePoints = [
        {
          code: displayValue(departure.code),
          city: displayValue(departure.city),
          airport: compactAirportName(details?.fromName),
          terminal: displayTerminal(details?.departureTerminal),
          date: details?.departureDateTime || details?.dateLabel || displayShortDate,
          time: flightData?.departure?.time,
        },
        ...connectionLayovers.map((connection) => ({
          code: getConnectionCode(connection),
          city: getConnectionName(connection),
          airport: getConnectionName(connection),
          terminal: getConnectionTerminal(connection),
          date: getConnectionDate(connection),
          arrivalDate: getConnectionArrivalDate(connection),
          departureDate: getConnectionDepartureDate(connection),
          arrivalTime: getConnectionArrivalDate(connection),
          departureTime: getConnectionDepartureDate(connection),
        })),
        {
          code: displayValue(arrival.code),
          city: displayValue(arrival.city),
          airport: compactAirportName(details?.toName),
          terminal: displayTerminal(details?.arrivalTerminal),
          date: details?.arrivalDateTime || details?.dateLabel || displayShortDate,
          time: flightData?.arrival?.time,
        },
      ];

      return routePoints.slice(0, -1).map((point, index) => {
        const nextPoint = routePoints[index + 1];
        const layover = connectionLayovers[index];
        const previousLayover = connectionLayovers[index - 1];
        const departureDate = point.departureDate || point.date;
        const legDuration = getLegDuration(
          index,
          null,
          layover?.Duration ||
            layover?.duration ||
            (index === routePoints.length - 2
              ? previousLayover?.Duration || previousLayover?.duration
              : "")
        );
        const computedArrivalDate = addDurationToDateTime(
          point.departureTime || point.time || departureDate,
          legDuration
        );
        const isComputedTimeOnly =
          typeof computedArrivalDate === "string" &&
          /^\d{2}:\d{2}$/.test(computedArrivalDate);
        const arrivalDate =
          computedArrivalDate && !isComputedTimeOnly
            ? computedArrivalDate
            : nextPoint.arrivalDate || nextPoint.date;

        return {
          id: `connection-leg-${index}`,
          departureDate: formatTimelineDate(departureDate),
          departureTime: displayValue(
            formatTimeValue(point.departureTime || point.time)
          ),
          departureCode: displayValue(point.code),
          departureCity: displayValue(point.city),
          departureAirport: displayValue(point.airport),
          departureTerminal: point.terminal,
          arrivalDate: formatTimelineDate(arrivalDate),
          arrivalTime: displayValue(
            formatTimeValue(computedArrivalDate || nextPoint.arrivalTime || nextPoint.time)
          ),
          arrivalCode: displayValue(nextPoint.code),
          arrivalCity: displayValue(nextPoint.city),
          arrivalAirport: displayValue(nextPoint.airport),
          arrivalTerminal: nextPoint.terminal,
          duration: displayValue(legDuration),
          stops: "Non Stop",
          layoverAirport: getConnectionName(layover),
          layoverDuration: displayValue(layover?.Duration || layover?.duration),
        };
      });
    }

    if (!connectionSegments.length) {
      return [
        {
          id: "segment-0",
          departureDate: formatTimelineDate(
            details?.departureDateTime || details?.dateLabel || displayShortDate
          ),
          departureTime: displayValue(flightData?.departure?.time),
          departureCode: displayValue(departure.code),
          departureCity: displayValue(departure.city),
          departureAirport: compactAirportName(details?.fromName),
          departureTerminal: displayTerminal(details?.departureTerminal),
          arrivalDate: formatTimelineDate(
            details?.arrivalDateTime || details?.dateLabel || displayShortDate
          ),
          arrivalTime: displayValue(flightData?.arrival?.time),
          arrivalCode: displayValue(arrival.code),
          arrivalCity: displayValue(arrival.city),
          arrivalAirport: compactAirportName(details?.toName),
          arrivalTerminal: displayTerminal(details?.arrivalTerminal),
          duration: displayValue(durationLabel),
          stops: displayValue(stopsLabel),
        },
      ];
    }

    return connectionSegments.map((segment, index) => {
      const layover = connectionLayovers[index];
      const previousLayover = connectionLayovers[index - 1];
      const segmentDepartureDate =
        segment?.departure ||
        (index > 0
          ? getConnectionDepartureDate(previousLayover)
          : details?.departureDateTime || flightData?.departure?.time);
      const segmentDuration = displayValue(
        getLegDuration(index, segment, layover?.Duration || layover?.duration || durationLabel)
      );
      const segmentArrivalDate =
        addDurationToDateTime(segmentDepartureDate, segmentDuration) ||
        segment?.arrival ||
        (index < connectionSegments.length - 1
          ? getConnectionArrivalDate(layover)
          : details?.arrivalDateTime || flightData?.arrival?.time);
      const departureAirportName =
        index === 0
          ? compactAirportName(details?.fromName)
          : compactAirportName(previousLayover?.ArrAirportName);
      const arrivalAirportName =
        index === connectionSegments.length - 1
          ? compactAirportName(details?.toName)
          : compactAirportName(layover?.ArrAirportName);

      return {
        id: `segment-${index}`,
        departureDate: formatSegmentDate(segmentDepartureDate),
        departureTime: displayValue(formatTimeValue(segmentDepartureDate)),
        departureCode: displayValue(segment?.from || departure.code),
        departureCity:
          index === 0 ? displayValue(departure.city) : compactAirportName(previousLayover?.ArrAirportName),
        departureAirport: displayValue(departureAirportName),
        departureTerminal: displayTerminal(segment?.terminal?.departure),
        arrivalDate: formatSegmentDate(segmentArrivalDate),
        arrivalTime: displayValue(formatTimeValue(segmentArrivalDate)),
        arrivalCode: displayValue(segment?.to || arrival.code),
        arrivalCity:
          index === connectionSegments.length - 1
            ? displayValue(arrival.city)
            : compactAirportName(layover?.ArrAirportName),
        arrivalAirport: displayValue(arrivalAirportName),
        arrivalTerminal: displayTerminal(segment?.terminal?.arrival),
        duration: segmentDuration,
        stops:
          Number(segment?.stops) === 0 ? "Non Stop" : `${displayValue(segment?.stops)} Stop`,
        layoverAirport:
          displayValue(layover?.ArrAirportName || layover?.Airport),
        layoverDuration: displayValue(layover?.Duration),
      };
    });
  }, [
    connectionLayovers,
    connectionSegments,
    details?.arrivalTerminal,
    details?.dateLabel,
    details?.departureTerminal,
    details?.fromName,
    details?.toName,
    flightInfoConnections,
    flightInfoLayovers,
    flightInfoSegments,
    rawFlightInfoSegmentFlights,
    detailArrival.airport,
    detailDeparture.airport,
    arrival.code,
    arrival.city,
    departure.code,
    departure.city,
    displayShortDate,
    durationLabel,
    flightData?.arrival?.time,
    flightData?.departure?.time,
    stopsLabel,
  ]);
  const totalTravellers = Math.max(
    Number(travellerSummary?.adult || 0) +
      Number(travellerSummary?.child || 0) +
      Number(travellerSummary?.infant || 0),
    1
  );
  const travellerBreakdown = [
    Number(travellerSummary?.adult || 0) > 0
      ? `${Number(travellerSummary?.adult)} Adult${Number(travellerSummary?.adult) > 1 ? "s" : ""}`
      : null,
    Number(travellerSummary?.child || 0) > 0
      ? `${Number(travellerSummary?.child)} Child${Number(travellerSummary?.child) > 1 ? "ren" : ""}`
      : null,
    Number(travellerSummary?.infant || 0) > 0
      ? `${Number(travellerSummary?.infant)} Infant${Number(travellerSummary?.infant) > 1 ? "s" : ""}`
      : null,
  ]
    .filter(Boolean)
    .join(", ");
  const fareRuleRows = useMemo(
    () => extractFareRuleRows(fareRulesData),
    [fareRulesData]
  );
  const cancellationFareRuleRows = useMemo(
    () => fareRuleRows.filter(isCancellationFareRule),
    [fareRuleRows]
  );
  const fareRulesMessage = useMemo(
    () => getFareRulesMessage(fareRulesData),
    [fareRulesData]
  );
  const fareRulesPlatformCharges = useMemo(
    () => getPlatformCharges(fareRulesData),
    [fareRulesData]
  );
  const baggageFallbackRow = useMemo(
    () => ({
      id: "baggage-fallback",
      airlineName: airlineNames,
      airlineCodes,
      airlineLogo,
      checkin: "-",
      cabin: "-",
    }),
    [airlineCodes, airlineLogo, airlineNames]
  );
  const baggageRows = useMemo(
    () => extractBaggageRows(ssrData, baggageFallbackRow),
    [baggageFallbackRow, ssrData]
  );
  const buildSsrPayload = () => {
    const priceRequest = flightData?.booking?.priceRequest || {};
    const trip = priceRequest?.Trips?.[0] || {};
    const displayedFareAmount = parseCurrencyAmount(flightData?.fare?.totalFare);

    return {
      search_key: priceRequest?.search_key || flightData?.booking?.searchKey,
      PaidSSR: false,
      ClientID:"APITRAGET",
      Source:  "LV",
      FareType: priceRequest?.FareType || "N",
      domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337",
      Trips: [
        {
          Amount: displayedFareAmount ?? trip?.Amount,
          Index: trip?.Index,
          OrderID: trip?.OrderID || 1,
          TUI: trip?.TUI || flightData?.booking?.tui,
        },
      ],
    };
  };
  const buildFareRulesPayload = () => {
    const priceRequest = flightData?.booking?.priceRequest || {};
    const trip = priceRequest?.Trips?.[0] || {};
    const displayedFareAmount = parseCurrencyAmount(flightData?.fare?.totalFare);

    return {
      search_key: priceRequest?.search_key || flightData?.booking?.searchKey,
      ClientID: "APITRAGET",
      Source: priceRequest?.Source || flightData?.booking?.source || "SF",
      Trips: [
        {
          Amount: displayedFareAmount ?? trip?.Amount,
          Index: trip?.Index,
          OrderID: trip?.OrderID,
          TUI: trip?.TUI || flightData?.booking?.tui,
        },
      ],
    };
  };

  useEffect(() => {
    if (!tabsRef.current) return;

    const tabs = tabsRef.current;
    const activeTabEl = tabs.querySelector(`.${styles.active}`);

    if (!activeTabEl) return;

    tabs.style.setProperty("--indicator-width", `${activeTabEl.offsetWidth}px`);
    tabs.style.setProperty("--indicator-left", `${activeTabEl.offsetLeft}px`);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "baggage") return;

    const payload = buildSsrPayload();
    const trip = payload.Trips?.[0] || {};
    const requestKey = [
      payload.search_key,
      trip.Amount,
      trip.Index,
      trip.OrderID,
      trip.TUI,
    ].join("|");

    if (ssrRequestKey === requestKey && (ssrData || isSsrLoading)) return;

    const hasRequiredPayload =
      payload.search_key &&
      trip.TUI &&
      trip.Amount !== undefined &&
      trip.Amount !== null &&
      trip.Index !== undefined &&
      trip.Index !== null &&
      trip.OrderID !== undefined &&
      trip.OrderID !== null;

    if (!hasRequiredPayload) {
      setSsrData(null);
      setSsrRequestKey("");
      setSsrError("Baggage details are not available for this flight.");
      return;
    }

    let isMounted = true;
    setIsSsrLoading(true);
    setSsrError("");
    setSsrData(null);
    setSsrRequestKey(requestKey);

    getFlightSsr(payload)
      .then((response) => {
        if (!isMounted) return;
        setSsrData(response);
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error("Failed to fetch SSR baggage rules", error);
        setSsrError("Unable to load baggage rules.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsSsrLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, flightData]);

  useEffect(() => {
    if (activeTab !== "cancellation") return;

    const payload = buildFareRulesPayload();
    const trip = payload.Trips?.[0] || {};
    const requestKey = [
      payload.search_key,
      trip.Amount,
      trip.Index,
      trip.OrderID,
      trip.TUI,
    ].join("|");

    if (fareRulesRequestKey === requestKey && (fareRulesData || isFareRulesLoading)) return;

    const hasRequiredPayload =
      payload.search_key &&
      trip.Amount !== undefined &&
      trip.Amount !== null &&
      trip.Index !== undefined &&
      trip.Index !== null &&
      trip.TUI;

    if (!hasRequiredPayload) {
      setFareRulesData(null);
      setFareRulesRequestKey("");
      setFareRulesError("Cancellation rules are not available for this flight.");
      return;
    }

    let isMounted = true;
    setIsFareRulesLoading(true);
    setFareRulesError("");
    setFareRulesData(null);
    setFareRulesRequestKey(requestKey);

    getFlightFareRules(payload)
      .then((response) => {
        if (!isMounted) return;
        setFareRulesData(response);
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error("Failed to fetch fare rules", error);
        setFareRulesError("Unable to load cancellation rules.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsFareRulesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, flightData]);

  return (
    <div className={styles.expandableSection}>
      <div className={styles.expandableContainer}>
        <div className={styles.tabContainer} ref={tabsRef}>
          {[
            { key: "flight", label: "Flight Information" },
            { key: "fare", label: "Fare Details" },
            { key: "baggage", label: "Baggage Rules" },
            { key: "cancellation", label: "Cancellation Rules" },
          ].map((tab) => (
            <div
              key={tab.key}
              className={`${styles.tabItem} ${activeTab === tab.key ? styles.active : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {activeTab === "flight" && (
          <div className={`${styles.tabContentFlightInformation} ${styles.fadeIn}`}>
            <div className={styles.aboutFlightContainer}>
              <div className={styles.aboutFlightContainerLeft}>
                <img className={styles.flightIcon} src={airlineLogo} alt={airlineNames} />
                <div className={styles.flightInfoTextContainer}>
                  <div className={styles.flightInfoTextTitle}>
                    {airlineNames} ({airlineCodes})
                  </div>
                  <div className={styles.flightInfoTextChips}>{cabinClass}</div>
                </div>
              </div>
              <div className={styles.aboutFlightContainerRight}>
                <span className={styles.subInfoText}>{displayShortDate}</span>
                <div className={styles.dot}></div>
                <span className={styles.subInfoText}>{stopsLabel}</span>
                <div className={styles.dot}></div>
                <span className={styles.subInfoText}>{durationLabel}</span>
                <div className={styles.dot}></div>
                <span className={styles.subInfoText}>{cabinClass}</span>
              </div>
            </div>

            {isFlightInfoLoading && (
              <div className={styles.changeOfPlanes}>Loading flight details...</div>
            )}

            {segmentDetails.map((segment, index) => (
              <React.Fragment key={segment.id}>
                <div className={styles.timelineContainer}>
                  <div className={styles.side}>
                    <div className={styles.date}>{segment.departureDate}</div>
                    <div className={styles.time}>{segment.departureTime}</div>
                    <div className={styles.airport}>
                      {segment.departureCode} - {segment.departureCity}
                    </div>
                    <div className={styles.terminal}>{segment.departureTerminal}</div>
                    <div className={styles.city}>{segment.departureAirport}</div>
                  </div>

                  <div className={styles.center}>
                    <div className={styles.flightAnimation}>
                      <div className={styles.flightDotedcontainer}>
                        <div className={styles.bigDot}></div>
                        <div className={styles.dashBorder}></div>
                      </div>
                      <img className={styles.flightSvg} src="/icons/flightIconBlue.svg" alt="" />
                      <div className={styles.flightDotedcontainer}>
                        <div className={styles.dashBorder}></div>
                        <div className={styles.bigDot}></div>
                      </div>
                    </div>
                    <div className={styles.priceContainer}>
                      {segment.duration && (
                        <>
                          <span className={styles.duration}>{segment.duration}</span>
                          <div className={styles.dot}></div>
                        </>
                      )}
                      <span className={styles.nonStop}>{segment.stops}</span>
                    </div>
                  </div>

                  <div className={styles.sideRight}>
                    <div className={styles.date}>{segment.arrivalDate}</div>
                    <div className={styles.time}>{segment.arrivalTime}</div>
                    <div className={styles.airport}>
                      {segment.arrivalCode} - {segment.arrivalCity}
                    </div>
                    <div className={styles.terminal}>{segment.arrivalTerminal}</div>
                    <div className={styles.city}>{segment.arrivalAirport}</div>
                  </div>
                </div>

                {index < segmentDetails.length - 1 && (
                  <div className={styles.changeOfPlanes}>
                    Change of planes:
                    <span className={styles.changeOfPlanesTiem}> {segment.layoverDuration} </span>
                    Layover in {displayValue(segment.layoverAirport)}
                  </div>
                )}
              </React.Fragment>
            ))}

            {showLayover && !segmentDetails.length && (
              <div className={styles.changeOfPlanes}>
                Change of planes:
                <span className={styles.changeOfPlanesTiem}>
                  {" "}
                  {flightData?.stops?.count}{" "}
                </span>
                stop via {layoverCity}
              </div>
            )}
          </div>
        )}

        {activeTab === "fare" && (
          <div className={`${styles.tabContentFareDetails} ${styles.fadeIn}`}>
            <div className={styles.header}>
              {departure.city} <img src="/icons/whitePlane.svg" alt="" /> {arrival.city},
              <span> {displayLongDate}</span>
            </div>
            <div className={styles.body}>
              <div className={styles.row}>
                <span className={styles.label}>
                  {travellerBreakdown || `${totalTravellers} Traveller${totalTravellers > 1 ? "s" : ""}`}
                </span>
                <span className={styles.amount}>{grossFare}</span>
              </div>

              <div className={styles.row}>
                <span className={styles.label}>Total (Base Fare)</span>
                <span className={styles.bold}>{baseFare}</span>
              </div>

              <div className={styles.row}>
                <span className={styles.label}>Total Tax</span>
                <span className={styles.bold}>{taxAmount}</span>
              </div>

              <div className={styles.row}>
                <span className={styles.label}>Total (Fee &amp; Surcharge)</span>
                <span className={styles.bold}>{grossFare}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "baggage" && (
          <div className={`${styles.tabContentBaggageRules} ${styles.fadeIn}`}>
            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <span className={styles.airlineCellHead}>AIRLINE</span>
                <span>CHECK-IN BAGGAGE</span>
                <span>CABIN BAGGAGE</span>
              </div>

              {isSsrLoading && (
                <div className={styles.tableRow}>
                  <div className={styles.airlineCell}>
                    <img className={styles.airlineIcon} src={airlineLogo} alt={airlineNames} />
                    <div className={styles.airlineText}>
                      <span className={styles.airlineName}>{airlineNames.toUpperCase()}</span>
                      <span className={styles.flightNo}>{airlineCodes}</span>
                    </div>
                  </div>

                  <div className={styles.baggage}>Loading...</div>
                  <div className={styles.baggage}>Please wait</div>
                </div>
              )}

              {!isSsrLoading && baggageRows.length === 0 && (
                <div className={styles.tableRow}>
                  <div className={styles.airlineCell}>
                    <img className={styles.airlineIcon} src={airlineLogo} alt={airlineNames} />
                    <div className={styles.airlineText}>
                      <span className={styles.airlineName}>{airlineNames.toUpperCase()}</span>
                      <span className={styles.flightNo}>{airlineCodes}</span>
                    </div>
                  </div>

                  <div className={styles.baggage}>-</div>
                  <div className={styles.baggage}>-</div>
                </div>
              )}

              {!isSsrLoading &&
                baggageRows.map((row) => (
                  <div className={styles.tableRow} key={row.id}>
                    <div className={styles.airlineCell}>
                      <img
                        className={styles.airlineIcon}
                        src={row.airlineLogo}
                        alt={row.airlineName}
                      />
                      <div className={styles.airlineText}>
                        <span className={styles.airlineName}>
                          {row.airlineName.toUpperCase()}
                        </span>
                        <span className={styles.flightNo}>
                          {row.route ? `${row.route} • ${row.airlineCodes}` : row.airlineCodes}
                        </span>
                      </div>
                    </div>

                    <div className={styles.baggage}>{row.checkin}</div>
                    <div className={styles.baggage}>{row.cabin}</div>
                  </div>
                ))}
            </div>

            {(ssrError || (!isSsrLoading && baggageRows.length === 0)) && (
              <div className={styles.infoBox}>
                <ul>
                  <li>
                    {ssrError ||
                      "Baggage details are not available in the current SSR response for this flight."}
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === "cancellation" && (
          <div className={`${styles.tabContentCancellationRules} ${styles.fadeIn}`}>
            <div className={styles.route}>
              {departure.code || departure.city} - {arrival.code || arrival.city}
            </div>

            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <span>TIME FRAME</span>
                <span>AIRLINE FEE + TARGET TOURS FEE</span>
              </div>

              {isFareRulesLoading && (
                <div className={styles.tableRows}>
                  <span className={styles.timeFrame}>Loading cancellation rules...</span>
                  <span className={styles.textRight}>PLEASE WAIT</span>
                </div>
              )}

              {!isFareRulesLoading && fareRulesError && (
                <div className={styles.tableRows}>
                  <span className={styles.timeFrame}>{fareRulesError}</span>
                  <span className={styles.textRight}>NOT AVAILABLE</span>
                </div>
              )}

              {!isFareRulesLoading &&
                !fareRulesError &&
                cancellationFareRuleRows.length === 0 && (
                <div className={styles.tableRows}>
                  <span className={styles.timeFrame}>
                    {fareRulesMessage || "Cancellation rules"}
                  </span>
                  <span className={styles.textRight}>
                    {fareRulesMessage ? "PLEASE SEARCH AGAIN" : "NOT AVAILABLE"}
                  </span>
                </div>
              )}

              {!isFareRulesLoading &&
                !fareRulesError &&
                cancellationFareRuleRows.map((rule, index) => (
                  <div className={styles.tableRows} key={rule?.id || index}>
                    <span className={styles.timeFrame}>{getFareRuleTimeFrame(rule)}</span>
                    <span className={styles.textRight}>
                      {getFareRuleFee(rule, fareRulesPlatformCharges)}
                    </span>
                  </div>
                ))}
            </div>

            <div className={styles.note}>*From The Date Of Departure</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpandableTabs;

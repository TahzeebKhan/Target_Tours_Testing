"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./RoundTripExpendable.module.css";
import FlightTimeline from "./FlightTimeline";
import FlightFare from "../flightFare/FlightFare";
import BaggageRules from "../baggageRules/BaggageRules";
import CancellationRules from "../cancellationRules/CancellationRules";
import { resolveAirlineLogo } from "@/features/flights/utils/airlineLogos";
import {
  getFlightBaggageInfo,
  getFlightFareRules,
} from "@/features/flights/services/flightBooking";

const parseAirportLabel = (value = "") => {
  const text = String(value || "").trim();
  const match = text.match(/^(.*)\(([^)]+)\)$/);
  if (!match) return { city: text, code: "" };
  return {
    city: match[1].trim(),
    code: match[2].trim(),
  };
};

const formatTerminalLabel = (value = "") => {
  const text = String(value || "").trim();
  if (!text) return "";
  return /^terminal\b/i.test(text) ? text : `Terminal ${text}`;
};

const toArray = (value) => (Array.isArray(value) ? value : []);

const parseCurrencyAmount = (value) => {
  const amount = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) ? amount : null;
};

const unwrapFlightInfoPayload = (flightInfoData) =>
  flightInfoData?.data?.raw ||
  flightInfoData?.raw ||
  flightInfoData?.data ||
  flightInfoData ||
  {};

const formatDateLabel = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "").toUpperCase();

  return date
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
    })
    .replace(",", "")
    .toUpperCase();
};

const formatTime = (value) => {
  if (!value) return "";
  const match = String(value).match(/(\d{2}:\d{2})/);
  if (match) return match[1];

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const parseDurationParts = (value = "") => {
  const text = String(value || "");
  const match = text.match(/(\d+)\s*h(?:ours?)?\s*(\d+)?\s*m?/i);
  if (!match) return { hours: "", minutes: "" };

  return {
    hours: String(Number(match[1] || 0)).padStart(2, "0"),
    minutes: String(Number(match[2] || 0)).padStart(2, "0"),
  };
};

const formatDurationFromMinutes = (minutes) => {
  if (minutes === null || minutes === undefined || minutes === "") {
    return { hours: "", minutes: "" };
  }
  const value = Number(minutes);
  if (!Number.isFinite(value)) return { hours: "", minutes: "" };
  return {
    hours: String(Math.floor(value / 60)).padStart(2, "0"),
    minutes: String(value % 60).padStart(2, "0"),
  };
};

const parseDurationToMinutes = (value) => {
  if (typeof value === "number") return value;
  const match = String(value || "").match(/(\d+)\s*h(?:ours?)?\s*(\d+)?\s*m?/i);
  if (!match) return null;
  return Number(match[1] || 0) * 60 + Number(match[2] || 0);
};

const getAirportCodeFromCity = (value = "") =>
  parseAirportLabel(value).code || String(value || "").trim().toUpperCase();

const getFlightInfoItems = (flightInfoData) => {
  const payload = unwrapFlightInfoPayload(flightInfoData);
  return toArray(payload?.flight)
    .concat(toArray(payload?.flights))
    .concat(toArray(payload?.data?.flight))
    .concat(toArray(payload?.data?.flights));
};

const getInfoOriginCode = (flight = {}) =>
  String(
    flight?.origin ||
      flight?.Origin ||
      flight?.From ||
      flight?.from ||
      flight?.Airport ||
      ""
  )
    .trim()
    .toUpperCase();

const getInfoDestinationCode = (flight = {}) =>
  String(
    flight?.destination ||
      flight?.To ||
      flight?.to ||
      flight?.ArrAirport ||
      flight?.Airport ||
      flight?.arrivalAirport ||
      ""
  )
    .trim()
    .toUpperCase();

const parseAirportName = (value = "") => {
  const [name = "", city = ""] = String(value || "").split("|");
  return {
    name: name.trim(),
    city: city.trim(),
  };
};

const normalizeConnections = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value?.segments)) return value.segments;
  if (Array.isArray(value?.Connections)) return value.Connections;
  if (Array.isArray(value?.connections)) return value.connections;
  return Object.values(value).filter(
    (item) => item && typeof item === "object" && !Array.isArray(item)
  );
};

const getConnectionEndpointCode = (connection = {}, type) => {
  const endpoint = type === "from"
    ? connection?.From || connection?.from || connection?.origin
    : connection?.To || connection?.to || connection?.destination;

  if (endpoint && typeof endpoint === "object") {
    return String(
      endpoint?.airportCode ||
        endpoint?.airport_code ||
        endpoint?.code ||
        endpoint?.iata_code ||
        ""
    )
      .trim()
      .toUpperCase();
  }

  return String(endpoint || "").trim().toUpperCase();
};

const hasConnectionRouteEndpoints = (connection = {}) => {
  const from = getConnectionEndpointCode(connection, "from");
  const to = getConnectionEndpointCode(connection, "to");
  return Boolean(from && to && from !== to);
};

const getSegmentList = (flight = {}) => {
  const connections = toArray(flight?.Connections || flight?.connections).filter(
    hasConnectionRouteEndpoints
  );
  if (!connections.length) return [flight];

  return connections.map((connection) => ({
    ...flight,
    ...connection,
    airline: connection?.airline || flight?.airline,
    airlineName: connection?.airlineName || flight?.airlineName,
    AirCraft: connection?.AirCraft || flight?.AirCraft,
    aircraft: connection?.aircraft || flight?.aircraft,
    layover: connection?.layover || flight?.layover,
    stops: connection?.stops ?? connection?.Stops ?? 0,
  }));
};

const getLegSegments = (items, legOrigin) =>
  items
    .filter((item) => {
      const segments = getSegmentList(item);
      return (
        getInfoOriginCode(item) === legOrigin ||
        getInfoOriginCode(segments[0]) === legOrigin
      );
    })
    .flatMap(getSegmentList);

const toApiTimelineFlight = (flight = {}) => {
  const airlineName =
    flight?.airline || flight?.airlineName || flight?.MAC || flight?.VAC || "N/A";
  const airlineCode = flight?.MAC || flight?.VAC || flight?.airlineCode || "";
  const flightNo = flight?.flightNo || flight?.FlightNo || "";
  const normalizedAirlineCode =
    String(airlineCode).trim().split(/\s+/)[0] ||
    String(flightNo).trim().match(/^([A-Za-z0-9]{2,3})[-\s]+/)?.[1] ||
    "";
  const normalizedFlightNo =
    String(flightNo).trim().match(/(\d{1,4})(?:\s+\1)?$/)?.[1] ||
    String(flightNo).trim();
  const departureCode = getInfoOriginCode(flight);
  const arrivalCode = getInfoDestinationCode(flight);
  const duration = parseDurationParts(
    flight?.duration || flight?.Duration || flight?.flightDuration
  );
  const departureAirport = parseAirportName(
    flight?.FromName || flight?.fromName || flight?.DepAirportName || flight?.AirportName
  );
  const arrivalAirport = parseAirportName(
    flight?.ToName || flight?.toName || flight?.ArrAirportName || flight?.AirportName
  );
  const layover = flight?.layover || {};
  const layoverName = parseAirportName(
    layover?.airportName || layover?.AirportName || flight?.ArrAirportName
  );

  return {
    airline: {
      name: airlineName,
      code: `${normalizedAirlineCode}${normalizedFlightNo ? ` ${normalizedFlightNo}` : ""}`.trim(),
      logo: resolveAirlineLogo({
        name: airlineName,
        code: normalizedAirlineCode || normalizedFlightNo,
      }),
    },
    aircraft: flight?.AirCraft || flight?.aircraft || "",
    departure: {
      date: formatDateLabel(flight?.departure || flight?.departureTime),
      time: formatTime(flight?.departure || flight?.departureTime),
      airport: departureCode,
      terminal: formatTerminalLabel(
        flight?.departureTerminal || flight?.terminal?.departure
      ),
      city: departureAirport.name || departureAirport.city,
    },
    arrival: {
      date: formatDateLabel(flight?.arrival || flight?.arrivalTime),
      time: formatTime(flight?.arrival || flight?.arrivalTime),
      airport: arrivalCode,
      terminal: formatTerminalLabel(
        flight?.arrivalTerminal || flight?.terminal?.arrival
      ),
      city: arrivalAirport.name || arrivalAirport.city,
    },
    duration,
    stops: Number(flight?.stops || 0) > 0 ? `${flight.stops} Stop` : "Non-Stop",
    layoverDuration:
      flight?.layoverDuration || layover?.duration || layover?.Duration || "",
    layoverAirport: layoverName.city || layoverName.name || flight?.To || arrivalCode,
  };
};

const splitFlightInfoByLeg = (flightInfoData, flightData) => {
  const items = getFlightInfoItems(flightInfoData);
  const departOrigin = getAirportCodeFromCity(flightData?.depart?.flight?.departure?.city);
  const returnOrigin = getAirportCodeFromCity(flightData?.return?.flight?.departure?.city);

  if (!items.length) return { depart: [], return: [] };

  return {
    depart: getLegSegments(items, departOrigin).map(toApiTimelineFlight),
    return: getLegSegments(items, returnOrigin).map(toApiTimelineFlight),
  };
};

const toTimelineFlight = (leg = {}, fallbackAirline = {}) => {
  const departure = parseAirportLabel(leg?.flight?.departure?.city);
  const arrival = parseAirportLabel(leg?.flight?.arrival?.city);

  return {
    airline: {
      name: fallbackAirline?.name || "N/A",
      code: fallbackAirline?.code || "N/A",
      logo: fallbackAirline?.logo || "/images/dummyFlightlogo.png",
    },
    aircraft: leg?.flight?.details?.aircraft || leg?.flight?.details?.aircraftName || "",
    departure: {
      date: leg?.date || "",
      time: leg?.flight?.departure?.time || "",
      airport: `${departure.code || ""}${departure.city ? ` - ${departure.city}` : ""}`.trim(),
      terminal: formatTerminalLabel(leg?.flight?.details?.departureTerminal),
      city: leg?.flight?.details?.fromName || departure.city,
    },
    arrival: {
      date: leg?.date || "",
      time: leg?.flight?.arrival?.time || "",
      airport: `${arrival.code || ""}${arrival.city ? ` - ${arrival.city}` : ""}`.trim(),
      terminal: formatTerminalLabel(leg?.flight?.details?.arrivalTerminal),
      city: leg?.flight?.details?.toName || arrival.city,
    },
    duration: {
      hours: leg?.flight?.duration?.hours ?? "",
      minutes: leg?.flight?.duration?.minutes ?? "",
    },
    stops: leg?.flight?.stops?.type || "Non-Stop",
  };
};

const getSegmentEndpoint = (segment = {}, type) => {
  const isDeparture = type === "departure";
  return isDeparture
    ? segment?.departure || segment?.from || segment?.origin || {}
    : segment?.arrival || segment?.to || segment?.destination || {};
};

const getSegmentCode = (segment = {}, type) => {
  const endpoint = getSegmentEndpoint(segment, type);
  return String(
    endpoint?.airportCode ||
      endpoint?.airport_code ||
      endpoint?.code ||
      endpoint?.iata_code ||
      ""
  )
    .trim()
    .toUpperCase();
};

const getSegmentCity = (segment = {}, type) => {
  const endpoint = getSegmentEndpoint(segment, type);
  return String(endpoint?.city || endpoint?.airport_city || endpoint?.name || "")
    .trim()
    .toUpperCase();
};

const getSegmentDateTime = (segment = {}, type) => {
  const endpoint = getSegmentEndpoint(segment, type);
  return (
    endpoint?.date ||
    endpoint?.dateTime ||
    endpoint?.time ||
    (type === "departure"
      ? segment?.departure_time || segment?.departure
      : segment?.arrival_time || segment?.arrival) ||
    ""
  );
};

const getTimelineSegmentsFromLeg = (leg = {}, fallbackAirline = {}) => {
  const segments = toArray(leg?.flight?.details?.segments);
  if (segments.length <= 1) return [];

  return segments.map((segment, index) => {
    const nextSegment = segments[index + 1];
    const departureCode = getSegmentCode(segment, "departure");
    const arrivalCode = getSegmentCode(segment, "arrival");
    const departureCity = getSegmentCity(segment, "departure");
    const arrivalCity = getSegmentCity(segment, "arrival");
    const departureDateTime = getSegmentDateTime(segment, "departure");
    const arrivalDateTime = getSegmentDateTime(segment, "arrival");
    const nextDepartureDateTime = nextSegment
      ? getSegmentDateTime(nextSegment, "departure")
      : "";
    const segmentDurationMinutes =
      parseDurationToMinutes(
        segment?.duration || segment?.durationMinutes || segment?.duration_minutes
      ) ||
      (departureDateTime && arrivalDateTime
        ? Math.round((new Date(arrivalDateTime) - new Date(departureDateTime)) / 60000)
        : null);
    const layoverMinutes =
      nextDepartureDateTime && arrivalDateTime
        ? Math.round((new Date(nextDepartureDateTime) - new Date(arrivalDateTime)) / 60000)
        : null;
    const airlineName =
      segment?.airline?.name ||
      segment?.carrier?.name ||
      segment?.marketing_airline?.name ||
      fallbackAirline?.name ||
      "N/A";
    const airlineCode =
      segment?.flight_number ||
      segment?.flightNo ||
      segment?.flight_no ||
      segment?.airline?.code ||
      segment?.carrier?.code ||
      fallbackAirline?.code ||
      "";

    return {
      airline: {
        name: airlineName,
        code: airlineCode,
        logo: resolveAirlineLogo({
          name: airlineName,
          code: airlineCode,
          logo: segment?.airline?.logo || segment?.carrier?.logo,
        }),
      },
      aircraft:
        segment?.aircraft ||
        segment?.AirCraft ||
        leg?.flight?.details?.aircraft ||
        "",
      departure: {
        date: formatDateLabel(departureDateTime || leg?.date),
        time: formatTime(departureDateTime) || segment?.departure?.time || "",
        airport: `${departureCode}${departureCity ? ` - ${departureCity}` : ""}`.trim(),
        terminal: formatTerminalLabel(
          segment?.departure?.terminal ||
            segment?.departureTerminal ||
            leg?.flight?.details?.departureTerminal
        ),
        city: segment?.departure?.airportName || segment?.departure?.name || departureCity,
      },
      arrival: {
        date: formatDateLabel(arrivalDateTime || leg?.date),
        time: formatTime(arrivalDateTime) || segment?.arrival?.time || "",
        airport: `${arrivalCode}${arrivalCity ? ` - ${arrivalCity}` : ""}`.trim(),
        terminal: formatTerminalLabel(
          segment?.arrival?.terminal ||
            segment?.arrivalTerminal ||
            leg?.flight?.details?.arrivalTerminal
        ),
        city: segment?.arrival?.airportName || segment?.arrival?.name || arrivalCity,
      },
      duration: formatDurationFromMinutes(segmentDurationMinutes),
      stops: "Non-Stop",
      layoverDuration:
        Number.isFinite(layoverMinutes) && layoverMinutes >= 0
          ? `${Math.floor(layoverMinutes / 60)} h ${layoverMinutes % 60} m`
          : "",
      layoverAirport:
        getSegmentCity(nextSegment, "departure") ||
        getSegmentCode(nextSegment, "departure") ||
        arrivalCity ||
        arrivalCode,
    };
  });
};

const getTimelineConnectionsFromLeg = (leg = {}, fallbackAirline = {}) => {
  const rawConnections = normalizeConnections(
    leg?.flight?.details?.connections ||
      leg?.flight?.details?.Connections ||
      leg?.Connections ||
      leg?.connections
  );

  if (!rawConnections.length) return [];

  const routeConnections = rawConnections.filter(hasConnectionRouteEndpoints);
  if (!routeConnections.length) return [];

  return routeConnections.map((connection, index) => {
    const nextConnection = routeConnections[index + 1];
    const baseTimeline = toApiTimelineFlight({
      ...connection,
      airline: connection?.airline || connection?.AirlineName || fallbackAirline?.name,
      airlineName:
        connection?.airlineName || connection?.AirlineName || fallbackAirline?.name,
      AirCraft: connection?.AirCraft || connection?.aircraft,
    });
    const currentDeparture =
      connection?.departure || connection?.Departure || connection?.departureTime;
    const currentArrival =
      connection?.arrival || connection?.Arrival || connection?.arrivalTime;
    const nextDeparture =
      nextConnection?.departure ||
      nextConnection?.Departure ||
      nextConnection?.departureTime;
    const layoverMinutes =
      currentArrival && nextDeparture
        ? Math.round((new Date(nextDeparture) - new Date(currentArrival)) / 60000)
        : null;

    return {
      ...baseTimeline,
      layoverDuration:
        connection?.layoverDuration ||
        connection?.LayoverDuration ||
        (Number.isFinite(layoverMinutes) && layoverMinutes >= 0
          ? `${Math.floor(layoverMinutes / 60)} h ${layoverMinutes % 60} m`
          : ""),
      layoverAirport:
        nextConnection?.From ||
        nextConnection?.from ||
        nextConnection?.Airport ||
        nextConnection?.airport ||
        baseTimeline.arrival.airport,
      departure: {
        ...baseTimeline.departure,
        date: formatDateLabel(currentDeparture || leg?.date),
        time: formatTime(currentDeparture) || baseTimeline.departure.time,
      },
      arrival: {
        ...baseTimeline.arrival,
        date: formatDateLabel(currentArrival || leg?.date),
        time: formatTime(currentArrival) || baseTimeline.arrival.time,
      },
      stops: "Non-Stop",
    };
  });
};

const buildAncillaryPayload = (flightData, activeLeg = "both") => {
  const priceRequest = flightData?.booking?.priceRequest || {};
  const fallbackAmount = parseCurrencyAmount(flightData?.fare?.totalFare);
  const activeTripIndex =
    activeLeg === "depart" ? 0 : activeLeg === "return" ? 1 : null;
  const trips = toArray(priceRequest?.Trips)
    .map((trip, index) => ({ trip, index }))
    .filter(({ index }) => activeTripIndex === null || index === activeTripIndex)
    .map(({ trip, index }) => ({
      Amount: trip?.Amount ?? fallbackAmount,
      Index: trip?.Index,
      OrderID: trip?.OrderID ?? index + 1,
      TUI: trip?.TUI,
      ChannelCode: trip?.ChannelCode ?? null,
    }));

  return {
    provider:
      priceRequest?.provider ||
      priceRequest?.Provider ||
      flightData?.booking?.provider ||
      flightData?.provider ||
      "akbar",
    search_key: priceRequest?.search_key || flightData?.booking?.searchKey,
    // ClientID: priceRequest?.ClientID || "APITRAGET",
    Source:  "LV",
    // TripType: priceRequest?.TripType || flightData?.booking?.tripType || "RT",
    Trips: trips,
    PaidSSR:false,
    FairType:"N"
  };
};

const buildFareRulesPayload = (flightData, activeLeg = "both") => {
  const ancillaryPayload = buildAncillaryPayload(flightData, activeLeg);

  return {
    search_key: ancillaryPayload.search_key,
    Trips: toArray(ancillaryPayload.Trips).map((trip) => ({
      Amount: trip?.Amount,
      Index: trip?.Index,
      OrderID: trip?.OrderID,
      TUI: trip?.TUI,
    })),
  };
};

const getAncillaryRequestKey = (payload = {}) =>
  [
    payload.provider,
    payload.search_key,
    payload.TripType,
    ...toArray(payload.Trips).flatMap((trip) => [
      trip?.Amount,
      trip?.Index,
      trip?.OrderID,
      trip?.TUI,
    ]),
  ].join("|");

const hasValidSsrPayload = (payload = {}) =>
  payload.search_key &&
  toArray(payload.Trips).length > 0 &&
  toArray(payload.Trips).every(
    (trip) =>
      trip?.TUI &&
      trip?.Amount !== undefined &&
      trip?.Amount !== null &&
      trip?.Index !== undefined &&
      trip?.Index !== null &&
      trip?.OrderID !== undefined &&
      trip?.OrderID !== null
  );

const hasValidFareRulesPayload = (payload = {}) =>
  payload.search_key &&
  toArray(payload.Trips).length > 0 &&
  toArray(payload.Trips).every(
    (trip) =>
      trip?.TUI &&
      trip?.Amount !== undefined &&
      trip?.Amount !== null &&
      trip?.Index !== undefined &&
      trip?.Index !== null
  );

const RoundTripExpendable = ({
  flightData = null,
  flightInfoData = null,
  isFlightInfoLoading = false,
  activeLeg = "both",
}) => {
  const [activeTab, setActiveTab] = useState("flight");
  const handleTabClick = (next) => setActiveTab(next);
  const tabsRef = useRef(null);
  const [ssrData, setSsrData] = useState(null);
  const [ssrRequestKey, setSsrRequestKey] = useState("");
  const [isSsrLoading, setIsSsrLoading] = useState(false);
  const [ssrError, setSsrError] = useState("");
  const [fareRulesData, setFareRulesData] = useState(null);
  const [fareRulesRequestKey, setFareRulesRequestKey] = useState("");
  const [isFareRulesLoading, setIsFareRulesLoading] = useState(false);
  const [fareRulesError, setFareRulesError] = useState("");
  const showDepartLeg = activeLeg === "both" || activeLeg === "depart";
  const showReturnLeg = activeLeg === "both" || activeLeg === "return";
  const departTimeline = flightData
    ? toTimelineFlight(flightData.depart, flightData.depart?.airline)
    : null;
  const returnTimeline = flightData
    ? toTimelineFlight(flightData.return, flightData.return?.airline)
    : null;
  const apiTimelines = splitFlightInfoByLeg(flightInfoData, flightData);
  const departHeading = flightData
    ? `${parseAirportLabel(flightData.depart?.flight?.departure?.city).city || "Depart"}`
    : "Jakrata";
  const returnHeading = flightData
    ? `${parseAirportLabel(flightData.return?.flight?.departure?.city).city || "Return"}`
    : "Singapore";
  const departArrival = flightData
    ? parseAirportLabel(flightData.depart?.flight?.arrival?.city).city
    : "Singapore";
  const returnArrival = flightData
    ? parseAirportLabel(flightData.return?.flight?.arrival?.city).city
    : "Jakrata";

  const flight = {
    airline: {
      name: "Indonesia AirAsia",
      code: "QZ 271",
      logo: "/images/Flight2.png",
    },
    aircraft: "Airbus A320",

    departure: {
      date: "THU, 25 DEC 2025",
      time: "06:45",
      airport: "SIN - SINGAPORE",
      terminal: "Terminal 2",
      city: "Jewel Changi Airport",
    },

    arrival: {
      date: "THU, 25 DEC 2025",
      time: "08:00",
      airport: "CGK - JAKARTA",
      terminal: "Terminal 3",
      city: "Soekarno–Hatta International",
    },

    duration: {
      hours: "01",
      minutes: "50",
    },

    stops: "Non-Stop",
  };

  const flight2 = {
    airline: {
      name: "Batik Air, Indones....",
      code: "ID 715",
      logo: "/images/Flight1.png",
    },

    aircraft: "Boeing 737",

    departure: {
      date: "THU, 18 DEC 2025",
      time: "06:45",
      airport: "CGK - JAKARTA",
      terminal: "Terminal 2F",
      city: "Soekarno–Hatta Inter......",
    },

    arrival: {
      date: "THU, 18 DEC 2025",
      time: "09:35",
      airport: "KUL - KUALA LUMPUR",
      terminal: "Terminal 1",
      city: "Kuala Lumpur Internati..",
    },

    duration: {
      hours: "01",
      minutes: "50",
    },

    stops: "Non-Stop",
  };

  const flight3 = {
    airline: {
      name: "Batik Air Malaysia",
      code: "OD 804",
      logo: "/images/Flight3.png",
    },

    aircraft: "Boeing 737",

    departure: {
      date: "THU, 18 DEC 2025",
      time: "10:00",
      airport: "KUL - KUALA LUMPUR",
      terminal: "Terminal 2",
      city: "Kuala Lumpur Internati..",
    },

    arrival: {
      date: "THU, 18 DEC 2025",
      time: "11:10",
      airport: "SIN - SINGAPORE",
      terminal: "Terminal T3",
      city: "Changi Airport",
    },

    duration: {
      hours: "01",
      minutes: "50",
    },

    stops: "Non-Stop",
  };

  const departSegmentTimelines = getTimelineSegmentsFromLeg(
    flightData?.depart,
    flightData?.depart?.airline
  );
  const returnSegmentTimelines = getTimelineSegmentsFromLeg(
    flightData?.return,
    flightData?.return?.airline
  );
  const departConnectionTimelines = getTimelineConnectionsFromLeg(
    flightData?.depart,
    flightData?.depart?.airline
  );
  const returnConnectionTimelines = getTimelineConnectionsFromLeg(
    flightData?.return,
    flightData?.return?.airline
  );
  const departTimelines = apiTimelines.depart.length > 1
    ? apiTimelines.depart
    : departSegmentTimelines.length
      ? departSegmentTimelines
      : departConnectionTimelines.length
        ? departConnectionTimelines
        : apiTimelines.depart.length
          ? apiTimelines.depart
          : [departTimeline || flight2];
  const returnTimelines = apiTimelines.return.length > 1
    ? apiTimelines.return
    : returnSegmentTimelines.length
      ? returnSegmentTimelines
      : returnConnectionTimelines.length
        ? returnConnectionTimelines
        : apiTimelines.return.length
          ? apiTimelines.return
          : [returnTimeline || flight];

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

    const payload = buildAncillaryPayload(flightData, activeLeg);
    const requestKey = getAncillaryRequestKey(payload);
   

    if (ssrRequestKey === requestKey && (ssrData || isSsrLoading)) return;

    if (!hasValidSsrPayload(payload)) {
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

    getFlightBaggageInfo(payload)
      .then((response) => {
        if (!isMounted) return;
        setSsrData(response);
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error("Failed to fetch round-trip SSR baggage rules", error);
        setSsrError("Unable to load baggage rules.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsSsrLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, flightData, activeLeg]);

  useEffect(() => {
    if (activeTab !== "cancellation") return;

    const payload = buildFareRulesPayload(flightData, activeLeg);
    const requestKey = getAncillaryRequestKey(payload);

    if (
      fareRulesRequestKey === requestKey &&
      (fareRulesData || isFareRulesLoading)
    ) {
      return;
    }

    if (!hasValidFareRulesPayload(payload)) {
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
        console.error("Failed to fetch round-trip fare rules", error);
        setFareRulesError("Unable to load cancellation rules.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsFareRulesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, flightData, activeLeg]);

  return (
    <div className={styles.expandableSection}>
      <div className={styles.expandableContainer}>
        <div className={styles.tabContainer} ref={tabsRef}>
          {[
            { key: "flight", label: "Flight Information" },
            { key: "fare", label: "Fare Details" },
            { key: "baggage", label: "Baggage Rules" },
            { key: "cancellation", label: "Cancellation Rules" },
          ].map((t) => (
            <div
              key={t.key}
              className={`${styles.tabItem} ${
                activeTab === t.key ? styles.active : ""
              }`}
              onClick={() => handleTabClick(t.key)}
            >
              {t.label}
            </div>
          ))}
        </div>

        {activeTab === "flight" && (
          <div className={styles.flightInfoContainer}>
            {isFlightInfoLoading && (
              <div className={styles.changeOfPlanes}>Loading flight details...</div>
            )}
            {flightInfoData?.error && (
              <div className={styles.changeOfPlanes}>Unable to load live flight details.</div>
            )}
            {showDepartLeg && (
              <div className={styles.leftFlightInfoCont}>
                <div className={styles.flightHeading}>
                  <h3>
                    {departHeading} <img src="/icons/flightIconBlue.svg" alt="" />{" "}
                    <span className={styles.smallerHeadingText}>
                      {departArrival}, {flightData?.depart?.date || "18 Dec 2025"}
                    </span>
                  </h3>
                </div>
                <div className={styles.mainBody}>
                  {departTimelines.map((timeline, index) => (
                    <React.Fragment key={`depart-${timeline.airline.code}-${index}`}>
                      <FlightTimeline flight={timeline} />
                      {index < departTimelines.length - 1 && (
                        <div className={styles.changeOfPlanes}>
                          Change of Aircraft:
                          <span className={styles.changeOfPlanesTiem}>
                            {timeline.layoverDuration || "N/A"}
                          </span>
                          in {timeline.layoverAirport || "N/A"}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
            {showReturnLeg && (
              <div className={styles.rightFlightInfoCont}>
                <div className={styles.flightHeading}>
                  <h3>
                    {returnHeading} <img src="/icons/flightIconBlue.svg" alt="" />{" "}
                    <span className={styles.smallerHeadingText}>
                      {returnArrival}, {flightData?.return?.date || "25 Dec 2025"}
                    </span>
                  </h3>
                </div>
                <div className={styles.mainBody}>
                  {returnTimelines.map((timeline, index) => (
                    <React.Fragment key={`return-${timeline.airline.code}-${index}`}>
                      <FlightTimeline flight={timeline} />
                      {index < returnTimelines.length - 1 && (
                        <div className={styles.changeOfPlanes}>
                          Change of Aircraft:
                          <span className={styles.changeOfPlanesTiem}>
                            {timeline.layoverDuration || "N/A"}
                          </span>
                          in {timeline.layoverAirport || "N/A"}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "fare" && (
          <div className={styles.flightFareContaienr}>
            {showDepartLeg && (
              <FlightFare
                flightData={flightData}
                leg={flightData?.depart}
                tripIndex={0}
              />
            )}
            {showReturnLeg && (
              <FlightFare
                flightData={flightData}
                leg={flightData?.return}
                tripIndex={1}
              />
            )}
          </div>
        )}

        {activeTab === "baggage" && (
          <div className={styles.baggageRuleContainer}>
            <BaggageRules
              flightData={flightData}
              ssrData={ssrData}
              isLoading={isSsrLoading}
              error={ssrError}
              activeLeg={activeLeg}
            />
          </div>
        )}

        {activeTab === "cancellation" && (
          <div className={styles.baggageRuleContainer}>
            <CancellationRules
              flightData={flightData}
              fareRulesData={fareRulesData}
              isLoading={isFareRulesLoading}
              error={fareRulesError}
              activeLeg={activeLeg}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoundTripExpendable;

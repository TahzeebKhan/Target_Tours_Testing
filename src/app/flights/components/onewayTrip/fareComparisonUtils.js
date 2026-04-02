"use client";

export const FALLBACK_FLIGHT_SUMMARY = {
  route: {
    fromName: "New Delhi",
    fromCode: "DEL",
    toName: "Phuket City",
    toCode: "HKT",
  },
  airline: {
    name: "Air India",
    code: "AI2380",
    logo: "/images/Flight.png",
    aircraft: "Boeing 787-9 Dreamliner",
    cabinClass: "Economy Class",
  },
  departure: {
    date: "THU, 18 DEC 2025",
    time: "06:45",
    airport: "DEL - DELHI",
    terminal: "Terminal N/A",
    city: "Indira Gandhi International",
  },
  arrival: {
    date: "THU, 18 DEC 2025",
    time: "08:00",
    airport: "HKT - PHUKET CITY",
    terminal: "Terminal N/A",
    city: "Phuket International",
  },
  duration: {
    hours: 1,
    minutes: 50,
  },
  stops: "Non-Stop",
};

const parseCityAndCode = (value, fallbackName, fallbackCode) => {
  const text = String(value || "").trim();
  const match = text.match(/^(.*?)\s*\(([^)]+)\)\s*$/);

  if (!match) {
    return {
      name: text || fallbackName,
      code: fallbackCode,
    };
  }

  return {
    name: match[1].trim() || fallbackName,
    code: match[2].trim() || fallbackCode,
  };
};

const formatDisplayDate = (rawDate) => {
  if (!rawDate) return FALLBACK_FLIGHT_SUMMARY.departure.date;

  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return FALLBACK_FLIGHT_SUMMARY.departure.date;

  return date
    .toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/,/g, "")
    .toUpperCase();
};

const formatMobileDate = (rawDate) => {
  if (!rawDate) return "Wed-11 Feb 2026";

  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return "Wed-11 Feb 2026";

  const weekday = date.toLocaleDateString("en-GB", { weekday: "short" });
  const day = date.toLocaleDateString("en-GB", { day: "2-digit" });
  const month = date.toLocaleDateString("en-GB", { month: "short" });
  const year = date.toLocaleDateString("en-GB", { year: "numeric" });

  return `${weekday}-${day} ${month} ${year}`;
};

const compactAirportName = (value, fallback) => {
  const text = String(value || "").trim();
  if (!text) return fallback;

  const primary = text
    .split("|")[0]
    .trim();

  return primary
    .split(",")
    .map((part) => part.trim())
    .find(Boolean) || fallback;
};

const formatTerminal = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return "Terminal N/A";
  return /^terminal\b/i.test(text) ? text : `Terminal ${text}`;
};

export const getSelectedFlightSummary = (flightData, searchDate) => {
  if (!flightData) {
    return {
      ...FALLBACK_FLIGHT_SUMMARY,
      mobileDate: formatMobileDate(searchDate),
    };
  }

  const departureRoute = parseCityAndCode(
    flightData?.departure?.city,
    FALLBACK_FLIGHT_SUMMARY.route.fromName,
    FALLBACK_FLIGHT_SUMMARY.route.fromCode
  );
  const arrivalRoute = parseCityAndCode(
    flightData?.arrival?.city,
    FALLBACK_FLIGHT_SUMMARY.route.toName,
    FALLBACK_FLIGHT_SUMMARY.route.toCode
  );

  const primaryAirline = flightData?.airlines?.[0] || {};
  const details = flightData?.details || {};
  const formattedDate = formatDisplayDate(searchDate);

  return {
    route: {
      fromName: departureRoute.name,
      fromCode: departureRoute.code,
      toName: arrivalRoute.name,
      toCode: arrivalRoute.code,
    },
    airline: {
      name: primaryAirline?.name || FALLBACK_FLIGHT_SUMMARY.airline.name,
      code:
        String(primaryAirline?.code || "")
          .trim() || FALLBACK_FLIGHT_SUMMARY.airline.code,
      logo: primaryAirline?.logo || FALLBACK_FLIGHT_SUMMARY.airline.logo,
      aircraft: details?.aircraft || FALLBACK_FLIGHT_SUMMARY.airline.aircraft,
      cabinClass:
        flightData?.fare?.cabinClass || FALLBACK_FLIGHT_SUMMARY.airline.cabinClass,
    },
    departure: {
      date: formattedDate,
      time: flightData?.departure?.time || FALLBACK_FLIGHT_SUMMARY.departure.time,
      airport: `${departureRoute.code} - ${departureRoute.name.toUpperCase()}`,
      terminal: formatTerminal(details?.departureTerminal),
      city: compactAirportName(details?.fromName, departureRoute.name),
    },
    arrival: {
      date: formattedDate,
      time: flightData?.arrival?.time || FALLBACK_FLIGHT_SUMMARY.arrival.time,
      airport: `${arrivalRoute.code} - ${arrivalRoute.name.toUpperCase()}`,
      terminal: formatTerminal(details?.arrivalTerminal),
      city: compactAirportName(details?.toName, arrivalRoute.name),
    },
    duration: {
      hours:
        Number.isFinite(Number(flightData?.duration?.hours))
          ? Number(flightData.duration.hours)
          : FALLBACK_FLIGHT_SUMMARY.duration.hours,
      minutes:
        Number.isFinite(Number(flightData?.duration?.minutes))
          ? Number(flightData.duration.minutes)
          : FALLBACK_FLIGHT_SUMMARY.duration.minutes,
    },
    stops: flightData?.stops?.type || FALLBACK_FLIGHT_SUMMARY.stops,
    mobileDate: formatMobileDate(searchDate),
  };
};

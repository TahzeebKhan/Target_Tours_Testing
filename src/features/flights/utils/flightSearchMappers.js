import { resolveAirlineLogo } from "./airlineLogos";

const DEFAULT_LOGO = "/images/dummyFlightlogo.png";
const DEFAULT_BOOKING_CLIENT_ID = "FVI6V120g22Ei5ztGK0FIQ==";
const DEFAULT_PRICE_SOURCE = "SF";
const DEFAULT_BOOKING_MODE = "AS";
const DEFAULT_BOOKING_OPTIONS = "";
const CURRENCY_FORMATTER = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const toArray = (value) => (Array.isArray(value) ? value : []);

const getByPath = (obj, path) =>
  path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);

const getFirstArrayAtPaths = (obj, paths) => {
  for (const path of paths) {
    const value = path.length ? getByPath(obj, path) : obj;
    if (Array.isArray(value)) return value;
  }
  return [];
};

const readNumber = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null || value === "") continue;

    const normalizedText =
      typeof value === "string" ? value.replace(/[^\d.-]/g, "") : null;
    if (typeof value === "string" && !normalizedText) continue;

    const n =
      typeof value === "string" ? Number(normalizedText) : Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
};

const pickFirst = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
};

const deriveTripIndexForOrder = (value, orderId) => {
  const text = String(value || "").trim();
  if (!text) return undefined;

  const parts = text.split("|");
  if (parts.length < 2) return undefined;

  const lastIndex = parts.length - 1;
  if (!/^\d+$/.test(parts[lastIndex].trim())) return undefined;

  parts[lastIndex] = String(orderId);
  return parts.join("|");
};

const normalizeCarrierCode = (value) => {
  const text = String(value || "").trim();
  if (!text) return "";

  const pipeCode = text.split("|")[0]?.trim();
  if (pipeCode) return pipeCode;

  const codeMatch = text.match(/^[A-Za-z0-9]{2,3}/);
  return codeMatch?.[0] || text;
};

const normalizeFlightNo = (value) => {
  const text = String(value || "").trim();
  if (!text) return "";

  if (text.includes("|")) {
    return text.split("|").pop()?.trim() || "";
  }

  const exact = text.match(/^\d+$/);
  if (exact) return exact[0];

  const trailing = text.match(/[A-Za-z]{1,3}[-\s]?(\d{1,4})$/);
  if (trailing) return trailing[1];

  return text;
};

const buildAirlineDisplayCode = (carrierCode, flightNo) =>
  [normalizeCarrierCode(carrierCode), normalizeFlightNo(flightNo)]
    .filter(Boolean)
    .join(" ");

const findFirstDeepValue = (input, matcher, seen = new WeakSet()) => {
  if (!input || typeof input !== "object") return undefined;
  if (seen.has(input)) return undefined;
  seen.add(input);

  if (Array.isArray(input)) {
    for (const item of input) {
      const nested = findFirstDeepValue(item, matcher, seen);
      if (nested !== undefined) return nested;
    }
    return undefined;
  }

  for (const [key, value] of Object.entries(input)) {
    if (matcher(key, value)) return value;
    const nested = findFirstDeepValue(value, matcher, seen);
    if (nested !== undefined) return nested;
  }

  return undefined;
};

const parseDurationMinutes = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const str = String(value).trim();
  if (!str) return null;

  const numOnly = Number(str);
  if (Number.isFinite(numOnly)) return numOnly;

  const hm = str.match(/(\d+)\s*h(?:ours?)?\s*(\d+)\s*m/i);
  if (hm) return Number(hm[1]) * 60 + Number(hm[2]);

  const hOnly = str.match(/(\d+)\s*h(?:ours?)?/i);
  if (hOnly) return Number(hOnly[1]) * 60;

  const mOnly = str.match(/(\d+)\s*m(?:in(?:utes?)?)?/i);
  if (mOnly) return Number(mOnly[1]);

  return null;
};

const getElapsedMinutes = (start, end) => {
  if (!start || !end) return null;

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }

  const minutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
  return minutes >= 0 ? minutes : null;
};

const parseTimeMinutes = (value) => {
  const time = formatTime(value);
  const match = String(time || "").match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

const getArrivalDayOffset = (departureValue, arrivalValue, durationMinutes) => {
  if (!departureValue || !arrivalValue) return 0;

  const departureMinutes = parseTimeMinutes(departureValue);
  const normalizedDuration = Number(durationMinutes);
  if (departureMinutes !== null && Number.isFinite(normalizedDuration)) {
    if (normalizedDuration >= 24 * 60) {
      return Math.ceil(normalizedDuration / (24 * 60));
    }

    const arrivalMinutes = parseTimeMinutes(arrivalValue);
    return arrivalMinutes !== null && arrivalMinutes < departureMinutes ? 1 : 0;
  }

  const departureDate = new Date(departureValue);
  const arrivalDate = new Date(arrivalValue);
  if (
    !Number.isNaN(departureDate.getTime()) &&
    !Number.isNaN(arrivalDate.getTime())
  ) {
    const departureDay = new Date(
      departureDate.getFullYear(),
      departureDate.getMonth(),
      departureDate.getDate()
    ).getTime();
    const arrivalDay = new Date(
      arrivalDate.getFullYear(),
      arrivalDate.getMonth(),
      arrivalDate.getDate()
    ).getTime();
    return Math.max(
      Math.round((arrivalDay - departureDay) / (24 * 60 * 60 * 1000)),
      0
    );
  }

  const arrivalMinutes = parseTimeMinutes(arrivalValue);
  return (
    departureMinutes !== null &&
    arrivalMinutes !== null &&
    arrivalMinutes < departureMinutes
  )
    ? 1
    : 0;
};

const formatDurationLabel = (minutes) => {
  const normalized = Number(minutes);
  if (!Number.isFinite(normalized) || normalized < 0) return "";
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
};

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "N/A";

  return `₹ ${CURRENCY_FORMATTER.format(amount)}`;
};

const formatDateLabel = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date
    .toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
    .replace(",", "")
    .toUpperCase();
};

const formatTime = (value) => {
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

const formatDateTimeLabel = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date
    .toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "2-digit",
    })
    .toUpperCase();
};

const parseCodeFromLabel = (label = "") => {
  const match = label.match(/\(([^)]+)\)/);
  return match ? match[1] : "";
};

const parseCityFromLabel = (label = "") => {
  if (!label) return "";
  const cleaned = String(label).trim();
  const withoutCode = cleaned.replace(/\s*\([^)]+\)\s*$/, "");
  return withoutCode;
};

const deriveAirportCode = (value = "") => {
  if (!value) return "";

  const bracketCode = parseCodeFromLabel(value);
  if (bracketCode) return bracketCode.toUpperCase();

  const trimmed = String(value).trim();
  if (/^[A-Za-z]{3}$/.test(trimmed)) return trimmed.toUpperCase();

  const normalized = trimmed.toLowerCase();
  if (normalized.includes("jakarta")) return "CGK";
  if (normalized.includes("singapore")) return "SIN";
  if (normalized.includes("bangalore") || normalized.includes("bengaluru")) return "BLR";
  if (normalized.includes("kolkata")) return "CCU";
  if (normalized.includes("delhi")) return "DEL";
  if (normalized.includes("mumbai")) return "BOM";
  if (normalized.includes("chennai")) return "MAA";

  return "";
};

const normalizeDateParam = (value) => {
  if (!value) return value;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
};

const getDefaultDomain = () => process.env.NEXT_PUBLIC_DOMAIN;
const SLOT_KEY_MAP = {
  before6: "before_6am",
  "6to12": "morning",
  "12to6": "afternoon",
  after6: "evening",
  after12: "evening",
};

const mapSortOptionToApi = (sortBy) => {
  const map = {
    lowest: "cheapest",
    highest: "price_desc",
    early_dep: "earliest",
    late_dep: "latest_departure",
    early_arr: "earliest",
    shortest: "fastest",
    airline: "airline",
    cheapest: "cheapest",
    fastest: "fastest",
  };

  return map[sortBy] || "";
};

const mapCabinClassToApi = (value) => {
  const v = String(value || "").trim().toUpperCase();
  const map = {
    ECONOMY: "economy",
    E: "economy",
    BUSINESS: "business",
    B: "business",
    FIRST: "first_class",
    FIRST_CLASS: "first_class",
    F: "first_class",
    PREMIUM_ECONOMY: "premium_economy",
    "PREMIUM ECONOMY": "premium_economy",
    PE: "premium_economy",
  };

  return map[v] || "economy";
};

const extractPagination = (payload, fallbackCount, pageHint = 1, limitHint = 50) => {
  const pagination = pickFirst(
    payload?.pagination,
    payload?.meta?.pagination,
    payload?.data?.pagination,
    payload?.meta
  ) || {};

  const page = readNumber(pagination?.page, pagination?.currentPage, pageHint) || 1;
  const limit =
    readNumber(
      pagination?.limit,
      pagination?.pageSize,
      pagination?.perPage,
      limitHint
    ) || 50;
  const total =
    readNumber(
      pagination?.total,
      pagination?.totalItems,
      payload?.total,
      payload?.count
    ) || fallbackCount;

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return { page, limit, total, from, to };
};

const fallbackCity = (city, code) => {
  if (city && code) return `${city} (${code})`;
  if (city) return city;
  if (code) return code;
  return "N/A";
};

const extractSegments = (flight = {}) => {
  if (Array.isArray(flight.segments)) return flight.segments;
  if (Array.isArray(flight?.outbound?.segments)) return flight.outbound.segments;

  if (Array.isArray(flight.legs) && flight.legs.length) {
    const firstLeg = flight.legs[0];
    if (Array.isArray(firstLeg?.segments)) return firstLeg.segments;
  }

  return [];
};

const pickAirlinesFromSegments = (segments = []) => {
  const mapped = segments
    .map((segment, idx) => {
      const name =
        segment?.airline?.name ||
        segment?.carrier?.name ||
        segment?.marketing_airline?.name ||
        "N/A";
      const flightNo = normalizeFlightNo(
        pickFirst(segment?.flight_number, segment?.flightNo, segment?.flight_no)
      );
      const carrierCode = normalizeCarrierCode(
        pickFirst(
          segment?.airline?.code,
          segment?.carrier?.code,
          segment?.marketing_airline?.code
        )
      );
      const code = buildAirlineDisplayCode(carrierCode, flightNo) || "N/A";
      const logo = resolveAirlineLogo({
        name,
        code: carrierCode || code,
        logo: segment?.airline?.logo || segment?.carrier?.logo,
      });

      return { name, code, carrierCode, flightNo, logo };
    })
    .filter((a) => a.name || a.code);

  return mapped.length ? mapped : [{ name: "N/A", code: "N/A", logo: DEFAULT_LOGO }];
};

const normalizeStops = (stopsValue, segmentCount = 1) => {
  const numericStops =
    typeof stopsValue === "number"
      ? stopsValue
      : Number.parseInt(String(stopsValue || ""), 10);
  const stopsCount = Number.isFinite(numericStops)
    ? numericStops
    : Math.max(segmentCount - 1, 0);

  return {
    count: stopsCount,
    type: stopsCount === 0 ? "Non Stop" : `${stopsCount} Stop`,
  };
};

const normalizeBookingTripType = (tripType) => {
  const normalized = String(tripType || "").trim().toLowerCase();
  if (normalized === "round") return "RT";
  if (normalized === "multi") return "MC";
  if (normalized === "on") return "ON";
  return "ON";
};

const getProviderFromSearchKey = (searchKey) => {
  const parts = String(searchKey || "").split("_").filter(Boolean);
  const originalLength = parts.length;

  while (["true", "false"].includes(parts.at(-1)?.toLowerCase())) {
    parts.pop();
  }

  return parts.length < originalLength ? parts.at(-1) : undefined;
};

const getFlightProvider = (flight, responseBookingMeta = {}) =>
  pickFirst(
    flight?.provider,
    flight?.Provider,
    flight?.booking?.provider,
    flight?.raw?.provider,
    flight?.raw?.Provider,
    flight?.data?.provider,
    flight?.data?.Provider,
    responseBookingMeta.provider,
    getProviderFromSearchKey(
      pickFirst(
        flight?.search_key,
        flight?.SearchKey,
        responseBookingMeta.searchKey
      )
    )
  );

const getDefaultOrderId = (tripType) => {
  const normalized = normalizeBookingTripType(tripType);
  if (normalized === "RT") return "2";
  return "1";
};

const extractResponseBookingMeta = (payload, tripType) => ({
  provider: pickFirst(
    payload?.meta?.provider,
    payload?.meta?.Provider,
    payload?.data?.meta?.provider,
    payload?.data?.meta?.Provider,
    payload?.provider,
    payload?.Provider,
    payload?.data?.provider,
    payload?.data?.Provider
  ),
  searchKey: pickFirst(
    payload?.search_key,
    payload?.SearchKey,
    payload?.data?.search_key,
    payload?.data?.SearchKey
  ),
  tui: pickFirst(
    payload?.tui,
    payload?.TUI,
    payload?.data?.tui,
    payload?.data?.TUI
  ),
  clientId: DEFAULT_BOOKING_CLIENT_ID,
  mode: DEFAULT_BOOKING_MODE,
  options: DEFAULT_BOOKING_OPTIONS,
  source: DEFAULT_PRICE_SOURCE,
  ssrSource: pickFirst(
    payload?.SSRSource,
    payload?.ssrSource,
    payload?.data?.SSRSource,
    payload?.data?.ssrSource
  ),
  tripType: normalizeBookingTripType(
    pickFirst(payload?.TripType, payload?.tripType, payload?.data?.TripType, tripType)
  ),
});

const buildOneWayCard = (flight, index, options = {}) => {
  const {
    adults = 1,
    fallbackCabinClass = "N/A",
    fallbackFrom = "",
    fallbackTo = "",
    responseBookingMeta = {},
  } = options;
  const segments = extractSegments(flight);
  const hasSegments = segments.length > 0;
  const firstConnection = toArray(flight?.Connections || flight?.connections)[0] || {};
  const flightProvider = getFlightProvider(flight, responseBookingMeta);
  const airlines = hasSegments
    ? pickAirlinesFromSegments(segments)
    : (() => {
        const name = pickFirst(
          flight?.airline,
          flight?.airline_name,
          flight?.Airline,
          flight?.AirlineName,
          flight?.airlineName,
          "N/A"
        );
        const code = pickFirst(
          flight?.flight_number,
          flight?.flightNo,
          flight?.flight_no,
          flight?.airline_code,
          flight?.AirlineCode,
          flight?.airlineCode,
          firstConnection?.MAC,
          firstConnection?.OAC,
          firstConnection?.VAC,
          flight?.index,
          "N/A"
        );

        return [
          {
            name,
            code,
            logo: resolveAirlineLogo({ name, code, logo: flight?.logo }),
          },
        ];
      })();

  const first = segments[0] || {};
  const last = segments[segments.length - 1] || first;
  const primaryFlightNo = pickFirst(
    flight?.flightNo,
    flight?.FlightNo,
    flight?.flight_no,
    flight?.flight_number,
    first?.flightNo,
    first?.FlightNo,
    first?.flight_no,
    first?.flight_number,
    airlines?.[0]?.code
  );

  const depCity =
    first?.departure?.city ||
    first?.from?.city ||
    first?.origin?.city ||
    first?.departure?.airport_city;

  const depCode =
    first?.departure?.airportCode ||
    first?.departure?.airport_code ||
    first?.from?.code ||
    first?.origin?.code;

  const arrCity =
    last?.arrival?.city ||
    last?.to?.city ||
    last?.destination?.city ||
    last?.arrival?.airport_city;

  const arrCode =
    last?.arrival?.airportCode ||
    last?.arrival?.airport_code ||
    last?.to?.code ||
    last?.destination?.code;

  const durationMinutes =
    parseDurationMinutes(
      pickFirst(
        flight?.duration_minutes,
        flight?.durationMinutes,
        flight?.duration,
        first?.duration_minutes,
        first?.durationMinutes
      )
    ) || 0;

  const stopsMeta = normalizeStops(
    pickFirst(flight?.stops, flight?.stop_count),
    segments.length || 1
  );
  const stopsCount = stopsMeta.count;
  const viaCity = segments[1]?.departure?.city || segments[1]?.from?.city || null;

  const totalFareAmount =
    readNumber(
      flight?.fare?.total,
      flight?.fare?.totalFare,
      flight?.price?.total,
      flight?.price,
      flight?.price?.amount,
      flight?.total,
      flight?.amount
    );

  const perAdult =
    readNumber(flight?.fare?.pricePerAdult, flight?.price?.per_adult, flight?.pricePerAdult) ||
    (Number.isFinite(totalFareAmount)
      ? Math.round(totalFareAmount / Math.max(adults, 1))
      : null);
  const grossFareAmount = readNumber(
    flight?.grossFare,
    flight?.gross_fare,
    flight?.fare?.grossFare,
    flight?.fare?.gross_fare,
    flight?.fare?.gross
  );
  const explicitTax = pickFirst(
    flight?.tax,
    flight?.Tax,
    flight?.fare?.tax,
    flight?.fare?.Tax
  );
  const taxAmount =
    explicitTax !== undefined
      ? readNumber(explicitTax)
      : grossFareAmount !== null
        ? Math.max(grossFareAmount - totalFareAmount, 0)
        : null;
  const rawConnections =
    flight?.Connections && typeof flight.Connections === "object"
      ? flight.Connections
      : flight?.connections && typeof flight.connections === "object"
        ? flight.connections
        : { layovers: [], segments: [] };
  const tripAmount =
    readNumber(
      flight?.Amount,
      flight?.amount,
      grossFareAmount,
      totalFareAmount
    ) || 0;
  const tripIndex = pickFirst(flight?.Index, flight?.index, flight?.flightIndex);
  const tripOrderId = pickFirst(
    flight?.OrderID,
    flight?.OrderId,
    flight?.orderId,
    flight?.order_id,
    getDefaultOrderId(responseBookingMeta.tripType)
  );
  const tripTui = pickFirst(
    responseBookingMeta.tui,
    flight?.TUI,
    flight?.tui,
    flight?.trip?.TUI,
    flight?.trip?.tui,
    findFirstDeepValue(
      flight,
      (key, value) =>
        String(key).toLowerCase() === "tui" &&
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  );
  const departureValue = pickFirst(
    first?.departure?.date,
    first?.departure?.time,
    first?.departure_time,
    flight?.departure,
    flight?.departure_time
  );
  const arrivalValue = pickFirst(
    last?.arrival?.date,
    last?.arrival?.time,
    last?.arrival_time,
    flight?.arrival,
    flight?.arrival_time
  );
  const arrivalDayOffset = getArrivalDayOffset(
    departureValue,
    arrivalValue,
    durationMinutes
  );

  return {
    id: flight?.id || flight?.index || `flight-${index + 1}`,
    airlines,
    departure: {
      time: formatTime(departureValue),
      city: hasSegments
        ? fallbackCity(depCity, depCode)
        : fallbackCity(
            parseCityFromLabel(fallbackFrom),
            deriveAirportCode(fallbackFrom)
          ),
    },
    arrival: {
      time: formatTime(arrivalValue),
      city: hasSegments
        ? fallbackCity(arrCity, arrCode)
        : fallbackCity(
            parseCityFromLabel(fallbackTo),
            deriveAirportCode(fallbackTo)
          ),
    },
    duration: {
      hours: Math.floor(durationMinutes / 60),
      minutes: durationMinutes % 60,
    },
    stops: {
      type: stopsMeta.type,
      count: stopsCount,
      via: viaCity,
      nextDay: arrivalDayOffset > 0,
      arrivalDayOffset,
    },
    fare: {
      totalFare: formatCurrency(totalFareAmount),
      pricePerAdult: formatCurrency(perAdult),
      grossFare: grossFareAmount !== null ? formatCurrency(grossFareAmount) : null,
      tax: taxAmount !== null ? formatCurrency(taxAmount) : null,
      cabinClass:
        flight?.fare?.cabinClass ||
        flight?.cabinClass ||
        flight?.travel_class ||
        fallbackCabinClass,
    },
    details: {
      airline: pickFirst(flight?.airline, flight?.airline_name, airlines?.[0]?.name),
      flightNo: primaryFlightNo,
      aircraft: pickFirst(flight?.AirCraft, flight?.aircraft, flight?.Aircraft),
      fromName: pickFirst(flight?.FromName, flight?.from_name),
      toName: pickFirst(flight?.ToName, flight?.to_name),
      departureDateTime: pickFirst(first?.departure?.date, flight?.departure),
      arrivalDateTime: pickFirst(last?.arrival?.date, flight?.arrival),
      departureTerminal: pickFirst(
        flight?.departureTerminal,
        flight?.departure_terminal
      ),
      arrivalTerminal: pickFirst(
        flight?.arrivalTerminal,
        flight?.arrival_terminal
      ),
      connections: rawConnections,
      dateLabel: formatDateTimeLabel(
        pickFirst(first?.departure?.date, flight?.departure)
      ),
    },
    booking: {
      provider: flightProvider,
      flightNo: primaryFlightNo,
      tui: responseBookingMeta.tui,
      searchKey: responseBookingMeta.searchKey,
      clientId: responseBookingMeta.clientId,
      source: responseBookingMeta.source,
      ssrSource: responseBookingMeta.ssrSource,
      tripType: responseBookingMeta.tripType,
      mode: responseBookingMeta.mode,
      options: responseBookingMeta.options,
      priceRequest: {
        provider: flightProvider,
        search_key: responseBookingMeta.searchKey,
        Trips: [
          {
            Amount: tripAmount,
            FlightID: pickFirst(
              flight?.FlightID,
              flight?.flight_id,
              flight?.flightId,
              flight?.id
            ),
            FlightNumber: primaryFlightNo,
            Origin: depCode,
            Destination: arrCode,
            DepartureDateTime: pickFirst(first?.departure?.date, flight?.departure),
            ArrivalDateTime: pickFirst(last?.arrival?.date, flight?.arrival),
            Index: tripIndex,
            OrderID: tripOrderId,
            TUI: tripTui,
          },
        ],
        ClientID: responseBookingMeta.clientId,
        Mode: responseBookingMeta.mode,
        Options: responseBookingMeta.options,
        Source: responseBookingMeta.source,
        TripType: responseBookingMeta.tripType,
      },
    },
  };
};

const buildRoundLeg = (leg, fallbackLabel, fallbackCode) => {
  const segments = toArray(leg?.segments);
  const hasSegments = segments.length > 0;
  const first = segments[0] || {};
  const last = segments[segments.length - 1] || first;

  const depCity =
    first?.departure?.city ||
    first?.from?.city ||
    first?.origin?.city ||
    parseCityFromLabel(leg?.fallbackFrom) ||
    "JAKARTA";
  const depCode =
    first?.departure?.airportCode ||
    first?.departure?.airport_code ||
    first?.from?.code ||
    deriveAirportCode(leg?.fallbackFrom) ||
    "CGK";

  const arrCity =
    last?.arrival?.city ||
    last?.to?.city ||
    last?.destination?.city ||
    parseCityFromLabel(leg?.fallbackTo) ||
    "SINGAPORE";
  const arrCode =
    last?.arrival?.airportCode ||
    last?.arrival?.airport_code ||
    last?.to?.code ||
    deriveAirportCode(leg?.fallbackTo) ||
    "SIN";

  const durationMinutes =
    parseDurationMinutes(
      pickFirst(leg?.duration_minutes, leg?.durationMinutes, leg?.duration)
    ) || 110;

  const stopsMeta = normalizeStops(
    pickFirst(leg?.stops, leg?.stop_count),
    segments.length || 1
  );
  const fromName = pickFirst(leg?.FromName, leg?.from_name);
  const toName = pickFirst(leg?.ToName, leg?.to_name);
  const departureTerminal = pickFirst(
    leg?.departureTerminal,
    leg?.departure_terminal
  );
  const arrivalTerminal = pickFirst(
    leg?.arrivalTerminal,
    leg?.arrival_terminal
  );
  const amount = readNumber(
    leg?.Amount,
    leg?.amount,
    leg?.price,
    leg?.fare?.total,
    leg?.fare?.totalFare
  );
  const index = pickFirst(
    leg?.Index,
    leg?.index,
    leg?.flightIndex,
    fallbackCode
  );
  const orderId = pickFirst(
    leg?.OrderID,
    leg?.OrderId,
    leg?.orderId,
    leg?.order_id
  );
  const tui = pickFirst(
    leg?.TUI,
    leg?.tui,
    findFirstDeepValue(
      leg,
      (key, value) =>
        String(key).toLowerCase() === "tui" &&
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  );

  const airlineItems = hasSegments
    ? pickAirlinesFromSegments(segments)
    : (() => {
        const name = pickFirst(leg?.airline, leg?.airline_name, "IndiGo");
        const rawFlightNo = pickFirst(
          leg?.flight_number,
          leg?.flightNo,
          leg?.flight_no
        );
        const carrierCode = normalizeCarrierCode(
          pickFirst(
            leg?.airline_code,
            leg?.carrier_code,
            "6E"
          )
        );
        const flightNo = normalizeFlightNo(rawFlightNo);
        const code = buildAirlineDisplayCode(carrierCode, flightNo) || carrierCode || "N/A";

        return [
          {
            name,
            code,
            carrierCode,
            flightNo,
            logo: resolveAirlineLogo({ name, code: carrierCode || code, logo: leg?.airline_logo }),
          },
        ];
      })();

  return {
    airlines: airlineItems,
    dateLabel: formatDateLabel(
      pickFirst(
        first?.departure?.date,
        first?.departure_time,
        leg?.departure_date,
        leg?.departure
      )
    ),
    departure: {
      time: formatTime(
        pickFirst(first?.departure?.time, first?.departure_time, leg?.departure)
      ),
      city: fallbackCity(depCity, depCode).toUpperCase(),
    },
    arrival: {
      time: formatTime(
        pickFirst(last?.arrival?.time, last?.arrival_time, leg?.arrival)
      ),
      city: fallbackCity(arrCity, arrCode).toUpperCase(),
    },
    duration: {
      hours: Math.floor(durationMinutes / 60),
      minutes: durationMinutes % 60,
    },
    stops: {
      type: stopsMeta.type,
    },
    details: {
      flightNo: normalizeFlightNo(
        pickFirst(
          leg?.flightNo,
          leg?.flight_no,
          leg?.flight_number,
          first?.flightNo,
          first?.flight_no,
          first?.flight_number,
          airlineItems?.[0]?.flightNo
        )
      ),
      aircraft: pickFirst(
        leg?.AirCraft,
        leg?.aircraft,
        leg?.Aircraft,
        first?.AirCraft,
        first?.aircraft,
        first?.Aircraft
      ),
      fromName,
      toName,
      departureTerminal,
      arrivalTerminal,
      segments,
      connections: pickFirst(leg?.Connections, leg?.connections),
    },
    booking: {
      provider: pickFirst(leg?.provider, leg?.Provider),
      amount,
      index,
      orderId,
      tui,
    },
    fallbackLabel,
  };
};

const buildRoundCard = (flight, index, options = {}) => {
  const {
    adults = 1,
    fallbackCabinClass = "ECONOMY",
    returnDate,
    fallbackFrom = "Jakarta (CGK)",
    fallbackTo = "Singapore (SIN)",
    responseBookingMeta = {},
  } = options;

  const legs = toArray(flight?.legs);
  const onwardLeg = flight?.onward;
  const returnLeg = flight?.return;

  const outboundLeg =
    legs[0] ||
    flight?.outbound ||
    (onwardLeg && {
      segments: toArray(onwardLeg?.segments),
      departure_date: onwardLeg?.departure,
      departure: onwardLeg?.departure,
      arrival: onwardLeg?.arrival,
      duration: onwardLeg?.duration,
      stops: onwardLeg?.stops,
      airline: onwardLeg?.airline,
      Index: pickFirst(onwardLeg?.Index, onwardLeg?.index, onwardLeg?.flightIndex),
      flightNo: pickFirst(
        onwardLeg?.flightNo,
        onwardLeg?.flight_no,
        onwardLeg?.flight_number
      ),
      Amount: pickFirst(
        onwardLeg?.Amount,
        onwardLeg?.amount,
        onwardLeg?.price,
        onwardLeg?.fare?.total,
        onwardLeg?.fare?.totalFare
      ),
      FromName: pickFirst(
        onwardLeg?.FromName,
        onwardLeg?.from_name,
        flight?.FromName,
        flight?.from_name
      ),
      ToName: pickFirst(
        onwardLeg?.ToName,
        onwardLeg?.to_name,
        flight?.ToName,
        flight?.to_name
      ),
      departureTerminal: pickFirst(
        onwardLeg?.departureTerminal,
        onwardLeg?.departure_terminal,
        flight?.departureTerminal,
        flight?.departure_terminal
      ),
      arrivalTerminal: pickFirst(
        onwardLeg?.arrivalTerminal,
        onwardLeg?.arrival_terminal,
        flight?.arrivalTerminal,
        flight?.arrival_terminal
      ),
      fallbackFrom,
      fallbackTo,
    }) || {
      segments: extractSegments(flight),
      departure_date: flight?.departure_date,
      departure: flight?.departure,
      arrival: flight?.arrival,
      duration: flight?.duration,
      stops: flight?.stops,
      airline: flight?.airline,
      Index: pickFirst(
        flight?.outbound?.Index,
        flight?.outbound?.index,
        flight?.onward?.Index,
        flight?.onward?.index,
        flight?.Index,
        flight?.index
      ),
      flightNo: pickFirst(
        flight?.outbound?.flightNo,
        flight?.outbound?.flight_no,
        flight?.outbound?.flight_number,
        flight?.onward?.flightNo,
        flight?.onward?.flight_no,
        flight?.onward?.flight_number,
        flight?.flightNo,
        flight?.flight_no,
        flight?.flight_number
      ),
      Amount: pickFirst(
        flight?.outbound?.Amount,
        flight?.outbound?.amount,
        flight?.outbound?.price,
        flight?.onward?.Amount,
        flight?.onward?.amount,
        flight?.onward?.price,
        flight?.Amount,
        flight?.amount,
        flight?.price
      ),
      FromName: pickFirst(flight?.FromName, flight?.from_name),
      ToName: pickFirst(flight?.ToName, flight?.to_name),
      departureTerminal: pickFirst(
        flight?.departureTerminal,
        flight?.departure_terminal
      ),
      arrivalTerminal: pickFirst(
        flight?.arrivalTerminal,
        flight?.arrival_terminal
      ),
      fallbackFrom,
      fallbackTo,
    };

  const inboundLeg =
    legs[1] ||
    flight?.inbound ||
    (returnLeg && {
      segments: toArray(returnLeg?.segments),
      departure_date: returnLeg?.departure,
      departure: returnLeg?.departure,
      arrival: returnLeg?.arrival,
      duration: returnLeg?.duration,
      stops: returnLeg?.stops,
      airline: returnLeg?.airline,
      Index: pickFirst(returnLeg?.Index, returnLeg?.index, returnLeg?.flightIndex),
      flightNo: pickFirst(
        returnLeg?.flightNo,
        returnLeg?.flight_no,
        returnLeg?.flight_number
      ),
      Amount: pickFirst(
        returnLeg?.Amount,
        returnLeg?.amount,
        returnLeg?.price,
        returnLeg?.fare?.total,
        returnLeg?.fare?.totalFare
      ),
      FromName: pickFirst(
        returnLeg?.FromName,
        returnLeg?.from_name,
        flight?.return?.FromName,
        flight?.return?.from_name,
        flight?.inbound?.FromName,
        flight?.inbound?.from_name
      ),
      ToName: pickFirst(
        returnLeg?.ToName,
        returnLeg?.to_name,
        flight?.return?.ToName,
        flight?.return?.to_name,
        flight?.inbound?.ToName,
        flight?.inbound?.to_name
      ),
      departureTerminal: pickFirst(
        returnLeg?.departureTerminal,
        returnLeg?.departure_terminal,
        flight?.return?.departureTerminal,
        flight?.return?.departure_terminal,
        flight?.inbound?.departureTerminal,
        flight?.inbound?.departure_terminal
      ),
      arrivalTerminal: pickFirst(
        returnLeg?.arrivalTerminal,
        returnLeg?.arrival_terminal,
        flight?.return?.arrivalTerminal,
        flight?.return?.arrival_terminal,
        flight?.inbound?.arrivalTerminal,
        flight?.inbound?.arrival_terminal
      ),
      fallbackFrom: fallbackTo,
      fallbackTo: fallbackFrom,
    }) || {
      segments: toArray(flight?.inbound_segments),
      departure_date: returnDate,
      departure: pickFirst(
        flight?.return_departure,
        flight?.inbound_departure,
        flight?.departure
      ),
      arrival: pickFirst(
        flight?.return_arrival,
        flight?.inbound_arrival,
        flight?.arrival
      ),
      duration: pickFirst(
        flight?.return_duration,
        flight?.inbound_duration,
        flight?.duration
      ),
      stops: pickFirst(flight?.return_stops, flight?.inbound_stops, flight?.stops),
      airline: pickFirst(
        flight?.return_airline,
        flight?.inbound_airline,
        flight?.airline
      ),
      Index: pickFirst(
        flight?.return?.Index,
        flight?.return?.index,
        flight?.inbound?.Index,
        flight?.inbound?.index,
        flight?.return_Index,
        flight?.return_index,
        flight?.inbound_Index,
        flight?.inbound_index,
        deriveTripIndexForOrder(pickFirst(flight?.Index, flight?.index), 2)
      ),
      flightNo: pickFirst(
        flight?.return?.flightNo,
        flight?.return?.flight_no,
        flight?.return?.flight_number,
        flight?.inbound?.flightNo,
        flight?.inbound?.flight_no,
        flight?.inbound?.flight_number,
        flight?.return_flightNo,
        flight?.return_flight_no,
        flight?.inbound_flightNo,
        flight?.inbound_flight_no
      ),
      Amount: pickFirst(
        flight?.return?.Amount,
        flight?.return?.amount,
        flight?.return?.price,
        flight?.inbound?.Amount,
        flight?.inbound?.amount,
        flight?.inbound?.price,
        flight?.Amount,
        flight?.amount,
        flight?.price
      ),
      FromName: pickFirst(
        flight?.return?.FromName,
        flight?.return?.from_name,
        flight?.inbound?.FromName,
        flight?.inbound?.from_name
      ),
      ToName: pickFirst(
        flight?.return?.ToName,
        flight?.return?.to_name,
        flight?.inbound?.ToName,
        flight?.inbound?.to_name
      ),
      departureTerminal: pickFirst(
        flight?.return?.departureTerminal,
        flight?.return?.departure_terminal,
        flight?.inbound?.departureTerminal,
        flight?.inbound?.departure_terminal
      ),
      arrivalTerminal: pickFirst(
        flight?.return?.arrivalTerminal,
        flight?.return?.arrival_terminal,
        flight?.inbound?.arrivalTerminal,
        flight?.inbound?.arrival_terminal
      ),
      fallbackFrom: fallbackTo,
      fallbackTo: fallbackFrom,
    };

  const outbound = buildRoundLeg(
    outboundLeg,
    "outbound",
    pickFirst(outboundLeg?.Index, outboundLeg?.index, flight?.Index, flight?.index)
  );
  const inbound = buildRoundLeg(
    inboundLeg,
    "inbound",
    pickFirst(
      inboundLeg?.Index,
      inboundLeg?.index,
      deriveTripIndexForOrder(pickFirst(flight?.Index, flight?.index), 2)
    )
  );

  const totalFareAmount =
    readNumber(
      flight?.fare?.total,
      flight?.fare?.totalFare,
      flight?.price?.total,
      flight?.price,
      flight?.total,
      flight?.amount
    ) || 322000;

  const perAdult =
    readNumber(flight?.fare?.pricePerAdult, flight?.price?.per_adult, flight?.pricePerAdult) ||
    Math.round(totalFareAmount / Math.max(adults, 1));
  const sharedTripTui = pickFirst(
    responseBookingMeta.tui,
    flight?.TUI,
    flight?.tui,
    findFirstDeepValue(
      flight,
      (key, value) =>
        String(key).toLowerCase() === "tui" &&
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  );
  const roundTripsPayload = [
    {
      Amount:
        readNumber(
          outbound?.booking?.amount,
          flight?.Amount,
          flight?.amount,
          totalFareAmount
        ) || 0,
      Index:
        pickFirst(
          outbound?.booking?.index,
          outboundLeg?.Index,
          outboundLeg?.index,
          flight?.Index,
          flight?.index
        ) || "",
      OrderID: "1",
      TUI: pickFirst(sharedTripTui, outbound?.booking?.tui),
      FlightID: pickFirst(
        outboundLeg?.FlightID,
        outboundLeg?.flight_id,
        outboundLeg?.flightId,
        flight?.FlightID,
        flight?.flight_id,
        flight?.flightId
      ),
      FlightNumber: outbound?.details?.flightNo || "",
      Origin: outbound?.departure?.airportCode || "",
      Destination: outbound?.arrival?.airportCode || "",
      DepartureDateTime: outbound?.departure?.date || "",
      ArrivalDateTime: outbound?.arrival?.date || "",
      flight_no: outbound?.details?.flightNo || "",
    },
    {
      Amount:
        readNumber(
          inbound?.booking?.amount,
          flight?.return?.Amount,
          flight?.return?.amount,
          flight?.inbound?.Amount,
          flight?.inbound?.amount,
          totalFareAmount
        ) || 0,
      Index:
        pickFirst(
          inbound?.booking?.index,
          inboundLeg?.Index,
          inboundLeg?.index,
          flight?.return?.Index,
          flight?.return?.index,
          flight?.inbound?.Index,
          flight?.inbound?.index,
          deriveTripIndexForOrder(pickFirst(flight?.Index, flight?.index), 2)
        ) || "",
      OrderID: "2",
      TUI: pickFirst(sharedTripTui, inbound?.booking?.tui),
      FlightID: pickFirst(
        inboundLeg?.FlightID,
        inboundLeg?.flight_id,
        inboundLeg?.flightId,
        flight?.return?.FlightID,
        flight?.return?.flight_id,
        flight?.return?.flightId,
        flight?.inbound?.FlightID,
        flight?.inbound?.flight_id,
        flight?.inbound?.flightId
      ),
      FlightNumber: inbound?.details?.flightNo || "",
      Origin: inbound?.departure?.airportCode || "",
      Destination: inbound?.arrival?.airportCode || "",
      DepartureDateTime: inbound?.departure?.date || "",
      ArrivalDateTime: inbound?.arrival?.date || "",
      flight_no: inbound?.details?.flightNo || "",
    },
  ];

  const fare = {
    totalFare: formatCurrency(totalFareAmount),
    pricePerAdult: formatCurrency(perAdult),
    cabinClass:
      flight?.fare?.cabinClass ||
      flight?.cabinClass ||
      flight?.travel_class ||
      fallbackCabinClass,
  };

  return {
    id: flight?.id || flight?.index || `round-${index + 1}`,
    fare: {
      totalFare: fare.totalFare,
      cabinClass: fare.cabinClass,
    },
    outbound,
    inbound,
    tripCard: {
      id: flight?.id || flight?.index || `round-${index + 1}`,
      depart: {
        airline: {
          name: outbound.airlines[0]?.name || "IndiGo",
          code: outbound.details?.flightNo || outbound.airlines[0]?.code || "N/A",
          carrierCode: outbound.airlines[0]?.carrierCode || "",
          flightNo: outbound.details?.flightNo || outbound.airlines[0]?.flightNo || "",
          logo: outbound.airlines[0]?.logo || DEFAULT_LOGO,
        },
        date: outbound.dateLabel,
        flight: {
          departure: outbound.departure,
          arrival: outbound.arrival,
          duration: outbound.duration,
          stops: outbound.stops,
          details: outbound.details,
        },
      },
      return: {
        airline: {
          name: inbound.airlines[0]?.name || "IndiGo",
          code: inbound.details?.flightNo || inbound.airlines[0]?.code || "N/A",
          carrierCode: inbound.airlines[0]?.carrierCode || "",
          flightNo: inbound.details?.flightNo || inbound.airlines[0]?.flightNo || "",
          logo: inbound.airlines[0]?.logo || DEFAULT_LOGO,
        },
        date: inbound.dateLabel,
      flight: {
          departure: inbound.departure,
          arrival: inbound.arrival,
          duration: inbound.duration,
          stops: inbound.stops,
          details: inbound.details,
        },
      },
      fare,
      booking: {
        provider: pickFirst(flight?.provider, flight?.Provider, responseBookingMeta.provider),
        tui: responseBookingMeta.tui,
        searchKey: responseBookingMeta.searchKey,
        clientId: responseBookingMeta.clientId,
        source: responseBookingMeta.source,
        ssrSource: responseBookingMeta.ssrSource,
        tripType: "RT",
        mode: responseBookingMeta.mode,
        options: responseBookingMeta.options,
        priceRequest: {
          provider: pickFirst(flight?.provider, flight?.Provider, responseBookingMeta.provider),
          search_key: responseBookingMeta.searchKey,
          Trips: roundTripsPayload,
          ClientID: responseBookingMeta.clientId,
          Mode: responseBookingMeta.mode,
          Options: responseBookingMeta.options,
          Source: responseBookingMeta.source,
          TripType: "RT",
        },
      },
    },
  };
};

const extractSortHighlight = (payload, key) => {
  const source =
    payload?.[key] ||
    payload?.data?.[key] ||
    payload?.meta?.[key] ||
    null;

  if (!source || typeof source !== "object") return null;

  const durationMinutes = parseDurationMinutes(
    pickFirst(source?.duration_minutes, source?.durationMinutes, source?.duration)
  );
  const priceAmount = readNumber(
    source?.price,
    source?.fare?.total,
    source?.fare?.totalFare,
    source?.pricePerAdult
  );

  return {
    id: pickFirst(source?.id, source?.index),
    index: source?.index,
    airlineName: pickFirst(source?.airline, source?.airline_name, "IndiGo"),
    departure: source?.departure,
    arrival: source?.arrival,
    stops: source?.stops,
    refundable: source?.refundable,
    priceValue: priceAmount,
    priceLabel:
      priceAmount !== null && priceAmount !== undefined
        ? formatCurrency(priceAmount)
        : "",
    durationLabel:
      durationMinutes !== null ? formatDurationLabel(durationMinutes) : "",
    durationMinutes,
  };
};

const toRoundOrMultiItem = (item) => ({
  id: item.id,
  fare: item.fare,
  outbound: item.outbound,
  inbound: item.inbound,
});

const buildMultiCard = (flight, index, options = {}) => {
  const { legs } = flight || {};
  if (Array.isArray(legs) && legs.length >= 2) {
    const [firstLeg, secondLeg] = legs;
    return buildRoundCard(
      {
        ...flight,
        onward: firstLeg,
        return: secondLeg,
      },
      index,
      options
    );
  }

  return buildRoundCard(flight, index, options);
};

export const mapFlightSearchResponse = ({
  response,
  tripType,
  passengers,
  travelClass,
  returnDate,
  fromLabel,
  toLabel,
  page,
  limit,
}) => {
  const payload = response?.data || response || {};

  const flights =
    Array.isArray(payload)
      ? payload
      : getFirstArrayAtPaths(payload, [
          ["data", "flights"],
          ["data", "results"],
          ["data", "itineraries"],
          ["flights"],
          ["results"],
          ["itineraries"],
          ["data"],
        ]);

  const adults = Number(passengers?.adult || 1);
  const pagination = extractPagination(payload, flights.length, page, limit);
  const sortHighlights = {
    cheapest: extractSortHighlight(payload, "cheapest"),
    fastest: extractSortHighlight(payload, "fastest"),
  };
  const responseBookingMeta = extractResponseBookingMeta(payload, tripType);

  if (tripType === "oneway") {
    return {
      oneway: flights.map((flight, index) =>
        buildOneWayCard(flight, index, {
          adults,
          fallbackCabinClass: travelClass,
          fallbackFrom: fromLabel || "Jakarta (CGK)",
          fallbackTo: toLabel || "Singapore (SIN)",
          responseBookingMeta,
        })
      ),
      round: [],
      roundTripCards: [],
      multi: [],
      multiTripCards: [],
      pagination,
      raw: payload,
      sortHighlights,
    };
  }

  if (tripType === "round") {
    const roundMapped = flights.map((flight, index) =>
      buildRoundCard(flight, index, {
        adults,
        fallbackCabinClass: travelClass,
        returnDate,
        fallbackFrom: fromLabel || "Jakarta (CGK)",
        fallbackTo: toLabel || "Singapore (SIN)",
        responseBookingMeta,
      })
    );
    const roundItems = roundMapped.map(toRoundOrMultiItem);
    const roundTripCards = roundMapped.map((item) => item.tripCard);

    return {
      oneway: [],
      round: roundItems,
      roundTripCards,
      multi: [],
      multiTripCards: [],
      pagination,
      raw: payload,
      sortHighlights,
    };
  }

  if (tripType === "multi") {
    const multiMapped = flights.map((flight, index) =>
      buildMultiCard(flight, index, {
        adults,
        fallbackCabinClass: travelClass,
        returnDate,
        fallbackFrom: fromLabel || "Jakarta (CGK)",
        fallbackTo: toLabel || "Singapore (SIN)",
        responseBookingMeta,
      })
    );
    const multiItems = multiMapped.map(toRoundOrMultiItem);
    const multiTripCards = multiMapped.map((item) => item.tripCard);

    return {
      oneway: [],
      round: [],
      roundTripCards: [],
      multi: multiItems,
      multiTripCards,
      pagination,
      raw: payload,
      sortHighlights,
    };
  }

  return {
    oneway: [],
    round: [],
    roundTripCards: [],
    multi: [],
    multiTripCards: [],
    pagination,
    raw: payload,
    sortHighlights,
  };
};

export const buildSearchParams = ({
  tripType,
  from,
  to,
  fromCode,
  toCode,
  startDate,
  endDate,
  passengers,
  travelClass,
  fareTypes,
  searchParams,
  filters,
}) => {
  const base = {};
  const urlParams = searchParams || {};
  const currentFilters = filters || {};
  const selectedFareTypes = Array.isArray(fareTypes) ? fareTypes : [];
  const selectedDepartureSlot = SLOT_KEY_MAP[currentFilters.departureJakarta];
  const selectedArrivalSlot = SLOT_KEY_MAP[currentFilters.departureSingapore];

  const originCode = fromCode || deriveAirportCode(from);
  const destinationCode = toCode || deriveAirportCode(to);

  base.origin = originCode || urlParams.origin || "";
  base.destination = destinationCode || urlParams.destination || "";
  base.departure_date = normalizeDateParam(
    startDate || urlParams.departure_date || ""
  );

  if (tripType === "round") {
    base.return_date = normalizeDateParam(
      endDate || urlParams.return_date || ""
    );
  }

  base.adults = passengers?.adult ?? Number(urlParams.adults ?? 1);
  base.children = passengers?.child ?? Number(urlParams.children ?? 0);
  base.infants = passengers?.infant ?? Number(urlParams.infants ?? 0);

  // Match backend contract exactly
  base.cabin_class = mapCabinClassToApi(
    travelClass || urlParams.cabin_class || "economy"
  );
  const selectedAirlines = Object.entries(currentFilters.airlines || {})
    .filter(([, checked]) => Boolean(checked))
    .map(([name]) => name);

  const selectedAircraft = Object.entries(currentFilters.aircraft || {})
    .filter(([, checked]) => Boolean(checked))
    .map(([name]) => name);

  const priceRange = Array.isArray(currentFilters.price)
    ? currentFilters.price
    : null;
  const hasUrlPriceRange =
    urlParams.min_price !== undefined ||
    urlParams.max_price !== undefined;
  const shouldApplyPriceRange =
    Boolean(currentFilters.priceTouched) || hasUrlPriceRange;

  const stops = currentFilters.stops || {};
  const popular = currentFilters.popular || {};
  const selectedStops = [];
  const hasNonStopSelected = Boolean(stops.nonStop || popular.nonStop);
  const hasOneStopSelected = Boolean(stops.oneStop || popular.oneStop);
  const hasTwoPlusSelected = Boolean(stops.twoPlus);

  if (hasNonStopSelected) selectedStops.push(0);
  if (hasOneStopSelected) selectedStops.push(1);
  if (hasTwoPlusSelected) selectedStops.push(2);

  base.provider = urlParams.provider || "akbar";
  base.page = Number(urlParams.page ?? 1);
  base.limit = Number(urlParams.limit ?? 20);
  if (selectedStops.length > 0) {
    base.stops =
      selectedStops.length === 1 ? selectedStops[0] : selectedStops.join(",");
  } else if (
    !currentFilters.stopsTouched &&
    urlParams.stops !== undefined &&
    urlParams.stops !== ""
  ) {
    base.stops = urlParams.stops;
  }
  base.airlines =
    selectedAirlines.length > 0
      ? selectedAirlines.join(",")
      : (urlParams.airlines || "");
  if (shouldApplyPriceRange) {
    const minPrice = Number(priceRange?.[0] ?? urlParams.min_price);
    const maxPrice = Number(priceRange?.[1] ?? urlParams.max_price);

    if (Number.isFinite(minPrice)) base.min_price = minPrice;
    if (Number.isFinite(maxPrice)) base.max_price = maxPrice;
  }
  // Avoid forcing refundable for RT requests; backend returns 500 for some RT+refundable combinations.
  if (
    (currentFilters.popularTouched || urlParams.refundable !== undefined) &&
    tripType !== "round" &&
    currentFilters.popular?.refundable
  ) {
    base.refundable = true;
  }
  // Send aircraft codes as comma-separated multi value in `aircrafts`.
  base.aircrafts =
    selectedAircraft.length > 0 ? selectedAircraft.join(",") : (urlParams.aircrafts || "");
  base.departure_slots = selectedDepartureSlot || urlParams.departure_slots || "";
  base.arrival_slots = selectedArrivalSlot || urlParams.arrival_slots || "";
  if (currentFilters.popular?.lateDeparture) {
    base.late_departure = 1;
  }
  const hasSeniorCitizenFare =
    selectedFareTypes.includes("SENIOR CITIZEN");
  const hasStudentFare = selectedFareTypes.includes("STUDENT");

  if (hasSeniorCitizenFare) {
    base.IsSeniorCitizen = true;
  }
  if (hasStudentFare) {
    base.IsStudentFare = true;
  }
  if (Number(urlParams.late_arrival) === 1) {
    base.late_arrival = 1;
  }
  const resolvedSortBy = mapSortOptionToApi(currentFilters.sortBy || urlParams.sort_by);
  if (resolvedSortBy) {
    base.sort_by = resolvedSortBy;
  }
  base.domain = urlParams.domain || getDefaultDomain();
  base.fareType = tripType === "round" ? "RT" : "ON";

  return base;
};

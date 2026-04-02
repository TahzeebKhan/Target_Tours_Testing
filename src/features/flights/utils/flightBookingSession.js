"use client";

let inMemoryFlightBookingSession = null;

const readNumber = (...values) => {
  for (const value of values) {
    const normalized =
      typeof value === "string"
        ? Number(value.replace(/[^\d.]/g, ""))
        : Number(value);
    if (Number.isFinite(normalized)) return normalized;
  }
  return null;
};

const pickFirst = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
};

const extractTrips = (payload) => {
  if (Array.isArray(payload?.Trips)) return payload.Trips;
  if (Array.isArray(payload?.trips)) return payload.trips;
  if (Array.isArray(payload?.data?.Trips)) return payload.data.Trips;
  if (Array.isArray(payload?.data?.trips)) return payload.data.trips;
  return [];
};

const extractPrimaryTrip = (payload) => extractTrips(payload)[0] || null;
const unwrapPayload = (payload) => payload?.data || payload || {};

const getFormattedJourneys = (payload) => {
  const normalized = unwrapPayload(payload);
  if (Array.isArray(normalized?.formatted?.journeys)) return normalized.formatted.journeys;
  if (Array.isArray(normalized?.journeys)) return normalized.journeys;
  if (Array.isArray(normalized?.formattedJourneys)) return normalized.formattedJourneys;
  return [];
};

const parseDuration = (value) => {
  const text = String(value || "").trim();
  const match = text.match(/(\d+)\s*h\s*(\d+)\s*m/i);
  if (match) {
    return {
      hours: match[1],
      minutes: match[2],
    };
  }
  return { hours: "00", minutes: "00" };
};

const formatDateLabel = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatHeaderDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
};

const formatTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  const match = String(value).match(/(\d{2}:\d{2})/);
  return match ? match[1] : "N/A";
};

const compactAirportName = (value, fallback = "N/A") => {
  const text = String(value || "").trim();
  if (!text) return fallback;
  return (
    text
      .split("|")[0]
      ?.trim()
      .split(",")
      .map((part) => part.trim())
      .find(Boolean) || fallback
  );
};

const splitAirportMeta = (value, fallback = "N/A") => {
  const text = String(value || "").trim();
  if (!text) {
    return {
      airportName: fallback,
      cityName: fallback,
    };
  }

  const [airportPart, cityPart] = text.split("|").map((part) => part?.trim()).filter(Boolean);

  return {
    airportName: airportPart || fallback,
    cityName: cityPart || airportPart || fallback,
  };
};

const normalizeTerminal = (value) => {
  const text = String(value || "").trim();
  return text ? `Terminal ${text}` : "Terminal N/A";
};

const normalizeTravelClass = (value, selectedFare) => {
  const text = String(value || "").trim().toUpperCase();
  if (text === "E" || text === "ECONOMY") return "Economy";
  if (text === "B" || text === "BUSINESS") return "Business";
  if (text === "F" || text === "FIRST") return "First Class";

  const fareName = String(selectedFare?.name || "").toUpperCase();
  if (fareName.includes("PREMIUM")) return "Premium";
  return "Economy";
};

const parseRouteLabel = (value) => {
  const text = String(value || "").trim();
  const match = text.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return {
    city: match?.[1]?.trim() || text || "N/A",
    code: match?.[2]?.trim() || "",
  };
};

const buildFlightCard = (source, selectedFare) => {
  if (!source || typeof source !== "object") return null;

  const departureCode = String(
    source?.origin || source?.from || source?.departureCode || ""
  )
    .trim()
    .toUpperCase();
  const arrivalCode = String(
    source?.destination || source?.to || source?.arrivalCode || ""
  )
    .trim()
    .toUpperCase();
  const departureMeta = splitAirportMeta(
    source?.dep_airport_name || source?.fromName || source?.FromName,
    departureCode || "N/A"
  );
  const arrivalMeta = splitAirportMeta(
    source?.arr_airport_name || source?.toName || source?.ToName,
    arrivalCode || "N/A"
  );
  const stopCount = Number(source?.stops);

  return {
    airline: {
      name: source?.airline || "N/A",
      code: String(source?.flightNo || source?.flight_no || "N/A").trim(),
      logo: "/images/Flight.png",
    },
    aircraft: source?.aircraft || source?.AirCraft || "N/A",
    flexiPlusFare: selectedFare?.name || "",
    travelClass: normalizeTravelClass(
      source?.cabin || source?.cabinClass || source?.travelClass,
      selectedFare
    ),
    departure: {
      date: formatDateLabel(source?.departure),
      time: formatTime(source?.departure),
      airport: `${departureCode || "N/A"} - ${departureMeta.cityName.toUpperCase()}`,
      terminal: normalizeTerminal(source?.terminal?.departure || source?.departureTerminal),
      city: departureMeta.airportName,
    },
    arrival: {
      date: formatDateLabel(source?.arrival),
      time: formatTime(source?.arrival),
      airport: `${arrivalCode || "N/A"} - ${arrivalMeta.cityName.toUpperCase()}`,
      terminal: normalizeTerminal(source?.terminal?.arrival || source?.arrivalTerminal),
      city: arrivalMeta.airportName,
    },
    duration: parseDuration(source?.duration),
    stops: Number.isFinite(stopCount) ? (stopCount === 0 ? "Non Stop" : `${stopCount} Stop`) : "Non Stop",
  };
};

const buildSelectedFlightCard = (selectedFlight, selectedFare) => {
  if (!selectedFlight || typeof selectedFlight !== "object") return null;

  const departureRoute = parseRouteLabel(selectedFlight?.departure?.city);
  const arrivalRoute = parseRouteLabel(selectedFlight?.arrival?.city);
  const details = selectedFlight?.details || {};

  return {
    airline: {
      name: selectedFlight?.airlines?.[0]?.name || details?.airline || "N/A",
      code: selectedFlight?.airlines?.[0]?.code || "N/A",
      logo: selectedFlight?.airlines?.[0]?.logo || "/images/Flight.png",
    },
    aircraft: details?.aircraft || "N/A",
    flexiPlusFare: selectedFare?.name || "",
    travelClass: normalizeTravelClass(selectedFlight?.fare?.cabinClass, selectedFare),
    departure: {
      date: formatDateLabel(details?.departureDateTime),
      time: selectedFlight?.departure?.time || "N/A",
      airport: `${departureRoute.code || "N/A"} - ${(departureRoute.city || "N/A").toUpperCase()}`,
      terminal: normalizeTerminal(details?.departureTerminal),
      city: compactAirportName(details?.fromName, departureRoute.city || "N/A"),
    },
    arrival: {
      date: formatDateLabel(details?.arrivalDateTime),
      time: selectedFlight?.arrival?.time || "N/A",
      airport: `${arrivalRoute.code || "N/A"} - ${(arrivalRoute.city || "N/A").toUpperCase()}`,
      terminal: normalizeTerminal(details?.arrivalTerminal),
      city: compactAirportName(details?.toName, arrivalRoute.city || "N/A"),
    },
    duration: {
      hours: selectedFlight?.duration?.hours || "00",
      minutes: selectedFlight?.duration?.minutes || "00",
    },
    stops: selectedFlight?.stops?.type || "Non Stop",
  };
};

const buildRoundSelectedFlightCard = (selectedFlight, selectedFare, legKey) => {
  const segmentWrapper =
    legKey === "return"
      ? selectedFlight?.return || selectedFlight?.tripCard?.return
      : selectedFlight?.depart || selectedFlight?.tripCard?.depart;
  const leg =
    legKey === "return"
      ? selectedFlight?.inbound ||
        selectedFlight?.return?.flight ||
        selectedFlight?.tripCard?.return?.flight
      : selectedFlight?.outbound ||
        selectedFlight?.depart?.flight ||
        selectedFlight?.tripCard?.depart?.flight;

  if (!leg || typeof leg !== "object") return null;

  const departureLabel = String(leg?.departure?.city || "").trim();
  const arrivalLabel = String(leg?.arrival?.city || "").trim();
  const departureRoute = parseRouteLabel(departureLabel);
  const arrivalRoute = parseRouteLabel(arrivalLabel);
  const details = leg?.details || {};
  const airlineSource =
    segmentWrapper?.airline ||
    selectedFlight?.airline ||
    {};
  const departureAirportCode =
    departureRoute.code ||
    String(departureLabel.split("-")[0] || "")
      .trim()
      .toUpperCase();
  const arrivalAirportCode =
    arrivalRoute.code ||
    String(arrivalLabel.split("-")[0] || "")
      .trim()
      .toUpperCase();
  const departureCityLabel = departureRoute.city || departureLabel || "N/A";
  const arrivalCityLabel = arrivalRoute.city || arrivalLabel || "N/A";

  return {
    airline: {
      name: airlineSource?.name || "N/A",
      code: airlineSource?.code || "N/A",
      logo: airlineSource?.logo || "/images/Flight.png",
    },
    aircraft: details?.aircraft || leg?.aircraft || "N/A",
    flexiPlusFare: selectedFare?.name || "",
    travelClass: normalizeTravelClass(
      selectedFlight?.fare?.cabinClass || leg?.fare?.cabinClass || leg?.travelClass,
      selectedFare
    ),
    departure: {
      date:
        segmentWrapper?.date ||
        leg?.dateLabel ||
        leg?.date ||
        formatDateLabel(details?.departureDateTime),
      time: leg?.departure?.time || "N/A",
      airport: `${departureAirportCode || "N/A"} - ${departureCityLabel.toUpperCase()}`,
      terminal: normalizeTerminal(details?.departureTerminal),
      city: compactAirportName(details?.fromName, departureCityLabel),
    },
    arrival: {
      date:
        segmentWrapper?.date ||
        leg?.dateLabel ||
        leg?.date ||
        formatDateLabel(details?.arrivalDateTime),
      time: leg?.arrival?.time || "N/A",
      airport: `${arrivalAirportCode || "N/A"} - ${arrivalCityLabel.toUpperCase()}`,
      terminal: normalizeTerminal(details?.arrivalTerminal),
      city: compactAirportName(details?.toName, arrivalCityLabel),
    },
    duration: {
      hours: leg?.duration?.hours || "00",
      minutes: leg?.duration?.minutes || "00",
    },
    stops: leg?.stops?.type || "Non Stop",
  };
};

export const readFlightBookingSession = () => {
  return inMemoryFlightBookingSession;
};

export const writeFlightBookingSession = (value) => {
  inMemoryFlightBookingSession = value || null;
};

export const mergeFlightBookingSession = (patch) => {
  const current = readFlightBookingSession() || {};
  const next = {
    ...current,
    ...patch,
  };
  writeFlightBookingSession(next);
  return next;
};

export const buildSsrPayload = (session) => {
  const priceResponse = session?.priceResponse || {};
  const priceRequest = session?.priceRequest || {};
  const selectedFlight = session?.selectedFlight || {};
  const requestTrips = extractTrips(priceRequest);
  const flightBooking = selectedFlight?.booking || {};
  const rootTui = pickFirst(
    priceResponse?.tui,
    priceResponse?.TUI,
    priceResponse?.data?.tui,
    priceResponse?.data?.TUI
  );

  return {
    search_key: pickFirst(
      priceRequest?.search_key,
      priceResponse?.search_key,
      priceResponse?.SearchKey,
      priceResponse?.data?.search_key,
      flightBooking?.searchKey
    ),
    PaidSSR: true,
    ClientID: pickFirst(
      priceRequest?.ClientID,
      priceResponse?.ClientID,
      priceResponse?.clientId,
      priceResponse?.data?.ClientID,
      flightBooking?.clientId
    ),
    Source: pickFirst(
      flightBooking?.ssrSource,
      priceRequest?.Source,
      "LV"
    ),
    FareType: pickFirst(
      priceRequest?.FareType,
      "N"
    ),
    Trips: (requestTrips.length > 0 ? requestTrips : [extractPrimaryTrip(priceRequest) || {}]).map(
      (requestTrip, index) => ({
        Amount: 0,
        Index: "",
        OrderID: pickFirst(
          requestTrip?.OrderID,
          requestTrip?.orderId,
          requestTrip?.OrderId,
          String(index + 1)
        ),
        TUI: pickFirst(
          rootTui,
          requestTrip?.TUI,
          requestTrip?.tui
        ),
      })
    ),
  };
};

export const extractBaseFareAmount = (session) => {
  const priceResponse = session?.priceResponse || {};
  const priceRequest = session?.priceRequest || {};
  const primaryTrip = extractPrimaryTrip(priceResponse) || extractPrimaryTrip(priceRequest) || {};

  return (
    readNumber(
      priceResponse?.BaseFare,
      priceResponse?.baseFare,
      priceResponse?.data?.BaseFare,
      priceResponse?.Fare?.BaseFare,
      priceResponse?.fare?.baseFare,
      primaryTrip?.Amount,
      session?.selectedFlight?.fare?.pricePerAdult,
      session?.selectedFlight?.fare?.totalFare
    ) || 5200
  );
};

export const getBookingDetailsView = (session) => {
  const payload = unwrapPayload(session?.priceResponse);
  const selectedFare = session?.selectedFare || null;
  const selectedFlight = session?.selectedFlight || null;
  const routeContext = session?.routeContext || {};
  const journeys = getFormattedJourneys(payload);
  const departureJourney =
    journeys.find((journey) => String(journey?.journey_type || "").toUpperCase() === "ONWARD") ||
    journeys[0] ||
    null;
  const returnJourney =
    journeys.find((journey) => String(journey?.journey_type || "").toUpperCase() === "RETURN") ||
    journeys[1] ||
    null;
  const departureSource =
    departureJourney?.flight_details || payload?.depart || payload?.departure_details || payload;
  const returnSource =
    returnJourney?.flight_details || payload?.return || payload?.return_details || null;

  const isSelectedRoundTrip = Boolean(
    selectedFlight?.outbound ||
      selectedFlight?.inbound ||
      selectedFlight?.depart?.flight ||
      selectedFlight?.return?.flight ||
      selectedFlight?.tripCard?.depart?.flight ||
      selectedFlight?.tripCard?.return?.flight
  );
  const selectedDepartureFlight = isSelectedRoundTrip
    ? buildRoundSelectedFlightCard(selectedFlight, selectedFare, "depart")
    : buildSelectedFlightCard(selectedFlight, selectedFare);
  const selectedReturnFlight = isSelectedRoundTrip
    ? buildRoundSelectedFlightCard(selectedFlight, selectedFare, "return")
    : null;
  const departureFlight = selectedDepartureFlight || buildFlightCard(departureSource, selectedFare);
  const returnFlight = selectedReturnFlight || buildFlightCard(returnSource, selectedFare);
  const selectedDepartureRoute = isSelectedRoundTrip
    ? parseRouteLabel(
        selectedFlight?.outbound?.departure?.city ||
          selectedFlight?.depart?.flight?.departure?.city ||
          selectedFlight?.tripCard?.depart?.flight?.departure?.city
      )
    : parseRouteLabel(selectedFlight?.departure?.city);
  const selectedArrivalRoute = isSelectedRoundTrip
    ? parseRouteLabel(
        selectedFlight?.outbound?.arrival?.city ||
          selectedFlight?.depart?.flight?.arrival?.city ||
          selectedFlight?.tripCard?.depart?.flight?.arrival?.city
      )
    : parseRouteLabel(selectedFlight?.arrival?.city);
  const routeFrom =
    String(
      routeContext?.fromCode ||
      selectedDepartureRoute.code ||
      departureFlight?.departure?.airport?.split("-")[0] ||
      departureSource?.origin ||
      departureSource?.from ||
      ""
    ).trim().toUpperCase();
  const routeTo =
    String(
      routeContext?.toCode ||
      selectedArrivalRoute.code ||
      departureFlight?.arrival?.airport?.split("-")[0] ||
      (returnSource?.to || returnSource?.destination || "") ||
        departureSource?.destination ||
        departureSource?.to ||
        ""
    )
      .trim()
      .toUpperCase();
  const headerFrom = splitAirportMeta(
    routeContext?.fromName ||
      selectedFlight?.details?.fromName ||
      selectedDepartureFlight?.departure?.city ||
      departureSource?.dep_airport_name ||
      departureSource?.fromName ||
      departureSource?.FromName,
    routeFrom || "N/A"
  ).cityName;
  const headerTo = splitAirportMeta(
    routeContext?.toName ||
      selectedFlight?.details?.toName ||
      selectedDepartureFlight?.arrival?.city ||
      (returnSource?.arr_airport_name || returnSource?.toName || returnSource?.ToName) ||
      departureSource?.arr_airport_name ||
      departureSource?.toName ||
      departureSource?.ToName,
    routeTo || "N/A"
  ).cityName;
  const summaryDuration = departureFlight?.duration || { hours: "00", minutes: "00" };

  return {
    isRoundTrip: Boolean(returnFlight),
    header: {
      fromName: headerFrom,
      fromCode: routeFrom,
      toName: headerTo,
      toCode: routeTo,
      date: formatHeaderDate(
        selectedFlight?.details?.departureDateTime ||
          selectedDepartureFlight?.departure?.date ||
          departureSource?.departure
      ),
      stops: departureFlight?.stops || "N/A",
      duration: `${summaryDuration.hours} h ${summaryDuration.minutes} m`,
      cabinClass: departureFlight?.travelClass || "Economy",
    },
    departureFlight,
    returnFlight,
  };
};

export const buildCreateItineraryPayload = (session, prices) => {
  const priceResponse = unwrapPayload(session?.priceResponse);
  const fareBreakdown = Array.isArray(priceResponse?.fare_breakdown)
    ? priceResponse.fare_breakdown
    : Array.isArray(priceResponse?.formatted?.fare_breakdown)
      ? priceResponse.formatted.fare_breakdown
      : [];
  const fareBreakdownTotal = fareBreakdown.reduce((sum, item) => {
    const value = readNumber(item?.total_journey_price);
    return sum + (value ?? 0);
  }, 0);
  const finalPrice = readNumber(
    fareBreakdownTotal > 0 ? fareBreakdownTotal : null,
    priceResponse?.formatted?.final_price,
    priceResponse?.final_price,
    priceResponse?.formatted?.finalPrice
  );
  const contact = session?.bookingContactDetails || {};
  const travelers = Array.isArray(session?.travelerDetails)
    ? session.travelerDetails
    : [];
  const baggageSelections = Array.isArray(session?.baggage) ? session.baggage : [];
  const mealSelections = Array.isArray(session?.meals) ? session.meals : [];
  const primaryTraveler = travelers[0] || {};
  const contactMobile = pickFirst(contact.MobileNumber, primaryTraveler.MobileNumber, "");
  const contactCountryCode = pickFirst(
    contact.CountryCode,
    primaryTraveler.CountryCode,
    ""
  );
  const totalPassengers = Math.max(travelers.length, 1);
  const ssrSelections = [...baggageSelections, ...mealSelections];
  const ssrPayload = ssrSelections
    .map((item, index) => {
      const paxId = (index % totalPassengers) + 1;
      const fuid = readNumber(item?.fuid, item?.FUID);
      const ssid = readNumber(item?.ssid, item?.SSID, item?.id);

      if (!Number.isFinite(fuid) || !Number.isFinite(ssid)) {
        return null;
      }

      return {
        FUID: fuid,
        PaxID: paxId,
        SSID: ssid,
      };
    })
    .filter(Boolean);
  const ssrAmount = ssrSelections.reduce((sum, item) => {
    const value = readNumber(item?.price, item?.Price, item?.amount, item?.Amount);
    return sum + (value ?? 0);
  }, 0);

  return {
    TUI: pickFirst(
      priceResponse?.tui,
      priceResponse?.TUI,
      session?.ssrResponse?.data?.tui,
      session?.ssrResponse?.tui,
      ""
    ),
    BookingType: "HB",
    ContactInfo: {
      Title: pickFirst(contact.Title, primaryTraveler.Title, ""),
      FName: pickFirst(contact.FName, primaryTraveler.FName, ""),
      LName: pickFirst(contact.LName, primaryTraveler.LName, ""),
      Mobile: contactMobile,
      Phone: pickFirst(contact.Phone, contactMobile, ""),
      Email: pickFirst(contact.Email, primaryTraveler.Email, ""),
      Address: contact.Address || "",
      CountryCode: "IN",
      State: contact.State || "",
      City: contact.City || "",
      PIN: contact.PIN || "",
      GSTCompanyName: "",
      GSTTIN: "",
      GSTMobile: "",
      GSTEmail: "",
      UpdateProfile: false,
      IsGuest: false,
      SaveGST: false,
    },
    Travellers: travelers.map((traveler, index) => ({
      ID: index + 1,
      Title: traveler.Title || "",
      FName: traveler.FName || "",
      LName: traveler.LName || "",
      Age: traveler.Age ? Number(traveler.Age) : "",
      DOB: traveler.DOB || "",
      Gender: traveler.Gender || "",
      PTC: traveler.PTC || "",
      Nationality: traveler.Nationality || "",
      PassportNo: traveler.PassportNo || "",
      PLI: traveler.PLI || "",
      PDOE: traveler.PDOE || "",
      VisaType: traveler.VisaType || "",
    })),
    PLP: [],
    SSR: ssrPayload,
    CrossSell: [],
    NetAmount: Number(finalPrice ?? prices?.total ?? 0),
    SSRAmount: ssrAmount,
    ClientID: "",
    DeviceID: "",
    AppVersion: "",
    CrossSellAmount: 0,
  };
};

export const buildStartPaymentPayload = (session) => {
  const createItineraryResponse = session?.createItineraryResponse || {};
  const raw =
    createItineraryResponse?.data?.raw ||
    createItineraryResponse?.raw ||
    {};
  const itineraryTui = String(raw?.TUI || "").trim();
  const itineraryTransactionId = raw?.TransactionID ?? "";
  const itineraryNetAmount = readNumber(
    raw?.NetAmount
  );

  return {
    domain: process.env.NEXT_PUBLIC_DOMAIN || "",
    TUI: itineraryTui,
    ClientID: process.env.NEXT_PUBLIC_ClientID?.replace(/^"|"$/g, "") || "",
    TransactionID: itineraryTransactionId,
    PaymentType: "",
    PaymentAmount: 0,
    NetAmount: itineraryNetAmount ?? 0,
    BrowserKey: null,
    Hold: true,
    Promo: null,
    BankCode: "",
    GateWayCode: "",
    MerchantID: "",
    PaymentCharge: 0,
    ReleaseDate: "",
    CardType: "default",
    OnlinePayment: false,
    DepositPayment: true,
    VPA: "",
    CardAlias: "",
    QuickPay: null,
    BookingType: "HP",
    RMSSignature: "",
    TargetCurrency: "",
    TargetAmount: 0,
    ServiceType: "ITI",
    Card: {
      Number: "",
      Expiry: "",
      CVV: "",
      CHName: "",
      Address: "",
      City: "",
      State: "",
      Country: "",
      PIN: "",
      International: false,
      SaveCard: false,
      FName: "",
      LName: "",
      EMIMonths: "0",
    },
  };
};

export const buildRetrieveBookingPayload = (session) => {
  const startPaymentResponse = session?.startPaymentResponse || {};
  const startPaymentData = startPaymentResponse?.data || {};
  const createItineraryResponse = session?.createItineraryResponse || {};
  const createRaw =
    createItineraryResponse?.data?.raw ||
    createItineraryResponse?.raw ||
    {};

  return {
    domain: process.env.NEXT_PUBLIC_DOMAIN || "",
    ReferenceNumber: pickFirst(
      startPaymentData?.transactionId,
      startPaymentData?.TransactionID,
      startPaymentData?.BookingID,
      startPaymentData?.bookingId,
      startPaymentData?.ReferenceNumber,
      startPaymentData?.referenceNumber,
      ""
    ),
    ReferenceType: "T",
    ClientID: process.env.NEXT_PUBLIC_ClientID?.replace(/^"|"$/g, "") || "",
    TUI: String(
      pickFirst(
        startPaymentData?.TUI,
        startPaymentData?.tui,
        createRaw?.TUI,
        ""
      )
    ).trim(),
  };
};

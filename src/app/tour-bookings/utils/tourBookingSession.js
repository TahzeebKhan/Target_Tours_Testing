"use client";

export const TOUR_BOOKING_PACKAGE_KEY = "tourBookingPackage";

const FALLBACK_PACKAGE = {
  id: null,
  title: "Splendors of the Canadian West",
  image: "/images/splendorsImg.png",
  startDate: "Sun, Jan 11, 2026",
  endDate: "Sat, Jan 17, 2026",
  fromCity: "New Delhi",
  durationLabel: "7D/6N",
  routeLabel: "2N Ubud • 1N Toronto • 3N Oikawa",
  price: {
    adult: 5200,
    taxes: 0,
    total: 5200,
  },
  itinerary: [],
  selectedActivities: [],
  activitySelectionMode: null,
  packageDepartureId: null,
  with_flight: false,
};

const safeNumber = (...values) => {
  for (const value of values) {
    const number =
      typeof value === "string"
        ? Number(value.replace(/[^\d.]/g, ""))
        : Number(value);
    if (Number.isFinite(number)) return number;
  }
  return null;
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const resolveImage = (data = {}) => {
  const image =
    data?.image ||
    data?.main_image?.formats?.large?.url ||
    data?.main_image?.formats?.small?.url ||
    data?.main_image?.formats?.thumbnail?.url ||
    data?.main_image?.url ||
    "";

  if (!image) return FALLBACK_PACKAGE.image;
  if (String(image).startsWith("http") || String(image).startsWith("/images")) {
    return image;
  }

  return `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}${image}`;
};

const getFirstDeparture = (data = {}) =>
  Array.isArray(data?.package_departures) ? data.package_departures[0] : null;

const getItinerary = (data = {}) => {
  const source =
    data?.itinerary ||
    data?.package_itinerarie ||
    data?.package_itineraries ||
    data?.package_itinerary ||
    data?.day_by_day_itinerary ||
    data?.days ||
    [];

  return Array.isArray(source)
    ? [...source].sort((a, b) => (a?.day_number ?? a?.day ?? 0) - (b?.day_number ?? b?.day ?? 0))
    : [];
};

const hasFlightTransport = (itinerary = []) =>
  itinerary.some((day) => {
    const transports = day?.builder_data?.transports;
    return Array.isArray(transports)
      ? transports.some(
          (transport) =>
            transport?.enabled !== false && transport?.mode === "flight"
        )
      : false;
  });

export const normalizeTourBookingPackage = (data = {}, selectedDeparture = null) => {
  const departure = selectedDeparture || getFirstDeparture(data) || {};
  const adultPrice = safeNumber(
    departure?.base_price,
    data?.started_price,
    data?.price,
    data?.base_price,
    FALLBACK_PACKAGE.price.adult
  );
  const days = safeNumber(data?.duration_days);
  const nights = safeNumber(data?.duration_nights);
  const itinerary = getItinerary(data);
  const withFlight =
    typeof data?.with_flight === "boolean"
      ? data.with_flight
      : typeof data?.withFlight === "boolean"
        ? data.withFlight
        : hasFlightTransport(itinerary);

  return {
    ...FALLBACK_PACKAGE,
    id: data?.id ?? FALLBACK_PACKAGE.id,
    title: data?.title || data?.name || FALLBACK_PACKAGE.title,
    image: resolveImage(data),
    startDate:
      formatDate(departure?.departure_date || data?.startDate || data?.start_date) ||
      FALLBACK_PACKAGE.startDate,
    endDate:
      formatDate(departure?.return_date || data?.endDate || data?.end_date) ||
      FALLBACK_PACKAGE.endDate,
    fromCity:
      data?.start_location?.name ||
      data?.fromCity ||
      data?.from ||
      FALLBACK_PACKAGE.fromCity,
    durationLabel:
      days && nights
        ? `${days}D/${nights}N`
        : data?.durationLabel || data?.days || FALLBACK_PACKAGE.durationLabel,
    routeLabel:
      data?.routeLabel ||
      data?.route ||
      data?.end_location?.name ||
      FALLBACK_PACKAGE.routeLabel,
    price: {
      adult: adultPrice,
      taxes: safeNumber(data?.taxes, FALLBACK_PACKAGE.price.taxes),
      total: adultPrice,
    },
    itinerary,
    selectedActivities: Array.isArray(data?.selectedActivities)
      ? data.selectedActivities
      : FALLBACK_PACKAGE.selectedActivities,
    activitySelectionMode: data?.activitySelectionMode || FALLBACK_PACKAGE.activitySelectionMode,
    packageDepartureId:
      departure?.id ??
      data?.packageDepartureId ??
      data?.package_departure_id ??
      FALLBACK_PACKAGE.packageDepartureId,
    with_flight: withFlight,
  };
};

export const saveTourBookingPackage = (data, selectedDeparture = null) => {
  if (typeof window === "undefined") return normalizeTourBookingPackage(data, selectedDeparture);

  const nextPackageDetails = normalizeTourBookingPackage(data, selectedDeparture);
  const previousPackageDetails = readTourBookingPackage();
  const packageDetails = {
    ...nextPackageDetails,
    selectedActivities:
      previousPackageDetails?.id === nextPackageDetails.id
        ? previousPackageDetails.selectedActivities || []
        : nextPackageDetails.selectedActivities,
    activitySelectionMode:
      previousPackageDetails?.id === nextPackageDetails.id
        ? previousPackageDetails.activitySelectionMode || null
        : nextPackageDetails.activitySelectionMode,
  };
  window.sessionStorage.removeItem(TOUR_BOOKING_PACKAGE_KEY);
  window.sessionStorage.setItem(TOUR_BOOKING_PACKAGE_KEY, JSON.stringify(packageDetails));
  return packageDetails;
};

export const writeTourBookingPackage = (packageDetails) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(TOUR_BOOKING_PACKAGE_KEY, JSON.stringify(packageDetails));
};

export const readTourBookingPackage = () => {
  if (typeof window === "undefined") return FALLBACK_PACKAGE;

  try {
    const raw = window.sessionStorage.getItem(TOUR_BOOKING_PACKAGE_KEY);
    return raw ? { ...FALLBACK_PACKAGE, ...JSON.parse(raw) } : FALLBACK_PACKAGE;
  } catch {
    return FALLBACK_PACKAGE;
  }
};

export const clearTourBookingPackage = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(TOUR_BOOKING_PACKAGE_KEY);
};

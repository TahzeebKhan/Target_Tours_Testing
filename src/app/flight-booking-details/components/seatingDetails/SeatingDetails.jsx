'use client'
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./SeatingDetails.module.css";
import { useFlightBooking } from "../../FlightBookingContext";
import Plane from "@/app/flight-booking-details/mobileViewComponents/seatingDetailsMobileView/plane";
import BelowPlane from "@/app/flight-booking-details/mobileViewComponents/seatingDetailsMobileView/below_plane";
import Mobile_footer from "@/app/flight-booking-details/mobileViewComponents/seatingDetailsMobileView/Mobile_footer";
import PriceSummary from "@/features/profile/components/PriceSummary";
import { buildMobilePriceSummary } from "../../utils/mobilePriceSummary";
import { getBookingDetailsView } from "@/features/flights/utils/flightBookingSession";
import { resolveAirlineLogo } from "@/features/flights/utils/airlineLogos";
const rowData = [
  { id: 1, seats: ["grey", "grey", "grey", "grey", "grey", "grey"] },
  { id: 2, seats: ["blue", "blue", "blue", "blue", "blue", "blue"] },
  { id: 3, seats: ["blue", "blue", "blue", "blue", "taken", "blue"] },
  { id: 4, seats: ["blue", "taken", "taken", "blue", "taken", "blue"] },
  {
    id: 5,
    seats: ["purple", "purple", "purple", "purple", "purple", "purple"],
  },
  { id: 6, seats: ["purple", "xl", "xl", "xl", "xl", "purple"] },
  {
    id: 7,
    seats: ["purple", "taken", "taken", "purple", "purple", "purple"],
  },
  { id: 8, seats: ["red", "taken", "taken", "red", "red", "red"] },
  { id: "exit1", type: "exit" },
  { id: 9, seats: ["red", "red", "red", "red", "red", "red"] },
  { id: 10, seats: ["orange", "purple", "blue", "blue", "purple", "orange"] },
  {
    id: 11,
    seats: ["orange", "taken", "taken", "taken", "purple", "orange"],
  },
  {
    id: 12,
    seats: ["orange", "taken", "taken", "taken", "purple", "orange"],
  },
  { id: 13, seats: ["orange", "purple", "blue", "blue", "purple", "orange"] },
  { id: 14, seats: ["red", "red", "red", "red", "red", "red"] },
  { id: "exit2", type: "exit" },
  { id: 15, seats: ["red", "red", "red", "red", "red", "red"] },
  { id: 16, seats: ["xl", "xl", "xl", "xl", "xl", "xl"] },
  { id: 17, seats: ["black", "black", "xl", "xl", "black", "black"] },
];

const SEAT_COLUMNS = ["A", "B", "C", "D", "E", "F"];

const readNumber = (...values) => {
  for (const value of values) {
    if (Array.isArray(value)) {
      const nested = readNumber(...value);
      if (Number.isFinite(nested)) return nested;
      continue;
    }

    if (value && typeof value === "object") {
      const nested = readNumber(
        value.Amount,
        value.amount,
        value.Price,
        value.price,
        value.TotalAmount,
        value.totalAmount,
        value.GrossAmount,
        value.grossAmount,
        value.Charge,
        value.charge,
        value.Value,
        value.value
      );
      if (Number.isFinite(nested)) return nested;
      continue;
    }

    const normalized =
      typeof value === "string"
        ? Number(value.replace(/[^\d.]/g, ""))
        : Number(value);
    if (Number.isFinite(normalized)) return normalized;
  }
  return null;
};

const findSeatArray = (value, seen = new WeakSet()) => {
  if (!value || typeof value !== "object") return [];
  if (seen.has(value)) return [];
  seen.add(value);

  if (Array.isArray(value)) {
    const hasSeatShape = value.some((item) => {
      if (!item || typeof item !== "object") return false;
      return Boolean(
        item.SeatNumber ||
          item.seatNumber ||
          item.seat_no ||
          item.seatNo ||
          item.number ||
          item.code
      );
    });

    if (hasSeatShape) return value;

    for (const item of value) {
      const nested = findSeatArray(item, seen);
      if (nested.length) return nested;
    }
    return [];
  }

  for (const nested of Object.values(value)) {
    const result = findSeatArray(nested, seen);
    if (result.length) return result;
  }

  return [];
};

const getSeatNumber = (seat) =>
  String(
    seat?.SeatNumber ||
      seat?.seatNumber ||
      seat?.seat_no ||
      seat?.seatNo ||
      seat?.number ||
      seat?.code ||
      ""
  )
    .trim()
    .toUpperCase();

const getSeatPrice = (seat) =>
  readNumber(
    seat?.Price,
    seat?.price,
    seat?.Amount,
    seat?.amount,
    seat?.Fare,
    seat?.fare,
    seat?.SeatFare,
    seat?.seatFare,
    seat?.TotalAmount,
    seat?.totalAmount,
    seat?.GrossAmount,
    seat?.grossAmount,
    seat?.Charge,
    seat?.charge,
    seat?.ServiceCharge,
    seat?.serviceCharge,
    seat?.SSRAmount,
    seat?.ssrAmount,
    seat?.Tax,
    seat?.tax
  ) || 0;

const getSeatSsrId = (seat) =>
  readNumber(
    seat?.SSID,
    seat?.ssid,
    seat?.SeatID,
    seat?.seatID,
    seat?.SeatId,
    seat?.seatId,
    seat?.SSRId,
    seat?.ssrId,
    seat?.id
  );

const getSeatFuid = (seat) =>
  readNumber(
    seat?.FUID,
    seat?.fuid,
    seat?.flight_uid,
    seat?.flightUid,
    seat?.flightId,
    seat?.FlightID,
    seat?.FlightId
  );

const getJourneyFuid = (journeyIndex) =>
  Number.isFinite(Number(journeyIndex)) ? Number(journeyIndex) + 1 : undefined;

const isSeatAvailableStatus = (value) => {
  if (typeof value === "boolean") return value;
  if (value === 1) return true;
  if (value === 0) return false;

  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return false;
  return ["open", "available", "true", "yes", "y"].includes(normalized);
};

const getSeatFlags = (seat) => {
  const info = String(seat?.SeatInfo || seat?.seatInfo || "").toLowerCase();
  const description = String(
    seat?.SeatDesc || seat?.seatDesc || seat?.description || ""
  ).toLowerCase();
  const formattedType = String(seat?.type || seat?.seatType || "").toLowerCase();

  return {
    isWindow:
      info.includes("window") ||
      description.includes("window") ||
      formattedType.includes("window"),
    isAisle:
      info.includes("aisle") ||
      description.includes("aisle") ||
      formattedType.includes("aisle"),
    isChildInfantRestricted:
      info.includes("ees") ||
      description.includes("ees") ||
      formattedType.includes("ees"),
  };
};

const getSeatCoordinateColumn = (seat) =>
  readNumber(seat?.col, seat?.column, seat?.XValue, seat?.xValue);

const getSeatStatusLabel = (seat) =>
  String(seat?.SeatStatus || seat?.seatStatus || seat?.status || "Unknown").trim() ||
  "Unknown";

const getSeatType = (seat) => {
  const status = String(
    seat?.SeatStatus || seat?.seatStatus || seat?.status || ""
  ).toLowerCase();
  const description = String(
    seat?.SeatDesc || seat?.seatDesc || seat?.description || seat?.SeatInfo || ""
  ).toLowerCase();
  const info = String(seat?.SeatInfo || seat?.seatInfo || "").toLowerCase();
  const formattedType = String(seat?.type || seat?.seatType || "").toLowerCase();
  const amount = getSeatPrice(seat);
  const unavailableStatuses = [
    "fleetblocked",
    "fleet blocked",
    "reserved",
    "booked",
    "unknown",
    "restricted",
    "ees",
    "unavailable",
    "blocked",
  ];
  const hasUnavailableStatus = unavailableStatuses.some((item) =>
    status.includes(item) ||
    description.includes(item) ||
    info.includes(item) ||
    formattedType.includes(item)
  );

  if (
    !isSeatAvailableStatus(seat?.AvailStatus ?? seat?.available ?? seat?.isAvailable) ||
    hasUnavailableStatus
  ) {
    return "taken";
  }
  if (description.includes("non") && description.includes("reclin")) return "black";
  if (description.includes("exit") || info.includes("exit") || formattedType.includes("exit")) return "red";
  if (description.includes("leg") || info.includes("leg") || formattedType.includes("legroom")) return "xl";
  if (!amount || amount <= 0) return "blue";
  if (amount <= 525) return "blue";
  if (amount <= 1103) return "purple";
  return "orange";
};

const buildFormattedSeatRows = (seatLayoutResponse) => {
  const formatted =
    seatLayoutResponse?.data?.formatted ||
    seatLayoutResponse?.formatted ||
    seatLayoutResponse;

  const seats = findSeatArray(formatted);
  if (!seats.length) return { rows: rowData, seatsById: {} };

  const rowMap = new Map();
  const seatsById = {};

  seats.forEach((seat) => {
    const seatNumber = getSeatNumber(seat);
    const match = seatNumber.match(/^(\d+)\s*([A-Z])$/);
    if (!match) return;

    const rowId = Number(match[1]);
    const column = match[2];
    const columnIndex = SEAT_COLUMNS.indexOf(column);
    if (!Number.isFinite(rowId) || columnIndex < 0) return;
    const coordinateColumn = getSeatCoordinateColumn(seat);
    const side =
      Number.isFinite(coordinateColumn)
        ? coordinateColumn <= 7
          ? "left"
          : "right"
        : columnIndex < 3
          ? "left"
          : "right";

    if (!rowMap.has(rowId)) {
      rowMap.set(rowId, Array.from({ length: SEAT_COLUMNS.length }, () => "grey"));
    }

    const type = getSeatType(seat);
    const flags = getSeatFlags(seat);
    const statusLabel = getSeatStatusLabel(seat);
    rowMap.get(rowId)[columnIndex] = {
      type,
      seatNumber: `${rowId}${column}`,
      rowId,
      column,
      side,
      coordinateColumn,
      statusLabel,
      ...flags,
    };
    seatsById[`${rowId}-${column}`] = {
      ...seat,
      rawId: seat?.id,
      ssid: getSeatSsrId(seat),
      fuid: getSeatFuid(seat),
      id: `${rowId}-${column}`,
      seatNumber: `${rowId}-${column}`,
      price: getSeatPrice(seat),
      type,
      statusLabel,
      ...flags,
    };
  });

  const rows = Array.from(rowMap.entries())
    .sort(([left], [right]) => left - right)
    .map(([id, seatsForRow]) => ({ id, seats: seatsForRow }));

  return {
    rows: rows.length ? rows : [],
    seatsById,
  };
};

const unwrapSeatLayoutPayload = (seatLayoutResponse) =>
  seatLayoutResponse?.data?.raw ||
  seatLayoutResponse?.raw ||
  seatLayoutResponse?.data?.data?.raw ||
  seatLayoutResponse?.data ||
  seatLayoutResponse ||
  {};

const getSeatLayoutJourneys = (seatLayoutResponse) => {
  const payload = unwrapSeatLayoutPayload(seatLayoutResponse);
  const formatted =
    seatLayoutResponse?.data?.formatted ||
    seatLayoutResponse?.formatted ||
    payload?.formatted ||
    {};
  const formattedJourneys =
    formatted?.journeys || formatted?.Journeys || formatted?.Journey;

  if (Array.isArray(formattedJourneys) && formattedJourneys.length) {
    return formattedJourneys;
  }

  const trips = Array.isArray(payload?.Trips)
    ? payload.Trips
    : Array.isArray(payload?.trips)
      ? payload.trips
      : [];
  const journeys = trips.flatMap((trip) => {
    const tripJourneys = trip?.Journey || trip?.Journeys || trip?.journey || trip?.journeys;
    return Array.isArray(tripJourneys) ? tripJourneys : tripJourneys ? [tripJourneys] : [];
  });

  return journeys.length ? journeys : [seatLayoutResponse];
};

const getJourneyRouteLabel = (journey, fallback = "") => {
  const route =
    journey?.OriginDestination ||
    journey?.originDestination ||
    journey?.Route ||
    journey?.route ||
    [journey?.Origin, journey?.Destination].filter(Boolean).join("-");

  return String(route || fallback || "N/A").toUpperCase();
};

const buildSeatLayoutGroups = (seatLayoutResponse, bookingDetailsView) => {
  const journeys = getSeatLayoutJourneys(seatLayoutResponse);
  const fallbackFlights = [
    bookingDetailsView?.departureFlight,
    bookingDetailsView?.returnFlight,
  ];

  return journeys.map((journey, index) => {
    const { rows, seatsById } = buildFormattedSeatRows(journey);
    const prefix = `journey-${index + 1}:`;
    const fallbackFlight = fallbackFlights[index] || fallbackFlights[0] || {};
    const fallbackRoute = [
      index === 1 ? bookingDetailsView?.header?.toCode : bookingDetailsView?.header?.fromCode,
      index === 1 ? bookingDetailsView?.header?.fromCode : bookingDetailsView?.header?.toCode,
    ]
      .filter(Boolean)
      .join("-");

    return {
      id: `journey-${index + 1}`,
      prefix,
      rows,
      seatsById: Object.fromEntries(
        Object.entries(seatsById).map(([seatId, seat]) => [
          `${prefix}${seatId}`,
          {
            ...seat,
            rawId: seat?.rawId,
            ssid: seat?.ssid,
            fuid: seat?.fuid ?? getJourneyFuid(index),
            id: `${prefix}${seatId}`,
            seatNumber: seat?.seatNumber || seatId,
            journeyIndex: index,
            journeyLabel: getJourneyRouteLabel(journey, fallbackRoute),
          },
        ])
      ),
      routeLabel: getJourneyRouteLabel(journey, fallbackRoute),
      date: formatSeatingDate(
        journey?.DepartureTime ||
          journey?.departureTime ||
          fallbackFlight?.departure?.date ||
          bookingDetailsView?.header?.date ||
          "N/A"
      ),
      timeRange: [
        fallbackFlight?.departure?.time,
        fallbackFlight?.arrival?.time,
      ]
        .filter(Boolean)
        .join(" - "),
    };
  });
};

const formatSeatingDate = (value) => {
  if (!value || value === "N/A") return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const SeatingDetails = () => {
  const [openTab, setOpenTab] = useState("flight");
  const [selectedPassenger, setSelectedPassenger] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const seatLayoutsScrollerRef = useRef(null);
  const [activeSeatLayoutIndex, setActiveSeatLayoutIndex] = useState(0);
  const [seatNavState, setSeatNavState] = useState({
    canScrollPrevious: false,
    canScrollNext: false,
  });




  const [showPriceSummaryPopup, setShowPriceSummaryPopup] = useState(false);
  const toggleTab = (tab) => {
    if (openTab !== tab) setOpenTab(tab);
  };
  const {
    setCurrentStep,
    currentStep,
    prices,
    bookingSession,
    travelerDetails,
    seats,
    setSeats,
    seatLayoutLoading,
  } = useFlightBooking();

  const bookingDetailsView = useMemo(
    () => getBookingDetailsView(bookingSession || {}),
    [bookingSession]
  );
  const seatLayoutGroups = useMemo(
    () =>
      buildSeatLayoutGroups(
        bookingSession?.seatLayoutResponse,
        bookingDetailsView
      ),
    [bookingDetailsView, bookingSession?.seatLayoutResponse]
  );
  const seatsById = useMemo(
    () =>
      seatLayoutGroups.reduce(
        (acc, layout) => ({ ...acc, ...layout.seatsById }),
        {}
      ),
    [seatLayoutGroups]
  );
  const activeSeatLayout =
    seatLayoutGroups[activeSeatLayoutIndex] || seatLayoutGroups[0] || {};
  const activeSeatPrefix = activeSeatLayout?.prefix || "";
  const activeSelectedSeats = useMemo(
    () =>
      activeSeatPrefix
        ? selectedSeats.filter((seatId) => seatId?.startsWith(activeSeatPrefix))
        : selectedSeats.filter(Boolean),
    [activeSeatPrefix, selectedSeats]
  );
  const activeSeatPrice = useMemo(
    () =>
      activeSelectedSeats.reduce((sum, seatId) => {
        const seat = seatsById[seatId] || {};
        return sum + Number(seat.price || 0);
      }, 0),
    [activeSelectedSeats, seatsById]
  );
  const hasActiveSeatSelection = activeSelectedSeats.length > 0;
  const seatingFlight =
    [
      bookingDetailsView?.departureFlight,
      bookingDetailsView?.returnFlight,
    ][activeSeatLayoutIndex] ||
    bookingDetailsView?.departureFlight ||
    {};
  const seatingAirline = seatingFlight?.airline || {};
  const routeLabel = String(activeSeatLayout?.routeLabel || "")
    .replace(/-/g, "–");
  const flightDate = activeSeatLayout?.date || formatSeatingDate(
    seatingFlight?.departure?.date || bookingDetailsView?.header?.date || "N/A"
  );
  const flightTimeRange = activeSeatLayout?.timeRange || [
    seatingFlight?.departure?.time,
    seatingFlight?.arrival?.time,
  ]
    .filter(Boolean)
    .join(" - ");
  const airlineLabel = [
    seatingAirline?.name,
    seatingAirline?.code ? `(${seatingAirline.code})` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const aircraftLabel = seatingFlight?.aircraft || "N/A";
  const airlineLogo = resolveAirlineLogo({
    name: seatingAirline?.name,
    code: seatingAirline?.code,
    logo: seatingAirline?.logo,
  });


  const passengerList = useMemo(() => {
    if (!Array.isArray(travelerDetails) || travelerDetails.length === 0) {
      return [{ id: 1, name: "Passenger 1" }];
    }

    return travelerDetails.map((traveler, index) => ({
      id: index + 1,
      name:
        [traveler.FName, traveler.LName].filter(Boolean).join(" ") ||
        `Passenger ${index + 1}`,
    }));
  }, [travelerDetails]);
  const passengerCount = passengerList.length;
  const priceSummary = useMemo(
    () => buildMobilePriceSummary({ prices, bookingSession, travelerDetails }),
    [bookingSession, prices, travelerDetails]
  );

  useEffect(() => {
    setSelectedSeats((prev) =>
      prev
        .filter(Boolean)
        .slice(0, passengerCount * Math.max(seatLayoutGroups.length, 1))
    );
    setSelectedPassenger((prev) => Math.min(prev, passengerCount) || 1);
  }, [passengerCount, seatLayoutGroups.length]);

  useEffect(() => {
    setSeats(
      selectedSeats
        .filter(Boolean)
        .map((seatId) => {
          const seat = seatsById[seatId] || {};
          return {
            ...seat,
            rawId: seat?.rawId,
            ssid: seat?.ssid,
            fuid: seat?.fuid ?? getJourneyFuid(seat?.journeyIndex),
            id: seatId,
            seatNumber: seat?.seatNumber || String(seatId).split(":").pop(),
            price: seat.price || 0,
          };
        })
    );
  }, [selectedSeats, seatsById, setSeats]);




  const toggleSeat = (rowId, colLabel, type, seatIdPrefix = "") => {
    if (type === "taken" || type === "grey") return;
    const seatId = `${seatIdPrefix}${rowId}-${colLabel}`;
    const passengerIndex = Math.max(Number(selectedPassenger || 1) - 1, 0);

    setSelectedSeats((prev) => {
      const selectedSeatIds = prev.filter(Boolean);
      const selectedForJourney = seatIdPrefix
        ? selectedSeatIds.filter((id) => id.startsWith(seatIdPrefix))
        : selectedSeatIds;
      const selectedForOtherJourneys = seatIdPrefix
        ? selectedSeatIds.filter((id) => !id.startsWith(seatIdPrefix))
        : [];

      if (selectedSeatIds.includes(seatId)) {
        return selectedSeatIds.filter((id) => id !== seatId);
      }

      const nextSelectedForJourney = selectedForJourney
        .filter((id) => id !== seatId)
        .slice(0, passengerCount);
      nextSelectedForJourney[passengerIndex] = seatId;

      return [
        ...selectedForOtherJourneys,
        ...nextSelectedForJourney.filter(Boolean),
      ];
    });
  };

  const scrollSeatLayouts = (direction) => {
    const scroller = seatLayoutsScrollerRef.current;
    if (!scroller) return;

    scroller.scrollBy({
      left: direction * Math.max(scroller.clientWidth - 80, 320),
      behavior: "smooth",
    });
  };

  const updateSeatNavState = () => {
    const scroller = seatLayoutsScrollerRef.current;
    if (!scroller) {
      setSeatNavState({ canScrollPrevious: false, canScrollNext: false });
      return;
    }

    const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
    setSeatNavState({
      canScrollPrevious: scroller.scrollLeft > 2,
      canScrollNext: scroller.scrollLeft < maxScrollLeft - 2,
    });

    const panels = Array.from(scroller.children || []);
    if (panels.length) {
      const nextActiveIndex = panels.reduce(
        (closest, panel, index) => {
          const distance = Math.abs(panel.offsetLeft - scroller.scrollLeft);
          return distance < closest.distance ? { index, distance } : closest;
        },
        { index: 0, distance: Number.POSITIVE_INFINITY }
      ).index;

      setActiveSeatLayoutIndex(nextActiveIndex);
    }
  };

  useEffect(() => {
    updateSeatNavState();
  }, [seatLayoutGroups.length]);

  useEffect(() => {
    setActiveSeatLayoutIndex((current) =>
      Math.min(current, Math.max(seatLayoutGroups.length - 1, 0))
    );
  }, [seatLayoutGroups.length]);

  return (
    <>
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.passengerDetailsHeader}>
          <div className={styles.fromToContainer}>
            <h2 className={styles.from}>Select Your Seats</h2>
          </div>

          <div className={styles.aboutFlightContainerRight}>
            <span className={styles.subInfoText}>
              Choose your preferred seats for the journey. Extra legroom seats
              available for additional comfort.
            </span>
          </div>
        </div>

        {/* FLIGHT DETAILS */}
        <div
          className={`${styles.flightExpandableContainer} ${
            openTab === "flight" ? styles.flightActiveBorder : ""
          }`}
        >
          <div
            className={styles.flightExpandableCard}
            onClick={() => toggleTab("flight")}
          >
            <div className={styles.flightSeatingContainer}>
              <div className={styles.flightExpandableHeaderContainer}>
                <h3 className={styles.flightExpandableHeader}>
                  {routeLabel || "N/A"}
                </h3>
                {/* <img
                            src="/icons/DownArrows.svg"
                            alt=""
                            className={`${styles.arrow} ${openTab === "flight" ? styles.arrowRotate : ""
                                }`}
                        /> */}
              </div>
              <div className={styles.aboutFlightContainerRight}>
                <span>{flightDate}</span>
                <div className={styles.dot}></div>
                <span>{flightTimeRange || "N/A"}</span>
              </div>
            </div>
            <div className={styles.flightSeatingPrice}>
              <div className={styles.priceContainer}>
                {hasActiveSeatSelection ? (
                  <span className={activeSeatPrice > 0 ? styles.price : styles.selectionPending}>
                    {activeSeatPrice > 0 ? ` ₹ ${activeSeatPrice.toLocaleString()} ` : " Free"}
                  </span>
                ) : (
                  <span className={styles.selectionPending}> Selection Pending</span>
                )}
                {/* <span className={styles.price}>{prices.seats ?  ` ₹ ${prices.seats}` : " Selection Pending"}</span> */}
                <span className={styles.subInfoText}>Added to fare</span>
              </div>
              <img
                src="/icons/DownArrows.svg"
                alt=""
                className={`${styles.arrow} ${
                  openTab === "flight" ? styles.arrowRotate : ""
                }`}
              />
            </div>
          </div>

          <div
            className={`${styles.expandWrap} ${
              openTab === "flight" ? styles.expandOpen : ""
            }`}
          >
            <div className={styles.expandableContent}>
              <div className={styles.flightSeatingWrapper}>
                <div className={styles.selectSeatsTitle}>
                  Select Seat On Map
                  {seatLayoutLoading ? "..." : ""}
                </div>
                {seatNavState.canScrollPrevious && (
                  <button
                    type="button"
                    className={`${styles.seatNavButton} ${styles.seatNavPrevious}`}
                    onClick={() => scrollSeatLayouts(-1)}
                    aria-label="Previous flight seats"
                  >
                    {"<"}
                  </button>
                )}
                <div
                  className={styles.seatLayoutsScroller}
                  ref={seatLayoutsScrollerRef}
                  onScroll={updateSeatNavState}
                >
                  {seatLayoutGroups.map((layout) => (
                    <div key={layout.id} className={styles.seatJourneyPanel}>
                      <div className={styles.seatJourneyHeader}>
                        <span>{layout.routeLabel}</span>
                        <small>
                          {[layout.date, layout.timeRange].filter(Boolean).join(" • ")}
                        </small>
                      </div>
                      <Plane
                        callFromDesktop={true}
                        toggleSeat={toggleSeat}
                        selectedSeats={selectedSeats}
                        setSelectedSeats={setSelectedSeats}
                        rowData={layout.rows}
                        seatIdPrefix={layout.prefix}
                      />
                    </div>
                  ))}
                </div>
                {seatNavState.canScrollNext && (
                  <button
                    type="button"
                    className={`${styles.seatNavButton} ${styles.seatNavNext}`}
                    onClick={() => scrollSeatLayouts(1)}
                    aria-label="Next flight seats"
                  >
                    {">"}
                  </button>
                )}
              </div>
              <div className={styles.flightSeatingRight}>
                <div className={styles.flightSeatingSubRight}>
                  <div className={styles.flightSeatingRightHeader}>
                    <img
                      src={airlineLogo}
                      alt={seatingAirline?.name || "Airline"}
                    />
                    <div className={styles.flightSeatingRightHeaderInfo}>
                      <h3 className={styles.flightName}>
                        {airlineLabel || "N/A"}
                      </h3>
                      <p className={styles.chip}>{aircraftLabel}</p>
                    </div>
                  </div>

                  {/* Passenger Seat Selector */}
                  <div className={styles.passengerSeatWrapper}>
                    <div className={styles.passengerSeatTitle}>
                      Select your seat
                    </div>

                    {passengerList.map((passenger, index) => {
                      const seat = activeSelectedSeats[index] || null;

                      return (
                        <div
                          onClick={() => setSelectedPassenger(passenger.id)}
                          key={passenger.id}
                          className={`${styles.passengerSeatCard} ${
                            selectedPassenger === passenger.id
                              ? styles.passengerSeatCardActive
                              : ""
                          }`}
                        >
                          <div className={styles.passengerSeatIcon}>
                            <img src="/icons/User_copy.svg" alt="passenger" />
                          </div>

                          <div className={styles.passengerSeatInfo}>
                            <p className={styles.passengerSeatHeading}>
                              Seat Passenger {passenger.id}
                            </p>
                            <p className={styles.passengerSeatSub}>
                              {passenger.name} •{" "}
                              {seat
                                ? `Seat ${String(seat).split(":").pop()}`
                                : "No seat selected"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className={styles.legend}>
                  <div className={styles.column}>
                    <LegendItem color="green" label="Free" />
                    <LegendItem color="blue" label="₹ 0–525" />
                  </div>
                  <div className={styles.column}>
                    <LegendItem color="purple" label="₹ 578–1103" />
                    <LegendItem color="orange" label="₹ 1200–1503" />
                  </div>
                  <div className={styles.column}>
                    <LegendItem color="red" label="Exit Row Seats" />
                    <LegendItem color="dark" label="Non Reclining" />
                  </div>
                  <div className={styles.column}>
                    <LegendItem isXL label="Extra Legroom" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          onClick={() => setCurrentStep(6)}
          className={styles.continueButtonContainer}
        >
          <button className={styles.skipButton}>SKIP SEATS</button>
          <button className={styles.continueButton}>CONTINUE</button>
        </div>
      </div>

      <div className={styles.mobileView}>
        <div className={styles.tripDetailsContainer}>
          <div className={styles.tripDetailsHeader}>
            <img
              onClick={() => setCurrentStep(currentStep - 1)}
              className={styles.backArrow}
              src="/icons/leftArrowTrip.svg"
              alt=""
            />
            <p className={styles.tripDetails}>Review and Payment</p>
          </div>
        </div>
        <div className={styles.detailsWrapper}>
          <div className={styles.fromTo}>
            <span>{bookingDetailsView?.header?.fromCode || "N/A"}</span>–
            <span>{bookingDetailsView?.header?.toCode || "N/A"}</span>
          </div>
          <div className={styles.dateTime}>
            <span>{flightDate}</span>
            <span className={styles.dot2} />
            <span>{flightTimeRange || "N/A"}</span>
          </div>
        </div>
        <Plane
          toggleSeat={toggleSeat}
          selectedSeats={selectedSeats}
          setSelectedSeats={setSelectedSeats}
          rowData={seatLayoutGroups[0]?.rows || rowData}
          seatIdPrefix={seatLayoutGroups[0]?.prefix || ""}
        />
        <BelowPlane />

        <Mobile_footer
          setShowPriceSummaryPopup={setShowPriceSummaryPopup}
          setCurrentStep={setCurrentStep}
          currentStep={currentStep}
          totalAmount={priceSummary.totalAmount}
        />

        {showPriceSummaryPopup && (
          <PriceSummary
            onClose={() => setShowPriceSummaryPopup(false)}
            lineItems={priceSummary.lineItems}
            totalAmount={priceSummary.totalAmount}
          />
        )}
      </div>
    </>
  );
};

export default SeatingDetails;

const LegendItem = ({ color, label, isXL }) => {
  return (
    <div className={styles.item}>
      {isXL ? (
        <span className={styles.xl}>XL</span>
      ) : (
        <span className={`${styles.box} ${styles[color]}`} />
      )}
      <span className={styles.text}>{label}</span>
    </div>
  );
};

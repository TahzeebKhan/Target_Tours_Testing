"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ExpandableTabs.module.css";

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

const displayTerminal = (value) => {
  const resolved = displayValue(value);
  return resolved === "N/A" ? "Terminal N/A" : `Terminal ${resolved}`;
};

const compactAirportName = (value) => {
  const text = String(value || "").trim();
  if (!text) return "N/A";
  return text.split("|")[0]?.trim() || "N/A";
};

const parseAirportDetail = (label = "") => {
  const text = String(label || "").trim();
  if (!text) return { code: "N/A", city: "N/A", airport: "N/A" };

  const [airportPart = "", cityPart = ""] = text.split("|");
  const city = airportPart
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

const ExpandableTabs = ({
  flightData = null,
  selectedDepartureDate = "",
  travellerSummary = null,
}) => {
  const [activeTab, setActiveTab] = useState("flight");
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
    : [];
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
  const segmentDetails = useMemo(() => {
    if (!connectionSegments.length) {
      return [
        {
          id: "segment-0",
          departureDate: displayValue(details?.dateLabel || displayShortDate),
          departureTime: displayValue(flightData?.departure?.time),
          departureCode: displayValue(departure.code),
          departureCity: displayValue(departure.city),
          departureAirport: compactAirportName(details?.fromName),
          departureTerminal: displayTerminal(details?.departureTerminal),
          arrivalDate: displayValue(details?.dateLabel || displayShortDate),
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
        departureDate: formatSegmentDate(segment?.departure),
        departureTime: displayValue(formatTimeValue(segment?.departure)),
        departureCode: displayValue(segment?.from || departure.code),
        departureCity:
          index === 0 ? displayValue(departure.city) : compactAirportName(previousLayover?.ArrAirportName),
        departureAirport: displayValue(departureAirportName),
        departureTerminal: displayTerminal(segment?.terminal?.departure),
        arrivalDate: formatSegmentDate(segment?.arrival),
        arrivalTime: displayValue(formatTimeValue(segment?.arrival)),
        arrivalCode: displayValue(segment?.to || arrival.code),
        arrivalCity:
          index === connectionSegments.length - 1
            ? displayValue(arrival.city)
            : compactAirportName(layover?.ArrAirportName),
        arrivalAirport: displayValue(arrivalAirportName),
        arrivalTerminal: displayTerminal(segment?.terminal?.arrival),
        duration: displayValue(segment?.duration || durationLabel),
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

  useEffect(() => {
    if (!tabsRef.current) return;

    const tabs = tabsRef.current;
    const activeTabEl = tabs.querySelector(`.${styles.active}`);

    if (!activeTabEl) return;

    tabs.style.setProperty("--indicator-width", `${activeTabEl.offsetWidth}px`);
    tabs.style.setProperty("--indicator-left", `${activeTabEl.offsetLeft}px`);
  }, [activeTab]);

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
                      <span className={styles.duration}>{segment.duration}</span>
                      <div className={styles.dot}></div>
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
                <span className={styles.bold}>{totalFare}</span>
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
            </div>

            <div className={styles.infoBox}>
              <ul>
                <li>
                  Baggage details are not available in the current search response for this flight.
                </li>
              </ul>
            </div>
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

              <div className={styles.tableRows}>
                <span className={styles.timeFrame}>0 HOURS TO 24 HOURS*</span>
                <span className={styles.textRight}>NOT AVAILABLE</span>
              </div>

              <div className={styles.tableRows}>
                <span className={styles.timeFrame}>24 HOURS TO 365 DAYS*</span>
                <span className={styles.textRight}>NOT AVAILABLE</span>
              </div>
            </div>

            <div className={styles.note}>*From The Date Of Departure</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpandableTabs;

import { Plane } from "lucide-react";
import styles from "./TripSummaryExpandable.module.css";
import TravelInsuranceOption from "../../passengerDetails/fareDetailsExpandable/component/travelInsuranceOption/TravelInsuranceOption";
import FlightSection from "@/app/flight-booking-details/mobileViewComponents/components/FlightSection/FlightSection";
import CancellationPenalty from "../../passengerDetails/fareDetailsExpandable/component/cancellationPenalty/CancellationPenalty";
import { resolveAirlineLogo } from "@/features/flights/utils/airlineLogos";

const GENERIC_FLIGHT_LOGOS = new Set([
  "/images/dummyFlightlogo.png",
  "/images/AirlineLogos.png",
]);

const getResolvedLogo = (airline = {}) =>
  resolveAirlineLogo({
    name: airline?.name,
    code: airline?.carrierCode || airline?.code || airline?.flightNo,
    logo: GENERIC_FLIGHT_LOGOS.has(airline?.logo) ? "" : airline?.logo,
  });

const FlightIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <mask
      id="mask0_2623_11693"
      style={{ maskType: "alpha" }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="28"
      height="28"
    >
      <rect
        x="28.0001"
        y="0"
        width="28.0001"
        height="28.0001"
        transform="rotate(90 28.0001 0)"
        fill="#D9D9D9"
      />
    </mask>

    <g mask="url(#mask0_2623_11693)">
      <path
        d="M3.99289 13.9998L3.16951 11.1303C3.10668 10.9179 3.14017 10.7242 3.26996 10.5492C3.39975 10.3742 3.57154 10.2867 3.78533 10.2867C3.96856 10.2867 4.11685 10.3098 4.23022 10.3559C4.34358 10.4019 4.43049 10.4634 4.49094 10.5402L5.98967 12.5527L12.5971 12.5527L10.0663 4.02035C9.99153 3.73317 10.0365 3.47741 10.2014 3.25306C10.3662 3.02869 10.5984 2.9165 10.8981 2.9165C11.1228 2.9165 11.3081 2.95203 11.4539 3.02308C11.5998 3.09413 11.7101 3.19846 11.7848 3.33607L17.2413 12.5527L23.6468 12.5527C24.0487 12.5527 24.3904 12.6936 24.6718 12.9754C24.9532 13.2572 25.0938 13.5993 25.0938 14.0018C25.0938 14.4043 24.9532 14.7458 24.6718 15.0263C24.3904 15.3067 24.0487 15.447 23.6468 15.447L17.2413 15.447L11.7848 24.6636C11.7101 24.8012 11.599 24.9056 11.4515 24.9766C11.3041 25.0477 11.1198 25.0832 10.8987 25.0832C10.5988 25.0832 10.3664 24.971 10.2015 24.7466C10.0366 24.5223 9.99152 24.2665 10.0663 23.9793L12.5971 15.447L5.98967 15.447L4.49094 17.4595C4.43045 17.5363 4.34349 17.5977 4.23007 17.6438C4.11665 17.6899 3.9692 17.713 3.78773 17.713C3.576 17.713 3.40432 17.6255 3.2727 17.4505C3.14108 17.2755 3.10668 17.0818 3.16951 16.8694L3.99289 13.9998Z"
        fill="#7B8799"
      />
    </g>
  </svg>
);

const DashedLineIcon = () => {
  return (
    <svg
      width="136"
      height="2"
      viewBox="0 0 136 2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.742188 0.741211H134.988"
        stroke="#94A3B8"
        strokeWidth="1.48246"
        strokeLinecap="round"
        strokeDasharray="2.96 2.96"
      />
    </svg>
  );
};

const BaggageIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_2623_11805)">
        <path
          d="M6.875 16.875V18.75"
          stroke="#7B8799"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.125 16.875V18.75"
          stroke="#7B8799"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.5 6.875V14.375"
          stroke="#7B8799"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 6.875V14.375"
          stroke="#7B8799"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.5 6.875V14.375"
          stroke="#7B8799"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 4.375H5C4.65482 4.375 4.375 4.65482 4.375 5V16.25C4.375 16.5952 4.65482 16.875 5 16.875H15C15.3452 16.875 15.625 16.5952 15.625 16.25V5C15.625 4.65482 15.3452 4.375 15 4.375Z"
          stroke="#7B8799"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.5 4.375V1.875C12.5 1.54348 12.3683 1.22554 12.1339 0.991117C11.8995 0.756696 11.5815 0.625 11.25 0.625H8.75C8.41848 0.625 8.10054 0.756696 7.86612 0.991117C7.6317 1.22554 7.5 1.54348 7.5 1.875V4.375"
          stroke="#7B8799"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2623_11805">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

const TVIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.875 5.625H3.125C2.77982 5.625 2.5 5.90482 2.5 6.25V15.625C2.5 15.9702 2.77982 16.25 3.125 16.25H16.875C17.2202 16.25 17.5 15.9702 17.5 15.625V6.25C17.5 5.90482 17.2202 5.625 16.875 5.625Z"
        stroke="#7B8799"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.25 1.875L10 5.625L13.75 1.875"
        stroke="#7B8799"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.6875 8.875C14.7911 8.875 14.875 8.95895 14.875 9.0625C14.875 9.16605 14.7911 9.25 14.6875 9.25C14.5839 9.25 14.5 9.16605 14.5 9.0625C14.5 8.95895 14.5839 8.875 14.6875 8.875Z"
        fill="#7B8799"
        stroke="#7B8799"
        strokeWidth="1.5"
      />
      <path
        d="M14.6875 12.625C14.7911 12.625 14.875 12.7089 14.875 12.8125C14.875 12.9161 14.7911 13 14.6875 13C14.5839 13 14.5 12.9161 14.5 12.8125C14.5 12.7089 14.5839 12.625 14.6875 12.625Z"
        fill="#7B8799"
        stroke="#7B8799"
        strokeWidth="1.5"
      />
      <path
        d="M11.875 16.25V5.625"
        stroke="#7B8799"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const PowerIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.6667 11.6668C17.5871 11.6668 18.3333 10.9206 18.3333 10.0002C18.3333 9.07969 17.5871 8.3335 16.6667 8.3335C15.7462 8.3335 15 9.07969 15 10.0002C15 10.9206 15.7462 11.6668 16.6667 11.6668Z"
        stroke="#7B8799"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.6667 4.99984C17.5871 4.99984 18.3333 4.25365 18.3333 3.33317C18.3333 2.4127 17.5871 1.6665 16.6667 1.6665C15.7462 1.6665 15 2.4127 15 3.33317C15 4.25365 15.7462 4.99984 16.6667 4.99984Z"
        stroke="#7B8799"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.6667 18.3333C17.5871 18.3333 18.3333 17.5871 18.3333 16.6667C18.3333 15.7462 17.5871 15 16.6667 15C15.7462 15 15 15.7462 15 16.6667C15 17.5871 15.7462 18.3333 16.6667 18.3333Z"
        stroke="#7B8799"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.33268 11.6668C4.25316 11.6668 4.99935 10.9206 4.99935 10.0002C4.99935 9.07969 4.25316 8.3335 3.33268 8.3335C2.41221 8.3335 1.66602 9.07969 1.66602 10.0002C1.66602 10.9206 2.41221 11.6668 3.33268 11.6668Z"
        stroke="#7B8799"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 10H15"
        stroke="#7B8799"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.9993 3.3335H11.666C9.99935 3.3335 9.16602 4.16683 9.16602 5.8335V14.1668C9.16602 15.8335 9.99935 16.6668 11.666 16.6668H14.9993"
        stroke="#7B8799"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
const returnFlightData = {
  type: "RETURN",
  airline: {
    name: "Garuda Indonesia",
    code: "6E-541",
    logo: "/images/GarudaIndonesia.png",
  },
  aircraft: "Boeing 737",
  cabinClass: "Economy",
  fareType: "Flexi Plus Fare",
  date: "Thu, 06 Jul 2025",

  departure: {
    time: "06:00",
    city: "Jakarta (JKTC)",
  },

  arrival: {
    time: "07:40",
    city: "Surabaya (SUB)",
  },

  duration: {
    hours: "01",
    minutes: "50",
  },

  stops: "Direct",

  facilities: [
    "Baggage 20 kg, Cabin Baggage 7kg",
    "In-flight entertainment",
    "In-flight meal",
    "Power & USB Port",
  ],
};

const toMobileFlight = (card, type) => {
  if (!card) return null;

  return {
    type,
    airline: {
      name: card.airline?.name || "N/A",
      code: card.airline?.code || "N/A",
      logo: card.airline?.logo || "/images/dummyFlightlogo.png",
    },
    aircraft: card.airline?.aircraft || "N/A",
    cabinClass: card.cabin || "N/A",
    fareType: card.fareType || "N/A",
    date: card.segments?.[0]?.date || "N/A",
    departure: {
      time: card.segments?.[0]?.time || "N/A",
      city: card.segments?.[0]?.city || "N/A",
    },
    arrival: {
      time: card.segments?.[2]?.time || "N/A",
      city: card.segments?.[2]?.city || "N/A",
    },
    duration: {
      hours: card.segments?.[1]?.duration?.hours || "00",
      minutes: card.segments?.[1]?.duration?.mins || "00",
    },
    stops: card.segments?.[1]?.nonStop ? "Non-Stop" : "Stop",
    facilities: card.facilities || [],
  };
};
const FlightBlock = ({ data, showReturnLabel = false }) => {
  const {
    airline,
    fareType,
    cabin,
    segments,
    layover,
    firstTrip,
    secondTrip,
    facilities,
  } = data;

  return (
    <>
      <div
        className={`${styles.section} ${showReturnLabel ? styles.lastSection : ""
          } ${secondTrip ? styles.secondTrip : ""}`}
      >
        {/* Header */}
        <div className={styles.flightHeader}>
          <div className={styles.airlineLeft}>
            <img
              src={getResolvedLogo(airline)}
              alt={airline.name}
              className={styles.airlineLogo}
            />
            <div>
              <div className={styles.airlineName}>
                {airline.name} ({airline.code})
              </div>
              <div className={styles.aircraft}>{airline.aircraft}</div>
            </div>
          </div>

          <div className={styles.fareInfo}>
            <span className={styles.fareText}>{fareType}</span>
            <span
              className={`${styles.fareBadge} ${cabin.toLowerCase() === "first class" ? styles.firstClass : ""
                } ${cabin.toLowerCase() === "business"
                  ? styles.businessClassBadge
                  : ""
                }`}
            >
              {cabin}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className={styles.timeline}>
          {/* Start */}
          <div className={styles.timeBlock}>
            <span className={styles.date}>{segments[0].date}</span>
            <span className={styles.time}>{segments[0].time}</span>
            <span className={styles.city}>{segments[0].city}</span>
            <span className={styles.terminal}>{segments[0].terminal}</span>
            <span className={styles.terminalName}>
              {segments[0].terminalName}
            </span>
          </div>

          {/* Middle */}
          <div className={styles.flightPath}>
            <div className={styles.dotAndLineContainerParent}>
              <span className={styles.dotAndLineContainer}>
                <span className={styles.dot} />
                <DashedLineIcon />
              </span>
              <FlightIcon />

              <span className={styles.dotAndLineContainer}>
                <DashedLineIcon />
                <span className={styles.dot} />
              </span>
            </div>

            <span className={styles.duration}>
              <span className={styles.hour}>{segments[1].duration.hours} </span>
              h{"  "}
              <span className={styles.mins}>{segments[1].duration.mins} </span>m
              {segments[1].nonStop ? " • Non-Stop" : ""}
            </span>
          </div>

          {/* End */}
          <div className={styles.timeBlockRigth}>
            <span className={styles.date}>{segments[2].date}</span>
            <span className={styles.time}>{segments[2].time}</span>
            <span className={styles.city}>{segments[2].city}</span>
            <span className={styles.terminal}>{segments[2].terminal}</span>{" "}
            <span className={styles.terminalName}>
              {segments[2].terminalName}
            </span>
          </div>
        </div>

        {/* Layover */}
        {firstTrip && (
          <div className={styles.layover}>
            Change of Aircraft: <span className={styles.number}>3</span> h{" "}
            <span className={styles.number}>15</span> m Layover in Kuala Lumpur
            (KUL)
          </div>
        )}

        {/* Facilities */}
        {facilities && (
          <div className={styles.facilities}>
            <div className={styles.facilityTitle}>Facilities</div>
            <div className={styles.facilityContainer}>
              {" "}
              {facilities.map((item, i) => (
                <span className={styles.facility} key={i}>
                  {i == 0 && <BaggageIcon />}
                  {i == 1 && <TVIcon />}
                  {i == 2 && <PowerIcon />}
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const TripSummaryExpandable = ({ data }) => {
  const onwardCards = Array.isArray(data?.onwardCards)
    ? data.onwardCards.filter(Boolean)
    : [data?.onward, data?.onwardBusinessClass].filter(Boolean);
  const returnCards = Array.isArray(data?.returnCards)
    ? data.returnCards.filter(Boolean)
    : [data?.return].filter(Boolean);
  const mobileOnwardFlight = toMobileFlight(onwardCards[0], "DEPARTURE");
  const mobileReturnFlight = toMobileFlight(returnCards[0], "RETURN");

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.cardsContainer}>
          {onwardCards.map((item, index) => (
            <FlightBlock
              key={`onward-${index}`}
              data={item}
            />
          ))}
        </div>
        {returnCards.length > 0 && (
          <>
            <div className={styles.returnLabel}>RETURN</div>
            <div className={styles.cardsContainer}>
              {returnCards.map((item, index) => (
                <FlightBlock
                  key={`return-${index}`}
                  data={item}
                  showReturnLabel
                />
              ))}
            </div>
          </>
        )}
        <div className={styles.bottomRulesContainer}>
          <span>Fare Rules</span>

          <span>Baggage</span>
        </div>
      </div>

      <div className={styles.wrapperMobile}>
        <div className={styles.flightDepartureReturenDetailsContianerWrapper}>
          <div className={styles.flightDepartureReturenDetailsContianer}>
            {mobileOnwardFlight && <FlightSection flight={mobileOnwardFlight} />}
            {mobileReturnFlight && (
              <>
                <div className={styles.dashedBorder}></div>
                <FlightSection flight={mobileReturnFlight} />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TripSummaryExpandable;

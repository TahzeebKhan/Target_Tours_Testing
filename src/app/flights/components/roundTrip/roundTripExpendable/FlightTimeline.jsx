// "use client";
// import React from "react";
// import styles from './RoundTripExpendable.module.css'

// const FlightTimeline = ({ flight }) => {
//     return (
//         <div className={styles.flightBody}>
//             <div className={styles.aboutFlightContainer}>
//                 <div className={styles.aboutFlightContainerLeft}>
//                     <img className={styles.flightIcon} src="/images/Flight1.png" alt="" />
//                     <div className={styles.flightInfoTextContainer}>
//                         <div className={styles.flightInfoTextTitle}>Batik Air, Indones.... <span>(ID 715)</span></div>
//                         <div className={styles.flightInfoTextChips}>Boeing 737</div>
//                     </div>
//                 </div>
//             </div>

//             <div className={styles.timelineContainer}>
//                 {/* LEFT */}
//                 <div className={styles.side}>
//                     <div className={styles.date}>THU, 18 DEC 2025</div>
//                     <div className={styles.time}>06:45</div>
//                     <div className={styles.airport}>CGK - JAKARTA</div>
//                     <div className={styles.terminal}>Terminal T2F</div>
//                     <div className={styles.city}>Soekarno–Hatta Inter.......</div>
//                 </div>

//                 {/* CENTER */}
//                 <div className={styles.center}>
//                     <div className={styles.flightAnimation}>
//                         <div className={styles.flightDotedcontainer}>
//                             <div className={styles.bigDot}></div>
//                             <div className={styles.dashBorder}></div>
//                         </div>
//                         <img className={styles.flightSvg} src="/icons/flightIcon.svg" alt="" />
//                         <div className={styles.flightDotedcontainer}>
//                             <div className={styles.dashBorder}></div>
//                             <div className={styles.bigDot}></div>
//                         </div>
//                     </div>
//                     <div className={styles.priceContainer}>
//                         <span className={styles.duration}>01<span className={styles.hours}> h </span>50<span className={styles.hours}> m </span></span>
//                         <div className={styles.dot}></div>
//                         <span className={styles.nonStop}>Non Stop</span>
//                     </div>
//                 </div>

//                 {/* RIGHT */}
//                 <div className={styles.sideRight}>
//                     <div className={styles.date}>Thu, 18 Dec 2025</div>
//                     <div className={styles.time}>08:00</div>
//                     <div className={styles.airport}>KUL – Kuala Lumpur</div>
//                     <div className={styles.terminal}>Terminal T1</div>
//                     <div className={styles.city}>Kuala Lumpur Internati..</div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default FlightTimeline;

"use client";
import React from "react";
import styles from "./RoundTripExpendable.module.css";

const FlightTimeline = ({ flight }) => {
    return (
        <div className={styles.flightBody}>
            {/* TOP INFO */}
            <div className={styles.aboutFlightContainer}>
                <div className={styles.aboutFlightContainerLeft}>
                    <img
                        className={styles.flightIcon}
                        src={flight.airline.logo}
                        alt={flight.airline.name}
                    />
                    <div className={styles.flightInfoTextContainer}>
                        <div className={styles.flightInfoTextTitle}>
                            {flight.airline.name}
                            <span> ({flight.airline.code})</span>
                        </div>
                        <div className={styles.flightInfoTextChips}>
                            {flight.aircraft}
                        </div>
                    </div>
                </div>
            </div>

            {/* TIMELINE */}
            <div className={styles.timelineContainer}>
                {/* LEFT */}
                <div className={styles.side}>
                    <div className={styles.date}>{flight.departure.date}</div>
                    <div className={styles.time}>{flight.departure.time}</div>
                    <div className={styles.airport}>{flight.departure.airport}</div>
                    <div className={styles.terminal}>{flight.departure.terminal}</div>
                    <div className={styles.city}>{flight.departure.city}</div>
                </div>

                {/* CENTER */}
                <div className={styles.center}>
                    <div className={styles.flightAnimation}>
                        <div className={styles.flightDotedcontainer}>
                            <div className={styles.bigDot}></div>
                            <div className={styles.dashBorder}></div>
                        </div>

                        <img
                            className={styles.flightSvg}
                            src="/icons/flightIcon.svg"
                            alt="flight"
                        />

                        <div className={styles.flightDotedcontainer}>
                            <div className={styles.dashBorder}></div>
                            <div className={styles.bigDot}></div>
                        </div>
                    </div>

                    <div className={styles.priceContainer}>
                        <span className={styles.duration}>
                            {flight.duration.hours}
                            <span className={styles.hours}> h </span>
                            {flight.duration.minutes}
                            <span className={styles.hours}> m </span>
                        </span>

                        <div className={styles.dot}></div>

                        <span className={styles.nonStop}>{flight.stops}</span>
                    </div>
                </div>

                {/* RIGHT */}
                <div className={styles.sideRight}>
                    <div className={styles.date}>{flight.arrival.date}</div>
                    <div className={styles.time}>{flight.arrival.time}</div>
                    <div className={styles.airport}>{flight.arrival.airport}</div>
                    <div className={styles.terminal}>{flight.arrival.terminal}</div>
                    <div className={styles.city}>{flight.arrival.city}</div>
                </div>
            </div>
        </div>
    );
};

export default FlightTimeline;

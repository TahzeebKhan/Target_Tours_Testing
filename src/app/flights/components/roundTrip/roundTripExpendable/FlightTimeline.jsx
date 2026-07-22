
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
                            src="/icons/flightIconBlue.svg"
                            height={20}
                            width={20}
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

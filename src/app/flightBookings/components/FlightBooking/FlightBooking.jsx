"use client"
import React, { useState } from 'react'
import styles from './FlightBooking.module.css'
import ExpandableTabs from '../expendableTabs/ExpandableTabs';

const FlightBooking = () => {


    // track which flight's details are open (by id) so only that item expands
    const [openId, setOpenId] = useState(null);
    const [activeTab, setActiveTab] = useState("info");

    const flightResults = [
        {
            id: 1,
            airline: {
                name: "IndiGo",
                code: "6E-541",
                logo: "/images/indigo.png"
            },
            departure: {
                time: "06:45",
                city: "Jakarta (CGK)",
            },
            arrival: {
                time: "08:00",
                city: "Singapore (SIN)",
            },
            duration: {
                hours: 1,
                minutes: 50
            },
            stops: {
                type: "Non Stop",
                count: 0,
                via: null,
                nextDay: false
            },
            fare: {
                totalFare: "₹ 3,22,000",
                pricePerAdult: "₹ 12,000",
                cabinClass: "ECONOMY"
            }
        },

        {
            id: 2,
            airline: {
                name: "IndiGo",
                code: " AI 2441",
                logo: "/images/indigo.png"
            },
            departure: {
                time: "06:45",
                city: "Jakarta (CGK)",

            },
            arrival: {
                time: "08:00",
                city: "Singapore (SIN)",

            },
            duration: {
                hours: 1,
                minutes: 50
            },
            stops: {
                type: "1 Stop",
                count: 1,
                via: "Kolkata",
                nextDay: true
            },
            fare: {
                totalFare: "₹ 3,22,000",
                pricePerAdult: "₹ 12,000",
                cabinClass: "ECONOMY"
            }
        },

        {
            id: 3,
            airline: {
                name: "Air India",
                code: "AI-541",
                logo: "/images/airindia.png"
            },
            departure: {
                time: "20:15",
                city: "Jakarta (CGK)",

            },
            arrival: {
                time: "21:30",
                city: "Singapore (SIN)",
            },
            duration: {
                hours: 2,
                minutes: 51
            },
            stops: {
                type: "Non Stop",
                count: 0,
                via: null,
                nextDay: false
            },
            fare: {
                totalFare: "₹ 3,22,000",
                pricePerAdult: "₹ 12,000",
                cabinClass: "ECONOMY"
            }
        }
    ];

    return (
        <section className={styles.container}>
            <div className={styles.FlightBookingTextContainer}>
                <h2 className={styles.heading}>Flight from <span>Jakarta</span> to <span>Singapore</span></h2>
                <div className={styles.subTextContainer}>
                    <span className={styles.priceInfo}>The price is average for one person. Included all taxes and fees.</span>
                    <span className={styles.itemsResult}>Showing 1-10 of 100 results</span>
                </div>
            </div>

            <div className={styles.sortContainer}>
                <div className={styles.sortSubContainer}>
                    <div className={styles.sortedItemMainContainer}>
                        <div className={styles.sortedItemContainer}>
                            <div className={styles.sortedItem}>
                                <img src="/images/Flight.png" alt="" />
                                <div className={styles.sortedTextContainer}>
                                    <span className={styles.budget}>CHEAPEST</span>
                                    <div className={styles.priceContainer}>
                                        <span className={styles.price}>
                                            ₹
                                            8500
                                        </span>
                                        <div className={styles.dot}></div>
                                        <span className={styles.duration}>01 <span className={styles.hours}>h</span> 50 <span className={styles.hours}>m</span></span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.sortedItem}>
                                <img src="/images/Flight.png" alt="" />
                                <div className={styles.sortedTextContainer}>
                                    <span className={styles.budget}>CHEAPEST</span>
                                    <div className={styles.priceContainer}>
                                        <span className={styles.price}>
                                            ₹
                                            8500
                                        </span>
                                        <div className={styles.dot}></div>
                                        <span className={styles.duration}>01 <span className={styles.hours}>h</span> 50 <span className={styles.hours}>m</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.sortByContainer}>
                        <img src="/icons/sort.svg" alt="" />
                        <span className={styles.sortByText}>Sort by</span>
                    </div>
                </div>
            </div>
            {flightResults.map((flight) => (
                <div className={styles.expendableContainer}>

                    <div key={flight.id} className={`${styles.flightFareDetailsContainer} ${openId === flight.id ? styles.flightFareDetailsContainerOpen : ""
                        }`}>
                        <div className={styles.flightFareDetails}>
                            <div className={styles.flightDetail}>
                                <div className={styles.flightNameContainer}>
                                    <img src="/images/Flight.png" alt="" />
                                    <div className={styles.flightName}>
                                        <span className={styles.airlineName}>{flight.airline.name}</span>
                                        <span className={styles.flightNumber}>{flight.airline.code}</span>
                                    </div>
                                </div>
                                <div className={styles.departureDetail}>
                                    <div className={styles.departureTimeContainer}>
                                        <div className={styles.departureTime}>{flight.departure.time} </div>
                                        <div className={styles.flightAnimation}>
                                            <div className={styles.flightDotedcontainer}>
                                                <div className={styles.bigDot}></div>
                                                <div className={styles.dashBorder}></div>
                                            </div>
                                            <img src="/icons/flightIcon.svg" alt="" />
                                            <div className={styles.flightDotedcontainer}>
                                                <div className={styles.dashBorder}></div>
                                                <div className={styles.bigDot}></div>
                                            </div>
                                        </div>
                                        <div className={styles.departureTime}>{flight.arrival.time} </div>
                                    </div>
                                    <div className={styles.departureName}>
                                        <span className={styles.fromName}>{flight.departure.city}</span>
                                        <div className={styles.priceContainer}>
                                            <span className={styles.duration}>{flight.duration.hours} <span className={styles.hours}>h</span> {flight.duration.minutes} <span className={styles.hours}>m</span></span>
                                            <div className={styles.dot}></div>
                                            <span className={styles.nonStop}>{flight.stops.type}</span>
                                        </div>
                                        <span className={styles.fromName}>{flight.arrival.city}</span>
                                    </div>
                                </div>

                            </div>
                            <div className={styles.seeDetailsBtn} onClick={() => setOpenId(prev => prev === flight.id ? null : flight.id)}>
                                See Details
                                <svg className={`${styles.downArrow} ${openId === flight.id ? styles.rotate : ''}`} width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.55967 4.01408C3.47933 4.01408 3.40454 4.00126 3.33532 3.97562C3.26609 3.94997 3.20028 3.90596 3.13789 3.84357L0.141737 0.847416C0.0494254 0.755116 0.0022032 0.639094 6.98646e-05 0.49935C-0.00207458 0.359606 0.0451476 0.241444 0.141737 0.144866C0.238314 0.0482881 0.355403 0 0.493003 0C0.630603 0 0.747692 0.0482881 0.84427 0.144866L3.55967 2.86027L6.27507 0.144866C6.36737 0.0525659 6.48339 0.0053437 6.62314 0.00319926C6.76287 0.00106593 6.88102 0.0482881 6.9776 0.144866C7.07419 0.241444 7.12249 0.358539 7.12249 0.49615C7.12249 0.63375 7.07419 0.750838 6.9776 0.847416L3.98145 3.84357C3.91906 3.90596 3.85325 3.94997 3.78402 3.97562C3.7148 4.00126 3.64001 4.01408 3.55967 4.01408Z" fill="#000033" />
                                </svg>

                            </div>

                        </div>
                        <div className={styles.fareDetails}>
                            <div className={styles.totalFare}>
                                <span className={styles.fareText}>{flight.fare.totalFare}</span>
                                <button className={styles.viewBtn}>VIEW FARES</button>
                            </div>
                            <div className={styles.fareAmount}>
                                <span className={styles.fare}>{flight.fare.pricePerAdult}  <span className={styles.adult}> /ADULT</span></span>
                                <div className={styles.dot}></div>
                                <span className={styles.economy}>{flight.fare.cabinClass}</span>
                            </div>
                        </div>


                    </div>

                    {/* ===== EXPANDABLE PANEL ===== */}
                    <div className={`${styles.expandWrap} ${openId === flight.id ? styles.open : ""}`}>
                        <ExpandableTabs />
                    </div>
                </div>
            ))}


        </section>
    )
}

export default FlightBooking

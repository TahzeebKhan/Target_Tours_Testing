"use client";
import React from "react";
import styles from "./FareComparisonModal.module.css";

const FareComparisonModal = ({ isOpen, onClose, flightData }) => {
    if (!isOpen) return null;

    const fareOptions = [
        {
            id: "saver",
            name: "SAVER FARE",
            price: "₹ 760,000",
            pricePerAdult: "₹ 6,083",
            isPremium: false,
            baggage: {
                cabin: "7 Kg Cabin Bag Allowance",
                checkin: "15 Kg Check-in Bag Allowance",
            },
            changes: {
                charges: "Change Charges Upto INR 2999",
                cancellation: "Cancellation Charges Upto INR 4999",
            },
            addons: {
                seats: "Chargeable Seats",
                meals: "Chargeable Meals",
            },
        },
        {
            id: "flexi",
            name: "FLEXI PLUS FARE",
            price: "₹ 760,000",
            pricePerAdult: "₹ 6,083",
            isPremium: true,
            baggage: {
                cabin: "7 Kg Cabin Bag Allowance",
                checkin: "15 Kg Check-in Bag Allowance",
            },
            changes: {
                charges: "Change Charges Upto INR 3499",
                cancellation: "Cancellation Charges Upto INR 3499",
            },
            addons: {
                seats: "Complimentary XL Bomb Legroom Seat",
                meals: "Complimentary Standard Seat",
            },
        },
        {
            id: "premium",
            name: "PREMIUM FARE",
            price: "₹ 760,000",
            pricePerAdult: "₹ 6,083",
            isPremium: false,
            baggage: {
                cabin: "7 Kg Cabin Bag Allowance",
                checkin: "15 Kg Check-in Bag Allowance",
            },
            changes: {
                charges: "Change Charges Upto INR 2999",
                cancellation: "Cancellation Charges Upto INR 4999",
            },
            addons: {
                seats: "Complimentary XL Bomb Legroom Seat",
                meals: "Chargeable Meals",
            },
        },
    ];

    const flight = {
        departure: {
            date: "THU, 18 DEC 2025",
            time: "06:45",
            airport: "DEL - DELHI",
            terminal: "Terminal T2",
            city: "Indira Gandhi International",
        },
        arrival: {
            date: "THU, 18 DEC 2025",
            time: "08:00",
            airport: "HKT - PHUKET CITY",
            terminal: "Terminal T3",
            city: "Phuket International",
        },
        duration: {
            hours: 1,
            minutes: 50,
        },
        stops: "Non-Stop",
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>Compare fares and choose what fits your journey</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>

                {/* Flight Info */}
                <div className={styles.flightInfo}>
                    <div className={styles.fromToSection}>
                        <span>New Delhi </span>
                        <img src="/icons/rightArrow1.svg" alt="" />
                        <span>Phuket City</span>
                    </div>
                    <div className={styles.flightDuration}>
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
                                       <img src="/icons/dashline.svg" alt="" />
                                    </div>

                                    <img
                                        className={styles.flightSvg}
                                        src="/icons/flightIconBlue.svg"
                                        height={20}
                                        width={20}
                                        alt="flight"
                                    />

                                    <div className={styles.flightDotedcontainer}>
                                        {/* <div className={styles.dashBorder}></div> */}
                                        <img src="/icons/dashline.svg" alt="" />
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
                </div>

                {/* Fare Cards */}
                <div className={styles.fareCards}>

                    {fareOptions.map((fare) => (
                        <div
                            key={fare.id}
                            className={`${styles.fareCardContainer} ${fare.isPremium ? styles.premiumContainer : ""
                                }`}
                        >

                            {fare.isPremium && (
                                <div className={styles.premiumBadge}>PREMIUM</div>
                            )}

                            <div className={styles.fareCard}>

                                <div className={styles.fareHeader}>


                                    <h3 className={styles.fareName}>{fare.name}</h3>
                                    <div className={styles.farePrice}>
                                        <span className={styles.price}>{fare.price}</span>
                                        <img src="/icons/Group.svg" alt="" />

                                    </div>
                                    <span className={styles.pricePerAdult}>{fare.pricePerAdult}  <span className={styles.adult}>/ ADULT</span></span>
                                </div>
                                <div className={styles.hr}></div>


                                {/* Baggage */}
                                <div className={styles.featureSection}>
                                    <div className={styles.featureTitle}>BAGGAGE</div>
                                    <div className={styles.featureItem}>
                                        <img src="/icons/bigBag.svg" alt="" />
                                        <span>{fare.baggage.cabin}</span>
                                    </div>
                                    <div className={styles.featureItem}>
                                        <img src="/icons/bag.svg" alt="" />
                                        <span>{fare.baggage.checkin}</span>
                                    </div>
                                </div>

                                <div className={styles.hr}></div>

                                {/* Change/Cancellation */}
                                <div className={styles.featureSection}>
                                    <div className={styles.featureTitle}>CHANGE / CANCELLATION</div>
                                    <div className={styles.featureItem}>
                                        <img src="/icons/change.svg" alt="" />
                                        <span>{fare.changes.charges}</span>
                                    </div>
                                    <div className={styles.featureItem}>
                                        <img src="/icons/cancellation.svg" alt="" />
                                        <span>{fare.changes.cancellation}</span>
                                    </div>
                                </div>

                                <div className={styles.hr}></div>

                                {/* Add-ons */}
                                <div className={styles.featureSection}>
                                    <div className={styles.featureTitle}>ADD-ONS AND SERVICES</div>
                                    <div className={styles.featureItem}>
                                        <img src={fare.isPremium ? "/icons/MEAL.svg" : "/icons/change.svg"} alt="" />
                                        <span>{fare.addons.seats}</span>
                                    </div>
                                    <div className={styles.featureItem}>
                                        <img src={fare.isPremium ? "/icons/couch.svg" : "/icons/cancellation.svg"} alt="" />
                                        <span>{fare.addons.meals}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Action Buttons */}
                            <div className={styles.fareActions}>
                                <button className={styles.lockPriceBtn}>LOCK PRICE</button>
                                <button className={styles.bookNowBtn}>BOOK NOW</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FareComparisonModal;

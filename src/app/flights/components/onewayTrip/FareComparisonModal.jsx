"use client";
import React, { useState } from "react";
import styles from "./FareComparisonModal.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import { getSelectedFlightSummary } from "./fareComparisonUtils";
import { toast } from "react-toastify";
import { getFlightPrice } from "@/features/flights/services/flightBooking";
import { writeFlightBookingSession } from "@/features/flights/utils/flightBookingSession";

const FareComparisonModal = ({ isOpen, onClose, flightData }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    if (!isOpen) return null;
    
    const handleBookNow = async (selectedFare) => {
        const priceRequest = flightData?.booking?.priceRequest;
        const routeContext = {
            fromName: String(searchParams?.get("from") || "").replace(/\s*\([^)]+\)\s*$/, "").trim(),
            fromCode: String(searchParams?.get("origin") || "").trim().toUpperCase(),
            toName: String(searchParams?.get("to") || "").replace(/\s*\([^)]+\)\s*$/, "").trim(),
            toCode: String(searchParams?.get("destination") || "").trim().toUpperCase(),
        };
        if (!priceRequest?.search_key || !priceRequest?.Trips?.[0]?.Index) {
            toast.error("Missing booking payload for the selected flight.");
            return;
        }

        setIsSubmitting(true);
        try {
            const priceResponse = await getFlightPrice(priceRequest);
            writeFlightBookingSession({
                selectedFlight: flightData,
                selectedFare,
                routeContext,
                priceRequest,
                priceResponse,
                ssrRequest: null,
                ssrResponse: null,
            });
            router.push("/flight-booking-details");
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to continue with this flight right now."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

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

    const flight = getSelectedFlightSummary(flightData, searchParams?.get("start"));

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
                        <span>{flight.route.fromName} </span>
                        <img src="/icons/rightArrow1.svg" alt="" />
                        <span>{flight.route.toName}</span>
                    </div>
                    <div className={styles.flightDuration}>
                        <div className={styles.flightInfoStatus}>
                            <img className={styles.flightIconStatus} src={flight.airline.logo} alt="" />
                            <div className={styles.flightInfoNameDatesContainer}>
                                <span className={styles.flightInfoNameDates}>{flight.airline.name}</span>
                                <div className={styles.smallestDot}></div>
                                <span className={styles.flightInfoNameDates}>{flight.airline.code}</span>
                                <div className={styles.smallestDot}></div>
                                <span className={styles.flightInfoNameDates}>{flight.airline.aircraft}</span>
                                <div className={styles.smallestDot}></div>
                                <span className={styles.flightInfoNameDates}>{flight.airline.cabinClass}</span>
                            </div>
                        </div>
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
                                       <img src="/images/popupDash.svg" alt="" />
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
                                        <img src="/images/popupDash.svg" alt="" />
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
                                <button className={styles.bookNowBtn} disabled={isSubmitting} onClick={() => handleBookNow(fare)}>{isSubmitting ? "LOADING..." : "BOOK NOW"}</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FareComparisonModal;

"use client";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./FareComparisonModal.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import { getSelectedFlightSummary } from "./fareComparisonUtils";
import { toast } from "react-toastify";
import {
    getFlightPrice,
    getFlightTravelChecklist,
} from "@/features/flights/services/flightBooking";
import {
    buildBookingFallbackQuery,
    writeFlightBookingSession,
} from "@/features/flights/utils/flightBookingSession";
import { useAuth } from "@/app/context/AuthContext";
import LoginPopup from "@/app/account/loginPopUp/LoginPopup";
import SignupPopup from "@/app/account/signUpPopUp/SignupPopup";

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

const pickValue = (...values) =>
    values.find((value) => value !== undefined && value !== null && value !== "");

const formatCurrency = (value) => {
    const amount = readNumber(value);
    if (amount === null) return "";
    return `₹ ${amount.toLocaleString("en-IN")}`;
};

const getNestedArray = (payload, paths) => {
    for (const path of paths) {
        let current = payload;
        for (const key of path) {
            current = current?.[key];
        }
        if (Array.isArray(current) && current.length > 0) return current;
    }
    return [];
};

const DEFAULT_FARE_TEMPLATES = [
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

export const buildFareOptions = ({ flightData, prefetchedData, adults }) => {
    const resolvedPrefetchedData = prefetchedData || flightData?.prefetchedFareData || {};
    const priceResponse = resolvedPrefetchedData?.priceResponse || {};
    const pricePayload = priceResponse?.data || priceResponse || {};
    const fareBreakdown = getNestedArray(pricePayload, [
        ["fare_breakdown"],
    ]);
    const onwardFareBreakdown =
        fareBreakdown.find(
            (item) => String(item?.journey_type || "").toUpperCase() === "ONWARD"
        ) ||
        fareBreakdown[0] ||
        {};
    const firstJourneyPrice = readNumber(
        onwardFareBreakdown?.total_journey_price,
        onwardFareBreakdown?.totalJourneyPrice
    );
    const rootTotal = readNumber(firstJourneyPrice);
    const rootPerAdult = readNumber(
        onwardFareBreakdown?.ADT?.per_person,
        onwardFareBreakdown?.ADT?.perPerson
    );
    const safeAdults = Math.max(Number(adults || 1), 1);
    const sourceItems = DEFAULT_FARE_TEMPLATES;

    return sourceItems.map((item, index) => {
        const template = DEFAULT_FARE_TEMPLATES[index] || DEFAULT_FARE_TEMPLATES[0];
        const shouldUseDynamicPrice = index === 0;
        const total = shouldUseDynamicPrice ? readNumber(rootTotal) : null;
        const perAdult = shouldUseDynamicPrice
            ? readNumber(rootPerAdult, total !== null ? Math.round(total / safeAdults) : null)
            : null;

        return {
            ...template,
            id: String(pickValue(item?.id, item?.ID, item?.fare_id, item?.FareID, template.id, index)),
            name: String(
                pickValue(
                    item?.name,
                    item?.Name,
                    item?.fare_name,
                    item?.FareName,
                    item?.fareType,
                    item?.FareType,
                    template.name
                )
            ).toUpperCase(),
            price: shouldUseDynamicPrice
                ? formatCurrency(total) || template.price || flightData?.fare?.totalFare || "N/A"
                : template.price,
            pricePerAdult: shouldUseDynamicPrice
                ? formatCurrency(perAdult) ||
                template.pricePerAdult ||
                flightData?.fare?.pricePerAdult ||
                "N/A"
                : template.pricePerAdult,
        };
    });
};

const FareComparisonModal = ({ isOpen, onClose, flightData, prefetchedData = null }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isLoggedIn, loading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [authView, setAuthView] = useState("login");
    const [pendingFare, setPendingFare] = useState(null);
    
    const performBookNow = useCallback(async (selectedFare) => {
        const priceRequest = flightData?.booking?.priceRequest;
        const hasPricePayload =
            Boolean(priceRequest?.search_key) &&
            priceRequest?.Trips?.[0]?.Index !== undefined &&
            priceRequest?.Trips?.[0]?.Index !== null;
        const routeContext = {
            fromName: String(searchParams?.get("from") || "").replace(/\s*\([^)]+\)\s*$/, "").trim(),
            fromCode: String(searchParams?.get("origin") || "").trim().toUpperCase(),
            toName: String(searchParams?.get("to") || "").replace(/\s*\([^)]+\)\s*$/, "").trim(),
            toCode: String(searchParams?.get("destination") || "").trim().toUpperCase(),
        };
        if (!hasPricePayload) {
            toast.error("Missing booking payload for the selected flight.");
            return;
        }

        setIsSubmitting(true);
        try {
            const priceResponse =
                prefetchedData?.priceResponse || (await getFlightPrice(priceRequest));
            const checklistTui =
                priceResponse?.data?.raw?.TUI ||
                priceResponse?.raw?.TUI ||
                priceResponse?.data?.tui ||
                priceResponse?.data?.TUI ||
                priceResponse?.tui ||
                priceResponse?.TUI;

            const checklistResponse = prefetchedData?.checklistResponse ||
                (checklistTui ? await getFlightTravelChecklist({
                    TUI: checklistTui,
                    ClientID:
                        flightData?.booking?.clientId ||
                        priceRequest?.ClientID ||
                        "FVI6V120g22Ei5ztGK0FIQ==",
                }) : null);
            const nextSession = {
                selectedFlight: flightData,
                selectedFare,
                routeContext,
                priceRequest,
                priceResponse,
                checklistResponse,
                ssrRequest: null,
                ssrResponse: null,
            };
            writeFlightBookingSession(nextSession);
            const fallbackQuery = buildBookingFallbackQuery(nextSession);
            router.push(
                fallbackQuery
                    ? `/flight-booking-details?${fallbackQuery}`
                    : "/flight-booking-details"
            );
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to continue with this flight right now."
            );
        } finally {
            setIsSubmitting(false);
        }
    }, [flightData, prefetchedData, router, searchParams]);

    useEffect(() => {
        if (!pendingFare || !isLoggedIn) return;
        const selectedFare = pendingFare;
        setPendingFare(null);
        setShowLogin(false);
        performBookNow(selectedFare);
    }, [isLoggedIn, pendingFare, performBookNow]);

    const handleBookNow = async (selectedFare) => {
        if (loading) return;
        if (!isLoggedIn) {
            setPendingFare(selectedFare);
            setAuthView("login");
            setShowLogin(true);
            return;
        }
        performBookNow(selectedFare);
    };

    if (!isOpen) return null;

    const fareOptions = buildFareOptions({
        flightData,
        prefetchedData,
        adults: searchParams?.get("adults") || 1,
    });

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
            {showLogin && authView === "login" && (
                <LoginPopup
                    onClose={() => {
                        setShowLogin(false);
                        setPendingFare(null);
                    }}
                    onNavigate={setAuthView}
                />
            )}
            {showLogin && authView === "signup" && (
                <SignupPopup
                    onClose={() => {
                        setShowLogin(false);
                        setPendingFare(null);
                    }}
                    onNavigate={setAuthView}
                />
            )}
        </div>
    );
};

export default FareComparisonModal;

"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./FareComparisonModal.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import { getSelectedFlightSummary } from "./fareComparisonUtils";
import { toast } from "react-toastify";
import {
    getFlightPrice,
    getFlightFareOptions,
} from "@/features/flights/services/flightBooking";
import {
    buildBookingFallbackQuery,
    buildSelectedFarePriceRequest,
    writeFlightBookingSession,
} from "@/features/flights/utils/flightBookingSession";
import { useAuth } from "@/app/context/AuthContext";
import LoginPopup from "@/app/account/loginPopUp/LoginPopup";
import SignupPopup from "@/app/account/signUpPopUp/SignupPopup";
import {
    getCachedFareOptionsRequest,
    getFareOptionItems,
    isFareExpiredPayload,
} from "./fareOptionsStreaming";
import useLockBodyScroll from "@/app/hooks/useLockBodyScroll";

const readNumber = (...values) => {
    for (const value of values) {
        if (value === undefined || value === null || value === "") continue;

        const normalizedText =
            typeof value === "string" ? value.replace(/[^\d.]/g, "") : null;
        if (typeof value === "string" && !normalizedText) continue;

        const normalized =
            typeof value === "string" ? Number(normalizedText) : Number(value);
        if (Number.isFinite(normalized)) return normalized;
    }
    return null;
};

const pickValue = (...values) =>
    values.find((value) => value !== undefined && value !== null && value !== "");

const getSelectedFareIndex = (fare) =>
    pickValue(
        fare?.rawFare?.index,
        fare?.rawFare?.Index,
        fare?.rawFare?.flightIndex,
        fare?.index,
        fare?.Index,
        fare?.flightIndex,
        fare?.id
    );

const getPricePayload = (priceResponse) => {
    const nestedPayload = priceResponse?.data?.data;
    const directPayload = priceResponse?.data;
    const pricingChunkPayload = (priceResponse?.pricingChunks || directPayload?.pricingChunks || [])
        .slice()
        .reverse()
        .find((chunk) => {
            const resultPayload = Array.isArray(chunk?.data?.results)
                ? chunk.data.results.find((result) => result?.data?.data)?.data?.data
                : null;
            return (
                resultPayload?.formatted ||
                resultPayload?.fare_breakdown ||
                resultPayload?.tui
            );
        });
    const chunkResultPayload = Array.isArray(pricingChunkPayload?.data?.results)
        ? pricingChunkPayload.data.results.find((result) => result?.data?.data)?.data?.data
        : null;
    const v2PricingResultPayload = Array.isArray(directPayload?.results)
        ? directPayload.results.find((result) => {
            const resultPayload = result?.data?.data || result?.data;
            return (
                resultPayload?.formatted ||
                resultPayload?.fare_breakdown ||
                resultPayload?.tui
            );
        })?.data?.data
        : null;

    if (chunkResultPayload?.formatted || chunkResultPayload?.fare_breakdown || chunkResultPayload?.tui) {
        return chunkResultPayload;
    }

    if (v2PricingResultPayload?.formatted || v2PricingResultPayload?.fare_breakdown || v2PricingResultPayload?.tui) {
        return v2PricingResultPayload;
    }

    if (nestedPayload?.formatted || nestedPayload?.fare_breakdown || nestedPayload?.tui) {
        return nestedPayload;
    }

    if (directPayload?.formatted || directPayload?.fare_breakdown || directPayload?.tui) {
        return directPayload;
    }

    return priceResponse || {};
};

const getFormattedPricePayload = (priceResponse) => getPricePayload(priceResponse)?.formatted || null;

const getFormattedJourney = (priceResponse) => {
    const formatted = getFormattedPricePayload(priceResponse);
    return Array.isArray(formatted?.journeys) ? formatted.journeys[0] || null : null;
};

const buildFormattedOnlyPriceResponse = (priceResponse) => {
    const payload = getPricePayload(priceResponse);
    const formatted = getFormattedPricePayload(priceResponse);
    const fareBreakdown = Array.isArray(payload?.fare_breakdown) ? payload.fare_breakdown : [];
    const tui =
        payload?.tui ||
        payload?.TUI ||
        payload?.raw?.TUI ||
        payload?.raw?.tui ||
        priceResponse?.tui ||
        priceResponse?.TUI;
    const trackid =
        payload?.trackid ||
        payload?.trackId ||
        payload?.TrackId ||
        priceResponse?.trackid ||
        priceResponse?.trackId ||
        priceResponse?.TrackId;
    const provider =
        payload?.provider ||
        payload?.Provider ||
        priceResponse?.provider ||
        priceResponse?.Provider;

    return {
        success: priceResponse?.success ?? payload?.success,
        message: priceResponse?.message ?? payload?.message,
        provider,
        tui,
        trackid,
        data: {
            success: payload?.success,
            cached: payload?.cached,
            provider,
            tui,
            trackid,
            search_key: payload?.search_key || payload?.SearchKey,
            SSRSource: payload?.SSRSource,
            ssrSource: payload?.ssrSource,
            formatted,
            fare_breakdown: fareBreakdown,
            total_tax: payload?.total_tax,
            totalTax: payload?.totalTax,
            Tax: payload?.Tax,
            tax: payload?.tax,
            raw: payload?.raw,
        },
        formatted,
        fare_breakdown: fareBreakdown,
        raw: payload?.raw,
        total_tax: payload?.total_tax,
        totalTax: payload?.totalTax,
        Tax: payload?.Tax,
        tax: payload?.tax,
    };
};

const getFormattedRuleLabel = (journey, head, fallback) => {
    const rule = (journey?.rules || [])
        .flatMap((group) => (Array.isArray(group?.Rule) ? group.Rule : []))
        .find((item) => {
            const ruleHead = String(item?.Head || "").toLowerCase();
            const hasMatchingDescription = (item?.Info || []).some((info) =>
                String(info?.Description || "").toLowerCase().includes(head)
            );

            return ruleHead.includes(head) || hasMatchingDescription;
        });
    const amount = rule?.Info?.find((item) =>
        String(item?.Description || "").toLowerCase().includes(head)
    )?.AdultAmount || rule?.Info?.find((item) => item?.AdultAmount)?.AdultAmount;

    if (!amount) return fallback;
    return `${head === "reissue" ? "Change" : "Cancellation"} Charges ${amount}`;
};

const buildSelectedFareFromFormattedPrice = (selectedFare, priceResponse) => {
    const formatted = getFormattedPricePayload(priceResponse);
    const journey = getFormattedJourney(priceResponse);

    if (!formatted || !journey) return selectedFare;

    const totalPrice = readNumber(
        journey?.total_pricing?.net,
        journey?.total_pricing?.gross,
        formatted?.final_price
    );
    const perAdultPrice = readNumber(journey?.per_adult?.net, journey?.per_adult?.gross);
    const taxAmount = readNumber(journey?.total_pricing?.tax, journey?.per_adult?.tax, formatted?.total_tax);
    const fareName = String(journey?.fctype || selectedFare?.name || "").toUpperCase();

    return {
        ...selectedFare,
        name: fareName || selectedFare?.name,
        price: formatCurrency(totalPrice) || selectedFare?.price,
        pricePerAdult: formatCurrency(perAdultPrice) || selectedFare?.pricePerAdult,
        tax: formatCurrency(taxAmount) || selectedFare?.tax,
        netAmount: totalPrice ?? selectedFare?.netAmount,
        netPerAdult: perAdultPrice ?? selectedFare?.netPerAdult,
        formattedFare: journey,
        baggage: {
            cabin:
                journey?.baggage?.cabin ||
                journey?.baggage?.Cabin ||
                selectedFare?.baggage?.cabin ||
                "Cabin baggage as per airline rules",
            checkin:
                journey?.baggage?.checkin ||
                journey?.baggage?.CheckIn ||
                selectedFare?.baggage?.checkin ||
                "Check-in baggage as per airline rules",
        },
        changes: {
            charges: getFormattedRuleLabel(
                journey,
                "reissue",
                selectedFare?.changes?.charges || "Change charges as per airline rules"
            ),
            cancellation: getFormattedRuleLabel(
                journey,
                "cancellation",
                selectedFare?.changes?.cancellation || "Cancellation charges as per airline rules"
            ),
        },
        addons: selectedFare?.addons,
    };
};

const formatCurrency = (value) => {
    const amount = readNumber(value);
    if (amount === null) return "";
    return `₹ ${amount.toLocaleString("en-IN")}`;
};

export const normalizeFareFlightNo = (...values) => {
    for (const value of values) {
        const text = String(value || "").trim();
        if (!text) continue;

        if (text.includes("|")) return text.split("|").pop()?.trim() || "";
        if (/^\d+$/.test(text)) return text;

        const trailing = text.match(/[A-Za-z]{1,3}[-\s]?(\d{1,4})$/);
        if (trailing) return trailing[1];

        const numericParts = text.match(/\d+/g);
        if (numericParts?.length) return numericParts[numericParts.length - 1];

        return text;
    }

    return "";
};

const getFarePriceDetails = (fare, adults = 1) => {
    const adultCount = Math.max(Number(adults || 1), 1);
    const total = readNumber(fare?.netAmount, fare?.price);
    const perAdult = readNumber(
        fare?.netPerAdult,
        fare?.pricePerAdult,
        total !== null ? Math.round(total / adultCount) : null
    );
    const rawFare = fare?.rawFare || {};
    const tax = readNumber(
        rawFare?.tax,
        rawFare?.Tax,
        rawFare?.taxes,
        rawFare?.Taxes,
        rawFare?.total_tax,
        rawFare?.totalTax,
        rawFare?.TotalTax,
        rawFare?.fare_breakdown?.tax,
        rawFare?.fare_breakdown?.Tax,
        rawFare?.fareBreakdown?.tax,
        rawFare?.fareBreakdown?.Tax
    );
    const baseFare = readNumber(
        rawFare?.baseFare,
        rawFare?.BaseFare,
        rawFare?.base_fare,
        rawFare?.total_base_fare,
        rawFare?.TotalBaseFare,
        rawFare?.fare_breakdown?.baseFare,
        rawFare?.fare_breakdown?.BaseFare,
        rawFare?.fareBreakdown?.baseFare,
        rawFare?.fareBreakdown?.BaseFare,
        tax !== null && total !== null ? total - tax : null,
        total
    );

    return {
        adultLine: `${adultCount} x Adult`,
        adultAmount: formatCurrency(
            perAdult !== null ? perAdult * adultCount : total
        ) || fare?.price || "N/A",
        baseFare: formatCurrency(baseFare) || fare?.price || "N/A",
        taxes: formatCurrency(tax) || "Included",
        total: formatCurrency(total) || fare?.price || "N/A",
    };
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

const getRuleDetails = (fare) => {
    const rules = fare?.rules;
    if (!rules) return {};
    if (typeof rules === "string") {
        try {
            return JSON.parse(rules);
        } catch {
            return {};
        }
    }
    return rules;
};

const hasRuleDetails = (fare) => {
    const rules = getRuleDetails(fare);
    return (
        Array.isArray(rules?.summary?.items) ||
        rules?.change_upto !== undefined ||
        rules?.cancellation_upto !== undefined
    );
};

const collectFareRuleSources = (payload) => {
    const sources = [];
    const seen = new Set();

    const visit = (value) => {
        if (!value || typeof value !== "object" || seen.has(value)) return;
        seen.add(value);

        if (hasRuleDetails(value)) {
            sources.push(value);
        }

        if (Array.isArray(value)) {
            value.forEach(visit);
            return;
        }

        Object.values(value).forEach(visit);
    };

    visit(payload?.data || payload || {});
    return sources;
};

const getMatchingRuleSource = (fare, index, ruleSources) => {
    if (!ruleSources.length) return fare;

    return (
        ruleSources.find((source) => String(source?.index || "") === String(fare?.index || "")) ||
        ruleSources.find((source) => readNumber(source?.price) === readNumber(fare?.price)) ||
        ruleSources[index] ||
        fare
    );
};

const formatAllowance = (value = "", suffix = "Allowance") => {
    const normalized = String(value || "").trim();
    if (!normalized) return "";
    const normalizedSuffix = String(suffix || "").trim();
    if (!normalizedSuffix) return normalized;
    if (normalized.toLowerCase().includes(normalizedSuffix.toLowerCase())) {
        return normalized;
    }
    if (
        normalized.toLowerCase().includes("allowance") &&
        normalizedSuffix.toLowerCase().includes("allowance")
    ) {
        return normalized;
    }
    return `${normalized} ${normalizedSuffix}`;
};

const getBaggageDetails = (fare) => {
    const baggageItems = Array.isArray(fare?.ssr?.baggage) ? fare.ssr.baggage : [];
    const firstBaggage = baggageItems[0] || {};
    const baggageName = String(firstBaggage?.name || "").trim();
    const baggageParts = baggageName
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    const checkin =
        baggageParts[0] ||
        firstBaggage?.weight ||
        firstBaggage?.name ||
        fare?.baggage?.checkin ||
        fare?.baggage?.checkIn ||
        fare?.Baggage?.checkin ||
        fare?.Baggage?.checkIn ||
        fare?.checkInBaggage ||
        fare?.checkinBaggage ||
        fare?.CheckInBaggage ||
        fare?.inclusions?.Baggage;
    const cabin =
        fare?.inclusions?.CabinBaggage ||
        fare?.inclusions?.Cabin ||
        fare?.inclusions?.PieceDescription ||
        fare?.baggage?.cabin ||
        fare?.Baggage?.cabin ||
        fare?.CabinBaggage ||
        fare?.cabinBaggage ||
        firstBaggage?.cabin_weight ||
        baggageParts[1] ||
        "7 Kg";

    return {
        cabin: formatAllowance(cabin, "Cabin Bag Allowance") || "Cabin baggage as per airline rules",
        checkin: formatAllowance(checkin, "Check-In Bag Allowance") || "Check-in baggage as per airline rules",
    };
};

const getRuleLabel = (fare, type, fallback) => {
    const rules = getRuleDetails(fare);
    const ruleItems = Array.isArray(rules?.summary?.items)
        ? rules.summary.items
        : [];
    const match = ruleItems.find((item) =>
        String(item?.type || item?.label || "")
            .toLowerCase()
            .includes(type)
    );
    if (match?.label) return match.label;

    const amount = readNumber(
        type === "change" ? rules?.change_upto : rules?.cancellation_upto
    );
    if (amount !== null) {
        return `${type === "change" ? "Change" : "Cancellation"} Charges Upto INR ${amount.toLocaleString("en-IN")}`;
    }

    return fallback;
};

const renderLoadingCards = (styles) =>
    Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className={styles.loadingCard}>
            <div className={styles.loadingHeader}>
                <div className={styles.skeletonLogo} />
                <div className={styles.loadingHeaderText}>
                    <div className={styles.skeletonLineShort} />
                    <div className={styles.skeletonLineTiny} />
                </div>
                <div className={styles.skeletonBadge} />
            </div>
            <div className={styles.loadingBaggage}>
                <div className={styles.skeletonLineMedium} />
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLineMedium} />
            </div>
            <div className={styles.loadingActions}>
                <div className={styles.skeletonButton} />
                <div className={styles.skeletonButtonDark} />
            </div>
        </div>
    ));

export const buildFareOptions = ({
    flightData,
    prefetchedData,
    adults,
}) => {
    const resolvedPrefetchedData = prefetchedData || flightData?.prefetchedFareData || {};
    const priceResponse = resolvedPrefetchedData?.priceResponse || {};
    const pricePayload = priceResponse?.data || priceResponse || {};
    const fareOptionItems = getFareOptionItems(
        resolvedPrefetchedData?.fareOptionsResponse,
        normalizeFareFlightNo(
            flightData?.booking?.flightNo,
            flightData?.details?.flightNo,
            flightData?.airlines?.[0]?.flightNo,
            flightData?.airlines?.[0]?.code
        )
    );
    const safeAdults = Math.max(Number(adults || 1), 1);

    if (fareOptionItems.length > 0) {
        const ruleSources = collectFareRuleSources(pricePayload);
        return fareOptionItems.map((item, index) => {
            const ruleSource = getMatchingRuleSource(item, index, ruleSources);
            const total = readNumber(
                item?.price,
                item?.Price,
                item?.totalFare,
                item?.TotalFare,
                item?.netAmount,
                item?.NetAmount,
                item?.grossFare,
                item?.GrossFare,
                item?.netFare,
                item?.NetFare,
                item?.baseFare,
                item?.BaseFare,
                item?.amount,
                item?.Amount,
                item?.total,
                item?.Total,
                item?.fare,
                item?.Fare,
                item?.pricing?.total,
                item?.pricing?.Total,
                item?.pricing?.totalFare,
                item?.pricing?.TotalFare,
                item?.pricing?.amount,
                item?.pricing?.Amount,
                item?.pricing?.netFare,
                item?.pricing?.NetFare,
                item?.pricing?.netAmount,
                item?.pricing?.NetAmount
            );
            const perAdult = readNumber(
                item?.pricePerAdult,
                item?.PricePerAdult,
                item?.perAdult,
                item?.PerAdult,
                item?.adultFare,
                item?.AdultFare,
                item?.price,
                item?.Price,
                total !== null ? Math.round(total / safeAdults) : null
            );
            const fareName = String(
                pickValue(
                    item?.FCType,
                    item?.FareType,
                    item?.fareType,
                    item?.fareClass,
                    item?.FCGroup,
                    item?.DisplayName,
                    item?.displayName,
                    item?.title,
                    item?.Title,
                    item?.brand,
                    item?.Brand,
                    item?.name,
                    item?.Name,
                    item?.fare_name,
                    item?.FareName,
                    `Fare ${index + 1}`
                )
            ).toUpperCase();
            const baggage = getBaggageDetails(item);
            const meals = Array.isArray(item?.ssr?.meals) ? item.ssr.meals : [];
            const seats = Number(item?.seats ?? item?.Seats ?? item?.seatCount);

            const providerFareId = String(
                pickValue(item?.index, item?.Index, item?.fare_id, item?.id, item?.ID, index)
            );

            return {
                id: [
                    providerFareId,
                    item?.provider,
                    item?.Provider,
                    fareName,
                    index,
                ].filter((value) => value !== undefined && value !== null && value !== "").join("|"),
                name: fareName,
                price: formatCurrency(total) || flightData?.fare?.totalFare || "N/A",
                pricePerAdult:
                    formatCurrency(perAdult) || flightData?.fare?.pricePerAdult || "N/A",
                isPremium: index === 1 || /flex|premium/i.test(fareName),
                netAmount: total,
                netPerAdult: perAdult,
                rawFare: item,
                baggage,
                changes: {
                    charges: getRuleLabel(ruleSource, "change", "Change charges as per airline rules"),
                    cancellation: getRuleLabel(
                        ruleSource,
                        "cancellation",
                        "Cancellation charges as per airline rules"
                    ),
                },
                addons: {
                    seats: Number.isFinite(seats) && seats > 0
                        ? `${seats} seat(s) available`
                        : "Seats as per availability",
                    meals: meals.length > 0 ? "Meals available" : "Meals as per airline rules",
                },
            };
        });
    }

    return [];
};

const FareComparisonModal = ({
    isOpen,
    onClose,
    flightData,
    prefetchedData = null,
    isLoadingFareOptions = false,
    inline = false,
}) => {
    useLockBodyScroll(isOpen && !inline);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isLoggedIn, loading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittingFareId, setSubmittingFareId] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [authView, setAuthView] = useState("login");
    const [pendingFare, setPendingFare] = useState(null);
    const [fareOptionsPayload, setFareOptionsPayload] = useState(prefetchedData?.fareOptionsResponse || null);
    const [isPollingFareOptions, setIsPollingFareOptions] = useState(false);
    const [hasResolvedFareOptions, setHasResolvedFareOptions] = useState(
        Boolean(prefetchedData?.fareOptionsResponse)
    );
    const fareCardsRef = useRef(null);

    const flightNo = useMemo(() => {
        return normalizeFareFlightNo(
            flightData?.booking?.flightNo,
            flightData?.details?.flightNo,
            flightData?.airlines?.[0]?.flightNo,
            flightData?.airlines?.[0]?.code
        );
    }, [flightData]);

    useEffect(() => {
        if (!isOpen) return;

        setFareOptionsPayload(prefetchedData?.fareOptionsResponse || null);
        setIsPollingFareOptions(false);
        setHasResolvedFareOptions(Boolean(prefetchedData?.fareOptionsResponse));

        const priceRequest = flightData?.booking?.priceRequest;
        if (!priceRequest) {
            setHasResolvedFareOptions(true);
            return;
        }

        let cancelled = false;

        const loadFareOptions = async () => {
            try {
                setIsPollingFareOptions(true);
                const response = await getCachedFareOptionsRequest(
                    `pricing-v2:${priceRequest?.search_key || flightData?.id || "fare-options"}:${flightNo || "all"}`,
                    () => getFlightFareOptions({
                        searchParams,
                        request: priceRequest,
                        flight: flightData,
                    })
                );

                if (cancelled) return;

                if (isFareExpiredPayload(response)) {
                    setFareOptionsPayload(response);
                    return;
                }

                setFareOptionsPayload(response);
            } catch (error) {
                if (!cancelled) {
                    console.error("Failed to refresh fare options", error);
                }
            } finally {
                if (!cancelled) {
                    setIsPollingFareOptions(false);
                    setHasResolvedFareOptions(true);
                }
            }
        };

        if (!prefetchedData && !fareOptionsPayload && !isLoadingFareOptions) {
            loadFareOptions();
        }

        return () => {
            cancelled = true;
        };
    }, [flightData, flightNo, isLoadingFareOptions, isOpen, prefetchedData?.fareOptionsResponse, searchParams]);

    const performBookNow = useCallback(async (selectedFare) => {
         console.log("selectedFare",selectedFare)
        const basePriceRequest = flightData?.booking?.priceRequest;
        const selectedFareIndex = getSelectedFareIndex(selectedFare);
        const selectedPriceRequest = buildSelectedFarePriceRequest(basePriceRequest, selectedFare);
        const priceRequest = {
            ...selectedPriceRequest,
            Trips: (selectedPriceRequest?.Trips || []).map((trip, index) => ({
                ...trip,
                Index: index === 0 ? selectedFareIndex ?? trip?.Index : trip?.Index,
            })),
        };
         console.log("priceRequest",priceRequest)
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
        setSubmittingFareId(selectedFare?.id ?? null);
        let shouldResetSubmitting = true;
        try {
            const priceResponse = await getFlightPrice(priceRequest);
            console.log("priceResponse",priceResponse)
            const formattedOnlyPriceResponse = buildFormattedOnlyPriceResponse(priceResponse);
            console.log("formattedOnlyPriceResponse",formattedOnlyPriceResponse)
            const selectedFareFromFormattedPrice = buildSelectedFareFromFormattedPrice(
                selectedFare,
                formattedOnlyPriceResponse
            );
             console.log("selectedFareFromFormattedPrice",selectedFareFromFormattedPrice)
            const nextSession = {
                selectedFlight: flightData,
                selectedFare: selectedFareFromFormattedPrice,
                routeContext,
                priceRequest,
                priceResponse: formattedOnlyPriceResponse,
                checklistResponse: null,
                ssrRequest: null,
                ssrResponse: null,
            };
             console.log("nextSession",nextSession)
            writeFlightBookingSession(nextSession);
            const fallbackQuery = buildBookingFallbackQuery(nextSession);
            router.push(
                fallbackQuery
                    ? `/flight-booking-details?${fallbackQuery}`
                    : "/flight-booking-details"
            );
            shouldResetSubmitting = false;
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to continue with this flight right now."
            );
        } finally {
            if (shouldResetSubmitting) {
                setIsSubmitting(false);
                setSubmittingFareId(null);
            }
        }
    }, [flightData, router, searchParams]);

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

    useEffect(() => {
        if (!inline || !isOpen || !fareCardsRef.current) return;
        fareCardsRef.current.scrollLeft = 0;
    }, [fareOptionsPayload, flightData?.id, hasResolvedFareOptions, inline, isOpen]);

    if (!isOpen) return null;

    const fareSourcePayload = fareOptionsPayload || prefetchedData?.fareOptionsResponse || null;
    const hasFareOptionItems = getFareOptionItems(fareSourcePayload, flightNo).length > 0;
    const isStreamingFareOptions = isLoadingFareOptions || isPollingFareOptions;
    const showFareSkeleton = !hasResolvedFareOptions && !hasFareOptionItems;
    const fareOptions = !hasResolvedFareOptions && !hasFareOptionItems
        ? []
        : buildFareOptions({
            flightData,
            prefetchedData: {
                ...(prefetchedData || {}),
                fareOptionsResponse: fareSourcePayload,
            },
            adults: searchParams?.get("adults") || 1,
        });
    const showEmptyFareOptions =
        hasResolvedFareOptions && !isStreamingFareOptions && fareOptions.length === 0;

    const flight = getSelectedFlightSummary(flightData, searchParams?.get("start"));

    const fareCards = (
        <div
            ref={inline ? fareCardsRef : null}
            className={`${styles.fareCards} ${inline ? styles.inlineFareCards : ""}`}
        >
            {showFareSkeleton ? renderLoadingCards(styles) : null}
            {showEmptyFareOptions ? (
                <div className={styles.emptyFareOptions}>
                    No fare option available
                </div>
            ) : null}
            {fareOptions.map((fare) => {
                const isCurrentFareSubmitting =
                    isSubmitting && submittingFareId === fare.id;
                const priceDetails = getFarePriceDetails(
                    fare,
                    searchParams?.get("adults") || 1
                );

                return (
                    <div
                        key={fare.id}
                        className={`${styles.fareCardContainer} ${fare.isPremium ? styles.premiumContainer : ""
                            }`}
                    >

                        {fare.isPremium && (
                            <div className={styles.premiumBadge}>PREMIUM</div>
                        )}

                        <div className={styles.fareCard}>

                            <div className={styles.upperHalf}>
                                {/* <span className={styles.radioOutline}></span> */}
                                <div className={styles.fareHeader}>


                                    <h3 className={styles.fareName}>
                                        {fare.name}
                                    </h3>
                                    <div className={styles.farePrice}>
                                        <span className={styles.price}>{fare.price}</span>
                                        <div className={styles.priceInfoTrigger} tabIndex={0}>
                                            <img src="/icons/Group.svg" alt="Flight price details" />
                                            <div className={styles.priceInfoCard}>
                                                <div className={styles.priceInfoTitle}>
                                                    FLIGHT PRICE DETAILS
                                                </div>
                                                <div className={styles.priceInfoBody}>
                                                    <div className={styles.priceInfoRow}>
                                                        <span>{priceDetails.adultLine}</span>
                                                        <strong className={styles.priceInfoTotal}>{priceDetails.adultAmount}</strong>
                                                    </div>
                                                    <div className={styles.priceInfoRow}>
                                                        <span>Total (Base Fare)</span>
                                                        <strong>{priceDetails.baseFare}</strong>
                                                    </div>
                                                    <div className={styles.priceInfoRow}>
                                                        <span>Airline taxes and fees</span>
                                                        <strong className={styles.priceInfoTotal2}>{priceDetails.taxes}</strong>
                                                    </div>
                                                    <div className={styles.priceInfoDivider}></div>
                                                    <div className={styles.priceInfoTotal}>
                                                        <span>Total</span>
                                                        <strong>{priceDetails.total}</strong>
                                                    </div>
                                                    <p>Includes taxes and service fees</p>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                    <span className={styles.pricePerAdult}>{fare.pricePerAdult}  <span className={styles.adult}>/ ADULT</span></span>
                                </div>
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
                            {inline && <button className={styles.lockPriceBtn}>LOCK PRICE</button>}
                            <button className={styles.bookNowBtn} disabled={isSubmitting} onClick={() => handleBookNow(fare)}>{isCurrentFareSubmitting ? "LOADING..." : "BOOK NOW"}</button>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    if (inline) {
        return (
            <div className={styles.inlinePanel}>
                {fareCards}
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
    }

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
                {fareCards}
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

import React from 'react'
import styles from './CancellationRules.module.css'
import { resolveAirlineLogo } from "@/features/flights/utils/airlineLogos";

const toArray = (value) => (Array.isArray(value) ? value : []);

const unwrapFareRulesPayload = (fareRulesData) =>
    fareRulesData?.data?.raw ||
    fareRulesData?.raw ||
    fareRulesData?.data ||
    fareRulesData ||
    {};

const cleanRuleLines = (value) =>
    String(value || "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .split(/\r?\n/)
        .map((line) => line.replace(/\s+/g, " ").trim())
        .filter(Boolean);

const toAmount = (value) => {
    const amount = Number(String(value || "").replace(/[^\d.]/g, ""));
    return Number.isFinite(amount) && amount > 0 ? amount : null;
};

const getPlatformCharges = (fareRulesData) => {
    const payload = unwrapFareRulesPayload(fareRulesData);
    return toAmount(
        payload?.platform_charges ||
            payload?.platformCharges ||
            fareRulesData?.data?.platform_charges ||
            fareRulesData?.platform_charges
    );
};

const formatAmount = (amount, currency = "INR", platformCharges = null) => {
    const value = toAmount(amount);
    const platform = toAmount(platformCharges);
    if (!value) return platform ? `ADULT : NON REFUNDABLE + INR ${platform}` : "ADULT : NON REFUNDABLE";
    return `ADULT : ${currency || "INR"} ${value}${platform ? ` + INR ${platform}` : ""}`;
};

const normalizeTimeFrame = (value = "") => {
    const text = String(value || "").trim();
    if (!text) return "CANCELLATION";
    return text
        .replace(/\s+/g, " ")
        .replace(/\bHRS\b/gi, "HOURS")
        .replace(/\bHR\b/gi, "HOUR")
        .toUpperCase();
};

const parseRawCancellationRules = (rawText, currency = "INR", platformCharges = null) => {
    const lines = cleanRuleLines(rawText);
    const rows = [];
    let inCancellationSection = false;

    lines.forEach((line, index) => {
        const upper = line.toUpperCase();
        const next = lines[index + 1] || "";
        const combined = `${line} ${next}`;

        if (upper === "CANCELLATIONS") {
            inCancellationSection = true;
            return;
        }
        if (upper === "CHANGES" && inCancellationSection && rows.length) {
            inCancellationSection = false;
        }
        if (!inCancellationSection && !/CANCEL|CANCELLATION/i.test(line)) return;

        const amountMatch = combined.match(/(?:CHARGE|FEE OF|AGAINST A CHARGE OF)\s+(?:INR|RS\.?|₹)?\s*([\d,]+)/i);
        if (!amountMatch) return;

        const description =
            combined.match(/BEFORE\s+\d+\s*(?:HOURS|HRS|DAYS)[^.]*/i)?.[0] ||
            combined.match(/WITHIN\s+\d+\s*(?:HOURS|HRS|DAYS)[^.]*/i)?.[0] ||
            combined.match(/\d+\s*(?:HOURS|HRS|DAYS)\s+TO\s+\d+\s*(?:HOURS|HRS|DAYS)[^.]*/i)?.[0] ||
            "CANCELLATION";

        const row = {
            timeFrame: normalizeTimeFrame(description),
            fee: formatAmount(amountMatch[1], currency, platformCharges),
        };
        const key = `${row.timeFrame}|${row.fee}`;
        if (!rows.some((item) => `${item.timeFrame}|${item.fee}` === key)) {
            rows.push(row);
        }
    });

    const atoMatch = String(rawText || "").match(/ATO Service Fee[\s\S]*?Cancellation\s*:\s*Adult\s*([\d,]+)/i);
    if (atoMatch) {
        rows.push({
            timeFrame: "CANCELLATION",
            fee: formatAmount(atoMatch[1], currency, platformCharges),
        });
    }

    return rows;
};

const getFareRuleEntries = (fareRulesData) => {
    const payload = unwrapFareRulesPayload(fareRulesData);
    const rulesRoot = fareRulesData?.data?.Rules || fareRulesData?.Rules || payload?.Rules || payload;
    const structured = toArray(rulesRoot?.trips).flatMap((trip) =>
        toArray(trip?.journeys).flatMap((journey) =>
            toArray(journey?.segments).flatMap((segment) => toArray(segment?.fareRules))
        )
    );

    if (structured.length) return structured;

    return toArray(payload?.Trips).flatMap((trip) =>
        toArray(trip?.Journey || trip?.Journeys).flatMap((journey) =>
            toArray(journey?.Segments).flatMap((segment) => toArray(segment?.Rules))
        )
    );
};

const getStructuredCancellationRows = (fareRule = {}, platformCharges = null) =>
    toArray(fareRule?.sections)
        .filter((section) => /cancellation|ato service/i.test(section?.title || ""))
        .flatMap((section) =>
            toArray(section?.items).map((item) => ({
                timeFrame: normalizeTimeFrame(item?.description || section?.title),
                fee: formatAmount(item?.adultAmount, item?.currencyCode || "INR", platformCharges),
            }))
        );

const buildFallbackCards = (flightData) =>
    ["depart", "return"].map((key) => {
        const leg = flightData?.[key] || {};
        return {
            airline: {
                name: leg?.airline?.name || "N/A",
                code: leg?.airline?.code || "N/A",
                logo: resolveAirlineLogo(leg?.airline || {}),
            },
            rules: [],
        };
    });

const buildCancellationRulesData = (fareRulesData, flightData, error, isLoading) => {
    const fallbackCards = buildFallbackCards(flightData);

    if (isLoading) {
        return fallbackCards.map((card) => ({
            ...card,
            rules: [{ timeFrame: "LOADING CANCELLATION RULES...", fee: "PLEASE WAIT" }],
        }));
    }

    if (error) {
        return fallbackCards.map((card) => ({
            ...card,
            rules: [{ timeFrame: error, fee: "NOT AVAILABLE" }],
        }));
    }

    const payload = unwrapFareRulesPayload(fareRulesData);
    const currency = payload?.CurrencyCode || payload?.currencyCode || "INR";
    const platformCharges = getPlatformCharges(fareRulesData);
    const entries = getFareRuleEntries(fareRulesData);
    const cards = fallbackCards.map((card, index) => {
        const fareRule = entries[index] || entries[0] || {};
        const rows = getStructuredCancellationRows(fareRule, platformCharges);
        const textRows = rows.length
            ? rows
            : parseRawCancellationRules(
                fareRule?.rawText || fareRule?.FareRuleText || "",
                currency,
                platformCharges
            );

        return {
            ...card,
            rules: textRows.length
                ? textRows
                : [{ timeFrame: "CANCELLATION RULES", fee: "NOT AVAILABLE" }],
        };
    });

    return cards;
};

const CancellationRules = ({
    flightData = null,
    fareRulesData = null,
    isLoading = false,
    error = "",
}) => {

    const cancellationRulesData = buildCancellationRulesData(
        fareRulesData,
        flightData,
        error,
        isLoading
    );

    return (
        <div className={styles.cancellationRulesWapper}>

            {cancellationRulesData.map((item, index) => (
                <div
                    key={index}
                    className={`${styles.tabContentCancellationRules} ${styles.fadeIn}`}
                >
                    {/* Heading */}
                    <div className={styles.HeadingCont}>
                        <img src={item.airline.logo} alt={item.airline.name} />
                        <h3 className={styles.ariLineName}>
                            {item.airline.name}
                            <span className={styles.ariLineNumber}>
                                ({item.airline.code})
                            </span>
                        </h3>
                    </div>

                    {/* Table */}
                    <div className={styles.table}>
                        {/* Header */}
                        <div className={styles.tableHeader}>
                            <span>TIME FRAME</span>
                            <span>AIRLINE FEE + TARGET TOURS FEE</span>
                        </div>

                        {/* Rows */}
                        {item.rules.map((rule, i) => (
                            <div key={i} className={styles.tableRows}>
                                <span className={styles.timeFrame}>
                                    {rule.timeFrame}
                                </span>
                                <span className={styles.textRight}>
                                    {rule.fee}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

        </div>
    )
}

export default CancellationRules

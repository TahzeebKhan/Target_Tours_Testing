import React from 'react'
import styles from './CancellationRules.module.css'
import { resolveAirlineLogo } from "@/features/flights/utils/airlineLogos";
import { parseXmlFareRules } from "@/features/flights/utils/xmlFareRules";

const toArray = (value) => (Array.isArray(value) ? value : []);

const unwrapFareRulesPayload = (fareRulesData) => {
    const data = fareRulesData?.data;
    return data && typeof data === "object" ? data : {};
};

const cleanRuleLines = (value) =>
    String(value || "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/?(?:Table1|RULE|TEXT|SEGMENT|FAREBASIS|IMPORTANT_NOTE|NOTE|NewDataSet)[^>]*>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&amp;/gi, "&")
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
    if (!value) {
        const status = String(amount || "AS PER AIRLINE POLICY").trim().toUpperCase();
        return `ADULT : ${status}`;
    }
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
    const xmlParsed = parseXmlFareRules(rawText);
    if (xmlParsed && xmlParsed.sections.length > 0) {
        const xmlRows = [];
        xmlParsed.sections.forEach((sec) => {
            const isCancel = /\b(CANCELLATION|CANCEL|REFUND|PENALTY|PENALTIES)\b/i.test(`${sec.rule} ${sec.text}`);
            const isChange = /\b(CHANGE|RESCHEDULE|REISSUANCE|MODIFICATION)\b/i.test(`${sec.rule} ${sec.text}`);
            if (!isCancel && !isChange) return;

            const lines = sec.text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
            lines.forEach((line) => {
                const amountMatch =
                    line.match(/(?:INR|RS\.?|₹)\s*([\d,]+)(?:\/\-)?/i) ||
                    line.match(/([\d,]+)\s*(?:\/\-)?\s*(?:INR|RS\.?|₹)/i) ||
                    line.match(/(?:CHARGE|FEE|COST|PENALTY)\s*(?:INR|RS\.?|₹)?\s*([\d,]+)/i);

                if (amountMatch) {
                    const amount = Number(amountMatch[1].replace(/,/g, ""));
                    if (Number.isFinite(amount) && amount > 0) {
                        xmlRows.push({
                            head: isCancel ? "CANCELLATION RULES" : "DATE CHANGE / RESCHEDULE RULES",
                            timeFrame: sec.rule ? normalizeTimeFrame(sec.rule) : "CANCELLATION",
                            fee: formatAmount(amount, currency, platformCharges),
                        });
                    }
                }
            });
        });

        if (xmlRows.length) return xmlRows;
    }

    const lines = cleanRuleLines(rawText);
    const directRows = [];
    let inCancellationSection = false;
    let inChangeSection = false;

    lines.forEach((line, index) => {
        if (/\b(facilitation fee|additional sum|tele check-in|desk|counter|baggage)\b/i.test(line)) {
            return;
        }

        const isCancellationHeader = /\b(CANCELLATIONS?|CANCEL|REFUND|PENALTY|PENALTIES|CANCELLATION\s+FEES?)\b/i.test(line);
        const isChangeHeader = /\b(CHANGES?|RESCHEDULE|REISSUANCE|MODIFICATION|CHANGE\s+FEES?)\b/i.test(line);

        if (isCancellationHeader) {
            inCancellationSection = true;
            inChangeSection = false;
        }
        if (isChangeHeader) {
            inChangeSection = true;
            inCancellationSection = false;
        }

        const nextLine = lines[index + 1] || "";
        const hasAmount = /(?:INR|RS\.?|₹|\d+\/\-)\s*[\d,]+/i.test(line);

        const effectiveLine = (isCancellationHeader || isChangeHeader) && !hasAmount && nextLine
            ? `${line} ${nextLine}`
            : line;

        const isCancellation = inCancellationSection || /\b(cancellation|cancel|refund|penalty)\b/i.test(effectiveLine);
        const isChange = inChangeSection || /\b(change|reschedule|reissuance|modification)\b/i.test(effectiveLine);

        if (!isCancellation && !isChange && !/\b(departure|days?|hrs?|hours?|pax|sector)\b/i.test(effectiveLine)) {
            return;
        }

        const amountMatch =
            effectiveLine.match(/(?:INR|RS\.?|₹)\s*([\d,]+)(?:\/\-)?/i) ||
            effectiveLine.match(/([\d,]+)\s*(?:\/\-)?\s*(?:INR|RS\.?|₹)/i) ||
            effectiveLine.match(/(?:CHARGE|FEE|FEE OF|COST|PENALTY)\s*(?:INR|RS\.?|₹)?\s*([\d,]+)/i) ||
            effectiveLine.match(/([\d,]+)\/\-/);

        if (amountMatch) {
            const rawAmount = amountMatch[1].replace(/,/g, "");
            const amount = Number(rawAmount);

            if (Number.isFinite(amount) && amount > 0) {
                const timeMatch =
                    effectiveLine.match(/(departure\s+(?:within|on)\s+[\d\w\s]+(?:days?|hrs?|hours?|later)?)/i) ||
                    effectiveLine.match(/(\d+\s*(?:hrs?|hours?|days?)\s*(?:prior to|before)\s*(?:departure|flight|departure date)?.*)/i) ||
                    effectiveLine.match(/((?:before|within|till|up to)\s*\d+\s*(?:hrs?|hours?|days?)[^,.;]*)/i) ||
                    effectiveLine.match(/(prior to departure date.*)/i);

                const isChangeRow = isChange || /\bchange\b/i.test(effectiveLine);
                const isCancelRow = !isChangeRow;

                const timeFrame = timeMatch
                    ? normalizeTimeFrame(timeMatch[1])
                    : isCancelRow
                        ? "CANCELLATION (BEFORE DEPARTURE)"
                        : "RESCHEDULE / DATE CHANGE";

                const currencyMatch = effectiveLine.match(/(INR|USD|EUR|GBP|AED|SAR)/i);
                const rowCurrency = currencyMatch ? currencyMatch[1].toUpperCase() : currency;

                directRows.push({
                    head: isCancelRow ? "CANCELLATION RULES" : "DATE CHANGE / RESCHEDULE RULES",
                    timeFrame,
                    fee: formatAmount(amount, rowCurrency, platformCharges),
                });
            }
        }
    });

    if (directRows.length) return directRows;

    const rows = [];
    let legacyInCancellationSection = false;

    lines.forEach((line, index) => {
        const upper = line.toUpperCase();
        const next = lines[index + 1] || "";
        const combined = `${line} ${next}`;

        if (upper === "CANCELLATIONS") {
            legacyInCancellationSection = true;
            return;
        }
        if (upper === "CHANGES" && legacyInCancellationSection && rows.length) {
            legacyInCancellationSection = false;
        }
        if (!legacyInCancellationSection && !/CANCEL|CANCELLATION/i.test(line)) return;

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

    if (rows.length) return rows;

    if (String(rawText || "").trim().length > 0) {
        return [
            {
                head: "CANCELLATION RULES",
                timeFrame: "CANCELLATION / DATE CHANGE",
                fee: formatAmount(null, currency, platformCharges),
            },
        ];
    }

    return [];
};

const getFareRuleEntries = (fareRulesData) => {
    const payload = unwrapFareRulesPayload(fareRulesData);
    const routeRules = payload?.rules || payload?.Rules;

    if (!routeRules || typeof routeRules !== "object") return [];

    if (typeof routeRules?.FareRuleText === "string" && routeRules.FareRuleText.trim()) {
        return [routeRules];
    }

    if (!Array.isArray(routeRules)) {
        const entries = Object.values(routeRules).flatMap((val) =>
            Array.isArray(val) ? val : typeof val === "object" && val !== null ? [val] : []
        );
        if (entries.length) return entries;
    }

    if (Array.isArray(routeRules)) return routeRules;

    return [];
};

const getStructuredCancellationRows = (fareRule = {}, platformCharges = null) => {
    const providerRows = toArray(fareRule?.Rule || fareRule?.rule).flatMap((group) =>
        toArray(group?.Info || group?.info).map((item) => ({
            head: String(group?.Head || group?.head || "FARE RULE").trim(),
            timeFrame: normalizeTimeFrame(item?.Description || item?.description || group?.Head),
            fee: formatAmount(
                item?.AdultAmount ?? item?.adultAmount,
                item?.CurrencyCode || item?.currencyCode || "INR",
                platformCharges
            ),
        }))
    );
    if (providerRows.length) return providerRows;

    return toArray(fareRule?.sections)
        .filter((section) => /cancellation|ato service/i.test(section?.title || ""))
        .flatMap((section) =>
            toArray(section?.items).map((item) => ({
                head: section?.title || "CANCELLATION RULES",
                timeFrame: normalizeTimeFrame(item?.description || section?.title),
                fee: formatAmount(item?.adultAmount, item?.currencyCode || "INR", platformCharges),
            }))
        );
};

const getActiveLegKeys = (activeLeg = "both") =>
    activeLeg === "depart" || activeLeg === "return"
        ? [activeLeg]
        : ["depart", "return"];

const getCanonicalAirlineCode = (leg = {}) => {
    const airline = leg?.airline || {};
    const rawCode = String(airline?.code || "").trim();
    const carrier =
        String(airline?.carrierCode || "").trim() ||
        rawCode.match(/^([A-Za-z0-9]{2,3})\s+/)?.[1] ||
        (/spicejet/i.test(airline?.name || "") ? "SG" : "") ||
        (/indigo/i.test(airline?.name || "") ? "6E" : "");
    const flightNumberSource =
        leg?.flight?.details?.flightNo || airline?.flightNo || rawCode;
    const flightNumber =
        String(flightNumberSource).trim().match(/(\d{1,4})(?:\s+\1)?$/)?.[1] || "";

    return [carrier, flightNumber].filter(Boolean).join(" ") || rawCode || "N/A";
};

const buildFallbackCards = (flightData, activeLeg = "both") =>
    getActiveLegKeys(activeLeg).map((key) => {
        const leg = flightData?.[key] || {};
        return {
            airline: {
                name: leg?.airline?.name || "N/A",
                code: getCanonicalAirlineCode(leg),
                logo: resolveAirlineLogo(leg?.airline || {}),
            },
            rules: [],
        };
    });

const buildCancellationRulesData = (
    fareRulesData,
    flightData,
    error,
    isLoading,
    activeLeg = "both"
) => {
    const fallbackCards = buildFallbackCards(flightData, activeLeg);

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
    const fallbackRawText =
        payload?.rules?.FareRuleText ||
        payload?.Rules?.FareRuleText ||
        fareRulesData?.data?.rules?.FareRuleText ||
        "";

    const cards = fallbackCards.map((card, index) => {
        const fareRule = entries[index] || entries[0] || {};
        const rawText = fareRule?.rawText || fareRule?.FareRuleText || fallbackRawText;
        const rows = getStructuredCancellationRows(fareRule, platformCharges);
        const textRows = rows.length
            ? rows
            : parseRawCancellationRules(rawText, currency, platformCharges);

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
    activeLeg = "both",
}) => {

    const cancellationRulesData = buildCancellationRulesData(
        fareRulesData,
        flightData,
        error,
        isLoading,
        activeLeg
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
                            <React.Fragment key={`${rule.head || "rule"}-${i}`}>
                                {rule.head && rule.head !== item.rules[i - 1]?.head && (
                                    <div className={styles.ruleHead}>{rule.head}</div>
                                )}
                                <div className={styles.tableRows}>
                                    <span className={styles.timeFrame}>
                                        {rule.timeFrame}
                                    </span>
                                    <span className={styles.textRight}>
                                        {rule.fee}
                                    </span>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            ))}

        </div>
    )
}

export default CancellationRules

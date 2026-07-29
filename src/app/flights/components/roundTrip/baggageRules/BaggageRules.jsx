import React from 'react'
import styles from './BaggageRules.module.css'
import { resolveAirlineLogo } from "@/features/flights/utils/airlineLogos";

const unwrapSsrPayload = (ssrData) =>
    ssrData?.data?.raw ||
    ssrData?.raw ||
    ssrData?.data ||
    ssrData ||
    {};

const normalizeBaggageValue = (value) => {
    const text = String(value || "").trim();
    if (!text) return "-";
    const weight = text.match(/(\d+(?:\.\d+)?)\s*(kg|kgs|kilogram|kilograms)\b/i);
    return weight ? `${weight[1]} KG` : text;
};

const findBaggageText = (source, type, depth = 0, seen = new Set()) => {
    if (!source || depth > 7) return "";
    if (typeof source === "object") {
        if (seen.has(source)) return "";
        seen.add(source);
    }

    if (typeof source === "string") {
        const text = source.trim();
        const normalized = text.toLowerCase();
        if (!/\d+(?:\.\d+)?\s*(kg|kgs|kilogram|kilograms)\b/i.test(text)) return "";
        if (type === "cabin" && /(cabin|hand|carry)/i.test(normalized)) return text;
        if (type === "checked" && /(check|checked|check-in|checkin)/i.test(normalized)) return text;
        return "";
    }

    if (Array.isArray(source)) {
        for (const item of source) {
            const found = findBaggageText(item, type, depth + 1, seen);
            if (found) return found;
        }
        return "";
    }

    if (typeof source !== "object") return "";

    for (const [key, value] of Object.entries(source)) {
        const normalizedKey = key.toLowerCase();
        const isCabinKey =
            type === "cabin" &&
            /(cabin|hand|carry).*bag|bag.*(cabin|hand|carry)|cabin_baggage|cabinbaggage/.test(normalizedKey);
        const isCheckedKey =
            type === "checked" &&
            /(check|checked|check-in|checkin).*bag|bag.*(check|checked|check-in|checkin)|checkin_baggage|checked_baggage/.test(normalizedKey);

        if (isCabinKey || isCheckedKey) {
            const found =
                typeof value === "string"
                    ? value
                    : findBaggageText(value, type, depth + 1, seen);
            if (found) return found;
        }
    }

    for (const value of Object.values(source)) {
        const found = findBaggageText(value, type, depth + 1, seen);
        if (found) return found;
    }

    return "";
};

const getIncludedBaggageName = (value = {}) => {
    const baggageItems = Array.isArray(value?.baggage)
        ? value.baggage
        : Array.isArray(value?.Baggage)
            ? value.Baggage
            : [];
    const included = baggageItems.find((item) => {
        const price = Number(item?.price || item?.Price || 0);
        const code = String(item?.code || item?.Code || "").toUpperCase();
        const name = String(item?.name || item?.Name || "").trim();
        return name && (price === 0 || code === "BAG");
    });

    return included?.name || included?.Name || "";
};

const splitBaggageName = (name) => {
    const parts = String(name || "")
        .split(",")
        .map((item) => normalizeBaggageValue(item))
        .filter((item) => item && item !== "-");

    return {
        checkin: parts[0] || "-",
        cabin: parts[1] || parts[0] || "-",
    };
};

const getActiveLegKeys = (activeLeg = "both") =>
    activeLeg === "depart" || activeLeg === "return"
        ? [activeLeg]
        : ["depart", "return"];

const buildFallbackRows = (flightData, activeLeg = "both") =>
    getActiveLegKeys(activeLeg).map((key) => {
        const leg = flightData?.[key] || {};
        return {
            id: `fallback-${key}`,
            airlineName: leg?.airline?.name || "N/A",
            airlineCodes: leg?.airline?.code || "N/A",
            airlineLogo: resolveAirlineLogo(leg?.airline || {}),
            checkin: "-",
            cabin: "-",
        };
    });

const extractBaggageRows = (ssrData, fallbackRows) => {
    const payload = unwrapSsrPayload(ssrData);
<<<<<<< HEAD
=======
    const baggageInfoRoutes = Array.isArray(payload?.routes) ? payload.routes : [];
    const baggageInfoRows = baggageInfoRoutes.map((routeItem, index) => {
        const fallback = fallbackRows[index] || fallbackRows[0] || {};
        const includedBaggage = splitBaggageName(getIncludedBaggageName(routeItem));

        return {
            ...fallback,
            id: `baggage-${routeItem?.route || index}`,
            airlineCodes: routeItem?.route
                ? `${routeItem.route} • ${fallback.airlineCodes}`
                : fallback.airlineCodes,
            checkin: includedBaggage.checkin,
            cabin: includedBaggage.cabin,
        };
    });

    if (baggageInfoRows.length) return baggageInfoRows;

>>>>>>> live/main
    const formatted =
        ssrData?.data?.formatted ||
        ssrData?.formatted ||
        payload?.formatted ||
        {};
    const formattedEntries =
        formatted && typeof formatted === "object" && !Array.isArray(formatted)
            ? Object.entries(formatted)
            : [];

    const rows = formattedEntries
        .filter(([, value]) => value && typeof value === "object")
        .map(([route, value], index) => {
            const fallback = fallbackRows[index] || fallbackRows[0] || {};
            const includedBaggage = splitBaggageName(getIncludedBaggageName(value));
            return {
                ...fallback,
                id: `baggage-${route}`,
                airlineCodes: route ? `${route} • ${fallback.airlineCodes}` : fallback.airlineCodes,
                checkin: normalizeBaggageValue(
                    value?.checked_baggage ||
                    value?.checkin_baggage ||
                    value?.checkedBaggage ||
                    value?.checkinBaggage ||
                    value?.checkin ||
                    findBaggageText(value, "checked") ||
                    includedBaggage.checkin
                ),
                cabin: normalizeBaggageValue(
                    value?.cabin_baggage ||
                    value?.cabinBaggage ||
                    value?.cabin ||
                    findBaggageText(value, "cabin") ||
                    includedBaggage.cabin
                ),
            };
        });

    if (rows.length) return rows;

    const checkin = normalizeBaggageValue(findBaggageText(payload, "checked"));
    const cabin = normalizeBaggageValue(findBaggageText(payload, "cabin"));

    if (checkin !== "-" || cabin !== "-") {
        return fallbackRows.map((row) => ({
            ...row,
            checkin,
            cabin,
        }));
    }

    return [];
};

const BaggageRules = ({
    flightData = null,
    ssrData = null,
    isLoading = false,
    error = "",
    activeLeg = "both",
}) => {
    const fallbackRows = buildFallbackRows(flightData, activeLeg);
    const rows = isLoading
        ? fallbackRows.map((row) => ({ ...row, checkin: "Loading...", cabin: "Please wait" }))
        : extractBaggageRows(ssrData, fallbackRows);
    const displayRows = rows.length ? rows : fallbackRows;

    return (
        <div className={`${styles.tabContentBaggageRules} ${styles.fadeIn}`}>
            <div className={styles.tableCard}>
                <table className={styles.baggageTable}>
                    <thead>
                        <tr>
                            <th className={styles.airlineCellHead}>AIRLINE</th>
                            <th>CHECK-IN BAGGAGE</th>
                            <th>CABIN BAGGAGE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayRows.map((row) => (
                            <tr key={row.id}>
                                <td className={styles.airlineCell}>
                                    <img className={styles.airlineIcon} src={row.airlineLogo} alt={row.airlineName} />
                                    <div className={styles.airlineText}>
                                        <span className={styles.airlineName}>{row.airlineName}</span>
                                        <span className={styles.flightNo}>{row.airlineCodes}</span>
                                    </div>
                                </td>
                                <td className={styles.baggage}>{row.checkin}</td>
                                <td className={styles.baggage}>{row.cabin}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* RIGHT INFO BOX */}
            <div className={styles.infoBox}>
                <ul>
                    <li>
                        {error ||
                            "Baggage information mentioned above is obtained from airline's reservation system, Target Tours does not guarantee the accuracy of this information."}
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default BaggageRules

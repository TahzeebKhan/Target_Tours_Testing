"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styles from "./FromLocationSheet.module.css";
import CouldntFindPopup from "../couldntFindPop/CouldntFindPopup";
import {
    AIRPORT_SUGGESTIONS_QUERY_KEY,
    fetchAirportSuggestions,
} from "@/shared/services/airportSearch";

export default function FromLocationSheet({ onClose, inputType, onSelectCity }) {
    const [search, setSearch] = useState("");
    const [currentLocation, setCurrentLocation] = useState(false);

    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    // ✅ SINGLE JSON WITH TYPE
    const cities = [
        {
            city: "CHENNAI, INDIA",
            airport: "Soekarno-Hatta Intl",
            type: "popular",
            value: "Chennai",
            iataCode: "MAA",
            code: "MAA",
        },
        {
            city: "KOLKATA, INDIA",
            airport: "Juanda Intl",
            type: "popular",
            value: "Kolkata",
            iataCode: "CCU",
            code: "CCU",
        },
        {
            city: "BENGALURU, INDIA",
            airport: "Ngurah Rai Intl",
            type: "popular",
            value: "Bengaluru",
            iataCode: "BLR",
            code: "BLR",
        },
        {
            city: "HYDERABAD, INDIA",
            airport: "Rajiv Gandhi Intl",
            type: "nearby",
            value: "Hyderabad",
            iataCode: "HYD",
            code: "HYD",
        },
        {
            city: "VISAKHAPATNAM, INDIA",
            airport: "Visakhapatnam Intl",
            type: "nearby",
            value: "Visakhapatnam",
            iataCode: "VTZ",
            code: "VTZ",
        },
        {
            city: "VISAKHAPATNAM, INDIA",
            airport: "Visakhapatnam Intl",
            type: "nearby",
            value: "Visakhapatnam",
            iataCode: "VTZ",
            code: "VTZ",
        },
        {
            city: "VISAKHAPATNAM, INDIA",
            airport: "Visakhapatnam Intl",
            type: "nearby",
            value: "Visakhapatnam",
            iataCode: "VTZ",
            code: "VTZ",
        },
        {
            city: "VISAKHAPATNAM, INDIA",
            airport: "Visakhapatnam Intl",
            type: "nearby",
            value: "Visakhapatnam",
            iataCode: "VTZ",
            code: "VTZ",
        },
    ];

    const shouldFetchSuggestions = debouncedSearch.length >= 2;

    const { data: apiSuggestions = [] } = useQuery({
        queryKey: [...AIRPORT_SUGGESTIONS_QUERY_KEY, debouncedSearch.toLowerCase()],
        queryFn: () => fetchAirportSuggestions(debouncedSearch),
        enabled: shouldFetchSuggestions,
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
    });

    const apiCities = apiSuggestions.map((item) => ({
        city: item.label,
        airport: item.detail,
        type: "suggestion",
        value: item.value,
        iataCode: item.iataCode || item.code,
        code: item.code,
    }));

    // 🔍 SEARCH FILTER (COMMON)
    const filteredCities = cities.filter(
        (item) =>
            item.city.toLowerCase().includes(search.toLowerCase()) ||
            item.airport.toLowerCase().includes(search.toLowerCase())
    );

    // 📌 TYPE BASED GROUPING
    const popularCities = filteredCities.filter(
        (item) => item.type === "popular"
    );

    const nearbyCities = filteredCities.filter(
        (item) => item.type === "nearby"
    );

    const suggestionCities = shouldFetchSuggestions ? apiCities : [];

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={styles.sheet}
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className={styles.header}>
                    <span className={styles.label}>{inputType}</span>

                    <div className={styles.inputRow}>
                        <img src="/icons/fromFlight.svg" alt="" />
                        <input
                            type="text"
                            placeholder="City or airport"
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.section2} onClick={() => setCurrentLocation(true)}>
                        <div className={styles.row}>
                            <div className={styles.iconBox}>
                                <img src="/icons/locationIcon.svg" alt="" />
                            </div>

                            <div className={styles.rowContent}>
                                <p className={styles.title}>Use Current Location</p>
                                <p className={styles.sub}>Turn on Location Access</p>
                            </div>
                        </div>
                    </div>
                    {currentLocation && (
                        <CouldntFindPopup
                            open={currentLocation}
                            onAllow={() => setCurrentLocation(false)}
                            onClose={() => setCurrentLocation(false)}
                        />
                   
                    )}

                    {/* API SUGGESTIONS */}
                    {suggestionCities.length > 0 && (
                        <>
                            <p className={styles.sectionTitle}>
                                SUGGESTIONS
                            </p>

                            {suggestionCities.map((item, index) => (
                                <CityRow
                                    key={`suggestion-${item.code || index}`}
                                    item={item}
                                    onSelect={(value, selectedItem) => {
                                        onSelectCity(value, selectedItem);
                                        onClose();
                                    }}
                                />
                            ))}
                        </>
                    )}

                    {/* POPULAR */}
                    {!shouldFetchSuggestions && popularCities.length > 0 && (
                        <>
                            <p className={styles.sectionTitle}>
                                POPULAR DEPARTURE CITIES
                            </p>

                            {popularCities.map((item, index) => (
                                <CityRow
                                    key={`popular-${index}`}
                                    item={item}
                                    onSelect={(value, selectedItem) => {
                                        onSelectCity(value, selectedItem);
                                        onClose();
                                    }}
                                />
                            ))}
                        </>
                    )}

                    {/* NEARBY */}
                    {!shouldFetchSuggestions && nearbyCities.length > 0 && (
                        <>
                            <p className={styles.sectionTitle}>
                                NEARBY AIRPORTS
                            </p>

                            {nearbyCities.map((item, index) => (
                                <CityRow
                                    key={`nearby-${index}`}
                                    item={item}
                                    onSelect={(value, selectedItem) => {
                                        onSelectCity(value, selectedItem);
                                        onClose();
                                    }}
                                />
                            ))}
                        </>
                    )}

                    {/* EMPTY STATE */}
                    {suggestionCities.length === 0 &&
                        popularCities.length === 0 &&
                        nearbyCities.length === 0 && (
                            <p className={styles.sub}>No results found</p>
                        )}
                </div>
            </div>
        </div>
    );
}

/* 🔁 REUSABLE CITY ROW */
function CityRow({ item, onSelect }) {
    return (
        <div className={styles.section2} onClick={() => onSelect(item.value || item.city, item)}>
            <div className={styles.row}>
                <div className={styles.iconBox}>
                    <img src="/icons/fromAddress.svg" alt="" />
                </div>

                <div className={styles.rowContent}>
                    <p className={styles.title}>{item.city}</p>
                    <p className={styles.sub}>{item.airport}</p>
                </div>
            </div>
        </div>
    );
}

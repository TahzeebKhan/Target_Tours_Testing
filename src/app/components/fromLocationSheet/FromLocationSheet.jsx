"use client";
import { useEffect, useState } from "react";
import styles from "./FromLocationSheet.module.css";
import LocationPermissionModal from "../locationPermissionModal/LocationPermissionModal";

export default function FromLocationSheet({ onClose, inputType, onSelectCity }) {
    const [search, setSearch] = useState("");
    const [currentLocation, setCurrentLocation] = useState(false);
    useEffect(() => {
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    // ✅ SINGLE JSON WITH TYPE
    const cities = [
        {
            city: "CHENNAI, INDIA (CGK)",
            airport: "Soekarno-Hatta Intl",
            type: "popular",
        },
        {
            city: "KOLKATA, INDIA (SUB)",
            airport: "Juanda Intl",
            type: "popular",
        },
        {
            city: "BENGALURU, INDIA (DPS)",
            airport: "Ngurah Rai Intl",
            type: "popular",
        },
        {
            city: "HYDERABAD, INDIA (HYD)",
            airport: "Rajiv Gandhi Intl",
            type: "nearby",
        },
        {
            city: "VISAKHAPATNAM, INDIA (VTZ)",
            airport: "Visakhapatnam Intl",
            type: "nearby",
        },
        {
            city: "VISAKHAPATNAM, INDIA (VTZ)",
            airport: "Visakhapatnam Intl",
            type: "nearby",
        },
        {
            city: "VISAKHAPATNAM, INDIA (VTZ)",
            airport: "Visakhapatnam Intl",
            type: "nearby",
        },
        {
            city: "VISAKHAPATNAM, INDIA (VTZ)",
            airport: "Visakhapatnam Intl",
            type: "nearby",
        },
    ];

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
                        <LocationPermissionModal
                            open={currentLocation}
                            onAllow={() => setCurrentLocation(false)}
                            onClose={() => setCurrentLocation(false)}
                        />
                    )}

                    {/* POPULAR */}
                    {popularCities.length > 0 && (
                        <>
                            <p className={styles.sectionTitle}>
                                POPULAR DEPARTURE CITIES
                            </p>

                            {popularCities.map((item, index) => (
                                <CityRow
                                    key={`popular-${index}`}
                                    item={item}
                                    onSelect={(value) => {
                                        onSelectCity(value);
                                        onClose();
                                    }}
                                />
                            ))}
                        </>
                    )}

                    {/* NEARBY */}
                    {nearbyCities.length > 0 && (
                        <>
                            <p className={styles.sectionTitle}>
                                NEARBY AIRPORTS
                            </p>

                            {nearbyCities.map((item, index) => (
                                <CityRow
                                    key={`nearby-${index}`}
                                    item={item}
                                    onSelect={(value) => {
                                        onSelectCity(value);
                                        onClose();
                                    }}
                                />
                            ))}
                        </>
                    )}

                    {/* EMPTY STATE */}
                    {popularCities.length === 0 &&
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
        <div className={styles.section2} onClick={() => onSelect(item.city)}>
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

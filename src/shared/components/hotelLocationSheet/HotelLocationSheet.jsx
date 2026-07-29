"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styles from "../fromLocationSheet/FromLocationSheet.module.css";
import CouldntFindPopup from "../couldntFindPop/CouldntFindPopup";
import { fetchHotelSearchSuggestions } from "@/shared/services/hotelSearch";

const HotelLocationRow = ({ item, onSelect }) => (
  <div
    className={styles.section2}
    onClick={() => onSelect(item.value || item.city, item)}
  >
    <div className={styles.row}>
      <div className={styles.iconBox}>
        <img src="/icons/fromAddress.svg" alt="" />
      </div>
      <div className={styles.rowContent}>
        <p className={styles.title}>{item.city}</p>
        {item.detail && <p className={styles.sub}>{item.detail}</p>}
      </div>
    </div>
  </div>
);

export default function HotelLocationSheet({
  onClose,
  inputType = "Where to",
  onSelectCity,
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentLocation, setCurrentLocation] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const shouldFetchSuggestions = debouncedSearch.length >= 2;
  const {
    data: hotelSuggestions = [],
    isFetching,
  } = useQuery({
    queryKey: [
      "hotel-mobile-search-suggestions",
      debouncedSearch.toLowerCase(),
      process.env.NEXT_PUBLIC_DOMAIN,
    ],
    queryFn: () => fetchHotelSearchSuggestions(debouncedSearch),
    enabled: shouldFetchSuggestions,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const suggestions = hotelSuggestions.map((item) => ({
    city: item.label || item.value,
    detail: item.detail,
    value: item.value || item.label,
    locationId: item.locationId || item.id,
    code: item.code || item.locationId || item.id,
    geoCode: item.geoCode,
    raw: item.raw,
    hotelLocation: item,
  }));
  const isLoading = shouldFetchSuggestions && isFetching;
  const showEmptyState =
    shouldFetchSuggestions && !isLoading && suggestions.length === 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.label}>{inputType}</span>
          <div className={styles.inputRow}>
            <input
              type="text"
              placeholder="City or hotel"
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className={styles.section}>
          <div
            className={styles.section2}
            onClick={() => setCurrentLocation(true)}
          >
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

          {isLoading && <p className={styles.sub}>Loading...</p>}

          {!isLoading && suggestions.length > 0 && (
            <>
              <p className={styles.sectionTitle}>HOTEL DESTINATIONS</p>
              {suggestions.map((item, index) => (
                <HotelLocationRow
                  key={item.code || `hotel-location-${index}`}
                  item={item}
                  onSelect={(value, selectedItem) => {
                    onSelectCity(value, selectedItem);
                    onClose();
                  }}
                />
              ))}
            </>
          )}

          {showEmptyState && (
            <p className={styles.sub}>No hotel destinations found</p>
          )}
        </div>
      </div>
    </div>
  );
}

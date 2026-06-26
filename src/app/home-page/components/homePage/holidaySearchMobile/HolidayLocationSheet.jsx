"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styles from "@/shared/components/fromLocationSheet/FromLocationSheet.module.css";
import { fetchHolidayPackageSuggestions } from "@/shared/services/tourPackage";

const normalizeHolidaySuggestions = (payload) => {
  const source =
    payload?.data?.suggestions ||
    payload?.data ||
    payload?.suggestions ||
    payload ||
    [];

  if (!Array.isArray(source)) return [];

  return source
    .map((item, index) => {
      const label =
        item?.label ||
        item?.name ||
        item?.city ||
        item?.country ||
        item?.title ||
        item?.value ||
        "";
      const detail =
        item?.detail ||
        item?.description ||
        item?.country ||
        item?.category ||
        "";
      const code =
        item?.code ||
        item?.iata_code ||
        item?.iataCode ||
        item?.type ||
        "";

      return {
        id: item?.id || item?.documentId || `${label}-${index}`,
        city: label,
        airport: detail,
        code,
        value: item?.value || label,
      };
    })
    .filter((item) => item.city || item.value);
};

export default function HolidayLocationSheet({
  onClose,
  inputType,
  suggestionType,
  onSelectCity,
}) {
  const [search, setSearch] = useState("");
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

  const shouldFetchSuggestions = debouncedSearch.length >= 2;

  const { data: suggestionResponse } = useQuery({
    queryKey: [
      "holiday-package-suggestions",
      suggestionType,
      debouncedSearch,
      process.env.NEXT_PUBLIC_DOMAIN,
    ],
    queryFn: () =>
      fetchHolidayPackageSuggestions({
        term: debouncedSearch,
        type: suggestionType,
      }),
    enabled: shouldFetchSuggestions,
    staleTime: 1000 * 60 * 5,
  });

  const suggestionCities = shouldFetchSuggestions
    ? normalizeHolidaySuggestions(suggestionResponse)
    : [];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.label}>{inputType}</span>

          <div className={styles.inputRow}>
            <img src="/icons/fromFlight.svg" alt="" />
            <input
              type="text"
              placeholder="City, country or category"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.section}>
          {suggestionCities.length > 0 && (
            <>
              <p className={styles.sectionTitle}>PACKAGE SUGGESTIONS</p>

              {suggestionCities.map((item, index) => (
                <CityRow
                  key={`${item.id || item.value || "suggestion"}-${index}`}
                  item={item}
                  onSelect={(value, selectedItem) => {
                    onSelectCity(value, selectedItem);
                    onClose();
                  }}
                />
              ))}
            </>
          )}

          {shouldFetchSuggestions && suggestionCities.length === 0 && (
            <p className={styles.sub}>No results found</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CityRow({ item, onSelect }) {
  return (
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
          <p className={styles.sub}>{item.airport}</p>
        </div>
      </div>
    </div>
  );
}

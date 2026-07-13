import React, { useEffect, useMemo, useState } from "react";
import styles from "./DestinationFilter.module.css";
import CustomCheckbox from "@/shared/components/CustomCheckbox";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

const REGIONS = [
  { id: "africa", label: "Africa", imageUrl: "/images/africa.png" },
  { id: "asia", label: "Asia", imageUrl: "/images/asia.png" },
  { id: "europe", label: "Europe", imageUrl: "/images/europe.png" },
  {
    id: "north-america",
    label: "North America",
    imageUrl: "/images/northAmerica.png",
  },
  {
    id: "south-america",
    label: "South America",
    imageUrl: "/images/southAmerica.png",
  },
  { id: "australia", label: "Australia", imageUrl: "/images/australia.png" },
  { id: "antarctica", label: "Antarctica", imageUrl: "/images/antarctica.png" },
];

const DestinationFilter = ({ onApply }) => {
  const searchParams = useSearchParams();
  const initialCountries = useMemo(
    () =>
      String(searchParams.get("country") || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [searchParams]
  );
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState(initialCountries);

  useEffect(() => {
    setSelectedCountries(initialCountries);
  }, [initialCountries]);

  const continentsParam = useMemo(() => {
    const selectedLabels = REGIONS.filter((region) =>
      selectedRegions.includes(region.id)
    ).map((region) => region.label.toLowerCase());

    return selectedLabels.join(",");
  }, [selectedRegions]);

  const { data: availableLocationsResponse } = useQuery({
    queryKey: ["holiday-available-locations", continentsParam],
    queryFn: async () => {
      const query = new URLSearchParams({
        domain: process.env.NEXT_PUBLIC_DOMAIN,
      });

      if (continentsParam) {
        query.set("continents", continentsParam);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/holiday-package-filters/available-locations?${query.toString()}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch available locations");
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 10,
  });

  const availableCountries = useMemo(() => {
    const countries = availableLocationsResponse?.data?.countries;

    if (!Array.isArray(countries) || countries.length === 0) {
      return [];
    }

    return countries
      .map((country) => country?.label || country?.value || "")
      .filter(Boolean);
  }, [availableLocationsResponse]);

  const toggleCountry = (country) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country]
    );
  };
  const toggleRegion = (regionId) => {
    setSelectedRegions((prev) =>
      prev.includes(regionId)
        ? prev.filter((id) => id !== regionId)
        : [...prev, regionId]
    );
  };

  const resetFilters = () => {
    setSelectedRegions([]);
    setSelectedCountries([]);
    onApply?.({
      continents: [],
      countries: [],
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {/* LEFT */}
        <div>
          <h3 className={styles.heading}>Select a Geographical Region</h3>

          <div className={styles.regionGrid}>
            {REGIONS.map((region) => (
              <button
                key={region.id}
                type="button"
                className={`${styles.regionCard} ${selectedRegions.includes(region.id) ? styles.active : ""
                  }`}
                onClick={() => toggleRegion(region.id)}
              >
                <div className={styles.checkboxContainer}>
                  <CustomCheckbox
                    checked={selectedRegions.includes(region.id)}
                    onChange={() => toggleRegion(region.id)}
                  />
                </div>

                <div
                  className={`${styles.imagePlaceholder} ${selectedRegions.includes(region.id) ? styles.activeImage : ""
                    }`}
                >
                  <img src={region.imageUrl} alt="img" />
                </div>
                <span>{region.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.rightPart}>
          <h3 className={styles.heading}>Select Country</h3>

            <div className={styles.countryGrid}>
            {availableCountries.map((country) => (
              <button
                key={country}
                className={`${styles.countryBtn} ${selectedCountries.includes(country)
                    ? styles.activeCountry
                    : ""
                  }`}
                type="button"
                onClick={() => toggleCountry(country)}
              >
                {country}
              </button>
            ))}
          </div>

          <div className={styles.actions}>
            <button onClick={resetFilters} className={styles.resetBtn}>
              Reset All
            </button>
            <button
              className={styles.applyBtn}
              onClick={() =>
                onApply?.({
                  continents: selectedRegions,
                  countries: selectedCountries,
                })
              }
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationFilter;

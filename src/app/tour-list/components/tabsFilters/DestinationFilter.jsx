import React, { useState } from "react";
import styles from "./DestinationFilter.module.css";
import CustomCheckbox from "@/shared/components/CustomCheckbox";

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

const COUNTRIES = [
  "Zambia",
  "Kenya",
  "Ghana",
  "Tanzania",
  "Senegal",
  "Namibia",
  "Botswana",
  "Uganda",
  "Zimbabwe",
  "Burkina Faso",
  "Rwanda",
  "Ethiopia",
  "Togo",
  "Malawi",
  "Angola",
  "Mali",
  "Swaziland",
  "Lesotho",
  "Sierra Leone",
  "Côte d'Ivoire",
];

const DestinationFilter = ({ onApply }) => {
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);

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
            {COUNTRIES.map((country) => (
              <button
                key={country}
                className={`${styles.countryBtn} ${selectedCountries.includes(country)
                    ? styles.activeCountry
                    : ""
                  }`}
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
              onClick={() => onApply?.({ selectedRegion, selectedCountries })}
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

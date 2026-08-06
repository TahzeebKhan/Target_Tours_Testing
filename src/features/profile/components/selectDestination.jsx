"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./selectDestination.module.css";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

const formatRegionLabel = (value = "") =>
  value
    .toLowerCase()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getRegionImagePath = (value = "") => {
  const [firstPart, ...restParts] = String(value)
    .toLowerCase()
    .split(/[-_\s]+/)
    .filter(Boolean);

  if (!firstPart) return "/fallback.jpg";

  const fileName = [
    firstPart,
    ...restParts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)),
  ].join("");

  return `/images/${fileName}.png`;
};

const normalizeRegion = (region) => {
  if (!region) return null;

  const value =
    typeof region === "string"
      ? region
      : region.value ||
        region.region ||
        region.code ||
        region.key ||
        region.slug ||
        region.name;

  if (!value) return null;

  const id = String(value).toLowerCase().replace(/[_\s]+/g, "-");
  const name =
    typeof region === "string"
      ? formatRegionLabel(region)
      : region.label || region.title || region.name || formatRegionLabel(value);

  return {
    id,
    name,
    value: String(value),
    image:
      typeof region === "string"
        ? getRegionImagePath(region)
        : region.image || region.imageUrl || getRegionImagePath(value),
  };
};

const fetchAvailableRegions = async () => {
  const query = new URLSearchParams({
    domain: process.env.NEXT_PUBLIC_DOMAIN,
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/holiday-package-filters/available-regions?${query.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch available regions");
  }

  const payload = await response.json();
  const regions =
    payload?.data?.regions || payload?.data || payload?.regions || payload;

  return Array.isArray(regions)
    ? regions.map(normalizeRegion).filter(Boolean)
    : [];
};

export default function SelectDestination({ onClose }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(true);
  const [activeRegion, setActiveRegion] = useState("");
  const [selectedCountries, setSelectedCountries] = useState(() =>
    String(searchParams.get("country") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  );

  const { data: regions = [] } = useQuery({
    queryKey: ["holiday-available-regions"],
    queryFn: fetchAvailableRegions,
    staleTime: 1000 * 60 * 10,
  });

  const activeRegionOption = regions.find(
    (region) => region.id === activeRegion
  );
  const activeRegionLabel = activeRegionOption?.name || "";

  const { data: availableLocationsResponse } = useQuery({
    queryKey: ["holiday-available-locations", activeRegionLabel],
    queryFn: async () => {
      const query = new URLSearchParams({
        domain: process.env.NEXT_PUBLIC_DOMAIN,
      });

      if (activeRegionLabel) {
        query.set("continents", activeRegionLabel.toLowerCase());
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
    enabled: Boolean(activeRegionLabel),
    staleTime: 1000 * 60 * 10,
  });

  const countries =
    availableLocationsResponse?.data?.countries
      ?.map((country) => country?.label || country?.value || "")
      .filter(Boolean) || [];

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!activeRegion && regions.length > 0) {
      setActiveRegion(regions[0].id);
    }
  }, [activeRegion, regions]);

  const closeModal = () => {
    setOpen(false);
    onClose?.();
  };

  const toggleCountry = (country) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country]
    );
  };

  const handleReset = () => {
    setSelectedCountries([]);
    setActiveRegion(regions[0]?.id || "");
  };

  const handleApply = () => {
    const nextParams = new URLSearchParams(searchParams?.toString() || "");
    const selectedCountry = selectedCountries.filter(Boolean).join(",");

    if (selectedCountry) {
      nextParams.set("country", selectedCountry);
    } else {
      nextParams.delete("country");
    }

    router.push(`/tour-list?${nextParams.toString()}`);
    closeModal();
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onClick={closeModal}>
      <div
        className={styles.container}
        onClick={(e) => e.stopPropagation()} // prevent close inside
      >
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.titleStack}>
              <span className={styles.labelSmall}>DESTINATIONS</span>
              <h1 className={styles.titleLarge}>{activeRegionLabel}</h1>
            </div>

            <button className={styles.closeButton} onClick={closeModal}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className={styles.content}>
          {/* Region Selection */}
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>
              SELECT A GEOGRAPHICAL REGION
            </h2>

            <div className={styles.regionGrid}>
              {regions.map((region) => (
                <div
                  key={region.id}
                  className={`${styles.regionCard} ${
                    activeRegion === region.id ? styles.activeRegion : ""
                  }`}
                  onClick={() => setActiveRegion(region.id)}
                >
                  <div className={styles.imageWrapper}>
                    {activeRegion === region.id && (
                      <span className={styles.checkbox}>
                        <Image
                          src="/images/check-white.svg"
                          alt="selected"
                          width={8}
                          height={8}
                        />
                      </span>
                    )}

                    <Image
                      src={region.image}
                      alt={region.name}
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </div>

                  <span className={styles.regionName}>{region.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Country Selection */}
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>SELECT COUNTRY</h2>

            <div className={styles.countryGrid}>
              {countries.map((country) => (
                <button
                  key={country}
                  className={`${styles.countryTag} ${
                    selectedCountries.includes(country)
                      ? styles.activeCountry
                      : ""
                  }`}
                  onClick={() => toggleCountry(country)}
                >
                  {country}
                </button>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className={styles.footer}>
          <button className={styles.resetBtn} onClick={handleReset}>
            RESET
          </button>
          <button className={styles.applyBtn} onClick={handleApply}>
            APPLY FILTERS
          </button>
        </footer>
      </div>
    </div>
  );
}

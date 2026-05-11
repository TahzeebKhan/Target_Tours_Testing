

"use client";
import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useQuery } from "@tanstack/react-query";
import styles from "./SignatureExperiences.module.css";
import Carousel from "@/app/3dCarousel/component/Carousel";
import CarouselMobile from "@/app/3dCarousel/component/CarouselMobile";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

const formatPackagePrice = (price) => {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return "ON REQUEST";
  }

  return `₹${numericPrice.toLocaleString("en-IN")}`;
};

const getMediaUrl = (media) => {
  if (!media?.url) return null;

  return media.url.startsWith("http") ? media.url : `${API_BASE}${media.url}`;
};

const trimText = (text = "", maxLength = 40) => {
  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength).trim()}...`;
};

const trimToFirstWords = (text = "", wordCount = 2) =>
  text.trim().split(/\s+/).filter(Boolean).slice(0, wordCount).join(" ");

const formatRegionLabel = (value = "") => {
  if (!value) return "N/A";

  return value
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const normalizeRegionOption = (region) => {
  if (!region) return null;

  if (typeof region === "string") {
    return {
      title: formatRegionLabel(region),
      value: region,
    };
  }

  const value =
    region.value ||
    region.region ||
    region.code ||
    region.key ||
    region.slug ||
    region.name;

  if (!value) return null;

  return {
    title:
      region.label ||
      region.title ||
      region.name ||
      formatRegionLabel(String(value)),
    value: String(value),
  };
};

const PLACEHOLDER_CAROUSEL_DATA = Array.from({ length: 5 }, (_, index) => ({
  id: `placeholder-${index + 1}`,
  carouselId: index + 1,
  apiId: null,
  packageId: null,
  image: "/fallback.jpg",
  title: "N/A",
  description: "N/A",
  price: "N/A",
  hasNewTag: false,
  bottomTitle: "N/A",
  bottomDescription: "N/A",
  smallContent: true,
}));

const fetchAvailableRegions = async ({ signal }) => {
  const query = new URLSearchParams({
    domain: process.env.NEXT_PUBLIC_DOMAIN,
  }).toString();

  const response = await fetch(
    `${API_BASE}/api/holiday-package-filters/available-regions?${query}`,
    {
      method: "GET",
      signal,
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
  const rawRegions =
    payload?.data?.regions ||
    payload?.data ||
    payload?.regions ||
    payload;

  if (!Array.isArray(rawRegions)) {
    return [];
  }

  const normalizedRegions = rawRegions
    .map(normalizeRegionOption)
    .filter(Boolean);

  return normalizedRegions;
};

const fetchSignatureExperiences = async ({ queryKey, signal }) => {
  const [, region] = queryKey;
  const token = Cookies.get("auth_token");

  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const query = new URLSearchParams({
    region,
    domain: process.env.NEXT_PUBLIC_DOMAIN,
  }).toString();

  const res = await fetch(
    `${API_BASE}/api/signature-experience/company?${query}`,
    { headers, signal }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch signature experiences");
  }

  const data = await res.json();
  const holidayPackages =
    data?.data?.holiday_packages ||
    data?.holiday_packages ||
    [];

  if (!Array.isArray(holidayPackages)) return [];

  return holidayPackages.map((pkg, index) => {
    const media =
      pkg.media?.find((item) => item.is_signature_exp)?.package_media?.[0] ||
      pkg.media?.[0]?.package_media?.[0] ||
      pkg.hero_image;
    const title = pkg.title || "";
    const description = pkg.description || "";

    return {
      id: pkg.id,
      carouselId: index + 1,
      apiId: pkg.id,
      packageId: pkg.id,
      image: getMediaUrl(media) || "/fallback.jpg",
      title: trimText(title, 40).toUpperCase(),
      description: trimText(description, 40),
      price: formatPackagePrice(pkg.started_price ?? pkg.starting_from),
      hasNewTag: true,
      bottomTitle: trimToFirstWords(title),
      bottomDescription: trimText(description, 40),
      smallContent: title.length < 30,
    };
  });
};

const SignatureExperiences = ({ isMultiTripMobile }) => {
  const [requestedTab, setRequestedTab] = useState(0);
  const [displayedTab, setDisplayedTab] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const tabsRef = useRef(null);
  const { data: availableRegions = [] } = useQuery({
    queryKey: ["signature-experiences-available-regions"],
    queryFn: fetchAvailableRegions,
    staleTime: 1000 * 60 * 10,
  });
  const safeRequestedTab = Math.min(requestedTab, availableRegions.length - 1);
  const safeDisplayedTab = Math.min(displayedTab, availableRegions.length - 1);
  const activeRegion = availableRegions[safeRequestedTab]?.value;
  const {
    data: carouselData = [],
    isFetching,
    isLoading,
    isPlaceholderData,
  } = useQuery({
    queryKey: ["signature-experiences", activeRegion],
    queryFn: fetchSignatureExperiences,
    enabled: Boolean(activeRegion),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (availableRegions.length === 0) return;

    setRequestedTab((prev) => Math.min(prev, availableRegions.length - 1));
    setDisplayedTab((prev) => Math.min(prev, availableRegions.length - 1));
  }, [availableRegions.length]);

  useEffect(() => {
    if (!isFetching && !isPlaceholderData) {
      setDisplayedTab(safeRequestedTab);
    }
  }, [isFetching, isPlaceholderData, safeRequestedTab]);

  const visibleCarouselData =
    carouselData.length > 0 ? carouselData : PLACEHOLDER_CAROUSEL_DATA;

  /* ===================== TAB INDICATOR ===================== */
  useEffect(() => {
    if (!tabsRef.current) return;

    const tabs = tabsRef.current;
    const activeTabEl = tabs.querySelector(`.${styles.activeTab}`);
    if (!activeTabEl) return;

    tabs.style.setProperty("--indicator-width", `${activeTabEl.offsetWidth}px`);
    tabs.style.setProperty("--indicator-left", `${activeTabEl.offsetLeft}px`);
  }, [safeDisplayedTab]);

  /* ===================== JSX ===================== */
  return (
    <section
      className={`${styles.section} ${
        isMultiTripMobile ? styles.multiMargin : ""
      }`}
    >
      <div className={styles.container}>
        <h2 className={styles.heading}>
          Signature Experiences by Target Tours
        </h2>

        {/* Desktop Tabs */}
        <nav className={styles.tabsWrap}>
          <ul className={styles.tabs} ref={tabsRef}>
            {availableRegions.map((tab, index) => (
              <li
                key={tab.value}
                className={`${styles.tab} ${
                  index === safeDisplayedTab ? styles.activeTab : ""
                }`}
                onClick={() => setRequestedTab(index)}
              >
                <button className={styles.tabBtn}>{tab.title}</button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Dropdown */}
        <div className={styles.mobileSelectWrap}>
          <button
            className={styles.mobileSelect}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span>{availableRegions[safeDisplayedTab]?.title || "Region"}</span>
            <svg
              width="14"
              height="10"
              viewBox="0 0 14 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 2.5L7 7.5L12 2.5"
                stroke="#000033"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {isOpen && (
            <ul className={styles.mobileOptions}>
              {availableRegions.map((tab, index) => (
                <li
                  key={tab.value}
                  className={index === safeDisplayedTab ? styles.activeOption : ""}
                  onClick={() => {
                    setRequestedTab(index);
                    setIsOpen(false);
                  }}
                >
                  {tab.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Carousel */}
        <div className={`w-screen! overflow-hidden ${styles.desktopCarousel}`}>
          {isLoading && carouselData.length === 0 ? (
            <div>Loading experiences...</div>
          ) : (
            <Carousel slideData={visibleCarouselData} />
          )}
        </div>

        <div className={`w-screen! overflow-hidden ${styles.mobileCarousel}`}>
          {isLoading && carouselData.length === 0 ? (
            <div>Loading experiences...</div>
          ) : (
            <CarouselMobile slideData={visibleCarouselData} />
          )}
        </div>
      </div>
    </section>
  );
};

export default SignatureExperiences;

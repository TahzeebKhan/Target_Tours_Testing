"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, RotateCcw } from "lucide-react";
import { GoogleMap, LoadScriptNext, OverlayView } from "@react-google-maps/api";
import { useSearchParams } from "next/navigation";
import styles from "./hotelMap.module.css";
import { useHotelsContext } from "../../context/HotelsContext";
import { HOTEL_SEARCH_SESSION_KEY } from "@/shared/services/hotelSearch";
import { matchesHotelFilters } from "../TourListing";
import {
  DEFAULT_FILTER_SECTIONS,
  getApiFilterSections,
  getStarText,
  isOptionChecked,
} from "../HotelsFilters";

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };
const DEFAULT_BUDGET = [0, 25000];
const mapContainerStyle = { width: "100%", height: "100%" };
const FILTER_OPTION_PREVIEW_LIMIT = 5;

const SUGGESTED_FILTERS = [
  { key: "lastMinuteDeals", label: "Last Minute Deals" },
  { key: "fiveStar", label: "5 Star" },
  { key: "fourStar", label: "4 Star" },
  { key: "breakfastIncluded", label: "Breakfast Included" },
  { key: "oneCircleRewards", label: "OneCircle Rewards" },
];

const getNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const getCoordinatePair = (source = {}) => {
  if (!source) return null;
  const coordinates = source.coordinates || source.geoCode || source.geo_code || source.location || source.position || source;
  const lat = getNumber(
    coordinates.lat ??
      coordinates.latitude ??
      source.lat ??
      source.latitude,
  );
  const lng = getNumber(
    coordinates.lng ??
      coordinates.long ??
      coordinates.longitude ??
      source.lng ??
      source.long ??
      source.longitude,
  );

  if (lat === null || lng === null) return null;
  return { lat, lng };
};

const parseLocationParam = (value) => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(value));
    return getCoordinatePair(parsed?.geoCode || parsed?.coordinates || parsed);
  } catch {
    return null;
  }
};

export const getHotelSearchCenter = (searchParams, channel = "") => {
  if (typeof window !== "undefined") {
    try {
      const storedSearch = window.sessionStorage.getItem(HOTEL_SEARCH_SESSION_KEY);
      if (storedSearch) {
        const parsedSearch = JSON.parse(storedSearch);
        const center = getCoordinatePair(
          parsedSearch?.location?.geoCode || parsedSearch?.location,
        );
        if (center) return center;
      }
    } catch {
      // Fall through to searchParams parsing.
    }
  }

  const rawLocation = searchParams.get("location");
  const searchCenter = parseLocationParam(rawLocation);
  if (searchCenter) return searchCenter;

  if (channel.includes("noida")) {
    return { lat: 28.5355, lng: 77.391 };
  }

  return DEFAULT_CENTER;
};

export const getGoogleMapEmbedUrl = (center = DEFAULT_CENTER, zoom = 13) => {
  const lat = center?.lat ?? DEFAULT_CENTER.lat;
  const lng = center?.lng ?? DEFAULT_CENTER.lng;
  return `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
};

const getHotelCoordinates = (hotel = {}, fallbackCenter = null) => {
  const raw = hotel.raw || {};
  const pair =
    getCoordinatePair(hotel.coordinates) ||
    getCoordinatePair(hotel.geoCode) ||
    getCoordinatePair(hotel.geo_code) ||
    getCoordinatePair(raw.geoCode) ||
    getCoordinatePair(raw.geo_code) ||
    getCoordinatePair(raw.coordinates) ||
    getCoordinatePair(raw.location) ||
    getCoordinatePair(raw.position) ||
    getCoordinatePair(hotel);

  if (pair) return pair;
  if (fallbackCenter) return fallbackCenter;
  return null;
};

const getHotelPrice = (hotel = {}) => {
  if (hotel.price && String(hotel.price).trim()) return hotel.price;
  const price = hotel.amount || hotel.minRate || hotel.totalRate || hotel.baseRate || hotel.raw?.price || hotel.raw?.amount;
  if (!price) return "₹ --";
  return `₹ ${Math.round(Number(price || 0)).toLocaleString("en-IN")}`;
};

const getHotelImage = (hotel = {}) => {
  const image =
    hotel.image ||
    hotel.imageUrl ||
    hotel.thumbnail ||
    hotel.images?.[0] ||
    hotel.raw?.image ||
    hotel.raw?.imageUrl ||
    hotel.raw?.images?.[0]?.url ||
    hotel.raw?.images?.[0]?.imageUrl ||
    hotel.raw?.images?.[0];

  return typeof image === "string" ? image : "";
};

const getHotelAmenities = (hotel = {}) => {
  const rawFacilities = Array.isArray(hotel.raw?.facilities)
    ? hotel.raw.facilities
    : Array.isArray(hotel.raw?.amenities)
      ? hotel.raw.amenities
      : [];
  const amenities = [
    ...(hotel.facilities || []).map((facility) => facility.name || facility.label || facility),
    ...rawFacilities.map((facility) =>
      typeof facility === "string"
        ? facility
        : facility?.name || facility?.facilityName || facility?.label || "",
    ),
  ]
    .filter(Boolean)
    .map((amenity) => String(amenity).trim())
    .filter(Boolean);

  return [...new Set(amenities)].slice(0, 3);
};

export default function HotelMap({ isOpen, onClose }) {
  const searchParams = useSearchParams();
  const hotelSearchChannel = searchParams.get("channel") || "";
  const {
    appliedFilters = {},
    displayHotels,
    filterData,
    hotels,
    setAppliedFilters,
    resetFilters,
  } = useHotelsContext();
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [searchTerms, setSearchTerms] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const mapRef = useRef(null);

  const searchCenter = useMemo(
    () => getHotelSearchCenter(searchParams, hotelSearchChannel),
    [hotelSearchChannel, searchParams],
  );

  const apiSections = useMemo(() => getApiFilterSections(filterData), [filterData]);
  const filterSections = useMemo(() => {
    const remainingApiSections = new Map(
      apiSections.map((section) => [section.key, section]),
    );
    const mergedSections = DEFAULT_FILTER_SECTIONS.map((defaultSection) => {
      if (defaultSection.key === "price") {
        remainingApiSections.delete("price");
        return defaultSection;
      }
      const apiSection = remainingApiSections.get(defaultSection.key);
      if (!apiSection) return defaultSection;

      remainingApiSections.delete(defaultSection.key);
      return apiSection;
    });

    return [
      {
        key: "suggested",
        title: "SUGGESTED FOR YOU",
        options: SUGGESTED_FILTERS,
      },
      ...mergedSections,
      ...remainingApiSections.values(),
    ];
  }, [apiSections]);

  const markerHotels = useMemo(() => {
    const sourceHotels = hotels?.length ? hotels : displayHotels || [];

    return sourceHotels
      .filter((hotel) => matchesHotelFilters(hotel, appliedFilters))
      .map((hotel, index) => ({
        ...hotel,
        markerId: String(hotel.id || hotel.hotelId || index),
        coordinates: getHotelCoordinates(hotel, searchCenter),
        image: getHotelImage(hotel),
        mapAmenities: getHotelAmenities(hotel),
        priceLabel: getHotelPrice(hotel),
      }))
      .filter((hotel) => hotel.coordinates)
      .slice(0, 200);
  }, [appliedFilters, displayHotels, hotels, searchCenter]);

  const mapCenter = markerHotels[0]?.coordinates || searchCenter;
  const selectedHotel = markerHotels.find((hotel) => hotel.markerId === selectedHotelId);
  const guestSummary = useMemo(() => {
    const adults = Number(searchParams.get("adults") || 1);
    const guests = Number.isFinite(adults) && adults > 0 ? adults : 1;
    return `/1 night, ${guests} ${guests === 1 ? "guest" : "guests"}`;
  }, [searchParams]);

  const searchText = appliedFilters.hotelSearchText || "";
  const minBudget = appliedFilters.budget?.min ?? DEFAULT_BUDGET[0];
  const maxBudget = appliedFilters.budget?.max ?? DEFAULT_BUDGET[1];

  const toggleFilter = (group, key) => {
    setAppliedFilters((prev = {}) => {
      const currentVal = Boolean(prev[group]?.[key]);
      const nextVal = !currentVal;

      const nextFilters = {
        ...prev,
        [group]: {
          ...(prev[group] || {}),
          [key]: nextVal,
        },
      };

      if (group === "suggested" && key === "fourStar") {
        nextFilters.starCategory = { ...(prev.starCategory || {}), "4": nextVal };
      } else if (group === "starCategory" && String(key) === "4") {
        nextFilters.suggested = { ...(prev.suggested || {}), fourStar: nextVal };
      } else if (group === "suggested" && key === "fiveStar") {
        nextFilters.starCategory = { ...(prev.starCategory || {}), "5": nextVal };
      } else if (group === "starCategory" && String(key) === "5") {
        nextFilters.suggested = { ...(prev.suggested || {}), fiveStar: nextVal };
      } else if (group === "freeCancellation" || group === "cancellation") {
        nextFilters.freeCancellation = { ...(prev.freeCancellation || {}), FreeCancellation: nextVal };
        nextFilters.cancellation = { ...(prev.cancellation || {}), FreeCancellation: nextVal };
      } else if (group === "suggested" && key === "breakfastIncluded") {
        nextFilters.hotelAmenities = { ...(prev.hotelAmenities || {}), Breakfast: nextVal };
      } else if (group === "hotelAmenities" && key === "Breakfast") {
        nextFilters.suggested = { ...(prev.suggested || {}), breakfastIncluded: nextVal };
      }

      return nextFilters;
    });
  };

  const handleSearchTextChange = (text) => {
    setAppliedFilters((prev = {}) => ({
      ...prev,
      hotelSearchText: text,
    }));
  };

  const handleBudgetChange = (minVal, maxVal) => {
    setAppliedFilters((prev = {}) => ({
      ...prev,
      budget: {
        min: Number(minVal),
        max: Number(maxVal),
      },
    }));
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const countForOption = (group, key) => {
    const source = hotels?.length ? hotels : displayHotels || [];
    const testFilter = { [group]: { [key]: true } };
    if (group === "suggested") {
      if (key === "fiveStar") testFilter.starCategory = { "5": true };
      if (key === "fourStar") testFilter.starCategory = { "4": true };
    }
    return source.filter((hotel) => matchesHotelFilters(hotel, testFilter)).length;
  };

  const renderedSections = filterSections.filter(
    (section) =>
      section.key !== "price" &&
      section.key !== "providers" &&
      section.key !== "refundable",
  );

  return createPortal(
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>Explore On Map ({markerHotels.length} Properties)</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close map"
          >
            ×
          </button>
        </header>

        <div className={styles.body}>
          <aside className={styles.sidebar}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px 0" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>FILTERS</span>
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  border: 0,
                  background: "transparent",
                  color: "#000033",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <RotateCcw size={12} /> RESET
              </button>
            </div>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Search Hotels</h3>
              <label className={styles.searchBox}>
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Search locality / hotel name"
                  value={searchText}
                  onChange={(event) => handleSearchTextChange(event.target.value)}
                />
              </label>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Your Budget</h3>
              <div className={styles.budgetGrid}>
                <label className={styles.budgetBox}>
                  <span>Min Price</span>
                  <input
                    type="number"
                    min="0"
                    max={maxBudget}
                    value={minBudget}
                    onChange={(event) => handleBudgetChange(event.target.value, maxBudget)}
                  />
                </label>
                <label className={styles.budgetBox}>
                  <span>Max Price</span>
                  <input
                    type="number"
                    min={minBudget}
                    value={maxBudget}
                    onChange={(event) => handleBudgetChange(minBudget, event.target.value)}
                  />
                </label>
              </div>
            </section>

            {renderedSections.map((section) => (
              <MapSection
                key={section.key}
                section={section}
                appliedFilters={appliedFilters}
                searchTerms={searchTerms}
                setSearchTerms={setSearchTerms}
                isExpanded={!!expandedSections[section.key]}
                onExpandedChange={(nextValue) =>
                  setExpandedSections((prev) => ({
                    ...prev,
                    [section.key]: nextValue,
                  }))
                }
                onToggle={toggleFilter}
                countForOption={countForOption}
              />
            ))}
          </aside>

          <div className={styles.mapShell}>
            <LoadScriptNext
              googleMapsApiKey={
                process.env.NEXT_PUBLIC_MAP_KEY ||
                process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
                ""
              }
            >
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={12}
                onLoad={(map) => {
                  mapRef.current = map;
                }}
                onUnmount={() => {
                  mapRef.current = null;
                }}
                options={{
                  clickableIcons: false,
                  gestureHandling: "greedy",
                  mapTypeControl: false,
                  streetViewControl: false,
                  fullscreenControl: false,
                }}
              >
                {markerHotels.map((hotel) => (
                  <OverlayView
                    key={hotel.markerId}
                    position={hotel.coordinates}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <button
                      type="button"
                      className={`${styles.priceMarker} ${
                        selectedHotelId === hotel.markerId ? styles.priceMarkerActive : ""
                      }`}
                      onClick={() => setSelectedHotelId(hotel.markerId)}
                      onFocus={() => setSelectedHotelId(hotel.markerId)}
                      onMouseEnter={() => setSelectedHotelId(hotel.markerId)}
                    >
                      {hotel.priceLabel}
                    </button>
                  </OverlayView>
                ))}

                {selectedHotel?.coordinates && (
                  <OverlayView
                    position={selectedHotel.coordinates}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <div
                      className={styles.hotelPopup}
                      onMouseEnter={() => setSelectedHotelId(selectedHotel.markerId)}
                    >
                      {selectedHotel.image ? (
                        <img src={selectedHotel.image} alt={selectedHotel.title || selectedHotel.name} />
                      ) : null}
                      <div className={styles.hotelPopupBody}>
                        <h3 className={styles.hotelName}>
                          {selectedHotel.title || selectedHotel.name || "Hotel"}
                        </h3>
                        <div className={styles.ratingRow}>
                          <span className={styles.stars}>★★★★★</span>
                          <span className={styles.ratingBadge}>
                            {selectedHotel.reviewScoreText || selectedHotel.rating || "4.5"}
                          </span>
                          <span className={styles.hotelMeta}>
                            {selectedHotel.reviewText || "No reviews yet"}
                          </span>
                        </div>
                        {selectedHotel.mapAmenities?.length ? (
                          <div className={styles.amenityRow}>
                            {selectedHotel.mapAmenities.map((amenity) => (
                              <span key={amenity}>{amenity}</span>
                            ))}
                          </div>
                        ) : null}
                        <div className={styles.hotelPrice}>
                          {selectedHotel.priceLabel}
                          <span>{guestSummary}</span>
                        </div>
                      </div>
                    </div>
                  </OverlayView>
                )}
              </GoogleMap>
            </LoadScriptNext>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function MapSection({
  section,
  appliedFilters,
  searchTerms,
  setSearchTerms,
  isExpanded,
  onExpandedChange,
  onToggle,
  countForOption,
}) {
  const searchTerm = searchTerms[section.key] || "";
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleOptions = normalizedSearch
    ? section.options.filter((option) =>
        (option.label || option.key || "").toLowerCase().includes(normalizedSearch),
      )
    : section.options;
  const shouldLimitOptions =
    !normalizedSearch && visibleOptions.length > FILTER_OPTION_PREVIEW_LIMIT;
  const displayedOptions =
    shouldLimitOptions && !isExpanded
      ? visibleOptions.slice(0, FILTER_OPTION_PREVIEW_LIMIT)
      : visibleOptions;

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>{section.title}</h3>
      {section.searchable && (
        <label className={styles.searchBox} style={{ marginBottom: "8px" }}>
          <Search size={18} />
          <input
            type="search"
            placeholder={section.searchPlaceholder || "Search..."}
            value={searchTerm}
            onChange={(event) =>
              setSearchTerms((prev) => ({
                ...prev,
                [section.key]: event.target.value,
              }))
            }
          />
        </label>
      )}
      {displayedOptions.map((option) => {
        const stars = getStarText(section.key, option.key);
        return (
          <label key={option.key} className={styles.filterRow}>
            <input
              type="checkbox"
              checked={isOptionChecked(appliedFilters, {}, section.key, option.key)}
              onChange={() => onToggle(section.key, option.key)}
            />
            <span className={styles.checkbox} />
            <span>
              {stars ? `${stars} ${option.label}` : option.label}
            </span>
            <span className={styles.count}>
              {countForOption(section.key, option.key)}
            </span>
          </label>
        );
      })}
      {shouldLimitOptions && (
        <button
          type="button"
          onClick={() => onExpandedChange(!isExpanded)}
          style={{
            border: 0,
            background: "transparent",
            color: "#000033",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            marginTop: "6px",
            padding: 0,
          }}
        >
          {isExpanded
            ? "SEE LESS"
            : `SEE MORE (${visibleOptions.length - FILTER_OPTION_PREVIEW_LIMIT})`}
        </button>
      )}
    </section>
  );
}

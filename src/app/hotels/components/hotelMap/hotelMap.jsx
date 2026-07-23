"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { GoogleMap, LoadScriptNext, OverlayView } from "@react-google-maps/api";
import { useSearchParams } from "next/navigation";
import styles from "./hotelMap.module.css";
import { useHotelsContext } from "../../context/HotelsContext";
import { HOTEL_SEARCH_SESSION_KEY } from "@/shared/services/hotelSearch";

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };
const DEFAULT_BUDGET = [0, 25000];
const mapContainerStyle = { width: "100%", height: "100%" };

const SUGGESTED_FILTERS = [
  { key: "lastMinuteDeals", label: "Last Minute Deals" },
  { key: "fiveStar", label: "5 Star" },
  { key: "fourStar", label: "4 Star" },
  { key: "breakfastIncluded", label: "Breakfast Included" },
  { key: "oneClickRewards", label: "OneCircle Rewards" },
];

const PRICE_FILTERS = [
  { key: "0-2500", label: "₹0-2500", min: 0, max: 2500 },
  { key: "2500-4500", label: "₹2500-4500", min: 2500, max: 4500 },
  { key: "4500-7000", label: "₹4500-7000", min: 4500, max: 7000 },
  { key: "7000-11000", label: "₹7000-11000", min: 7000, max: 11000 },
  { key: "11000-17000", label: "₹11000-17000", min: 11000, max: 17000 },
  { key: "17000+", label: "₹17000+", min: 17000, max: Infinity },
];

const TEXT_FILTER_NEEDLES = {
  lastMinuteDeals: ["deal", "discount"],
  breakfastIncluded: ["breakfast"],
  oneClickRewards: ["reward"],
};

const getNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const getCoordinatePair = (source = {}) => {
  const coordinates = source.coordinates || source.geoCode || source.geo_code || source;
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
      const searchContext = storedSearch ? JSON.parse(storedSearch) : null;

      if (!channel || searchContext?.channel === channel) {
        const sessionCenter = getCoordinatePair(
          searchContext?.initPayload?.geoCode ||
            searchContext?.location?.geoCode ||
            searchContext?.location?.raw?.coordinates ||
            searchContext?.initPayload?.locations?.[0]?.coordinates ||
            {},
        );

        if (sessionCenter) return sessionCenter;
      }
    } catch {
      // Ignore malformed session storage.
    }
  }

  const urlCenter = getCoordinatePair({
    lat: searchParams?.get("lat") || searchParams?.get("latitude"),
    lng:
      searchParams?.get("lng") ||
      searchParams?.get("long") ||
      searchParams?.get("longitude"),
  });

  return (
    urlCenter ||
    parseLocationParam(searchParams?.get("location")) ||
    parseLocationParam(searchParams?.get("locationPayload")) ||
    DEFAULT_CENTER
  );
};

export const getGoogleMapEmbedUrl = (center = DEFAULT_CENTER, zoom = 13) => {
  const lat = Number(center.lat || DEFAULT_CENTER.lat);
  const lng = Number(center.lng || DEFAULT_CENTER.lng);

  return `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
};

const getHotelCoordinates = (hotel = {}) => {
  const pair = getCoordinatePair({
    coordinates: hotel.coordinates,
    geoCode: hotel.geoCode,
    lat: hotel.latitude ?? hotel.lat,
    lng: hotel.longitude ?? hotel.lng ?? hotel.long,
  });

  return pair;
};

const getHotelPrice = (hotel = {}) => {
  if (hotel.price && String(hotel.price).trim()) return hotel.price;
  const price = hotel.amount || hotel.minRate || hotel.totalRate || hotel.baseRate;
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

const getHotelPriceNumber = (hotel = {}) => {
  const priceText = String(
    hotel.price || hotel.amount || hotel.minRate || hotel.totalRate || hotel.baseRate || "",
  ).replace(/[^\d.]/g, "");
  if (!priceText) return null;

  const price = Number(priceText);
  return Number.isFinite(price) ? price : null;
};

const hasSelectedValues = (group = {}) =>
  Object.values(group || {}).some(Boolean);

const selectedKeys = (group = {}) =>
  Object.entries(group || {})
    .filter(([, isSelected]) => isSelected)
    .map(([key]) => key);

const hasHotelText = (hotel = {}, ...needles) => {
  const raw = hotel.raw || {};
  const rawFacilities = Array.isArray(raw.facilities)
    ? raw.facilities
    : Array.isArray(raw.amenities)
      ? raw.amenities
      : [];
  const rawFacilityText = rawFacilities
    .map((facility) =>
      typeof facility === "string"
        ? facility
        : facility?.name ||
          facility?.facilityName ||
          facility?.label ||
          facility?.description ||
          "",
    )
    .filter(Boolean);
  const text = [
    hotel.title,
    hotel.name,
    hotel.hotelName,
    hotel.route,
    hotel.address,
    raw.propertyType,
    raw.type,
    raw.chainName,
    raw.brandName,
    raw.hotelChain,
    raw.chain,
    raw.name,
    raw.hotelName,
    raw.address,
    raw.city,
    raw.locality,
    ...rawFacilityText,
    ...(hotel.facilities || []).map((facility) => facility.name || facility.label || ""),
    ...(hotel.benefits || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return needles.some((needle) => text.includes(String(needle || "").toLowerCase()));
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
        : facility?.name || facility?.facilityName || facility?.label,
    ),
    ...(hotel.benefits || []),
  ]
    .filter(Boolean)
    .map((amenity) => String(amenity).trim())
    .filter(Boolean);

  return [...new Set(amenities)].slice(0, 3);
};

const matchesMapFilters = (hotel, filters = {}, budget = null) => {
  const price = getHotelPriceNumber(hotel);
  const rating = Number(hotel.rating || hotel.starRating || hotel.raw?.starRating || 0);

  if (
    budget &&
    price !== null &&
    (price < Number(budget[0] || 0) || price > Number(budget[1] || Infinity))
  ) {
    return false;
  }

  if (hasSelectedValues(filters.price)) {
    const matchesPrice = selectedKeys(filters.price).some((key) => {
      const bucket = PRICE_FILTERS.find((item) => item.key === key);
      if (!bucket || price === null) return false;
      return price >= bucket.min && price < bucket.max;
    });

    if (!matchesPrice) return false;
  }

  if (hasSelectedValues(filters.suggested)) {
    const matchesSuggested = selectedKeys(filters.suggested).some((key) => {
      if (key === "fiveStar") return Math.round(rating) === 5;
      if (key === "fourStar") return Math.round(rating) === 4;

      const needles = TEXT_FILTER_NEEDLES[key] || [key];
      return hasHotelText(hotel, ...needles);
    });

    if (!matchesSuggested) return false;
  }

  return true;
};

export default function HotelMap({ isOpen, onClose }) {
  const searchParams = useSearchParams();
  const hotelSearchChannel = searchParams.get("channel") || "";
  const { appliedFilters, displayHotels, hotels, setAppliedFilters } = useHotelsContext();
  const [searchText, setSearchText] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({ suggested: {}, price: {} });
  const [appliedMapFilters, setAppliedMapFilters] = useState({ suggested: {}, price: {} });
  const [budget, setBudget] = useState(DEFAULT_BUDGET);
  const [budgetTouched, setBudgetTouched] = useState(false);
  const [appliedBudget, setAppliedBudget] = useState(DEFAULT_BUDGET);
  const [appliedBudgetTouched, setAppliedBudgetTouched] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const mapRef = useRef(null);

  const searchCenter = useMemo(
    () => getHotelSearchCenter(searchParams, hotelSearchChannel),
    [hotelSearchChannel, searchParams],
  );

  const markerHotels = useMemo(() => {
    const sourceHotels = hotels?.length ? hotels : displayHotels || [];
    const normalizedSearch = searchText.trim().toLowerCase();

    return sourceHotels
      .filter((hotel) => {
        if (!matchesMapFilters(hotel, appliedMapFilters, appliedBudgetTouched ? appliedBudget : null)) {
          return false;
        }

        if (!normalizedSearch) return true;
        const haystack = [
          hotel.title,
          hotel.name,
          hotel.hotelName,
          hotel.route,
          hotel.address,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedSearch);
      })
      .map((hotel, index) => ({
        ...hotel,
        markerId: String(hotel.id || hotel.hotelId || index),
        coordinates: getHotelCoordinates(hotel),
        image: getHotelImage(hotel),
        mapAmenities: getHotelAmenities(hotel),
        priceLabel: getHotelPrice(hotel),
      }))
      .filter((hotel) => hotel.coordinates)
      .slice(0, 200);
  }, [appliedBudget, appliedBudgetTouched, appliedMapFilters, displayHotels, hotels, searchText]);

  const mapCenter = markerHotels[0]?.coordinates || searchCenter;
  const selectedHotel = markerHotels.find((hotel) => hotel.markerId === selectedHotelId);
  const guestSummary = useMemo(() => {
    const adults = Number(searchParams.get("adults") || 1);
    const guests = Number.isFinite(adults) && adults > 0 ? adults : 1;
    return `/1 night, ${guests} ${guests === 1 ? "guest" : "guests"}`;
  }, [searchParams]);

  const filterCounts = useMemo(() => {
    const sourceHotels = hotels?.length ? hotels : displayHotels || [];

    return {
      suggested: SUGGESTED_FILTERS.reduce(
        (counts, option) => ({
          ...counts,
          [option.key]: sourceHotels.filter((hotel) =>
            matchesMapFilters(hotel, {
              suggested: { [option.key]: true },
              price: {},
            }),
          ).length,
        }),
        {},
      ),
      price: PRICE_FILTERS.reduce(
        (counts, option) => ({
          ...counts,
          [option.key]: sourceHotels.filter((hotel) =>
            matchesMapFilters(hotel, {
              suggested: {},
              price: { [option.key]: true },
            }),
          ).length,
        }),
        {},
      ),
    };
  }, [displayHotels, hotels]);

  const syncAppliedFilters = (nextFilters, nextBudget = budget, includeBudget = budgetTouched) => {
    setAppliedFilters((prevFilters = {}) => ({
      ...prevFilters,
      suggested: nextFilters.suggested || {},
      price: nextFilters.price || {},
      ...(includeBudget && {
        budget: {
          min: Number(nextBudget[0] || DEFAULT_BUDGET[0]),
          max: Number(nextBudget[1] || DEFAULT_BUDGET[1]),
        },
      }),
    }));
  };

  const toggleFilter = (group, key) => {
    setSelectedFilters((prev) => {
      const nextFilters = {
        ...prev,
        [group]: {
          ...prev[group],
          [key]: !prev[group]?.[key],
        },
      };

      return nextFilters;
    });
  };

  const applyFilters = () => {
    setBudgetTouched(true);
    setAppliedMapFilters(selectedFilters);
    setAppliedBudget(budget);
    setAppliedBudgetTouched(true);
    syncAppliedFilters(selectedFilters, budget, true);
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

  useEffect(() => {
    if (!isOpen) return;

    setSelectedFilters({
      suggested: appliedFilters?.suggested || {},
      price: appliedFilters?.price || {},
    });
    setAppliedMapFilters({
      suggested: appliedFilters?.suggested || {},
      price: appliedFilters?.price || {},
    });

    if (appliedFilters?.budget) {
      const nextBudget = [
        Number(appliedFilters.budget.min || DEFAULT_BUDGET[0]),
        Number(appliedFilters.budget.max || DEFAULT_BUDGET[1]),
      ];

      setBudget(nextBudget);
      setAppliedBudget(nextBudget);
      setBudgetTouched(true);
      setAppliedBudgetTouched(true);
    } else {
      setBudget(DEFAULT_BUDGET);
      setAppliedBudget(DEFAULT_BUDGET);
      setBudgetTouched(false);
      setAppliedBudgetTouched(false);
    }
  }, [appliedFilters, isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <header className={styles.header}>
          <h2 className={styles.title}>Explore On Map</h2>
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
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Search Hotels</h3>
              <label className={styles.searchBox}>
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Search locality / hotel name"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
              </label>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Suggested For You</h3>
              {SUGGESTED_FILTERS.map((option) => (
                <label key={option.key} className={styles.filterRow}>
                  <input
                    type="checkbox"
                    checked={!!selectedFilters.suggested?.[option.key]}
                    onChange={() => toggleFilter("suggested", option.key)}
                  />
                  <span className={styles.checkbox} />
                  <span>{option.label}</span>
                  <span className={styles.count}>{filterCounts.suggested[option.key] || 0}</span>
                </label>
              ))}
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Price Per Night</h3>
              {PRICE_FILTERS.map((option) => (
                <label key={option.key} className={styles.filterRow}>
                  <input
                    type="checkbox"
                    checked={!!selectedFilters.price?.[option.key]}
                    onChange={() => toggleFilter("price", option.key)}
                  />
                  <span className={styles.checkbox} />
                  <span>{option.label}</span>
                  <span className={styles.count}>{filterCounts.price[option.key] || 0}</span>
                </label>
              ))}
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Your Budget</h3>
              <div className={styles.budgetGrid}>
                <label className={styles.budgetBox}>
                  <span>Min Price</span>
                  <input
                    type="number"
                    min="0"
                    max={budget[1]}
                    value={budget[0]}
                    onChange={(event) =>
                      setBudget([Math.min(Number(event.target.value || 0), budget[1]), budget[1]])
                    }
                  />
                </label>
                <label className={styles.budgetBox}>
                  <span>Max Price</span>
                  <input
                    type="number"
                    min={budget[0]}
                    value={budget[1]}
                    onChange={(event) =>
                      setBudget([budget[0], Math.max(Number(event.target.value || 0), budget[0])])
                    }
                  />
                </label>
              </div>
              <button type="button" className={styles.submitButton} onClick={applyFilters}>
                Submit
              </button>
            </section>
          </aside>

          <div className={styles.mapShell}>
            <label className={styles.mapSearch}>
              <Search size={18} />
              <input
                type="search"
                placeholder="Search locality / hotel name"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </label>

            <LoadScriptNext
              googleMapsApiKey={process.env.NEXT_PUBLIC_MAP_KEY}
              loadingElement={<div className={styles.emptyMap}>Loading map...</div>}
            >
              <GoogleMap
                mapContainerClassName={styles.mapCanvas}
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
    </div>
  );
}

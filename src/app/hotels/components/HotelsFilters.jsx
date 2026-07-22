"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ListFilter, Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import styles from "./HotelsFilters.module.css";
import { useHotelsContext } from "../context/HotelsContext";
import HotelMap, {
  getGoogleMapEmbedUrl,
  getHotelSearchCenter,
} from "./hotelMap/hotelMap";

const DEFAULT_PRICE_RANGE = [0, 25000];
const HOTEL_FILTER_MEMORY_KEY = "hotelSidebarFilters";
const FILTER_OPTION_PREVIEW_LIMIT = 5;


const PRICE_BUCKETS = [
  { key: "0-2500", label: "₹0-2500", min: 0, max: 2500 },
  { key: "2500-4500", label: "₹2500-4500", min: 2500, max: 4500 },
  { key: "4500-7000", label: "₹4500-7000", min: 4500, max: 7000 },
  { key: "7000-11000", label: "₹7000-11000", min: 7000, max: 11000 },
  { key: "11000-17000", label: "₹11000-17000", min: 11000, max: 17000 },
  { key: "17000+", label: "₹17000+", min: 17000, max: null },
];

const API_FILTER_SECTION_CONFIG = {
  PriceGroup: {
    key: "price",
    title: "PRICE PER NIGHT",
  },
  StarRating: {
    key: "starCategory",
    title: "STAR CATEGORY",
  },
  Facilities: {
    key: "hotelAmenities",
    title: "HOTEL AMENITIES",
    searchable: true,
    searchPlaceholder: "Search amenities",
  },
  HotelChain: {
    key: "hotelChains",
    title: "HOTEL CHAINS",
    searchable: true,
    searchPlaceholder: "Search hotel chains",
  },
  PropertyType: {
    key: "propertyType",
    title: "PROPERTY TYPE",
  },
  Attraction: {
    key: "attractions",
    title: "POPULAR LANDMARKS",
    searchable: true,
    searchPlaceholder: "Search landmarks",
  },
};

const API_FILTER_CATEGORY_ALIASES = {
  PriceGroup: ["PriceGroup", "priceGroup", "priceGroups", "priceBuckets", "price_ranges", "priceRanges", "price"],
  StarRating: ["StarRating", "starRating", "star_rating", "stars", "hotelStars", "starCategory"],
  Facilities: ["Facilities", "facilities", "hotelAmenities", "hotel_amenities", "amenities"],
  HotelChain: ["HotelChain", "hotelChain", "hotelChains", "hotel_chains", "chains", "brands"],
  PropertyType: ["PropertyType", "propertyType", "property_type", "propertyTypes", "property_types"],
  Attraction: ["Attraction", "attraction", "attractions", "nearByAttractions", "nearbyAttractions"],
};

const FILTER_GROUP_ALIASES = {
  suggested: ["suggested", "suggestedForYou", "suggested_for_you"],
  priceBuckets: ["priceBuckets", "price_buckets", "pricePerNight", "price_per_night", "priceRanges", "price_ranges", "PriceGroup"],
  starCategory: ["starCategory", "star_category", "stars", "starRating", "star_rating", "hotelStars"],
  guestRating: ["guestRating", "guest_rating", "ratings", "rating"],
  propertyType: ["propertyType", "property_type", "propertyTypes", "property_types"],
  roomViews: ["roomViews", "room_views", "views", "roomView"],
  roomAmenities: ["roomAmenities", "room_amenities", "roomFacilities", "room_facilities"],
  hotelAmenities: ["hotelAmenities", "hotel_amenities", "amenities", "facilities"],
  houseRules: ["houseRules", "house_rules", "rules"],
  flexibleCheckIn: ["flexibleCheckIn", "flexible_check_in", "checkInOptions", "check_in_options"],
  hotelChains: ["hotelChains", "hotel_chains", "chains", "brands"],
};

const toCount = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const normalizeFilterKey = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");

const getCanonicalApiCategory = (category) => {
  const normalizedCategory = normalizeFilterKey(category);

  return (
    Object.entries(API_FILTER_CATEGORY_ALIASES).find(([, aliases]) =>
      aliases.some((alias) => normalizeFilterKey(alias) === normalizedCategory),
    )?.[0] || category
  );
};

const getApiCategoryConfig = (category) =>
  API_FILTER_SECTION_CONFIG[getCanonicalApiCategory(category)];

const mapObjectOptions = (options = {}) =>
  Object.entries(options).map(([key, value]) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return {
        key,
        label: value.label || value.name || value.title || key,
        value: value.value ?? value.key ?? key,
        count: value.count ?? value.total ?? value.totalCount ?? value.hotelCount ?? value.doc_count ?? 0,
        min: value.min ?? value.minimum ?? value.from,
        max: value.max ?? value.maximum ?? value.to,
      };
    }

    return {
      key,
      label: key,
      value: key,
      count: value,
    };
  });

const normalizeApiOptions = (options) => {
  if (Array.isArray(options)) return options;
  if (options && typeof options === "object") return mapObjectOptions(options);
  return [];
};

const mapObjectFilters = (filterData = {}) =>
  Object.entries(filterData)
    .map(([category, value]) => {
      const canonicalCategory = getCanonicalApiCategory(category);
      const options =
        value && typeof value === "object" && !Array.isArray(value) && value.options
          ? value.options
          : value;

      return {
        category: canonicalCategory,
        options: normalizeApiOptions(options),
      };
    })
    .filter((filter) => getApiCategoryConfig(filter.category) && filter.options.length);

const getApiFilterList = (filterData) => {
  if (Array.isArray(filterData?.filters)) return filterData.filters;
  if (Array.isArray(filterData?.data?.filters)) return filterData.data.filters;
  if (Array.isArray(filterData?.filterData?.filters)) return filterData.filterData.filters;
  if (Array.isArray(filterData)) return filterData;
  if (filterData?.filterData && typeof filterData.filterData === "object") {
    return mapObjectFilters(filterData.filterData);
  }
  if (filterData?.data && typeof filterData.data === "object") {
    return mapObjectFilters(filterData.data);
  }
  if (filterData && typeof filterData === "object") return mapObjectFilters(filterData);
  return [];
};

const getApiFilterByCategory = (filterData, category) =>
  getApiFilterList(filterData).find(
    (item) => normalizeFilterKey(item?.category) === normalizeFilterKey(category),
  );

const getFilterRoot = (filterData) =>
  filterData?.filterData || filterData?.filters || filterData?.data || filterData || {};

const getFilterGroup = (filterData, group) => {
  if (group === "priceBuckets") {
    const priceFilter = getApiFilterByCategory(filterData, "PriceGroup");
    if (priceFilter?.options) return priceFilter.options;
  }

  const root = getFilterRoot(filterData);
  const aliases = FILTER_GROUP_ALIASES[group] || [group];

  for (const alias of aliases) {
    const apiFilter = getApiFilterByCategory(filterData, alias);
    if (apiFilter?.options) return apiFilter.options;
    if (root?.[alias] !== undefined) return root[alias];
  }

  return root?.[group];
};

const getOptionCount = (option) =>
  option?.count ??
  option?.total ??
  option?.totalCount ??
  option?.hotelCount ??
  option?.doc_count ??
  option?.value ??
  0;

const getArrayCount = (list, key, label) => {
  if (!Array.isArray(list)) return 0;

  const wanted = new Set([
    normalizeFilterKey(key),
    normalizeFilterKey(label),
  ]);

  const option = list.find((item) => {
    const values = [
      item?.key,
      item?.id,
      item?.code,
      item?.value,
      item?.name,
      item?.label,
      item?.title,
      item?.range,
    ];

    return values.some((value) => wanted.has(normalizeFilterKey(value)));
  });

  return toCount(getOptionCount(option));
};

const getCount = (filterData, group, key, label = key) => {
  if (group === "suggested") {
    if (key === "fiveStar") return getArrayCount(getFilterGroup(filterData, "starCategory"), "5", "5 Star");
    if (key === "fourStar") return getArrayCount(getFilterGroup(filterData, "starCategory"), "4", "4 Star");
    if (key === "breakfastIncluded") {
      return getArrayCount(getFilterGroup(filterData, "hotelAmenities"), "Breakfast", "Breakfast");
    }
  }

  const groupData = getFilterGroup(filterData, group);

  if (Array.isArray(groupData)) return getArrayCount(groupData, key, label);

  return toCount(
    groupData?.[key] ??
      groupData?.[String(key).toLowerCase()] ??
      groupData?.[normalizeFilterKey(key)] ??
      groupData?.[label] ??
      getFilterRoot(filterData)?.[key],
  );
};

const getRangeNumber = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const getApiOptionKey = (option = {}, category = "") => {
  if (category === "PriceGroup") {
    const min = Number(option.min || 0);
    const max = Number(option.max);

    if (Number.isFinite(max) && max >= 0) return `${min}-${max}`;
    return `${min}+`;
  }

  if (["Facilities", "HotelChain", "Attraction"].includes(category)) {
    return String(option.label || option.value || "").trim();
  }

  return String(option.value || option.key || option.label || "").trim();
};

const mapApiOption = (option = {}, category = "") => ({
  key: getApiOptionKey(option, category),
  label: option.label || String(option.value || ""),
  count: toCount(option.count),
  value: option.value,
  min: option.min,
  max: option.max,
  apiCategory: category,
});

const getStarSortValue = (option = {}) => {
  const starNumber = Number(option.key || option.value);
  if (Number.isFinite(starNumber) && starNumber > 0) return starNumber;

  const labelNumber = Number(String(option.label || "").match(/\d+/)?.[0]);
  if (Number.isFinite(labelNumber) && labelNumber > 0) return labelNumber;

  return 6;
};

const sortFilterOptions = (options = [], sectionKey = "") => {
  if (sectionKey !== "starCategory") return options;

  return [...options].sort(
    (firstOption, secondOption) =>
      getStarSortValue(firstOption) - getStarSortValue(secondOption),
  );
};

const getApiFilterSections = (filterData) =>
  getApiFilterList(filterData)
    .map((filter) => {
      const category = getCanonicalApiCategory(filter?.category);
      const config = getApiCategoryConfig(category);
      const normalizedOptions = normalizeApiOptions(filter?.options);
      const options = normalizedOptions.length
        ? normalizedOptions
            .map((option) => mapApiOption(option, category))
            .filter((option) => option.key && option.label)
        : [];

      if (!config || !options.length) return null;

      return {
        ...config,
        apiCategory: filter.category,
        options: sortFilterOptions(options, config.key),
      };
    })
    .filter(Boolean);

const getPriceRange = (filterData) => {
  const root = getFilterRoot(filterData);
  const price = root.price || root.priceRange || root.price_range || {};
  const buckets = getFilterGroup(filterData, "priceBuckets");
  const bucketPrices = Array.isArray(buckets)
    ? buckets.flatMap((bucket) => [
        bucket?.min,
        bucket?.minimum,
        bucket?.from,
        bucket?.max,
        bucket?.maximum,
        bucket?.to,
      ])
    : [];

  const prices = bucketPrices
    .map(Number)
    .filter((price) => Number.isFinite(price) && price >= 0);

  return {
    min: getRangeNumber(price.min ?? price.minimum ?? root.price_min ?? root.minPrice, prices.length ? Math.min(...prices) : DEFAULT_PRICE_RANGE[0]),
    max: getRangeNumber(price.max ?? price.maximum ?? root.price_max ?? root.maxPrice, prices.length ? Math.max(...prices) : DEFAULT_PRICE_RANGE[1]),
  };
};

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const getStarText = (sectionKey, optionKey) => {
  if (sectionKey !== "starCategory") return "";

  const starCount = Number(optionKey);
  return Number.isFinite(starCount) ? "★".repeat(starCount) : "";
};

const getFilterSearchKey = () => {
  if (typeof window === "undefined") return "";

  const params = new URLSearchParams(window.location.search);
  [
    "searchId",
    "searchid",
    "SearchId",
    "hotelSearchId",
    "hotelsearchid",
    "HotelSearchId",
  ].forEach((key) => params.delete(key));

  return Array.from(params.entries())
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
};

const readStoredFilterMemory = () => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(HOTEL_FILTER_MEMORY_KEY);
    const parsed = raw ? JSON.parse(raw) : null;

    if (!parsed || parsed.searchKey !== getFilterSearchKey()) return null;

    return parsed;
  } catch {
    return null;
  }
};

const writeStoredFilterMemory = (value) => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(
      HOTEL_FILTER_MEMORY_KEY,
      JSON.stringify({
        ...value,
        searchKey: getFilterSearchKey(),
      }),
    );
  } catch {
    // Ignore storage failures.
  }
};

const clearStoredFilterMemory = () => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(HOTEL_FILTER_MEMORY_KEY);
  } catch {
    // Ignore storage failures.
  }
};

const getStoredBudget = (memory) => {
  if (!Array.isArray(memory?.budget) || memory.budget.length !== 2) {
    return DEFAULT_PRICE_RANGE;
  }

  const budget = memory.budget.map(Number);
  return budget.every(Number.isFinite) ? budget : DEFAULT_PRICE_RANGE;
};

export default function HotelsFilters() {
  const searchParams = useSearchParams();
  const {
    filterData,
    isLoading,
    meta,
    setAppliedFilters,
    resetFilters: resetAppliedFilters,
  } =
    useHotelsContext();
  const filterMemoryRef = useRef(readStoredFilterMemory());
  const hasRestoredFiltersRef = useRef(false);
  const [selectedFilters, setSelectedFilters] = useState(
    filterMemoryRef.current?.selectedFilters || {},
  );
  const [budget, setBudget] = useState(getStoredBudget(filterMemoryRef.current));
  const [budgetTouched, setBudgetTouched] = useState(
    Boolean(filterMemoryRef.current?.budgetTouched),
  );
  const [searchTerms, setSearchTerms] = useState(
    filterMemoryRef.current?.searchTerms || {},
  );
  const [hotelSearchText, setHotelSearchText] = useState(
    filterMemoryRef.current?.hotelSearchText || "",
  );
  const [expandedSections, setExpandedSections] = useState(
    filterMemoryRef.current?.expandedSections || {},
  );
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapPreviewCenter, setMapPreviewCenter] = useState(() =>
    getHotelSearchCenter(searchParams, meta?.channel || ""),
  );
  const apiSections = useMemo(() => getApiFilterSections(filterData), [filterData]);
  const apiPriceSection = apiSections.find((section) => section.key === "price");
  const renderedSections = apiSections.filter((section) => section.key !== "price");
  const hasApiFilters = apiSections.length > 0;
  const isFilterLoading = !hasApiFilters && (meta?.isFilterLoading || isLoading);
  const mapPreviewUrl = getGoogleMapEmbedUrl(mapPreviewCenter, 13);

  const { min: minPrice, max: maxPrice } = getPriceRange(filterData);
  const safeBudget = [
    Math.min(Math.max(budget[0], minPrice), maxPrice),
    Math.min(Math.max(budget[1], minPrice), maxPrice),
  ];

  useEffect(() => {
    if (budgetTouched) return;

    setBudget([minPrice, maxPrice]);
  }, [budgetTouched, maxPrice, minPrice]);

  useEffect(() => {
    setMapPreviewCenter(getHotelSearchCenter(searchParams, meta?.channel || ""));
  }, [meta?.channel, searchParams]);

  const selectedChips = useMemo(() => {
    const chips = [];
    const chipSections = apiPriceSection
      ? [...apiSections, apiPriceSection]
      : apiSections;

    Object.entries(selectedFilters).forEach(([group, values]) => {
      Object.entries(values || {}).forEach(([key, isSelected]) => {
        if (!isSelected) return;
        const section = chipSections.find((item) => item.key === group);
        const option =
          section?.options.find((item) => item.key === key) ||
          PRICE_BUCKETS.find((item) => item.key === key);
        chips.push({
          group,
          key,
          label: option?.label || key,
        });
      });
    });

    return chips;
  }, [apiPriceSection, apiSections, selectedFilters]);

  const buildAppliedFilters = (filters, { includeBudget = false } = {}) => ({
    ...filters,
    ...(hotelSearchText.trim() && {
      hotelSearchText: hotelSearchText.trim(),
    }),
    ...((budgetTouched || includeBudget) && {
      budget: {
        min: safeBudget[0],
        max: safeBudget[1],
      },
    }),
  });

  useEffect(() => {
    if (hasRestoredFiltersRef.current) return;
    hasRestoredFiltersRef.current = true;

    const memory = filterMemoryRef.current;
    if (!memory) return;

    setAppliedFilters(
      memory.appliedFilters ||
        buildAppliedFilters(memory.selectedFilters || {}, {
          includeBudget: Boolean(memory.budgetTouched),
        }),
    );
  }, [setAppliedFilters]);

  useEffect(() => {
    writeStoredFilterMemory({
      selectedFilters,
      budget: safeBudget,
      budgetTouched,
      hotelSearchText,
      searchTerms,
      expandedSections,
      appliedFilters: buildAppliedFilters(selectedFilters),
    });
  }, [budgetTouched, expandedSections, hotelSearchText, safeBudget, searchTerms, selectedFilters]);

  useEffect(() => {
    setAppliedFilters(buildAppliedFilters(selectedFilters));
  }, [hotelSearchText]);

  const toggleFilter = (group, key) => {
    const nextFilters = {
      ...selectedFilters,
      [group]: {
        ...selectedFilters[group],
        [key]: !selectedFilters[group]?.[key],
      },
    };

    setSelectedFilters(nextFilters);
    setAppliedFilters(buildAppliedFilters(nextFilters));
  };

  const resetFilters = () => {
    setSelectedFilters({});
    setBudget([minPrice, maxPrice]);
    setBudgetTouched(false);
    setHotelSearchText("");
    setSearchTerms({});
    setExpandedSections({});
    clearStoredFilterMemory();
    resetAppliedFilters();
  };

  const applyFilters = ({ includeBudget = false } = {}) => {
    setAppliedFilters(buildAppliedFilters(selectedFilters, { includeBudget }));
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.titleAndCrossContainer}>
          <div className={styles.title}>
            <span className={styles.icon}>
              <ListFilter size={18} />
            </span>
            FILTER
          </div>
          <button type="button" onClick={resetFilters} className={styles.reset}>
            RESET
          </button>
        </div>

        {selectedChips.length > 0 && (
          <div className={styles.filterChips}>
            {selectedChips.map((chip) => (
              <button
                key={`${chip.group}-${chip.key}`}
                type="button"
                className={styles.chip}
                onClick={() => toggleFilter(chip.group, chip.key)}
              >
                <span className={styles.name}>{chip.label}</span>
                <X size={14} />
              </button>
            ))}
          </div>
        )}
      </div>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>EXPLORE</h4>
        <div className={styles.mapCard}>
          <iframe
            title="Google Map Explore"
            src={mapPreviewUrl}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <button
            type="button"
            className={styles.mapButton}
            onClick={() => setIsMapOpen(true)}
          >
            EXPLORE ON MAP
          </button>
        </div>
      </section>

      <div className={styles.border} />

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>SEARCH HOTELS</h4>
        <div className={styles.SearchField}>
          <Search size={18} />
          <input
            type="search"
            placeholder="Search locality / hotel name"
            value={hotelSearchText}
            onChange={(event) => setHotelSearchText(event.target.value)}
          />
          {/* {hotelSearchText && (
            <button
              type="button"
              className={styles.searchClearButton}
              onClick={() => setHotelSearchText("")}
              aria-label="Clear hotel search"
            >
              ×
            </button>
          )} */}
        </div>
      </section>

      <div className={styles.border} />

      {isFilterLoading && <FilterLoadingState />}

      {!isFilterLoading && !hasApiFilters && (
        <section className={styles.section}>
          <p className={styles.emptyFilters}>No filters available.</p>
        </section>
      )}

      {apiPriceSection && (
        <>
          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>PRICE PER NIGHT</h4>
            {apiPriceSection.options.map((bucket) => (
              <CheckboxRow
                key={bucket.key}
                checked={!!selectedFilters.price?.[bucket.key]}
                label={bucket.label}
                count={bucket.count ?? getCount(filterData, "priceBuckets", bucket.key, bucket.label)}
                onChange={() => toggleFilter("price", bucket.key)}
              />
            ))}
          </section>

          <div className={styles.border} />

          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>YOUR BUDGET</h4>
            <div className={styles.budgetGrid}>
              <label className={styles.budgetInput}>
                <span>Min Price</span>
                <input
                  type="number"
                  min={minPrice}
                  max={safeBudget[1]}
                  value={safeBudget[0]}
                  onChange={(event) => {
                    setBudgetTouched(true);
                    setBudget([Math.min(Number(event.target.value), safeBudget[1]), safeBudget[1]]);
                  }}
                />
              </label>
              <label className={styles.budgetInput}>
                <span>Max Price</span>
                <input
                  type="number"
                  min={safeBudget[0]}
                  max={maxPrice}
                  value={safeBudget[1]}
                  onChange={(event) => {
                    setBudgetTouched(true);
                    setBudget([safeBudget[0], Math.max(Number(event.target.value), safeBudget[0])]);
                  }}
                />
              </label>
            </div>
            
            <button
              type="button"
              className={styles.budgetSubmit}
              onClick={() => applyFilters({ includeBudget: true })}
            >
              SUBMIT
            </button>
          </section>
        </>
      )}

      {renderedSections.map((section) => (
        <div key={section.key}>
          <div className={styles.border} />
          <FilterSection
            section={section}
            filterData={filterData}
            selectedFilters={selectedFilters}
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
          />
        </div>
      ))}

      <div className={styles.actionBar}>
        <button type="button" onClick={resetFilters} className={styles.resetBtn}>
          RESET
        </button>
        <button type="button" onClick={() => applyFilters()} className={styles.applyBtn}>
          APPLY
        </button>
      </div>
      <HotelMap isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
    </aside>
  );
}

function FilterSection({
  section,
  filterData,
  selectedFilters,
  searchTerms,
  setSearchTerms,
  isExpanded,
  onExpandedChange,
  onToggle,
}) {
  const searchTerm = searchTerms[section.key] || "";
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleOptions = normalizedSearch
    ? section.options.filter((option) =>
        option.label.toLowerCase().includes(normalizedSearch),
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
      <h4 className={styles.sectionTitle}>{section.title}</h4>
      {section.searchable && (
        <div className={styles.SearchField}>
          <Search size={18} />
          <input
            type="search"
            placeholder={section.searchPlaceholder}
            value={searchTerm}
            onChange={(event) =>
              setSearchTerms((prev) => ({
                ...prev,
                [section.key]: event.target.value,
              }))
            }
          />
        </div>
      )}
      {displayedOptions.map((option) => (
        <CheckboxRow
          key={option.key}
          checked={!!selectedFilters[section.key]?.[option.key]}
          label={option.label}
          stars={getStarText(section.key, option.key)}
          count={option.count ?? getCount(filterData, section.key, option.key, option.label)}
          onChange={() => onToggle(section.key, option.key)}
        />
      ))}
      {shouldLimitOptions && (
        <button
          type="button"
          className={styles.seeMoreButton}
          onClick={() => onExpandedChange(!isExpanded)}
        >
          {isExpanded ? "SEE LESS" : `SEE MORE (${visibleOptions.length - FILTER_OPTION_PREVIEW_LIMIT})`}
        </button>
      )}
    </section>
  );
}

function FilterLoadingState() {
  return (
    <section className={styles.section}>
      <div className={styles.filterLoadingHeader}></div>
      <div className={styles.filterLoadingSearch}></div>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={`filter-loading-${index}`} className={styles.filterLoadingRow}>
          <span className={styles.filterLoadingBox}></span>
          <span className={styles.filterLoadingLabel}></span>
          <span className={styles.filterLoadingCount}></span>
        </div>
      ))}
    </section>
  );
}

function CheckboxRow({ checked, label, stars, count, onChange }) {
  return (
    <label className={styles.checkbox}>
      <input checked={checked} onChange={onChange} type="checkbox" />
      <span className={styles.customCheckbox}>
        <span className={styles.checkIcon}></span>
      </span>
      {stars && <span className={styles.starText}>{stars}</span>}
      <span className={styles.checkboxLabel}>{label}</span>
      <span className={styles.checkboxCount}>{count}</span>
    </label>
  );
}

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

const DEFAULT_FILTER_SECTIONS = [
  {
    key: "price",
    title: "PRICE PER NIGHT",
    options: PRICE_BUCKETS.map((bucket) => ({ ...bucket, count: 0 })),
  },
  {
    key: "starCategory",
    title: "STAR CATEGORY",
    options: ["1", "2", "3", "4", "5"].map((value) => ({
      key: value,
      value,
      label: value,
      count: 0,
    })),
  },
  {
    key: "hotelAmenities",
    title: "HOTEL AMENITIES",
    searchable: true,
    searchPlaceholder: "Search amenities",
    options: [
      "Air Conditioning",
      "Airport Shuttle",
      "Arcade/Game Room",
      "ATM",
      "Banquet",
      "Breakfast",
      "Parking",
      "Restaurant",
      "Swimming Pool",
      "Wi-Fi",
    ].map((label) => ({ key: label, value: label, label, count: 0 })),
  },
  {
    key: "providers",
    title: "PROVIDERS",
    options: [{ key: "akbar", value: "akbar", label: "akbar", count: 0 }],
  },
  {
    key: "refundable",
    title: "REFUNDABLE",
    options: [
      {
        key: "Refundable",
        value: "Refundable",
        label: "Refundable",
        count: 0,
      },
    ],
  },
  {
    key: "freeCancellation",
    title: "CANCELLATION",
    options: [
      {
        key: "FreeCancellation",
        value: "FreeCancellation",
        label: "Free Cancellation",
        count: 0,
      },
    ],
  },
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
  BreakfastIncluded: {
    key: "breakfastIncluded",
    title: "BREAKFAST",
  },
  FreeCancellation: {
    key: "freeCancellation",
    title: "CANCELLATION",
  },
  Refundable: {
    key: "refundable",
    title: "REFUNDABLE",
  },
  Neighbourhoods: {
    key: "neighbourhoods",
    title: "NEIGHBOURHOODS",
    searchable: true,
    searchPlaceholder: "Search neighbourhoods",
  },
  Providers: {
    key: "providers",
    title: "PROVIDERS",
  },
};

const API_FILTER_CATEGORY_ALIASES = {
  PriceGroup: ["PriceGroup", "priceGroup", "priceGroups", "priceBuckets", "price_ranges", "priceRanges", "price"],
  StarRating: ["StarRating", "starRating", "starRatings", "star_rating", "stars", "hotelStars", "starCategory"],
  Facilities: ["Facilities", "facilities", "hotelAmenities", "hotel_amenities", "amenities"],
  HotelChain: ["HotelChain", "hotelChain", "hotelChains", "hotel_chains", "chains", "brands"],
  PropertyType: ["PropertyType", "propertyType", "property_type", "propertyTypes", "property_types"],
  Attraction: ["Attraction", "attraction", "attractions", "nearByAttractions", "nearbyAttractions"],
  BreakfastIncluded: ["BreakfastIncluded", "breakfastIncluded", "breakfast_included"],
  FreeCancellation: ["FreeCancellation", "freeCancellation", "free_cancellation"],
  Refundable: ["Refundable", "refundable"],
  Neighbourhoods: ["Neighbourhoods", "neighbourhoods", "neighborhoods"],
  Providers: ["Providers", "providers"],
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
      let options =
        value && typeof value === "object" && !Array.isArray(value) && value.options
          ? value.options
          : value;

      if (
        options &&
        typeof options === "object" &&
        !Array.isArray(options) &&
        "available" in options
      ) {
        options = options.available
          ? [
              {
                key: canonicalCategory,
                value: canonicalCategory,
                label:
                  canonicalCategory === "BreakfastIncluded"
                    ? "Breakfast Included"
                    : canonicalCategory === "FreeCancellation"
                      ? "Free Cancellation"
                      : "Refundable",
                count: options.count || 0,
              },
            ]
          : [];
      }

      return {
        category: canonicalCategory,
        options: normalizeApiOptions(options),
      };
    })
    .filter((filter) => getApiCategoryConfig(filter.category) && filter.options.length);

const getFilterRoot = (filterData) =>
  filterData?.data?.filterData ||
  filterData?.filterData ||
  filterData?.data ||
  filterData ||
  {};

const getApiFilterList = (filterData) => {
  const root = getFilterRoot(filterData);

  if (Array.isArray(root?.filters)) return root.filters;
  if (Array.isArray(root)) return root;
  if (root?.filters && typeof root.filters === "object") {
    const nestedFilters = mapObjectFilters(root.filters);
    const rootFilters = mapObjectFilters(root);
    const nestedCategories = new Set(
      nestedFilters.map((filter) => normalizeFilterKey(filter.category)),
    );

    return [
      ...nestedFilters,
      ...rootFilters.filter(
        (filter) =>
          !nestedCategories.has(normalizeFilterKey(filter.category)),
      ),
    ];
  }
  if (root && typeof root === "object") return mapObjectFilters(root);
  return [];
};

const getApiFilterByCategory = (filterData, category) =>
  getApiFilterList(filterData).find(
    (item) => normalizeFilterKey(item?.category) === normalizeFilterKey(category),
  );

const getFilterGroup = (filterData, group) => {
  if (group === "priceBuckets") {
    const priceFilter = getApiFilterByCategory(filterData, "PriceGroup");
    if (priceFilter?.options) return priceFilter.options;
  }

  const root = getFilterRoot(filterData);
  const nestedRoot =
    root?.filters && !Array.isArray(root.filters) ? root.filters : null;
  const aliases = FILTER_GROUP_ALIASES[group] || [group];

  for (const alias of aliases) {
    const apiFilter = getApiFilterByCategory(filterData, alias);
    if (apiFilter?.options) return apiFilter.options;
    if (root?.[alias] !== undefined) return root[alias];
    if (nestedRoot?.[alias] !== undefined) return nestedRoot[alias];
  }

  return root?.[group] ?? nestedRoot?.[group];
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

const extractPriceNumber = (hotel = {}) => {
  const rawPrice =
    hotel.price ??
    hotel.amount ??
    hotel.minRate ??
    hotel.totalRate ??
    hotel.baseRate ??
    hotel.rate ??
    hotel.raw?.price ??
    hotel.raw?.amount ??
    hotel.raw?.minRate;

  if (rawPrice === null || rawPrice === undefined) return null;
  if (typeof rawPrice === "number") return rawPrice;

  if (typeof rawPrice === "object") {
    return extractPriceNumber(rawPrice);
  }

  const numeric = Number(String(rawPrice).replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
};

const getPriceBucketLiveCount = (hotels = [], bucket) => {
  if (!Array.isArray(hotels) || !hotels.length) return 0;

  return hotels.filter((hotel) => {
    const price = extractPriceNumber(hotel);
    if (price === null) return false;

    const min = bucket.min ?? 0;
    const max = bucket.max;

    if (max === null || max === undefined) {
      return price >= min;
    }

    return price >= min && price < max;
  }).length;
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
    hotels,
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
  const [budgetDraft, setBudgetDraft] = useState(() =>
    getStoredBudget(filterMemoryRef.current).map(String),
  );
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

    return [...mergedSections, ...remainingApiSections.values()];
  }, [apiSections]);

  
  const priceSection = filterSections.find((section) => section.key === "price");
  const renderedSections = filterSections.filter(
    (section) =>
      section.key !== "price" &&
      section.key !== "providers" &&
      section.key !== "refundable",
  );
  const mapPreviewUrl = getGoogleMapEmbedUrl(mapPreviewCenter, 13);

  const { min: minPrice, max: maxPrice } = getPriceRange(filterData);
  const safeBudget = useMemo(
    () => [
      Math.min(Math.max(budget[0], minPrice), maxPrice),
      Math.min(Math.max(budget[1], minPrice), maxPrice),
    ],
    [budget, maxPrice, minPrice],
  );

  useEffect(() => {
    if (budgetTouched) {
      // A stale/equal saved range can collapse to the new socket minimum and
      // silently exclude every hotel. Drop only that invalid saved budget.
      if (
        filterData &&
        maxPrice > minPrice &&
        safeBudget[1] <= safeBudget[0]
      ) {
        const nextBudget = [minPrice, maxPrice];
        setBudget(nextBudget);
        setBudgetDraft(nextBudget.map(String));
        setBudgetTouched(false);
        setAppliedFilters((currentFilters) => {
          const { budget: ignoredBudget, ...filtersWithoutBudget } =
            currentFilters || {};
          void ignoredBudget;
          return filtersWithoutBudget;
        });
      }
      return;
    }

    setBudget((currentBudget) =>
      currentBudget[0] === minPrice && currentBudget[1] === maxPrice
        ? currentBudget
        : [minPrice, maxPrice],
    );
    setBudgetDraft((currentDraft) =>
      currentDraft[0] === String(minPrice) &&
      currentDraft[1] === String(maxPrice)
        ? currentDraft
        : [String(minPrice), String(maxPrice)],
    );
  }, [
    budgetTouched,
    filterData,
    maxPrice,
    minPrice,
    safeBudget,
    setAppliedFilters,
  ]);

  useEffect(() => {
    setMapPreviewCenter(getHotelSearchCenter(searchParams, meta?.channel || ""));
  }, [meta?.channel, searchParams]);

  const selectedChips = useMemo(() => {
    const chips = [];

    Object.entries(selectedFilters).forEach(([group, values]) => {
      Object.entries(values || {}).forEach(([key, isSelected]) => {
        if (!isSelected) return;
        const section = filterSections.find((item) => item.key === group);
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
  }, [filterSections, selectedFilters]);

  const buildAppliedFilters = (
    filters,
    { includeBudget = false, budgetOverride = null } = {},
  ) => {
    const appliedBudget = budgetOverride || safeBudget;

    return {
      ...filters,
      ...(hotelSearchText.trim() && {
        hotelSearchText: hotelSearchText.trim(),
      }),
      ...((budgetTouched || includeBudget) && {
        budget: {
          min: appliedBudget[0],
          max: appliedBudget[1],
        },
      }),
    };
  };

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
    const nextBudget = [minPrice, maxPrice];
    setSelectedFilters({});
    setBudget(nextBudget);
    setBudgetDraft(nextBudget.map(String));
    setBudgetTouched(false);
    setHotelSearchText("");
    setSearchTerms({});
    setExpandedSections({});
    clearStoredFilterMemory();
    resetAppliedFilters();
  };

  const normalizeBudgetDraft = () => {
    const parsedMin =
      String(budgetDraft[0]).trim() === "" ? Number.NaN : Number(budgetDraft[0]);
    const parsedMax =
      String(budgetDraft[1]).trim() === "" ? Number.NaN : Number(budgetDraft[1]);
    const nextMin = Math.min(
      Math.max(Number.isFinite(parsedMin) ? parsedMin : minPrice, minPrice),
      maxPrice,
    );
    const nextMax = Math.min(
      Math.max(Number.isFinite(parsedMax) ? parsedMax : maxPrice, nextMin),
      maxPrice,
    );

    return [nextMin, nextMax];
  };

  const commitBudgetDraft = () => {
    const nextBudget = normalizeBudgetDraft();
    setBudget(nextBudget);
    setBudgetDraft(nextBudget.map(String));
    return nextBudget;
  };

  const applyFilters = ({
    includeBudget = false,
    budgetOverride = null,
  } = {}) => {
    setAppliedFilters(
      buildAppliedFilters(selectedFilters, {
        includeBudget,
        budgetOverride,
      }),
    );
  };

  const submitBudget = () => {
    const nextBudget = commitBudgetDraft();
    setBudgetTouched(true);
    applyFilters({ includeBudget: true, budgetOverride: nextBudget });
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

      {priceSection && (
        <>
          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>PRICE PER NIGHT</h4>
            {PRICE_BUCKETS.map((bucket) => {
              const apiCount = getCount(
                filterData,
                "priceBuckets",
                bucket.key,
                bucket.label,
              );
              const count = apiCount || getPriceBucketLiveCount(hotels, bucket);

              return (
                <CheckboxRow
                  key={bucket.key}
                  checked={!!selectedFilters.price?.[bucket.key]}
                  label={bucket.label}
                  count={count}
                  onChange={() => toggleFilter("price", bucket.key)}
                />
              );
            })}
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
                  value={budgetDraft[0]}
                  onChange={(event) => {
                    setBudgetTouched(true);
                    setBudgetDraft((currentBudget) => [
                      event.target.value,
                      currentBudget[1],
                    ]);
                  }}
                  onBlur={commitBudgetDraft}
                />
              </label>
              <label className={styles.budgetInput}>
                <span>Max Price</span>
                <input
                  type="number"
                  min={safeBudget[0]}
                  max={maxPrice}
                  value={budgetDraft[1]}
                  onChange={(event) => {
                    setBudgetTouched(true);
                    setBudgetDraft((currentBudget) => [
                      currentBudget[0],
                      event.target.value,
                    ]);
                  }}
                  onBlur={commitBudgetDraft}
                />
              </label>
            </div>
            
            <button
              type="button"
              className={styles.budgetSubmit}
              onClick={submitBudget}
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

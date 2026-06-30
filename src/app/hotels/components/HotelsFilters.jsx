"use client";

import { useEffect, useMemo, useState } from "react";
import { ListFilter, Search, X } from "lucide-react";
import styles from "./HotelsFilters.module.css";

const DEFAULT_PRICE_RANGE = [0, 25000];

const HOTEL_FILTER_SECTIONS = [
  {
    key: "suggested",
    title: "SUGGESTED FOR YOU",
    options: [
      { key: "lastMinuteDeals", label: "Last Minute Deals" },
      { key: "fiveStar", label: "5 Star" },
      { key: "fourStar", label: "4 Star" },
      { key: "breakfastIncluded", label: "Breakfast Included" },
      { key: "oneClickRewards", label: "OneClick Rewards" },
    ],
  },
  {
    key: "starCategory",
    title: "STAR CATEGORY",
    options: [
      { key: "3", label: "3 Star" },
      { key: "4", label: "4 Star" },
      { key: "5", label: "5 Star" },
    ],
  },
  {
    key: "guestRating",
    title: "GUEST RATING",
    options: [
      { key: "4.2", label: "Excellent 4.2+" },
      { key: "3.5", label: "Very Good 3.5+" },
      { key: "3", label: "Good 3+" },
      { key: "4.7", label: "Wonderful 4.7+" },
      { key: "4.8", label: "Exceptional 4.8+" },
    ],
  },
  {
    key: "propertyType",
    title: "PROPERTY TYPE",
    options: [
      { key: "hotel", label: "Hotel" },
      { key: "homestay", label: "Homestay" },
      { key: "villa", label: "Villa" },
      { key: "cottage", label: "Cottage" },
      { key: "resort", label: "Resort" },
      { key: "apartment", label: "Apartment" },
      { key: "hostel", label: "Hostel" },
      { key: "guestHouse", label: "Guest House" },
      { key: "servicedApartment", label: "Serviced Apartment" },
      { key: "vacationHome", label: "Vacation Home" },
    ],
  },
  {
    key: "roomViews",
    title: "ROOM VIEWS",
    options: [
      { key: "garden", label: "Garden View" },
      { key: "mountain", label: "Mountain View" },
      { key: "valley", label: "Valley View" },
      { key: "lake", label: "Lake View" },
      { key: "city", label: "City View" },
      { key: "forest", label: "Forest View" },
    ],
  },
  {
    key: "roomAmenities",
    title: "ROOM AMENITIES",
    searchable: true,
    searchPlaceholder: "Search room amenities",
    options: [
      { key: "balcony", label: "Balcony" },
      { key: "bathtub", label: "Bathtub" },
      { key: "fireplace", label: "Fireplace" },
      { key: "kitchenette", label: "Kitchenette" },
      { key: "coffeeMachine", label: "Coffee Machine" },
      { key: "roomService", label: "Cook & Butler Service" },
      { key: "privatePool", label: "Private Pool" },
      { key: "jacuzzi", label: "Jacuzzi" },
      { key: "airConditioning", label: "Air Conditioning" },
      { key: "miniBar", label: "Mini Bar" },
      { key: "smartTv", label: "Smart TV" },
    ],
  },
  {
    key: "hotelAmenities",
    title: "HOTEL AMENITIES",
    searchable: true,
    searchPlaceholder: "Search amenities",
    options: [
      { key: "wifi", label: "Wi-Fi" },
      { key: "swimmingPool", label: "Swimming Pool" },
      { key: "spa", label: "Spa" },
      { key: "gym", label: "Gym" },
      { key: "restaurant", label: "Restaurant" },
      { key: "bar", label: "Bar" },
      { key: "kidsPlayArea", label: "Kids Play Area" },
      { key: "parking", label: "Parking" },
      { key: "airportShuttle", label: "Airport Shuttle" },
      { key: "petFriendly", label: "Pet Friendly" },
      { key: "businessCentre", label: "Business Centre" },
      { key: "evCharging", label: "Electric Vehicle Charging" },
      { key: "laundry", label: "Laundry" },
      { key: "roomService", label: "Room Service" },
    ],
  },
  {
    key: "houseRules",
    title: "HOUSE RULES",
    options: [
      { key: "unmarriedCouples", label: "Allows Unmarried Couples" },
      { key: "familyFriendly", label: "Family Friendly" },
      { key: "alcoholAllowed", label: "Alcohol Allowed" },
      { key: "smokingAllowed", label: "Smoking Allowed" },
      { key: "petsAllowed", label: "Pets Allowed" },
      { key: "twentyFourPlus", label: "2+ Pets Allowed" },
      { key: "selfCheckIn", label: "Self Check-In" },
      { key: "maleGroups", label: "Male Groups Allowed" },
      { key: "coupleFriendly", label: "Couple Friendly" },
    ],
  },
  {
    key: "flexibleCheckIn",
    title: "FLEXIBLE CHECK-IN / CHECK-OUT",
    options: [
      { key: "earlyCheckIn", label: "Guaranteed Early Check-In" },
      { key: "lateCheckOut", label: "Guaranteed Late Check-Out" },
      { key: "twentyFourHour", label: "24-Hour Check-In" },
    ],
  },
  {
    key: "hotelChains",
    title: "HOTEL CHAINS",
    searchable: true,
    searchPlaceholder: "Search hotel chains",
    options: [
      { key: "marriott", label: "Marriott" },
      { key: "hilton", label: "Hilton" },
      { key: "ihg", label: "IHG" },
      { key: "hyatt", label: "Hyatt" },
      { key: "radisson", label: "Radisson" },
      { key: "accor", label: "Accor" },
      { key: "taj", label: "Taj" },
    ],
  },
];

const PRICE_BUCKETS = [
  { key: "0-2500", label: "₹0-2500", min: 0, max: 2500 },
  { key: "2500-4500", label: "₹2500-4500", min: 2500, max: 4500 },
  { key: "4500-7000", label: "₹4500-7000", min: 4500, max: 7000 },
  { key: "7000-11000", label: "₹7000-11000", min: 7000, max: 11000 },
  { key: "11000-17000", label: "₹11000-17000", min: 11000, max: 17000 },
  { key: "17000+", label: "₹17000+", min: 17000, max: null },
];

const toCount = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getCount = (filterData, group, key) =>
  toCount(
    filterData?.[group]?.[key] ??
      filterData?.[group]?.[String(key).toLowerCase()] ??
      filterData?.[key],
  );

const getRangeNumber = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const getStarText = (sectionKey, optionKey) => {
  if (sectionKey !== "starCategory") return "";

  const starCount = Number(optionKey);
  return Number.isFinite(starCount) ? "★".repeat(starCount) : "";
};

export default function HotelsFilters({ filterData, onApply, onReset }) {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [budget, setBudget] = useState(DEFAULT_PRICE_RANGE);
  const [budgetTouched, setBudgetTouched] = useState(false);
  const [searchTerms, setSearchTerms] = useState({});

  const minPrice = getRangeNumber(filterData?.price?.min ?? filterData?.price_min, DEFAULT_PRICE_RANGE[0]);
  const maxPrice = getRangeNumber(filterData?.price?.max ?? filterData?.price_max, DEFAULT_PRICE_RANGE[1]);
  const safeBudget = [
    Math.min(Math.max(budget[0], minPrice), maxPrice),
    Math.min(Math.max(budget[1], minPrice), maxPrice),
  ];

  useEffect(() => {
    setBudget([minPrice, maxPrice]);
    setBudgetTouched(false);
  }, [maxPrice, minPrice]);

  const selectedChips = useMemo(() => {
    const chips = [];

    Object.entries(selectedFilters).forEach(([group, values]) => {
      Object.entries(values || {}).forEach(([key, isSelected]) => {
        if (!isSelected) return;
        const section = HOTEL_FILTER_SECTIONS.find((item) => item.key === group);
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
  }, [selectedFilters]);

  const toggleFilter = (group, key) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: !prev[group]?.[key],
      },
    }));
  };

  const resetFilters = () => {
    setSelectedFilters({});
    setBudget([minPrice, maxPrice]);
    setBudgetTouched(false);
    setSearchTerms({});
    onReset?.();
  };

  const applyFilters = ({ includeBudget = false } = {}) => {
    onApply?.({
      ...selectedFilters,
      ...((budgetTouched || includeBudget) && {
        budget: {
          min: safeBudget[0],
          max: safeBudget[1],
        },
      }),
    });
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
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.1963288417934!2d77.2065171!3d28.6238803!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd3600000001%3A0x6e9f16d89b1d9bfb!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi%20110001!5e0!3m2!1sen!2sin!4v1719750000000!5m2!1sen!2sin"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <button type="button" className={styles.mapButton}>
            EXPLORE ON MAP
          </button>
        </div>
      </section>

      <div className={styles.border} />

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>SEARCH HOTELS</h4>
        <div className={styles.SearchField}>
          <Search size={18} />
          <input type="search" placeholder="Search locality / hotel name" />
        </div>
      </section>

      <div className={styles.border} />

      <FilterSection
        section={HOTEL_FILTER_SECTIONS[0]}
        filterData={filterData}
        selectedFilters={selectedFilters}
        searchTerms={searchTerms}
        setSearchTerms={setSearchTerms}
        onToggle={toggleFilter}
      />

      <div className={styles.border} />

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>PRICE PER NIGHT</h4>
        {PRICE_BUCKETS.map((bucket) => (
          <CheckboxRow
            key={bucket.key}
            checked={!!selectedFilters.price?.[bucket.key]}
            label={bucket.label}
            count={getCount(filterData, "priceBuckets", bucket.key)}
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

      {HOTEL_FILTER_SECTIONS.slice(1).map((section) => (
        <div key={section.key}>
          <div className={styles.border} />
          <FilterSection
            section={section}
            filterData={filterData}
            selectedFilters={selectedFilters}
            searchTerms={searchTerms}
            setSearchTerms={setSearchTerms}
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
    </aside>
  );
}

function FilterSection({
  section,
  filterData,
  selectedFilters,
  searchTerms,
  setSearchTerms,
  onToggle,
}) {
  const searchTerm = searchTerms[section.key] || "";
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleOptions = normalizedSearch
    ? section.options.filter((option) =>
        option.label.toLowerCase().includes(normalizedSearch),
      )
    : section.options;

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
      {visibleOptions.map((option) => (
        <CheckboxRow
          key={option.key}
          checked={!!selectedFilters[section.key]?.[option.key]}
          label={option.label}
          stars={getStarText(section.key, option.key)}
          count={getCount(filterData, section.key, option.key)}
          onChange={() => onToggle(section.key, option.key)}
        />
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

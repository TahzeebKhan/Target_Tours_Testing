// import api from "@/lib/axios";

import api from "@/lib/axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const TOURS_PAGE_SIZE = 10;

const pickSelectedKeys = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return [];
    }

    return Object.keys(value).filter((key) => Boolean(value[key]));
};

const joinValues = (value) => {
    if (Array.isArray(value)) {
        return value.filter(Boolean).join(",");
    }

    if (typeof value === "string") {
        return value.trim();
    }

    return "";
};

const normalizeHotelCategory = (value) => {
    const category = String(value || "").trim();

    if (!category) return "";
    if (category === "<3") return "less_than_3_star";
    if (["3", "4", "5"].includes(category)) return `${category}_star`;

    return category;
};

const buildTourParams = (filters = {}) => {
    const params = {
        page: filters.page,
        perPage: TOURS_PAGE_SIZE,
        domain: process.env.NEXT_PUBLIC_DOMAIN,
    };

    const city = joinValues(filters.city) || pickSelectedKeys(filters.cities).join(",");
    const continent =
        joinValues(filters.continent) || pickSelectedKeys(filters.continents).join(",");
    const country =
        joinValues(filters.country) || pickSelectedKeys(filters.countries).join(",");
    const state = joinValues(filters.state) || pickSelectedKeys(filters.states).join(",");
    const from = joinValues(filters.from);
    const to = joinValues(filters.to);

    const minPrice =
        filters.min_price ??
        (Array.isArray(filters.price) ? filters.price[0] : undefined);
    const maxPrice =
        filters.max_price ??
        (Array.isArray(filters.price) ? filters.price[1] : undefined);
    const minNights =
        filters.min_nights ??
        (Array.isArray(filters.nights) ? filters.nights[0] : undefined);
    const maxNights =
        filters.max_nights ??
        (Array.isArray(filters.nights) ? filters.nights[1] : undefined);
    const packageType = filters.package_type ?? filters.packageType;
    const isPremiumPackage =
        filters.is_premium_package ??
        (filters.premiumPackages?.Premium ? true : undefined);

    if (continent) params.continent = continent;
    if (country) params.country = country;
    if (state) params.state = state;
    if (city) params.city = city;
    if (from) params.from = from;
    if (to) params.to = to;
    if (packageType) params.package_type = packageType;
    if (typeof isPremiumPackage === "boolean") {
        params.is_premium_package = isPremiumPackage;
    }
    if (minPrice !== undefined && minPrice !== null && minPrice !== "") {
        params.min_price = minPrice;
    }
    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== "") {
        params.max_price = maxPrice;
    }
    if (minNights !== undefined && minNights !== null && minNights !== "") {
        params.min_nights = minNights;
    }
    if (maxNights !== undefined && maxNights !== null && maxNights !== "") {
        params.max_nights = maxNights;
    }

    if (filters.with_flight !== undefined) {
        params.with_flight = filters.with_flight;
    } else if (filters.flightType === "with") {
        params.with_flight = true;
    } else if (filters.flightType === "without") {
        params.with_flight = false;
    }

    if (filters.hotel_category) {
        params.hotel_category = normalizeHotelCategory(filters.hotel_category);
    } else if (filters.hotelCategory) {
        params.hotel_category = normalizeHotelCategory(filters.hotelCategory);
    }

    const themes = joinValues(filters.themes) || pickSelectedKeys(filters.themes).join(",");
    if (themes) {
        params.themes = themes;
    }

    return params;
};

const getTourImage = (item) => {
    if (item?.main_image?.url) {
        return API_BASE_URL + item.main_image.url;
    }

    const media = item?.package_media?.[0]?.package_media?.[0]?.url;
    return media ? API_BASE_URL + media : "/tourList/cardItem1.jpg";
};

const getFlightsTotalPrice = (item) => {
    const flights = item?.flights || [];

    if (!Array.isArray(flights)) return 0;

    return flights.reduce((total, flight) => {
        const amount = Number(flight?.price?.amount || 0);
        return Number.isFinite(amount) ? total + amount : total;
    }, 0);
};

const safeNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

const normalizeTour = (item) => ({
    id: item.id,
    image: getTourImage(item),
    title: item.title || "Untitled Package",
    route: item.start_location
        ? `${item.start_location.city} TO ${item.end_location?.city}`
        : "MULTI CITY",
    days:
        item.duration_days && item.duration_nights
            ? `${item.duration_days} DAYS & ${item.duration_nights} NIGHTS`
            : "CUSTOM DURATION",
    meals: item?.selected_meals_count > 0 ? "SELECTED MEALS" : "MEALS NOT INCLUDE",
    hotel: item?.highest_starred_hotel ?  `${item?.highest_starred_hotel} `  : "HOTEL NOT INCLUDED" ,
    activities: `${item?.activities_count || 0} ACTIVITIES`,
    price: item.started_price
        ? `₹ ${item.started_price.toLocaleString()}`
        : "N/A",
    startedPrice: item.started_price || 0,
    withFlightPrice: safeNumber(item?.with_flight_price),
    withoutFlightPrice: safeNumber(item?.without_flight_price),
    flightAmountDeducted: safeNumber(item?.flight_amount_deducted),
    flights: item?.flights || [],
    flightsTotalPrice: getFlightsTotalPrice(item),
    fromCity: item.start_location?.city || item.start_location?.name || "",
    with_flight: Boolean(item.with_flight),
    raw: item,
    package_inclusion: item.package_inclusion,
    package_inclusion_tags:item?.package_inclusion_tags
});

export const fetchTours = async ({ pageParam = 1, queryKey }) => {
    const [_key, query = {}] = queryKey;
    const filters = query?.filters || {};

    const params = buildTourParams({
        ...filters,
        page: pageParam,
    });

    Object.keys(params).forEach(
        (k) => (params[k] === undefined || params[k] === "") && delete params[k]
    );

    const res = await api.get("api/holiday-packages/company", { params });

    return {
        data: (res.data?.data || []).map(normalizeTour),
        meta: res.data?.meta || null,
    };
};

export const fetchHolidayPackageSuggestions = async ({ term = "", type = "" }) => {
    const response = await api.get("/api/holiday-packages/suggestions", {
        params: {
            domain: process.env.NEXT_PUBLIC_DOMAIN,
            term,
            type,
        },
    });

    return response?.data;
};

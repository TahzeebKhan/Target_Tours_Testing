"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from './HotelDetaislMobileView.module.css'
import MobileTab from './mobileTab/MobileTab'
import DescriptionComponent from '../descriptionComponent/DescriptionComponent'
import Amenities from '../amenities/Amenities'
import HotelPolicies from '../hotelPolicies/HotelPolicies'
import Testimonial from '../testimonialSection/Testimonial'
import BarcelonaSection from '../BarcelonaSection/BarcelonaSection'
import Footer from '@/app/home-page/components/footer/Footer'
import FeatureSection from '@/app/home-page/components/featureSection/FeatureSection'
import Availabilitymobile from './availabilityMobile/Availabilitymobile'
import BookingFooter from './bookingFooter/BookingFooter'
import HotelPriceSummary from './hotelPriceSummary/HotelPriceSummary'
import { AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useHotelDetailData } from '../../HotelDetailDataContext'
import {
    HOTEL_DETAILS_KEY,
    HOTEL_SEARCH_SESSION_KEY,
    writeHotelBookingSession,
} from '@/shared/services/hotelSearch'

const formatCurrency = (value) =>
    `₹ ${Math.round(Number(value || 0)).toLocaleString("en-IN", {
        maximumFractionDigits: 0,
    })}`;

const getNumericSearchParam = (searchParams, key, fallback = 0) => {
    const value = Number(searchParams.get(key));
    return Number.isFinite(value) && value >= 0 ? value : fallback;
};

const getNightsCount = (checkIn, checkOut) => {
    const start = checkIn ? new Date(`${checkIn}T00:00:00`) : null;
    const end = checkOut ? new Date(`${checkOut}T00:00:00`) : null;

    if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return 1;
    }

    return Math.max(
        1,
        Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)),
    );
};

const pluralize = (count, label) =>
    `${count} ${label}${Number(count) === 1 ? "" : "s"}`;

const getStartingRoom = (rooms = []) =>
    [...rooms]
        .filter((room) => Number(room?.price?.offerAmount) > 0)
        .sort(
            (first, second) =>
                Number(first.price.offerAmount) - Number(second.price.offerAmount),
        )[0] ||
    rooms[0] ||
    null;

const getRatingValue = (rating) => {
    const numericRating = Number(rating);
    return Number.isFinite(numericRating) ? numericRating : 0;
};

const getRoomKey = (room, index) => room?.id || `${room?.title || "room"}-${index}`;

const parseGuestCount = (value) => {
    const match = String(value || "").match(/\d+/);
    const guests = match ? Number(match[0]) : 0;

    return Number.isFinite(guests) && guests > 0 ? guests : 1;
};

const getSearchCity = (searchParams, hotelDetail) =>
    searchParams?.get("city") ||
    searchParams?.get("location") ||
    hotelDetail?.request?.city ||
    hotelDetail?.city ||
    "";

const parseCurrencyNumber = (value) => {
    const numericValue = Number(String(value || "").replace(/[^\d.]/g, ""));
    return Number.isFinite(numericValue) ? numericValue : 0;
};

const getFirstValue = (...values) =>
    values.find((value) => value !== undefined && value !== null && value !== "") || "";

const HOTEL_SEARCH_TRACING_KEYS = [
    "roomsSearchTracingKey",
    "RoomsSearchTracingKey",
    "searchTracingKey",
    "SearchTracingKey",
    "searchTracingkey",
    "search_tracing_key",
    "searchTracing",
    "searchtracing",
    "TUI",
    "tui",
];

const findFirstDeepValue = (source, keys = HOTEL_SEARCH_TRACING_KEYS, seen = new Set()) => {
    if (!source || typeof source !== "object" || seen.has(source)) return "";

    seen.add(source);

    for (const key of keys) {
        const value = source[key];
        if (value !== undefined && value !== null && value !== "") {
            return value;
        }
    }

    for (const value of Object.values(source)) {
        if (value && typeof value === "object") {
            const deepValue = findFirstDeepValue(value, keys, seen);
            if (deepValue) return deepValue;
        }
    }

    return "";
};

const readStoredHotelSearch = () => {
    if (typeof window === "undefined") return {};

    try {
        const raw = window.sessionStorage.getItem(HOTEL_SEARCH_SESSION_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

const HotelDetaislMobileView = () => {
    const { hotelDetail } = useHotelDetailData();
    const [mobileSearchParams, setMobileSearchParams] = useState(null);
    const [showPriceSummary, setShowPriceSummary] = useState(false);
    const [selectedRoomQty, setSelectedRoomQty] = useState({});
    const [selectionMessage, setSelectionMessage] = useState("");
    const [activeTab, setActiveTab] = useState("Description");
    const sectionRefs = {
        Description: useRef(null),
        Amenities: useRef(null),
        Rooms: useRef(null),
        Reviews: useRef(null),
        "HOTEL POLICY": useRef(null),
    };
    const router = useRouter();
    const ratingValue = getRatingValue(hotelDetail?.rating);
    const roundedRating = Math.round(ratingValue);
    const reviewText = hotelDetail?.reviewText || "No reviews yet";
    const searchCity = getSearchCity(mobileSearchParams, hotelDetail);

    useEffect(() => {
        if (typeof window === "undefined") return;

        setMobileSearchParams(new URLSearchParams(window.location.search));
    }, []);

    const searchSummary = useMemo(() => {
        const searchParams = mobileSearchParams || new URLSearchParams();

        return {
            rooms: Math.max(1, getNumericSearchParam(searchParams, "rooms", 1)),
            adults: Math.max(1, getNumericSearchParam(searchParams, "adults", 1)),
            children: getNumericSearchParam(searchParams, "children", 0),
            nights: getNightsCount(
                searchParams.get("checkIn") || searchParams.get("checkin"),
                searchParams.get("checkOut") || searchParams.get("checkout"),
            ),
        };
    }, [mobileSearchParams]);

    const selectedRoomEntries = useMemo(
        () =>
            (hotelDetail?.rooms || [])
                .map((room, index) => ({
                    room,
                    qty: Number(selectedRoomQty[getRoomKey(room, index)] || 0),
                }))
                .filter((item) => item.qty > 0),
        [hotelDetail?.rooms, selectedRoomQty],
    );

    const selectedRoomCount = useMemo(
        () => selectedRoomEntries.reduce((total, item) => total + item.qty, 0),
        [selectedRoomEntries],
    );

    const selectedGuestCapacity = useMemo(
        () =>
            selectedRoomEntries.reduce(
                (total, item) => total + parseGuestCount(item.room?.persons) * item.qty,
                0,
            ),
        [selectedRoomEntries],
    );

    const hotelPriceSummary = useMemo(() => {
        const startingRoom = getStartingRoom(hotelDetail?.rooms || []);
        const pricedEntries = selectedRoomEntries.length
            ? selectedRoomEntries
            : startingRoom
                ? [{ room: startingRoom, qty: searchSummary.rooms }]
                : [];
        const roomCharges = pricedEntries.reduce(
            (total, item) =>
                total +
                Number(item.room?.price?.offerAmount || 0) * item.qty * searchSummary.nights,
            0,
        );
        const basePrice = pricedEntries.reduce((total, item) => {
            const offerRate = Number(item.room?.price?.offerAmount || 0);
            const publishedRate =
                Number(item.room?.price?.actualAmount || 0) || offerRate;

            return total + publishedRate * item.qty * searchSummary.nights;
        }, 0);
        const discount = Math.max(0, basePrice - roomCharges);
        const taxes = pricedEntries.reduce((total, item) => {
            const taxPerNight = item.room?.price?.rateIncludesTax
                ? 0
                : Number(item.room?.price?.taxAmount || 0);

            return total + taxPerNight * item.qty * searchSummary.nights;
        }, 0);
        const total = roomCharges + taxes;
        const lineItems = [
            ...pricedEntries.map((item, index) => ({
                id: `${item.room?.id || item.room?.title || "room"}-${index}`,
                label: `${item.qty}x ${item.room?.title || "Room"}`,
                value: formatCurrency(
                    Number(item.room?.price?.offerAmount || 0) *
                        item.qty *
                        searchSummary.nights,
                ),
            })),
            {
                label: pluralize(searchSummary.nights, "Night"),
                value: "Included",
                isGreen: true,
            },
            {
                label: pluralize(searchSummary.adults, "Adult"),
                value: "Included",
                isGreen: true,
            },
            ...(searchSummary.children
                ? [
                    {
                        label: pluralize(searchSummary.children, "Child"),
                        value: "Included",
                        isGreen: true,
                    },
                ]
                : []),
            {
                label: "Base Price",
                value: formatCurrency(basePrice),
            },
            ...(discount
                ? [
                    {
                        label: "Discount",
                        value: `-${formatCurrency(discount)}`,
                    },
                ]
                : []),
            {
                label: "Taxes & Fees",
                value: formatCurrency(taxes),
            },
        ];

        return {
            footerTitle: selectedRoomEntries.length ? "Selected Total" : "Starting From",
            footerAmount: total > 0 ? formatCurrency(total) : "₹ 0",
            lineItems,
            totalAmount: total > 0 ? formatCurrency(total) : "₹ 0",
        };
    }, [hotelDetail?.rooms, searchSummary, selectedRoomEntries]);

    const handleContinueBooking = () => {
        const requiredGuests = searchSummary.adults + searchSummary.children;

        if (!selectedRoomCount) {
            setSelectionMessage("Please add a room to continue.");
            sectionRefs.Rooms.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }

        if (selectedRoomCount < searchSummary.rooms) {
            setSelectionMessage(`Please select ${searchSummary.rooms} room${searchSummary.rooms === 1 ? "" : "s"} to match your search.`);
            sectionRefs.Rooms.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }

        if (selectedGuestCapacity < requiredGuests) {
            setSelectionMessage(`Selected rooms allow ${selectedGuestCapacity} guest${selectedGuestCapacity === 1 ? "" : "s"}, but your search has ${requiredGuests}.`);
            sectionRefs.Rooms.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }

        setSelectionMessage("");
        const searchParams = mobileSearchParams || new URLSearchParams();
        const storedHotelSearch = readStoredHotelSearch();
        const searchTracingKey = getFirstValue(
            selectedRoomEntries[0]?.room?.roomsSearchTracingKey,
            selectedRoomEntries[0]?.room?.searchTracingKey,
            selectedRoomEntries[0]?.room?.TUI,
            selectedRoomEntries[0]?.room?.raw?.roomsSearchTracingKey,
            selectedRoomEntries[0]?.room?.raw?.searchTracingKey,
            selectedRoomEntries[0]?.room?.raw?.TUI,
            hotelDetail?.roomsSearchTracingKey,
            hotelDetail?.request?.roomsSearchTracingKey,
            hotelDetail?.request?.searchTracingKey,
            hotelDetail?.request?.TUI,
            hotelDetail?.request?.tui,
            storedHotelSearch.roomsSearchTracingKey,
            storedHotelSearch.searchTracingKey,
            storedHotelSearch.TUI,
            storedHotelSearch.tui,
            searchParams.get("searchTracingKey"),
            searchParams.get("TUI"),
            searchParams.get("tui"),
            findFirstDeepValue(storedHotelSearch.initResponse),
            findFirstDeepValue(storedHotelSearch),
        );
        const selectedRooms = selectedRoomEntries.map(({ room, qty }) => ({
            id: room.id,
            title: room.title,
            image: room.image?.[0]?.img || room.image?.[0]?.image || "/images/hotelArt1.png",
            pricePerNight: parseCurrencyNumber(room.price?.offer),
            publishedRate: Number(room.price?.actualAmount) || parseCurrencyNumber(room.price?.actual),
            taxPerNight: Number(room.price?.taxAmount) || 0,
            rateIncludesTax: Boolean(room.price?.rateIncludesTax),
            quantity: qty,
            maxQuantity: room.isCombo ? 1 : Number(room.availability) || 1,
            isCombo: Boolean(room.isCombo),
            comboRoomCount: Number(room.comboRoomCount) || 1,
            roomUnits: Math.max(1, Number(room.roomUnits || room.comboRoomCount || 1)),
            comboRooms: room.comboRooms || [],
            nights: searchSummary.nights,
            roomId: room.roomId,
            roomGroupId: room.roomGroupId,
            recommendationId: room.recommendationId,
            supplierName: room.supplierName,
            guestCode: room.guestCode,
            roomsSearchId: room.roomsSearchId || hotelDetail?.roomsSearchId || "",
            roomsSearchTracingKey: getFirstValue(
                room.roomsSearchTracingKey,
                hotelDetail?.roomsSearchTracingKey,
                searchTracingKey,
            ),
            searchTracingKey: getFirstValue(room.searchTracingKey, searchTracingKey),
            TUI: getFirstValue(room.TUI, searchTracingKey),
            occupancies: room.occupancies,
            raw: room.raw,
            rawRecommendation: room.rawRecommendation,
            rawRoomGroup: room.rawRoomGroup,
            rawCategoryRooms: room.rawCategoryRooms,
            netAmount: parseCurrencyNumber(room.price?.offer),
        }));

        writeHotelBookingSession({
            hotel: {
                id: hotelDetail?.id || "",
                name: hotelDetail?.name || "Hotel",
                address: hotelDetail?.address || "",
                rating: hotelDetail?.rating || 0,
                reviewText: hotelDetail?.reviewText || "",
                image: hotelDetail?.images?.[0] || "/images/hotelArt1.png",
            },
            request: {
                ...(hotelDetail?.request || {}),
                searchContext: storedHotelSearch,
                initResponse: storedHotelSearch.initResponse,
                hotelId: hotelDetail?.id || searchParams.get("hotelId") || "",
                hotelSearchId: getFirstValue(
                    hotelDetail?.request?.hotelSearchId,
                    storedHotelSearch.hotelSearchId,
                    storedHotelSearch.hotel_search_id,
                    searchParams.get("hotelSearchId"),
                ),
                roomsSearchId: getFirstValue(
                    selectedRooms[0]?.roomsSearchId,
                    hotelDetail?.roomsSearchId,
                    hotelDetail?.request?.roomsSearchId,
                    hotelDetail?.request?.searchId,
                    storedHotelSearch.roomsSearchId,
                    storedHotelSearch.searchId,
                    searchParams.get("searchId"),
                ),
                roomsSearchTracingKey: getFirstValue(
                    selectedRooms[0]?.roomsSearchTracingKey,
                    hotelDetail?.roomsSearchTracingKey,
                    hotelDetail?.request?.roomsSearchTracingKey,
                    hotelDetail?.request?.searchTracingKey,
                    storedHotelSearch.roomsSearchTracingKey,
                    storedHotelSearch.searchTracingKey,
                    searchParams.get("searchTracingKey"),
                    searchTracingKey,
                ),
                searchTracingKey,
                TUI: searchTracingKey,
                checkInDate: searchParams.get("checkIn") || searchParams.get("checkin") || "",
                checkOutDate: searchParams.get("checkOut") || searchParams.get("checkout") || "",
                checkIn: searchParams.get("checkIn") || searchParams.get("checkin") || "",
                checkOut: searchParams.get("checkOut") || searchParams.get("checkout") || "",
                nights: searchSummary.nights,
                rooms: searchSummary.rooms,
                adults: searchSummary.adults,
                children: searchSummary.children,
            },
            rooms: selectedRooms,
        });

        router.push("/hotel-booking");
    };

    const hotelGallery = () => {
        if (typeof window !== "undefined") {
            try {
                const raw = window.sessionStorage.getItem(HOTEL_DETAILS_KEY);
                const stored = raw ? JSON.parse(raw) : {};
                window.sessionStorage.setItem(
                    HOTEL_DETAILS_KEY,
                    JSON.stringify({
                        ...stored,
                        galleryImages:
                            hotelDetail?.galleryImages?.length
                              ? hotelDetail.galleryImages
                              : (hotelDetail?.images || stored?.galleryImages || []).map(
                                  (item, index) =>
                                    typeof item === "string"
                                      ? { image: item, title: `Photo ${index + 1}` }
                                      : item,
                                ),
                    }),
                );
            } catch {
                // Ignore storage failures and still navigate.
            }
        }
        router.push('/hotel-gallery');
    }


    const handleTabChange = (tab) => {
        setActiveTab(tab);

        sectionRefs[tab]?.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };
    return (
        <div className={styles.HotelDetaislMobileViewWrapper}>
            <div className={styles.HotelDetaislMobileViewContainer}>
                <div className={styles.HotelDetaislMobileViewImageContainer}>
                    <img className={styles.hotleImg} src={hotelDetail?.images?.[0] || "/images/hotelArt1.png"} alt="" />

                    <button className={styles.viewGalleryBtn} onClick={hotelGallery}>
                        <img className={styles.viewGalleryBtnIcon} src="/icons/dotBtn.svg" alt="" /> VIEW GALLERY
                    </button>
                    <div className={styles.HotelTopButtonsContainer}>
                        <div className={styles.HotelTopButtons}>
                            <img className={styles.rightIcon} src="/icons/right.svg" alt="" />
                        </div>
                        <div className={styles.rightButtons}>
                            <div className={styles.HotelTopButtons}>
                                <img src="/icons/mdi_heart.svg" alt="" />
                            </div>
                            <div className={styles.HotelTopButtons}>
                                <img src="/icons/share.svg" alt="" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.HotelDetailsMobileViewContent}>
                    <div className={styles.HotelDetailsMobileViewContentHeader}>
                        <h2 className={styles.hotelName}>{hotelDetail?.name || "Hotel"}</h2>
                        <div className={styles.locationAndRating}>
                            <span className={styles.hotelAddress}>{hotelDetail?.address || "Address not available"}</span>
                            <div className={styles.ratingSection}>
                                <div className={styles.stars}>
                                    {Array.from({ length: 5 }, (_, index) => (
                                        <img
                                            key={index}
                                            src={
                                                index < roundedRating
                                                    ? "/icons/tetimonialStart.svg"
                                                    : "/icons/conicstarEmpty.svg"
                                            }
                                            alt=""
                                        />
                                    ))}
                                </div>
                                <div className={styles.reviewCount}>
                                    {ratingValue ? ratingValue.toFixed(1).replace(/\.0$/, "") : "-"} ({reviewText})
                                </div>
                            </div>
                        </div>
                    </div>
                    <MobileTab

                        tabs={Object.keys(sectionRefs)}
                        activeTab={activeTab}
                        onChange={handleTabChange}
                    />
                    <div ref={sectionRefs.Description}>
                        <DescriptionComponent description={hotelDetail?.description} />
                    </div>
                    <div ref={sectionRefs.Amenities}>
                        <Amenities amenities={hotelDetail?.amenities || []} />
                    </div>
                    <div ref={sectionRefs.Rooms}>
                        <Availabilitymobile
                            maxRooms={searchSummary.rooms}
                            requiredGuests={searchSummary.adults + searchSummary.children}
                            selectedRoomQty={selectedRoomQty}
                            selectedRoomCount={selectedRoomCount}
                            selectedGuestCapacity={selectedGuestCapacity}
                            validationMessage={selectionMessage}
                            onSelectionMessage={setSelectionMessage}
                            onRoomQtyChange={setSelectedRoomQty}
                        />
                    </div>
                    <div ref={sectionRefs["HOTEL POLICY"]}>
                        <HotelPolicies
                            hotelName={hotelDetail?.name || "This hotel"}
                            policies={
                                hotelDetail?.policies?.length
                                    ? hotelDetail.policies
                                    : undefined
                            }
                        />
                    </div>
                    <div ref={sectionRefs.Reviews}>
                        <Testimonial />
                    </div>
                    <BarcelonaSection
                        city={searchCity}
                        currentHotelId={hotelDetail?.id}
                    />
                    <FeatureSection />
                    <Footer />
                    <BookingFooter
                        title={hotelPriceSummary.footerTitle}
                        amount={hotelPriceSummary.footerAmount}
                        onInfoClick={() => setShowPriceSummary(true)}
                        onContinue={handleContinueBooking}
                    />


                    <AnimatePresence mode="wait">
                        {showPriceSummary && (
                            <HotelPriceSummary
                                onClose={() => setShowPriceSummary(false)}
                                lineItems={hotelPriceSummary.lineItems}
                                totalAmount={hotelPriceSummary.totalAmount}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

export default HotelDetaislMobileView

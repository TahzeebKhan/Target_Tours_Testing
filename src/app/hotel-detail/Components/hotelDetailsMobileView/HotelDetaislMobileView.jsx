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
import { HOTEL_DETAILS_KEY } from '@/shared/services/hotelSearch'

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

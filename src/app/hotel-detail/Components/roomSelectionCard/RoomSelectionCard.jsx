"use client";

import styles from "./RoomSelectionCard.module.css";
import { CalendarDays } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import HotelCalendarMonths from "@/shared/components/hotelCalendar/HotelCalendarMonths";
import HotelDropDown from "@/shared/components/hotelDropDown/HotelDropDown";

const formatDisplayDate = (value, fallback) => {
    if (!value || value === fallback) return fallback;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const toInputDate = (value) => {
    if (!value || value === "Check-in" || value === "Check-out") return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

export default function RoomSelectionCard({
    onBookNow,
    checkingAvailability = false,
    checkIn = "Check-in",
    checkOut = "Check-out",
    rooms = 1,
    adults = 1,
    children = 0,
    initialPassengers = null,
}) {
    const cardRef = useRef(null);
    const checkInRef = useRef(null);
    const checkOutRef = useRef(null);
    const calendarRef = useRef(null);
    const [startDate, setStartDate] = useState(() => toInputDate(checkIn));
    const [endDate, setEndDate] = useState(() => toInputDate(checkOut));
    const [showCalendar, setShowCalendar] = useState(false);
    const [activeDateField, setActiveDateField] = useState("checkIn");
    const [guestDropdownOpen, setGuestDropdownOpen] = useState(false);
    const normalizeGuestState = useCallback((passengers = {}) => {
        const sourceRooms = Array.isArray(passengers.rooms) ? passengers.rooms : [];
        const roomCount = Math.max(
            1,
            Number(passengers.room || sourceRooms.length || rooms || 1),
        );
        const totalAdults = Math.max(roomCount, Number(passengers.adults || adults || 1));
        const totalChildren = Math.max(0, Number(passengers.children || children || 0));
        const baseAdults = Math.floor(totalAdults / roomCount);
        const extraAdults = totalAdults % roomCount;
        const baseChildren = Math.floor(totalChildren / roomCount);
        const extraChildren = totalChildren % roomCount;
        const fallbackChildAges = Array.isArray(passengers.childAges)
            ? passengers.childAges.map((age) => String(age || ""))
            : [];
        let childAgeCursor = 0;
        const normalizedRooms = Array.from({ length: roomCount }, (_, index) => {
            const sourceRoom = sourceRooms[index] || {};
            const childCount = sourceRooms[index]
                ? Number(sourceRoom.children || 0)
                : baseChildren + (index < extraChildren ? 1 : 0);
            const adultCount = sourceRooms[index]
                ? Number(sourceRoom.adults || 1)
                : baseAdults + (index < extraAdults ? 1 : 0);
            const directChildAges = Array.isArray(sourceRoom.childAges)
                ? sourceRoom.childAges.map((age) => String(age || "")).slice(0, childCount)
                : [];
            const childAges = directChildAges.length
                ? directChildAges
                : fallbackChildAges.slice(childAgeCursor, childAgeCursor + childCount);

            childAgeCursor += childCount;

            return {
                adults: adultCount,
                children: childCount,
                childAges,
            };
        });

        return {
            room: roomCount,
            adults: totalAdults,
            children: totalChildren,
            childAges: normalizedRooms.flatMap((room) => room.childAges),
            rooms: normalizedRooms,
            pets: Number(passengers.pets || 0),
        };
    }, [adults, children, rooms]);

    const [guestState, setGuestState] = useState(() =>
        normalizeGuestState(initialPassengers || {
            room: Number(rooms) || 1,
            adults: Number(adults) || 1,
            children: Number(children) || 0,
            pets: 0,
        }),
    );

    useEffect(() => {
        setStartDate(toInputDate(checkIn));
        setEndDate(toInputDate(checkOut));
    }, [checkIn, checkOut]);

    useEffect(() => {
        setGuestState(
            normalizeGuestState(
                initialPassengers || {
                    room: Number(rooms) || 1,
                    adults: Number(adults) || 1,
                    children: Number(children) || 0,
                    pets: 0,
                },
            ),
        );
    }, [initialPassengers, normalizeGuestState, rooms, adults, children]);

    const openCalendar = (field) => {
        setActiveDateField(field);
        setShowCalendar(true);
        setGuestDropdownOpen(false);
    };

    useEffect(() => {
        if (!showCalendar) return undefined;

        const handleClickOutside = (event) => {
            const target = event.target;

            if (
                calendarRef.current?.contains(target) ||
                checkInRef.current?.contains(target) ||
                checkOutRef.current?.contains(target)
            ) {
                return;
            }

            setShowCalendar(false);
        };

        const handleEsc = (event) => {
            if (event.key === "Escape") {
                setShowCalendar(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEsc);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, [showCalendar]);

    const handleDateClick = (date) => {
        if (activeDateField === "checkIn") {
            setStartDate(date);

            if (endDate && new Date(date) >= new Date(endDate)) {
                setEndDate(null);
                setActiveDateField("checkOut");
                return;
            }

            setActiveDateField("checkOut");
            return;
        }

        if (!startDate || new Date(date) <= new Date(startDate)) {
            setStartDate(date);
            setEndDate(null);
            setActiveDateField("checkOut");
            return;
        }

        setEndDate(date);
        setShowCalendar(false);
    };

    const totalGuests =
        Number(guestState.adults || 0) + Number(guestState.children || 0);

    const handleSelectRoom = () => {
        const roomDetails = Array.isArray(guestState.rooms) ? guestState.rooms : [];
        const childAges = roomDetails.flatMap((room) =>
            Array.isArray(room.childAges) ? room.childAges : [],
        );

        onBookNow?.({
            checkIn: startDate,
            checkOut: endDate,
            rooms: Number(guestState.room) || 1,
            adults: Number(guestState.adults) || 1,
            children: Number(guestState.children) || 0,
            childAges,
            roomDetails,
        });
    };

    return (
        <div className={styles.card} ref={cardRef}>
            <div className={styles.innerBox}>
                {/* Dates */}
                <div className={styles.datesRow}>
                    <button
                        className={styles.dateItem}
                        type="button"
                        onClick={() => openCalendar("checkIn")}
                        ref={checkInRef}
                    >
                        <div className={styles.item}>
                            <div className={styles.textCont}>
                                <CalendarDays size={24} />

                                <p className={styles.label}>CHECK-IN</p>
                            </div>
                            <p className={styles.date}>
                                <span></span>{formatDisplayDate(startDate, "Check-in")}
                            </p>

                        </div>
                    </button>

                    <div className={styles.divider}></div>

                    <button
                        className={styles.dateItem}
                        type="button"
                        onClick={() => openCalendar("checkOut")}
                        ref={checkOutRef}
                    >
                        <div className={styles.item}>
                            <div className={styles.textCont}>
                                <CalendarDays size={24} />

                                <p className={styles.label}>CHECK-OUT</p>
                            </div>
                            <p className={styles.date}>
                                <span></span>{formatDisplayDate(endDate, "Check-out")}
                            </p>

                        </div>

                    </button>
                </div>

                {/* Rooms & Guests */}
                <div
                    className={styles.roomsSection}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                        setGuestDropdownOpen((prev) => !prev);
                        setShowCalendar(false);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setGuestDropdownOpen((prev) => !prev);
                            setShowCalendar(false);
                        }
                    }}
                >
                    <p className={styles.label}>ROOMS & GUESTS</p>
                    <div className={styles.guestRoomCont}>
                        <p className={styles.roomsText}>
                            {guestState.room} ROOM{Number(guestState.room) === 1 ? "" : "S"},
                        </p>
                        <p className={styles.roomsText}>
                            {totalGuests} GUEST{Number(totalGuests) === 1 ? "" : "S"}
                        </p>
                    </div>
                    <HotelDropDown
                        open={guestDropdownOpen}
                        setOpen={setGuestDropdownOpen}
                        passengers={guestState}
                        setPassengers={setGuestState}
                    />
                </div>
            </div>

            {showCalendar && (
                <div className={styles.calendarDropdown} ref={calendarRef}>
                    <HotelCalendarMonths
                        startDate={startDate}
                        endDate={endDate}
                        onDateClick={handleDateClick}
                    />
                </div>
            )}

            {/* Button */}
            <button
                className={styles.selectBtn}
                type="button"
                onClick={handleSelectRoom}
                disabled={checkingAvailability}
            >
                {checkingAvailability ? "CHECKING..." : "CHECK ROOM"}
            </button>
        </div>
    );
}

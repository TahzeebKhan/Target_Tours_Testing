"use client"
import React, { useMemo } from 'react'
import styles from './AvailabilityMobile.module.css'
import { useHotelDetailData } from '../../../HotelDetailDataContext'

const FALLBACK_ROOM_IMAGE = "/images/hotelArt1.png";

const getRoomImage = (room) => {
    if (Array.isArray(room?.image)) {
        const firstImage = room.image.find((item) => item?.img || item?.image);
        return firstImage?.img || firstImage?.image || FALLBACK_ROOM_IMAGE;
    }

    return room?.image || FALLBACK_ROOM_IMAGE;
};

const getFacilityText = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;

    return item.text || item.name || item.label || item.description || item.value || "";
};

const normalizeFeatureItems = (items = []) =>
    items
        .map((item) => ({
            icon: item?.icon || "/icons/greenTick.svg",
            text: String(getFacilityText(item)).trim(),
        }))
        .filter((item) => item.text);

const getRoomFeatureItems = (room) => {
    const facilities = normalizeFeatureItems([
        ...(Array.isArray(room?.featuresLeft) ? room.featuresLeft : []),
        ...(Array.isArray(room?.facilities) ? room.facilities : []),
        ...(Array.isArray(room?.raw?.facilities) ? room.raw.facilities : []),
        ...(Array.isArray(room?.raw?.amenities) ? room.raw.amenities : []),
        ...(Array.isArray(room?.raw?.room?.facilities) ? room.raw.room.facilities : []),
        ...(Array.isArray(room?.raw?.room?.amenities) ? room.raw.room.amenities : []),
    ]);
    const benefits = normalizeFeatureItems([
        ...(Array.isArray(room?.benefits) ? room.benefits : []),
        room?.cancellation,
    ]);
    const seen = new Set();

    return [...facilities, ...benefits]
        .filter((item) => {
            const key = item.text.replace(/[^a-z0-9]/gi, "").toLowerCase();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .slice(0, 6);
};

const Availabilitymobile = ({
    maxRooms = 1,
    requiredGuests = 1,
    selectedRoomQty = {},
    selectedRoomCount = 0,
    selectedGuestCapacity = 0,
    validationMessage = "",
    onSelectionMessage,
    onRoomQtyChange,
}) => {
    const { hotelDetail, roomsLoading } = useHotelDetailData();
    const maxRoomCount = Math.max(1, Number(maxRooms || 1));
    const isAtMaxRooms = selectedRoomCount >= maxRoomCount;

    const handleAddRoom = (id) => {
        if (isAtMaxRooms) {
            onSelectionMessage?.(`You searched for ${maxRoomCount} room${maxRoomCount === 1 ? "" : "s"} only.`);
            return;
        }

        onSelectionMessage?.("");
        onRoomQtyChange?.((prev) => ({ ...prev, [id]: 1 }));
    };

    const increase = (id) => {
        if (isAtMaxRooms) {
            onSelectionMessage?.(`You searched for ${maxRoomCount} room${maxRoomCount === 1 ? "" : "s"} only.`);
            return;
        }

        onSelectionMessage?.("");
        onRoomQtyChange?.((prev) => ({ ...prev, [id]: Number(prev[id] || 0) + 1 }));
    };

    const decrease = (id) => {
        onSelectionMessage?.("");
        onRoomQtyChange?.((prev) => {
            const current = Number(prev[id] || 0);

            if (current <= 1) {
                const next = { ...prev };
                delete next[id];
                return next;
            }

            return { ...prev, [id]: current - 1 };
        });
    };

    const rooms = useMemo(
        () =>
        
            (hotelDetail?.rooms || []).map((room, index) => ({
                id: room?.id || `${room?.title || "room"}-${index}`,
                image: getRoomImage(room),
                title: room?.title || "Room",
                beds: room?.beds || "Room",
                persons: room?.persons || "Guests",
                price: room?.price?.offer || "₹ 0",
                nights: room?.price?.nights || "per night",
                taxes: room?.price?.taxes || "",
                features: getRoomFeatureItems(room),
            })),
        [hotelDetail?.rooms],
    );

    return (
        <div className={styles.availabilityMobileWrapper}>
            <div className={styles.availabilityMobileContainer}>
                <h2 className={styles.availabilityMobileTitle}>Availability</h2>
                {(validationMessage || selectedRoomCount > 0) && (
                    <div className={validationMessage ? styles.validationMessage : styles.selectionMeta}>
                        {validationMessage ||
                            `${selectedRoomCount}/${maxRoomCount} room${maxRoomCount === 1 ? "" : "s"} selected • Capacity ${selectedGuestCapacity}/${requiredGuests} guest${requiredGuests === 1 ? "" : "s"}`}
                    </div>
                )}

                <div className={styles.availabilityMobileCardContainer}>
                    {roomsLoading && !rooms.length && (
                        <div className={styles.emptyState}>Loading room availability...</div>
                    )}

                    {!roomsLoading && !rooms.length && (
                        <div className={styles.emptyState}>No rooms available</div>
                    )}

                    {rooms.map((room) => {
                        const qty = selectedRoomQty[room.id];
                        const disableAdd = !qty && isAtMaxRooms;
                        const disableIncrease = isAtMaxRooms;

                        return (
                            <div className={styles.Card} key={room.id}>
                                <div className={styles.cardLeft}>
                                    <div className={styles.cardLeftTop}>
                                        <div className={styles.cardLeftTopImage}>
                                            <img src={room.image} alt="" />
                                        </div>

                                        <div className={styles.cardLeftTopTextCont}>
                                            <h3 className={styles.hotelName}>{room.title}</h3>

                                            <div className={styles.bedMainCont}>
                                                <div className={styles.bedCount}>
                                                    <img
                                                        className={styles.bedIcon}
                                                        src="/icons/bedIcon.svg"
                                                        alt=""
                                                    />
                                                    <span>{room.beds}</span>
                                                    <span>X</span>
                                                </div>
                                                <span className={styles.persons}>{room.persons}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.cardLeftBottom}>
                                        <div className={styles.featureSec}>
                                            <ul className={styles.featureList}>
                                                {room.features.map((item, idx) => (
                                                   
                                                    <li key={idx}>
                                                        <div className={styles.iconCont}>
                                                            <img src={item.icon} alt={item.text} />
                                                        </div>
                                                        {item.text}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>


                                <div className={styles.cardRight}>

                                <div className={styles.br}></div>
                                    <div className={styles.priceContainer}>
                                        <div className={styles.priceTop}>
                                            <span className={styles.price}>{room.price}</span>
                                            <span className={styles.nights}>{room.nights}</span>
                                            <span className={styles.taxes}>{room.taxes}</span>
                                        </div>

                                        <div className={styles.priceBottom}>
                                            {!qty ? (
                                                <button
                                                    className={`${styles.addRoomBtn} ${disableAdd ? styles.disabledBtn : ""}`}
                                                    disabled={disableAdd}
                                                    onClick={() => handleAddRoom(room.id)}
                                                >
                                                    ADD ROOM
                                                </button>
                                            ) : (
                                                <div className={styles.counter}>
                                                    <button
                                                        className={styles.btn}
                                                        onClick={() => decrease(room.id)}
                                                    >
                                                        −
                                                    </button>
                                                    <span className={styles.count}>{qty}</span>
                                                    <button
                                                        className={`${styles.btn} ${disableIncrease ? styles.disabledBtn : ""}`}
                                                        disabled={disableIncrease}
                                                        onClick={() => increase(room.id)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Availabilitymobile

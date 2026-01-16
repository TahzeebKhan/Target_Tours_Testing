"use client"
import React, { useState } from 'react'
import styles from './AvailabilityMobile.module.css'

const Availabilitymobile = () => {


    // 🔑 qty per room
    const [roomQty, setRoomQty] = useState({});

    const handleAddRoom = (id) => {
        setRoomQty((prev) => ({ ...prev, [id]: 1 }));
    };

    const increase = (id) => {
        setRoomQty((prev) => ({ ...prev, [id]: prev[id] + 1 }));
    };

    const decrease = (id) => {
        setRoomQty((prev) =>
            prev[id] > 1 ? { ...prev, [id]: prev[id] - 1 } : prev
        );
    };

    const rooms = [
        {
            id: 1,
            image: "/images/hotelImage1.png",
            title: "Deluxe Private AC Room with Ensuite Bathroom",
            beds: "2 Single bed",
            persons: "2 persons",
            price: "₹ 66,945",
            nights: "x 5 night",
            taxes: "+ ₹ 226 Taxes & fees",
            features: [
                { icon: "/icons/arrows-expand.svg", text: "30 m2" },
                { icon: "/icons/no-smoking.svg", text: "No Smoking" },
                { icon: "/icons/greenTick.svg", text: "Breakfast" },
                { icon: "/icons/bedIcon.svg", text: "1 King Bed" },
                { icon: "/icons/greenTick.svg", text: "Valley View" },
                { icon: "/icons/greenTick.svg", text: "Free Wifi" },
            ],
        },
        {
            id: 2,
            image: "/images/hotelImage2.png",
            title: "Deluxe Private AC Room with Ensuite Bathroom",
            beds: "2 Single bed",
            persons: "2 persons",
            price: "₹ 66,945",
            nights: "x 5 night",
            taxes: "+ ₹ 226 Taxes & fees",
            features: [
                { icon: "/icons/arrows-expand.svg", text: "28 m2" },
                { icon: "/icons/no-smoking.svg", text: "No Smoking" },
                { icon: "/icons/greenTick.svg", text: "Breakfast Included" },
                { icon: "/icons/bedIcon.svg", text: "1 Queen Bed" },
                { icon: "/icons/greenTick.svg", text: "City View" },
                { icon: "/icons/greenTick.svg", text: "Free Wifi" },
            ],
        },
        {
            id: 2,
            image: "/images/hotelImage3.png",
            title: "Deluxe Private AC Room with Ensuite Bathroom",
            beds: "2 Single bed",
            persons: "2 persons",
            price: "₹ 66,945",
            nights: "x 5 night",
            taxes: "+ ₹ 226 Taxes & fees",
            features: [
                { icon: "/icons/arrows-expand.svg", text: "28 m2" },
                { icon: "/icons/no-smoking.svg", text: "No Smoking" },
                { icon: "/icons/greenTick.svg", text: "Breakfast Included" },
                { icon: "/icons/bedIcon.svg", text: "1 Queen Bed" },
                { icon: "/icons/greenTick.svg", text: "City View" },
                { icon: "/icons/greenTick.svg", text: "Free Wifi" },
            ],
        },
    ];

    return (
        <div className={styles.availabilityMobileWrapper}>
            <div className={styles.availabilityMobileContainer}>
                <h2 className={styles.availabilityMobileTitle}>Availability</h2>

                <div className={styles.availabilityMobileCardContainer}>
                    {rooms.map((room) => {
                        const qty = roomQty[room.id];

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

                                <div className={styles.br}></div>

                                <div className={styles.cardRight}>
                                    <div className={styles.priceContainer}>
                                        <div className={styles.priceTop}>
                                            <span className={styles.price}>{room.price}</span>
                                            <span className={styles.nights}>{room.nights}</span>
                                            <span className={styles.taxes}>{room.taxes}</span>
                                        </div>

                                        <div className={styles.priceBottom}>
                                            {!qty ? (
                                                <button
                                                    className={styles.addRoomBtn}
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
                                                        className={styles.btn}
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
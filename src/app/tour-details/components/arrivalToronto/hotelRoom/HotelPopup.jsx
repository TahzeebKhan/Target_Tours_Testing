"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./HotelRoom.module.css";

const HotelPopup = ({ isOpen, hotel, onClose }) => {
    const [selected, setSelected] = useState([]);

    const getImageUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        return `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`;
    };

    const getHotelImage = (item) => {
        const image = Array.isArray(item?.main_image)
            ? item.main_image[0]
            : item?.main_image;
        const url =
            image?.formats?.large?.url ||
            image?.formats?.small?.url ||
            image?.formats?.thumbnail?.url ||
            image?.url;

        return getImageUrl(url);
    };

    const hotels = hotel?.availableHotels?.length
        ? hotel.availableHotels.map((item) => ({
            title: [item?.name, item?.city].filter(Boolean).join(", ") || "N/A",
            description: item?.description || item?.hotel_category || "N/A",
            images: [getHotelImage(item) || hotel?.images?.[0]],
        }))
        : hotel?.options?.length
            ? hotel.options
            : [hotel];
    const selectedIndex = selected[0] ?? 0;
    const selectedHotel = hotels[selectedIndex] || hotel;

    useEffect(() => {
        if (isOpen) {
            setSelected([]);
        }
    }, [isOpen, hotel]);

    return (
        <AnimatePresence>
            {isOpen && hotel && (
                <motion.div
                    className={styles.popupOverlay}
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className={styles.popupCard}
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, y: -40, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -40, height: 0 }}
                        transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
                    >
                        {/* HEADER */}
                        <div className={styles.popupHeader}>
                            {/* <h4>Your Hotel Options{hotel?.title ? ` — ${hotel.title}` : ' Toronto, Canada'}</h4> */}
                            <h4>Your Hotel Options
{hotel?.location || ""}</h4>
                            <button onClick={onClose} className={styles.closeBtn}>✕</button>
                        </div>

                        {/* CONTENT */}
                        <div className={styles.popupContent}>
                            {/* RIGHT SIDE */}
                            <div className={styles.popupRight}>
                                {hotels.map((item, index) => (
                                    <div key={index} className={styles.itemWrapper}>
                                        {/* CLICKABLE ROW */}
                                        <div
                                            className={`${styles.item} ${selected.includes(index) ? styles.activeItem : ""
                                                }`}
                                            onClick={() =>
                                                setSelected((prev) =>
                                                    prev.includes(index)
                                                        ? []
                                                        : [index]
                                                )
                                            }
                                        >
                                            <h3 className={styles.title}>{item.title}</h3>
                                            <div
                                                className={`${styles.radio} ${selected.includes(index) ? styles.active : ""
                                                    }`}
                                            />
                                        </div>

                                        {/* DESCRIPTION (accordion) */}
                                        <AnimatePresence>
                                            {selected.includes(index) && (
                                                <motion.p
                                                    className={`${styles.itemDescription} ${selected.includes(index) ? styles.activeItemDex : ""}`}
                                                    initial={{ height: 0 }}
                                                    animate={{ height: "auto" }}
                                                    exit={{ height: 0 }}
                                                    transition={{ duration: 0.1, ease: "easeOut" }}
                                                >
                                                    {item.description}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}

                                <button className={styles.confirmBtn} onClick={onClose}>confirm</button>
                            </div>

                            {/* LEFT IMAGE */}
                            <div className={styles.popupLeft}>
                                <img src={selectedHotel.images?.[0] ?? hotel.images?.[0]} alt={selectedHotel.title ?? hotel.title} />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default HotelPopup;

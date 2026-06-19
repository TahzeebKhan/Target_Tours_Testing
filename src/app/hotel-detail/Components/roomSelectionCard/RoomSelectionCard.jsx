"use client";

import styles from "./RoomSelectionCard.module.css";
import { CalendarDays } from "lucide-react";

export default function RoomSelectionCard({
    onBookNow,
    checkIn = "Check-in",
    checkOut = "Check-out",
    rooms = 1,
    adults = 1,
}) {
    return (
        <div className={styles.card}>
            <div className={styles.innerBox}>
                {/* Dates */}
                <div className={styles.datesRow}>
                    <div className={styles.dateItem}>
                        <div className={styles.item}>
                            <div className={styles.textCont}>
                                <CalendarDays size={24} />

                                <p className={styles.label}>CHECK-IN</p>
                            </div>
                            <p className={styles.date}> <span></span>{checkIn}</p>

                        </div>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.dateItem}>
                        <div className={styles.item}>
                            <div className={styles.textCont}>
                                <CalendarDays size={24} />

                                <p className={styles.label}>CHECK-OUT</p>
                            </div>
                            <p className={styles.date}> <span></span>{checkOut}</p>

                        </div>

                    </div>
                </div>

                {/* Rooms & Guests */}
                <div className={styles.roomsSection}>
                    <p className={styles.label}>ROOMS & GUESTS</p>
                    <div className={styles.guestRoomCont}>
                        <p className={styles.roomsText}>{rooms} ROOM{Number(rooms) === 1 ? "" : "S"},</p>
                        <p className={styles.roomsText}>{adults} ADULT{Number(adults) === 1 ? "" : "S"}</p>
                    </div>
                </div>
            </div>

            {/* Button */}
            <button className={styles.selectBtn} onClick={onBookNow}>SELECT ROOM</button>
        </div>
    );
}

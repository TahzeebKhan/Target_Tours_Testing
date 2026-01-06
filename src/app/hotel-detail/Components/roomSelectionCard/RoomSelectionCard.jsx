"use client";

import styles from "./RoomSelectionCard.module.css";
import { CalendarDays } from "lucide-react";

export default function RoomSelectionCard({onBookNow}) {
    return (
        <div className={styles.card}>
            <div className={styles.innerBox}>
                {/* Dates */}
                <div className={styles.datesRow}>
                    <div className={styles.dateItem}>
                        <div className={styles.item}>
                            <div className={styles.textCont}>
                                <CalendarDays size={20} />

                                <p className={styles.label}>CHECK-IN</p>
                            </div>
                            <p className={styles.date}>08/14/2025</p>

                        </div>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.dateItem}>
                        <div className={styles.item}>
                            <div className={styles.textCont}>
                                <CalendarDays size={20} />

                                <p className={styles.label}>CHECK-OUT</p>
                            </div>
                            <p className={styles.date}>08/19/2025</p>

                        </div>

                    </div>
                </div>

                {/* Rooms & Guests */}
                <div className={styles.roomsSection}>
                    <p className={styles.label}>ROOMS & GUESTS</p>
                    <div className={styles.guestRoomCont}>
                        <p className={styles.roomsText}>1 ROOM,</p>
                        <p className={styles.roomsText}>2 ADULTS</p>
                    </div>
                </div>
            </div>

            {/* Button */}
            <button className={styles.selectBtn} onClick={onBookNow}>SELECT ROOM</button>
        </div>
    );
}

"use client";
import styles from "./Amenities.module.css";
import {
    Wind, Wifi, Car, Utensils, Phone, Users, Sparkles,
    Droplet, Flame, Package, Scissors,
    Waves, Dumbbell, Smile, Gamepad2,
    ArrowUpDown
} from "lucide-react";

const ICONS = {
    ac: Wind,
    wifi: Wifi,
    parking: Car,
    restaurant: Utensils,
    phone: Phone,
    desk: Users,
    cleaning: Sparkles,
    elevator: ArrowUpDown,   // ✅ FIXED
    shower: Droplet,
    hotwater: Flame,
    toiletries: Package,
    dryer: Scissors,
    pool: Waves,
    gym: Dumbbell,
    kids: Smile,
    game: Gamepad2,
};




const Amenities = () => {
    const amenitiesData = [
        {
            title: "General",
            items: [
                { icon: "ac", label: "Air conditioning" },
                { icon: "wifi", label: "Free WiFi" },
                { icon: "parking", label: "Free Parking" },
                { icon: "restaurant", label: "Restaurant" },
                { icon: "phone", label: "Room service" },
                { icon: "desk", label: "24-hour front desk" },
                { icon: "cleaning", label: "Daily housekeeping" },
                { icon: "elevator", label: "Elevator" },
            ],
        },
        {
            title: "Bathroom",
            items: [
                { icon: "shower", label: "Shower" },
                { icon: "shower", label: "Hot water" },
                { icon: "parking", label: "Complimentary toiletries" },
                { icon: "restaurant", label: "Hair dryer" },
            ],
        },
        {
            title: "Activities",
            items: [
                { icon: "pool", label: "Swimming pool" },
                { icon: "gym", label: "Fitness center" },
                { icon: "kids", label: "Kids club" },
                { icon: "game", label: "Game room" },
            ],
        },
    ];
    return (
        <section className={styles.section}>
            <h2 className={styles.heading}>Amenities</h2>

            {amenitiesData.map((group) => (
                <div key={group.title} className={styles.group}>
                    <h3 className={styles.groupTitle}>{group.title}</h3>

                    <div className={styles.grid}>
                        {group.items.map((item) => {
                            const Icon = ICONS[item.icon];
                            if (!Icon) return null; // 👈 safety

                            return (
                                <div key={item.label} className={styles.item}>
                                    <div className={styles.iconBox}>
                                        <Icon size={20} />
                                    </div>
                                    <span>{item.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </section>
    );
};

export default Amenities;

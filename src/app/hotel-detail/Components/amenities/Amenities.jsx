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
    elevator: ArrowUpDown,
    shower: Droplet,
    hotwater: Flame,
    toiletries: Package,
    dryer: Scissors,
    pool: Waves,
    gym: Dumbbell,
    kids: Smile,
    game: Gamepad2,
};

const getAmenityIcon = (label = "") => {
    const normalized = label.toLowerCase();
    if (normalized.includes("wifi") || normalized.includes("internet")) return "wifi";
    if (normalized.includes("parking")) return "parking";
    if (normalized.includes("restaurant") || normalized.includes("breakfast") || normalized.includes("food")) return "restaurant";
    if (normalized.includes("elevator") || normalized.includes("lift")) return "elevator";
    if (normalized.includes("pool") || normalized.includes("spa")) return "pool";
    if (normalized.includes("laundry")) return "cleaning";
    if (normalized.includes("disability") || normalized.includes("accessible")) return "desk";
    if (normalized.includes("air") || normalized.includes("conditioning")) return "ac";
    return "desk";
};

const getAmenityLabel = (amenity) => {
    if (!amenity) return "";
    if (typeof amenity === "string") return amenity;

    return (
        amenity.name ||
        amenity.label ||
        amenity.description ||
        amenity.value ||
        amenity.text ||
        ""
    );
};

const Amenities = ({ amenities = [] }) => {
    const seenAmenities = new Set();
    const amenityItems = (Array.isArray(amenities) ? amenities : [])
        .map(getAmenityLabel)
        .map((label) => String(label || "").trim())
        .filter(Boolean)
        .filter((label) => {
            const key = label.toLowerCase().replace(/[^a-z0-9]/g, "");
            if (!key || seenAmenities.has(key)) return false;

            seenAmenities.add(key);
            return true;
        })
        .map((label) => ({ icon: getAmenityIcon(label), label }));

    if (!amenityItems.length) return null;

    const amenitiesData = [
        {
            title: "General",
            items: amenityItems,
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
                            if (!Icon) return null;

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

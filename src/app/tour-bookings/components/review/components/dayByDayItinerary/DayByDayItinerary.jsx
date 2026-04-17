import React from 'react'
import styles from './DayByDayItinerary.module.css'

const countLabel = (count, label) =>
    count > 0 ? `${count} ${label}${count > 1 ? "s" : ""}` : null;

const hasHotelId = (hotel) =>
    hotel?.hotel_id !== undefined &&
    hotel?.hotel_id !== null &&
    String(hotel.hotel_id).trim() !== "";

const getEnabledItems = (items = []) =>
    Array.isArray(items) ? items.filter((item) => item?.enabled !== false) : [];

const getBuilderTags = (day = {}) => {
    const builderData = day?.builder_data || {};
    const transports = getEnabledItems(builderData?.transports);
    const flightCount = transports.filter((transport) => transport?.mode === "flight").length;
    const transferCount = transports.filter((transport) => transport?.mode !== "flight").length;
    const hotelCount = Array.isArray(builderData?.hotels)
        ? builderData.hotels.filter(hasHotelId).length
        : hasHotelId(builderData?.hotel)
            ? 1
            : 0;
    const mealCount = Array.isArray(builderData?.meals?.selected)
        ? builderData.meals.selected.filter(Boolean).length
        : Array.isArray(day?.package_itinerarie_meals)
            ? day.package_itinerarie_meals.filter(Boolean).length
            : 0;
    const activities = Array.isArray(day?.package_activities) && day.package_activities.length
        ? day.package_activities
        : builderData?.activities;
    const activityCount = getEnabledItems(activities).length;

    return [
        countLabel(flightCount, "Flight"),
        countLabel(hotelCount, "Hotel"),
        countLabel(mealCount, "Meal"),
        countLabel(transferCount, "Transfer"),
        countLabel(activityCount, "Activity"),
    ].filter(Boolean);
};

const normalizeDay = (day, index) => {
    const tags = getBuilderTags(day);

    return {
        day: day?.day || day?.day_number || index + 1,
        title: day?.title || day?.name || day?.heading || "Tour day",
        description: day?.description || day?.details || "",
        tags,
        highlights: Array.isArray(day?.highlights) ? day.highlights : [],
    };
};

const DayByDayItinerary = ({ itinerary = [] }) => {

    const itineraryData = {
        itinerary: Array.isArray(itinerary) && itinerary.length > 0 ? itinerary.map(normalizeDay) : [
            {
                "day": 1,
                "title": "Arrival in Toronto",
                "meta": {
                    "flight": 1,
                    "hotel": 1,
                    "meal": 1,
                    "transfer": 1
                },
                "description": "Arrive at the destination airport. Meet and greet with your tour guide. Transfer to your luxury hotel. Evening orientation walk through the main city attractions.",
                "tags": ["1 Flight", "1 Hotel", "1 Meal", "1 Transfer"],
                "highlights": [
                    "Welcome dinner included",
                    "Hotel check-in by 2 PM"
                ]
            },
            {
                "day": 2,
                "title": "Cultural Exploration",
                "meta": {
                    "flight": 1,
                    "hotel": 1,
                    "meal": 1,
                    "transfer": 1
                },
                "description": "Full day guided tour of historical landmarks and cultural sites. Visit museums, temples, and local markets. Experience authentic local cuisine at a traditional restaurant.",
                "tags": ["1 Flight", "1 Hotel", "1 Meal", "1 Transfer"],
                "highlights": [
                    "Welcome dinner included",
                    "Hotel check-in by 2 PM"
                ]
            },
            {
                "day": 3,
                "title": "Adventure Activities",
                "meta": {
                    "flight": 1,
                    "hotel": 1,
                    "meal": 1,
                    "transfer": 1
                },
                "description": "Morning adventure activities including hiking or water sports. Afternoon at leisure to explore on your own or relax at the hotel spa. Optional evening entertainment show.",
                "tags": ["1 Flight", "1 Hotel", "1 Meal", "1 Transfer"],
                "highlights": [
                    "Welcome dinner included",
                    "Hotel check-in by 2 PM"
                ]
            },
            {
                "day": 4,
                "title": "Departure",
                "meta": {
                    "flight": 1,
                    "hotel": 1,
                    "meal": 1,
                    "transfer": 1
                },
                "description": "Enjoy a leisurely breakfast at the hotel. Free time for last-minute shopping or sightseeing. Transfer to airport for your departure flight with wonderful memories.",
                "tags": ["1 Flight", "1 Hotel", "1 Meal", "1 Transfer"],
                "highlights": [
                    "Welcome dinner included",
                    "Hotel check-in by 2 PM"
                ]
            }
        ]
    };
    return (
        <div className={styles.wrapper}>
            {itineraryData.itinerary.map((day) => (
                <div key={day.day} className={styles.container}>
                    {/* LEFT TIMELINE */}
                    <div className={styles.timeline}>
                        <div className={styles.circle}>{day.day}</div>
                        <div className={styles.line}></div>
                    </div>

                    {/* CONTENT */}
                    <div className={styles.content}>
                        {/* HEADER */}
                        <div className={styles.header}>
                            <h3 className={styles.title}>Day {day.day} – {day.title}</h3>
                            <span className={styles.meta}>
                                {day.tags?.join(", ")}
                            </span>
                        </div>

                        <div className={styles.divider}></div>

                        {/* DESCRIPTION */}
                        <p className={styles.description}>
                            {day.description}
                        </p>

                        {/* BULLETS */}
                        <ul className={styles.bullets}>
                            {day.highlights.map((highlight, index) => (
                                <li key={index}>{highlight}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default DayByDayItinerary

import React from 'react'
import styles from './DayByDayItinerary.module.css'

const DayByDayItinerary = () => {

    const itineraryData = {
        itinerary: [
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
                "highlights": [
                    "Welcome dinner included",
                    "Hotel check-in by 2 PM"
                ]
            }
        ]
    };
    return (
        <div className={styles.wrapper}>
            {itineraryData.itinerary.map(day => (
                <div className={styles.container}>
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
                                {day.meta.flight} Flight, {day.meta.hotel} Hotel, {day.meta.meal} Meal, {day.meta.transfer} Transfer
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

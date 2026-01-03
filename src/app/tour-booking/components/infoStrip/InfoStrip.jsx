import React from 'react'
import styles from './InfoStrip.module.css'

const InfoStrip = () => {
    const infoData = [
        {
            "id": "minimum_age",
            "title": "MINIMUM AGE",
            "description": "Minimum age is 10 years old",
            "icon": "user.svg"
        },
        {
            "id": "first_group_event",
            "title": "FIRST GROUP EVENT",
            "description": "Welcome briefing at 8:30 a.m. on Day 2",
            "icon": "calendarPlane.svg"
        },
        {
            "id": "last_group_event",
            "title": "LAST GROUP EVENT",
            "description": "End of sightseeing 5:00 p.m. on Day 13",
            "icon": "calendarPlane.svg"
        },
        {
            "id": "guaranteed_departures",
            "title": "GUARANTEED DEPARTURES",
            "description": "Departures are guaranteed to operate with a minimum of 2 guests",
            "icon": "departure.svg"
        },
        {
            "id": "remote_travel",
            "title": "REMOTE TRAVEL",
            "description": "This journey includes extended drives",
            "icon": "mountain.svg"
        }
    ]

    return (
        <section className={styles.infoStrip}>
            <div className={styles.container}>
                {infoData.map((item) => (
                    <div className={styles.infoItem}>
                        <img
                            src={`/icons/${item.icon}`}
                            className={styles.icon}
                            alt={item.title}
                        />
                        <h4 className={styles.title}>{item.title}</h4>
                        <p className={styles.desc}>{item.description}</p>
                    </div>
                ))}

            </div>
        </section>
    )
}

export default InfoStrip
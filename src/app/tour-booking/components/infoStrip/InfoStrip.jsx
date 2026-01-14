// import React from 'react'
// import styles from './InfoStrip.module.css'

// const InfoStrip = () => {
//     const infoData = [
//         {
//             "id": "minimum_age",
//             "title": "MINIMUM AGE",
//             "description": "Minimum age is 10 years old",
//             "icon": "user.svg"
//         },
//         {
//             "id": "first_group_event",
//             "title": "FIRST GROUP EVENT",
//             "description": "Welcome briefing at 8:30 a.m. on Day 2",
//             "icon": "calendarPlane.svg"
//         },
//         {
//             "id": "last_group_event",
//             "title": "LAST GROUP EVENT",
//             "description": "End of sightseeing 5:00 p.m. on Day 13",
//             "icon": "calendarPlane.svg"
//         },
//         {
//             "id": "guaranteed_departures",
//             "title": "GUARANTEED DEPARTURES",
//             "description": "Departures are guaranteed to operate with a minimum of 2 guests",
//             "icon": "departure.svg"
//         },
//         {
//             "id": "remote_travel",
//             "title": "REMOTE TRAVEL",
//             "description": "This journey includes extended drives",
//             "icon": "mountain.svg"
//         }
//     ]

//     return (
//         <section className={styles.infoStrip}>
//             <div className={styles.container}>
//                 {infoData.map((item) => (
//                     <div className={styles.infoItem}>
//                         <img
//                             src={`/icons/${item.icon}`}
//                             className={styles.icon}
//                             alt={item.title}
//                         />
//                         <h4 className={styles.title}>{item.title}</h4>
//                         <p className={styles.desc}>{item.description}</p>
//                     </div>
//                 ))}

//             </div>
//         </section>
//     )
// }

// export default InfoStrip

import React from 'react'
import styles from './InfoStrip.module.css'

const InfoStrip = () => {
    return (
        <section className={styles.infoStrip}>
            <div className={styles.container}>

                <div className={styles.infoItem}>
                    <img
                        src="/icons/user.svg"
                        className={styles.icon}
                        alt="MINIMUM AGE"
                    />
                    <h4 className={styles.title}>MINIMUM AGE</h4>
                    <p className={styles.desc}>Minimum age is 10 years old</p>
                </div>

                <div className={styles.infoItem}>
                    <img
                        src="/icons/calendarPlane.svg"
                        className={styles.icon}
                        alt="FIRST GROUP EVENT"
                    />
                    <h4 className={styles.title}>FIRST GROUP EVENT</h4>
                    <p className={styles.desc}>
                        Welcome briefing at 8:30 a.m. on Day 2
                    </p>
                </div>

                <div className={styles.infoItem}>
                    <img
                        src="/icons/calendarPlane.svg"
                        className={styles.icon}
                        alt="LAST GROUP EVENT"
                    />
                    <h4 className={styles.title}>LAST GROUP EVENT</h4>
                    <p className={styles.desc}>
                        End of sightseeing 5:00 p.m. on Day 13
                    </p>
                </div>

                <div className={styles.infoItem}>
                    <img
                        src="/icons/departure.svg"
                        className={styles.icon}
                        alt="GUARANTEED DEPARTURES"
                    />
                    <h4 className={styles.title}>GUARANTEED DEPARTURES</h4>
                    <p className={styles.desc}>
                        Departures are guaranteed to operate with a minimum of 2 guests
                    </p>
                </div>

                <div className={styles.infoItem}>
                    <img
                        src="/icons/mountain.svg"
                        className={styles.icon}
                        alt="REMOTE TRAVEL"
                    />
                    <h4 className={styles.title}>REMOTE TRAVEL</h4>
                    <p className={styles.desc}>
                        This journey includes extended drives
                    </p>
                </div>

            </div>


            <div className={styles.containerPhoneView}>

                <div className={styles.pareContainer}>
                    <div className={styles.infoItem}>
                        <img
                            src="/icons/user.svg"
                            className={styles.icon}
                            alt="MINIMUM AGE"
                        />
                        <h4 className={styles.title}>MINIMUM AGE</h4>
                        <p className={styles.desc}>Minimum age is 10 years old</p>
                    </div>

                    <div className={styles.infoItem}>
                        <img
                            src="/icons/calendarPlane.svg"
                            className={styles.icon}
                            alt="FIRST GROUP EVENT"
                        />
                        <h4 className={styles.title}>FIRST GROUP EVENT</h4>
                        <p className={styles.desc}>
                            Welcome briefing at 8:30 a.m. on Day 2
                        </p>
                    </div>
                </div>

                <div className={styles.pareContainer}>
                    <div className={styles.infoItem}>
                        <img
                            src="/icons/calendarPlane.svg"
                            className={styles.icon}
                            alt="LAST GROUP EVENT"
                        />
                        <h4 className={styles.title}>LAST GROUP EVENT</h4>
                        <p className={styles.desc}>
                            End of sightseeing 5:00 p.m. on Day 13
                        </p>
                    </div>

                    <div className={styles.infoItem}>
                        <img
                            src="/icons/mountain.svg"
                            className={styles.icon}
                            alt="REMOTE TRAVEL"
                        />
                        <h4 className={styles.title}>REMOTE TRAVEL</h4>
                        <p className={styles.desc}>
                            This journey includes extended drives
                        </p>
                    </div>



                </div>
                <div className={styles.pareContainerLast}>
                    <div className={styles.infoItem}>
                    <img
                        src="/icons/departure.svg"
                        className={styles.icon}
                        alt="GUARANTEED DEPARTURES"
                    />
                    <h4 className={styles.title}>GUARANTEED DEPARTURES</h4>
                    <p className={styles.desc}>
                        Departures are guaranteed to operate with a minimum of 2 guests
                    </p>
                </div>
                </div>


            </div>
        </section>
    )
}

export default InfoStrip

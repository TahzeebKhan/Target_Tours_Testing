import React from 'react'
import styles from './PassengerDetailsMobile.module.css'
import FlightTimeline from '../components/flightTimeline/FlightTimeline';
import FlightTabs from '../components/FlightTabs/FlightTabs';
import FlightSection from '../components/FlightSection/FlightSection';
const PassengerDetailsMobile = () => {

    const flight = {
        departure: {
            date: "THU, 18 DEC 2025",
            time: "06:45",
            airport: "DEL - DELHI",
            terminal: "Terminal T2",
            city: "Delhi, India",
        },

        arrival: {
            date: "THU, 18 DEC 2025",
            time: "08:00",
            airport: "HKT - PHUKET CITY",
            terminal: "Terminal T3",
            city: "Phuket City, Thailand",
        },

        duration: {
            hours: 1,
            minutes: 50,
        },

        stops: "1 Stop",
    };


    return (
        <div className={styles.container}>
            <div className={styles.tripDetailsContainer}>
                <div className={styles.tripDetailsHeader}>
                    <img src="/icons/leftArrowTrip.svg" alt="" />
                    <p className={styles.tripDetails}>Trip Details</p>
                </div>
            </div>

            <div className={styles.TripCardContainer}>
                <div className={styles.TripCard}>
                    <div className={styles.TripCardHeader}>
                        <div className={styles.TripCardHeaderDetails}>
                            <p className={styles.TripCardHeaderDetailsItemText}>New Delhi</p>
                            <span className={styles.TripCardHeaderDetailsItemCode}>(DEL)</span>

                            <img src="/icons/right-arrow.svg" alt="" />
                            <p className={styles.TripCardHeaderDetailsItemText}>New Delhi</p>
                            <span className={styles.TripCardHeaderDetailsItemCode}>(DEL)</span>
                        </div>
                        <div className={styles.TripCardHeaderDate}>Wed-11 Feb 2026</div>
                    </div>
                    <div className={styles.TripFlightDetailsCard}>
                        <div className={styles.TripFlightDetailsCardCont}>
                            <div className={styles.TripFlightDetailsCardImage}>
                                <img src="/images/Flight.png" alt="" />
                            </div>
                            <div className={styles.AirLineDetails}>
                                <div className={styles.AirLineDetailsItem}>
                                    <span className={styles.AirLineDetailsItemText}>Air India</span>
                                    <div className={styles.dot}></div>
                                    <span className={styles.AirLineCode}>AI2380</span>
                                </div>
                                <div className={styles.AirLineDetailsItem}>
                                    <span className={styles.AirLineBoeing}>Boeing 787-9 Dreamliner</span>
                                    <div className={styles.dot}></div>
                                    <span className={styles.AirLineDetailsItemCode}>Economy Class</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.br}></div>
                        <FlightTimeline flight={flight} />
                        <div className={styles.br}></div>

                        <div className={styles.FareDetailsTag}>
                            <span>Fare Details</span>
                            <div className={styles.blueDot}></div>
                            <span>Baggage Rules</span>
                        </div>
                    </div>
                </div>
                {/* <div> */}
                <FlightTabs />
                {/* </div> */}

                <div className={styles.flightDepartureReturenDetailsContianer}>
                    <FlightSection />

                </div>

            </div>

        </div>
    )
}

export default PassengerDetailsMobile
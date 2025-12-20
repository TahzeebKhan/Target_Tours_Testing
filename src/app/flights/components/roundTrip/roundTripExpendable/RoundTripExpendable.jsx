"use client"
import React, { useEffect, useRef, useState } from 'react'
import styles from './RoundTripExpendable.module.css'
import FlightTimeline from './FlightTimeline'
import FlightFare from '../flightFare/FlightFare'
import BaggageRules from '../baggageRules/BaggageRules'
import CancellationRules from '../cancellationRules/CancellationRules'

const RoundTripExpendable = () => {

    const [activeTab, setActiveTab] = useState('flight')
    const handleTabClick = (next) => setActiveTab(next)
    const tabsRef = useRef(null);

    const flight = {
        airline: {
            name: "Indonesia AirAsia",
            code: "QZ 271",
            logo: "/images/Flight2.png"
        },
        aircraft: "Airbus A320",

        departure: {
            date: "THU, 25 DEC 2025",
            time: "06:45",
            airport: "SIN - SINGAPORE",
            terminal: "Terminal 2",
            city: "Jewel Changi Airport"
        },

        arrival: {
            date: "THU, 25 DEC 2025",
            time: "08:00",
            airport: "CGK - JAKARTA",
            terminal: "Terminal 3",
            city: "Soekarno–Hatta International"
        },

        duration: {
            hours: "01",
            minutes: "50"
        },

        stops: "Non Stop"
    };

    const flight2 = {
        airline: {
            name: "Batik Air, Indones....",
            code: "ID 715",
            logo: "/images/Flight1.png"
        },

        aircraft: "Boeing 737",

        departure: {
            date: "THU, 18 DEC 2025",
            time: "06:45",
            airport: "CGK - JAKARTA",
            terminal: "Terminal 2F",
            city: "Soekarno–Hatta Inter......"
        },

        arrival: {
            date: "THU, 18 DEC 2025",
            time: "09:35",
            airport: "KUL - KUALA LUMPUR",
            terminal: "Terminal 1",
            city: "Kuala Lumpur Internati.."
        },

        duration: {
            hours: "01",
            minutes: "50"
        },

        stops: "Non Stop"
    };


    const flight3 = {
        airline: {
            name: "Batik Air Malaysia",
            code: "OD 804",
            logo: "/images/Flight3.png"
        },

        aircraft: "Boeing 737",

        departure: {
            date: "THU, 18 DEC 2025",
            time: "10:00",
            airport: "KUL - KUALA LUMPUR",
            terminal: "Terminal 2",
            city: "Kuala Lumpur Internati.."
        },

        arrival: {
            date: "THU, 18 DEC 2025",
            time: "11:10",
            airport: "SIN - SINGAPORE",
            terminal: "Terminal T3",
            city: "Changi Airport"
        },

        duration: {
            hours: "01",
            minutes: "50"
        },

        stops: "Non Stop"
    };

    useEffect(() => {
        if (!tabsRef.current) return;

        const tabs = tabsRef.current;
        const activeTabEl = tabs.querySelector(`.${styles.active}`);

        if (!activeTabEl) return;

        tabs.style.setProperty(
            "--indicator-width",
            `${activeTabEl.offsetWidth}px`
        );
        tabs.style.setProperty(
            "--indicator-left",
            `${activeTabEl.offsetLeft}px`
        );
    }, [activeTab]);

    return (
        <div className={styles.expandableSection}>
            <div className={styles.expandableContainer}>
                <div className={styles.tabContainer} ref={tabsRef}>
                    {[
                        { key: 'flight', label: 'Flight Information' },
                        { key: 'fare', label: 'Fare Details' },
                        { key: 'baggage', label: 'Baggage Rules' },
                        { key: 'cancellation', label: 'Cancellation Rules' },
                    ].map((t) => (
                        <div
                            key={t.key}
                            className={`${styles.tabItem} ${activeTab === t.key ? styles.active : ''}`}
                            onClick={() => setActiveTab(t.key)}
                        >
                            {t.label}
                        </div>
                    ))}
                </div>


                {activeTab === 'flight' && (
                    <div className={styles.flightInfoContainer}>
                        <div className={styles.leftFlightInfoCont}>

                            <div className={styles.flightHeading}>
                                <h3>Jakrata To Singapore, 18 Dec 2025</h3>
                            </div>
                            <div className={styles.mainBody}>
                                <FlightTimeline flight={flight2} />
                                <div className={styles.changeOfPlanes}>
                                    Change of planes: <span className={styles.changeOfPlanesTiem}>  2  </span>  h  <span className={styles.changeOfPlanesTiem}>  15  </span> m Layover in France
                                </div>
                                <FlightTimeline flight={flight3} />
                            </div>
                        </div>
                        <div className={styles.rightFlightInfoCont}>
                            <div className={styles.flightHeading}>
                                <h3>Singapore To Jakrata, 25 Dec 2025</h3>
                            </div>
                            <div className={styles.mainBody}>
                                <FlightTimeline flight={flight} />
                            </div>
                        </div>


                    </div>
                )}

                {activeTab === 'fare' && (
                    <div className={styles.flightFareContaienr}>
                        <FlightFare />
                        <FlightFare />

                    </div>
                )}

                {activeTab === 'baggage' && (
                    <div className={styles.baggageRuleContainer}>
                        <BaggageRules />
                        <BaggageRules />
                    </div>
                )}

                {activeTab === 'cancellation' && (
                    <div className={styles.baggageRuleContainer}>
                        <CancellationRules/>
                    </div>
                )}


            </div>

        </div>
    )
}

export default RoundTripExpendable

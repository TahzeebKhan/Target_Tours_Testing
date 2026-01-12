import React from 'react'
import styles from './FareDetailsExpandable.module.css'
import FlightTimeline from '../flightTimeline/FlightTimeline';
import FlightFacilities from '../flightFacilities/FlightFacilities';


const FareDetailsExpandable = () => {
    const flight = {
        airline: {
            name: "Garuda Indonesia",
            code: "6E- 541",
            logo: "/images/GarudaIndonesia.png"
        },
        aircraft: "Boeing 737",

        flexiPlusFare: "Flexi Plus Fare",

        travelClass: "Economy",
        departure: {
            date: "Thu, 18 Dec 2025",
            time: "06:45",
            airport: "CGK - Jakarta",
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
            name: "Batik Air Malaysia",
            code: "OD 804",
            logo: "/images/AirlineLogos.png" // update path as per your project
        },

        aircraft: "Boeing 737",

        travelClass: "Business",

        departure: {
            date: "Thu, 18 Dec 2025",
            time: "06:45",
            airport: "KUL - Kuala Lumpur",
            terminal: null,
            city: "Kuala Lumpur International Airport"
        },

        arrival: {
            date: "Thu, 18 Dec 2025",
            time: "08:00",
            airport: "SIN - Singapore",
            terminal: null,
            city: "Changi Airport"
        },

        duration: {
            hours: "01",
            minutes: "50"
        },

        stops: "Non-stop"
    };

    const returnFlight = {
        airline: {
            name: "Garuda Indonesia",
            code: "6E-541",
            logo: "/images/GarudaIndonesia.png"
        },

        aircraft: "Boeing 737",

        flexiPlusFare: "Flexi Plus Fare",

        travelClass: "First Class",

        departure: {
            date: "Thu, 18 Dec 2025",
            time: "06:45",
            airport: "SIN - Singapore",
            terminal: null,
            city: "Changi Airport"
        },

        arrival: {
            date: "Thu, 18 Dec 2025",
            time: "08:00",
            airport: "CGK - Jakarta",
            terminal: null,
            city: "Soekarno–Hatta International"
        },

        duration: {
            hours: "01",
            minutes: "50"
        },

        stops: "Non-Stop"
    };

    const facilitiesData = [
        {
            id: 1,
            icon: "/icons/baggage.svg",
            text: "Baggage 20 kg, Cabin Baggage 7kg",
        },
        {
            id: 2,
            icon: "/icons/entertainment.svg",
            text: "In-flight entertainment",
        },
        {
            id: 4,
            icon: "/icons/usbPort.svg",
            text: "Power & USB Port",
        },
    ];

    return (
        <div className={styles.expandWrap}>
            <div className={styles.flightDepartureContainer}>
                <h3 className={styles.flightDepartureHeader}>DEPARTURE</h3>
                <div className={styles.flightDepartureDetailsContainer}>
                    <div className={styles.flightDepartureDetails}>
                        <FlightTimeline flight={flight} />

                        <div className={styles.changeOfPlanes}>
                            Change of planes: <span className={styles.changeOfPlanesTiem}>  2  </span>  h  <span className={styles.changeOfPlanesTiem}>  15  </span> m <span className={styles.changeOfPlanesLocation}> Layover in Kuala Lumpur (KUL)</span>
                        </div>
                        <FlightTimeline flight={flight2} />
                    </div>
                    <FlightFacilities />
                </div>
            </div>
            <div className={styles.flightDepartureContainer}>
                <h3 className={styles.flightDepartureHeader}>RETURN</h3>
                <div className={styles.flightDepartureDetailsContainer}>
                    <div className={styles.flightDepartureDetails}>
                        <FlightTimeline flight={returnFlight} />
                    </div>
                    <FlightFacilities facilities={facilitiesData} className={styles.facilities} />
                </div>
            </div>
        </div>
    )
}

export default FareDetailsExpandable
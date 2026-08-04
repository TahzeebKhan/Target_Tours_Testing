import React from 'react'
import styles from './FareDetailsExpandable.module.css'
import FlightTimeline from '../flightTimeline/FlightTimeline';
import FlightFacilities from '../flightFacilities/FlightFacilities';
import { useFlightBooking } from "@/app/flight-booking-details/FlightBookingContext";
import { getBookingDetailsView } from "@/features/flights/utils/flightBookingSession";


const FareDetailsExpandable = () => {
    const { bookingSession } = useFlightBooking();
    const bookingView = getBookingDetailsView(bookingSession);
    const flight = bookingView?.departureFlight;
    const returnFlight = bookingView?.returnFlight;
    const multiCityFlights = bookingView?.isMultiCity
        ? bookingView?.multiCityFlights || []
        : [];

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
            {multiCityFlights.map((routeFlight, index) => (
                <div
                    key={`${routeFlight?.departure?.airport || "route"}-${routeFlight?.arrival?.airport || index}-${index}`}
                    className={styles.flightDepartureContainer}
                >
                    <h3 className={styles.flightDepartureHeader}>
                        ROUTE {index + 1}: {routeFlight?.departure?.airport?.split(" - ")?.[0] || "N/A"} → {routeFlight?.arrival?.airport?.split(" - ")?.[0] || "N/A"}
                    </h3>
                    <div className={styles.flightDepartureDetailsContainer}>
                        <div className={styles.flightDepartureDetails}>
                            <FlightTimeline flight={routeFlight} />
                        </div>
                        {/* <FlightFacilities /> */}
                    </div>
                </div>
            ))}
            {!bookingView?.isMultiCity && flight && (
                <div className={styles.flightDepartureContainer}>
                    <h3 className={styles.flightDepartureHeader}>DEPARTURE</h3>
                    <div className={styles.flightDepartureDetailsContainer}>
                        <div className={styles.flightDepartureDetails}>
                            <FlightTimeline flight={flight} />
                        </div>
                        {/* <FlightFacilities /> */}
                    </div>
                </div>
            )}
            {!bookingView?.isMultiCity && returnFlight && (
                <div className={styles.flightDepartureContainer}>
                    <h3 className={styles.flightDepartureHeader}>RETURN</h3>
                    <div className={styles.flightDepartureDetailsContainer}>
                        <div className={styles.flightDepartureDetails}>
                            <FlightTimeline flight={returnFlight} />
                        </div>
                        {/* <FlightFacilities facilities={facilitiesData} className={styles.facilities} /> */}
                    </div>
                </div>
            )}
        </div>
    )
}

export default FareDetailsExpandable

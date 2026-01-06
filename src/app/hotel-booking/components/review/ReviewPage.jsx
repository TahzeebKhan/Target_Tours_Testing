"use client";
import React, { useState } from "react";
import styles from "./ReviewPage.module.css";

import { useRouter } from "next/navigation";
import TravelInsuranceOption from "@/app/flightBookingDetails/components/passengerDetails/fareDetailsExpandable/component/travelInsuranceOption/TravelInsuranceOption";
import CancellationPenalty from "@/app/flightBookingDetails/components/passengerDetails/fareDetailsExpandable/component/cancellationPenalty/CancellationPenalty";
import RoomPriceRow from "./components/roomPriceRow/RoomPriceRow";
import TravelerDetails from "./components/travelerDetails/TravelerDetails";
import CancellationPolicy from "./components/cancellationPolicy/CancellationPolicy";
import HotelPolicy from "./components/hotelPolicy/HotelPolicy";

const ReviewPage = () => {

    // 👇 default open = flight
    const [openTab, setOpenTab] = useState("flight");

    const toggleTab = (tabName) => {
        setOpenTab((prev) => (prev === tabName ? null : tabName));
    };



    const roomList = [
        {
            id: "deluxe_ac_room",
            title: "Deluxe Private AC Room with Ensuite Bathroom",
            image: "/images/hotelArt1.png",
            pricePerNight: 1397.86,
            currency: "INR",
            quantity: 1,
            maxQuantity: 5,
        },
        {
            id: "premium_ac_room",
            title: "Premium Private AC Room with Ensuite Bathroom",
            image: "/images/hotelArt1.png",
            pricePerNight: 1397.86,
            currency: "INR",
            quantity: 1,
            maxQuantity: 5,
        }
    ];

    return (
        <div className={styles.container}>
            {/* HEADER */}
            <h2 className={styles.headerText}>
                <span>Great pick!</span>
                Guests love staying here
            </h2>
            <div className={styles.hotelContainer}>
                <div className={styles.hotelTopContainer}>
                    <div className={styles.hotelImageContainer}>
                        <img src="/images/hotelArt1.png" alt="" />
                    </div>
                    <div className={styles.hotelTextContainer}>
                        <div className={styles.hotelNameAndLocation}>
                            <h3>Hotel Arts Barcelona</h3>
                            <div className={styles.locationAndRating}>
                                <img src="/icons/blackAddress.svg" alt="" />
                                <span className={styles.hotelAddress}>Barcelona, Spain</span>
                                <div className={styles.ratingSection}>
                                    <div className={styles.stars}>
                                        <img src="/icons/tetimonialStart.svg" alt="" />
                                        <img src="/icons/tetimonialStart.svg" alt="" />
                                        <img src="/icons/tetimonialStart.svg" alt="" />
                                        <img src="/icons/tetimonialStart.svg" alt="" />
                                    </div>
                                    <div className={styles.reviewCount}>4.5 (371 reviews)</div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.checkinOutContainer}>
                            <div className={styles.checkinContainer}>
                                <span className={styles.checkinText}>check in</span>
                                <div className={styles.dateAndTimeContainer}>
                                    <span className={styles.dateAndTime}>21 Jan '26 | <span className={styles.time}>1:00 PM</span></span>
                                </div>
                            </div>
                            <div className={styles.perNight}>
                                X 10 Nights
                            </div>
                            <div className={styles.checkinContainer}>
                                <span className={styles.checkinText}>check Out</span>
                                <div className={styles.dateAndTimeContainer}>
                                    <span className={styles.dateAndTime}>21 Jan '26 | <span className={styles.time}>1:00 PM</span></span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                {roomList.map((room) => (
                    <RoomPriceRow
                        key={room.id}
                        image={room.image}
                        title={room.title}
                        price={room.pricePerNight}
                        quantity={room.quantity}
                    />
                ))}

            </div>


            <div className={`${styles.flightExpandableContainer} ${openTab === "guestDetails" ? styles.flightActiveBorder : ""}`}>
                <div
                    className={styles.flightExpandableCard}
                    onClick={() => toggleTab("guestDetails")}
                >
                    <h3 className={styles.flightExpandableHeader}>
                        GUEST DETAILS
                    </h3>
                    <img
                        src="/icons/DownArrows.svg"
                        alt=""
                        className={`${styles.arrow} ${openTab === "guestDetails" ? styles.arrowRotate : ""
                            }`}
                    />
                </div>

                <div
                    className={`${styles.expandWrap} ${openTab === "guestDetails" ? styles.expandOpen : ""
                        }`}
                >
                    <TravelerDetails />
                </div>
            </div>
            <div className={`${styles.flightExpandableContainer} ${openTab === "Cancellation" ? styles.flightActiveBorder : ""}`}>
                <div
                    className={styles.flightExpandableCard}
                    onClick={() => toggleTab("Cancellation")}
                >
                    <h3 className={styles.flightExpandableHeader}>
                        Cancellation & Date Change Policy
                    </h3>
                    <img
                        src="/icons/DownArrows.svg"
                        alt=""
                        className={`${styles.arrow} ${openTab === "Cancellation" ? styles.arrowRotate : ""
                            }`}
                    />
                </div>

                <div
                    className={`${styles.expandWrap} ${openTab === "Cancellation" ? styles.expandOpen : ""
                        }`}
                >
                    {/* <CancellationPenalty /> */}
                    <CancellationPolicy />
                </div>
            </div>


            <div className={`${styles.flightExpandableContainer} ${openTab === "propertyPolicy" ? styles.flightActiveBorder : ""}`}>
                <div
                    className={styles.flightExpandableCard}
                    onClick={() => toggleTab("propertyPolicy")}
                >
                    <h3 className={styles.flightExpandableHeader}>
                        PROPERTY POLICY
                    </h3>
                    <img
                        src="/icons/DownArrows.svg"
                        alt=""
                        className={`${styles.arrow} ${openTab === "propertyPolicy" ? styles.arrowRotate : ""
                            }`}
                    />
                </div>

                <div
                    className={`${styles.expandWrap} ${openTab === "propertyPolicy" ? styles.expandOpen : ""
                        }`}
                >
                    {/* <CancellationPenalty /> */}
                    <HotelPolicy />
                </div>
            </div>
            <div
                // onClick={() => setCurrentStep(3)}
                className={styles.continueButtonContainer}
            >
                <button className={styles.continueButton}>CONTINUE</button>
            </div>


        </div>
    );
};

export default ReviewPage;

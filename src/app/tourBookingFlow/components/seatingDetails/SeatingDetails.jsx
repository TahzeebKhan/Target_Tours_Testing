import React from 'react'
import styles from './SeatingDetails.module.css'
import { useFlightBooking } from '../../FlightBookingContext';
const SeatingDetails = () => {
    const [openTab, setOpenTab] = React.useState("flight");
    const toggleTab = (tab) => {
        if (openTab !== tab) setOpenTab(tab);
    };
    const {setCurrentStep} = useFlightBooking()
    return (
        <div className={styles.container}>
            {/* HEADER */}
            <div className={styles.passengerDetailsHeader}>
                <div className={styles.fromToContainer}>
                    <h2 className={styles.from}>
                        Select Your Seats
                    </h2>

                </div>

                <div className={styles.aboutFlightContainerRight}>
                    <span className={styles.subInfoText}>Choose your preferred seats for the journey. Extra legroom seats available for additional comfort.</span>
                </div>
            </div>

            {/* FLIGHT DETAILS */}
            <div className={`${styles.flightExpandableContainer} ${openTab === "flight" ? styles.flightActiveBorder : ""}`}>
                <div
                    className={styles.flightExpandableCard}
                    onClick={() => toggleTab("flight")}
                >
                    <div className={styles.flightSeatingContainer}>
                        <div className={styles.flightExpandableHeaderContainer}>
                            <h3 className={styles.flightExpandableHeader}>DEL–BOM</h3>
                            {/* <img
                            src="/icons/DownArrows.svg"
                            alt=""
                            className={`${styles.arrow} ${openTab === "flight" ? styles.arrowRotate : ""
                                }`}
                        /> */}
                        </div>
                        <div className={styles.aboutFlightContainerRight}>
                            <span>Fri, 26 Dec 2025</span>
                            <div className={styles.dot}></div>
                            <span>23:10 - 10:40</span>
                        </div>
                    </div>
                    <div className={styles.flightSeatingPrice}>
                        <div className={styles.priceContainer}>
                            <span className={styles.price}>₹ 3,000</span>
                            <span className={styles.subInfoText}>Added to fare</span>
                        </div>
                        <img
                            src="/icons/DownArrows.svg"
                            alt=""
                            className={`${styles.arrow} ${openTab === "flight" ? styles.arrowRotate : ""
                                }`}
                        />
                    </div>
                </div>

                <div
                    className={`${styles.expandWrap} ${openTab === "flight" ? styles.expandOpen : ""
                        }`}
                >
                    <div className={styles.expandableContent}>
                        <div className={styles.flightSeatingWrapper}>

                        </div>
                        <div className={styles.flightSeatingRight}>
                            <div className={styles.flightSeatingSubRight}>
                                <div className={styles.flightSeatingRightHeader}>
                                    <img src="/images/airIndia.png" alt="" />
                                    <div className={styles.flightSeatingRightHeaderInfo}>
                                        <h3 className={styles.flightName}>Batik Air Malaysia (OD 804)</h3>
                                        <p className={styles.chip}>Boeing 737</p>
                                    </div>
                                </div>

                                <div className={styles.flightSeatingPriceWrapper}>
                                    {/* Rows */}
                                    <div className={styles.flightSeatingPriceContainer}>
                                        <div className={styles.row}>
                                            <div className={styles.left}>
                                                <span className={styles.name}>Adult 1</span>
                                                <span className={styles.seat}>3C</span>
                                            </div>
                                            <span className={styles.priceSeat}>₹ 1,000</span>
                                        </div>

                                        <div className={styles.row}>
                                            <div className={styles.left}>
                                                <span className={styles.name}>Adult 2</span>
                                                <span className={styles.seat}>3D</span>
                                            </div>
                                            <span className={styles.priceSeat}>₹ 2,000</span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    {/* <div className={styles.divider} /> */}

                                    {/* Total */}
                                    <div className={styles.totalRow}>
                                        <span className={styles.totalText}>Total</span>
                                        <span className={styles.totalPrice}>₹ 3000</span>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.legend}>
                                <div className={styles.column}>
                                    <LegendItem color="green" label="Free" />
                                    <LegendItem color="blue" label="₹ 0–525" />
                                </div>
                                <div className={styles.column}>
                                    <LegendItem color="purple" label="₹ 578–1103" />
                                    <LegendItem color="orange" label="₹ 1200–1503" />
                                </div>
                                <div className={styles.column}>
                                    <LegendItem color="red" label="Exit Row Seats" />
                                    <LegendItem color="dark" label="Non Reclining" />
                                </div>
                                <div className={styles.column}>
                                    <LegendItem isXL label="Extra Legroom" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                onClick={() => setCurrentStep(6)}
                className={styles.continueButtonContainer}
            >
                <button className={styles.skipButton}>SKIP MEAL</button>
                <button className={styles.continueButton}>CONTINUE</button>
            </div>
        </div>
    )
}

export default SeatingDetails

const LegendItem = ({ color, label, isXL }) => {
    return (
        <div className={styles.item}>
            {isXL ? (
                <span className={styles.xl}>XL</span>
            ) : (
                <span className={`${styles.box} ${styles[color]}`} />
            )}
            <span className={styles.text}>{label}</span>
        </div>
    );
};
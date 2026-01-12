"use client"
import React, { useEffect, useRef, useState } from 'react'
import styles from './ExpandableTabs.module.css'

const ExpandableTabs = () => {
    const [activeTab, setActiveTab] = useState('flight')
    const handleTabClick = (next) => setActiveTab(next)
    const tabsRef = useRef(null);


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
                    <div className={`${styles.tabContentFlightInformation} ${styles.fadeIn}`}>
                        <div className={styles.aboutFlightContainer}>
                            <div className={styles.aboutFlightContainerLeft}>
                                <img className={styles.flightIcon} src="/images/flightCompanyLogos/indigo.png" alt="" />
                                <div className={styles.flightInfoTextContainer}>
                                    <div className={styles.flightInfoTextTitle}>IndiGo Airlines (6E- 541)</div>
                                    <div className={styles.flightInfoTextChips}>Boeing 737</div>
                                </div>
                            </div>
                            <div className={styles.aboutFlightContainerRight}>
                                <span className={styles.subInfoText}>Wed, 03 Dec</span>
                                <div className={styles.dot}></div>
                                <span className={styles.subInfoText}>Non-stop </span>
                                <div className={styles.dot}></div>
                                <span className={styles.subInfoText}>01 h 50 m</span>
                                <div className={styles.dot}></div>
                                <span className={styles.subInfoText}>Economy</span>

                            </div>
                        </div>

                        <div className={styles.timelineContainer}>
                            {/* LEFT */}
                            <div className={styles.side}>
                                <div className={styles.date}>THU, 18 DEC 25</div>
                                <div className={styles.time}>06:45</div>
                                <div className={styles.airport}>CGK - JAKARTA</div>
                                <div className={styles.terminal}>Terminal T2F</div>
                                <div className={styles.city}>Soekarno Hatta Intl</div>
                            </div>

                            {/* CENTER */}
                            <div className={styles.center}>
                                <div className={styles.flightAnimation}>
                                    <div className={styles.flightDotedcontainer}>
                                        <div className={styles.bigDot}></div>
                                        <div className={styles.dashBorder}></div>
                                    </div>
                                    <img className={styles.flightSvg} src="/icons/flightIconBlue.svg" alt="" />
                                    <div className={styles.flightDotedcontainer}>
                                        <div className={styles.dashBorder}></div>
                                        <div className={styles.bigDot}></div>
                                    </div>
                                </div>
                                <div className={styles.priceContainer}>
                                    <span className={styles.duration}>01<span className={styles.hours}> h </span>50<span className={styles.hours}> m </span></span>
                                    <div className={styles.dot}></div>
                                    <span className={styles.nonStop}>Non Stop</span>
                                </div>
                            </div>

                            {/* RIGHT */}
                            <div className={styles.sideRight}>
                                <div className={styles.date}>THU, 18 DEC 25</div>
                                <div className={styles.time}>08:00</div>
                                <div className={styles.airport}>SIN - SINGAPORE</div>
                                <div className={styles.terminal}>Terminal T3</div>
                                <div className={styles.city}>Changi</div>
                            </div>
                        </div>

                        <div className={styles.changeOfPlanes}>
                            Change of planes: <span className={styles.changeOfPlanesTiem}>  2  </span>  h  <span className={styles.changeOfPlanesTiem}>  15  </span> m Layover in France
                        </div>


                        <div className={styles.timelineContainer}>
                            {/* LEFT */}
                            <div className={styles.side}>
                                <div className={styles.date}>THU, 18 DEC 25</div>
                                <div className={styles.time}>06:45</div>
                                <div className={styles.airport}>CGK - JAKARTA</div>
                                <div className={styles.terminal}>Terminal T2F</div>
                                <div className={styles.city}>Soekarno Hatta Intl</div>
                            </div>

                            {/* CENTER */}
                            <div className={styles.center}>
                                <div className={styles.flightAnimation}>
                                    <div className={styles.flightDotedcontainer}>
                                        <div className={styles.bigDot}></div>
                                        <div className={styles.dashBorder}></div>
                                    </div>
                                    <img className={styles.flightSvg} src="/icons/flightIconBlue.svg" alt="" />
                                    <div className={styles.flightDotedcontainer}>
                                        <div className={styles.dashBorder}></div>
                                        <div className={styles.bigDot}></div>
                                    </div>
                                </div>
                                <div className={styles.priceContainer}>
                                    <span className={styles.duration}>01<span className={styles.hours}> h </span>50<span className={styles.hours}> m </span></span>
                                    <div className={styles.dot}></div>
                                    <span className={styles.nonStop}>Non Stop</span>
                                </div>
                            </div>

                            {/* RIGHT */}
                            <div className={styles.sideRight}>
                                <div className={styles.date}>THU, 18 DEC 25</div>
                                <div className={styles.time}>08:00</div>
                                <div className={styles.airport}>SIN - SINGAPORE</div>
                                <div className={styles.terminal}>Terminal T3</div>
                                <div className={styles.city}>Changi</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'fare' && (
                    <div className={`${styles.tabContentFareDetails} ${styles.fadeIn}`}>
                        <div className={styles.header}>
                            Jakarta <img src="/icons/whitePlane.svg" alt="" />  Singapore, <span> 18 DEC 2025</span>
                        </div>
                        <div className={styles.body}>
                            <div className={styles.row}>
                                <span className={styles.label}>3 x Adult</span>
                                <span className={styles.amount}>₹ 750,000</span>
                            </div>

                            <div className={styles.row}>
                                <span className={styles.label}>Total (Base Fare)</span>
                                <span className={styles.bold}>₹ 740,000</span>
                            </div>

                            <div className={styles.row}>
                                <span className={styles.label}>Total Tax</span>
                                <span className={styles.bold}>₹ 730,000</span>
                            </div>

                            <div className={styles.row}>
                                <span className={styles.label}>Total (Fee &amp; Surcharge)</span>
                                <span className={styles.bold}>₹ 760,000</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'baggage' && (
                    <div className={`${styles.tabContentBaggageRules} ${styles.fadeIn}`}>
                        <div className={styles.tableCard}>
                            {/* Header */}
                            <div className={styles.tableHeader}>
                                <span className={styles.airlineCellHead}>AIRLINE</span>
                                <span>CHECK-IN BAGGAGE</span>
                                <span>CABIN BAGGAGE</span>
                            </div>

                            {/* Row */}
                            <div className={styles.tableRow}>
                                <div className={styles.airlineCell}>

                                    <img className={styles.airlineIcon} src="/images/Flight.png" alt="" />

                                    <div className={styles.airlineText}>
                                        <span className={styles.airlineName}>INDIGO</span>
                                        <span className={styles.flightNo}>6E - 541</span>
                                    </div>
                                </div>

                                <div className={styles.baggage}>15 KGS</div>
                                <div className={styles.baggage}>7 KG</div>
                            </div>
                        </div>

                        {/* RIGHT INFO BOX */}
                        <div className={styles.infoBox}>
                            <ul>
                                <li>
                                    Baggage information mentioned above is obtained from airline's
                                    reservation system, EaseMyTrip does not guarantee the accuracy of
                                    this information.
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'cancellation' && (
                    <div className={`${styles.tabContentCancellationRules} ${styles.fadeIn}`}>
                        <div className={styles.route}>CGK - SIN</div>

                        {/* Table */}
                        <div className={styles.table}>
                            {/* Header */}
                            <div className={styles.tableHeader}>
                                <span>TIME FRAME</span>
                                <span>AIRLINE FEE + TARGET TOURS FEE</span>
                            </div>

                            {/* Row 1 */}
                            <div className={styles.tableRows}>
                                <span className={styles.timeFrame}>0 HOURS TO 24 HOURS*</span>
                                <span className={styles.textRight}>ADULT : NON REFUNDABLE</span>
                            </div>

                            {/* Row 2 */}
                            <div className={styles.tableRows}>
                                <span className={styles.timeFrame}>24 HOURS TO 365 DAYS*</span>
                                <span className={styles.textRight}>$16,325 + $250</span>
                            </div>
                        </div>

                        <div className={styles.note}>
                            *From The Date Of Departure
                        </div>
                    </div>
                )}


            </div>

        </div>
    )
}

export default ExpandableTabs

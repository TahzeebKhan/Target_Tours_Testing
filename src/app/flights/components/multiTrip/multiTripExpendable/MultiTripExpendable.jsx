"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./MultiTripExpendable.module.css";
import FlightFare from "../flightFare/FlightFare";
import BaggageRules from "../baggageRules/BaggageRules";
import CancellationRules from "../cancellationRules/CancellationRules";

const MultiTripExpendable = () => {
  const [activeTab, setActiveTab] = useState("flight");
  const handleTabClick = (next) => setActiveTab(next);
  const tabsRef = useRef(null);

  useEffect(() => {
    if (!tabsRef.current) return;

    const tabs = tabsRef.current;
    const activeTabEl = tabs.querySelector(`.${styles.active}`);

    if (!activeTabEl) return;

    tabs.style.setProperty("--indicator-width", `${activeTabEl.offsetWidth}px`);
    tabs.style.setProperty("--indicator-left", `${activeTabEl.offsetLeft}px`);
  }, [activeTab]);

  return (
    <div className={styles.expandableSection}>
      <div className={styles.expandableContainer}>
        <div className={styles.tabContainer} ref={tabsRef}>
          {[
            { key: "flight", label: "Flight Information" },
            { key: "fare", label: "Fare Details" },
            { key: "baggage", label: "Baggage Rules" },
            { key: "cancellation", label: "Cancellation Rules" },
          ].map((t) => (
            <div
              key={t.key}
              className={`${styles.tabItem} ${
                activeTab === t.key ? styles.active : ""
              }`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </div>
          ))}
        </div>

        {activeTab === "flight" && (
          <div className={styles.flightInfoContainer}>
            <div className={styles.leftFlightInfoCont}>
              <div className={styles.flightHeading}>
                <h3>Jakrata To Singapore, 18 Dec 2025</h3>
              </div>
              <div className={styles.mainBody}>
                <div className={styles.flightBody}>
                  <div className={styles.aboutFlightContainer}>
                    <div className={styles.aboutFlightContainerLeft}>
                      <img
                        className={styles.flightIcon}
                        src="/images/flightCompanyLogos/batikAirlines.png"
                        alt=""
                      />
                      <div className={styles.flightInfoTextContainer}>
                        <div className={styles.flightInfoTextTitle}>
                          Batik Air, Indones....(ID 715)
                        </div>
                        <div className={styles.flightInfoTextChips}>
                          Boeing 777-300ER
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.timelineContainer}>
                    {/* LEFT */}
                    <div className={styles.side}>
                      <div className={styles.date}>THU, 18 DEC 2025</div>
                      <div className={styles.time}>06:45</div>
                      <div className={styles.airport}>CGK - JAKARTA</div>
                      <div className={styles.terminal}>Terminal T2F</div>
                      <div className={styles.city}>
                        Soekarno Hatta Intl
                      </div>
                    </div>

                    {/* CENTER */}
                    <div className={styles.center}>
                      <div className={styles.flightAnimation}>
                        <div className={styles.flightDotedcontainer}>
                          <div className={styles.bigDot}></div>
                          <svg
                            width="103"
                            height="2"
                            viewBox="0 0 103 2"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M0.871094 0.87207H101.583"
                              stroke="#94A3B8"
                              stroke-width="1.74407"
                              stroke-linecap="round"
                              stroke-dasharray="3.49 3.49"
                            />
                          </svg>
                        </div>
                        <img
                          className={styles.flightSvg}
                          src="/icons/flightIconBlue.svg"
                          alt=""
                        />
                        <div className={styles.flightDotedcontainer}>
                          <svg
                            width="103"
                            height="2"
                            viewBox="0 0 103 2"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M0.871094 0.87207H101.583"
                              stroke="#94A3B8"
                              stroke-width="1.74407"
                              stroke-linecap="round"
                              stroke-dasharray="3.49 3.49"
                            />
                          </svg>

                          <div className={styles.bigDot}></div>
                        </div>
                      </div>
                      <div className={styles.priceContainer}>
                        <span className={styles.duration}>
                          01<span className={styles.hours}> h </span>50
                          <span className={styles.hours}> m </span>
                        </span>
                        <div className={styles.dot}></div>
                        <span className={styles.nonStop}>Non Stop</span>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className={styles.sideRight}>
                      <div className={styles.date}>Thu, 18 Dec 2025</div>
                      <div className={styles.time}>08:00</div>
                      <div className={styles.airport}>KUL – Kuala Lumpur</div>
                      <div className={styles.terminal}>Terminal T1</div>
                      <div className={styles.city}>
                        Changi International Airport
                      </div>
                    </div>
                  </div>

                  {/* <div className={styles.changeOfPlanes}>
                    Change of planes:{" "}
                    <span className={styles.changeOfPlanesTiem}> 2 </span> h{" "}
                    <span className={styles.changeOfPlanesTiem}> 15 </span> m
                    Layover in France
                  </div> */}
                </div>
              </div>
            </div>
            <div className={styles.leftFlightInfoCont}>
              <div className={styles.flightHeading}>
                <h3>Singapore To Krabi, 18 dec</h3>
              </div>
              <div className={styles.mainBody}>
                <div className={styles.flightBody}>
                  <div className={styles.aboutFlightContainer}>
                    <div className={styles.aboutFlightContainerLeft}>
                      <img
                        className={styles.flightIcon}
                        src="/images/flightCompanyLogos/indigo.png"
                        alt=""
                      />
                      <div className={styles.flightInfoTextContainer}>
                        <div className={styles.flightInfoTextTitle}>
                          IndiGo Airlines (PA-5602)
                        </div>
                        <div className={styles.flightInfoTextChips}>
                          Boeing 737
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.timelineContainer}>
                    {/* LEFT */}
                    <div className={styles.side}>
                      <div className={styles.date}>Thu, 24 Dec 25</div>
                      <div className={styles.time}>06:45</div>
                      <div className={styles.airport}>SIN - Singapore</div>
                      <div className={styles.terminal}>Terminal T2F</div>
                      <div className={styles.city}>
                        Changi
                      </div>
                    </div>

                    {/* CENTER */}
                    <div className={styles.center}>
                      <div className={styles.flightAnimation}>
                        <div className={styles.flightDotedcontainer}>
                          <div className={styles.bigDot}></div>
                          <svg
                            width="103"
                            height="2"
                            viewBox="0 0 103 2"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M0.871094 0.87207H101.583"
                              stroke="#94A3B8"
                              stroke-width="1.74407"
                              stroke-linecap="round"
                              stroke-dasharray="3.49 3.49"
                            />
                          </svg>
                        </div>
                        <img
                          className={styles.flightSvg}
                          src="/icons/flightIconBlue.svg"
                          alt=""
                        />
                        <div className={styles.flightDotedcontainer}>
                          <svg
                            width="103"
                            height="2"
                            viewBox="0 0 103 2"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M0.871094 0.87207H101.583"
                              stroke="#94A3B8"
                              stroke-width="1.74407"
                              stroke-linecap="round"
                              stroke-dasharray="3.49 3.49"
                            />
                          </svg>

                          <div className={styles.bigDot}></div>
                        </div>
                      </div>
                      <div className={styles.priceContainer}>
                        <span className={styles.duration}>
                          01<span className={styles.hours}> h </span>50
                          <span className={styles.hours}> m </span>
                        </span>
                        <div className={styles.dot}></div>
                        <span className={styles.nonStop}>Non Stop</span>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className={styles.sideRight}>
                      <div className={styles.date}>Thu, 24 Dec 25</div>
                      <div className={styles.time}>08:00</div>
                      <div className={styles.airport}>kbv - KRABI</div>
                      <div className={styles.terminal}>Terminal T3</div>
                      <div className={styles.city}>
                        Krabi International Airport
                      </div>
                    </div>
                  </div>

                  {/* <div className={styles.changeOfPlanes}>
                    Change of planes:{" "}
                    <span className={styles.changeOfPlanesTiem}> 2 </span> h{" "}
                    <span className={styles.changeOfPlanesTiem}> 15 </span> m
                    Layover in France
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "fare" && (
          <div className={styles.flightFareContaienr}>
            <FlightFare />
            <FlightFare />
          </div>
        )}

        {activeTab === "baggage" && (
          <div className={styles.baggageRuleContainer}>
            <BaggageRules />
            <BaggageRules />
          </div>
        )}

        {activeTab === "cancellation" && (
          <div className={styles.baggageRuleContainer}>
            <CancellationRules />
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiTripExpendable;

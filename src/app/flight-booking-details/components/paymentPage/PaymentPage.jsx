"use client";
import { useState } from "react";
import { useFlightBooking } from "../../FlightBookingContext";
import styles from "./PaymentPage.module.css";
import TripSummaryExpandable from "./components/TripSummaryExpandable";
import { tripSummaryData } from "./components/dummyData";
import PassengerInfo from "./components/PassengerInfo";
import ExtrasSummary from "./components/ExtrasSummary";
import PayWithOptions from "./components/PayWithOptions";
const PaymentPage = () => {
  const { setCurrentStep } = useFlightBooking();
  const [openTab, setOpenTab] = useState("passengerInfo");
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const toggleTab = (tabName) => {
    setOpenTab((prev) => (prev === tabName ? null : tabName));
  };

  return (
    <>
      <div className={styles.tripDetailsContainer}>
        <div className={styles.tripDetailsHeader}>
          <img
            onClick={() => setCurrentStep(5)}
            className={styles.backArrow}
            src="/icons/leftArrowTrip.svg"
            alt=""
          />
          <p className={styles.tripDetails}>Review and Payment</p>
        </div>
      </div>
      <div className={styles.container}>
        {/* HEADER */}

        <div className={styles.passengerDetailsHeader}>
          <div className={styles.fromToContainer}>
            <h2 className={styles.from}>Review and Payment</h2>
            {/* <span className={styles.to}>To</span>
            <h2 className={styles.to}>
              Singapore <span className={styles.cityCode}>(SIN)</span>
            </h2> */}
          </div>

          <div className={styles.aboutFlightContainerRight}>
            <span className={styles.subInfoText}>
              Confirm and complete booking.
            </span>
          </div>
        </div>

        {/* Trip Summary */}
        <div className={styles.flightExpandableContainer}>
          <div
            className={`${styles.flightExpandableCard} ${
              openTab === "tripSummary" ? styles.open : ""
            }`}
            onClick={() => toggleTab("tripSummary")}
          >
            <div className={styles.firstCard}>
              <div
                className={`${styles.flightExpandableContainer} ${styles.flightExpandableContainer2}`}
              >
                <h3 className={styles.flightExpandableHeader}>trip summary</h3>
                <img
                  src="/icons/DownArrows.svg"
                  alt=""
                  className={`${styles.arrow} ${
                    openTab === "tripSummary" ? styles.arrowRotate : ""
                  }`}
                />
              </div>

              <div
                className={`${styles.card} ${
                  openTab === "tripSummary"
                    ? styles.tripSummaryHidden
                    : styles.tripSummaryVisible
                }`}
              >
                <div className={styles.left}>
                  <img
                    src="/images/AirlineLogos.png"
                    alt="Airline Logo"
                    className={styles.logo}
                  />
                </div>

                <div className={styles.right}>
                  <div className={styles.route}>
                    <span className={styles.city}>New Delhi (DEL)</span>
                    <span className={styles.arrowCard}>
                      <svg
                        width="24"
                        height="15"
                        viewBox="0 0 24 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 6.36395H0V8.36395H1V7.36395V6.36395ZM23.7071 8.07106C24.0976 7.68054 24.0976 7.04737 23.7071 6.65685L17.3431 0.292885C16.9526 -0.0976396 16.3195 -0.0976396 15.9289 0.292885C15.5384 0.683409 15.5384 1.31657 15.9289 1.7071L21.5858 7.36395L15.9289 13.0208C15.5384 13.4113 15.5384 14.0445 15.9289 14.435C16.3195 14.8255 16.9526 14.8255 17.3431 14.435L23.7071 8.07106ZM1 7.36395V8.36395H23V7.36395V6.36395H1V7.36395Z"
                          fill="black"
                        />
                      </svg>
                    </span>
                    <span className={styles.city}>Navi Mumbai (NMI)</span>
                  </div>

                  <div className={styles.meta}>
                    <span>Thu, 22 Jan 2025</span>
                    <span className={styles.dot}>|</span>
                    <span> Air India Express </span>
                    <span className={styles.dot}>•</span>
                    <span>08:05–10:30</span>
                    <span className={styles.dot}>•</span>
                    <span>Business</span>
                    <span className={styles.dot}>•</span>
                    <span>Non-stop</span>
                    <span className={styles.dot}>•</span>
                    <span>02h 25m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`${styles.expandWrap} ${
              openTab === "tripSummary" ? styles.expandOpen : ""
            }`}
          >
            <TripSummaryExpandable data={tripSummaryData} />
          </div>
        </div>

        {/* Passenger info */}
        <div className={styles.flightExpandableContainer}>
          <div
            className={`${styles.flightExpandableCard} ${
              openTab === "passengerInfo" ? styles.open : ""
            }`}
            onClick={() => toggleTab("passengerInfo")}
          >
            <h3 className={styles.flightExpandableHeader}>
              Passenger information
            </h3>
            <img
              src="/icons/DownArrows.svg"
              alt=""
              className={`${styles.arrow} ${
                openTab === "passengerInfo" ? styles.arrowRotate : ""
              }`}
            />
          </div>

          <div
            className={`${styles.expandWrap} ${
              openTab === "passengerInfo" ? styles.expandOpen : ""
            }`}
          >
            <PassengerInfo />
          </div>
        </div>

        <div className={styles.flightExpandableContainer}>
          <div
            className={`${styles.flightExpandableCard} ${
              openTab === "extras" ? styles.open : ""
            }`}
            onClick={() => toggleTab("extras")}
          >
            <h3 className={styles.flightExpandableHeader}>extras</h3>
            <img
              src="/icons/DownArrows.svg"
              alt=""
              className={`${styles.arrow} ${
                openTab === "extras" ? styles.arrowRotate : ""
              }`}
            />
          </div>

          <div
            className={`${styles.expandWrap} ${
              openTab === "extras" ? styles.expandOpen : ""
            }`}
          >
            <ExtrasSummary />
          </div>
        </div>

        <div className={`${styles.flightExpandableContainer} `}>
          <div
            className={`${`${styles.flightExpandableCard}`} ${
              styles.payWithContainer
            }`}
          >
            <h3 className={styles.flightExpandableHeader}>Pay with</h3>
          </div>
          <PayWithOptions
            selected={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />
        </div>

        {/* <div
          onClick={() => setCurrentStep(3)}
          className={styles.continueButtonContainer}
        >a
          <button className={styles.continueButton}>CONTINUE</button>
        </div> */}
      </div>
      <div className={styles.mobileView}>
        <div className={styles.footer}>
          {/* LEFT */}
          <div className={styles.footerContainer}>
            <div className={styles.amountSection}>
              <div className={styles.label}>
                Total Amount
                <span className={styles.infoIcon}>!</span>
              </div>
              <div className={styles.amount}>₹ 66,945</div>
            </div>

            {/* RIGHT */}
            <button className={styles.continueBtn}>CONTINUE PAYMENT</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentPage;

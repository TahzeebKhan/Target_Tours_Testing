import React, { useState } from "react";
import styles from "./SeatingDetails.module.css";
import { useFlightBooking } from "../../FlightBookingContext";
import Plane from "@/app/flight-booking-details/mobileViewComponents/seatingDetailsMobileView/plane";
import BelowPlane from "@/app/flight-booking-details/mobileViewComponents/seatingDetailsMobileView/below_plane";
import Mobile_footer from "@/app/flight-booking-details/mobileViewComponents/seatingDetailsMobileView/Mobile_footer";
import PriceSummary from "@/features/profile/components/PriceSummary";
const rowData = [
  { id: 1, seats: ["grey", "grey", "grey", "grey", "grey", "grey"] },
  { id: 2, seats: ["blue", "blue", "blue", "blue", "blue", "blue"] },
  { id: 3, seats: ["blue", "blue", "blue", "blue", "taken", "blue"] },
  { id: 4, seats: ["blue", "taken", "taken", "blue", "taken", "blue"] },
  {
    id: 5,
    seats: ["purple", "purple", "purple", "purple", "purple", "purple"],
  },
  { id: 6, seats: ["purple", "xl", "xl", "xl", "xl", "purple"] },
  {
    id: 7,
    seats: ["purple", "taken", "taken", "purple", "purple", "purple"],
  },
  { id: 8, seats: ["red", "taken", "taken", "red", "red", "red"] },
  { id: "exit1", type: "exit" },
  { id: 9, seats: ["red", "red", "red", "red", "red", "red"] },
  { id: 10, seats: ["orange", "purple", "blue", "blue", "purple", "orange"] },
  {
    id: 11,
    seats: ["orange", "taken", "taken", "taken", "purple", "orange"],
  },
  {
    id: 12,
    seats: ["orange", "taken", "taken", "taken", "purple", "orange"],
  },
  { id: 13, seats: ["orange", "purple", "blue", "blue", "purple", "orange"] },
  { id: 14, seats: ["red", "red", "red", "red", "red", "red"] },
  { id: "exit2", type: "exit" },
  { id: 15, seats: ["red", "red", "red", "red", "red", "red"] },
  { id: 16, seats: ["xl", "xl", "xl", "xl", "xl", "xl"] },
  { id: 17, seats: ["black", "black", "xl", "xl", "black", "black"] },
];
const SeatingDetails = () => {
  const [openTab, setOpenTab] = useState("");
  const [selectedPassenger, setSelectedPassenger] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState(["3-A", "3-B"]);

  const [showPriceSummaryPopup, setShowPriceSummaryPopup] = useState(false);
  const toggleTab = (tab) => {
    if (openTab !== tab) setOpenTab(tab);
  };
  const { setCurrentStep, currentStep } = useFlightBooking();

  const toggleSeat = (rowId, colLabel, type) => {
    if (type === "taken") return;
    const seatId = `${rowId}-${colLabel}`;
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  return (
    <>
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.passengerDetailsHeader}>
          <div className={styles.fromToContainer}>
            <h2 className={styles.from}>Select Your Seats</h2>
          </div>

          <div className={styles.aboutFlightContainerRight}>
            <span className={styles.subInfoText}>
              Choose your preferred seats for the journey. Extra legroom seats
              available for additional comfort.
            </span>
          </div>
        </div>

        {/* FLIGHT DETAILS */}
        <div
          className={`${styles.flightExpandableContainer} ${
            openTab === "flight" ? styles.flightActiveBorder : ""
          }`}
        >
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
                className={`${styles.arrow} ${
                  openTab === "flight" ? styles.arrowRotate : ""
                }`}
              />
            </div>
          </div>

          <div
            className={`${styles.expandWrap} ${
              openTab === "flight" ? styles.expandOpen : ""
            }`}
          >
            <div className={styles.expandableContent}>
              <div className={styles.flightSeatingWrapper}>
                <div className={styles.selectSeatsTitle}>
                  Select Seat On Map
                </div>
                <Plane
                  callFromDesktop={true}
                  toggleSeat={toggleSeat}
                  selectedSeats={selectedSeats}
                  setSelectedSeats={setSelectedSeats}
                  rowData={rowData}
                />
              </div>
              <div className={styles.flightSeatingRight}>
                <div className={styles.flightSeatingSubRight}>
                  <div className={styles.flightSeatingRightHeader}>
                    <img
                      src="/images/flightCompanyLogos/batikAirlines2.png"
                      alt=""
                    />
                    <div className={styles.flightSeatingRightHeaderInfo}>
                      <h3 className={styles.flightName}>
                        Batik Air Malaysia (OD 804)
                      </h3>
                      <p className={styles.chip}>Boeing 737</p>
                    </div>
                  </div>

                  {/* Passenger Seat Selector */}
                  <div className={styles.passengerSeatWrapper}>
                    <div className={styles.passengerSeatTitle}>
                      Select your seat
                    </div>

                    {[
                      { id: 1, name: "Demian" },
                      { id: 2, name: "Satria" },
                    ].map((passenger, index) => {
                      const seat = selectedSeats[index] || null;

                      return (
                        <div
                          onClick={() => setSelectedPassenger(passenger.id)}
                          key={passenger.id}
                          className={`${styles.passengerSeatCard} ${
                            selectedPassenger === passenger.id
                              ? styles.passengerSeatCardActive
                              : ""
                          }`}
                        >
                          <div className={styles.passengerSeatIcon}>
                            <img src="/icons/User_copy.svg" alt="passenger" />
                          </div>

                          <div className={styles.passengerSeatInfo}>
                            <p className={styles.passengerSeatHeading}>
                              Seat Passenger {passenger.id}
                            </p>
                            <p className={styles.passengerSeatSub}>
                              {passenger.name} •{" "}
                              {seat ? `Seat ${seat}` : "No seat selected"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
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

      <div className={styles.mobileView}>
        <div className={styles.tripDetailsContainer}>
          <div className={styles.tripDetailsHeader}>
            <img
              onClick={() => setCurrentStep(currentStep - 1)}
              className={styles.backArrow}
              src="/icons/leftArrowTrip.svg"
              alt=""
            />
            <p className={styles.tripDetails}>Review and Payment</p>
          </div>
        </div>
        <div className={styles.detailsWrapper}>
          <div className={styles.fromTo}>
            <span>del</span>–<span>bom</span>
          </div>
          <div className={styles.dateTime}>
            <span>Fri, 26 Dec 2025</span>
            <span className={styles.dot2} />
            <span>23:10 - 10:40</span>
          </div>
        </div>
        <Plane
          toggleSeat={toggleSeat}
          selectedSeats={selectedSeats}
          setSelectedSeats={setSelectedSeats}
          rowData={rowData}
        />
        <BelowPlane />

        <Mobile_footer
          setShowPriceSummaryPopup={setShowPriceSummaryPopup}
          setCurrentStep={setCurrentStep}
          currentStep={currentStep}
        />

        {showPriceSummaryPopup && <PriceSummary onClose={()=>setShowPriceSummaryPopup(false)} />}
      </div>
    </>
  );
};

export default SeatingDetails;

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

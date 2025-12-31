"use client";
import { useState } from "react";
import styles from "./MultiCityTrip.module.css";
import TripCard from "./tripCard/TripCard";
import OfferBanner from "../offerComponent/OfferBanner";
import DatePriceSlider from "../DatePriceSlider";
import { useTripType } from "../../TripTypeContext";
const MultiCityTrip = () => {
  const [selectedSort, setSelectedSort] = useState("cheapest");
  const { committedSearches } = useTripType();
  const { from, to } = committedSearches.multi;
  return (
    <>
      <section className={styles.container}>
        <div className={styles.FlightBookingTextContainer}>
          <h2 className={styles.heading}>
            Flight from <span>{from || "Jakarta"}</span> to <span>{to || "Singapore"}</span>
          </h2>
          <div className={styles.subTextContainer}>
            <span className={styles.priceInfo}>
              The price is average for one person. Included all taxes and fees.
            </span>
            <span className={styles.itemsResult}>
              Showing 1-10 of 100 results
            </span>
          </div>
        </div>
        <DatePriceSlider />

        <div className={styles.sortContainer}>
          <div className={styles.sortSubContainer}>
            <div className={styles.sortedItemMainContainer}>
              <div className={styles.sortedItemContainer}>
                <div
                  className={`${styles.sortedItem} ${selectedSort === "cheapest" ? styles.activeSortedItem : ""
                    }`}
                  onClick={() => setSelectedSort("cheapest")}
                >
                  <img src="/images/Flight.png" alt="" />
                  <div className={styles.sortedTextContainer}>
                    <span className={styles.budget}>CHEAPEST</span>
                    <div className={styles.priceContainer}>
                      <span className={styles.price}>₹ 8500</span>
                      <div className={styles.dot}></div>
                      <span className={styles.duration}>
                        01 <span className={styles.hours}>h</span> 50{" "}
                        <span className={styles.hours}>m</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`${styles.sortedItem} ${selectedSort === "fastest" ? styles.activeSortedItem : ""
                    }`}
                  onClick={() => setSelectedSort("fastest")}
                >
                  <img
                    height={36}
                    width={36}
                    src="/images/flightCompanyLogos/airIndia.png"
                    alt=""
                  />
                  <div className={styles.sortedTextContainer}>
                    <span className={styles.budget}>FASTEST</span>
                    <div className={styles.priceContainer}>
                      <span className={styles.price}>₹ 8500</span>
                      <div className={styles.dot}></div>
                      <span className={styles.duration}>
                        01 <span className={styles.hours}>h</span> 50{" "}
                        <span className={styles.hours}>m</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.sortByContainer}>
              <img src="/icons/sort.svg" alt="" />
              <span className={styles.sortByText}>Sort by</span>
            </div>
          </div>
        </div>
        <div className={styles.tripCardsContainer}>
          <TripCard />
          <TripCard />
          <TripCard />
          <OfferBanner />
          <TripCard />
          <TripCard />
          <TripCard />
          <TripCard />
        </div>
      </section>
    </>
  );
};

export default MultiCityTrip;

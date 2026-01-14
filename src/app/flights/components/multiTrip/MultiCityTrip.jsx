"use client";
import { useContext, useState } from "react";
import styles from "./MultiCityTrip.module.css";
import TripCard from "./tripCard/TripCard";
import OfferBanner from "../offerComponent/OfferBanner";
import DatePriceSlider from "../DatePriceSlider";
import { useTripType } from "../../TripTypeContext";
import SortBySheet from "../SortBySheet";
import RoundTripSkeleton from "../roundTrip/RoundTripSkeleton";
import { useFlightFilters } from "@/app/context/FlightFilterContext";
import { X } from "lucide-react";
import FlightDetailsCard from "../PhoneViewComponents/multiTripPhoneView/FlightDetailsCard";
import { SidebarContext } from "../../SidebarContext";
const MultiCityTrip = () => {
  const [selectedSort, setSelectedSort] = useState("cheapest");
  const { committedSearches } = useTripType();
  const [openSort, setOpenSort] = useState(false);
  const { from, to } = committedSearches.multi;
  const {
    filters,
    filterChips,
    toggleCheckbox,
    toggleMapCheckbox,
    selectDeparture,
    resetFilters,
  } = useFlightFilters();
  const [isLoading, setIsLoading] = useState(false);

  const { setIsSidebarOpen } = useContext(SidebarContext);

  const flightResults = [
    {
      id: 1,
      fare: {
        totalFare: "₹ 3,22,000",
        cabinClass: "ECONOMY",
      },

      outbound: {
        airlines: [
          {
            name: "Batik Air, Indonesia",
            code: "6E-541",
            logo: "/images/flightCompanyLogos/batikAirlines.png",
          },
        ],
        dateLabel: "WED, 17 DEC",
        departure: {
          time: "06:45",
          city: "JAKARTA (CGK)",
        },
        arrival: {
          time: "08:00",
          city: "SINGAPORE (SIN)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "Non Stop",
        },
      },

      inbound: {
        airlines: [
          {
            name: "Indonesia Airasia",
            code: "6E-541",
            logo: "/images/flightCompanyLogos/airAsia.png",
          },
        ],
        dateLabel: "THU, 31 DEC",
        departure: {
          time: "06:45",
          city: "SINGAPORE (SIN)",
        },
        arrival: {
          time: "08:00",
          city: "JAKARTA (CGK)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "Non Stop",
        },
      },
    },
    {
      id: 2,
      fare: {
        totalFare: "₹ 3,22,000",
        cabinClass: "ECONOMY",
      },

      outbound: {
        airlines: [
          {
            name: "Indigo",
            code: "6E-541",
            logo: "/images/Flight.png",
          },
        ],
        dateLabel: "WED, 17 DEC",
        departure: {
          time: "06:45",
          city: "JAKARTA (CGK)",
        },
        arrival: {
          time: "08:00",
          city: "SINGAPORE (SIN)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "Non Stop",
        },
      },

      inbound: {
        airlines: [
          {
            name: "Indonesia Airasia",
            code: "6E-541",
            logo: "/images/flightCompanyLogos/airAsia.png",
          },
        ],
        dateLabel: "THU, 31 DEC",
        departure: {
          time: "06:45",
          city: "SINGAPORE (SIN)",
        },
        arrival: {
          time: "08:00",
          city: "JAKARTA (CGK)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "Non Stop",
        },
      },
    },
    {
      id: 3,
      fare: {
        totalFare: "₹ 3,22,000",
        cabinClass: "ECONOMY",
      },

      outbound: {
        airlines: [
          {
            name: "Indonesia AirAsia",
            code: "6E-541",
            logo: "/images/flightCompanyLogos/airAsia.png",
          },
        ],
        dateLabel: "WED, 17 DEC",
        departure: {
          time: "06:45",
          city: "JAKARTA (CGK)",
        },
        arrival: {
          time: "08:00",
          city: "SINGAPORE (SIN)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "Non Stop",
        },
      },

      inbound: {
        airlines: [
          {
            name: "Indonesia Airasia",
            code: "6E-541",
            logo: "/images/flightCompanyLogos/airAsia.png",
          },
        ],
        dateLabel: "THU, 31 DEC",
        departure: {
          time: "06:45",
          city: "SINGAPORE (SIN)",
        },
        arrival: {
          time: "08:00",
          city: "JAKARTA (CGK)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "Non Stop",
        },
      },
    },
    {
      id: 4,
      fare: {
        totalFare: "₹ 3,22,000",
        cabinClass: "ECONOMY",
      },

      outbound: {
        airlines: [
          {
            name: "Batik Air, Indonesia",
            code: "6E-541",
            logo: "/images/flightCompanyLogos/batikAirlines.png",
          },
        ],
        dateLabel: "WED, 17 DEC",
        departure: {
          time: "06:45",
          city: "JAKARTA (CGK)",
        },
        arrival: {
          time: "08:00",
          city: "SINGAPORE (SIN)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "Non Stop",
        },
      },

      inbound: {
        airlines: [
          {
            name: "Indonesia Airasia",
            code: "6E-541",
            logo: "/images/flightCompanyLogos/airAsia.png",
          },
        ],
        dateLabel: "THU, 31 DEC",
        departure: {
          time: "06:45",
          city: "SINGAPORE (SIN)",
        },
        arrival: {
          time: "08:00",
          city: "JAKARTA (CGK)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "Non Stop",
        },
      },
    },
    {
      id: 5,
      fare: {
        totalFare: "₹ 3,22,000",
        cabinClass: "ECONOMY",
      },

      outbound: {
        airlines: [
          {
            name: "Indigo",
            code: "6E-541",
            logo: "/images/Flight.png",
          },
        ],
        dateLabel: "WED, 17 DEC",
        departure: {
          time: "06:45",
          city: "JAKARTA (CGK)",
        },
        arrival: {
          time: "08:00",
          city: "SINGAPORE (SIN)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "Non Stop",
        },
      },

      inbound: {
        airlines: [
          {
            name: "Indonesia Airasia",
            code: "6E-541",
            logo: "/images/flightCompanyLogos/airAsia.png",
          },
        ],
        dateLabel: "THU, 31 DEC",
        departure: {
          time: "06:45",
          city: "SINGAPORE (SIN)",
        },
        arrival: {
          time: "08:00",
          city: "JAKARTA (CGK)",
        },
        duration: {
          hours: 1,
          minutes: 50,
        },
        stops: {
          type: "Non Stop",
        },
      },
    },
  ];
  return (
    <>
      <section className={styles.container}>
        <div className={styles.FlightBookingTextContainer}>
          <h2 className={styles.heading}>
            Flight from <span>{from || "Jakarta (CGK)"}</span> to{" "}
            <span>{to || "Singapore (SIN)"}</span>
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
                  className={`${styles.sortedItem} ${
                    selectedSort === "cheapest" ? styles.activeSortedItem : ""
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
                  className={`${styles.sortedItem} ${
                    selectedSort === "fastest" ? styles.activeSortedItem : ""
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
            <div
              onClick={() => setOpenSort(true)}
              className={styles.sortByContainer}
            >
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

      <section className={styles.isMobileView}>
        <div className={styles.mobileFlightContainer}>
          <p className={styles.mobileSubTextContainer}>
            Showing 1-10 of 100 results
          </p>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={styles.filterBtn}
          >
            Filter
          </button>
        </div>
        {/* <div className={styles.flightChipContainer}>
          <div className={styles.chips}>
          
            <p>No. of stops: Direct</p>
            <div className={styles.mobileCloseBtn}>
              <img src="/icons/CLose.svg" alt="" />
            </div>
          </div>
          <div className={styles.chips}>
            <p>Departure time: Morning, 06:00 - 12:00</p>
            <div className={styles.mobileCloseBtn}>
              <img src="/icons/CLose.svg" alt="" />
            </div>
          </div>
          <div className={styles.chips}>
            <p>Departure time: Morning, 06:00 - 12:00</p>
            <div className={styles.mobileCloseBtn}>
              <img src="/icons/CLose.svg" alt="" />
            </div>
          </div>
          <div className={styles.chips}>
            <p>Departure time: Morning, 06:00 - 12:00</p>
            <div className={styles.mobileCloseBtn}>
              <img src="/icons/CLose.svg" alt="" />
            </div>
          </div>
        </div> */}
        {filterChips.length > 0 && (
          <div className={styles.filterChips}>
            {filterChips.map((chip, index) => (
              <div key={index} className={styles.chip}>
                <div className={styles.name}>{chip.label}</div>
                <span onClick={chip.onRemove}>
                  <X size={16} color="#4A5565" />
                </span>
              </div>
            ))}
          </div>
        )}
        <div className={styles.sortContainer}>
          <div className={styles.sortSubContainer}>
            <div className={styles.sortedItemMainContainer}>
              <div className={styles.sortedItemContainer}>
                <div
                  className={`${styles.sortedItem} ${
                    selectedSort === "cheapest" ? styles.activeSortedItem : ""
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
                  className={`${styles.sortedItem} ${
                    selectedSort === "fastest" ? styles.activeSortedItem : ""
                  }`}
                  onClick={() => setSelectedSort("fastest")}
                >
                  <img
                    src="/images/flightCompanyLogos/airIndia.png"
                    height={36}
                    width={36}
                    alt=""
                  />
                  <div className={styles.sortedTextContainer}>
                    <span className={styles.budget}>fastest</span>
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
            <div
              onClick={() => setOpenSort(true)}
              className={styles.sortByContainer}
            >
              <span className={styles.sortByText}>Sort by</span>
              <img
                className={`${styles.chevronSort} ${
                  openSort === true ? styles.open : ""
                }`}
                src="/icons/DownArrows.svg"
                alt=""
              />
            </div>
          </div>
        </div>
        {isLoading ? (
          <RoundTripSkeleton />
        ) : (
          flightResults.map((flight, index) => (
            <FlightDetailsCard key={flight.id + index} flight={flight} />
          ))
        )}
      </section>
      <SortBySheet open={openSort} onClose={() => setOpenSort(false)} />
    </>
  );
};

export default MultiCityTrip;

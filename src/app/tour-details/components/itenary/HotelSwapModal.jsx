"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Search, SlidersHorizontal, X } from "lucide-react";
import styles from "./HotelSwapModal.module.css";
import CustomDropdown from "./CustomDropdown";

const HOTEL_SWAP_OPTIONS = [
  {
    name: "Banyan Cove Beach Resort - Deluxe Ocean View",
    image: "/images/hotel1.png",
    price: "₹ 6,945",
    oldPrice: "₹66,945",
    rating: "5.0",
    reviews: "1,260 reviews",
  },
  {
    name: "Banyan Cove Beach Resort - Deluxe Ocean View",
    image: "/images/hotelImage1.png",
    price: "₹ 3,945",
    oldPrice: "₹66,945",
    rating: "5.0",
    reviews: "1,260 reviews",
  },
  {
    name: "Banyan Cove Beach Resort - Deluxe Ocean View",
    image: "/images/hotelImage2.png",
    price: "₹ 9,945",
    oldPrice: "₹66,945",
    rating: "5.0",
    reviews: "1,260 reviews",
  },
  {
    name: "Banyan Cove Beach Resort - Deluxe Ocean View",
    image: "/images/hotelImage3.png",
    price: "₹ 2,945",
    oldPrice: "₹66,945",
    rating: "5.0",
    reviews: "1,260 reviews",
  },
];

export default function HotelSwapModal({
  isOpen,
  onClose,
  currentHotel,
  city,
  dayImage,
}) {
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedTheme, setSelectedTheme] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const hotelOptions = useMemo(() => {
    const currentName = currentHotel?.name || "Banyan Cove Beach Resort";
    return HOTEL_SWAP_OPTIONS.map((hotel, optionIndex) => ({
      ...hotel,
      name: optionIndex === 0 && currentHotel?.name ? currentName : hotel.name,
      image: optionIndex === 0 ? dayImage || hotel.image : hotel.image,
    }));
  }, [currentHotel, dayImage]);
  const cityOptions = useMemo(
    () => [
      { value: "all", label: "All Cities" },
      { value: city || "current-city", label: city || "Current City" },
    ],
    [city],
  );
  const themeOptions = useMemo(
    () => [
      { value: "all", label: "All Theme" },
      { value: "luxury", label: "Luxury" },
    ],
    [],
  );

  if (!isOpen) return null;

  return (
    <div className={styles.hotelModalOverlay} onMouseDown={onClose}>
      <section
        className={styles.hotelModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hotel-swap-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.hotelModalClose}
          onClick={onClose}
          aria-label="Close hotel selection"
        >
          <X size={18} />
        </button>

        <header className={styles.hotelModalHero}>
          <div>
            <p className={styles.currentHotelLabel }>{currentHotel?.name || "Banyan Cove Beach Resort"}</p>
            <h2 id="hotel-swap-title" className={styles.hotelSwapTitle}>
              Select Hotel To Change
            </h2>
          </div>
        </header>

        <div className={styles.hotelModalContent}>
          <div className={styles.hotelFilters}>
            <label>
              <span>Hotel category</span>
              <div className={styles.segmentedFilter}>
                <button type="button">3 ★</button>
                <button type="button">4 ★</button>
                <button type="button">5 ★</button>
              </div>
            </label>
            <label>
              <span>Cities</span>
              <CustomDropdown
                label="Cities"
                options={cityOptions}
                value={selectedCity}
                onChange={setSelectedCity}
              />
            </label>
            <label>
              <span>User rating</span>
              <div className={styles.segmentedFilter}>
                <button type="button">3 ★</button>
                <button type="button">4 ★</button>
                <button type="button">5 ★</button>
              </div>
            </label>
            <label>
              <span>Theme</span>
              <CustomDropdown
                label="Theme"
                options={themeOptions}
                value={selectedTheme}
                onChange={setSelectedTheme}
              />
            </label>
            <button type="button" className={styles.filterButton}>
              <SlidersHorizontal size={14} />
              Filter
            </button>
          </div>

          <strong className={styles.hotelCount}>
            Showing <span>64 Hotels</span>
          </strong>

          <label className={styles.hotelSearch}>
            <Search size={18} />
            <input
              type="search"
              placeholder="Search Hotels.."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearSearchButton}
                onClick={() => setSearchQuery("")}
                aria-label="Clear hotel search"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </label>

          <div className={styles.hotelOptions}>
            {hotelOptions.map((hotel, hotelIndex) => (
                <article
                  className={styles.hotelOptionCard}
                  key={`${hotel.name}-${hotelIndex}`}
                >
                  <div className={styles.hotelOptionImage}>
                    <img src={hotel.image} alt="" />
                    <button type="button" aria-label="Previous hotel image" className={styles.prevImageButton}>
                      <img src='/images/leftArow.svg' alt='Previous'  />
                    </button>
                    <button type="button" aria-label="Next hotel image" className={styles.nextImageButton}>
                      <img src='/images/rightArow.svg' alt='Next' />
                    </button>
                  </div>
                  <div className={styles.hotelOptionInfo}>
                    <small>Phuket stay • 3 nights</small>
                    <h3>{hotel.name}</h3>
                    <p>Deluxe Ocean View · King bed</p>
                    <div className={styles.hotelAmenities}>
                      <span>1 King Bed</span>
                      <span>
                        <Check size={12} /> Valley View
                      </span>
                      
                    </div>
                    <ul className={styles.hotelpolicy}>
                      <li>Free stay for the kid</li>
                      <li>1 Extra bed/mattress will be provided at no extra cost</li>
                    </ul>
                    <span className={styles.cancellation}>
                      <Check size={13} /> Free Cancellation before 19 Jan 02:59 PM
                    </span>
                  </div>
                  <div className={styles.hotelOptionPrice}>
                    <div className={styles.hotelRating}>

                      <div className={styles.hotelRatingValue}>

                     
                      <p className={styles.hotelRatingText}>Excellent</p>
                      <span>{hotel.reviews}</span>
                       </div>
                      <div className={styles.hotelRate}>
                      {hotel.rating}
                      </div>
                    </div>
                    <p>
                      <del>{hotel.oldPrice}</del>
                      <strong className={styles.hotelPrice}>{hotel.price}</strong>
                      <span>x 5 night</span>
                      <small className={styles.hotelTax}>+ ₹ 226 Taxes & fees</small>
                    </p>
                    <div className={styles.hotelActions}>
                      <a href="#" className={styles.seeDetailsLink}>
                      See Details
                      </a>
                    <button type="button" onClick={onClose}>
                      <img src="/images/swap.svg" alt="" />
                      Replace
                    </button>

                    </div>
                    
                  </div>
                </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

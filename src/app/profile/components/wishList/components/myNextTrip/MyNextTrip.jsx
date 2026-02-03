import React, { useState } from "react";
import styles from "./MyNextTrip.module.css";
import ExpCarousel from "../exploreCarousel/component/ExpCarousel";
import { useProfile } from "@/app/profile/context/ProfileContext";
import ExpCardItem from "../exploreCarousel/component/ExpCardItem";
const MyNextTrip = () => {
  const item = {
    title: "Munnar, Kerala",
    subtitle: "Tranquil Retreat Lodge",
    price: "₹449/",
    rating: 3.4,
    users: 508,
    type: "Beach",
    favorite: false,
    images: ["/images/1.webp", "/images/2.webp", "/images/3.webp"],
  };

  const [allSlidesData, setAllSlidesData] = useState([
    {
      title: "Munnar, Kerala",
      subtitle: "Tranquil Retreat Lodge",
      price: "₹449/",
      rating: 3.4,
      users: 508,
      type: "Beach",
      favorite: false,
      images: ["/images/1.webp", "/images/2.webp", "/images/3.webp"],
    },
    {
      title: "Goa, India",
      subtitle: "Blue Lagoon Resort",
      price: "₹899/",
      rating: 4.5,
      users: 1020,
      type: "Beach",
      favorite: false,
      images: ["/images/2.webp", "/images/3.webp", "/images/4.webp"],
    },
    {
      title: "Darjeeling, Bengal",
      subtitle: "Mountain View Stay",
      price: "₹699/",
      rating: 4.6,
      users: 720,
      type: "Beach",
      favorite: false,
      images: ["/images/3.webp", "/images/4.webp"],
    },
    {
      title: "Manali, Himachal",
      subtitle: "Family Hill Resort",
      price: "₹599/",
      rating: 4.4,
      users: 540,
      type: "Beach",
      favorite: false,
      images: ["/images/4.webp", "/images/1.webp"],
    },
  ]);
  const toggleFavorite = (index) => {
    const updated = [...allSlidesData];
    updated[index].favorite = !updated[index].favorite;
    setAllSlidesData(updated);
  };
  const { activeMenu, setActiveMenu } = useProfile();
  return (
    <div className={styles.container}>
      <div className={styles.backToWishLists}>
        <img src="/icons/angle-left.svg" alt="" />
        <p onClick={() => setActiveMenu("wishList")}>Back to Wish lists</p>
      </div>
      <h3 className={styles.myNextTripHeading}>My next trip</h3>
      <div className={styles.br}></div>
      <div className={styles.carousel}>
        {/* <ExpCarousel activeTab={"All"} /> */}

        {allSlidesData.map((item, index) => (
          <ExpCardItem
            key={index}
            item={item}
            onToggleFavorite={() => toggleFavorite(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default MyNextTrip;

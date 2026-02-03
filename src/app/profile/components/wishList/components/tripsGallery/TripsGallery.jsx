"use client";
import styles from "./TripsGallery.module.css";
import WishlistImages from "./WishlistImages";
import { useProfile } from "@/app/profile/context/ProfileContext";

export default function TripsGallery({ wishlists = [] }) {
  const { setActiveMenu } = useProfile();

  return (
    <div className={styles.wrapper}>
      {wishlists.map((list, idx) => (
        <div
          key={idx}
          className={styles.card}
          onClick={() =>
            list.name.toLowerCase() === "my next trip" &&
            setActiveMenu("myNextTrip")
          }
        >
          <WishlistImages images={list.images} />

          <div className={styles.info}>
            <h3>{list.name}</h3>
            <span>{list.total} Saved</span>
          </div>
        </div>
      ))}
    </div>
  );
}

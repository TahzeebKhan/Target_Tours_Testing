"use client";
import { useProfile } from "@/app/profile/context/ProfileContext";
import styles from "./TripsGallery.module.css";

const trips = [
  {
    id: 1,
    type: "collage",
    title: "My Next Trip",
    saved: 6,
    images: [
      "/hotelList/nextTrip1.png",
      "/hotelList/nextTrip2.png",
      "/hotelList/nextTrip3.png",
      "/hotelList/nextTrip4.png",
    ],
  },
  {
    id: 2,
    type: "single",
    title: "Falkensee, Germany 2025",
    saved: 2,
    image: "/images/falkensee.jpg", // 👈 typo fix (.pns ❌)
  },
  {
    id: 3,
    type: "single",
    title: "Prague, Czechia 2025",
    saved: 1,
    image: "/hotelList/Falkensee.png",
  },
];

export default function TripsGallery() {
  const { setActiveMenu, activeMenu } = useProfile();

  const handleClick = (trip) => {
    if (trip.id === 1) {
      setActiveMenu("myNextTrip");
    }
  };

  return (
    <div className={styles.wrapper}>
      {trips.map((trip) => (
        <div
          key={trip.id}
          onClick={() => handleClick(trip)}
          className={styles.card}
        >
          {/* ✅ COLLAGE (ONLY 4 IMAGES) */}
          {trip.type === "collage" && (
            <div className={styles.collage}>
              {trip.images.map((img, i) => (
                <img key={i} src={img} alt="" />
              ))}
            </div>
          )}

          {/* ✅ SINGLE IMAGE */}
          {trip.type === "single" && (
            <img
              className={styles.singleImage}
              src={trip.image}
              alt={trip.title}
            />
          )}

          {/* INFO */}
          <div className={styles.info}>
            <h3>{trip.title}</h3>
            <span>{trip.saved} Saved</span>
          </div>
        </div>
      ))}
    </div>
  );
}

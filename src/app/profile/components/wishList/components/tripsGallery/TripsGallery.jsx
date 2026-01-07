"use client";
import styles from "./TripsGallery.module.css";

const trips = [
  {
    id: 1,
    type: "collage",
    title: "MY NEXT TRIP",
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
    title: "FALKENSEE, GERMANY 2025",
    saved: 2,
    image: "/hotelList/falkensee.png", // 👈 typo fix (.pns ❌)
  },
  {
    id: 3,
    type: "single",
    title: "PRAGUE, CZECHIA 2025",
    saved: 1,
    image: "/hotelList/prague.png",
  },
];

export default function TripsGallery() {
  return (
    <div className={styles.wrapper}>
      {trips.map((trip) => (
        <div key={trip.id} className={styles.card}>
          
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

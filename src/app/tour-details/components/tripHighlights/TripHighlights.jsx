import React from "react";
import styles from "./TripHighlights.module.css";

const TripHighlights = ({ data }) => {
  const highlightBlock = Array.isArray(data?.trip_highlights)
    ? [...data.trip_highlights].sort(
        (a, b) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0),
      )[0]
    : null;

  const heading = highlightBlock?.title || "Trip Highlights";

  const items = String(highlightBlock?.body || "")
    .match(/<li>(.*?)<\/li>/g)?.map((item, index) => ({
      id: index,
      text: item.replace(/<\/?li>/g, "").trim(),
    })) || [];

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const bgImagePath =
    highlightBlock?.background_image?.url ||
    "";

  const bgImage = BASE_URL && bgImagePath ? `${BASE_URL}${bgImagePath}` : null;

  if (!items.length) return null;

  return (
    <div className={styles.ForMobile}>
      {/* MOBILE */}
      <div
        className={styles.containerMobile}
        style={bgImage ? { "--bg-image": `url(${bgImage})` } : undefined}
      >
        <div className={styles.overlayCard}>
          <h2 className={styles.heading}>{heading}</h2>
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.id}>{item.text}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* DESKTOP */}
      <section
        className={styles.section}
        style={bgImage ? { "--bg-image": `url(${bgImage})` } : undefined}
      >
        <div className={styles.container}>
          <div className={styles.overlayCard}>
            <h2 className={styles.heading}>{heading}</h2>
            <ul className={styles.list}>
              {items.map((item) => (
                <li key={item.id}>{item.text}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TripHighlights;

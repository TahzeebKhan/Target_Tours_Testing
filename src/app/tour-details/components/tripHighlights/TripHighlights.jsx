import React from "react";
import styles from "./TripHighlights.module.css";

const TripHighlights = ({ data }) => {
  const highlightBlock = data?.package_highlights?.[0];

  const highlights = Array.isArray(highlightBlock?.highlights)
    ? highlightBlock.highlights
    : [];

  // Heading
  const heading =
    highlights.find((item) => item.type === "heading")?.children?.[0]?.text ||
    "Trip Highlights";

  // List items
  const items = highlights
    .filter((item) => item.type === "paragraph")
    .map((item, index) => ({
      id: index,
      text: item?.children?.[0]?.text?.trim(),
    }))
    .filter((item) => item.text);

  // ✅ Background image (safe)
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const bgImagePath =
    highlightBlock?.background_media?.formats?.large?.url ||
    highlightBlock?.background_media?.url ||
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

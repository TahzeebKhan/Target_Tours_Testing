import React from "react";
import styles from "./Overview.module.css";

const fallbackHighlights = [
  "Live like royalty in the Taj Lake Palace in Udaipur and Rambagh Palace in Jaipur",
  "Live like royalty in the Taj Lake Palace in Udaipur and Rambagh Palace in Jaipur",
  "Lake cruise experience on a pristine alpine lake",
  "Witness a sacred aarti ceremony on the banks of the Ganges in Varanasi",
  "Accommodation in comfortable lodges and hotels immersed in nature",
  "Accommodation in comfortable lodges and hotels immersed in nature",
  "Live like royalty in the Taj Lake Palace in Udaipur and Rambagh Palace in Jaipur",
];

const stripHtml = (value = "") =>
  String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

const getHighlights = (data) => {
  const highlightBlock = Array.isArray(data?.trip_highlights)
    ? [...data.trip_highlights].sort(
        (a, b) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0),
      )[0]
    : null;

  const highlights =
    String(highlightBlock?.body || "")
      .match(/<li[^>]*>(.*?)<\/li>/gis)
      ?.map(stripHtml)
      .filter(Boolean) || [];

  return highlights.length ? highlights : fallbackHighlights;
};

const getOverviewImage = (data) => {
  const imagePath =
    data?.overview_image?.formats?.large?.url ||
    data?.overview_image?.url ||
    data?.main_image?.formats?.large?.url ||
    data?.main_image?.url;

  if (!imagePath) return "/tourBooking/lionCanada.jpg";
  if (/^https?:\/\//i.test(imagePath)) return imagePath;

  return `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}${imagePath}`;
};

const getBrochureUrl = (data) => {
  const brochurePath =
    data?.brochure?.url ||
    data?.brochure_url ||
    data?.pdf_brochure?.url ||
    "";

  if (!brochurePath || /^https?:\/\//i.test(brochurePath)) {
    return brochurePath;
  }

  return `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}${brochurePath}`;
};

const ItinaryOverview = ({ data }) => {
  const title =
    data?.overview_title ||
    data?.extra_info_heading ||
    "The Taj Mahal at dawn, a Bengal tiger resting amid teak forest shadows, the ceremony of Ganga Aarti.";
  const description =
    stripHtml(data?.overview_description || data?.extra_info) ||
    "An incredible continent of sensory marvels reveals itself on this curated journey of India, taking in architectural masterpieces, royal wildlife sanctuaries, and sacred waters. Stay at world-class former palaces, explore the majestic structures of the Mughal kings, track the elusive tiger, and witness Varanasi's glowing spiritual soul with unrivaled local access.";
  const brochureUrl = getBrochureUrl(data);

  return (
    <section className={`${styles.section} ${styles.container}`} id="overview">
      <div className={styles.overviewContainer}>
        <div className={styles.imageFrame}>
          <img
            className={styles.overviewImage}
            src={getOverviewImage(data)}
            alt={data?.title ? `${data.title} overview` : "Tour overview"}
          />
        </div>

        <div className={styles.content}>
          <p className={styles.eyebrow}>Overview</p>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>{description}</p>

          <div className={styles.highlights}>
            <h3 className={styles.eyebrow}>Trip highlights</h3>
            <ul className={styles.highlightGrid}>
              {getHighlights(data).map((highlight, index) => (
                <li key={`${highlight}-${index}`}>
                  <span className={styles.checkIcon} aria-hidden="true">
                    <img src="/icons/check.svg" alt="check" />
                  </span>
                  <span className={styles.description2}>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {brochureUrl ? (
            <a
              className={styles.brochureButton}
              href={brochureUrl}
              target="_blank"
              rel="noreferrer"
            >
              Download PDF brochure
            </a>
          ) : (
            <button className={styles.brochureButton} type="button">
              Download PDF brochure
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default ItinaryOverview;

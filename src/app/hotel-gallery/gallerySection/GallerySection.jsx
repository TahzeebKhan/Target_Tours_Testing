import React from "react";
import styles from "./GallerySection.module.css";

const GallerySection = ({ data, hideOnMobile = false  }) => {
  const { title, images = [] } = data || {};

  if (!images.length) return null;

  return (
    <div className={`${styles.container} ${
        hideOnMobile ? styles.hideOnMobile : ""
      }`}>
      {/* HEADER */}
      <div className={styles.headerContainer}>
        <h2 className={styles.head}>{title}</h2>
      </div>

      {/* GALLERY */}
      <div className={`${styles.galleryContainer} ${
        hideOnMobile ? styles.hideOnMobile : ""
      }`}>
        {/* TOP ROW (2 Images) */}
        <div className={styles.galleryTop}>
          {images.slice(0, 1).map((img, index) => (
            <img key={index} src={img} alt={`gallery-${index}`} />
          ))}
        </div>

        {/* BOTTOM ROW (3 Images) */}
        <div className={styles.galleryBottom}>
          {images.slice(1, 3).map((img, index) => (
            <img key={index} src={img} alt={`gallery-${index + 2}`} />
          ))}
        </div>
      </div>
       <div className={styles.galleryContainerMobile}>
        {/* BOTTOM ROW (3 Images) */}
        <div className={styles.galleryBottomMobile}>
          {images.slice(1, 5).map((img, index) => (
            <img key={index} src={img} alt={`gallery-${index + 2}`} />
          ))}
        </div>
         <div className={styles.galleryTopMobile}>
          {images.slice(0, 1).map((img, index) => (
            <img key={index} src={img} alt={`gallery-${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GallerySection;

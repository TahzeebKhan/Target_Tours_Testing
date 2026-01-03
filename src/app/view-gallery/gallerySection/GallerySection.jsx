// import React from 'react'
// import styles from './GallerySection.module.css'

// const GallerySection = ({data}) => {
//   const { title, images } = data;
//   return (
//     <div className={styles.container}>
//         <div className={styles.headerContainer}>
//             <h2 className={styles.head}>{title}</h2>
//         </div>
//         <div className={styles.galleryContainer}>
            
//             <div className={styles.galleryTop}>
//                 <img src="/gallery/galleryItem1.png" alt="" />
//                 <img src="/gallery/galleryItem2.png" alt="" />
//             </div>
//             <div className={styles.galleryBottom}>
//                 <img src="/gallery/galleryItem3.png" alt="" />
//                 <img src="/gallery/galleryItem4.png" alt="" />
//                 <img src="/gallery/galleryItem5.png" alt="" />
//             </div>
//         </div>
//     </div>
//   )
// }

// export default GallerySection

import React from "react";
import styles from "./GallerySection.module.css";

const GallerySection = ({ data }) => {
  const { title, images = [] } = data || {};

  if (!images.length) return null;

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.headerContainer}>
        <h2 className={styles.head}>{title}</h2>
      </div>

      {/* GALLERY */}
      <div className={styles.galleryContainer}>
        {/* TOP ROW (2 Images) */}
        <div className={styles.galleryTop}>
          {images.slice(0, 2).map((img, index) => (
            <img key={index} src={img} alt={`gallery-${index}`} />
          ))}
        </div>

        {/* BOTTOM ROW (3 Images) */}
        <div className={styles.galleryBottom}>
          {images.slice(2, 5).map((img, index) => (
            <img key={index} src={img} alt={`gallery-${index + 2}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GallerySection;

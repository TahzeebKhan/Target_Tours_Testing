// "use client";
// import React, { useState } from "react";
// import styles from "./DescriptionComponent.module.css";

// const CHAR_LIMIT = 489;

// const DescriptionComponent = () => {
//   const [expanded, setExpanded] = useState(false);

//   const paragraphs = [
//     "Hotel size 200 rooms , Arranged over 6 floors. Barcelonia elegance with 6-star service. Simply elegant in all respects, this beautiful Parisian property offers a wonderful location that enhances your stay. Enjoy spacious rooms with great amenities and 6-star service from a superb team dedicated to making you feel like a VIP.",

//     "The Peninsula Spa has 8 treatment rooms including couples treatment rooms. The palace's spa offers hot stone massages and treatments such as aromatherapy. Other on-site facilities include a steam room and a sauna.",

//     "Pets. Pets stay for free (dogs and cats only, 1 total, up to 5 kg per pet. Service animals welcome",

//     "Special check-in instructions. Front desk staff will greet guests on arrival at the property"
//   ];

//   let usedChars = 0;

//   return (
//     <div className={styles.DescriptionSection}>
//       <h2 className={styles.heading}>Description</h2>

//       <div className={styles.paraCont}>
//         {paragraphs.map((para, idx) => {
//           if (expanded) {
//             return <p key={idx}>{para}</p>;
//           }

//           if (usedChars >= CHAR_LIMIT) return null;

//           const remainingChars = CHAR_LIMIT - usedChars;

//           if (para.length <= remainingChars) {
//             usedChars += para.length;
//             return <p key={idx}>{para}</p>;
//           }

//           const truncated = para.slice(0, remainingChars);
//           usedChars = CHAR_LIMIT;

//           return <p key={idx}>{truncated}...</p>;
//         })}
//       </div>

//       {paragraphs.join("").length > CHAR_LIMIT && (
//         <button
//           className={styles.seeMoreBtn}
//           onClick={() => setExpanded(!expanded)}
//         >
//           {expanded ? "See less" : "See more"}
//         </button>
//       )}
//     </div>
//   );
// };

// export default DescriptionComponent;


"use client";
import React, { useState, useEffect } from "react";
import styles from "./DescriptionComponent.module.css";

const DescriptionComponent = () => {
  const [expanded, setExpanded] = useState(false);
  const [charLimit, setCharLimit] = useState(null);

  const paragraphs = [
    "Hotel size 200 rooms , Arranged over 6 floors. Barcelonia elegance with 6-star service. Simply elegant in all respects, this beautiful Parisian property offers a wonderful location that enhances your stay. Enjoy spacious rooms with great amenities and 6-star service from a superb team dedicated to making you feel like a VIP.",

    "The Peninsula Spa has 8 treatment rooms including couples treatment rooms. The palace's spa offers hot stone massages and treatments such as aromatherapy. Other on-site facilities include a steam room and a sauna.",

    "Pets. Pets stay for free (dogs and cats only, 1 total, up to 5 kg per pet. Service animals welcome",

    "Special check-in instructions. Front desk staff will greet guests on arrival at the property. Special check-in instructions. Front desk staff will greet guests on arrival at the property"
  ];

  // 🔹 screen-size based char limit
  useEffect(() => {
    const updateLimit = () => {
      const width = window.innerWidth;

      
        if (width <= 640) setCharLimit(489);
      else if(width<=1920){
        setCharLimit(730)
      }
      else setCharLimit(null); // desktop → no truncate
    };

    updateLimit();
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, []);

  let usedChars = 0;

  const shouldTruncate = charLimit !== null && !expanded;

  return (
    <div className={styles.DescriptionSection}>
      <h2 className={styles.heading}>Description</h2>

      <div className={styles.paraCont}>
        {paragraphs.map((para, idx) => {
          // desktop OR expanded → full text
          if (!shouldTruncate) {
            return <p key={idx}>{para}</p>;
          }

          if (usedChars >= charLimit) return null;

          const remaining = charLimit - usedChars;

          if (para.length <= remaining) {
            usedChars += para.length;
            return <p key={idx}>{para}</p>;
          }

          usedChars = charLimit;
          return <p key={idx}>{para.slice(0, remaining)}...</p>;
        })}
      </div>

      {charLimit !== null && (
        <button
          className={styles.seeMoreBtn}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
};

export default DescriptionComponent;

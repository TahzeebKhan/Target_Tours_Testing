// import React from "react";
// import styles from "./CabinBaggageInfo.module.css";

// const CabinBaggageInfo = () => {
//   return (
//     <div className={styles.wrapper}>
//       {/* Left icon */}
//       <div className={styles.iconBox}>
//         <img
//           src="/images/cabinBag.png"
//           alt="Cabin Bag"
//           className={styles.icon}
//         />
//       </div>

//       {/* Content */}
//       <div className={styles.content}>
//         <div className={styles.header}>
//           <h3>1× Cabin Bag</h3>
//           <span className={styles.included}>INCLUDED</span>
//         </div>

//         <ul className={styles.list}>
//           <li>Stored in the overhead compartment</li>
//           <li>
//             Max weight: <strong>7 kg</strong>
//           </li>
//           <li>
//             Max size: <strong>25 × 35 × 55 cm</strong>
//           </li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default CabinBaggageInfo;


import React from "react";
import styles from "./CabinBaggageInfo.module.css";

const CabinBaggageInfo = ({ data }) => {
  return (
    <div className={styles.wrapper}>
      {/* Left icon */}
      <div className={styles.iconBox}>
        <img
          src={data.icon}
          alt={data.title}
          className={styles.icon}
        />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.header}>
          <h3>{data.title}</h3>
          <span className={styles.included}>{data.status}</span>
        </div>

        <ul className={styles.list}>
          {data.points.map((item, index) => (
            <li key={index}>
              {item.label}
              {item.value && (
                <>
                  : <strong>{item.value}</strong>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CabinBaggageInfo;

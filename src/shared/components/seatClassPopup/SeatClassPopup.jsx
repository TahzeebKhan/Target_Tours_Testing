// "use client"
// import React, { useState } from 'react'
// import styles from './SeatClassPopup.module.css'

// const SeatClassPopup = ({ onClose, inputType }) => {

//     const CLASSES = [
//         "Economy",
//         "Premium Economy",
//         "Business",
//         "First-Class",
//     ];

//     const [value, setValue] = useState("Premium Economy");

//     const onChange = (value) => {
//         setValue(value);
//     };

//     return (
//         <div>
//             <div className={styles.overlay} onClick={onClose}>
//                 <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>

//                     {/* HEADER */}
//                     <div className={styles.header}>

//                         <div className={styles.inputRow}>
//                             <span className={styles.label}>{inputType}</span>

//                             <img src="/icons/Close.svg" alt="close" onClick={onClose} />
//                         </div>
//                         <div className={styles.selectedDate}>Premium Economy</div>
//                     </div>

//                     <div className={styles.container}>
//                         {CLASSES.map((item) => {
//                             const isActive = value === item;

//                             return (
//                                 <div
//                                     key={item}
//                                     className={styles.row}
//                                     onClick={() => onChange(item)}
//                                 >
//                                     <div
//                                         className={`${styles.radio} ${isActive ? styles.active : ""
//                                             }`}
//                                     >
//                                         {isActive && <div className={styles.dot} />}
//                                     </div>

//                                     <span className={styles.label}>
//                                         {item.toUpperCase()}
//                                     </span>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default SeatClassPopup

"use client";
import React from "react";
import styles from "./SeatClassPopup.module.css";

const CLASSES = [
    "Economy",
    "Premium Economy",
    "Business",
    "First-Class",
];

const SeatClassPopup = ({ value, onChange, onClose, inputType }) => {
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
                {/* HEADER */}
                <div className={styles.header}>
                    <div className={styles.inputRow}>
                        <span className={styles.label}>{inputType}</span>
                        <img
                            src="/icons/Close.svg"
                            alt="close"
                            onClick={onClose}
                        />
                    </div>

                    <div className={styles.selectedDate}>
                        {value.toUpperCase()}
                    </div>
                </div>

                {/* LIST */}
                <div className={styles.container}>
                    {CLASSES.map((item) => {
                        const isActive = value === item;

                        return (
                            <div
                                key={item}
                                className={styles.row}
                                onClick={() => onChange(item)}
                            >
                                <div
                                    className={`${styles.radio} ${isActive ? styles.active : ""
                                        }`}
                                >
                                    {isActive && (
                                        <div className={styles.dot} />
                                    )}
                                </div>

                                <span className={styles.label}>
                                    {item.toUpperCase()}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SeatClassPopup;

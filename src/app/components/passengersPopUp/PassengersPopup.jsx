"use client"
import React, { useEffect, useState } from 'react'
import styles from './PassengersPopup.module.css'

const PassengersPopup = ({ passengers, setPassengers, onClose, inputType }) => {
    const updateCount = (type, delta) => {
        setPassengers((prev) => {
            const value = Math.max(0, prev[type] + delta);
            if (type === "adult" && value < 1) return prev;
            return { ...prev, [type]: value };
        });
    };
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>

                {/* HEADER */}
                <div className={styles.header}>
                    <span className={styles.label}>{inputType}</span>
                    <div className={styles.inputRow}>
                        <div className={styles.selectedDate}>
                            {passengers.adult} Adult, {passengers.children} Children
                        </div>
                        <img src="/icons/Close.svg" alt="close" onClick={onClose} />
                    </div>
                </div>

                <div className={styles.container}>
                    {/* ADULT */}
                    <div className={styles.row}>
                        <div className={styles.leftText}>
                            <div className={styles.title}>ADULT</div>
                            <div className={styles.sub}>Adult (above 12 years old)</div>
                        </div>
                        <div className={styles.counter}>
                            <button className={styles.counterBtn} onClick={() => updateCount("adult", -1)}>-</button>
                            <span className={styles.counterText}>{passengers.adult}</span>
                            <button className={styles.counterBtn} onClick={() => updateCount("adult", 1)}>+</button>
                        </div>
                    </div>

                    {/* CHILDREN */}
                    <div className={styles.row}>
                        <div className={styles.leftText}>
                            <div className={styles.title}>CHILDREN</div>
                            <div className={styles.sub}>(2 - 11 years old)</div>
                        </div>
                        <div className={styles.counter}>
                            <button className={styles.counterBtn} onClick={() => updateCount("children", -1)}>-</button>
                            <span className={styles.counterText}>{passengers.children}</span>
                            <button className={styles.counterBtn} onClick={() => updateCount("children", 1)}>+</button>
                        </div>
                    </div>

                    {/* INFANT */}
                    <div className={styles.row}>
                        <div>
                            <div className={styles.title}>INFANT</div>
                            <div className={styles.sub}>(below 2 years old)</div>
                        </div>
                        <div className={styles.counter}>
                            <button className={styles.counterBtn} onClick={() => updateCount("infant", -1)}>-</button>
                            <span className={styles.counterText}>{passengers.infant}</span>
                            <button className={styles.counterBtn} onClick={() => updateCount("infant", 1)}>+</button>
                        </div>
                    </div>

                    <button className={styles.doneBtn} onClick={onClose}>
                        DONE
                    </button>
                </div>
            </div>
        </div>

    )
}

export default PassengersPopup
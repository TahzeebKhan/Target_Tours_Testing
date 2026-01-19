"use client";
import React, { useEffect, useState } from "react";
import styles from "./PassengersPopup.module.css";

const PassengersPopup = ({ passengers, setPassengers, onClose, inputType }) => {
  const updateCount = (type, delta) => {
    setPassengers((prev) => {
      const currentValue = Number(prev[type]) || 0;
      const newValue = Math.max(0, currentValue + delta);

      // Adult must be at least 1
      if (type === "adult" && newValue < 1) {
        return prev;
      }

      return {
        ...prev,
        [type]: newValue,
      };
    });
  };
  useEffect(() => {
    setPassengers((prev) => ({
      adult: Number(prev.adult) || 1,
      children: Number(prev.children) || 0,
      infant: Number(prev.infant) || 0,
    }));
  }, []);

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
              {passengers.adult} Adult, {passengers.children} Children, {passengers.infant} Infant
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
              <button
                disabled={passengers.adult <= 1}
                className={styles.counterBtn}
                onClick={() => updateCount("adult", -1)}
              >
                <svg
                  width="9"
                  height="2"
                  viewBox="0 0 9 2"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.5625 1.12496C0.403125 1.12496 0.269531 1.07104 0.161719 0.963188C0.0539063 0.855325 0 0.721675 0 0.562237C0 0.402787 0.0539063 0.269219 0.161719 0.161531C0.269531 0.0538436 0.403125 0 0.5625 0H7.68746C7.84684 0 7.98043 0.0539248 8.08824 0.161775C8.19606 0.269637 8.24996 0.403287 8.24996 0.562725C8.24996 0.722175 8.19606 0.855744 8.08824 0.963431C7.98043 1.07112 7.84684 1.12496 7.68746 1.12496H0.5625Z"
                    fill="#000033"
                  />
                </svg>
              </button>
              <span className={styles.counterText}>{passengers.adult}</span>
              <button
                className={styles.counterBtn}
                onClick={() => updateCount("adult", 1)}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.3125 5.43746H0.5625C0.403125 5.43746 0.269531 5.38354 0.161719 5.27569C0.0539063 5.16783 0 5.03418 0 4.87474C0 4.71529 0.0539063 4.58172 0.161719 4.47403C0.269531 4.36634 0.403125 4.3125 0.5625 4.3125H4.3125V0.5625C4.3125 0.403125 4.36642 0.269531 4.47427 0.161719C4.58214 0.0539063 4.71579 0 4.87523 0C5.03468 0 5.16824 0.0539063 5.27593 0.161719C5.38362 0.269531 5.43746 0.403125 5.43746 0.5625V4.3125H9.18746C9.34684 4.3125 9.48043 4.36643 9.58824 4.47428C9.69606 4.58214 9.74996 4.71579 9.74996 4.87523C9.74996 5.03468 9.69606 5.16824 9.58824 5.27593C9.48043 5.38362 9.34684 5.43746 9.18746 5.43746H5.43746V9.18746C5.43746 9.34684 5.38354 9.48043 5.27569 9.58824C5.16782 9.69606 5.03417 9.74996 4.87474 9.74996C4.71529 9.74996 4.58172 9.69606 4.47403 9.58824C4.36634 9.48043 4.3125 9.34684 4.3125 9.18746V5.43746Z"
                    fill="#000033"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* CHILDREN */}
          <div className={styles.row}>
            <div className={styles.leftText}>
              <div className={styles.title}>CHILDREN</div>
              <div className={styles.sub}>(2 - 11 years old)</div>
            </div>
            <div className={styles.counter}>
              <button
                disabled={passengers.children === 0}
                className={styles.counterBtn}
                onClick={() => updateCount("children", -1)}
              >
                <svg
                  width="9"
                  height="2"
                  viewBox="0 0 9 2"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.5625 1.12496C0.403125 1.12496 0.269531 1.07104 0.161719 0.963188C0.0539063 0.855325 0 0.721675 0 0.562237C0 0.402787 0.0539063 0.269219 0.161719 0.161531C0.269531 0.0538436 0.403125 0 0.5625 0H7.68746C7.84684 0 7.98043 0.0539248 8.08824 0.161775C8.19606 0.269637 8.24996 0.403287 8.24996 0.562725C8.24996 0.722175 8.19606 0.855744 8.08824 0.963431C7.98043 1.07112 7.84684 1.12496 7.68746 1.12496H0.5625Z"
                    fill="#000033"
                  />
                </svg>
              </button>
              <span className={styles.counterText}>{passengers.children}</span>
              <button
                className={styles.counterBtn}
                onClick={() => updateCount("children", 1)}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.3125 5.43746H0.5625C0.403125 5.43746 0.269531 5.38354 0.161719 5.27569C0.0539063 5.16783 0 5.03418 0 4.87474C0 4.71529 0.0539063 4.58172 0.161719 4.47403C0.269531 4.36634 0.403125 4.3125 0.5625 4.3125H4.3125V0.5625C4.3125 0.403125 4.36642 0.269531 4.47427 0.161719C4.58214 0.0539063 4.71579 0 4.87523 0C5.03468 0 5.16824 0.0539063 5.27593 0.161719C5.38362 0.269531 5.43746 0.403125 5.43746 0.5625V4.3125H9.18746C9.34684 4.3125 9.48043 4.36643 9.58824 4.47428C9.69606 4.58214 9.74996 4.71579 9.74996 4.87523C9.74996 5.03468 9.69606 5.16824 9.58824 5.27593C9.48043 5.38362 9.34684 5.43746 9.18746 5.43746H5.43746V9.18746C5.43746 9.34684 5.38354 9.48043 5.27569 9.58824C5.16782 9.69606 5.03417 9.74996 4.87474 9.74996C4.71529 9.74996 4.58172 9.69606 4.47403 9.58824C4.36634 9.48043 4.3125 9.34684 4.3125 9.18746V5.43746Z"
                    fill="#000033"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* INFANT */}
          <div className={styles.row}>
            <div>
              <div className={styles.title}>INFANT</div>
              <div className={styles.sub}>(below 2 years old)</div>
            </div>
            <div className={styles.counter}>
              <button
                disabled={passengers.infant === 0}
                className={styles.counterBtn}
                onClick={() => updateCount("infant", -1)}
              >
                <svg
                  width="9"
                  height="2"
                  viewBox="0 0 9 2"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.5625 1.12496C0.403125 1.12496 0.269531 1.07104 0.161719 0.963188C0.0539063 0.855325 0 0.721675 0 0.562237C0 0.402787 0.0539063 0.269219 0.161719 0.161531C0.269531 0.0538436 0.403125 0 0.5625 0H7.68746C7.84684 0 7.98043 0.0539248 8.08824 0.161775C8.19606 0.269637 8.24996 0.403287 8.24996 0.562725C8.24996 0.722175 8.19606 0.855744 8.08824 0.963431C7.98043 1.07112 7.84684 1.12496 7.68746 1.12496H0.5625Z"
                    fill="#000033"
                  />
                </svg>
              </button>
              <span className={styles.counterText}>{passengers.infant}</span>
              <button
                className={styles.counterBtn}
                onClick={() => updateCount("infant", 1)}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.3125 5.43746H0.5625C0.403125 5.43746 0.269531 5.38354 0.161719 5.27569C0.0539063 5.16783 0 5.03418 0 4.87474C0 4.71529 0.0539063 4.58172 0.161719 4.47403C0.269531 4.36634 0.403125 4.3125 0.5625 4.3125H4.3125V0.5625C4.3125 0.403125 4.36642 0.269531 4.47427 0.161719C4.58214 0.0539063 4.71579 0 4.87523 0C5.03468 0 5.16824 0.0539063 5.27593 0.161719C5.38362 0.269531 5.43746 0.403125 5.43746 0.5625V4.3125H9.18746C9.34684 4.3125 9.48043 4.36643 9.58824 4.47428C9.69606 4.58214 9.74996 4.71579 9.74996 4.87523C9.74996 5.03468 9.69606 5.16824 9.58824 5.27593C9.48043 5.38362 9.34684 5.43746 9.18746 5.43746H5.43746V9.18746C5.43746 9.34684 5.38354 9.48043 5.27569 9.58824C5.16782 9.69606 5.03417 9.74996 4.87474 9.74996C4.71529 9.74996 4.58172 9.69606 4.47403 9.58824C4.36634 9.48043 4.3125 9.34684 4.3125 9.18746V5.43746Z"
                    fill="#000033"
                  />
                </svg>
              </button>
            </div>
          </div>

          <button className={styles.doneBtn} onClick={onClose}>
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassengersPopup;

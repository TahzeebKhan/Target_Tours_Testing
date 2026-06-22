"use client";
import { useRef, useState } from "react";
import styles from "./ResultsBottomSheet.module.css";
import SortBySheet from "./SortBySheet";

const MIN_VH = 0;    // fully open
const MAX_VH = 65;   // closed

const ResultsBottomSheet = ({ children }) => {
  const [openSort, setOpenSort] = useState(false);
  const sheetRef = useRef(null);
  const startY = useRef(0);
  const lastTranslate = useRef(MAX_VH);

  const setTranslate = (vh) => {
    sheetRef.current.style.transform = `translateY(${vh}vh)`;
  };

  const onTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
    sheetRef.current.style.transition = "none";
  };

  const onTouchMove = (e) => {
    const deltaPx = e.touches[0].clientY - startY.current;
    const deltaVh = (deltaPx / window.innerHeight) * 100;

    let nextVh = lastTranslate.current + deltaVh;
    nextVh = Math.max(MIN_VH, Math.min(MAX_VH, nextVh));

    setTranslate(nextVh);
  };

  const onTouchEnd = (e) => {
    sheetRef.current.style.transition = "transform 0.35s ease";

    const endY = e.changedTouches[0].clientY;
    const movedPx = endY - startY.current;

    // 🔒 SNAP & SAVE POSITION
    if (movedPx < -80) {
      // dragged UP
      lastTranslate.current = MIN_VH;
    } else if (movedPx > 80) {
      // dragged DOWN
      lastTranslate.current = MAX_VH;
    }

    setTranslate(lastTranslate.current);
  };
  const closeSheet = () => {
  if (!sheetRef.current) return;

  sheetRef.current.style.transition = "transform 0.35s ease";
  lastTranslate.current = MAX_VH;
  setTranslate(MAX_VH);
};

  return (
    <>
      <div
        ref={sheetRef}
        className={styles.sheet}
        style={{ transform: `translateY(${MAX_VH}vh)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className={styles.headerCont}>
          <div className={styles.handleWrapper}>
            <div className={styles.handle}></div>
          </div>
          <div className={styles.filterContainer}>
            <span className={styles.resultsText}>500 Results</span>
            <div className={styles.FilterSorfCont}>
              <div className={styles.sortByText} onClick={() => setOpenSort(true)}>Sort by
                <img src="/icons/DownArrows.svg" alt="" />
              </div>

              <div className={styles.closeIcon} onClick={closeSheet}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15" stroke="#1A2029" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 5L15 15" stroke="#1A2029" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

              </div>
            </div>
          </div>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
      <SortBySheet
        open={openSort}
        onClose={() => setOpenSort(false)}
      />
    </>
  );
};

export default ResultsBottomSheet;

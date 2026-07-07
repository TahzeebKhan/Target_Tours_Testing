"use client";
import { useState } from "react";
import styles from "./ResultsBottomSheet.module.css";
import SortBySheet from "./SortBySheet";

const ResultsBottomSheet = ({
  children,
  resultsCount = 0,
  isLoading = false,
  onOpenFilters,
}) => {
  const [openSort, setOpenSort] = useState(false);

  return (
    <>
      <div className={styles.sheet}>
        <div className={styles.headerCont}>
          <div className={styles.filterContainer}>
            <span className={styles.resultsText}>
              {isLoading ? "Loading results" : `${resultsCount} Result${resultsCount === 1 ? "" : "s"}`}
            </span>
            <div className={styles.FilterSorfCont}>
              <button type="button" className={styles.filterText} onClick={onOpenFilters}>
                Filters
              </button>
              <div className={styles.sortByText} onClick={() => setOpenSort(true)}>Sort by
                <img src="/icons/DownArrows.svg" alt="" />
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

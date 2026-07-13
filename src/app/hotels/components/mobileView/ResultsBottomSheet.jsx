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
            <div className={styles.FilterSorfCont}>
              <button
                type="button"
                className={styles.filterText}
                onClick={onOpenFilters}
              >
                Filters
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  class="lucide lucide-list-filter-icon lucide-list-filter"
                >
                  <path d="M2 5h20" />
                  <path d="M6 12h12" />
                  <path d="M9 19h6" />
                </svg>
              </button>
              <div
                className={styles.sortByText}
                onClick={() => setOpenSort(true)}
              >
                Sort by
                <img src="/icons/DownArrows.svg" alt="" />
              </div>
              <button
                type="button"
                className={styles.viewInMap}
              >
                View in Maps
              </button>
            </div>
            <span className={styles.resultsText}>
              {isLoading
                ? "Loading results"
                : `${resultsCount} Result${resultsCount === 1 ? "" : "s"}`}
            </span>
          </div>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
      <SortBySheet open={openSort} onClose={() => setOpenSort(false)} />
    </>
  );
};

export default ResultsBottomSheet;

"use client";
import React from "react";
import styles from "./SearchResult.module.css";
import SortDropdown from "@/app/tour-list/components/sortDropdown/SortDropdown";

const SearchResults = ({
  viewType,
  setViewType,
  totalResults = 100,
  locationLabel = "this location",
  sort,
  setSort,
}) => {
  const placeName = locationLabel || "this location";
  const resultCount = Number(totalResults);
  const shouldShowCount = Number.isFinite(resultCount) && resultCount > 0;

  return (
    <div className={styles.searchResultsContainer}>
      <div className={styles.searchResultsLeft}>
        <div className={styles.result}>
          {shouldShowCount && <span>{resultCount}</span>} Properties in {placeName}
        </div>
      </div>

      <div className={styles.searchResultsRight}>
        <div className={styles.viewTypeContainer}>
       <span className={styles.viewType}>View by</span>

          {/* GRID VIEW */}
          <button
            onClick={() => setViewType("grid")}
            className={`${styles.viewTypeButtons} ${
              viewType === "grid" ? styles.activeView : ""
            }`}
          >
            <img src="/icons/cardView.svg" alt="Grid view" />
          </button>

          {/* LIST VIEW */}
          <button
            onClick={() => setViewType("list")}
            className={`${styles.viewTypeButtons} ${
              viewType === "list" ? styles.activeView : ""
            }`}
          >
            <img src="/icons/ListViewIcon.svg" alt="List view" />
          </button>
        </div>

        <SortDropdown value={sort} onChange={setSort} />
      </div>
    </div>
  );
};

export default SearchResults;

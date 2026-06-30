"use client";
import React from "react";
import styles from "./SearchResult.module.css";
import SortDropdown from "@/app/tour-list/components/sortDropdown/SortDropdown";

const SearchResults = ({
  viewType,
  setViewType,
  totalResults = 100,
  sort,
  setSort,
}) => {
  return (
    <div className={styles.searchResultsContainer}>
      <div className={styles.searchResultsLeft}>
        <div>
           Total  <span>{totalResults}</span> results
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

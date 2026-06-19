"use client";
import React, { useState } from "react";
import styles from "./SearchResult.module.css";
import SortDropdown from "@/app/tour-list/components/sortDropdown/SortDropdown";

const SearchResults = ({ viewType, setViewType, totalResults = 100 }) => {
  const [sort, setSort] = useState("recent");

  return (
    <div className={styles.searchResultsContainer}>
      <div className={styles.searchResultsLeft}>
        <div>
          Showing <span>{totalResults ? 1 : 0}</span> -{" "}
          <span>{Math.min(10, totalResults)}</span> of{" "}
          <span>{totalResults}</span> results
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

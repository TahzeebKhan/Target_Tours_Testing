"use client";
import React, { useState } from "react";
import styles from "./SearchResult.module.css";
import SortDropdown from "../sortDropdown/SortDropdown";

const SearchResults = () => {
  const [sort, setSort] = useState("recent");
  const [viewType, setViewType] = useState("grid"); // ✅ NEW

  return (
    <div className={styles.searchResultsContainer}>
      <div className={styles.searchResultsLeft}>
        <div>
          Showing <span>1</span> - <span>10</span> of <span>100</span> results
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

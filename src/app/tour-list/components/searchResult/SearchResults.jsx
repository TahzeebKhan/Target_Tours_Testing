"use client";
import React, { useContext, useState } from "react";
import styles from "./SearchResult.module.css";
import SortDropdown from "../sortDropdown/SortDropdown";
import { SidebarContext } from "../../SidebarContext";

const SearchResults = ({
  viewType,
  setViewType,
  startResult = 0,
  endResult = 0,
  totalResults = 0,
}) => {
  const [sort, setSort] = useState("recent");
  const { isSidebarOpen, setIsSidebarOpen, isTablet } =
    useContext(SidebarContext);


  return (
    <div className={styles.searchResultsContainer}>
      <div className={styles.searchResultsLeft}>
        <div>
          Showing <span>{startResult}</span> - <span>{endResult}</span> of{" "}
          <span>{totalResults}</span> results
        </div>
      </div>

      <div className={styles.searchResultsRight}>
        {isTablet && (
          <button
            className={styles.sidebarToggle}
            onClick={() => setIsSidebarOpen(prev => !prev)}
          >
            {isSidebarOpen ? "Hide Filters" : "Show Filters"}
          </button>
        )}
        <div className={styles.viewTypeContainer}>
          <span className={styles.viewType}>View by</span>

          {/* GRID VIEW */}
          <button
            onClick={() => setViewType("grid")}
            className={`${styles.viewTypeButtons} ${viewType === "grid" ? styles.activeView : ""
              }`}
          >
            <img src="/icons/cardView.svg" alt="Grid view" />
          </button>

          {/* LIST VIEW */}
          <button
            onClick={() => setViewType("list")}
            className={`${styles.viewTypeButtons} ${viewType === "list" ? styles.activeView : ""
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

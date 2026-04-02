"use client";
import React from "react";
import styles from './SuggestionBox.module.css'

const SuggestionBox = ({
  boxRef,
  heading = "RECENT SEARCH",
  suggestions = [],
  onSelect,
}) => {
  if (!suggestions.length) return null;

  return (
    <div ref={boxRef} className={styles.suggestionBox}>
      <div className={styles.recentSearchHeading}>{heading}</div>

      {suggestions.map((s, index) => (
        <button
          key={`${s.code || "na"}-${s.label || "na"}-${s.detail || "na"}-${index}`}
          className={styles.suggestionItem}
          onMouseDown={(e) => { e.preventDefault(); onSelect(s); }}
        >
          <div className={styles.suggestionText}>
            <div className={styles.suggestionLabel}>{s.label}</div>
            <div className={styles.suggestionDetail}>{s.detail}</div>
          </div>

          <div className={styles.suggestionCode}>{s.code}</div>
        </button>
      ))}
    </div>
  );
};

export default SuggestionBox;

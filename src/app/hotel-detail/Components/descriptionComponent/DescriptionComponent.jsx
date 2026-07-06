"use client";
import React, { useState, useEffect } from "react";
import styles from "./DescriptionComponent.module.css";

const DescriptionComponent = ({ description }) => {
  const [expanded, setExpanded] = useState(false);
  const [charLimit, setCharLimit] = useState(null);

  const fullText = String(description || "Hotel details are being updated.").trim();

  // 1. Check total word count from the raw text
  const words = fullText.split(/\s+/).filter(Boolean);
  const isLongText = words.length > 100; // Only truncate if total text > 100 words

  // 2. Split into clean paragraphs for rendering
  const paragraphs = fullText
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  // 3. Screen-size based character limit
  useEffect(() => {
    const updateLimit = () => {
      const width = window.innerWidth;

      if (width <= 640) {
        setCharLimit(489);
      } else if (width <= 1920) {
        setCharLimit(730);
      } else {
        setCharLimit(null); // desktop → no truncate
      }
    };

    updateLimit();
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, []);

  let usedChars = 0;

  // Truncate ONLY if:
  // - It's not expanded
  // - There is a character limit for this screen size
  // - The text actually meets your minimum length requirement (> 100 words)
  const shouldTruncate = charLimit !== null && !expanded && isLongText;

  return (
    <div className={styles.DescriptionSection}>
      <h2 className={styles.heading}>Description</h2>

      <div className={styles.paraCont}>
        {paragraphs.map((para, idx) => {
          // If we shouldn't truncate, render full paragraph
          if (!shouldTruncate) {
            return <p key={idx}>{para}</p>;
          }

          if (usedChars >= charLimit) return null;

          const remaining = charLimit - usedChars;

          if (para.length <= remaining) {
            usedChars += para.length;
            return <p key={idx}>{para}</p>;
          }

          usedChars = charLimit;
          return <p key={idx}>{para.slice(0, remaining)}...</p>;
        })}
      </div>

      {/* Only show the button if the text passes the 100-word mark AND the screen size has a limit */}
      {isLongText && charLimit !== null && (
        <button
          className={styles.seeMoreBtn}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
};

export default DescriptionComponent;
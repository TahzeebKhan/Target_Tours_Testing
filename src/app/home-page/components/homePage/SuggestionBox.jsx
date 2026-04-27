"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from './SuggestionBox.module.css'

const SuggestionBox = ({
  boxRef,
  anchorRef,
  heading = "RECENT SEARCH",
  suggestions = [],
  onSelect,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [placement, setPlacement] = useState("below");
  const [maxHeight, setMaxHeight] = useState(320);
  const localBoxRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    setActiveIndex(0);
    itemRefs.current = [];
  }, [suggestions]);

  useEffect(() => {
    const activeItem = itemRefs.current[activeIndex];
    activeItem?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  useLayoutEffect(() => {
    if (!suggestions.length) return;

    const updatePlacement = () => {
      const anchorRect =
        anchorRef?.current?.getBoundingClientRect() ||
        localBoxRef.current?.parentElement?.getBoundingClientRect();

      if (!anchorRect) return;

      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - anchorRect.bottom;
      const spaceAbove = anchorRect.top;
      const shouldOpenAbove = spaceBelow < 340 && spaceAbove > spaceBelow;
      const availableSpace = shouldOpenAbove ? spaceAbove : spaceBelow;

      setPlacement(shouldOpenAbove ? "above" : "below");
      setMaxHeight(Math.max(180, Math.min(360, availableSpace - 16)));
    };

    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);

    return () => {
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [anchorRef, suggestions]);

  useEffect(() => {
    if (!suggestions.length) return;

    const handleKeyDown = (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % suggestions.length);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) =>
          prev <= 0 ? suggestions.length - 1 : prev - 1
        );
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        onSelect?.(suggestions[activeIndex]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, onSelect, suggestions]);

  if (!suggestions.length) return null;

  return (
    <div
      ref={(node) => {
        localBoxRef.current = node;
        if (!boxRef) return;
        if (typeof boxRef === "function") {
          boxRef(node);
          return;
        }
        boxRef.current = node;
      }}
      className={`${styles.suggestionBox} ${
        placement === "above" ? styles.above : styles.below
      }`}
      style={{ maxHeight: `${maxHeight}px` }}
      role="listbox"
    >
      <div className={styles.recentSearchHeading}>{heading}</div>

      {suggestions.map((s, index) => (
        <button
          key={`${s.code || "na"}-${s.label || "na"}-${s.detail || "na"}-${index}`}
          ref={(element) => {
            itemRefs.current[index] = element;
          }}
          className={`${styles.suggestionItem} ${
            index === activeIndex ? styles.suggestionItemActive : ""
          }`}
          role="option"
          aria-selected={index === activeIndex}
          onMouseEnter={() => setActiveIndex(index)}
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

"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SortByDropdown.module.css";

const SORT_OPTIONS = [
  { label: "LOWEST PRICE", value: "lowest" },
  { label: "HIGHEST PRICE", value: "highest" },
  { label: "EARLIEST DEPARTURE", value: "early_dep" },
  { label: "LATEST DEPARTURE", value: "late_dep" },
  { label: "EARLIEST ARRIVAL", value: "early_arr" },
  { label: "SHORTEST DURATION", value: "shortest" },
  { label: "AIRLINE (A-Z)", value: "airline" },
];

export default function SortByDropdown({
  open,
  onClose,
  selectedValue = "lowest",
  onApply,
  anchorRef = null,
}) {
  const [selectedSort, setSelectedSort] = useState(selectedValue || "lowest");
  const [position, setPosition] = useState({});
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSelectedSort(selectedValue || "lowest");
  }, [selectedValue, open]);

  useEffect(() => {
    if (!open || !anchorRef?.current) return;

    const updatePosition = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      const dropdownWidth = 250;
      const viewportPadding = 16;
      const boundaryRect =
        anchorRef.current.closest("section")?.getBoundingClientRect() || {
          left: viewportPadding,
          right: window.innerWidth - viewportPadding,
        };
      const minLeft = Math.max(viewportPadding, boundaryRect.left);
      const maxLeft = Math.max(
        minLeft,
        Math.min(
          window.innerWidth - dropdownWidth - viewportPadding,
          boundaryRect.right - dropdownWidth
        )
      );
      const left = Math.min(
        Math.max(minLeft, rect.left),
        maxLeft
      );

      setPosition({
        top: rect.bottom + 10,
        left,
        width: dropdownWidth,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorRef, open]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      const clickedAnchor = anchorRef?.current?.contains(event.target);
      const clickedDropdown = dropdownRef.current?.contains(event.target);
      if (!clickedAnchor && !clickedDropdown) {
        onClose?.();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [anchorRef, onClose, open]);

  if (!open) return null;

  return (
    <div
      ref={dropdownRef}
      className={styles.dropdown}
      style={position}
      onClick={(event) => event.stopPropagation()}
    >
      <div className={styles.header}>
        <span className={styles.heading}>Sort By</span>
      </div>

      <div className={styles.options}>
        {SORT_OPTIONS.map((option) => (
          <label key={option.value} className={styles.optionItem}>
            <input
              type="radio"
              name="sort"
              checked={selectedSort === option.value}
              onChange={() => {
                setSelectedSort(option.value);
                onApply?.(option.value);
                onClose?.();
              }}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import styles from "./SortBySheet.module.css";
import { X } from "lucide-react";
import useLockBodyScroll from "@/app/hooks/useLockBodyScroll";

const SORT_OPTIONS = [
  { id: "lowest", label: "LOWEST PRICE" },
  { id: "highest", label: "HIGHEST PRICE" },
  { id: "early_dep", label: "EARLIEST DEPARTURE" },
  { id: "late_dep", label: "LATEST DEPARTURE" },
  { id: "early_arr", label: "EARLIEST ARRIVAL" },
  { id: "shortest", label: "SHORTEST DURATION" },
  { id: "airline", label: "AIRLINE (A–Z)" },
];

export default function SortBySheet({
  open,
  onClose,
  selectedValue = "lowest",
  onApply,
}) {
  const [selected, setSelected] = useState(selectedValue || "lowest");

  useEffect(() => {
    setSelected(selectedValue || "lowest");
  }, [selectedValue, open]);

  // lock background scroll
  useLockBodyScroll(open);
  if (!open) return null;

  return (
    <>
      {/* BLUR OVERLAY */}
      <div className={styles.overlay} onClick={onClose} />

      {/* BOTTOM SHEET */}
      <div className={styles.sheet}>
        {/* HEADER */}
        <div className={styles.header}>
          <span className={styles.title}>SORT BY</span>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* OPTIONS */}
        <div className={styles.options}>
          {SORT_OPTIONS.map((opt) => (
            <label key={opt.id} className={styles.radioRow}>
              <input
                type="radio"
                name="sort"
                checked={selected === opt.id}
                onChange={() => setSelected(opt.id)}
              />
              <span className={styles.customRadio} />
              {opt.label}
            </label>
          ))}
        </div>

        {/* ACTION BAR */}
        <div className={styles.actionBar}>
          <button
            onClick={() => setSelected("lowest")}
            className={styles.resetBtn}
          >
            RESET
          </button>
          <button
            className={styles.applyBtn}
            onClick={() => {
              onApply?.(selected || "lowest");
              onClose?.();
            }}
          >
            APPLY
          </button>
        </div>
      </div>
    </>
  );
}

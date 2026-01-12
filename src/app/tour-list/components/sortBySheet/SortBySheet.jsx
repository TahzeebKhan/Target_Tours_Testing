"use client";
import { useEffect, useState } from "react";
import styles from "./SortBySheet.module.css";
import { X } from "lucide-react";
import useLockBodyScroll from "@/app/hooks/useLockBodyScroll";

export default function SortBySheet({ open, onClose }) {
  const [selected, setSelected] = useState("");

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
          {[
            { id: "lowest", label: "LOWEST PRICE" },
            { id: "highest", label: "HIGHEST PRICE" },
            { id: "airline", label: "AIRLINE (A–Z)" },
          ].map((opt) => (
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
            onClick={() => setSelected("")}
            className={styles.resetBtn}
          >
            RESET
          </button>
          <button className={styles.applyBtn}>APPLY</button>
        </div>
      </div>
    </>
  );
}

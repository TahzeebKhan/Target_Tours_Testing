"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./selectTravellerProfile.module.css";

const profiles = [
  { id: "family", label: "Family", src: "/images/family.svg" },
  { id: "group", label: "Group", src: "/images/groupp.svg" },
  { id: "private", label: "Private", src: "/images/private.svg" },
  { id: "romantic", label: "Romantic", src: "/images/romantic.svg" },
];

export default function SelectTravellerProfile({ onClose }) {
  const [open, setOpen] = useState(true);
  const [selectedId, setSelectedId] = useState("family");

  // 🔒 Background scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const closeModal = () => {
    setOpen(false);
    onClose?.();
  };

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleReset = () => {
    setSelectedId(null);
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={closeModal}>
      <section
        className={styles.container}
        onClick={(e) => e.stopPropagation()} // prevent backdrop close
      >
        <header className={styles.header}>
          <div className={styles.topRow}>
            <div className={styles.breadcrumb}>
              <span className={styles.breadcrumbLabel}>
                TRAVELER PROFILES
              </span>
              <h2 className={styles.currentSelection}>
                {profiles.find((p) => p.id === selectedId)?.label || "Select"}
              </h2>
            </div>

            <button
              className={styles.closeButton}
              aria-label="Close"
              onClick={closeModal}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div className={styles.sectionWrapper}>
          <h1 className={styles.title}>SELECT YOUR TRAVELER PROFILE</h1>

          <div className={styles.grid}>
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className={`${styles.card} ${
                  selectedId === profile.id ? styles.active : ""
                }`}
                onClick={() => handleSelect(profile.id)}
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={profile.src}
                    alt={profile.label}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className={styles.image}
                  />

                  {selectedId === profile.id && (
                    <div className={styles.checkIcon}>
                      <Image
                        src="/images/check-white.svg"
                        alt="selected"
                        width={8}
                        height={8}
                      />
                    </div>
                  )}
                </div>

                <span className={styles.cardLabel}>{profile.label}</span>
              </div>
            ))}
          </div>
        </div>

        <footer className={styles.footer}>
          <button className={styles.resetButton} onClick={handleReset}>
            RESET
          </button>
          <button className={styles.searchButton} onClick={closeModal}>
            SEARCH
          </button>
        </footer>
      </section>
    </div>
  );
}

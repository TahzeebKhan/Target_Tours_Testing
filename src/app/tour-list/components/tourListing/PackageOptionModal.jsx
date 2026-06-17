"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import styles from "./TourListing.module.css";

const getOptionKey = (option) =>
  option?.optionKey ||
  `${option?.id}-${option?.with_flight ? "with" : "without"}`;

const PackageOptionModal = ({
  packageItem,
  options = [],
  getOptionAmount,
  getOptionPrice,
  onClose,
  onContinue,
}) => {
  const sortedOptions = useMemo(
    () =>
      options
        .slice()
        .sort((a, b) => Number(b.with_flight) - Number(a.with_flight)),
    [options]
  );
  const [selectedOptionKey, setSelectedOptionKey] = useState(null);

  useEffect(() => {
    if (!packageItem) return;

    const defaultOption =
      sortedOptions.find((option) => option.with_flight) ||
      sortedOptions[0] ||
      null;

    setSelectedOptionKey(defaultOption ? getOptionKey(defaultOption) : null);
  }, [packageItem, sortedOptions]);

  useEffect(() => {
    if (!packageItem) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [packageItem]);

  const selectedOption =
    sortedOptions.find((option) => getOptionKey(option) === selectedOptionKey) ||
    sortedOptions[0] ||
    null;

  return (
    <AnimatePresence>
      {packageItem && (
        <motion.div
          className={styles.optionOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.optionSheet}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.optionHeader}>
              <h3>Choose Your Travel Option</h3>
              <button
                type="button"
                className={styles.optionClose}
                onClick={onClose}
                aria-label="Close package options"
              >
                <X size={22} />
              </button>
            </div>

            <div className={styles.optionList}>
              {sortedOptions.map((option) => {
                const optionKey = getOptionKey(option);
                const isSelected = optionKey === selectedOptionKey;
                const inclusions = option.with_flight
                  ? ["Flight tickets", "Hotel stay", "Transfers", "Sightseeing"]
                  : ["Hotel stay", "Transfers", "Sightseeing"];

                return (
                  <button
                    type="button"
                    className={`${styles.optionCard} ${
                      isSelected ? styles.optionCardSelected : ""
                    }`}
                    key={optionKey}
                    onClick={() => setSelectedOptionKey(optionKey)}
                    aria-pressed={isSelected}
                  >
                    <div className={styles.optionContent}>
                      <div className={styles.optionTopRow}>
                        <div className={styles.optionTopRow}>
                          <span
                            className={`${styles.optionRadio} ${
                              isSelected ? styles.optionRadioSelected : ""
                            }`}
                            aria-hidden="true"
                          />

                          <div className={styles.optionText}>
                            <strong>
                              {option.with_flight ? "With Flight" : "Without Flight"}
                            </strong>
                            <span>
                              {option.with_flight
                                ? `Flights included${
                                    option.fromCity
                                      ? ` from ${option.fromCity}`
                                      : " from your city"
                                  }`
                                : "Normal package only"}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`${styles.optionBadge} ${
                            option.with_flight
                              ? styles.optionBadgePopular
                              : styles.optionBadgeBudget
                          }`}
                        >
                          {option.with_flight ? "Popular" : "Budget"}
                        </span>
                      </div>

                      <div className={styles.optionPrice}>
                        <span>Starting Price</span>
                        <strong>
                          {getOptionPrice(option)}
                          <small> / person</small>
                        </strong>
                      </div>

                      <div className={styles.optionIncludes}>
                        {inclusions.map((item) => (
                          <span key={item}>
                            <Check size={18} strokeWidth={3} />
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className={styles.optionFooter}>
              <button
                type="button"
                className={styles.optionCancel}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.optionContinue}
                disabled={!selectedOption}
                onClick={() =>
                  selectedOption &&
                  onContinue(
                    selectedOption.id,
                    selectedOption.with_flight,
                    getOptionAmount(selectedOption)
                  )
                }
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PackageOptionModal;

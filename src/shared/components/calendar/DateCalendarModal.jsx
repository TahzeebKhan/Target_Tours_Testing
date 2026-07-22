"use client";
import { useLayoutEffect, useRef, useState } from "react";
import styles from "./DateCalendarModal.module.css";

const MIN_FULL_CALENDAR_HEIGHT = 520;

export default function DateCalendarModal({
  mode, // "oneway" | "roundtrip"
  onModeChange,
  onClose,
  children,
  anchorEl,
  showModeToggle = true,
}) {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const [popupLayout, setPopupLayout] = useState({
    placement: "below",
    left: "0px",
    maxHeight: 520,
    visibility: "hidden",
  });

  useLayoutEffect(() => {
    const updatePosition = () => {
      const anchorRect =
        anchorEl?.getBoundingClientRect?.() ||
        overlayRef.current?.parentElement?.getBoundingClientRect();
      const modal = modalRef.current;

      if (!anchorRect || !modal) return;

      const gap = 8;
      const modalRect = modal.getBoundingClientRect();
      const modalWidth = Math.min(modalRect.width, window.innerWidth - 32);
      const fullCalendarHeight = Math.max(
        modal.scrollHeight,
        modalRect.height,
        MIN_FULL_CALENDAR_HEIGHT
      );
      const spaceBelow = window.innerHeight - anchorRect.bottom;
      const spaceAbove = anchorRect.top;
      const openAbove =
        spaceBelow < fullCalendarHeight + gap + 16 && spaceAbove > spaceBelow;
      const availableHeight = openAbove ? spaceAbove : spaceBelow;
      const maxHeight = Math.max(240, availableHeight - gap - 16);
      const clampedLeft = Math.min(
        Math.max(anchorRect.left, 16),
        window.innerWidth - modalWidth - 16
      );

      setPopupLayout({
        placement: openAbove ? "above" : "below",
        left: `${clampedLeft - anchorRect.left}px`,
        maxHeight: `${maxHeight}px`,
        visibility: "visible",
      });
    };

    updatePosition();
    const frameId = window.requestAnimationFrame(updatePosition);
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updatePosition);

    if (modalRef.current) {
      resizeObserver?.observe(modalRef.current);
    }

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorEl, children]);

  return (
    <div ref={overlayRef} className={styles.overlay} onClick={onClose}>
      <div
        ref={modalRef}
        className={`${styles.modal} ${
          popupLayout.placement === "above" ? styles.above : styles.below
        }`}
        data-calendar-modal="true"
        style={{
          left: popupLayout.left,
          maxHeight: popupLayout.maxHeight,
          visibility: popupLayout.visibility,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <h3>SET THE DATE</h3>

          {/* <button className={styles.close} onClick={onClose}>
            <X size={24} color="#8d7ac6ff" />
          </button> */}
          {showModeToggle && (
            <div className={styles.toggle} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={mode === "oneway" ? styles.active : ""}
                onClick={() => onModeChange("oneway")}
              >
                ONE WAY
              </button>
              <button
                type="button"
                className={mode === "roundtrip" ? styles.active : ""}
                onClick={() => onModeChange("roundtrip")}
              >
                ROUND TRIP
              </button>
            </div>
          )}
        </div>


        {/* Calendar Body */}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}

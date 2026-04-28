"use client";
import { useLayoutEffect, useRef, useState } from "react";
import styles from "./HotelDateCalendarModal.module.css";

const MIN_FULL_CALENDAR_HEIGHT = 520;

export default function HotelDateCalendarModal({
  mode, // "oneway" | "roundtrip"
  onModeChange,
  onClose,
  children,
  anchorEl,
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
    <div ref={overlayRef} className={styles.overlay}>
      <div
        ref={modalRef}
        className={`${styles.modal} ${
          popupLayout.placement === "above" ? styles.above : styles.below
        }`}
        style={{
          left: popupLayout.left,
          maxHeight: popupLayout.maxHeight,
          visibility: popupLayout.visibility,
        }}
      >
        

        {/* Calendar Body */}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}

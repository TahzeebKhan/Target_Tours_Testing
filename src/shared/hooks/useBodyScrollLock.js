"use client";

import { useEffect } from "react";

let lockCount = 0;
let previousOverflow = "";
let previousPaddingRight = "";

const getScrollbarWidth = () => {
  if (typeof window === "undefined") return 0;
  return window.innerWidth - document.documentElement.clientWidth;
};

export const useBodyScrollLock = (locked) => {
  useEffect(() => {
    if (!locked || typeof document === "undefined") return undefined;

    const { body } = document;
    const scrollbarWidth = getScrollbarWidth();

    if (lockCount === 0) {
      previousOverflow = body.style.overflow;
      previousPaddingRight = body.style.paddingRight;
      body.style.overflow = "hidden";

      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }

    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);

      if (lockCount === 0) {
        body.style.overflow = previousOverflow;
        body.style.paddingRight = previousPaddingRight;
      }
    };
  }, [locked]);
};

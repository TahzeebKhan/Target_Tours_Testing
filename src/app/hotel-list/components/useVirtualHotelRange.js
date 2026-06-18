"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const getInitialRange = (itemCount, columns, overscanRows) => ({
  startRow: 0,
  endRow: Math.min(Math.ceil(itemCount / columns) - 1, overscanRows),
});

const useVirtualHotelRange = ({
  itemCount,
  columns = 1,
  rowHeight = 600,
  overscanRows = 3,
}) => {
  const containerElementRef = useRef(null);
  const frameRef = useRef(null);
  const totalRows = Math.max(0, Math.ceil(itemCount / columns));
  const [range, setRange] = useState(() =>
    getInitialRange(itemCount, columns, overscanRows),
  );

  const updateRange = useCallback(() => {
    if (!totalRows) {
      setRange({ startRow: 0, endRow: -1 });
      return;
    }

    if (!containerElementRef.current) {
      setRange((prev) => {
        const initialRange = getInitialRange(itemCount, columns, overscanRows);
        return prev.startRow === initialRange.startRow &&
          prev.endRow === initialRange.endRow
          ? prev
          : initialRange;
      });
      return;
    }

    const rect = containerElementRef.current.getBoundingClientRect();
    const containerTop = rect.top + window.scrollY;
    const viewportTop = window.scrollY;
    const viewportBottom = viewportTop + window.innerHeight;
    const firstVisibleRow = Math.floor((viewportTop - containerTop) / rowHeight);
    const lastVisibleRow = Math.ceil((viewportBottom - containerTop) / rowHeight);
    const startRow = Math.max(0, firstVisibleRow - overscanRows);
    const endRow = Math.min(totalRows - 1, lastVisibleRow + overscanRows);

    setRange((prev) =>
      prev.startRow === startRow && prev.endRow === endRow
        ? prev
        : { startRow, endRow },
    );
  }, [columns, itemCount, overscanRows, rowHeight, totalRows]);

  const scheduleUpdate = useCallback(() => {
    if (frameRef.current) return;

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      updateRange();
    });
  }, [updateRange]);

  const containerRef = useCallback(
    (node) => {
      containerElementRef.current = node;
      if (node) {
        scheduleUpdate();
        window.setTimeout(updateRange, 0);
      }
    },
    [scheduleUpdate, updateRange],
  );

  useEffect(() => {
    updateRange();
  }, [itemCount, columns, rowHeight, updateRange]);

  useEffect(() => {
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);

      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [scheduleUpdate]);

  const startIndex = Math.min(itemCount, range.startRow * columns);
  const endIndex = Math.min(itemCount, (range.endRow + 1) * columns);

  return {
    containerRef,
    startIndex,
    endIndex,
    topPadding: range.startRow * rowHeight,
    bottomPadding: Math.max(0, (totalRows - range.endRow - 1) * rowHeight),
  };
};

export default useVirtualHotelRange;

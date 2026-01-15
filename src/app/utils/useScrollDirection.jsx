"use client"
import { useEffect, useState } from "react";

const useScrollDirection = () => {
  const [showHeader, setShowHeader] = useState(true);
  let lastScrollY = 0;

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // scroll down
        setShowHeader(false);
      } else {
        // scroll up
        setShowHeader(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return showHeader;
};

export default useScrollDirection;

import { useEffect } from "react";

export default function useLockBodyScroll(active) {
  useEffect(() => {
    if (!active) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalDocumentOverflow;
    };
  }, [active]);
}

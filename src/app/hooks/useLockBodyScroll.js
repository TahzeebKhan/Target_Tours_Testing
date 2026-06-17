import { useEffect } from "react";

let lockCount = 0;
let originalStyles = null;

export default function useLockBodyScroll(active) {
  useEffect(() => {
    if (!active) return;

    lockCount += 1;

    if (lockCount === 1) {
      originalStyles = {
        bodyOverflow: document.body.style.overflow,
        documentOverflow: document.documentElement.style.overflow,
      };

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1);

      if (lockCount !== 0 || !originalStyles) return;

      document.body.style.overflow = originalStyles.bodyOverflow;
      document.documentElement.style.overflow = originalStyles.documentOverflow;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      originalStyles = null;
    };
  }, [active]);
}

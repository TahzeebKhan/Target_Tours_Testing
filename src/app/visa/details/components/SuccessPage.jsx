"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./SuccessPage.module.css";

const SuccessPage = () => {
  const [clicked, setClicked] = useState(false);
  const [status, setStatus] = useState("");
  const timeoutRef = useRef(null);

  const handleTrack = useCallback(() => {
    setClicked(true);
    setStatus("Tracking this application...");
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setStatus("Tracking opened (simulated).");
      setClicked(false);
    }, 1400);
  }, []);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <section className={styles.container} aria-labelledby="success-title">
      <div className={styles.frame}>
        <div className={styles.topArea}>
          <div className={styles.checkWrap} aria-hidden>
            <div className={styles.checkCircle}>
              <svg width="46.5" height="46.5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 24l8 8 16-16" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className={styles.countryRow}>
            <span className={styles.flag} role="img" aria-label="Vietnam flag">
                <img src="/icons/vietnamFlag.svg" alt="Country Flag" />
            </span>
            <span className={styles.country}>Vietnam</span>
          </div>

          <h1 id="success-title" className={styles.title}>You're all set</h1>

          <p className={styles.subtitle}>
            Your application <strong>App_tfsrua2i</strong> has been received. Estimated Processing: <strong>3–5 Days</strong>.
          </p>
        </div>

        <div className={styles.plan}>
          <div className={styles.planInner}>
            <div className={styles.planHeader}>
              <span className={styles.planTitle}>What happens next</span>
              <span className={styles.dashedLine} />
            </div>

            <ol className={styles.planList}>
              <li>We submit your application to the destination's portal.</li>
              <li>Once approved, your e-visa PDF lands in your dashboard and inbox.</li>
            </ol>
          </div>
        </div>

        <div className={styles.ctaRow}>
          <button
            type="button"
            className={`${styles.button} ${clicked ? styles.buttonActive : ""}`}
            onClick={handleTrack}
            aria-pressed={clicked}
          >
            {clicked ? "TRACKING..." : "TRACK THIS APPLICATION"}
          </button>
        </div>

        {status && <p className={styles.status} role="status">{status}</p>}
      </div>
    </section>
  );
};

export default SuccessPage;
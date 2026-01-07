"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./PersonalData.module.css";

export default function PersonalData() {
  const [isRecommendationsActive, setIsRecommendationsActive] = useState(true);

  const toggleRecommendations = () => {
    setIsRecommendationsActive(!isRecommendationsActive);
  };

  return (
    <div className={styles.container}>
      {/* Customization Section */}
      <section className={styles.section}>
        <h2 className={styles.mainHeading}>Customization preferences</h2>
        <div className={styles.divider}></div>

        <div className={styles.settingsWrapper}>
          <div className={styles.row}>
            <div className={styles.textContent}>
              <h3 className={styles.subHeading}>CURRENCY</h3>
              <p className={styles.description}>
                Select your desired currency for transactions and price display,
                simplifying international use.
              </p>
            </div>
            <div className={styles.control}>
              <div className={styles.dropdown}>
                <span>$ U.S. dollar</span>
                <Image
                  src="/images/chevron-down-2.svg"
                  alt="Arrow"
                  width={12}
                  height={12}
                  className={styles.arrow}
                />
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.textContent}>
              <h3 className={styles.subHeading}>LANGUAGE</h3>
              <p className={styles.description}>
                Choose your preferred language for app display, enhancing your
                user experience.
              </p>
            </div>
            <div className={styles.control}>
              <div className={styles.dropdown}>
                <div className={styles.flagWrapper}>
                  <Image
                    src="/images/us.svg"
                    alt="US Flag"
                    width={20}
                    height={14}
                  />
                  <span>English (US)</span>
                </div>
                <Image
                  src="/images/chevron-down-2.svg"
                  alt="Arrow"
                  width={12}
                  height={12}
                  className={styles.arrow}
                />
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.textContent}>
              <h3 className={styles.subHeading}>
                PERSONALIZED RECOMMENDATIONS
              </h3>
              <p className={styles.description}>
                We personalize recommendations based on your activity. You can
                opt out anytime.
              </p>
            </div>
            <div className={styles.control}>
              <button
                className={`${styles.toggle} ${
                  isRecommendationsActive ? styles.toggleActive : ""
                }`}
                onClick={toggleRecommendations}
                aria-pressed={isRecommendationsActive}
              >
                <div className={styles.toggleCircle}></div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className={styles.section}>
        <h2 className={styles.mainHeading}>Security</h2>
        <div className={styles.divider}></div>

        <div className={styles.settingsWrapper}>
          <div className={styles.row}>
            <div className={styles.textContent}>
              <h3 className={styles.subHeading}>PASSWORD</h3>
              <p className={styles.description}>
                Easily update your password in settings to maintain account
                security and ensure privacy.
              </p>
            </div>
            <div className={styles.control}>
              <button className={styles.outlineButton}>SET PASSWORD</button>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.textContent}>
              <h3 className={styles.subHeading}>REMOVE ACCOUNT</h3>
              <p className={styles.description}>
                Delete your account through settings for complete removal of
                your data from the system.
              </p>
            </div>
            <div className={styles.control}>
              <button className={styles.deleteButton}>DELETE ACCOUNT</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

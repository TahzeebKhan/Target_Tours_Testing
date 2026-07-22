"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Claim.module.css";

export default function Claim() {
  const [activeIndex, setActiveIndex] = useState(0);

  const stats = [
    { label: "COUNTRIES COVERED", value: "150 +" },
    { label: "HAPPY TRAVELERS PROTECTED", value: "500K +" },
    { label: "CLAIMS APPROVAL RATE", value: "99.8%" },
    { label: "SUPPORT AVAILABILITY", value: "24 / 7" },
  ];

  return (
    <section className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.contentGrid}>
          {/* Left Column */}
          <div className={styles.leftCol}>
            <div className={styles.headerGroup}>
              <div className={styles.titleGroup}>
                <h2 className={styles.title}>No Fine Print.</h2>
                <h2 className={styles.title}>Just Reliable Protection.</h2>
              </div>
              <p className={styles.subtitle}>Trusted By Travelers Worldwide</p>
            </div>

            <div className={styles.statsGrid}>
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`${styles.statCard} ${
                    activeIndex === index ? styles.active : ""
                  }`}
                  onClick={() => setActiveIndex(index)}
                >
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>

            <div className={styles.buttonContainer}>
              <button className={styles.ctaButton}>
                100% DIGITAL CLAIMS PROCESS
              </button>
            </div>
          </div>

          {/* Right Column (Hero Card) */}
          <div className={styles.rightCol}>
            <div className={styles.heroCard}>
              <div className={styles.heroText}>
                <h3 className={styles.heroTitle}>
                  Average Claim Settlement Time
                </h3>
                <p className={styles.heroTime}>24 Hrs</p>
              </div>
              <div className={styles.imageWrapper}>
                <Image
                  src="/images/globe-plane.png"
                  alt="Globe and Airplane"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.divider}></div>

        {/* Footer Features */}
        <div className={styles.featuresGrid}>
          <div className={styles.featureItem}>
            <h4 className={styles.featureHeading}>NO COMPLEX PAPERWORK</h4>
            <p className={styles.featureText}>
              Simple online claims process with fast approval times. Get your
              money back quickly.
            </p>
          </div>
          <div className={styles.featureItem}>
            <h4 className={styles.featureHeading}>FLEXIBLE POLICIES</h4>
            <p className={styles.featureText}>
              Change your travel dates or destinations without penalties. We
              adapt to your needs.
            </p>
          </div>
          <div className={styles.featureItem}>
            <h4 className={styles.featureHeading}>INSTANT COVERAGE</h4>
            <p className={styles.featureText}>
              Get protected immediately after purchase. No waiting periods or
              delays.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./SelectPlan.module.css";

const SelectPlan = () => {
  const [selectedCoverage, setSelectedCoverage] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState("standard");

  const coverageOptions = [712000, 712000, 712000, 712000];

  const plans = [
    {
      id: "standard",
      title: "STANDARD PLAN",
      features: [
        { label: "Medical expenses upto", amount: "₹ 120,000" },
        { label: "Trip cancellation upto", amount: "₹ 95,000" },
        { label: "Loss/delay of baggage upto", amount: "₹ 110,000" },
        { label: "Medical expenses upto", amount: "₹ 130,000" },
      ],
      pricePerPerson: "1,66,945",
      totalPrice: "712,000",
    },
    {
      id: "premium",
      title: "PREMIUM PLAN",
      subtext: "Everything included from Standard Plan",
      features: [
        { label: "Medical expenses upto", amount: "₹ 85,000" },
        { label: "Trip cancellation upto", amount: "₹ 150,000" },
        { label: "Loss/delay of baggage upto", amount: "₹ 105,000" },
        { label: "Medical expenses upto", amount: "₹ 115,000" },
      ],
      pricePerPerson: "1,66,945",
      totalPrice: "712,000",
    },
  ];

  return (
    <div className={styles.container}>
      {/* Progress Bar */}
<nav className={styles.stepper}>
  {[
    "TRIP INFO",
    "CHOOSE PLAN",
    "PERSONAL DETAILS",
    "REVIEW & PAY",
  ].map((label, index) => {
    const isActive = index < 3; // adjust logic if needed

    return (
      <div key={label} className={styles.stepWrapper}>
        <span className={styles.stepLabel}>{label}</span>
        <div
          className={`${styles.stepDivider} ${
            isActive ? styles.stepDividerActive : ""
          }`}
        />
      </div>
    );
  })}
</nav>


      <header className={styles.header}>
        <h1 className={styles.title}>SELECT YOUR PLAN</h1>
        <p className={styles.subtitle}>
          Total Medical Coverage Amount (For 3 Travellers)
        </p>
      </header>

      {/* Coverage Tabs */}
      <div className={styles.coverageTabs}>
        {coverageOptions.map((amount, index) => (
          <button
            key={index}
            className={`${styles.coverageBtn} ${
              selectedCoverage === index ? styles.activeTab : ""
            }`}
            onClick={() => setSelectedCoverage(index)}
          >
            {index === 2 && (
              <span className={styles.recommendedBadge}>RECOMMENDED</span>
            )}
            ₹ {amount.toLocaleString("en-IN")}
          </button>
        ))}
      </div>

      {/* Plan Cards */}
      <section className={styles.plansGrid}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`${styles.planCard} ${
              selectedPlan === plan.id ? styles.selectedPlanCard : ""
            }`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <div className={styles.planHeader}>
              <div>
                <h2 className={styles.planTitle}>{plan.title}</h2>
                {plan.subtext && (
                  <p className={styles.planSubtext}>{plan.subtext}</p>
                )}
              </div>
              <div
                className={`${styles.radioCircle} ${
                  selectedPlan === plan.id ? styles.radioActive : ""
                }`}
              />
            </div>

            <ul className={styles.featureList}>
              {plan.features.map((feature, idx) => (
                <li key={idx} className={styles.featureItem}>
                  <Image
                    src="/icons/green-check.svg"
                    alt="check"
                    width={16}
                    height={16}
                  />

                    <span className={styles.featureText}>
                      <span className={styles.featureLabel}>
                        {feature.label}
                      </span>
                      <span className={styles.featureAmount}>
                        {feature.amount}
                      </span>
                    </span>
                </li>
              ))}
            </ul>

            <div className={styles.planFooter}>
              <div className={styles.priceSection}>
                <div className={styles.perPerson}>
                  <span className={styles.boldPrice}>
                    ₹ {plan.pricePerPerson}
                  </span>
                  <span className={styles.priceLabel}>/Person</span>
                </div>
                <div className={styles.totalPriceRow}>
                  <span className={styles.totalLabel}>TOTAL PRICE</span>
                  <span className={styles.totalAmount}>
                    ₹ {plan.totalPrice}
                  </span>
                </div>
              </div>
              <button className={styles.benefitsBtn}>See Benefits</button>
            </div>
          </div>
        ))}
      </section>

      {/* Info Footer */}
      <footer className={styles.infoBox}>
        <p>Pre-existing medical conditions are not covered.</p>
      </footer>
    </div>
  );
};

export default SelectPlan;

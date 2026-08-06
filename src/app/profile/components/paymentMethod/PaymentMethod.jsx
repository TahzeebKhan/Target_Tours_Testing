"use client";
import { useState } from "react";

import styles from "./PaymentMethod.module.css";
import ChoosePaymentMethod from "../choosePaymentMethod/ChoosePaymentMethod";

export default function PaymentMethod() {
  const [showChoosePayment, setShowChoosePayment] = useState(false);
  return (
    <main className={styles.container}>
      <div className={styles.contentWrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>Payment methods</h1>
          <p className={styles.subtitle}>
            Securely add or remove payment methods to make it easier when you
            book.
          </p>
        </header>

        <section className={styles.sectionGroup}>
          {/* Payment Methods Section */}
          {!showChoosePayment ? (
            <div className={styles.row}>
              <div className={styles.textContent}>
                <h2 className={styles.sectionTitle}>payment methods</h2>
                <p className={styles.description}>
                  Add a payment method using our secure payment system, then
                  start planning your next trip.
                </p>
              </div>
              <button
                className={styles.button}
                onClick={() => setShowChoosePayment(true)}
              >
                Add Payment Method
              </button>
            </div>
          ) : (
            <ChoosePaymentMethod />
          )}
          <div className={styles.br} />
          {/* Gift Credit Section */}
          <div className={styles.row}>
            <div className={styles.textContent}>
              <h2 className={styles.sectionTitle}>target tours gift credit</h2>
              <p className={styles.description}>
                Add gift credits to your Tripto account to enhance your travel
                experience.
              </p>
            </div>
            <button className={styles.button}>Add Gift Card</button>
          </div>
        </section>
      </div>

      {/* Coupons Section */}
      <footer className={styles.footerSection}>
        <div className={styles.row}>
          <div className={`${styles.textContent} ${styles.fullWidth}`}>
            <h2 className={styles.sectionTitle}>coupons</h2>
            <p className={styles.description}>Your copons</p>
          </div>

          <button className={styles.button}>Add Coupons</button>
        </div>
      </footer>
    </main>
  );
}

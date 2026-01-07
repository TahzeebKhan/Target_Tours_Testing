import styles from './PaymentMethod.module.css';

export default function PaymentMethod() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Payment methods</h1>
        <p className={styles.subtitle}>
          Securely add or remove payment methods to make it easier when you book.
        </p>
      </header>

      <section className={styles.sectionGroup}>
        {/* Payment Methods Section */}
        <div className={styles.row}>
          <div className={styles.textContent}>
            <h2 className={styles.sectionTitle}>PAYMENT METHODS</h2>
            <p className={styles.description}>
              Add a payment method using our secure payment system, then start planning your next trip.
            </p>
          </div>
          <button className={styles.button}>ADD PAYMENT METHOD</button>
        </div>

        {/* Gift Credit Section */}
        <div className={styles.row}>
          <div className={styles.textContent}>
            <h2 className={styles.sectionTitle}>TARGET TOURS GIFT CREDIT</h2>
            <p className={styles.description}>
              Add gift credits to your Tripto account to enhance your travel experience.
            </p>
          </div>
          <button className={styles.button}>ADD GIFT CARD</button>
        </div>
      </section>

      {/* Coupons Section */}
      <footer className={styles.footerSection}>
        <div className={styles.row}>
          <div className={styles.textContent}>
            <h2 className={styles.sectionTitle}>COUPONS</h2>
            <p className={styles.description}>Your copons</p>
          </div>
          <button className={styles.button}>ADD COPONS</button>
        </div>
      </footer>
    </main>
  );
}
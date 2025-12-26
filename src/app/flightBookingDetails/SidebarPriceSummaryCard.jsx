import styles from "./SidebarPriceSummaryCard.module.css";

export default function SidebarPriceSummaryCard() {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>PRICE SUMMARY</h3>

      <div className={styles.rowWraper}>
        <div className={styles.row}>
          <span>1x Adult</span>
          <span className={styles.price}>₹ 64,126</span>
        </div>

        <div className={styles.row}>
          <span>1x Cabin baggage</span>
          <span className={styles.success}>Included</span>
        </div>

        <div className={styles.row}>
          <span>1x Checked baggage 15kg</span>
          <span className={styles.success}>Included</span>
        </div>

        <div className={styles.row}>
          <span>Seat Selection</span>
          <span className={styles.success}>Free</span>
        </div>

        <div className={styles.row}>
          <span>Meals</span>
          <span className={styles.success}>Included</span>
        </div>

        <div className={styles.row}>
          <span>Taxes & Fees</span>
          <span className={styles.price}>₹2,819</span>
        </div>
      </div>

      {/* <div className={styles.divider} /> */}
      <div>
        <div className={styles.totalRow}>
          <span>Total Amount</span>
          <span className={styles.totalPrice}>₹ 66,945</span>
        </div>
        <p className={styles.note}>Includes taxes and service fees</p>
      </div>

      <div className={styles.help}>
        <p className={styles.helpTitle}>Need Help?</p>
        <p>Call: 1800-123-4567</p>
        <p>Email: support@airline.com</p>
        <p className={styles.chat}>Live Chat Available</p>
      </div>
    </div>
  );
}

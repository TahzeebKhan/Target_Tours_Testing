"use client"
import { useTourBooking } from "./TourBookingContext";
import styles from "./SidebarPriceSummaryCard.module.css";

export default function SidebarPriceSummaryCard() {
  const {
    packageDetails,
    packageBookingLoading,
    packagePaymentLoading,
    prices,
    currentStep,
    submitPackagePayment,
  } = useTourBooking();
  const travelerCount = prices.travelerCount || 1;
  const isProcessing = packageBookingLoading || packagePaymentLoading;

  const handleContinuePayment = async () => {
    if (isProcessing) return;
    await submitPackagePayment();
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>PRICE SUMMARY</h3>

      <div className={styles.rowWraper}>
        <div className={styles.row}>
          <span>{travelerCount}x Adult</span>
          <span className={styles.price}>₹ {prices.baseFare.toLocaleString()}</span>
        </div>

        {prices.baggage > 0 && (
          <div className={styles.row}>
            <span>Extra Baggage</span>
            <span className={styles.price}>₹ {prices.baggage.toLocaleString()}</span>
          </div>
        )}

        {prices.seats > 0 && (
          <div className={styles.row}>
            <span>Seat Selection</span>
            <span className={styles.price}>₹ {prices.seats.toLocaleString()}</span>
          </div>
        )}

        {prices.meals > 0 && (
          <div className={styles.row}>
            <span>Meals</span>
            <span className={styles.price}>₹ {prices.meals.toLocaleString()}</span>
          </div>
        )}

        <div className={styles.row}>
          <span>Taxes & Fees</span>
          <span className={styles.price}>₹{Number(packageDetails?.price?.taxes || 0).toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* <div className={styles.divider} /> */}
      <div>
        <div className={styles.totalRow}>
          <span>Total Amount</span>
          <span className={styles.totalPrice}>₹ {prices.total.toLocaleString()}</span>
        </div>
        <p className={styles.note}>Includes taxes and service fees</p>
      </div>
      {currentStep === 3 && (
        <>
          <button
            className={styles.bookNowBtn}
            disabled={isProcessing}
            onClick={handleContinuePayment}
          >
            {isProcessing ? "Processing..." : "Continue Payment"}
          </button>
          <div className={styles.safeBadge}>
            <img src="/images/secure.png" />
            <div className={styles.text}>
              <div className={styles.title}>Safe & Secure Payment</div>
              <div className={styles.content}>
                Your payment information is encrypted
              </div>
            </div>
          </div>
        </>
      )}

      <div className={styles.help}>
        <p className={styles.helpTitle}>Need Help?</p>
        <p>Call: 1800-123-4567</p>
        <p>Email: support@airline.com</p>
        <p className={styles.chat}>Live Chat Available</p>
      </div>
    </div>
  );
}

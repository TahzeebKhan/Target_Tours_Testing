"use client"
import { useFlightBooking } from "./FlightBookingContext";
import { getBookingPassengerCounts } from "@/features/flights/utils/flightBookingSession";
import styles from "./SidebarPriceSummaryCard.module.css";

const getPassengerCounts = (travelerDetails = [], bookingSession = null) => {
  if (Array.isArray(travelerDetails) && travelerDetails.length > 0) {
    return travelerDetails.reduce(
      (acc, traveler) => {
        const ptc = String(traveler?.PTC || "").toUpperCase();
        if (ptc === "CHD") acc.child += 1;
        else if (ptc === "INF") acc.infant += 1;
        else acc.adult += 1;
        return acc;
      },
      { adult: 0, child: 0, infant: 0 }
    );
  }

  return getBookingPassengerCounts(bookingSession);
};

const formatPassengerLabel = (counts) => {
  const parts = [];
  if (counts.adult > 0) parts.push(`${counts.adult}x Adult`);
  if (counts.child > 0) parts.push(`${counts.child}x Child`);
  if (counts.infant > 0) parts.push(`${counts.infant}x Infant`);
  return parts.join(", ") || "1x Adult";
};

export default function SidebarPriceSummaryCard() {
  const {
    prices,
    currentStep,
    submitItinerary,
    itineraryLoading,
    travelerDetails,
    bookingSession,
  } = useFlightBooking();
  const passengerCounts = getPassengerCounts(travelerDetails, bookingSession);
  const totalPassengers =
    passengerCounts.adult + passengerCounts.child + passengerCounts.infant || 1;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>PRICE SUMMARY</h3>

      <div className={styles.rowWraper}>
        <div className={styles.row}>
          <span>{formatPassengerLabel(passengerCounts)}</span>
          <span className={styles.price}>₹ {prices.baseFare.toLocaleString()}</span>
        </div>

        <div className={styles.row}>
          <span>{totalPassengers}x Cabin baggage</span>
          <span className={styles.success}>Included</span>
        </div>

        <div className={styles.row}>
          <span>{totalPassengers}x Checked baggage 15kg</span>
          <span className={styles.success}>Included</span>
        </div>

        {prices.baggage > 0 && (
          <div className={styles.row}>
            <span>Extra Baggage</span>
            <span className={styles.price}>₹ {prices.baggage.toLocaleString()}</span>
          </div>
        )}

        <div className={styles.row}>
          <span>Seat Selection</span>
          {prices.seats > 0 ? (
            <span className={styles.price}>₹ {prices.seats.toLocaleString()}</span>
          ) : (
            <span className={styles.success}>Free</span>
          )}
        </div>

        <div className={styles.row}>
          <span>Meals</span>
          {prices.meals > 0 ? (
            <span className={styles.price}>₹ {prices.meals.toLocaleString()}</span>
          ) : (
            <span className={styles.success}>Included</span>
          )}
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
          <span className={styles.totalPrice}>₹ {prices.total.toLocaleString()}</span>
        </div>
        <p className={styles.note}>Includes taxes and service fees</p>
      </div>
      {currentStep === 6 && (
        <>
          <button
            className={styles.bookNowBtn}
            onClick={submitItinerary}
            disabled={itineraryLoading}
          >
            {itineraryLoading ? "Loading..." : "Continue Payment"}
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

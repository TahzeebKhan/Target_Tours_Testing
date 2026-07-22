"use client";
import styles from "./PayWithOptions.module.css";

const gatewayMeta = {
  phonepe: {
    label: "PhonePe",
    icon: "/images/phonepeLogo.png",
  },
  razorpay: {
    label: "Razorpay",
    icon: "/images/razorpay-icon.png",
  },
};

const formatGatewayLabel = (gateway) =>
  gatewayMeta[gateway]?.label ||
  String(gateway || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const PayWithOptions = ({
  gateways = [],
  selected = "",
  loading = false,
  error = "",
  onChange,
}) => {
  const paymentMethods = gateways.length ? gateways : ["phonepe"];

  return (
    <div className={styles.wrapper}>
      {loading && <p className={styles.message}>Loading payment options...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {paymentMethods.map((method) => (
        <label
          key={method}
          className={`${styles.card} ${
            selected === method ? styles.active : ""
          }`}
        >
          <input
            type="radio"
            name="payment"
            checked={selected === method}
            onChange={() => onChange?.(method)}
          />

          {gatewayMeta[method]?.icon ? (
            <img src={gatewayMeta[method].icon} alt={method} />
          ) : (
            <span className={styles.gatewayBadge}>
              {formatGatewayLabel(method).slice(0, 2)}
            </span>
          )}

          <span>{formatGatewayLabel(method)}</span>
        </label>
      ))}
    </div>
  );
};

export default PayWithOptions;

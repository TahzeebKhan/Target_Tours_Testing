"use client";
import { useState } from "react";
import styles from "./PayWithOptions.module.css";

const paymentMethods = [
  {
    id: "card",
    label: "CREDIT OR DEBIT CARD",
    icon: "/images/card.png",
  },
  {
    id: "upi",
    label: "UPI",
    icon: "/images/UPI.png",
  },
  {
    id: "netbanking",
    label: "NET BANKING",
    icon: "/images/netbanking.png",
  },
];

const PayWithOptions = () => {
  const [selected, setSelected] = useState("card");

  return (
    <div className={styles.wrapper}>
      {paymentMethods.map((method) => (
        <label
          key={method.id}
          className={`${styles.card} ${
            selected === method.id ? styles.active : ""
          }`}
        >
          <input
            type="radio"
            name="payment"
            checked={selected === method.id}
            onChange={() => setSelected(method.id)}
          />

          <img src={method.icon} alt={method.id} />

          <span>{method.label}</span>
        </label>
      ))}
    </div>
  );
};

export default PayWithOptions;

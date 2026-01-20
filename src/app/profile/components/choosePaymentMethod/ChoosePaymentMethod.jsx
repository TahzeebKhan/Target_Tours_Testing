import Image from "next/image";
import styles from "./ChoosePaymentMethod.module.css";

const paymentMethods = [
  {
    id: 1,
    type: "Visa",
    lastFour: "1316",
    expiry: "06/2022",
    isDefault: true,
    logo: "/images/visa-logo.svg",
  },
  {
    id: 2,
    type: "MasterCard",
    lastFour: "2410",
    expiry: "06/2022",
    isDefault: false,
    logo: "/images/Mastercard.svg",
  },
];

export default function ChoosePaymentMethod() {
  return (
    <section className={styles.container}>
      {paymentMethods.map((method) => (
        <div
          key={method.id}
          className={`${styles.cardRow} ${method.id == 2 ? styles.cardRowLast : ""}`}
        >
          <div className={styles.cardBrand}>
            <div className={styles.logoWrapper}>
              <Image
                src={method.logo}
                alt={`${method.type} logo`}
                width={40}
                height={24}
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>

          <div className={styles.cardDetails}>
            <div className={styles.headerRow}>
              <div className={styles.cardTextWrapper}>
                <h3 className={styles.cardTitle}>
                  {method.type} .... {method.lastFour}
                </h3>

                <p className={styles.expiryText}>Expiration: {method.expiry}</p>
              </div>

              {method.isDefault && (
                <span className={styles.defaultBadge}>default</span>
              )}
            </div>
          </div>

          <button className={styles.actionButton} aria-label="More options">
            <span className={styles.dots}></span>
          </button>
        </div>
      ))}
    </section>
  );
}

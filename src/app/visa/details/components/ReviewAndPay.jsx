"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./ReviewAndPay.module.css";

const paymentMethods = [
  { key: "upi", label: "UPI" },
  { key: "cards", label: "Cards" },
  { key: "netbanking", label: "Net Banking" },
  { key: "wallets", label: "Wallets" },
  { key: "emi", label: "EMI" },
];

const upiApps = [
  { key: "googlePay", label: "Google Pay", image: "/icons/googlePay.svg" },
  { key: "phonePay", label: "Phone Pay", image: "/icons/phonePay.svg" },
  { key: "bhim", label: "BHIM UPI", image: "/icons/bhim.svg" },
  { key: "paytm", label: "PayTM", image: "/icons/paytm.svg" },
];

const netBanks = [
  { key: "hdfc", label: "HDFC Bank" },
  { key: "sbi", label: "State Bank of India" },
  { key: "icici", label: "ICICI Bank" },
  { key: "axis", label: "Axis Bank" },
];

const wallets = [
  { key: "phonepe", label: "PhonePe" },
  { key: "amazonPay", label: "Amazon Pay" },
  { key: "mobikwik", label: "Mobikwik" },
  { key: "paytm", label: "PayTM" },
];

const emiProviders = [
  { key: "hdfc", label: "HDFC Bank" },
  { key: "icici", label: "ICICI Bank" },
  { key: "axis", label: "Axis Bank" },
];

const initialPaymentData = {
  selectedMethod: "upi",
  upiApp: "googlePay",
  upiId: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvv: "",
  cardName: "",
  bank: "",
  walletName: "phonepe",
  walletId: "",
  emiProvider: "hdfc",
  emiTerm: "6 months",
};

const ReviewAndPay = () => {
  const [paymentData, setPaymentData] = useState(initialPaymentData);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const inputRefs = useRef({});

  useEffect(() => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      const element = inputRefs.current[firstKey];
      if (element && typeof element.focus === "function") {
        element.focus();
      }
    }
  }, [errors]);

  const handlePaymentMethodChange = useCallback((method) => {
    setPaymentData((prev) => ({ ...prev, selectedMethod: method }));
    setErrors({});
    setStatusMessage("");
  }, []);

  const handleInputChange = useCallback((field) => (event) => {
    const value = event.target.value;
    setPaymentData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setStatusMessage("");
  }, []);

  const handleOptionSelect = useCallback((field, value) => () => {
    setPaymentData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setStatusMessage("");
  }, []);

  const totalAmount = useMemo(() => {
    const base = 5000;
    const service = 1499;
    const gst = 449.82;
    return (base + service + gst).toFixed(2);
  }, []);

  const validatePayment = useCallback(() => {
    const nextErrors = {};
    const { selectedMethod } = paymentData;

    if (selectedMethod === "upi") {
      if (!paymentData.upiApp) {
        nextErrors.upiApp = "Select a UPI app.";
      }
      if (!paymentData.upiId.trim()) {
        nextErrors.upiId = "Enter your UPI ID.";
      } else if (!/^[\w.-]+@[\w.-]+$/.test(paymentData.upiId.trim())) {
        nextErrors.upiId = "Enter a valid UPI ID.";
      }
    }

    if (selectedMethod === "cards") {
      if (!paymentData.cardNumber.trim()) {
        nextErrors.cardNumber = "Enter card number.";
      } else if (!/^\d{16}$/.test(paymentData.cardNumber.trim())) {
        nextErrors.cardNumber = "Card number must be 16 digits.";
      }
      if (!paymentData.cardExpiry.trim()) {
        nextErrors.cardExpiry = "Enter expiry date.";
      } else if (!/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(paymentData.cardExpiry.trim())) {
        nextErrors.cardExpiry = "Expiry must be in MM/YY or MM/YYYY.";
      }
      if (!paymentData.cardCvv.trim()) {
        nextErrors.cardCvv = "Enter CVV.";
      } else if (!/^\d{3}$/.test(paymentData.cardCvv.trim())) {
        nextErrors.cardCvv = "CVV must be 3 digits.";
      }
      if (!paymentData.cardName.trim()) {
        nextErrors.cardName = "Enter card holder name.";
      }
    }

    if (selectedMethod === "netbanking") {
      if (!paymentData.bank) {
        nextErrors.bank = "Select your bank.";
      }
    }

    if (selectedMethod === "wallets") {
      if (!paymentData.walletName) {
        nextErrors.walletName = "Select a wallet.";
      }
      if (!paymentData.walletId.trim()) {
        nextErrors.walletId = "Enter wallet mobile or UPI ID.";
      }
    }

    if (selectedMethod === "emi") {
      if (!paymentData.emiProvider) {
        nextErrors.emiProvider = "Select EMI provider.";
      }
      if (!paymentData.emiTerm) {
        nextErrors.emiTerm = "Select EMI term.";
      }
    }

    return nextErrors;
  }, [paymentData]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const nextErrors = validatePayment();
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        setStatusMessage("");
        return;
      }

      setErrors({});
      setStatusMessage(
        "Payment request submitted successfully. Complete the selected payment flow to finish the booking.",
      );
    },
    [validatePayment],
  );

  const paymentContent = useMemo(() => {
    const method = paymentData.selectedMethod;

    if (method === "upi") {
      return (
        <div className={styles.methodContent}>
          <div className={styles.appGrid}>
            {upiApps.map((app) => (
              <button
                key={app.key}
                type="button"
                className={`${styles.appCard} ${
                  paymentData.upiApp === app.key ? styles.appCardActive : ""
                }`}
                onClick={handleOptionSelect("upiApp", app.key)}
              >
                <div className={styles.appRow}>
                  <span className={styles.appLogo}><img src={app.image} alt="upiImage" /></span>
                  <span className={styles.appLabel}>{app.label}</span>
                </div>
                <span className={styles.radioOuter}>
                  <span
                    className={`${styles.radioInner} ${
                      paymentData.upiApp === app.key ? styles.radioSelected : ""
                    }`}
                  />
                </span>
              </button>
            ))}
          </div>
          <div className={styles.orRow}>
            <span className={styles.divider} />
            <span className={styles.orText}>OR</span>
            <span className={styles.divider} />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="upiId" className={styles.inputLabel}>
              Enter UPI ID
            </label>
            <input
              id="upiId"
              name="upiId"
              type="text"
              value={paymentData.upiId}
              onChange={handleInputChange("upiId")}
              placeholder="yourname@bank"
              className={styles.textInput}
              ref={(el) => {
                inputRefs.current.upiId = el;
              }}
            />
            {errors.upiId && <span className={styles.errorText}>{errors.upiId}</span>}
            <p className={styles.helpText}>
              A collect request will be sent to your UPI app.
            </p>
          </div>
        </div>
      );
    }

    if (method === "cards") {
      return (
        <div className={styles.methodContent}>
          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="cardNumber" className={styles.inputLabel}>
                Card Number
              </label>
              <input
                id="cardNumber"
                name="cardNumber"
                type="text"
                inputMode="numeric"
                value={paymentData.cardNumber}
                onChange={handleInputChange("cardNumber")}
                placeholder="1234 5678 9012 3456"
                className={styles.textInput}
                ref={(el) => {
                  inputRefs.current.cardNumber = el;
                }}
              />
              {errors.cardNumber && (
                <span className={styles.errorText}>{errors.cardNumber}</span>
              )}
            </div>
            <div className={styles.rowGroup}>
              <div className={styles.inputGroupSmall}>
                <label htmlFor="cardExpiry" className={styles.inputLabel}>
                  Expiry
                </label>
                <input
                  id="cardExpiry"
                  name="cardExpiry"
                  type="text"
                  value={paymentData.cardExpiry}
                  onChange={handleInputChange("cardExpiry")}
                  placeholder="MM/YY"
                  className={styles.textInput}
                  ref={(el) => {
                    inputRefs.current.cardExpiry = el;
                  }}
                />
                {errors.cardExpiry && (
                  <span className={styles.errorText}>{errors.cardExpiry}</span>
                )}
              </div>
              <div className={styles.inputGroupSmall}>
                <label htmlFor="cardCvv" className={styles.inputLabel}>
                  CVV
                </label>
                <input
                  id="cardCvv"
                  name="cardCvv"
                  type="password"
                  inputMode="numeric"
                  value={paymentData.cardCvv}
                  onChange={handleInputChange("cardCvv")}
                  placeholder="123"
                  className={styles.textInput}
                  ref={(el) => {
                    inputRefs.current.cardCvv = el;
                  }}
                />
                {errors.cardCvv && (
                  <span className={styles.errorText}>{errors.cardCvv}</span>
                )}
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="cardName" className={styles.inputLabel}>
                Name on Card
              </label>
              <input
                id="cardName"
                name="cardName"
                type="text"
                value={paymentData.cardName}
                onChange={handleInputChange("cardName")}
                placeholder="Enter card holder name"
                className={styles.textInput}
                ref={(el) => {
                  inputRefs.current.cardName = el;
                }}
              />
              {errors.cardName && (
                <span className={styles.errorText}>{errors.cardName}</span>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (method === "netbanking") {
      return (
        <div className={styles.methodContent}>
          <div className={styles.inputGroup}>
            <label htmlFor="bank" className={styles.inputLabel}>
              Select Bank
            </label>
            <select
              id="bank"
              name="bank"
              value={paymentData.bank}
              onChange={handleInputChange("bank")}
              className={styles.selectInput}
              ref={(el) => {
                inputRefs.current.bank = el;
              }}
            >
              <option value="">Choose your bank</option>
              {netBanks.map((bank) => (
                <option key={bank.key} value={bank.key}>
                  {bank.label}
                </option>
              ))}
            </select>
            {errors.bank && <span className={styles.errorText}>{errors.bank}</span>}
          </div>
          <div className={styles.helpTextBlock}>
            <p className={styles.helpText}>
              You will be redirected to your selected bank for secure payment.
            </p>
          </div>
        </div>
      );
    }

    if (method === "wallets") {
      return (
        <div className={styles.methodContent}>
          <div className={styles.appGrid}>
            {wallets.map((wallet) => (
              <button
                key={wallet.key}
                type="button"
                className={`${styles.appCard} ${
                  paymentData.walletName === wallet.key ? styles.appCardActive : ""
                }`}
                onClick={handleOptionSelect("walletName", wallet.key)}
              >
                <div className={styles.appRow}>
                  <span className={styles.appLogo}>{wallet.label[0]}</span>
                  <span className={styles.appLabel}>{wallet.label}</span>
                </div>
                <span className={styles.radioOuter}>
                  <span
                    className={`${styles.radioInner} ${
                      paymentData.walletName === wallet.key ? styles.radioSelected : ""
                    }`}
                  />
                </span>
              </button>
            ))}
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="walletId" className={styles.inputLabel}>
              Wallet mobile number / UPI ID
            </label>
            <input
              id="walletId"
              name="walletId"
              type="text"
              value={paymentData.walletId}
              onChange={handleInputChange("walletId")}
              placeholder="Enter linked wallet ID"
              className={styles.textInput}
              ref={(el) => {
                inputRefs.current.walletId = el;
              }}
            />
            {errors.walletId && (
              <span className={styles.errorText}>{errors.walletId}</span>
            )}
          </div>
        </div>
      );
    }

    if (method === "emi") {
      return (
        <div className={styles.methodContent}>
          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="emiProvider" className={styles.inputLabel}>
                EMI Provider
              </label>
              <select
                id="emiProvider"
                name="emiProvider"
                value={paymentData.emiProvider}
                onChange={handleInputChange("emiProvider")}
                className={styles.selectInput}
                ref={(el) => {
                  inputRefs.current.emiProvider = el;
                }}
              >
                {emiProviders.map((provider) => (
                  <option key={provider.key} value={provider.key}>
                    {provider.label}
                  </option>
                ))}
              </select>
              {errors.emiProvider && (
                <span className={styles.errorText}>{errors.emiProvider}</span>
              )}
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="emiTerm" className={styles.inputLabel}>
                EMI Term
              </label>
              <select
                id="emiTerm"
                name="emiTerm"
                value={paymentData.emiTerm}
                onChange={handleInputChange("emiTerm")}
                className={styles.selectInput}
                ref={(el) => {
                  inputRefs.current.emiTerm = el;
                }}
              >
                <option value="6 months">6 months</option>
                <option value="9 months">9 months</option>
                <option value="12 months">12 months</option>
              </select>
              {errors.emiTerm && (
                <span className={styles.errorText}>{errors.emiTerm}</span>
              )}
            </div>
          </div>
          <div className={styles.helpTextBlock}>
            <p className={styles.helpText}>
              EMI plans are subject to bank approval. Your monthly amount will be shown on the next screen.
            </p>
          </div>
        </div>
      );
    }

    return null;
  }, [paymentData, errors, handleInputChange, handleOptionSelect]);

  return (
    <section className={styles.reviewContainer}>
      <div className={styles.pageFrame}>
        <div className={styles.headerInfo}>
          <div className={styles.locationTag}>
            <span className={styles.locationDot}>
                <img src="/icons/vietnamFlag.svg" alt="" />
            </span>
            <span className={styles.locationText}>Vietnam</span>
          </div>
          <div className={styles.titleBlock}>
            <h1 className={styles.pageTitle}>Review and Pay</h1>
            <p className={styles.subtitle}>
              Confirm and sign off. Instant Razorpay & UPI endpoints integrated Below in compliance with active sandbox protocols.
            </p>
          </div>
        </div>

        <div className={styles.planCard}>
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Application Summary</span>
              <span className={styles.sectionDivider} />
            </div>
            <div className={styles.fieldGrid}>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>Full Name</span>
                <span className={styles.fieldValue}>Sarah Johnson</span>
              </div>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>Nationality</span>
                <span className={styles.fieldValue}>Indian</span>
              </div>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>Passport Number</span>
                <span className={styles.fieldValue}>A1234567</span>
              </div>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>Date of Birth</span>
                <span className={styles.fieldValue}>14 Mar 1990</span>
              </div>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>Gender</span>
                <span className={styles.fieldValue}>Female</span>
              </div>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>Phone</span>
                <span className={styles.fieldValue}>+91 98765 43210</span>
              </div>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>Visa Type</span>
                <span className={styles.fieldValue}>Tourist Visa</span>
              </div>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>Issuing Authority</span>
                <span className={styles.fieldValue}>Ministry of External Affairs</span>
              </div>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>Place of Issue</span>
                <span className={styles.fieldValue}>New Delhi</span>
              </div>
            </div>
          </div>

          <div className={`${styles.sectionBlock} ${styles.documentBlock}`}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Uploaded Documents</span>
              <span className={styles.sectionDivider} />
            </div>
            <div className={styles.documentsGrid}>
              <div className={styles.documentItem}>
                <span className={styles.documentIcon}>
                  <span className={styles.checkMark}>✓</span>
                </span>
                <span className={styles.documentLabel}>Passport Copy</span>
                <span className={styles.documentStatus}>VERIFIED</span>
              </div>
              <div className={styles.documentItem}>
                <span className={styles.documentIcon}>
                  <span className={styles.checkMark}>✓</span>
                </span>
                <span className={styles.documentLabel}>Recent Photograph</span>
                <span className={styles.documentStatus}>VERIFIED</span>
              </div>
            </div>
          </div>

          <div className={`${styles.sectionBlock} ${styles.priceBlock}`}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Price Breakdown</span>
              <span className={styles.sectionDivider} />
            </div>
            <div className={styles.priceList}>
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>Government / Embassy Visa Fee</span>
                <span className={styles.priceValue}>₹ 5,000.00</span>
              </div>
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>Service Fee</span>
                <span className={styles.priceValue}>₹ 1,499.00</span>
              </div>
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>GST (18%)</span>
                <span className={styles.priceValue}>₹ 449.82</span>
              </div>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Final Total Amount</span>
                <span className={styles.totalValue}>₹ {totalAmount}</span>
              </div>
            </div>
          </div>

          <form className={styles.paymentCard} onSubmit={handleSubmit} noValidate>
            <div className={styles.paymentHeader}>
              <span className={styles.paymentTitle}>Payment Method</span>
              <span className={styles.paymentSubtitle}>Choose your desired payment method</span>
            </div>
            <div className={styles.tabsContainer}>
              {paymentMethods.map((method) => (
                <button
                  key={method.key}
                  type="button"
                  className={`${styles.tabItem} ${
                    paymentData.selectedMethod === method.key ? styles.activeTab : ""
                  }`}
                  onClick={() => handlePaymentMethodChange(method.key)}
                >
                  {method.label}
                </button>
              ))}
            </div>
            <div className={styles.tabDivider} />
            {paymentContent}
            <div className={styles.footerRow}>
              <button type="button" className={styles.backButton} onClick={() => window.history.back()}>
                ← Back To Form
              </button>
              <button type="submit" className={styles.payButton}>
                PAY ₹ {totalAmount}
              </button>
            </div>
            {statusMessage && <p className={styles.statusMessage}>{statusMessage}</p>}
          </form>
        </div>
      </div>
    </section>
  );
};

export default ReviewAndPay;

"use client";
import { useState } from "react";
// import { useFlightBooking } from "./FlightBookingContext";
import styles from "./CorporateSidebarSummary.module.css";
import RequestBudgetModal from "@/shared/components/corporate/RequestBudgetModal";

export default function CorporateSidebarSummary() {
  const [showRequestBudgetModal, setShowRequestBudgetModal] = useState(false);
  const isOutOfBudget = true;
  return (
    <>
      <div className={styles.card}>
        <h3 className={styles.title}>Booking Budget Summary</h3>
        <p className="font-light text-[12px] text-[#4A5565] leading-5 mt-[-14px]  ">
          Budget allocated for this booking by your organization
        </p>

        <div className={styles.rowWraper}>
          <div className={styles.row}>
            <span>Allocated Budget</span>
            <span className={styles.price}>₹ 10,000</span>
          </div>

          <div className={styles.row}>
            <span>Current Booking Amount</span>
            {/* <span className={styles.success}>Included</span> */}
            <span className={styles.price}>₹ 6,945</span>
          </div>
        </div>

        {/* <div className={styles.divider} /> */}
        <div>
          <div className={styles.totalRow}>
            <span>Remaining Balance</span>
            <span
              className={`${styles.totalPrice} ${isOutOfBudget ? styles.redText : ""} `}
            >
              ₹ 8,055
            </span>
          </div>
        </div>
        <div className={`${styles.widthingLimitDiv} ${styles.outOfBudgetDiv}`}>
          <div className={styles.topRow}>
            {isOutOfBudget ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_7395_25526)">
                  <path
                    d="M9.99935 18.3333C14.6017 18.3333 18.3327 14.6024 18.3327 10C18.3327 5.39763 14.6017 1.66667 9.99935 1.66667C5.39698 1.66667 1.66602 5.39763 1.66602 10C1.66602 14.6024 5.39698 18.3333 9.99935 18.3333Z"
                    stroke="#F97316"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 6.66667V10"
                    stroke="#F97316"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 13.3333H10.0083"
                    stroke="#F97316"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_7395_25526">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_7395_25366)">
                  <path
                    d="M9.99935 18.3333C14.6017 18.3333 18.3327 14.6024 18.3327 9.99999C18.3327 5.39762 14.6017 1.66666 9.99935 1.66666C5.39698 1.66666 1.66602 5.39762 1.66602 9.99999C1.66602 14.6024 5.39698 18.3333 9.99935 18.3333Z"
                    stroke="#059669"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.5 10L9.16667 11.6667L12.5 8.33334"
                    stroke="#059669"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_7395_25366">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            )}

            <p className={`${isOutOfBudget ? styles.exceedingBy : ""}`}>
              {isOutOfBudget
                ? "Budget Exceeded by ₹ 6,945"
                : " Within Approved Budget"}
            </p>
          </div>
          <div
            className={`${styles.bottomRow} ${isOutOfBudget ? styles.bottomRowExceedignBufget : ""}`}
          >
            {isOutOfBudget
              ? "Manager approval required to proceed with booking"
              : " Your booking is within the allocated budget"}
          </div>
        </div>
        {isOutOfBudget && (
          <button
            onClick={() => setShowRequestBudgetModal(true)}
            className={`${styles.requestBtn}`}
          >
            Request Additional Budget
          </button>
        )}
        <button className={styles.modifyBtn}>modify booking</button>
      </div>

      {showRequestBudgetModal && (
        <RequestBudgetModal
          remainingBudget="2,00,000"
          onClose={() => setShowRequestBudgetModal(false)}
        />
      )}
    </>
  );
}

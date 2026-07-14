"use client";
import React from 'react'

import { useRouter } from "next/navigation";
import styles from "./VisaDetailsHeader.module.css";


const VisaDetailsHeader = () => {

    const router = useRouter();

  return (
     <div className={styles.visaHeader}>
        <div className={styles.leftSection}>
          <button className={styles.cancelButton} onClick={() => router.push("/visa/details")} >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M11.667 5L6.667 10L11.667 15"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7.5 10H15"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>

            <span>Cancel Application</span>
          </button>
        </div>

        <div className={styles.rightSection}>
          <h3>Vietnam E-Visa</h3>

          <div className={styles.countryFlag}>
            <img src="/icons/vietnamFlagIcon.svg" alt="Vietnam Flag" />
          </div>
        </div>
      </div>

  )
}

export default VisaDetailsHeader
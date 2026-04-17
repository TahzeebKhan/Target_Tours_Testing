"use client";

import styles from "./CancellationPolicy.module.css";

export default function CancellationPolicy() {
    return (
        <div className={styles.wrapper}>
            {/* Top Info */}
            <div className={styles.topInfo}>
                <p className={styles.mainText}>
                    Cancellation Possible till 23rd Apr.*
                </p>
                <p className={styles.subText}>
                    After that Package is <strong>Non-Refundable.</strong>
                </p>
            </div>

            {/* Penalty Row */}
            <div className={styles.penaltyContainer}>
                <div className={styles.penaltyRow}>
                    <div className={styles.left}>
                        <span className={styles.label}>Cancellation Penalty:</span>
                    </div>
                    <div className={styles.right}>
                        <span className={styles.amount}>₹ 2,849</span>
                        <span className={styles.nonRefundable}>Non-Refundable</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className={styles.progressBarContainer}>
                    <div className={styles.leftProgress}></div>
                    <div className={styles.progressBar}></div>
                </div>

                {/* Date Row */}
                <div className={styles.dateRow}>
                    <span className={styles.label}>
                        Cancel Between(IST):
                    </span>
                    <div className={styles.right}>
                        <span className={styles.till}>Till 23 Apr 26</span>
                        <span className={styles.time}>12 Jan <span> 04:45</span></span>
                    </div>
                </div>
            </div>

            {/* Notes */}
            <ul className={styles.notes}>
                <li>
                    These are non-refundable amounts as per the current policy attached.
                    In the case of component change/modifications, the policy will change
                    accordingly.
                </li>
                <li>
                    Please note, TCS once collected cannot be refunded in case of any
                    cancellation / modification. You can claim the TCS amount as adjustment
                    against Income Tax payable at the time of filing the return of income.
                </li>
                <li>
                    Cancellation charges shown is exclusive of all taxes and taxes will be
                    added as per applicable
                </li>
            </ul>
        </div>
    );
}

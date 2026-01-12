import React from "react";
import styles from "./CancellationPenalty.module.css";

const CancellationPenalty = () => {
    return (
        <div className={styles.wrapper}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.route}>
                    <img
                        src="/images/GarudaIndonesia.png"
                        alt=""
                        aria-hidden
                        className={styles.airlineIcon}
                    />
                    <span>BOM-SIN</span>
                </div>
            </div>

            {/* Penalty */}
            <div className={styles.penaltyContainer}>
                <div className={styles.gridOverlay}>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <div className={styles.penaltyRow}>
                    <span className={styles.label}>Cancellation Penalty:</span>

                    <div className={styles.penaltyValues}>
                        <span>₹ 2,849</span>
                        <span>₹ 2,849</span>
                        <span>₹ 2,849</span>
                        <span className={styles.nonRefundable}>Non-Refundable</span>
                        <span className={styles.mobileView}>Nor-r</span>
                    </div>
                </div>

                {/* Timeline */}
                <div className={styles.timelineRow}>
                    <span className={styles.label}>Cancel Between(IST):</span>

                    <div className={styles.timeline}>
                        <div className={styles.bar} />

                        <div className={styles.marks}>
                            <span className={styles.now}>Now</span>
                            <span className={styles.mobileView}>6 Jan <small>04:45</small></span>
                            <span>6 Jan <small>04:45</small></span>
                            <span>9 Jan <small>04:45</small></span>
                            <span>12 Jan <small>04:45</small></span>
                        </div>
                    </div>
                </div>
            </div>

            <button className={styles.viewPolicy}>View Policy</button>
        </div>
    );
};

export default CancellationPenalty;

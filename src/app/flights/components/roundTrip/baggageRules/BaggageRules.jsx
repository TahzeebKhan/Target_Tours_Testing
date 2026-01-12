import React from 'react'
import styles from './BaggageRules.module.css'

const BaggageRules = () => {
    return (
        <div className={`${styles.tabContentBaggageRules} ${styles.fadeIn}`}>
            <div className={styles.tableCard}>
                <table className={styles.baggageTable}>
                    <thead>
                        <tr>
                            <th className={styles.airlineCellHead}>AIRLINE</th>
                            <th>CHECK-IN BAGGAGE</th>
                            <th>CABIN BAGGAGE</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className={styles.airlineCell}>
                                <img className={styles.airlineIcon} src="/images/Flight.png" alt="" />
                                <div className={styles.airlineText}>
                                    <span className={styles.airlineName}>INDIGO</span>
                                    <span className={styles.flightNo}>6E - 541</span>
                                </div>
                            </td>
                            <td className={styles.baggage}>15 KGS</td>
                            <td className={styles.baggage}>7 KG</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* RIGHT INFO BOX */}
            <div className={styles.infoBox}>
                <ul>
                    <li>
                        Baggage information mentioned above is obtained from airline's
                        reservation system, EaseMyTrip does not guarantee the accuracy of
                        this information.
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default BaggageRules
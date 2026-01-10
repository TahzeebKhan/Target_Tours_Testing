import React from 'react'
import styles from './FareDetailsPop.module.css'
const FareDetailsPop = () => {
    return (
        <div className={styles.overlay}>
            <div className={styles.fareDetialsContainre}>
                <div className={styles.fareDetailsTop}>
                    <div className={styles.header}>
                        <p className={styles.fareDetailsText}>FARE DETAILS</p>
                        <img className={styles.closeIcon} src="/icons/CLose.svg" alt="" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FareDetailsPop
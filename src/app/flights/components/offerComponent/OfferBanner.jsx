import React from 'react'
import styles from './OfferBanner.module.css'

const OfferBanner = () => {
  return (
    <div className={styles.banner}>
      <div className={styles.left}>
        <div className={styles.badge}>New</div>
        <p className={styles.text}>
          Get <span>12% Off</span> On Your First Flight
        </p>
      </div>

      <button className={styles.loginBtn}>
        LOGIN / SIGNUP
      </button>
    </div>
  )
}

export default OfferBanner

import React from 'react'
import styles   from "./WhereWillYouStay.module.css"
import ExpCarousel from './expComponent/ExpCarousel'

const WhereWillYouStay = () => {
  return (
    <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.heading}>Where Will You Stay</h2>
          <div className={styles.carousel}>
            <ExpCarousel activeTab="All"/>
          </div>
          
        </div>
    </section>
  )
}

export default WhereWillYouStay
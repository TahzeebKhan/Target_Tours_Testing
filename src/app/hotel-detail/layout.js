import React from 'react'
import styles from './hotelDetailLayout.module.css'
import Navbar from '../flightBookingDetails/Navbar'
import Footer from '../home-page/components/footer/Footer'
const layout = ({children}) => {
  return (
    <div className={styles.layoutWrapper}>
      <div className={styles.navBar}>
        <Navbar />
      </div>
      <main className={styles.contentWrapper}>
        {children}
      </main>
      <div className={styles.footer}> 
        <Footer />
      </div>
    </div>
  )
}

export default layout

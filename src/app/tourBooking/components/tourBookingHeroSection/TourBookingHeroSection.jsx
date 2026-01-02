import React from 'react'
import styles from './TourBookingHeroSection.module.css'
import Navbar from '@/app/flights/Navbar'

const TourBookingHeroSection = () => {
  return (
    <section className={styles.tourBookingSection}>
      <div className={styles.overlay}></div>
      <div className={styles.contianerWrapper}>
        <div className={styles.navbarContainer}>
          <Navbar />
        </div>
        <div className={styles.heroContainer}>
          <div className={styles.container}>
            <div className={styles.leftContainer}>
              <div className={styles.leftTop}>
                <div className={styles.fromToCont}>
                  <span className={styles.from}>Toronto</span>
                  <span>→</span>
                  <span className={styles.to}>Ottawa</span>
                </div>
                <h2 className={styles.header}>Splendors of the
                  Canadian West</h2>
              </div>
              <div className={styles.leftBottom}>
                <p>Embark on an unforgettable 12-day journey through the heart of Western Canada, where towering mountain ranges, turquoise lakes, and legendary scenic highways define every moment. This immersive adventure takes you deep into the Canadian Rockies, offering breathtaking landscapes, wildlife encounters, and iconic national parks.</p>
              </div>
            </div>
            <div className={styles.rightContainer}>
              <div className={styles.topRight}>
                <div className={styles.privateTour}>
                  <span className={styles.privateText}>12 days & 11 nights — Private tour</span>
                </div>
                <div className={styles.tagsCont}>
                  <div className={styles.tags}>
                    Nature
                  </div>
                  <div className={styles.tags}>
                    Adventure
                  </div>
                  <div className={styles.tags}>
                    Scenic Road Trips
                  </div>
                </div>
                <div className={styles.tailor_made}>
                  Tailor-made
                </div>
              </div>
              <div className={styles.centerRight}>
                <div className={styles.price}>From <span>₹ 66,945</span></div>
                <span className={styles.person}>/ PERSON</span>
              </div>

              <button className={styles.bottomRight}>
                VIEW DAY-BY-DAY ITINARY
                <img src="/icons/whiteArroa.svg" alt="" />
              </button>
            </div>
          </div>
        </div>
      </div>


    </section>
  )
}

export default TourBookingHeroSection

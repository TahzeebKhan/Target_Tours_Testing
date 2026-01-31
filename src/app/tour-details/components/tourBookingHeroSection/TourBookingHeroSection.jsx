"use client"
import React, { useState } from 'react'
import styles from './TourBookingHeroSection.module.css'
import Navbar from '@/app/flights/Navbar'

const TourBookingHeroSection = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  return (
    <section className={styles.tourBookingSection}>
      <div className={styles.overlay}></div>
      <div className={styles.contianerWrapper}>
        <div className={styles.navbarContainer}>
          <Navbar scrollProgress={scrollProgress} />
        </div>
        <div className={styles.heroContainer}>
          <div className={styles.container}>
            <div className={styles.leftContainer}>
              <div className={styles.leftTop}>
                <div className={styles.fromToCont}>
                  <span className={styles.from}>Toronto</span>
                  <span>
                    <svg className={styles.homeArrow} width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M6.05255 1.85251C5.91587 1.98919 5.91587 2.2108 6.05255 2.34749L8.95505 5.25H1.40003C1.20673 5.25 1.05003 5.40671 1.05003 5.6C1.05003 5.79329 1.20673 5.95 1.40003 5.95H8.95505L6.05255 8.85252C5.91587 8.98921 5.91587 9.21079 6.05255 9.34747C6.18924 9.48416 6.41081 9.48416 6.54751 9.34747L10.0475 5.84747C10.1842 5.71079 10.1842 5.48921 10.0475 5.35253L6.54751 1.85251C6.41081 1.71583 6.18924 1.71583 6.05255 1.85251Z" fill="white" />
                    </svg>



                  </span>
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

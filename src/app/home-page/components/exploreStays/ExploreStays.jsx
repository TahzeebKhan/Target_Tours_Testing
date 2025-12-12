import React from 'react'
import styles from './ExploreStays.module.css'
import ExpCarousel from '@/app/exploreCarousel/component/ExpCarousel'

// ${activeTab === t ? styles.active : ''}`

const ExploreStays = () => {
  return (
    <section className={styles.section}>
            <div className={styles.container}>
                <h2 className={styles.heading}>
                    Popular Flights to Destination From
                    
                </h2>

                <nav className={styles.tabsWrap}>
                    <ul className={styles.tabs}>
                        {['All', 'Beach', 'Hiking', 'Family', 'Ski', 'Culture', 'Wellness and Retreat'].map((t) => (
                            <li 
                                key={t} 
                                className={`${styles.tab} `}
                            >
                                <button 
                                    className={styles.tabBtn}
                                    // onClick={() => handleTabChange(t)}
                                >
                                    {t}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div>
                    <ExpCarousel/>
                </div>
                
                {/* <div className={styles.btnContainer}>
                    <div 
                        className={styles.btn} 
                        onClick={() => {
                            if (swiperRef) {
                                swiperRef.slidePrev();
                            }
                        }}
                    >
                        <img src="/icons/left.svg" alt="" />
                    </div>

                    <div 
                        className={styles.btn} 
                        onClick={() => {
                            if (swiperRef) {
                                swiperRef.slideNext();
                            }
                        }}
                    >
                        <img src="/icons/right.svg" alt="" />
                    </div>
                </div> */}

            </div>
        </section>
  )
}

export default ExploreStays
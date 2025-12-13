import React from 'react'
import styles from './LimitedTimeOffer.module.css'
const LimitedTimeOffer = () => {
    return (
        <section className='relative w-full h-[689px]'>
            <header className={`${styles.homeSection} w-full`}>
                <video
                    className="absolute inset-0 w-full h-full object-cover"
                    src="/videos/Desert_Camels.mp4"
                    poster="/images/hero-poster.jpg"
                    autoPlay
                    muted
                    loop
                    playsInline
                />
                <div className={styles.section}>
                    <div className={styles.container}>
                        <div className={styles.leftContainer}>
                            <h2 className={styles.heading
                            }>Limited Time  <br />
                                Offer</h2>

                            <div className={styles.textContainer}>
                                <span className={styles.offer}>Offer Starting from</span>
                                <p className={styles.price}>
                                    INR 2,30,000/
                                    <span className={styles.adult}>Adult</span>
                                </p>
                                <button className={styles.exploreBtn}>
                                    Explore now
                                    <img src="/icons/right.svg" alt="" />
                                </button>
                            </div>

                        </div>
                        <div className={styles.rightContainer}>
                            <div className={styles.btnContainer}>
                                <div
                                    className={styles.btn}
                                    // onClick={() => swiperRef?.slidePrev()}
                                >
                                    <img src="/icons/left.svg" alt="" />
                                </div>

                                <div
                                    className={styles.btn}
                                    // onClick={() => swiperRef?.slideNext()}
                                >
                                    <img src="/icons/right.svg" alt="" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </header>
        </section>
    )
}

export default LimitedTimeOffer
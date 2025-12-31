import React from 'react'
import styles from './HotelRoom.module.css'

const HotelRoom = ({ onViewHotel }) => {

    const rating = 4;
    return (
        <section className={styles.section}>
            <div className={styles.leftSection}>
                <img src="/images/hotel1.png" alt="" />
            </div>
            <div className={styles.rightSection}>
                <div className={styles.rightTop}>
                    <div className={styles.rating}>
                        {[...Array(5)].map((_, index) => (
                            <img
                                key={index}
                                src={
                                    index < rating
                                        ? "/icons/conicstar.svg"
                                        : "/icons/star-gray.svg"
                                }
                                alt="star"
                            />
                        ))}
                    </div>
                    <h3 className={styles.heading}>Fairmont Royal York</h3>
                    <span className={styles.downtown}>Downtown Toronto • 0.5 km from CN Tower</span>
                    <div className={styles.schaduleTime}>
                        <img src="/icons/watchBlack.svg" alt="" />
                        <span>Sun 31 May - Mon 1 Jun, 1 Night</span>
                    </div>
                </div>
                <div className={styles.rightMiddle}>
                    <p>Historic luxury hotel in the heart of downtown Toronto, offering timeless elegance and world-class amenities.</p>
                </div>
                <div className={styles.rightBottom}>
                    <button className={styles.viewHotel} onClick={onViewHotel}>view hotel options</button>
                </div>
            </div>

        </section>
    )
}

export default HotelRoom
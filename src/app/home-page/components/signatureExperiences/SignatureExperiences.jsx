import React from 'react'
import styles  from './SignatureExperiences.module.css'
import Carousel from '@/app/3dCarousel/component/Carousel'
const SignatureExperiences = () => {
  return (
    <section className={styles.section}>
            <div className={styles.container}>
                <h2 className={styles.heading}>Explore More With Target Tours</h2>


                <nav className={styles.tabsWrap}>
                    <ul className={styles.tabs}>
                        {['Explore', 'Europe', 'Dubai', 'Rajasthan', 'Japan', 'Thailand', 'North East India', 'Spiti', 'Bali', 'Maldives'].map((t, i) => (
                            <li key={t} className={`${styles.tab} ${i === 0 ? styles.active : ''}`}>
                                <button className={styles.tabBtn}>{t}</button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className='!w-[100vw]'>
                <Carousel />
                </div>
            </div>
        </section>
  )
}

export default SignatureExperiences
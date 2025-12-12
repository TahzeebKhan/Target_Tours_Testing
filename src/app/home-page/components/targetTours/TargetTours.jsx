import React from 'react'
import styles from './TargetTours.module.css'
import Image from 'next/image'


const TargetTours = () => {
    const cards = [
        { id: 1, img: '/images/tour1.jpg', badge: '17 Days & 16 Nights', title: '17 Days - Best Of India Tour' },
        { id: 2, img: '/images/tour2.jpg', badge: '15 Days & 16 Nights', title: '6 Days - Golden Triangle Tour' },
        { id: 3, img: '/images/tour3.jpg', badge: '17 Days & 16 Nights', title: '18 Days - Rajasthan In Deep' },
    ]


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


                <div className={styles.grid}>
                    {cards.map((c) => (
                        <article key={c.id} className={styles.card}>
                            <div className={styles.imgWrap}>
                                <Image src={c.img} alt={c.title} fill className={styles.img} />
                                <div className={styles.gradient} />


                                <div className={styles.badge}>{c.badge}</div>
                                <h3 className={styles.cardTitle}>{c.title}</h3>
                            </div>
                        </article>
                    ))}
                </div>


                <div className={styles.controls}>
                    <button aria-label="prev" className={styles.controlBtn}>◀</button>
                    <button aria-label="next" className={styles.controlBtn}>▶</button>
                </div>
            </div>
        </section>
    )
}

export default TargetTours
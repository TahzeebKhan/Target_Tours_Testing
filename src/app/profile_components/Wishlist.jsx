"use client";

import { useState } from 'react';
import Image from 'next/image';
import styles from './Wishlist.module.css';

const TABS = ["ALL", "HOTEL", "PACKAGES", "TRAVEL INSURANCE"];

const WISHLIST_DATA = [
  {
    id: 1,
    title: "MY NEXT TRIP",
    count: 6,
    images: ["/images/trip1.jpg", "/images/trip2.jpg", "/images/trip3.jpg", "/images/trip4.jpg"],
    isGrid: true,
  },
  {
    id: 2,
    title: "FALKENSEE, GERMANY 2025",
    count: 2,
    images: ["/images/falkensee.jpg"],
    isGrid: false,
  },
  {
    id: 3,
    title: "PRAGUE, CZECHIA 2025",
    count: 1,
    images: ["/images/prague.jpg"],
    isGrid: false,
  },
];

export default function Wishlist() {
  const [activeTab, setActiveTab] = useState("HOTEL");

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Wish Lists</h1>
          <button className={styles.createBtn}>+ Create a list</button>
        </div>
        <p className={styles.subtitle}>Explore and save your favorite destinations here.</p>
      </header>

      <nav className={styles.tabNav}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${styles.tabItem} ${activeTab === tab ? styles.activeTab : ""}`}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className={styles.grid}>
        {WISHLIST_DATA.map((list) => (
          <article key={list.id} className={styles.card}>
            <div className={styles.imageContainer}>
              {list.isGrid ? (
                <div className={styles.imageCollage}>
                  {list.images.map((img, idx) => (
                    <div key={idx} className={styles.collageItem}>
                      <Image
                        src={img}
                        alt={list.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className={styles.img}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.singleImage}>
                  <Image
                    src={list.images[0]}
                    alt={list.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className={styles.img}
                  />
                </div>
              )}
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{list.title}</h3>
              <p className={styles.cardCount}>{list.count} Saved</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
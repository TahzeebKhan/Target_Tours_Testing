"use client"
import React from 'react'
import styles from './ViewGalleryPage.module.css'
import ActivityGalleryCarousel from './activityGalleryCarousel/ActivityGalleryCarousel'
import GallerySection from './gallerySection/GallerySection'
import { useRouter } from 'next/navigation'

const ViewGalleryPage = () => {
  const router = useRouter();
  const handleBack = () => {
    router.back();
  }

  const galleryData = [
    {
      title: "Kitchen",
      images: [
        "/gallery/kitchen1.png",
        "/gallery/kitchen2.png",
        "/gallery/kitchen3.png",
      ]
    },
    {
      title: "Bathroom",
      images: [
        "/gallery/bathroom1.png",
        "/gallery/bathroom2.png",
        "/gallery/bathroom3.png",
      ]
    },
    {
      title: "Bedroom",
      images: [
        "/gallery/bedroom1.png",
        "/gallery/bedroom2.png",
        "/gallery/bedroom3.png",
      ]
    },
    {
      title: "LIVING ROOM",
      images: [
        "/gallery/livingroom1.png",
        "/gallery/livingroom2.png",
        "/gallery/livingroom3.png",
      ]
    }
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.nav}>
        <div className={styles.navItem} onClick={handleBack}>
          <img src="/icons/right.svg" alt="" />
        </div>
      </div>
      <div className={styles.container}>
        <ActivityGalleryCarousel />
        {galleryData.map((data, index) => (
          <GallerySection key={index} data={data} />
        ))}
      </div>
    </div>
  )
}

export default ViewGalleryPage

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
      title: "ALPINE HIKING TRAIL",
      images: [
        "/gallery/Alpine1.png",
        "/gallery/Alpine2.png",
        "/gallery/Alpine3.png",
        "/gallery/Alpine4.png",
        "/gallery/Alpine5.png"
      ]
    },
    {
      title: "GLACIER WALK EXPERIENCE",
      images: [
        "/gallery/Glacier1.png",
        "/gallery/Glacier2.png",
        "/gallery/Glacier3.png",
        "/gallery/Glacier4.png",
        "/gallery/Glacier5.png"
      ]
    },
    {
      title: "Wildlife Safari Experience",
      images: [
        "/gallery/Safari1.png",
        "/gallery/Safari2.png",
        "/gallery/Safari3.png",
        "/gallery/Safari4.png",
        "/gallery/Safari5.png"
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

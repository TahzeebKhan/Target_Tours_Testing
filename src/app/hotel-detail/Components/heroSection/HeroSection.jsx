"use client";
import React from "react";
import styles from "./HeroSection.module.css";
import HotelGallery from "../hotelGallery/HotelGallery";
import { useHotelDetailData } from "../../HotelDetailDataContext";

const HeroSection = ({ liked, onLike }) => {
  const { hotelDetail, loading } = useHotelDetailData();
  const starRating = Math.max(
    0,
    Math.min(5, Math.round(Number(hotelDetail?.starRating ?? 0) || 0)),
  );

  return (
    <div className={styles.HeroSection}>
      <div className={styles.container}>
        <div className={styles.textSection}>
          <h2 className={styles.hotelName}>{hotelDetail?.name || "Hotel"}</h2>
          <div className={styles.locationAndRating}>
            <img src="/icons/blackAddress.svg" alt="" />
            <span className={styles.hotelAddress}>{hotelDetail?.address || "Address not available"}</span>
            <div className={styles.ratingSection}>
              <div className={styles.stars}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <img
                    key={`hotel-star-${index}`}
                    src={
                      index < starRating
                        ? "/icons/tetimonialStart.svg"
                        : "/icons/conicstarEmpty.svg"
                    }
                    alt=""
                  />
                ))}
              </div>
              <div className={styles.reviewCount}>
                ({hotelDetail?.reviewText || "No reviews yet"})
              </div>
            </div>
          </div>
        </div>
        <div className={styles.shareContainer}>
          <div className={styles.iconsHeart} onClick={onLike}>
            <img
              src={
                liked ? "/icons/heartIconFilled.svg" : "/icons/mdi_heart.svg"
              }
              alt="heart"
            />
          </div>

          <div className={styles.iconsHeart}>
            <img src="/icons/share.svg" alt="" />
          </div>
        </div>
      </div>
      <HotelGallery
        images={hotelDetail?.galleryImages || hotelDetail?.images}
        loading={loading}
      />
    </div>
  );
};

export default HeroSection;

import React from "react";
import styles from "./CustomerReviews.module.css";
import { useHotelDetailData } from "../../HotelDetailDataContext";

const CustomerReviews = () => {
  const { hotelDetail } = useHotelDetailData();
  const ratingBars = hotelDetail?.ratingBars || [];
  const scoreDetails = hotelDetail?.scoreDetails || [];
  const reviews = hotelDetail?.reviews || [];
  
  return (
    <div className={styles.wrapper}>
      <div className={styles.reviewWrapper}>
        <h2 className={styles.heading}>Customer Reviews</h2>

        <div className={styles.reviewContainer}>
          {/* LEFT SIDE */}
          <div className={styles.leftSection}>
            {ratingBars.map((item) => (
              <div key={item.star} className={styles.ratingRow}>
                <span className={styles.star}>★ {item.star}</span>

                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>

                <span className={styles.count}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE */}
          <div className={styles.rightSection}>
            {scoreDetails.map((item) => (
              <div key={item.label} className={styles.scoreContainer}>
                <div className={styles.scoreBox}>
                  <div className={styles.scoreLabelBox}>
                    <p className={styles.scoreLabel}>{item.label}</p>
                  </div>
                  <p className={styles.scoreValue}>{item.score.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.reviewList}>
        {reviews.map((review) => (
          <div key={review.id} className={styles.reviewCard}>
            {/* LEFT AVATAR */}
            <div className={styles.avatar}>J</div>

            {/* CONTENT */}
            <div className={styles.reviewContent}>
              {/* HEADER */}
              <div className={styles.header}>
                <div className={styles.userInfo}>
                  <h4 className={styles.name}>{review.name}</h4>
                  <div className={styles.stars}>
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <img key={index} width={12} height={12} src="/icons/conicstar.svg" alt="star" />
                    ))}
                  </div>
                </div>

                <span className={styles.time}>{review.time}</span>
              </div>

              {/* COMMENT */}
              <p className={styles.comment}>{review.comment}</p>

              {/* FOOTER */}
              <div className={styles.footer}>
                <img src="/icons/likeIcon.svg" alt="" />
                <span className={styles.helpful}>
                  Helpful ({review.helpful})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!reviews.length && (
        <p className={styles.comment}>No customer reviews available for this hotel yet.</p>
      )}
    </div>
  );
};

export default CustomerReviews;

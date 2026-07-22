"use client";
import React from "react";
import styles from "./MyReviewDetails.module.css";

const reviews = [
  {
    id: 1,
    image: "/images/reviewImage.png",
    status: "REVIEW POSTED",
    statusType: "posted",
    date: "24 oct 2024",
    rating: "3.0",
    ratingText: "Poor",
    text: "It doesn’t have any daily cleaning or towel changing. It doesn’t have any liquid soap; it was empty. The kitchen didn’t have any dishwashing liquid.",
    helpful: 2,
    response:
      "Hi Anna, we are very sorry for this feedback. Our property is a short-let house, not a hotel. Therefore, daily cleaning and towel changes are not foreseen in this type of short let. Probably, if you had kept this distinction in mind, you would not have judged your experience so harshly, and please forgive us for any misunderstanding. In any case, advice from our guests is always welcome. We thank you for choosing us!",
  },
  {
    id: 2,
    image: "/images/ReviewImages.png",
    status: "REVIEW REJECTED",
    statusType: "rejected",
    date: "24 oct 2024",
    rating: "3.0",
    ratingText: "Poor",
    text: "It doesn’t have any daily cleaning or towel changing. It doesn’t have any liquid soap; it was empty. The kitchen didn’t have any dishwashing liquid.",
  },
  {
    id: 3,
    image: "/images/ReviewImages.png",
    status: "REVIEW PENDING",
    statusType: "pending",
    date: "24 oct 2024",
    rating: "3.0",
    ratingText: "Poor",
    text: "It doesn’t have any daily cleaning or towel changing. It doesn’t have any liquid soap; it was empty. The kitchen didn’t have any dishwashing liquid.",
  },
  {
    id: 4,
    image: "/images/reviewImage.png",
    status: "REVIEW POSTED",
    statusType: "posted",
    date: "24 oct 2024",
    rating: "3.0",
    ratingText: "Poor",
    text: "It doesn’t have any daily cleaning or towel changing. It doesn’t have any liquid soap; it was empty. The kitchen didn’t have any dishwashing liquid.",
    helpful: 2,
    response:
      "Hi Anna, we are very sorry for this feedback. Our property is a short-let house, not a hotel. Therefore, daily cleaning and towel changes are not foreseen in this type of short let. Probably, if you had kept this distinction in mind, you would not have judged your experience so harshly, and please forgive us for any misunderstanding. In any case, advice from our guests is always welcome. We thank you for choosing us!",
  },
];

const MyReviewDetails = () => {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.containerBox}>
          {reviews.map((review) => (
            <div key={review.id} className={styles.reviewCardWrapper}>
              <div className={styles.reviewCard}>
                {/* LEFT IMAGE */}
                <div className={styles.left}>
                  <img src={review.image} alt="" />
                </div>

                {/* RIGHT CONTENT */}
                <div className={styles.right}>
                  {/* TOP ROW */}
                  <div className={styles.topRow}>
                    <div className={styles.statusRow}>
                      <span
                        className={`${styles.status} ${
                          styles[review.statusType]
                        }`}
                      >
                        {review.status}
                      </span>
                      <span className={styles.date}>{review.date}</span>
                    </div>

                    <div className={styles.ratingBox}>
                      <span className={styles.rating}>{review.rating}</span>
                      <span className={styles.ratingText}>
                        {review.ratingText}
                      </span>
                    </div>
                  </div>

                  {/* REVIEW TEXT */}
                  <div className={styles.reviewText}>
                    <img src="/icons/face-smile.svg" alt="" />
                    <p>{review.text}</p>
                  </div>

                  {/* HELPFUL + RESPONSE (ONLY FOR POSTED) */}
                  {review.statusType === "posted" && (
                    <div className={styles.responseBox}>
                      <div className={styles.helpful}>
                        <img src="/icons/like.svg" alt="" />
                        <span>{review.helpful}</span>
                        <span> people found this review helpful</span>
                      </div>

                      <div className={styles.responseText}>
                        <h4>Property response</h4>
                        <p>{review.response}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={`${styles.container} ${styles.containerMobile}`}>
        <div className={styles.containerBox}>
          {reviews.map((review) => (
            <div key={review.id} className={styles.reviewCardWrapper}>
              <div className={styles.reviewCard}>
                {/* LEFT IMAGE */}
                <div className={styles.imgAndReviewContainer}>
                  <div className={styles.left}>
                    <img src={review.image} alt="" />
                  </div>

                  {/* RIGHT CONTENT */}
                  <div className={styles.right}>
                    {/* TOP ROW */}
                    <div className={styles.topRow}>
                      <div className={styles.statusRow}>
                        <span className={styles.date}>{review.date}</span>
                      </div>

                      <div className={styles.ratingBox}>
                        <span className={styles.rating}>{review.rating}</span>
                        <span className={styles.ratingText}>
                          {review.ratingText}
                        </span>
                      </div>
                      <span
                        className={`${styles.status} ${
                          styles[review.statusType]
                        }`}
                      >
                        {review.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* REVIEW TEXT */}
                <div className={styles.reviewText}>
                  <img src="/icons/face-smile.svg" alt="" />
                  <p>{review.text}</p>
                </div>

                {/* HELPFUL + RESPONSE (ONLY FOR POSTED) */}
                {review.statusType === "posted" && (
                  <div className={styles.responseBox}>
                    <div className={styles.helpful}>
                      <img src="/icons/like.svg" alt="" />
                      <span>{review.helpful}</span>
                      <span> people found this review helpful</span>
                    </div>

                    <div className={styles.responseText}>
                      <h4>Property response</h4>
                      <p>{review.response}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MyReviewDetails;

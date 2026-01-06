import React from "react";
import styles from "./CustomerReviews.module.css";

const ratingBars = [
    { star: 5, value: 250, percent: 80 },
    { star: 4, value: 80, percent: 45 },
    { star: 3, value: 30, percent: 20 },
    { star: 2, value: 8, percent: 10 },
    { star: 1, value: 3, percent: 5 },
];

const scoreDetails = [
    { label: "Amenities", score: 5.0 },
    { label: "Cleanliness", score: 5.0 },
    { label: "Communication", score: 5.0 },
    { label: "Location", score: 5.0 },
    { label: "Value", score: 5.0 },
];
const reviews = [
    {
        id: 1,
        name: "John Smith",
        rating: 5,
        time: "2 months ago",
        comment:
            "I recently stayed at the Grand Vista Hotel and it was an amazing experience! The staff was incredibly friendly and attentive, making sure all my needs were met. The room was spacious and beautifully decorated, with a stunning view of the city skyline. The amenities were top-notch, especially the rooftop pool which was perfect for relaxing after a long day. I highly recommend this hotel for anyone looking for a comfortable and enjoyable stay!",
        helpful: 23,
    },
    {
        id: 2,
        name: "John Smith",
        rating: 5,
        time: "2 months ago",
        comment:
            "I recently stayed at the Grand Vista Hotel and it was an amazing experience! The staff was incredibly friendly and attentive, making sure all my needs were met. The room was spacious and beautifully decorated, with a stunning view of the city skyline. The amenities were top-notch, especially the rooftop pool which was perfect for relaxing after a long day. I highly recommend this hotel for anyone looking for a comfortable and enjoyable stay!",
        helpful: 23,
    },
    {
        id: 3,
        name: "John Smith",
        rating: 5,
        time: "2 months ago",
        comment:
            "I recently stayed at the Grand Vista Hotel and it was an amazing experience! The staff was incredibly friendly and attentive, making sure all my needs were met. The room was spacious and beautifully decorated, with a stunning view of the city skyline. The amenities were top-notch, especially the rooftop pool which was perfect for relaxing after a long day. I highly recommend this hotel for anyone looking for a comfortable and enjoyable stay!",
        helpful: 23,
    },
];

const CustomerReviews = () => {
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
                            <div key={item.label} className={styles.scoreBox}>
                                <div className={styles.scoreLabelBox}>
                                    <p className={styles.scoreLabel}>{item.label}</p>
                                </div>
                                <p className={styles.scoreValue}>{item.score.toFixed(1)}</p>
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
                                        {"★".repeat(review.rating)}
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
        </div>
    );
};

export default CustomerReviews;

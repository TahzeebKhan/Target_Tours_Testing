import React from "react";
import styles from "./ExtraBaggageItem.module.css";

const ExtraBaggageItem = ({
    image,
    weight,
    price,
    quantity,
    onIncrease,
    onDecrease,
}) => {
    return (
        <div className={styles.wrapper}>
            {/* Image */}
            <div className={styles.imageInfoContainer}>
                <div className={styles.imageBox}>
                    <img src={image} alt={`${weight} baggage`} />
                </div>

                {/* Info */}
                <div className={styles.info}>
                    <span className={styles.weight}>{weight}</span>
                    <span className={styles.price}>₹ {price.toLocaleString()}</span>
                </div>
            </div>

            {/* Counter */}
            <div className={styles.counter}>
                <button
                    className={styles.btn}
                    onClick={onDecrease}
                    disabled={quantity === 0}
                >
                    −
                </button>

                <span className={styles.count}>{quantity}</span>

                <button className={styles.btn} onClick={onIncrease}>
                    +
                </button>
            </div>
        </div>
    );
};

export default ExtraBaggageItem;

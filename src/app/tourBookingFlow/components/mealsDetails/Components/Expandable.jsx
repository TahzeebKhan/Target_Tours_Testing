"use client";
import React from "react";
import styles from "./Expandable.module.css";
import { meals, beverages } from "../mealsData";

const Expandable = ({ quantities, onUpdateQuantity }) => {
    return (
        <div className={styles.expandWrap}>
            <div className={styles.expandHeader}>
                <h2>MAIN MEALS</h2>

                <div className={styles.mealGrid}>
                    {meals.map((meal) => (
                        <MealItem
                            key={meal.id}
                            {...meal}
                            quantity={quantities[meal.id] || 0}
                            onIncrease={() =>
                                onUpdateQuantity(meal.id, (quantities[meal.id] || 0) + 1)
                            }
                            onDecrease={() =>
                                onUpdateQuantity(meal.id, (quantities[meal.id] || 0) - 1)
                            }
                        />
                    ))}
                </div>

                <h2>BEVERAGES</h2>

                <div className={styles.mealGrid}>
                    {beverages.map((drink) => (
                        <MealItem
                            key={drink.id}
                            {...drink}
                            quantity={quantities[drink.id] || 0}
                            onIncrease={() =>
                                onUpdateQuantity(drink.id, (quantities[drink.id] || 0) + 1)
                            }
                            onDecrease={() =>
                                onUpdateQuantity(drink.id, (quantities[drink.id] || 0) - 1)
                            }
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Expandable;



const MealItem = ({
    image,
    title,
    price,
    tag,
    quantity,
    onIncrease,
    onDecrease,
}) => {
    return (
        <div className={styles.Itemwrapper}>
            {/* Image */}
            <div className={styles.itemInfo}>
                <div className={styles.imageBox}>
                    <img src={image} alt={title} />
                </div>

                {/* Info */}
                <div className={styles.info}>
                    <h3 className={styles.title}>{title}</h3>

                    <div className={styles.priceRow}>
                        <span className={styles.price}>₹ {price}</span>
                        {tag && <span className={styles.tag}>{tag}</span>}
                    </div>
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


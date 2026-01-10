import React from 'react';
import styles from './Expandable.module.css';
import { meals, beverages } from '../mealsData';

const MobileFlightMeals = ({
    flightSegment,
    date,
    time,
    segmentQuantities,
    onUpdateQuantity
}) => {
    return (
        <div className={styles.baggageMobileCard}>
            <div className={styles.flightExpandableHeader}>
                <h3 className={styles.mobileFlightDestinationName}>{flightSegment}</h3>
                <div className={styles.aboutFlightContainerRight}>
                    <span>{date}</span>
                    <div className={styles.dot}></div>
                    <span>{time}</span>
                </div>
            </div>
            <div className={styles.br}></div>

            <div className={styles.expandHeader}>
                <h2>MAIN MEALS</h2>

                <div className={styles.mealGrid}>
                    {meals.map((meal) => (
                        <MealItem
                            key={meal.id}
                            {...meal}
                            quantity={segmentQuantities[meal.id] || 0}
                            onIncrease={() =>
                                onUpdateQuantity(meal.id, (segmentQuantities[meal.id] || 0) + 1)
                            }
                            onDecrease={() =>
                                onUpdateQuantity(meal.id, (segmentQuantities[meal.id] || 0) - 1)
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
                            quantity={segmentQuantities[drink.id] || 0}
                            onIncrease={() =>
                                onUpdateQuantity(drink.id, (segmentQuantities[drink.id] || 0) + 1)
                            }
                            onDecrease={() =>
                                onUpdateQuantity(drink.id, (segmentQuantities[drink.id] || 0) - 1)
                            }
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

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

export default MobileFlightMeals;

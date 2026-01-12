import React from 'react'
import styles from './mealGuidelineExpandable.module.css'
const MealGuidelineExpandable = () => {
    return (
        <div className={styles.wrapper}>
            <ol className={styles.mealNotes}>
                <li>
                    All vegetarian meals are prepared separately and do not contain meat,
                    fish, or eggs. We use high-quality ingredients and follow strict
                    preparation guidelines.
                </li>

                <li>
                    Our non-vegetarian meals are prepared with premium quality chicken and
                    meat. All meats are sourced from certified suppliers.
                </li>

                <li>
                    Pre-booked meals are served first, followed by general meal service.
                    Hot meals are served approximately 30 minutes after takeoff.
                </li>

                <li>
                    You can modify your meal selection up to 24 hours before departure.
                    Cancellations receive full refund if done 24 hours prior.
                </li>
            </ol>

        </div>
    )
}

export default MealGuidelineExpandable
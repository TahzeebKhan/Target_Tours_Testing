import React from "react";
import styles from "./Expandable.module.css";

const MobileFlightMeals = ({
  flightSegment,
  date,
  time,
  segmentQuantities,
  onUpdateQuantity,
  meals = [],
  beverages = [],
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
              key={meal.selectionKey || meal.id}
              {...meal}
              quantity={segmentQuantities[meal.selectionKey || meal.id] || 0}
              onIncrease={() =>
                onUpdateQuantity(
                  meal.selectionKey || meal.id,
                  (segmentQuantities[meal.selectionKey || meal.id] || 0) + 1
                )
              }
              onDecrease={() =>
                onUpdateQuantity(
                  meal.selectionKey || meal.id,
                  (segmentQuantities[meal.selectionKey || meal.id] || 0) - 1
                )
              }
            />
          ))}
        </div>

        <h2>BEVERAGES</h2>

        <div className={styles.mealGrid}>
          {beverages.map((drink) => (
            <MealItem
              key={drink.selectionKey || drink.id}
              {...drink}
              quantity={segmentQuantities[drink.selectionKey || drink.id] || 0}
              onIncrease={() =>
                onUpdateQuantity(
                  drink.selectionKey || drink.id,
                  (segmentQuantities[drink.selectionKey || drink.id] || 0) + 1
                )
              }
              onDecrease={() =>
                onUpdateQuantity(
                  drink.selectionKey || drink.id,
                  (segmentQuantities[drink.selectionKey || drink.id] || 0) - 1
                )
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
          <svg
            width="9"
            height="2"
            viewBox="0 0 9 2"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.5625 1.12496C0.403125 1.12496 0.269531 1.07104 0.161719 0.963188C0.0539063 0.855325 0 0.721675 0 0.562237C0 0.402787 0.0539063 0.269219 0.161719 0.161531C0.269531 0.0538436 0.403125 0 0.5625 0H7.68746C7.84684 0 7.98043 0.0539248 8.08824 0.161775C8.19606 0.269637 8.24996 0.403287 8.24996 0.562725C8.24996 0.722175 8.19606 0.855744 8.08824 0.963431C7.98043 1.07112 7.84684 1.12496 7.68746 1.12496H0.5625Z"
              fill="#000033"
            />
          </svg>
        </button>

        <span className={styles.count}>{quantity}</span>

        <button className={styles.btn} onClick={onIncrease}>
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.3125 5.43746H0.5625C0.403125 5.43746 0.269531 5.38354 0.161719 5.27569C0.0539063 5.16783 0 5.03418 0 4.87474C0 4.71529 0.0539063 4.58172 0.161719 4.47403C0.269531 4.36634 0.403125 4.3125 0.5625 4.3125H4.3125V0.5625C4.3125 0.403125 4.36642 0.269531 4.47427 0.161719C4.58214 0.0539063 4.71579 0 4.87523 0C5.03468 0 5.16824 0.0539063 5.27593 0.161719C5.38362 0.269531 5.43746 0.403125 5.43746 0.5625V4.3125H9.18746C9.34684 4.3125 9.48043 4.36643 9.58824 4.47428C9.69606 4.58214 9.74996 4.71579 9.74996 4.87523C9.74996 5.03468 9.69606 5.16824 9.58824 5.27593C9.48043 5.38362 9.34684 5.43746 9.18746 5.43746H5.43746V9.18746C5.43746 9.34684 5.38354 9.48043 5.27569 9.58824C5.16782 9.69606 5.03417 9.74996 4.87474 9.74996C4.71529 9.74996 4.58172 9.69606 4.47403 9.58824C4.36634 9.48043 4.3125 9.34684 4.3125 9.18746V5.43746Z"
              fill="#000033"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MobileFlightMeals;

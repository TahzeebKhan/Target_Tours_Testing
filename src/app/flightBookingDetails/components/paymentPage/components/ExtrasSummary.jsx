import styles from "./ExtrasSummary.module.css";
import { Briefcase, ShoppingBag, Utensils, MapPin } from "lucide-react";

const CabinBagIcon = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
        stroke="#4A5565"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 6H21"
        stroke="#4A5565"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"
        stroke="#4A5565"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const CheckeBagIcon = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 20V4C16 3.46957 15.7893 2.96086 15.4142 2.58579C15.0391 2.21071 14.5304 2 14 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4V20"
        stroke="#4A5565"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 6H4C2.89543 6 2 6.89543 2 8V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V8C22 6.89543 21.1046 6 20 6Z"
        stroke="#4A5565"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const MealsIcon = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.0013 2L13.7013 4.3C13.1516 4.86079 12.8438 5.61474 12.8438 6.4C12.8438 7.18526 13.1516 7.93921 13.7013 8.5L15.5013 10.3C16.0621 10.8497 16.8161 11.1576 17.6013 11.1576C18.3866 11.1576 19.1405 10.8497 19.7013 10.3L22.0013 8"
        stroke="#4A5565"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.9997 14.9998L3.29967 3.2998C2.90056 3.69086 2.58348 4.15762 2.36702 4.67276C2.15056 5.18789 2.03906 5.74104 2.03906 6.2998C2.03906 6.85857 2.15056 7.41172 2.36702 7.92685C2.58348 8.44199 2.90056 8.90875 3.29967 9.2998L10.5997 16.5998C11.2997 17.2998 12.5997 17.2998 13.3997 16.5998L14.9997 14.9998ZM14.9997 14.9998L21.9997 21.9998"
        stroke="#4A5565"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.10156 21.8L8.50156 15.5"
        stroke="#4A5565"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 5L12 12"
        stroke="#4A5565"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const LoctaionIcon = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 10C20 14.993 14.461 20.193 12.601 21.799C12.4277 21.9293 12.2168 21.9998 12 21.9998C11.7832 21.9998 11.5723 21.9293 11.399 21.799C9.539 20.193 4 14.993 4 10C4 7.87827 4.84285 5.84344 6.34315 4.34315C7.84344 2.84285 9.87827 2 12 2C14.1217 2 16.1566 2.84285 17.6569 4.34315C19.1571 5.84344 20 7.87827 20 10Z"
        stroke="#4A5565"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
        stroke="#4A5565"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
const ExtrasSummary = () => {
  return (
    <div className={styles.wrapper}>
      {/* BAGGAGE */}
      <div className={`${styles.section} ${styles.sectionTop}`}> 
        <h4 className={styles.heading}>BAGGAGE</h4>

        <div className={styles.item}>
          <CabinBagIcon />
          <div className={styles.text}>
            <p className={styles.title}>Cabin bag - 7kg per passenger</p>
            <p className={styles.subText}>Included for all passengers</p>
          </div>
        </div>

        <div className={`${styles.item} ${styles.itemEnd}`}>
          <CheckeBagIcon />
          <div className={styles.text}>
            <p className={styles.title}>Checked bag (25kg) - Added</p>
            <p className={styles.subText}>₹4,400 for all passengers</p>
          </div>
        </div>
      </div>

      <div className={styles.dashedBorder}/>

      {/* MEALS */}
      <div className={`${styles.section} ${styles.sectionMid}`}>
        <h4 className={styles.heading}>MEALS & BEVERAGES</h4>

        <div className={`${styles.item} ${styles.itemEnd}`}>
          <MealsIcon />
          <div className={styles.text}>
            <p className={styles.title}>Pre-selected meals</p>
            <p className={styles.subText}>₹1,540 total</p>
          </div>
        </div>
      </div>

      <div className={styles.dashedBorder}/>
      {/* SEATING */}
      <div className={styles.section}>
        <h4 className={styles.heading}>SEATING</h4>

        <div className={`${styles.item} ${styles.itemEnd}`}>
          <LoctaionIcon />
          <div className={styles.text}>
            <p className={styles.title}>Seats selected for all passengers</p>
            <p className={styles.subText}>
              DEL–BOM: 1A, 2A, 3A, 4A | BOM–DEL: 1C, 2C, 3C, 4C
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtrasSummary;

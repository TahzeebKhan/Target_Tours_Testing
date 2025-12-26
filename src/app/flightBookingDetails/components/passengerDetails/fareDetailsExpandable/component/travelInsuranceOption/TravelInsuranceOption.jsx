import React from "react";
import styles from "./TravelInsuranceOption.module.css";

const TravelInsuranceOption = () => {
  return (
    <div className={styles.wrapper}>
      <label className={styles.option}>
        <input className={styles.checkbox} type="checkbox" />
        <span className={styles.optionText}>Yes, I want to secure my trip with insurance</span>
      </label>

      <label className={styles.option}>
        <input className={styles.checkbox} type="checkbox" />
        <span className={styles.optionText}>I'll pass on travel insurance for this trip.</span>
      </label>

      <p className={styles.disclaimer}>
        (Upon Selecting Travel Insurance, You accept the{" "}
        <a href="#" className={styles.link}>
          Terms and Conditions
        </a>{" "}
        of the travel insurance policy)
      </p>
    </div>
  );
};

export default TravelInsuranceOption;

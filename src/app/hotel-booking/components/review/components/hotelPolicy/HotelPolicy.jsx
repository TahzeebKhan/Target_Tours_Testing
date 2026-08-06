"use client";

import styles from "./HotelPolicy.module.css";

export default function HotelPolicy({hotelPolicy}) {
   console.log("hotelPolicy2",hotelPolicy)
  return (
    <div className={styles.wrapper}>

{hotelPolicy && hotelPolicy.length > 0 ? (
  <ul className={styles.list}>
    {hotelPolicy.map((val, indx) => (
      <li key={indx} className={styles.policyItem}>
        <strong className={styles.policyType}>{val?.type}</strong>
        <p style={{ whiteSpace: "pre-line", margin: "4px 0 0 0" }}>
          {val?.text}
        </p>
      </li>
    ))}
  </ul>
) : (
  <div className={styles.noPolicyBlock}>
    <p className={styles.noPolicyText}>
      No specific hotel policies listed for this property.
    </p>
  </div>
)}


      {/* <ul className={styles.list}>
        <li>
          Please carry a valid government photo ID (PAN cards not accepted).
          Accepted IDs: Aadhaar, Driving License, Voter ID, or Passport.
        </li>
        <li>Local IDs aren't accepted.</li>
        <li>
          Foreign guests: Passport with a valid visa is required.
        </li>
        <li>
          Visitors: Non-resident visitors are welcome only at the reception.
        </li>
        <li>
          Pets: Allowed in private rooms at ₹500/night per pet.
        </li>
        <li>
          Wi-Fi: Free and fast for all guests.
        </li>
        <li>
          Smoking: Allowed only in designated smoking zones.
          All rooms are non-smoking.
        </li>
      </ul> */}
    </div>
  );
}

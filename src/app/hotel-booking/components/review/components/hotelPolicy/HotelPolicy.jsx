"use client";

import styles from "./HotelPolicy.module.css";

export default function HotelPolicy() {
  return (
    <div className={styles.wrapper}>
      <ul className={styles.list}>
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
      </ul>
    </div>
  );
}

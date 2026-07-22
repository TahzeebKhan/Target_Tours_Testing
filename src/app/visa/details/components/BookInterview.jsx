"use client";

import { useState, useCallback } from "react";
import styles from "./BookInterview.module.css";

const BookInterview = () => {
  const cities = ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai"];
  const availableSlots = [
    {
      date: "Sat, 21 Jun",
      times: ["09:00", "10:00", "03:30", "20:00", "21:00", "22:00"],
    },
    {
      date: "Sun, 22 Jun",
      times: [
        "12:00",
        "13:00",
        "23:00",
        "08:00",
        "07:00",
        "06:00",
        "05:00",
        "04:00",
        "03:00",
        "02:00",
      ],
    },
    {
      date: "Mon, 23 Jun",
      times: ["14:00", "15:00", "01:00", "00:00", "12:30", "11:30"],
    },
    {
      date: "Tue, 24 Jun",
      times: ["16:00", "17:00", "10:30", "09:30", "08:30"],
    },
    {
      date: "Wed, 25 Jun",
      times: ["18:00", "19:00", "07:30", "06:30", "05:30", "04:30"],
    },
  ];

  const [selectedCity, setSelectedCity] = useState("Delhi");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleCityChange = useCallback((city) => {
    setSelectedCity(city);
  }, []);

  const handleSlotChange = useCallback(
    (time) => {
      setSelectedSlot(selectedSlot === time ? null : time);
    },
    [selectedSlot],
  );

  const handleConfirmSlot = useCallback(() => {
    if (selectedSlot) {
      setIsConfirmed(true);
      setTimeout(() => setIsConfirmed(false), 600);
    }
  }, [selectedSlot]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.countryBadge}>
          <img src="/icons/USAFlag.svg" alt="Country Flag" />
          <span className={styles.countryText}>United States Of America</span>
        </div>
        <h1 className={styles.mainTitle}>Book your embassy interview</h1>
        <p className={styles.subtitle}>
          Pick a city and a slot. You can reschedule once for free.
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.citySection}>
          <label className={styles.sectionLabel}>CITY</label>
          <div className={styles.cityTabs}>
            {cities.map((city) => (
              <button
                key={city}
                className={`${styles.cityTab} ${selectedCity === city ? styles.cityTabActive : ""}`}
                onClick={() => handleCityChange(city)}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.slotsSection}>
          <label className={styles.sectionLabel}>AVAILABLE SLOTS</label>
          <div className={styles.dateGroups}>
            {availableSlots.map((slot) => (
              <div key={slot.date} className={styles.dateGroup}>
                <span className={styles.dateLabel}>{slot.date}</span>
                <div className={styles.timeSlots}>
                  {slot.times.map((time) => (
                    <button
                      key={`${slot.date}-${time}`}
                      className={`${styles.timeSlot} ${
                        selectedSlot === `${slot.date}-${time}`
                          ? styles.timeSlotSelected
                          : ""
                      }`}
                      onClick={() => handleSlotChange(`${slot.date}-${time}`)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.noticeCard}>
          <div className={styles.noticeIconWrapper}>
            <svg
            
              xmlns="http://www.w3.org/2000/svg"
              width="16.67"
              height="16.67"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FCC800"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-info-icon lucide-info"
              className={styles.noticeIcon}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
          <div className={styles.noticeContent}>
            <h3 className={styles.noticeTitle}>Need to reschedule?</h3>
            <p className={styles.noticeText}>
              Appointments can be changed up to 48 hours before the scheduled
              time <br></br> without any additional processing fee.
            </p>
          </div>
          <a href="#" className={styles.policyLink}>
            View Policy
          </a>
        </div>

        <div className={styles.footer}>
          <button className={styles.backButton}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Back To Form</span>
          </button>
          <button
            className={`${styles.confirmButton} ${isConfirmed ? styles.confirmButtonActive : ""}`}
            onClick={handleConfirmSlot}
            disabled={!selectedSlot}
          >
            CONFIRM SLOT
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookInterview;

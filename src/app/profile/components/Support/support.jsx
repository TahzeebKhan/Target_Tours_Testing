"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./support.module.css";

const SUPPORT_OPTIONS = [
  { id: "chat", label: "CHAT NOW", icon: "/icons/chat-text.svg" },
  {
    id: "help",
    label: "VISIT THE HELP CENTER",
    icon: "/icons/chat-question.svg",
  },
  { id: "feedback", label: "SHARE YOUR FEEDBACK", icon: "/icons/pen.svg" },
];

export default function Support() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [rating, setRating] = useState(null);

  // Prevent scrolling when any overlay is open
  useEffect(() => {
    const shouldLock = isOverlayOpen || isSuccessOpen;
    document.body.style.overflow = shouldLock ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOverlayOpen, isSuccessOpen]);

  const handleItemClick = (id, index) => {
    setActiveIndex(index);
    if (id === "feedback") {
      setIsOverlayOpen(true);
    }
  };

  const closeFeedback = () => {
    setIsOverlayOpen(false);
    setRating(null);
  };

  const handleSubmit = () => {
    setIsOverlayOpen(false);
    setRating(null);
    setIsSuccessOpen(true);
  };

  return (
    <section className={styles.container}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>Help and feedback</h1>
          <p className={styles.subtitle}>
            Have questions or feedback for us? We’re listening
          </p>
        </header>

        <div className={styles.list}>
          {SUPPORT_OPTIONS.map((option, index) => (
            <button
              key={option.id}
              onClick={() => handleItemClick(option.id, index)}
              className={`${styles.item} ${
                activeIndex === index ? styles.active : ""
              }`}
            >
              <div className={styles.contentLeft}>
                <div className={styles.iconWrapper}>
                  <Image src={option.icon} alt="" width={24} height={24} />
                </div>
                <span className={styles.label}>{option.label}</span>
              </div>
              <div className={styles.arrowWrapper}>
                <Image
                  src="/icons/Buttons.svg"
                  alt=""
                  width={24}
                  height={24}
                  className={styles.arrowDefault}
                />
                <Image
                  src="/icons/angle-right-small.svg"
                  alt=""
                  width={24}
                  height={24}
                  className={styles.arrowHover}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* FEEDBACK OVERLAY */}
      {isOverlayOpen && (
        <div className={styles.overlay} onClick={closeFeedback}>
          <div
            className={styles.overlayContent}
            onClick={(e) => e.stopPropagation()}
          >
            <header className={styles.overlayHeader}>
              <h2 className={styles.overlayTitle}>Share your feedback</h2>
              <button className={styles.closeBtn} onClick={closeFeedback}>
                <Image
                  src="/icons/close.svg"
                  alt="Close"
                  width={24}
                  height={24}
                />
              </button>
            </header>

            <div className={styles.overlayBody}>
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>
                  How likely are you to recommend target and tours to a friend
                  or colleague?
                </label>
                <div className={styles.ratingGroup}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`${styles.ratingBox} ${
                        rating === num ? styles.ratingActive : ""
                      }`}
                      onClick={() => setRating(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>
                  Please include anything else you like us to know
                </label>
                <textarea
                  className={styles.textarea}
                  placeholder="Enter your comments here"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Email address</label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="Enter your email address"
                />
                <p className={styles.helperText}>
                  we will use your email address (emmily.morgan@gmail.com) to
                  follow-up on account issues, and for no other purpose.
                </p>
              </div>
            </div>

            <footer className={styles.overlayFooter}>
              <button className={styles.backBtn} onClick={closeFeedback}>
                <Image
                  src="/icons/arrow-left.svg"
                  alt=""
                  width={16}
                  height={16}
                />
                BACK
              </button>
              <button className={styles.sendBtn} onClick={handleSubmit}>
                SEND FEEDBACK
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* SUCCESS OVERLAY */}
      {isSuccessOpen && (
        <div
          className={`${styles.overlay} ${styles.successOverlay}`}
          onClick={() => setIsSuccessOpen(false)}
        >
          <div
            className={`${styles.overlayContent} ${styles.successContent}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.successBody}>

              <h2 className={styles.successTitle}>
                Thank you for your feedback
              </h2>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

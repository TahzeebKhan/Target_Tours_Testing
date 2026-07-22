"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./support.module.css";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/navigation";

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
  const [isClosing, setIsClosing] = useState(false);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const newErrors = {};

    if (!rating) newErrors.rating = "Rating is required";
    if (!message.trim()) newErrors.message = "Message cannot be empty";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(email)) newErrors.email = "Invalid email format";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const token = Cookies.get("auth_token");
    if (!token) {
      toast.error("You must be logged in to submit feedback");
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-support`,
        {
          recommendation_points: rating,
          feedback: message,
          email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setIsOverlayOpen(false);
      setIsSuccessOpen(true);
      setRating(null);
      setMessage("");
      setEmail("");
      setErrors({});
    } catch (error) {
      const backendMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Something went wrong";

      toast.error(backendMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

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
    } else if (id === "help") {
      router.push("/contact-support");
    }
  };

  const closeFeedback = () => {
    setIsClosing(true);

    setTimeout(() => {
      setIsOverlayOpen(false);
      setIsClosing(false);
      setRating(null);
    }, 350); // match CSS animation time
  };

  return (
    <>
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
                    src="/icons/Close.svg"
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
                  {errors.rating && (
                    <p className={styles.errorText}>{errors.rating}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>
                    Please include anything else you like us to know
                  </label>
                  <textarea
                    className={`${styles.textarea} ${
                      errors.message ? styles.inputError : ""
                    }`}
                    placeholder="Enter your comments here"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />

                  {errors.message && (
                    <p className={styles.errorText}>{errors.message}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>Email address</label>
                  <input
                    type="email"
                    className={`${styles.input} ${
                      errors.email ? styles.inputError : ""
                    }`}
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  {errors.email && (
                    <p className={styles.errorText2}>{errors.email}</p>
                  )}

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
                <button
                  className={styles.sendBtn}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "SENDING..." : "SEND FEEDBACK"}
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
      <section className={`${styles.container} ${styles.containerMobile}`}>
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
              className={`${styles.overlayContent} ${
                isClosing ? styles.overlayClosing : ""
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <header className={styles.overlayHeader}>
                <h2 className={styles.overlayTitle}>Share your feedback</h2>
                <button className={styles.closeBtn} onClick={closeFeedback}>
                  <Image
                    src="/icons/Close.svg"
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
                  {errors.rating && (
                    <p className={styles.errorText}>{errors.rating}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>
                    Please include anything else you like us to know
                  </label>
                  <textarea
                    className={`${styles.textarea} ${
                      errors.message ? styles.inputError : ""
                    }`}
                    placeholder="Enter your comments here"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />

                  {errors.message && (
                    <p className={styles.errorText}>{errors.message}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>Email address</label>
                  <input
                    type="email"
                    className={`${styles.input} ${
                      errors.email ? styles.inputError : ""
                    }`}
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  {errors.email && (
                    <p className={styles.errorText2}>{errors.email}</p>
                  )}

                  <p className={styles.helperText}>
                    we will use your email address (emmily.morgan@gmail.com) to
                    follow-up on account issues, and for no other purpose.
                  </p>
                </div>
              </div>

              <footer className={styles.overlayFooter}>
                <button className={styles.backBtn} onClick={closeFeedback}>
                  {/* <Image
                    src="/icons/arrow-left.svg"
                    alt=""
                    width={16}
                    height={16}
                  /> */}
                  Cancel
                </button>
                <button
                  className={styles.sendBtn}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "SENDING..." : "SEND FEEDBACK"}
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
    </>
  );
}

"use client"
import React, { useState } from "react";
import styles from "./LoginPopup.module.css";

const LoginPopup = ({ open, onClose }) => {
    const [isOtp, setIsOtp] = useState(false);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(new Array(6).fill(""));


    // 🔹 OTP input change
    const handleOtpChange = (value, index) => {
        if (!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // auto focus next
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };
    // 🔹 Backspace handling
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    // 🔹 Verify OTP
    const handleVerifyOtp = () => {
        const enteredOtp = otp.join("");
        if (enteredOtp.length !== 6) {
            alert("Please enter complete OTP");
            return;
        }

        console.log("OTP Verified:", enteredOtp);
        // 👉 API CALL HERE
    };

    // 🔹 Resend OTP
    const handleResendOtp = () => {
        console.log("Resend OTP to:", email);
        setOtp(new Array(6).fill(""));
        document.getElementById("otp-0")?.focus();
        // 👉 API CALL HERE
    };


    if (!open) return null;

    return (
        <div className={styles.popupOverlay} onClick={onClose}>
            <div
                className={styles.popupCard}
                onClick={(e) => e.stopPropagation()}
            >
                {/* LEFT */}
                <div className={styles.popupLeft}>

                    {!isOtp && (
                        <>
                            {/* LOGIN CONTENT (UNCHANGED) */}
                            <div className={styles.popupLeftHeader}>
                                <div className={styles.popupHeader}>
                                    <h2>Welcome</h2>
                                    <img src="/images/HobLogo.png" alt="" />
                                </div>
                                <p className={styles.subText}>
                                    Log in or sign up in seconds
                                </p>
                            </div>

                            <div className={styles.inputFieldsContainer}>
                                <div className={styles.inputFields}>
                                    <label className={styles.label}>
                                        Email address <span className={styles.asterisk}>*</span>
                                    </label>
                                    <input type="email" placeholder="Enter Your Email Address" onChange={(e) => setEmail(e.target.value)} />
                                </div>

                                <div className={styles.inputFields}>
                                    <label className={styles.label}>
                                        Referral Code <span>(This is not a discount code)</span>
                                    </label>
                                    <input type="text" placeholder="Enter Your Referral Code" />
                                </div>
                            </div>

                            <button
                                className={styles.primaryBtn}
                                onClick={() => setIsOtp(true)}
                            >
                                CONTINUE
                            </button>

                            <div className={styles.terms}>
                                <input type="checkbox" checked readOnly />
                                <span className={styles.customCheckbox}></span>
                                <span>
                                    Agree With Our{" "}
                                    <span className={styles.termsText}>Terms & Conditions</span> And{" "}
                                    <span className={styles.termsText}>Privacy Policy</span>.
                                </span>
                            </div>

                            <div className={styles.divider}>
                                <span>or continue with</span>
                            </div>

                            <div className={styles.socialRow}>
                                <button className={styles.social}>
                                    <img src="/icons/google.svg" alt="" />
                                </button>
                                <button className={styles.social}>
                                    <img src="/icons/Apple.svg" alt="" />
                                </button>
                                <button className={styles.social}>
                                    <img src="/icons/Facebook.svg" alt="" />
                                </button>
                            </div>
                        </>
                    )}

                    {isOtp && (
                        <>
                            {/* OTP CONTENT (SAME STRUCTURE AREA) */}
                            <div className={styles.popupLeftHeader}>
                                <div className={styles.popupHeader}>
                                    <h2>Enter OTP</h2>
                                    <span className={styles.resendOtp}>Resend OTP</span>
                                </div>

                                <p className={styles.otpSubText}>
                                    We've sent a verification code to {email}
                                </p>
                            </div>

                             <div className={styles.otpContainer}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        className={styles.otpInput}
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) =>
                                            handleOtpChange(e.target.value, index)
                                        }
                                        onKeyDown={(e) =>
                                            handleKeyDown(e, index)
                                        }
                                    />
                                ))}
                            </div>

                            <button className={styles.primaryBtn}>
                                CONTINUE
                            </button>

                            <div className={styles.divider}>
                                <span>or continue with</span>
                            </div>

                            <div className={styles.socialRow}>
                                <button className={styles.social}>
                                    <img src="/icons/google.svg" alt="" />
                                </button>
                                <button className={styles.social}>
                                    <img src="/icons/Apple.svg" alt="" />
                                </button>
                                <button className={styles.social}>
                                    <img src="/icons/Facebook.svg" alt="" />
                                </button>
                            </div>
                        </>
                    )}

                </div>

                {/* RIGHT IMAGE — UNTOUCHED */}
                <div className={styles.popupRight}>
                    <img src="/images/loginImage.jpg" alt="Experience" />
                </div>
            </div>
        </div>
    );
};

export default LoginPopup;

// "use client";
// import Image from "next/image";
// import styles from "./LoginPopup.module.css";
// import React, { useState, useEffect } from "react";

// export default function LoginPopup({ onNavigate, onClose }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, []);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       setLoading(true);

//       const res = await fetch(
//         "http://139.84.175.121:1337/api/frontend-user/login",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             email: email,
//             password: password,
//             domain: process.env.NEXT_PUBLIC_DOMAIN, // ❗ required
//           }),
//         }
//       );

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data?.error?.message || "Login failed");
//       }

//       // ✅ SUCCESS
//       console.log("Login success:", data);

//       // OPTIONAL: store token if backend sends it
//       // localStorage.setItem("token", data.token);

//       onClose(); // close popup after login

//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={styles.overlay} onClick={onClose}>
//       <div
//         className={styles.mainContainer}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Left Section */}
//         <section className={styles.imageSection}>
//           <Image
//             src="/images/travel-hero.jpg"
//             alt="Scenic view of Ko Tapu"
//             fill
//             className={styles.heroImage}
//             priority
//           />
//         </section>

//         {/* Right Section */}
//         <section className={styles.formSection}>
//           <div className={styles.formContent}>
//             <header className={styles.header}>
//               <div className={styles.logoContainer}>
//                 <Image
//                   src="/images/tour-logo.svg"
//                   alt="Target Tours Logo"
//                   width={87}
//                   height={73}
//                   className={styles.logo}
//                 />
//               </div>

//               <div className={styles.titleWrapper}>
//                 <h1 className={styles.title}>Welcome back</h1>
//                 <p className={styles.subtitle}>
//                   New here?{" "}
//                   <span
//                     className={styles.linkText}
//                     onClick={() => onNavigate("signup")}
//                   >
//                     Create an account
//                   </span>
//                 </p>
//               </div>
//             </header>

//             <form className={styles.form} onSubmit={handleLogin}>
//               <div className={styles.inputGroup}>
//                 <label className={styles.label}>
//                   Enter Email Id/ Phone Number
//                 </label>
//                 <input
//                   type="text"
//                   className={styles.input}
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                 />
//               </div>

//               <div className={styles.inputGroup}>
//                 <label className={styles.label}>Enter password</label>
//                 <input
//                   type="password"
//                   className={styles.input}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                 />
//               </div>

//               {error && (
//                 <p style={{ color: "red", fontSize: "12px" }}>{error}</p>
//               )}

//               <div className={styles.formOptions}>
//                 <label className={styles.checkboxContainer}>
//                   <input type="checkbox" className={styles.checkboxInput} />
//                   <span className={styles.customCheckbox}></span>
//                   <span className={styles.checkboxLabel}>Remember me?</span>
//                 </label>
//                 <span className={styles.forgotPassword}>Forgot password?</span>
//               </div>

//               <button
//                 type="submit"
//                 className={styles.loginButton}
//                 disabled={loading}
//               >
//                 {loading ? "LOGGING IN..." : "LOGIN"}
//               </button>
//             </form>

//             <div className={styles.divider}>
//               <span className={styles.dividerText}>Or sign in with</span>
//             </div>

//             <div className={styles.socialButtons}>
//               <button className={styles.socialButton}>
//                 <Image
//                   src="/icons/google-icon.svg"
//                   alt="Google"
//                   width={24}
//                   height={24}
//                 />
//                 SIGN IN WITH GOOGLE
//               </button>

//               <button className={styles.socialButtonFacebook}>
//                 <Image
//                   src="/icons/facebook-icon.svg"
//                   alt="Facebook"
//                   width={24}
//                   height={24}
//                 />
//                 SIGN IN WITH FACEBOOK
//               </button>
//             </div>

//             <footer className={styles.footer}>
//               <p className={styles.copyright}>
//                 Copyrights ©2023 Target tours. Build by Webninjaz.
//               </p>
//             </footer>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }

"use client";
import Image from "next/image";
import styles from "./LoginPopup.module.css";
import React, { useState, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "@/app/context/AuthContext";
import { appToast } from "@/shared/components/appToast/AppToast";
import BrandLogo from "@/shared/components/BrandLogo";
import { startGoogleLogin } from "@/shared/services/googleAuth";
import { Eye, EyeOff } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function LoginPopup({ onNavigate, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPortalReady, setIsPortalReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [googleLoginLoading, setGoogleLoginLoading] = useState(false);
  const slides = Array.from({ length: 5 }); // 5 slides (change count if needed)
  const [corporateLogin, setCorporateLogin] = useState(false);

  const { login } = useAuth();

  useIsomorphicLayoutEffect(() => {
    document.body.style.overflow = "hidden";
    setIsPortalReady(true);
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  const isEmailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const isPhoneValid = (value) => /^[6-9]\d{9}$/.test(value); // Indian 10-digit numbers

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setPasswordError("");

    let hasError = false;

    if (!email.trim()) {
      setEmailError("Email or phone number is required");
      hasError = true;
    } else {
      const isNumeric = /^\d+$/.test(email);

      if (isNumeric) {
        if (!isPhoneValid(email)) {
          setEmailError("Enter a valid 10-digit phone number");
          hasError = true;
        }
      } else {
        if (!isEmailValid(email)) {
          setEmailError("Enter a valid email address");
          hasError = true;
        }
      }
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      hasError = true;
    }
    if (hasError) return;

    try {
      setLoading(true);

      // 1️⃣ LOGIN API
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/frontend-user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            domain: process.env.NEXT_PUBLIC_DOMAIN,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || "Login failed");
      }

      // 2️⃣ STORE AUTH DATA
      login({
        token: data.token,
        user: data.user,
      });

      // 3️⃣ FETCH USER PROFILE (IMPORTANT PART)
      try {
        const profileRes = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/frontend-user-profiles/by-user/${data.user.id}`,
          {
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
          }
        );

        if (profileRes?.data) {
          Cookies.set("user_profile", JSON.stringify(profileRes.data), {
            expires: 7,
          });
        }
      } catch (profileErr) {
        console.log("Profile fetch failed (non-blocking)");
      }

      // 5️⃣ CLOSE POPUP
      appToast.success(data?.message || "Welcome! You've Logged in Successfully");
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong");
      appToast.error(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");

    try {
      setGoogleLoginLoading(true);
      const data = await startGoogleLogin();

      login({
        token: data.token,
        user: data.user,
      });

      appToast.success("Welcome! You've Logged in Successfully");
      onClose();
    } catch (err) {
      setError(err.message || "Google login failed");
      appToast.error(err.message || "Google login failed");
    } finally {
      setGoogleLoginLoading(false);
    }
  };

  const handleCreateAccountClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigate("signup");
  };

  const corporateLoginModal = (
      <div className={styles.overlay} onClick={onClose}>
        <div
          className={styles.mainContainer}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Section */}
          <section className={styles.imageSection}>
            {/* <Image
            src="/images/travel-hero.webp"
            alt="Scenic view of Ko Tapu"
            fill
            className={styles.heroImage}
            priority
          /> */}

            <Swiper
              modules={[Pagination, Autoplay]}
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              loop
              className={styles.logoSwiper}
            >
              {slides.map((_, index) => (
                <SwiperSlide key={index} className={styles.logoSlide}>
                  <Image
                    src="/images/travel-hero.webp"
                    alt="Target Tours Logo"
                    width={87}
                    priority
                    unoptimized
                    height={73}
                    className={styles.slideImage}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
          {/* Right Section */}
          <section className={styles.formSection}>
            <div className={styles.formContent}>
              <header className={styles.header}>
                <div className={styles.logoContainer}>
                  <BrandLogo
                    fallbackSrc="/images/tour-logo.svg"
                    alt="Target Tours Logo"
                    width={87}
                    height={73}
                    className={styles.logo}
                  />
                </div>

                <div className={styles.titleWrapper}>
                  <h1 className={styles.title}>Welcome back</h1>
                  {/* <p className={styles.subtitle}>
                    New here?{" "}
                    <span
                      className={styles.linkText}
                      onClick={() => onNavigate("signup")}
                    >
                      Create an account
                    </span>
                  </p>
                  <p className={styles.subtitle}>
                    Corporate Employee?{" "}
                    <span
                      className={styles.linkText}
                      onClick={() => setCorporateLogin(true)}
                    >
                      Sign In Here
                    </span>
                  </p> */}
                </div>
              </header>

              <form className={styles.form} onSubmit={handleLogin}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    User ID
                  </label>
                  <input
                    type="text"
                    placeholder="adfet465"
                    className={`${styles.input} ${
                      emailError ? styles.error : ""
                    }`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    // required
                  />

                  {emailError && (
                    <p style={{ color: "red", fontSize: "12px" }}>
                      {emailError}
                    </p>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Password</label>
                  <div className={styles.passwordInputWrap}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`${styles.input} ${styles.passwordInput} ${
                        passwordError ? styles.error : ""
                      }`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordError && (
                    <p style={{ color: "red", fontSize: "12px" }}>
                      {passwordError}
                    </p>
                  )}
                </div>

                {error && (
                  <p style={{ color: "red", fontSize: "12px" }}>{error}</p>
                )}

                <div className={styles.formOptions}>
                  <label className={styles.checkboxContainer}>
                    <input type="checkbox" className={styles.checkboxInput} />
                    <span className={styles.customCheckbox}></span>
                    <span className={styles.checkboxLabel}>Remember me?</span>
                  </label>
                  <span className={styles.forgotPassword}>
                    Forgot password?
                  </span>
                </div>

                <button
                  type="submit"
                  className={styles.loginButton}
                  disabled={loading}
                >
                  {loading ? "LOGGING IN..." : "LOGIN"}
                </button>
              </form>

              {/* <div className={styles.divider}>
                <span className={styles.dividerText}>Or sign in with</span>
              </div>

              <div className={styles.socialButtons}>
                <button className={styles.socialButton}>
                  <Image
                    src="/icons/google-icon.svg"
                    alt="Google"
                    width={24}
                    height={24}
                  />
                  SIGN IN WITH GOOGLE
                </button>

                <button className={styles.socialButtonFacebook}>
                  <Image
                    src="/icons/facebook-icon.svg"
                    alt="Facebook"
                    width={24}
                    height={24}
                  />
                  SIGN IN WITH FACEBOOK
                </button>
              </div> */}

              <footer className={styles.footer}>
                <p className={styles.copyright}>
                  Copyrights ©2023 Target tours. Build by Webninjaz.
                </p>
              </footer>
            </div>
          </section>
        </div>
      </div>
    );

  const defaultLoginModal = (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.mainContainer}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Section */}
        <section className={styles.imageSection}>
          {/* <Image
            src="/images/travel-hero.webp"
            alt="Scenic view of Ko Tapu"
            fill
            className={styles.heroImage}
            priority
          /> */}

          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop
            className={styles.logoSwiper}
          >
            {slides.map((_, index) => (
              <SwiperSlide key={index} className={styles.logoSlide}>
                <Image
                  src="/images/travel-hero.webp"
                  alt="Target Tours Logo"
                  width={87}
                  priority
                  unoptimized
                  height={73}
                  className={styles.slideImage}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
        {/* Right Section */}
        <section className={styles.formSection}>
          <div className={styles.formContent}>
            <header className={styles.header}>
              <div className={styles.logoContainer}>
                <BrandLogo
                  fallbackSrc="/images/tour-logo.svg"
                  alt="Target Tours Logo"
                  width={87}
                  height={73}
                  className={styles.logo}
                />
              </div>

              <div className={styles.titleWrapper}>
                <h1 className={styles.title}>Welcome back</h1>
                <p className={styles.subtitle}>
                  New here?{" "}
                  <span
                    className={styles.linkText}
                    onClick={handleCreateAccountClick}
                  >
                    Create an account
                  </span>
                </p>
                <p className={styles.subtitle}>
                  Corporate Employee?{" "}
                  <span
                    className={styles.linkText}
                    onClick={() => setCorporateLogin(true)}
                  >
                    Sign In Here
                  </span>
                </p>
              </div>
            </header>

            <form className={styles.form} onSubmit={handleLogin}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  Enter Email Id/ Phone Number
                </label>
                <input
                  type="text"
                  className={`${styles.input} ${
                    emailError ? styles.error : ""
                  }`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  // required
                />

                {emailError && (
                  <p style={{ color: "red", fontSize: "12px" }}>{emailError}</p>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Enter password</label>
                <div className={styles.passwordInputWrap}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`${styles.input} ${styles.passwordInput} ${
                      passwordError ? styles.error : ""
                    }`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError && (
                  <p style={{ color: "red", fontSize: "12px" }}>
                    {passwordError}
                  </p>
                )}
              </div>

              {error && (
                <p style={{ color: "red", fontSize: "12px" }}>{error}</p>
              )}

              <div className={styles.formOptions}>
                <label className={styles.checkboxContainer}>
                  <input type="checkbox" className={styles.checkboxInput} />
                  <span className={styles.customCheckbox}></span>
                  <span className={styles.checkboxLabel}>Remember me?</span>
                </label>
                <span className={styles.forgotPassword}>Forgot password?</span>
              </div>

              <button
                type="submit"
                className={styles.loginButton}
                disabled={loading}
              >
                {loading ? "LOGGING IN..." : "LOGIN"}
              </button>
            </form>

            <div className={styles.divider}>
              <span className={styles.dividerText}>Or sign in with</span>
            </div>

            <div className={styles.socialButtons}>
              <button
                type="button"
                className={styles.socialButton}
                disabled={googleLoginLoading}
                onClick={handleGoogleLogin}
              >
                <Image
                  src="/icons/google-icon.svg"
                  alt="Google"
                  width={24}
                  height={24}
                />
                {googleLoginLoading ? "CONNECTING..." : "SIGN IN WITH GOOGLE"}
              </button>

              <button type="button" className={styles.socialButtonFacebook}>
                <Image
                  src="/icons/facebook-icon.svg"
                  alt="Facebook"
                  width={24}
                  height={24}
                />
                SIGN IN WITH FACEBOOK
              </button>
            </div>

            <footer className={styles.footer}>
              <p className={styles.copyright}>
                Copyrights ©2023 Target tours. Build by Webninjaz.
              </p>
            </footer>
          </div>
        </section>
      </div>
    </div>
  );

  if (!isPortalReady) return null;

  return createPortal(
    corporateLogin ? corporateLoginModal : defaultLoginModal,
    document.body
  );
}

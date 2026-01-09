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
//             domain: "localhost:1337", // ❗ required
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
import React, { useState, useEffect } from "react";

export default function LoginPopup({ onNavigate, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const setCookie = (name, value, days = 7) => {
    const expires = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000
    ).toUTCString();

    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const res = await fetch(
        "http://139.84.175.121:1337/api/frontend-user/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            domain: "localhost:1337",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || "Login failed");
      }

      // ✅ STORE TOKEN IN COOKIE
      setCookie("auth_token", data.token, 7);

      // Optional: user info bhi cookie ya localStorage me
      setCookie("user_id", data.user.id, 7);

      onClose();

    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.mainContainer}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Section */}
        <section className={styles.imageSection}>
          <Image
            src="/images/travel-hero.jpg"
            alt="Scenic view of Ko Tapu"
            fill
            className={styles.heroImage}
            priority
          />
        </section>

        {/* Right Section */}
        <section className={styles.formSection}>
          <div className={styles.formContent}>
            <header className={styles.header}>
              <div className={styles.logoContainer}>
                <Image
                  src="/images/tour-logo.svg"
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
                    onClick={() => onNavigate("signup")}
                  >
                    Create an account
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
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Enter password</label>
                <input
                  type="password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
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
}


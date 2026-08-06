"use client";

import { useEffect, useState } from "react";
import styles from "./MobileLayout.module.css";
import { useSupportFlow } from "../context/SupportFlowContext";
import { useRouter } from "next/navigation";

export default function MobileOnlyLayout({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const { step, setStep } = useSupportFlow();
  const router = useRouter();
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 895);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!isMobile) return <>{children}</>;
  const handleBack = () => {
    if (step === "support") {
      router.push("/profile");
    } else if (step === "contact") {
      setStep("support");
    } else if (step === "help") {
      setStep("contact");
    } else if (step === "connect") {
      setStep("help");
    }
  };

  return (
    <div className={styles.mobileLayout}>
      <div className={styles.navDetailsMobile}>
        <span onClick={handleBack} className={styles.backArrow}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18.6513 9.12663H3.10696L8.10144 4.13215C8.41172 3.82187 8.41172 3.32034 8.10144 3.01006C7.79096 2.69977 7.28944 2.69977 6.97915 3.01006L0.630009 9.35844C0.556866 9.43215 0.498961 9.52034 0.45858 9.61711C0.37839 9.81082 0.37839 10.0299 0.45858 10.2236C0.498961 10.3203 0.556866 10.4083 0.630009 10.4822L6.97915 16.8306C7.13382 16.9855 7.33706 17.0632 7.5403 17.0632C7.74334 17.0632 7.94658 16.9855 8.10144 16.8306C8.41172 16.5203 8.41172 16.0188 8.10144 15.7083L3.10696 10.7141H18.6513C19.0894 10.7141 19.4451 10.3584 19.4451 9.92034C19.4451 9.48225 19.0894 9.12663 18.6513 9.12663Z"
              fill="#1E293B"
            />
          </svg>
        </span>
        <span className={styles.title}>
          {step === "support" && "How Can We Help You?"}
          {step === "contact" && "Contact Support"}
          {step === "help" && "Help us find your booking"}
          {step === "connect" && "How would you like to connect?"}
        </span>
      </div>

      <main className={styles.mobileContent}>{children}</main>
    </div>
  );
}

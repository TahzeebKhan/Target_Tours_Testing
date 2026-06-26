"use client";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import { useAuth } from "../context/AuthContext";
import ProfileModal from "../home-page/components/homePage/modals/ProfileModal";
import { useEffect, useRef, useState } from "react";
import BrandLogo from "@/shared/components/BrandLogo";
import { useOptionalFlightBooking } from "./FlightBookingContext";
import {
  clearFlightBookingSession,
  getFlightBookingSessionExpiry,
} from "@/features/flights/utils/flightBookingSession";
import SessionExpiredModal from "../flights/components/SessionExpiredModal";

const formatRemainingTime = (milliseconds) => {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const removeBookingFallbackFromUrl = () => {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.searchParams.delete("bookingFallback");
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
};

const Navbar = () => {
  const { isLoggedIn, profile: userProfile, user } = useAuth();
  const flightBooking = useOptionalFlightBooking();
  const bookingSession = flightBooking?.bookingSession || null;
  const setBookingSession = flightBooking?.setBookingSession;

  const router = useRouter();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const profileBtnRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const [isSessionExpiredModalOpen, setIsSessionExpiredModalOpen] = useState(false);
  const sessionExpiresAt = getFlightBookingSessionExpiry(bookingSession);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!sessionExpiresAt) {
      setRemainingMs(0);
      return;
    }

    const updateRemainingTime = () => {
      const nextRemainingMs = Math.max(0, sessionExpiresAt - Date.now());
      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs <= 0) {
        clearFlightBookingSession();
        removeBookingFallbackFromUrl();
        setBookingSession?.(null);
        setIsSessionExpiredModalOpen(true);
      }
    };

    updateRemainingTime();
    const timer = window.setInterval(updateRemainingTime, 1000);

    return () => window.clearInterval(timer);
  }, [router, sessionExpiresAt, setBookingSession]);

  const handleSessionExpiredClose = () => {
    setIsSessionExpiredModalOpen(false);
    router.replace("/flights");
  };
  const displayName =
    userProfile?.display_name ||
    userProfile?.full_name ||
    user?.display_name ||
    user?.full_name ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <>
      <SessionExpiredModal
        isOpen={isSessionExpiredModalOpen}
        message="Your flight booking session has expired. Please search again to continue."
        subText="Search again to refresh fares and availability."
        actionLabel="SEARCH FLIGHTS"
        onClose={handleSessionExpiredClose}
      />
      {" "}
      <div className={`${styles.navContainer} fixed top-0 z-50`}>
        <div
          className={`${styles.navbar}  w-full flex  justify-between items-center`}
        >
          <BrandLogo
            onClick={() => router.push("/")}
            style={{ cursor: "pointer" }}
            fallbackSrc="/Logo.svg"
            alt="Target Tours Logo"
          />
          <div className={`${styles.navRight} flex gap-3`}>
            {isMounted && (
              <>
                {sessionExpiresAt ? (
                  <div className={styles.sessionExpires}>
                    <img src="/icons/watchIcon.svg" alt="" />
                    <p className={styles.sessionExpiresText}>
                      Session expires in <span>{formatRemainingTime(remainingMs)}</span>
                    </p>
                  </div>
                ) : null}
                <button
                  className={`${styles.glass_button} ${styles.downloadBtn}`}
                >
                  Download the App
                </button>

                {!isLoggedIn ? (
                  <button
                    className={styles.signInBtn}
                    onClick={() => router.push("/?openLogin=true")}
                  >
                    Sign In
                  </button>
                ) : (
                  <>
                    <button
                      ref={profileBtnRef}
                      onClick={() => setShowProfileModal(true)}
                      className={`${styles.glass_button} ${styles.logggedInBtn}`}
                      type="button"
                    >
                      Hi, {displayName}
                    </button>

                    {showProfileModal && (
                      <ProfileModal
                        anchorRef={profileBtnRef}
                        onClose={() => setShowProfileModal(false)}
                      />
                    )}
                  </>
                )}
              </>
            )}

            {/* {!isLoggedIn && (
              <button
                onClick={() => router.push("/?openLogin=true")}
                className={styles.signInBtn}
              >
                Sign In
              </button>
            )} */}

            <button className={styles.hamBurger}>
              <img src="/icons/hamBurger.png" alt="" />
              menu
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;

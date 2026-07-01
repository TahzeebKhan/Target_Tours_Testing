"use client";
import React, { useEffect, useRef, useState } from "react";
import Navbar from "../flight-booking-details/Navbar";
import styles from "./HotelBooking.module.css";
import BookingSummary from "./components/review/components/BookingSummary";
import { RoomProvider } from "../context/RoomContext";
import { useRouter } from "next/navigation";
import CorporateSidebarSummary from "./CorporateSidebarSummary";
import {
  HOTEL_BOOKING_STATUS_KEY,
  HOTEL_BOOKING_STATUS_EVENT,
  clearHotelBookingSession,
  getHotelBookingSessionExpiry,
  readHotelBookingSession,
  readHotelBookingStatus,
} from "@/shared/services/hotelSearch";
import LoginPopup from "@/app/account/loginPopUp/LoginPopup";
import SignupPopup from "@/app/account/signUpPopUp/SignupPopup";

const getRoomTotal = (room) => {
  const quantity = Number(room.quantity || 0);
  const nights = Number(room.nights || 1);
  const price = Number(room.pricePerNight || 0);
  const tax = Number(room.taxPerNight || 0);

  return (price + (room.rateIncludesTax ? 0 : tax)) * quantity * nights;
};

const layout = ({ children }) => {
  const router = useRouter();
  const bookingUrlRef = useRef("");
  const roomListRef = useRef([]);
  const [bookingSession, setBookingSession] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [hotelBookingStatus, setHotelBookingStatus] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState("login");
  const sessionExpiresAt = getHotelBookingSessionExpiry(bookingSession);
  const [roomList, setRoomList] = useState([
    {
      id: "deluxe_ac_room",
      title: "Deluxe Private AC Room with Ensuite Bathroom",
      image: "/images/hotelArt1.png",
      pricePerNight: 1397.86,
      quantity: 1,
      maxQuantity: 5,
      nights: 1,
    },
    {
      id: "premium_ac_room",
      title: "Premium Private AC Room with Ensuite Bathroom",
      image: "/images/hotelArt1.png",
      pricePerNight: 1397.86,
      quantity: 1,
      maxQuantity: 5,
      nights: 1,
    },
  ]);

  useEffect(() => {
    roomListRef.current = roomList;
  }, [roomList]);

  useEffect(() => {
    const session = readHotelBookingSession();

    if (session?.rooms?.length) {
      setBookingSession(session);
      setRoomList(session.rooms);
    } else {
      setBookingSession(null);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const applyBookingStatus = (status) => {
      const isClosed =
        status?.status === "submit_started" ||
        status?.status === "payment_started" ||
        status?.status === "confirmed";

      setHotelBookingStatus(isClosed ? status : null);
      if (isClosed) {
        clearHotelBookingSession();
        setBookingSession(null);
      }
    };

    applyBookingStatus(readHotelBookingStatus());

    const handleStatusEvent = (event) => {
      applyBookingStatus(event.detail);
    };
    const handleStorageEvent = (event) => {
      if (event.key !== HOTEL_BOOKING_STATUS_KEY) return;

      try {
        applyBookingStatus(event.newValue ? JSON.parse(event.newValue) : null);
      } catch {
        applyBookingStatus(null);
      }
    };

    window.addEventListener(HOTEL_BOOKING_STATUS_EVENT, handleStatusEvent);
    window.addEventListener("storage", handleStorageEvent);
    return () => {
      window.removeEventListener(HOTEL_BOOKING_STATUS_EVENT, handleStatusEvent);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

  const expireHotelBookingSession = () => {
    clearHotelBookingSession();
    setBookingSession(null);
  };

  const [sidebarOpen, setSideBarOpen] = useState(false);
  const getSelectedRoomCount = (rooms = []) =>
    rooms.reduce((total, room) => total + Number(room.quantity || 0), 0);

  const stepBackRoomSelection = () => {
    setRoomList((prev) => {
      if (getSelectedRoomCount(prev) <= 1) return prev;

      const nextRooms = [...prev];
      let lastSelectedIndex = -1;

      for (let index = nextRooms.length - 1; index >= 0; index -= 1) {
        if (Number(nextRooms[index]?.quantity || 0) > 0) {
          lastSelectedIndex = index;
          break;
        }
      }

      if (lastSelectedIndex < 0) return prev;

      const selectedRoom = nextRooms[lastSelectedIndex];
      const nextQuantity = Number(selectedRoom.quantity || 0) - 1;

      if (nextQuantity > 0) {
        nextRooms[lastSelectedIndex] = {
          ...selectedRoom,
          quantity: nextQuantity,
        };
        return nextRooms;
      }

      return nextRooms.filter((_, index) => index !== lastSelectedIndex);
    });
  };

  const handleBookingBack = () => {
    if (getSelectedRoomCount(roomListRef.current) > 1) {
      stepBackRoomSelection();
      return;
    }

    router.back();
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    bookingUrlRef.current = window.location.href;
    window.history.replaceState(
      { ...(window.history.state || {}), hotelBookingPage: true },
      "",
      window.location.href,
    );
    window.history.pushState({ hotelBookingGuard: true }, "", window.location.href);

    const handleBackButton = () => {
      if (getSelectedRoomCount(roomListRef.current) > 1) {
        stepBackRoomSelection();
        window.history.pushState(
          { hotelBookingGuard: true },
          "",
          bookingUrlRef.current,
        );
        return;
      }

      window.removeEventListener("popstate", handleBackButton);
      window.history.back();
    };

    window.addEventListener("popstate", handleBackButton);
    return () => window.removeEventListener("popstate", handleBackButton);
  }, []);

  const removeRoom = (id) => {
    setRoomList((prev) =>
      prev.map((room) => (room.id === id ? { ...room, quantity: 0 } : room)),
    );
  };
  const increaseRoom = (id) => {
    setRoomList((prev) =>
      prev.map((room) =>
        room.id === id && room.quantity < room.maxQuantity
          ? { ...room, quantity: room.quantity + 1 }
          : room,
      ),
    );
  };
  const toggleSidebar = () => {
    setSideBarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSideBarOpen(false);
  };

  const openLoginModal = () => {
    setAuthView("login");
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthView("login");
  };

  const decreaseRoom = (id) => {
    setRoomList((prev) =>
      prev
        .map((r) => (r.id === id ? { ...r, quantity: r.quantity - 1 } : r))
        .filter((r) => r.quantity > 0),
    );
  };
  const totalAmount = roomList.reduce(
    (sum, room) => sum + getRoomTotal(room),
    0,
  );
  const isCorporate = false;
  return (
    <RoomProvider
      value={{
        roomList,
        increaseRoom,
        decreaseRoom,
        removeRoom,
        bookingSession,
        bookingLoading,
        setBookingLoading,
        hotelBookingStatus,
        openLoginModal,
      }}
    >
      <section className={styles.contentWrapper}>
        <div className={styles.navbarWrapper}>
          <Navbar
            sessionExpiresAt={sessionExpiresAt}
            onSessionExpired={expireHotelBookingSession}
            sessionExpiredMessage="Your hotel booking session has expired. Please search again to continue."
            sessionExpiredSubText="Search again to refresh rates and availability."
            sessionExpiredActionLabel="SEARCH HOTELS"
            sessionExpiredRedirectPath="/"
          />
        </div>
        <div className={styles.childrenWrapper}>
          {children}
          <div className={styles.sideBarDesktop}>
            <BookingSummary roomList={roomList} onRemove={removeRoom} />
            {isCorporate && <CorporateSidebarSummary />}
          </div>
        </div>
      </section>
      {sidebarOpen && (
        <div
          onClick={(e) => {
            toggleSidebar();
            e.stopPropagation;
          }}
          className={styles.mobileBackdrop}
        />
      )}
      <div className={styles.mobileView}>
        <div
          className={`${styles.sideBarMobile} ${
            sidebarOpen ? styles.openSidebar : styles.closeSidebar
          }`}
        >
          <BookingSummary
            sidebarOpen={sidebarOpen}
            roomList={roomList}
            onRemove={removeRoom}
            setSideBarOpen={setSideBarOpen}
          />
        </div>
        <div className={styles.tripDetailsContainer}>
          <div className={styles.tripDetailsHeader}>
            <img
              onClick={handleBookingBack}
              className={styles.backArrow}
              src="/icons/leftArrowTrip.svg"
              alt=""
            />
            <p className={styles.tripDetails}>Hotel Booking</p>
          </div>
        </div>
        <div className={styles.footer}>
          {/* LEFT */}
          <div className={styles.footerContainer}>
            <div className={styles.amountSection}>
              <div className={styles.label}>
                Total Amount
                <span
                  onClick={() => toggleSidebar()}
                  className={styles.infoIcon}
                >
                  !
                </span>
              </div>
              <div className={styles.amount}>₹ {totalAmount.toFixed(2)}</div>
            </div>

            {/* RIGHT */}
            <button
              className={styles.continueBtn}
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new Event("hotel-start-booking"));
                }
              }}
              disabled={bookingLoading || Boolean(hotelBookingStatus)}
            >
              {hotelBookingStatus
                ? "PAYMENT IN PROGRESS"
                : bookingLoading
                  ? "LOADING..."
                  : "CONTINUE PAYMENT"}
            </button>
          </div>
        </div>
      </div>
      {showAuthModal && authView === "login" && (
        <LoginPopup onClose={closeAuthModal} onNavigate={setAuthView} />
      )}
      {showAuthModal && authView === "signup" && (
        <SignupPopup onClose={closeAuthModal} onNavigate={setAuthView} />
      )}
    </RoomProvider>
  );
};

export default layout;

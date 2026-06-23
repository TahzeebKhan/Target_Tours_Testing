"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../flight-booking-details/Navbar";
import styles from "./HotelBooking.module.css";
import BookingSummary from "./components/review/components/BookingSummary";
import { RoomProvider } from "../context/RoomContext";
import { useRouter } from "next/navigation";
import CorporateSidebarSummary from "./CorporateSidebarSummary";
import { HOTEL_BOOKING_SESSION_KEY } from "@/shared/services/hotelSearch";

const layout = ({ children }) => {
  const router = useRouter();
  const [bookingSession, setBookingSession] = useState(null);
  const [roomList, setRoomList] = useState([
    {
      id: "deluxe_ac_room",
      title: "Deluxe Private AC Room with Ensuite Bathroom",
      image: "/images/hotelArt1.png",
      pricePerNight: 1397.86,
      quantity: 1,
      maxQuantity: 5,
      nights: 8,
    },
    {
      id: "premium_ac_room",
      title: "Premium Private AC Room with Ensuite Bathroom",
      image: "/images/hotelArt1.png",
      pricePerNight: 1397.86,
      quantity: 1,
      maxQuantity: 5,
      nights: 8,
    },
  ]);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(HOTEL_BOOKING_SESSION_KEY);
      const session = raw ? JSON.parse(raw) : null;

      if (session?.rooms?.length) {
        setBookingSession(session);
        setRoomList(session.rooms);
      }
    } catch {
      setBookingSession(null);
    }
  }, []);

  const [sidebarOpen, setSideBarOpen] = useState(false);
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

  const decreaseRoom = (id) => {
    setRoomList((prev) =>
      prev
        .map((r) => (r.id === id ? { ...r, quantity: r.quantity - 1 } : r))
        .filter((r) => r.quantity > 0),
    );
  };
  const totalAmount = roomList.reduce(
    (sum, room) =>
      sum +
      (Number(room.pricePerNight || 0) + Number(room.taxPerNight || 0)) *
        Number(room.quantity || 0) *
        Number(room.nights || 1),
    0,
  );
  const isCorporate = false;
  return (
    <RoomProvider
      value={{ roomList, increaseRoom, decreaseRoom, removeRoom, bookingSession }}
    >
      <section className={styles.contentWrapper}>
        <div className={styles.navbarWrapper}>
          <Navbar />
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
              onClick={() => {
                router && router.push("/");
              }}
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
            <button className={styles.continueBtn}>CONTINUE PAYMENT</button>
          </div>
        </div>
      </div>
    </RoomProvider>
  );
};

export default layout;

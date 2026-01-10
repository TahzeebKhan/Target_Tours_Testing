"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./connect.module.css";

const supportChannels = [
  {
    id: "chat",
    title: "CHAT WITH SUPPORT",
    description: "Get instant responses from our team",
    status: "Available now",
    statusColor: "rgba(0, 201, 80, 1)",
    waitTime: "Avg. wait time: ~2 min",
    icon: "/icons/chat-icon.svg",
  },
  {
    id: "call",
    title: "CALL CUSTOMER CARE",
    description: "Speak directly with our support team",
    status: "Available 24/7",
    statusColor: "rgba(29, 78, 216, 1)",
    waitTime: "Avg. wait time: ~5 min",
    icon: "/icons/phone-icon.svg",
  },
];

export default function Connect() {
  const [selectedId, setSelectedId] = useState(null);

  const handleBack = () => {
    window.history.back();
  };

  const handleContinue = () => {
    if (!selectedId) return;
    console.log("Selected channel:", selectedId);
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>How Would You Like To Connect?</h1>
        <p className={styles.subtitle}>CHOOSE YOUR PREFERRED SUPPORT CHANNEL</p>
      </header>

      <main className={styles.card}>
        <div className={styles.optionsList}>
          {supportChannels.map((channel) => (
            <div
              key={channel.id}
              className={`${styles.optionRow} ${
                selectedId === channel.id ? styles.activeRow : ""
              }`}
              onClick={() => setSelectedId(channel.id)}
            >
              <div className={styles.iconBox}>
                <Image
                  src={channel.icon}
                  alt={channel.title}
                  width={28}
                  height={28}
                />
              </div>

              <div className={styles.channelInfo}>
                <div className={styles.rowTop}>
                  <h2 className={styles.channelTitle}>{channel.title}</h2>

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
                </div>

                <p className={styles.description}>{channel.description}</p>

                <div className={styles.statusRow}>
                  <div className={styles.statusGroup}>
                    <span
                      className={styles.statusIndicator}
                      style={{ backgroundColor: channel.statusColor }}
                    />
                    <span
                      className={styles.statusText}
                      style={{ color: channel.statusColor }}
                    >
                      {channel.status}
                    </span>
                  </div>

                  <span className={styles.separator}></span>

                  <div className={styles.waitRow}>
                    <Image
                      src="/icons/clock_copy.svg"
                      alt="clock"
                      width={16}
                      height={16}
                    />
                    <span className={styles.waitTime}>{channel.waitTime}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer className={styles.footer}>
          <button
            className={styles.backButton}
            onClick={handleBack}
            type="button"
          >
            <Image
              src="/icons/arrow-left.svg"
              alt="Back"
              width={16}
              height={16}
            />
            <span>BACK</span>
          </button>

          <button
            className={styles.continueButton}
            disabled={!selectedId}
            onClick={handleContinue}
            type="button"
          >
            CONTINUE
          </button>
        </footer>
      </main>
    </section>
  );
}

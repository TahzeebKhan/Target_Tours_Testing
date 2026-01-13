"use client";
import React from "react";
import Navbar from "../hotel-detail/Navbar";
import SideBar from "./components/sideBar/SideBar";
import styles from "./Profile.module.css";
import { ProfileProvider } from "./context/ProfileContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfileLayout = ({ children }) => {
  return (
    <div className={styles.profileLayout}>
      <Navbar />
      <div className={styles.profileContainer}>
        <ProfileProvider>
          <SideBar />
          <div className={styles.profileContent}>{children}</div>
        </ProfileProvider>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
        toastStyle={{
          borderRadius: "0px",
        }}
      />
    </div>
  );
};

export default ProfileLayout;

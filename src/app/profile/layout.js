"use client"
import React from 'react'
import Navbar from '../hotel-detail/Navbar'
import SideBar from './components/sideBar/SideBar'
import styles from './Profile.module.css'
import { ProfileProvider } from './context/ProfileContext'

const ProfileLayout = ({ children }) => {
  return (
    <div className={styles.profileLayout}>
      <Navbar />
      <div className={styles.profileContainer}>
        <ProfileProvider>
          <SideBar />
          <div className={styles.profileContent}>
            {children}
          </div>
        </ProfileProvider>
      </div>
    </div>
  )
}

export default ProfileLayout
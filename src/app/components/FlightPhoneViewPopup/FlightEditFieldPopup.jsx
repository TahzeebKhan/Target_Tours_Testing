"use client"
import React from 'react'
import styles from './FlightEditFieldPopup.module.css'
import FlightSearchMobile from './FlightSearchMobile'

const FlightEditFieldPopup = ({ setIsOpecEditFields }) => {
    return (
        <div className={styles.overlay}>
            <div className={styles.popup}>
            <FlightSearchMobile setIsOpecEditFields={setIsOpecEditFields} />
            </div>
        </div>
    )
}

export default FlightEditFieldPopup
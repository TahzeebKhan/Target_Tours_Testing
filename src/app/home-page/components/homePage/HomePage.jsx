"use client";
import styles from './HomePage.module.css'
import Switch from '../Switch'
import { useState } from 'react'

const HomePage = () => {
  const [directOnly, setDirectOnly] = useState(true)
  const [tripType, setTripType] = useState("round"); // NEW
  return (
    <>
      <header className={`${styles.homeSection} relative w-full h-[100vh]`}>
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/hero.mp4"
          poster="/images/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
        />
      </header>
      <div className="absolute inset-0 bg-black/20"></div>

      <div className={`${styles.navbar} absolute top-0 z-20 w-full flex !py-3 !px-[200px] justify-between items-center`}>
        <img src="./Logo.svg" alt="" />
        <div className="flex gap-3">
          <button className={styles.downloadBtn}>Download the App</button>
          <button className={styles.signInBtn}>Sign In</button>
        </div>
      </div>

      <div className={styles.InspiredSection}>
        <h1>Inspired travel for the <br />
          curious & cultured</h1>
        <p>Thoughtfully designed journeys for those who find beauty in the details.</p>

      </div>

      <div className={styles.serarchingCont}>
        <div className={styles.serarchingContTop}>
          <div className={styles.serarchingContTop_left}>
            <button
              className={`${styles.round_tripBtn} ${tripType === "round" ? styles.activeTrip : ""}`}
              onClick={() => setTripType("round")}
            >
              Round-trip
            </button>

            <button
              className={`${styles.round_tripBtn} ${tripType === "oneway" ? styles.activeTrip : ""}`}
              onClick={() => setTripType("oneway")}
            >
              One-way
            </button>

            <button
              className={`${styles.round_tripBtn} ${tripType === "multi" ? styles.activeTrip : ""}`}
              onClick={() => setTripType("multi")}
            >
              Multi-City
            </button>
          </div>
          <div className={styles.serarchingContTop_right}>
            <Switch
              checked={directOnly}
              onChange={setDirectOnly}
              label="DIRECT FLIGHTS ONLY"
            />
          </div>
        </div>
        <div className={styles.serarchingContBottom}>
          {/* <div className={styles.serarchingContBottom_left}> */}
          <div className={styles.fromBtn}>
            <div className={styles.lable}>From</div>
            <input type="text" className={styles.contant}  placeholder='Departure'/>
          </div>
          <div className={styles.fromBtn}>
            <div className={styles.lable}>To</div>
            {/* <div className={styles.contant}>Destination</div> */}
            <input type="text" className={styles.contant}  placeholder='Destination'/>
          </div>
          {/* </div> */}
          {/* <div className={styles.serarchingContBottom_right}> */}
          <div className={styles.fromBtn}>
            <div className={styles.lable}>Departure Date</div>
            <div className={styles.contant}>
            <input type="date" className={styles.contant}  placeholder='Add Dates'/>
            </div>

            
          </div>
          <div className={styles.fromBtn}>
            <div className={styles.lable}>Return Date</div>
            <input type="date" className={styles.contant}  placeholder='Add Dates'/>
          </div>
          <div className={styles.fromBtn}>
            <div className={styles.lable}>Travellers & Class</div>
            <div className={styles.contant}>1 Traveller, Econ...</div>
          </div>
          <div className={styles.searchBtn}>
            <img src="/images/searchIcon.svg" alt="" />
          </div>
          {/* </div> */}
        </div>
      </div>
    </>
  )
}

export default HomePage
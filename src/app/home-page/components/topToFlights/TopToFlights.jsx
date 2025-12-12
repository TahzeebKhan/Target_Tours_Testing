"use client"
import React, { useState } from 'react'
import style from './TopToFlights.module.css'
import Link from 'next/link'

// JSON DATA (same as before)
const flightData = [
    { from: "Nagpur", to: "Bangkok", price: "₹20,000", image: "/images/item1.png" },
    { from: "Delhi", to: "Dubai", price: "₹15,500", image: "/images/item1.png" },
    { from: "Mumbai", to: "Singapore", price: "₹18,200", image: "/images/item1.png" },
    { from: "Chennai", to: "Kuala Lumpur", price: "₹12,900", image: "/images/item1.png" },

    { from: "Bangalore", to: "London", price: "₹46,000", image: "/images/item1.png" },
    { from: "Hyderabad", to: "Doha", price: "₹22,300", image: "/images/item1.png" },
    { from: "Pune", to: "Abu Dhabi", price: "₹17,800", image: "/images/item1.png" },
    { from: "Kolkata", to: "Hong Kong", price: "₹29,500", image: "/images/item1.png" }
]

const chunkRows = (arr, size = 4) =>
    arr.reduce((rows, item, index) => {
        const rowIndex = Math.floor(index / size)
        rows[rowIndex] = rows[rowIndex] || []
        rows[rowIndex].push(item)
        return rows
    }, [])

const TopToFlights = () => {

    const flightRows = chunkRows(flightData, 4)

    const [activeTab, setActiveTab] = useState("Popular routes")

    const navItems = [
        "Popular routes",
        "Cities Countries",
        "Region",
        "Airports"
    ]

    return (
        <section className={style.topToFlightsSection}>
            <div className={style.custom_border}></div>
            <div className={style.container}>
                <h2 className={style.heading}>Top Flights From India</h2>

                <div className={style.subContainer}>
                    
                    <div className={style.navbar}>
                        {navItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveTab(item)}
                                className={`${style.nav_items} ${activeTab === item ? style.active : ""}`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <div className={style.flight_items_cont}>
                        
                        {flightRows.map((row, rowIndex) => (
                            <div className={style.flight_items_row} key={rowIndex}>
                                {row.map((item, i) => (
                                    <div className={style.flight_items} key={i}>
                                        <img src={item.image} alt="" />
                                        
                                        <div className={style.flight_items_bottom}>
                                            <div className={style.fromTo}>
                                                <span>{item.from}</span>
                                                <img src="/icons/rightIcon.svg" alt="" />
                                                <span>{item.to}</span>
                                            </div>

                                            <div className={style.price}>
                                                Economy From <span>{item.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}

                    </div>
                </div>
            </div>
        </section>
    )
}

export default TopToFlights

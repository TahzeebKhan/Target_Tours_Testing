"use client"
import React, { useState } from 'react'
import style from './TopToFlights.module.css'
import Link from 'next/link'

// JSON DATA
const flightData = {
    "Popular routes": [
        { from: "Nagpur", to: "Bangkok", price: "₹20,000", image: "/images/item1.png" },
        { from: "Indore", to: "cairo", price: "₹15,500", image: "/images/indore.png" },
        { from: "jaipur", to: "Moscow", price: "₹18,200", image: "/images/jaipur.png" },
        { from: "Bengaluru", to: "Kuala Lumpur", price: "₹12,900", image: "/images/bengaluru.png" },
        { from: "lucknow", to: "London", price: "₹46,000", image: "/images/lucknow.png" },
        { from: "surat", to: "Doha", price: "₹22,300", image: "/images/surat.png" },
        { from: "kolkata", to: "Abu Dhabi", price: "₹17,800", image: "/images/kolkata.png" },
        { from: "Hyderabad", to: "Hong Kong", price: "₹29,500", image: "/images/hyderabad1.png.png" }
    ],
    "Cities Countries": [
        { from: "Mumbai", to: "New York", price: "₹65,000", image: "/images/item1.png" },
        { from: "Delhi", to: "Paris", price: "₹52,000", image: "/images/item1.png" },
        { from: "Bangalore", to: "Toronto", price: "₹58,000", image: "/images/item1.png" },
        { from: "Chennai", to: "Sydney", price: "₹48,000", image: "/images/item1.png" },
        { from: "Hyderabad", to: "Tokyo", price: "₹35,000", image: "/images/item1.png" },
        { from: "Kolkata", to: "Bangkok", price: "₹18,500", image: "/images/item1.png" },
        { from: "Pune", to: "Dubai", price: "₹16,800", image: "/images/item1.png" },
        { from: "Ahmedabad", to: "Singapore", price: "₹19,200", image: "/images/item1.png" }
    ],
    "Region": [
        { from: "India", to: "Middle East", price: "₹14,500", image: "/images/item1.png" },
        { from: "India", to: "Southeast Asia", price: "₹16,000", image: "/images/item1.png" },
        { from: "India", to: "Europe", price: "₹45,000", image: "/images/item1.png" },
        { from: "India", to: "North America", price: "₹60,000", image: "/images/item1.png" },
        { from: "India", to: "Australia", price: "₹50,000", image: "/images/item1.png" },
        { from: "India", to: "East Asia", price: "₹32,000", image: "/images/item1.png" },
        { from: "India", to: "Africa", price: "₹38,000", image: "/images/item1.png" },
        { from: "India", to: "South America", price: "₹85,000", image: "/images/item1.png" }
    ],
    "Airports": [
        { from: "DEL", to: "DXB", price: "₹15,200", image: "/images/item1.png" },
        { from: "BOM", to: "LHR", price: "₹48,000", image: "/images/item1.png" },
        { from: "BLR", to: "SIN", price: "₹17,500", image: "/images/item1.png" },
        { from: "MAA", to: "KUL", price: "₹12,800", image: "/images/item1.png" },
        { from: "HYD", to: "DOH", price: "₹21,500", image: "/images/item1.png" },
        { from: "CCU", to: "BKK", price: "₹18,200", image: "/images/item1.png" },
        { from: "AMD", to: "AUH", price: "₹14,900", image: "/images/item1.png" },
        { from: "PNQ", to: "FRA", price: "₹52,000", image: "/images/item1.png" }
    ]
}

const chunkRows = (arr, size = 4) =>
    arr.reduce((rows, item, index) => {
        const rowIndex = Math.floor(index / size)
        rows[rowIndex] = rows[rowIndex] || []
        rows[rowIndex].push(item)
        return rows
    }, [])

const TopToFlights = () => {

    const [activeTab, setActiveTab] = useState("Popular routes")

    const navItems = [
        "Popular routes",
        "Cities Countries",
        "Region",
        "Airports"
    ]

    const flightRows = chunkRows(flightData[activeTab], 4)

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
                                    <div className={`${style.flight_items}`} key={i}>
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
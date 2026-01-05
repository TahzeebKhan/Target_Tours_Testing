"use client"
import React, { useEffect, useRef, useState } from 'react'
import style from './TopToFlights.module.css'
import Link from 'next/link'

// JSON DATA
const flightData = {
    "Popular routes": [
        { from: "Nagpur", to: "Bangkok", price: "₹20,000", image: "/images/item1.png" },
        { from: "Indore", to: "cairo", price: "₹15,500", image: "/images/indore.png" },
        { from: "jaipur", to: "Moscow", price: "₹18,200", image: "/images/jaipur.png" },
        { from: "Bengaluru", to: "Tokiyo", price: "₹12,900", image: "/images/bengaluru.png" },
        { from: "lucknow", to: "London", price: "₹46,000", image: "/images/lucknow.png" },
        { from: "surat", to: "Doha", price: "₹22,300", image: "/images/surat.png" },
        { from: "kolkata", to: "Abu Dhabi", price: "₹17,800", image: "/images/kolkata.png" },
        { from: "Hyderabad", to: "Hong Kong", price: "₹29,500", image: "/images/hyderabad1.png" },
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

const TopToFlights = () => {
    const [activeTab, setActiveTab] = useState("Popular routes")
    const [currentPage, setCurrentPage] = useState(0)
    const [isMobile, setIsMobile] = useState(false)
    const [animationKey, setAnimationKey] = useState(0)

    const navItems = [
        "Popular routes",
        "Cities Countries",
        "Region",
        "Airports"
    ]
    const tabsRef = useRef(null)

    // Detect mobile view
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768)
        }
        
        checkMobile()
        window.addEventListener('resize', checkMobile)
        
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Reset page and trigger animation when tab changes
    useEffect(() => {
        setCurrentPage(0)
        setAnimationKey(prev => prev + 1)
    }, [activeTab])

    useEffect(() => {
        if (!tabsRef.current) return

        const tabs = tabsRef.current
        const activeTabEl = tabs.querySelector(`.${style.active}`)

        if (!activeTabEl) return

        tabs.style.setProperty(
            "--indicator-width",
            `${activeTabEl.offsetWidth}px`
        )
        tabs.style.setProperty(
            "--indicator-left",
            `${activeTabEl.offsetLeft}px`
        )
    }, [activeTab])

    const itemsPerPage = 4
    const currentFlights = flightData[activeTab]
    
    // Calculate items to display
    const getDisplayedItems = () => {
        if (isMobile && currentFlights.length > itemsPerPage) {
            const startIndex = currentPage * itemsPerPage
            const endIndex = startIndex + itemsPerPage
            return currentFlights.slice(startIndex, endIndex)
        }
        return currentFlights
    }

    const displayedFlights = getDisplayedItems()
    const totalPages = isMobile ? Math.ceil(currentFlights.length / itemsPerPage) : 1
    const showPagination = isMobile && currentFlights.length > itemsPerPage

    const handlePrevious = () => {
        setCurrentPage(prev => Math.max(0, prev - 1))
    }

    const handleNext = () => {
        setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))
    }

    return (
        <section className={style.topToFlightsSection}>
            <h2 className={style.heading}>Top Flights From India</h2>

            <nav className={style.tabsWrap}>
                <ul className={style.tabs} ref={tabsRef}>
                    {navItems.map((t) => (
                        <li
                            key={t}
                            className={`${style.tab} ${activeTab === t ? style.active : ''}`}
                            onClick={() => setActiveTab(t)}
                        >
                            <button className={style.tabBtn}>
                                {t}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className={style.container}>
                <div className={`${style.flight_items_cont} ${style.flight_items_animated}`} key={animationKey}>
                    <div className={style.flight_items_row}>
                        {displayedFlights.map((item, i) => (
                            <div 
                                className={style.flight_items}
                                key={`${animationKey}-${i}`}
                            >
                                <img className={style.flight_items_img} src={item.image}  alt="" />

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
                </div>
            </div>

            {showPagination && (
                <div className={style.btnContainer}>
                    <div
                        className={`${style.btn} ${currentPage === 0 ? style.disabled : ''}`}
                        onClick={handlePrevious}
                    >
                        <img src="/icons/left.svg" alt="" />
                    </div>

                    <div
                        className={`${style.btn} ${currentPage === totalPages - 1 ? style.disabled : ''}`}
                        onClick={handleNext}
                    >
                        <img src="/icons/right.svg" alt="" />
                    </div>
                </div>
            )}
        </section>
    )
}

export default TopToFlights
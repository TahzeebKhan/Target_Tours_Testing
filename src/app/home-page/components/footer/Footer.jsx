"use client"
import React, { useState } from 'react'
import styles from './Footer.module.css'
import Link from 'next/link';

const Footer = () => {
    const [openState, setOpenState] = useState({
  first: false,
  second: false,
});

    return (
        <section className={styles.footer}>





            <div className={styles.container}>
                <div className={styles.footerTop}>

                    <img src="/images/footerIcon.png" alt="" />
                    <p>Travel isn’t just about reaching a destination — it’s about discovering new worlds, new perspectives, and new parts of yourself. At Zenith Holidays, we don’t just plan trips; we craft unforgettable journeys designed to match your dreams. Whether you're chasing the romance of a Paris honeymoon, the serenity of Maldives overwater villas, or the adrenaline of an adventure holiday, Zenith is your trusted companion. As one of India’s top travel companies, we specialize in luxury holiday packages, custom honeymoon experiences, curated international tours, and niche escapes like women-only trips and spiritual holidays. </p>
                </div>

                <div className={styles.footerBoder}></div>


                <div className={styles.accordionWrapper}>
                    <div className={styles.accordionItem}>
                        <button
                            className={styles.accordionHeader}
                            onClick={() =>
                                setOpenState((prev) => ({
                                    ...prev,
                                    first: !prev.first,
                                }))
                            }
                        >
                            <span className={styles.blockHead} >Popular International Holiday Destinations</span>
                            <span className={`${styles.arrow} ${openState.first ? styles.rotate : ''}`}>
                                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clip-path="url(#clip0_1042_7175)">
                                        <path d="M2 2.5L7 7.5L12 2.5" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_1042_7175">
                                            <rect width="12" height="7" fill="white" transform="translate(1 1.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>

                            </span>
                        </button>

                        <div className={styles.accordionContainer}>
                            <div className={`${styles.accordionBody} ${openState.first ? styles.show : ''}`}>
                                <Link href="/packages/dubai" className={styles.linkText}>
                                    Dubai Tour Packages | Luxury & Culture
                                </Link>
                                <span className={styles.dot}>.</span>
                                <Link href="/packages/switzerland" className={styles.linkText}>
                                    Switzerland Holiday Packages | Alpine Escapes
                                </Link>
                                <span className={styles.dot}>.</span>
                                <Link href="/packages/maldives" className={styles.linkText}>
                                    Maldives Packages | Overwater Bliss
                                </Link>
                                <span className={styles.dot}>.</span>
                                <Link href="/packages/bali" className={styles.linkText}>
                                    Bali Holiday Packages | Tropical Paradise
                                </Link>
                                <span className={styles.dot}>.</span>
                                <Link href="/packages/thailand" className={styles.linkText}>
                                    Thailand Tour Packages | Beach & Adventure
                                </Link>
                                <span className={styles.dot}>.</span>
                                <Link href="/packages/singapore" className={styles.linkText}>
                                    Singapore Holiday Packages | Family Fun
                                </Link>
                                <span className={styles.dot}>.</span>

                                <Link href="/packages/paris" className={styles.linkText}>
                                    Paris Tour Packages | Romance Redefined
                                </Link>
                                <span className={styles.dot}>.</span>
                                <Link href="/packages/japan" className={styles.linkText}>
                                    Japan Tour Packages | Tech & Tradition
                                </Link>
                                <span className={styles.dot}>.</span>
                                <Link href="/packages/australia" className={styles.linkText}>
                                    Australia Holiday Packages | Urban To Outback
                                </Link>
                                <span className={styles.dot}>.</span>
                                <Link href="/packages/usa" className={styles.linkText}>
                                    USA Tour Packages | Coast To Coast
                                </Link>
                                <span className={styles.dot}>.</span>
                                <Link href="/packages/italy" className={styles.linkText}>
                                    Italy Holiday Packages | Art, Pasta & Passion
                                </Link>
                                <span className={styles.dot}>.</span>
                                <Link href="/packages/turkey" className={styles.linkText}>
                                    Turkey Tour Packages | East Meets West
                                </Link>
                                <span className={styles.dot}>.</span>
                                <Link href="/packages/south-africa" className={styles.linkText}>
                                    South Africa Packages | Safari & Seascapes
                                </Link>
                                <span className={styles.dot}>.</span>
                                <Link href="/packages/greece" className={styles.linkText}>
                                    Greece Holiday Packages | Islands & History
                                </Link>
                                <span className={styles.dot}>.</span>
                                <Link href="/packages/new-zealand" className={styles.linkText}>
                                    New Zealand Tours | Nature’s Playground
                                </Link>
                                <span className={styles.dot}>.</span>
                                <Link href="/packages/uk" className={styles.linkText}>
                                    UK Holiday Packages | Royals & Rolling Hills
                                </Link>
                                <span className={styles.dot}>.</span>
                                <Link href="/packages/spain" className={styles.linkText}>
                                    Spain Tour Packages | Flamenco & Festivals
                                </Link>
                                <span className={styles.dot}>.</span>
                                <Link href="/packages/vietnam" className={styles.linkText}>
                                    Vietnam Holiday Packages | Culture & Coastlines
                                </Link>
                                <span className={styles.dot}>.</span>
                                <Link href="/packages/south-africa" className={styles.linkText}>
                                    South Africa Packages | Safari & Seascapes
                                </Link>
                                <span className={styles.dot}>.</span>
                                <Link href="/packages/greece" className={styles.linkText}>
                                    Greece Holiday Packages | Islands & History
                                </Link>
                                <span className={styles.dot}>.</span>
                                <Link href="/packages/new-zealand" className={styles.linkText}>
                                    New Zealand Tours | Nature’s Playground
                                </Link>
                                <span className={styles.dot}>.</span>
                                <Link href="/packages/uk" className={styles.linkText}>
                                    UK Holiday Packages | Royals & Rolling Hills
                                </Link>
                                <span className={styles.dot}>.</span>
                                <Link href="/packages/spain" className={styles.linkText}>
                                    Spain Tour Packages | Flamenco & Festivals
                                </Link>
                                <span className={styles.dot}>.</span>
                                <Link href="/packages/vietnam" className={styles.linkText}>
                                    Vietnam Holiday Packages | Culture & Coastlines
                                </Link>
                                <span className={styles.dot}>.</span>

                            </div>
                        </div>
                    </div>
                    <div className={styles.accordionItem}>
                        <button
                            className={styles.accordionHeader}
                            onClick={() =>
                                setOpenState((prev) => ({
                                    ...prev,
                                    second: !prev.second,
                                }))
                            }
                        >
                            <span className={styles.blockHead}>
                                Top Themed Holiday Experiences
                            </span>

                            <span className={`${styles.arrow} ${openState.second ? styles.rotate : ""}`}>
                                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                                    <path
                                        d="M2 2.5L7 7.5L12 2.5"
                                        stroke="#FFFFFF"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                        </button>

                        <div className={styles.accordionContainer}>
                            <div className={`${styles.accordionBody} ${openState.second ? styles.show : ""}`}>

                                <Link href="/themes/honeymoon" className={styles.linkText}>
                                    Honeymoon Packages | Romance, Redefined
                                </Link>
                                <span className={styles.dot}>.</span>

                                <Link href="/themes/adventure" className={styles.linkText}>
                                    Adventure Holidays | Thrills Beyond Borders
                                </Link>
                                <span className={styles.dot}>.</span>

                                <Link href="/themes/solo-travel" className={styles.linkText}>
                                    Solo Travel Escapes | Find Yourself Anywhere
                                </Link>
                                <span className={styles.dot}>.</span>

                                <Link href="/themes/luxury" className={styles.linkText}>
                                    Luxury Travel Experiences
                                </Link>
                                <span className={styles.dot}>.</span>

                                <Link href="/themes/spiritual" className={styles.linkText}>
                                    Spiritual Pilgrimages | Journey Within & Beyond
                                </Link>
                                <span className={styles.dot}>.</span>

                                <Link href="/themes/women-only" className={styles.linkText}>
                                    Women-Only Trips (Wander Womaniya)
                                </Link>
                                <span className={styles.dot}>.</span>

                                <Link href="/themes/northern-lights" className={styles.linkText}>
                                    Northern Lights Packages
                                </Link>
                                <span className={styles.dot}>.</span>

                                <Link href="/themes/beach-island" className={styles.linkText}>
                                    Beach & Island Getaways
                                </Link>
                                <span className={styles.dot}>.</span>

                                <Link href="/themes/family" className={styles.linkText}>
                                    Family-Friendly Holidays | Fun Across All Ages
                                </Link>
                                <span className={styles.dot}>.</span>

                                <Link href="/themes/cultural" className={styles.linkText}>
                                    Cultural & Heritage Tours
                                </Link>
                                <span className={styles.dot}>.</span>

                                <Link href="/themes/cruise" className={styles.linkText}>
                                    Cruise Holidays | Sail In Style With Zenith
                                </Link>
                                <span className={styles.dot}>.</span>

                                <Link href="/themes/wellness" className={styles.linkText}>
                                    Wellness Retreats
                                </Link>

                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.mediaIcons}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    <span className={styles.dot}>.</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                     <span className={styles.dot}>.</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                     <span className={styles.dot}>.</span>
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </div>



                <div className={styles.footerBlockWrapper}>
                    <div className={styles.footerBlock}>
                        <div className={styles.blockHead}>
                            Popular International Holiday Destinations
                        </div>

                        <div className={styles.blockItems}>
                            <ul>
                                <li><span className={styles.linkText}>Dubai Tour Packages | Luxury & Culture</span></li>
                                <li><span className={styles.linkText}>Switzerland Holiday Packages | Alpine Escapes</span></li>
                                <li><span className={styles.linkText}>Maldives Packages | Overwater Bliss</span></li>
                                <li><span className={styles.linkText}>Bali Holiday Packages | Tropical Paradise</span></li>
                                <li><span className={styles.linkText}>Thailand Tour Packages | Beach & Adventure</span></li>
                                <li><span className={styles.linkText}>Singapore Holiday Packages | Family Fun</span></li>
                            </ul>

                            <ul>
                                <li><span className={styles.linkText}>Paris Tour Packages | Romance Redefined</span></li>
                                <li><span className={styles.linkText}>Japan Tour Packages | Tech & Tradition</span></li>
                                <li><span className={styles.linkText}>Australia Holiday Packages | Urban To Outback</span></li>
                                <li><span className={styles.linkText}>USA Tour Packages | Coast To Coast</span></li>
                                <li><span className={styles.linkText}>Italy Holiday Packages | Art, Pasta & Passion</span></li>
                                <li><span className={styles.linkText}>Turkey Tour Packages | East Meets West</span></li>
                            </ul>

                            <ul>
                                <li><span className={styles.linkText}>South Africa Packages | Safari & Seascapes</span></li>
                                <li><span className={styles.linkText}>Greece Holiday Packages | Islands & History</span></li>
                                <li><span className={styles.linkText}>New Zealand Tours | Nature’s Playground</span></li>
                                <li><span className={styles.linkText}>UK Holiday Packages | Royals & Rolling Hills</span></li>
                                <li><span className={styles.linkText}>Spain Tour Packages | Flamenco & Festivals</span></li>
                                <li><span className={styles.linkText}>Vietnam Holiday Packages | Culture & Coastlines</span></li>
                            </ul>

                            <ul>
                                <li><span className={styles.linkText}>South Africa Packages | Safari & Seascapes</span></li>
                                <li><span className={styles.linkText}>Greece Holiday Packages | Islands & History</span></li>
                                <li><span className={styles.linkText}>New Zealand Tours | Nature’s Playground</span></li>
                                <li><span className={styles.linkText}>UK Holiday Packages | Royals & Rolling Hills</span></li>
                                <li><span className={styles.linkText}>Spain Tour Packages | Flamenco & Festivals</span></li>
                                <li><span className={styles.linkText}>Vietnam Holiday Packages | Culture & Coastlines</span></li>
                            </ul>
                        </div>
                    </div>


                    <div className={styles.footerBoder}></div>

                    <div className={styles.footerBlock}>
                        <div className={styles.blockHead}>
                            Top Themed Holiday Experiences
                        </div>

                        <div className={styles.blockItems}>
                            <ul>
                                <li><span className={styles.linkText}>Honeymoon Packages | Romance, Redefined</span></li>
                                <li><span className={styles.linkText}>Adventure Holidays | Thrills Beyond Borders</span></li>
                                <li><span className={styles.linkText}>Solo Travel Escapes | Find Yourself Anywhere</span></li>
                            </ul>

                            <ul>
                                <li><span className={styles.linkText}>Luxury Travel Experiences</span></li>
                                <li><span className={styles.linkText}>Spiritual Pilgrimages | Journey Within & Beyond</span></li>
                                <li><span className={styles.linkText}>Women-Only Trips (Wander Womaniya)</span></li>
                            </ul>

                            <ul>
                                <li><span className={styles.linkText}>Northern Lights Packages</span></li>
                                <li><span className={styles.linkText}>Beach & Island Getaways</span></li>
                                <li><span className={styles.linkText}>Family-Friendly Holidays | Fun Across All Ages</span></li>
                            </ul>

                            <ul>
                                <li><span className={styles.linkText}>Cultural & Heritage Tours</span></li>
                                <li><span className={styles.linkText}>Cruise Holidays | Sail In Style With Zenith</span></li>
                                <li><span className={styles.linkText}>Wellness Retreats</span></li>
                            </ul>
                        </div>
                    </div>
                    <div className={styles.footerBoder}></div>
                    <div className={styles.footerLinkBlock}>
                        <div className={styles.footerLinkCont}>
                            <h3 className={styles.linkHead}>Quick links</h3>
                            <ul>
                                <li><a href="/about"><span className={styles.linkText}>About Target Tours</span></a></li>
                                <li><a href="/blog"><span className={styles.linkText}>Blog & Travel Tips</span></a></li>
                                <li><a href="/careers"><span className={styles.linkText}>Careers</span></a></li>
                                <li><a href="/testimonials"><span className={styles.linkText}>Testimonials</span></a></li>
                                <li><a href="/contact"><span className={styles.linkText}>Contact Us</span></a></li>
                                <li><a href="/faqs"><span className={styles.linkText}>FAQs</span></a></li>
                            </ul>
                        </div>

                        <div className={styles.footerLinkCont}>
                            <h3 className={styles.linkHead}>Policy</h3>
                            <ul>
                                <li><a href="/about"><span className={styles.linkText}>Terms & Conditions</span></a></li>
                                <li><a href="/blog"><span className={styles.linkText}>Privacy Policy</span></a></li>
                                <li><a href="/careers"><span className={styles.linkText}>Cancellation & Refund Policy</span></a></li>
                                <li><a href="/testimonials"><span className={styles.linkText}>Travel Disclaimer</span></a></li>
                                <li><a href="/contact"><span className={styles.linkText}>Cookie Policy</span></a></li>
                            </ul>
                        </div>

                        <div className={styles.footerLinkCont}>
                            <h3 className={styles.linkHead}>Socials</h3>
                            <ul>
                                <li><a href="/about"><span className={styles.linkText}>Facebook</span></a></li>
                                <li><a href="/blog"><span className={styles.linkText}>Instagram</span></a></li>
                                <li><a href="/careers"><span className={styles.linkText}>Pinterest</span></a></li>
                                <li><a href="/testimonials"><span className={styles.linkText}>Twitter (X)</span></a></li>
                                <li><a href="/contact"><span className={styles.linkText}>LinkedIn</span></a></li>
                                <li><a href="/faqs"><span className={styles.linkText}>Youtube</span></a></li>
                            </ul>
                        </div>

                        <div className={styles.footerLinkCont}>
                            <h3 className={styles.linkHead}>Contact</h3>
                            <ul>
                                <li>
                                    <a href="/about">
                                        <span className={styles.linkText}>
                                            <img src="/icons/address.svg" alt="" /> Target Tours Pvt. Ltd. 123 Travel Heights, New Delhi, India
                                        </span>
                                    </a>
                                </li>
                                <li>
                                    <a href="/blog">
                                        <span className={styles.linkText}>
                                            <img src="/icons/phone.svg" alt="" /> +91-9876543210
                                        </span>
                                    </a>
                                </li>
                                <li>
                                    <a href="/careers">
                                        <span className={styles.linkText}>
                                            <img src="/icons/clock.svg" alt="" /> Hours: 8:00 - 17:00, Mon - Sat
                                        </span>
                                    </a>
                                </li>
                                <li>
                                    <a href="/testimonials">
                                        <span className={styles.linkText}>
                                            <img src="/icons/email.svg" alt="" /> support@Targettours.com
                                        </span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.footerBoder}></div>
                </div>
                <div className={styles.copywrite}>
                    © 2025 Target Tours Holidays Private Ltd. | Powered by Passion, Driven by Discovery.
                </div>
            </div>
        </section>
    )
}

export default Footer
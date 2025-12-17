import React from 'react'
import styles from './Footer.module.css'

const Footer = () => {
    return (
        <section className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.footerTop}>

                    <img src="/images/footerIcon.png" alt="" />
                    <p>Travel isn’t just about reaching a destination — it’s about discovering new worlds, new perspectives, and new parts of yourself. At Zenith Holidays, we don’t just plan trips; we craft unforgettable journeys designed to match your dreams. Whether you're chasing the romance of a Paris honeymoon, the serenity of Maldives overwater villas, or the adrenaline of an adventure holiday, Zenith is your trusted companion. As one of India’s top travel companies, we specialize in luxury holiday packages, custom honeymoon experiences, curated international tours, and niche escapes like women-only trips and spiritual holidays. </p>
                </div>

                <div className={styles.footerBoder}></div>

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
                <div className={styles.copywrite}>
                    © 2025 Target Tours Holidays Private Ltd. | Powered by Passion, Driven by Discovery.
                </div>
            </div>
        </section>
    )
}

export default Footer
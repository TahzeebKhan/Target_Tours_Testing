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
                <div className={styles.footerBlock}>
                    <div className={styles.blockHead}>
                        Popular International Holiday Destinations
                    </div>

                    <div className={styles.blockItems}>
                        <ul>
                            <li>Dubai Tour Packages | Luxury & Culture</li>
                            <li>Switzerland Holiday Packages | Alpine Escapes</li>
                            <li>Maldives Packages | Overwater Bliss</li>
                            <li>Bali Holiday Packages | Tropical Paradise</li>
                            <li>Thailand Tour Packages | Beach & Adventure</li>
                            <li>Singapore Holiday Packages | Family Fun</li>
                        </ul>

                        <ul>
                            <li>Paris Tour Packages | Romance Redefined</li>
                            <li>Japan Tour Packages | Tech & Tradition</li>
                            <li>Australia Holiday Packages | Urban To Outback</li>
                            <li>USA Tour Packages | Coast To Coast</li>
                            <li>Italy Holiday Packages | Art, Pasta & Passion</li>
                            <li>Turkey Tour Packages | East Meets West</li>
                        </ul>

                        <ul>
                            <li>South Africa Packages | Safari & Seascapes</li>
                            <li>Greece Holiday Packages | Islands & History</li>
                            <li>New Zealand Tours | Nature’s Playground</li>
                            <li>UK Holiday Packages | Royals & Rolling Hills</li>
                            <li>Spain Tour Packages | Flamenco & Festivals</li>
                            <li>Vietnam Holiday Packages | Culture & Coastlines</li>
                        </ul>

                        <ul>
                            <li>South Africa Packages | Safari & Seascapes</li>
                            <li>Greece Holiday Packages | Islands & History</li>
                            <li>New Zealand Tours | Nature’s Playground</li>
                            <li>UK Holiday Packages | Royals & Rolling Hills</li>
                            <li>Spain Tour Packages | Flamenco & Festivals</li>
                            <li>Vietnam Holiday Packages | Culture & Coastlines</li>
                        </ul>
                    </div>
                </div>


                <div className={styles.footerBlock}>
                    <div className={styles.blockHead}>
                        Top Themed Holiday Experiences
                    </div>

                    <div className={styles.blockItems}>
                        <ul>
                            <li>Honeymoon Packages | Romance, Redefined</li>
                            <li>Adventure Holidays | Thrills Beyond Borders</li>
                            <li>Solo Travel Escapes | Find Yourself Anywhere</li>
                        </ul>

                        <ul>
                            <li>Luxury Travel Experiences</li>
                            <li>Spiritual Pilgrimages | Journey Within & Beyond</li>
                            <li>Women-Only Trips (Wander Womaniya)</li>
                        </ul>

                        <ul>
                            <li>Northern Lights Packages</li>
                            <li>Beach & Island Getaways</li>
                            <li>Family-Friendly Holidays | Fun Across All Ages</li>
                        </ul>

                        <ul>
                            <li>Cultural & Heritage Tours</li>
                            <li>Cruise Holidays | Sail In Style With Zenith</li>
                            <li>Wellness Retreats</li>
                        </ul>
                    </div>
                </div>

                <div className={styles.footerLinkBlock}>
                    <div className={styles.footerLinkCont}>
                        <h3 className={styles.linkHead}>Quick links</h3>
                        <ul>
                            <li><a href="/about">About Target Tours</a></li>
                            <li><a href="/blog">Blog & Travel Tips</a></li>
                            <li><a href="/careers">Careers</a></li>
                            <li><a href="/testimonials">Testimonials</a></li>
                            <li><a href="/contact">Contact Us</a></li>
                            <li><a href="/faqs">FAQs</a></li>
                            <li><a href="/careers">Careers</a></li>
                        </ul>
                    </div>

                    <div className={styles.footerLinkCont}>
                        <h3 className={styles.linkHead}>Policy</h3>
                        <ul>
                            <li><a href="/about">Terms & Conditions</a></li>
                            <li><a href="/blog">Privacy Policy</a></li>
                            <li><a href="/careers">Cancellation & Refund Policy</a></li>
                            <li><a href="/testimonials">Travel Disclaimer</a></li>
                            <li><a href="/contact">Cookie Policy</a></li>
                        </ul>
                    </div>

                    <div className={styles.footerLinkCont}>
                        <h3 className={styles.linkHead}>Socials</h3>
                        <ul>
                            <li><a href="/about">Facebook</a></li>
                            <li><a href="/blog">Instagram</a></li>
                            <li><a href="/careers">Pinterest</a></li>
                            <li><a href="/testimonials">Twitter (X)</a></li>
                            <li><a href="/contact">LinkedIn</a></li>
                            <li><a href="/faqs">Youtube</a></li>
                        </ul>
                    </div>

                    <div className={styles.footerLinkCont}>
                        <h3 className={styles.linkHead}>Quick links</h3>
                        <ul>
                            <li><a href="/about">
                                <img src="/icons/address.svg" alt="" />Target Tours Pvt. Ltd. 123 Travel Heights, New Delhi, India</a></li>
                            <li><a href="/blog"> <img src="/icons/phone.svg" alt="" />+91-9876543210</a></li>
                            <li><a href="/careers"> <img src="/icons/clock.svg" alt="" />Hours: 8:00 - 17:00, Mon - Sat</a></li>
                            <li><a href="/testimonials"> <img src="/icons/email.svg" alt="" />support@Targettours.com</a></li>
                        </ul>
                    </div>
                </div>

                <div className={styles.copywrite}>
                © 2025 Target Tours Holidays Private Ltd. | Powered by Passion, Driven by Discovery.
                </div>

            </div>
        </section>
    )
}

export default Footer
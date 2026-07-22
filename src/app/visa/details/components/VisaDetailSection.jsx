"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleCheckBig,
  Minus,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import styles from "./VisaDetailSection.module.css";

const OVERVIEW_METRICS = [
  { label: "STATUS", value: "On track for approval" },
  { label: "LENGTH OF STAY", value: "Up to 90 days" },
  { label: "VALIDITY", value: "Up to 5 years, multiple entry" },
  { label: "NEXT APPOINTMENT", value: "27 June 2026" },
];

const INCLUDED_CARDS = [
  {
    title: "Guided DS-160 filling",
    text: "We help shape the visa form carefully so the details line up with your documents.",
    meta: "~25 min average - autosaved",
  },
  {
    title: "Mock interview practice",
    text: "Practice the questions a consular officer may ask, with feedback on your answers.",
    meta: "Free, unlimited practice rounds",
  },
];

const DOCUMENT_SECTIONS = [
  {
    title: "Cover letter",
    text: "Brief explanation of your trip.",
  },
  {
    title: "Sponsorship letter",
    text: "For sponsored or family trips.",
  },
  {
    title: "Flight reservation",
    text: "Round-trip booking proof.",
  },
  {
    title: "Hotel reservation",
    text: "Confirmed accommodation for your stay.",
  },
  {
    title: "Financial documentation",
    text: "Bank statements and income proof.",
  },
];

const WHAT_YOUll_NEED = [
  {
    title: "Passport bio page",
    text: "Clear scan of the photo page.",
  },
  {
    title: "Recent photo",
    text: "White background, last 6 months.",
  },
  {
    title: "Bank statements",
    text: "Last 3-6 months (per destination).",
  },
  {
    title: "Employment / NOC letter",
    text: "From your current employer.",
  },
  {
    title: "Income tax returns",
    text: "Last 2 years.",
  },
  {
    title: "Travel insurance",
    text: "Schengen requires >= ₹30 lakh cover.",
  },
  {
    title: "Hotel booking",
    text: "Confirmed bookings for your stay.",
  },
  {
    title: "Flight itinerary",
    text: "Onward + return tickets.",
  },
  {
    title: "Cover letter",
    text: "Brief explanation of your trip.",
  },
];

const APPLY_COMPARISON = [
  {
    left: "Interview slots get scarcer closer to travel dates",
    right: "Interview slots are confirmed well ahead of your trip",
  },
  {
    left: "You're filling the DS-160 under time pressure",
    right: "You have time to prepare and practice properly",
  },
  {
    left: "A visa is valid for up to 10 years either way",
    right: "Getting it early means it's simply done - no last-minute stress",
  },
];

const PROCESS_STEPS = [
  "You share your documents and travel plan",
  "We guide you through any gaps before submission",
  "We submit and track your application on your behalf",
  "You get your visa, ready to travel",
];

const PICK_US = [
  {
    title: "Draft around your profile, not a template",
    text: "Documents and cover letter tailored to your job, finances, and trip.",
  },
  {
    title: "Every document double-checked",
    text: "Reviewed against what the embassy is actually looking for, before we reach VFS.",
  },
  {
    title: "Backed by data from thousands of applications",
    text: "We know which patterns get approved and which get flagged.",
  },
  {
    title: "We catch red flags before the embassy does",
    text: "Missing dates, weak finances, missing letters - flagged early and fixed.",
  },
];

const FAQ_ITEMS = [
  {
    question: "What is the France Schengen tourist visa fee for Indians?",
    answer:
      "The package summary and appointment fee depend on the service level and traveller count.",
  },
  {
    question: "How long does it take to process a France tourist visa?",
    answer:
      "Processing times vary by season and appointment availability, but we surface the current window before you apply.",
  },
  {
    question: "Is travel insurance mandatory for a Schengen visa?",
    answer:
      "Yes, travel insurance is required for Schengen applications and should meet the embassy coverage requirement.",
  },
  {
    question: "What documents do I need for a France tourist visa application?",
    answer:
      "Passport, photo, bank statements, itinerary, hotel and flight proofs, plus any supporting employment or sponsorship documents.",
  },
  {
    question: "Can I apply if I was refused a Schengen visa before?",
    answer:
      "Yes. We help review the refusal and prepare a stronger application for the next attempt.",
  },
];

const VisaDetailSection = () => {
  const [travellers, setTravellers] = useState(1);
  const [openDoc, setOpenDoc] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);

  const serviceFee = 49;
  const govtFee = 90;
  const totalAmount = serviceFee + govtFee;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.leftColumn}>
            <section id="overview" className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionKicker}>VISA OVERVIEW</p>
                  {/* <h2 className={styles.sectionTitle}>Visa Overview</h2> */}
                </div>
              </div>

              <div className={styles.overviewMetrics}>
                {OVERVIEW_METRICS.map((item) => (
                  <div key={item.label} className={styles.metricCard}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>

              <div className={styles.alertCard}>
                <span className={styles.alertDot} />
                <p>
                  412 VFS appointments booked this week - next available in
                  Delhi: 4 days.
                </p>
              </div>

              <div className={styles.capacityCard}>
                <div className={styles.capacityTopRow}>
                  <strong>287</strong>
                  <span>appointments booked this week</span>
                </div>
                <div className={styles.capacityBarTrack}>
                  <div className={styles.capacityBarFill} />
                </div>
                <div className={styles.capacityBottomRow}>
                  <span>90% of weekly capacity</span>
                  <span>33 slots left</span>
                </div>
              </div>
            </section>

            <section className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionKicker}>WHAT'S INCLUDED</p>
                  {/* <h2 className={styles.sectionTitle}>WHAT'S INCLUDED</h2> */}
                </div>
              </div>

              <div className={styles.includedGrid}>
                {INCLUDED_CARDS.map((item) => (
                  <article key={item.title} className={styles.includedCard}>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    <span>{item.meta}</span>
                  </article>
                ))}
              </div>
            </section>

            <section id="documents" className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionKicker}>
                    APPROVAL-FOCUSED DOCUMENT SUPPORT
                  </p>
                  <h2 className={styles.sectionTitle}>
                    Every document is reviewed against what the embassy is
                    actually checking for - not a generic checklist.
                  </h2>
                </div>
              </div>

              <div className={styles.documentList}>
                {DOCUMENT_SECTIONS.map((item, index) => {
                  const isOpen = index === openDoc;
                  return (
                    <details
                      key={item.title}
                      className={styles.documentRow}
                      open={isOpen}
                      onToggle={(event) => {
                        if (event.currentTarget.open) {
                          setOpenDoc(index);
                        }
                      }}
                    >
                      <summary>
                        <span>{item.title.toUpperCase()}</span>
                        <ChevronDown
                          size={16}
                          className={
                            isOpen ? styles.chevronOpen : styles.chevron
                          }
                        />
                      </summary>
                      <p>{item.text}</p>
                    </details>
                  );
                })}
              </div>
            </section>

            <section className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionKicker}>WHAT YOU'LL NEED</p>
                  {/* <h2 className={styles.sectionTitle}>What you'll need</h2> */}
                </div>
              </div>

              <div className={styles.needGrid}>
                {WHAT_YOUll_NEED.map((item) => (
                  <article key={item.title} className={styles.needCard}>
                    <span className={styles.needIcon}>
                      {/* <CircleCheckBig size={18} /> */}
                      <img src="/icons/check-square.svg" alt="" />
                    </span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionKicker}>APPLY NOW VS LATER</p>
                  {/* <h2 className={styles.sectionTitle}>Apply now vs later</h2> */}
                </div>
              </div>

              <div className={styles.compareTable}>
                <div className={styles.compareHead}>
                  <span>APPLY LATER</span>
                  <span>APPLY NOW</span>
                </div>
                {APPLY_COMPARISON.map((row) => (
                  <div key={row.left} className={styles.compareRow}>
                    <div>{row.left}</div>
                    <div>{row.right}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionKicker}>THE VISA PROCESS</p>
                  {/* <h2 className={styles.sectionTitle}>The visa process</h2> */}
                </div>
              </div>

              <div className={styles.processGrid}>
                {PROCESS_STEPS.map((step, index) => (
                  <article key={step} className={styles.processStep}>
                    <span>{index + 1}</span>
                    <p>{step}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionKicker}>WHY TRAVELLERS PICK US</p>
                  {/* <h2 className={styles.sectionTitle}>Why travellers pick us</h2> */}
                </div>
              </div>

              <div className={styles.pickGrid}>
                {PICK_US.map((item) => (
                  <article key={item.title} className={styles.pickCard}>
                    <h3> <img src="/icons/check-square.svg" alt="" /> {item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                ))}
              </div>
            </section>

            <section id="vfs" className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionKicker}>VFS CENTRE</p>
                  {/* <h2 className={styles.sectionTitle}>VFS centre</h2> */}
                </div>
              </div>

              <div className={styles.vfsCard}>
                <div>
                  <strong>VFS Global - France (Schengen) visa, Delhi</strong>
                  <span>
                    Shivaji Stadium Metro Station, Connaught Place, New Delhi
                    110001
                  </span>
                  <span> <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-calendar-icon lucide-calendar"
                    >
                      <path d="M8 2v4" />
                      <path d="M16 2v4" />
                      <rect width="18" height="18" x="3" y="4" rx="2" />
                      <path d="M3 10h18" />
                    </svg> Mon-Sat - 09:00 to 14:00</span>
                </div>
              </div>
            </section>

            <section className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionKicker}>
                    REAL STORIES FROM INDIAN TRAVELLERS
                  </p>
                  {/* <h2 className={styles.sectionTitle}>Real stories from Indian travellers</h2> */}
                </div>
              </div>

              <article className={styles.storyCard}>
                <p>
                  "As a self-employed individual, I often feel anxious about
                  securing new opportunities. However, I found that the
                  comprehensive cover letter and thorough financial review
                  provided by the service truly alleviated my concerns. They
                  highlighted my strengths and gave me the confidence I needed
                  to present myself effectively."
                </p>
                <strong>Riya M.</strong>
                <span>Freelancer, Mumbai</span>
              </article>
            </section>

            <section id="faqs" className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionKicker}>
                    FREQUENTLY ASKED QUESTIONS
                  </p>
                  {/* <h2 className={styles.sectionTitle}>
                    Frequently asked questions
                  </h2> */}
                </div>
              </div>

              <div className={styles.faqList}>
                {FAQ_ITEMS.map((faq, index) => {
                  const isOpen = index === openFaq;
                  return (
                    <details
                      key={faq.question}
                      className={styles.faqRow}
                      open={isOpen}
                      onToggle={(event) => {
                        if (event.currentTarget.open) {
                          setOpenFaq(index);
                        }
                      }}
                    >
                      <summary>
                        <span>{faq.question}</span>
                        <ChevronRight size={16} />
                      </summary>
                      <p>{faq.answer}</p>
                    </details>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className={styles.rightColumn}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <h3>PRICE SUMMARY</h3>
                <span className={styles.secureBadge}>
                  <ShieldCheck size={14} />
                  Secure
                </span>
              </div>

              <div className={styles.totalBlock}>
                <span>TOTAL</span>
                <strong>
                  <span>INR</span>
                  {totalAmount}
                </strong>
              </div>

              <div className={styles.stepperRow}>
                <span>Travellers</span>
                <div className={styles.stepperControl}>
                  <button
                    type="button"
                    onClick={() =>
                      setTravellers((value) => Math.max(1, value - 1))
                    }
                    aria-label="Decrease travellers"
                  >
                    <Minus size={14} />
                  </button>
                  <strong>{travellers}</strong>
                  <button
                    type="button"
                    onClick={() => setTravellers((value) => value + 1)}
                    aria-label="Increase travellers"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className={styles.feeList}>
                <div>
                  <span>Pay now - service</span>
                  <strong>INR {serviceFee}</strong>
                </div>
                <div>
                  <span>
                    {" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-calendar-icon lucide-calendar"
                    >
                      <path d="M8 2v4" />
                      <path d="M16 2v4" />
                      <rect width="18" height="18" x="3" y="4" rx="2" />
                      <path d="M3 10h18" />
                    </svg>{" "}
                    At appointment - govt. fee
                  </span>
                  <strong>INR {govtFee}</strong>
                </div>
              </div>

              <button type="button" className={styles.primarySidebarCta}>
                START APPLICATION
              </button>

              <ul className={styles.benefitList}>
                <li> <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FBD530" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dot-icon lucide-dot"><circle cx="12" cy="12" r="1"/></svg> Personal case manager</li>
                <li> <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FBD530" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dot-icon lucide-dot"><circle cx="12" cy="12" r="1"/></svg> Document pre-check in 12h</li>
                <li> <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FBD530" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dot-icon lucide-dot"><circle cx="12" cy="12" r="1"/></svg> Appointment booked for you</li>
                <li> <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FBD530" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dot-icon lucide-dot"><circle cx="12" cy="12" r="1"/></svg> Refund if rejected for our error</li>
              </ul>
            </div>

            <div className={styles.sideInfoCard}>
              <div>
                <span>Processing</span>
                <strong>15-21 days</strong>
              </div>
              <div>
                <span>Biometrics</span>
                <strong>Required</strong>
              </div>
              <div>
                <span>Interview</span>
                <strong>Not required</strong>
              </div>
              <div>
                <span>Appointment</span>
                <strong>VFS</strong>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default VisaDetailSection;

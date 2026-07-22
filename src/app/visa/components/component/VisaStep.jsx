"use client";

import React, { useState } from "react";
import styles from "./VisaStep.module.css";

const STEPS = [
  {
    title: "Complete Online Form",
    description:
      "Fill out your personal details, travel history, and purpose of visit in our secure online application form.",
  },
  {
    title: "Upload Documents",
    description:
      "Submit all required supporting documents including passport copy, photos, and financial statements.",
  },
  {
    title: "Pay Application Fee",
    description:
      "Securely pay your visa application fee online using a credit card, debit card, or bank transfer.",
  },
  {
    title: "Track Your Application",
    description:
      "Monitor your application status in real time and receive updates via email and SMS.",
  },
];

const FAQS = [
  {
    question: "What documents are required for a visa application?",
    answer:
      "A standard visa application typically requires a valid passport with at least 6 months validity, a completed application form, recent passport-size photographs, proof of travel itinerary, confirmed hotel bookings, bank statements showing sufficient funds, and travel insurance. Additional documents may be required depending on the destination country and visa type.",
  },
  {
    question: "How long does visa processing usually take?",
    answer:
      "Processing time depends on the destination and visa category. Many e-visas take a few working days, while embassy visas can take longer because appointments, biometrics, or interviews may be required.",
  },
  {
    question: "Can I apply for a visa extension while abroad?",
    answer:
      "Some countries allow visa extensions after arrival, while others require you to leave before your visa expires. We recommend checking the rules for your destination before travel.",
  },
  {
    question: "What is the difference between a single-entry and multiple-entry visa?",
    answer:
      "A single-entry visa allows one entry into the country. A multiple-entry visa lets you enter and leave more than once during the visa validity period.",
  },
  {
    question: "What should I do if my visa application is rejected?",
    answer:
      "Review the rejection reason carefully. In many cases you can reapply with corrected documents, stronger financial proof, or additional clarification.",
  },
];

const VisaStep = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className={styles.section}>
      <div className={styles.stepsPanel}>
        <div className={styles.stepsInner}>
          <h2 className={styles.stepsHeading}>
            Apply For Your Visa In Just Four Simple Steps.
          </h2>

          <div className={styles.stepsGrid}>
            {STEPS.map((step, index) => (
              <article className={styles.stepCard} key={step.title}>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                </div>
                <span className={styles.stepNumber}>{index + 1}</span>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.faqPanel}>
        <div className={styles.faqInner}>
          <div className={styles.faqIntro}>
            <h2 className={styles.faqHeading}>Frequently Asked Questions</h2>
            <p className={styles.faqSubheading}>
              Find Answers To Common Questions About Visa Applications
            </p>
          </div>

          <div className={styles.faqList}>
            {FAQS.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div className={styles.faqItem} key={faq.question}>
                  <button
                    type="button"
                    className={styles.faqButton}
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  >
                    <span>{faq.question}</span>
                    <span className={styles.faqIcon}>{isOpen ? "⌃" : "⌄"}</span>
                  </button>
                  {isOpen && <p className={styles.faqAnswer}>{faq.answer}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisaStep;

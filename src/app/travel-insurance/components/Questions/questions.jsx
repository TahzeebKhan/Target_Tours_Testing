"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./questions.module.css";

const faqData = [
  {
    id: 1,
    question: "What does travel insurance cover?",
    answer: "Some countries have made travel insurance mandatory, we recommend you to check the guidelines of the countries you are travelling to. However, a travel insurance policy can also be considered necessary from a financial loss protection point of view for travellers. There are several uncertainties involved with travelling, and having insurance will ensure there are no huge out-of-pocket expenses in such cases.",
  },
  {
    id: 2,
    question: "When should I purchase travel insurance?",
    answer: "Some countries have made travel insurance mandatory, we recommend you to check the guidelines of the countries you are travelling to. However, a travel insurance policy can also be considered necessary from a financial loss protection point of view for travellers. There are several uncertainties involved with travelling, and having insurance will ensure there are no huge out-of-pocket expenses in such cases.",
  },
  {
    id: 3,
    question: "Can I cancel my policy and get a refund?",
    answer: "Some countries have made travel insurance mandatory, we recommend you to check the guidelines of the countries you are travelling to. However, a travel insurance policy can also be considered necessary from a financial loss protection point of view for travellers. There are several uncertainties involved with travelling, and having insurance will ensure there are no huge out-of-pocket expenses in such cases.",
  },
  {
    id: 4,
    question: "Does travel insurance cover pre-existing medical conditions?",
    answer: "Some countries have made travel insurance mandatory, we recommend you to check the guidelines of the countries you are travelling to. However, a travel insurance policy can also be considered necessary from a financial loss protection point of view for travellers. There are several uncertainties involved with travelling, and having insurance will ensure there are no huge out-of-pocket expenses in such cases.",
  },
  {
    id: 5,
    question: "How do I file a claim?",
    answer: "Some countries have made travel insurance mandatory, we recommend you to check the guidelines of the countries you are travelling to. However, a travel insurance policy can also be considered necessary from a financial loss protection point of view for travellers. There are several uncertainties involved with travelling, and having insurance will ensure there are no huge out-of-pocket expenses in such cases.",
  },
  {
    id: 6,
    question: "Am I covered if I travel to multiple countries?",
    answer: "Some countries have made travel insurance mandatory, we recommend you to check the guidelines of the countries you are travelling to. However, a travel insurance policy can also be considered necessary from a financial loss protection point of view for travellers. There are several uncertainties involved with travelling, and having insurance will ensure there are no huge out-of-pocket expenses in such cases.",
  },
  {
    id: 7,
    question: "Can I extend my coverage while traveling?",
    answer: "Some countries have made travel insurance mandatory, we recommend you to check the guidelines of the countries you are travelling to. However, a travel insurance policy can also be considered necessary from a financial loss protection point of view for travellers. There are several uncertainties involved with travelling, and having insurance will ensure there are no huge out-of-pocket expenses in such cases.",
  },
];

export default function Questions() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className={styles.faqSection}>
      <div className={styles.headerContainer}>
        <h2 className={styles.title}>Frequently Asked Questions</h2>
        <p className={styles.subtitle}>
          Find Answers To Common Questions About Our Travel Insurance
        </p>
      </div>

      <div className={styles.accordionContainer}>
        {faqData.map((item, index) => (
          <div
            key={item.id}
            className={`${styles.accordionItem} ${
              activeIndex === index ? styles.active : ""
            }`}
          >
            <button
              className={styles.questionButton}
              onClick={() => toggleAccordion(index)}
              aria-expanded={activeIndex === index}
            >
              <span className={styles.questionText}>{item.question}</span>
              <div className={styles.iconWrapper}>
                <Image
                  src="/icons/icon-arrow-down.svg"
                  alt="Toggle"
                  width={16}
                  height={16}
                  className={styles.chevronIcon}
                />
              </div>
            </button>
            <div className={styles.answerWrapper}>
              <div className={styles.answerContent}>
                <p className={styles.answerText}>{item.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footerContainer}>
        <button className={styles.supportButton}>
          FACING ISSUE? CONTACT OUR SUPPORT TEAM
        </button>
      </div>
    </section>
  );
}
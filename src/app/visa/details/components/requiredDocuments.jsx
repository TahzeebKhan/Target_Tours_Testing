import React from "react";
import styles from "./requiredDocuments.module.css";

const documents = [
  {
    title: "Passport (Original + Scan)",
    description: "Clear scan of the photo page.",
  },
  {
    title: "Standard Passport Photo",
    description: "White background, last 6 months.",
  },
];

const CheckIcon = () => (
  <svg
    className={styles.checkIcon}
    width="16"
    height="15"
    viewBox="0 0 16 15"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5.166 7.5 7.055 9.389 10.833 5.611"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.5 2.5H3.834c-.737 0-1.334.597-1.334 1.333v7.334c0 .736.597 1.333 1.334 1.333h7.333c.736 0 1.333-.597 1.333-1.333V8.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.5 2.5h3v3"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DocumentCard = ({ title, description }) => (
  <article className={styles.documentCard}>
    <span className={styles.iconWrap}>
      <CheckIcon />
    </span>
    <div className={styles.documentCopy}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
    <span className={styles.badge}>Mandatory</span>
  </article>
);

const RequiredDocuments = ({ onNext }) => {
  return (
    <div className={styles.wrapper}>
      <section className={styles.section} aria-labelledby="required-documents-heading">
        <div className={styles.content}>
          <header className={styles.header}>
            <div className={styles.country}>
              <span className={styles.flag} aria-hidden="true">
                <img src="/icons/vietnamFlag.svg" alt="Country Flag" />
              </span>
              <span>Vietnam</span>
            </div>
            <h2 id="required-documents-heading" className={styles.title}>
              Have these ready
            </h2>
            <p className={styles.subtitle}>
              Gather These Documents Before Starting Your Application.
              <br />
              Missing Documents Are The #1 Reason For Visa Delays And Rejections.
            </p>
          </header>

          <div className={styles.card}>
            <div className={styles.documentsGroup}>
              <h3 className={styles.groupTitle}>Identity Documents</h3>
              <div className={styles.documentsList}>
                {documents.map((document) => (
                  <DocumentCard
                    key={document.title}
                    title={document.title}
                    description={document.description}
                  />
                ))}
              </div>
            </div>

            <div className={styles.footer}>
              <button className={styles.submitButton} type="button" onClick={onNext}>
                Start Filling
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RequiredDocuments;

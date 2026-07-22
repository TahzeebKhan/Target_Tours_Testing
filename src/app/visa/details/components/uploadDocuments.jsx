"use client";

import React, { useCallback, useRef, useState } from "react";
import styles from "./uploadDocuments.module.css";

const documents = [
  {
    title: "Passport (Original + Scan)",
    description: "Clear scan of the photo page.",
  },
  {
    title: "Standard Passport Photo",
    description: "White background, no glasses last 6 months.",
  },
];

const CheckSquareIcon = () => (
  <svg
    className={styles.checkSquareIcon}
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

const CameraIcon = () => (
  <svg
    className={styles.cameraIcon}
    width="30"
    height="24"
    viewBox="0 0 30 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M10.5 5.5 12.2 3h5.6l1.7 2.5H24c1.105 0 2 .895 2 2V19c0 1.105-.895 2-2 2H6c-1.105 0-2-.895-2-2V7.5c0-1.105.895-2 2-2h4.5Z"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 16.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UploadedIcon = () => (
  <svg
    className={styles.uploadedIcon}
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M16.5 8.31V9a7.5 7.5 0 1 1-4.447-6.855"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.5 3 9 10.508l-2.25-2.25"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BackIcon = () => (
  <svg
    className={styles.backIcon}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M9.167 4.167 3.334 10l5.833 5.833"
      stroke="currentColor"
      strokeWidth="0.833"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.334 10h13.333"
      stroke="currentColor"
      strokeWidth="0.833"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UploadCard = ({ index, title, description, file, error, onFileSelect }) => {
  const inputRef = useRef(null);

  const openPicker = useCallback(() => inputRef.current?.click(), []);
  const handleChange = useCallback((event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) onFileSelect(index, selectedFile);
    event.target.value = "";
  }, [index, onFileSelect]);

  return (
  <article className={`${styles.documentCard} ${file ? styles.uploadedCard : ""}`}>
    <div className={styles.documentHeader}>
      <span className={styles.iconWrap}>
        <CheckSquareIcon />
      </span>
      <div className={styles.documentCopy}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <button className={styles.uploadZone} type="button" onClick={openPicker}>
        <CameraIcon />
        <span>Click to upload or drag &amp; drop JPG, PNG, PDF - Max 5MB</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        multiple={false}
        hidden
        onChange={handleChange}
      />
    </div>

    {file ? (
      <div className={styles.uploadedDetails}>
        <div className={styles.fileRow}>
          <UploadedIcon />
          <span className={styles.fileName}>{file.name}</span>
          <button className={styles.replaceButton} type="button" onClick={openPicker}>
            Replace
          </button>
        </div>
        <p className={styles.successBadge}>Passport details extracted automatically</p>
      </div>
    ) : null}
    {error && <p className={styles.fileError}>{error}</p>}
  </article>
  );
};

const UploadDocuments = ({ onNext, onBack }) => {
  const [files, setFiles] = useState({});
  const [errors, setErrors] = useState({});

  const handleFileSelect = useCallback((index, file) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({ ...current, [index]: "Upload a JPG, PNG, or PDF up to 5MB." }));
      return;
    }
    setFiles((current) => ({ ...current, [index]: file }));
    setErrors((current) => ({ ...current, [index]: "" }));
  }, []);

  const handleNext = useCallback(() => {
    const nextErrors = documents.reduce((current, _, index) => {
      if (!files[index]) current[index] = "This document is required.";
      return current;
    }, {});
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onNext?.();
  }, [files, onNext]);

  return (
    <div className={styles.wrapper}>
      <section className={styles.section} aria-labelledby="upload-documents-heading">
        <div className={styles.content}>
          <header className={styles.header}>
            <div className={styles.country}>
              <span className={styles.flag} aria-hidden="true">
                <img src="/icons/vietnamFlag.svg" alt="Country Flag" />
              </span>
              <span>Vietnam</span>
            </div>
            <h2 id="upload-documents-heading" className={styles.title}>
              Upload documents
            </h2>
            <p className={styles.subtitle}>
              {Object.keys(files).length} Of {documents.length} Uploaded. PDF, JPG, Or PNG Up To 10 MB Each.
            </p>
          </header>

          <div className={styles.card}>
            <div className={styles.documentsList}>
              {documents.map((document, index) => (
                <UploadCard
                  key={document.title}
                  index={index}
                  title={document.title}
                  description={document.description}
                  file={files[index]}
                  error={errors[index]}
                  onFileSelect={handleFileSelect}
                />
              ))}
            </div>

            <footer className={styles.footer}>
              <button className={styles.backButton} type="button" onClick={onBack}>
                <BackIcon />
                <span>Back To Form</span>
              </button>
              <button className={styles.submitButton} type="button" onClick={handleNext}>
                Review And Pay
              </button>
            </footer>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UploadDocuments;

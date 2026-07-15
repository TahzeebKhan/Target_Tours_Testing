"use client";
import React, { useState } from "react";
import styles from "./DescriptionComponent.module.css";
import { useBodyScrollLock } from "@/shared/hooks/useBodyScrollLock";

const getDescriptionText = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value !== "object") return String(value);

  return (
    value.text ||
    value.description ||
    value.desc ||
    value.value ||
    value.name ||
    value.label ||
    ""
  );
};

const normalizeDescriptions = (description, descriptions) => {
  const rows = [];

  (Array.isArray(descriptions) ? descriptions : [descriptions]).forEach((item) => {
    const text = getDescriptionText(item);
    if (text) rows.push(String(text));
  });

  const fallbackText = getDescriptionText(description);
  const isGeneratedFallback = /details are being updated/i.test(fallbackText);
  if (fallbackText && (!rows.length || !isGeneratedFallback)) {
    rows.push(String(fallbackText));
  }

  return [...new Set(rows.map((item) => item.trim()).filter(Boolean))];
};

const stripHtml = (value = "") =>
  String(value)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const sanitizeHtml = (value = "") =>
  String(value)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");

const hasHtml = (value = "") => /<\/?[a-z][\s\S]*>/i.test(String(value));

const formatLabel = (value = "") =>
  String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const splitDescriptionLabel = (value = "") => {
  const match = String(value).match(/^([a-zA-Z_][\w\s-]{1,40}):\s*([\s\S]+)$/);

  if (!match) {
    return { label: "", content: String(value) };
  }

  return {
    label: formatLabel(match[1]),
    content: match[2],
  };
};

const DescriptionComponent = ({ description, descriptions = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  useBodyScrollLock(isModalOpen);
  const descriptionRows = normalizeDescriptions(description, descriptions);
  const fullText = (
    descriptionRows.length ? descriptionRows.join("\n") : "Hotel details are being updated."
  ).trim();
  const plainPreview = stripHtml(fullText);
  const previewText = plainPreview.length > 220 ? `${plainPreview.slice(0, 220)}...` : plainPreview;
  const paragraphs = previewText
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className={styles.DescriptionSection}>
      <h2 className={styles.heading}>Description</h2>

      <div className={styles.paraCont}>
        {paragraphs.map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}
      </div>

      <button
        type="button"
        className={styles.seeMoreBtn}
        onClick={() => setIsModalOpen(true)}
      >
        See more
      </button>

      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Hotel description"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Description</h3>
              <button
                type="button"
                className={styles.closeBtn}
                aria-label="Close description"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {(descriptionRows.length ? descriptionRows : [fullText]).map((item, index) => {
                const { label, content } = splitDescriptionLabel(item);

                return (
                  <div key={index} className={styles.modalDescriptionItem}>
                    {label && <h4>{label}</h4>}
                    {hasHtml(content) ? (
                      <div
                        className={styles.htmlDescription}
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
                      />
                    ) : (
                      <p>{content}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DescriptionComponent;

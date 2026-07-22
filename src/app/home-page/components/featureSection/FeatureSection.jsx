"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import styles from "./FeatureSection.module.css";
import { fetchWhyChooseUsPublic } from "@/shared/services/whyChooseUsPublic";

const FALLBACK_BACKGROUND = "/images/whyChhose.jpg";
const FALLBACK_TEXT = "N/A";
const SECTION_FALLBACK = { title: FALLBACK_TEXT, description: FALLBACK_TEXT };

const getWhyChooseUsResponse = (response) =>
  response?.why_choose_us ||
  response?.data?.why_choose_us ||
  response?.data ||
  response ||
  {};

const toAbsoluteImageUrl = (value) => {
  const url = String(value || "").trim();
  if (!url) return "";
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("/images/")) return url;

  const backendUrl = String(process.env.NEXT_PUBLIC_BACKEND_URL || "").trim();
  return backendUrl ? `${backendUrl}${url.startsWith("/") ? "" : "/"}${url}` : url;
};

const FeatureSection = () => {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337";

  const { data, isError } = useQuery({
    queryKey: ["why-choose-us-public", domain],
    queryFn: fetchWhyChooseUsPublic,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  if (isError) {
    console.warn("Failed to load why choose us CMS");
  }

  const whyChooseUs = getWhyChooseUsResponse(data);
  const backgroundImage =
    toAbsoluteImageUrl(whyChooseUs?.background_media?.url) || FALLBACK_BACKGROUND;
  const sections = Array.isArray(whyChooseUs?.sections) && whyChooseUs?.sections?.length
    ? whyChooseUs.sections
    : [SECTION_FALLBACK, SECTION_FALLBACK, SECTION_FALLBACK, SECTION_FALLBACK];

  return (
    <section
      className={styles.featureSection}
      style={{ backgroundImage: `url("${backgroundImage}")` }}
    >
      <div className={styles.container}>
        <div className={styles.containerTop}>
          <p>{whyChooseUs?.tagline || 'N/A'}</p>
          <h2>{whyChooseUs?.heading || 'N/A'}</h2>
        </div>
      </div>
      <div className={styles.linearContainer}>
        <div className={styles.containerBottom}>
          {[0, 1, 2, 3].map((index) => (
            <div className={styles.textContainer} key={`why-choose-${index}`}>
              <h3 className={styles.headText}>
                {sections?.[index]?.title || 'N/A'}
              </h3>
              <p className={styles.subHeadText}>
                {sections?.[index]?.description || 'N/A'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;

"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./ViewGalleryPage.module.css";
import ActivityGalleryCarousel from "./activityGalleryCarousel/ActivityGalleryCarousel";
import GallerySection from "./gallerySection/GallerySection";
import { HOTEL_DETAILS_KEY } from "@/shared/services/hotelSearch";
import { useRouter } from "next/navigation";

const FALLBACK_IMAGES = [
  { image: "/images/hotelArt1.png", title: "Lobby" },
  { image: "/images/hotelArt2.png", title: "Room" },
  { image: "/images/hotelArt3.png", title: "Bathroom" },
  { image: "/images/hotelArt2.png", title: "Dining" },
  { image: "/images/hotelArt4.png", title: "Exterior" },
];

const normalizeGalleryItem = (value, index = 0) => {
  if (!value) return null;

  if (typeof value === "string") {
    return {
      image: value,
      title: `Photo ${index + 1}`,
    };
  }

  if (typeof value !== "object") return null;

  const image =
    value.image ||
    value.url ||
    value.src ||
    value.heroImage ||
    value.thumbnail ||
    value.imageUrl ||
    "";

  if (!image) return null;

  return {
    image,
    title:
      value.title ||
      value.caption ||
      value.name ||
      value.label ||
      value.category ||
      value.roomType ||
      `Photo ${index + 1}`,
  };
};

const collectImages = (value, images = [], depth = 0, seen = new WeakSet()) => {
  if (!value || images.length >= 20 || depth > 6) return images;

  if (typeof value === "string") {
    if (/^https?:\/\//.test(value) || value.startsWith("/")) {
      images.push({ image: value, title: "" });
    }
    return images;
  }

  if (typeof value !== "object" || seen.has(value)) return images;
  seen.add(value);

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const normalized = normalizeGalleryItem(item, index);
      if (normalized) {
        images.push(normalized);
        return;
      }
      collectImages(item, images, depth + 1, seen);
    });
    return images;
  }

  [
    value.image,
    value.url,
    value.src,
    value.heroImage,
    value.thumbnail,
    value.imageUrl,
    value.coverImage,
  ].forEach((candidate, index) => {
    const normalized = normalizeGalleryItem(candidate, index);
    if (normalized) images.push(normalized);
    else collectImages(candidate, images, depth + 1, seen);
  });

  ["images", "galleryImages", "photos", "media", "hotelImages", "details", "hotel"].forEach(
    (key) => {
      collectImages(value[key], images, depth + 1, seen);
    },
  );

  return images;
};

const readStoredHotelGallery = () => {
  if (typeof window === "undefined") {
    return { title: "Hotel Gallery", images: FALLBACK_IMAGES };
  }

  try {
    const raw = window.sessionStorage.getItem(HOTEL_DETAILS_KEY);
    const stored = raw ? JSON.parse(raw) : {};
    const images = Array.isArray(stored.galleryImages) && stored.galleryImages.length
      ? stored.galleryImages.map((item, index) => normalizeGalleryItem(item, index)).filter(Boolean)
      : [...new Map(collectImages(stored).map((item) => [item.image, item])).values()];
    const title =
      stored?.hotel?.name ||
      stored?.details?.data?.name ||
      stored?.details?.name ||
      "Hotel Gallery";

    return {
      title,
      images: images.length ? images.slice(0, 12) : FALLBACK_IMAGES,
    };
  } catch {
    return { title: "Hotel Gallery", images: FALLBACK_IMAGES };
  }
};

const chunkImages = (images = [], size = 5) => {
  const chunks = [];

  for (let index = 0; index < images.length; index += size) {
    chunks.push(images.slice(index, index + size));
  }

  return chunks;
};

const ViewGalleryPage = () => {
  const router = useRouter();
  const [galleryMeta, setGalleryMeta] = useState({
    title: "Hotel Gallery",
    images: FALLBACK_IMAGES,
  });

  useEffect(() => {
    setGalleryMeta(readStoredHotelGallery());
  }, []);

  const galleryImages = galleryMeta.images.length
    ? galleryMeta.images
    : FALLBACK_IMAGES;

  const gallerySections = useMemo(() => {
    const chunks = chunkImages(galleryImages, 5);

    if (!chunks.length) {
      return [{ title: galleryMeta.title, images: FALLBACK_IMAGES }];
    }

    return chunks.map((chunk, index) => ({
      title: index === 0 ? galleryMeta.title : `More Photos ${index}`,
      images: chunk.map((item) => item.image),
    }));
  }, [galleryImages, galleryMeta.title]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.nav}>
        <div className={styles.navItem} onClick={() => router.back()}>
          <img src="/icons/right.svg" alt="" />
        </div>
      </div>
      <div className={styles.container}>
        <ActivityGalleryCarousel images={galleryImages} disableNavigation />
        {gallerySections.map((data, index) => (
          <GallerySection key={index} data={data} hideOnMobile />
        ))}
      </div>
    </div>
  );
};

export default ViewGalleryPage;

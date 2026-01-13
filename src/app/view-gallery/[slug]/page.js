"use client";
import { useParams, useRouter } from "next/navigation";
import GallerySection from "../gallerySection/GallerySection";
import styles from "./page.module.css";

const GALLERY_DATA = {
  "alpine-hiking-trail": {
    title: "ALPINE HIKING TRAIL",
    images: [
      "/gallery/Alpine1.png",
      "/gallery/Alpine2.png",
      "/gallery/Alpine3.png",
      "/gallery/Alpine4.png",
      "/gallery/Alpine5.png",
    ],
  },
  "glacier-walk-experience": {
    title: "GLACIER WALK EXPERIENCE",
    images: [
      "/gallery/Glacier1.png",
      "/gallery/Glacier2.png",
      "/gallery/Glacier3.png",
      "/gallery/Glacier4.png",
      "/gallery/Glacier5.png",
    ],
  },
  "wildlife-safari-experience": {
    title: "WILDLIFE SAFARI EXPERIENCE",
    images: [
      "/gallery/Safari1.png",
      "/gallery/Safari2.png",
      "/gallery/Safari3.png",
      "/gallery/Safari4.png",
      "/gallery/Safari5.png",
    ],
  },
};

export default function SingleGalleryPage() {
  const { slug } = useParams();
  const router = useRouter();

  const data = GALLERY_DATA[slug];
  if (!data) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.back} onClick={() => router.back()}>
        <img src="/icons/right.svg" alt="back" />
      </div>

      <GallerySection data={data} />
    </div>
  );
}

"use client";
import React from "react";
import axios from "axios";
import styles from "./ViewGalleryPage.module.css";
import ActivityGalleryCarousel from "./activityGalleryCarousel/ActivityGalleryCarousel";
import GallerySection from "./gallerySection/GallerySection";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`;
};

const fetchTourDetails = async ({ queryKey }) => {
  const [, tourId] = queryKey;
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/holiday-packages/${tourId}`,
    {
      params: {
        domain: process.env.NEXT_PUBLIC_DOMAIN,
      },
    },
  );

  return res.data?.data;
};

const getActivityGroups = (tourDetails) => {
  const groups = new Map();
  const itinerary = Array.isArray(tourDetails?.package_itinerarie)
    ? tourDetails.package_itinerarie
    : [];

  itinerary.forEach((day) => {
    const activities = Array.isArray(day?.package_activities)
      ? day.package_activities
      : Array.isArray(day?.builder_data?.activities)
        ? day.builder_data.activities
        : [];

    activities.forEach((activity) => {
      if (activity?.enabled === false) return;

      const title = activity?.name || "Activity";
      const images = Array.isArray(activity?.images)
        ? activity.images.map((image) => getImageUrl(image?.url)).filter(Boolean)
        : [];

      if (!images.length) return;

      const existing = groups.get(title) || {
        id: activity?.id || title,
        title,
        images: [],
      };

      existing.images.push(...images);
      groups.set(title, existing);
    });
  });

  return Array.from(groups.values()).map((group) => ({
    ...group,
    image: group.images[0],
  }));
};

const ViewGalleryPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tourId = searchParams.get("tourId");
  const handleBack = () => {
    router.back();
  };
  const { data: tourDetails } = useQuery({
    queryKey: ["gallery-tour-details", tourId],
    queryFn: fetchTourDetails,
    enabled: Boolean(tourId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
  const galleryData = getActivityGroups(tourDetails);

  return (
    <div className={styles.wrapper}>
      <div className={styles.nav}>
        <div className={styles.navItem} onClick={handleBack}>
          <img src="/icons/right.svg" alt="" />
        </div>
      </div>
      <div className={styles.container}>
        <ActivityGalleryCarousel images={galleryData} />
        {galleryData.map((data, index) => (
          <GallerySection key={index} data={data} hideOnMobile />
        ))}
      </div>
    </div>
  );
};

export default ViewGalleryPage;

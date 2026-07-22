import React, { useMemo } from "react";
import styles from "./WhereWillYouStay.module.css";
import ExpCarousel from "./expComponent/ExpCarousel";

const FALLBACK_IMAGE = "/fallback.png";

const getMediaUrl = (url) =>
  url
    ? url.startsWith("http")
      ? url
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`
    : "";

const getHotelImages = (hotel) => {
  const mediaItems = Array.isArray(hotel?.main_image)
    ? hotel.main_image
    : hotel?.main_image
      ? [hotel.main_image]
      : [];

  const resolvedImages = mediaItems
    .map((image) => {
      const url =
        image?.formats?.large?.url ||
        image?.formats?.medium?.url ||
        image?.formats?.small?.url ||
        image?.formats?.thumbnail?.url ||
        image?.url;

      return getMediaUrl(url);
    })
    .filter(Boolean)
    .slice(0, 2);

  if (resolvedImages.length === 0) {
    return [FALLBACK_IMAGE, FALLBACK_IMAGE];
  }

  if (resolvedImages.length === 1) {
    return [resolvedImages[0], resolvedImages[0]];
  }

  return resolvedImages;
};

const buildFallbackSlides = () =>
  Array.from({ length: 4 }, (_, index) => ({
    id: `fallback-hotel-${index + 1}`,
    title: "N/A",
    subtitle: "N/A",
    desc: "N/A",
    images: [FALLBACK_IMAGE, FALLBACK_IMAGE],
    favorite: false,
  }));

const WhereWillYouStay = ({ data }) => {
  const slidesData = useMemo(() => {
    const itinerary = Array.isArray(data?.package_itinerarie)
      ? [...data.package_itinerarie].sort(
          (a, b) => (a?.day_number ?? 0) - (b?.day_number ?? 0),
        )
      : [];

    const mappedSlides = itinerary
      .map((day) => {
        const hotel =
          day?.hotel || day?.available_hotels?.[0] || day?.builder_data?.hotel || null;

        if (!hotel) return null;

        return {
          id: day?.id || `day-${day?.day_number || Math.random()}`,
          title:
            [hotel?.city, hotel?.country].filter(Boolean).join(", ") || "N/A",
          subtitle: hotel?.name || "N/A",
          desc:
            hotel?.description ||
            hotel?.hotel_category ||
            day?.description ||
            "N/A",
          images: getHotelImages(hotel),
          favorite: false,
        };
      })
      .filter(Boolean);

    return mappedSlides.length > 0 ? mappedSlides : buildFallbackSlides();
  }, [data]);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Where Will You Stay</h2>
        <div className={styles.carousel}>
          <ExpCarousel activeTab="All" slidesData={slidesData} />
        </div>
      </div>
    </section>
  );
};

export default WhereWillYouStay;

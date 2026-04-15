"use client";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import styles from "./BetweenMajesticPeaks.module.css";
import { useRouter } from "next/navigation";

const BetweenMajesticPeaks = ({ data }) => {
  const [swiperRef, setSwiperRef] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const goToGallery = () => {
    if (!data?.id) return;

    router.push(`/view-gallery?tourId=${data.id}`);
  };

  // Sample images - replace with your actual images
  const carouselImages = [
    "/tourBooking/ImagesItem1.png",
    "/tourBooking/ImagesItem2.png",
    "/tourBooking/ImagesItem3.png",
    "/images/img1.jpg",
    "/images/img2.jpg",
    "/images/img3.jpg",
    "/tourBooking/ImagesItem1.png",
    "/tourBooking/ImagesItem2.png",
    "/tourBooking/ImagesItem3.png",
    "/tourBooking/ImagesItem1.png",
    "/tourBooking/ImagesItem2.png",
    "/tourBooking/ImagesItem3.png",
  ];

  const renderExtraInfo = (blocks) => {
    // if (!Array.isArray(blocks) || blocks.length === 0) return null;

    return blocks.map((block, index) => {
      switch (block.type) {
        case "heading":
          return (
            <h2 key={index} className={styles.heading}>
              {block.children?.map((child) => child.text).join("")}
            </h2>
          );

        case "paragraph":
          return (
            <p key={index}>
              {block.children?.map((child) => child.text).join("")}
            </p>
          );

        default:
          return null;
      }
    });
  };

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.activeIndex);
  };

  const getProgressPercentage = () => {
    if (!swiperRef) return 0;

    // Total slides
    const totalSlides = carouselImages.length;

    // Agar last slide visible hai to 100%
    if (activeIndex >= totalSlides - 1) {
      return 100;
    }

    // Otherwise calculate based on total progress
    return ((activeIndex + 3) / totalSlides) * 100;
  };

  const handlePrev = () => {
    swiperRef?.slidePrev();
  };

  const handleNext = () => {
    swiperRef?.slideNext();
  };

  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openPreview = (index) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closePreview = () => setIsOpen(false);

  const prevImage = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? carouselImages.length - 1 : prev - 1,
    );
  };

  const nextImage = () => {
    setCurrentIndex((prev) =>
      prev === carouselImages.length - 1 ? 0 : prev + 1,
    );
  };
  const galleryImages =
    data?.package_media_entries
      ?.flatMap((item) => item.package_media || [])
      ?.sort((a, b) => (b.width || 0) - (a.width || 0)) // 🔥 biggest first
      ?.slice(0, 5) || [];

  const getImageUrl = (url) => `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`;

  return (
    <section className={styles.Section}>
      <div className={styles.container}>
        <div className={styles.topContainer}>
          <div className={styles.paraContainer}>
            {/* {renderExtraInfo(data?.extra_info)} */}
          
            <h2  className={styles.heading}>
              {/* {block.children?.map((child) => child.text).join("")} */}
              {data?.extra_info_heading}
            </h2>
       

      
            {/* <p > */}
              {/* {block.children?.map((child) => child.text).join("")} */}
              {/* {data?.extra_info} */}
            {/* </p> */}
            <p
  dangerouslySetInnerHTML={{ __html: data?.extra_info }}
/>
          </div>
        </div>

        {/* <div className={styles.bottomContainer}>
                    <div className={styles.carouselWrapper}>
                        <Swiper
                            modules={[Navigation]}
                            onSwiper={setSwiperRef}
                            onSlideChange={handleSlideChange}
                            slidesPerView={'auto'}
                            spaceBetween={24}
                            className={styles.carousel}
                        >
                            {carouselImages.map((image, index) => (
                                <SwiperSlide key={index} className={styles.slide}>
                                    <div className={styles.imageContainer}>
                                        <img src={image} alt={`Slide ${index + 1}`} className={styles.image} onClick={() => openPreview(index)} />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {isOpen && (
                            <div className={styles.previewOverlay} onClick={closePreview}>
                                <div
                                    className={styles.btn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        prevImage();
                                    }}
                                >
                                    <img src="/icons/left.svg" alt="Previous" />
                                </div>
                                <div
                                    className={styles.previewBox}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <img
                                        src={carouselImages[currentIndex]}
                                        className={styles.previewImage}
                                        alt="preview"
                                    />



                                </div>
                                <div
                                    className={styles.btn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        nextImage();
                                    }}
                                >
                                    <img src="/icons/right.svg" alt="Next" />
                                </div>
                            </div>
                        )}

                    </div>
                    <div className={styles.controlsContainer}>
                        <div className={styles.br}>
                            <div
                                className={styles.activeIndicator}
                                style={{ width: `${getProgressPercentage()}%` }}
                            ></div>
                        </div>
                        <div className={styles.btnContainer}>
                            <div
                                className={styles.btn}
                                onClick={handlePrev}
                            >
                                <img src="/icons/left.svg" alt="Previous" />
                            </div>
                            <div
                                className={styles.btn}
                                onClick={handleNext}
                            >
                                <img src="/icons/right.svg" alt="Next" />
                            </div>
                        </div>
                    </div>
                </div> */}
      </div>
      <div className={styles.bottomContainerRef}>
        {/* LEFT BIG IMAGE */}
        <div className={styles.rightImage}>
          {galleryImages[0] && (
            <img
              src={getImageUrl(galleryImages[0].url)}
              alt={galleryImages[0].alternativeText || ""}
            />
          )}
        </div>

        {/* RIGHT GRID (4 images) */}
        <div className={styles.rightGrid}>
          {galleryImages.slice(1, 5).map((img, index) => {
            const isLast = index === 3;

            return (
              <div key={img.id} className={styles.imageBox}>
                <img
                  src={getImageUrl(img.url)}
                  alt={img.alternativeText || ""}
                />

                {isLast && (
                  <button
                    className={styles.viewGalleryBtn}
                    onClick={goToGallery}
                  >
                    <img
                      className={styles.viewGalleryBtnIcon}
                      src="/icons/dotBtn.svg"
                      alt=""
                    />
                    VIEW GALLERY
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BetweenMajesticPeaks;

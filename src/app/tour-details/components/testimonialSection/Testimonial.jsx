"use client"
import React, { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import styles from "./Testimonial.module.css";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://sprintsell.com";

const formatReviewDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
};

const getReviewsArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.reviews)) return payload.data.reviews;
  if (Array.isArray(payload?.reviews)) return payload.reviews;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const normalizeReview = (item, index) => {
  const review = item?.attributes ? { id: item.id, ...item.attributes } : item;
  const user = review?.user || review?.customer || review?.traveler || review?.created_by || {};
  const firstName = user?.first_name || user?.firstName || "";
  const lastName = user?.last_name || user?.lastName || "";
  const name =
    review?.name ||
    review?.user_name ||
    user?.name ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    "Traveler";
  const location =
    review?.location ||
    review?.city ||
    user?.location ||
    [user?.city, user?.country].filter(Boolean).join(", ") ||
    "N/A";
  const avatar =
    review?.avatar?.url ||
    review?.profile_image?.url ||
    review?.profile_photo?.url ||
    user?.avatar?.url ||
    user?.profile_image?.url ||
    user?.profile_photo?.url ||
    user?.image?.url ||
    review?.avatar ||
    review?.profile_photo ||
    user?.profile_photo ||
    "";

  return {
    id: review?.id || index,
    name,
    location,
    rating: Math.max(0, Math.min(5, Number(review?.ratings || review?.rating || review?.stars || 0))),
    review: review?.review || review?.comment || review?.description || review?.message || "N/A",
    date: formatReviewDate(review?.createdAt || review?.created_at || review?.date || review?.publishedAt),
    avatar: getImageUrl(avatar),
  };
};

const fetchPackageReviews = async ({ queryKey }) => {
  const [, itemId, domain] = queryKey;
  const res = await axios.get(`${API_BASE_URL}/api/item-review`, {
    params: {
      reviewType: "package",
      itemId,
      domain,
    },
  });

  return getReviewsArray(res.data).map(normalizeReview);
};

const Testimonial = ({ data }) => {
  const [swiperRef, setSwiperRef] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const itemId = data?.id;
  const domain = process.env.NEXT_PUBLIC_DOMAIN;

  const { data: testimonialData = [] } = useQuery({
    queryKey: ["package-reviews", itemId, domain],
    queryFn: fetchPackageReviews,
    enabled: Boolean(itemId && domain),
    staleTime: 0,
    retry: 1,
  });
  const reviewsToRender = testimonialData.length
    ? testimonialData
    : [
        {
          id: "no-review",
          name: "No review found",
          location: "",
          rating: 0,
          review: "No review found",
          date: "",
          avatar: "",
        },
      ];

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.activeIndex)
  }

   const handlePrev = () => {
        swiperRef?.slidePrev()
    }

    const handleNext = () => {
        swiperRef?.slideNext()
    }
  return (
    <section className={styles.section}>
      <div className={styles.container}> 
        <h2 className={styles.heading}>What Our Travelers Say</h2>

        <div className={styles.testimonialContainer}>
          <Swiper
            modules={[Navigation]}
            onSwiper={setSwiperRef}
            onSlideChange={handleSlideChange}
            slidesPerView={'auto'}
            spaceBetween={24}
            breakpoints={
              {
                0:{
                  spaceBetween:9
                },
                430:{
                  spaceBetween:16
                },
                768:{
                  spaceBetween:24
                }
              }
            }
            className={styles.carousel}
          >
            {reviewsToRender.map((item) => (
              <SwiperSlide key={item.id} className={styles.slide}>
                <div className={styles.testimonialCard}>
                  {/* Header */}
                  <div className={styles.profileCont}>
                    <div className={styles.profile}>
                      <div
                        className={styles.profileIcon}
                        style={
                          item.avatar
                            ? {
                                backgroundImage: `url(${item.avatar})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }
                            : undefined
                        }
                      ></div>

                      <div className={styles.profileAddressCont}>
                        <span className={styles.profileName}>{item.name}</span>
                        <span className={styles.profileAddress}>
                          {item.location}
                        </span>
                      </div>
                    </div>

                    <img src="/icons/testimonialIcons.svg" alt="quote" className={styles.TestimonialIcon} />
                  </div>

                  {/* Rating */}
                  <div className={styles.ratingStart}>
                    {[...Array(5)].map((_, i) => (
                      <img
                        key={i}
                        src="/icons/tetimonialStart.svg"
                        alt="star"
                        style={
                          i < item.rating
                            ? undefined
                            : {
                                filter:
                                  "brightness(0) saturate(100%) invert(90%) sepia(7%) saturate(197%) hue-rotate(176deg) brightness(95%) contrast(87%)",
                              }
                        }
                      />
                    ))}
                  </div>

                  {/* Review */}
                  <div className={styles.testimonialPara}>
                    <p>"{item.review}"</p>
                  </div>

                  {/* Date */}
                  <div className={styles.testimonialDate}>
                    <span>{item.date}</span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        {testimonialData.length > 4 && (
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
        )}
      </div>
    </section>
  );
};

export default Testimonial;

"use client";
import React, { useState } from "react";
import styles from "./TourListing.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import SearchResults from "../searchResult/SearchResults";
import CreateWishlistModal from "@/shared/components/wishlistModals/CreateWishlistModal";
import SaveToWishlistModal from "@/shared/components/wishlistModals/SaveToWishlistModal";

const TourListing = () => {
  const [likedTours, setLikedTours] = useState([]);
  const [viewType, setViewType] = useState("grid");
  const [expandedId, setExpandedId] = useState(null);

  const [isCreateWishlistOpen, setIsCreateWishlistOpen] = useState(false);
  const [isSaveWishlistOpen, setIsSaveWishlistOpen] = useState(false);
  const [wishlists, setWishlists] = useState([]); // fetch later from backend
  const [selectedTourId, setSelectedTourId] = useState(null);

  const handleHeartClick = (tourId) => {
    setSelectedTourId(tourId);

    if (!wishlists.length) {
      setIsCreateWishlistOpen(true);
    } else {
      setIsSaveWishlistOpen(true);
    }
  };

  const handleCreateWishlist = (name) => {
    const newWishlist = {
      id: Date.now(),
      name,
      count: 0,
    };

    setWishlists((prev) => [...prev, newWishlist]);

    setIsCreateWishlistOpen(false);
    setIsSaveWishlistOpen(true);
  };
  const router = useRouter();
  const handleBookNow = () => {
    router.push("/hotel-detail"); // 👈 your page route
  };
  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const rating = 5;
  const tourData = [
    {
      id: 1,
      image: "/hotelList/hotelCardImg.png",
      route: "9211 Forest Avenue, California - 90734",
      title: "Splendors of the Canadian West",
      days: "17 DAYS & 16 NIGHTS",
      meals: "SELECTED MEALS",
      hotel: "4-STAR HOTEL",
      activities: "3 ACTIVITIES",
      price: "₹ 66,945",
    },
    {
      id: 2,
      image: "/tourList/cardItem2.jpg",
      route: "9211 Forest Avenue, California - 90734",
      title: "Splendors of the Rocky Mountains",
      days: "14 DAYS & 13 NIGHTS",
      meals: "SELECTED MEALS",
      hotel: "4-STAR HOTEL",
      activities: "3 ACTIVITIES",
      price: "₹ 72,990",
    },
    {
      id: 3,
      image: "/tourList/cardItem3.jpg",
      route: "TORONTO TO MONTREAL",
      title: "Charms of Eastern Canada",
      days: "17 DAYS & 16 NIGHTS",
      meals: "SELECTED MEALS",
      hotel: "4-STAR HOTEL",
      activities: "3 ACTIVITIES",
      price: "₹ 66,945",
    },
    {
      id: 4,
      image: "/tourList/cardItem4.jpg",
      route: "WHITEHORSE TO FAIRBANKS",
      title: "Northern Lights of Canada",
      days: "10 DAYS & 9 NIGHTS",
      meals: "SELECTED MEALS",
      hotel: "4-STAR HOTEL",
      activities: "4 ACTIVITIES",
      price: "₹ 89,900",
    },
    {
      id: 5,
      image: "/tourList/cardItem5.jpg",
      route: "MONTREAL TO QUEBEC CITY",
      title: "Colors of Quebec Fall",
      days: "17 DAYS & 16 NIGHTS",
      meals: "SELECTED MEALS",
      hotel: "4-STAR HOTEL",
      activities: "3 ACTIVITIES",
      price: "₹ 66,945",
    },
    {
      id: 6,
      image: "/tourList/cardItem6.jpg",
      route: "VANCOUVER TO WHISTLER",
      title: "Elegance of Canada's West Coast",
      days: "17 DAYS & 16 NIGHTS",
      meals: "SELECTED MEALS",
      hotel: "4-STAR HOTEL",
      activities: "3 ACTIVITIES",
      price: "₹ 66,945",
    },
  ];

  const toggleLike = (id) => {
    setLikedTours((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  return (
    <>
      <section className={styles.tourListSection}>
        <SearchResults viewType={viewType} setViewType={setViewType} />

        <AnimatePresence mode="popLayout">
          {viewType === "grid" && (
            <motion.div
              className={styles.gridWrapper}
              key="grid"
              layout
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              transition={{ duration: 0.55, ease: "easeInOut" }}
            >
              {tourData.map((item, index) => (
                <div
                  key={item?.id || item?.api_hotel_id || item?.title || `hotel-grid-${index}`}
                  className={styles.gridCard}
                >
                  <div className={styles.gridCardImage}>
                    <img
                      className={styles.ListViewCardImage}
                      src="/hotelList/hotelCardImg.png"
                      alt=""
                    />
                    <div
                      className={`${styles.cardItemHeader} ${styles.ListViewCardHeader} ${styles.CardViewCardHeader}`}
                    >
                      <div className={styles.headerLeft}>
                        <div className={styles.new}>New</div>
                        <div className={styles.private}>Flagship</div>
                      </div>

                      <img
                        src={
                          likedTours.includes(item.id)
                            ? "/icons/heartIconFilled.svg"
                            : "/icons/heartIcon.svg"
                        }
                        alt="wishlist"
                        className={`${styles.heartIcon} ${styles.ListViewHeartIcon}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(item.id); // change icon
                          handleHeartClick(item.id); // open modal
                        }}
                      />
                    </div>
                  </div>
                  <div className={styles.gridCardText}>
                    <div className={styles.cartListTop}>
                      <div className={styles.ListViewCardTextTop}>
                        <div className={styles.topTextHead}>
                          <div className={styles.rating}>
                            {[...Array(5)].map((_, index) => (
                              <img
                                key={index}
                                src={
                                  index < rating
                                    ? "/icons/conicstar.svg"
                                    : "/icons/star-gray.svg"
                                }
                                alt="star"
                              />
                            ))}
                          </div>
                          <h2>{item.title}</h2>

                          <div className={styles.topTextHeadAddress}>
                            <img src="/icons/blackAddress.svg" alt="" />
                            <span>{item.route}</span>
                          </div>
                        </div>
                        <div className={styles.featuresCont}>
                          <div className={styles.featureItem}>
                            <img src="/icons/AirConditioning.svg" alt="" />
                            <p>Air conditioning</p>
                            <span></span>
                          </div>
                          <div className={styles.featureItem}>
                            <img src="/icons/Wifi.svg" alt="" />
                            <p>Wifi</p>
                            <span></span>
                          </div>
                          <div className={styles.featureItem}>
                            <img src="/icons/Kitchen.svg" alt="" />
                            <p>Kitchen</p>
                            <span></span>
                          </div>
                          <div className={styles.featureItem}>
                            <img src="/icons/Pool.svg" alt="" />
                            <p>Pool</p>
                            <span></span>
                          </div>
                          <div className={styles.featureItem}>
                            <img src="/icons/Mixer.svg" alt="mixer" />
                            <p>Mixer</p>
                          </div>
                        </div>
                        <ul className={styles.freeList}>
                          <li>
                            <div className={styles.tickCont}>
                              <img src="/icons/checkIcon.svg" alt="" />
                            </div>
                            Free Cancellation till 7 Jan 2022
                          </li>
                          <li>
                            <div className={styles.tickCont}>
                              <img src="/icons/checkIcon.svg" alt="" />
                            </div>
                            Free Breakfast
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className={styles.ListViewCardTextBottom}>
                      <div className={styles.priceContainer}>
                        <div className={styles.priceSec}>{item.price}</div>

                        <div className={styles.totalPrice}>
                          <span>1 night, 2 adults</span>
                        </div>
                      </div>

                      <button
                        className={styles.bookNowBtn}
                        onClick={handleBookNow}
                      >
                        SEE AVAILABILITY
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
            // </div>
          )}

          {viewType === "list" && (
            <motion.div
              className={styles.ListViewWrapper}
              key="list"
              layout
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              transition={{ duration: 0.55, ease: "easeInOut" }}
            >
              {tourData.map((item, index) => (
                <motion.div
                  className={styles.ListViewCardContainer}
                  key={item.id}
                  layoutId={index < 2 ? `card-${item.id}` : undefined}
                >
                  <div className={styles.ListViewCardImageContainer}>
                    <motion.img
                      layoutId={index < 2 ? `image-${item.id}` : undefined}
                      src={item.image}
                      alt={item.title}
                      className={styles.ListViewCardImage}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />

                    <div
                      className={`${styles.cardItemHeader} ${styles.ListViewCardHeader}`}
                    >
                      <div className={styles.headerLeft}>
                        <div className={styles.new}>New</div>
                        <div className={styles.private}>Flagship</div>
                      </div>

                      <img
                        src={
                          likedTours.includes(item.id)
                            ? "/icons/heartIconFilled.svg"
                            : "/icons/heartIcon.svg"
                        }
                        alt="wishlist"
                        className={styles.heartIcon}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(item.id); // change icon
                          handleHeartClick(item.id); // open modal
                        }}
                      />
                    </div>
                  </div>

                  <div className={styles.ListViewCardText}>
                    <div className={styles.cartListTop}>
                      <div className={styles.ListViewCardTextTop}>
                        <div className={styles.topTextHead}>
                          <div className={styles.rating}>
                            {[...Array(5)].map((_, index) => (
                              <img
                                key={index}
                                src={
                                  index < rating
                                    ? "/icons/conicstar.svg"
                                    : "/icons/star-gray.svg"
                                }
                                alt="star"
                              />
                            ))}
                          </div>
                          <h2>{item.title}</h2>

                          <div className={styles.topTextHeadAddress}>
                            <img src="/icons/blackAddress.svg" alt="" />
                            <span>{item.route}</span>
                          </div>
                        </div>
                        <div className={styles.featuresCont}>
                          <div className={styles.featureItem}>
                            <img src="/icons/AirConditioning.svg" alt="" />
                            <p>Air conditioning</p>
                            <span>•</span>
                          </div>
                          <div className={styles.featureItem}>
                            <img src="/icons/Wifi.svg" alt="" />
                            <p>Wifi</p>
                            <span>•</span>
                          </div>
                          <div className={styles.featureItem}>
                            <img src="/icons/Kitchen.svg" alt="" />
                            <p>Kitchen</p>
                            <span>•</span>
                          </div>
                          <div className={styles.featureItem}>
                            <img src="/icons/Pool.svg" alt="" />
                            <p>Pool</p>
                            <span>•</span>
                          </div>
                          <div className={styles.featureItem}>
                            <img src="" alt="" />
                            <p>Mixer</p>
                          </div>
                        </div>
                        <ul className={styles.freeList}>
                          <li>
                            <div className={styles.tickCont}>
                              <img src="/icons/checkIcon.svg" alt="" />
                            </div>
                            Free Cancellation till 7 Jan 2022
                          </li>
                          <li>
                            <div className={styles.tickCont}>
                              <img src="/icons/checkIcon.svg" alt="" />
                            </div>
                            Free Breakfast
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className={styles.ListViewCardTextBottom}>
                      <div className={styles.priceContainer}>
                        <div
                          className={`${styles.priceSec} ${styles.ListViewPriceSec}`}
                        >
                          {item.price}
                        </div>

                        <div
                          className={`${styles.totalPrice} ${styles.ListViewTotalPrice}`}
                        >
                          <span>1 night, 2 adults</span>
                        </div>
                      </div>

                      <button
                        className={`${styles.bookNowBtn} ${styles.ListViewBookNowBtn}`}
                        onClick={handleBookNow}
                      >
                        SEE AVAILABILITY
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      <section className={styles.tourListSectionMobileView}></section>

      <CreateWishlistModal
        isOpen={isCreateWishlistOpen}
        onClose={() => setIsCreateWishlistOpen(false)}
        onCreate={handleCreateWishlist}
        type="hotel"
        ids={[]}
      />

      <SaveToWishlistModal
        onCreateNew={() => setIsCreateWishlistOpen(true)}
        isOpen={isSaveWishlistOpen}
        wishlists={wishlists}
        onClose={() => setIsSaveWishlistOpen(false)}
      />
    </>
  );
};

export default TourListing;

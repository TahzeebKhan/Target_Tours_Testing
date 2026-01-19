"use client";
import React, { useEffect, useState } from "react";
import styles from "./TourListing.module.css";
import SearchResults from "../searchResult/SearchResults";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Pencil, SlidersHorizontal } from "lucide-react";
import MobileFilterWrapper from "../mobileFilterWrapper/MobileFilterWrapper";
import SortBySheet from "../sortBySheet/SortBySheet";
import PreferencesSection from "../preferencesSection/PreferencesSection";
import SelectDestination from "@/app/profile_components/selectDestination";
import SelectTravellerProfile from "@/app/profile_components/selectTravellerProfile";
import SelectPreferences from "@/app/profile_components/selectPreferences";
import axios from "axios";
import api from "@/lib/axios";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { fetchTours } from "@/app/service/tourPackage";




const TourListing = ({ filters, page, setPage }) => {
  const [likedTours, setLikedTours] = useState([]);
  const [viewType, setViewType] = useState("grid");
  const [expandedId, setExpandedId] = useState(null);
  const router = useRouter();
  const [activePreferenceView, setActivePreferenceView] = useState(null);
  const [openFilter, setOpenFilter] = useState(false);
  const [openSortByFilter, setOpenSortByFilter] = useState(false);
  const [openPreferencesFilter, setOpenPreferencesFilter] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);



  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
  } = useInfiniteQuery({
    queryKey: ["tours", { filters }],
    queryFn: fetchTours,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 10,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.meta?.pagination;
      if (!pagination) return undefined;

      const { page, pageCount } = pagination;
      return page < pageCount ? page + 1 : undefined;
    },
  });


  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 184) {
        setShowStickyHeader(true);   // 👈 scroll ke baad show
      } else {
        setShowStickyHeader(false);  // 👈 top par hide
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBookNow = () => {
    router.push("/tour-details"); // 👈 your page route
  };
  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

 
  const tourDataFallback = [
    {
      id: 1,
      image: "/tourList/cardItem1.jpg",
      route: "TORONTO TO OTTAWA",
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
      route: "VANCOUVER TO CALGARY",
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
        : [...prev, id]
    );
  };


  const tourData =
    data?.pages.flatMap((page) => page.data) || tourDataFallback;
  const meta = data?.meta;
  console.log("TourData:", JSON.stringify(tourData, null, 2));

  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);


   const truncateText = (text = "", maxLength = 29) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };


  return (
    <>
      <section className={styles.tourListSection}>
        <SearchResults viewType={viewType} setViewType={setViewType} />

        <AnimatePresence mode="popLayout">
          {viewType === "grid" && (
            <motion.div
              className={styles.cardContainer}
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {tourData.map((item, index) => (
                <motion.div
                  className={styles.card}
                  onClick={handleBookNow}
                  key={item.id}
                  layoutId={index < 2 ? `card-${item.id}` : undefined}
                >
                  <motion.img
                    layoutId={index < 2 ? `image-${item.id}` : undefined}
                    className={styles.itemImage}
                    src={item.image}
                    alt={item.title}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />

                  <div className={styles.cardItems}>
                    <div className={styles.cardItemHeader}>
                      <div className={styles.headerLeft}>
                        <div className={styles.new}>New</div>
                        <div className={styles.private}>Private Tour</div>
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
                          toggleLike(item.id)
                        }
                        }
                      />
                    </div>

                    <div className={styles.cardItemCenterTextContainer}>
                      <div className={styles.cardItemCenterText}>
                        <p className={styles.cardItemCenterTextPara}>
                          {item.route}
                        </p>
                        <h4 className={styles.cardItemCenterTextHeading}>
                          {truncateText(item.title, 31)}
                        </h4>
                      </div>

                      <div className={styles.cardFooter}>
                        <div className={styles.infoRow}>
                          <span>{item.days}</span>
                          <span>{item.meals}</span>
                        </div>

                        <div className={styles.infoRow}>
                          <span>{item.hotel}</span>
                          <span>{item.activities}</span>
                        </div>

                        <div className={styles.bottomRow}>
                          <div className={styles.price}>
                            FROM <strong>{item.price}</strong> <span>/ PERSON</span>
                          </div>

                          <button
                            className={styles.viewDetails}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(item.id)
                            }}
                          >
                            VIEW DETAILS
                            <img
                              src="/icons/smallDropArrow.svg"
                              alt=""
                              style={{
                                transform: expandedId === item.id ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "0.3s",
                              }}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedId === item.id && (
                      <motion.div
                        className={styles.expandableContainer}
                        initial={{ height: 0, opacity: 0, y: 0 }}
                        animate={{ height: "auto", opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                      >
                        <div className={styles.expandableContent}>
                          <div className={styles.expandableTopContainer}>
                            <div className={styles.expandableTop}>
                              <h3 className={styles.expandableTopHeading}>Package Inclusions</h3>
                              {item?.package_inclusions?.map((inclusion, index) => (
                                <ul className={styles.list}>
                                  <li>{inclusion.title}</li>
                                </ul>
                              ))}
                            </div>
                            <div className={styles.expandableCenter}>
                              <div className={styles.expandableRow}>
                                <div className={styles.expandableItem}>
                                  <img src="/icons/checkIcon.svg" alt="" />
                                  <span>Banff Gondola Ride</span>
                                </div>
                                <div className={styles.expandableItem}>
                                  <img src="/icons/checkIcon.svg" alt="" />
                                  <span>Lake Louise Scenic Walk</span>
                                </div>
                              </div>
                              <div className={styles.expandableRow}>
                                <div className={styles.expandableItem}>
                                  <img src="/icons/checkIcon.svg" alt="" />
                                  <span>Lake Louise Scenic Walk</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className={styles.hr}></div>
                          <div className={styles.expandableFooter}>
                            <div className={styles.expandableFooterText}>Total <span>{item.price}</span></div>
                            <button className={styles.bookNow} onClick={handleBookNow}>BOOK NOW</button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}

          {viewType === "list" && (
            <motion.div
              className={styles.ListViewWrapper}
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
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

                    <div className={`${styles.cardItemHeader} ${styles.ListViewCardHeader}`}>
                      <div className={styles.headerLeft}>
                        <div className={styles.new}>New</div>
                        <div className={styles.private}>Private Tour</div>
                      </div>

                      <img
                        src={
                          likedTours.includes(item.id)
                            ? "/icons/heartIconFilled.svg"
                            : "/icons/heartIcon.svg"
                        }
                        alt="wishlist"
                        className={styles.heartIcon}
                        onClick={() => toggleLike(item.id)}
                      />
                    </div>
                  </div>

                  <motion.div
                    className={styles.ListViewCardText}
                    initial={index === 0 ? { clipPath: "inset(0 100% 0 0)" } : undefined}
                    animate={index === 0 ? { clipPath: "inset(0 0% 0 0)" } : undefined}
                    exit={index === 0 ? { clipPath: "inset(0 100% 0 0)" } : undefined}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <div className={styles.cartListTop}>
                      <div className={styles.ListViewCardTextTop}>
                        <div className={styles.topTextHead}>
                          <h2>{item.title}</h2>

                          <div className={styles.topTextHeadAddress}>
                            <img src="/icons/blackAddress.svg" alt="" />
                            <span>{item.route}</span>
                          </div>
                        </div>

                        <div className={styles.tagsContainer}>
                          <div className={styles.tag}>Round Trip Flights</div>
                          <div className={styles.tag}>4 Star Hotels</div>
                          <div className={styles.tag}>Airport Transfers</div>
                          <div className={styles.tag}>Intercity Car Transfers</div>
                        </div>

                        <div className={styles.ListViewCardTextTopBottom}>
                          <div className={styles.bottomItem}>
                            <img src="/icons/checkIcon.svg" alt="" />
                            Banff Gondola Ride
                          </div>
                          <div className={styles.bottomItem}>
                            <img src="/icons/checkIcon.svg" alt="" />
                            Lake Louise Scenic Walk
                          </div>
                          <div className={styles.bottomItem}>
                            <img src="/icons/checkIcon.svg" alt="" />
                            Icefields Parkway Glacier Tour
                          </div>
                        </div>
                      </div>

                      <div className={styles.infoGrid}>
                        <div className={styles.infoRowGrid}>
                          <div className={styles.infoItem}>{item.days}</div>
                          <div className={styles.infoItem}>{item.meals}</div>
                        </div>

                        <div className={styles.infoRowGrid}>
                          <div className={styles.infoItem}>{item.hotel}</div>
                          <div className={styles.infoItem}>{item.activities}</div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.ListViewCardTextBottom}>
                      <div className={styles.priceContainer}>
                        <div className={styles.priceSec}>
                          {item.price}
                          <span>/PERSON</span>
                        </div>

                        <div className={styles.totalPrice}>
                          Total Price
                          <span>₹ 1,66,945</span>
                        </div>
                      </div>

                      <button className={styles.bookNowBtn} onClick={handleBookNow}>BOOK NOW</button>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      <section className={styles.tourListMobileSection}>

        <div
          className={`${styles.tripDetailsHeader} 
              ${showStickyHeader ? styles.stickyVisible : styles.stickyHidden}`}
        >
          <div className={styles.mainCotainer}>
            <img src="/icons/leftArrowTrip.svg" alt="" />
            <div
              className={`${styles.TripCardHeader} ${styles.TripCardHeaderNav}`}
            >
              <div className={styles.TripCardHeaderDetails}>
                <p className={styles.TripCardHeaderDetailsItemText}>New Delhi</p>
                {/* <span className={styles.TripCardHeaderDetailsItemCode}>
                (DEL)
              </span> */}

                {/* <img src="/icons/right-arrow.svg" alt="" /> */}
                <div className={styles.minDash}>-</div>
                <p className={styles.TripCardHeaderDetailsItemText}>Goa</p>
              </div>

              <div className={styles.TripCardHeaderBookingDate}>
                <p>Wed, 03 Dec</p>
                <p>
                  <div className={styles.navDot}></div>1 Traveller
                </p>
                <p>
                  <div className={styles.navDot}></div>Economy
                </p>
              </div>
            </div>
          </div>
          <Pencil className={styles.editIcon} color="#FFFFFF" size={16} />
        </div>

        <div className={styles.tourListMobileWrapper}>
          <div className={styles.filterContainer}>
            <button className={styles.filterCard} onClick={() => setOpenSortByFilter(true)}>
              Sort by
            </button>
            {openSortByFilter && (
              <SortBySheet
                open={openSortByFilter}
                setOpen={setOpenSortByFilter}
              />
            )}
            <button className={styles.filterCard} onClick={() => setOpenFilter(true)}>
              FILTERS
              <img src="/icons/filterIcon.svg" alt="" />
            </button>
            {openFilter && (
              <MobileFilterWrapper
                open={openFilter}
                setOpen={setOpenFilter}
              />
            )}
            <button className={styles.filterCard} onClick={() => setOpenPreferencesFilter(true)}>

              PREFERENCES
            </button>
            {openPreferencesFilter && (
              <PreferencesSection
                onClose={() => setOpenPreferencesFilter(false)}
                onSelect={(view) => {
                  setOpenPreferencesFilter(false);
                  setActivePreferenceView(view);
                }}
              />
            )}
          </div>

          <div
            className={`${styles.ListViewWrapper} ${styles.ListViewWrapperMobile}`}

          >
            {tourData.map((item, index) => (
              <div
                className={`${styles.ListViewCardContainer} ${styles.ListViewCardContainerMobile}`}
                key={item.id}
              >
                <div className={`${styles.ListViewCardImageContainer}  ${styles.ListViewCardImageContainerMobile}`}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className={styles.ListViewCardImage}
                  />

                  <div className={`${styles.cardItemHeader} ${styles.ListViewCardHeader}`}>
                    <div className={styles.headerLeft}>
                      <div className={styles.new}>New</div>
                      <div className={styles.private}>Private Tour</div>
                    </div>

                    <img
                      src={
                        likedTours.includes(item.id)
                          ? "/icons/heartIconFilled.svg"
                          : "/icons/heartIcon.svg"
                      }
                      alt="wishlist"
                      className={styles.heartIcon}
                      onClick={() => toggleLike(item.id)}
                    />
                  </div>
                </div>

                <motion.div
                  className={`${styles.ListViewCardTextMobile}`}
                  initial={index === 0 ? { clipPath: "inset(0 100% 0 0)" } : undefined}
                  animate={index === 0 ? { clipPath: "inset(0 0% 0 0)" } : undefined}
                  exit={index === 0 ? { clipPath: "inset(0 100% 0 0)" } : undefined}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <div className={styles.cartListTop}>
                    <div className={`${styles.ListViewCardTextTopMobile} `}>
                      <div className={styles.topTextHead}>
                        <h2>{item.title}</h2>

                        <div className={styles.topTextHeadAddress}>
                          <img src="/icons/blackAddress.svg" alt="" />
                          <span>{item.route}</span>
                        </div>
                      </div>

                      <div className={styles.tagsContainerMobile}>
                        <div className={styles.tag}>Round Trip Flights</div>
                        <div className={styles.tag}>4 Star Hotels</div>
                        <div className={styles.tag}>Airport Transfers</div>
                        <div className={styles.tag}>Intercity Car Transfers</div>
                      </div>

                      <div className={styles.ListViewCardTextTopBottomMobile}>
                        <div className={styles.bottomItem}>
                          <img src="/icons/checkIcon.svg" alt="" />
                          Banff Gondola Ride
                        </div>
                        <div className={styles.bottomItem}>
                          <img src="/icons/checkIcon.svg" alt="" />
                          Lake Louise Scenic Walk
                        </div>
                        <div className={styles.bottomItem}>
                          <img src="/icons/checkIcon.svg" alt="" />
                          Icefields Parkway Glacier Tour
                        </div>
                      </div>
                    </div>

                    <div className={styles.infoGrid}>
                      <div className={styles.infoRowGrid}>
                        <div className={styles.infoItem}>{item.days}</div>
                        <div className={styles.infoItem}>{item.meals}</div>
                      </div>

                      <div className={styles.infoRowGrid}>
                        <div className={styles.infoItem}>{item.hotel}</div>
                        <div className={styles.infoItem}>{item.activities}</div>
                      </div>
                    </div>
                  </div>

                  <div className={`${styles.ListViewCardTextBottom} ${styles.ListViewCardTextBottomMobile}`}>
                    <div className={styles.priceContainer}>
                      <div className={`${styles.priceSec} ${styles.mobilePrice}`}>
                        {item.price}
                        <span>/PERSON</span>
                      </div>

                      <div className={styles.totalPrice}>
                        Total Price
                        <span>₹1,66,945</span>
                      </div>
                    </div>

                    <button className={styles.bookNowBtn} onClick={handleBookNow}>BOOK NOW</button>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {activePreferenceView === "DESTINATIONS" && (
          <SelectDestination onClose={() => setActivePreferenceView(null)} />
        )}

        {activePreferenceView === "TRAVELLER" && (
          <SelectTravellerProfile onClose={() => setActivePreferenceView(null)} />
        )}

        {activePreferenceView === "PREFERENCES" && (
          <SelectPreferences onClose={() => setActivePreferenceView(null)} />
        )}
      </section>
    </>
  );
};

export default TourListing;

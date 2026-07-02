"use client";
import "swiper/css";
import "swiper/css/navigation";
import React, { useRef, useState } from "react";
import styles from "./AvailabilityComponent.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronDown } from "lucide-react";

const ratingToStars = {
  excellent: 5,
  good: 4,
  average: 3,
  poor: 2,
  terrible: 1,
};

const getRatingScore = (rating = {}) => {
  const ratingLabel = String(rating.label || "").trim().toLowerCase();
  return ratingToStars[ratingLabel] || rating.score || "";
};

const getRoomUnitCount = (room = {}) =>
  Math.max(1, Number(room.roomUnits || room.comboRoomCount || 1));

const getTrimmedText = (text = "", limit = 16) => {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);

  if (words.length <= limit) return text;

  return `${words.slice(0, limit).join(" ")}...`;
};

const getImageSrc = (image = {}) => {
  if (!image) return "";
  if (typeof image === "string") return image;

  return image.img || image.image || image.url || image.src || "";
};

const getImageList = (...imageGroups) =>
  imageGroups
    .flatMap((group) => (Array.isArray(group) ? group : [group]))
    .map((image) => ({ img: getImageSrc(image) }))
    .filter((image) => image.img);

const getComboHeaderTitle = (comboRoom = {}, comboDetailRows = []) => {
  const detailTitles = comboDetailRows
    .map((detailRoom) => String(detailRoom.title || "").trim())
    .filter(Boolean);
  const uniqueDetailTitles = [...new Set(detailTitles)];

  if (!uniqueDetailTitles.length) return comboRoom.title;

  return `${comboRoom.title} - ${uniqueDetailTitles.join(" + ")}`;
};

const AvailabilitySkeleton = () => (
  <div className={styles.skeletonList} aria-label="Loading available rooms">
    {[0, 1].map((item) => (
      <div key={item} className={`${styles.CardSection} ${styles.skeletonCard}`}>
        <div className={`${styles.imagesNestedCarousel} ${styles.skeletonImage}`}></div>

        <div className={styles.skeletonDetails}>
          <div className={styles.skeletonLeft}>
            <span className={`${styles.skeletonLine} ${styles.skeletonTitle}`}></span>
            <span className={`${styles.skeletonLine} ${styles.skeletonMeta}`}></span>
            <div className={styles.skeletonFeatureGrid}>
              <span className={styles.skeletonLine}></span>
              <span className={styles.skeletonLine}></span>
              <span className={styles.skeletonLine}></span>
              <span className={styles.skeletonLine}></span>
            </div>
            <span className={`${styles.skeletonLine} ${styles.skeletonBenefit}`}></span>
          </div>

          <div className={styles.br}></div>

          <div className={styles.skeletonRight}>
            <span className={`${styles.skeletonLine} ${styles.skeletonRating}`}></span>
            <span className={`${styles.skeletonLine} ${styles.skeletonPrice}`}></span>
            <span className={`${styles.skeletonLine} ${styles.skeletonTax}`}></span>
            <span className={`${styles.skeletonLine} ${styles.skeletonButton}`}></span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const AvailabilityComponent = ({
  rooms = [],
  loading = false,
  errorMessage = "",
  actionDisabled = false,
  roomQuantities = {},
  maxSelectableRooms = Infinity,
  onRoomQuantityChange,
}) => {
  const swiperRefs = useRef({});
  const [roomQty, setRoomQty] = useState({});
  const [expandedFeatureRooms, setExpandedFeatureRooms] = useState({});
  const [expandedComboRooms, setExpandedComboRooms] = useState({});

  const roomUnitMap = rooms.reduce((unitMap, room) => {
    unitMap[room.id] = getRoomUnitCount(room);
    return unitMap;
  }, {});
  const getSelectedUnitTotal = (quantityMap) =>
    Object.entries(quantityMap).reduce(
      (total, [roomId, quantity]) =>
        total + Number(quantity || 0) * (roomUnitMap[roomId] || 1),
      0,
    );
  const comboRooms = rooms.filter((room) => Boolean(room.isCombo));
  const firstComboRoomId = comboRooms[0]?.id || "";

  const toggleFeatureExpansion = (roomId) => {
    if (actionDisabled) return;

    setExpandedFeatureRooms((prev) => ({
      ...prev,
      [roomId]: !prev[roomId],
    }));
  };

  const toggleComboExpansion = (roomId) => {
    if (actionDisabled) return;

    setExpandedComboRooms((prev) => ({
      ...prev,
      [roomId]: !prev[roomId],
    }));
  };

  const increase = (id, maxQty = Infinity, unitCount = 1) => {
    if (actionDisabled) return;

    const currentQtyMap = Object.keys(roomQuantities).length
      ? roomQuantities
      : roomQty;
    const currentQty = Number(currentQtyMap[id] || 0);
    const selectedRoomTotal = getSelectedUnitTotal(currentQtyMap);
    const selectedOtherTotal = selectedRoomTotal - currentQty * unitCount;
    const allowedByRoomLimit = Math.floor(
      Math.max(0, maxSelectableRooms - selectedOtherTotal) / unitCount,
    );

    if (allowedByRoomLimit <= currentQty) return;

    const nextQty = Math.min(currentQty + 1, maxQty, allowedByRoomLimit);

    setRoomQty((prev) => ({
      ...prev,
      [id]: nextQty,
    }));
    onRoomQuantityChange?.(id, nextQty);
  };

  const decrease = (id) => {
    if (actionDisabled) return;

    const currentQtyMap = Object.keys(roomQuantities).length
      ? roomQuantities
      : roomQty;
    const nextQty = (currentQtyMap[id] || 0) - 1;

    setRoomQty((prev) => {
      if (nextQty <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }

      return { ...prev, [id]: nextQty };
    });
    onRoomQuantityChange?.(id, Math.max(nextQty, 0));
  };
  const handleAddRoom = (id, maxQty, unitCount = 1) => {
    if (actionDisabled) return;
    increase(id, maxQty, unitCount);
  };

  return (
    <div className={styles.availabilitySection}>
      <h3 className={styles.heading}>Availability</h3>

      {loading && <AvailabilitySkeleton />}

      {!loading && !rooms.length && (
        <p className={errorMessage ? styles.errorText : styles.statusText}>
          {errorMessage || "No available rooms found."}
        </p>
      )}

      {!loading && rooms.map((room) => {
        const roomImages = Array.isArray(room.image) ? room.image : [];
        const features = Array.isArray(room.featuresLeft) ? room.featuresLeft : [];
        const benefits = Array.isArray(room.benefits) ? room.benefits : [];
        const isCombo = Boolean(room.isCombo);
        const roomUnitCount = getRoomUnitCount(room);
        const maxQty = isCombo ? 1 : Math.max(0, Number(room.availability) || 0);
        const qty = roomQuantities[room.id] ?? roomQty[room.id] ?? 0;
        const quantityMap = Object.keys(roomQuantities).length ? roomQuantities : roomQty;
        const selectedRoomTotal = getSelectedUnitTotal(quantityMap);
        const selectedOtherTotal = selectedRoomTotal - Number(qty || 0) * roomUnitCount;
        const remainingUnits = Math.max(0, maxSelectableRooms - selectedOtherTotal);
        const hasReachedRoomLimit = remainingUnits < roomUnitCount;
        const isFeatureExpanded = Boolean(expandedFeatureRooms[room.id]);
        const visibleFeatures = features.slice(
          0,
          isFeatureExpanded ? features.length : 10,
        );

        if (isCombo && room.id !== firstComboRoomId) {
          return null;
        }

        if (isCombo) {
          return (
            <div key="combo-room-list" className={styles.comboSection}>
              {comboRooms.map((comboRoom, comboIndex) => {
                const comboQty = roomQuantities[comboRoom.id] ?? roomQty[comboRoom.id] ?? 0;
                const comboUnitCount = getRoomUnitCount(comboRoom);
                const comboSelectedOtherTotal =
                  selectedRoomTotal - Number(comboQty || 0) * comboUnitCount;
                const comboLimitReached =
                  Math.max(0, maxSelectableRooms - comboSelectedOtherTotal) < comboUnitCount;
                const isExpanded = expandedComboRooms[comboRoom.id] ?? comboIndex === 0;
                const comboDetailRows = Array.isArray(comboRoom.comboRooms)
                  ? comboRoom.comboRooms
                  : [];
                const comboImages = Array.isArray(comboRoom.image) ? comboRoom.image : [];
                const comboHeaderTitle = getComboHeaderTitle(comboRoom, comboDetailRows);

                return (
                  <div key={comboRoom.id} className={styles.comboOfferCard}>
                    <div className={styles.comboOfferSummary}>
                      <h3 className={styles.comboOfferTitle}>{comboHeaderTitle}</h3>

                      <div className={styles.comboOfferActions}>
                        <div className={styles.comboOfferPrice}>
                          <div className={styles.price}>
                            <span className={styles.actualPrice}>
                              {comboRoom.price.actual}
                            </span>
                            <span className={styles.offerPrice}>
                              {comboRoom.price.offer}
                            </span>
                          </div>
                          <span className={styles.comboOfferTaxes}>
                            {comboRoom.price.taxes} {comboRoom.price.nights}
                          </span>
                        </div>

                        <button
                          className={styles.comboSelectBtn}
                          disabled={actionDisabled || comboQty <= 0 && comboLimitReached}
                          onClick={() => handleAddRoom(comboRoom.id, 1, comboUnitCount)}
                        >
                          {comboQty > 0 ? "Selected Combo" : "Select Combo"}
                        </button>

                        <button
                          type="button"
                          className={`${styles.comboToggleBtn} ${
                            isExpanded ? styles.comboToggleOpen : ""
                          }`}
                          disabled={actionDisabled}
                          onClick={() => toggleComboExpansion(comboRoom.id)}
                          aria-label={isExpanded ? "Hide combo details" : "Show combo details"}
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className={styles.comboOfferDetails}>
                        {comboDetailRows.map((detailRoom, detailIndex) => {
                          const detailRoomImages = getImageList(detailRoom.image);
                          const detailImages = detailRoomImages.length
                            ? detailRoomImages
                            : getImageList(comboImages);
                          const detailFeatures = Array.isArray(detailRoom.featuresLeft)
                            ? detailRoom.featuresLeft.slice(0, 6)
                            : [];
                          const detailBenefits = Array.isArray(detailRoom.benefits)
                            ? detailRoom.benefits.slice(0, 4)
                            : [];

                          return (
                            <div
                              key={detailRoom.id || `${comboRoom.id}-${detailIndex}`}
                              className={styles.comboInlineRoom}
                            >
                              <div
                                className={styles.comboInlineImage}
                                style={{ position: "relative" }}
                              >
                                {detailImages.length ? (
                                  <>
                                    <Swiper
                                      modules={[Navigation]}
                                      onSwiper={(swiper) => {
                                        swiperRefs.current[
                                          `${comboRoom.id}-${detailIndex}`
                                        ] = swiper;
                                      }}
                                      slidesPerView={1}
                                      style={{ height: "100%" }}
                                    >
                                      {detailImages.map((item, imageIndex) => (
                                        <SwiperSlide
                                          key={`${comboRoom.id}-${detailIndex}-image-${imageIndex}`}
                                          className={styles.slide}
                                          style={{ height: "100%" }}
                                        >
                                          <img src={item.img} alt="" />
                                        </SwiperSlide>
                                      ))}
                                    </Swiper>

                                    {detailImages.length > 1 && (
                                      <div className={styles.btns}>
                                        <button
                                          className={styles.leftBtn}
                                          disabled={actionDisabled}
                                          onClick={() =>
                                            swiperRefs.current[
                                              `${comboRoom.id}-${detailIndex}`
                                            ]?.slidePrev()
                                          }
                                        >
                                          <img src="/icons/left.svg" alt="" />
                                        </button>

                                        <button
                                          className={styles.rightBtn}
                                          disabled={actionDisabled}
                                          onClick={() =>
                                            swiperRefs.current[
                                              `${comboRoom.id}-${detailIndex}`
                                            ]?.slideNext()
                                          }
                                        >
                                          <img src="/icons/right.svg" alt="" />
                                        </button>
                                      </div>
                                    )}
                                  </>
                                ) : null}
                              </div>

                              <div className={styles.comboInlineContent}>
                                <h4>{detailRoom.title}</h4>
                                <div className={styles.comboInlineMeta}>
                                  <span>{detailRoom.beds}</span>
                                  <span>{detailRoom.persons}</span>
                                </div>

                                <ul className={styles.comboFeatureList}>
                                  {detailFeatures.map((item, idx) => (
                                    <li key={idx}>
                                      <img src={item.icon} alt="" />
                                      <span>{getTrimmedText(item.text)}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className={styles.comboInlinePerks}>
                                <ul>
                                  {detailBenefits.slice(0, 3).map((benefit, idx) => (
                                    <li key={idx}>
                                      <span>•</span>
                                      <span>{getTrimmedText(benefit, 18)}</span>
                                    </li>
                                  ))}
                                </ul>

                                <div className={styles.comboFooter}>
                                  <div className={styles.comboCancellation}>
                                    <img src="/icons/hotelCheck.svg" alt="" />
                                    <span>{comboRoom.cancellation}</span>
                                    </div>

                                  <button
                                    type="button"
                                    className={styles.moreDetailsBtn}
                                    disabled={actionDisabled}
                                  >
                                    More Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        }

        return (
          <div key={room.id} className={styles.CardSection}>
            <div className={styles.imagesNestedCarousel}>
              <Swiper
                modules={[Navigation]}
                onSwiper={(swiper) => {
                  swiperRefs.current[room.id] = swiper;
                }}
                slidesPerView={1}
              >
                {roomImages.map((item, index) => (
                  <SwiperSlide key={`${room.id}-image-${index}`} className={styles.slide}>
                    <img key={index} src={item.img} alt="" />
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className={styles.btns}>
                <button
                  className={styles.leftBtn}
                  disabled={actionDisabled}
                  onClick={() => swiperRefs.current[room.id]?.slidePrev()}
                >
                  <img src="/icons/left.svg" alt="" />
                </button>

                <button
                  className={styles.rightBtn}
                  disabled={actionDisabled}
                  onClick={() => swiperRefs.current[room.id]?.slideNext()}
                >
                  <img src="/icons/right.svg" alt="" />
                </button>
              </div>
            </div>

            <div className={styles.cardDetails}>
              {/* LEFT */}
              <div className={styles.cardDetailLeft}>
                <div className={styles.hotelHeadCont}>
                  <h3 className={styles.hotelTitle}>{room.title}</h3>

                  <div className={styles.bedMainCont}>
                    <div className={styles.bedCount}>
                      <img src="/icons/bedIcon.svg" alt="" />
                      <span>{room.beds}</span>
                      <span>X</span>
                    </div>
                    <span className={styles.persons}>{room.persons}</span>
                  </div>
                </div>

                {/* FEATURES */}
                <div className={styles.featureSec}>
                  {features.length ? (
                    <>
                      <ul className={styles.featureList}>
                        {visibleFeatures.map((item, idx) => (
                          <li key={idx}>
                            <div className={styles.iconCont}>
                              <img src={item.icon} alt="" />
                            </div>
                            {item.text}
                          </li>
                        ))}
                        {features.length > 10 && (
                        <button
                          className={styles.showMoreBtn}
                          disabled={actionDisabled}
                          onClick={() => toggleFeatureExpansion(room.id)}
                        >
                          {isFeatureExpanded ? "...Show Less" : "...Show More"}
                        </button>
                      )}
                      </ul>

                      
                    </>
                  ) : (
                    <p className={styles.statusText}>No facilities available</p>
                  )}
                </div>

                {/* BENEFITS */}
                <div className={styles.benefitsSec}>
                  <ul className={styles.benefitsList}>
                  <ul className={styles.benefitsList}>
  {benefits.slice(0, 3).map((benefit, idx) => {
    const shortText = benefit.length > 50 
      ? benefit.slice(0, 50) + '...more' 
      : benefit;
      
    return <li key={idx}>{shortText}</li>;
  })}
</ul>
                  </ul>
                </div>

                {/* ACTIONS */}
                <div className={styles.btnContainer}>
                  <div className={styles.CalcellCont}>
                    <div className={styles.blueTickCont}>
                      <img src="/icons/bluetick.svg" alt="" />
                    </div>
                    <span>{room.cancellation}</span>
                  </div>

                  <div className={styles.btnCont}>
                    <button
                      className={styles.moreDetailsBtn}
                      disabled={actionDisabled}
                    >
                      More Details
                    </button>
                  </div>
                </div>
              </div>

            

              {/* RIGHT */}
              < div className={styles.brParent}>
                 <div className={styles.br}></div>
              <div className={styles.cardDetailRight}>
                 
                <div className={styles.cardRightTop}>
                  <div className={styles.ExcellentCont}>
                    <div className={styles.ExcellentText}>
                      <span className={styles.Excellent}>
                        {room.rating.label}
                      </span>
                      <span className={styles.reviews}>
                        {room.rating.reviews}
                      </span>
                    </div>
                    <div className={styles.ratting}>
                      {getRatingScore(room.rating)}
                    </div>
                  </div>

                  <div className={styles.priceContainer}>
                    <div className={styles.price}>
                      <span className={styles.actualPrice}>
                        {room.price.actual}
                      </span>
                      <span className={styles.offerPrice}>
                        {room.price.offer}
                      </span>
                    </div>
                    <span className={styles.perNight}>{room.price.nights}</span>
                    <span className={styles.taxesPrice}>
                      {room.price.taxes}
                    </span>
                  </div>
                </div>

                <div className={styles.bookroomContainer}>
                  <div className={styles.BookAmoutn}>
                    Book with <span>{room.price.bookWith}</span>
                  </div>

                  <button
                    className={`${styles.addRoomBtn} ${
                      qty > 0 ? styles.fadeOut : styles.fadeIn
                    }`}
                    disabled={actionDisabled || maxQty <= 0 || hasReachedRoomLimit}
                    onClick={() => handleAddRoom(room.id, maxQty, roomUnitCount)}
                  >
                    ADD ROOM
                  </button>

                  <div
                    className={`${styles.counter} ${
                      qty > 0 ? styles.fadeIn : styles.fadeOut
                    }`}
                  >
                    <button
                      className={styles.btn}
                      disabled={actionDisabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        decrease(room.id);
                      }}
                    >
                      <svg
                        width="11"
                        height="2"
                        viewBox="0 0 11 2"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.75 1.49995C0.5375 1.49995 0.359375 1.42805 0.215625 1.28425C0.071875 1.14043 0 0.962233 0 0.74965C0 0.53705 0.071875 0.358958 0.215625 0.215375C0.359375 0.0717914 0.5375 0 0.75 0H10.25C10.4625 0 10.6406 0.0718998 10.7843 0.2157C10.9281 0.359516 11 0.537717 11 0.7503C11 0.9629 10.9281 1.14099 10.7843 1.28457C10.6406 1.42816 10.4625 1.49995 10.25 1.49995H0.75Z"
                          fill="#000033"
                        />
                      </svg>
                    </button>
                    <span className={styles.count}>{qty}</span>
                    <button
                      className={styles.btn}
                      disabled={actionDisabled || qty >= maxQty || hasReachedRoomLimit}
                      onClick={(e) => {
                        e.stopPropagation();
                        increase(room.id, maxQty, roomUnitCount);
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 13 13"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5.75 7.24995H0.75C0.5375 7.24995 0.359375 7.17805 0.215625 7.03425C0.071875 6.89043 0 6.71223 0 6.49965C0 6.28705 0.071875 6.10896 0.215625 5.96538C0.359375 5.82179 0.5375 5.75 0.75 5.75H5.75V0.75C5.75 0.5375 5.8219 0.359375 5.9657 0.215625C6.10952 0.071875 6.28772 0 6.5003 0C6.7129 0 6.89099 0.071875 7.03457 0.215625C7.17816 0.359375 7.24995 0.5375 7.24995 0.75V5.75H12.25C12.4625 5.75 12.6406 5.8219 12.7843 5.9657C12.9281 6.10952 13 6.28772 13 6.5003C13 6.7129 12.9281 6.89099 12.7843 7.03458C12.6406 7.17816 12.4625 7.24995 12.25 7.24995H7.24995V12.25C7.24995 12.4625 7.17805 12.6406 7.03425 12.7843C6.89043 12.9281 6.71223 13 6.49965C6.28705 13 6.10896 12.9281 5.96537 12.7843C5.82179 12.6406 5.75 12.4625 5.75 12.25V7.24995Z"
                          fill="#000033"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AvailabilityComponent;

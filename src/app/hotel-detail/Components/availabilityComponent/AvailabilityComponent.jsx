"use client";
import "swiper/css";
import "swiper/css/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./AvailabilityComponent.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Check, ChevronDown, X } from "lucide-react";
import { useBodyScrollLock } from "@/shared/hooks/useBodyScrollLock";

const ratingToStars = {
  excellent: 5,
  good: 4,
  average: 3,
  poor: 2,
  terrible: 1,
};

// Inverse map to find text from a numeric score
const starsToRatingLabel = {
  5: "Excellent",
  4: "Good",
  3: "Average",
  2: "Poor",
  1: "Terrible",
};

// 1. Get the numeric score safely
export const getRatingScore = (rating = {}) => {
  if (rating?.score !== undefined && rating?.score !== null && rating?.score !== "") {
    return Number(rating.score);
  }
  const ratingLabel = String(rating?.label || "").trim().toLowerCase();
  return ratingToStars[ratingLabel] || "";
};

// 2. Get the clean UI text label dynamically
export const getRatingLabel = (rating = {}) => {
  const score = getRatingScore(rating);
  
  // Return matched label (e.g. 3 -> "Average"), fallback to original label, or empty string
  return starsToRatingLabel[score] || rating?.label || "";
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

const ROOM_CARD_ESTIMATED_HEIGHT = 343;
const VIRTUAL_OVERSCAN_COUNT = 4;

const toArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatPolicyValue = (rule = {}) => {
  if (!rule || (rule.value == null && rule.estimatedValue == null)) return "N/A";

  const value = Number(rule.value ?? rule.estimatedValue);
  const valueType = String(rule.valueType || "").toLowerCase();

  if (!Number.isFinite(value)) return "N/A";
  if (valueType === "percentage") return `${value}%`;
  if (valueType === "amount") return `₹ ${value.toLocaleString("en-IN")}`;
  if (value > 0) return String(value);

  return "Free";
};

const getPolicyStatus = (rule) => {
  if (!rule || (rule.value == null && rule.estimatedValue == null)) return "unknown";

  const value = Number(rule.value ?? rule.estimatedValue);
  if (!Number.isFinite(value)) return "unknown";

  return value > 0 ? "charge" : "free";
};

const getCancellationPolicyRows = (room = {}) =>
  toArray(room?.cancellationPolicies).flatMap((policy, policyIndex) => {
    const rules = toArray(policy?.rules);

    if (!rules.length) {
      return [
        {
          id: `${policyIndex}-empty`,
          title: policy?.text || "Cancellation policy",
          value: "N/A",
          start: "N/A",
          end: "N/A",
          status: "unknown",
        },
      ];
    }

    return rules.map((rule, ruleIndex) => ({
      id: `${policyIndex}-${ruleIndex}`,
      title: policy?.text || "Cancellation policy",
      value: formatPolicyValue(rule),
      start: formatDateTime(rule?.start) || "N/A",
      end: formatDateTime(rule?.end) || "N/A",
      status: getPolicyStatus(rule),
    }));
  });

const getInclusionRows = (room = {}) =>
  toArray(room?.includes)
    .map((item) => String(item || "").trim())
    .filter(Boolean);

const getRoomInfoRows = (room = {}) => {
  const rows = [];
  const boardBasis = room?.boardBasis?.description || room?.boardBasis?.type;

  if (boardBasis) rows.push({ label: "Board basis", value: boardBasis });

  toArray(room?.additionalInformation).forEach((item) => {
    const text = item?.text || item?.value || "";
    const type = item?.type || "Information";
    if (text) rows.push({ label: type, value: text });
  });

  toArray(room?.policies).forEach((item) => {
    const text = item?.text || item?.description || item?.value || "";
    const type = item?.type || item?.title || "Policy";
    if (text) rows.push({ label: type, value: text });
  });

  return rows;
};

const getDetailText = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value !== "object") return String(value);

  return (
    value.text ||
    value.description ||
    value.desc ||
    value.value ||
    value.name ||
    value.label ||
    ""
  );
};

const getDescriptionRows = (room = {}) => {
  const rows = [];

  [
    room?.descriptions,
    room?.description,
    room?.raw?.descriptions,
    room?.raw?.description,
  ].forEach((source) => {
    toArray(source).forEach((item) => {
      const text = getDetailText(item);
      if (text) rows.push(String(text));
    });
  });


  return [...new Set(rows.map((item) => item.trim()).filter(Boolean))];
};

const RoomDetailsModal = ({ room, onClose }) => {
  useBodyScrollLock(Boolean(room));

  if (!room) return null;

  const descriptionRows = getDescriptionRows(room);
  const inclusionRows = getInclusionRows(room);
  const policyRows = getCancellationPolicyRows(room);
  const infoRows = getRoomInfoRows(room);

  return (
    <div
      className={styles.detailsOverlay}
      role="dialog"
      aria-modal="true"
      aria-label={`${room.title || "Room"} details`}
      onClick={onClose}
    >
      <div
        className={styles.detailsModal}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.detailsHeader}>
          <div>
            <h3>{room.title || "Room details"}</h3>
            <p>{[room.beds, room.persons].filter(Boolean).join(" • ")}</p>
          </div>
          <button
            type="button"
            className={styles.detailsClose}
            onClick={onClose}
            aria-label="Close room details"
          >
            ×
          </button>
        </div>

        <div className={styles.detailsBody}>
          <section className={styles.detailsSection}>
            <h4>Description</h4>
            {descriptionRows.length ? (
              <div className={styles.descriptionList}>
                {descriptionRows.map((description, index) => (
                  <p key={index}>{description}</p>
                ))}
              </div>
            ) : (
              <p className={styles.detailsEmpty}>
                Room description is not available.
              </p>
            )}
          </section>

          <section className={styles.detailsSection}>
            <h4>Inclusions</h4>
            {inclusionRows.length ? (
              <ul className={styles.inclusionList}>
                {inclusionRows.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.detailsEmpty}>N/A</p>
            )}
          </section>

          <section className={styles.detailsSection}>
            <h4>Cancellation Policy :</h4>
            {policyRows.length ? (
              <ul className={styles.policyList}>
                {policyRows.map((policy) => (
                  <li key={policy.id} className={styles.policyRow}>
                    <span
                      className={`${styles.policyIcon} ${
                        policy.status === "charge"
                          ? styles.policyIconWrong
                          : policy.status === "free"
                            ? styles.policyIconCorrect
                            : styles.policyIconNeutral
                      }`}
                      aria-hidden="true"
                    >
                      {policy.status === "charge" ? (
                        <X size={18} strokeWidth={2.4} />
                      ) : (
                        <Check size={18} strokeWidth={2.4} />
                      )}
                    </span>
                    <span className={styles.policyContent}>
                      <span>{policy.title || "N/A"}</span>
                      <small>
                        Fee: {policy.value || "N/A"}
                        {(policy.start !== "N/A" || policy.end !== "N/A") &&
                          ` • ${policy.start || "N/A"} to ${policy.end || "N/A"}`}
                      </small>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.detailsEmpty}>
                Cancellation policy is not available for this room.
              </p>
            )}
          </section>

          <section className={styles.detailsSection}>
            <h4>Room Information</h4>
            {infoRows.length ? (
              <div className={styles.infoList}>
                {infoRows.map((item, index) => (
                  <div key={`${item.label}-${index}`} className={styles.infoRow}>
                    <span>{item.label}</span>
                    <p>{item.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.detailsEmpty}>
                No additional room details available.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
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
  const availabilityRef = useRef(null);
  const swiperRefs = useRef({});
  const [roomQty, setRoomQty] = useState({});
  const [expandedComboRooms, setExpandedComboRooms] = useState({});
  const [detailsRoom, setDetailsRoom] = useState(null);
  const [scrollState, setScrollState] = useState({
    scrollY: 0,
    viewportHeight: 900,
  });

  const roomUnitMap = useMemo(() => rooms.reduce((unitMap, room) => {
    unitMap[room.id] = getRoomUnitCount(room);
    return unitMap;
  }, {}), [rooms]);
  const getSelectedUnitTotal = (quantityMap) =>
    Object.entries(quantityMap).reduce(
      (total, [roomId, quantity]) =>
        total + Number(quantity || 0) * (roomUnitMap[roomId] || 1),
      0,
    );
  const comboRooms = useMemo(
    () => rooms.filter((room) => Boolean(room.isCombo)),
    [rooms],
  );
  const firstComboRoomId = comboRooms[0]?.id || "";
  const renderableRooms = useMemo(
    () =>
      rooms.filter(
        (room) => !room.isCombo || room.id === firstComboRoomId,
      ),
    [firstComboRoomId, rooms],
  );
  const virtualWindow = useMemo(() => {
    const itemCount = renderableRooms.length;

    if (!itemCount) {
      return { startIndex: 0, endIndex: 0, paddingTop: 0, paddingBottom: 0 };
    }

    const section = availabilityRef.current;
    const sectionTop = section
      ? section.getBoundingClientRect().top + scrollState.scrollY
      : 0;
    const relativeScrollTop = Math.max(0, scrollState.scrollY - sectionTop);
    const startIndex = Math.max(
      0,
      Math.floor(relativeScrollTop / ROOM_CARD_ESTIMATED_HEIGHT) -
        VIRTUAL_OVERSCAN_COUNT,
    );
    const visibleCount =
      Math.ceil(scrollState.viewportHeight / ROOM_CARD_ESTIMATED_HEIGHT) +
      VIRTUAL_OVERSCAN_COUNT * 2;
    const endIndex = Math.min(itemCount, startIndex + visibleCount);

    return {
      startIndex,
      endIndex,
      paddingTop: startIndex * ROOM_CARD_ESTIMATED_HEIGHT,
      paddingBottom: Math.max(
        0,
        (itemCount - endIndex) * ROOM_CARD_ESTIMATED_HEIGHT,
      ),
    };
  }, [renderableRooms.length, scrollState]);
  const visibleRooms = useMemo(
    () => renderableRooms.slice(virtualWindow.startIndex, virtualWindow.endIndex),
    [renderableRooms, virtualWindow.endIndex, virtualWindow.startIndex],
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let animationFrame = 0;

    const updateScrollState = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        setScrollState({
          scrollY: window.scrollY || window.pageYOffset || 0,
          viewportHeight: window.innerHeight || 900,
        });
      });
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

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

    if (allowedByRoomLimit <= currentQty) {
      const canReplaceSelection =
        currentQty <= 0 &&
        Number(maxQty) > 0 &&
        unitCount <= maxSelectableRooms;

      if (canReplaceSelection) {
        setRoomQty({ [id]: 1 });
        onRoomQuantityChange?.(id, 1);
      }

      return;
    }

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
  const openRoomDetails = (room) => {
    if (actionDisabled) return;
    setDetailsRoom(room);
  };
  const closeRoomDetails = () => setDetailsRoom(null);

  return (
    <div className={styles.availabilitySection} ref={availabilityRef}>
      <h3 className={styles.heading}>Availability</h3>

      {loading && <AvailabilitySkeleton />}

      {!loading && !rooms.length && (
        <p className={errorMessage ? styles.errorText : styles.statusText}>
          {errorMessage || "No available rooms found."}
        </p>
      )}

      {!loading && Boolean(renderableRooms.length) && (
        <div
          className={styles.virtualRoomList}
          style={{
            paddingTop: virtualWindow.paddingTop,
            paddingBottom: virtualWindow.paddingBottom,
          }}
        >
      {visibleRooms.map((room) => {
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
        const canReplaceWithRoom =
          Number(qty || 0) <= 0 &&
          selectedRoomTotal > 0 &&
          roomUnitCount <= maxSelectableRooms;
        const visibleFeatures = features.slice(0, 10);
        const hasRoomDetailsData =
          getDescriptionRows(room).length > 0 ||
          getRoomInfoRows(room).length > 0 ||
          getCancellationPolicyRows(room).length > 0;

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
                const canReplaceWithCombo =
                  Number(comboQty || 0) <= 0 &&
                  selectedRoomTotal > 0 &&
                  comboUnitCount <= maxSelectableRooms;
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
                          disabled={
                            actionDisabled ||
                            (comboQty <= 0 && comboLimitReached && !canReplaceWithCombo)
                          }
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
                          <img src="images/upArrow.svg"/>
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
                                    onClick={() => openRoomDetails(detailRoom)}
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
                        {(features.length > 10 || hasRoomDetailsData) && (
                          <li className={styles.showMoreItem}>
                            <button
                              type="button"
                              className={styles.showMoreBtn}
                              disabled={actionDisabled}
                              onClick={() => openRoomDetails(room)}
                            >
                              ...Show More
                            </button>
                          </li>
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
                      onClick={() => openRoomDetails(room)}
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
                        {/* {room.rating.label} */}
                             {getRatingLabel(room.rating)}
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
                    disabled={
                      actionDisabled ||
                      maxQty <= 0 ||
                      (hasReachedRoomLimit && !canReplaceWithRoom)
                    }
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
      )}

      <RoomDetailsModal room={detailsRoom} onClose={closeRoomDetails} />
    </div>
  );
};

export default AvailabilityComponent;

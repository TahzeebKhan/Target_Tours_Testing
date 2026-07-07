"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from './MobileHotelDetails.module.css'
import { Pencil } from 'lucide-react'
import ResultsBottomSheet from './ResultsBottomSheet'
import HotelFilterSheet from './HotelFilterSheet'
import MobileHotelEditSheet from './MobileHotelEditSheet'
import HotelGridView from './hotelGridView/HotelGridView'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  HOTEL_DETAILS_KEY,
  HOTEL_SEARCH_RESULTS_EVENT,
  HOTEL_SEARCH_RESULTS_KEY,
  HOTEL_SEARCH_SESSION_KEY,
  HOTEL_LAST_SEARCH_URL_KEY,
  createHotelSearchChannel,
  fetchHotelDetails,
  isMissingHotelAuthTokenError,
} from '@/shared/services/hotelSearch'
import {
  getStaySummary,
  getHotelsFromMessage,
  getHotelDetailUrl,
  getHotelDetailsRequest,
  isHotelTerminalPayload,
  buildHotelFilterCounts,
  matchesHotelFilters,
  normalizeHotelCard,
  shouldApplyHotelResults,
} from '../tourListing/TourListing'
import LoginPopup from '@/app/account/loginPopUp/LoginPopup'
import SignupPopup from '@/app/account/signUpPopUp/SignupPopup'

const FIRST_HOTEL_RENDER_BATCH_SIZE = 40;
const HOTEL_RENDER_BATCH_SIZE = 300;

const getSearchLocationLabel = (searchParams) => {
    const rawLocation =
        searchParams.get("city") ||
        searchParams.get("location") ||
        searchParams.get("destination") ||
        searchParams.get("whereTo") ||
        "";

    return rawLocation
        ? rawLocation.replace(/\+/g, " ").replace(/\s+/g, " ").trim()
        : "this location";
};

const formatMobileDate = (dateValue) => {
  if (!dateValue) return "Add date";

  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getNumericSearchParam = (searchParams, key, fallback = 0) => {
  const value = Number(searchParams.get(key));
  return Number.isFinite(value) && value >= 0 ? value : fallback;
};

const pluralize = (count, label) =>
  `${count} ${label}${count === 1 ? "" : "s"}`;

const parseChildAges = (value = "") =>
  String(value || "")
    .split(",")
    .map((age) => age.trim())
    .filter(Boolean);

const parseNumberList = (value = "") =>
  String(value || "")
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));

const getRoomDetailsFromParams = (searchParams) => {
  const roomCount = Math.max(1, Number(searchParams.get("rooms") || 1));
  const roomAdults = parseNumberList(searchParams.get("roomAdults"));
  const roomChildren = parseNumberList(searchParams.get("roomChildren"));
  const childAges = parseChildAges(searchParams.get("childAges"));
  let childAgeIndex = 0;

  if (!roomAdults.length && !roomChildren.length) return [];

  return Array.from({ length: roomCount }, (_, index) => {
    const children = Math.max(0, Number(roomChildren[index] || 0));
    const roomChildAges = childAges.slice(childAgeIndex, childAgeIndex + children);
    childAgeIndex += children;

    return {
      adults: Math.max(1, Number(roomAdults[index] || 1)),
      children,
      childAges: roomChildAges,
    };
  });
};

const MobileHotelDetails = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hotelSearchChannel = searchParams.get("channel") || "";
    const staySummary = getStaySummary(searchParams);
    const searchLocationLabel = getSearchLocationLabel(searchParams);
    const searchSummary = useMemo(() => {
      const rooms = Math.max(1, getNumericSearchParam(searchParams, "rooms", 1));
      const adults = getNumericSearchParam(searchParams, "adults", 1);
      const children = getNumericSearchParam(searchParams, "children", 0);
      const guests = Math.max(1, adults + children);

      return {
        city: searchLocationLabel === "this location" ? "Hotel stay" : searchLocationLabel,
        checkIn: formatMobileDate(
          searchParams.get("checkIn") || searchParams.get("checkin"),
        ),
        roomsLabel: pluralize(rooms, "Room"),
        guestsLabel: pluralize(guests, "Guest"),
      };
    }, [searchLocationLabel, searchParams]);
    const [isMobileViewport, setIsMobileViewport] = useState(false);

  /* ✅ REQUIRED STATES */
  const [likedTours, setLikedTours] = useState([]);
  const [hotelResults, setHotelResults] = useState([]);
  const [totalHotelResults, setTotalHotelResults] = useState(0);
  const [isHotelLoading, setIsHotelLoading] = useState(Boolean(hotelSearchChannel));
  const [loadingHotelDetailsId, setLoadingHotelDetailsId] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const hotelResultSourceRef = useRef("");
  const normalizeRunRef = useRef(0);

      const toggleLike = (id) => {
    setLikedTours((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  const handleBookNow = async (hotel) => {
    if (!hotel || loadingHotelDetailsId) return;

    const payload = getHotelDetailsRequest(hotel, searchParams);

    if (!payload.searchId || !payload.hotelSearchId || !payload.hotelId || !payload.priceProvider) {
      console.warn("Missing hotel details payload fields:", payload);
      return;
    }

    setLoadingHotelDetailsId(hotel.id);

    try {
      const details = await fetchHotelDetails(payload);
      window.sessionStorage.setItem(
        HOTEL_DETAILS_KEY,
        JSON.stringify({
          request: payload,
          hotel,
          details,
        }),
      );
      router.push(getHotelDetailUrl(payload));
    } catch (error) {
      console.error("Hotel details request failed:", error);
      if (isMissingHotelAuthTokenError(error)) {
        setAuthView("login");
        setShowAuthModal(true);
      }
    } finally {
      setLoadingHotelDetailsId("");
    }
  };

  const handleEditSearch = (form) => {
    const city = String(form.city || searchLocationLabel || "").trim();
    const checkIn = String(form.checkIn || "").trim();
    const checkOut = String(form.checkOut || "").trim();
    const roomDetails = Array.isArray(form.roomDetails)
      ? form.roomDetails.map((room) => ({
          adults: Math.max(1, Number(room.adults || 1)),
          children: Math.max(0, Number(room.children || 0)),
          childAges: Array.isArray(room.childAges)
            ? room.childAges.map((age) => String(age || "").trim())
            : [],
        }))
      : [];
    const roomTotals = roomDetails.reduce(
      (totals, room) => ({
        adults: totals.adults + room.adults,
        children: totals.children + room.children,
      }),
      { adults: 0, children: 0 },
    );
    const rooms = Math.max(1, roomDetails.length || Number(form.rooms || 1));
    const adults = Math.max(
      1,
      roomDetails.length ? roomTotals.adults : Number(form.adults || 1),
    );
    const children = Math.max(
      0,
      roomDetails.length ? roomTotals.children : Number(form.children || 0),
    );
    const childAges = Array.isArray(form.childAges)
      ? form.childAges.slice(0, children).map((age) => String(age || "").trim())
      : [];

    if (!city || !checkIn || !checkOut) return;
    if (children > 0 && childAges.some((age) => !age)) return;

    setIsEditSubmitting(true);

    const channel = createHotelSearchChannel();
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("city", city);
    nextParams.set("checkIn", checkIn);
    nextParams.set("checkOut", checkOut);
    nextParams.set("channel", channel);
    nextParams.set("rooms", String(rooms));
    nextParams.set("adults", String(adults));
    nextParams.set("children", String(children));
    if (roomDetails.length) {
      nextParams.set(
        "roomAdults",
        roomDetails.map((room) => room.adults).join(","),
      );
      nextParams.set(
        "roomChildren",
        roomDetails.map((room) => room.children).join(","),
      );
    } else {
      nextParams.delete("roomAdults");
      nextParams.delete("roomChildren");
    }
    if (children > 0) {
      nextParams.set("childAges", childAges.join(","));
    } else {
      nextParams.delete("childAges");
    }
    nextParams.delete("searchId");
    nextParams.delete("hotelSearchId");

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(HOTEL_SEARCH_RESULTS_KEY);
      window.sessionStorage.removeItem(HOTEL_SEARCH_SESSION_KEY);
      try {
        window.localStorage.setItem(
          HOTEL_LAST_SEARCH_URL_KEY,
          `/hotels?${nextParams.toString()}`,
        );
      } catch {
        // Ignore storage failures.
      }
    }

    setIsEditOpen(false);
    setActiveFilters({});
    router.push(`/hotels?${nextParams.toString()}`);
    setIsEditSubmitting(false);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleViewportChange = () => {
      setIsMobileViewport(mediaQuery.matches);
    };

    handleViewportChange();
    mediaQuery.addEventListener("change", handleViewportChange);

    return () => {
      mediaQuery.removeEventListener("change", handleViewportChange);
    };
  }, []);

  useEffect(() => {
    if (!isMobileViewport) {
      normalizeRunRef.current += 1;
      setHotelResults([]);
      setTotalHotelResults(0);
      setIsHotelLoading(false);
      hotelResultSourceRef.current = "";
      return;
    }

    normalizeRunRef.current += 1;
    setHotelResults([]);
    setTotalHotelResults(0);
    setIsHotelLoading(Boolean(hotelSearchChannel));
    hotelResultSourceRef.current = "";

    const normalizeHotelsInBatches = (hotels, meta = {}) => {
      const runId = normalizeRunRef.current + 1;
      normalizeRunRef.current = runId;
      setTotalHotelResults(hotels.length);
      const withSearchMeta = (hotel) => ({
        ...hotel,
        searchId: hotel.searchId || hotel.search_id || meta.searchId,
        hotelSearchId:
          hotel.hotelSearchId || hotel.hotel_search_id || meta.hotelSearchId,
        requestId: hotel.requestId || hotel.request_id || meta.requestId,
        hotelSearchKey:
          hotel.hotelSearchKey || hotel.hotel_search_key || meta.hotelSearchKey,
      });
      const firstBatch = hotels
        .slice(0, FIRST_HOTEL_RENDER_BATCH_SIZE)
        .map((hotel, index) => normalizeHotelCard(withSearchMeta(hotel), index));

      setHotelResults(firstBatch);
      setIsHotelLoading(false);

      let nextIndex = FIRST_HOTEL_RENDER_BATCH_SIZE;

      const appendNextBatch = () => {
        if (normalizeRunRef.current !== runId || nextIndex >= hotels.length) {
          return;
        }

        const batchStart = nextIndex;
        const batch = hotels
          .slice(batchStart, batchStart + HOTEL_RENDER_BATCH_SIZE)
          .map((hotel, index) =>
            normalizeHotelCard(withSearchMeta(hotel), batchStart + index),
          );

        nextIndex += HOTEL_RENDER_BATCH_SIZE;
        setHotelResults((prev) => [...prev, ...batch]);

        if (nextIndex < hotels.length) {
          window.setTimeout(appendNextBatch, 0);
        }
      };

      window.setTimeout(appendNextBatch, 0);
    };

    const applyHotelResults = (payload) => {
      if (payload?.channel && payload.channel !== hotelSearchChannel) {
        return;
      }

      // console.log("Mobile hotel socket payload:", payload);

      const nextResults = getHotelsFromMessage(payload);
      // console.log("Mobile hotel result source:", nextResults.source);
      // console.log("Mobile hotels before UI normalize:", nextResults.hotels);

      if (!nextResults.hotels.length) {
        if (isHotelTerminalPayload(payload)) {
          setIsHotelLoading(false);
        }
        return;
      }
      if (
        !shouldApplyHotelResults(
          hotelResultSourceRef.current,
          nextResults.source,
        )
      ) {
        return;
      }

      normalizeHotelsInBatches(nextResults.hotels, nextResults.meta);
      hotelResultSourceRef.current = nextResults.source;
    };

    const handleHotelResults = (event) => {
      applyHotelResults(event.detail);
    };

    window.addEventListener(HOTEL_SEARCH_RESULTS_EVENT, handleHotelResults);

    const cachedResults = window.sessionStorage.getItem(HOTEL_SEARCH_RESULTS_KEY);
    if (cachedResults) {
      try {
        const cachedPayload = JSON.parse(cachedResults);
        if (!hotelSearchChannel || cachedPayload?.channel === hotelSearchChannel) {
          applyHotelResults(cachedPayload);
        }
      } catch {
        // Ignore stale malformed session data.
      }
    }

    return () => {
      normalizeRunRef.current += 1;
      window.removeEventListener(HOTEL_SEARCH_RESULTS_EVENT, handleHotelResults);
    };
  }, [hotelSearchChannel, isMobileViewport]);

  const filterCounts = useMemo(
    () => buildHotelFilterCounts(hotelResults),
    [hotelResults],
  );
  const displayHotels = useMemo(
    () => hotelResults.filter((hotel) => matchesHotelFilters(hotel, activeFilters)),
    [activeFilters, hotelResults],
  );

    return (
        <div className={styles.hotelDetailsMobileContainer}>
            <div
                className={`${styles.tripDetailsHeader}`}
            >
                <div className={styles.mainCotainer}>
                    <img src="/icons/leftArrowTrip.svg" alt="" />
                    <div
                        className={`${styles.TripCardHeader} ${styles.TripCardHeaderNav}`}
                    >
                        <div className={styles.TripCardHeaderDetails}>
                          <p className={styles.TripCardHeaderDetailsItemText}>
                            {searchSummary.city}
                          </p>
                        </div>

                        <div className={styles.TripCardHeaderBookingDate}>
                            <p>{searchSummary.checkIn}</p>
                            <p>
                                <span className={styles.navDot}></span>{searchSummary.guestsLabel}
                            </p>
                            <p>
                                <span className={styles.navDot}></span>{searchSummary.roomsLabel}
                            </p>
                        </div>
                    </div>
                </div>
                <button
                  type="button"
                  className={styles.editButton}
                  onClick={() => setIsEditOpen(true)}
                  aria-label="Edit hotel search"
                >
                  <Pencil className={styles.editIcon} color="#FFFFFF" size={16} />
                </button>
            </div>

            <ResultsBottomSheet
              resultsCount={totalHotelResults || displayHotels.length}
              isLoading={isHotelLoading}
              onOpenFilters={() => setIsFilterOpen(true)}
            >
                    <HotelGridView
                        tourData={displayHotels}
                        likedTours={likedTours}
                        toggleLike={toggleLike}
                        handleBookNow={handleBookNow}
                        isLoading={isHotelLoading}
                        staySummary={staySummary}
                        loadingHotelDetailsId={loadingHotelDetailsId}
                        locationLabel={searchLocationLabel}
                        showEmptyState={Boolean(hotelSearchChannel)}
                    />
            </ResultsBottomSheet>
            <HotelFilterSheet
              open={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              counts={filterCounts}
              selectedFilters={activeFilters}
              onApply={setActiveFilters}
              onReset={() => setActiveFilters({})}
            />
            <MobileHotelEditSheet
              open={isEditOpen}
              onClose={() => setIsEditOpen(false)}
              isSubmitting={isEditSubmitting}
              initialValues={{
                city: searchSummary.city === "Hotel stay" ? "" : searchSummary.city,
                checkIn: searchParams.get("checkIn") || searchParams.get("checkin") || "",
                checkOut: searchParams.get("checkOut") || searchParams.get("checkout") || "",
                rooms: searchParams.get("rooms") || 1,
                adults: searchParams.get("adults") || 1,
                children: searchParams.get("children") || 0,
                childAges: parseChildAges(searchParams.get("childAges")),
                roomDetails: getRoomDetailsFromParams(searchParams),
              }}
              onApply={handleEditSearch}
            />
            {showAuthModal && authView === "login" && (
              <LoginPopup
                onClose={() => {
                  setShowAuthModal(false);
                  setAuthView("login");
                }}
                onNavigate={setAuthView}
              />
            )}

            {showAuthModal && authView === "signup" && (
              <SignupPopup
                onClose={() => {
                  setShowAuthModal(false);
                  setAuthView("login");
                }}
                onNavigate={setAuthView}
              />
            )}
        </div>
    )
}

export default MobileHotelDetails

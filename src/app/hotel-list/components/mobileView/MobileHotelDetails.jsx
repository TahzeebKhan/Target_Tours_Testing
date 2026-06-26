"use client";
import React, { useEffect, useRef, useState } from 'react'
import styles from './MobileHotelDetails.module.css'
import { Pencil } from 'lucide-react'
import MapSection from '../mapSection/MapSection'
import StickyHeader from './ResultsBottomSheet'
import ResultsStickyBar from './ResultsBottomSheet'
import ResultsBottomSheet from './ResultsBottomSheet'
import HotelGridView from './hotelGridView/HotelGridView'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  HOTEL_DETAILS_KEY,
  HOTEL_SEARCH_RESULTS_EVENT,
  HOTEL_SEARCH_RESULTS_KEY,
  fetchHotelDetails,
  isMissingHotelAuthTokenError,
} from '@/shared/services/hotelSearch'
import {
  getStaySummary,
  getHotelsFromMessage,
  getHotelDetailUrl,
  getHotelDetailsRequest,
  isHotelTerminalPayload,
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

const MobileHotelDetails = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hotelSearchChannel = searchParams.get("channel") || "";
    const staySummary = getStaySummary(searchParams);
    const searchLocationLabel = getSearchLocationLabel(searchParams);
    const [isMobileViewport, setIsMobileViewport] = useState(false);

  /* ✅ REQUIRED STATES */
  const [likedTours, setLikedTours] = useState([]);
  const [hotelResults, setHotelResults] = useState([]);
  const [isHotelLoading, setIsHotelLoading] = useState(Boolean(hotelSearchChannel));
  const [loadingHotelDetailsId, setLoadingHotelDetailsId] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState("login");
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
    if (!hotel) return;

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
      setIsHotelLoading(false);
      hotelResultSourceRef.current = "";
      return;
    }

    normalizeRunRef.current += 1;
    setHotelResults([]);
    setIsHotelLoading(Boolean(hotelSearchChannel));
    hotelResultSourceRef.current = "";

    const normalizeHotelsInBatches = (hotels, meta = {}) => {
      const runId = normalizeRunRef.current + 1;
      normalizeRunRef.current = runId;
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

  const displayHotels = hotelResults;

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
                                <span className={styles.navDot}></span>1 Traveller
                            </p>
                            <p>
                                <span className={styles.navDot}></span>Economy
                            </p>
                        </div>
                    </div>
                </div>
                <Pencil className={styles.editIcon} color="#FFFFFF" size={16} />
            </div>

            <MapSection />
            <ResultsBottomSheet>
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

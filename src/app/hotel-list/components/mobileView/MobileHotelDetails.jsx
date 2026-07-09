"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./MobileHotelDetails.module.css";
import { Pencil } from "lucide-react";
import ResultsBottomSheet from "./ResultsBottomSheet";
import HotelFilterSheet from "./HotelFilterSheet";
import MobileHotelEditSheet from "./MobileHotelEditSheet";
import HotelGridView from "./hotelGridView/HotelGridView";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HOTEL_DETAILS_KEY,
  HOTEL_SEARCH_RESULTS_EVENT,
  HOTEL_SEARCH_RESULTS_KEY,
  HOTEL_SEARCH_SESSION_KEY,
  HOTEL_LAST_SEARCH_URL_KEY,
  createHotelSearchChannel,
  fetchHotelDetails,
  isMissingHotelAuthTokenError,
} from "@/shared/services/hotelSearch";
import {
  getStaySummary,
  getMessageData,
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createWishlist } from '@/shared/components/wishlistModals/CreateWishlistModal'
import { fetchUserWishlists } from '@/shared/components/wishlistModals/SaveToWishlistModal'
import { appToast } from '@/shared/components/appToast/AppToast'
import CustomLoaderHomePage from '@/shared/components/CustomLoaderHomePage'

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
    const roomChildAges = childAges.slice(
      childAgeIndex,
      childAgeIndex + children,
    );
    childAgeIndex += children;

    return {
      adults: Math.max(1, Number(roomAdults[index] || 1)),
      children,
      childAges: roomChildAges,
    };
  });
};

const readStoredHotelSearch = () => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(HOTEL_SEARCH_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const formatHotelApiDate = (value) => {
  if (!value) return "";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return "";

  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = parsedDate.getFullYear();

  return `${month}/${day}/${year}`;
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
    const [isMobileViewport, setIsMobileViewport] = useState(
      () =>
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 768px)").matches,
    );

  /* ✅ REQUIRED STATES */
  const [likedTours, setLikedTours] = useState([]);
  const [hotelResults, setHotelResults] = useState([]);
  const [totalHotelResults, setTotalHotelResults] = useState(0);
  const [isHotelLoading, setIsHotelLoading] = useState(
    Boolean(hotelSearchChannel),
  );
  const [hasCompletedInitialSearch, setHasCompletedInitialSearch] = useState(
    !hotelSearchChannel,
  );
  const [loadingHotelDetailsId, setLoadingHotelDetailsId] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const hotelResultSourceRef = useRef("");
  const normalizeRunRef = useRef(0);
  const queryClient = useQueryClient();

  const { data: wishlistData } = useQuery({
    queryKey: ["user-wishlists", "hotel"],
    queryFn: () => fetchUserWishlists("hotel"),
  });

  useEffect(() => {
    const wishlistHotelIds = Object.values(wishlistData || {}).flatMap((group) =>
      (group?.data || []).map((item) =>
        String(item.hotelId || item.hotel_id || item.id || item.documentId || ""),
      ),
    );

    setLikedTours([...new Set(wishlistHotelIds.filter(Boolean))]);
  }, [wishlistData]);

  const { mutate: addHotelToWishlist, isPending: isAddingToWishlist } =
    useMutation({
      mutationFn: (hotelId) =>
        createWishlist({ type: "hotel", ids: [hotelId] }),
      onSuccess: (_data, hotelId) => {
        setLikedTours((prev) =>
          prev.includes(hotelId) ? prev : [...prev, hotelId],
        );
        queryClient.invalidateQueries({
          queryKey: ["user-wishlists", "hotel"],
        });
      },
      onError: (error) => {
        if (
          error?.message === "Not authenticated" ||
          error?.response?.status === 401 ||
          error?.response?.status === 403
        ) {
          setAuthView("login");
          setShowAuthModal(true);
          return;
        }

        appToast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to add hotel to wishlist",
        );
      },
    });

  const handleWishlistClick = (id) => {
    const hotelId = String(id || "");
    if (!hotelId || isAddingToWishlist) return;

    addHotelToWishlist(hotelId);
  };

  const handleBookNow = async (hotel) => {
    if (!hotel || loadingHotelDetailsId) return;

    const payload = getHotelDetailsRequest(hotel, searchParams);

    if (
      !payload.searchId ||
      !payload.hotelSearchId ||
      !payload.hotelId ||
      !payload.priceProvider
    ) {
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
    const storedSearch = readStoredHotelSearch() || {};
    const storedInitPayload = storedSearch.initPayload || {};
    const storedLocation = storedSearch.location || {};
    const fallbackLocationPayload =
      Array.isArray(storedInitPayload.locations) &&
      storedInitPayload.locations.length
        ? storedInitPayload.locations[0]
        : {};
    const selectedDestination = form.destination || null;
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
    const locationId = String(
      selectedDestination?.locationId ||
        selectedDestination?.id ||
        selectedDestination?.raw?.locationId ||
        selectedDestination?.raw?.id ||
        searchParams.get("locationId") ||
        storedInitPayload.locationId ||
        storedLocation.id ||
        storedLocation.locationId ||
        fallbackLocationPayload.id ||
        fallbackLocationPayload.locationId ||
        "",
    ).trim();
    const destinationCountryCode = String(
      selectedDestination?.country ||
        selectedDestination?.raw?.country ||
        selectedDestination?.countryCode ||
        selectedDestination?.raw?.countryCode ||
        searchParams.get("country") ||
        storedInitPayload.destinationCountryCode ||
        storedLocation.country ||
        fallbackLocationPayload.country ||
        "IN",
    ).trim();
    const state = String(
      selectedDestination?.state ||
        selectedDestination?.raw?.state ||
        searchParams.get("state") ||
        storedLocation.state ||
        fallbackLocationPayload.state ||
        "",
    ).trim();
    const geoCode =
      selectedDestination?.geoCode ||
      selectedDestination?.raw?.geoCode ||
      selectedDestination?.coordinates ||
      selectedDestination?.raw?.coordinates ||
      storedInitPayload.geoCode ||
      storedLocation.geoCode ||
      storedLocation.coordinates ||
      fallbackLocationPayload.geoCode ||
      fallbackLocationPayload.coordinates ||
      {};
    const roomPayloads = roomDetails.map((room) => ({
      adults: String(Math.max(1, Number(room.adults || 1))),
      children: String(Math.max(0, Number(room.children || 0))),
      childAges: Array.isArray(room.childAges)
        ? room.childAges.map((age) => String(age || "").trim())
        : [],
    }));

    nextParams.set("city", city);
    nextParams.set("checkIn", checkIn);
    nextParams.set("checkOut", checkOut);
    nextParams.set("channel", channel);
    nextParams.set("rooms", String(rooms));
    nextParams.set("adults", String(adults));
    nextParams.set("children", String(children));
    if (locationId) {
      nextParams.set("locationId", locationId);
    } else {
      nextParams.delete("locationId");
    }
    if (destinationCountryCode) {
      nextParams.set("country", destinationCountryCode);
    } else {
      nextParams.delete("country");
    }
    if (state) {
      nextParams.set("state", state);
    } else {
      nextParams.delete("state");
    }
    if (
      Number.isFinite(Number(geoCode.lat)) &&
      Number.isFinite(Number(geoCode.long))
    ) {
      nextParams.set("lat", String(geoCode.lat));
      nextParams.set("long", String(geoCode.long));
    } else {
      nextParams.delete("lat");
      nextParams.delete("long");
    }
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

    const nextSearchContext = {
      ...storedSearch,
      channel,
      city,
      checkIn,
      checkOut,
      rooms: roomDetails.length,
      adults,
      children,
      childAges,
      location: {
        ...storedLocation,
        ...fallbackLocationPayload,
        ...(selectedDestination
          ? {
              id:
                selectedDestination?.locationId ||
                selectedDestination?.id ||
                selectedDestination?.raw?.locationId ||
                selectedDestination?.raw?.id ||
                "",
              locationId:
                selectedDestination?.locationId ||
                selectedDestination?.id ||
                selectedDestination?.raw?.locationId ||
                selectedDestination?.raw?.id ||
                "",
              label:
                selectedDestination?.label ||
                selectedDestination?.value ||
                city,
              value:
                selectedDestination?.value ||
                selectedDestination?.label ||
                city,
              detail: selectedDestination?.detail || city,
              country: destinationCountryCode,
              state,
              ...(geoCode &&
              Number.isFinite(Number(geoCode.lat)) &&
              Number.isFinite(Number(geoCode.long))
                ? { geoCode }
                : {}),
            }
          : {}),
        id: locationId || storedLocation.id || fallbackLocationPayload.id || "",
        locationId:
          locationId ||
          storedLocation.locationId ||
          fallbackLocationPayload.locationId ||
          "",
        label: city,
        value: city,
        detail: city,
        country: destinationCountryCode,
        state,
        ...(geoCode &&
        Number.isFinite(Number(geoCode.lat)) &&
        Number.isFinite(Number(geoCode.long))
          ? { geoCode }
          : {}),
      },
      initPayload: {
        ...storedInitPayload,
        domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337",
        locations: [
          {
            ...fallbackLocationPayload,
            id: locationId || fallbackLocationPayload.id || "",
            name: city,
            fullName: city,
            type: fallbackLocationPayload.type || storedLocation.type || "city",
            city: null,
            state,
            country: destinationCountryCode,
            score: 0,
            referenceId: fallbackLocationPayload.referenceId ?? null,
            ...(geoCode &&
            Number.isFinite(Number(geoCode.lat)) &&
            Number.isFinite(Number(geoCode.long))
              ? { coordinates: geoCode }
              : {}),
          },
        ],
        channel,
        locationId,
        currency: storedInitPayload.currency || "INR",
        culture: storedInitPayload.culture || "en-US",
        checkIn: formatHotelApiDate(checkIn),
        checkOut: formatHotelApiDate(checkOut),
        rooms: roomPayloads,
        agentCode: storedInitPayload.agentCode || "14005",
        destinationCountryCode,
        nationality: storedInitPayload.nationality || "IN",
        countryOfResidence: storedInitPayload.countryOfResidence || "IN",
        channelId: storedInitPayload.channelId || "b2bIndiaDeals",
        affiliateRegion: storedInitPayload.affiliateRegion || "B2B_India",
        segmentId: storedInitPayload.segmentId || "",
        companyId: storedInitPayload.companyId || "1",
        gstPercentage: storedInitPayload.gstPercentage ?? 0,
        tdsPercentage: storedInitPayload.tdsPercentage ?? 0,
      },
      initResponse: null,
      initStatus: "pending",
    };

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(HOTEL_SEARCH_RESULTS_KEY);
      window.sessionStorage.setItem(
        HOTEL_SEARCH_SESSION_KEY,
        JSON.stringify(nextSearchContext),
      );
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
        .map((hotel, index) =>
          normalizeHotelCard(withSearchMeta(hotel), index),
        );

      setHotelResults(firstBatch);
      setIsHotelLoading(false);
      setHasCompletedInitialSearch(true);

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
        const payloadType = payload?.type || getMessageData(payload)?.type;
        if (
          isHotelTerminalPayload(payload) &&
          payloadType !== "HOTEL_INIT_COMPLETE"
        ) {
          setIsHotelLoading(false);
          setHasCompletedInitialSearch(true);
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

    const cachedResults = window.sessionStorage.getItem(
      HOTEL_SEARCH_RESULTS_KEY,
    );
    if (cachedResults) {
      try {
        const cachedPayload = JSON.parse(cachedResults);
        if (
          !hotelSearchChannel ||
          cachedPayload?.channel === hotelSearchChannel
        ) {
          applyHotelResults(cachedPayload);
        }
      } catch {
        // Ignore stale malformed session data.
      }
    }

    return () => {
      normalizeRunRef.current += 1;
      window.removeEventListener(
        HOTEL_SEARCH_RESULTS_EVENT,
        handleHotelResults,
      );
    };
  }, [hotelSearchChannel, isMobileViewport]);

  const filterCounts = useMemo(
    () => buildHotelFilterCounts(hotelResults),
    [hotelResults],
  );
  const displayHotels = useMemo(
    () =>
      hotelResults.filter((hotel) => matchesHotelFilters(hotel, activeFilters)),
    [activeFilters, hotelResults],
  );

    if (
      isMobileViewport &&
      !hasCompletedInitialSearch &&
      isHotelLoading &&
      !hotelResults.length
    ) {
      return <CustomLoaderHomePage />;
    }

  return (
    <div className={styles.hotelDetailsMobileContainer}>
      <div className={`${styles.tripDetailsHeader}`}>
        <div className={styles.mainCotainer}>
          {/* <img src="/icons/leftArrowTrip.svg" alt="" /> */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokewidth="1.25"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-chevron-left-icon lucide-chevron-left"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
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
              <p>-</p>
              <p>{searchSummary.checkOut}</p>
              <p>
                <span className={styles.navDot}></span>
                {searchSummary.guestsLabel}
              </p>
              <p>
                <span className={styles.navDot}></span>
                {searchSummary.roomsLabel}
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
                        onWishlistClick={handleWishlistClick}
                        isAddingToWishlist={isAddingToWishlist}
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
                destination: readStoredHotelSearch()?.location || null,
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
  );
};

export default MobileHotelDetails;

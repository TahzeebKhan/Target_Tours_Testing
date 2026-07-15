"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./HotelDetailLayout.module.css";
import DescriptionComponent from "./Components/descriptionComponent/DescriptionComponent";
import Amenities from "./Components/amenities/Amenities";
import AvailabilityComponent from "./Components/availabilityComponent/AvailabilityComponent";
import HotelPolicies from "./Components/hotelPolicies/HotelPolicies";
import RoomSelectionCard from "./Components/roomSelectionCard/RoomSelectionCard";
import CustomerReviews from "./Components/customerReviews/CustomerReviews";
import BarcelonaSection from "./Components/BarcelonaSection/BarcelonaSection";
import BookingSummary from "./Components/bookingSummary/BookingSummary";
import Tabs from "./Components/tabs/Tabs";
import { useHotelDetailData } from "./HotelDetailDataContext";
import {
  HOTEL_SEARCH_SESSION_KEY,
  writeHotelBookingSession,
} from "@/shared/services/hotelSearch";
import { toast } from "react-toastify";

const TAB_SCROLL_OFFSET = 140;

const parseCurrencyNumber = (value) => {
  const numericValue = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const formatDisplayDate = (value, fallback) => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

const getSearchParamValue = (key) => {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(key) || "";
};

const isPlaceholderDate = (value) =>
  ["check-in", "check-out"].includes(String(value || "").trim().toLowerCase());

const getFirstValue = (...values) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !isPlaceholderDate(value),
  ) || "";

const getNightCount = (checkInValue, checkOutValue) => {
  const checkInDate = new Date(checkInValue);
  const checkOutDate = new Date(checkOutValue);

  if (
    Number.isNaN(checkInDate.getTime()) ||
    Number.isNaN(checkOutDate.getTime()) ||
    checkOutDate <= checkInDate
  ) {
    return 1;
  }

  return Math.max(
    1,
    Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)),
  );
};

const toHotelAvailabilityDate = (value) => {
  if (!value || isPlaceholderDate(value)) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
};

const getLocationGeoCode = (...sources) => {
  const lat = getFirstValue(
    ...sources.flatMap((source) => [source?.lat, source?.latitude]),
  );
  const long = getFirstValue(
    ...sources.flatMap((source) => [
      source?.long,
      source?.lng,
      source?.longitude,
    ]),
  );

  return {
    lat: lat ? String(lat) : "",
    long: long ? String(long) : "",
  };
};

const normalizeChildAges = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(/[:,|]/)
      .map((age) => age.trim())
      .filter(Boolean);
  }

  return [];
};

const buildAvailabilityRooms = ({
  roomCount,
  adults,
  children,
  sourceRooms = [],
}) => {
  const count = Math.max(1, Number(roomCount) || 1);
  const totalAdults = Math.max(count, Number(adults) || 1);
  const totalChildren = Math.max(0, Number(children) || 0);
  const baseAdults = Math.floor(totalAdults / count);
  const extraAdults = totalAdults % count;
  const baseChildren = Math.floor(totalChildren / count);
  const extraChildren = totalChildren % count;
  const sourceChildAges = sourceRooms.flatMap((room) =>
    normalizeChildAges(room.childAges || room.childrenAges || room.ChildAges),
  );
  let childAgeCursor = 0;

  return Array.from({ length: count }, (_, index) => {
    const sourceRoom = sourceRooms[index] || sourceRooms[0] || {};
    const roomChildren = baseChildren + (index < extraChildren ? 1 : 0);
    const directChildAges = normalizeChildAges(
      sourceRoom.childAges || sourceRoom.childrenAges || sourceRoom.ChildAges,
    );
    const childAges = directChildAges.length
      ? directChildAges.slice(0, roomChildren)
      : sourceChildAges.slice(childAgeCursor, childAgeCursor + roomChildren);

    childAgeCursor += roomChildren;

    return {
      adults: String(baseAdults + (index < extraAdults ? 1 : 0)),
      children: String(roomChildren),
      childAges,
    };
  });
};

const buildAvailabilitySignature = (selection = {}) =>
  JSON.stringify({
    checkIn: selection.checkIn || "",
    checkOut: selection.checkOut || "",
    rooms: Number(selection.rooms) || 1,
    adults: Number(selection.adults) || 1,
    children: Number(selection.children) || 0,
    childAges: Array.isArray(selection.childAges)
      ? selection.childAges.map((age) => String(age || ""))
      : [],
  });

const buildHotelAvailabilityPayload = ({
  hotelDetail,
  storedHotelSearch,
  selection,
}) => {
  const searchRequest = hotelDetail?.request || {};
  const sourcePayload =
    searchRequest.searchContext?.initPayload || storedHotelSearch.initPayload || {};
  const location =
    searchRequest.searchContext?.location ||
    storedHotelSearch.location ||
    sourcePayload.location ||
    {};
  const sourceLocations = Array.isArray(sourcePayload.locations)
    ? sourcePayload.locations
    : [];
  const sourceRooms = Array.isArray(sourcePayload.rooms) ? sourcePayload.rooms : [];
  const requestRooms = Array.isArray(searchRequest.searchContext?.rooms)
    ? searchRequest.searchContext.rooms
    : [];
  const locationPayload =
    sourceLocations[0] ||
    location.raw ||
    (location.id || location.locationId || location.label
      ? {
          id: location.locationId || location.id || "",
          name: location.label || location.value || storedHotelSearch.city || "",
          fullName:
            location.detail ||
            location.label ||
            location.value ||
            storedHotelSearch.city ||
            "",
          code: null,
          type: location.type || "city",
          city: null,
          state: location.state || "",
          country: location.country || "IN",
          score: 0,
          referenceId: null,
        }
      : null);
  const sourceGeoCode =
    sourcePayload.geoCode ||
    location.geoCode ||
    locationPayload?.coordinates ||
    searchRequest.geoCode ||
    {};
  const geoCode = getLocationGeoCode(sourceGeoCode, location, locationPayload?.coordinates);
  const destinationCountryCode = getFirstValue(
    sourcePayload.destinationCountryCode,
    searchRequest.destinationCountryCode,
    searchRequest.searchContext?.destinationCountryCode,
    storedHotelSearch.destinationCountryCode,
    locationPayload?.country,
    location.country,
  );

  return {
    ...(locationPayload ? { locations: [locationPayload] } : {}),
    ...(geoCode.lat && geoCode.long ? { geoCode } : {}),
    locationId: String(
      getFirstValue(
        sourcePayload.locationId,
        searchRequest.searchContext?.locationId,
        storedHotelSearch.locationId,
        location.locationId,
        location.id,
        locationPayload?.id,
      ),
    ),
    destinationCountryCode,
    currency: sourcePayload.currency || "INR",
    culture: sourcePayload.culture || "en-US",
    checkIn: toHotelAvailabilityDate(selection.checkIn),
    checkOut: toHotelAvailabilityDate(selection.checkOut),
    rooms: buildAvailabilityRooms({
      roomCount: selection.rooms,
      adults: selection.adults,
      children: selection.children,
      sourceRooms:
        Array.isArray(selection.roomDetails) && selection.roomDetails.length
          ? selection.roomDetails
          : sourceRooms.length
            ? sourceRooms
            : requestRooms,
    }),
    hotelId: String(getFirstValue(searchRequest.hotelId, hotelDetail?.id)),
    priceProvider: String(
      getFirstValue(searchRequest.priceProvider, sourcePayload.priceProvider),
    ),
  };
};

const getAvailabilitySearchId = (response) =>
  getFirstValue(
    response?.data?.searchId,
    response?.data?.content?.searchId,
    response?.content?.searchId,
    response?.searchId,
    response?.data?.error?.details?.searchId,
    response?.error?.details?.searchId,
  );

const updateHotelDetailUrlParams = (selection, response) => {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const searchId = getAvailabilitySearchId(response);

  url.searchParams.set("checkIn", selection.checkIn);
  url.searchParams.set("checkOut", selection.checkOut);
  url.searchParams.set("rooms", String(selection.rooms));
  url.searchParams.set("adults", String(selection.adults));
  url.searchParams.set("children", String(selection.children));
  if (Array.isArray(selection.childAges)) {
    url.searchParams.set("childAges", selection.childAges.join(","));
  }

  if (searchId) {
    url.searchParams.set("searchId", searchId);
  }

  window.history.replaceState(window.history.state, "", url.toString());
};

const DEFAULT_ROOM_LIST = [];

const Page = () => {
  const { hotelDetail, roomsLoading, refreshHotelAvailability } = useHotelDetailData();
  const [activeTab, setActiveTab] = useState("Description");
  const [showSummary, setShowSummary] = useState(false);
  const [showRoomSearchCard, setShowRoomSearchCard] = useState(true);
  const [availabilityChecking, setAvailabilityChecking] = useState(false);
  const [bookingActionLoading, setBookingActionLoading] = useState(false);
  const [selectionOverride, setSelectionOverride] = useState(null);
  const [roomList, setRoomList] = useState(DEFAULT_ROOM_LIST);
  const descriptionRef = useRef(null);
  const amenitiesRef = useRef(null);
  const roomsRef = useRef(null);
  const reviewsRef = useRef(null);
  const policyRef = useRef(null);
  const searchRequest = useMemo(() => hotelDetail?.request || {}, [hotelDetail?.request]);
  const storedHotelSearch = useMemo(() => readStoredHotelSearch() || {}, []);
  const availabilityResponseRef = useRef(storedHotelSearch.availabilityResponse || null);
  const urlSearchValues = useMemo(
    () => ({
      searchId: getSearchParamValue("searchId"),
      hotelSearchId: getSearchParamValue("hotelSearchId"),
      searchTracingKey: getSearchParamValue("searchTracingKey"),
      roomsSearchTracingKey: getSearchParamValue("roomsSearchTracingKey"),
      TUI: getSearchParamValue("TUI"),
      hotelId: getSearchParamValue("hotelId"),
      priceProvider: getSearchParamValue("priceProvider"),
      checkIn: getSearchParamValue("checkIn"),
      checkOut: getSearchParamValue("checkOut"),
      rooms: getSearchParamValue("rooms"),
      adults: getSearchParamValue("adults"),
      children: getSearchParamValue("children"),
      childAges: getSearchParamValue("childAges"),
    }),
    [],
  );
  const apiCheckIn = useMemo(
    () =>
      getFirstValue(
        urlSearchValues.checkIn,
        searchRequest.checkIn,
      ),
    [searchRequest, urlSearchValues.checkIn],
  );
  const apiCheckOut = useMemo(
    () =>
      getFirstValue(
        urlSearchValues.checkOut,
        searchRequest.checkOut
      ),
    [searchRequest, urlSearchValues.checkOut],
  );
  const rooms =
    urlSearchValues.rooms ||
    searchRequest.rooms ||
    searchRequest.roomCount ||
    storedHotelSearch.rooms ||
    1;
  const adults =
    urlSearchValues.adults ||
    searchRequest.adults ||
    searchRequest.adultCount ||
    storedHotelSearch.adults ||
    storedHotelSearch.initPayload?.rooms?.[0]?.adults ||
    1;
  const children =
    urlSearchValues.children ||
    searchRequest.children ||
    searchRequest.childCount ||
    storedHotelSearch.children ||
    storedHotelSearch.initPayload?.rooms?.[0]?.children ||
    0;
  const initialGuestState = useMemo(() => {
    const storedRooms = Array.isArray(storedHotelSearch.initPayload?.rooms)
      ? storedHotelSearch.initPayload.rooms
      : Array.isArray(searchRequest.searchContext?.rooms)
        ? searchRequest.searchContext.rooms
        : [];
    const knownChildAges = normalizeChildAges(
      urlSearchValues.childAges ||
        searchRequest.childAges ||
        searchRequest.childrenAges ||
        storedHotelSearch.childAges ||
        storedHotelSearch.childrenAges,
    );
    const roomCount = Number(
      urlSearchValues.rooms ||
        searchRequest.rooms ||
        storedHotelSearch.rooms ||
        storedRooms.length ||
        1,
    );
    const adultCount = Number(
      urlSearchValues.adults ||
        searchRequest.adults ||
        storedHotelSearch.adults ||
        storedRooms.reduce((sum, room) => sum + Number(room.adults || room.numOfAdults || 0), 0) ||
        1,
    );
    const childCount = Number(
      urlSearchValues.children ||
        searchRequest.children ||
        storedHotelSearch.children ||
        storedRooms.reduce(
          (sum, room) => sum + Number(room.children || room.numOfChildren || 0),
          0,
        ) ||
        0,
    );
    const sourceRooms = storedRooms.length
      ? storedRooms
      : childCount > 0
        ? [{ adults: adultCount, children: childCount, childAges: knownChildAges }]
        : [];
    const normalizedRooms = buildAvailabilityRooms({
      roomCount,
      adults: adultCount,
      children: childCount,
      sourceRooms,
    });

    return {
      room: normalizedRooms.length,
      adults: adultCount,
      children: childCount,
      childAges: normalizedRooms.flatMap((room) => room.childAges || []),
      rooms: normalizedRooms,
      pets: Number(storedHotelSearch.pets || searchRequest.pets || 0),
    };
  }, [searchRequest, storedHotelSearch, urlSearchValues]);
  const effectiveSelection = useMemo(
    () => {
      const effectiveRoomCount = selectionOverride?.rooms || rooms;
      const effectiveAdultCount = selectionOverride?.adults || adults;
      const effectiveChildCount = selectionOverride?.children || children;
      const sourceRoomDetails =
        Array.isArray(selectionOverride?.roomDetails) &&
        selectionOverride.roomDetails.length
          ? selectionOverride.roomDetails
          : [
              {
                adults: effectiveAdultCount,
                children: effectiveChildCount,
                childAges:
                  selectionOverride?.childAges || initialGuestState.childAges || [],
              },
            ];
      const roomDetails = buildAvailabilityRooms({
        roomCount: effectiveRoomCount,
        adults: effectiveAdultCount,
        children: effectiveChildCount,
        sourceRooms: sourceRoomDetails,
      });

      return {
        checkIn: selectionOverride?.checkIn || apiCheckIn,
        checkOut: selectionOverride?.checkOut || apiCheckOut,
        rooms: Number(effectiveRoomCount) || 1,
        adults: Number(effectiveAdultCount) || 1,
        children: Number(effectiveChildCount) || 0,
        childAges: roomDetails.flatMap((room) => room.childAges || []),
        roomDetails,
      };
    },
    [adults, apiCheckIn, apiCheckOut, children, initialGuestState, rooms, selectionOverride],
  );
  const {
    checkIn: effectiveCheckIn,
    checkOut: effectiveCheckOut,
    rooms: effectiveRooms,
    adults: effectiveAdults,
    children: effectiveChildren,
  } = effectiveSelection;
  const roomSelectionPassengers = useMemo(
    () => ({
      room: effectiveRooms,
      adults: effectiveAdults,
      children: effectiveChildren,
      childAges: effectiveSelection.childAges || [],
      rooms: effectiveSelection.roomDetails || [],
      pets: Number(initialGuestState.pets || 0),
    }),
    [effectiveAdults, effectiveChildren, effectiveRooms, effectiveSelection, initialGuestState.pets],
  );
  const effectiveCheckInDisplay = useMemo(
    () => formatDisplayDate(effectiveCheckIn, "Check-in"),
    [effectiveCheckIn],
  );
  const effectiveCheckOutDisplay = useMemo(
    () => formatDisplayDate(effectiveCheckOut, "Check-out"),
    [effectiveCheckOut],
  );
  const nights = useMemo(
    () => getNightCount(effectiveCheckIn, effectiveCheckOut),
    [effectiveCheckIn, effectiveCheckOut],
  );
  const selectedRooms = useMemo(
    () => {
      const maxRooms = Math.max(1, Number(effectiveRooms) || 1);
      let remainingRooms = maxRooms;

      return roomList.reduce((rooms, room) => {
        if (remainingRooms <= 0) return rooms;

        const roomUnits = Math.max(1, Number(room.roomUnits || 1));
        const quantity = Math.min(
          Number(room.quantity || 0),
          Math.floor(remainingRooms / roomUnits),
        );
        if (quantity <= 0) return rooms;

        remainingRooms -= quantity * roomUnits;
        rooms.push({ ...room, quantity, roomUnits });
        return rooms;
      }, []);
    },
    [effectiveRooms, roomList],
  );
  const selectedRoomQuantities = useMemo(
    () =>
      roomList.reduce((quantities, room) => {
        quantities[room.id] = Number(room.quantity || 0);
        return quantities;
      }, {}),
    [roomList],
  );
  const maxSelectableRoomCount = Math.max(1, Number(effectiveRooms) || 1);
  const isBookingActionLoading =
    availabilityChecking || roomsLoading || bookingActionLoading;
  const lastAvailabilitySignatureRef = useRef(
    buildAvailabilitySignature({
      checkIn: apiCheckIn,
      checkOut: apiCheckOut,
      rooms,
      adults,
      children,
      childAges: initialGuestState.childAges,
    }),
  );
  const sectionRefs = useMemo(
    () => ({
      Description: descriptionRef,
      Amenities: amenitiesRef,
      Rooms: roomsRef,
      Reviews: reviewsRef,
      "HOTEL POLICY": policyRef,
    }),
    [],
  );
  const tabs = useMemo(() => Object.keys(sectionRefs), [sectionRefs]);

  const saveBookingSession = useCallback(() => {
    if (typeof window === "undefined") return;

    const searchTracingKey = getFirstValue(
      urlSearchValues.roomsSearchTracingKey,
      urlSearchValues.searchTracingKey,
      urlSearchValues.TUI,
      selectedRooms[0]?.roomsSearchTracingKey,
      selectedRooms[0]?.searchTracingKey,
      selectedRooms[0]?.TUI,
      hotelDetail?.roomsSearchTracingKey,
      searchRequest.roomsSearchTracingKey,
      searchRequest.searchTracingKey,
      searchRequest.TUI,
    );
    const roomsWithTracingKey = selectedRooms.map((room) => ({
      ...room,
      roomsSearchTracingKey: getFirstValue(room.roomsSearchTracingKey, searchTracingKey),
      searchTracingKey: getFirstValue(room.searchTracingKey, searchTracingKey),
      TUI: getFirstValue(room.TUI, searchTracingKey),
    }));
    const latestAvailabilityResponse =
      availabilityResponseRef.current || storedHotelSearch.availabilityResponse || null;
    const latestHotelSearchId = getFirstValue(
      latestAvailabilityResponse?.hotelSearchId,
      latestAvailabilityResponse?.hotel_search_id,
      latestAvailabilityResponse?.hotel_search_key,
      urlSearchValues.hotelSearchId,
      searchRequest.hotelSearchId,
    );
    const latestStoredHotelSearch = {
      ...storedHotelSearch,
      ...(latestAvailabilityResponse
        ? { availabilityResponse: latestAvailabilityResponse }
        : {}),
      ...(latestHotelSearchId ? { hotelSearchId: latestHotelSearchId } : {}),
    };

    const payload = {
      hotel: {
        id: hotelDetail?.id || "",
        name: hotelDetail?.name || "Hotel",
        address: hotelDetail?.address || "",
        rating: hotelDetail?.rating || 0,
        reviewText: hotelDetail?.reviewText || "",
        image: hotelDetail?.images?.[0] || "/images/hotelArt1.png",
      },
      request: {
        ...searchRequest,
        searchContext: latestStoredHotelSearch,
        initResponse: latestStoredHotelSearch.initResponse,
        searchId: getFirstValue(urlSearchValues.searchId, searchRequest.searchId),
        hotelId: getFirstValue(urlSearchValues.hotelId, searchRequest.hotelId, hotelDetail?.id),
        hotelSearchId: latestHotelSearchId,
        priceProvider: getFirstValue(
          urlSearchValues.priceProvider,
          searchRequest.priceProvider,
        ),
        roomsSearchId:
          selectedRooms[0]?.roomsSearchId ||
          hotelDetail?.roomsSearchId ||
          searchRequest.roomsSearchId ||
          urlSearchValues.searchId ||
          searchRequest.searchId ||
          "",
        roomsSearchTracingKey: searchTracingKey,
        searchTracingKey,
        TUI: searchTracingKey,
        checkInDate: effectiveCheckIn,
        checkOutDate: effectiveCheckOut,
        checkIn: effectiveCheckInDisplay,
        checkOut: effectiveCheckOutDisplay,
        nights,
        rooms: effectiveRooms,
        adults: effectiveAdults,
        children: effectiveChildren,
        childAges: effectiveSelection.childAges,
        roomDetails: effectiveSelection.roomDetails,
        availabilityResponse: latestAvailabilityResponse,
      },
      rooms: roomsWithTracingKey,
    };

    writeHotelBookingSession(payload);
  }, [
    effectiveAdults,
    effectiveCheckIn,
    effectiveCheckInDisplay,
    effectiveCheckOut,
    effectiveCheckOutDisplay,
    effectiveChildren,
    effectiveRooms,
    effectiveSelection,
    hotelDetail,
    nights,
    searchRequest,
    selectedRooms,
    storedHotelSearch,
    urlSearchValues,
  ]);

  const handleBookNow = useCallback(() => {
    if (isBookingActionLoading) return false;

    setBookingActionLoading(true);
    saveBookingSession();
    return true;
  }, [isBookingActionLoading, saveBookingSession]);

  const handleSelectRoom = useCallback(async (selection) => {
     console.log("selection4", selection);
    if (isBookingActionLoading) return;

    if (!selection?.checkIn || !selection?.checkOut) {
      toast.error("Please select check-in and check-out dates.");
      return;
    }

    const nextSelection = {
      checkIn: selection.checkIn,
      checkOut: selection.checkOut,
      rooms: Number(selection.rooms) || 1,
      adults: Number(selection.adults) || 1,
      children: Number(selection.children) || 0,
      childAges: Array.isArray(selection.childAges) ? selection.childAges : [],
      roomDetails: Array.isArray(selection.roomDetails) ? selection.roomDetails : [],
    };
    const nextSignature = buildAvailabilitySignature(nextSelection);

    if (nextSignature === lastAvailabilitySignatureRef.current) {
      return;
    }

    const payload = buildHotelAvailabilityPayload({
      hotelDetail,
      storedHotelSearch,
      selection: nextSelection,
    });

    if (!payload.hotelId || !payload.priceProvider || !payload.checkIn || !payload.checkOut) {
      toast.error("Missing hotel details needed to check availability.");
      return;
    }

    setAvailabilityChecking(true);
    setSelectionOverride(nextSelection);
    setShowSummary(false);
    updateHotelDetailUrlParams(nextSelection);

    try {
      const response = await refreshHotelAvailability(payload);
      availabilityResponseRef.current = response;

      lastAvailabilitySignatureRef.current = nextSignature;
      updateHotelDetailUrlParams(nextSelection, response);

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          HOTEL_SEARCH_SESSION_KEY,
          JSON.stringify({
            ...storedHotelSearch,
            checkIn: nextSelection.checkIn,
            checkOut: nextSelection.checkOut,
            rooms: nextSelection.rooms,
            adults: nextSelection.adults,
            children: nextSelection.children,
            childAges: nextSelection.childAges,
            hotelSearchId: getFirstValue(
              response?.hotelSearchId,
              response?.hotel_search_id,
              response?.hotel_search_key,
              storedHotelSearch.hotelSearchId,
            ),
            initPayload: {
              ...(storedHotelSearch.initPayload || {}),
              ...payload,
            },
            availabilityResponse: response,
          }),
        );
      }
    } catch (error) {
      toast.error(error.message || "Unable to check hotel availability.");
    } finally {
      setAvailabilityChecking(false);
    }
  }, [hotelDetail, isBookingActionLoading, refreshHotelAvailability, storedHotelSearch]);

  const handleRoomSearchCardAction = useCallback(
    (selection) => {
      if (selectedRooms.length) {
        setShowSummary(true);
        setShowRoomSearchCard(false);
        return;
      }

      handleSelectRoom(selection);
    },
    [handleSelectRoom, selectedRooms.length],
  );

  useEffect(() => {
    if (!hotelDetail?.rooms?.length) return;

    setRoomList(
      hotelDetail.rooms.map((room) => {
        const occupancyGuestCount = Array.isArray(room.occupancies)
          ? room.occupancies.reduce(
              (total, occupancy) =>
                total +
                Number(occupancy.numOfAdults || occupancy.NumOfAdults || 0) +
                Number(occupancy.numOfChildren || occupancy.NumOfChildren || 0),
              0,
            )
          : 0;
        const displayedGuestCount =
          Number(String(room.persons || "").match(/\d+/)?.[0]) || 0;

        return {
          id: room.id,
          title: room.title,
          image: room.image?.[0]?.img || "/images/hotelArt1.png",
          pricePerNight: parseCurrencyNumber(room.price?.offer),
          publishedRate: Number(room.price?.actualAmount) || parseCurrencyNumber(room.price?.actual),
          taxPerNight: Number(room.price?.taxAmount) || 0,
          rateIncludesTax: Boolean(room.price?.rateIncludesTax),
          quantity: 0,
          maxQuantity: room.isCombo ? 1 : Number(room.availability) || 1,
          isCombo: Boolean(room.isCombo),
          comboRoomCount: Number(room.comboRoomCount) || 1,
          roomUnits: Math.max(1, Number(room.roomUnits || room.comboRoomCount || 1)),
          comboRooms: room.comboRooms || [],
          nights,
          roomId: room.roomId,
          roomGroupId: room.roomGroupId,
          recommendationId: room.recommendationId,
          supplierName: room.supplierName,
          providerName: room.providerName || room.supplierName,
          priceProvider: room.priceProvider || room.providerName || room.supplierName,
          guestCode: room.guestCode,
          roomsSearchId: room.roomsSearchId || hotelDetail?.roomsSearchId || "",
          roomsSearchTracingKey: getFirstValue(
            urlSearchValues.roomsSearchTracingKey,
            urlSearchValues.searchTracingKey,
            urlSearchValues.TUI,
            room.roomsSearchTracingKey,
            room.searchTracingKey,
            room.TUI,
            hotelDetail?.roomsSearchTracingKey,
            searchRequest.roomsSearchTracingKey,
            searchRequest.searchTracingKey,
            searchRequest.TUI,
          ),
          occupancies: room.occupancies,
          raw: room.raw,
          rawRecommendation: room.rawRecommendation,
          rawRoomGroup: room.rawRoomGroup,
          rawCategoryRooms: room.rawCategoryRooms,
          maxGuestAllowed: displayedGuestCount || occupancyGuestCount || 1,
          netAmount: parseCurrencyNumber(room.price?.offer),
        };
      }),
    );
  }, [
    hotelDetail?.rooms,
    hotelDetail?.roomsSearchId,
    hotelDetail?.roomsSearchTracingKey,
    nights,
    searchRequest,
    urlSearchValues,
  ]);
  const removeRoom = useCallback((id) => {
    setRoomList((prev) => {
      const nextRooms = prev.map((room) =>
        room.id === id ? { ...room, quantity: 0 } : room,
      );

      setShowSummary(nextRooms.some((room) => room.quantity > 0));
      return nextRooms;
    });
  }, []);
  const handleRoomQuantityChange = useCallback((id, quantity) => {
    setRoomList((prev) => {
      const requestedQuantity = Math.max(0, Number(quantity) || 0);
      const targetRoom = prev.find((room) => room.id === id);

      if (!targetRoom) return prev;

      const roomUnits = Math.max(1, Number(targetRoom.roomUnits || 1));
      const otherRoomTotal = prev.reduce(
        (total, room) =>
          room.id === id
            ? total
            : total + Number(room.quantity || 0) * Math.max(1, Number(room.roomUnits || 1)),
        0,
      );
      const allowedQuantity = Math.min(
        requestedQuantity,
        Math.floor(Math.max(0, maxSelectableRoomCount - otherRoomTotal) / roomUnits),
      );
      const maxTargetQuantity = Math.max(1, Number(targetRoom.maxQuantity || 1));

      if (
        requestedQuantity > 0 &&
        allowedQuantity <= 0 &&
        roomUnits <= maxSelectableRoomCount
      ) {
        const replacementQuantity = Math.min(
          requestedQuantity,
          maxTargetQuantity,
          Math.floor(maxSelectableRoomCount / roomUnits),
        );
        const nextRooms = prev.map((room) =>
          room.id === id
            ? { ...room, quantity: replacementQuantity }
            : { ...room, quantity: 0 },
        );

        setShowSummary(replacementQuantity > 0);
        return nextRooms;
      }

      const nextRooms = prev.map((room) =>
        room.id === id ? { ...room, quantity: allowedQuantity } : room,
      );

      setShowSummary(nextRooms.some((room) => room.quantity > 0));
      return nextRooms;
    });
  }, [maxSelectableRoomCount]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);

    const section = sectionRefs[tab]?.current;
    if (!section || typeof window === "undefined") return;

    window.scrollTo({
      top: section.getBoundingClientRect().top + window.scrollY - TAB_SCROLL_OFFSET,
      behavior: "smooth",
    });
  }, [sectionRefs]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(max-width: 1280px)");
    const syncRoomSearchCard = () => {
      setShowRoomSearchCard(!mediaQuery.matches);
    };

    syncRoomSearchCard();
    mediaQuery.addEventListener("change", syncRoomSearchCard);

    return () => {
      mediaQuery.removeEventListener("change", syncRoomSearchCard);
    };
  }, []);
  return (
    <>
      {/* <Tabs
        tabs={[
          "Description",
          "Amenities",
          "Rooms",
          "Location",
          "Reviews",
          "HOTEL POLICY",
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      /> */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
      />
      {/* SECTION 1: contentWrapper */}
      <main className={styles.contentWrapper}>
        <div className={styles.leftContent}>
          <section ref={sectionRefs.Description}>
            <DescriptionComponent
              description={hotelDetail?.description}
              descriptions={hotelDetail?.descriptions}
            />
          </section>
          <section ref={sectionRefs.Amenities}>
            <Amenities amenities={hotelDetail?.amenities} />
          </section>
          <section ref={sectionRefs.Rooms}>
            <AvailabilityComponent
              rooms={hotelDetail?.rooms || []}
              roomGroups={hotelDetail?.roomGroups || []}
              loading={roomsLoading}
              errorMessage={hotelDetail?.roomsErrorMessage}
              actionDisabled={isBookingActionLoading}
              roomQuantities={selectedRoomQuantities}
              maxSelectableRooms={maxSelectableRoomCount}
              onRoomQuantityChange={handleRoomQuantityChange}
            />
          </section>
        </div>

        <div
          className={`${styles.rightSidebar} ${
            showSummary ? styles.summarySidebar : ""
          } ${
            showRoomSearchCard ? styles.roomSearchOpen : styles.roomSearchClosed
          }`}
        >
          {!showSummary && (
            <button
              className={styles.roomSearchToggle}
              type="button"
              onClick={() => setShowRoomSearchCard((prev) => !prev)}
            >
              {showRoomSearchCard ? "Hide room search" : "Check room"}
            </button>
          )}
          <div
            className={`${styles.roomWrapper} ${
              showSummary || !showRoomSearchCard ? styles.hide : ""
            }`}
          >
            <RoomSelectionCard
              onBookNow={handleRoomSearchCardAction}
              checkingAvailability={availabilityChecking || roomsLoading}
              checkIn={effectiveCheckIn}
              checkOut={effectiveCheckOut}
              rooms={effectiveRooms}
              adults={effectiveAdults}
              children={effectiveChildren}
              initialPassengers={roomSelectionPassengers}
            />
          </div>

          {/* Booking Summary */}
          <div
            className={`${styles.summaryWrapper} ${
              showSummary ? styles.show : ""
            }`}
          >
            <BookingSummary
              roomList={selectedRooms}
              checkInDate={effectiveCheckIn}
              nights={nights}
              onRemove={removeRoom}
              onBookNow={handleBookNow}
              bookingLoading={isBookingActionLoading}
            />
          </div>
        </div>
      </main>

      {/* SECTION 2: OUTSIDE contentWrapper */}
      <section
        className={styles.policySection}
        ref={sectionRefs["HOTEL POLICY"]}
      >
        <HotelPolicies
          policies={hotelDetail?.policies}
          hotelName={hotelDetail?.name}
        />
      </section>

      <section className={styles.Reviews} ref={sectionRefs.Reviews}>
        <CustomerReviews  Reviews={hotelDetail?.reviews} />
      </section>
      <BarcelonaSection />
    </>
  );
};

export default Page;

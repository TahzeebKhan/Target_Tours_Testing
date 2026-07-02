"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./ReviewPage.module.css";

import { toast } from "react-toastify";
import TravelInsuranceOption from "@/app/flight-booking-details/components/passengerDetails/fareDetailsExpandable/component/travelInsuranceOption/TravelInsuranceOption";
import CancellationPenalty from "@/app/flight-booking-details/components/passengerDetails/fareDetailsExpandable/component/cancellationPenalty/CancellationPenalty";
import RoomPriceRow from "./components/roomPriceRow/RoomPriceRow";
import TravelerDetails from "./components/travelerDetails/TravelerDetails";
import CancellationPolicy from "./components/cancellationPolicy/CancellationPolicy";
import HotelPolicy from "./components/hotelPolicy/HotelPolicy";
import PriceChangeModal from "./components/priceChangeModal/PriceChangeModal";
import { useRoom } from "@/app/context/RoomContext";
import { useAuth } from "@/app/context/AuthContext";
import {
  HOTEL_SEARCH_RESULTS_KEY,
  HOTEL_SEARCH_SESSION_KEY,
  startHotelBooking,
  HotelPaymentStart,
  clearHotelBookingStatus,
  getHotelPaymentGateways,
  markHotelBookingPaymentStarted,
  markHotelBookingSubmitStarted,
  writePendingHotelConfirmBooking,
} from "@/shared/services/hotelSearch";
import { CountryCodes } from "@/app/profile/components/profileSection/CountryName";

const fallbackHotelStartBookingPayload = {
  TUI: "cc6a2275-d39c-43ce-a57e-316e3f6b4070",
  ServiceEnquiry: "",
  ContactInfo: {
    Title: "Mr",
    FName: "TEST",
    LName: "AV",
    Mobile: "8590055610",
    Email: "robin@benzyinfotech.com",
    Address: "MRRA 4  EDAPPALLY  Edappally , EDAPPALLY , Edappally",
    State: "Kerala",
    City: "Cochin",
    PIN: "6865245",
    GSTCompanyName: "",
    GSTTIN: "",
    GSTMobile: "",
    GSTEmail: "",
    UpdateProfile: true,
    IsGuest: false,
    CountryCode: "IN",
    MobileCountryCode: "+91",
    NetAmount: "",
    DestMobCountryCode: "",
    DestMob: "",
  },
  Auxiliaries: [
    {
      Code: "PROMO",
      Parameters: [
        { Type: "Code", Value: "" },
        { Type: "ID", Value: "" },
        { Type: "Amount", Value: "" },
      ],
    },
    {
      Code: "CUSTOMER DETAILS",
      parameters: [
        { Type: "Nationality", Value: "IN" },
        { Type: "Country of Residence", Value: "IN" },
      ],
    },
  ],
  Rooms: [
    {
      RoomId: "2247c12a-bb99-42fe-8bd3-0e45fc3e17cc",
      GuestCode: "|1|1:A:25|",
      SupplierName: "Sabre",
      RoomGroupId: "c6b6658c-b413-4175-bfc1-140e3475f9f9",
      Guests: [
        {
          GuestID: "0",
          Operation: "U",
          Title: "Ms",
          FirstName: "REXY",
          MiddleName: "",
          LastName: "RAJU",
          MobileNo: "",
          PaxType: "A",
          Age: "25",
          Email: "",
          Pan: "",
        },
      ],
    },
  ],
  NetAmount: "862576",
  ClientID: "FVI6V120g22Ei5ztGK0FIQ==",
  DeviceID: "",
  AppVersion: "",
  SearchId: "05f95641-197f-4719-901e-bc878ac6d2bf.UcPgZrc4QDFQO_g5L_EzkEYBHlHFapV_nr-j8m8_0rU",
  RecommendationId: "e77812cb-10df-424c-adfd-924c917298be",
  LocationName: null,
  HotelCode: "39743918",
  CheckInDate: "2026-09-09",
  CheckOutDate: "2026-10-10",
  TravelingFor: "NTF",
};

const toApiDate = (value) => {
  if (!value) return "";
  const text = String(value).trim();

  if (["check-in", "check-out"].includes(text.toLowerCase())) {
    return "";
  }

  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const [first, second, year] = text.split(/[/-]/);
  if (first && second && year) {
    const firstNumber = Number(first);
    const secondNumber = Number(second);
    const isMonthFirst = firstNumber <= 12 && secondNumber > 12;
    const day = isMonthFirst ? second : first;
    const month = isMonthFirst ? first : second;

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);

  return value;
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

const readStoredHotelResults = () => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(HOTEL_SEARCH_RESULTS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const findDeepValue = (value, key, depth = 0, seen = new WeakSet()) => {
  if (!value || typeof value !== "object" || depth > 6) return "";
  if (seen.has(value)) return "";
  seen.add(value);

  if (!Array.isArray(value) && value[key]) return value[key];

  const entries = Array.isArray(value) ? value : Object.values(value);
  for (const entry of entries) {
    const found = findDeepValue(entry, key, depth + 1, seen);
    if (found) return found;
  }

  return "";
};

const findFirstDeepValue = (value, keys = []) => {
  for (const key of keys) {
    const found = findDeepValue(value, key);
    if (found) return found;
  }

  return "";
};

const getHotelInitData = ({
  request = {},
  storedHotelSearch = {},
  storedHotelResults = {},
}) => {
  const candidates = [
    storedHotelResults.data?.init,
    storedHotelResults.data?.content?.init,
    storedHotelResults.content?.init,
    storedHotelResults.init,
    request.init,
    request.searchContext?.init,
    storedHotelSearch.init,
    request.initResponse?.init,
    request.initResponse?.data?.init,
    request.initResponse?.content?.init,
    request.initResponse?.data?.content?.init,
    request.searchContext?.initResponse?.init,
    request.searchContext?.initResponse?.data?.init,
    request.searchContext?.initResponse?.content?.init,
    request.searchContext?.initResponse?.data?.content?.init,
    storedHotelSearch.initResponse?.init,
    storedHotelSearch.initResponse?.data?.init,
    storedHotelSearch.initResponse?.content?.init,
    storedHotelSearch.initResponse?.data?.content?.init,
  ];

  return candidates.find((item) => item && typeof item === "object") || {};
};

const pickApiDate = (...values) => {
  for (const value of values) {
    const apiDate = toApiDate(value);
    if (apiDate) return apiDate;
  }

  return "";
};

const toRefreshDate = (value) => {
  const apiDate = toApiDate(value);
  if (!apiDate) return "";

  const [year, month, day] = String(apiDate).split("-");
  if (year && month && day) return `${month}/${day}/${year}`;

  return value;
};

const getResponseValue = (response, key) =>
  response?.[key] ||
  response?.data?.[key] ||
  response?.result?.[key] ||
  response?.data?.result?.[key] ||
  "";

const gatewayMeta = {
  phonepe: {
    label: "PhonePe",
    image: "/images/phonepeLogo.png",
  },
  razorpay: {
    label: "Razorpay",
    image: "/images/razorpay-icon.png",
  },
};

const normalizeGateway = (gateway) => {
  const value =
    typeof gateway === "string"
      ? gateway
      : gateway?.code ||
        gateway?.name ||
        gateway?.gateway ||
        gateway?.payment_gateway ||
        gateway?.paymentGateway ||
        "";

  return String(value || "").trim().toLowerCase();
};

const normalizeGatewayList = (payload) => {
  const data = payload?.data || payload || {};
  const gateways = Array.isArray(data?.available_gateways)
    ? data.available_gateways
    : Array.isArray(data?.gateways)
      ? data.gateways
      : Array.isArray(data)
        ? data
        : [];
  const availableGateways = gateways.map(normalizeGateway).filter(Boolean);

  return {
    defaultGateway: normalizeGateway(
      data?.default_gateway ||
        data?.defaultGateway ||
        availableGateways.find((gateway) => gateway === "phonepe") ||
        availableGateways[0],
    ),
    availableGateways,
  };
};

const formatGatewayLabel = (gateway) =>
  gatewayMeta[gateway]?.label ||
  String(gateway || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getHotelPaymentReturnUrl = () => {
  if (process.env.NEXT_PUBLIC_HOTEL_PAYMENT_REDIRECT_URL) {
    return process.env.NEXT_PUBLIC_HOTEL_PAYMENT_REDIRECT_URL;
  }

  if (process.env.NEXT_PUBLIC_PAYMENT_REDIRECT_URL) {
    return process.env.NEXT_PUBLIC_PAYMENT_REDIRECT_URL;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/hotel-booking-success`;
  }

  return "";
};

const getPaymentRedirectUrl = (response) =>
  getFirstValue(
    response?.redirectUrl,
    response?.redirect_url,
    response?.paymentUrl,
    response?.payment_url,
    response?.url,
    response?.data?.redirectUrl,
    response?.data?.redirect_url,
    response?.data?.paymentUrl,
    response?.data?.payment_url,
    response?.data?.url,
    response?.data?.instrumentResponse?.redirectInfo?.url,
    response?.instrumentResponse?.redirectInfo?.url,
  );

const getPaymentMerchantOrderId = (response) =>
  getFirstValue(
    response?.merchantOrderId,
    response?.merchant_order_id,
    response?.data?.merchantOrderId,
    response?.data?.merchant_order_id,
    response?.data?.payment?.merchantOrderId,
    response?.payment?.merchantOrderId,
  );

const formatAmount = (value) => {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return "0";

  return amount.toFixed(2).replace(/\.00$/, "");
};

const toAmountNumber = (value) => {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? Number(amount.toFixed(2)) : 0;
};

const parsePriceChange = (response) => {
  const message =
    getResponseValue(response, "Pricemessage") ||
    response?.data?.priceInfo?.Pricemessage ||
    response?.priceInfo?.Pricemessage ||
    "";
  const oldFare = Number(String(message).match(/OldFare:([^|]+)/i)?.[1]);
  const newFare = Number(String(message).match(/NewFare:([^|]+)/i)?.[1]);

  if (!Number.isFinite(oldFare) || !Number.isFinite(newFare) || newFare <= oldFare) {
    return null;
  }

  return {
    oldFare,
    newFare,
    difference: newFare - oldFare,
  };
};

const getOccupancyValue = (occupancy = {}, ...keys) => {
  for (const key of keys) {
    const value = occupancy[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }

  return "";
};

const normalizeChildAges = (childAges) => {
  if (Array.isArray(childAges)) return childAges;
  if (typeof childAges === "string") {
    return childAges
      .split(/[:,|]/)
      .map((age) => age.trim())
      .filter(Boolean);
  }

  return [];
};

const getFirstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "") || "";

const isPlaceholderText = (value) =>
  ["check-in", "check-out", "hotel", "address not available"].includes(
    String(value || "").trim().toLowerCase(),
  );

const getDisplayValue = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text && !isPlaceholderText(text)) return text;
  }

  return "";
};

const formatBookingDisplayDate = (value, fallback) => {
  const apiDate = toApiDate(value);
  if (!apiDate) return fallback;

  const date = new Date(`${apiDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value || fallback;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getNightCountFromDates = (checkInValue, checkOutValue) => {
  const checkInDate = toApiDate(checkInValue);
  const checkOutDate = toApiDate(checkOutValue);
  if (!checkInDate || !checkOutDate) return 0;

  const start = new Date(`${checkInDate}T00:00:00`);
  const end = new Date(`${checkOutDate}T00:00:00`);
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    return 0;
  }

  return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
};

const normalizeRefreshRooms = (rooms, request = {}) => {
  const roomList = Array.isArray(rooms) && rooms.length ? rooms : [];
  if (roomList.length) {
    return roomList.map((room) => ({
      adults: String(getFirstValue(room.adults, room.numOfAdults, room.NumOfAdults, 1)),
      children: String(
        getFirstValue(room.children, room.numOfChildren, room.NumOfChildren, 0),
      ),
      childAges: normalizeChildAges(
        getFirstValue(room.childAges, room.childrenAges, room.ChildAges, []),
      ),
    }));
  }

  return [
    {
      adults: String(getFirstValue(request.adults, request.adultCount, 1)),
      children: String(getFirstValue(request.children, request.childCount, 0)),
      childAges: normalizeChildAges(request.childAges || request.childrenAges),
    },
  ];
};

const normalizeRefreshLocation = ({ sourcePayload = {}, searchContext = {}, storedHotelSearch = {}, location = {}, lat, long }) => {
  const sourceLocation =
    (Array.isArray(sourcePayload.locations) && sourcePayload.locations[0]) ||
    (Array.isArray(searchContext.locations) && searchContext.locations[0]) ||
    (Array.isArray(storedHotelSearch.locations) && storedHotelSearch.locations[0]) ||
    sourcePayload.location ||
    searchContext.location ||
    storedHotelSearch.location ||
    location ||
    {};
  const hasCoordinates = lat !== "" && long !== "";

  return {
    id: String(
      getFirstValue(
        sourceLocation.id,
        sourceLocation.locationId,
        sourcePayload.locationId,
        searchContext.locationId,
        storedHotelSearch.locationId,
      ),
    ),
    name: getFirstValue(sourceLocation.name, sourceLocation.label, sourceLocation.value),
    fullName: getFirstValue(
      sourceLocation.fullName,
      sourceLocation.full_name,
      sourceLocation.detail,
      sourceLocation.name,
      sourceLocation.label,
      sourceLocation.value,
    ),
    code: sourceLocation.code ?? null,
    type: getFirstValue(sourceLocation.type, "city"),
    city: sourceLocation.city ?? null,
    state: sourceLocation.state ?? null,
    country: getFirstValue(sourceLocation.country, sourcePayload.destinationCountryCode, "IN"),
    score: Number(sourceLocation.score || 0),
    referenceId: sourceLocation.referenceId ?? null,
    ...(hasCoordinates
      ? {
          coordinates: {
            lat: Number(lat),
            long: Number(long),
          },
        }
      : {}),
  };
};

const buildRefreshSessionPayload = ({
  request = {},
  storedHotelSearch = {},
  checkInDate,
  checkOutDate,
}) => {
  const searchContext = request.searchContext || {};
  const sourcePayload = searchContext.initPayload || storedHotelSearch.initPayload || {};
  const location =
    searchContext.location ||
    storedHotelSearch.location ||
    sourcePayload.location ||
    {};
  const geoCode = sourcePayload.geoCode || location.geoCode || request.geoCode || {};
  const lat = getFirstValue(geoCode.lat, geoCode.latitude, location.lat, location.latitude);
  const long = getFirstValue(
    geoCode.long,
    geoCode.lng,
    geoCode.longitude,
    location.long,
    location.lng,
    location.longitude,
  );
  const resolvedLocation = normalizeRefreshLocation({
    sourcePayload,
    searchContext,
    storedHotelSearch,
    location,
    lat,
    long,
  });
  const locationId = String(
    getFirstValue(
      sourcePayload.locationId,
      searchContext.locationId,
      storedHotelSearch.locationId,
      resolvedLocation.id,
      location.locationId,
      location.id,
    ),
  );
  const resolvedGeoCode = {
    lat: lat !== "" ? Number(lat) : "",
    long: long !== "" ? Number(long) : "",
  };

  return {
    domain: getFirstValue(sourcePayload.domain, process.env.NEXT_PUBLIC_DOMAIN, "localhost:1337"),
    locations: [resolvedLocation],
    channel: getFirstValue(sourcePayload.channel, searchContext.channel, storedHotelSearch.channel),
    geoCode: resolvedGeoCode,
    locationId,
    currency: getFirstValue(sourcePayload.currency, "INR"),
    culture: getFirstValue(sourcePayload.culture, "en-US"),
    checkIn: toRefreshDate(checkInDate || sourcePayload.checkIn || searchContext.checkIn),
    checkOut: toRefreshDate(checkOutDate || sourcePayload.checkOut || searchContext.checkOut),
    rooms: normalizeRefreshRooms(sourcePayload.rooms || searchContext.rooms, request),
    agentCode: getFirstValue(sourcePayload.agentCode, "14005"),
    destinationCountryCode: getFirstValue(
      sourcePayload.destinationCountryCode,
      resolvedLocation.country,
      "IN",
    ),
    nationality: getFirstValue(sourcePayload.nationality, "IN"),
    countryOfResidence: getFirstValue(sourcePayload.countryOfResidence, "IN"),
    channelId: getFirstValue(sourcePayload.channelId, "b2bIndiaDeals"),
    affiliateRegion: getFirstValue(sourcePayload.affiliateRegion, "B2B_India"),
    segmentId: getFirstValue(sourcePayload.segmentId, ""),
    companyId: getFirstValue(sourcePayload.companyId, "1"),
    gstPercentage: Number(sourcePayload.gstPercentage || 0),
    tdsPercentage: Number(sourcePayload.tdsPercentage || 0),
  };
};

const getCountryCode = (value) => {
  if (!value) return "";
  if (String(value).startsWith("+")) {
    return CountryCodes.find((country) => country.dial_code === value)?.code || value;
  }

  return value;
};

const getDialCode = (value) => {
  if (!value) return "";
  if (String(value).startsWith("+")) return value;
  return CountryCodes.find((country) => country.code === value)?.dial_code || value;
};

const buildGuestCode = (occupancies = [], guests = [], fallbackOccupancyIndex = 0) => {
  const occupancyList = Array.isArray(occupancies) ? occupancies : [];
  const adultGuests = guests.filter(
    (guest) => String(guest.PaxType || guest.passengerType || "A").toUpperCase() === "A",
  );
  const childGuests = guests.filter(
    (guest) => String(guest.PaxType || guest.passengerType || "").toUpperCase() === "C",
  );
  const occupancyMatchesGuests = (occupancy = {}) => {
    const adults = Number(
      getOccupancyValue(occupancy, "numOfAdults", "NumOfAdults", "adults", "adultCount") || 0,
    );
    const children = Number(
      getOccupancyValue(
        occupancy,
        "numOfChildren",
        "NumOfChildren",
        "children",
        "childCount",
      ) || 0,
    );

    return adults === adultGuests.length && children === childGuests.length;
  };
  const indexedOccupancy =
    occupancyList[Math.max(0, Number(fallbackOccupancyIndex) || 0)] || null;
  const matchedOccupancy = occupancyList.find(occupancyMatchesGuests);
  const occupancy =
    (indexedOccupancy && occupancyMatchesGuests(indexedOccupancy)
      ? indexedOccupancy
      : matchedOccupancy) ||
    occupancyList[0] ||
    {};
  const occupancyId =
    getOccupancyValue(occupancy, "occupancyId", "OccupancyID", "occupancyID", "id") ||
    Math.max(1, Number(fallbackOccupancyIndex || 0) + 1);
  const sections = [];

  if (adultGuests.length > 0) {
    const adultAges = Array.from({ length: adultGuests.length }, () => "25").join(":");
    sections.push(`${adultGuests.length}:A:${adultAges}`);
  }

  if (childGuests.length > 0) {
    const childAges = childGuests
      .map((guest) => String(guest.Age || guest.age || "0"))
      .join(":");
    sections.push(`${childGuests.length}:C:${childAges}`);
  }

  return sections.length
    ? `|${occupancyId}|${sections.join("|")}|`
    : `|${occupancyId}|1:A:25|`;
};

const getOccupancyGuestCount = (occupancy = {}) =>
  Number(
    getOccupancyValue(occupancy, "numOfAdults", "NumOfAdults", "adults", "adultCount") || 0,
  ) +
  Number(
    getOccupancyValue(
      occupancy,
      "numOfChildren",
      "NumOfChildren",
      "children",
      "childCount",
    ) || 0,
  );

const getRoomUnitCount = (room = {}) =>
  Math.max(1, Number(room.roomUnits || room.comboRoomCount || 1));

const getComboRoomOccupancies = (room = {}) => {
  const comboRows = Array.isArray(room.comboRooms) ? room.comboRooms : [];
  const fallbackOccupancies = Array.isArray(room.occupancies) ? room.occupancies : [];
  const expandedOccupancies = comboRows.flatMap((comboRoom) => {
    const count = Math.max(1, Number(comboRoom.count || comboRoom.roomCount || 1));
    const occupancies = Array.isArray(comboRoom.occupancies) && comboRoom.occupancies.length
      ? comboRoom.occupancies
      : fallbackOccupancies;
    const occupancy = occupancies[0] || fallbackOccupancies[0];

    return Array.from({ length: count }, (_, index) => occupancies[index] || occupancy);
  }).filter(Boolean);

  if (expandedOccupancies.length) return expandedOccupancies;
  if (!fallbackOccupancies.length) return [];

  return Array.from(
    { length: getRoomUnitCount(room) },
    (_, index) => fallbackOccupancies[index] || fallbackOccupancies[0],
  );
};

const splitGuestsByOccupancy = (occupancies = [], guests = [], roomEntryCount = 1) => {
  if (!Array.isArray(occupancies) || !occupancies.length) {
    return Array.from({ length: roomEntryCount }, (_, index) =>
      index === 0 ? guests : [],
    );
  }

  let guestCursor = 0;

  return Array.from({ length: roomEntryCount }, (_, index) => {
    const occupancy = occupancies[index] || occupancies[0] || {};
    const guestCount = Math.max(1, getOccupancyGuestCount(occupancy));
    const roomGuests = guests.slice(guestCursor, guestCursor + guestCount);

    guestCursor += guestCount;

    return roomGuests.length ? roomGuests : guests.slice(0, guestCount);
  });
};

const getRoomApiValue = (room = {}, detailRoom = {}, rawDetailRoom = {}, key, fallback = "") =>
  getFirstValue(
    detailRoom[key],
    rawDetailRoom[key],
    rawDetailRoom.room?.[key],
    room[key],
    room.raw?.[key],
    room.raw?.room?.[key],
    fallback,
  );

const getRoomApiId = (room = {}, detailRoom = {}, rawDetailRoom = {}, fallback = "") =>
  getFirstValue(
    rawDetailRoom.roomId,
    rawDetailRoom.RoomId,
    rawDetailRoom.room?.roomId,
    rawDetailRoom.room?.RoomId,
    rawDetailRoom.room?.id,
    rawDetailRoom.id,
    detailRoom.roomId,
    detailRoom.RoomId,
    room.roomId,
    room.RoomId,
    fallback,
  );

const getComboDetailRoomForEntry = (comboDetailRows = [], entryIndex = 0) => {
  let coveredEntries = 0;

  return (
    comboDetailRows.find((comboRoom) => {
      coveredEntries += Math.max(1, Number(comboRoom.count || comboRoom.roomCount || 1));
      return entryIndex < coveredEntries;
    }) || {}
  );
};

const buildStartBookingRooms = (selectedRooms = [], roomGuests = {}, contact = {}) =>
  selectedRooms.flatMap((room, roomIndex) => {
    const guests = roomGuests[room.id] || [];
    const roomUnits = getRoomUnitCount(room);
    const quantity = Math.max(1, Number(room.quantity || 1));
    const roomEntryCount = roomUnits * quantity;
    const comboDetailRows = Array.isArray(room.comboRooms) ? room.comboRooms : [];
    const occupancies = getComboRoomOccupancies(room);
    const guestGroups = splitGuestsByOccupancy(occupancies, guests, roomEntryCount);

    return Array.from({ length: roomEntryCount }, (_, entryIndex) => {
      const detailRoom = getComboDetailRoomForEntry(comboDetailRows, entryIndex);
      const rawDetailRoom = detailRoom.raw || {};
      const entryGuests = guestGroups[entryIndex] || guests;

      return {
        RoomId: getRoomApiId(room, detailRoom, rawDetailRoom, room.roomId || room.id || ""),
        GuestCode: buildGuestCode(occupancies, entryGuests, entryIndex || roomIndex),
        SupplierName: getFirstValue(
          getRoomApiValue(room, detailRoom, rawDetailRoom, "supplierName"),
          getRoomApiValue(room, detailRoom, rawDetailRoom, "SupplierName"),
          getRoomApiValue(room, detailRoom, rawDetailRoom, "providerName"),
        ),
        RoomGroupId: getFirstValue(
          getRoomApiValue(room, detailRoom, rawDetailRoom, "roomGroupId"),
          getRoomApiValue(room, detailRoom, rawDetailRoom, "RoomGroupId"),
          room.roomGroupId,
          room.id,
        ),
        Guests: entryGuests.map((guest, guestIndex) => ({
          GuestID: String(guestIndex),
          Operation: "U",
          Title: guest.title || (guest.gender === "female" ? "Ms" : "Mr"),
          FirstName: guest.firstName,
          MiddleName: guest.middleName || "",
          LastName: guest.lastName,
          MobileNo: guest.mobile || contact.mobile,
          PaxType: guest.passengerType || "A",
          Age: guest.passengerType === "A" ? guest.age || "25" : guest.age,
          Email: guest.email || contact.email,
          Pan: "",
        })),
      };
    });
  });

const getRoomTotal = (room, fallbackNights = 1) => {
  const quantity = Number(room.quantity || 0);
  const nights = Number(fallbackNights || room.nights || 1);
  const price = Number(room.pricePerNight || 0);
  const tax = Number(room.taxPerNight || 0);

  return (price + (room.rateIncludesTax ? 0 : tax)) * quantity * nights;
};

const getRoomDetailAmount = (room = {}) => {
  const amount = Number(room.pricePerNight || room.netAmount || 0);
  const tax = Number(room.taxPerNight || 0);
  return (Number.isFinite(amount) ? amount : 0) + (Number.isFinite(tax) ? tax : 0);
};

const getComboDetailTotal = (room = {}, fallbackNights = 1) => {
  const comboRows = Array.isArray(room.comboRooms) ? room.comboRooms : [];
  if (!comboRows.length) return 0;

  const detailTotal = comboRows.reduce((total, comboRoom) => {
    const count = Math.max(1, Number(comboRoom.count || comboRoom.roomCount || 1));
    return total + getRoomDetailAmount(comboRoom) * count;
  }, 0);

  if (!detailTotal) return 0;

  return detailTotal * Math.max(1, Number(room.quantity || 1)) * Number(fallbackNights || 1);
};

const getSelectedRoomsNetAmount = (selectedRooms = [], fallbackNights = 1) =>
  selectedRooms.reduce((total, room) => {
    const comboDetailTotal = getComboDetailTotal(room, fallbackNights);
    return total + (comboDetailTotal || getRoomTotal(room, fallbackNights));
  }, 0);

const ReviewPage = () => {
  const router = useRouter();
  // 👇 default open = flight
  const [openTab, setOpenTab] = useState("flight");
  const [priceChange, setPriceChange] = useState(null);
  const [pendingConfirmPayload, setPendingConfirmPayload] = useState(null);
  const [pendingPaymentPayload, setPendingPaymentPayload] = useState(null);
  const [paymentGateways, setPaymentGateways] = useState(["phonepe"]);
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState("phonepe");
  const [paymentGatewaysLoading, setPaymentGatewaysLoading] = useState(false);
  const [paymentGatewaysError, setPaymentGatewaysError] = useState("");
  const [guestDetails, setGuestDetails] = useState({
    roomGuests: {},
    bookingContact: {},
  });
  const {
    roomList,
    increaseRoom,
    decreaseRoom,
    bookingSession,
    bookingLoading,
    setBookingLoading,
    hotelBookingStatus,
    openLoginModal,
  } = useRoom();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const hotel = bookingSession?.hotel || {};
  const request = bookingSession?.request || {};
  const selectedRooms = useMemo(
    () => roomList.filter((room) => room.quantity > 0),
    [roomList],
  );
  const visibleRooms = roomList.length ? roomList : [];
  const checkInSource = getFirstValue(
    request.checkInDate,
    request.checkInRaw,
    request.checkIn,
    request.check_in,
    request.searchContext?.checkIn,
    request.searchContext?.initPayload?.checkIn,
    bookingSession?.checkIn,
  );
  const checkOutSource = getFirstValue(
    request.checkOutDate,
    request.checkOutRaw,
    request.checkOut,
    request.check_out,
    request.searchContext?.checkOut,
    request.searchContext?.initPayload?.checkOut,
    bookingSession?.checkOut,
  );
  const dateDerivedNights = getNightCountFromDates(checkInSource, checkOutSource);
  const nights =
    dateDerivedNights ||
    request.nights ||
    request.searchContext?.nights ||
    (bookingSession ? selectedRooms[0]?.nights : "") ||
    1;
  const hotelName =
    getDisplayValue(
      hotel.name,
      hotel.hotelName,
      hotel.title,
      hotel.raw?.name,
      hotel.raw?.hotelName,
      hotel.raw?.HotelName,
      hotel.raw?.Name,
      hotel.HotelName,
      hotel.Name,
      request.hotelName,
      request.HotelName,
      request.searchContext?.hotel?.name,
    ) || "Hotel";
  const hotelAddress =
    getDisplayValue(
      hotel.address,
      hotel.Address,
      hotel.route,
      hotel.locationName,
      hotel.LocationName,
      hotel.location,
      hotel.Location,
      hotel.city,
      hotel.CityName,
      hotel.raw?.address,
      hotel.raw?.Address,
      hotel.raw?.route,
      hotel.raw?.locationName,
      hotel.raw?.LocationName,
      hotel.raw?.location,
      hotel.raw?.Location,
      hotel.raw?.city,
      hotel.raw?.CityName,
      request.address,
      request.Address,
      request.locationName,
      request.LocationName,
      request.searchContext?.location?.detail,
      request.searchContext?.location?.fullName,
      request.searchContext?.location?.name,
      request.searchContext?.city,
    ) || "Address not available";
  const checkInDisplay = formatBookingDisplayDate(checkInSource, "Check-in");
  const checkOutDisplay = formatBookingDisplayDate(checkOutSource, "Check-out");
  const totalAmount = selectedRooms.reduce(
    (sum, room) => sum + getRoomTotal(room, nights),
    0,
  );

  const handleGuestDetailsChange = useCallback((value) => {
    setGuestDetails(value);
  }, []);

  const toggleTab = (tabName) => {
    setOpenTab((prev) => (prev === tabName ? null : tabName));
  };

  const redirectToHotelPayment = (paymentResponse, confirmPayload) => {
    const redirectUrl = getPaymentRedirectUrl(paymentResponse);
    if (!redirectUrl) {
      throw new Error("Payment redirect URL is missing.");
    }

    writePendingHotelConfirmBooking({
      confirmPayload,
      merchantOrderId: confirmPayload.merchant_order_id,
      paymentResponse,
      createdAt: Date.now(),
    });
    markHotelBookingPaymentStarted({
      merchantOrderId: confirmPayload.merchant_order_id,
      TUI: confirmPayload.TUI,
      transactionId: confirmPayload.transactionId,
    });

    // window.location.assign(redirectUrl);

    // Forces the top-level window to redirect, clearing any iframe/modal glitches
// window.top.location.href = redirectUrl;

    window.open(redirectUrl, "_blank", "noopener,noreferrer");
  };





  useEffect(() => {
    let isActive = true;

    const loadPaymentGateways = async () => {
      const domain = process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337";

      setPaymentGatewaysLoading(true);
      setPaymentGatewaysError("");
      try {
        const response = await getHotelPaymentGateways({ domain });
        if (!isActive) return;

        const { availableGateways, defaultGateway } = normalizeGatewayList(response);
        const nextGateways = availableGateways.length ? availableGateways : ["phonepe"];
        const nextSelectedGateway =
          defaultGateway && nextGateways.includes(defaultGateway)
            ? defaultGateway
            : nextGateways[0];

        setPaymentGateways(nextGateways);
        setSelectedPaymentGateway((current) =>
          current && nextGateways.includes(current) ? current : nextSelectedGateway,
        );
      } catch (error) {
        if (!isActive) return;

        setPaymentGateways(["phonepe"]);
        setSelectedPaymentGateway((current) => current || "phonepe");
        setPaymentGatewaysError(error.message || "Unable to load payment gateways.");
      } finally {
        if (isActive) setPaymentGatewaysLoading(false);
      }
    };

    loadPaymentGateways();

    return () => {
      isActive = false;
    };
  }, []);

  const handleAcceptPriceChange = async () => {
    if (!pendingConfirmPayload || !pendingPaymentPayload || bookingLoading) return;

    setBookingLoading(true);

    try {
      const nextAmount = formatAmount(priceChange?.newFare || pendingConfirmPayload.netAmount);
      const paymentResponse = await HotelPaymentStart({
        ...pendingPaymentPayload,
        NetAmount: toAmountNumber(nextAmount),
        amount: toAmountNumber(nextAmount),
      });
      const merchantOrderId = getPaymentMerchantOrderId(paymentResponse);
      redirectToHotelPayment(paymentResponse, {
        ...pendingConfirmPayload,
        netAmount: nextAmount,
        merchant_order_id: merchantOrderId,
      });

      setPriceChange(null);
      setPendingConfirmPayload(null);
      setPendingPaymentPayload(null);
    } catch (error) {
      clearHotelBookingStatus();
      toast.error(error.message || "Unable to confirm hotel booking.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleRejectPriceChange = () => {
    clearHotelBookingStatus();
    setPriceChange(null);
    setPendingConfirmPayload(null);
    setPendingPaymentPayload(null);
    toast.info("Booking was not confirmed because the fare changed.");
  };

  const handleStartBooking = async () => {
    if (bookingLoading) return;
    if (hotelBookingStatus) {
      toast.info("Payment is already in progress for this hotel booking.");
      return;
    }
    if (authLoading) return;
    if (paymentGatewaysLoading) return;
    if (!selectedPaymentGateway) {
      toast.error("Please select a payment option.");
      return;
    }
    if (!isLoggedIn) {
      openLoginModal?.();
      return;
    }

    const roomGuests = guestDetails.roomGuests || {};
    const firstRoomGuests = roomGuests[selectedRooms[0]?.id] || [];
    const firstTraveler = firstRoomGuests[0] || {};
    const contact = guestDetails.bookingContact || {};

    const hasIncompleteGuest = selectedRooms.some((room) => {
      const guests = roomGuests[room.id] || [];

      return (
        !guests.length ||
        guests.some(
          (guest) =>
            !guest.title ||
            !guest.firstName ||
            !guest.lastName ||
            !guest.gender ||
            !guest.passengerType ||
            !guest.age,
        )
      );
    });

    if (hasIncompleteGuest) {
      toast.error("Please complete required guest details for each selected room.");
      setOpenTab("guestDetails");
      return;
    }

    if (
      !contact.title ||
      !contact.firstName ||
      !contact.lastName ||
      !contact.mobile ||
      !contact.email ||
      !contact.address ||
      !contact.state ||
      !contact.city ||
      !contact.pin ||
      !contact.countryCode
    ) {
      toast.error("Please complete booking contact details.");
      setOpenTab("guestDetails");
      return;
    }

    try {
      const firstRoom = selectedRooms[0] || roomList[0] || {};
      const selectedNetAmount = formatAmount(
        getSelectedRoomsNetAmount(selectedRooms, nights) || totalAmount || firstRoom.netAmount || 0,
      );
      const storedHotelSearch = readStoredHotelSearch() || {};
      const storedHotelResults = readStoredHotelResults() || {};
       console.log("storedHotelResults",storedHotelResults)
      const checkInDate = pickApiDate(
        request.checkInDate,
        request.checkInRaw,
        request.checkIn,
        request.check_in,
        request.searchContext?.checkIn,
        request.searchContext?.initPayload?.checkIn,
        storedHotelSearch.checkIn,
        storedHotelSearch.initPayload?.checkIn,
      );
      const checkOutDate = pickApiDate(
        request.checkOutDate,
        request.checkOutRaw,
        request.checkOut,
        request.check_out,
        request.searchContext?.checkOut,
        request.searchContext?.initPayload?.checkOut,
        storedHotelSearch.checkOut,
        storedHotelSearch.initPayload?.checkOut,
      );
      const initSearchContext = {
        request,
        storedHotelSearch,
        hotel,
        firstRoom,
        selectedRooms,
        roomList,
        init: request.init || storedHotelSearch.init,
        initResponse:
          request.initResponse ||
          request.searchContext?.initResponse ||
          storedHotelSearch.initResponse,
        hotelSearchResults: storedHotelResults,
        initPayload: request.searchContext?.initPayload || storedHotelSearch.initPayload,
        searchContext: request.searchContext,
      };
       console.log("initSearchContext",initSearchContext)
      const hotelInitData = getHotelInitData({
        request,
        storedHotelSearch,
        storedHotelResults,
      });
      console.log("hotelInitData",hotelInitData)

      const searchTracingKey = getFirstValue(
        firstRoom.roomsSearchTracingKey,
        firstRoom.searchTracingKey,
        firstRoom.raw?.roomsSearchTracingKey,
        firstRoom.raw?.searchTracingKey,
        request.roomsSearchTracingKey,
        request.searchTracingKey,
        request.TUI,
        request.tui,
        bookingSession?.request?.TUI,
        bookingSession?.request?.tui,
        storedHotelSearch.roomsSearchTracingKey,
        storedHotelSearch.searchTracingKey,
        storedHotelSearch.TUI,
        storedHotelSearch.tui,
        hotelInitData.searchTracingKey,
        hotelInitData.searchTracingkey,
        hotelInitData.search_tracing_key,
        findFirstDeepValue(initSearchContext, [
          "roomsSearchTracingKey",
          "RoomsSearchTracingKey",
          "searchTracingKey",
          "searchTracingkey",
          "search_tracing_key",
          "searchTracing",
          "searchtracing",
          "TUI",
          "tui",
        ]),
      );
      const searchId = getFirstValue(
        firstRoom.roomsSearchId,
        firstRoom.searchId,
        firstRoom.raw?.roomsSearchId,
        firstRoom.raw?.searchId,
        request.roomsSearchId,
        request.searchId,
        storedHotelSearch.roomsSearchId,
        storedHotelSearch.searchId,
        hotelInitData.searchId,
        hotelInitData.SearchId,
        hotelInitData.search_id,
        findFirstDeepValue(initSearchContext, [
          "roomsSearchId",
          "RoomsSearchId",
          "searchId",
          "SearchId",
          "search_id",
          "SearchID",
        ]),
      );
      const hotelSearchId = getFirstValue(
        firstRoom.hotelSearchId,
        firstRoom.hotel_search_id,
        firstRoom.hotel_search_key,
        firstRoom.hotelSearchKey,
        request.hotelSearchId,
        request.hotel_search_id,
        request.hotel_search_key,
        request.hotelSearchKey,
        hotel.hotelSearchId,
        hotel.hotel_search_id,
        hotel.hotel_search_key,
        hotel.hotelSearchKey,
        hotelInitData.hotelSearchId,
        hotelInitData.hotel_search_id,
        hotelInitData.hotel_search_key,
        hotelInitData.hotelSearchKey,
        findFirstDeepValue(initSearchContext, [
          "hotelSearchId",
          "HotelSearchId",
          "hotel_search_id",
          "hotelSearchID",
          "hotel_search_key",
          "hotelSearchKey",
        ]),
      );
      const initPayload = buildRefreshSessionPayload({
        request,
        storedHotelSearch,
        checkInDate,
        checkOutDate,
      });
      const missingChildAge = (initPayload.rooms || []).some((room) => {
        const children = Number(room.children || 0);
        const childAges = Array.isArray(room.childAges) ? room.childAges : [];

        return children > 0 && (
          childAges.length < children || childAges.slice(0, children).some((age) => !age)
        );
      });

      if (missingChildAge) {
        toast.error("Select age for each child.");
        return;
      }

      if (!searchTracingKey || !searchId) {
        const missingParts = [
          !searchTracingKey ? "TUI/search tracing key" : "",
          !searchId ? "SearchId" : "",
        ].filter(Boolean);

        toast.error(`Hotel search session is missing ${missingParts.join(" and ")}. Please search again.`);
        return;
      }

      markHotelBookingSubmitStarted({
        TUI: searchTracingKey,
      });
      setBookingLoading(true);

      const payload = {
        ...fallbackHotelStartBookingPayload,
        TUI: searchTracingKey || "",
        ContactInfo: {
          ...fallbackHotelStartBookingPayload.ContactInfo,
          Title: contact.title,
          FName: contact.firstName,
          LName: contact.lastName,
          Mobile: contact.mobile,
          Email: contact.email,
          Address: contact.address,
          State: contact.state,
          City: contact.city,
          PIN: contact.pin,
          CountryCode: getCountryCode(contact.countryCode),
          MobileCountryCode: getDialCode(firstTraveler.countryCode || contact.countryCode),
        },
        Rooms: buildStartBookingRooms(selectedRooms, roomGuests, contact),
        NetAmount: selectedNetAmount,
        SearchId: searchId,
        hotelSearchId,
        RecommendationId:
          firstRoom.recommendationId ||
          request.recommendationId ||
          fallbackHotelStartBookingPayload.RecommendationId,
        HotelCode: hotel.id || request.hotelId || fallbackHotelStartBookingPayload.HotelCode,
        CheckInDate: checkInDate,
        CheckOutDate: checkOutDate,
      };

      const startBookingResponse = await startHotelBooking(payload);
      const priceChangeInfo = parsePriceChange(startBookingResponse);
      const paymentTui =
        getResponseValue(startBookingResponse, "TUI") ||
        getResponseValue(startBookingResponse, "tui") ||
        payload.TUI ||
        "";
      const transactionId = String(
        getResponseValue(startBookingResponse, "TransactionID") ||
          getResponseValue(startBookingResponse, "transactionId") ||
          "",
      );
      const netAmount = formatAmount(
        payload.NetAmount ||
          getResponseValue(startBookingResponse, "NetAmount") ||
          getResponseValue(startBookingResponse, "netAmount") ||
          "",
      );
      const hotelPayment = {
        domain: "localhost:1337",
        booking_type: "hotel",
        payment_gateway: selectedPaymentGateway || "phonepe",
        payment_mode: selectedPaymentGateway || "phonepe",
        TUI: paymentTui,
        TransactionID: transactionId,
        NetAmount: toAmountNumber(netAmount),
        amount: toAmountNumber(netAmount),
        redirectUrl: getHotelPaymentReturnUrl(),
        message: "Hotel booking payment",
      };
      const confirmPayload = {
        transactionId,
        netAmount,
        merchant_order_id: "",
        TUI: paymentTui,
      };

      if (priceChangeInfo) {
        setPriceChange(priceChangeInfo);
        setPendingConfirmPayload({
          ...confirmPayload,
          netAmount: formatAmount(priceChangeInfo.newFare),
        });
        setPendingPaymentPayload({
          ...hotelPayment,
          NetAmount: toAmountNumber(priceChangeInfo.newFare),
          amount: toAmountNumber(priceChangeInfo.newFare),
        });
        return;
      }

      const hotelPaymentResponse = await HotelPaymentStart(hotelPayment);

      console.log("hotelPaymentResponse", hotelPaymentResponse);

      const finalConfirmPayload = {
        ...confirmPayload,
        merchant_order_id: getPaymentMerchantOrderId(hotelPaymentResponse),
      };

      redirectToHotelPayment(hotelPaymentResponse, finalConfirmPayload);
    } catch (error) {
      clearHotelBookingStatus();
      toast.error(error.message || "Unable to start hotel booking.");
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    const handleSummaryBookNow = () => {
      handleStartBooking();
    };

    window.addEventListener("hotel-start-booking", handleSummaryBookNow);
    return () => window.removeEventListener("hotel-start-booking", handleSummaryBookNow);
  }, [handleStartBooking]);

  const getQuantity = (id) => {
    const room = roomList.find((r) => r.id === id);
    return room?.quantity || 0;
  };

  if (hotelBookingStatus) {
    const isConfirmed = hotelBookingStatus.status === "confirmed";
    const isPreparing = hotelBookingStatus.status === "submit_started";

    return (
      <div className={styles.container}>
        <div className={styles.hotelContainer}>
          <div className={styles.hotelTopContainer}>
            <div className={styles.hotelTextContainer}>
              <div className={styles.hotelNameAndLocation}>
                <h3>{isConfirmed ? "Hotel Booking Confirmed" : "Payment In Progress"}</h3>
                <div className={styles.locationAndRating}>
                  <span className={styles.hotelAddress}>
                    {isConfirmed
                      ? "This checkout session is closed because the booking has already been confirmed."
                      : isPreparing
                        ? "This checkout session is locked because another tab is already preparing payment."
                        : "This checkout session is locked because payment has already been opened in another tab."}
                  </span>
                </div>
              </div>
              <div className={styles.checkinOutContainer}>
                <button
                  type="button"
                  className={styles.paymentOption}
                  onClick={() => router.push("/")}
                >
                  Back to home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <h2 className={styles.headerText}>
        <span>Great pick!</span> Guests love staying here
      </h2>
      <div className={styles.hotelContainer}>
        <div className={styles.hotelTopContainer}>
          <div className={styles.hotelImageContainer}>
            <img src={hotel.image || "/images/hotelArt1.png"} alt="" />
          </div>
          <div className={styles.hotelTextContainer}>
            <div className={styles.hotelNameAndLocation}>
              <h3>{hotelName}</h3>
              <div className={styles.locationAndRating}>
                <img src="/icons/blackAddress.svg" alt="" />
                <span className={styles.hotelAddress}>{hotelAddress}</span>
                <div className={styles.ratingSection}>
                  <div className={styles.stars}>
                    <img src="/icons/tetimonialStart.svg" alt="" />
                    <img src="/icons/tetimonialStart.svg" alt="" />
                    <img src="/icons/tetimonialStart.svg" alt="" />
                    <img src="/icons/tetimonialStart.svg" alt="" />
                  </div>
                  <div className={styles.reviewCount}>
                    {hotel.rating || "-"} ({hotel.reviewText || "No reviews yet"})
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.checkinOutContainer}>
              <div className={styles.checkinContainer}>
                <span className={styles.checkinText}>check in</span>
                <div className={styles.dateAndTimeContainer}>
                  <span className={styles.dateAndTime}>
                    {checkInDisplay} | <span className={styles.time}>1:00 PM</span>
                  </span>
                </div>
              </div>
              <div className={styles.perNight}>X {nights} Nights</div>
              <div className={styles.checkinContainer}>
                <span className={styles.checkinText}>check Out</span>
                <div className={styles.dateAndTimeContainer}>
                  <span className={styles.dateAndTime}>
                    {checkOutDisplay} | <span className={styles.time}>1:00 PM</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {visibleRooms.map((room) => (
          <RoomPriceRow
            key={room.id}
            image={room.image}
            title={room.title}
            price={room.pricePerNight}
            quantity={getQuantity(room.id)}
            maxQuantity={room.maxQuantity}
            onIncrease={() => increaseRoom(room.id)}
            onDecrease={() => decreaseRoom(room.id)}
          />
        ))}
      </div>

      <div
        className={`${styles.flightExpandableContainer} ${
          openTab === "guestDetails" ? styles.flightActiveBorder : ""
        }`}
      >
        <div
          className={styles.flightExpandableCard}
          onClick={() => toggleTab("guestDetails")}
        >
          <h3 className={styles.flightExpandableHeader}>GUEST DETAILS</h3>
          <img
            src="/icons/DownArrows.svg"
            alt=""
            className={`${styles.arrow} ${
              openTab === "guestDetails" ? styles.arrowRotate : ""
            }`}
          />
        </div>

        <div
          className={`${styles.expandWrap} ${styles.guestDetailsWrap} ${
            openTab === "guestDetails" ? styles.expandOpen : ""
          }`}
        >
          <TravelerDetails rooms={selectedRooms} onChange={handleGuestDetailsChange} />
        </div>
      </div>
      <div
        className={`${styles.flightExpandableContainer} ${
          openTab === "Cancellation" ? styles.flightActiveBorder : ""
        }`}
      >
        <div
          className={styles.flightExpandableCard}
          onClick={() => toggleTab("Cancellation")}
        >
          <h3 className={styles.flightExpandableHeader}>
            Cancellation & Date Change Policy
          </h3>
          <img
            src="/icons/DownArrows.svg"
            alt=""
            className={`${styles.arrow} ${
              openTab === "Cancellation" ? styles.arrowRotate : ""
            }`}
          />
        </div>

        <div
          className={`${styles.expandWrap} ${
            openTab === "Cancellation" ? styles.expandOpen : ""
          }`}
        >
          {/* <CancellationPenalty /> */}
          <CancellationPolicy />
        </div>
      </div>

      <div
        className={`${styles.flightExpandableContainer} ${
          openTab === "propertyPolicy" ? styles.flightActiveBorder : ""
        }`}
      >
        <div
          className={styles.flightExpandableCard}
          onClick={() => toggleTab("propertyPolicy")}
        >
          <h3 className={styles.flightExpandableHeader}>PROPERTY POLICY</h3>
          <img
            src="/icons/DownArrows.svg"
            alt=""
            className={`${styles.arrow} ${
              openTab === "propertyPolicy" ? styles.arrowRotate : ""
            }`}
          />
        </div>

        <div
          className={`${styles.expandWrap} ${
            openTab === "propertyPolicy" ? styles.expandOpen : ""
          }`}
        >
          {/* <CancellationPenalty /> */}
          <HotelPolicy />
        </div>
      </div>

      <div className={styles.paymentBox}>
        <h3 className={styles.paymentTitle}>PAY WITH</h3>
        {paymentGatewaysLoading && (
          <p className={styles.paymentMessage}>Loading payment options...</p>
        )}
        {paymentGatewaysError && (
          <p className={styles.paymentError}>{paymentGatewaysError}</p>
        )}
        <div className={styles.paymentOptions}>
          {paymentGateways.map((gateway) => (
            <button
              type="button"
              key={gateway}
              className={`${styles.paymentOption} ${
                selectedPaymentGateway === gateway ? styles.paymentOptionActive : ""
              }`}
              onClick={() => setSelectedPaymentGateway(gateway)}
              aria-pressed={selectedPaymentGateway === gateway}
            >
              <span className={styles.paymentRadio} aria-hidden="true" />
              <span className={styles.paymentImageWrap}>
                {gatewayMeta[gateway]?.image ? (
                  <img src={gatewayMeta[gateway].image} alt="" />
                ) : (
                  <span className={styles.paymentGatewayBadge}>
                    {formatGatewayLabel(gateway).slice(0, 2)}
                  </span>
                )}
              </span>
              <span className={styles.paymentLabel}>{formatGatewayLabel(gateway)}</span>
            </button>
          ))}
        </div>
      </div>

      <PriceChangeModal
        priceChange={priceChange}
        loading={bookingLoading}
        onCancel={handleRejectPriceChange}
        onConfirm={handleAcceptPriceChange}
      />
    </div>
  );
};

export default ReviewPage;

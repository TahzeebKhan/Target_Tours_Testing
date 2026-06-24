"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./ReviewPage.module.css";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import TravelInsuranceOption from "@/app/flight-booking-details/components/passengerDetails/fareDetailsExpandable/component/travelInsuranceOption/TravelInsuranceOption";
import CancellationPenalty from "@/app/flight-booking-details/components/passengerDetails/fareDetailsExpandable/component/cancellationPenalty/CancellationPenalty";
import RoomPriceRow from "./components/roomPriceRow/RoomPriceRow";
import TravelerDetails from "./components/travelerDetails/TravelerDetails";
import CancellationPolicy from "./components/cancellationPolicy/CancellationPolicy";
import HotelPolicy from "./components/hotelPolicy/HotelPolicy";
import PriceChangeModal from "./components/priceChangeModal/PriceChangeModal";
import { useRoom } from "@/app/context/RoomContext";
import {
  confirmHotelBooking,
  HOTEL_SEARCH_SESSION_KEY,
  refreshHotelSession,
  startHotelBooking,
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

const formatAmount = (value) => {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return "0";

  return amount.toFixed(2).replace(/\.00$/, "");
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

  return {
    geoCode: {
      lat: lat ? String(lat) : "",
      long: long ? String(long) : "",
    },
    locationId: String(
      getFirstValue(
        sourcePayload.locationId,
        searchContext.locationId,
        storedHotelSearch.locationId,
        location.locationId,
        location.id,
      ),
    ),
    checkIn: toRefreshDate(checkInDate || sourcePayload.checkIn || searchContext.checkIn),
    checkOut: toRefreshDate(checkOutDate || sourcePayload.checkOut || searchContext.checkOut),
    rooms: normalizeRefreshRooms(sourcePayload.rooms || searchContext.rooms, request),
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

const buildGuestCode = (occupancies = [], guests = []) => {
  const occupancyList = Array.isArray(occupancies) ? occupancies : [];
  const occupancy = occupancyList[0] || {};
  const occupancyId =
    getOccupancyValue(occupancy, "occupancyId", "OccupancyID", "occupancyID", "id") ||
    1;
  const adultGuests = guests.filter(
    (guest) => String(guest.PaxType || guest.passengerType || "A").toUpperCase() === "A",
  );
  const childGuests = guests.filter(
    (guest) => String(guest.PaxType || guest.passengerType || "").toUpperCase() === "C",
  );
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

const getRoomTotal = (room) => {
  const quantity = Number(room.quantity || 0);
  const nights = Number(room.nights || 1);
  const price = Number(room.pricePerNight || 0);
  const tax = Number(room.taxPerNight || 0);

  return (price + (room.rateIncludesTax ? 0 : tax)) * quantity * nights;
};

const ReviewPage = () => {
  const router = useRouter();
  // 👇 default open = flight
  const [openTab, setOpenTab] = useState("flight");
  const [priceChange, setPriceChange] = useState(null);
  const [pendingConfirmPayload, setPendingConfirmPayload] = useState(null);
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
  } = useRoom();
  const hotel = bookingSession?.hotel || {};
  const request = bookingSession?.request || {};
  const selectedRooms = useMemo(
    () => roomList.filter((room) => room.quantity > 0),
    [roomList],
  );
  const visibleRooms = roomList.length ? roomList : [];
  const totalAmount = selectedRooms.reduce(
    (sum, room) => sum + getRoomTotal(room),
    0,
  );
  const nights = selectedRooms[0]?.nights || request.nights || 1;

  const handleGuestDetailsChange = useCallback((value) => {
    setGuestDetails(value);
  }, []);

  const toggleTab = (tabName) => {
    setOpenTab((prev) => (prev === tabName ? null : tabName));
  };

  const confirmBooking = async (confirmPayload) => {
    const res = await confirmHotelBooking(confirmPayload);
    toast.success("Hotel booking confirmed successfully");
    const bookingId = res?.booking?.booking_id || res?.booking_id || res?.data?.booking?.booking_id;
    if (bookingId) {
      router.push(`/hotel-booking-success?booking_id=${bookingId}`);
    }
  };

  const handleAcceptPriceChange = async () => {
    if (!pendingConfirmPayload || bookingLoading) return;

    setBookingLoading(true);

    try {
      await confirmBooking({
        ...pendingConfirmPayload,
        netAmount: formatAmount(priceChange?.newFare || pendingConfirmPayload.netAmount),
      });
      setPriceChange(null);
      setPendingConfirmPayload(null);
    } catch (error) {
      toast.error(error.message || "Unable to confirm hotel booking.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleRejectPriceChange = () => {
    setPriceChange(null);
    setPendingConfirmPayload(null);
    toast.info("Booking was not confirmed because the fare changed.");
  };

  const handleStartBooking = async () => {
    if (bookingLoading) return;

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

    setBookingLoading(true);

    try {
      const firstRoom = selectedRooms[0] || roomList[0] || {};
      const selectedNetAmount = formatAmount(totalAmount || firstRoom.netAmount || 0);
      const storedHotelSearch = readStoredHotelSearch() || {};
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
      const searchTracingKey =
        findDeepValue(request, "searchTracingKey") ||
        findDeepValue(storedHotelSearch, "searchTracingKey");
      const refreshPayload = buildRefreshSessionPayload({
        request,
        storedHotelSearch,
        checkInDate,
        checkOutDate,
      });
      const refreshResponse = await refreshHotelSession(refreshPayload);
      const refreshedSearchTracingKey =
        findDeepValue(refreshResponse, "searchTracingKey") ||
        findDeepValue(refreshResponse, "searchTracingkey");
      const payload = {
        ...fallbackHotelStartBookingPayload,
        TUI: refreshedSearchTracingKey || searchTracingKey || "",
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
        Rooms: selectedRooms.map((room) => {
          const guests = roomGuests[room.id] || [];

          return {
            RoomId: room.roomId || room.id || "",
            GuestCode: buildGuestCode(room.occupancies, guests),
            SupplierName: room.supplierName || "",
            RoomGroupId: room.roomGroupId || room.id || "",
            Guests: guests.map((guest, guestIndex) => ({
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
        }),
        NetAmount: selectedNetAmount,
        SearchId: request.searchId || request.SearchId || fallbackHotelStartBookingPayload.SearchId,
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
      const confirmPayload = {
        transactionId: String(
          getResponseValue(startBookingResponse, "TransactionID") ||
            getResponseValue(startBookingResponse, "transactionId") ||
            "",
        ),
        netAmount: String(
          payload.NetAmount ||
            getResponseValue(startBookingResponse, "NetAmount") ||
            getResponseValue(startBookingResponse, "netAmount") ||
            "",
        ),
        merchantId:
          getResponseValue(startBookingResponse, "merchantId") ||
          getResponseValue(startBookingResponse, "MerchantId") ||
          "",
        TUI:
          getResponseValue(startBookingResponse, "TUI") ||
          getResponseValue(startBookingResponse, "tui") ||
          payload.TUI ||
          "",
      };

      if (priceChangeInfo) {
        setPriceChange(priceChangeInfo);
        setPendingConfirmPayload({
          ...confirmPayload,
          netAmount: formatAmount(priceChangeInfo.newFare),
        });
        return;
      }

      await confirmBooking(confirmPayload);
    } catch (error) {
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
              <h3>{hotel.name || "Hotel"}</h3>
              <div className={styles.locationAndRating}>
                <img src="/icons/blackAddress.svg" alt="" />
                <span className={styles.hotelAddress}>{hotel.address || "Address not available"}</span>
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
                    {request.checkIn || "Check-in"} | <span className={styles.time}>1:00 PM</span>
                  </span>
                </div>
              </div>
              <div className={styles.perNight}>X {nights} Nights</div>
              <div className={styles.checkinContainer}>
                <span className={styles.checkinText}>check Out</span>
                <div className={styles.dateAndTimeContainer}>
                  <span className={styles.dateAndTime}>
                    {request.checkOut || "Check-out"} | <span className={styles.time}>1:00 PM</span>
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
      <div
        // onClick={() => setCurrentStep(3)}
        className={styles.continueButtonContainer}
      >
        <button
          className={styles.continueButton}
          disabled={bookingLoading}
          onClick={handleStartBooking}
        >
          {bookingLoading ? "LOADING..." : "CONTINUE"}
        </button>
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

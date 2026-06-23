"use client";
import React, { useCallback, useMemo, useState } from "react";
import styles from "./ReviewPage.module.css";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import TravelInsuranceOption from "@/app/flight-booking-details/components/passengerDetails/fareDetailsExpandable/component/travelInsuranceOption/TravelInsuranceOption";
import CancellationPenalty from "@/app/flight-booking-details/components/passengerDetails/fareDetailsExpandable/component/cancellationPenalty/CancellationPenalty";
import RoomPriceRow from "./components/roomPriceRow/RoomPriceRow";
import TravelerDetails from "./components/travelerDetails/TravelerDetails";
import CancellationPolicy from "./components/cancellationPolicy/CancellationPolicy";
import HotelPolicy from "./components/hotelPolicy/HotelPolicy";
import { useRoom } from "@/app/context/RoomContext";
import { startHotelBooking } from "@/shared/services/hotelSearch";
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
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);

  const [day, month, year] = String(value).split(/[/-]/);
  if (day && month && year) return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

  return value;
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
  let adultAgeIndex = 0;

  if (!occupancyList.length) return `|1|1:A:${guests[0]?.age || "25"}|`;

  return occupancyList
    .map((occupancy, index) => {
      const occupancyId =
        getOccupancyValue(occupancy, "occupancyId", "OccupancyID", "occupancyID", "id") ||
        index + 1;
      const adultCount = Number(
        getOccupancyValue(occupancy, "numOfAdults", "NumOfAdults", "adults", "adultCount") ||
          0,
      );
      const childCount = Number(
        getOccupancyValue(
          occupancy,
          "numOfChildren",
          "NumOfChildren",
          "children",
          "childCount",
        ) || 0,
      );
      const segments = [];

      if (adultCount > 0) {
        const adultAges = Array.from({ length: adultCount }, () => {
          const age = guests[adultAgeIndex]?.age || "25";
          adultAgeIndex += 1;
          return age;
        }).join(":");

        segments.push(`|${occupancyId}|${adultCount}:A:${adultAges}|`);
      }

      if (childCount > 0) {
        const childAges = normalizeChildAges(
          getOccupancyValue(occupancy, "childAges", "ChildAges", "childrenAges"),
        );
        const ages = Array.from({ length: childCount }, (_, childIndex) =>
          String(childAges[childIndex] || "0"),
        ).join(":");

        segments.push(`|${occupancyId}|${childCount}:C:${ages}|`);
      }

      return segments.join("");
    })
    .join("");
};

const ReviewPage = () => {
  // 👇 default open = flight
  const [openTab, setOpenTab] = useState("flight");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [guestDetails, setGuestDetails] = useState({
    roomGuests: {},
    bookingContact: {},
  });
  const { roomList, increaseRoom, decreaseRoom, bookingSession } = useRoom();
  const hotel = bookingSession?.hotel || {};
  const request = bookingSession?.request || {};
  const selectedRooms = useMemo(
    () => roomList.filter((room) => room.quantity > 0),
    [roomList],
  );
  const visibleRooms = roomList.length ? roomList : [];
  const totalAmount = selectedRooms.reduce(
    (sum, room) => sum + Number(room.pricePerNight || 0) * Number(room.quantity || 0) * Number(room.nights || 1),
    0,
  );
  const nights = selectedRooms[0]?.nights || request.nights || 1;

  const handleGuestDetailsChange = useCallback((value) => {
    setGuestDetails(value);
  }, []);

  const toggleTab = (tabName) => {
    setOpenTab((prev) => (prev === tabName ? null : tabName));
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
      const payload = {
        ...fallbackHotelStartBookingPayload,
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
              PaxType: "A",
              Age: guest.age,
              Email: guest.email || contact.email,
              Pan: "",
            })),
          };
        }),
        NetAmount: String(Math.round(totalAmount || firstRoom.netAmount || 0)),
        SearchId: request.searchId || request.SearchId || fallbackHotelStartBookingPayload.SearchId,
        RecommendationId:
          firstRoom.recommendationId ||
          request.recommendationId ||
          fallbackHotelStartBookingPayload.RecommendationId,
        HotelCode: hotel.id || request.hotelId || fallbackHotelStartBookingPayload.HotelCode,
        CheckInDate: toApiDate(request.checkIn || request.check_in),
        CheckOutDate: toApiDate(request.checkOut || request.check_out),
      };

      await startHotelBooking(payload);
      toast.success("Hotel booking started successfully");
    } catch (error) {
      toast.error(error.message || "Unable to start hotel booking.");
    } finally {
      setBookingLoading(false);
    }
  };

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
    </div>
  );
};

export default ReviewPage;

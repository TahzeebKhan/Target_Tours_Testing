"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./IndividualProperty.module.css";
import BookingDetails from "@/features/profile/components/BookingDetails";
import { useProfile } from "../../context/ProfileContext";
import api from "@/shared/services/axios";
import FlightBookingDetails from "./FlightBookingDetails";
import PackageDetails from "./PackageDetails";
import InsurenceDetails from "./InsurenceDetails";
import ModifyBookingModal from "./ModifyBookingModal";
import CancelBookingModal from "./CancelBookingModal";



const fallbackHotelImage = "/fallback.png";

const firstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const getDetailPayload = (payload) =>
  payload?.data?.booking ||
  payload?.data?.hotel_booking ||
  payload?.data?.booking_details ||
  payload?.data ||
  payload?.booking ||
  payload?.hotel_booking ||
  payload ||
  {};

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value ? String(value) : "₹ 0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const toAmount = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null || value === "") continue;
    const amount =
      typeof value === "number"
        ? value
        : Number(String(value).replace(/[^\d.-]/g, ""));
    if (Number.isFinite(amount)) return amount;
  }
  return null;
};

const getDateParts = (value) => {
  if (!value) return { day: "N/A", month: "" };
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return { day: String(value), month: "" };
  return {
    day: date.toLocaleDateString("en-GB", { day: "2-digit" }),
    month: date.toLocaleDateString("en-GB", { month: "long" }),
  };
};

const getNightCount = (checkIn, checkOut) => {
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.max(0, Math.round((end - start) / 86400000));
};

const buildMediaUrl = (value) => {
  if (!value) return fallbackHotelImage;
  if (typeof value === "object") {
    return buildMediaUrl(value.url || value.path || value.src);
  }
  if (/^https?:\/\//i.test(value) || String(value).startsWith("/")) return value;
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  return `${baseUrl}${String(value).startsWith("/") ? value : `/${value}`}`;
};

const formatPlainValue = (value, fallback = "N/A") => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "object") return String(value);

  const text = firstValue(
    value.text,
    value.value,
    value.label,
    value.name,
    value.Name,
    value.title,
  );

  return text ? String(text) : fallback;
};

const formatAddress = (value) => {
  if (value === undefined || value === null || value === "") return "N/A";
  if (typeof value !== "object") return String(value);

  return [
    value.AddressLine1,
    value.AddressLine2,
    value.address_line_1,
    value.address_line_2,
    value.address,
    value.City,
    value.city,
    value.State,
    value.state,
    value.ZIP,
    value.zip,
    value.PIN,
    value.pin,
    value.Country,
    value.country,
  ]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(", ") || "N/A";
};

const formatCoordinates = (value) => {
  if (value === undefined || value === null || value === "") return "N/A";
  if (typeof value !== "object") return String(value);

  const latitude = firstValue(value.latitude, value.Latitude, value.lat);
  const longitude = firstValue(value.longitude, value.Longitude, value.lng, value.lon);

  if (latitude || longitude) {
    return [latitude, longitude].filter(Boolean).join(", ");
  }

  return formatPlainValue(value);
};

const getGuestName = (guest = {}) => {
  const name = firstValue(
    guest.name,
    guest.full_name,
    guest.fullName,
    guest.guest_name,
    guest.passenger_name,
    [guest.Title, guest.FirstName, guest.LastName].filter(Boolean).join(" "),
    [guest.title, guest.first_name || guest.firstName, guest.last_name || guest.lastName]
      .filter(Boolean)
      .join(" "),
  );
  return String(name || "Guest").trim();
};

const getGuestType = (guest = {}) => {
  const rawType = String(
    firstValue(
      guest.type,
      guest.pax_type,
      guest.passenger_type,
      guest.PTC,
      guest.PaxType,
      guest.guest_type,
      "Adult",
    ),
  ).toUpperCase();
  if (rawType === "A" || rawType === "ADT" || rawType === "ADULT") return "Adult";
  if (rawType === "C" || rawType === "CHD" || rawType === "CHILD") return "Child";
  if (rawType === "I" || rawType === "INF" || rawType === "INFANT") return "Infant";
  return rawType.charAt(0) + rawType.slice(1).toLowerCase();
};

const normalizeNameList = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map((item) =>
      typeof item === "string"
        ? item
        : firstValue(item.name, item.Name, item.label, item.title, item.text, ""),
    )
    .map((item) => String(item || "").trim())
    .filter(Boolean);

const normalizeCancellationPolicy = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map((item) => ({
      text: String(firstValue(item.text, item.Text, item.policy, item.Policy, item.name, "")).trim(),
      amount: firstValue(item.amount, item.Amount, ""),
      fromDate: firstValue(item.fromDate, item.FromDate, item.from_date, ""),
      toDate: firstValue(item.toDate, item.ToDate, item.to_date, ""),
    }))
    .filter((item) => item.text || item.amount || item.fromDate || item.toDate);

const splitPolicyRows = (items = []) =>
  (Array.isArray(items) ? items : [items])
    .flatMap((item) =>
      String(item || "")
        .split(/\n|(?=\s*\d+\)\s*)/g)
        .map((row) => row.replace(/\s+/g, " ").trim())
        .filter(Boolean),
    );

const normalizeGuests = (guests = []) =>
  (Array.isArray(guests) ? guests : [])
    .map((guest, index) => ({
      id: firstValue(guest.id, guest.guest_id, guest.passenger_id, index),
      name: getGuestName(guest),
      type: getGuestType(guest),
      age: firstValue(guest.age, guest.child_age, guest.childAge, guest.Age, ""),
      email: firstValue(guest.email, guest.Email, guest.guest_email, ""),
      phone: firstValue(
        guest.phone,
        guest.mobile,
        guest.MobileNumber,
        guest.contact_number,
        "",
      ),
    }));

const toList = (value) => (Array.isArray(value) ? value : value ? [value] : []);

const getRoomRatePricing = (room = {}) => {
  const rates = toList(firstValue(room.RoomRates, room.room_rates, room.rates, []));
  const taxLines = [];

  const totals = rates.reduce(
    (sum, rate) => {
      const taxAmount =
        toAmount(rate?.Tax?.Amount, rate?.tax?.amount, rate?.TaxAmount, rate?.taxAmount) ?? 0;
      const taxLabel = firstValue(
        rate?.Tax?.Description,
        rate?.tax?.description,
        rate?.Tax?.Name,
        rate?.tax?.name,
        "Tax",
      );

      sum.baseRate += toAmount(rate?.BaseRate, rate?.baseRate) ?? 0;
      sum.totalRate += toAmount(rate?.TotalRate, rate?.totalRate) ?? 0;
      sum.tax += taxAmount;
      sum.discount += toAmount(rate?.Discount, rate?.discount) ?? 0;
      sum.commission += toAmount(rate?.Commission, rate?.commission) ?? 0;
      sum.serviceCharge += toAmount(rate?.ServiceCharge, rate?.serviceCharge) ?? 0;
      sum.agentMarkup += toAmount(rate?.AgentMarkup, rate?.agentMarkup) ?? 0;
      sum.addonMarkup += toAmount(rate?.AddonMarkup, rate?.addonMarkup) ?? 0;
      sum.vatOnBFTax += toAmount(rate?.VATOnBFTax, rate?.vatOnBFTax) ?? 0;
      sum.vatTotal += toAmount(rate?.VATTotal, rate?.vatTotal) ?? 0;
      sum.tcsTotal += toAmount(rate?.TCSTotal, rate?.tcsTotal) ?? 0;
      sum.tdsOnCommission +=
        toAmount(rate?.TDSOnCommission, rate?.tdsOnCommission) ?? 0;
      if (taxAmount) {
        taxLines.push({
          label: String(taxLabel || "Tax")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase()),
          amount: taxAmount,
        });
      }
      return sum;
    },
    {
      baseRate: 0,
      totalRate: 0,
      tax: 0,
      discount: 0,
      commission: 0,
      serviceCharge: 0,
      agentMarkup: 0,
      addonMarkup: 0,
      vatOnBFTax: 0,
      vatTotal: 0,
      tcsTotal: 0,
      tdsOnCommission: 0,
    },
  );

  return {
    ...totals,
    hasRateData: rates.length > 0,
    taxLines,
  };
};

const normalizeRooms = (detail = {}) => {
  const hotelBooking = detail.hotel_booking || detail.hotelBooking || detail;
  const roomCandidates = firstValue(
    detail.rooms,
    detail.room_details,
    detail.roomDetails,
    detail.booking_rooms,
    detail.hotel_rooms,
    hotelBooking.rooms,
    hotelBooking.room_details,
    [],
  );
  const rooms = Array.isArray(roomCandidates) ? roomCandidates : [];
  const allGuests = normalizeGuests(
    firstValue(
      detail.guests,
      detail.guest_details,
      detail.passengers,
      detail.user_passengers,
      hotelBooking.guests,
      hotelBooking.guest_details,
      [],
    ),
  );

  if (rooms.length) {
    return rooms.map((room, index) => {
      const roomGuests = normalizeGuests(
        firstValue(
          room.guests,
          room.Guests,
          room.guest_details,
          room.passengers,
          room.user_passengers,
          room.occupants,
          [],
        ),
      );
      const adults = Number(
        firstValue(room.adults, room.NumberOfAdults, room.adult_count, room.no_of_adults, 0),
      );
      const children = Number(
        firstValue(room.children, room.NumberOfChildren, room.child_count, room.no_of_children, 0),
      );
      const boardBasis = normalizeNameList(
        firstValue(room.RoomBoardBasis, room.room_board_basis, room.board_basis, []),
      );
      const inclusions = normalizeNameList(
        firstValue(room.RoomInclusions, room.room_inclusions, room.inclusions, []),
      );
      const ratePricing = getRoomRatePricing(room);

      return {
        id: firstValue(room.id, room.ID, room.room_id, room.RoomId, index + 1),
        name: firstValue(room.name, room.Name, room.room_name, room.type, room.room_type, `Room ${index + 1}`),
        adults,
        children,
        guests: roomGuests,
        facilities: normalizeNameList(
          firstValue(room.RoomFacilities, room.room_facilities, room.facilities, []),
        ),
        inclusions,
        boardBasis,
        policies: normalizeNameList(
          firstValue(room.RoomPolicies, room.room_policies, room.policies, []),
        ),
        cancellationPolicies: normalizeCancellationPolicy(
          firstValue(room.CancellationPolicy, room.cancellation_policy, room.cancellationPolicies, []),
        ),
        refundable: firstValue(room.Refundable, room.refundable, ""),
        pricing: ratePricing,
      };
    });
  }

  return [
    {
      id: 1,
      name: "Room 1",
      adults: Number(firstValue(detail.adults, hotelBooking.adults, 0)),
      children: Number(firstValue(detail.children, hotelBooking.children, 0)),
      guests: allGuests,
      facilities: [],
      inclusions: [],
      boardBasis: [],
      policies: [],
      cancellationPolicies: [],
      refundable: "",
      pricing: getRoomRatePricing({}),
    },
  ];
};

const getAmenityLabels = (detail = {}) => {
  const source = firstValue(
    detail.amenities,
    detail.hotel_amenities,
    detail.facilities,
    detail.hotel?.amenities,
    [],
  );
  if (!Array.isArray(source)) return [];
  return source
    .map((item) =>
      typeof item === "string"
        ? item
        : firstValue(item.label, item.name, item.title, item.amenity_name, ""),
    )
    .filter(Boolean);
};

const getHotelPricingBreakdown = (detail = {}, hotelBooking = {}, amountPaid = 0) => {
  const pricing = firstValue(detail.pricing, detail.price_breakdown, hotelBooking.pricing, {}) || {};

  const totalAmount =
    toAmount(
      detail.total_amount,
      detail.amount_paid,
      hotelBooking.total_amount,
      hotelBooking.amount_paid,
      pricing.total_amount,
      pricing.amount_paid,
      pricing.net_fare,
      amountPaid,
    ) ?? 0;

  const basePrice =
    toAmount(
      detail.base_price,
      hotelBooking.base_price,
      pricing.base_price,
      pricing.base_fare,
      pricing.baseFare,
      pricing.room_price,
      pricing.roomPrice,
      pricing.net_fare,
      totalAmount,
    ) ?? 0;

  const discount =
    toAmount(
      detail.discount,
      detail.discount_amount,
      hotelBooking.discount,
      hotelBooking.discount_amount,
      pricing.discount,
      pricing.discount_amount,
    ) ?? 0;

  const couponDiscount =
    toAmount(
      detail.coupon_discount,
      hotelBooking.coupon_discount,
      pricing.coupon_discount,
      pricing.couponDiscount,
    ) ?? 0;

  const gstAmount =
    toAmount(
      detail.gst_taxes_amount,
      detail.gst_amount,
      hotelBooking.gst_taxes_amount,
      pricing.gst,
      pricing.gst_amount,
      pricing.gst_taxes_amount,
    ) ?? 0;

  const taxesAmount =
    toAmount(
      detail.taxes,
      detail.tax_amount,
      detail.taxes_amount,
      hotelBooking.taxes,
      hotelBooking.tax_amount,
      pricing.tax,
      pricing.tax_amount,
      pricing.taxes,
      pricing.taxes_amount,
      pricing.all_taxes,
      pricing.total_taxes,
    ) ?? 0;

  const feesAmount =
    toAmount(
      detail.fees,
      detail.fee_amount,
      hotelBooking.fees,
      hotelBooking.fee_amount,
      pricing.fees,
      pricing.fee_amount,
      pricing.service_fee,
      pricing.convenience_fee,
    ) ?? 0;

  return {
    basePrice,
    discount,
    couponDiscount,
    gstAmount,
    taxesAmount,
    feesAmount,
    totalAmount,
    totalTaxesAndFees: gstAmount + taxesAmount + feesAmount,
  };
};

const normalizeHotelDetail = (payload, selectedBooking = {}) => {
  const detail = getDetailPayload(payload);
  const hotelBooking = detail.hotel_booking || detail.hotelBooking || detail;
  const hotel = firstValue(detail.hotel, detail.hotel_details, hotelBooking.hotel, {}) || {};
  const checkIn = firstValue(
    detail.check_in_date,
    detail.check_in,
    detail.checkIn,
    hotelBooking.check_in_date,
    hotelBooking.check_in,
    selectedBooking?.raw?.check_in_date,
  );
  const checkOut = firstValue(
    detail.check_out_date,
    detail.check_out,
    detail.checkOut,
    hotelBooking.check_out_date,
    hotelBooking.check_out,
    selectedBooking?.raw?.check_out_date,
  );
  const rooms = normalizeRooms(detail);
  const roomPricingTotals = rooms.reduce(
    (sum, room) => {
      const pricing = room?.pricing || {};
      sum.baseRate += toAmount(pricing.baseRate) ?? 0;
      sum.totalRate += toAmount(pricing.totalRate) ?? 0;
      sum.tax += toAmount(pricing.tax) ?? 0;
      sum.discount += toAmount(pricing.discount) ?? 0;
      sum.commission += toAmount(pricing.commission) ?? 0;
      sum.serviceCharge += toAmount(pricing.serviceCharge) ?? 0;
      sum.agentMarkup += toAmount(pricing.agentMarkup) ?? 0;
      sum.addonMarkup += toAmount(pricing.addonMarkup) ?? 0;
      sum.vatOnBFTax += toAmount(pricing.vatOnBFTax) ?? 0;
      sum.vatTotal += toAmount(pricing.vatTotal) ?? 0;
      sum.tcsTotal += toAmount(pricing.tcsTotal) ?? 0;
      sum.tdsOnCommission += toAmount(pricing.tdsOnCommission) ?? 0;
      sum.taxLines.push(...toList(pricing.taxLines));
      sum.hasRateData = sum.hasRateData || Boolean(pricing.hasRateData);
      return sum;
    },
    {
      baseRate: 0,
      totalRate: 0,
      tax: 0,
      discount: 0,
      commission: 0,
      serviceCharge: 0,
      agentMarkup: 0,
      addonMarkup: 0,
      vatOnBFTax: 0,
      vatTotal: 0,
      tcsTotal: 0,
      tdsOnCommission: 0,
      taxLines: [],
      hasRateData: false,
    },
  );
  const nights = Number(firstValue(detail.nights, hotelBooking.nights, 0)) || getNightCount(checkIn, checkOut);
  const amountPaid = firstValue(
    detail.amount_paid,
    detail.total_amount,
    detail.grand_total,
    hotelBooking.amount_paid,
    selectedBooking?.raw?.amount_paid,
  );
  const pricing = getHotelPricingBreakdown(detail, hotelBooking, amountPaid);
  const mergedPricing = {
    ...pricing,
    basePrice: roomPricingTotals.hasRateData && roomPricingTotals.baseRate
      ? roomPricingTotals.baseRate
      : pricing.basePrice,
    discount: roomPricingTotals.hasRateData
      ? roomPricingTotals.discount || pricing.discount
      : pricing.discount,
    commission: roomPricingTotals.hasRateData ? roomPricingTotals.commission : 0,
    gstAmount: roomPricingTotals.hasRateData
      ? roomPricingTotals.vatTotal + roomPricingTotals.vatOnBFTax
      : pricing.gstAmount,
    taxesAmount: roomPricingTotals.hasRateData
      ? roomPricingTotals.tax
      : pricing.taxesAmount,
    feesAmount: roomPricingTotals.hasRateData
      ? roomPricingTotals.serviceCharge +
        roomPricingTotals.agentMarkup +
        roomPricingTotals.addonMarkup +
        roomPricingTotals.tcsTotal
      : pricing.feesAmount,
    tdsOnCommission: roomPricingTotals.hasRateData
      ? roomPricingTotals.tdsOnCommission
      : 0,
    totalAmount: roomPricingTotals.hasRateData && roomPricingTotals.totalRate
      ? roomPricingTotals.totalRate
      : pricing.totalAmount,
  };
  mergedPricing.totalTaxesAndFees =
    (toAmount(mergedPricing.gstAmount) ?? 0) +
    (toAmount(mergedPricing.taxesAmount) ?? 0) +
    (toAmount(mergedPricing.feesAmount) ?? 0);
  const isCancel = Boolean(detail?.actions?.can_cancel);
  const isDownload = Boolean(detail?.actions?.can_download_ticket);
  const directCoordinates =
    detail.Latitude ||
    detail.Longitude ||
    detail.latitude ||
    detail.longitude
      ? {
          Latitude: firstValue(detail.Latitude, detail.latitude),
          Longitude: firstValue(detail.Longitude, detail.longitude),
        }
      : undefined;

  return {
    hotelName: firstValue(
      detail.hotel_name,
      hotelBooking.hotel_name,
      hotel.name,
      hotel.title,
      selectedBooking?.hotel,
      "Hotel booking",
    ),
    status: String(
      firstValue(detail.booking_status, detail.status, hotelBooking.booking_status, selectedBooking?.status, "CONFIRMED"),
    ).toUpperCase(),
    image: buildMediaUrl(
      firstValue(detail.hotel_image, hotelBooking.hotel_image, hotel.image, hotel.thumbnail, selectedBooking?.image),
    ),
    address: formatAddress(
      firstValue(
        detail.address,
        detail.contact_info,
        hotelBooking.address,
        hotel.info?.HotelAddress,
        hotel.full_address,
        "N/A",
      ),
    ),
    phone: formatPlainValue(
      firstValue(detail.phone, hotelBooking.phone, hotel.phone, hotel.contact_number, "N/A"),
    ),
    gps: formatCoordinates(
      firstValue(
        detail.gps_coordinates,
        detail.coordinates,
        directCoordinates,
        hotel.gps_coordinates,
        hotel.coordinates,
        "N/A",
      ),
    ),
    checkIn,
    checkOut,
    checkInTime: firstValue(detail.check_in_time, hotelBooking.check_in_time, "14:00 - 21:00"),
    checkOutTime: firstValue(detail.check_out_time, hotelBooking.check_out_time, "08:00 - 10:00"),
    rooms,
    nights,
    roomCount: Number(firstValue(detail.rooms_count, detail.room_count, hotelBooking.rooms_count, rooms.length)) || rooms.length,
    guestsCount:
      Number(firstValue(detail.guests_count, detail.guest_count, hotelBooking.guests_count, selectedBooking?.raw?.guests_count, 0)) ||
      rooms.reduce((sum, room) => sum + room.adults + room.children, 0),
    description: firstValue(
      detail.description,
      hotel.description,
      "Booking details for this property.",
    ),
    mealPlan: firstValue(detail.meal_plan, detail.mealPlan, hotelBooking.meal_plan, ""),
    pricing: mergedPricing,
    basePrice: mergedPricing.basePrice,
    discount: mergedPricing.discount,
    couponDiscount: mergedPricing.couponDiscount,
    commission: mergedPricing.commission,
    gstAmount: mergedPricing.gstAmount,
    taxes: mergedPricing.totalTaxesAndFees,
    taxesAmount: mergedPricing.taxesAmount,
    feesAmount: mergedPricing.feesAmount,
    tdsOnCommission: mergedPricing.tdsOnCommission,
    totalAmount: mergedPricing.totalAmount,
    taxLines: roomPricingTotals.taxLines,
    amenities: getAmenityLabels(detail),
    bookingId: firstValue(detail.booking_id, hotelBooking.booking_id, selectedBooking?.id, ""),
    isCancel:isCancel,
    isDownload:isDownload,
  };
};

const IndividualProperty = ({
  activeTab,
  setActiveTab,
  selectedBooking,
  onBack,
}) => {
  const [isActive, setIsActive] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [hotelDetailPayload, setHotelDetailPayload] = useState(null);
  const [isHotelDetailLoading, setIsHotelDetailLoading] = useState(false);
  const [hotelDetailError, setHotelDetailError] = useState("");
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);
  const [refetchdetails, setRefetchDetails] = useState(false);
  const [openRoomSections, setOpenRoomSections] = useState({
    guests: true,
  });

  const openCancelModal = () => setShowCancelModal(true);
  const closeCancelModal = () => setShowCancelModal(false);

  const [showModifyModal, setShowModifyModal] = useState(false);
  const { setMobileTitle } = useProfile();

  useEffect(() => {
    setMobileTitle?.("Booking Details");

    return () => {
      setMobileTitle?.("Active Reservations");
    };
  }, []);

  const hotelDetailId =
    selectedBooking?.detailId ||
    selectedBooking?.raw?.id ||
    selectedBooking?.raw?.booking?.id ||
    selectedBooking?.id;

  useEffect(() => {
    if (activeTab !== "HOTEL BOOKING" || !hotelDetailId) return;

    let ignore = false;

    const loadHotelDetail = async () => {
      setIsHotelDetailLoading(true);
      setHotelDetailError("");

      try {
        const response = await api.get("/booking-details", {
          params: {
            domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337",
            type: "hotel",
            id: hotelDetailId,
          },
        });

        if (!ignore) {
          setHotelDetailPayload(response?.data);
          setActiveRoomIndex(0);
        }
      } catch (error) {
        if (!ignore) {
          setHotelDetailPayload(null);
          setHotelDetailError("Unable to load booking details.");
        }
      } finally {
        if (!ignore) {
          setIsHotelDetailLoading(false);
        }
      }
    };

    loadHotelDetail();

    return () => {
      ignore = true;
    };
  }, [activeTab, hotelDetailId,refetchdetails]);

  const hotelDetail = React.useMemo(
    () => normalizeHotelDetail(hotelDetailPayload || selectedBooking?.raw || {}, selectedBooking),
    [hotelDetailPayload, selectedBooking],
  );

  useEffect(() => {
    setOpenRoomSections({ guests: true });
  }, [activeRoomIndex]);

  const checkInDate = getDateParts(hotelDetail.checkIn);
  const checkOutDate = getDateParts(hotelDetail.checkOut);
  const activeRoom = hotelDetail.rooms[activeRoomIndex] || hotelDetail.rooms[0];
  const activeRoomPolicies = splitPolicyRows(activeRoom?.policies || []);
  const amenitiesToShow = hotelDetail.amenities.map((label) => ({ icon: "/icons/ac.svg", label }));
  const shouldShowDetailLoading =
    activeTab === "HOTEL BOOKING" &&
    Boolean(hotelDetailId) &&
    isHotelDetailLoading &&
    !hotelDetailPayload;
  const shouldShowMissingDetail =
    activeTab === "HOTEL BOOKING" &&
    Boolean(hotelDetailId) &&
    !isHotelDetailLoading &&
    Boolean(hotelDetailError) &&
    !hotelDetailPayload;
  const isCorporate = false;
  const hasRateFormula =
    Number(toAmount(hotelDetail.basePrice)) > 0 ||
    Number(toAmount(hotelDetail.commission)) > 0 ||
    Number(toAmount(hotelDetail.tdsOnCommission)) > 0;
  const pricingRows = hasRateFormula
    ? [
        {
          label: `${formatCurrency(hotelDetail.basePrice)} x ${hotelDetail.roomCount} Room${hotelDetail.roomCount === 1 ? "" : "s"} x ${hotelDetail.nights} Night${hotelDetail.nights === 1 ? "" : "s"}`,
          value: formatCurrency(hotelDetail.basePrice),
        },
        { label: "Base Rate", value: formatCurrency(hotelDetail.basePrice) },
        hotelDetail.commission
          ? { label: "- Off Commission", value: `- ${formatCurrency(hotelDetail.commission)}` }
          : null,
        ...toList(hotelDetail.taxLines).map((taxLine, index) => ({
          label: taxLine?.label || `Tax ${index + 1}`,
          value: formatCurrency(taxLine?.amount || 0),
        })),
        hotelDetail.tdsOnCommission
          ? { label: "TDS On Commission", value: formatCurrency(hotelDetail.tdsOnCommission) }
          : null,
        { label: "Total Rate", value: formatCurrency(hotelDetail.totalAmount) },
      ].filter(Boolean)
    : [
        {
          label: `${formatCurrency(hotelDetail.basePrice)} x ${hotelDetail.roomCount} Room${hotelDetail.roomCount === 1 ? "" : "s"} x ${hotelDetail.nights} Night${hotelDetail.nights === 1 ? "" : "s"}`,
          value: formatCurrency(hotelDetail.basePrice),
        },
        { label: "Base Price", value: formatCurrency(hotelDetail.basePrice) },
        hotelDetail.discount
          ? { label: "Discount", value: formatCurrency(hotelDetail.discount) }
          : null,
        hotelDetail.couponDiscount
          ? { label: "Coupon Discount", value: formatCurrency(hotelDetail.couponDiscount) }
          : null,
        ...toList(hotelDetail.taxLines).map((taxLine, index) => ({
          label: taxLine?.label || `Tax ${index + 1}`,
          value: formatCurrency(taxLine?.amount || 0),
        })),
        hotelDetail.gstAmount
          ? { label: "GST", value: formatCurrency(hotelDetail.gstAmount) }
          : null,
        hotelDetail.taxesAmount
          ? { label: "Other Taxes", value: formatCurrency(hotelDetail.taxesAmount) }
          : null,
        hotelDetail.feesAmount
          ? { label: "Fees", value: formatCurrency(hotelDetail.feesAmount) }
          : null,
        { label: "Taxes & Fees", value: formatCurrency(hotelDetail.taxes) },
      ].filter(Boolean);

  const openModifyModal = () => setShowModifyModal(true);
  const closeModifyModal = () => setShowModifyModal(false);
  const toggleRoomSection = (sectionKey) => {
    setOpenRoomSections((current) => ({
      ...current,
      [sectionKey]: !current[sectionKey],
    }));
  };

  return (
    <>
      {activeTab === "HOTEL BOOKING" && (
        <div className={styles.container}>
          <button type="button" className={styles.backButton} onClick={onBack}>
            <span aria-hidden="true">←</span>
            Back
          </button>
          {shouldShowDetailLoading && (
            <div className={styles.innerContainer}>
              <p className={styles.loadingText}>Loading booking details...</p>
            </div>
          )}
          {shouldShowMissingDetail && (
            <div className={styles.innerContainer}>
              <p className={styles.errorText}>
                Booking details are not available right now.
              </p>
            </div>
          )}
          <div className={styles.innerContainer}>
            {/* Header Section */}
            <header className={styles.header}>
              <div className={styles.hotelInfo}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={hotelDetail.image}
                    alt={hotelDetail.hotelName}
                    fill
                    className={styles.objectFit}
                  />
                </div>
                <div className={styles.details}>
                  <h1 className={styles.hotelName}>{hotelDetail.hotelName}</h1>
                  <p className={styles.textSecondary}>
                    <span className={styles.infoLabel}>Address:</span>
                    <span className={styles.infoValue}>{hotelDetail.address}</span>
                  </p>

                  <p className={styles.textSecondary}>
                    <span className={styles.infoLabel}>Phone:</span>
                    <span className={styles.infoValue}>{hotelDetail.phone}</span>
                  </p>

                  <p className={styles.textSecondary}>
                    <span className={styles.infoLabel}>GPS coordinates:</span>
                    <span className={styles.infoValue}>{hotelDetail.gps}</span>
                  </p>
                  {isHotelDetailLoading && (
                    <p className={styles.loadingText}>Loading booking details...</p>
                  )}
                  {hotelDetailError && (
                    <p className={styles.errorText}>{hotelDetailError}</p>
                  )}
                </div>
              </div>

              <div className={styles.bookingMeta}>
                <div className={styles.metaBox}>
                  <span className={styles.label}>Check-In</span>
                  <span className={styles.dateNumber}>{checkInDate.day}</span>
                  <span className={styles.month}>{checkInDate.month}</span>
                  <div className={styles.timeWrapper}>
                    <Image
                      src="/icons/alarm-clock.svg"
                      alt="Time"
                      width={18}
                      height={18}
                      className={styles.timeIcon}
                    />
                    <span className={styles.time}>{hotelDetail.checkInTime}</span>
                  </div>
                </div>
                <div className={styles.divider} />
                <div className={styles.metaBox}>
                  <span className={styles.label}>Check-Out</span>
                  <span className={styles.dateNumber}>{checkOutDate.day}</span>
                  <span className={styles.month}>{checkOutDate.month}</span>
                  <div className={styles.timeWrapper}>
                    <Image
                      src="/icons/alarm-clock.svg"
                      alt="Time"
                      width={18}
                      height={18}
                      className={styles.timeIcon}
                    />
                    <span className={styles.time}>{hotelDetail.checkOutTime}</span>
                  </div>
                </div>
                <div className={styles.divider} />
                <div className={styles.statusSection}>
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className={`${styles.statusBadge} ${
                      isActive ? styles.active : ""
                    }`}
                  >
                    {hotelDetail.status}
                  </button>
                  <div className={styles.roomCount}>
                    <div className={styles.countGroup}>
                      <span className={styles.label}>Rooms</span>
                      <span className={styles.value}>{hotelDetail.roomCount}</span>
                    </div>
                    <span className={styles.slash}>/</span>
                    <div className={styles.countGroup}>
                      <span className={styles.label}>Nights</span>
                      <span className={styles.value}>{hotelDetail.nights}</span>
                    </div>
                  </div>
                </div>
              </div>
            </header>
          </div>
          <div className={styles.detailsWrapper}>
            {/* About Section */}
            <section className={styles.aboutSection}>
              <div className={styles.description}>
                <h2 className={styles.sectionTitle}>ABOUT THIS PROPERTY</h2>
                <h3 className={styles.subTitle}>
                  {hotelDetail.guestsCount} guest{hotelDetail.guestsCount === 1 ? "" : "s"} · {hotelDetail.roomCount} room{hotelDetail.roomCount === 1 ? "" : "s"} · {hotelDetail.nights} night{hotelDetail.nights === 1 ? "" : "s"}
                </h3>
                <p
                  className={`${styles.textSecondary} ${styles.textSecondary2}`}
                >
                  {hotelDetail.description}
                </p>
              </div>
              <div className={styles.mapWrapper}>
                <Image
                  src="/images/map-view.png"
                  alt="Map Location"
                  fill
                  className={styles.objectFit}
                />

                {/* Map Pin Icon */}
                <Image
                  src="/icons/map-pin.svg"
                  alt="Location Pin"
                  width={24}
                  height={28}
                  className={styles.mapPin}
                />
              </div>
            </section>

            {/* Booking Summary */}
            <section className={styles.summarySection}>
              <h2 className={styles.sectionTitle}>BOOKING SUMMARY</h2>
              <div className={styles.priceTable}>
                {pricingRows.map((item, idx) => (
                  <div key={idx} className={styles.priceRow}>
                    <span className={styles.priceLabel}>{item.label}</span>
                    <span className={styles.textPrimary}>{item.value}</span>
                  </div>
                ))}
                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Total Amount</span>
                  <span className={styles.totalValue}>{formatCurrency(hotelDetail.totalAmount)}</span>
                </div>
              </div>
            </section>

            <div className={styles.infoAmenitiesWrapper}>
              <div className={styles.guestInfo}>
                <div className={styles.roomTabs}>
                  {hotelDetail.rooms.map((room, index) => (
                    <button
                      key={room.id || index}
                      type="button"
                      className={`${styles.roomTab} ${
                        activeRoomIndex === index ? styles.activeRoomTab : ""
                      }`}
                      onClick={() => setActiveRoomIndex(index)}
                    >
                      {room.name || `Room ${index + 1}`}
                    </button>
                  ))}
                </div>

                <div className={styles.roomGuestPanel}>
                  <section className={styles.accordionItem}>
                    <button
                      type="button"
                      className={styles.accordionHeader}
                      onClick={() => toggleRoomSection("guests")}
                    >
                      <span>
                        {activeRoom?.name || "Room"}: {Number(activeRoom?.adults || 0)} Adult{Number(activeRoom?.adults || 0) === 1 ? "" : "s"}
                        {Number(activeRoom?.children || 0)
                          ? `, ${activeRoom.children} Child${Number(activeRoom.children) === 1 ? "" : "ren"}`
                          : ""}
                      </span>
                      <span className={styles.accordionIcon}>
                        {openRoomSections.guests ? "-" : "+"}
                      </span>
                    </button>
                    {openRoomSections.guests && (
                      <div className={styles.accordionPanel}>
                        {activeRoom?.guests?.length ? (
                          <div className={styles.guestList}>
                            {activeRoom.guests.map((guest) => (
                              <div key={guest.id} className={styles.guestCard}>
                                <span className={styles.guestName}>{guest.name}</span>
                                <span className={styles.guestMeta}>
                                  {guest.type}
                                  {guest.age ? ` · Age ${guest.age}` : ""}
                                </span>
                                {guest.email && <span className={styles.guestMeta}>{guest.email}</span>}
                                {guest.phone && <span className={styles.guestMeta}>{guest.phone}</span>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className={styles.infoText}>Guest details are not available for this room.</p>
                        )}
                      </div>
                    )}
                  </section>

                  <section className={styles.accordionItem}>
                    <button
                      type="button"
                      className={styles.accordionHeader}
                      onClick={() => toggleRoomSection("meal")}
                    >
                      <span>Meal Plan</span>
                      <span className={styles.accordionIcon}>
                        {openRoomSections.meal ? "-" : "+"}
                      </span>
                    </button>
                    {openRoomSections.meal && (
                      <div className={styles.accordionPanel}>
                        <p className={styles.infoText}>
                          {activeRoom?.boardBasis?.length
                            ? activeRoom.boardBasis.join(", ")
                            : hotelDetail.mealPlan || "Meal plan details are not available."}
                        </p>
                      </div>
                    )}
                  </section>

                  {activeRoom?.inclusions?.length ? (
                    <section className={styles.accordionItem}>
                      <button
                        type="button"
                        className={styles.accordionHeader}
                        onClick={() => toggleRoomSection("inclusions")}
                      >
                        <span>Room Inclusions</span>
                        <span className={styles.accordionIcon}>
                          {openRoomSections.inclusions ? "-" : "+"}
                        </span>
                      </button>
                      {openRoomSections.inclusions && (
                        <div className={styles.accordionPanel}>
                          <div className={styles.chipGrid}>
                            {activeRoom.inclusions.map((item, index) => (
                              <span key={`${item}-${index}`} className={styles.infoChip}>
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </section>
                  ) : null}

                  {activeRoom?.facilities?.length ? (
                    <section className={styles.accordionItem}>
                      <button
                        type="button"
                        className={styles.accordionHeader}
                        onClick={() => toggleRoomSection("facilities")}
                      >
                        <span>Facilities</span>
                        <span className={styles.accordionIcon}>
                          {openRoomSections.facilities ? "-" : "+"}
                        </span>
                      </button>
                      {openRoomSections.facilities && (
                        <div className={styles.accordionPanel}>
                          <div className={styles.chipGrid}>
                            {activeRoom.facilities.map((item, index) => (
                              <span key={`${item}-${index}`} className={styles.infoChip}>
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </section>
                  ) : null}

                  {activeRoom?.cancellationPolicies?.length ? (
                    <section className={styles.accordionItem}>
                      <button
                        type="button"
                        className={styles.accordionHeader}
                        onClick={() => toggleRoomSection("cancellation")}
                      >
                        <span>Cancellation Policy</span>
                        <span className={styles.accordionIcon}>
                          {openRoomSections.cancellation ? "-" : "+"}
                        </span>
                      </button>
                      {openRoomSections.cancellation && (
                        <div className={styles.accordionPanel}>
                          <div className={styles.policyList}>
                            {activeRoom.cancellationPolicies.map((policy, index) => (
                              <div key={`${policy.text}-${index}`} className={styles.policyItem}>
                                <p>{policy.text || "Cancellation policy applies."}</p>
                                {(policy.fromDate || policy.toDate || policy.amount !== "") && (
                                  <span>
                                    {policy.fromDate ? `From ${policy.fromDate}` : ""}
                                    {policy.toDate ? ` to ${policy.toDate}` : ""}
                                    {policy.amount !== "" ? ` · Charge ${formatCurrency(policy.amount)}` : ""}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </section>
                  ) : null}

                  {activeRoomPolicies.length ? (
                    <section className={styles.accordionItem}>
                      <button
                        type="button"
                        className={styles.accordionHeader}
                        onClick={() => toggleRoomSection("policies")}
                      >
                        <span>Room Policies</span>
                        <span className={styles.accordionIcon}>
                          {openRoomSections.policies ? "-" : "+"}
                        </span>
                      </button>
                      {openRoomSections.policies && (
                        <div className={styles.accordionPanel}>
                          <ul className={styles.roomPolicyList}>
                            {activeRoomPolicies.map((policy, index) => (
                              <li key={`${policy}-${index}`}>{policy}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </section>
                  ) : null}
                </div>
              </div>

              {amenitiesToShow.length ? (
                <div className={styles.amenitiesGrid}>
                  {amenitiesToShow.map((item, idx) => (
                    <div key={idx} className={styles.amenityCard}>
                      <div className={styles.iconWrapper}>
                        <Image
                          src={item.icon}
                          alt={item.label}
                          width={22}
                          height={22}
                        />
                      </div>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {(hotelDetail.isCancel || hotelDetail.isDownload || isCorporate) && (
              <footer className={styles.footerActions}>
                {hotelDetail.isCancel && (
                  <button onClick={openCancelModal} className={styles.btnSecondary}>
                    CANCEL BOOKING
                  </button>
                )}
                {isCorporate && (
                  <button onClick={openModifyModal} className={styles.btnPrimary}>
                    MODIFY BOOKING
                  </button>
                )}
                {hotelDetail.isDownload && (
                  <button className={styles.btnPrimary}>DOWNLOAD INVOICE</button>
                )}
              </footer>
            )}
          </div>
        </div>
      )}

      {activeTab === "FLIGHT BOOKING" && <FlightBookingDetails onBack={onBack} />}

      {activeTab === "PACKAGES" && (
        <PackageDetails booking={selectedBooking} onBack={onBack} />
      )}

      {activeTab === "TRAVEL INSURANCE" && <InsurenceDetails />}

      {activeTab !== "HOTEL BOOKING" && (
        <div className={styles.mobileView}>
          <BookingDetails activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      )}

      {showModifyModal && (
        <ModifyBookingModal
          bookingId="BK001235"
          checkIn="20 Jan 2026"
          checkOut="22 Jan 2026"
          onClose={closeModifyModal}
        />
      )}
      {showCancelModal && (
        <CancelBookingModal
          hotelName={hotelDetail.hotelName}
          bookingId={hotelDetail.bookingId}
          onClose={closeCancelModal}
           onSuccess={() => setRefetchDetails(!refetchdetails)}
        />
      )}
    </>
  );
};

export default IndividualProperty;

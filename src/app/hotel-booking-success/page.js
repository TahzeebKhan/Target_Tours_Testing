"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  confirmHotelBooking,
  retrieveHotelBookingDetails,
  clearCompletedHotelFlowStorage,
  clearPendingHotelConfirmBooking,
  markHotelBookingConfirmed,
  readPendingHotelConfirmBooking,
  readHotelBookingSession,
} from "@/shared/services/hotelSearch";
import styles from "./page.module.css";
import BrandLogo from "@/shared/components/BrandLogo";
import Navbar from "../flight-booking-details/Navbar";

const pickFirst = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const getMerchantOrderIdFromParams = (searchParams) =>
  pickFirst(
    searchParams.get("merchant_order_id"),
    searchParams.get("merchantOrderId"),
    searchParams.get("merchantId"),
    searchParams.get("merchant_id"),
    searchParams.get("orderId"),
    searchParams.get("order_id"),
    searchParams.get("transactionId"),
    searchParams.get("transaction_id"),
  );

const getResponseValue = (response, ...keys) => {
  const sources = [
    response,
    response?.data,
    response?.booking,
    response?.data?.booking,
    response?.payment,
    response?.data?.payment,
  ];

  for (const source of sources) {
    if (!source || typeof source !== "object") continue;

    for (const key of keys) {
      if (source[key] !== undefined && source[key] !== null && source[key] !== "") {
        return source[key];
      }
    }
  }

  return "";
};

const buildRetrieveBookingRequest = ({ source = {}, fallback = {} }) => ({
  booking_id: pickFirst(
    getResponseValue(
      source,
      "booking_id",
      "bookingId",
      "BookingConfirmationId",
      "bookingConfirmationId",
      "id",
      "merchant_order_id",
      "merchantOrderId",
    ),
    fallback.booking_id,
    fallback.bookingId,
    fallback.merchant_order_id,
    fallback.merchantOrderId,
  ),
  TUI: pickFirst(
    getResponseValue(source, "TUI", "tui"),
    fallback.TUI,
    fallback.tui,
  ),
  ReferenceNumber: pickFirst(
    getResponseValue(
      source,
      "ReferenceNumber",
      "referenceNumber",
      "provider_reference",
      "providerReference",
      "TransactionID",
      "transactionId",
    ),
    fallback.ReferenceNumber,
    fallback.referenceNumber,
    fallback.provider_reference,
    fallback.providerReference,
    fallback.TransactionID,
    fallback.transactionId,
  ),
});

const formatCurrency = (value) => {
  const amount =
    typeof value === "string"
      ? Number(value.replace(/[^\d.]/g, ""))
      : Number(value);
  if (!Number.isFinite(amount)) return "N/A";
  return `₹ ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  return String(value || "N/A");
};

const toNumber = (value) => {
  const amount =
    typeof value === "string" ? Number(value.replace(/[^\d.-]/g, "")) : Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const toList = (value) => (Array.isArray(value) ? value : []);

const isBrowserReload = () => {
  if (typeof window === "undefined") return false;

  const navigationEntry = window.performance
    ?.getEntriesByType?.("navigation")
    ?.[0];

  return navigationEntry?.type === "reload";
};

const buildHotelAddress = (hotelInfo = {}) => {
  const address = hotelInfo.HotelAddress || hotelInfo.hotelAddress || {};

  return [
    address.AddressLine1,
    address.AddressLine2,
    address.City,
    address.State,
    address.Country,
    address.ZIP,
  ]
    .filter(Boolean)
    .join(", ");
};

const normalizeRetrieveRooms = (rooms = [], fallbackRooms = []) => {
  if (!Array.isArray(rooms) || !rooms.length) return fallbackRooms;

  return rooms.map((room) => {
    const rates = toList(room.RoomRates);
    const rate = rates[0] || {};

    return {
      id: room.RoomId || room.ID || room.id || room.Name,
      title: room.Name || room.name || room.title || "Room",
      quantity: 1,
      pricePerNight: toNumber(rate.TotalRate || room.TotalRate || room.pricePerNight),
      baseFare: toNumber(rate.BaseRate || rate.TotalRate || room.BaseRate),
      tax: toNumber(rate.Tax?.Amount || rate.tax?.amount || room.Tax?.Amount),
      adults: toNumber(room.NumberOfAdults || room.adults),
      children: toNumber(room.NumberOfChildren || room.children),
      capacity: room.Capacity || room.capacity || "",
      refundable: room.Refundable || room.refundable || "",
      supplierConfirmationNumber:
        room.SupplierConfirmationNumber || room.HotelConfirmationNumber || "",
      guests: toList(room.Guests),
      inclusions: toList(room.RoomInclusions).map((item) => item.name).filter(Boolean),
      policies: toList(room.RoomPolicies).map((item) => item.name).filter(Boolean),
    };
  });
};

function HotelBookingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookingResponse, setBookingResponse] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const bookingId = useMemo(() => {
    return searchParams.get("booking_id") || "";
  }, [searchParams]);

  const merchantOrderId = useMemo(() => {
    if (typeof window === "undefined") return "";

    const pendingBooking = readPendingHotelConfirmBooking();

    return (
      getMerchantOrderIdFromParams(searchParams) ||
      pendingBooking?.merchantOrderId ||
      pendingBooking?.confirmPayload?.merchant_order_id ||
      ""
    );
  }, [searchParams]);

  useEffect(() => {
    // Load local booking session for fallback details
    if (typeof window !== "undefined") {
      try {
        setSessionData(readHotelBookingSession());
      } catch (err) {
        console.error("Failed to load hotel booking session data", err);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    window.history.replaceState(
      { ...(window.history.state || {}), hotelBookingSuccess: true },
      "",
      window.location.href,
    );
    window.history.pushState(
      { ...(window.history.state || {}), hotelBookingSuccessGuard: true },
      "",
      window.location.href,
    );

    const handleBackNavigation = () => {
      clearCompletedHotelFlowStorage();
      router.replace("/");
    };

    window.addEventListener("popstate", handleBackNavigation);

    return () => {
      window.removeEventListener("popstate", handleBackNavigation);
    };
  }, [router]);

  useEffect(() => {
    let isActive = true;

    const loadBookingDetails = async () => {
      if (isBrowserReload()) {
        clearCompletedHotelFlowStorage();
        router.replace("/");
        return;
      }

      const pendingBooking = readPendingHotelConfirmBooking();

      if (!bookingId && !merchantOrderId && !pendingBooking?.confirmPayload) {
        setError("Payment details are missing. Please start the booking again.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        let data;

        if (bookingId) {
          data = await retrieveHotelBookingDetails({
            booking_id: bookingId,
            TUI: searchParams.get("TUI") || searchParams.get("tui") || "",
            ReferenceNumber:
              searchParams.get("ReferenceNumber") ||
              searchParams.get("referenceNumber") ||
              searchParams.get("TransactionID") ||
              searchParams.get("transactionId") ||
              "",
          });
        } else {
          const confirmPayload = {
            ...(pendingBooking?.confirmPayload || {}),
            merchant_order_id:
              merchantOrderId ||
              pendingBooking?.merchantOrderId ||
              pendingBooking?.confirmPayload?.merchant_order_id ||
              "",
          };

          if (!confirmPayload.merchant_order_id) {
            throw new Error("Merchant order ID is missing from the payment response.");
          }

          const confirmResponse = await confirmHotelBooking(confirmPayload);
          const retrieveRequest = buildRetrieveBookingRequest({
            source: confirmResponse,
            fallback: confirmPayload,
          });

          if (retrieveRequest.booking_id) {
            data = await retrieveHotelBookingDetails(retrieveRequest);
          } else {
            data = confirmResponse;
          }

          clearPendingHotelConfirmBooking();
        }

        if (!isActive) return;
        markHotelBookingConfirmed({
          bookingId: bookingId || getResponseValue(data, "booking_id", "bookingId"),
          merchantOrderId,
        });
        setBookingResponse(data);
        clearCompletedHotelFlowStorage();
      } catch (err) {
        if (!isActive) return;
        console.error("API error fetching hotel booking details", err);
        setError(
          err?.message || "Unable to retrieve hotel booking details."
        );
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadBookingDetails();

    return () => {
      isActive = false;
    };
  }, [bookingId, merchantOrderId, router]);

  const details = useMemo(() => {
    const apiData = bookingResponse || {};
    const retrieveData =
      apiData?.data?.HotelInfo || apiData?.data?.Rooms
        ? apiData.data
        : apiData?.HotelInfo || apiData?.Rooms
          ? apiData
          : apiData.data || apiData;
    const apiBooking = retrieveData.booking || apiData.booking || apiData.data?.booking || {};
    const statusMeta = retrieveData.status_meta || apiData.status_meta || apiData.data?.status_meta || {};
    const hotelInfo = retrieveData.HotelInfo || retrieveData.hotelInfo || {};
    const contactInfo = retrieveData.ContactInfo || retrieveData.contactInfo || {};

    // Fallbacks from session storage
    const sessionHotel = sessionData?.hotel || {};
    const sessionRequest = sessionData?.request || {};
    const sessionRooms = sessionData?.rooms || [];
    const normalizedRooms = normalizeRetrieveRooms(retrieveData.Rooms, sessionRooms);

    // Guest details extraction
    const guests = normalizedRooms.flatMap((room) => room.guests || []);

    // Try to count adults/children
    const adultCount =
      normalizedRooms.reduce((sum, room) => sum + toNumber(room.adults), 0) ||
      pickFirst(retrieveData.PaxCount, sessionRequest.adults, sessionRequest.adultCount, 1);
    const childCount =
      normalizedRooms.reduce((sum, room) => sum + toNumber(room.children), 0) ||
      pickFirst(sessionRequest.children, sessionRequest.childCount, 0);

    // Date formatting helper
    const checkIn = pickFirst(
      retrieveData.CheckInDate,
      retrieveData.checkInDate,
      sessionRequest.checkInDate,
      sessionRequest.checkIn
    );
    const checkOut = pickFirst(
      retrieveData.CheckOutDate,
      retrieveData.checkOutDate,
      sessionRequest.checkOutDate,
      sessionRequest.checkOut
    );

    // Calculate nights
    let nights = 1;
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (!Number.isNaN(diffDays)) nights = diffDays;
    } else if (sessionRooms[0]?.nights) {
      nights = sessionRooms[0].nights;
    }

    const roomBaseFare = normalizedRooms.reduce((sum, room) => sum + toNumber(room.baseFare), 0);
    const roomTaxes = normalizedRooms.reduce((sum, room) => sum + toNumber(room.tax), 0);
    const fallbackAmount = sessionRooms.reduce(
      (sum, r) =>
        sum +
        (Number(r.pricePerNight || 0) + Number(r.taxPerNight || 0)) *
          Number(r.quantity || 0) *
          Number(r.nights || 1),
      0,
    );
    const amount = pickFirst(
      retrieveData.NetFare,
      retrieveData.netFare,
      retrieveData.Amount,
      retrieveData.amount,
      roomBaseFare + roomTaxes || "",
      sessionData?.NetAmount,
      fallbackAmount,
    );

    return {
      bookingId: pickFirst(
        bookingId,
        apiBooking.booking_id,
        apiBooking.bookingId,
        retrieveData.BookingConfirmationId,
        retrieveData.HotelConfirmationNumber,
        retrieveData.booking_id,
        retrieveData.bookingId
      ),
      providerReference: pickFirst(
        apiBooking.provider_reference,
        apiBooking.providerReference,
        retrieveData.ReferenceNumber,
        retrieveData.TransactionId,
        retrieveData.TransactionID
      ),
      hotelName: pickFirst(
        hotelInfo.Name,
        hotelInfo.name,
        sessionHotel.name,
        "Hotel Booking"
      ),
      hotelAddress: pickFirst(
        buildHotelAddress(hotelInfo),
        sessionHotel.address,
        ""
      ),
      hotelImage: pickFirst(
        hotelInfo.heroimage,
        hotelInfo.heroImage,
        hotelInfo.image,
        sessionHotel.image
      ),
      hotelRating: pickFirst(
        hotelInfo.StarRating,
        hotelInfo.starRating,
        sessionHotel.rating,
        0
      ),
      checkInDate: checkIn,
      checkOutDate: checkOut,
      nights,
      checkInTime: retrieveData.CheckInTime || "",
      checkOutTime: retrieveData.CheckOutTime || "",
      roomsCount: normalizedRooms.length || 1,
      rooms: normalizedRooms,
      guests,
      adultCount,
      childCount,
      status: pickFirst(
        statusMeta.booking_status,
        statusMeta.payment_status,
        statusMeta.akbar_status_label,
        retrieveData.BookingStatus,
        retrieveData.CurrentStatus,
        retrieveData.PaymentStatus,
        "CONFIRMED"
      ),
      paymentStatus: pickFirst(statusMeta.payment_status, retrieveData.PaymentStatus, "SUCCESS"),
      amount,
      baseFare: roomBaseFare || Number(amount) - roomTaxes || Number(amount) * 0.88,
      taxes: roomTaxes || Number(amount) * 0.12,
      grossFare: retrieveData.GrossFare || "",
      contact: Object.keys(contactInfo).length ? contactInfo : sessionData?.ContactInfo || {},
      facilities: toList(retrieveData.HotelFacilities).map((item) => item.name).filter(Boolean),
      moreInfo: toList(retrieveData.MoreInfo).filter((item) => item.Description),
      issuedDate: retrieveData.IssuedDate || "",
      hotelConfirmationNumber: retrieveData.HotelConfirmationNumber || "",
      supplierConfirmationNumber:
        normalizedRooms.find((room) => room.supplierConfirmationNumber)
          ?.supplierConfirmationNumber || "",
    };
  }, [bookingResponse, sessionData, bookingId]);

  const handleDone = () => {
    if (typeof window !== "undefined") {
      clearCompletedHotelFlowStorage();
    }
    router.push("/");
  };

  return (
    <main className={styles.page}>
     
         <div className={styles.navbarWrapper}>
          <Navbar />
        </div>
  
       
      <div className={styles.backgroundPanel} />
      <section className={styles.card}>
        {loading ? (
          <div className={styles.loaderContainer}>
            <div className={styles.spinner} />
            <p className={styles.status}>Retrieving Details</p>
            <h1 className={styles.title}>Loading Booking Details</h1>
            <p className={styles.subtitle}>
              Please wait while we fetch the latest booking information from the provider.
            </p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorStatus} style={{ color: "#d92d20" }}>Booking Failed</p>
            <h1 className={styles.title}>Booking Failed</h1>
            <p className={styles.subtitle}>{error || "Payment was not completed. Booking session has been cleared."}</p>
            <div className={styles.infoGrid} style={{ marginTop: "20px", marginBottom: "20px" }}>
              <div>
                <span>{bookingId ? "Booking ID Requested" : "Merchant Order ID"}</span>
                <strong style={{ color: "#b42318" }}>
                  {bookingId || merchantOrderId || "N/A"}
                </strong>
              </div>
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                onClick={() => {
                  clearCompletedHotelFlowStorage();
                  router.push("/hotels");
                }}
              >
                Search Hotels Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.successHeader}>
              <div className={styles.successIconWrapper}>
                <svg className={styles.successIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className={styles.status}>{details.status}</p>
                <h1 className={styles.title}>Hotel Booking Confirmed</h1>
                <p className={styles.subtitle}>
                  Your reservation at {details.hotelName} was successful. A confirmation email has been sent.
                </p>
              </div>
            </div>

            <div className={styles.summaryGrid}>
              {/* Hotel detail card */}
              <div className={styles.hotelCard}>
                {details.hotelImage && (
                  <img src={details.hotelImage} alt={details.hotelName} className={styles.hotelImage} />
                )}
                <div className={styles.hotelInfo}>
                  <div className={styles.hotelHeader}>
                    <h2>{details.hotelName}</h2>
                    {details.hotelRating > 0 && (
                      <div className={styles.ratingStars}>
                        
                        {Array.from({ length: Math.round(details.hotelRating) }).map((_, i) => (
                          <span key={i} className={styles.star}>★</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {details.hotelAddress && <p className={styles.address}>{details.hotelAddress}</p>}

                  <div className={styles.stayDates}>
	                    <div className={styles.dateBlock}>
	                      <span className={styles.dateLabel}>Check-In</span>
	                      <strong className={styles.dateVal}>{formatDate(details.checkInDate)}</strong>
	                      {details.checkInTime && <span className={styles.dateTime}>{details.checkInTime}</span>}
	                    </div>
                    <div className={styles.dateDivider}>
                      <span className={styles.nightsBadge}>{details.nights} {details.nights === 1 ? 'Night' : 'Nights'}</span>
                      <div className={styles.dividerLine}></div>
                    </div>
	                    <div className={styles.dateBlock}>
	                      <span className={styles.dateLabel}>Check-Out</span>
	                      <strong className={styles.dateVal}>{formatDate(details.checkOutDate)}</strong>
	                      {details.checkOutTime && <span className={styles.dateTime}>{details.checkOutTime}</span>}
	                    </div>
                  </div>
                </div>
              </div>

              {/* Price card */}
              <div className={styles.priceCard}>
                <h2>Price Details</h2>
                <div className={styles.priceRows}>
                  <div>
                    <span>Room Charges ({details.nights} {details.nights === 1 ? 'night' : 'nights'})</span>
                    <strong>{formatCurrency(details.baseFare)}</strong>
                  </div>
	                  <div>
	                    <span>Taxes & Service Fees</span>
	                    <strong>{formatCurrency(details.taxes)}</strong>
	                  </div>
	                  {details.grossFare && (
	                    <div>
	                      <span>Gross Fare</span>
	                      <strong>{formatCurrency(details.grossFare)}</strong>
	                    </div>
	                  )}
	                </div>
                <div className={styles.totalLine}>
                  <span>Total Amount Paid</span>
                  <strong>{formatCurrency(details.amount)}</strong>
                </div>
              </div>
            </div>

            {/* General Info Grid */}
            <div className={styles.sectionHeader}>
              <h3>Booking References</h3>
            </div>
            <div className={styles.infoGrid}>
              {details.bookingId && (
                <div>
                  <span>Booking ID</span>
                  <strong>{details.bookingId}</strong>
                </div>
              )}
              {details.providerReference && (
                <div>
                  <span>Provider Reference</span>
                  <strong>{details.providerReference}</strong>
                </div>
              )}
	              <div>
	                <span>Status</span>
	                <strong className={styles.statusColor}>{details.status}</strong>
	              </div>
	              <div>
	                <span>Payment Status</span>
	                <strong className={styles.statusColor}>{details.paymentStatus}</strong>
	              </div>
	              <div>
	                <span>Rooms / Capacity</span>
	                <strong>{details.roomsCount} {details.roomsCount === 1 ? 'Room' : 'Rooms'} ({details.adultCount} ADT, {details.childCount} CHD)</strong>
	              </div>
	              {(details.supplierConfirmationNumber || details.hotelConfirmationNumber) && (
	                <div>
	                  <span>Confirmation No.</span>
	                  <strong>{details.supplierConfirmationNumber || details.hotelConfirmationNumber}</strong>
	                </div>
	              )}
	              {details.issuedDate && (
	                <div>
	                  <span>Issued Date</span>
	                  <strong>{details.issuedDate}</strong>
	                </div>
	              )}
	            </div>

            {/* Room Details & Guests */}
            {details.rooms && details.rooms.length > 0 && (
              <>
                <div className={styles.sectionHeader}>
                  <h3>Rooms Reserved</h3>
                </div>
                <div className={styles.roomsList}>
	                  {details.rooms.map((room, idx) => (
	                    <div key={idx} className={styles.roomRow}>
	                      <div className={styles.roomMain}>
	                        <strong>{room.title}</strong>
	                        <span>
	                          Qty: {room.quantity} | {room.adults || 0} ADT, {room.children || 0} CHD | {formatCurrency(room.pricePerNight)}
	                        </span>
	                        {room.inclusions?.length > 0 && (
	                          <span>{room.inclusions.join(" • ")}</span>
	                        )}
	                      </div>
	                    </div>
	                  ))}
	                </div>
	              </>
	            )}

	            {details.facilities?.length > 0 && (
	              <>
	                <div className={styles.sectionHeader}>
	                  <h3>Hotel Facilities</h3>
	                </div>
	                <div className={styles.chipList}>
	                  {details.facilities.slice(0, 18).map((facility, idx) => (
	                    <span key={`${facility}-${idx}`}>{facility}</span>
	                  ))}
	                </div>
	              </>
	            )}

	            {details.moreInfo?.length > 0 && (
	              <>
	                <div className={styles.sectionHeader}>
	                  <h3>Important Information</h3>
	                </div>
	                <div className={styles.policyList}>
	                  {details.moreInfo.slice(0, 8).map((item, idx) => (
	                    <div key={`${item.Name}-${idx}`}>
	                      <strong>{item.Name || item.Code || "Policy"}</strong>
	                      <span>{item.Description}</span>
	                    </div>
	                  ))}
	                </div>
	              </>
	            )}

            {/* Guest details if available */}
            {details.guests && details.guests.length > 0 && (
              <>
                <div className={styles.sectionHeader}>
                  <h3>Guest Information</h3>
                </div>
                <div className={styles.guestsList}>
                  {details.guests.map((guest, idx) => (
                    <div key={idx} className={styles.guestItem}>
                      <span className={styles.guestIndex}>Guest {idx + 1}</span>
                      <strong>
                        {guest.Title || guest.title || ""} {guest.FirstName || guest.firstName || ""} {guest.LastName || guest.lastName || ""}
                      </strong>
                      {(guest.Age || guest.age) && <span className={styles.guestAge}>({guest.Age || guest.age} yrs)</span>}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Contact details */}
            {details.contact && (details.contact.Email || details.contact.email) && (
              <>
                <div className={styles.sectionHeader}>
                  <h3>Billing & Contact Details</h3>
                </div>
                <div className={styles.contactDetails}>
                  <div>
                    <span>Primary Contact</span>
                    <strong>
                      {details.contact.Title || details.contact.title || ""} {details.contact.FName || details.contact.firstName || ""} {details.contact.LName || details.contact.lastName || ""}
                    </strong>
                  </div>
                  <div>
                    <span>Email Address</span>
                    <strong>{details.contact.Email || details.contact.email || "N/A"}</strong>
                  </div>
                  <div>
                    <span>Mobile Phone</span>
                    <strong>
                      {details.contact.MobileCountryCode || details.contact.mobileCountryCode || ""} {details.contact.Mobile || details.contact.mobile || "N/A"}
                    </strong>
                  </div>
                  <div>
                    <span>Billing Address</span>
                    <strong>
                      {[
                        details.contact.Address || details.contact.address,
                        details.contact.City || details.contact.city,
                        details.contact.State || details.contact.state,
                        details.contact.PIN || details.contact.pin,
                        details.contact.CountryCode || details.contact.countryCode,
                      ].filter(Boolean).join(", ")}
                    </strong>
                  </div>
                </div>
              </>
            )}

            <div className={styles.actions}>
              <button type="button" onClick={handleDone} className={styles.doneBtn}>
                Done
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default function HotelBookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className={styles.page}>
          <div className={styles.header}>
            <BrandLogo style={{ cursor: "pointer" }} fallbackSrc="/Logo.svg" alt="Target Tours Logo" />
          </div>
          <div className={styles.backgroundPanel} />
          <section className={styles.card}>
            <div className={styles.loaderContainer}>
              <div className={styles.spinner} />
              <p className={styles.status}>Loading</p>
              <h1 className={styles.title}>Confirming Hotel Reservation</h1>
              <p className={styles.subtitle}>Please wait while we fetch your booking details...</p>
            </div>
          </section>
        </main>
      }
    >
      <HotelBookingSuccessContent />
    </Suspense>
  );
}

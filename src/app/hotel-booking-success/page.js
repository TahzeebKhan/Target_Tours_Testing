"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  retrieveHotelBookingDetails,
  HOTEL_BOOKING_SESSION_KEY,
} from "@/shared/services/hotelSearch";
import styles from "./page.module.css";
import BrandLogo from "@/shared/components/BrandLogo";
import Navbar from "../flight-booking-details/Navbar";

const pickFirst = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

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

  useEffect(() => {
    // Load local booking session for fallback details
    if (typeof window !== "undefined") {
      try {
        const raw = window.sessionStorage.getItem(HOTEL_BOOKING_SESSION_KEY);
        if (raw) {
          setSessionData(JSON.parse(raw));
        }
      } catch (err) {
        console.error("Failed to load hotel booking session data", err);
      }
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setError("Booking ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const data = await retrieveHotelBookingDetails(bookingId);
        if (!isActive) return;
        setBookingResponse(data);
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

    fetchBookingDetails();

    return () => {
      isActive = false;
    };
  }, [bookingId]);

  const details = useMemo(() => {
    const apiData = bookingResponse || {};
    const apiBooking = apiData.booking || apiData.data?.booking || apiData.data || {};

    // Fallbacks from session storage
    const sessionHotel = sessionData?.hotel || {};
    const sessionRequest = sessionData?.request || {};
    const sessionRooms = sessionData?.rooms || [];

    // Guest details extraction
    let guests = [];
    if (apiBooking.guests && Array.isArray(apiBooking.guests)) {
      guests = apiBooking.guests;
    } else if (apiBooking.Rooms && Array.isArray(apiBooking.Rooms)) {
      guests = apiBooking.Rooms.flatMap(r => r.Guests || []);
    } else if (sessionData?.Rooms && Array.isArray(sessionData.Rooms)) {
      guests = sessionData.Rooms.flatMap(r => r.Guests || []);
    } else if (sessionData?.rooms && Array.isArray(sessionData.rooms)) {
      // Local session rooms might have guests if mapped during review
      guests = sessionData.rooms.flatMap(r => r.guests || []);
    }

    // Try to count adults/children
    const adultCount = pickFirst(sessionRequest.adults, sessionRequest.adultCount, 1);
    const childCount = pickFirst(sessionRequest.children, sessionRequest.childCount, 0);

    // Date formatting helper
    const checkIn = pickFirst(
      apiBooking.check_in,
      apiBooking.checkIn,
      apiBooking.CheckInDate,
      sessionRequest.checkInDate,
      sessionRequest.checkIn
    );
    const checkOut = pickFirst(
      apiBooking.check_out,
      apiBooking.checkOut,
      apiBooking.CheckOutDate,
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

    // Total price estimation
    const amount = pickFirst(
      apiBooking.net_amount,
      apiBooking.netAmount,
      apiBooking.amount,
      apiBooking.total_amount,
      apiBooking.totalAmount,
      sessionData?.NetAmount,
      sessionRooms.reduce((sum, r) => sum + (Number(r.pricePerNight || 0) + Number(r.taxPerNight || 0)) * Number(r.quantity || 0) * Number(r.nights || 1), 0)
    );

    const baseFare = sessionRooms.reduce((sum, r) => sum + Number(r.pricePerNight || 0) * Number(r.quantity || 0) * Number(r.nights || 1), 0);
    const taxes = sessionRooms.reduce((sum, r) => sum + Number(r.taxPerNight || 0) * Number(r.quantity || 0) * Number(r.nights || 1), 0);

    return {
      bookingId: bookingId,
      providerReference: pickFirst(
        apiBooking.provider_reference,
        apiBooking.providerReference,
        apiBooking.reference,
        apiBooking.providerRef,
        "N/A"
      ),
      hotelName: pickFirst(
        apiBooking.hotel_name,
        apiBooking.hotelName,
        apiBooking.hotel?.name,
        sessionHotel.name,
        "Hotel Booking"
      ),
      hotelAddress: pickFirst(
        apiBooking.hotel_address,
        apiBooking.hotelAddress,
        apiBooking.hotel?.address,
        sessionHotel.address,
        ""
      ),
      hotelImage: pickFirst(
        apiBooking.hotel_image,
        apiBooking.hotelImage,
        apiBooking.hotel?.image,
        sessionHotel.image,
        "/images/hotelArt1.png"
      ),
      hotelRating: pickFirst(
        apiBooking.hotel_rating,
        apiBooking.hotelRating,
        apiBooking.hotel?.rating,
        sessionHotel.rating,
        0
      ),
      checkInDate: checkIn,
      checkOutDate: checkOut,
      nights,
      roomsCount: sessionRooms.reduce((sum, r) => sum + Number(r.quantity || 0), 0) || 1,
      rooms: sessionRooms,
      guests,
      adultCount,
      childCount,
      status: pickFirst(
        apiBooking.status,
        apiBooking.booking_status,
        apiBooking.bookingStatus,
        "CONFIRMED"
      ),
      amount,
      baseFare: baseFare || Number(amount) * 0.88, // fallback math if session cleared
      taxes: taxes || Number(amount) * 0.12, // fallback math if session cleared
      contact: pickFirst(
        apiBooking.contact_info,
        apiBooking.contactInfo,
        apiBooking.ContactInfo,
        sessionData?.ContactInfo,
        {}
      ),
    };
  }, [bookingResponse, sessionData, bookingId]);

  const handleDone = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(HOTEL_BOOKING_SESSION_KEY);
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
            <p className={styles.errorStatus}>Error occurred</p>
            <h1 className={styles.title}>Unable to load details</h1>
            <p className={styles.subtitle}>{error}</p>
            <div className={styles.infoGrid} style={{ marginTop: "20px", marginBottom: "20px" }}>
              <div>
                <span>Booking ID Requested</span>
                <strong style={{ color: "#b42318" }}>{bookingId}</strong>
              </div>
            </div>
            <div className={styles.actions}>
              <button type="button" onClick={() => router.push("/")}>
                Back to Home
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
                <img src={details.hotelImage} alt={details.hotelName} className={styles.hotelImage} />
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
                    </div>
                    <div className={styles.dateDivider}>
                      <span className={styles.nightsBadge}>{details.nights} {details.nights === 1 ? 'Night' : 'Nights'}</span>
                      <div className={styles.dividerLine}></div>
                    </div>
                    <div className={styles.dateBlock}>
                      <span className={styles.dateLabel}>Check-Out</span>
                      <strong className={styles.dateVal}>{formatDate(details.checkOutDate)}</strong>
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
              <div>
                <span>Booking ID</span>
                <strong>{details.bookingId}</strong>
              </div>
              <div>
                <span>Provider Reference</span>
                <strong>{details.providerReference}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong className={styles.statusColor}>{details.status}</strong>
              </div>
              <div>
                <span>Rooms / Capacity</span>
                <strong>{details.roomsCount} {details.roomsCount === 1 ? 'Room' : 'Rooms'} ({details.adultCount} ADT, {details.childCount} CHD)</strong>
              </div>
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
                        <span>Qty: {room.quantity} | ₹ {Number(room.pricePerNight).toFixed(2)} per night</span>
                      </div>
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

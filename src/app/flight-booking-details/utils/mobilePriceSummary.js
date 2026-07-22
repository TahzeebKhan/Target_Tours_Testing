"use client";

import {
  extractTaxAmount,
  getBookingDetailsView,
  getBookingPassengerCounts,
} from "@/features/flights/utils/flightBookingSession";

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₹ 0";
  return `₹ ${amount.toLocaleString()}`;
};

const getPassengerCounts = (travelerDetails = [], bookingSession = null) => {
  if (Array.isArray(travelerDetails) && travelerDetails.length > 0) {
    return travelerDetails.reduce(
      (acc, traveler) => {
        const ptc = String(traveler?.PTC || "").toUpperCase();
        if (ptc === "CHD") acc.child += 1;
        else if (ptc === "INF") acc.infant += 1;
        else acc.adult += 1;
        return acc;
      },
      { adult: 0, child: 0, infant: 0 }
    );
  }

  return getBookingPassengerCounts(bookingSession);
};

const formatPassengerLabel = (counts) => {
  const parts = [];
  if (counts.adult > 0) parts.push(`${counts.adult}x Adult`);
  if (counts.child > 0) parts.push(`${counts.child}x Child`);
  if (counts.infant > 0) parts.push(`${counts.infant}x Infant`);
  return parts.join(", ") || "1x Adult";
};

export const buildMobilePriceSummary = ({
  prices = {},
  bookingSession = null,
  travelerDetails = [],
}) => {
  const passengerCounts = getPassengerCounts(travelerDetails, bookingSession);
  const totalPassengers =
    passengerCounts.adult + passengerCounts.child + passengerCounts.infant || 1;
  const baseFare = Number(prices.baseFare || 0);
  const baggage = Number(prices.baggage || 0);
  const meals = Number(prices.meals || 0);
  const seats = Number(prices.seats || 0);
  const total = Number(prices.total || baseFare + baggage + meals + seats || 0);

  const lineItems = [
    { label: formatPassengerLabel(passengerCounts), value: formatCurrency(baseFare) },
    {
      label: `${totalPassengers}x Cabin baggage`,
      value: "Included",
      isGreen: true,
    },
    {
      label: `${totalPassengers}x Checked baggage 15kg`,
      value: "Included",
      isGreen: true,
    },
    {
      label: "Seat Selection",
      value: seats > 0 ? formatCurrency(seats) : "Free",
      isGreen: seats <= 0,
    },
    {
      label: "Meals",
      value: meals > 0 ? formatCurrency(meals) : "Included",
      isGreen: meals <= 0,
    },
  ];

  if (baggage > 0) {
    lineItems.splice(3, 0, {
      label: "Extra Baggage",
      value: formatCurrency(baggage),
    });
  }

  return {
    lineItems,
    totalAmount: formatCurrency(total),
  };
};

export const buildMobileFareDetails = ({
  prices = {},
  bookingSession = null,
  travelerDetails = [],
}) => {
  const bookingView = getBookingDetailsView(bookingSession);
  const passengerCounts = getPassengerCounts(travelerDetails, bookingSession);
  const total = Number(prices.total || prices.baseFare || 0);
  const tax = extractTaxAmount(bookingSession);
  const extras =
    Number(prices.baggage || 0) + Number(prices.meals || 0) + Number(prices.seats || 0);
  const baseFare = Math.max(Number(prices.baseFare || 0) - tax, 0);

  return {
    from: bookingView?.header?.fromName || bookingView?.header?.fromCode || "N/A",
    to: bookingView?.header?.toName || bookingView?.header?.toCode || "N/A",
    date: bookingView?.header?.date || "N/A",
    passengerLabel: formatPassengerLabel(passengerCounts),
    passengerAmount: formatCurrency(total),
    baseFare: formatCurrency(baseFare || prices.baseFare || 0),
    tax: formatCurrency(tax),
    fee: formatCurrency(extras),
  };
};

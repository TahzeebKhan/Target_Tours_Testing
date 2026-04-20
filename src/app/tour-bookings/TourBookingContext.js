"use client";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { createPassenger } from "@/shared/services/passenger";
import { createPackageBooking } from "./services/packageBooking";
import { getTourBookingPackage } from "./services/tourBookingPackage";
import {
  clearTourBookingPackage,
  normalizeTourBookingPackage,
  readTourBookingPackage,
  writeTourBookingPackage,
} from "./utils/tourBookingSession";

const TourBookingContext = createContext(null);

const extractEntityId = (response) =>
  response?.data?.id ??
  response?.id ??
  response?.data?.data?.id ??
  response?.data?.passenger?.id ??
  response?.passenger?.id ??
  null;

const buildPassengerPayload = (traveler) => ({
  first_name: traveler.first_name || "",
  last_name: traveler.last_name || "",
  email: traveler.email || "",
  phone_no: String(traveler.phone_no || "").replace(/[^\d]/g, ""),
  gender: traveler.gender || "",
  title: traveler.title || "",
  country_code: traveler.country_code || "+91",
  dob: traveler.dob || "",
  primary_contact: false,
});

const getApiErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error?.message ||
  error?.response?.data?.error?.name ||
  error?.message ||
  fallback;

export function TourBookingProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(2);
  const fullPackageRequestRef = useRef(null);

  const [baggage, setBaggage] = useState([]);
  const [meals, setMeals] = useState([]);
  const [seats, setSeats] = useState([]);
  const [packageDetails, setPackageDetails] = useState(() =>
    readTourBookingPackage()
  );
  const [travelerDetails, setTravelerDetails] = useState([
    {
      id: 1,
      isOpen: true,
      title: "Mr",
      first_name: "",
      last_name: "",
      gender: "",
      country_code: "+91",
      phone_no: "",
      email: "",
      dob: "",
    },
  ]);
  const [passengerLoading, setPassengerLoading] = useState(false);
  const [passengerError, setPassengerError] = useState("");
  const [createdPassengers, setCreatedPassengers] = useState([]);
  const [packageBooking, setPackageBooking] = useState(null);
  const [packageBookingLoading, setPackageBookingLoading] = useState(false);
  const [packageBookingError, setPackageBookingError] = useState("");

  const prices = useMemo(() => {
    const travelerCount = Math.max(travelerDetails.length, 1);
    const adultFare = Number(packageDetails?.price?.adult || 5200);
    const baseFare = adultFare * travelerCount;
    const baggagePrice = baggage.reduce((s, b) => s + b.price, 0);
    const mealsPrice = meals.reduce((s, m) => s + m.price, 0);
    const seatsPrice = seats.reduce((s, s1) => s + s1.price, 0);

    return {
      travelerCount,
      adultFare,
      baseFare,
      baggage: baggagePrice,
      meals: mealsPrice,
      seats: seatsPrice,
      total: baseFare + baggagePrice + mealsPrice + seatsPrice,
    };
  }, [baggage, meals, packageDetails, seats, travelerDetails.length]);

  useEffect(() => {
    setPackageDetails(readTourBookingPackage());
  }, []);

  useEffect(() => {
    const shouldLoadFullPackage =
      packageDetails?.id &&
      (!Array.isArray(packageDetails?.itinerary) || packageDetails.itinerary.length === 0);

    if (!shouldLoadFullPackage) return;
    if (fullPackageRequestRef.current === packageDetails.id) return;
    fullPackageRequestRef.current = packageDetails.id;

    let isActive = true;
    const loadFullPackage = async () => {
      try {
        const fullPackage = await getTourBookingPackage(packageDetails.id);
        if (!isActive || !fullPackage) return;

        const nextPackageDetails = normalizeTourBookingPackage(fullPackage);
        setPackageDetails((prev) => {
          const mergedPackageDetails = {
            ...nextPackageDetails,
            price: {
              ...nextPackageDetails.price,
              adult: prev?.price?.adult || nextPackageDetails.price.adult,
              total: prev?.price?.total || nextPackageDetails.price.total,
            },
            startDate: prev?.startDate || nextPackageDetails.startDate,
            endDate: prev?.endDate || nextPackageDetails.endDate,
            selectedActivities: prev?.selectedActivities || [],
            packageDepartureId:
              prev?.packageDepartureId || nextPackageDetails.packageDepartureId,
          };
          writeTourBookingPackage(mergedPackageDetails);
          return mergedPackageDetails;
        });
      } catch {
        // Keep the saved package snapshot if the refresh request fails.
      }
    };

    loadFullPackage();

    return () => {
      isActive = false;
    };
  }, [packageDetails]);

  const submitPassengers = async () => {
    if (passengerLoading) return false;

    const savedPassengerRecords = travelerDetails
      .map((traveler) => traveler.savedPassengerId)
      .filter(Boolean)
      .map((id) => ({ id }));

    const customTravelerPayloads = travelerDetails
      .filter((traveler) => !traveler.savedPassengerId)
      .map(buildPassengerPayload);

    setPassengerLoading(true);
    setPassengerError("");
    setPackageBookingError("");
    try {
      const createdPassengerResponses = customTravelerPayloads.length
        ? await Promise.all(
            customTravelerPayloads.map((payload) => createPassenger(payload))
          )
        : [];
      const passengerRecords = [
        ...savedPassengerRecords,
        ...createdPassengerResponses,
      ];
      const passengerIds = passengerRecords.map(extractEntityId).filter(Boolean);

      if (passengerIds.length !== travelerDetails.length) {
        throw new Error("Passenger ids are missing. Please check traveler details.");
      }

      setCreatedPassengers(passengerRecords);
      return true;
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to create passengers.");
      setPassengerError(message);
      toast.error(message);
      return false;
    } finally {
      setPassengerLoading(false);
    }
  };

  const submitPackageBooking = async () => {
    if (packageBookingLoading) return false;

    const passengerIds = createdPassengers.map(extractEntityId).filter(Boolean);
    if (!passengerIds.length) {
      setPackageBookingError("Passenger ids are missing. Please submit traveler details again.");
      return false;
    }

    const currentPackageDetails = readTourBookingPackage();
    const bookingPayload = {
      packageId: currentPackageDetails?.id || packageDetails?.id,
      domain: process.env.NEXT_PUBLIC_DOMAIN,
      payment_mode: "stripe",
      amount: prices.total,
      payment_status: "success",
      selected_activities: (currentPackageDetails?.selectedActivities || [])
        .map((activity) => ({ id: activity?.id }))
        .filter((activity) => activity.id),
      selected_hotel: [{ id: 1 }],
      passengers: passengerIds.map((id) => ({ id })),
    };

    if (currentPackageDetails?.packageDepartureId || packageDetails?.packageDepartureId) {
      bookingPayload.packageDepartureId =
        currentPackageDetails?.packageDepartureId || packageDetails.packageDepartureId;
    }

    setPackageBookingLoading(true);
    setPackageBookingError("");
    try {
      const bookingResponse = await createPackageBooking(bookingPayload);
      setPackageBooking(bookingResponse);
      return true;
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to create package booking.");
      setPackageBookingError(message);
      toast.error(message);
      return false;
    } finally {
      setPackageBookingLoading(false);
    }
  };

  const completeBooking = () => {
    clearTourBookingPackage();
    setCurrentStep(3);
  };

  return (
    <TourBookingContext.Provider
      value={{
        currentStep,
        setCurrentStep,

        baggage,
        setBaggage,
        meals,
        setMeals,
        seats,
        setSeats,
        packageDetails,
        setPackageDetails,
        travelerDetails,
        setTravelerDetails,
        passengerLoading,
        passengerError,
        createdPassengers,
        packageBooking,
        packageBookingLoading,
        packageBookingError,
        submitPassengers,
        submitPackageBooking,
        completeBooking,

        prices,
      }}
    >
      {children}
    </TourBookingContext.Provider>
  );
}

export function useTourBooking() {
  const ctx = useContext(TourBookingContext);
  if (!ctx) {
    throw new Error(
      "useTourBooking must be used inside TourBookingProvider"
    );
  }
  return ctx;
}

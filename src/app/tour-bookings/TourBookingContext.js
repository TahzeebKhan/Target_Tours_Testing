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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const getDigitCount = (value = "") => String(value).match(/\d/g)?.length || 0;
const isBlank = (value) => String(value ?? "").trim() === "";

const normalizeContactInfo = (contactInfo = {}) => ({
  country_code: contactInfo.country_code || "+91",
  mobile_number: String(contactInfo.mobile_number || "").replace(/[^\d]/g, ""),
  email: contactInfo.email || "",
});

const validateTourTravelerForm = ({ travelerDetails = [], bookingContactInfo = {} }) => {
  const errors = {
    travelers: {},
    bookingContact: {},
  };
  let firstMessage = "";

  if (!Array.isArray(travelerDetails) || travelerDetails.length === 0) {
    return {
      isValid: false,
      errors,
      message: "Traveler details are required.",
    };
  }

  travelerDetails.forEach((traveler, index) => {
    const travelerErrors = {};

    if (isBlank(traveler.title)) travelerErrors.title = "Title is required.";
    if (isBlank(traveler.first_name)) travelerErrors.first_name = "First Name is required.";
    if (isBlank(traveler.last_name)) travelerErrors.last_name = "Last Name is required.";
    if (isBlank(traveler.gender)) travelerErrors.gender = "Gender is required.";
    if (isBlank(traveler.country_code)) travelerErrors.country_code = "Country Code is required.";
    if (isBlank(traveler.phone_no)) {
      travelerErrors.phone_no = "Mobile Number is required.";
    } else if (getDigitCount(traveler.phone_no) < 10) {
      travelerErrors.phone_no = "Enter a valid Mobile Number.";
    }
    if (isBlank(traveler.email)) {
      travelerErrors.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(String(traveler.email).trim())) {
      travelerErrors.email = "Enter a valid Email.";
    }
    if (isBlank(traveler.dob)) travelerErrors.dob = "DOB is required.";

    if (Object.keys(travelerErrors).length > 0) {
      errors.travelers[traveler.id || `traveler-${index + 1}`] = travelerErrors;
      if (!firstMessage) {
        firstMessage = `Traveler ${index + 1}: ${Object.values(travelerErrors)[0]}`;
      }
    }
  });

  if (isBlank(bookingContactInfo.country_code)) {
    errors.bookingContact.country_code = "Country Code is required.";
  }
  if (isBlank(bookingContactInfo.mobile_number)) {
    errors.bookingContact.mobile_number = "Mobile Number is required.";
  } else if (getDigitCount(bookingContactInfo.mobile_number) < 10) {
    errors.bookingContact.mobile_number = "Enter a valid Mobile Number.";
  }
  if (isBlank(bookingContactInfo.email)) {
    errors.bookingContact.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(String(bookingContactInfo.email).trim())) {
    errors.bookingContact.email = "Enter a valid Email.";
  }

  if (!firstMessage && Object.keys(errors.bookingContact).length > 0) {
    firstMessage = Object.values(errors.bookingContact)[0];
  }

  return {
    isValid:
      Object.keys(errors.travelers).length === 0 &&
      Object.keys(errors.bookingContact).length === 0,
    errors,
    message: firstMessage,
  };
};

const getActivityId = (activity) =>
  activity?.id ??
  activity?.activity_id ??
  activity?.package_activity_id ??
  activity?.activity?.id ??
  null;

const getAllPackageActivities = (...packages) => {
  const activitiesById = new Map();

  packages.forEach((packageDetail) => {
    const itinerary = Array.isArray(packageDetail?.itinerary)
      ? packageDetail.itinerary
      : [];

    itinerary.forEach((day) => {
      const dayActivities =
        Array.isArray(day?.package_activities) && day.package_activities.length
          ? day.package_activities
          : Array.isArray(day?.builder_data?.activities)
            ? day.builder_data.activities
            : [];

      dayActivities
        .filter((activity) => activity?.enabled !== false)
        .forEach((activity) => {
          const id = getActivityId(activity);
          if (id) activitiesById.set(String(id), { id });
        });
    });
  });

  return Array.from(activitiesById.values());
};

const getSelectedPackageActivities = (currentPackageDetails, packageDetails) => {
  const selectedActivities = Array.isArray(currentPackageDetails?.selectedActivities)
    ? currentPackageDetails.selectedActivities
    : [];
  const selectedPayload = selectedActivities
    .map((activity) => ({ id: getActivityId(activity) }))
    .filter((activity) => activity.id);

  return currentPackageDetails?.activitySelectionMode === "custom"
    ? selectedPayload
    : selectedPayload.length
    ? selectedPayload
    : getAllPackageActivities(currentPackageDetails, packageDetails);
};

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
  const [bookingContactInfo, setBookingContactInfo] = useState({
    country_code: "+91",
    mobile_number: "",
    email: "",
  });
  const [travelerFormErrors, setTravelerFormErrors] = useState({
    travelers: {},
    bookingContact: {},
  });
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
    const taxes = Number(packageDetails?.price?.taxes || 0);
    const baggagePrice = baggage.reduce((s, b) => s + b.price, 0);
    const mealsPrice = meals.reduce((s, m) => s + m.price, 0);
    const seatsPrice = seats.reduce((s, s1) => s + s1.price, 0);

    return {
      travelerCount,
      adultFare,
      baseFare,
      taxes,
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
            activitySelectionMode: prev?.activitySelectionMode || null,
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

    const validation = validateTourTravelerForm({
      travelerDetails,
      bookingContactInfo,
    });

    setTravelerFormErrors(validation.errors);
    if (!validation.isValid) {
      toast.error(validation.message || "Please complete traveler details.");
      return false;
    }

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
    const selectedActivities = getSelectedPackageActivities(
      currentPackageDetails,
      packageDetails
    );
    const bookingPayload = {
      packageId: currentPackageDetails?.id || packageDetails?.id,
      domain: process.env.NEXT_PUBLIC_DOMAIN,
      with_flight: Boolean(
        currentPackageDetails?.with_flight ?? packageDetails?.with_flight ?? false
      ),
      payment_mode: "stripe",
      amount: prices.total,
      payment_status: "success",
      booking_contact_info: normalizeContactInfo(bookingContactInfo),
      selected_activities: selectedActivities,
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
      return bookingResponse;
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
        bookingContactInfo,
        setBookingContactInfo,
        travelerFormErrors,
        setTravelerFormErrors,
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIGITS_PATTERN = /\d/g;
const PASSPORT_PATTERN = /^[A-Za-z0-9]{6,20}$/;
const PIN_PATTERN = /^[A-Za-z0-9-]{4,10}$/;

export const EMPTY_TRAVELER_FORM_ERRORS = {
  travelers: {},
  bookingContact: {},
};

const getDigitCount = (value = "") => String(value).match(DIGITS_PATTERN)?.length || 0;

const isBlank = (value) => String(value ?? "").trim() === "";

const getTravelerAgeError = (traveler) => {
  const ageValue = Number(traveler?.Age);
  if (!Number.isFinite(ageValue)) {
    return "Age is required.";
  }

  const type = traveler?.type || traveler?.PTC || "ADULT";
  if ((type === "ADULT" || type === "ADT") && ageValue < 12) {
    return "Adult age must be 12 or above.";
  }
  if ((type === "CHILD" || type === "CHD") && (ageValue < 2 || ageValue > 11)) {
    return "Child age must be between 2 and 11.";
  }
  if ((type === "INFANT" || type === "INF") && (ageValue < 0 || ageValue > 1)) {
    return "Infant age must be below 2.";
  }

  return "";
};

const validateTraveler = (traveler = {}, index = 0) => {
  const errors = {};

  if (isBlank(traveler.Title)) errors.Title = "Title is required.";
  if (isBlank(traveler.FName)) errors.FName = "First Name is required.";
  if (isBlank(traveler.LName)) errors.LName = "Last Name is required.";
  if (isBlank(traveler.Gender)) errors.Gender = "Gender is required.";
  if (isBlank(traveler.CountryCode)) errors.CountryCode = "Country Code is required.";

  const ageError = getTravelerAgeError(traveler);
  if (ageError) errors.Age = ageError;

  if (isBlank(traveler.DOB)) {
    errors.DOB = "DOB is required.";
  }

  if (isBlank(traveler.MobileNumber)) {
    errors.MobileNumber = "Mobile Number is required.";
  } else if (getDigitCount(traveler.MobileNumber) < 10) {
    errors.MobileNumber = "Enter a valid Mobile Number.";
  }

  if (isBlank(traveler.Email)) {
    errors.Email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(String(traveler.Email).trim())) {
    errors.Email = "Enter a valid Email.";
  }

  if (isBlank(traveler.Nationality)) errors.Nationality = "Nationality is required.";

  if (isBlank(traveler.PassportNo)) {
    errors.PassportNo = "Passport No is required.";
  } else if (!PASSPORT_PATTERN.test(String(traveler.PassportNo).trim())) {
    errors.PassportNo = "Enter a valid Passport No.";
  }

  if (isBlank(traveler.PLI)) errors.PLI = "Passport Issue Place is required.";

  if (isBlank(traveler.PDOE)) {
    errors.PDOE = "Passport Expiry is required.";
  }

  if (isBlank(traveler.VisaType)) errors.VisaType = "Visa Type is required.";

  const entries = Object.values(errors);
  return {
    errors,
    message: entries[0]
      ? `Traveler ${index + 1}: ${entries[0]}`
      : "",
  };
};

const validateBookingContact = (bookingContact = {}) => {
  const errors = {};

  if (isBlank(bookingContact.CountryCode)) {
    errors.CountryCode = "Country Code is required.";
  }
  if (isBlank(bookingContact.MobileNumber)) {
    errors.MobileNumber = "Mobile Number is required.";
  } else if (getDigitCount(bookingContact.MobileNumber) < 10) {
    errors.MobileNumber = "Enter a valid Mobile Number.";
  }

  if (isBlank(bookingContact.Email)) {
    errors.Email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(String(bookingContact.Email).trim())) {
    errors.Email = "Enter a valid Email.";
  }

  if (isBlank(bookingContact.Address)) errors.Address = "Address is required.";
  if (isBlank(bookingContact.State)) errors.State = "State is required.";
  if (isBlank(bookingContact.City)) errors.City = "City is required.";

  if (isBlank(bookingContact.PIN)) {
    errors.PIN = "PIN is required.";
  } else if (!PIN_PATTERN.test(String(bookingContact.PIN).trim())) {
    errors.PIN = "Enter a valid PIN.";
  }

  return errors;
};

export const validateTravelerForm = ({
  travelerDetails = [],
  bookingContactDetails = {},
}) => {
  const nextErrors = {
    travelers: {},
    bookingContact: {},
  };

  if (!Array.isArray(travelerDetails) || travelerDetails.length === 0) {
    return {
      isValid: false,
      errors: nextErrors,
      message: "Traveler details are required.",
    };
  }

  let firstMessage = "";
  travelerDetails.forEach((traveler, index) => {
    const travelerValidation = validateTraveler(traveler, index);
    if (Object.keys(travelerValidation.errors).length > 0) {
      nextErrors.travelers[traveler.id || `traveler-${index + 1}`] = travelerValidation.errors;
      if (!firstMessage) firstMessage = travelerValidation.message;
    }
  });

  const bookingContactErrors = validateBookingContact(bookingContactDetails);
  if (Object.keys(bookingContactErrors).length > 0) {
    nextErrors.bookingContact = bookingContactErrors;
    if (!firstMessage) {
      firstMessage = Object.values(bookingContactErrors)[0];
    }
  }

  return {
    isValid:
      Object.keys(nextErrors.travelers).length === 0 &&
      Object.keys(nextErrors.bookingContact).length === 0,
    errors: nextErrors,
    message: firstMessage || "",
  };
};

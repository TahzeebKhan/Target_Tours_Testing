const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIGITS_PATTERN = /\d/g;
const PASSPORT_PATTERN = /^[A-Za-z0-9]{6,20}$/;

export const EMPTY_TRAVELER_FORM_ERRORS = {
  travelers: {},
  bookingContact: {},
};

const getDigitCount = (value = "") => String(value).match(DIGITS_PATTERN)?.length || 0;

const isBlank = (value) => String(value ?? "").trim() === "";

const getAgeFromDob = (value, referenceDate = new Date()) => {
  const text = String(value || "").trim();
  if (!text) return null;
  const slashMatch = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const dob = slashMatch
    ? new Date(Number(slashMatch[3]), Number(slashMatch[2]) - 1, Number(slashMatch[1]))
    : new Date(text);
  if (Number.isNaN(dob.getTime()) || dob > referenceDate) return null;

  let age = referenceDate.getFullYear() - dob.getFullYear();
  if (
    referenceDate.getMonth() < dob.getMonth() ||
    (referenceDate.getMonth() === dob.getMonth() && referenceDate.getDate() < dob.getDate())
  ) {
    age -= 1;
  }
  return age;
};

export const getTravelerDobError = (traveler = {}) => {
  const type = String(traveler?.type || traveler?.PTC || "").trim().toUpperCase();
  const isAdult = type === "ADULT" || type === "ADT";
  const isChild = type === "CHILD" || type === "CHD";
  const isInfant = type === "INFANT" || type === "INF";

  if (isBlank(traveler.DOB)) {
    if (isChild) return "DOB is required for children.";
    if (isInfant) return "DOB is required for infants.";
    return "";
  }

  const age = getAgeFromDob(traveler.DOB);
  if (age === null) return "Enter a valid DOB.";
  if (isAdult && age <= 12) return "Adult age must be more than 12 years.";
  if (isChild && (age < 2 || age > 12)) {
    return "Child age must be between 2 and 12 years.";
  }
  if (isInfant && (age < 0 || age >= 2)) {
    return "Infant age must be less than 2 years.";
  }
  return "";
};

export const getBookingJourney = (bookingSession = {}) =>
  String(
    bookingSession?.journey ||
      bookingSession?.selectedFlight?.journey ||
      bookingSession?.selectedFlight?.data?.journey ||
      bookingSession?.priceResponse?.journey ||
      bookingSession?.priceResponse?.data?.journey ||
      "",
  )
    .trim()
    .toLowerCase();

const getTravelerChecklistRules = (checklistResponse = {}) => {
  const rawChecklist =
    checklistResponse?.data?.raw?.TravellerCheckList ||
    checklistResponse?.raw?.TravellerCheckList ||
    [];

  if (!Array.isArray(rawChecklist) || rawChecklist.length === 0) {
    return {};
  }

  return rawChecklist[0] || {};
};

const isChecklistFieldRequired = (rules, field) => Number(rules?.[field]) === 1;

const validateTraveler = (
  traveler = {},
  index = 0,
  checklistRules = {},
  isDomestic = false,
) => {
  const errors = {};

  if (isBlank(traveler.Title)) errors.Title = "Title is required.";
  if (isBlank(traveler.FName)) errors.FName = "First Name is required.";
  if (isBlank(traveler.LName)) errors.LName = "Last Name is required.";
  const travelerType = String(traveler?.type || traveler?.PTC || "").toUpperCase();
  const isChild = travelerType === "CHILD" || travelerType === "CHD";
  const dobError = getTravelerDobError(traveler);
  if (dobError) errors.DOB = dobError;

  if (isDomestic) {
    const entries = Object.values(errors);
    return {
      errors,
      message: entries[0] ? `Traveler ${index + 1}: ${entries[0]}` : "",
    };
  }

  if (!isChild && isChecklistFieldRequired(checklistRules, "DOB") && isBlank(traveler.DOB)) {
    errors.DOB = "DOB is required.";
  }

  if (isBlank(traveler.Email)) {
    errors.Email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(String(traveler.Email).trim())) {
    errors.Email = "Enter a valid Email.";
  }

  if (
    isChecklistFieldRequired(checklistRules, "Nationality") &&
    isBlank(traveler.Nationality)
  ) {
    errors.Nationality = "Nationality is required.";
  }

  if (isChecklistFieldRequired(checklistRules, "PassportNo") && isBlank(traveler.PassportNo)) {
    errors.PassportNo = "Passport No is required.";
  } else if (
    !isBlank(traveler.PassportNo) &&
    !PASSPORT_PATTERN.test(String(traveler.PassportNo).trim())
  ) {
    errors.PassportNo = "Enter a valid Passport No.";
  }

  if (isChecklistFieldRequired(checklistRules, "PLI") && isBlank(traveler.PLI)) {
    errors.PLI = "Passport Issue Place is required.";
  }

  if (isChecklistFieldRequired(checklistRules, "PDOE") && isBlank(traveler.PDOE)) {
    errors.PDOE = "Passport Expiry is required.";
  }

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

  return errors;
};

export const validateTravelerForm = ({
  travelerDetails = [],
  bookingContactDetails = {},
  checklistResponse = null,
  journey = "",
}) => {
  const nextErrors = {
    travelers: {},
    bookingContact: {},
  };
  const checklistRules = getTravelerChecklistRules(checklistResponse);
  const isDomestic = String(journey).trim().toLowerCase() === "domestic";

  if (!Array.isArray(travelerDetails) || travelerDetails.length === 0) {
    return {
      isValid: false,
      errors: nextErrors,
      message: "Traveler details are required.",
    };
  }

  let firstMessage = "";
  travelerDetails.forEach((traveler, index) => {
    const travelerValidation = validateTraveler(
      traveler,
      index,
      checklistRules,
      isDomestic,
    );
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

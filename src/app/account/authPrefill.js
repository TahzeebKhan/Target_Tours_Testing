"use client";

const SIGNUP_PREFILL_KEY = "target_tours_signup_prefill";

export const writeSignupPrefill = (prefill = {}) => {
  if (typeof window === "undefined") return;

  const cleanPrefill = Object.entries(prefill).reduce((acc, [key, value]) => {
    if (typeof value === "string" && value.trim()) {
      acc[key] = value.trim();
    }
    return acc;
  }, {});

  if (!Object.keys(cleanPrefill).length) return;

  window.sessionStorage.setItem(
    SIGNUP_PREFILL_KEY,
    JSON.stringify(cleanPrefill),
  );
};

export const readSignupPrefill = () => {
  if (typeof window === "undefined") return null;

  const storedPrefill = window.sessionStorage.getItem(SIGNUP_PREFILL_KEY);
  window.sessionStorage.removeItem(SIGNUP_PREFILL_KEY);

  if (!storedPrefill) return null;

  try {
    return JSON.parse(storedPrefill);
  } catch {
    return null;
  }
};

export const isUserNotRegisteredResponse = (payload, status) => {
  const responseStatus = Number(status || payload?.error?.status);
  const message = String(
    payload?.error?.message || payload?.message || "",
  ).toLowerCase();

  return (
    responseStatus === 401 &&
    (message.includes("not registered") ||
      message.includes("does not registered"))
  );
};

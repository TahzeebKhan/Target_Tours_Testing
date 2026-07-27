/**
 * Optimized SessionStorage Manager with Expiration (TTL) & Automated Cleanup
 */

const DEFAULT_TTL_MINUTES = 30;

/**
 * Set an item in sessionStorage with an optional Time-To-Live (TTL) in minutes.
 * Default TTL is 30 minutes. Pass ttlInMinutes = 0 or null for no expiry within the tab session.
 */
export const setSessionItem = (key, data, ttlInMinutes = DEFAULT_TTL_MINUTES) => {
  if (typeof window === "undefined" || !window.sessionStorage) return;

  try {
    const payload = {
      value: data,
      createdAt: Date.now(),
      expiresAt: ttlInMinutes ? Date.now() + ttlInMinutes * 60 * 1000 : null,
    };
    window.sessionStorage.setItem(key, JSON.stringify(payload));
  } catch (error) {
    console.warn(`Unable to set ${key} in sessionStorage:`, error);
  }
};

/**
 * Get an item from sessionStorage. Automatically removes the key if expired.
 * Backward-compatible with non-TTL wrapped legacy strings/objects.
 */
export const getSessionItem = (key, fallback = null) => {
  if (typeof window === "undefined" || !window.sessionStorage) return fallback;

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);

    // If item was saved using TTL format { value, expiresAt }
    if (parsed && typeof parsed === "object" && "value" in parsed) {
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        window.sessionStorage.removeItem(key);
        return fallback;
      }
      return parsed.value;
    }

    // Fallback for legacy items stored without wrapper
    return parsed;
  } catch {
    // If raw string (not JSON)
    return window.sessionStorage.getItem(key) || fallback;
  }
};

/**
 * Remove a specific key from sessionStorage
 */
export const removeSessionItem = (key) => {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    window.sessionStorage.removeItem(key);
  } catch (error) {
    console.warn(`Unable to remove ${key} from sessionStorage:`, error);
  }
};

/**
 * Helper to clear all flight and hotel booking session data.
 * Call this upon payment completion, booking confirmation, or when user navigates Home.
 */
export const clearBookingSession = () => {
  if (typeof window === "undefined" || !window.sessionStorage) return;

  const bookingKeys = [
    "target_tours_flight_booking_details",
    "target_tours_flight_selected_flight",
    "target_tours_flight_price_response",
    "target_tours_flight_ssr_response",
    "hotelDetails",
    "hotelGuestDetailsCache",
    "hotelBookingSession",
    "hotelPendingConfirmBooking",
    "selectedFlight",
    "bookingDetails",
  ];

  bookingKeys.forEach((key) => {
    try {
      window.sessionStorage.removeItem(key);
    } catch {}
  });
};

/**
 * Helper to clear all search and filter memory.
 */
export const clearSearchSession = () => {
  if (typeof window === "undefined" || !window.sessionStorage) return;

  const searchKeys = [
    "target_tours_flight_search_params",
    "hotelSearchContext",
    "hotelSearchResults",
    "hotelSidebarFilters",
    "hotelFilterMemory",
  ];

  searchKeys.forEach((key) => {
    try {
      window.sessionStorage.removeItem(key);
    } catch {}
  });
};

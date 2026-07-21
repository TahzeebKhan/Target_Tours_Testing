# Session Storage Lifecycle

## Purpose

This document defines why browser storage is used, which data belongs in each
key, and when every key must be removed. The goals are to support refresh and
payment redirects without retaining stale or unnecessarily large API data.

`sessionStorage` is scoped to one browser tab and is automatically removed when
that tab is closed. Application cleanup is still required because users can run
many searches and bookings before closing the tab, and browser storage has a
limited quota.

## General rules

1. Never call `sessionStorage.clear()`. Remove only product-owned keys.
2. Store normalized data only. Do not store `raw` SSE events or complete API
   responses when the UI needs only a small subset.
3. A new search replaces the previous search state for the same product.
4. A new booking replaces the previous booking state for the same product.
5. Booking sessions expire after 20 minutes unless a shorter provider expiry is
   supplied.
6. Successful, failed, or cancelled flows must clear transient booking data
   after the final status page has consumed it.
7. Read functions must reject and remove expired or invalid JSON.
8. Every storage write must handle quota and serialization errors without
   crashing the page.
9. Search preferences may live for the tab lifetime; booking and payment data
   may not.

## Flight storage

### `target_tours_flight_search_params`

- Owner: `src/app/flights/hooks/useFlightSearchParams.js`
- Purpose: Keeps flight search parameters while the visible `/flights` URL is
  clean and restores the search after refresh.
- Contains: Route, dates, trip type, passenger counts, cabin class, and fare
  flags as a query string.
- Created/replaced: Whenever a committed flight search contains URL parameters.
- Remove:
  - When a new flight search replaces it.
  - When the user explicitly resets the flight search.
  - Automatically when the tab closes.
- Do not remove when navigating between flight results and flight booking; the
  booking flow may need the search route as fallback data.
- Current status: Stored for the tab lifetime and overwritten by the next
  search. An explicit reset helper is still recommended.

### `target_tours_flight_booking_session`

- Owner: `src/features/flights/utils/flightBookingSession.js`
- Purpose: Restores the selected flight, fare, travelers, baggage, meals,
  seats, booking requests, and current booking step after refresh.
- Created/replaced: When a fare is selected and throughout the booking flow.
- Expiry: 20 minutes from the pricing-session start.
- Remove:
  - When the 20-minute timer expires.
  - When an expired session is read.
  - When payment/status flow is finished and the user selects Done/Home.
  - When the booking flow is intentionally cancelled.
  - Before starting a different flight booking.
  - Automatically when the tab closes.
- Size rule: The serializer removes every property named `raw`.
- Current status: Timer, read-time expiry, explicit clear, and raw-data removal
  are implemented.

### `flightPaymentSnapshot` (`localStorage`)

- Owner: Flight payment and `src/app/payment-status/page.js`.
- Purpose: Survives an external payment redirect and supplies a minimal status
  fallback.
- Remove:
  - Immediately after the payment-status page has consumed the snapshot and the
    user finishes the flow.
  - When starting a different flight payment.
  - When its related flight booking session has expired.
- Current status: Removed by the payment-status flow. An explicit timestamp and
  read-time expiry should be kept aligned with the 20-minute flight session.

## Hotel storage

### `hotelSearchContext`

- Owner: `src/shared/services/hotelSearch.js` and hotel search components.
- Purpose: Restores the hotel search request, selected destination/hotel type,
  channel metadata, dates, rooms, and guest counts after refresh.
- Created/replaced: At the beginning of every hotel search.
- Remove:
  - Before starting a new hotel search, after the replacement context is ready.
  - When the completed hotel booking flow is closed.
  - When the user explicitly resets hotel search.
  - Automatically when the tab closes.
- Keep while navigating through hotel results, hotel detail, gallery, and hotel
  booking.
- Current status: Replaced by new searches and removed by completed-flow
  cleanup. It has no independent time-based expiry.

### `hotelSearchResults`

- Owner: Hotel search/listing components.
- Purpose: Provides refresh recovery for the latest hotel result set and search
  metadata.
- Created/replaced: As merged hotel results arrive.
- Remove:
  - Before a new hotel search starts.
  - After a hotel is selected if the detail/booking flow no longer needs the
    result list.
  - When the completed hotel booking flow is closed.
  - Automatically when the tab closes.
- Size rule: Cache only the normalized, deduplicated fields required to rebuild
  cards. Do not cache raw providers, raw SSE messages, or repeated detail data.
- Current status: New searches and completed-flow cleanup remove it. Continue
  using the slim-result writer; a maximum serialized-size guard is recommended.

### `hotelDetails`

- Owner: Hotel listing, detail context, gallery, and booking pages.
- Purpose: Shares the selected hotel details between listing, hotel detail,
  gallery, and booking without putting the entire hotel object in the URL.
- Created/replaced: When a hotel card is opened or detail data is refreshed.
- Remove:
  - Before writing details for another hotel.
  - When the completed hotel booking flow is closed.
  - When returning home after the final status page.
  - Automatically when the tab closes.
- Size rule: Store one normalized hotel only; omit raw provider responses.
- Current status: Replaced per selected hotel and included in completed-flow
  cleanup.

### `hotelSidebarFilters`

- Owner: `src/app/hotels/components/HotelsFilters.jsx`
- Purpose: Preserves filters during rerenders and refresh for the current hotel
  search.
- Created/replaced: Whenever hotel filters change.
- Remove:
  - When the search identity (route/dates/guests/location) changes.
  - When Reset Filters is selected.
  - When hotel search is explicitly reset.
  - Automatically when the tab closes.
- Current status: Stored with a search key and ignored when that key does not
  match. Explicit removal is implemented by the filter reset path.

### `hotelBookingSession`

- Owner: `src/shared/services/hotelSearch.js` and hotel booking pages.
- Purpose: Restores selected room, guest details, price, booking request, and
  payment state after refresh.
- Created/replaced: When hotel booking starts and as booking steps change.
- Expiry: 20 minutes.
- Remove:
  - When its timer expires.
  - When an expired session is read.
  - When booking succeeds, fails, or is cancelled and the final page has
    consumed the state.
  - Before starting another hotel booking.
  - Automatically when the tab closes.
- Current status: Timer and read-time expiry are implemented.

### `hotelPendingConfirmBooking`

- Owner: `src/shared/services/hotelSearch.js`.
- Storage: Both `sessionStorage` and `localStorage`, because confirmation may
  continue after an external payment redirect.
- Purpose: Holds only the request required to confirm a paid hotel booking.
- Remove:
  - Immediately after confirm-booking succeeds or permanently fails.
  - When the user closes the completed/failed hotel status flow.
  - When its hotel booking session expires.
  - Before starting another hotel payment.
- Current status: Explicit read/write/clear helpers exist and completed-flow
  cleanup clears both copies.

### `hotelBookingStatus` (`localStorage`)

- Owner: `src/shared/services/hotelSearch.js`.
- Purpose: Shares hotel payment/booking status across redirects and tabs.
- Remove:
  - After the final hotel status page consumes it.
  - When its embedded booking-session expiry is reached.
  - Before starting a different hotel booking/payment.
- Current status: Read-time expiry and completed-flow cleanup are implemented.

### `hotelLastSearchUrl` (`localStorage`)

- Owner: Hotel search navigation.
- Purpose: Allows `/hotels` to restore the last valid hotel search URL.
- Remove:
  - When the completed hotel booking flow is closed.
  - When the user explicitly resets hotel search history.
  - When the stored URL is invalid.
- Current status: Removed by completed-flow cleanup.

## Tour/package storage

### `selectedTourOption`

- Owner: Tour listing and tour detail.
- Purpose: Transfers the selected package ID, flight-inclusion option, and
  selected price from listing to detail.
- Created/replaced: When Book Now is selected on a tour card.
- Remove:
  - Immediately after tour detail consumes it successfully.
  - When another tour option is selected.
  - When tour detail cannot resolve the selected package.
  - Automatically when the tab closes.
- Current status: Replaced on selection but not consumed/removed. This cleanup
  remains to be implemented.

### `tourBookingPackage`

- Owner: `src/app/tour-bookings/utils/tourBookingSession.js` and
  `TourBookingContext`.
- Purpose: Restores normalized package details, selected activities, departure,
  pricing, and itinerary during package booking.
- Created/replaced: When package booking starts or selections change.
- Required expiry: 20 minutes from package-booking start.
- Remove:
  - When the 20-minute timer expires.
  - When an expired package session is read.
  - When package booking succeeds, fails permanently, or is cancelled.
  - Before starting a different package booking.
  - Automatically when the tab closes.
- Size rule: Store the normalized booking subset, not the complete package API
  response. Large itinerary media and raw API fields must be omitted.
- Current status: Explicit clear on booking completion exists, but automatic
  expiry and read-time expiry are not yet implemented.

## Shared one-time storage

### `target_tours_signup_prefill`

- Owner: `src/app/account/authPrefill.js`.
- Purpose: Transfers one-time signup form values.
- Remove: Immediately when read, whether or not all fields are used.
- Current status: Consume-on-read cleanup is implemented.

## Cleanup by user action

### New search

- Flight: Replace `target_tours_flight_search_params`.
- Hotel: Remove old `hotelSearchResults`, replace `hotelSearchContext`, and
  reset `hotelSidebarFilters` when the search identity changes.
- Tour/package: Search/list filters should not create booking-session data.

### New booking

- Clear the previous booking key for the same product before writing the new
  booking.
- Do not clear another product's state. A hotel booking must not remove an
  unfinished flight booking unless the user explicitly abandons it.

### Successful or failed final status

- Keep data long enough to render and refresh the status page.
- Clear it only when the user selects Done, Home, View Bookings, or starts a new
  booking.
- If the final page is left open, the 20-minute expiry remains the safety net.

### Logout

- Clear booking, payment, pending-confirmation, and auth-prefill keys.
- Search parameters and filters may be retained because they contain no account
  credentials, but traveler/contact information must not be retained.

### Tab close

- The browser removes all `sessionStorage` keys automatically.
- `localStorage` payment/status keys require explicit expiry and cleanup because
  they survive tab and browser closure.

## Implementation priorities

1. Add 20-minute expiry and read-time cleanup to `tourBookingPackage`.
2. Make `selectedTourOption` consume-on-read.
3. Add a shared safe-write helper that catches `QuotaExceededError`, removes
   stale product caches, and retries once.
4. Add serialized-size limits to `hotelSearchResults` and `hotelDetails`.
5. Add one application-start cleanup pass for expired flight, hotel, and package
   booking keys.
6. Add product-scoped logout cleanup without using global storage `clear()`.


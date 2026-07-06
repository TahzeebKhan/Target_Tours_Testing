# Hotel Flow Notes

This document explains the current hotel search, listing, detail, room selection, and booking flow. It focuses especially on `src/app/hotels/components/TourListing.jsx` and where browser storage is written, read, updated, and cleared.

## Main Files

- `src/app/home-page/components/homePage/HomePage.jsx`
  Starts hotel search from the home page.
- `src/shared/services/hotelSearch.js`
  Shared API calls and storage helpers for hotel search, details, booking session, payment status, and pending confirmation.
- `src/app/hotels/components/TourListing.jsx`
  Hotel listing page. Reads search result events/cache, normalizes hotel cards, loads filters, stores selected hotel details, and routes to hotel detail.
- `src/app/hotels/components/HotelsFilters.jsx`
  Sidebar filter UI. Applies filters into `HotelsContext`.
- `src/app/hotels/context/HotelsContext.js`
  Shared hotels state for listing, filters, map modal, and counts.
- `src/app/hotel-detail/page.js`
  Hotel detail page. Builds room selection and writes the hotel booking session before `/hotel-booking`.
- `src/app/hotel-booking/layout.js`
  Reads the hotel booking session and provides booking room state through `RoomContext`.
- `src/app/hotel-booking/components/review/ReviewPage.jsx`
  Checkout/review page. Starts booking, starts payment, writes pending confirmation, and locks checkout status.
- `src/app/hotel-booking-success/page.js`
  Reads pending confirmation after payment and confirms booking.

## Storage Keys

Defined in `src/shared/services/hotelSearch.js`.

| Key constant | Actual key | Storage | Purpose |
| --- | --- | --- | --- |
| `HOTEL_SEARCH_SESSION_KEY` | `hotelSearchContext` | `sessionStorage` | Current hotel search context: channel, init payload, city, dates, rooms, guests, selected location. |
| `HOTEL_SEARCH_RESULTS_KEY` | `hotelSearchResults` | `sessionStorage` | Cached websocket/search result payload for `/hotels` refresh. |
| `HOTEL_LAST_SEARCH_URL_KEY` | `hotelLastSearchUrl` | `localStorage` | Last hotel listing URL. |
| `HOTEL_DETAILS_KEY` | `hotelDetails` | `sessionStorage` | Selected hotel detail response and request before navigating to `/hotel-detail`. |
| `HOTEL_BOOKING_SESSION_KEY` | `hotelBookingSession` | `sessionStorage` plus in-memory variable | Selected rooms and hotel booking payload before `/hotel-booking`. |
| `HOTEL_BOOKING_STATUS_KEY` | `hotelBookingStatus` | `localStorage` | Checkout lock status: submit/payment/confirmed. Used across tabs. |
| `HOTEL_PENDING_CONFIRM_BOOKING_KEY` | `hotelPendingConfirmBooking` | `sessionStorage` and `localStorage` | Data needed to confirm booking after payment redirect. |

## Search Start Flow

### 1. User searches hotels from home page

File: `src/app/home-page/components/homePage/HomePage.jsx`

Function/area: `handleSearch`, inside `if (bookingType === "hotel")`.

What happens:

1. Creates a websocket channel with `createHotelSearchChannel()`.
2. Builds `initPayload` for `/api/hotel-search/init`.
3. Builds `searchContext`.
4. Clears old hotel result cache:
   - `sessionStorage.removeItem(HOTEL_SEARCH_RESULTS_KEY)`
5. Stores pending search context:
   - `sessionStorage.setItem(HOTEL_SEARCH_SESSION_KEY, JSON.stringify({...searchContext, initResponse: null, initStatus: "pending"}))`
6. Stores last listing URL:
   - `localStorage.setItem(HOTEL_LAST_SEARCH_URL_KEY, resultsUrl)`
7. Navigates to `/hotels?...channel=<channel>`.

Important functions:

- `createHotelSearchChannel()` in `hotelSearch.js`
- `fetchHotelSearchSuggestions()` in `hotelSearch.js`
- `initHotelSearch()` in `hotelSearch.js`

## Hotel Listing Flow

Main file: `src/app/hotels/components/TourListing.jsx`

### Result parsing helpers

These functions decode websocket or cached result payloads:

- `parseSocketValue(value)`
- `getMessageData(payload)`
- `getMessageContent(payload)`
- `findHotelArrays(value, depth, visited)`
- `pickBestHotelResult(results)`
- `getHotelsFromMessage(payload)`
- `getHotelSearchMeta(...sources)`
- `getInitCompleteSearchMeta(payload)`
- `getFilterSearchMetaFromPayload(payload, hotels)`
- `isHotelTerminalPayload(payload)`
- `getHotelSocketType(payload)`

### Source priority

`HOTEL_RESULT_SOURCE_PRIORITY` controls which result source wins:

```js
const HOTEL_RESULT_SOURCE_PRIORITY = {
  merged: 3,
  curated: 2,
  hotels: 1,
};
```

`shouldApplyHotelResults(currentSource, nextSource)` returns true only when the new source is same or higher priority. This prevents lower quality payloads replacing better merged results.

### Card normalization

API hotel objects are converted to UI card objects by:

- `normalizeHotelCard(hotel, index)`

It maps:

- hotel id and search ids
- image
- address
- title
- price
- facilities through `normalizeHotelFacilities(hotel)`
- benefits through `normalizeHotelBenefits(hotel)`
- rating and review summary
- coordinates
- raw hotel object

### Result loading lifecycle

Inside the main `useEffect` in `TourListing`:

1. Resets local listing state when `hotelSearchChannel` changes:
   - `setHotelResults([])`
   - `setTotalHotelResults(0)`
   - `setIsHotelLoading(Boolean(hotelSearchChannel))`
   - clears filter request refs and retry state
2. Defines `normalizeHotelsInBatches(hotels, meta)`.
   - Adds search metadata into each hotel.
   - Normalizes first batch immediately.
   - Appends later hotels in small batches with `window.setTimeout`.
3. Defines `applyHotelResults(payload, { fromCache })`.
   - Ignores payload when `payload.channel` does not match URL channel.
   - Extracts `searchId` and `hotelSearchId`.
   - Handles failure payloads.
   - Extracts hotels with `getHotelsFromMessage`.
   - Updates merged/filter metadata.
   - Checks source priority with `shouldApplyHotelResults`.
   - Normalizes hotels in batches.
4. Listens for:
   - `HOTEL_SEARCH_RESULTS_EVENT`
5. Reads cached payload:
   - `sessionStorage.getItem(HOTEL_SEARCH_RESULTS_KEY)`
   - If channel matches, calls `applyHotelResults(cachedPayload, { fromCache: true })`.

### Where listing cache is read

In `TourListing.jsx`:

```js
const cachedResults = window.sessionStorage.getItem(HOTEL_SEARCH_RESULTS_KEY);
```

If cached data exists and channel matches, the listing rebuilds hotel cards from cache. This is why refresh can still show hotel results without redoing every step.

### Where listing data is pushed into context

`TourListing.jsx` updates `HotelsContext`:

- `setFilterData(apiFilterData || null)`
- `setHotels(hotelResults)`
- `setMeta({ channel, searchId, source, hasApiResults, isFilterLoading })`
- `setTotalResults(displayHotels.length)`
- `setDisplayHotels(displayHotels)`
- `setIsLoading(isHotelLoading)`

This lets `HotelsFilters.jsx` and `hotelMap.jsx` use the same listing data.

## Filter Data Flow

Function in service:

- `fetchHotelFilterData(searchId, { signal, payload })` in `src/shared/services/hotelSearch.js`

Endpoint:

```js
POST /api/hotels/search/result/:searchId/filterdata
```

Condition in `TourListing.jsx` before API call:

1. If `hasLoadedFilterDataRef.current`, do not call again.
2. If URL has hotel channel but no `filterSearchId`, wait.
3. If no `filterSearchId`, do not call.
4. If same request key already ran, do not call.
5. Otherwise call `fetchHotelFilterData(latestSearchId, { signal, payload })`.

Retry behavior:

- If API error code is `1216`, it retries after 600ms by incrementing `filterRetryNonce`.

## Selecting a Hotel From Listing

File: `src/app/hotels/components/TourListing.jsx`

Function:

- `handleBookNow(hotel)`

What it does:

1. Aborts any previous hotel detail request.
2. Builds request with `getHotelDetailsRequest(hotel, searchParams)`.
3. Checks required fields:
   - `searchId`
   - `hotelSearchId`
   - `hotelId`
   - `priceProvider`
4. Calls `fetchHotelDetails(payload)`.
5. Stores selected hotel detail payload:

```js
window.sessionStorage.setItem(
  HOTEL_DETAILS_KEY,
  JSON.stringify({
    request: payload,
    hotel,
    details,
  }),
);
```

6. Navigates to:

```js
router.push(getHotelDetailUrl(payload));
```

If backend says auth token is missing, it opens login modal instead of navigating.

## Hotel Detail Flow

Relevant files:

- `src/app/hotel-detail/layout.js`
- `src/app/hotel-detail/HotelDetailDataContext.js`
- `src/app/hotel-detail/page.js`

### Reading hotel details

`hotel-detail/layout.js` and `HotelDetailDataContext.js` read:

```js
sessionStorage.getItem(HOTEL_DETAILS_KEY)
```

This gives the detail page the selected hotel, request ids, and detail API response.

### Updating hotel details

`HotelDetailDataContext.js` can update the stored `HOTEL_DETAILS_KEY` when detail data changes.

### Availability change updates search context

File: `src/app/hotel-detail/page.js`

Function/area:

- `handleSelectRoom(selection)`

When user changes date/rooms and availability is refreshed:

1. Builds availability payload.
2. Calls availability refresh.
3. Updates URL params.
4. Updates `HOTEL_SEARCH_SESSION_KEY`:

```js
window.sessionStorage.setItem(
  HOTEL_SEARCH_SESSION_KEY,
  JSON.stringify({
    ...storedHotelSearch,
    checkIn: nextSelection.checkIn,
    checkOut: nextSelection.checkOut,
    rooms: nextSelection.rooms,
    adults: nextSelection.adults,
    children: nextSelection.children,
    childAges: nextSelection.childAges,
    initPayload: {
      ...(storedHotelSearch.initPayload || {}),
      ...payload,
    },
    availabilityResponse: response,
  }),
);
```

## Booking Session Flow

### Where booking session is written

Desktop hotel detail:

- File: `src/app/hotel-detail/page.js`
- Function: `saveBookingSession()`
- It builds payload with:
  - hotel summary
  - request ids and dates
  - selected rooms
  - guest counts
  - stored search context
- Then calls:

```js
writeHotelBookingSession(payload);
```

Mobile hotel detail:

- File: `src/app/hotel-detail/Components/hotelDetailsMobileView/HotelDetaislMobileView.jsx`
- Also calls `writeHotelBookingSession(...)`.

### `writeHotelBookingSession(value)`

File: `src/shared/services/hotelSearch.js`

Behavior:

1. If no value, clears session.
2. Adds expiry with `withHotelBookingSessionExpiry(value)`.
3. If expired, clears session.
4. Stores in in-memory variable:
   - `inMemoryHotelBookingSession = nextValue`
5. Removes old booking status lock:
   - `localStorage.removeItem(HOTEL_BOOKING_STATUS_KEY)`
6. Stores session:
   - `sessionStorage.setItem(HOTEL_BOOKING_SESSION_KEY, JSON.stringify(value))`
7. Schedules expiry timer.

Default expiry:

- `HOTEL_BOOKING_SESSION_DURATION_MS = 20 * 60 * 1000`
- 20 minutes.

### Where booking session is read

File: `src/app/hotel-booking/layout.js`

Initial effect:

```js
const session = readHotelBookingSession();
if (session?.rooms?.length) {
  setBookingSession(session);
  setRoomList(session.rooms);
} else {
  setBookingSession(null);
  setRoomList([]);
}
setBookingLoading(false);
```

This is why `/hotel-booking` can survive refresh. The layout reads from storage and provides state through `RoomProvider`.

### `readHotelBookingSession()`

File: `src/shared/services/hotelSearch.js`

Behavior:

1. If in-memory session exists and not expired, returns it.
2. If in-memory session expired, clears and returns null.
3. Reads `sessionStorage.getItem(HOTEL_BOOKING_SESSION_KEY)`.
4. If parsed session is expired, clears and returns null.
5. Stores parsed session back into memory and schedules expiry timer.

### Where booking session is removed

Function:

- `clearHotelBookingSession()` in `hotelSearch.js`

It:

1. Sets `inMemoryHotelBookingSession = null`
2. Clears expiry timer
3. Removes `HOTEL_BOOKING_SESSION_KEY` from sessionStorage

Places that call it:

- `writeHotelBookingSession(null)`
- expired booking session checks
- booking session expiry timer
- `hotel-booking/layout.js` when payment/booking status is closed
- `hotel-booking/layout.js` when navbar session expires
- `markHotelBookingConfirmed(value)` after booking is confirmed

## Checkout and Payment Flow

File: `src/app/hotel-booking/components/review/ReviewPage.jsx`

Function:

- `handleStartBooking()`

Conditions before booking starts:

1. If `bookingLoading`, return.
2. If `hotelBookingStatus`, show payment in progress message.
3. If auth is loading, return.
4. If payment gateways are loading, return.
5. If no payment gateway, show error.
6. If not logged in, open login modal.
7. Validate guest details.
8. Validate booking contact.
9. Validate search ids, TUI/search tracing key, recommendation id, and hotel code.

Before calling start booking:

```js
markHotelBookingSubmitStarted({ TUI: searchTracingKey });
setBookingLoading(true);
```

Then:

1. Builds start-booking payload.
2. Calls `startHotelBooking(payload)`.
3. Handles price change if backend returns one.
4. Calls `HotelPaymentStart(hotelPayment)`.
5. Calls `redirectToHotelPayment(hotelPaymentResponse, finalConfirmPayload)`.

### Payment redirect storage

Function:

- `redirectToHotelPayment(paymentResponse, confirmPayload)`

It writes pending booking confirmation:

```js
writePendingHotelConfirmBooking({
  confirmPayload,
  merchantOrderId: confirmPayload.merchant_order_id,
  paymentResponse,
  createdAt: Date.now(),
});
```

Then locks booking as payment started:

```js
markHotelBookingPaymentStarted({
  merchantOrderId,
  TUI,
  transactionId,
});
```

Then opens payment redirect URL in a new tab.

## Booking Status Store

Service functions in `hotelSearch.js`:

- `writeHotelBookingStatus(value)`
- `markHotelBookingSubmitStarted(value)`
- `markHotelBookingPaymentStarted(value)`
- `markHotelBookingConfirmed(value)`
- `readHotelBookingStatus()`
- `clearHotelBookingStatus()`

Storage:

- `localStorage.setItem(HOTEL_BOOKING_STATUS_KEY, JSON.stringify(nextValue))`

Why localStorage:

- It can lock checkout across tabs.
- `hotel-booking/layout.js` listens for storage events and `HOTEL_BOOKING_STATUS_EVENT`.

Status values:

- `submit_started`
- `payment_started`
- `confirmed`

When layout sees one of these closed statuses, it:

1. Sets `hotelBookingStatus`.
2. Calls `clearHotelBookingSession()`.
3. Clears local booking session state.

## Pending Confirm Booking Store

Service functions in `hotelSearch.js`:

- `writePendingHotelConfirmBooking(value)`
- `readPendingHotelConfirmBooking()`
- `clearPendingHotelConfirmBooking()`

Storage:

- sessionStorage
- localStorage

Reason:

- The payment return flow may open in a new tab or survive reload.

File:

- `src/app/hotel-booking-success/page.js`

Flow:

1. Reads pending booking with `readPendingHotelConfirmBooking()`.
2. Calls `confirmHotelBooking(confirmPayload)`.
3. On success calls:
   - `clearPendingHotelConfirmBooking()`
   - `markHotelBookingConfirmed(...)`

## TourListing State Cheatsheet

Inside `TourListing`:

| State/ref | Purpose |
| --- | --- |
| `hotelResults` | Normalized hotel card list. |
| `apiFilterData` | Filter API response. |
| `totalHotelResults` | Total raw result count. |
| `isHotelLoading` | Main hotel result loading state. |
| `hotelResultSource` | Current selected result source: merged, curated, hotels. |
| `socketSearchMeta` | Search ids from socket/result payloads. |
| `mergedFilterSearchMeta` | Search ids from merged/init payloads for filters. |
| `hasMergedHotelResponse` | Tracks merged response availability. |
| `isFilterLoading` | Filter API loading state. |
| `filterRetryNonce` | Incremented to retry filter API. |
| `loadingHotelDetailsId` | Button loading state while hotel detail API runs. |
| `sortType` | Listing sort type. |
| `normalizeRunRef` | Cancels old batch normalization runs. |
| `hotelResultSourceRef` | Current result source priority. |
| `lastFilterRequestKeyRef` | Prevents duplicate filter API requests. |
| `latestFilterSearchMetaRef` | Latest ids used for filter API. |
| `hasLoadedFilterDataRef` | Prevents re-fetch after usable filter data loaded. |

## Simplified End-to-End Flow

1. Home page hotel search creates `hotelSearchContext`.
2. Home page navigates to `/hotels` with a websocket channel.
3. Hotel results arrive by websocket/event or cached `hotelSearchResults`.
4. `TourListing` parses, prioritizes, normalizes, and renders hotel cards.
5. `TourListing` loads filter data when a `searchId` is available.
6. User clicks `SEE AVAILABILITY`.
7. `TourListing.handleBookNow()` calls hotel detail API, stores `hotelDetails`, and routes to `/hotel-detail`.
8. Hotel detail reads `hotelDetails`.
9. User selects room.
10. Hotel detail writes `hotelBookingSession`.
11. User navigates to `/hotel-booking`.
12. Booking layout reads `hotelBookingSession`.
13. Review page validates guests/contact and calls `startHotelBooking`.
14. Payment starts and pending confirmation is stored.
15. Success page reads pending confirmation and confirms booking.
16. Confirmed status clears active hotel booking session.

## Debugging Tips

- If `/hotels` is blank after refresh, inspect `sessionStorage.hotelSearchResults` and URL `channel`.
- If filters do not load, inspect `filterSearchId` and network call to `/api/hotels/search/result/:id/filterdata`.
- If hotel detail opens without data, inspect `sessionStorage.hotelDetails`.
- If `/hotel-booking` shows no active session, inspect `sessionStorage.hotelBookingSession` and check whether `localStorage.hotelBookingStatus` is locking the checkout.
- If payment success cannot confirm, inspect `hotelPendingConfirmBooking` in both sessionStorage and localStorage.

# Flight Flow Notes

This document explains the current flight search, listing, fare selection, booking details, SSR, seat layout, and payment flow. It focuses on the main UI components, service functions, booking-session helpers, and the handoff between `/flights` and `/flight-booking-details`.

## Main Files

- `src/features/flights/services/searchFlights.js`
  Starts V2 flight search, opens the SSE connection, merges provider result chunks, and falls back to HTTP when EventSource is unavailable.
- `src/features/flights/hooks/useSearchFlights.js`
  React Query wrapper around `searchFlights(params)`.
- `src/features/flights/utils/flightSearchMappers.js`
  Builds API search params and maps backend flight result payloads into UI cards for one-way, round-trip, and multi-city views.
- `src/app/flights/FlightsPageClient.jsx`
  Main flight listing page. Builds search params, calls `useSearchFlights`, maps and aggregates pages, stores filter metadata, handles expired fare events, and renders the correct trip component.
- `src/app/flights/components/onewayTrip/OnewayFlightBooking.jsx`
  One-way listing UI. Opens fare-options modal, prefetches fare options, and loads flight info.
- `src/app/flights/components/onewayTrip/FareComparisonModal.jsx`
  One-way fare selection. Calls fare-options and pricing APIs, writes the flight booking session, then routes to `/flight-booking-details`.
- `src/app/flights/components/roundTrip/FareComparisonModalRoundTrip.jsx`
  Round-trip fare selection. Builds a combined price request, writes the flight booking session, then routes to `/flight-booking-details`.
- `src/features/flights/services/flightBooking.js`
  Flight booking service layer: fare-options, pricing, flight info, SSR, seat layout, create itinerary, start payment, and retrieve booking.
- `src/features/flights/utils/flightBookingSession.js`
  Booking-session storage helpers and request builders for pricing, SSR, seat layout, create itinerary, payment, and retrieve booking.
- `src/app/flight-booking-details/FlightBookingContext.js`
  Shared checkout state. Reads/writes booking session, loads SSR and seat layout, tracks selected baggage/meals/seats, and submits itinerary/payment.
- `src/app/flight-booking-details/page.js`
  Step switcher for passenger, baggage, meals, seats, and payment views.
- `src/app/flight-booking-details/components/passengerDetails/PassengerDetails.jsx`
  Validates travelers, triggers SSR and seat layout loading, then moves to baggage.
- `src/app/flight-booking-details/components/baggageDetails/BaggageDetails.jsx`
  Displays SSR baggage options and stores selected baggage in context.
- `src/app/flight-booking-details/components/mealsDetails/MealsDetails.jsx`
  Displays SSR meal options and stores selected meals in context.
- `src/app/flight-booking-details/components/seatingDetails/SeatingDetails.jsx`
  Displays formatted seat layout and stores selected seats in context.
- `src/app/flight-booking-details/components/paymentPage/PaymentPage.jsx`
  Review/payment UI. Calls `submitItinerary()` and clears booking session after success modal close.

## Storage Keys

Defined in `src/features/flights/utils/flightBookingSession.js`.

| Key constant | Actual key | Storage | Purpose |
| --- | --- | --- | --- |
| `FLIGHT_BOOKING_SESSION_KEY` | `target_tours_flight_booking_session` | `sessionStorage` plus in-memory variable | Selected flight, fare, pricing response, SSR response, seat layout, traveler/contact details, selected extras, itinerary/payment responses. |

Session expiry:

- `FLIGHT_PRICING_SESSION_DURATION_MS`
  Pricing sessions expire after 20 minutes.
- `withFlightPricingSessionExpiry(value)`
  Adds `pricingSessionStartedAt` and `pricingSessionExpiresAt`.
- `isFlightBookingSessionExpired(session)`
  Used by `readFlightBookingSession()` to clear expired sessions.

Important storage helpers:

- `readFlightBookingSession()`
- `writeFlightBookingSession(value)`
- `clearFlightBookingSession()`
- `mergeFlightBookingSession(patch)`
- `readBookingFallbackFromSearch(search)`
- `buildBookingFallbackQuery(session)`

## Search Start Flow

The committed search state comes from `TripTypeContext` and URL search params. `FlightsPageClient.jsx` builds the API payload through:

- `buildSearchParams(...)` in `flightSearchMappers.js`

Then it calls:

- `useSearchFlights({ params, enabled, filterTrigger, refreshTrigger })`
- `searchFlights(params)` in `searchFlights.js`

## Flight Search Service Flow

Main file: `src/features/flights/services/searchFlights.js`

### V2 SSE search

`searchFlights(params)` chooses:

1. `searchFlightsViaSocket(params)` when `window.EventSource` is available.
2. `searchFlightsViaHttp(params)` otherwise.

`searchFlightsViaSocket(params)`:

1. Creates a channel with `createFlightSearchChannel()`.
2. Builds payload with `buildSocketSearchPayload(params, channel)`.
3. Opens EventSource through `getFlightSearchEventsUrl(channel)`.
4. Posts the search request with `postSocketFlightSearch(searchPayload)`.
5. Handles events listed in `FLIGHT_SSE_EVENT_NAMES`.
6. Extracts provider result chunks with:
   - `unwrapSocketPayload(payload)`
   - `getFlightResultEntries(payload)`
   - `getFlightItems(payload)`
7. Resolves when idle or complete using `mergeSocketPayloads({ chunks, initResponse, params, channel })`.

### HTTP fallback

`searchFlightsViaHttp(params)` builds the same payload and posts to:

```txt
POST /api/flights/v2/search
```

## Listing Page Flow

Main file: `src/app/flights/FlightsPageClient.jsx`

### Search params

`FlightsPageClient` builds:

- `baseSearchParams` with `buildSearchParams(...)`
- `searchParams` by adding `page: currentPage`
- `baseSearchKey` to reset state when search/filter inputs change
- `combinedRefreshToken` to force refreshes

### Data loading

It calls:

- `useSearchFlights(...)`
- `useDatewiseFare(...)`

When first page search data updates, it refetches date-wise fare data through:

- `refetchDatewiseFare()`

### Mapping search data

Search response is mapped with:

- `mapFlightSearchResponse({ response, tripType, passengers, travelClass, returnDate, fromLabel, toLabel, page, limit })`

This returns mapped data for:

- `oneway`
- `round`
- `multi`
- `tripCards`
- `multiRouteResults`
- filters, pagination, highlights, and date-wise data

Pagination appends later pages using:

- `appendUniqueById(existing, incoming)`
- `mergeMultiRouteResults(previous, incoming)`
- `sortFlightsByOption(items, sortBy)`
- `sortCardsByFlightOrder(cards, sortedFlights)`

### Fare expired handling

`FlightsPageClient` listens for:

- `FLIGHT_FARE_EXPIRED_EVENT`

The event is emitted from `flightBooking.js` by:

- `emitFareExpired(payload)`
- `isFareExpiredResponse(payload)`

When received, the listing shows a toast, resets page/results, and refreshes search.

## Flight Result Mapping

Main file: `src/features/flights/utils/flightSearchMappers.js`

Important functions:

- `buildSearchParams(...)`
  Converts UI trip type, airports, dates, passengers, cabin, and filters into API params.
- `mapFlightSearchResponse(...)`
  Converts backend response into page-ready data.
- `buildOneWayCard(flight, index, options)`
  Builds one-way UI card and booking metadata.
- `buildRoundCard(flight, index, options)`
  Builds round-trip UI card and booking metadata.
- `buildMultiCard(flight, index, options)`
  Builds multi-city UI card and booking metadata.
- `normalizeGroupedRoundTripFlights(flights)`
  Normalizes grouped round-trip results.
- `buildMappedMultiRouteResult(...)`
  Builds multi-city route groups.

Booking metadata produced on cards is later used by fare-options and pricing:

- `flight.booking.priceRequest`
- `flight.booking.searchKey`
- `flight.booking.flightNo`
- `flight.booking.provider`
- `flight.booking.tripType`

## One-Way Listing Interaction

Main file: `src/app/flights/components/onewayTrip/OnewayFlightBooking.jsx`

### Flight info

When a user expands details:

1. `toggleDetails(flight)` runs.
2. It builds payload with `buildFlightInfoPayload(flight)`.
3. Calls `getFlightInfo(payload)`.

Service endpoint:

```txt
POST /api/flights/info
```

### Fare modal and fare-options prefetch

When a user opens fare selection:

1. `openFareModal(flight)` runs.
2. It calls `getFlightFareOptions({ request: flight.booking.priceRequest, flight, onFareOptionsEvent })`.
3. Streaming fare-options updates are pushed into `prefetchedFareData`.
4. The modal receives `selectedFareFlight` and `prefetchedFareData`.

Fare option extraction helpers are in `fareOptionsStreaming.js`:

- `getFareOptionItems(payload, flightNo)`
- `hasFareOptionItems(payload, flightNo)`
- `mergeFareOptionResponses(previousPayload, nextPayload, flightNo)`
- `getCachedFareOptionsRequest(key, request)`
- `isFareExpiredPayload(payload)`

## Fare Options Flow

Main service function:

- `getFlightFareOptions({ request, flight, onFareOptionsEvent })` in `flightBooking.js`

What it does:

1. Builds V2 fare-options payload with `buildV2PricingPayload({ request, flight, channel })`.
2. Opens EventSource through `getPricingEventsUrl(channel)`.
3. Posts to:

```txt
POST /api/flights/v2/fare-options
```

4. Listens to `PRICING_SSE_EVENT_NAMES`.
5. Merges fare option maps with `mergeFareOptionMaps(...)`.
6. Calls `onFareOptionsEvent` as streamed payloads arrive.
7. Resolves with a response containing merged fare options and `pricingChunks`.

## Fare Selection And Pricing Flow

Main file:

- `src/app/flights/components/onewayTrip/FareComparisonModal.jsx`

Important functions:

- `buildFareOptions({ flightData, prefetchedData, adults })`
  Converts fare-options response into fare cards.
- `handleBookNow(selectedFare)`
  Requires login, then calls `performBookNow(selectedFare)`.
- `performBookNow(selectedFare)`
  Builds selected fare price request, calls pricing, writes booking session, and routes to booking details.
- `buildSelectedFareFromFormattedPrice(selectedFare, priceResponse)`
  Updates selected fare from formatted pricing payload.
- `buildFormattedOnlyPriceResponse(priceResponse)`
  Keeps the pricing data shape needed by checkout.

`performBookNow(selectedFare)` sequence:

1. Reads base request from `flightData.booking.priceRequest`.
2. Builds selected request with:
   - `buildSelectedFarePriceRequest(basePriceRequest, selectedFare)`
3. Ensures selected fare index is set in `Trips[0].Index`.
4. Calls:
   - `getFlightPrice(priceRequest)`
5. Converts pricing response with:
   - `buildFormattedOnlyPriceResponse(priceResponse)`
   - `buildSelectedFareFromFormattedPrice(selectedFare, formattedOnlyPriceResponse)`
6. Builds `nextSession`:
   - `selectedFlight`
   - `selectedFare`
   - `routeContext`
   - `priceRequest`
   - `priceResponse`
   - empty checklist/SSR placeholders
7. Stores session:
   - `writeFlightBookingSession(nextSession)`
8. Builds fallback query:
   - `buildBookingFallbackQuery(nextSession)`
9. Routes to:

```txt
/flight-booking-details
```

or:

```txt
/flight-booking-details?bookingFallback=...
```

Round-trip flow in `FareComparisonModalRoundTrip.jsx` follows the same pattern, but combines onward and return fare selections before calling `getFlightPrice(priceRequest)`.

## Pricing Flow

Main service function:

- `getFlightPrice(payload)` in `flightBooking.js`

What it does:

1. Builds V2 price payload with:
   - `buildV2PricePayload(request)`
   - `buildV2PriceSearchKeys(request)`
   - `buildV2PriceTrip(trip, index)`
2. Opens EventSource through `getPricingEventsUrl(channel)`.
3. Posts to:

```txt
POST /api/flights/v2/pricing
```

4. Listens to pricing SSE events.
5. Extracts usable pricing payload with:
   - `extractFlightPricingPayload(payload)` from `flightPricingPayload.mjs`
   - `hasFlightPricingPayload(payload)`
   - `isFlightPricingResult(payload)`
6. Resolves with pricing result and `pricingChunks`.
7. Emits `FLIGHT_FARE_EXPIRED_EVENT` if fare expiry is detected.

## Booking Details Page Flow

Main files:

- `src/app/flight-booking-details/page.js`
- `src/app/flight-booking-details/FlightBookingContext.js`

### Step rendering

`FlightBookingDetailsPage` renders by `currentStep`:

| Step | Component |
| --- | --- |
| `2` | `PassengerDetails` |
| `3` | `BaggageDetails` |
| `4` | `MealsDetails` |
| `5` | `SeatingDetails` |
| other/payment step | `PaymentPage` |

### Context initialization

`FlightBookingProvider`:

1. Reads stored session with `readFlightBookingSession()`.
2. Reads URL fallback with `readBookingFallbackFromSearch(window.location.search)`.
3. Applies expiry with `withFlightPricingSessionExpiry(...)`.
4. Stores the result in `bookingSession`.
5. Persists updates back through `writeFlightBookingSession(bookingSession)`.

It also manages browser back/forward step state through `history.pushState` and `popstate`.

## Passenger Details Flow

Main file:

- `src/app/flight-booking-details/components/passengerDetails/PassengerDetails.jsx`

Important function:

- `handleContinue()`

What happens:

1. Validates travelers/contact with `validateTravelerForm(...)`.
2. If valid, calls:
   - `loadSsrForBooking({ travelerDetailsOverride: travelerDetails, includeSeatLayout: true })`
3. If SSR loading succeeds, moves to baggage:
   - `setCurrentStep(3)`

## SSR Flow

Main function:

- `loadSsrForBooking(...)` in `FlightBookingContext.js`

SSR request builders:

- `buildV2SsrPayload(session)`
- `buildSsrPayload(session)`

Service functions:

- `getFlightV2Ssr(payload)`
- `getFlightSsr(payload)`

Flow order:

1. Try V2 SSR first with `buildV2SsrPayload(bookingSession)`.
2. If `ssr_requests` exist, call `getFlightV2Ssr(v2SsrPayload)`.
3. If V2 is unavailable, try building SSR data from price response:
   - `buildSsrResponseFromPrice(bookingSession.priceResponse)`
4. If price response does not contain ancillary data, fall back to legacy:
   - `buildSsrPayload(bookingSession)`
   - `getFlightSsr(ssrPayload)`
5. Store response in booking session:
   - `ssrRequest`
   - `ssrResponse`
   - `ssrSource`

V2 SSR endpoint:

```txt
POST /api/flights/v2/ssr
```

Legacy SSR endpoint:

```txt
POST /api/flights/ssr
```

## Seat Layout Flow

Seat layout is triggered inside `loadSsrForBooking(...)` when `includeSeatLayout` is true.

Request builders:

- `buildSeatLayoutPayload(session, travelerDetails)`
- `buildV2SeatLayoutPayload(session, travelerDetails)`
- `buildV2SeatLayoutPaxDetails(travelerDetails)`
- `buildRiyaSeatLayoutPayload(session, travelerDetails)`

Service function:

- `getFlightSeatLayout(payload)`

V2 endpoint:

```txt
POST /api/flights/v2/seat-layout
```

Legacy endpoint:

```txt
POST /api/flights/seat-layout
```

V2 behavior:

1. Detects `payload.seat_layout_requests`.
2. Opens EventSource with `getPricingEventsUrl(channel)`.
3. Posts seat layout payload to `/api/flights/v2/seat-layout`.
4. Extracts seat layout only from formatted data using:
   - `extractFlightSeatLayoutPayload(payload)`
   - `normalizeSeatLayoutPayload(payload)`
   - `getSeatLayoutFormatted(payload)`
5. Stores in booking session:
   - `seatLayoutRequest`
   - `seatLayoutResponse`

Important rule:

- Seat layout rendering uses `data.formatted`, `data.data.formatted`, or `formatted`.
- The seating UI does not use `raw` seat layout data.

UI parsing in `SeatingDetails.jsx`:

- `getSeatLayoutFormattedPayload(seatLayoutResponse)`
- `getSeatLayoutJourneys(seatLayoutResponse)`
- `findSeatArray(value)`
- `buildFormattedSeatRows(seatLayoutResponse)`
- `getSeatType(seat)`
- `getSeatPrice(seat)`
- `getSeatSsrId(seat)`

Selected seats are stored through `setSeats(...)` in `FlightBookingContext`.

## Baggage And Meals Flow

Main files:

- `src/app/flight-booking-details/components/baggageDetails/BaggageDetails.jsx`
- `src/app/flight-booking-details/components/mealsDetails/MealsDetails.jsx`

Both read SSR data from:

- `bookingSession.ssrResponse`

Selections are stored in context:

- `setBaggage(...)`
- `setMeals(...)`

Price summary uses:

- `prices` from `FlightBookingContext`
- `extractBaseFareAmount(bookingSession)`
- `extractTaxAmount(bookingSession)`

`prices` includes:

- base fare
- tax
- selected baggage total
- selected meals total
- selected seats total
- final total

## Create Itinerary And Payment Flow

Main function:

- `submitItinerary()` in `FlightBookingContext.js`

Request builders:

- `buildCreateItineraryPayload(session, prices)`
- `buildStartPaymentPayload(session)`
- `buildRetrieveBookingPayload(session)`

Service functions:

- `createFlightItinerary(payload)`
- `startFlightPayment(payload)`
- `retrieveFlightBooking(payload)`

Endpoint sequence:

```txt
POST /api/flights/create-itinerary
POST /api/flights/start-payment
POST /api/flights/retrieve-booking
```

`submitItinerary()` sequence:

1. Builds create-itinerary payload from:
   - booking session
   - traveler details
   - contact details
   - selected baggage
   - selected meals
   - selected seats
   - computed prices
2. Validates provider-specific payload shape:
   - Akbar requires `TUI` and `Travellers`.
   - Riya requires `TrackId`, `ItineraryFlightsInfo`, and `PaxDetailsInfo`.
3. Calls `createFlightItinerary(payload)`.
4. Stores:
   - `createItineraryRequest`
   - `createItineraryResponse`
5. Builds payment payload with `buildStartPaymentPayload(nextSession)`.
6. Calls `startFlightPayment(startPaymentPayload)`.
7. Builds retrieve payload with `buildRetrieveBookingPayload(...)`.
8. Calls `retrieveFlightBooking(retrieveBookingPayload)`.
9. Stores:
   - `startPaymentRequest`
   - `startPaymentResponse`
   - `retrieveBookingRequest`
   - `retrieveBookingResponse`
10. Sets `paymentSuccessData`.

## Payment Page Flow

Main file:

- `src/app/flight-booking-details/components/paymentPage/PaymentPage.jsx`

The payment page:

1. Reads checkout state from `useFlightBooking()`.
2. Builds review cards with:
   - `getBookingDetailsView(bookingSession)`
   - `buildTripCardData(flight, selectedFare)`
   - `buildMobilePriceSummary({ prices, bookingSession, travelerDetails })`
3. Calls `submitItinerary` when the user clicks `CONTINUE PAYMENT`.
4. Opens `BookingSuccessModal` when `paymentSuccessData` exists.
5. On success modal close, calls:
   - `clearFlightBookingSession()`
   - resets context state
   - `router.push("/")`

## Complete High-Level Flow

1. User searches flights.
2. `FlightsPageClient` builds params with `buildSearchParams`.
3. `useSearchFlights` calls `searchFlights`.
4. `searchFlightsViaSocket` opens SSE and posts `/api/flights/v2/search`.
5. Search chunks are merged with `mergeSocketPayloads`.
6. `mapFlightSearchResponse` maps backend data into flight cards.
7. Listing component renders one-way, round-trip, or multi-city cards.
8. User opens fare options.
9. `getFlightFareOptions` streams fare options.
10. `buildFareOptions` renders selectable fare cards.
11. User clicks book now.
12. `performBookNow` calls `getFlightPrice`.
13. `getFlightPrice` streams pricing result.
14. `writeFlightBookingSession` stores selected flight, fare, price request, and price response.
15. User lands on `/flight-booking-details`.
16. `FlightBookingProvider` reads stored booking session.
17. Passenger details are validated.
18. `loadSsrForBooking` loads SSR and seat layout.
19. User selects baggage, meals, and seats.
20. Payment page calls `submitItinerary`.
21. Create itinerary, start payment, and retrieve booking APIs run.
22. Success modal appears.
23. Closing success clears the flight booking session and returns home.


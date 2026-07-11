"use client";

const fareOptionsRequestCache = new Map();
const fareOptionsResponseCache = new Map();

const unwrapPayload = (payload) => payload?.data || payload || {};
const toArray = (value) => (Array.isArray(value) ? value : []);

const getFlightKey = (flightNo) => String(flightNo || "").trim();

const getItemKey = (item, index) =>
  String(
    item?.fare_id ??
      item?.FareId ??
      item?.fareId ??
      item?.id ??
      item?.ID ??
      item?.index ??
      item?.Index ??
      item?.flightId ??
      item?.price ??
      item?.Price ??
      item?.FCType ??
      item?.FareType ??
      item?.FareName ??
      item?.Name ??
      index
  );

const isMetadataOnlyObject = (item = {}) => {
  const keys = Object.keys(item);

  return (
    keys.length > 0 &&
    keys.every((key) =>
      [
        "channel",
        "domain",
        "type",
        "message",
        "requestId",
        "request_id",
        "sent_at",
        "search_key",
        "SearchKey",
        "searchKey",
        "search_keys",
        "index",
        "Trips",
      ].includes(key)
    )
  );
};

const looksLikeFareOption = (item = {}) =>
  Boolean(
    item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      !isMetadataOnlyObject(item) &&
      (
        item.FCType ||
        item.FCGroup ||
        item.FareType ||
        item.fareType ||
        item.fareClass ||
        item.fare_name ||
        item.FareName ||
        item.DisplayName ||
        item.displayName ||
        item.title ||
        item.Title ||
        item.brand ||
        item.Brand ||
        item.name ||
        item.Name ||
        item.price !== undefined ||
        item.Price !== undefined ||
        item.total !== undefined ||
        item.Total !== undefined ||
        item.totalFare !== undefined ||
        item.TotalFare !== undefined ||
        item.amount !== undefined ||
        item.Amount !== undefined ||
        item.netAmount !== undefined ||
        item.NetAmount !== undefined ||
        item.grossFare !== undefined ||
        item.GrossFare !== undefined ||
        item.netFare !== undefined ||
        item.NetFare !== undefined ||
        item.baseFare !== undefined ||
        item.BaseFare !== undefined ||
        item.more_fares !== undefined ||
        item.provider_options ||
        item.baggage ||
        item.Baggage ||
        item.CabinBaggage ||
        item.CheckInBaggage ||
        item.cabinBaggage ||
        item.checkInBaggage ||
        item.SSR ||
        item.SSRs ||
        item.inclusions
      )
  );

const FARE_LIST_KEYS = new Set([
  "fares",
  "fareOptions",
  "fare_options",
  "pricing",
  "prices",
  "options",
  "results",
  "flights",
  "fareFamilies",
  "fare_families",
  "Fares",
  "FareOptions",
  "Fare_Options",
  "Pricing",
  "Prices",
  "Options",
  "Results",
  "Flights",
  "FareFamilies",
  "Fare_Families",
  "Brands",
  "BrandOptions",
  "Plans",
  "items",
  "Items",
]);

const addFareItem = (item, items, seenItems, index = items.length) => {
  if (!looksLikeFareOption(item)) return false;

  const key = getItemKey(item, index);
  if (seenItems.has(key)) return true;

  seenItems.add(key);
  items.push(item);
  return true;
};

const collectFareItems = (value, items, seenItems, seenObjects) => {
  if (!value || typeof value !== "object") return;
  if (seenObjects.has(value)) return;
  seenObjects.add(value);

  if (Array.isArray(value)) {
    const fareItems = value.filter(looksLikeFareOption);
    if (fareItems.length) {
      fareItems.forEach((item, index) => {
        addFareItem(item, items, seenItems, index);
      });
      return;
    }

    value.forEach((item) => collectFareItems(item, items, seenItems, seenObjects));
    return;
  }

  if (addFareItem(value, items, seenItems)) return;

  Object.entries(value).forEach(([key, child]) => {
    if (Array.isArray(child) && FARE_LIST_KEYS.has(key)) {
      const fareItems = child.filter(looksLikeFareOption);
      if (fareItems.length) {
        fareItems.forEach((item, index) => {
          addFareItem(item, items, seenItems, index);
        });
        return;
      }
    }

    collectFareItems(child, items, seenItems, seenObjects);
  });
};

const extractV2FareOptionItems = (payload) => {
  const response = unwrapPayload(payload);
  const items = [];
  const seen = new Set();

  const pushItems = (list = []) => {
    toArray(list).forEach((item, index) => {
      if (!looksLikeFareOption(item)) return;
      const key = getItemKey(item, index);
      if (seen.has(key)) return;
      seen.add(key);
      items.push(item);
    });
  };

  pushItems(response?.flights);
  pushItems(response?.data?.flights);

  toArray(response?.mergedProviders?.trips).forEach((trip) => {
    pushItems(trip?.data?.result?.flights);
  });

  toArray(response?.providerResults).forEach((providerResult) => {
    toArray(providerResult?.data?.trips).forEach((trip) => {
      pushItems(trip?.data?.result?.flights);
    });
  });

  const pricingChunks = [
    ...toArray(response?.pricingChunks),
    ...toArray(response?.data?.pricingChunks),
  ];
  pricingChunks.forEach((chunk) => {
    collectFareItems(chunk, items, seen, new WeakSet());
  });

  collectFareItems(response, items, seen, new WeakSet());
  collectFareItems(response?.pricing, items, seen, new WeakSet());
  collectFareItems(response?.data?.pricing, items, seen, new WeakSet());
  collectFareItems(response?.result, items, seen, new WeakSet());
  collectFareItems(response?.data?.result, items, seen, new WeakSet());
  collectFareItems(response?.search_keys, items, seen, new WeakSet());
  collectFareItems(response?.data?.search_keys, items, seen, new WeakSet());

  return items;
};

export const getFareOptionItems = (payload, flightNo) => {
  const response = unwrapPayload(payload);
  const directItems = extractV2FareOptionItems(response);
  const flightKey = getFlightKey(flightNo);

  if (directItems.length === 0) return [];

  const matchingByFlightNo = flightKey
    ? directItems.filter((item) => {
        const itemFlightNo = String(
          item?.flightNo ||
            item?.flight_no ||
            item?.flight_number ||
            item?.FlightNo ||
            item?.FlightNumber ||
            item?.airline?.code ||
            item?.airlineCode ||
            ""
        ).trim();

        return itemFlightNo ? itemFlightNo === flightKey : true;
      })
    : directItems;

  return matchingByFlightNo.length > 0 ? matchingByFlightNo : directItems;
};

export const hasFareOptionItems = (payload, flightNo) =>
  getFareOptionItems(payload, flightNo).length > 0;

export const isFareOptionsCached = (payload) =>
  Boolean(
    payload?.cached ??
      payload?.data?.cached ??
      payload?.data?.data?.cached
  );

export const isFareExpiredPayload = (payload) =>
  Boolean(
    payload?.fare_expired ??
      payload?.fareExpired ??
      payload?.data?.fare_expired ??
      payload?.data?.fareExpired
  );

export const mergeFareOptionResponses = (previousPayload, nextPayload, flightNo) => {
  const prevItems = getFareOptionItems(previousPayload, flightNo);
  const nextItems = getFareOptionItems(nextPayload, flightNo);

  const mergedItems = [...prevItems];
  const seen = new Set(prevItems.map((item, index) => getItemKey(item, index)));
  nextItems.forEach((item, index) => {
    const key = getItemKey(item, index);
    if (seen.has(key)) return;
    seen.add(key);
    mergedItems.push(item);
  });

  return {
    ...unwrapPayload(previousPayload),
    ...unwrapPayload(nextPayload),
    cached: isFareOptionsCached(nextPayload) || isFareOptionsCached(previousPayload),
    flights: mergedItems,
    data: {
      ...(unwrapPayload(previousPayload)?.data || {}),
      ...(unwrapPayload(nextPayload)?.data || {}),
      flights: mergedItems,
    },
  };
};

export const getCachedFareOptionsRequest = (key, request) => {
  const requestKey = String(key || "").trim();
  if (!requestKey) return request();

  const cachedResponse = fareOptionsResponseCache.get(requestKey);
  if (cachedResponse) return Promise.resolve(cachedResponse);

  const cached = fareOptionsRequestCache.get(requestKey);
  if (cached) return cached;

  const promise = request()
    .then((response) => {
      fareOptionsResponseCache.set(requestKey, response);
      return response;
    })
    .finally(() => {
      fareOptionsRequestCache.delete(requestKey);
    });
  fareOptionsRequestCache.set(requestKey, promise);
  return promise;
};

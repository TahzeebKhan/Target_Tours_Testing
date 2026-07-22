"use client";

const fareOptionsRequestCache = new Map();
const fareOptionsResponseCache = new Map();

const unwrapPayload = (payload) => payload?.data || payload || {};
const toArray = (value) => (Array.isArray(value) ? value : []);

const getFlightKey = (flightNo) => String(flightNo || "").trim();

const getItemKey = (item, index) => {
  const identityParts = [
    item?.fare_id ??
      item?.FareId ??
      item?.fareId ??
      item?.id ??
      item?.ID ??
      item?.index ??
      item?.Index ??
      item?.flightId ??
      "",
    item?.FCType ??
      item?.FCGroup ??
      item?.FareType ??
      item?.fareType ??
      item?.FareName ??
      item?.DisplayName ??
      item?.name ??
      item?.Name ??
      "",
    item?.price ??
      item?.Price ??
      item?.netAmount ??
      item?.NetAmount ??
      item?.grossFare ??
      item?.GrossFare ??
      item?.totalFare ??
      item?.TotalFare ??
      "",
  ];
  const populatedParts = identityParts.filter(
    (value) => value !== undefined && value !== null && String(value).trim() !== ""
  );

  return populatedParts.length >= 2
    ? identityParts.join("|")
    : JSON.stringify(item) || String(index);
};

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

const withFlightNo = (item, flightNo) =>
  flightNo && !item?.flight_no && !item?.flightNo
    ? { ...item, flight_no: flightNo }
    : item;

const readMergedFareItems = (payload, flightNo) => {
  const flightKey = getFlightKey(flightNo);
  if (!flightKey) return [];

  const mergedMaps = [
    payload?.merged,
    payload?.data?.merged,
    payload?.data?.data?.merged,
    payload?.data?.fare_options,
    payload?.data?.data?.fare_options,
    ...toArray(payload?.results).flatMap((result) => [
      result?.merged,
      result?.data?.merged,
      result?.data?.data?.fare_options,
    ]),
    ...toArray(payload?.data?.results).flatMap((result) => [
      result?.merged,
      result?.data?.merged,
      result?.data?.data?.fare_options,
    ]),
  ].filter((map) => map && typeof map === "object" && !Array.isArray(map));

  for (const merged of mergedMaps) {
    const exactItems = merged?.[flightKey];
    if (Array.isArray(exactItems) && exactItems.length > 0) {
      return exactItems
        .filter(looksLikeFareOption)
        .map((item) => withFlightNo(item, flightKey));
    }
  }

  return [];
};

const extractV2FareOptionItems = (payload) => {
  const response = unwrapPayload(payload);
  const items = [];
  const seen = new Set();

  const pushItems = (list = [], context = {}) => {
    toArray(list).forEach((item, index) => {
      if (!looksLikeFareOption(item)) return;
      const resolvedItem = withFlightNo(item, context.flight_no);
      const key = getItemKey(resolvedItem, index);
      if (seen.has(key)) return;
      seen.add(key);
      items.push(resolvedItem);
    });
  };

  const pushMergedItems = (merged) => {
    if (!merged || typeof merged !== "object") return;

    Object.entries(merged).forEach(([flightNo, list]) => {
      pushItems(list, { flight_no: flightNo });
    });
  };

  pushMergedItems(response?.merged);
  pushMergedItems(response?.data?.merged);

  pushItems(response?.flights);
  pushItems(response?.data?.flights);

  toArray(response?.results).forEach((result) => {
    pushMergedItems(result?.merged);
    pushMergedItems(result?.data?.merged);
    pushMergedItems(result?.data?.data?.merged);
    pushMergedItems(result?.data?.data?.fare_options);
  });

  toArray(response?.data?.results).forEach((result) => {
    pushMergedItems(result?.merged);
    pushMergedItems(result?.data?.merged);
    pushMergedItems(result?.data?.data?.merged);
    pushMergedItems(result?.data?.data?.fare_options);
  });

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
  const exactMergedItems = readMergedFareItems(payload, flightNo);
  if (exactMergedItems.length > 0) return exactMergedItems;

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

  const previousResponse = unwrapPayload(previousPayload);
  const nextResponse = unwrapPayload(nextPayload);
  const flightKey = getFlightKey(flightNo);
  const merged = {
    ...(previousResponse?.merged || {}),
    ...(nextResponse?.merged || {}),
    ...(flightKey ? { [flightKey]: mergedItems } : {}),
  };

  return {
    ...previousResponse,
    ...nextResponse,
    cached: isFareOptionsCached(nextPayload) || isFareOptionsCached(previousPayload),
    merged,
    flights: mergedItems,
    data: {
      ...(previousResponse?.data || {}),
      ...(nextResponse?.data || {}),
      merged,
      flights: mergedItems,
    },
  };
};

const getFareOptionsEventType = (payload) =>
  String(payload?.type || payload?.data?.type || "").trim().toUpperCase();

export const mergeProviderFareOptionResponses = (
  previousPayload,
  streamedPayload,
  flightNo
) => {
  const providerPayloads = [];
  const addProviderPayload = (payload) => {
    if (getFareOptionsEventType(payload).includes("FARE_OPTIONS_PROVIDER")) {
      providerPayloads.push(payload);
    }
  };

  addProviderPayload(streamedPayload);
  [streamedPayload?.pricingChunks, streamedPayload?.data?.pricingChunks].forEach(
    (chunks) => toArray(chunks).forEach(addProviderPayload)
  );

  const mergedPayload = providerPayloads.reduce(
    (mergedPayload, providerPayload) =>
      mergeFareOptionResponses(mergedPayload, providerPayload, flightNo),
    previousPayload
  );
  const isCombinedRoundTripFare = (fare) =>
    [
      fare?.FCType,
      fare?.FCGroup,
      fare?.FareType,
      fare?.fareType,
      fare?.FareName,
      fare?.DisplayName,
      fare?.name,
      fare?.Name,
    ].some((value) => String(value || "").trim().toUpperCase() === "RT");
  const providerFares = getFareOptionItems(mergedPayload, flightNo).filter(
    (fare) => !isCombinedRoundTripFare(fare)
  );
  const response = unwrapPayload(mergedPayload);
  const flightKey = getFlightKey(flightNo);
  const merged = {
    ...(response?.merged || {}),
    ...(flightKey ? { [flightKey]: providerFares } : {}),
  };

  return {
    ...response,
    merged,
    flights: providerFares,
    data: {
      ...(response?.data || {}),
      merged,
      flights: providerFares,
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

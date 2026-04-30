"use client";

const unwrapPayload = (payload) => payload?.data || payload || {};

const getFlightKey = (flightNo) => String(flightNo || "").trim();

const getItemKey = (item, index) =>
  String(
    item?.index ??
      item?.fare_id ??
      item?.id ??
      item?.flightId ??
      item?.price ??
      item?.FCType ??
      index
  );

export const getFareOptionItems = (payload, flightNo) => {
  const response = unwrapPayload(payload);
  const fareOptions = response?.fare_options || response?.fareOptions || {};
  const flightKey = getFlightKey(flightNo);

  const directFares = fareOptions?.[flightKey]?.fares;
  if (Array.isArray(directFares)) return directFares;

  const firstFareGroup = Object.values(fareOptions || {}).find((item) =>
    Array.isArray(item?.fares)
  );
  if (firstFareGroup?.fares) return firstFareGroup.fares;

  if (Array.isArray(response?.fares)) return response.fares;
  if (Array.isArray(response?.data?.fares)) return response.data.fares;

  return [];
};

export const hasFareOptionItems = (payload, flightNo) =>
  getFareOptionItems(payload, flightNo).length > 0;

export const isFareOptionsCached = (payload) =>
  Boolean(
    payload?.cached ??
      payload?.data?.cached ??
      payload?.data?.data?.cached
  );

export const mergeFareOptionResponses = (previousPayload, nextPayload, flightNo) => {
  const prevRaw = unwrapPayload(previousPayload);
  const nextRaw = unwrapPayload(nextPayload);
  const flightKey = getFlightKey(flightNo);
  const prevFareOptions = prevRaw?.fare_options || prevRaw?.fareOptions || {};
  const nextFareOptions = nextRaw?.fare_options || nextRaw?.fareOptions || {};
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

  const mergedFareOptions = {
    ...prevFareOptions,
    ...nextFareOptions,
    [flightKey]: {
      ...(prevFareOptions?.[flightKey] || {}),
      ...(nextFareOptions?.[flightKey] || {}),
      fares: mergedItems,
    },
  };

  return {
    ...prevRaw,
    ...nextRaw,
    cached: isFareOptionsCached(nextRaw) || isFareOptionsCached(prevRaw),
    fare_options: mergedFareOptions,
    fareOptions: mergedFareOptions,
  };
};

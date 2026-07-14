const toArray = (value) => (Array.isArray(value) ? value : []);

export const getPricingPayloadType = (payload) =>
  String(payload?.type || payload?.data?.type || "").toUpperCase();

const hasUsablePricingData = (payload) =>
  Boolean(
    payload &&
      typeof payload === "object" &&
      ((payload?.formatted &&
        typeof payload.formatted === "object" &&
        payload.formatted.final_price !== undefined &&
        payload.formatted.final_price !== null) ||
        (payload?.pricing &&
          typeof payload.pricing === "object" &&
          payload.pricing.new_price !== undefined &&
          payload.pricing.new_price !== null) ||
        (Array.isArray(payload?.fare_breakdown) && payload.fare_breakdown.length > 0))
  );

const isFulfilledPricingResult = (result = {}) => {
  const status = String(result?.status || "").toLowerCase();
  if (status && status !== "fulfilled" && status !== "success") return false;
  if (result?.success === false || result?.data?.success === false) return false;
  return true;
};

export const extractFlightPricingPayload = (payload) => {
  if (!payload || typeof payload !== "object") return null;

  const directCandidates = [
    payload,
    payload?.data,
    payload?.data?.data,
  ];

  for (const candidate of directCandidates) {
    if (hasUsablePricingData(candidate)) return candidate;
  }

  const resultContainers = [
    payload?.results,
    payload?.data?.results,
    payload?.data?.data?.results,
  ];

  for (const results of resultContainers) {
    for (const result of toArray(results)) {
      if (!isFulfilledPricingResult(result)) continue;

      const candidates = [
        result?.data?.data,
        result?.data,
        result,
      ];

      const pricingPayload = candidates.find(hasUsablePricingData);
      if (pricingPayload) return pricingPayload;
    }
  }

  return null;
};

export const hasFlightPricingPayload = (payload) =>
  Boolean(extractFlightPricingPayload(payload));

export const isFlightPricingResult = (payload) => {
  const type = getPricingPayloadType(payload);
  const isCompletePricingEvent =
    type.includes("PRICING") &&
    (type.includes("COMPLETE") || type.includes("COMPLETED"));

  if (isCompletePricingEvent) return true;

  return (
    type.includes("PRICING") &&
    !type.includes("ACCEPTED") &&
    !type.includes("STARTED") &&
    hasFlightPricingPayload(payload)
  );
};

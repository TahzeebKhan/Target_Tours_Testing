import assert from "node:assert/strict";
import test from "node:test";

import {
  extractFlightPricingPayload,
  hasFlightPricingPayload,
  isFlightPricingResult,
} from "../src/features/flights/services/flightPricingPayload.mjs";

test("extracts pricing payload from nested completed SSE provider result", () => {
  const payload = {
    type: "FLIGHT_V2_PRICING_COMPLETE",
    channel: "pricing:test",
    data: {
      status: "success",
      completedRequests: 1,
      failedRequests: 0,
      results: [
        {
          status: "fulfilled",
          data: {
            success: true,
            data: {
              success: true,
              formatted: {
                journeys: [{ route: "DEL-BLR" }],
                final_price: 9588,
                currency: "INR",
              },
              fare_breakdown: [{ total_journey_price: 9588 }],
              pricing: {
                old_price: 0,
                new_price: 9688,
              },
            },
          },
        },
      ],
    },
  };

  const pricingPayload = extractFlightPricingPayload(payload);

  assert.equal(isFlightPricingResult(payload), true);
  assert.equal(hasFlightPricingPayload(payload), true);
  assert.equal(pricingPayload?.formatted?.final_price, 9588);
  assert.equal(pricingPayload?.pricing?.new_price, 9688);
  assert.equal(pricingPayload?.formatted?.currency, "INR");
});

test("does not extract pricing from completed event without fulfilled pricing result", () => {
  const payload = {
    type: "FLIGHT_V2_PRICING_COMPLETE",
    channel: "pricing:test",
    data: {
      status: "success",
      completedRequests: 1,
      failedRequests: 0,
      results: [
        {
          status: "rejected",
          data: {
            success: false,
            data: {
              formatted: null,
              fare_breakdown: [],
            },
          },
        },
      ],
    },
  };

  assert.equal(isFlightPricingResult(payload), true);
  assert.equal(hasFlightPricingPayload(payload), false);
  assert.equal(extractFlightPricingPayload(payload), null);
});

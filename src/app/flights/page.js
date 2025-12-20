"use client";
import OnewayFlightBooking from "./components/onewayTrip/OnewayFlightBooking";
import RoundTrip from "./components/roundTrip/RoundTrip";
import { useTripType } from "./TripTypeContext";

const page = () => {
  const { tripType } = useTripType();
  if (!tripType) return null;
  return (
    <>
      {tripType === "oneway" && (
        <>
          <OnewayFlightBooking />
        </>
      )}
      {tripType === "round" && (
        <>
          <RoundTrip />
        </>
      )}
      {tripType === "multi" && (
        <>
          {/* yaha multi component aega multi booking component */}
          multitrip
        </>
      )}
    </>
  );
};

export default page;

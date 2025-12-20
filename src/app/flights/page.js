"use client";
import FlightBooking from "../flightBookings/components/FlightBooking/FlightBooking";
import RoundTrip from "./components/roundTrip/RoundTrip";
import { useTripType } from "./TripTypeContext";

const page = () => {
  const { tripType } = useTripType();
  if (!tripType) return null;
  return (
    <>
      {tripType === "oneway" && <FlightBooking />}
      {tripType === "round" && (
        <>
          {/* yaha roundtrip component aega roundtrip booking component */}
          <RoundTrip/>
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

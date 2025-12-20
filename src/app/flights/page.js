"use client";
import FlightBooking from "../flightBookings/components/FlightBooking/FlightBooking";
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
          roundtrip
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

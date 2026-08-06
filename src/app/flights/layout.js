import { Suspense } from "react";
import FlightsLayoutClient from "./FlightsLayoutClient";

export default function FlightsLayout({ children }) {
  return (
    <Suspense fallback={null}>
      <FlightsLayoutClient>{children}</FlightsLayoutClient>
    </Suspense>
  );
}

import { Suspense } from "react";
import FlightsPageClient from "./FlightsPageClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <FlightsPageClient />
    </Suspense>
  );
}

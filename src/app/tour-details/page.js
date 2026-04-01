import { Suspense } from "react";
import TourDetailsClient from "./TourDetailsClient";
import styles from "./page.module.css";
import CustomLoaderHomePage from "@/shared/components/CustomLoaderHomePage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div>
          <CustomLoaderHomePage />
        </div>
      }
    >
      <TourDetailsClient />
    </Suspense>
  );
}

import { Suspense } from "react";
import ProfileClient from "./ProfileClient";
import CustomLoaderHomePage from "@/shared/components/CustomLoaderHomePage";

export default function ProfilePage() {
  return (
    <Suspense fallback={<CustomLoaderHomePage />}>
      <ProfileClient />
    </Suspense>
  );
}

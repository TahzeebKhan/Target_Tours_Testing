import { Suspense } from "react";
import ProfileClient from "./ProfileClient";
import CustomLoaderHomePage from "../components/CustomLoaderHomePage";

export default function ProfilePage() {
  return (
    <Suspense fallback={<CustomLoaderHomePage />}>
      <ProfileClient />
    </Suspense>
  );
}

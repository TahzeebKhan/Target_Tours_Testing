import ProfileSection from "./ProfileSection";
import PaymentMethod from "./PaymentMethod";
import ChoosePaymentMethod from "./ChoosePaymentMethod";
import EmptyTrip from "./EmptyTrip";
import Reservations from "./Reservations";

export default function ProfilePage() {
  return (
    <main>
      <ProfileSection />
      <PaymentMethod />
      <ChoosePaymentMethod />
      <EmptyTrip />
      <Reservations />
    </main>
  );
}

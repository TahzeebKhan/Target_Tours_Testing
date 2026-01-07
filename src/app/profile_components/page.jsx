import ProfileSection from "./ProfileSection";
import PaymentMethod from "./PaymentMethod";
import ChoosePaymentMethod from "./ChoosePaymentMethod";
import EmptyTrip from "./EmptyTrip";
import Reservations from "./Reservations";
import Wishlist from "./Wishlist";

export default function ProfilePage() {
  return (
    <main>
      <ProfileSection />
      <PaymentMethod />
      <ChoosePaymentMethod />
      <EmptyTrip />
      <Reservations />
      <Wishlist />
    </main>
  );
}

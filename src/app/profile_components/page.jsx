import ProfileSection from "./ProfileSection";
import PaymentMethod from "./PaymentMethod";
import ChoosePaymentMethod from "./ChoosePaymentMethod";

export default function ProfilePage() {
  return (
    <main>
      <ProfileSection />
      <PaymentMethod />
      <ChoosePaymentMethod />
    </main>
  );
}

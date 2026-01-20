import Plane from "../flightBookingDetails/mobileViewComponents/seatingDetailsMobileView/plane";
import Mobile_footer from "../flightBookingDetails/mobileViewComponents/seatingDetailsMobileView/Mobile_footer";
import PriceSummary from "./PriceSummary";
import BelowPlane from "../flightBookingDetails/mobileViewComponents/seatingDetailsMobileView/below_plane";
import MobileFareComparisonModal from "../flights/components/onewayTrip/expendableTabs/MobileFareComparisonModal";
import SelectDestination from "./selectDestination";
import SelectTravellerProfile from "./selectTravellerProfile";
import SelectPreferences from "./selectPreferences";
import MobileItinerary from "./MobileItinerary";
import SelectPlan from "./SelectPlan";
import TravellerDetails from "./TravellerDetails";
import AddTravellerDetails from "./AddTravellerDetails";
import AddDetails from "./AddDetails";
import ActiveReservations from "./ActiveReservations";
import Reservations from "../profile/components/reservations/Reservations";
import IndividualProperty from "../profile/components/individualProperty/IndividualProperty";
import BookingDetails from "./BookingDetails";

export default function ProfilePage() {

  return (
    <main>
      <ActiveReservations />
      {/* <BookingDetails /> */}
    </main>
  );
}

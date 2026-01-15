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

export default function ProfilePage() {

  return (
    <main>
      {/* <PriceSummary /> */}
      <SelectPlan />
      {/* <TravellerDetails /> */}
      {/* <AddTravellerDetails /> */}
    </main>
  );
}

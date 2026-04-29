import { AirlineLogo } from "../../../../utiles/airlines.jsx";

const DEFAULT_LOGO = "/images/Flight.png";

const normalizeAirlineValue = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const normalizeAirlineNameForMatch = (value) =>
  normalizeAirlineValue(value)
    .replace(/airlines?$/g, "")
    .replace(/airways?$/g, "");

const NORMALIZED_AIRLINE_LOGOS = Object.entries(AirlineLogo).reduce(
  (acc, [airlineName, airlineLogo]) => {
    acc[normalizeAirlineNameForMatch(airlineName)] = airlineLogo;
    return acc;
  },
  {}
);

export const resolveAirlineLogo = ({ name } = {}) => {
  const normalizedName = normalizeAirlineNameForMatch(name);

  const directNameMatch = AirlineLogo[name];
  if (directNameMatch) return directNameMatch;

  const exactNameMatch = NORMALIZED_AIRLINE_LOGOS[normalizedName];
  if (exactNameMatch) return exactNameMatch;

  const partialNameMatch = Object.entries(NORMALIZED_AIRLINE_LOGOS).find(
    ([airlineName]) => airlineName && normalizedName.includes(airlineName)
  );

  return partialNameMatch?.[1] || DEFAULT_LOGO;
};

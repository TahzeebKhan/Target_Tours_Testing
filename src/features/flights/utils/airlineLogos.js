import { AirlineLogo, AirlineLogoList } from "../../../../utiles/airlines.jsx";

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

const AIRLINE_LOGOS_BY_CODE = AirlineLogoList.reduce((acc, airline) => {
  const code = normalizeAirlineValue(airline?.id);
  if (code && airline?.logo) {
    acc[code] = airline.logo;
  }

  return acc;
}, {});

export const resolveAirlineLogo = ({ name, code, logo } = {}) => {
  const normalizedName = normalizeAirlineNameForMatch(name);
  const normalizedCode = normalizeAirlineValue(code).replace(/\d+$/g, "");

  if (AIRLINE_LOGOS_BY_CODE[normalizedCode]) {
    return AIRLINE_LOGOS_BY_CODE[normalizedCode];
  }

  const directNameMatch = AirlineLogo[name];
  if (directNameMatch) return directNameMatch;

  const exactNameMatch = NORMALIZED_AIRLINE_LOGOS[normalizedName];
  if (exactNameMatch) return exactNameMatch;

  const partialNameMatch = Object.entries(NORMALIZED_AIRLINE_LOGOS).find(
    ([airlineName]) => airlineName && normalizedName.includes(airlineName)
  );

  return partialNameMatch?.[1] || logo || DEFAULT_LOGO;
};

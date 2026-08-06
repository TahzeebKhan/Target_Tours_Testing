// utils/formatters.js

export const formatRoleUnderscoreToSpaceSeparated = (role) => {
  if (typeof role !== "string") return "";

  return role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

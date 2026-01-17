import Cookies from "js-cookie";

export const getParsedCookie = (key) => {
  try {
    const value = Cookies.get(key);
    if (!value) return null;

    return JSON.parse(decodeURIComponent(value));
  } catch (error) {
    console.error(`Invalid cookie JSON for key: ${key}`, error);
    return null;
  }
};

import axios from "axios";

export const searchFlights = async (params = {}) => {
  const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/flights/search`);
  console.log("params",params)

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          url.searchParams.append(key, String(item));
        }
      });
      return;
    }

    url.searchParams.set(key, String(value));
  });

  try {
    const response = await axios.get(url.toString(), {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    const backendMessage =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      "";
    const status = error?.response?.status;
    const fallbackMessage =
      status === 500
        ? "Internal server error"
        : `Flight search failed: ${status || "unknown"}`;
    const nextError = new Error(backendMessage || fallbackMessage);
    nextError.status = status;
    throw nextError;
  }
};

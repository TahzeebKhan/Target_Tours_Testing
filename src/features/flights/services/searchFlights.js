import axios from "axios";

const buildFlightsUrl = (path, params = {}) => {
  const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/flights/${path}`);
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

  return url;
};

const extractRefreshTui = (payload) =>
  payload?.TUI ||
  payload?.tui ||
  payload?.data?.TUI ||
  payload?.data?.tui ||
  "";

const withRefreshTui = (searchPayload, refreshPayload) => {
  const refreshTui = extractRefreshTui(refreshPayload);
  if (!refreshTui) return searchPayload;

  const nextPayload =
    searchPayload && typeof searchPayload === "object"
      ? { ...searchPayload }
      : { data: searchPayload };

  nextPayload.TUI = refreshTui;
  nextPayload.tui = refreshTui;

  if (
    nextPayload.data &&
    typeof nextPayload.data === "object" &&
    !Array.isArray(nextPayload.data)
  ) {
    nextPayload.data = {
      ...nextPayload.data,
      TUI: refreshTui,
      tui: refreshTui,
    };
  }

  return nextPayload;
};

export const searchFlights = async (params = {}) => {
  const searchUrl = buildFlightsUrl("search", params);
  const refreshTuiUrl = buildFlightsUrl("get-refresh-tui", params);

  try {
    const requestOptions = {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    };
    const [searchResponse, refreshTuiResponse] = await Promise.all([
      axios.get(searchUrl.toString(), requestOptions),
      axios.get(refreshTuiUrl.toString(), requestOptions),
    ]);

    return withRefreshTui(searchResponse.data, refreshTuiResponse.data);
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

import axios from "axios";

export const fetchDatewiseFare = async (params = {}) => {
  const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/flights/datewise-fare`);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, String(value));
  });

  const response = await axios.get(url.toString(), {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

export const fetchWhyChooseUsPublic = async () => {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337";
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const query = new URLSearchParams({ domain });

  const response = await fetch(
    `${backendUrl}/api/why-choose-us/public?${query.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || data?.message || "Failed to fetch why choose us"
    );
  }

  return data;
};

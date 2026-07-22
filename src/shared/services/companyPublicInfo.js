export const fetchCompanyPublicInfo = async () => {
  const domain = process.env.NEXT_PUBLIC_DOMAIN;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const query = new URLSearchParams({
    domain: domain || "localhost:1337",
  });

  const response = await fetch(
    `${backendUrl}/api/company-details/public-info?${query.toString()}`,
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
      data?.error?.message || data?.message || "Failed to fetch company public info"
    );
  }

  return data;
};

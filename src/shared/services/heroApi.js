export const getHeroSection = async () => {
    const token = document.cookie
        .split("; ")
        .find(row => row.startsWith("auth_token="))
        ?.split("=")[1];

    const headers = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const query = new URLSearchParams({
        domain: process.env.NEXT_PUBLIC_DOMAIN,
      }).toString();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hero-section/company?${query}`,
    
        {
            method: "GET",
            headers,
            credentials: "include",
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch hero section");
    }

    return res.json();
};

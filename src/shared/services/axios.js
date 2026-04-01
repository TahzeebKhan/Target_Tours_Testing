import axios from "axios";

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
    withCredentials: true, // 👈 cookie support
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * 🔐 Attach token before every request
 */
api.interceptors.request.use(
    (config) => {
        if (typeof document !== "undefined") {
            const token = document.cookie
                .split("; ")
                .find(row => row.startsWith("auth_token="))
                ?.split("=")[1];

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;

"use client";

const GOOGLE_AUTH_ENDPOINT = "/api/frontend-user/google-auth-config";
const GOOGLE_LOGIN_ENDPOINT = "/api/frontend-user/google-login";
const GOOGLE_AUTH_TIMEOUT_MS = 120000;

const getFrontendDomain = () => {
  if (process.env.NEXT_PUBLIC_DOMAIN) {
    return process.env.NEXT_PUBLIC_DOMAIN;
  }

  if (typeof window !== "undefined") {
    return window.location.host;
  }

  return "";
};

const getGoogleClientId = (config = {}) =>
  config.web_client_id ||
  config.client_id ||
  config.google_client_id ||
  config?.data?.web_client_id ||
  config?.data?.client_id ||
  config?.data?.google_client_id;

const createRandomValue = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
};

const buildGoogleAuthUrl = ({ clientId, nonce, state }) => {
  const redirectUri =
    typeof window !== "undefined" ? window.location.origin : "";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "id_token",
    scope: "openid email profile",
    prompt: "select_account",
    nonce,
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

const parseAuthParams = (url) => {
  const parsedUrl = new URL(url);
  const hashParams = new URLSearchParams(parsedUrl.hash.replace(/^#/, ""));
  const searchParams = parsedUrl.searchParams;

  return {
    error: hashParams.get("error") || searchParams.get("error"),
    idToken: hashParams.get("id_token") || searchParams.get("id_token"),
    state: hashParams.get("state") || searchParams.get("state"),
  };
};

const waitForGoogleIdToken = ({ authWindow, expectedState }) =>
  new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const timer = window.setInterval(() => {
      if (!authWindow || authWindow.closed) {
        window.clearInterval(timer);
        reject(new Error("Google login was cancelled"));
        return;
      }

      if (Date.now() - startedAt > GOOGLE_AUTH_TIMEOUT_MS) {
        window.clearInterval(timer);
        authWindow.close();
        reject(new Error("Google login timed out"));
        return;
      }

      try {
        if (authWindow.location.origin !== window.location.origin) {
          return;
        }

        const { error, idToken, state } = parseAuthParams(
          authWindow.location.href
        );

        if (error) {
          window.clearInterval(timer);
          authWindow.close();
          reject(new Error(`Google login failed: ${error}`));
          return;
        }

        if (!idToken) {
          return;
        }

        if (state !== expectedState) {
          window.clearInterval(timer);
          authWindow.close();
          reject(new Error("Google login state mismatch"));
          return;
        }

        window.clearInterval(timer);
        authWindow.close();
        resolve(idToken);
      } catch {
        // The popup is still on Google's origin. Keep waiting for redirect.
      }
    }, 500);
  });

const requestJson = async (url, options) => {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.error?.message || data?.message || "Google login failed"
    );
  }

  return data;
};

export const startGoogleLogin = async () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    throw new Error("Backend URL is missing");
  }

  if (typeof window === "undefined") {
    throw new Error("Google login is only available in the browser");
  }

  const authWindow = window.open(
    "",
    "google-login",
    "width=500,height=650,left=100,top=100"
  );

  if (!authWindow) {
    throw new Error("Please allow pop-ups to continue with Google login");
  }

  try {
    const domain = getFrontendDomain();
    const params = new URLSearchParams({ domain });
    const config = await requestJson(
      `${backendUrl}${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`
    );

    const clientId = getGoogleClientId(config);

    if (!clientId) {
      throw new Error("Google client ID is missing");
    }

    const nonce = createRandomValue();
    const state = createRandomValue();
    authWindow.location.href = buildGoogleAuthUrl({ clientId, nonce, state });

    const idToken = await waitForGoogleIdToken({
      authWindow,
      expectedState: state,
    });

    return requestJson(`${backendUrl}${GOOGLE_LOGIN_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: idToken,
        domain,
      }),
    });
  } catch (error) {
    authWindow.close();
    throw error;
  }
};

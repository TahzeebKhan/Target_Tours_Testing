import api from "@/lib/axios";

const normalizeGateway = (gateway) =>
  String(gateway || "phonepe").trim().toLowerCase();

const getPaymentRedirectUrl = () => {
  if (process.env.NEXT_PUBLIC_PAYMENT_REDIRECT_URL) {
    return process.env.NEXT_PUBLIC_PAYMENT_REDIRECT_URL;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/tour-bookings/payment-success`;
  }

  return "";
};

export const createPackageBooking = async (payload) => {
  const paymentGateway = normalizeGateway(
    payload?.payment_gateway || payload?.payment_mode
  );

  const response = await api.post(
    `/api/payment-gateways/${paymentGateway}/pay`,
    {
      ...payload,
      payment_gateway: paymentGateway,
      payment_mode: paymentGateway,
      redirectUrl: payload?.redirectUrl || getPaymentRedirectUrl(),
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response?.data;
};

export const getPaymentGateways = async ({ domain }) => {
  const response = await api.get("/api/payment-gateways", {
    params: { domain },
  });

  return response?.data;
};

export const confirmPackageBooking = async ({
  merchant_order_id,
  booking_contact_info,
}) => {
  const response = await api.post(
    "/api/package-booking",
    {
      merchant_order_id,
      booking_contact_info,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response?.data;
};

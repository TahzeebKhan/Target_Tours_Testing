import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const getBackendUrl = () =>
  String(process.env.NEXT_PUBLIC_BACKEND_URL || "https://sprintsell.com").replace(/\/$/, "");

export async function POST(request, { params }) {
  const body = await request.json().catch(() => ({}));
  const { paymentgateway } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value || "";
  const gateway = encodeURIComponent(String(paymentgateway || "").trim());

  const response = await fetch(`${getBackendUrl()}/api/payment-gateways/${gateway}/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
    body: JSON.stringify({
      ...body,
      payment_gateway: String(paymentgateway || "").trim().toLowerCase(),
      payment_mode: String(paymentgateway || "").trim().toLowerCase(),
    }),
  });
  const text = await response.text();
  const contentType = response.headers.get("content-type") || "application/json";

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": contentType,
    },
  });
}

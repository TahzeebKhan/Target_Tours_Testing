import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const getBackendUrl = () =>
  String(process.env.NEXT_PUBLIC_BACKEND_URL || "https://sprintsell.com").replace(/\/$/, "");

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel") || "";

  if (!channel) {
    return NextResponse.json(
      { message: "Missing channel" },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value || "";
  const url = new URL(`${getBackendUrl()}/api/flights/v2/events`);
  url.searchParams.set("channel", channel);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
    signal: request.signal,
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") || "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

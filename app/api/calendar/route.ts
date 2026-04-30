import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { fetchTodayEvents } from "@/lib/calendar";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session as any).accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let events;
    try {
      events = await fetchTodayEvents((session as any).accessToken);
    } catch (googleError: any) {
      console.error("Google Calendar API error:", googleError);
      return NextResponse.json(
        { error: "Google service unavailable" },
        { status: 503 }
      );
    }

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error("Calendar route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}

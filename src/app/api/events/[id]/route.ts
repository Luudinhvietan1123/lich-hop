import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { google } from "googleapis";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: (session as any).accessToken as string });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const ev = await calendar.events.get({ calendarId: "primary", eventId: id });
    const data = ev.data;
    return NextResponse.json({
      id: data.id,
      summary: data.summary,
      description: data.description,
      start: data.start,
      end: data.end,
      hangoutLink: data.hangoutLink,
      attendees: data.attendees?.length ?? 0,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Cannot fetch event" }, { status: 500 });
  }
}



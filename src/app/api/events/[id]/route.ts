import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as unknown as { accessToken?: string }).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: (session as unknown as { accessToken: string }).accessToken });
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
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Cannot fetch event" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as unknown as { accessToken?: string }).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  // Tìm event trong DB để lấy googleEventId
  const ev = await prisma.event.findUnique({ where: { id } });
  if (!ev) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (ev.startTime < new Date()) {
    return NextResponse.json({ error: "Only future events can be canceled" }, { status: 400 });
  }
  try {
    if (ev.googleEventId) {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: (session as unknown as { accessToken: string }).accessToken });
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });
      await calendar.events.delete({ calendarId: "primary", eventId: ev.googleEventId, sendUpdates: "all" });
    }
    await prisma.event.update({ where: { id }, data: { status: "CANCELED" } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Cancel failed" }, { status: 500 });
  }
}



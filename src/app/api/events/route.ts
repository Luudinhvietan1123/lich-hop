import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// Danh sách người nhận email cố định (theo yêu cầu)
const DANH_SACH_EMAIL_CO_DINH = [
//   "ericspo92@gmail.com",
//   "bvphap.tk@gmail.com",
//   "kyoshu.work@gmail.com",
//   "hieusnow.business@gmail.com",
  "luudinhvietan1123@gmail.com",
];
import { z } from "zod";
import { kiemSoatTanSuat } from "@/lib/rateLimit";
import { toDate } from "date-fns-tz";
import { prisma } from "@/lib/prisma";

type PayloadTaoLich = {
  ten: string;
  viTri: string;
  congTyHoacDuAn: string;
  lienKetX?: string;
  email: string;
  loiNhan?: string;
  batDauISO: string; // ISO string
  ketThucISO: string; // ISO string
  mucTieuCongTy: string; // không còn dùng để lấy email, nhưng giữ để hiển thị mô tả
};

const schema = z.object({
  ten: z.string().min(1),
  viTri: z.string().min(1),
  congTyHoacDuAn: z.string().min(1),
  lienKetX: z.string().url().optional(),
  email: z.string().email(),
  loiNhan: z.string().optional(),
  batDauISO: z.string().min(1),
  ketThucISO: z.string().min(1),
  mucTieuCongTy: z.string().optional().default(""),
  timezone: z.string().default("Asia/Ho_Chi_Minh"),
});

export async function POST(req: NextRequest) {
  // Yêu cầu đăng nhập
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Yeu cau dang nhap" }, { status: 401 });
  }

  // Rate limiting theo IP
  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()) || req.headers.get("x-real-ip") || "unknown";
  const rl = kiemSoatTanSuat(`events:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) return NextResponse.json({ error: "Thu qua nhieu. Thu lai sau." }, { status: 429 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON khong hop le" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const {
    ten,
    viTri,
    congTyHoacDuAn,
    lienKetX,
    email,
    loiNhan,
    batDauISO,
    ketThucISO,
    mucTieuCongTy,
    timezone,
  } = parsed.data;

  const accessToken = (session as any).accessToken as string;
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  // Tập hợp email mời: danh sách công ty + người đặt (loại trùng)
  const danhSachKhachMoi = DANH_SACH_EMAIL_CO_DINH.map((e) => ({ email: e }));

  const moTa = [
    `Organizer: ${ten} (${viTri})`,
    `Company/Project: ${congTyHoacDuAn}`,
    lienKetX ? `X link: ${lienKetX}` : undefined,
    loiNhan ? `Message: ${loiNhan}` : undefined,
    `Contact email: ${email}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
     // Xác thực thời gian theo timezone mong muốn
    const start = toDate(batDauISO, { timeZone: timezone });
    const end = toDate(ketThucISO, { timeZone: timezone });
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return NextResponse.json({ error: "Thoi gian khong hop le" }, { status: 400 });
    }

    const suKien = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      sendNotifications: true,
      sendUpdates: "all",
      requestBody: {
        summary: `Meeting with ${ten}`,
        description: moTa,
        // Gửi theo giờ địa phương UTC+7 (Asia/Ho_Chi_Minh)
        start: { dateTime: batDauISO, timeZone: "Asia/Ho_Chi_Minh" },
        end: { dateTime: ketThucISO, timeZone: "Asia/Ho_Chi_Minh" },
        attendees: danhSachKhachMoi,
        reminders: { useDefault: true },
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      },
    });

    // Lưu vào DB
    await prisma.event.create({
      data: {
        summary: `Meeting with ${ten}`,
        description: moTa,
        organizerName: ten,
        organizerRole: viTri,
        organizerEmail: email,
        company: congTyHoacDuAn,
        startTime: start,
        endTime: end,
        timezone,
        meetLink: suKien.data.hangoutLink || undefined,
      },
    });

    // Gmail sending disabled per request: rely on Google Calendar's own invitations only.
    // Keeping the code block below commented for potential future re-enable.
    // const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    // const meetLink = suKien.data.hangoutLink || (suKien.data.conferenceData as any)?.entryPoints?.[0]?.uri;
    // const tieuDe = `Invitation: ${ten} – ${congTyHoacDuAn}`;
    // const noiDung = [
    //   `Hello,`,
    //   `You are invited to a meeting.`,
    //   `Title: ${tieuDe}`,
    //   `Time (${timezone}): ${batDauISO} → ${ketThucISO}`,
    //   meetLink ? `Google Meet: ${meetLink}` : undefined,
    //   ``,
    //   `Details`,
    //   `-------`,
    //   moTa,
    // ].filter(Boolean).join("\n");
    // const danhSachTo = Array.from(new Set([...danhSachKhachMoi.map(k => k.email), email]));
    // const buildRaw = (toAddr: string) => { /* ... */ };
    // for (const nguoiNhan of danhSachTo) { /* send via Gmail API */ }

    return NextResponse.json({
      id: suKien.data.id,
      htmlLink: suKien.data.htmlLink,
      hangoutLink: suKien.data.hangoutLink,
    });
  } catch (e: any) {
    // Thử trích xuất lỗi chi tiết từ Google API
    const chiTiet = e?.response?.data || e?.errors || e?.message;
    console.error("Google Calendar error:", chiTiet);
    return NextResponse.json({ error: chiTiet || "Loi tao su kien" }, { status: 500 });
  }
}



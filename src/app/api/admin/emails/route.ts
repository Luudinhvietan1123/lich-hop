import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { danhSachCongTy } from "@/config/companyEmails";

let boNhoTame = structuredClone(danhSachCongTy);

export async function GET() {
  return NextResponse.json(boNhoTame);
}

export async function POST(req: NextRequest) {
  const sess = await getServerSession(authOptions);
  if (!sess) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const duLieu = (await req.json()) as typeof boNhoTame;
    if (!Array.isArray(duLieu)) return NextResponse.json({ error: "Invalid" }, { status: 400 });
    boNhoTame = duLieu.map((r) => ({
      congTy: String(r.congTy || "").trim(),
      danhSachEmail: Array.isArray(r.danhSachEmail) ? r.danhSachEmail.filter(Boolean) : [],
    }));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}



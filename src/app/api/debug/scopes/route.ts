import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !(session as unknown as { accessToken?: string }).accessToken) {
    return NextResponse.json({ error: "Chua dang nhap" }, { status: 401 });
  }
  const accessToken = (session as unknown as { accessToken: string }).accessToken;
  const res = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${encodeURIComponent(accessToken)}`);
  type TokenInfo = { scope?: string; audience?: string; email?: string };
  const data: TokenInfo = await res.json();
  return NextResponse.json({ tokeninfo: data });
}




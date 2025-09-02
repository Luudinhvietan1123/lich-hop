import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Lưu access token/refresh token để gọi Google Calendar API
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/gmail.send",
          ].join(" "),
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000;
      }

      // Refresh token nếu hết hạn
      const shouldRefresh = token.accessTokenExpires && Date.now() > (token.accessTokenExpires as number) - 60_000;
      if (shouldRefresh && token.refreshToken) {
        try {
          const params = new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID || "",
            client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
            grant_type: "refresh_token",
            refresh_token: String(token.refreshToken),
          });
          const res = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
          });
          const data = (await res.json()) as any;
          if (!res.ok) throw new Error(JSON.stringify(data));
          token.accessToken = data.access_token;
          token.accessTokenExpires = Date.now() + (data.expires_in ? data.expires_in * 1000 : 3600 * 1000);
          if (data.refresh_token) token.refreshToken = data.refresh_token;
        } catch {
          // Xóa token khi lỗi để buộc login lại
          delete token.accessToken;
          delete token.refreshToken;
          delete token.accessTokenExpires;
        }
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };



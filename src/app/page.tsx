"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const dangNhap = () => signIn("google");
  const dangXuat = () => signOut();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-semibold title-neon">Company meeting scheduler</h1>
        <div className="flex items-center gap-3">
          {status === "authenticated" ? (
            <>
              <span className="text-sm">{session?.user?.email}</span>
              <button className="btn-neon" onClick={dangXuat}>Sign out</button>
            </>
          ) : (
            <button className="btn-neon" onClick={dangNhap}>Sign in with Google</button>
          )}
        </div>
      </div>

      <div className="mt-8">
        {status === "authenticated" ? (
          <div className="flex gap-3">
            <Link href="/schedule" className="btn-neon inline-block">Start scheduling</Link>
            <Link href="/dashboard" className="btn-neon inline-block">View dashboard</Link>
          </div>
        ) : (
          <p>Please sign in to continue.</p>
        )}
      </div>
    </div>
  );
}

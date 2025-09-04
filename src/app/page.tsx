"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const { data: session, status } = useSession();
  const dangNhap = () => signIn("google");
  const dangXuat = () => signOut();

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:py-10 lg:py-16 min-h-screen flex flex-col">
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

      <div className="mt-8 flex-1 flex items-center justify-center">
        {status === "authenticated" ? (
          <div className="flex flex-col items-center text-center gap-5 py-16 sm:py-20">
            <div className="relative" style={{ width: 88, height: 88 }}>
              <Image src="/Logo.png" alt="Logo" fill sizes="88px" style={{ objectFit: 'contain' }} />
            </div>
            <h2 className="text-3xl font-bold title-neon">Company Meeting</h2>
            <p className="opacity-80">Welcome, {session?.user?.email}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
              <Link href="/schedule" className="btn-neon inline-block">Start scheduling</Link>
              <Link href="/dashboard" className="btn-neon inline-block">View dashboard</Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-5 py-16 sm:py-20">
            <div className="relative" style={{ width: 88, height: 88 }}>
              <Image src="/Logo.png" alt="Logo" fill sizes="88px" style={{ objectFit: 'contain' }} />
            </div>
            <h2 className="text-3xl font-bold title-neon">Company Meeting</h2>
            <p className="opacity-80">Please sign in</p>
            <button className="btn-neon" onClick={dangNhap}>Sign in with Google</button>
          </div>
        )}
      </div>
    </div>
  );
}

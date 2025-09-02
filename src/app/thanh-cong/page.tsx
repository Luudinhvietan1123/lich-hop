"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function ThanhCongPage() {
  const params = useSearchParams();
  const id = params.get("id");
  const [ev, setEv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/events/${encodeURIComponent(id)}`);
        const data = await res.json();
        setEv(data);
      } finally {
        setLoading(false);
        // chuyển trang chính sau 8s
        setTimeout(() => {
          window.location.href = "/";
        }, 8000);
      }
    })();
  }, [id]);

  const dateText = (() => {
    if (!ev?.start?.dateTime || !ev?.end?.dateTime) return "";
    const s = new Date(ev.start.dateTime);
    const e = new Date(ev.end.dateTime);
    return `${s.toLocaleString()} - ${e.toLocaleTimeString()}`;
  })();

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:py-10 lg:py-16">
      <div className="card border-l-4" style={{ borderColor: 'var(--primary)' }}>
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--primary)' }}>Meeting created successfully!</h2>
        <p className="mb-4">Your meeting has been created and invitations were sent to all participants.</p>

        <div className="card mb-4">
          <h3 className="font-semibold mb-1">Event details</h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <p className="text-sm mb-2">{dateText}</p>
              <div className="flex gap-3 items-center">
                {ev?.hangoutLink ? (
                  <a className="btn-neon" href={ev.hangoutLink} target="_blank" rel="noreferrer">Join Google Meet</a>
                ) : null}
              </div>
            </>
          )}
        </div>

        <ul className="text-sm space-y-1" style={{ color: 'var(--primary)' }}>
          <li>✓ Invitations sent to {ev?.attendees ?? 0} participants</li>
          <li>✓ Google Meet created automatically</li>
          <li>✓ Reminders configured</li>
          <li>✓ Detailed invitation email sent</li>
        </ul>

        <p className="text-sm mt-4">You will be redirected to the home page shortly…</p>
        <div className="mt-4">
          <div className="flex gap-3 justify-center">
            <Link href="/schedule" className="btn-neon inline-block">Create another</Link>
            <Link href="/" className="btn-neon inline-block">Back to home</Link>
          </div>
        </div>
      </div>
      <div className="pt-6 flex justify-center">
        <div className="relative" style={{ width: 72, height: 72 }}>
          <Image src="/logo.png" alt="Logo" fill sizes="72px" style={{ objectFit: 'contain' }} />
        </div>
      </div>
    </div>
  );
}



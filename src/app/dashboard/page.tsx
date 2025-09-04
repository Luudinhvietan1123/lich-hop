import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import CancelButton from "./CancelButton";
import type { Event } from "@prisma/client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
          <p>Sign in to view your upcoming and past meetings.</p>
          <div className="mt-4">
            <Link href="/" className="btn-neon">Go to home</Link>
          </div>
        </div>
      </div>
    );
  }

  const now = new Date();
  const [upcoming, past, canceled] = await Promise.all([
    prisma.event.findMany({
      where: { startTime: { gte: now }, status: { not: "CANCELED" } },
      orderBy: { startTime: "asc" },
      take: 20,
    }),
    prisma.event.findMany({
      where: { startTime: { lt: now }, status: { not: "CANCELED" } },
      orderBy: { startTime: "desc" },
      take: 20,
    }),
    prisma.event.findMany({ where: { status: "CANCELED" }, orderBy: { startTime: "desc" }, take: 20 }),
  ]);

  const Section = ({ title, items, allowCancel }: { title: string; items: Event[]; allowCancel?: boolean }) => (
    <div className="card">
      <h3 className="font-semibold mb-3 title-neon">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm">No items.</p>
      ) : (
        <div style={{ maxHeight: 280, overflowY: 'auto' }}>
        <ul className="space-y-3">
          {items.map((e) => (
            <li key={e.id} className="border rounded p-3" style={{ background: '#111111', borderColor: '#2a2a2a' }}>
              <div className="flex items-center justify-between gap-3">
                <div className="text-[var(--foreground)]">
                  <div className="font-medium" style={{ color: 'var(--foreground)' }}>{e.summary}</div>
                  <div className="text-sm opacity-80">
                    {new Date(e.startTime).toLocaleString()} → {new Date(e.endTime).toLocaleTimeString()} ({e.timezone})
                  </div>
                  <div className="text-xs opacity-70">Organizer: {e.organizerName} ({e.organizerRole}) — {e.organizerEmail}</div>
                </div>
                <div className="flex items-center gap-2">
                  {e.meetLink ? (
                    new Date(e.startTime) > new Date() ? (
                      <a className="btn-neon whitespace-nowrap" href={e.meetLink} target="_blank" rel="noreferrer">Join</a>
                    ) : (
                      <button className="btn-neon" disabled>Join</button>
                    )
                  ) : null}
                  {allowCancel ? <CancelButton id={e.id} /> : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:py-10 lg:py-16 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold title-neon">Your meetings</h2>
        <Link href="/schedule" className="btn-neon">Schedule a meeting</Link>
      </div>
      <Section title="Upcoming" items={upcoming} allowCancel />
      <Section title="Past" items={past} />
      <Section title="Canceled" items={canceled} />
      <div className="pt-6 flex justify-center">
        <div className="relative" style={{ width: 72, height: 72 }}>
          <Image src="/Logo.png" alt="Logo" fill sizes="72px" style={{ objectFit: 'contain' }} />
        </div>
      </div>
    </div>
  );
}



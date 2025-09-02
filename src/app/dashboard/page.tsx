import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
  const [upcoming, past] = await Promise.all([
    prisma.event.findMany({
      where: { startTime: { gte: now } },
      orderBy: { startTime: "asc" },
      take: 20,
    }),
    prisma.event.findMany({
      where: { startTime: { lt: now } },
      orderBy: { startTime: "desc" },
      take: 20,
    }),
  ]);

  const Section = ({ title, items }: { title: string; items: any[] }) => (
    <div className="card">
      <h3 className="font-semibold mb-3 title-neon">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm">No items.</p>
      ) : (
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
                {e.meetLink ? (
                  <a className="btn-neon whitespace-nowrap" href={e.meetLink} target="_blank" rel="noreferrer">Join</a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold title-neon">Your meetings</h2>
        <Link href="/schedule" className="btn-neon">Schedule a meeting</Link>
      </div>
      <Section title="Upcoming" items={upcoming} />
      <Section title="Past" items={past} />
    </div>
  );
}



import Link from "next/link";
import prisma from "@/lib/prisma";

async function getEvent() {
  try {
    return await prisma.event.findFirst({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      include: {
        ticketTypes: { where: { isActive: true }, orderBy: { order: "asc" } },
        sessions: { orderBy: [{ dayNumber: "asc" }, { order: "asc" }], take: 6 },
      },
    });
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const event = await getEvent();

  const name = event?.name || "Startup Expo 2026";
  const tagline = event?.tagline || "Ideas to Innovation. Innovation to Business.";
  const primary = event?.primaryColor || "#0F172A";
  const secondary = event?.secondaryColor || "#F59E0B";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-bold tracking-tight" style={{ color: primary }}>
            {name}
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <Link href="/about" className="hover:text-slate-900">About</Link>
            <Link href="/agenda" className="hover:text-slate-900">Agenda</Link>
            <Link href="/exhibitors" className="hover:text-slate-900">Exhibitors</Link>
            <Link href="/speakers" className="hover:text-slate-900">Speakers</Link>
            <Link href="/venue" className="hover:text-slate-900">Venue</Link>
          </nav>
          <Link
            href="/register"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-90"
            style={{ backgroundColor: secondary }}
          >
            Register
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden" style={{ backgroundColor: primary }}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-amber-400 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-orange-500 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-amber-300">
              Three-Day Startup Exhibition
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {name}
            </h1>
            <p className="mt-6 text-xl text-slate-300 sm:text-2xl">{tagline}</p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400">
              Showcase products and prototypes. Meet investors and mentors. Generate qualified leads.
              Build partnerships. Turn ideas into business.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center rounded-lg px-6 py-3 text-base font-semibold text-slate-900 shadow-lg transition hover:opacity-95"
                style={{ backgroundColor: secondary }}
              >
                Register Now
              </Link>
              <Link
                href="/agenda"
                className="inline-flex items-center rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-base font-medium text-white backdrop-blur transition hover:bg-white/10"
              >
                View Programme
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Exhibition Zones</h2>
            <p className="mt-3 text-slate-600">
              Six carefully designed zones to help startups, buyers and investors connect with purpose.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Product Showcase", desc: "Physical and digital products on display with live demos." },
              { title: "Technology & Digital", desc: "SaaS, AI, deep-tech and digital service companies." },
              { title: "Business Services", desc: "Legal, finance, marketing and growth support providers." },
              { title: "Ideas & Innovation", desc: "Early-stage concepts, prototypes and student startups." },
              { title: "Investor & Mentor Lounge", desc: "Curated meetings with investors, angels and mentors." },
              { title: "Startup Pitch Arena", desc: "Live pitching competition with expert judges." },
            ].map((zone) => (
              <div
                key={zone.title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-slate-900">{zone.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{zone.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Three-Day Programme</h2>
              <p className="mt-3 text-slate-600">Discover → Connect → Grow</p>
            </div>
            <Link href="/agenda" className="text-sm font-semibold text-amber-600 hover:text-amber-700">
              Full agenda →
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { day: "Day 1", theme: "Discover", desc: "Explore products, services and ideas. Inauguration, booth tours, live demos and founder introductions." },
              { day: "Day 2", theme: "Connect", desc: "Investor meetings, pitch competition, mentor sessions, B2B networking and partnership discussions." },
              { day: "Day 3", theme: "Grow", desc: "Final pitches, product launches, buyer connections, awards and closing ceremony." },
            ].map((d) => (
              <div key={d.day} className="relative rounded-2xl border border-slate-200 bg-white p-8">
                <div className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-900" style={{ backgroundColor: secondary }}>
                  {d.day}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{d.theme}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-900 py-20 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">Ready to join?</h2>
          <p className="mt-4 text-slate-400">
            Whether you are a founder, investor, buyer or student — register now and secure your place.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center rounded-lg px-8 py-3.5 text-base font-semibold text-slate-900 transition hover:opacity-95"
            style={{ backgroundColor: secondary }}
          >
            Register for {name}
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
          <div>
            <p className="font-semibold text-slate-900">{name}</p>
            <p className="mt-1 text-sm text-slate-500">{tagline}</p>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-slate-800">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-800">Terms</Link>
            <Link href="/contact" className="hover:text-slate-800">Contact</Link>
            <Link href="/admin/login" className="hover:text-slate-800">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

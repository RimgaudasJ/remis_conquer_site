import Link from "next/link";
import { demoItems, demoRoom, demoWikiPages } from "@/lib/mock-data";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <section className="panel panel-strong overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.8fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
              <span className="status-dot" />
              Room-based companion app for tabletop sessions
            </div>
            <div className="space-y-4">
              <p className="eyebrow text-cyan-200/70">Command Interface</p>
              <h2 className="max-w-3xl font-display text-4xl uppercase tracking-[0.18em] text-white sm:text-5xl lg:text-6xl">
                Run the table on the board. Track the hidden game here.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Remis Conquer keeps rules, cards, resources, inventories, and shop
                actions off paper without stealing focus from the physical map.
                Each player gets a private screen. The Game Master gets the room
                console.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/join"
                className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                Enter Room
              </Link>
              <Link
                href="/wiki"
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/50 hover:bg-cyan-300/10"
              >
                Open Field Wiki
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="panel rounded-3xl p-5">
              <p className="eyebrow text-xs text-cyan-200/70">Sample Room</p>
              <h3 className="mt-3 font-display text-2xl uppercase tracking-[0.14em] text-white">
                {demoRoom.name}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Player code: <span className="font-display text-cyan-200">{demoRoom.code}</span>
              </p>
              <p className="text-sm leading-7 text-slate-300">
                GM code: <span className="font-display text-amber-300">WARDEN-9</span>
              </p>
            </div>
            <div className="panel rounded-3xl p-5">
              <p className="eyebrow text-xs text-cyan-200/70">Loaded Modules</p>
              <div className="mt-3 grid gap-3 text-sm text-slate-300">
                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                  <span>Wiki entries</span>
                  <span className="font-display text-cyan-100">{demoWikiPages.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                  <span>Shop items</span>
                  <span className="font-display text-cyan-100">{demoItems.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                  <span>Private dashboards</span>
                  <span className="font-display text-cyan-100">Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Wiki",
            body: "Rules, lore, factions, and card references in one mobile-readable archive.",
            href: "/wiki",
          },
          {
            title: "Player Dashboard",
            body: "Each device shows private resources, counters, status effects, and inventory.",
            href: "/dashboard",
          },
          {
            title: "Shop",
            body: "Buy gear and cards with affordability checks and fast, touch-friendly controls.",
            href: "/shop",
          },
        ].map((module) => (
          <Link
            key={module.title}
            href={module.href}
            className="panel rounded-[1.75rem] p-5 transition hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-cyan-300/5"
          >
            <p className="eyebrow text-xs text-cyan-200/70">Module</p>
            <h3 className="mt-3 font-display text-2xl uppercase tracking-[0.12em] text-white">
              {module.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{module.body}</p>
          </Link>
        ))}
      </section>

      <section className="panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-xs text-cyan-200/70">Design Intent</p>
            <h3 className="mt-2 font-display text-3xl uppercase tracking-[0.14em] text-white">
              Built for the table, not for replacing it.
            </h3>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-300">
            This first implementation focuses on a room-based flow, signed device
            sessions, expandable data structures, and a mobile-first control surface.
          </p>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { Chakra_Petch, Sora } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { LeaveRoomForm } from "@/components/leave-room-form";
import { getRoomSession } from "@/lib/session";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const chakra = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Remis Conquer Companion",
  description:
    "A mobile-first companion app for tabletop play, with private player dashboards, a shop, a wiki, and GM controls.",
};

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/78 transition hover:border-cyan-300/60 hover:bg-cyan-300/10 hover:text-white"
    >
      {label}
    </Link>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getRoomSession();

  return (
    <html
      lang="en"
      className={`${sora.variable} ${chakra.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-background text-foreground"
      >
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(91,232,255,0.18),transparent_30%),radial-gradient(circle_at_bottom,rgba(127,86,217,0.18),transparent_25%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
          <header className="relative z-10 border-b border-white/10 bg-slate-950/75 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between gap-4">
                <Link href="/" className="space-y-1">
                  <p className="font-display text-xs uppercase tracking-[0.35em] text-cyan-200/80">
                    Table Companion
                  </p>
                  <h1 className="font-display text-xl uppercase tracking-[0.2em] text-white sm:text-2xl">
                    Remis Conquer
                  </h1>
                </Link>
                {session ? (
                  <div className="hidden items-center gap-3 sm:flex">
                    <div className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-right text-xs text-cyan-50">
                      <div className="font-display uppercase tracking-[0.2em] text-cyan-200">
                        {session.role === "gm" ? "Game Master" : session.playerName}
                      </div>
                      <div className="text-white/60">Room {session.roomCode}</div>
                    </div>
                    <LeaveRoomForm />
                  </div>
                ) : null}
              </div>
              <nav className="flex flex-wrap gap-2">
                <NavLink href="/wiki" label="Wiki" />
                <NavLink href="/join" label="Join Room" />
                <NavLink href="/dashboard" label="Player Dashboard" />
                <NavLink href="/shop" label="Shop" />
                <NavLink href="/gm" label="GM Console" />
              </nav>
            </div>
          </header>
          <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

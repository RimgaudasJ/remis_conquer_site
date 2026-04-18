import Link from "next/link";
import { PlayerDashboardClient } from "@/components/player-dashboard-client";
import { getNotionUnits, getNotionSpells } from "@/lib/notion";
import { getPlayerById } from "@/lib/room-store";
import { getRoomSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getRoomSession();
  const player = session?.playerId ? getPlayerById(session.playerId) : null;

  if (!session || session.role !== "player" || !player) {
    return (
      <section className="panel rounded-[2rem] p-6 sm:p-8">
        <p className="eyebrow text-xs text-cyan-200/70">Player Dashboard</p>
        <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.16em] text-white">
          No player session on this device.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-300 sm:text-base">
          Join with a room code and player name first. Player dashboards remain private
          per device, so this route only opens for the signed-in room participant.
        </p>
        <Link
          href="/join"
          className="mt-6 inline-flex rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
        >
          Go to Join Room
        </Link>
      </section>
    );
  }

  const [units, spells] = await Promise.all([getNotionUnits(), getNotionSpells()]);

  return (
    <div className="space-y-6">
      <section className="panel rounded-[2rem] p-6">
        <p className="eyebrow text-xs text-cyan-200/70">Inventory Pages</p>
        <h2 className="mt-2 font-display text-3xl uppercase tracking-[0.14em] text-white">
          Manage Units and Spells
        </h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/dashboard/units"
            className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-5 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/55 hover:bg-cyan-300/20"
          >
            User Units
          </Link>
          <Link
            href="/dashboard/spells"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/55 hover:bg-cyan-300/20"
          >
            User Spells
          </Link>
        </div>
      </section>
      <PlayerDashboardClient player={player} availableUnits={units} availableSpells={spells} />
    </div>
  );
}
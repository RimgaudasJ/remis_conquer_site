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

  return <PlayerDashboardClient player={player} availableUnits={units} availableSpells={spells} />;
}
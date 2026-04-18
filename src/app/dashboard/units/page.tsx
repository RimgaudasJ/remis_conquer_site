import Link from "next/link";
import { UserUnitsClient } from "@/components/user-units-client";
import { getNotionUnits } from "@/lib/notion";
import { getPlayerOwnedUnits } from "@/lib/room-store";
import { getRoomSession } from "@/lib/session";

export default async function DashboardUnitsPage() {
  const session = await getRoomSession();

  if (!session || session.role !== "player" || !session.playerId) {
    return (
      <section className="panel rounded-[2rem] p-6 sm:p-8">
        <p className="eyebrow text-xs text-cyan-200/70">Units Inventory</p>
        <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.16em] text-white">
          Join as a player first.
        </h2>
        <Link
          href="/join"
          className="mt-6 inline-flex rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
        >
          Go to Join Room
        </Link>
      </section>
    );
  }

  const units = getPlayerOwnedUnits(session.playerId);
  const availableUnits = await getNotionUnits();

  return <UserUnitsClient initialUnits={units} availableUnits={availableUnits} />;
}

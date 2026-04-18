import Link from "next/link";
import { UserSpellsClient } from "@/components/user-spells-client";
import { getNotionSpells } from "@/lib/notion";
import { getPlayerOwnedSpellIds } from "@/lib/room-store";
import { getRoomSession } from "@/lib/session";

export default async function DashboardSpellsPage() {
  const session = await getRoomSession();

  if (!session || session.role !== "player" || !session.playerId) {
    return (
      <section className="panel rounded-[2rem] p-6 sm:p-8">
        <p className="eyebrow text-xs text-cyan-200/70">Spells Inventory</p>
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

  const [spells, ownedSpellIds] = await Promise.all([
    getNotionSpells(),
    Promise.resolve(getPlayerOwnedSpellIds(session.playerId)),
  ]);
  const ownedIdSet = new Set(ownedSpellIds);
  const ownedSpells = spells.filter((spell) => ownedIdSet.has(spell.id));

  return <UserSpellsClient spells={ownedSpells} />;
}

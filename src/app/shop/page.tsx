import Link from "next/link";
import { Shop } from "@/components/Shop";
import { getNotionUnits } from "@/lib/notion";
import {
  getAvailableRoomUnitsForDay,
  getPlayerById,
  getPlayerOwnedUnits,
  getRoomDay,
} from "@/lib/room-store";
import { getRoomSession } from "@/lib/session";
import { getDailySeededSelection } from "@/lib/shop-selection";

const SHOP_SLOTS = 5;

export default async function ShopPage() {
  const session = await getRoomSession();
  const player = session?.playerId ? getPlayerById(session.playerId) : null;

  if (!session || session.role !== "player" || !player) {
    return (
      <section className="panel rounded-[2rem] p-6 sm:p-8">
        <p className="eyebrow text-xs text-cyan-200/70">Shop Access</p>
        <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.16em] text-white">
          Join as a player to buy gear.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-300 sm:text-base">
          Shop purchases are scoped to the current player session. Players can only see
          and buy for their own inventory.
        </p>
        <Link
          href="/join"
          className="mt-6 inline-flex rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
        >
          Enter room first
        </Link>
      </section>
    );
  }

  const notionUnits = await getNotionUnits();
  const roomDay = getRoomDay(session.roomId);
  const availableUnits = getAvailableRoomUnitsForDay(session.roomId, notionUnits);
  const units = getDailySeededSelection(`${session.roomId}:${roomDay}`, availableUnits, SHOP_SLOTS);
  const ownedUnitSourceIds = session.playerId
    ? getPlayerOwnedUnits(session.playerId).map((unit) => unit.sourceUnitId)
    : [];

  return (
    <Shop
      player={player}
      units={units}
      day={roomDay}
      ownedUnitSourceIds={ownedUnitSourceIds}
    />
  );
}
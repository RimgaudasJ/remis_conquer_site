import Link from "next/link";
import { ShopClient } from "@/components/shop-client";
import { demoItems, getPlayerById } from "@/lib/mock-data";
import { getRoomSession } from "@/lib/session";

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

  return <ShopClient player={player} items={demoItems} />;
}
"use client";

import { usePlayerState } from "@/lib/player-state";
import { canAfford, formatCost, type ItemSeed, type PlayerSeed } from "@/lib/mock-data";

export function ShopClient({ player, items }: { player: PlayerSeed; items: ItemSeed[] }) {
  const { state, buyItem, lastPurchase } = usePlayerState(player);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <aside className="panel rounded-[2rem] p-6">
        <p className="eyebrow text-xs text-cyan-200/70">Purchasing Pool</p>
        <h2 className="mt-2 font-display text-3xl uppercase tracking-[0.14em] text-white">
          {player.name}
        </h2>
        <div className="mt-5 grid gap-3">
          {Object.entries(state.resources).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200">
              <span className="capitalize">{label}</span>
              <span className="font-display text-lg uppercase tracking-[0.14em] text-white">
                {value}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-[1.5rem] border border-cyan-300/15 bg-cyan-300/10 p-4 text-sm leading-7 text-cyan-50">
          {lastPurchase
            ? `${lastPurchase} added to local inventory.`
            : "Buy actions update local player state immediately on this device."}
        </div>
      </aside>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const affordable = canAfford(state.resources, item.cost);

          return (
            <article key={item.id} className="panel rounded-[1.75rem] p-5">
              <p className="eyebrow text-xs text-cyan-200/70">Shop Stock</p>
              <h3 className="mt-3 font-display text-2xl uppercase tracking-[0.12em] text-white">
                {item.name}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
              <p className="mt-3 text-sm leading-7 text-cyan-50">{item.effects}</p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                {formatCost(item.cost)}
              </div>
              <button
                type="button"
                onClick={() => buyItem(item)}
                disabled={!affordable}
                className="mt-5 touch-button w-full rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/40 disabled:hover:bg-white/5"
                style={{
                  background: affordable ? "rgb(103 232 249 / 0.92)" : undefined,
                  color: affordable ? "rgb(8 15 23)" : undefined,
                }}
              >
                {affordable ? "Buy item" : "Insufficient resources"}
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}
"use client";

import { usePlayerState } from "@/lib/player-state";
import {
  formatCost,
  getItemById,
  type PlayerSeed,
  type ResourceKey,
} from "@/lib/mock-data";

function ResourceCard({
  label,
  value,
  onAdjust,
}: {
  label: ResourceKey;
  value: number;
  onAdjust: (delta: number) => void;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <p className="eyebrow text-xs text-cyan-200/65">{label}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="font-display text-3xl uppercase tracking-[0.12em] text-white">
          {value}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAdjust(-1)}
            className="touch-button rounded-full border border-white/10 bg-slate-950/70 px-3 text-lg text-white transition hover:border-cyan-300/45 hover:text-cyan-100"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => onAdjust(1)}
            className="touch-button rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 text-lg text-cyan-100 transition hover:bg-cyan-300/20"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export function PlayerDashboardClient({ player }: { player: PlayerSeed }) {
  const { state, adjustCounter, adjustResource, reset } = usePlayerState(player);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="panel rounded-[2rem] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-xs text-cyan-200/70">Private View</p>
            <h2 className="mt-2 font-display text-3xl uppercase tracking-[0.14em] text-white">
              {player.name}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Device-local state is enabled for this player session. The UI is ready for
              a Prisma-backed persistence layer next.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/75 transition hover:border-white/20 hover:bg-white/10"
          >
            Reset local state
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {(Object.entries(state.resources) as [ResourceKey, number][]).map(([key, value]) => (
            <ResourceCard
              key={key}
              label={key}
              value={value}
              onAdjust={(delta) => adjustResource(key, delta)}
            />
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <p className="eyebrow text-xs text-cyan-200/70">Abilities</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {player.abilities.map((ability) => (
                <span
                  key={ability}
                  className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-2 text-sm text-cyan-50"
                >
                  {ability}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <p className="eyebrow text-xs text-cyan-200/70">Status Effects</p>
            <div className="mt-4 grid gap-3">
              {state.statuses.map((status) => (
                <div key={status.id} className="rounded-2xl bg-slate-950/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span className="status-dot" />
                    {status.label}
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{status.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6">
        <section className="panel rounded-[2rem] p-6">
          <p className="eyebrow text-xs text-cyan-200/70">Counters</p>
          <div className="mt-4 grid gap-4">
            {state.counters.map((counter) => (
              <div
                key={counter.id}
                className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
              >
                <div>
                  <p className="text-sm text-slate-300">{counter.label}</p>
                  <p className="font-display text-3xl uppercase tracking-[0.12em] text-white">
                    {counter.value}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => adjustCounter(counter.id, -1)}
                    className="touch-button rounded-full border border-white/10 bg-slate-950/70 px-4 text-lg text-white transition hover:border-cyan-300/45 hover:text-cyan-100"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustCounter(counter.id, 1)}
                    className="touch-button rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 text-lg text-cyan-100 transition hover:bg-cyan-300/20"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-xs text-cyan-200/70">Inventory</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">Synced to this device.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {state.inventory.map((entry) => {
              const item = getItemById(entry.itemId);

              if (!item) {
                return null;
              }

              return (
                <div key={entry.itemId} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-xl uppercase tracking-[0.1em] text-white">
                        {item.name}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-300">{item.description}</p>
                    </div>
                    <span className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-2 text-sm text-cyan-50">
                      x{entry.quantity}
                    </span>
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                    Cost profile: {formatCost(item.cost)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
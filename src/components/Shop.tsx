"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { advanceSharedShopDayAction, buyUnitFromSharedShopAction } from "@/app/actions/shop";
import type { PlayerSeed } from "@/lib/mock-data";
import { usePlayerState } from "@/lib/player-state";
import type { UnitSeed } from "@/lib/notion";

export function Shop({
  player,
  units,
  day,
  ownedUnitSourceIds,
}: {
  player: PlayerSeed;
  units: UnitSeed[];
  day: number;
  ownedUnitSourceIds: string[];
}) {
  const { state, adjustResource, lastPurchase } = usePlayerState(player);
  const router = useRouter();
  const [brokenImages, setBrokenImages] = useState<Record<string, true>>({});
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const ownedSet = new Set(ownedUnitSourceIds);

  function onBuy(unit: UnitSeed) {
    const goldCost = Math.max(0, unit.cost.gold);

    if (ownedSet.has(unit.id)) {
      setStatusMessage("You already own this unit.");
      return;
    }

    if (state.resources.gold < goldCost) {
      setStatusMessage("Insufficient gold.");
      return;
    }

    startTransition(async () => {
      const result = await buyUnitFromSharedShopAction(unit.id);
      setStatusMessage(result.message);

      if (result.ok) {
        adjustResource("gold", -goldCost);
        router.refresh();
      }
    });
  }

  function onNextDay() {
    startTransition(async () => {
      const result = await advanceSharedShopDayAction();
      setStatusMessage(result.message);

      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="panel flex flex-wrap items-center justify-between gap-4 rounded-[1.8rem] p-5">
        <div>
          <p className="eyebrow text-xs text-cyan-200/70">Shop Day</p>
          <h2 className="mt-1 font-display text-3xl uppercase tracking-[0.14em] text-white">
            Day {day}
          </h2>
        </div>
        <button
          type="button"
          onClick={onNextDay}
          disabled={isPending}
          className="touch-button rounded-full border border-cyan-300/25 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/55 hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Processing..." : "Next Day"}
        </button>
      </section>

      <div className="flex gap-6 items-start">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="panel sticky top-6 flex w-52 shrink-0 flex-col gap-4 rounded-[2rem] p-5">
        <p className="eyebrow text-[10px] text-cyan-200/50">Draft Shop</p>

        {/* Gold */}
        <div className="flex items-center gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3">
          <span aria-hidden className="text-xl leading-none">🪙</span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-amber-300/70">Gold</p>
            <p className="font-display text-2xl uppercase tracking-[0.1em] text-amber-200">
              {state.resources.gold}
            </p>
          </div>
        </div>

        {/* Available offers */}
        <div
          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors duration-500 ${
            units.length === 0
              ? "border-red-500/40 bg-red-500/10"
              : "border-white/10 bg-white/5"
          }`}
        >
          <span aria-hidden className="text-xl leading-none">
            {units.length === 0 ? "⚠️" : "🎴"}
          </span>
          <div>
            <p
              className={`text-[10px] uppercase tracking-[0.22em] ${
                units.length === 0 ? "text-red-400/80" : "text-slate-400"
              }`}
            >
              Offers Left
            </p>
            <p
              className={`font-display text-2xl uppercase tracking-[0.1em] ${
                units.length === 0 ? "text-red-400" : "text-white"
              }`}
            >
              {units.length}
            </p>
          </div>
        </div>

        {/* Status hint */}
        <p className="text-[11px] leading-5 text-slate-500">
          {statusMessage ||
            (lastPurchase
              ? `${lastPurchase} recruited.`
              : "Buying a card removes it globally for all players until next day.")}
        </p>
      </aside>

      {/* ── Unit grid ───────────────────────────────────────────────── */}
      <section className="grid min-w-0 flex-1 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {units.length === 0 ? (
          <article className="col-span-full flex min-h-[20rem] flex-col items-center justify-center rounded-[1.8rem] border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 font-display text-2xl text-white/20">
              ✦
            </div>
            <p className="eyebrow text-xs text-slate-600">No Units Available</p>
            <p className="mt-2 text-xs text-slate-600">Start the next day to refresh this shared pool.</p>
          </article>
        ) : (
          units.map((unit) => {
          const goldCost = Math.max(0, unit.cost.gold);
          const affordable = state.resources.gold >= goldCost;
          const alreadyOwned = ownedSet.has(unit.id);
          const imageMissing = !unit.imageUrl || brokenImages[unit.id];

          return (
            <article
              key={unit.id}
              className={`group flex flex-col overflow-hidden rounded-[1.8rem] border transition-all duration-300 ${
                affordable && !alreadyOwned
                  ? "border-[#D4AF37]/30 bg-gradient-to-b from-white/[0.07] to-slate-900/80 shadow-[0_6px_28px_rgba(2,8,23,0.45)] hover:-translate-y-1.5 hover:scale-[1.015] hover:border-[#D4AF37]/65 hover:shadow-[0_0_32px_rgba(212,175,55,0.14),0_28px_52px_rgba(2,8,23,0.6)]"
                  : "border-white/10 bg-gradient-to-b from-white/[0.02] to-slate-900/80 opacity-55 saturate-0"
              }`}
            >
              {/* ── Image frame ── */}
              <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden border-b border-white/[0.07] bg-slate-950/70 shadow-[inset_0_0_20px_rgba(0,0,0,0.7)]">
                {!imageMissing ? (
                  // Notion image hosts are dynamic; img avoids remotePatterns churn.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={unit.imageUrl ?? ""}
                    alt={unit.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => setBrokenImages((prev) => ({ ...prev, [unit.id]: true }))}
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-800/40 via-slate-900 to-slate-950">
                    <span className="font-display text-5xl uppercase tracking-[0.25em] text-white/15">
                      {unit.name.slice(0, 2)}
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.4em] text-white/10">No Artwork</span>
                  </div>
                )}

                {/* Stat bar pinned to bottom of image */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-around bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent px-4 pb-3 pt-8">
                  <div className="flex items-center gap-1">
                    <span className="text-xs leading-none text-red-400">♥</span>
                    <span className="font-display text-[11px] font-bold tracking-wide text-red-300">
                      {unit.stats.hp}
                    </span>
                  </div>
                  <div className="h-3 w-px bg-white/20" />
                  <div className="flex items-center gap-1">
                    <span className="text-xs leading-none text-orange-400">◆</span>
                    <span className="font-display text-[11px] font-bold tracking-wide text-orange-300">
                      {unit.stats.damage}
                    </span>
                  </div>
                  <div className="h-3 w-px bg-white/20" />
                  <div className="flex items-center gap-1">
                    <span className="text-xs leading-none text-blue-400">◈</span>
                    <span className="font-display text-[11px] font-bold tracking-wide text-blue-300">
                      {unit.stats.speed}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Card body ── */}
              <div className="flex flex-1 flex-col p-5">
                {/* Title + price badge */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg font-bold uppercase leading-tight tracking-[0.1em] text-white">
                    {unit.name}
                  </h3>
                  <div className="flex shrink-0 items-center gap-1 rounded-full border border-amber-400/35 bg-amber-400/10 px-2.5 py-1">
                    <span aria-hidden className="text-xs leading-none">🪙</span>
                    <span className="font-display text-sm font-bold tracking-[0.1em] text-amber-300">
                      {goldCost}
                    </span>
                  </div>
                </div>

                {/* Effects text */}
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-400">{unit.effects}</p>

                {/* Recruit button — hidden (opacity 0, non-interactive) when card is locked */}
                <button
                  type="button"
                  onClick={() => onBuy(unit)}
                  disabled={!affordable || alreadyOwned || isPending}
                  className="touch-button mt-4 w-full rounded-full bg-gradient-to-b from-amber-300 to-amber-500 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-slate-950 shadow-[0_4px_18px_rgba(212,175,55,0.32)] transition-all duration-150 active:translate-y-px active:shadow-none disabled:pointer-events-none disabled:opacity-0"
                >
                  {alreadyOwned ? "Already Owned" : "Recruit Unit"}
                </button>
              </div>
            </article>
          );
        }))}
      </section>
    </div>
    </div>
  );
}

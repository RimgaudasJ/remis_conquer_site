"use client";

import { useState } from "react";
import { usePlayerState } from "@/lib/player-state";
import type { PlayerSeed } from "@/lib/mock-data";
import type { UnitSeed, SpellSeed } from "@/lib/notion";

export function PlayerDashboardClient({
  player,
  availableUnits,
  availableSpells,
}: {
  player: PlayerSeed;
  availableUnits: UnitSeed[];
  availableSpells: SpellSeed[];
}) {
  const { state, adjustResource } = usePlayerState(player);
  const [ownedUnits, setOwnedUnits] = useState<UnitSeed[]>([]);
  const [ownedSpells, setOwnedSpells] = useState<SpellSeed[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [selectedSpellId, setSelectedSpellId] = useState<string>("");

  function addUnit() {
    if (!selectedUnitId) return;
    const unit = availableUnits.find((u) => u.id === selectedUnitId);
    if (unit && !ownedUnits.find((u) => u.id === unit.id)) {
      setOwnedUnits([...ownedUnits, unit]);
      setSelectedUnitId("");
    }
  }

  function addSpell() {
    if (!selectedSpellId) return;
    const spell = availableSpells.find((s) => s.id === selectedSpellId);
    if (spell && !ownedSpells.find((s) => s.id === spell.id)) {
      setOwnedSpells([...ownedSpells, spell]);
      setSelectedSpellId("");
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ── Header + Gold ── */}
      <section className="panel rounded-[2rem] p-6">
        <p className="eyebrow text-xs text-cyan-200/70">{player.name}</p>
        <div className="mt-4 flex items-center justify-between">
          <h2 className="font-display text-3xl uppercase tracking-[0.14em] text-white">
            Player Dashboard
          </h2>
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-6 py-3">
            <div className="flex items-center gap-3">
              <span aria-hidden className="text-2xl leading-none">
                🪙
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-amber-300/70">Gold</p>
                <p className="font-display text-2xl uppercase tracking-[0.1em] text-amber-200">
                  {state.resources.gold}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustResource("gold", -1)}
                className="touch-button rounded-full border border-white/10 bg-slate-950/70 px-3 text-lg text-white transition hover:border-amber-400/45 hover:text-amber-100"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => adjustResource("gold", 1)}
                className="touch-button rounded-full border border-amber-400/20 bg-amber-400/10 px-3 text-lg text-amber-100 transition hover:bg-amber-400/20"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Units ── */}
      <section className="panel rounded-[2rem] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow text-xs text-cyan-200/70">Units</p>
            <h3 className="mt-2 font-display text-2xl uppercase tracking-[0.12em] text-white">
              {ownedUnits.length} owned
            </h3>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-white transition hover:border-cyan-300/45"
            >
              <option value="">Select unit...</option>
              {availableUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addUnit}
              disabled={!selectedUnitId}
              className="touch-button rounded-full bg-cyan-300 px-6 py-2 text-sm font-semibold text-slate-950 transition disabled:opacity-50 hover:bg-cyan-200"
            >
              Add
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          {ownedUnits.map((unit) => (
            <div key={unit.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h4 className="font-display text-lg uppercase tracking-[0.1em] text-white">
                {unit.name}
              </h4>
              <p className="mt-2 text-sm text-slate-300">{unit.description}</p>
              <div className="mt-3 flex gap-4 text-xs text-slate-400">
                <span>♥ HP {unit.stats.hp}</span>
                <span>◆ DMG {unit.stats.damage}</span>
                <span>◈ SPD {unit.stats.speed}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Spells ── */}
      <section className="panel rounded-[2rem] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow text-xs text-cyan-200/70">Spells</p>
            <h3 className="mt-2 font-display text-2xl uppercase tracking-[0.12em] text-white">
              {ownedSpells.length} known
            </h3>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedSpellId}
              onChange={(e) => setSelectedSpellId(e.target.value)}
              className="rounded-full border border-purple-300/20 bg-purple-300/10 px-4 py-2 text-sm text-white transition hover:border-purple-300/45"
            >
              <option value="">Select spell...</option>
              {availableSpells.map((spell) => (
                <option key={spell.id} value={spell.id}>
                  {spell.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addSpell}
              disabled={!selectedSpellId}
              className="touch-button rounded-full bg-purple-400 px-6 py-2 text-sm font-semibold text-slate-950 transition disabled:opacity-50 hover:bg-purple-300"
            >
              Add
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          {ownedSpells.map((spell) => (
            <div key={spell.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h4 className="font-display text-lg uppercase tracking-[0.1em] text-white">
                {spell.name}
              </h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {spell.category.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full border border-purple-300/15 bg-purple-300/10 px-2 py-1 text-xs text-purple-200"
                  >
                    {cat}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-400">Damage: {spell.damage}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
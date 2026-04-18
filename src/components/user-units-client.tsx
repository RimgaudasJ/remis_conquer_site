"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addOwnedUnitFromInventoryPageAction,
  adjustOwnedUnitStatAction,
  deleteOwnedUnitAction,
} from "@/app/actions/shop";
import type { UnitSeed } from "@/lib/notion";

type UnitStatKey = "hp" | "damage" | "speed";

type OwnedUnit = {
  id: string;
  sourceUnitId: string;
  name: string;
  description: string;
  effects: string;
  imageUrl: string | null;
  stats: {
    hp: number;
    damage: number;
    speed: number;
  };
};

function StatControl({
  label,
  value,
  onMinus,
  onPlus,
  disabled,
}: {
  label: string;
  value: number;
  onMinus: () => void;
  onPlus: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <span className="text-xs uppercase tracking-[0.2em] text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMinus}
          disabled={disabled}
          className="touch-button rounded-full border border-white/15 bg-slate-950/80 px-3 py-1 text-sm text-white transition hover:border-cyan-300/55 disabled:cursor-not-allowed disabled:opacity-50"
        >
          -
        </button>
        <span className="min-w-9 text-center font-display text-lg tracking-[0.1em] text-white">
          {value}
        </span>
        <button
          type="button"
          onClick={onPlus}
          disabled={disabled}
          className="touch-button rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-100 transition hover:border-cyan-300/55 hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function UserUnitsClient({
  initialUnits,
  availableUnits,
}: {
  initialUnits: OwnedUnit[];
  availableUnits: UnitSeed[];
}) {
  const [units, setUnits] = useState<OwnedUnit[]>(initialUnits);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedAddUnitId, setSelectedAddUnitId] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [brokenImages, setBrokenImages] = useState<Record<string, true>>({});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const selectedUnit = useMemo(
    () => units.find((unit) => unit.id === selectedUnitId) ?? null,
    [selectedUnitId, units],
  );

  const addableUnits = useMemo(() => {
    const ownedSourceIds = new Set(units.map((unit) => unit.sourceUnitId));
    return availableUnits.filter((unit) => !ownedSourceIds.has(unit.id));
  }, [availableUnits, units]);

  function addUnitFromDropdown() {
    if (!selectedAddUnitId) {
      return;
    }

    startTransition(async () => {
      const result = await addOwnedUnitFromInventoryPageAction(selectedAddUnitId);
      setStatusMessage(result.message);

      if (!result.ok) {
        return;
      }

      const unit = availableUnits.find((entry) => entry.id === selectedAddUnitId);

      if (unit) {
        setUnits((previous) => [
          ...previous,
          {
            id: `temp-${unit.id}-${Date.now()}`,
            sourceUnitId: unit.id,
            name: unit.name,
            description: unit.description,
            effects: unit.effects,
            imageUrl: unit.imageUrl,
            stats: {
              hp: Math.max(0, unit.stats.hp),
              damage: Math.max(0, unit.stats.damage),
              speed: Math.max(0, unit.stats.speed),
            },
          },
        ]);
      }

      setSelectedAddUnitId("");
      router.refresh();
    });
  }

  function adjustStat(stat: UnitStatKey, delta: number) {
    if (!selectedUnit) {
      return;
    }

    startTransition(async () => {
      const result = await adjustOwnedUnitStatAction(selectedUnit.id, stat, delta);
      setStatusMessage(result.message);

      if (!result.ok) {
        return;
      }

      setUnits((previous) =>
        previous.map((entry) => {
          if (entry.id !== selectedUnit.id) {
            return entry;
          }

          const nextValue = Math.max(0, entry.stats[stat] + delta);

          return {
            ...entry,
            stats: {
              ...entry.stats,
              [stat]: nextValue,
            },
          };
        }),
      );
      router.refresh();
    });
  }

  function deleteUnit() {
    if (!selectedUnit) {
      return;
    }

    const confirmed = window.confirm(`Delete ${selectedUnit.name} from inventory?`);

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteOwnedUnitAction(selectedUnit.id);
      setStatusMessage(result.message);

      if (!result.ok) {
        return;
      }

      setUnits((previous) => previous.filter((entry) => entry.id !== selectedUnit.id));
      setSelectedUnitId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <section className="panel rounded-[2rem] p-6">
        <p className="eyebrow text-xs text-cyan-200/70">Inventory Units</p>
        <h2 className="mt-2 font-display text-3xl uppercase tracking-[0.14em] text-white">
          {units.length} Owned
        </h2>
        <p className="mt-3 text-sm text-slate-300">Click any unit card to open full stats and ability details.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <select
            value={selectedAddUnitId}
            onChange={(event) => setSelectedAddUnitId(event.target.value)}
            className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-white transition hover:border-cyan-300/45"
          >
            <option value="">Select unit...</option>
            {addableUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addUnitFromDropdown}
            disabled={!selectedAddUnitId || isPending}
            className="touch-button rounded-full border border-cyan-300/20 bg-cyan-300 px-6 py-2 text-sm font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-cyan-200"
          >
            Add Unit
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {units.map((unit) => {
          const imageMissing = !unit.imageUrl || brokenImages[unit.id];

          return (
            <button
              key={unit.id}
              type="button"
              onClick={() => setSelectedUnitId(unit.id)}
              className="panel overflow-hidden rounded-[1.5rem] border border-white/10 text-left transition hover:border-cyan-300/55"
            >
              <div className="aspect-[16/10] w-full overflow-hidden border-b border-white/10 bg-slate-950/70">
                {!imageMissing ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={unit.imageUrl ?? ""}
                    alt={unit.name}
                    className="h-full w-full object-cover"
                    onError={() => setBrokenImages((previous) => ({ ...previous, [unit.id]: true }))}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800/60 to-slate-950">
                    <span className="font-display text-4xl uppercase tracking-[0.22em] text-white/15">
                      {unit.name.slice(0, 2)}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display text-xl uppercase tracking-[0.12em] text-white">{unit.name}</h3>
              </div>
            </button>
          );
        })}
        {units.length === 0 ? (
          <article className="panel col-span-full rounded-[1.5rem] border border-dashed border-white/15 p-6 text-center text-sm text-slate-400">
            No units in inventory yet. Recruit from the shop first.
          </article>
        ) : null}
      </section>

      {selectedUnit ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div className="panel relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-[1.8rem] border border-cyan-300/20 p-6">
            <button
              type="button"
              onClick={() => setSelectedUnitId(null)}
              className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/80 transition hover:border-cyan-300/60"
            >
              Close
            </button>

            <div className="grid gap-6 md:grid-cols-[0.85fr_1.15fr]">
              <div>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
                  {!selectedUnit.imageUrl || brokenImages[selectedUnit.id] ? (
                    <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-slate-800/60 to-slate-950">
                      <span className="font-display text-5xl uppercase tracking-[0.22em] text-white/15">
                        {selectedUnit.name.slice(0, 2)}
                      </span>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedUnit.imageUrl}
                      alt={selectedUnit.name}
                      className="aspect-[16/10] w-full object-cover"
                      onError={() =>
                        setBrokenImages((previous) => ({ ...previous, [selectedUnit.id]: true }))
                      }
                    />
                  )}
                </div>
                <h3 className="mt-4 font-display text-3xl uppercase tracking-[0.12em] text-white">
                  {selectedUnit.name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{selectedUnit.description}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="eyebrow text-xs text-cyan-200/70">Stats</p>
                  <StatControl
                    label="HP"
                    value={selectedUnit.stats.hp}
                    onMinus={() => adjustStat("hp", -1)}
                    onPlus={() => adjustStat("hp", 1)}
                    disabled={isPending}
                  />
                  <StatControl
                    label="Damage"
                    value={selectedUnit.stats.damage}
                    onMinus={() => adjustStat("damage", -1)}
                    onPlus={() => adjustStat("damage", 1)}
                    disabled={isPending}
                  />
                  <StatControl
                    label="Speed"
                    value={selectedUnit.stats.speed}
                    onMinus={() => adjustStat("speed", -1)}
                    onPlus={() => adjustStat("speed", 1)}
                    disabled={isPending}
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="eyebrow text-xs text-cyan-200/70">Passive Ability</p>
                  <p className="mt-2 text-sm leading-7 text-slate-200">{selectedUnit.effects}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="eyebrow text-xs text-cyan-200/70">Active Ability</p>
                  <p className="mt-2 text-sm leading-7 text-slate-200">{selectedUnit.effects}</p>
                </div>

                <button
                  type="button"
                  onClick={deleteUnit}
                  disabled={isPending}
                  className="touch-button w-full rounded-full border border-red-400/40 bg-red-500/20 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-red-100 transition hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Delete Unit
                </button>

                {statusMessage ? <p className="text-xs text-slate-400">{statusMessage}</p> : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

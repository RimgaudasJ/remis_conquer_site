"use client";

import { useState } from "react";
import {
  demoItems,
  demoPlayers,
  getItemById,
  type PlayerSeed,
  type ResourceKey,
} from "@/lib/mock-data";

type GMPlayerState = Pick<PlayerSeed, "resources" | "inventory">;

export function GMConsole() {
  const [players, setPlayers] = useState<Record<string, GMPlayerState>>(
    Object.fromEntries(
      demoPlayers.map((player) => [
        player.id,
        { resources: player.resources, inventory: player.inventory },
      ]),
    ),
  );

  function adjust(playerId: string, resource: ResourceKey, delta: number) {
    setPlayers((current) => ({
      ...current,
      [playerId]: {
        ...current[playerId],
        resources: {
          ...current[playerId].resources,
          [resource]: Math.max(0, current[playerId].resources[resource] + delta),
        },
      },
    }));
  }

  function addItem(playerId: string, itemId: string) {
    setPlayers((current) => {
      const state = current[playerId];
      const existing = state.inventory.find((entry) => entry.itemId === itemId);

      return {
        ...current,
        [playerId]: {
          ...state,
          inventory: existing
            ? state.inventory.map((entry) =>
                entry.itemId === itemId
                  ? { ...entry, quantity: entry.quantity + 1 }
                  : entry,
              )
            : [...state.inventory, { itemId, quantity: 1 }],
        },
      };
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {demoPlayers.map((player) => {
        const state = players[player.id];

        return (
          <section key={player.id} className="panel rounded-[1.75rem] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow text-xs text-amber-200/70">GM Override</p>
                <h3 className="mt-2 font-display text-2xl uppercase tracking-[0.12em] text-white">
                  {player.name}
                </h3>
              </div>
              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-amber-100">
                Room control
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {(Object.entries(state.resources) as [ResourceKey, number][]).map(([resource, value]) => (
                <div key={resource} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm capitalize text-slate-300">{resource}</p>
                  <p className="mt-2 font-display text-2xl uppercase tracking-[0.12em] text-white">
                    {value}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => adjust(player.id, resource, -1)}
                      className="touch-button flex-1 rounded-full border border-white/10 bg-slate-950/70 px-3 text-white transition hover:border-amber-300/45"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => adjust(player.id, resource, 1)}
                      className="touch-button flex-1 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 text-amber-100 transition hover:bg-amber-300/20"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3">
              <p className="eyebrow text-xs text-amber-200/70">Inventory override</p>
              <div className="flex flex-wrap gap-2">
                {demoItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => addItem(player.id, item.id)}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-amber-300/45 hover:bg-amber-300/10"
                  >
                    Add {item.name}
                  </button>
                ))}
              </div>
              <div className="grid gap-3">
                {state.inventory.map((entry) => {
                  const item = getItemById(entry.itemId);

                  if (!item) {
                    return null;
                  }

                  return (
                    <div key={entry.itemId} className="rounded-2xl bg-slate-950/60 p-4 text-sm text-slate-200">
                      <div className="flex items-center justify-between gap-3">
                        <span>{item.name}</span>
                        <span className="font-display text-base uppercase tracking-[0.12em] text-white">
                          x{entry.quantity}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
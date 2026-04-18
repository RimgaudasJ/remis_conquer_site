"use client";

import { useState } from "react";
import type { SpellSeed } from "@/lib/notion";

export function UserSpellsClient({ spells }: { spells: SpellSeed[] }) {
  const [brokenImages, setBrokenImages] = useState<Record<string, true>>({});

  return (
    <div className="space-y-6">
      <section className="panel rounded-[2rem] p-6">
        <p className="eyebrow text-xs text-cyan-200/70">Inventory Spells</p>
        <h2 className="mt-2 font-display text-3xl uppercase tracking-[0.14em] text-white">
          {spells.length} Owned
        </h2>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {spells.map((spell) => {
          const imageMissing = !spell.imageUrl || brokenImages[spell.id];

          return (
            <article
              key={spell.id}
              className="panel overflow-hidden rounded-[1.5rem] border border-white/10"
            >
              <div className="aspect-[16/10] w-full overflow-hidden border-b border-white/10 bg-slate-950/70">
                {!imageMissing ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={spell.imageUrl ?? ""}
                    alt={spell.name}
                    className="h-full w-full object-cover"
                    onError={() =>
                      setBrokenImages((previous) => ({ ...previous, [spell.id]: true }))
                    }
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800/60 to-slate-950">
                    <span className="font-display text-4xl uppercase tracking-[0.22em] text-white/15">
                      {spell.name.slice(0, 2)}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display text-xl uppercase tracking-[0.12em] text-white">
                  {spell.name}
                </h3>
              </div>
            </article>
          );
        })}

        {spells.length === 0 ? (
          <article className="panel col-span-full rounded-[1.5rem] border border-dashed border-white/15 p-6 text-center text-sm text-slate-400">
            No spells in inventory yet.
          </article>
        ) : null}
      </section>
    </div>
  );
}

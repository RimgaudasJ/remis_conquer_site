import Link from "next/link";
import { demoWikiPages, getWikiCategories } from "@/lib/mock-data";

export default function WikiPage() {
  return (
    <div className="grid gap-6">
      <section className="panel rounded-[2rem] p-6 sm:p-8">
        <p className="eyebrow text-xs text-cyan-200/70">Field Wiki</p>
        <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.16em] text-white">
          Rules, lore, cards, and factions in one archive.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 sm:text-base">
          This is optimized for phone-sized reads during play. Categories stay visible,
          articles stay concise, and deep rules can expand later without changing the
          page structure.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {getWikiCategories().map((category) => (
            <span
              key={category}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
            >
              {category}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {demoWikiPages.map((page) => (
          <Link
            key={page.id}
            href={`/wiki/${page.slug}`}
            className="panel rounded-[1.75rem] p-5 transition hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-cyan-300/5"
          >
            <p className="eyebrow text-xs text-cyan-200/70">{page.category}</p>
            <h3 className="mt-3 font-display text-2xl uppercase tracking-[0.12em] text-white">
              {page.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{page.excerpt}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
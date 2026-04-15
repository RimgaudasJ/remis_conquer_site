import { notFound } from "next/navigation";
import { getWikiPageBySlug } from "@/lib/mock-data";

export default async function WikiDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getWikiPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <article className="panel rounded-[2rem] p-6 sm:p-8">
      <p className="eyebrow text-xs text-cyan-200/70">{page.category}</p>
      <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.16em] text-white">
        {page.title}
      </h2>
      <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 sm:text-base">
        {page.excerpt}
      </p>
      <div className="mt-8 grid gap-4">
        {page.body.map((paragraph) => (
          <p
            key={paragraph}
            className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-sm leading-8 text-slate-200 sm:text-base"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
import Link from "next/link";
import { GMConsole } from "@/components/gm-console";
import { getRoomSession } from "@/lib/session";

export default async function GMPage() {
  const session = await getRoomSession();

  if (!session || session.role !== "gm") {
    return (
      <section className="panel rounded-[2rem] p-6 sm:p-8">
        <p className="eyebrow text-xs text-amber-200/70">GM Console</p>
        <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.16em] text-white">
          GM session required.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-300 sm:text-base">
          This route stays separate from the player experience. Use the room code plus
          GM code to open the control surface.
        </p>
        <Link
          href="/join"
          className="mt-6 inline-flex rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
        >
          Go to GM access
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="panel rounded-[2rem] p-6 sm:p-8">
        <p className="eyebrow text-xs text-amber-200/70">Game Master</p>
        <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.16em] text-white">
          Room command console
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 sm:text-base">
          This console is the admin surface for resources, inventory, and overrides. The
          current pass uses seeded room data so the interface is testable before the
          Prisma mutation layer is connected.
        </p>
      </section>
      <GMConsole />
    </div>
  );
}
import { JoinPanels } from "@/components/join-panels";
import { demoPlayers, demoRoom } from "@/lib/mock-data";

export default function JoinPage() {
  return (
    <div className="grid gap-6">
      <section className="panel rounded-[2rem] p-6 sm:p-8">
        <p className="eyebrow text-xs text-cyan-200/70">Access Control</p>
        <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.16em] text-white">
          Join the room from your device.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 sm:text-base">
          MVP sessions are device-bound and room-scoped. The current seed room is
          loaded for playtesting so you can move through the main flows immediately.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-200">
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2">
            Player room code: {demoRoom.code}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
            Demo players: {demoPlayers.map((player) => player.name).join(", ")}
          </span>
        </div>
      </section>

      <JoinPanels />
    </div>
  );
}
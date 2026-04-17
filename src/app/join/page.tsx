import { JoinPanels } from "@/components/join-panels";

export default function JoinPage() {
  return (
    <div className="grid gap-6">
      <section className="panel rounded-[2rem] p-6 sm:p-8">
        <p className="eyebrow text-xs text-cyan-200/70">Access Control</p>
        <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.16em] text-white">
          Join the room from your device.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 sm:text-base">
          First create a room to generate credentials, then players can join with a
          room code and their own usernames.
        </p>
      </section>

      <JoinPanels />
    </div>
  );
}
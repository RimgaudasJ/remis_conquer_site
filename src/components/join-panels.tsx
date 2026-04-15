"use client";

import { useActionState } from "react";
import {
  joinGameMasterRoom,
  joinPlayerRoom,
  type JoinActionState,
} from "@/app/actions/session";

function PanelMessage({ state }: { state: JoinActionState | undefined }) {
  if (!state?.error) {
    return null;
  }

  return <p className="text-sm text-rose-300">{state.error}</p>;
}

export function JoinPanels() {
  const [playerState, playerAction, playerPending] = useActionState(
    joinPlayerRoom,
    undefined,
  );
  const [gmState, gmAction, gmPending] = useActionState(
    joinGameMasterRoom,
    undefined,
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form action={playerAction} className="panel rounded-[1.75rem] p-6">
        <p className="eyebrow text-xs text-cyan-200/70">Player Join</p>
        <h3 className="mt-3 font-display text-2xl uppercase tracking-[0.12em] text-white">
          Private player dashboard
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Enter the room code and your table name. This creates a private session on
          this device and opens your dashboard.
        </p>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm text-slate-200">
            Room code
            <input
              name="roomCode"
              placeholder="ASHFALL"
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-cyan-300/60"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-200">
            Player name
            <input
              name="playerName"
              placeholder="Astra"
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-cyan-300/60"
            />
          </label>
          <PanelMessage state={playerState} />
          <button
            type="submit"
            disabled={playerPending}
            className="touch-button rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {playerPending ? "Linking device..." : "Enter dashboard"}
          </button>
        </div>
      </form>

      <form action={gmAction} className="panel rounded-[1.75rem] p-6">
        <p className="eyebrow text-xs text-amber-200/70">GM Access</p>
        <h3 className="mt-3 font-display text-2xl uppercase tracking-[0.12em] text-white">
          Hidden room controls
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          The GM console is isolated behind a stronger code so players never see room
          management controls.
        </p>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm text-slate-200">
            Room code
            <input
              name="roomCode"
              placeholder="ASHFALL"
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-amber-300/60"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-200">
            GM code
            <input
              name="gmCode"
              placeholder="WARDEN-9"
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-amber-300/60"
            />
          </label>
          <PanelMessage state={gmState} />
          <button
            type="submit"
            disabled={gmPending}
            className="touch-button rounded-full bg-amber-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {gmPending ? "Opening console..." : "Enter GM console"}
          </button>
        </div>
      </form>
    </div>
  );
}
"use client";

import { useActionState } from "react";
import {
  createRoomAction,
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

function CreateRoomSuccess({ state }: { state: JoinActionState | undefined }) {
  if (!state?.success || !state.roomCode || !state.gmCode) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-4 text-sm text-emerald-100">
      <p className="font-semibold">{state.success}</p>
      <p className="mt-2">Room code: {state.roomCode}</p>
      <p>GM code: {state.gmCode}</p>
    </div>
  );
}

export function JoinPanels() {
  const [createState, createAction, createPending] = useActionState(
    createRoomAction,
    undefined,
  );
  const [playerState, playerAction, playerPending] = useActionState(
    joinPlayerRoom,
    undefined,
  );
  const [gmState, gmAction, gmPending] = useActionState(
    joinGameMasterRoom,
    undefined,
  );

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <form action={createAction} className="panel rounded-[1.75rem] p-6">
        <p className="eyebrow text-xs text-emerald-200/75">Create Room</p>
        <h3 className="mt-3 font-display text-2xl uppercase tracking-[0.12em] text-white">
          Generate room + GM codes
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Create a room once, then share the room code with players. Keep the GM code
          private.
        </p>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm text-slate-200">
            Room name
            <input
              name="roomName"
              placeholder="Ashfall Reach"
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-emerald-300/60"
            />
          </label>
          <PanelMessage state={createState} />
          <CreateRoomSuccess state={createState} />
          <button
            type="submit"
            disabled={createPending}
            className="touch-button rounded-full bg-emerald-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createPending ? "Creating room..." : "Create room"}
          </button>
        </div>
      </form>

      <form action={playerAction} className="panel rounded-[1.75rem] p-6">
        <p className="eyebrow text-xs text-cyan-200/70">Player Join</p>
        <h3 className="mt-3 font-display text-2xl uppercase tracking-[0.12em] text-white">
          Private player dashboard
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Enter the room code and your username. If this name already exists in the
          room, you will reconnect to that player profile.
        </p>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm text-slate-200">
            Room code
            <input
              name="roomCode"
              placeholder="Q7M4KD"
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-cyan-300/60"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-200">
            Player name
            <input
              name="playerName"
              placeholder="Your username"
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
              placeholder="Q7M4KD"
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-amber-300/60"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-200">
            GM code
            <input
              name="gmCode"
              placeholder="A1B2-C3D4"
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
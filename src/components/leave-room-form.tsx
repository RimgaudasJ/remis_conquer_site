import { leaveRoom } from "@/app/actions/session";

export function LeaveRoomForm() {
  return (
    <form action={leaveRoom}>
      <button
        type="submit"
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/75 transition hover:border-rose-300/60 hover:bg-rose-300/10 hover:text-white"
      >
        Leave room
      </button>
    </form>
  );
}
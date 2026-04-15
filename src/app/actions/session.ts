"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  clearRoomSession,
  createGameMasterSession,
  createPlayerSession,
} from "@/lib/session";
import { demoRoom, findPlayerByName, getRoomByCode } from "@/lib/mock-data";

export type JoinActionState = {
  error?: string;
};

const playerJoinSchema = z.object({
  roomCode: z.string().trim().min(4).max(12),
  playerName: z.string().trim().min(2).max(24),
});

const gmJoinSchema = z.object({
  roomCode: z.string().trim().min(4).max(12),
  gmCode: z.string().trim().min(4).max(24),
});

export async function joinPlayerRoom(
  _previousState: JoinActionState | undefined,
  formData: FormData,
): Promise<JoinActionState | undefined> {
  const parsed = playerJoinSchema.safeParse({
    roomCode: formData.get("roomCode"),
    playerName: formData.get("playerName"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid room code and player name." };
  }

  const room = getRoomByCode(parsed.data.roomCode);

  if (!room) {
    return { error: "Room code not recognized." };
  }

  const player = findPlayerByName(room.id, parsed.data.playerName);

  if (!player) {
    return {
      error:
        "Player name not found in this room yet. Use one of the seeded demo players for now: Astra, Boros, or Nyx.",
    };
  }

  await createPlayerSession(player.id);
  redirect("/dashboard");
}

export async function joinGameMasterRoom(
  _previousState: JoinActionState | undefined,
  formData: FormData,
): Promise<JoinActionState | undefined> {
  const parsed = gmJoinSchema.safeParse({
    roomCode: formData.get("roomCode"),
    gmCode: formData.get("gmCode"),
  });

  if (!parsed.success) {
    return { error: "Enter the room code and GM code." };
  }

  if (
    parsed.data.roomCode.trim().toUpperCase() !== demoRoom.code ||
    parsed.data.gmCode.trim().toUpperCase() !== demoRoom.gmCode
  ) {
    return { error: "GM credentials do not match this room." };
  }

  await createGameMasterSession();
  redirect("/gm");
}

export async function leaveRoom() {
  await clearRoomSession();
  redirect("/");
}
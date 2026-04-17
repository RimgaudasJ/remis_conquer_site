"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  clearRoomSession,
  createGameMasterSession,
  createPlayerSession,
} from "@/lib/session";
import {
  createRoom,
  findOrCreatePlayerInRoom,
  findRoomByCode,
  verifyRoomGMCode,
} from "@/lib/room-store";

export type JoinActionState = {
  error?: string;
  success?: string;
  roomCode?: string;
  gmCode?: string;
};

const createRoomSchema = z.object({
  roomName: z.string().trim().min(2).max(48),
});

const playerJoinSchema = z.object({
  roomCode: z.string().trim().min(4).max(12),
  playerName: z.string().trim().min(2).max(24),
});

const gmJoinSchema = z.object({
  roomCode: z.string().trim().min(4).max(12),
  gmCode: z.string().trim().min(4).max(24),
});

export async function createRoomAction(
  _previousState: JoinActionState | undefined,
  formData: FormData,
): Promise<JoinActionState | undefined> {
  const parsed = createRoomSchema.safeParse({
    roomName: formData.get("roomName"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid room name." };
  }

  const { room, gmCode } = createRoom(parsed.data.roomName);

  return {
    success: "Room created. Share the room code with players.",
    roomCode: room.code,
    gmCode,
  };
}

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

  const room = findRoomByCode(parsed.data.roomCode);

  if (!room) {
    return { error: "Room code not recognized." };
  }

  const player = findOrCreatePlayerInRoom(room.id, parsed.data.playerName);

  if (!player) {
    return { error: "Could not create or resolve player for this room." };
  }

  await createPlayerSession(
    {
      id: player.id,
      roomId: player.roomId,
      name: player.name,
    },
    room.code,
  );
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

  const room = findRoomByCode(parsed.data.roomCode);

  if (!room || !verifyRoomGMCode(room, parsed.data.gmCode)) {
    return { error: "GM credentials do not match this room." };
  }

  await createGameMasterSession({ id: room.id, code: room.code });
  redirect("/gm");
}

export async function leaveRoom() {
  await clearRoomSession();
  redirect("/");
}
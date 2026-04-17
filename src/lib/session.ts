import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

type SessionPlayer = {
  id: string;
  roomId: string;
  name: string;
};

type SessionRoom = {
  id: string;
  code: string;
};

const ROOM_SESSION_COOKIE = "remis-room-session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;

type SessionRole = "player" | "gm";

type SessionPayload = {
  roomId: string;
  roomCode: string;
  role: SessionRole;
  playerId?: string;
  playerName?: string;
  exp: number;
};

export type RoomSession = Omit<SessionPayload, "exp">;

function getSecret() {
  return process.env.SESSION_SECRET ?? "dev-room-session-secret";
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function encode(payload: SessionPayload) {
  const serialized = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${serialized}.${sign(serialized)}`;
}

function decode(token: string): SessionPayload | null {
  const [serialized, signature] = token.split(".");

  if (!serialized || !signature) {
    return null;
  }

  const expected = sign(serialized);
  const provided = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    provided.length !== expectedBuffer.length ||
    !timingSafeEqual(provided, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(serialized, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (parsed.exp <= Date.now()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

async function setSignedSession(payload: SessionPayload) {
  const cookieStore = await cookies();

  cookieStore.set(ROOM_SESSION_COOKIE, encode(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(payload.exp),
    path: "/",
  });
}

export async function createPlayerSession(player: SessionPlayer, roomCode: string) {
  await setSignedSession({
    roomId: player.roomId,
    roomCode,
    role: "player",
    playerId: player.id,
    playerName: player.name,
    exp: Date.now() + SESSION_TTL_MS,
  });
}

export async function createGameMasterSession(room: SessionRoom) {
  await setSignedSession({
    roomId: room.id,
    roomCode: room.code,
    role: "gm",
    exp: Date.now() + SESSION_TTL_MS,
  });
}

export async function clearRoomSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ROOM_SESSION_COOKIE);
}

export async function getRoomSession(): Promise<RoomSession | null> {
  const token = (await cookies()).get(ROOM_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const payload = decode(token);

  if (!payload) {
    return null;
  }

  return {
    roomId: payload.roomId,
    roomCode: payload.roomCode,
    role: payload.role,
    playerId: payload.playerId,
    playerName: payload.playerName,
  };
}
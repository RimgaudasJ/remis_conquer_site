import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { demoPlayers, demoRoom, type PlayerSeed } from "@/lib/mock-data";

type RoomRecord = {
  id: string;
  name: string;
  code: string;
  gmCodeHash: string;
};

type StoreState = {
  roomsByCode: Map<string, RoomRecord>;
  playersById: Map<string, PlayerSeed>;
  playerIdByRoomAndName: Map<string, string>;
};

declare global {
  var __remisRoomStoreState: StoreState | undefined;
}

function roomCodeSecret() {
  return process.env.SESSION_SECRET ?? "dev-room-session-secret";
}

function normalizeRoomCode(code: string) {
  return code.trim().toUpperCase();
}

function normalizePlayerName(name: string) {
  return name.trim().toLowerCase();
}

function roomPlayerKey(roomId: string, playerName: string) {
  return `${roomId}:${normalizePlayerName(playerName)}`;
}

function hashGMCode(code: string) {
  return createHmac("sha256", roomCodeSecret())
    .update(code.trim().toUpperCase())
    .digest("base64url");
}

function randomChars(length: number, alphabet: string) {
  const bytes = randomBytes(length);
  let output = "";

  for (let i = 0; i < length; i += 1) {
    output += alphabet[bytes[i] % alphabet.length];
  }

  return output;
}

function generateRoomCode() {
  return randomChars(6, "ABCDEFGHJKLMNPQRSTUVWXYZ23456789");
}

function generateGMCode() {
  const segmentA = randomChars(4, "ABCDEFGHJKLMNPQRSTUVWXYZ23456789");
  const segmentB = randomChars(4, "ABCDEFGHJKLMNPQRSTUVWXYZ23456789");
  return `${segmentA}-${segmentB}`;
}

function generateEntityId(prefix: "room" | "player") {
  return `${prefix}-${randomChars(10, "abcdefghijklmnopqrstuvwxyz0123456789")}`;
}

function initializeStore(): StoreState {
  const roomsByCode = new Map<string, RoomRecord>();
  const playersById = new Map<string, PlayerSeed>();
  const playerIdByRoomAndName = new Map<string, string>();

  const seededRoom: RoomRecord = {
    id: demoRoom.id,
    name: demoRoom.name,
    code: normalizeRoomCode(demoRoom.code),
    gmCodeHash: hashGMCode(demoRoom.gmCode),
  };

  roomsByCode.set(seededRoom.code, seededRoom);

  for (const player of demoPlayers) {
    const seededPlayer: PlayerSeed = {
      ...player,
      resources: { ...player.resources },
      abilities: [...player.abilities],
      inventory: player.inventory.map((entry) => ({ ...entry })),
      counters: player.counters.map((counter) => ({ ...counter })),
      statuses: player.statuses.map((status) => ({ ...status })),
    };

    playersById.set(seededPlayer.id, seededPlayer);
    playerIdByRoomAndName.set(
      roomPlayerKey(seededPlayer.roomId, seededPlayer.name),
      seededPlayer.id,
    );
  }

  return {
    roomsByCode,
    playersById,
    playerIdByRoomAndName,
  };
}

function getStore() {
  if (!globalThis.__remisRoomStoreState) {
    globalThis.__remisRoomStoreState = initializeStore();
  }

  return globalThis.__remisRoomStoreState;
}

export function createRoom(roomName: string) {
  const store = getStore();

  let code = "";

  for (let i = 0; i < 48; i += 1) {
    const candidate = generateRoomCode();

    if (!store.roomsByCode.has(candidate)) {
      code = candidate;
      break;
    }
  }

  if (!code) {
    throw new Error("Failed to generate a unique room code.");
  }

  const gmCode = generateGMCode();
  const room: RoomRecord = {
    id: generateEntityId("room"),
    name: roomName.trim(),
    code,
    gmCodeHash: hashGMCode(gmCode),
  };

  store.roomsByCode.set(room.code, room);

  return { room, gmCode };
}

export function findRoomByCode(code: string) {
  return getStore().roomsByCode.get(normalizeRoomCode(code)) ?? null;
}

export function verifyRoomGMCode(room: RoomRecord, gmCode: string) {
  const expected = Buffer.from(room.gmCodeHash);
  const providedHash = hashGMCode(gmCode);
  const provided = Buffer.from(providedHash);

  return (
    expected.length === provided.length &&
    timingSafeEqual(expected, provided)
  );
}

export function findOrCreatePlayerInRoom(roomId: string, playerName: string) {
  const store = getStore();
  const normalizedKey = roomPlayerKey(roomId, playerName);
  const existingId = store.playerIdByRoomAndName.get(normalizedKey);

  if (existingId) {
    return store.playersById.get(existingId) ?? null;
  }

  const player: PlayerSeed = {
    id: generateEntityId("player"),
    roomId,
    name: playerName.trim(),
    resources: { gold: 5, mana: 0, influence: 0 },
    abilities: [],
    inventory: [],
    counters: [],
    statuses: [],
  };

  store.playersById.set(player.id, player);
  store.playerIdByRoomAndName.set(normalizedKey, player.id);

  return player;
}

export function getPlayerById(playerId: string) {
  return getStore().playersById.get(playerId) ?? null;
}

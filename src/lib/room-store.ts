import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { demoPlayers, demoRoom, type PlayerSeed } from "@/lib/mock-data";
import type { SpellSeed, UnitSeed } from "@/lib/notion";

export type UnitStatKey = "hp" | "damage" | "speed";

export type OwnedUnitSeed = {
  id: string;
  sourceUnitId: string;
  name: string;
  description: string;
  effects: string;
  imageUrl: string | null;
  stats: {
    hp: number;
    damage: number;
    speed: number;
  };
};

type PlayerCollection = {
  ownedUnitsBySourceId: Map<string, OwnedUnitSeed>;
  ownedSpellIds: Set<string>;
};

type RoomShopState = {
  day: number;
  purchasedUnitIds: Set<string>;
};

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
  collectionsByPlayerId: Map<string, PlayerCollection>;
  shopStateByRoomId: Map<string, RoomShopState>;
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

function generateOwnedUnitId() {
  return `owned-${randomChars(12, "abcdefghijklmnopqrstuvwxyz0123456789")}`;
}

function cloneOwnedUnit(unit: OwnedUnitSeed): OwnedUnitSeed {
  return {
    ...unit,
    stats: { ...unit.stats },
  };
}

function clonePlayerCollection(collection: PlayerCollection): PlayerCollection {
  return {
    ownedUnitsBySourceId: new Map(
      [...collection.ownedUnitsBySourceId.entries()].map(([sourceUnitId, unit]) => [
        sourceUnitId,
        cloneOwnedUnit(unit),
      ]),
    ),
    ownedSpellIds: new Set(collection.ownedSpellIds),
  };
}

function emptyPlayerCollection(): PlayerCollection {
  return {
    ownedUnitsBySourceId: new Map(),
    ownedSpellIds: new Set(),
  };
}

function ensurePlayerCollection(store: StoreState, playerId: string) {
  const existing = store.collectionsByPlayerId.get(playerId);

  if (existing) {
    return existing;
  }

  const created = emptyPlayerCollection();
  store.collectionsByPlayerId.set(playerId, created);
  return created;
}

function ensureRoomShopState(store: StoreState, roomId: string) {
  const existing = store.shopStateByRoomId.get(roomId);

  if (existing) {
    return existing;
  }

  const created: RoomShopState = {
    day: 1,
    purchasedUnitIds: new Set(),
  };

  store.shopStateByRoomId.set(roomId, created);
  return created;
}

function initializeStore(): StoreState {
  const roomsByCode = new Map<string, RoomRecord>();
  const playersById = new Map<string, PlayerSeed>();
  const playerIdByRoomAndName = new Map<string, string>();
  const collectionsByPlayerId = new Map<string, PlayerCollection>();
  const shopStateByRoomId = new Map<string, RoomShopState>();

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
    collectionsByPlayerId.set(seededPlayer.id, emptyPlayerCollection());
  }

  shopStateByRoomId.set(seededRoom.id, {
    day: 1,
    purchasedUnitIds: new Set(),
  });

  return {
    roomsByCode,
    playersById,
    playerIdByRoomAndName,
    collectionsByPlayerId,
    shopStateByRoomId,
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
  store.collectionsByPlayerId.set(player.id, emptyPlayerCollection());

  return player;
}

export function getPlayerById(playerId: string) {
  return getStore().playersById.get(playerId) ?? null;
}

export function getRoomDay(roomId: string) {
  const state = ensureRoomShopState(getStore(), roomId);
  return state.day;
}

export function advanceRoomDay(roomId: string) {
  const state = ensureRoomShopState(getStore(), roomId);
  state.day += 1;
  state.purchasedUnitIds.clear();
  return state.day;
}

export function isRoomUnitPurchased(roomId: string, unitId: string) {
  const state = ensureRoomShopState(getStore(), roomId);
  return state.purchasedUnitIds.has(unitId);
}

export function markRoomUnitPurchased(roomId: string, unitId: string) {
  const state = ensureRoomShopState(getStore(), roomId);

  if (state.purchasedUnitIds.has(unitId)) {
    return false;
  }

  state.purchasedUnitIds.add(unitId);
  return true;
}

export function unmarkRoomUnitPurchased(roomId: string, unitId: string) {
  const state = ensureRoomShopState(getStore(), roomId);
  state.purchasedUnitIds.delete(unitId);
}

export function getAvailableRoomUnitsForDay(roomId: string, units: UnitSeed[]) {
  const state = ensureRoomShopState(getStore(), roomId);
  return units.filter((unit) => !state.purchasedUnitIds.has(unit.id));
}

export function playerOwnsUnit(playerId: string, sourceUnitId: string) {
  const collection = ensurePlayerCollection(getStore(), playerId);
  return collection.ownedUnitsBySourceId.has(sourceUnitId);
}

export function addUnitToPlayerCollection(
  playerId: string,
  unit: UnitSeed,
  spellById: Map<string, SpellSeed>,
) {
  const store = getStore();
  const collection = ensurePlayerCollection(store, playerId);

  if (collection.ownedUnitsBySourceId.has(unit.id)) {
    return { ok: false as const, reason: "duplicate" as const };
  }

  const ownedUnit: OwnedUnitSeed = {
    id: generateOwnedUnitId(),
    sourceUnitId: unit.id,
    name: unit.name,
    description: unit.description,
    effects: unit.effects,
    imageUrl: unit.imageUrl,
    stats: {
      hp: Math.max(0, unit.stats.hp),
      damage: Math.max(0, unit.stats.damage),
      speed: Math.max(0, unit.stats.speed),
    },
  };

  collection.ownedUnitsBySourceId.set(unit.id, ownedUnit);

  for (const spellId of unit.spellIds) {
    if (spellById.has(spellId)) {
      collection.ownedSpellIds.add(spellId);
    }
  }

  return {
    ok: true as const,
    ownedUnit: cloneOwnedUnit(ownedUnit),
  };
}

export function getPlayerOwnedUnits(playerId: string) {
  const collection = ensurePlayerCollection(getStore(), playerId);
  return [...collection.ownedUnitsBySourceId.values()].map(cloneOwnedUnit);
}

export function getPlayerOwnedSpellIds(playerId: string) {
  const collection = ensurePlayerCollection(getStore(), playerId);
  return [...collection.ownedSpellIds.values()];
}

export function updateOwnedUnitStat(
  playerId: string,
  ownedUnitId: string,
  stat: UnitStatKey,
  delta: number,
) {
  const store = getStore();
  const collection = ensurePlayerCollection(store, playerId);
  const nextCollection = clonePlayerCollection(collection);

  let targetKey: string | null = null;

  for (const [sourceUnitId, unit] of nextCollection.ownedUnitsBySourceId.entries()) {
    if (unit.id === ownedUnitId) {
      targetKey = sourceUnitId;
      const nextValue = Math.max(0, unit.stats[stat] + delta);
      nextCollection.ownedUnitsBySourceId.set(sourceUnitId, {
        ...unit,
        stats: {
          ...unit.stats,
          [stat]: nextValue,
        },
      });
      break;
    }
  }

  if (!targetKey) {
    return null;
  }

  store.collectionsByPlayerId.set(playerId, nextCollection);
  return nextCollection.ownedUnitsBySourceId.get(targetKey) ?? null;
}

export function deleteOwnedUnit(playerId: string, ownedUnitId: string) {
  const store = getStore();
  const collection = ensurePlayerCollection(store, playerId);
  const nextCollection = clonePlayerCollection(collection);

  for (const [sourceUnitId, unit] of nextCollection.ownedUnitsBySourceId.entries()) {
    if (unit.id === ownedUnitId) {
      nextCollection.ownedUnitsBySourceId.delete(sourceUnitId);
      store.collectionsByPlayerId.set(playerId, nextCollection);
      return true;
    }
  }

  return false;
}

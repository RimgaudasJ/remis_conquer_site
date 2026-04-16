"use client";

import { useState, useSyncExternalStore } from "react";
import type { ItemSeed, PlayerSeed, ResourceKey } from "@/lib/mock-data";
import { canAfford } from "@/lib/mock-data";

type PersistedState = {
  resources: PlayerSeed["resources"];
  inventory: PlayerSeed["inventory"];
  counters: PlayerSeed["counters"];
  statuses: PlayerSeed["statuses"];
};

type SnapshotCacheEntry = {
  raw: string | null;
  parsed: PersistedState;
};

const snapshotCache = new Map<string, SnapshotCacheEntry>();
const initialSnapshotCache = new Map<string, PersistedState>();

function storageKey(playerId: string) {
  return `remis:player:${playerId}`;
}

function initialState(player: PlayerSeed): PersistedState {
  const key = storageKey(player.id);
  const cached = initialSnapshotCache.get(key);

  if (cached) {
    return cached;
  }

  const snapshot = {
    resources: player.resources,
    inventory: player.inventory,
    counters: player.counters,
    statuses: player.statuses,
  };

  initialSnapshotCache.set(key, snapshot);
  return snapshot;
}

function getSnapshot(player: PlayerSeed): PersistedState {
  const key = storageKey(player.id);

  if (typeof window === "undefined") {
    return initialState(player);
  }

  const cached = snapshotCache.get(key);
  const stored = window.localStorage.getItem(key);

  if (cached && cached.raw === stored) {
    return cached.parsed;
  }

  if (!stored) {
    const fallback = initialState(player);
    snapshotCache.set(key, { raw: null, parsed: fallback });
    return fallback;
  }

  try {
    const parsed = JSON.parse(stored) as PersistedState;
    snapshotCache.set(key, { raw: stored, parsed });
    return parsed;
  } catch {
    window.localStorage.removeItem(key);
    const fallback = initialState(player);
    snapshotCache.set(key, { raw: null, parsed: fallback });
    return fallback;
  }
}

export function usePlayerState(player: PlayerSeed) {
  const [lastPurchase, setLastPurchase] = useState<string | null>(null);

  const state = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return () => undefined;
      }

      const eventName = `remis-storage:${storageKey(player.id)}`;
      const handleStorageChange = (event: Event) => {
        if (event instanceof StorageEvent && event.key && event.key !== storageKey(player.id)) {
          return;
        }

        onStoreChange();
      };

      window.addEventListener("storage", handleStorageChange);
      window.addEventListener(eventName, handleStorageChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener(eventName, handleStorageChange);
      };
    },
    () => getSnapshot(player),
    () => initialState(player),
  );

  function persist(nextState: PersistedState) {
    const key = storageKey(player.id);
    const serialized = JSON.stringify(nextState);

    window.localStorage.setItem(key, serialized);
    snapshotCache.set(key, { raw: serialized, parsed: nextState });
    window.dispatchEvent(new Event(`remis-storage:${key}`));
  }

  function adjustResource(key: ResourceKey, delta: number) {
    persist({
      ...state,
      resources: {
        ...state.resources,
        [key]: Math.max(0, state.resources[key] + delta),
      },
    });
  }

  function adjustCounter(counterId: string, delta: number) {
    persist({
      ...state,
      counters: state.counters.map((counter) => {
        if (counter.id !== counterId) {
          return counter;
        }

        const nextValue = counter.value + delta;
        const bounded = Math.max(counter.min, nextValue);

        return {
          ...counter,
          value:
            typeof counter.max === "number"
              ? Math.min(counter.max, bounded)
              : bounded,
        };
      }),
    });
  }

  function buyItem(item: ItemSeed) {
    if (!canAfford(state.resources, item.cost)) {
      return;
    }

    const existingEntry = state.inventory.find((entry) => entry.itemId === item.id);

    persist({
      ...state,
      resources: {
        gold: state.resources.gold - item.cost.gold,
        mana: state.resources.mana - item.cost.mana,
        influence: state.resources.influence - item.cost.influence,
      },
      inventory: existingEntry
        ? state.inventory.map((entry) =>
            entry.itemId === item.id
              ? { ...entry, quantity: entry.quantity + 1 }
              : entry,
          )
        : [...state.inventory, { itemId: item.id, quantity: 1 }],
    });

    setLastPurchase(item.name);
  }

  function reset() {
    const fresh = initialState(player);
    persist(fresh);
    setLastPurchase(null);
  }

  return {
    state,
    lastPurchase,
    adjustCounter,
    adjustResource,
    buyItem,
    reset,
  };
}
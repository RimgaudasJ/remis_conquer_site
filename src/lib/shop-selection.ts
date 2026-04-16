import type { ItemSeed } from "@/lib/mock-data";

function stringHash(input: string) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function mulberry32(seed: number) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let result = Math.imul(value ^ (value >>> 15), 1 | value);
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function getUtcDateKey(now: Date) {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function seededShuffle<T>(input: T[], seed: number) {
  const random = mulberry32(seed);
  const result = [...input];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

export function getDailyShopUnits(
  roomId: string,
  items: ItemSeed[],
  count = 3,
  now = new Date(),
) {
  if (!roomId || items.length <= count) {
    return items.slice(0, count);
  }

  const seed = stringHash(`${roomId}:${getUtcDateKey(now)}`);
  return seededShuffle(items, seed).slice(0, count);
}

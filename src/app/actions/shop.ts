"use server";

import { getNotionSpells, getNotionUnits } from "@/lib/notion";
import { getRoomSession } from "@/lib/session";
import {
  addUnitToPlayerCollection,
  advanceRoomDay,
  isRoomUnitPurchased,
  markRoomUnitPurchased,
  unmarkRoomUnitPurchased,
  playerOwnsUnit,
  updateOwnedUnitStat,
  deleteOwnedUnit,
  type UnitStatKey,
} from "@/lib/room-store";

type ActionResult = {
  ok: boolean;
  message: string;
};

export async function buyUnitFromSharedShopAction(unitId: string): Promise<ActionResult> {
  const session = await getRoomSession();

  if (!session || session.role !== "player" || !session.playerId) {
    return { ok: false, message: "Player session required." };
  }

  const [units, spells] = await Promise.all([getNotionUnits(), getNotionSpells()]);
  const unit = units.find((entry) => entry.id === unitId);

  if (!unit) {
    return { ok: false, message: "Unit not found." };
  }

  if (playerOwnsUnit(session.playerId, unit.id)) {
    return { ok: false, message: "You already own this unit." };
  }

  if (isRoomUnitPurchased(session.roomId, unit.id)) {
    return { ok: false, message: "This card was already bought by another player." };
  }

  const marked = markRoomUnitPurchased(session.roomId, unit.id);

  if (!marked) {
    return { ok: false, message: "This card became unavailable just now." };
  }

  const spellById = new Map(spells.map((spell) => [spell.id, spell]));
  const addResult = addUnitToPlayerCollection(session.playerId, unit, spellById);

  if (!addResult.ok) {
    unmarkRoomUnitPurchased(session.roomId, unit.id);
    return { ok: false, message: "You already own this unit." };
  }

  return { ok: true, message: `${unit.name} added to your inventory.` };
}

export async function advanceSharedShopDayAction(): Promise<ActionResult> {
  const session = await getRoomSession();

  if (!session || session.role !== "player") {
    return { ok: false, message: "Player session required." };
  }

  const nextDay = advanceRoomDay(session.roomId);

  return { ok: true, message: `Advanced to day ${nextDay}. Shop refreshed.` };
}

export async function adjustOwnedUnitStatAction(
  ownedUnitId: string,
  stat: UnitStatKey,
  delta: number,
): Promise<ActionResult> {
  const session = await getRoomSession();

  if (!session || session.role !== "player" || !session.playerId) {
    return { ok: false, message: "Player session required." };
  }

  if (!Number.isFinite(delta) || delta === 0) {
    return { ok: false, message: "Invalid stat delta." };
  }

  const updated = updateOwnedUnitStat(session.playerId, ownedUnitId, stat, delta > 0 ? 1 : -1);

  if (!updated) {
    return { ok: false, message: "Unit not found in your inventory." };
  }

  return { ok: true, message: "Unit stat updated." };
}

export async function deleteOwnedUnitAction(ownedUnitId: string): Promise<ActionResult> {
  const session = await getRoomSession();

  if (!session || session.role !== "player" || !session.playerId) {
    return { ok: false, message: "Player session required." };
  }

  const deleted = deleteOwnedUnit(session.playerId, ownedUnitId);

  if (!deleted) {
    return { ok: false, message: "Unit not found in your inventory." };
  }

  return { ok: true, message: "Unit removed from inventory." };
}

export async function addOwnedUnitFromInventoryPageAction(unitId: string): Promise<ActionResult> {
  const session = await getRoomSession();

  if (!session || session.role !== "player" || !session.playerId) {
    return { ok: false, message: "Player session required." };
  }

  const [units, spells] = await Promise.all([getNotionUnits(), getNotionSpells()]);
  const unit = units.find((entry) => entry.id === unitId);

  if (!unit) {
    return { ok: false, message: "Unit not found." };
  }

  if (playerOwnsUnit(session.playerId, unit.id)) {
    return { ok: false, message: "You already own this unit." };
  }

  const spellById = new Map(spells.map((spell) => [spell.id, spell]));
  const addResult = addUnitToPlayerCollection(session.playerId, unit, spellById);

  if (!addResult.ok) {
    return { ok: false, message: "You already own this unit." };
  }

  return { ok: true, message: `${unit.name} added to your inventory.` };
}

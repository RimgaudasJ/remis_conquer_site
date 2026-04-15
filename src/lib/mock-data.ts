export type ResourceKey = "gold" | "mana" | "influence";

export type ResourceSet = Record<ResourceKey, number>;

export type InventorySeed = {
  itemId: string;
  quantity: number;
};

export type CounterSeed = {
  id: string;
  label: string;
  value: number;
  min: number;
  max?: number;
};

export type StatusSeed = {
  id: string;
  label: string;
  detail: string;
};

export type PlayerSeed = {
  id: string;
  roomId: string;
  name: string;
  resources: ResourceSet;
  abilities: string[];
  inventory: InventorySeed[];
  counters: CounterSeed[];
  statuses: StatusSeed[];
};

export type ItemSeed = {
  id: string;
  roomId: string;
  name: string;
  description: string;
  effects: string;
  cost: ResourceSet;
};

export type WikiPageSeed = {
  id: string;
  slug: string;
  title: string;
  category: "Rules" | "Lore" | "Cards" | "Factions";
  excerpt: string;
  body: string[];
};

export const demoRoom = {
  id: "room-ashfall",
  code: "ASHFALL",
  gmCode: "WARDEN-9",
  name: "Ashfall Reach",
};

// This seed layer gives the UI a playable local state while the Prisma-backed
// persistence layer is being wired in behind the same shapes.
export const demoItems: ItemSeed[] = [
  {
    id: "item-aether-lens",
    roomId: demoRoom.id,
    name: "Aether Lens",
    description: "Reveal one hidden shop effect before you buy.",
    effects: "Peek at the top card of the relic deck.",
    cost: { gold: 2, mana: 1, influence: 0 },
  },
  {
    id: "item-ward-sigil",
    roomId: demoRoom.id,
    name: "Ward Sigil",
    description: "Spend to cancel one hostile status applied this round.",
    effects: "Negate one curse or stun effect.",
    cost: { gold: 3, mana: 0, influence: 1 },
  },
  {
    id: "item-grit-ration",
    roomId: demoRoom.id,
    name: "Grit Ration",
    description: "Steady supply for long marches and siege turns.",
    effects: "Restore 1 resolve or reroll a fatigue check.",
    cost: { gold: 1, mana: 0, influence: 0 },
  },
  {
    id: "item-star-chart",
    roomId: demoRoom.id,
    name: "Star Chart",
    description: "A navigational relic traded between frontier pilots.",
    effects: "Gain +1 influence during route and diplomacy scenes.",
    cost: { gold: 1, mana: 2, influence: 1 },
  },
];

export const demoPlayers: PlayerSeed[] = [
  {
    id: "player-astra",
    roomId: demoRoom.id,
    name: "Astra",
    resources: { gold: 6, mana: 3, influence: 2 },
    abilities: ["Phase Step", "Field Tactician"],
    inventory: [
      { itemId: "item-aether-lens", quantity: 1 },
      { itemId: "item-grit-ration", quantity: 2 },
    ],
    counters: [
      { id: "threat", label: "Threat", value: 2, min: 0, max: 6 },
      { id: "focus", label: "Focus", value: 3, min: 0, max: 5 },
    ],
    statuses: [
      { id: "status-marked", label: "Marked", detail: "Enemy scouts can track your lane." },
    ],
  },
  {
    id: "player-boros",
    roomId: demoRoom.id,
    name: "Boros",
    resources: { gold: 3, mana: 1, influence: 4 },
    abilities: ["Siege Crafter", "Quartermaster"],
    inventory: [{ itemId: "item-ward-sigil", quantity: 1 }],
    counters: [
      { id: "heat", label: "Heat", value: 1, min: 0, max: 5 },
      { id: "supply", label: "Supply", value: 4, min: 0, max: 6 },
    ],
    statuses: [
      { id: "status-fortified", label: "Fortified", detail: "+1 defense while defending a stronghold." },
    ],
  },
  {
    id: "player-nyx",
    roomId: demoRoom.id,
    name: "Nyx",
    resources: { gold: 4, mana: 5, influence: 1 },
    abilities: ["Veilcraft", "Signal Breaker"],
    inventory: [{ itemId: "item-star-chart", quantity: 1 }],
    counters: [
      { id: "echo", label: "Echo", value: 2, min: 0, max: 4 },
      { id: "omens", label: "Omens", value: 1, min: 0, max: 4 },
    ],
    statuses: [
      { id: "status-veiled", label: "Veiled", detail: "Hidden unless a foe spends detection." },
    ],
  },
];

export const demoWikiPages: WikiPageSeed[] = [
  {
    id: "wiki-turn-flow",
    slug: "turn-flow",
    title: "Turn Flow",
    category: "Rules",
    excerpt: "Resolve upkeep, command, march, and conflict in that order.",
    body: [
      "Each round begins with upkeep. Refresh one passive effect, then collect base income.",
      "During command, players may spend influence to reposition support units or unlock tactical actions.",
      "March and conflict still happen on the physical map. The app is only there to manage private state and references.",
    ],
  },
  {
    id: "wiki-ashfall",
    slug: "ashfall-reach",
    title: "Ashfall Reach",
    category: "Lore",
    excerpt: "A corridor of ruined observatories built above a volcanic breach.",
    body: [
      "Ashfall Reach was once the safest crossing between northern citadels. After the breach, the sky lanes fractured and the border houses turned mercenary.",
      "Relics from the observatories still circulate through the frontier market, which is why the room shop leans on scouting and navigation gear.",
    ],
  },
  {
    id: "wiki-cards",
    slug: "relic-cards",
    title: "Relic Cards",
    category: "Cards",
    excerpt: "Relics are persistent upgrades that usually reveal hidden tactical options.",
    body: [
      "Relics stay with the player until lost, traded, or exhausted by scenario rules.",
      "If a relic changes map position, resolve the map effect physically, then update private counters in the app.",
    ],
  },
  {
    id: "wiki-factions",
    slug: "frontier-houses",
    title: "Frontier Houses",
    category: "Factions",
    excerpt: "Merchant-warriors who control the supply roads and orbital drop rails.",
    body: [
      "The Frontier Houses respond well to influence and trade leverage, but punish unpaid debts quickly.",
      "When a House favors a player, the GM may grant discounts or unlock special shop stock.",
    ],
  },
];

export function getRoomByCode(code: string) {
  return code.trim().toUpperCase() === demoRoom.code ? demoRoom : null;
}

export function getPlayerById(playerId: string) {
  return demoPlayers.find((player) => player.id === playerId) ?? null;
}

export function findPlayerByName(roomId: string, name: string) {
  return (
    demoPlayers.find(
      (player) =>
        player.roomId === roomId &&
        player.name.toLowerCase() === name.trim().toLowerCase(),
    ) ?? null
  );
}

export function getItemById(itemId: string) {
  return demoItems.find((item) => item.id === itemId) ?? null;
}

export function getWikiPageBySlug(slug: string) {
  return demoWikiPages.find((page) => page.slug === slug) ?? null;
}

export function getWikiCategories() {
  return ["Rules", "Lore", "Cards", "Factions"] as const;
}

export function formatCost(cost: ResourceSet) {
  return [
    cost.gold ? `${cost.gold} Gold` : null,
    cost.mana ? `${cost.mana} Mana` : null,
    cost.influence ? `${cost.influence} Influence` : null,
  ]
    .filter(Boolean)
    .join(" • ");
}

export function canAfford(resources: ResourceSet, cost: ResourceSet) {
  return (
    resources.gold >= cost.gold &&
    resources.mana >= cost.mana &&
    resources.influence >= cost.influence
  );
}
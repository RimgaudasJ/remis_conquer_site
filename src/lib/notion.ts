import "server-only";

import type { ItemSeed, WikiPageSeed } from "@/lib/mock-data";

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";
const WIKI_CATEGORIES = ["Rules", "Lore", "Cards", "Factions"] as const;

type WikiCategory = (typeof WIKI_CATEGORIES)[number];

type NotionRichText = {
  plain_text?: string;
};

type NotionProperty = {
  type?: string;
  title?: NotionRichText[];
  rich_text?: NotionRichText[];
  select?: { name?: string } | null;
  multi_select?: { name?: string }[];
  number?: number | null;
  relation?: { id: string }[];
};

type NotionPage = {
  id: string;
  properties?: Record<string, NotionProperty>;
};

type NotionQueryResponse = {
  results?: NotionPage[];
  has_more?: boolean;
  next_cursor?: string | null;
};

export type SpellSeed = {
  id: string;
  name: string;
  category: string[];
  damage: number;
};

export type UnitSeed = {
  id: string;
  name: string;
  spellIds: string[];
  description: string;
  effects: string;
  cost: {
    gold: number;
    mana: number;
    influence: number;
  };
};

function getEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function getNotionApiKey() {
  const apiKey = getEnv("NOTION_API_KEY");
  return apiKey || null;
}

function getDatabaseId(names: string[]) {
  for (const name of names) {
    const value = getEnv(name);

    if (value) {
      return value;
    }
  }

  return null;
}

function assertWikiCategory(value: string | undefined): WikiCategory {
  if (value && WIKI_CATEGORIES.includes(value as WikiCategory)) {
    return value as WikiCategory;
  }

  return "Rules";
}

function getPropertyByName(properties: Record<string, NotionProperty>, names: string[]) {
  for (const name of names) {
    const prop = properties[name];

    if (prop) {
      return prop;
    }
  }

  return undefined;
}

function toPlainText(parts?: NotionRichText[]) {
  if (!parts || parts.length === 0) {
    return "";
  }

  return parts.map((part) => part.plain_text ?? "").join("").trim();
}

function propertyText(property?: NotionProperty) {
  if (!property) {
    return "";
  }

  if (property.type === "title") {
    return toPlainText(property.title);
  }

  if (property.type === "rich_text") {
    return toPlainText(property.rich_text);
  }

  if (property.type === "select") {
    return property.select?.name?.trim() ?? "";
  }

  if (property.type === "number") {
    return property.number != null ? String(property.number) : "";
  }

  return toPlainText(property.rich_text ?? property.title);
}

function propertyNumber(property?: NotionProperty) {
  if (!property) {
    return 0;
  }

  if (property.type === "number") {
    return Math.max(0, Math.trunc(property.number ?? 0));
  }

  const parsed = Number(propertyText(property));
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0;
}

function propertyMultiSelect(property?: NotionProperty): string[] {
  if (!property || property.type !== "multi_select") {
    return [];
  }

  return property.multi_select?.map((opt) => opt.name?.trim() ?? "").filter(Boolean) ?? [];
}

function propertyRelationIds(property?: NotionProperty): string[] {
  if (!property || property.type !== "relation") {
    return [];
  }

  return property.relation?.map((relation) => relation.id).filter(Boolean) ?? [];
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .trim();
}

function buildWikiPageFromNotion(page: NotionPage): WikiPageSeed | null {
  const properties = page.properties;

  if (!properties) {
    return null;
  }

  const title = propertyText(getPropertyByName(properties, ["Title", "Name", "title", "name"]));

  if (!title) {
    return null;
  }

  const slugRaw = propertyText(getPropertyByName(properties, ["Slug", "slug"]));
  const slug = slugRaw ? slugify(slugRaw) : slugify(title);

  if (!slug) {
    return null;
  }

  const categoryRaw = propertyText(getPropertyByName(properties, ["Category", "category", "Type", "type"]));
  const excerpt = propertyText(getPropertyByName(properties, ["Excerpt", "Summary", "excerpt", "summary"]));
  const bodyRaw = propertyText(getPropertyByName(properties, ["Body", "Content", "body", "content"]));

  const body = bodyRaw
    .split(/\r?\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return {
    id: page.id,
    slug,
    title,
    category: assertWikiCategory(categoryRaw),
    excerpt: excerpt || "No excerpt available.",
    body: body.length ? body : [excerpt || "No wiki content available."],
  };
}

async function queryWikiDatabase(): Promise<NotionPage[]> {
  const apiKey = getNotionApiKey();
  const wikiDatabaseId = getDatabaseId(["NOTION_WIKI_DATABASE_ID"]);

  if (!apiKey || !wikiDatabaseId) {
    return [];
  }

  return queryDatabase(wikiDatabaseId, apiKey);
}

async function querySpellDatabase(): Promise<NotionPage[]> {
  const apiKey = getNotionApiKey();
  const spellDatabaseId = getDatabaseId([
    "NOTION_SPELLS_DATABASE_ID",
    "NOTION_SPELL_DATABASE_ID",
  ]);

  if (!apiKey || !spellDatabaseId) {
    return [];
  }

  return queryDatabase(spellDatabaseId, apiKey);
}

async function queryUnitDatabase(): Promise<NotionPage[]> {
  const apiKey = getNotionApiKey();
  const unitDatabaseId = getDatabaseId([
    "NOTION_UNITS_DATABASE_ID",
    "NOTION_UNIT_DATABASE_ID",
  ]);

  if (!apiKey || !unitDatabaseId) {
    return [];
  }

  return queryDatabase(unitDatabaseId, apiKey);
}

async function queryDatabase(databaseId: string, apiKey: string): Promise<NotionPage[]> {

  const allPages: NotionPage[] = [];
  let cursor: string | null = null;

  for (;;) {
    const response = await fetch(
      `${NOTION_API_BASE}/databases/${databaseId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Notion-Version": NOTION_VERSION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page_size: 100,
          start_cursor: cursor ?? undefined,
        }),
        next: { revalidate: 900 },
      },
    );

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as NotionQueryResponse;
    const batch = payload.results ?? [];
    allPages.push(...batch);

    if (!payload.has_more || !payload.next_cursor) {
      return allPages;
    }

    cursor = payload.next_cursor;
  }
}

function buildSpellFromNotion(page: NotionPage): SpellSeed | null {
  if (!page.properties) {
    return null;
  }

  const properties = page.properties;
  const name = propertyText(getPropertyByName(properties, ["Name", "Title", "name", "title"]));

  if (!name) {
    return null;
  }

  const category = propertyMultiSelect(getPropertyByName(properties, ["Category", "Tags", "category", "tags"]));
  const damage = propertyNumber(getPropertyByName(properties, ["Damage", "damage"]));

  return {
    id: page.id,
    name,
    category,
    damage,
  };
}

function buildUnitFromNotion(page: NotionPage): UnitSeed | null {
  if (!page.properties) {
    return null;
  }

  const properties = page.properties;
  const name = propertyText(getPropertyByName(properties, ["Name", "Title", "name", "title"]));

  if (!name) {
    return null;
  }

  const spellIds = propertyRelationIds(getPropertyByName(properties, ["Spells", "Spell", "spells", "spell"]));
  const description = propertyText(getPropertyByName(properties, ["Description", "Excerpt", "description", "excerpt"]));
  const effects = propertyText(getPropertyByName(properties, ["Effects", "Effect", "effects", "effect"]));

  const gold = propertyNumber(getPropertyByName(properties, ["Gold", "Cost Gold", "gold", "cost gold"]));
  const mana = propertyNumber(getPropertyByName(properties, ["Mana", "Cost Mana", "mana", "cost mana"]));
  const influence = propertyNumber(
    getPropertyByName(properties, ["Influence", "Cost Influence", "influence", "cost influence"]),
  );

  return {
    id: page.id,
    name,
    spellIds,
    description: description || "No description available.",
    effects: effects || "No effect listed.",
    cost: { gold, mana, influence },
  };
}

function buildShopItemFromUnit(unit: UnitSeed, roomId: string): ItemSeed {
  return {
    id: `notion-unit-${unit.id}`,
    roomId,
    name: unit.name,
    description: unit.description,
    effects: unit.effects,
    cost: unit.cost,
  };
}

export async function getNotionWikiPages(): Promise<WikiPageSeed[]> {
  const pages = await queryWikiDatabase();

  return pages
    .map(buildWikiPageFromNotion)
    .filter((page): page is WikiPageSeed => page !== null);
}

export async function getNotionWikiPageBySlug(slug: string): Promise<WikiPageSeed | null> {
  const pages = await getNotionWikiPages();
  return pages.find((page) => page.slug === slug) ?? null;
}

export async function getNotionSpells(): Promise<SpellSeed[]> {
  const spellPages = await querySpellDatabase();

  return spellPages
    .map(buildSpellFromNotion)
    .filter((spell): spell is SpellSeed => spell !== null);
}

export async function getNotionUnits(): Promise<UnitSeed[]> {
  const unitPages = await queryUnitDatabase();

  return unitPages
    .map(buildUnitFromNotion)
    .filter((unit): unit is UnitSeed => unit !== null);
}

export function getSpellsByCategory(spells: SpellSeed[], category: string): SpellSeed[] {
  const normalized = category.trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  return spells.filter((spell) =>
    spell.category.some((entry) => entry.toLowerCase() === normalized),
  );
}

export function getRandomSpellByCategory(
  spells: SpellSeed[],
  category: string,
  random: () => number = Math.random,
): SpellSeed | null {
  const pool = getSpellsByCategory(spells, category);

  if (pool.length === 0) {
    return null;
  }

  const index = Math.floor(random() * pool.length);
  return pool[index] ?? null;
}

export async function getNotionUnitsWithSpells() {
  const [units, spells] = await Promise.all([getNotionUnits(), getNotionSpells()]);
  const spellById = new Map(spells.map((spell) => [spell.id, spell]));

  return units.map((unit) => ({
    ...unit,
    spells: unit.spellIds
      .map((spellId) => spellById.get(spellId))
      .filter((spell): spell is SpellSeed => spell !== undefined),
  }));
}

export async function getNotionShopUnits(roomId: string): Promise<ItemSeed[]> {
  const units = await getNotionUnits();

  if (units.length > 0) {
    return units.map((unit) => buildShopItemFromUnit(unit, roomId));
  }

  // Backward-compatible fallback while migrating older setups that only have wiki data.
  const pages = await queryWikiDatabase();

  return pages
    .map((page) => {
      const wikiPage = buildWikiPageFromNotion(page);

      if (!wikiPage) {
        return null;
      }

      return {
        id: `notion-${wikiPage.id}`,
        roomId,
        name: wikiPage.title,
        description: wikiPage.excerpt,
        effects: wikiPage.body[0] ?? "No unit effect listed.",
        cost: { gold: 0, mana: 0, influence: 0 },
      };
    })
    .filter((item): item is ItemSeed => item !== null);
}

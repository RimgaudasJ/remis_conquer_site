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
  number?: number | null;
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

function getEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function getNotionConfig() {
  const apiKey = getEnv("NOTION_API_KEY");
  const wikiDatabaseId = getEnv("NOTION_WIKI_DATABASE_ID");

  if (!apiKey || !wikiDatabaseId) {
    return null;
  }

  return { apiKey, wikiDatabaseId };
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
  const config = getNotionConfig();

  if (!config) {
    return [];
  }

  const allPages: NotionPage[] = [];
  let cursor: string | null = null;

  for (;;) {
    const response = await fetch(
      `${NOTION_API_BASE}/databases/${config.wikiDatabaseId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
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

function buildShopItemFromNotion(page: NotionPage, roomId: string): ItemSeed | null {
  const wikiPage = buildWikiPageFromNotion(page);

  if (!wikiPage || !page.properties) {
    return null;
  }

  const properties = page.properties;
  const gold = propertyNumber(getPropertyByName(properties, ["Gold", "gold", "Cost Gold", "cost gold"]));
  const mana = propertyNumber(getPropertyByName(properties, ["Mana", "mana", "Cost Mana", "cost mana"]));
  const influence = propertyNumber(
    getPropertyByName(properties, ["Influence", "influence", "Cost Influence", "cost influence"]),
  );

  return {
    id: `notion-${wikiPage.id}`,
    roomId,
    name: wikiPage.title,
    description: wikiPage.excerpt,
    effects: wikiPage.body[0] ?? "No unit effect listed.",
    cost: { gold, mana, influence },
  };
}

export async function getNotionShopUnits(roomId: string): Promise<ItemSeed[]> {
  const pages = await queryWikiDatabase();

  return pages
    .map((page) => buildShopItemFromNotion(page, roomId))
    .filter((item): item is ItemSeed => item !== null);
}

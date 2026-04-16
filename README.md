## Remis Conquer Site

Next.js 16 app for room-based play, including join flows, player dashboard, wiki, and shop.

## Local setup

1. Install dependencies.

```bash
npm install
```

2. Create `.env.local` and set required variables.

```bash
SESSION_SECRET=replace-with-long-random-secret
NOTION_API_KEY=replace-with-your-notion-integration-key
NOTION_WIKI_DATABASE_ID=replace-with-your-notion-database-id
NOTION_UNITS_DATABASE_ID=optional-units-database-id
NOTION_SPELLS_DATABASE_ID=optional-spells-database-id
```

3. Start the development server.

```bash
npm run dev
```

4. Open http://localhost:3000.

## Notion behavior

- Wiki list and wiki detail pages read from the Notion wiki database.
- Shop stock is generated from those same Notion wiki entries.
- If a dedicated Units database is configured, shop stock comes from Units instead.
- Shop shows up to 3 deterministic random units per room per UTC day.
- If fewer than 3 valid Notion entries exist, the shop shows the available count.

## Security notes

- Keep Notion keys in environment variables only.
- Never commit `.env.local`.
- If a key was exposed in chat or git history, rotate it in Notion and update your environment.

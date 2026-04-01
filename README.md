# MapleVault

MapleStory GMS v83 data browser for mobs, equipment, items, NPCs and maps.
Production website: [MapleVault](https://www.maplevault.net/)

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Biome

## Development

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Biome format and lint:

```bash
npm run lint
npm run format
```

## Data

Data is sourced from MapleStory GMS v83 .wz files using [HaRepacker](https://github.com/lastbattle/Harepacker-resurrected) then transformed into JSON / PNG files. Some data is also fetched from external API [maplestory.io](https://maplestory.io/)

## Deployment

Deployed via Vercel.

## License

MIT

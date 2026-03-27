# MapleVault

MapleStory v83 data browser for equipment, mobs, and maps.
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

Data is sourced from MapleStory v83 .wz files using [HaRepacker](https://github.com/lastbattle/Harepacker-resurrected) then transformed into JSON / PNG files. Some data is also fetched from external API [maplestory.io](https://maplestory.io/)

## Notes

- UI is inspired by the original MapleStory client
- Not all data relationships are complete

## Deployment

Deployed via Vercel.

## License

MIT

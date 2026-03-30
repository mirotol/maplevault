import type {
  Item,
  MapDetail,
  MapLookup,
  Mob,
  MobDetail,
} from "../types/maple";

export type Region = "GMS" | "EMS" | "KMS";
export type Version = string; // e.g., "83", "89", etc.

const DEFAULT_REGION: Region = "GMS";
const DEFAULT_VERSION: Version = "83";

const BASE_URL = "https://maplestory.io/api";

let mapLookupCache: MapLookup | null = null;
let mobLookupCache: Record<number, string> | null = null;
const itemDetailCache = new Map<number, Item>();
const mobDetailCache = new Map<number, MobDetail>();
const mapDetailCache = new Map<number, MapDetail>();
const npcDetailCache = new Map<number, { name: string }>();
const itemRequests = new Map<number, Promise<Item | null>>();
const mobRequests = new Map<number, Promise<MobDetail | null>>();
const mapRequests = new Map<number, Promise<MapDetail | null>>();
const npcRequests = new Map<number, Promise<{ name: string } | null>>();
const CACHE_KEY = "map_lookup_v83";
const MOB_CACHE_KEY = "mob_lookup_v83";
const NPC_CACHE_KEY = "npc_lookup_v83";

export interface ApiConfig {
  region?: Region;
  version?: Version;
}

export async function fetchMaps(
  region: Region = DEFAULT_REGION,
  version: Version = DEFAULT_VERSION,
): Promise<MapLookup> {
  // If in-memory cache exists, use it
  if (mapLookupCache) return mapLookupCache;

  // Try localStorage if same version
  const stored = localStorage.getItem(CACHE_KEY);
  if (stored) {
    try {
      mapLookupCache = JSON.parse(stored);
      return mapLookupCache as MapLookup;
    } catch (e) {
      console.error("Failed to parse stored map lookup:", e);
    }
  }

  const url = `${BASE_URL}/${region.toLowerCase()}/${version}/map`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch maps: ${res.status}`);

  const data = await res.json();
  const lookup: MapLookup = {};

  for (const map of data) {
    if (!map.name) continue; // Skip maps with no name

    lookup[map.id.toString()] = {
      name: map.name,
      streetName: map.streetName || "Unknown Area",
    };
  }

  mapLookupCache = lookup;
  localStorage.setItem(CACHE_KEY, JSON.stringify(lookup));

  return lookup;
}

export function getMapInfo(mapId: number | string) {
  if (!mapLookupCache) return null;
  return mapLookupCache[mapId.toString()] || null;
}

export function getMapDisplay(mapId: number | string): string {
  const info = getMapInfo(mapId);
  if (!info) return mapId.toString();
  return `${info.streetName} - ${info.name}`;
}

export async function fetchMapDetail(
  mapId: number,
  region: Region = DEFAULT_REGION,
  version: Version = DEFAULT_VERSION,
): Promise<MapDetail | null> {
  const cached = mapDetailCache.get(mapId);
  if (cached) return cached;

  if (mapRequests.has(mapId)) return mapRequests.get(mapId) ?? null;

  const promise = (async () => {
    try {
      const url = `${BASE_URL}/${region.toLowerCase()}/${version}/map/${mapId}`;
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok)
        throw new Error(`Failed to fetch map ${mapId}: ${res.status}`);

      const data: MapDetail = await res.json();
      if (data) {
        mapDetailCache.set(mapId, data);
        // Also update NPC name lookup cache from the map detail if possible
        // Note: MapDetail usually doesn't have names, but some versions might.
        // For now we'll rely on fetchNpcName.
      }
      return data;
    } finally {
      mapRequests.delete(mapId);
    }
  })();

  mapRequests.set(mapId, promise);
  return promise;
}

let npcLookupCache: Record<number, string> | null = null;

export async function fetchNpcName(
  npcId: number,
  region: Region = DEFAULT_REGION,
  version: Version = DEFAULT_VERSION,
): Promise<string | null> {
  if (!npcLookupCache) {
    const stored = localStorage.getItem(NPC_CACHE_KEY);
    if (stored) {
      try {
        npcLookupCache = JSON.parse(stored);
      } catch (_e) {
        npcLookupCache = {};
      }
    } else {
      npcLookupCache = {};
    }
  }

  if (npcLookupCache?.[npcId]) {
    return npcLookupCache[npcId];
  }

  const cached = npcDetailCache.get(npcId);
  if (cached) return cached.name;

  if (npcRequests.has(npcId)) {
    const res = await npcRequests.get(npcId);
    return res?.name ?? null;
  }

  const promise = (async () => {
    try {
      const url = `${BASE_URL}/${region.toLowerCase()}/${version}/npc/${npcId}`;
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok)
        throw new Error(`Failed to fetch npc ${npcId}: ${res.status}`);

      const data = await res.json();
      if (data?.name) {
        npcDetailCache.set(npcId, { name: data.name });
        if (npcLookupCache) {
          npcLookupCache[npcId] = data.name;
          localStorage.setItem(NPC_CACHE_KEY, JSON.stringify(npcLookupCache));
        }
        return { name: data.name };
      }
      return null;
    } finally {
      npcRequests.delete(npcId);
    }
  })();

  npcRequests.set(npcId, promise);
  const result = await promise;
  return result?.name ?? null;
}

export function getNpcName(npcId: number): string | null {
  if (npcLookupCache?.[npcId]) {
    return npcLookupCache[npcId];
  }
  return null;
}

export function getMapMinimapUrl(
  mapId: number,
  region: Region = DEFAULT_REGION,
  version: Version = DEFAULT_VERSION,
): string {
  return `${BASE_URL}/${region.toLowerCase()}/${version}/map/${mapId}/minimap`;
}

export function getMapRenderUrl(
  mapId: number,
  region: Region = DEFAULT_REGION,
  version: Version = DEFAULT_VERSION,
): string {
  return `${BASE_URL}/${region.toLowerCase()}/${version}/map/${mapId}/render/0`;
}

export async function fetchMobs(
  startPosition = 0,
  config: ApiConfig = {},
): Promise<Mob[]> {
  const region = (config.region || DEFAULT_REGION).toLowerCase();
  const version = config.version || DEFAULT_VERSION;
  const url = `${BASE_URL}/${region}/${version}/mob?startPosition=${startPosition}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch mobs: ${res.status}`);
  const data: Mob[] = await res.json();
  const filtered = data.filter((mob) => mob.level >= 1);

  if (!mobLookupCache) {
    const stored = localStorage.getItem(MOB_CACHE_KEY);
    if (stored) {
      try {
        mobLookupCache = JSON.parse(stored);
      } catch (_e) {
        console.error("Failed to parse stored mob lookup:", _e);
        mobLookupCache = {};
      }
    } else {
      mobLookupCache = {};
    }
  }

  let cacheChanged = false;
  for (const mob of filtered) {
    if (mobLookupCache && !mobLookupCache[mob.id]) {
      mobLookupCache[mob.id] = mob.name;
      cacheChanged = true;
    }
  }

  if (cacheChanged) {
    localStorage.setItem(MOB_CACHE_KEY, JSON.stringify(mobLookupCache));
  }

  return filtered;
}

export function getMobName(mobId: number): string | null {
  if (mobLookupCache?.[mobId]) {
    return mobLookupCache[mobId];
  }
  return null;
}

export async function fetchMobDetail(
  mobId: number,
  region: Region = DEFAULT_REGION,
  version: Version = DEFAULT_VERSION,
): Promise<MobDetail | null> {
  // Use cache if available
  const cached = mobDetailCache.get(mobId);
  if (cached) return cached;

  // Deduplicate requests
  if (mobRequests.has(mobId)) return mobRequests.get(mobId) ?? null;

  const promise = (async () => {
    try {
      const url = `${BASE_URL}/${region.toLowerCase()}/${version}/mob/${mobId}`;
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok)
        throw new Error(`Failed to fetch mob ${mobId}: ${res.status}`);

      const data = await res.json();
      if (data) {
        mobDetailCache.set(mobId, data);
        // Also update mob name lookup cache
        if (!mobLookupCache) {
          const stored = localStorage.getItem(MOB_CACHE_KEY);
          if (stored) {
            try {
              mobLookupCache = JSON.parse(stored);
            } catch (_e) {
              mobLookupCache = {};
            }
          } else {
            mobLookupCache = {};
          }
        }
        if (mobLookupCache && !mobLookupCache[mobId]) {
          mobLookupCache[mobId] = data.name;
          localStorage.setItem(MOB_CACHE_KEY, JSON.stringify(mobLookupCache));
        }
      }
      return data;
    } finally {
      mobRequests.delete(mobId);
    }
  })();

  mobRequests.set(mobId, promise);
  return promise;
}

export function fetchMobIcon(
  mobId: number,
  region: Region = DEFAULT_REGION,
  version: Version = DEFAULT_VERSION,
): string {
  return `${BASE_URL}/${region.toLowerCase()}/${version}/mob/${mobId}/icon`;
}

export function fetchMobRenderUrl(
  mobId: number,
  region: Region = DEFAULT_REGION,
  version: Version = DEFAULT_VERSION,
  mode = "stand",
): string {
  return `${BASE_URL}/${region.toLowerCase()}/${version}/mob/${mobId}/render/${mode}`;
}

export async function fetchItems(
  startPosition = 0,
  config: ApiConfig = {},
  overallCategory?: string,
): Promise<Item[]> {
  const region = (config.region || DEFAULT_REGION).toLowerCase();
  const version = config.version || DEFAULT_VERSION;
  let url = `${BASE_URL}/${region}/${version}/item?startPosition=${startPosition}`;

  if (overallCategory) {
    url = `${BASE_URL}/${region}/${version}/item/category/${overallCategory}?startPosition=${startPosition}`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch items: ${res.status}`);
  return res.json();
}

export async function fetchItem(
  itemId: number,
  region: Region = DEFAULT_REGION,
  version: Version = DEFAULT_VERSION,
): Promise<Item | null> {
  // Use cache if available
  const cached = itemDetailCache.get(itemId);
  if (cached) return cached;

  // Deduplicate requests
  if (itemRequests.has(itemId)) return itemRequests.get(itemId) ?? null;

  const promise = (async () => {
    try {
      const url = `${BASE_URL}/${region.toLowerCase()}/${version}/item/${itemId}`;
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok)
        throw new Error(`Failed to fetch item ${itemId}: ${res.status}`);

      const data = await res.json();
      if (data) itemDetailCache.set(itemId, data);
      return data;
    } finally {
      itemRequests.delete(itemId);
    }
  })();

  itemRequests.set(itemId, promise);
  return promise;
}

export function getCachedItem(itemId: number): Item | null {
  return itemDetailCache.get(itemId) || null;
}

export function getCachedMobDetail(mobId: number): MobDetail | null {
  return mobDetailCache.get(mobId) || null;
}

export function fetchItemIcon(
  itemId: number,
  region: Region = DEFAULT_REGION,
  version: Version = DEFAULT_VERSION,
): string {
  return `${BASE_URL}/${region.toLowerCase()}/${version}/item/${itemId}/icon`;
}

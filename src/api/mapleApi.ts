import { withMinimumDelay } from "../utils/promise";
import type { Item, MapLookup, Mob, MobDetail } from "../types/maple";

export type Region = "GMS" | "EMS" | "KMS";
export type Version = string; // e.g., "83", "89", etc.

const DEFAULT_REGION: Region = "GMS";
const DEFAULT_VERSION: Version = "83";

const BASE_URL = "https://maplestory.io/api";

let mapLookupCache: MapLookup | null = null;
const CACHE_KEY = "map_lookup_v83";

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
    lookup[map.id.toString()] = {
      name: map.name,
      streetName: map.streetName,
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

export async function fetchMobs(
  startPosition = 0,
  config: ApiConfig = {},
): Promise<Mob[]> {
  const region = (config.region || DEFAULT_REGION).toLowerCase();
  const version = config.version || DEFAULT_VERSION;
  const url = `${BASE_URL}/${region}/${version}/mob?startPosition=${startPosition}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch mobs: ${res.status}`);
  const data: Mob[] = await withMinimumDelay(res.json());
  return data.filter((mob) => mob.level >= 1);
}

export async function fetchMobDetail(
  mobId: number,
  region: Region = DEFAULT_REGION,
  version: Version = DEFAULT_VERSION,
): Promise<MobDetail | null> {
  const url = `${BASE_URL}/${region.toLowerCase()}/${version}/mob/${mobId}`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch mob ${mobId}: ${res.status}`);
  return withMinimumDelay(res.json());
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
): Promise<Item[]> {
  const region = (config.region || DEFAULT_REGION).toLowerCase();
  const version = config.version || DEFAULT_VERSION;
  const url = `${BASE_URL}/${region}/${version}/item?startPosition=${startPosition}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch items: ${res.status}`);
  return withMinimumDelay(res.json());
}

export async function fetchItem(
  itemId: number,
  region: Region = DEFAULT_REGION,
  version: Version = DEFAULT_VERSION,
): Promise<Item | null> {
  const url = `${BASE_URL}/${region.toLowerCase()}/${version}/item/${itemId}`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch item ${itemId}: ${res.status}`);
  return withMinimumDelay(res.json());
}

export function fetchItemIcon(
  itemId: number,
  region: Region = DEFAULT_REGION,
  version: Version = DEFAULT_VERSION,
): string {
  return `${BASE_URL}/${region.toLowerCase()}/${version}/item/${itemId}/icon`;
}

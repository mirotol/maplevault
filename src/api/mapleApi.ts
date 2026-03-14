import type { Item, Mob, MobDetail } from "../types/maple";

export type Region = "GMS" | "EMS" | "KMS";
export type Version = string; // e.g., "83", "89", etc.

const DEFAULT_REGION: Region = "GMS";
const DEFAULT_VERSION: Version = "83";

const BASE_URL = "https://maplestory.io/api";

export interface ApiConfig {
  region?: Region;
  version?: Version;
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
  return res.json();
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
  return res.json();
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
  return res.json();
}

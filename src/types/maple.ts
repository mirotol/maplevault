export interface WorldMapPath {
  Image?: string;
  OriginX: number;
  OriginY: number;
  Z: number;
}

export interface WorldMapNode {
  MapId: number;
  Type: number;
  X: number;
  Y: number;
  StreetName?: string | null;
  MapName?: string | null;
  Description?: string | null;
  Paths?: WorldMapPath[];
}

export interface WorldMapLink {
  Image?: string;
  Target?: string;
  Tooltip?: string | null;
  OriginX: number;
  OriginY: number;
  Z: number;
}

export interface WorldMapData {
  Name: string;
  BaseImage?: string;
  Maps: WorldMapNode[];
  Links: WorldMapLink[];
}

export interface MapInfo {
  name: string;
  streetName: string;
}

export type MapLookup = Record<string, MapInfo>;

export interface Mob {
  id: number;
  name: string;
  mobType: string | number;
  level: number;
  isBoss: boolean;
}

export interface MobMeta {
  isBodyAttack?: boolean;
  level?: number;
  maxHP?: number;
  maxMP?: number;
  speed?: number;
  physicalDamage?: number;
  physicalDefense?: number;
  magicDamage?: number;
  magicDefense?: number;
  accuracy?: number;
  evasion?: number;
  exp?: number;
  isUndead?: boolean;
  minimumPushDamage?: number;
  elementalAttributes?: string;
  summonType?: number;
  revivesMonsterId?: number[];
}

export interface MobFramebooks {
  die1: number;
  hit1: number;
  move: number;
  stand: number;
  [key: string]: number; // for any other animation frames
}

export interface MobDetail {
  id: number;
  name: string;
  description: string;
  meta?: MobMeta;
  framebooks: MobFramebooks;
  foundAt: number[]; // maps/map IDs where it can spawn
}

export interface Item {
  id: number;
  name: string;
  desc: string;
  isCash: boolean;
  requiredJobs: string[];
  requiredLevel: number;
  requiredGender: number;
  typeInfo: ItemTypeInfo;
  metaInfo?: ItemMeta;
}

export interface ItemMeta {
  only?: boolean;
  tradeBlock?: boolean;
  price?: number;
  incPAD?: number;
  incMAD?: number;
  incSTR?: number;
  incDEX?: number;
  incINT?: number;
  incLUK?: number;
  incMHP?: number;
  incMMP?: number;
  incPDD?: number;
  incMDD?: number;
  incACC?: number;
  incEVA?: number;
  incSpeed?: number;
  incJump?: number;
  reqLevel?: number;
  reqSTR?: number;
  reqDEX?: number;
  reqINT?: number;
  reqLUK?: number;
  tuc?: number;
  attackSpeed?: number;
}

export interface ItemTypeInfo {
  overallCategory: string;
  category: string;
  subCategory: string;
  lowItemId: number;
  highItemId: number;
}

export interface NpcPlacement {
  mapId: number;
  mapName: string;
  streetName: string;
  x: number;
  y: number;
  flip: boolean;
  footholdId: number | null;
}

export interface MapNpcRelation {
  mapId: number;
  mapName: string;
  streetName: string;
  npcs: {
    id: number;
    x: number;
    y: number;
    flip: boolean;
    footholdId: number | null;
  }[];
}

export interface NpcLookupJson {
  generatedAt: string;
  version: string;
  totalNpcs: number;
  totalPlacements: number;
  npcs: Record<string, NpcPlacement[]>;
}

export interface MapRelationsJson {
  generatedAt: string;
  version: string;
  totalMaps: number;
  mapsWithNpcs: number;
  relations: MapNpcRelation[];
}

export interface MapMob {
  id: number;
  x: number;
  y: number;
  isBoss?: boolean;
}

export interface Npc {
  id: number;
  name?: string;
}

export interface NpcDetail {
  id: number;
  name?: string;
  isShop: boolean;
  function?: string;
  dialogue?: Record<string, string>;
  foundAt: { id: number }[];
  relatedQuests?: number[];
  framebooks?: {
    stand: number;
  };
}

export interface MapNpc {
  id: number;
  x: number;
  y: number;
}

export interface MapDetail {
  id: number;
  name: string;
  streetName: string;
  mobs: MapMob[];
  npcs: MapNpc[];
}

export interface MonsterReward {
  ItemId: number;
  Name: string;
  Type: "Equip" | "Consume" | "Etc" | "Setup";
}

export interface MonsterBookEntry {
  MobId: number;
  Name: string;
  Rewards: MonsterReward[];
}

export type MonsterBookJson = MonsterBookEntry[];

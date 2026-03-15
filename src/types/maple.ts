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
}

export interface ItemTypeInfo {
  overallCategory: string;
  category: string;
  subCategory: string;
  lowItemId: number;
  highItemId: number;
}

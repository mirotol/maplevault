import type { ItemMeta } from "../types/maple";

export const SIMULATOR_ITEMS = [
  { id: 1082002, name: "Work Gloves", defaultSlots: 5 },
  { id: 1082149, name: "Brown Work Gloves", defaultSlots: 5 },
  { id: 1082223, name: "Stormcaster Gloves", defaultSlots: 5 },
  { id: 1002357, name: "Zakum Helmet", defaultSlots: 10 },
  { id: 1102041, name: "Pink Adventurer Cape", defaultSlots: 5 },
  { id: 1072344, name: "Facestompers", defaultSlots: 5 },
  { id: 1122000, name: "Horntail Necklace", defaultSlots: 3 },
];

export type Scroll = {
  name: string;
  successRate: number;
  boomRate: number;
  stats: Partial<ItemMeta>;
  isChaos?: boolean;
  isCleanSlate?: boolean;
  color: string;
};

export const SCROLLS: Scroll[] = [
  {
    name: "100%",
    successRate: 1.0,
    boomRate: 0,
    stats: {
      incPAD: 1,
      incMAD: 1,
      incSTR: 1,
      incDEX: 1,
      incINT: 1,
      incLUK: 1,
    },
    color: "bg-blue-500/20",
  },
  {
    name: "70%",
    successRate: 0.7,
    boomRate: 0.15,
    stats: {
      incPAD: 2,
      incMAD: 2,
      incSTR: 2,
      incDEX: 2,
      incINT: 2,
      incLUK: 2,
    },
    color: "bg-green-500/20",
  },
  {
    name: "60%",
    successRate: 0.6,
    boomRate: 0,
    stats: {
      incPAD: 2,
      incMAD: 2,
      incSTR: 2,
      incDEX: 2,
      incINT: 2,
      incLUK: 2,
    },
    color: "bg-yellow-500/20",
  },
  {
    name: "30%",
    successRate: 0.3,
    boomRate: 0.5,
    stats: {
      incPAD: 3,
      incMAD: 3,
      incSTR: 3,
      incDEX: 3,
      incINT: 3,
      incLUK: 3,
    },
    color: "bg-orange-500/20",
  },
  {
    name: "10%",
    successRate: 0.1,
    boomRate: 0.5,
    stats: {
      incPAD: 5,
      incMAD: 5,
      incSTR: 5,
      incDEX: 5,
      incINT: 5,
      incLUK: 5,
    },
    color: "bg-red-500/20",
  },
  {
    name: "Chaos",
    isChaos: true,
    successRate: 0.6,
    boomRate: 0,
    stats: {},
    color: "bg-purple-500/20",
  },
  {
    name: "Clean Slate",
    isCleanSlate: true,
    successRate: 0.1,
    boomRate: 0.1,
    stats: {},
    color: "bg-slate-500/20",
  },
];

export type LogEntry = {
  id: number;
  scrollName: string;
  result: "SUCCESS" | "FAIL" | "BOOM";
  statChanges: string;
  timestamp: Date;
};

export const STAT_LABELS: Partial<Record<keyof ItemMeta, string>> = {
  incSTR: "STR",
  incDEX: "DEX",
  incINT: "INT",
  incLUK: "LUK",
  incPAD: "Weapon Attack",
  incMAD: "Magic Attack",
  incPDD: "Weapon Defense",
  incMDD: "Magic Defense",
  incACC: "Accuracy",
  incEVA: "Evasion",
  incSpeed: "Speed",
  incJump: "Jump",
  incMHP: "HP",
  incMMP: "MP",
};

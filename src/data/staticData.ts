import type {
  MapRelationsJson,
  MonsterBookJson,
  NpcLookupJson,
} from "../types/maple";
import monsterBookRaw from "./monsterbook.json";
import npcLookupRaw from "./npc_lookup_gms83.json";
import mapRelationsRaw from "./npc_map_relations_gms83.json";

export const npcLookupJson = npcLookupRaw as NpcLookupJson;
export const mapRelationsJson = mapRelationsRaw as MapRelationsJson;
export const monsterBookJson = monsterBookRaw as MonsterBookJson;

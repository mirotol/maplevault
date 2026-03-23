import type { MapRelationsJson, NpcLookupJson } from "../types/maple";
import npcLookupRaw from "./npc_lookup_gms83.json";
import mapRelationsRaw from "./npc_map_relations_gms83.json";

export const npcLookupJson = npcLookupRaw as NpcLookupJson;
export const mapRelationsJson = mapRelationsRaw as MapRelationsJson;

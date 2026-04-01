import { createContext, useContext, useMemo } from "react";
import type {
  MapNpcRelation,
  MonsterReward,
  NpcPlacement,
} from "../types/maple";
import { mapRelationsJson, monsterBookJson, npcLookupJson } from "./staticData";

interface MapleDataContext {
  npcToMaps: Map<number, NpcPlacement[]>;
  mapToNpcs: Map<number, MapNpcRelation>;
  monsterBook: Map<number, MonsterReward[]>;
}

const MapleDataContext = createContext<MapleDataContext | null>(null);

export function MapleDataProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => {
    const npcToMaps = new Map<number, NpcPlacement[]>(
      Object.entries(npcLookupJson.npcs).map(([id, maps]) => [
        Number(id),
        maps,
      ]),
    );
    const mapToNpcs = new Map<number, MapNpcRelation>(
      mapRelationsJson.relations.map((r) => [r.mapId, r]),
    );
    const monsterBook = new Map<number, MonsterReward[]>(
      monsterBookJson.map((entry) => [entry.MobId, entry.Rewards]),
    );
    return { npcToMaps, mapToNpcs, monsterBook };
  }, []);

  return (
    <MapleDataContext.Provider value={value}>
      {children}
    </MapleDataContext.Provider>
  );
}

export function useMapleData(): MapleDataContext {
  const ctx = useContext(MapleDataContext);
  if (!ctx)
    throw new Error("useMapleData must be used inside MapleDataProvider");
  return ctx;
}

import { createContext, useContext, useMemo } from "react";
import type {
  MapNpcRelation,
  MobDrop,
  MonsterReward,
  NpcPlacement,
} from "../types/maple";
import {
  itemDropLookupJson,
  mapRelationsJson,
  monsterBookJson,
  npcLookupJson,
} from "./staticData";

interface MapleDataContext {
  npcToMaps: Map<number, NpcPlacement[]>;
  mapToNpcs: Map<number, MapNpcRelation>;
  monsterBook: Map<number, MonsterReward[]>;
  itemToMobs: Map<number, MobDrop[]>;
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
    const itemToMobs = new Map<number, MobDrop[]>(
      itemDropLookupJson.map((entry) => [entry.ItemId, entry.DroppedBy]),
    );
    return { npcToMaps, mapToNpcs, monsterBook, itemToMobs };
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

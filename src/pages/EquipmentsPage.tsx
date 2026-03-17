import { Database } from "lucide-react";
import { useEffect } from "react";
import EquipmentCard from "../components/EquipmentCard";

const MOCK_EQUIPMENTS = [
  {
    name: "Dragon Slayer",
    icon: "https://maplestory.io/api/gms/83/item/1402037/icon",
    stats: {
      incPAD: 105,
      incSTR: 5,
      incSpeed: 10,
    },
    requirements: {
      level: 100,
      str: 300,
      dex: 0,
      int: 0,
      luk: 0,
    },
    description: "A legendary sword forged from dragon scales. It is said to have the power to pierce through any armor.",
    requiredJobs: ["WARRIOR"],
  },
  {
    name: "Infinity Staff",
    icon: "https://maplestory.io/api/gms/83/item/1382039/icon",
    stats: {
      incMAD: 120,
      incINT: 8,
      incMMP: 200,
    },
    requirements: {
      level: 80,
      str: 0,
      dex: 0,
      int: 250,
      luk: 0,
    },
    description: "A staff that resonates with the infinite energy of the cosmos.",
    requiredJobs: ["MAGICIAN"],
  },
  {
    name: "Dark Ritual Cape",
    icon: "https://maplestory.io/api/gms/83/item/1102040/icon",
    stats: {
      incLUK: 10,
      incEVA: 15,
      incPDD: 25,
    },
    requirements: {
      level: 70,
      str: 0,
      dex: 0,
      int: 0,
      luk: 180,
    },
    description: "A cape worn during forbidden rituals. It feels cold to the touch.",
    requiredJobs: ["THIEF"],
  },
  {
    name: "Stormcaster Gloves",
    icon: "https://maplestory.io/api/gms/83/item/1082149/icon",
    stats: {
      incPAD: 5,
      incMAD: 5,
      incACC: 10,
    },
    requirements: {
      level: 50,
      str: 0,
      dex: 0,
      int: 0,
      luk: 0,
    },
    description: "Gloves that crackle with static electricity.",
    requiredJobs: ["ALL JOBS"],
  },
];

const EquipmentsPage = () => {
  useEffect(() => {
    document.title = "Equipment | MapleVault";
  }, []);

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-semibold mb-6 flex items-center gap-2">
          <Database className="w-8 h-8 text-(--color-accent)" />
          Equipment List
        </h2>
      </div>

      <div className="flex flex-wrap gap-8 justify-center md:justify-start">
        {MOCK_EQUIPMENTS.map((equip, index) => (
          <EquipmentCard
            key={index}
            name={equip.name}
            icon={equip.icon}
            stats={equip.stats}
            requirements={equip.requirements}
            description={equip.description}
            requiredJobs={equip.requiredJobs}
          />
        ))}
      </div>
    </>
  );
};

export default EquipmentsPage;

import { Database, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMobs } from "../api/mapleApi";
import MobCard from "../components/MobCard";
import MobModal from "../components/MobModal";
import type { Mob } from "../types/maple";

const MonstersPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mobs, setMobs] = useState<Mob[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [startPosition, setStartPosition] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);

  const selectedMob = id ? mobs.find((m) => m.id === Number(id)) : null;

  const handleCloseModal = () => {
    navigate("/monsters");
  };

  const handleSelectMob = (mob: Mob) => {
    navigate(`/mob/${mob.id}`);
  };

  const lastMobElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setStartPosition((prev) => prev + 100);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchMobs(startPosition)
      .then((newMobs) => {
        if (!active) return;
        setMobs((prev) => {
          const all = [...prev, ...newMobs];
          const unique = [];
          const seen = new Set();
          for (const m of all) {
            if (!seen.has(m.id)) {
              seen.add(m.id);
              unique.push(m);
            }
          }
          return unique;
        });
        setHasMore(newMobs.length > 0);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to fetch mobs:", err);
        setHasMore(false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [startPosition]);

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Database className="w-6 h-6 text-(--color-accent)" />
          Monster List
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {mobs.map((mob, index) => {
          if (mobs.length === index + 1) {
            return (
              <div ref={lastMobElementRef} key={mob.id}>
                <MobCard mob={mob} onClick={() => handleSelectMob(mob)} />
              </div>
            );
          }
          return (
            <MobCard
              key={mob.id}
              mob={mob}
              onClick={() => handleSelectMob(mob)}
            />
          );
        })}
      </div>

      {id && (
        <MobModal
          mobId={Number(id)}
          initialMob={selectedMob || undefined}
          onClose={handleCloseModal}
        />
      )}

      {loading && (
        <div className="flex justify-center items-center p-8 mt-4">
          <Loader2 className="w-8 h-8 animate-spin text-(--color-accent)" />
        </div>
      )}

      {!hasMore && mobs.length > 0 && (
        <p className="text-center p-8 opacity-50">No more monsters to load.</p>
      )}

      {!loading && mobs.length === 0 && (
        <p className="text-center p-8 opacity-50">No monsters found.</p>
      )}
    </>
  );
};

export default MonstersPage;

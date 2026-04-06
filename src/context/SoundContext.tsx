import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface SoundContextType {
  isSoundEnabled: boolean;
  toggleSound: () => void;
  playSound: (soundPath: string) => void;
  preloadSound: (soundPath: string) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("isSoundEnabled");
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      console.error("Failed to parse isSoundEnabled from localStorage", e);
      return true;
    }
  });

  const soundCache = useRef<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    localStorage.setItem("isSoundEnabled", JSON.stringify(isSoundEnabled));
  }, [isSoundEnabled]);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => !prev);
  }, []);

  const getAudio = useCallback((soundPath: string) => {
    let audio = soundCache.current.get(soundPath);
    if (!audio) {
      audio = new Audio(soundPath);
      audio.preload = "auto";
      soundCache.current.set(soundPath, audio);
    }
    return audio;
  }, []);

  const preloadSound = useCallback(
    (soundPath: string) => {
      getAudio(soundPath).load();
    },
    [getAudio],
  );

  const playSound = useCallback(
    (soundPath: string) => {
      if (!isSoundEnabled) return;

      const audio = getAudio(soundPath);

      // Clone the audio node to allow overlapping sounds and avoid state conflicts
      // that might cause delays in seeking/playing on the same element.
      const clone = audio.cloneNode(true) as HTMLAudioElement;
      clone.play().catch((err) => {
        console.warn("Failed to play sound:", err);
      });
    },
    [isSoundEnabled, getAudio],
  );

  return (
    <SoundContext.Provider
      value={{ isSoundEnabled, toggleSound, playSound, preloadSound }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
};

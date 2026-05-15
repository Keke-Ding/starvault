import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useSound } from '@/hooks/useSound';

interface SoundContextType {
  playHover: () => void;
  playClick: () => void;
  playCreate: () => void;
  playDelete: () => void;
  playOpen: () => void;
  playClose: () => void;
  playNotification: () => void;
  playTransition: () => void;
  playToggleOn: () => void;
  playToggleOff: () => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export function useAppSound() {
  const ctx = useContext(SoundContext);
  return ctx || ({} as SoundContextType);
}

export default function SoundProvider({ children }: { children: ReactNode }) {
  const sound = useSound();

  useEffect(() => {
    const handleFirstInteraction = () => {
      sound.init();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [sound]);

  return (
    <SoundContext.Provider
      value={{
        playHover: sound.playHover,
        playClick: sound.playClick,
        playCreate: sound.playCreate,
        playDelete: sound.playDelete,
        playOpen: sound.playOpen,
        playClose: sound.playClose,
        playNotification: sound.playNotification,
        playTransition: sound.playTransition,
        playToggleOn: sound.playToggleOn,
        playToggleOff: sound.playToggleOff,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}
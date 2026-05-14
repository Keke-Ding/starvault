import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { THEME_PRESETS } from '@/types';
import ParticleBackground from '@/components/ParticleBackground';
import SettingsPanel from '@/components/SettingsPanel';
import KnowledgeSquare from '@/pages/KnowledgeSquare';
import KnowledgeDetail from '@/pages/KnowledgeDetail';
import CardEditor from '@/pages/CardEditor';

function App() {
  const settings = useStore((s) => s.settings);
  const isSettingsOpen = useStore((s) => s.isSettingsOpen);
  const closeSettings = useStore((s) => s.closeSettings);

  const theme = THEME_PRESETS.find((t) => t.id === settings.themeId) || THEME_PRESETS[0];

  useEffect(() => {
    document.body.style.fontFamily = settings.fontFamily;
  }, [settings.fontFamily]);

  return (
    <BrowserRouter>
      <div
        className="relative min-h-screen"
        style={{ fontFamily: settings.fontFamily }}
      >
        <ParticleBackground
          themeId={settings.themeId}
          backgroundImage={settings.backgroundImage}
          backgroundOpacity={settings.backgroundOpacity}
        />

        <Routes>
          <Route path="/" element={<KnowledgeSquare />} />
          <Route path="/detail/:id" element={<KnowledgeDetail />} />
          <Route path="/editor" element={<CardEditor />} />
          <Route path="/editor/:id" element={<CardEditor />} />
        </Routes>

        {isSettingsOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={closeSettings}
          />
        )}

        <SettingsPanel />
      </div>
    </BrowserRouter>
  );
}

export default App;
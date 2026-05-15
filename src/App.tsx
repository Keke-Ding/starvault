import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import ParticleBackground from '@/components/ParticleBackground';
import SettingsPanel from '@/components/SettingsPanel';
import KnowledgeSquare from '@/pages/KnowledgeSquare';
import KnowledgeDetail from '@/pages/KnowledgeDetail';
import CardEditor from '@/pages/CardEditor';

function App() {
  const settings = useStore((s) => s.settings);

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
          customBgColor={settings.customBgColor}
        />

        <Routes>
          <Route path="/" element={<KnowledgeSquare />} />
          <Route path="/detail/:id" element={<KnowledgeDetail />} />
          <Route path="/editor" element={<CardEditor />} />
          <Route path="/editor/:id" element={<CardEditor />} />
        </Routes>

        <SettingsPanel />
      </div>
    </BrowserRouter>
  );
}

export default App;
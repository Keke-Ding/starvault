import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import ParticleBackground from '@/components/ParticleBackground';
import SettingsPanel from '@/components/SettingsPanel';
import SoundProvider from '@/components/SoundProvider';
import KnowledgeSquare from '@/pages/KnowledgeSquare';

const KnowledgeDetail = lazy(() => import('@/pages/KnowledgeDetail'));
const CardEditor = lazy(() => import('@/pages/CardEditor'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
    </div>
  );
}

function App() {
  const settings = useStore((s) => s.settings);
  const initBackend = useStore((s) => s.initBackend);

  useEffect(() => {
    initBackend();
  }, [initBackend]);

  return (
    <BrowserRouter>
      <SoundProvider>
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

          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<KnowledgeSquare />} />
              <Route path="/detail/:id" element={<KnowledgeDetail />} />
              <Route path="/editor" element={<CardEditor />} />
              <Route path="/editor/:id" element={<CardEditor />} />
            </Routes>
          </Suspense>

          <SettingsPanel />
        </div>
      </SoundProvider>
    </BrowserRouter>
  );
}

export default App;
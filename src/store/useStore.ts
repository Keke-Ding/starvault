import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { KnowledgeCard, UserSettings } from '@/types';
import { generateId } from '@/types';
import { api, isBackendAvailable } from '@/services/api';

interface AppStore {
  cards: KnowledgeCard[];
  settings: UserSettings;
  isSettingsOpen: boolean;
  searchQuery: string;
  activeCategory: string;
  backendReady: boolean;

  initBackend: () => Promise<void>;
  addCard: (card: Omit<KnowledgeCard, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCard: (id: string, card: Partial<KnowledgeCard>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => void;
  setSearchQuery: (query: string) => void;
  setActiveCategory: (category: string) => void;
  toggleSettings: () => void;
  closeSettings: () => void;
  exportData: () => Promise<string>;
  importData: (json: string) => Promise<boolean>;
}

const defaultSettings: UserSettings = {
  backgroundImage: null,
  backgroundOpacity: 0.85,
  customBgColor: null,
  fontFamily: "'Noto Sans SC', sans-serif",
  themeId: 'starnight',
  viewMode: 'grid',
};

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      cards: [],
      settings: defaultSettings,
      isSettingsOpen: false,
      searchQuery: '',
      activeCategory: '全部',
      backendReady: false,

      initBackend: async () => {
        const available = await isBackendAvailable();
        if (available) {
          try {
            const [cards, settings] = await Promise.all([
              api.getCards(),
              api.getSettings(),
            ]);
            const mergedSettings: UserSettings = {
              ...defaultSettings,
              ...get().settings,
            };
            if (settings.fontFamily) mergedSettings.fontFamily = settings.fontFamily;
            if (settings.themeId) mergedSettings.themeId = settings.themeId;
            if (settings.viewMode) mergedSettings.viewMode = settings.viewMode as 'grid' | 'list';
            if (settings.backgroundImage) mergedSettings.backgroundImage = settings.backgroundImage;
            if (settings.customBgColor) mergedSettings.customBgColor = settings.customBgColor;
            if (settings.backgroundOpacity)
              mergedSettings.backgroundOpacity = parseFloat(settings.backgroundOpacity);

            set({ cards: cards.length > 0 ? cards : get().cards, settings: mergedSettings, backendReady: true });

            if (cards.length === 0 && get().cards.length > 0) {
              for (const card of get().cards) {
                await api.createCard(card).catch(() => {});
              }
            }
          } catch {
            set({ backendReady: false });
          }
        }
      },

      addCard: async (cardData) => {
        const now = new Date().toISOString();
        const card: KnowledgeCard = {
          ...cardData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ cards: [card, ...state.cards] }));

        if (get().backendReady) {
          api.createCard(card).catch(() => {});
        }
      },

      updateCard: async (id, updates) => {
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id
              ? { ...card, ...updates, updatedAt: new Date().toISOString() }
              : card
          ),
        }));

        if (get().backendReady) {
          api.updateCard(id, updates).catch(() => {});
        }
      },

      deleteCard: async (id) => {
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
        }));

        if (get().backendReady) {
          api.deleteCard(id).catch(() => {});
        }
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));

        const updated = { ...get().settings };
        if (get().backendReady) {
          api
            .updateSettings({
              fontFamily: updated.fontFamily,
              themeId: updated.themeId,
              viewMode: updated.viewMode,
              backgroundOpacity: String(updated.backgroundOpacity),
              ...(updated.backgroundImage ? { backgroundImage: updated.backgroundImage } : {}),
              ...(updated.customBgColor ? { customBgColor: updated.customBgColor } : {}),
            })
            .catch(() => {});
        }
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setActiveCategory: (category) => set({ activeCategory: category }),
      toggleSettings: () =>
        set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
      closeSettings: () => set({ isSettingsOpen: false }),

      exportData: async () => {
        if (get().backendReady) {
          try {
            return await api.exportData();
          } catch {}
        }
        const state = get();
        return JSON.stringify(
          { cards: state.cards, settings: state.settings },
          null,
          2
        );
      },

      importData: async (json) => {
        try {
          const data = JSON.parse(json);
          if (!data.cards || !Array.isArray(data.cards)) return false;

          if (get().backendReady) {
            await api.importData(data);
            const [cards, settings] = await Promise.all([
              api.getCards(),
              api.getSettings(),
            ]);
            const mergedSettings = { ...defaultSettings, ...get().settings };
            if (settings.fontFamily) mergedSettings.fontFamily = settings.fontFamily;
            if (settings.themeId) mergedSettings.themeId = settings.themeId;
            set({ cards, settings: mergedSettings });
          } else {
            set({
              cards: data.cards,
              settings: data.settings
                ? { ...defaultSettings, ...data.settings }
                : defaultSettings,
            });
          }
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'starvault-storage',
      partialize: (state) => ({
        cards: state.cards,
        settings: state.settings,
      }),
    }
  )
);
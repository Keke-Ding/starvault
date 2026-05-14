import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { KnowledgeCard, UserSettings } from '@/types';
import { generateId } from '@/types';

interface AppStore {
  cards: KnowledgeCard[];
  settings: UserSettings;
  isSettingsOpen: boolean;
  searchQuery: string;
  activeCategory: string;

  addCard: (card: Omit<KnowledgeCard, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCard: (id: string, card: Partial<KnowledgeCard>) => void;
  deleteCard: (id: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  setSearchQuery: (query: string) => void;
  setActiveCategory: (category: string) => void;
  toggleSettings: () => void;
  closeSettings: () => void;
  exportData: () => string;
  importData: (json: string) => boolean;
}

const defaultSettings: UserSettings = {
  backgroundImage: null,
  backgroundOpacity: 0.85,
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

      addCard: (cardData) => {
        const now = new Date().toISOString();
        const card: KnowledgeCard = {
          ...cardData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ cards: [card, ...state.cards] }));
      },

      updateCard: (id, updates) => {
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id
              ? { ...card, ...updates, updatedAt: new Date().toISOString() }
              : card
          ),
        }));
      },

      deleteCard: (id) => {
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
        }));
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setActiveCategory: (category) => set({ activeCategory: category }),

      toggleSettings: () =>
        set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

      closeSettings: () => set({ isSettingsOpen: false }),

      exportData: () => {
        const state = get();
        return JSON.stringify(
          { cards: state.cards, settings: state.settings },
          null,
          2
        );
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          if (data.cards && Array.isArray(data.cards)) {
            set({
              cards: data.cards,
              settings: data.settings
                ? { ...defaultSettings, ...data.settings }
                : defaultSettings,
            });
            return true;
          }
          return false;
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
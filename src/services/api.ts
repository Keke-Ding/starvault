import type { KnowledgeCard } from '@/types';

const API_BASE = 'http://localhost:3001/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getCards: () => request<KnowledgeCard[]>('/cards'),

  getCard: (id: string) => request<KnowledgeCard>(`/cards/${id}`),

  createCard: (card: KnowledgeCard) =>
    request<{ success: boolean }>('/cards', {
      method: 'POST',
      body: JSON.stringify(card),
    }),

  updateCard: (id: string, data: Partial<KnowledgeCard>) =>
    request<{ success: boolean }>(`/cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCard: (id: string) =>
    request<{ success: boolean }>(`/cards/${id}`, { method: 'DELETE' }),

  getSettings: () => request<Record<string, string>>('/settings'),

  updateSettings: (settings: Record<string, string>) =>
    request<{ success: boolean }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  exportData: () =>
    fetch(`${API_BASE}/export`).then((res) => res.text()),

  importData: (data: any) =>
    request<{ success: boolean }>('/import', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export function isBackendAvailable(): Promise<boolean> {
  return fetch(`${API_BASE}/cards`)
    .then((res) => res.ok)
    .catch(() => false);
}
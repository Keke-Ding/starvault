import fs from 'fs';
import path from 'path';

function getDbPath(): string {
  try {
    const { app } = require('electron');
    if (app) {
      return path.join(app.getPath('userData'), 'starvault-data.json');
    }
  } catch {}
  return path.join(process.cwd(), 'starvault-data.json');
}

interface CardData {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface StoreData {
  cards: CardData[];
  settings: Record<string, string>;
}

function readStore(): StoreData {
  try {
    if (fs.existsSync(dbPath)) {
      const raw = fs.readFileSync(dbPath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {}
  return { cards: [], settings: {} };
}

function writeStore(data: StoreData): void {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

const dbPath = getDbPath();

export function getAllCards(): CardData[] {
  const store = readStore();
  return store.cards.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getCardById(id: string): CardData | undefined {
  const store = readStore();
  return store.cards.find((c) => c.id === id);
}

export function createCard(card: CardData): void {
  const store = readStore();
  const existing = store.cards.findIndex((c) => c.id === card.id);
  if (existing >= 0) {
    store.cards[existing] = card;
  } else {
    store.cards.push(card);
  }
  writeStore(store);
}

export function updateCard(
  id: string,
  data: { title?: string; content?: string; tags?: string[]; category?: string }
): boolean {
  const store = readStore();
  const idx = store.cards.findIndex((c) => c.id === id);
  if (idx < 0) return false;

  store.cards[idx] = {
    ...store.cards[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  writeStore(store);
  return true;
}

export function deleteCard(id: string): boolean {
  const store = readStore();
  const len = store.cards.length;
  store.cards = store.cards.filter((c) => c.id !== id);
  if (store.cards.length === len) return false;
  writeStore(store);
  return true;
}

export function getSetting(key: string): string | null {
  const store = readStore();
  return store.settings[key] ?? null;
}

export function setSetting(key: string, value: string): void {
  const store = readStore();
  store.settings[key] = value;
  writeStore(store);
}

export function getAllSettings(): Record<string, string> {
  const store = readStore();
  return { ...store.settings };
}

export function exportAllData(): string {
  const store = readStore();
  return JSON.stringify({ cards: store.cards, settings: store.settings }, null, 2);
}

export function importAllData(json: string): boolean {
  try {
    const data = JSON.parse(json);
    if (!data.cards || !Array.isArray(data.cards)) return false;
    writeStore({
      cards: data.cards,
      settings: data.settings || {},
    });
    return true;
  } catch {
    return false;
  }
}
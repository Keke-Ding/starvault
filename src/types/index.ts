export interface KnowledgeCard {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  backgroundImage: string | null;
  backgroundOpacity: number;
  fontFamily: string;
  themeId: string;
  viewMode: 'grid' | 'list';
}

export interface ThemePreset {
  id: string;
  name: string;
  bgColor: string;
  accentColor: string;
  secondaryColor: string;
  description: string;
}

export interface FontPreset {
  id: string;
  name: string;
  cssFamily: string;
  description: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'starnight',
    name: '星穹暗夜',
    bgColor: '#0f0f1a',
    accentColor: '#00f0ff',
    secondaryColor: '#ff2d95',
    description: '默认赛博朋克风格',
  },
  {
    id: 'sakura',
    name: '樱花落',
    bgColor: '#1a0a1a',
    accentColor: '#ff6b9d',
    secondaryColor: '#ffb347',
    description: '柔和粉色主题',
  },
  {
    id: 'aurora',
    name: '极光森林',
    bgColor: '#0a1a0f',
    accentColor: '#00ff88',
    secondaryColor: '#7c3aed',
    description: '自然绿色主题',
  },
  {
    id: 'dusk',
    name: '黄昏幻境',
    bgColor: '#1a0f0a',
    accentColor: '#ff8c00',
    secondaryColor: '#ff2d95',
    description: '温暖橙色主题',
  },
];

export const FONT_PRESETS: FontPreset[] = [
  {
    id: 'noto',
    name: '星穹默认',
    cssFamily: "'Noto Sans SC', sans-serif",
    description: '现代简约日系风格',
  },
  {
    id: 'pixel',
    name: '像素物语',
    cssFamily: "'Press Start 2P', monospace",
    description: '复古像素游戏风格',
  },
  {
    id: 'xiaowei',
    name: '墨韵手书',
    cssFamily: "'ZCOOL XiaoWei', serif",
    description: '中文手写韵味',
  },
  {
    id: 'mplus',
    name: '樱花细体',
    cssFamily: "'M PLUS Rounded 1c', sans-serif",
    description: '圆体日系可爱风',
  },
  {
    id: 'rajdhani',
    name: '刀锋锐体',
    cssFamily: "'Rajdhani', sans-serif",
    description: '赛博朋克科技感',
  },
];

export const DEFAULT_CATEGORIES = [
  '全部',
  '编程技术',
  '设计灵感',
  '阅读笔记',
  '生活技巧',
  '游戏攻略',
  '动漫杂谈',
  '其他',
];

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
import React, { createContext, useContext, useState, useEffect } from 'react';

export type AccentColorType =
  | 'cyan'
  | 'emerald'
  | 'indigo'
  | 'purple'
  | 'amber'
  | 'rose'
  | 'matrix'
  | 'orange'
  | 'blue'
  | 'pink'
  | 'custom';

export type ThemeBaseType =
  | 'cyber-dark' // Default dark #09090b
  | 'oled-black' // True black #000000
  | 'slate-matrix' // Slate datacenter #0b1120
  | 'midnight-tokyo' // Midnight blue #0a0e1a
  | 'carbon-dark'; // Warm carbon #121214

export type CornerRadiusType = 'sharp' | 'compact' | 'modern' | 'pill';
export type GlowIntensityType = 'none' | 'subtle' | 'vibrant';
export type GlassStyleType = 'solid' | 'subtle' | 'high';

export interface ThemeSettings {
  panelName: string;
  tagline: string;
  badgeText: string;
  logoUrl: string; // URL for custom image logo
  backgroundType: 'default' | 'image' | 'gradient' | 'cyber-mesh';
  backgroundImageUrl: string; // URL for custom background
  backgroundOpacity: number; // 5 - 100%
  backgroundBlur: number; // 0 - 20px
  accentColor: AccentColorType;
  customHexColor: string; // e.g. #06b6d4
  themeBase: ThemeBaseType;
  cornerRadius: CornerRadiusType;
  glowIntensity: GlowIntensityType;
  glassStyle: GlassStyleType;
  darkGlassmorphism: boolean;
  customCss: string;
}

export const ACCENT_COLOR_MAP: Record<
  AccentColorType,
  {
    name: string;
    hex: string;
    textClass: string;
    bgClass: string;
    borderClass: string;
    glowRgba: string;
  }
> = {
  cyan: {
    name: 'Cyber Cyan',
    hex: '#06b6d4',
    textClass: 'text-cyan-400',
    bgClass: 'bg-cyan-500',
    borderClass: 'border-cyan-500',
    glowRgba: 'rgba(6,182,212,0.15)',
  },
  emerald: {
    name: 'Emerald Terminal',
    hex: '#10b981',
    textClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500',
    borderClass: 'border-emerald-500',
    glowRgba: 'rgba(16,185,129,0.15)',
  },
  indigo: {
    name: 'Electric Indigo',
    hex: '#6366f1',
    textClass: 'text-indigo-400',
    bgClass: 'bg-indigo-500',
    borderClass: 'border-indigo-500',
    glowRgba: 'rgba(99,102,241,0.15)',
  },
  purple: {
    name: 'Neon Purple',
    hex: '#a855f7',
    textClass: 'text-purple-400',
    bgClass: 'bg-purple-500',
    borderClass: 'border-purple-500',
    glowRgba: 'rgba(168,85,247,0.15)',
  },
  amber: {
    name: 'Solar Amber',
    hex: '#f59e0b',
    textClass: 'text-amber-400',
    bgClass: 'bg-amber-500',
    borderClass: 'border-amber-500',
    glowRgba: 'rgba(245,158,11,0.15)',
  },
  rose: {
    name: 'Crimson Rose',
    hex: '#f43f5e',
    textClass: 'text-rose-400',
    bgClass: 'bg-rose-500',
    borderClass: 'border-rose-500',
    glowRgba: 'rgba(244,63,94,0.15)',
  },
  matrix: {
    name: 'Matrix Green',
    hex: '#22c55e',
    textClass: 'text-green-400',
    bgClass: 'bg-green-500',
    borderClass: 'border-green-500',
    glowRgba: 'rgba(34,197,94,0.15)',
  },
  orange: {
    name: 'Sunset Orange',
    hex: '#f97316',
    textClass: 'text-orange-400',
    bgClass: 'bg-orange-500',
    borderClass: 'border-orange-500',
    glowRgba: 'rgba(249,115,22,0.15)',
  },
  blue: {
    name: 'Sky Blue',
    hex: '#3b82f6',
    textClass: 'text-blue-400',
    bgClass: 'bg-blue-500',
    borderClass: 'border-blue-500',
    glowRgba: 'rgba(59,130,246,0.15)',
  },
  pink: {
    name: 'Hyper Pink',
    hex: '#ec4899',
    textClass: 'text-pink-400',
    bgClass: 'bg-pink-500',
    borderClass: 'border-pink-500',
    glowRgba: 'rgba(236,72,153,0.15)',
  },
  custom: {
    name: 'Custom HEX',
    hex: '#06b6d4',
    textClass: 'text-cyan-400',
    bgClass: 'bg-cyan-500',
    borderClass: 'border-cyan-500',
    glowRgba: 'rgba(6,182,212,0.15)',
  },
};

export const THEME_PRESETS: {
  id: string;
  name: string;
  desc: string;
  accent: AccentColorType;
  customHex?: string;
  themeBase: ThemeBaseType;
  bgUrl: string;
  bgOpacity: number;
  bgBlur: number;
  glow: GlowIntensityType;
}[] = [
  {
    id: 'cyber-default',
    name: '⚡ Cyberpunk Blue/Cyan',
    desc: 'Classic EVM neon cyber aesthetic with high contrast',
    accent: 'cyan',
    themeBase: 'cyber-dark',
    bgUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=2000&auto=format&fit=crop',
    bgOpacity: 25,
    bgBlur: 0,
    glow: 'vibrant',
  },
  {
    id: 'matrix-hacker',
    name: '🟩 Terminal Matrix Green',
    desc: 'Retro hacker green terminal with dark cyber glow',
    accent: 'matrix',
    themeBase: 'oled-black',
    bgUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2000&auto=format&fit=crop',
    bgOpacity: 30,
    bgBlur: 2,
    glow: 'vibrant',
  },
  {
    id: 'oled-pure',
    name: '🖤 OLED True Black (Clean)',
    desc: 'Zero-distraction 100% black minimal mode for night work',
    accent: 'cyan',
    themeBase: 'oled-black',
    bgUrl: '',
    bgOpacity: 0,
    bgBlur: 0,
    glow: 'none',
  },
  {
    id: 'tokyo-night',
    name: '🟣 Tokyo Night / Violet',
    desc: 'Vibrant neon purple and deep midnight blue ambiance',
    accent: 'purple',
    themeBase: 'midnight-tokyo',
    bgUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop',
    bgOpacity: 35,
    bgBlur: 1,
    glow: 'vibrant',
  },
  {
    id: 'solar-gold',
    name: '🟡 Solar Flare Amber',
    desc: 'Warm gold and amber accents on dark obsidian',
    accent: 'amber',
    themeBase: 'carbon-dark',
    bgUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=2000&auto=format&fit=crop',
    bgOpacity: 25,
    bgBlur: 0,
    glow: 'subtle',
  },
  {
    id: 'crimson-sentinel',
    name: '🔴 Crimson Rose Core',
    desc: 'High-energy crimson red for mission-critical nodes',
    accent: 'rose',
    themeBase: 'oled-black',
    bgUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2000&auto=format&fit=crop',
    bgOpacity: 30,
    bgBlur: 1,
    glow: 'vibrant',
  },
  {
    id: 'enterprise-slate',
    name: '🏢 Datacenter Enterprise Slate',
    desc: 'Polished corporate blue-slate server farm look',
    accent: 'blue',
    themeBase: 'slate-matrix',
    bgUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2000&auto=format&fit=crop',
    bgOpacity: 20,
    bgBlur: 0,
    glow: 'subtle',
  },
];

export const DEFAULT_THEME: ThemeSettings = {
  panelName: 'EVM PANEL',
  tagline: 'High-performance containerized VPS management platform with live terminal & NAT routing',
  badgeText: 'Docker VPS',
  logoUrl: '',
  backgroundType: 'default',
  backgroundImageUrl: '',
  backgroundOpacity: 25,
  backgroundBlur: 0,
  accentColor: 'cyan',
  customHexColor: '#06b6d4',
  themeBase: 'cyber-dark',
  cornerRadius: 'modern',
  glowIntensity: 'vibrant',
  glassStyle: 'subtle',
  darkGlassmorphism: true,
  customCss: '',
};

export const PRESET_BACKGROUNDS = [
  {
    name: 'Cyberpunk Grid City',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=2000&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=300&auto=format&fit=crop',
  },
  {
    name: 'Deep Datacenter Matrix',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2000&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=300&auto=format&fit=crop',
  },
  {
    name: 'Abstract Neon Waves',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop',
  },
  {
    name: 'Dark Nebula Space',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2000&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=300&auto=format&fit=crop',
  },
  {
    name: 'Minimal Dark Carbon',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=2000&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=300&auto=format&fit=crop',
  },
  {
    name: 'Matrix Code Stream',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2000&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=300&auto=format&fit=crop',
  },
];

export const PRESET_LOGOS = [
  {
    name: 'Default Cyber Server',
    url: '',
  },
  {
    name: 'Glowing Quantum Core',
    url: 'https://api.dicebear.com/7.x/shapes/svg?seed=evm-core&backgroundColor=06b6d4,3b82f6',
  },
  {
    name: 'Docker Shield Node',
    url: 'https://api.dicebear.com/7.x/identicon/svg?seed=docker-vps-node&backgroundColor=0f172a',
  },
  {
    name: 'Emerald Matrix Bot',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=evm-shield&backgroundColor=10b981',
  },
  {
    name: 'Purple Hypervisor',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=evm-purple&backgroundColor=a855f7',
  },
];

interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (updates: Partial<ThemeSettings>) => void;
  resetTheme: () => void;
  applyPreset: (presetId: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  activeHexColor: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeSettings>(() => {
    try {
      const saved = localStorage.getItem('evm_custom_theme');
      return saved ? { ...DEFAULT_THEME, ...JSON.parse(saved) } : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const activeHexColor =
    theme.accentColor === 'custom'
      ? theme.customHexColor || '#06b6d4'
      : ACCENT_COLOR_MAP[theme.accentColor]?.hex || '#06b6d4';

  // Apply CSS custom properties & custom CSS dynamically
  useEffect(() => {
    localStorage.setItem('evm_custom_theme', JSON.stringify(theme));

    const root = document.documentElement;
    root.style.setProperty('--accent-primary', activeHexColor);
    root.style.setProperty('--accent-glow', `${activeHexColor}26`);

    // Inject custom CSS if present
    let styleEl = document.getElementById('evm-custom-injected-css') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'evm-custom-injected-css';
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = theme.customCss || '';
  }, [theme, activeHexColor]);

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    setTheme((prev) => ({ ...prev, ...updates }));
  };

  const resetTheme = () => {
    setTheme(DEFAULT_THEME);
    localStorage.removeItem('evm_custom_theme');
  };

  const applyPreset = (presetId: string) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setTheme((prev) => ({
      ...prev,
      accentColor: preset.accent,
      customHexColor: preset.customHex || ACCENT_COLOR_MAP[preset.accent]?.hex || '#06b6d4',
      themeBase: preset.themeBase,
      backgroundImageUrl: preset.bgUrl,
      backgroundOpacity: preset.bgOpacity,
      backgroundBlur: preset.bgBlur,
      glowIntensity: preset.glow,
    }));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        updateTheme,
        resetTheme,
        applyPreset,
        isSettingsOpen,
        setIsSettingsOpen,
        activeHexColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
};


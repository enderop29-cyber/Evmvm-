import React, { useState } from 'react';
import {
  Palette,
  Image as ImageIcon,
  Sparkles,
  RotateCcw,
  Check,
  X,
  Sliders,
  Type,
  Link,
  Shield,
  Eye,
  Layers,
  Upload,
  Paintbrush,
  Sun,
  Moon,
  Zap,
  Code2,
  SlidersHorizontal,
  CircleDot
} from 'lucide-react';
import {
  useTheme,
  PRESET_BACKGROUNDS,
  PRESET_LOGOS,
  THEME_PRESETS,
  ACCENT_COLOR_MAP,
  AccentColorType,
  ThemeBaseType,
  CornerRadiusType,
  GlowIntensityType,
  GlassStyleType
} from '../context/ThemeContext';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({ isOpen, onClose }) => {
  const { theme, updateTheme, resetTheme, applyPreset, activeHexColor } = useTheme();

  const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'appearance' | 'background' | 'brand' | 'css'>('presets');

  // Local form state
  const [panelName, setPanelName] = useState(theme.panelName);
  const [tagline, setTagline] = useState(theme.tagline);
  const [badgeText, setBadgeText] = useState(theme.badgeText);
  const [logoUrl, setLogoUrl] = useState(theme.logoUrl);
  const [backgroundType, setBackgroundType] = useState(theme.backgroundType);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(theme.backgroundImageUrl);
  const [backgroundOpacity, setBackgroundOpacity] = useState(theme.backgroundOpacity);
  const [backgroundBlur, setBackgroundBlur] = useState(theme.backgroundBlur);
  const [accentColor, setAccentColor] = useState<AccentColorType>(theme.accentColor);
  const [customHexColor, setCustomHexColor] = useState(theme.customHexColor || '#06b6d4');
  const [themeBase, setThemeBase] = useState<ThemeBaseType>(theme.themeBase || 'cyber-dark');
  const [cornerRadius, setCornerRadius] = useState<CornerRadiusType>(theme.cornerRadius || 'modern');
  const [glowIntensity, setGlowIntensity] = useState<GlowIntensityType>(theme.glowIntensity || 'vibrant');
  const [glassStyle, setGlassStyle] = useState<GlassStyleType>(theme.glassStyle || 'subtle');
  const [customCss, setCustomCss] = useState(theme.customCss || '');
  const [savedAlert, setSavedAlert] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTheme({
      panelName: panelName.trim() || 'EVM PANEL',
      tagline: tagline.trim(),
      badgeText: badgeText.trim() || 'Docker VPS',
      logoUrl: logoUrl.trim(),
      backgroundType,
      backgroundImageUrl: backgroundImageUrl.trim(),
      backgroundOpacity,
      backgroundBlur,
      accentColor,
      customHexColor: customHexColor.trim() || '#06b6d4',
      themeBase,
      cornerRadius,
      glowIntensity,
      glassStyle,
      customCss,
    });
    setSavedAlert(true);
    setTimeout(() => {
      setSavedAlert(false);
      onClose();
    }, 600);
  };

  const handleApplyPreset = (presetId: string) => {
    applyPreset(presetId);
    const p = THEME_PRESETS.find((x) => x.id === presetId);
    if (p) {
      setAccentColor(p.accent);
      setCustomHexColor(p.customHex || ACCENT_COLOR_MAP[p.accent]?.hex || '#06b6d4');
      setThemeBase(p.themeBase);
      setBackgroundImageUrl(p.bgUrl);
      setBackgroundOpacity(p.bgOpacity);
      setBackgroundBlur(p.bgBlur);
      setGlowIntensity(p.glow);
    }
  };

  const handleReset = () => {
    resetTheme();
    setPanelName('EVM PANEL');
    setTagline('High-performance containerized VPS management platform with live terminal & NAT routing');
    setBadgeText('Docker VPS');
    setLogoUrl('');
    setBackgroundType('default');
    setBackgroundImageUrl('');
    setBackgroundOpacity(25);
    setBackgroundBlur(0);
    setAccentColor('cyan');
    setCustomHexColor('#06b6d4');
    setThemeBase('cyber-dark');
    setCornerRadius('modern');
    setGlowIntensity('vibrant');
    setGlassStyle('subtle');
    setCustomCss('');
  };

  const currentEffectiveHex =
    accentColor === 'custom'
      ? customHexColor
      : ACCENT_COLOR_MAP[accentColor]?.hex || '#06b6d4';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Accent Bar with current dynamic color */}
        <div
          className="h-1.5 transition-all duration-300"
          style={{
            background: `linear-gradient(90deg, ${currentEffectiveHex}, #6366f1, #10b981)`,
          }}
        />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl border flex items-center justify-center transition-colors"
              style={{
                backgroundColor: `${currentEffectiveHex}15`,
                borderColor: `${currentEffectiveHex}40`,
                color: currentEffectiveHex,
              }}
            >
              <Paintbrush className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Panel Theme & Appearance Customizer
              </h2>
              <p className="text-xs text-zinc-400">
                100% full customization: Colors, Hex pickers, OLED / Cyber themes, Wallpapers, & Custom CSS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 pt-2 border-b border-zinc-800/80 bg-zinc-950/40 gap-1 shrink-0 overflow-x-auto">
          {[
            { id: 'presets' as const, name: 'Theme Presets', icon: Sparkles },
            { id: 'colors' as const, name: 'Accent Colors & HEX', icon: Palette },
            { id: 'appearance' as const, name: 'Base & Styling', icon: SlidersHorizontal },
            { id: 'background' as const, name: 'Wallpapers', icon: ImageIcon },
            { id: 'brand' as const, name: 'Brand & Logo', icon: Type },
            { id: 'css' as const, name: 'Custom CSS', icon: Code2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-cyan-400 text-white bg-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
                style={isActive ? { borderBottomColor: currentEffectiveHex } : undefined}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {savedAlert && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Theme customizations applied and saved successfully!</span>
            </div>
          )}

          {/* TAB 1: 1-CLICK THEME PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div>
                <span className="font-bold text-white text-sm block">1-Click Curated Theme Presets</span>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Select an instant aesthetic combination with optimized colors, backdrop styling, and dark mode contrast.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset.id)}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-2.5 transition-all hover:scale-[1.01] ${
                      accentColor === preset.accent && themeBase === preset.themeBase
                        ? 'border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-500/40 shadow-lg'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{preset.name}</span>
                      <span
                        className="w-3.5 h-3.5 rounded-full ring-2 ring-zinc-800 shadow"
                        style={{ backgroundColor: ACCENT_COLOR_MAP[preset.accent]?.hex || '#06b6d4' }}
                      />
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">{preset.desc}</p>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                        {preset.themeBase}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                        Glow: {preset.glow}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ACCENT COLORS & CUSTOM HEX PICKER */}
          {activeTab === 'colors' && (
            <div className="space-y-5">
              <div>
                <span className="font-bold text-white text-sm block">Theme Accent Palette & Custom Color</span>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Choose from 10 high-contrast cyberpunk accents or type/pick any custom RGB Hex color!
                </p>
              </div>

              {/* Palette grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {(Object.keys(ACCENT_COLOR_MAP) as AccentColorType[])
                  .filter((k) => k !== 'custom')
                  .map((key) => {
                    const item = ACCENT_COLOR_MAP[key];
                    const isSelected = accentColor === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setAccentColor(key);
                          setCustomHexColor(item.hex);
                        }}
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                          isSelected
                            ? 'border-white bg-zinc-800 text-white shadow-lg'
                            : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-zinc-400'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full shadow-inner ring-2 ring-zinc-900"
                          style={{ backgroundColor: item.hex }}
                        />
                        <span className="text-[11px] font-semibold truncate max-w-full">{item.name}</span>
                        <span className="text-[9px] font-mono text-zinc-500">{item.hex}</span>
                      </button>
                    );
                  })}
              </div>

              {/* Custom HEX Input & Color Picker */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <CircleDot className="w-4 h-4 text-cyan-400" />
                    <span>Custom Color Picker & Exact HEX Code</span>
                  </span>
                  {accentColor === 'custom' && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                      Active Custom Color
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Native HTML Color Picker */}
                  <div className="relative w-12 h-10 rounded-xl overflow-hidden border border-zinc-700 shrink-0 cursor-pointer shadow">
                    <input
                      type="color"
                      value={customHexColor}
                      onChange={(e) => {
                        setCustomHexColor(e.target.value);
                        setAccentColor('custom');
                      }}
                      className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer border-0"
                    />
                  </div>

                  {/* Text Input for Hex */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={customHexColor}
                      onChange={(e) => {
                        setCustomHexColor(e.target.value);
                        setAccentColor('custom');
                      }}
                      placeholder="#06b6d4"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-cyan-500 rounded-xl text-white font-mono text-xs outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setAccentColor('custom')}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold text-xs border border-zinc-700 transition-colors"
                  >
                    Apply Custom Hex
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THEME BASE, CORNERS, GLOW & GLASS */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              <div>
                <span className="font-bold text-white text-sm block">Base Theme, Cards & Visual Effects</span>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Configure background mode, button radius, and glow intensity.
                </p>
              </div>

              {/* 1. Theme Base Mode */}
              <div className="space-y-2">
                <label className="font-semibold text-zinc-300 block">Dark Background Archetype</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'cyber-dark' as const, name: 'Cyber Dark (#09090b)', desc: 'Standard deep obsidian' },
                    { id: 'oled-black' as const, name: 'OLED Pure Black (#000000)', desc: '100% black pixels' },
                    { id: 'slate-matrix' as const, name: 'Datacenter Slate (#0b1120)', desc: 'Subtle slate blue tint' },
                    { id: 'midnight-tokyo' as const, name: 'Midnight Tokyo (#0a0e1a)', desc: 'Deep violet midnight' },
                    { id: 'carbon-dark' as const, name: 'Dark Carbon (#121214)', desc: 'Warm titanium graphite' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setThemeBase(mode.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        themeBase === mode.id
                          ? 'border-cyan-400 bg-zinc-800 text-white shadow-md'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{mode.name}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Glow Intensity */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="font-semibold text-zinc-300 block">Cyber Glow Intensity</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'none' as const, name: 'No Glow (Clean)', desc: 'Disabled' },
                    { id: 'subtle' as const, name: 'Subtle Glow', desc: 'Minimal ambient' },
                    { id: 'vibrant' as const, name: 'Vibrant Neon Glow', desc: 'Full Cyberpunk' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGlowIntensity(g.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        glowIntensity === g.id
                          ? 'border-cyan-400 bg-zinc-800 text-white shadow-md'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{g.name}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Corner Radius */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="font-semibold text-zinc-300 block">UI Corner Radius Style</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'sharp' as const, name: 'Sharp (0px)' },
                    { id: 'compact' as const, name: 'Compact (8px)' },
                    { id: 'modern' as const, name: 'Modern (16px)' },
                    { id: 'pill' as const, name: 'Pill (24px)' },
                  ].map((rad) => (
                    <button
                      key={rad.id}
                      type="button"
                      onClick={() => setCornerRadius(rad.id)}
                      className={`p-2.5 rounded-xl border text-center font-semibold text-xs transition-all ${
                        cornerRadius === rad.id
                          ? 'border-cyan-400 bg-zinc-800 text-white'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                      }`}
                    >
                      {rad.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WALLPAPERS & BACKGROUND */}
          {activeTab === 'background' && (
            <div className="space-y-4">
              <div>
                <span className="font-bold text-white text-sm block">Custom Wallpaper & Image URL</span>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Paste any direct image link or pick from high-definition server / cyber presets.
                </p>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Custom Background Image URL</label>
                <div className="relative">
                  <Link className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="url"
                    value={backgroundImageUrl}
                    onChange={(e) => {
                      setBackgroundImageUrl(e.target.value);
                      if (e.target.value) setBackgroundType('image');
                    }}
                    placeholder="https://images.unsplash.com/... or any direct image URL"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl text-white outline-none text-xs"
                  />
                </div>
              </div>

              {/* Presets Gallery */}
              <div>
                <span className="text-[11px] text-zinc-400 block mb-1.5">Preset High-Resolution Cyber Wallpapers:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_BACKGROUNDS.map((bg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setBackgroundImageUrl(bg.url);
                        setBackgroundType('image');
                      }}
                      className={`relative rounded-xl overflow-hidden border h-20 transition-all group ${
                        backgroundImageUrl === bg.url
                          ? 'border-cyan-400 ring-2 ring-cyan-500/50'
                          : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <img
                        src={bg.thumb}
                        alt={bg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                        <span className="text-[10px] text-white font-semibold truncate drop-shadow">
                          {bg.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Opacity & Blur Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Wallpaper Opacity</span>
                    <span className="text-cyan-400 font-mono">{backgroundOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={backgroundOpacity}
                    onChange={(e) => setBackgroundOpacity(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Backdrop Blur Filter</span>
                    <span className="text-cyan-400 font-mono">{backgroundBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={backgroundBlur}
                    onChange={(e) => setBackgroundBlur(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BRAND & LOGO */}
          {activeTab === 'brand' && (
            <div className="space-y-4">
              <div>
                <span className="font-bold text-white text-sm block">Brand Identity, Logo & Titles</span>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Customize the panel brand name, badge text, header subtitle, and custom logo URL.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Panel Title / Brand Name</label>
                  <input
                    type="text"
                    value={panelName}
                    onChange={(e) => setPanelName(e.target.value)}
                    placeholder="e.g. EVM PANEL, CLOUD HOST..."
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Badge Subtitle</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. Docker VPS, Node Cloud..."
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Description / Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Brief tagline for login screen and header..."
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl text-white outline-none"
                />
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Custom Logo URL (Direct Image Link)</label>
                <div className="relative">
                  <Link className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl text-white outline-none text-xs"
                  />
                </div>
              </div>

              {/* Logo Presets */}
              <div>
                <span className="text-[11px] text-zinc-400 block mb-1.5">Preset Logo Badges:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_LOGOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLogoUrl(preset.url)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        logoUrl === preset.url
                          ? 'border-cyan-400 bg-zinc-800 text-white'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                        {preset.url ? (
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        ) : (
                          <Shield className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>
                      <span className="text-[10px] font-medium truncate max-w-full">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CUSTOM CSS LIVE INJECTION */}
          {activeTab === 'css' && (
            <div className="space-y-4">
              <div>
                <span className="font-bold text-white text-sm block">Advanced Custom CSS Live Injection</span>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Inject any custom CSS declarations directly into the document. Live changes apply instantly!
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>CSS Editor</span>
                  <span className="text-cyan-400 font-mono">Real-time stylesheet</span>
                </div>
                <textarea
                  value={customCss}
                  onChange={(e) => setCustomCss(e.target.value)}
                  rows={6}
                  placeholder={`/* Example custom CSS */\n:root {\n  --accent-primary: #06b6d4;\n}\n\n.evm-brand {\n  letter-spacing: 0.1em;\n}`}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-cyan-300 text-xs outline-none focus:border-cyan-500 resize-y"
                />
              </div>
            </div>
          )}

          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="text-[11px] text-zinc-400 font-semibold flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Live Real-Time Brand & Theme Preview</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                  ) : (
                    <Shield className="w-5 h-5" style={{ color: currentEffectiveHex }} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm tracking-wider">
                      {panelName || 'EVM PANEL'}
                    </span>
                    <span
                      className="text-[9px] uppercase font-mono px-2 py-0.5 rounded border font-semibold"
                      style={{
                        backgroundColor: `${currentEffectiveHex}20`,
                        borderColor: `${currentEffectiveHex}40`,
                        color: currentEffectiveHex,
                      }}
                    >
                      {badgeText || 'Docker VPS'}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 truncate max-w-xs">
                    {tagline || 'High-performance containerized VPS management platform'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="px-3.5 py-1.5 rounded-xl font-semibold text-xs text-white shadow transition-all shrink-0"
                style={{ backgroundColor: currentEffectiveHex }}
              >
                Sample Button
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors text-xs font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-white text-xs font-semibold shadow-lg transition-all"
                style={{ backgroundColor: currentEffectiveHex }}
              >
                <Check className="w-4 h-4" />
                <span>Save Customizations</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};


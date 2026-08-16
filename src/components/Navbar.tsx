import React from 'react';
import {
  Server,
  Shield,
  User as UserIcon,
  LogOut,
  Sparkles,
  Layers,
  Cpu,
  Lock,
  KeyRound,
  Paintbrush
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVPS } from '../context/VPSContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  onOpenAuthModal: () => void;
  onOpenDeployModal: () => void;
  onOpenThemeModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal, onOpenDeployModal, onOpenThemeModal }) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { instances, userInstances } = useVPS();
  const { theme } = useTheme();

  const runningCount = userInstances.filter((i) => i.status === 'RUNNING').length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative group flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all overflow-hidden">
              <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center overflow-hidden">
                {theme.logoUrl ? (
                  <img
                    src={theme.logoUrl}
                    alt="Logo"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    onError={(e) => {
                      // Fallback to default icon if image fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Server className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                )}
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-zinc-950 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-base bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                {theme.panelName || 'EVM PANEL'}
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {theme.badgeText || 'Docker VPS'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Host Nodes Active</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-300 font-medium">{runningCount}/{userInstances.length} Online</span>
            </p>
          </div>
        </div>

        {/* Middle Stats ticker (Desktop) */}
        <div className="hidden md:flex items-center gap-4 px-4 py-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Total Fleet:</span>
            <span className="text-zinc-200 font-semibold">{instances.length} Containers</span>
          </div>
          <div className="w-px h-3.5 bg-zinc-800" />
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Engine:</span>
            <span className="text-zinc-200 font-mono">v27.1.1</span>
          </div>
        </div>

        {/* Right Section: Theme Customizer, Role Badge, Profile & Sign Out */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Custom Theme / Wallpaper Button */}
          <button
            onClick={onOpenThemeModal}
            title="Customize Background, Logo & Branding"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-cyan-400 transition-all font-medium"
          >
            <Paintbrush className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Appearance</span>
          </button>

          {/* Role Status Tag */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border shadow-sm transition-all ${
              isAdmin
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-amber-500/5'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {isAdmin ? (
              <>
                <Shield className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                <span className="tracking-wide font-mono font-bold">ADMIN</span>
              </>
            ) : (
              <>
                <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="tracking-wide font-mono font-bold">USER</span>
              </>
            )}
          </div>

          {/* User Account / Action */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
              >
                <div className="w-6 h-6 rounded-lg overflow-hidden bg-cyan-900/50 flex items-center justify-center shrink-0">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="max-w-[120px] truncate font-semibold text-zinc-100">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 truncate max-w-[120px]">
                    {currentUser.email}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                title="Log Out of EVM Panel"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all shadow-md shadow-cyan-600/20"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Admin Deploy VPS Button (In Header) */}
          {isAdmin ? (
            <button
              onClick={onOpenDeployModal}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>Deploy VPS</span>
            </button>
          ) : (
            <div
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-400"
              title="Only Administrators can manually provision VPS. Normal users redeem promo codes."
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Deploy: Admin Only</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

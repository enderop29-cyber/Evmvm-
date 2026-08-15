import React from 'react';
import {
  LayoutDashboard,
  Server,
  Terminal,
  Network,
  Gift,
  ShieldCheck,
  PlusCircle,
  Lock,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVPS } from '../context/VPSContext';

export type TabType = 'dashboard' | 'vps' | 'terminal' | 'nat' | 'redeem' | 'admin';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenDeployModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenDeployModal,
}) => {
  const { isAdmin } = useAuth();
  const { userInstances, selectedVps } = useVPS();

  const navItems: Array<{
    id: TabType;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    adminOnly?: boolean;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'vps',
      label: 'VPS Control',
      icon: <Server className="w-4 h-4" />,
      badge: userInstances.length > 0 ? userInstances.length : undefined,
    },
    {
      id: 'terminal',
      label: 'Web Terminal',
      icon: <Terminal className="w-4 h-4" />,
    },
    {
      id: 'nat',
      label: 'NAT & Ports',
      icon: <Network className="w-4 h-4" />,
      badge: selectedVps ? `${selectedVps.ports.length} rules` : undefined,
    },
    {
      id: 'redeem',
      label: 'Redeem Center',
      icon: <Gift className="w-4 h-4" />,
    },
    {
      id: 'admin',
      label: 'Admin Panel',
      icon: <ShieldCheck className="w-4 h-4" />,
      adminOnly: true,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-zinc-950/60 border-b md:border-b-0 md:border-r border-zinc-800/80 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Navigation List */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider uppercase text-zinc-400">
            Navigation
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const isRestricted = item.adminOnly && !isAdmin;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/5'
                    : isRestricted
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-colors ${
                      isActive
                        ? 'text-cyan-400'
                        : isRestricted
                        ? 'text-zinc-400 group-hover:text-zinc-200'
                        : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.adminOnly ? (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1 ${
                      isAdmin
                        ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/30'
                        : 'bg-zinc-900 text-amber-400/80 border border-zinc-800'
                    }`}
                  >
                    {!isAdmin && <Lock className="w-2.5 h-2.5" />}
                    ADMIN
                  </span>
                ) : item.badge !== undefined ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Action Button: Deploy VPS (Admin) vs Redeem Code (Normal User) */}
        <div className="pt-2">
          {isAdmin ? (
            <button
              onClick={onOpenDeployModal}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 border border-cyan-400/30 transition-all hover:scale-[1.01]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Deploy New VPS</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
                <Lock className="w-3.5 h-3.5" />
                <span>Manual Provisioning Locked</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Standard users cannot deploy VPS manually. Claim an admin code to auto-provision.
              </p>
              <button
                onClick={() => setActiveTab('redeem')}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-all"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Claim VPS with Code</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info: Docker Engine */}
      <div className="hidden md:block pt-6 border-t border-zinc-900">
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-1 text-zinc-400">
              <Cpu className="w-3 h-3 text-cyan-400" /> Docker API
            </span>
            <span className="text-emerald-400 font-mono">v1.45</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span>Container Driver:</span>
            <span className="text-zinc-300 font-mono">overlay2</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

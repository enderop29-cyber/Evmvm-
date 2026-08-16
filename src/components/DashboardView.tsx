import React from 'react';
import {
  Server,
  Cpu,
  Activity,
  HardDrive,
  Globe,
  Play,
  Square,
  RotateCcw,
  Terminal,
  Network,
  ArrowRight,
  PlusCircle,
  Gift,
  Shield,
  Lock,
  Sparkles,
  ExternalLink,
  Zap,
  Radio,
  Key
} from 'lucide-react';
import { useVPS } from '../context/VPSContext';
import { useAuth } from '../context/AuthContext';
import { TabType } from './Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: TabType) => void;
  onOpenDeployModal: () => void;
  onOpenAuthModal: () => void;
  onOpenSSHSession?: (vpsId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenDeployModal,
  onOpenAuthModal,
  onOpenSSHSession,
}) => {
  const { userInstances, selectedVpsId, setSelectedVpsId, startVPS, stopVPS, restartVPS, redeemCodes } = useVPS();
  const { currentUser, isAdmin } = useAuth();

  const totalCores = userInstances.reduce((acc, i) => acc + i.cpuCores, 0);
  const totalRamGb = userInstances.reduce((acc, i) => acc + i.ramMb / 1024, 0);
  const totalDiskGb = userInstances.reduce((acc, i) => acc + i.diskGb, 0);
  const runningCount = userInstances.filter((i) => i.status === 'RUNNING').length;

  const handleSelectVPS = (id: string, tab: TabType = 'vps') => {
    setSelectedVpsId(id);
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6">
      {/* RBAC Mode Context Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isAdmin
            ? 'bg-gradient-to-r from-cyan-950/40 via-zinc-900/60 to-indigo-950/40 border-cyan-500/30 shadow-lg shadow-cyan-500/5'
            : 'bg-gradient-to-r from-emerald-950/40 via-zinc-900/60 to-zinc-900/60 border-emerald-500/30 shadow-lg shadow-emerald-500/5'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isAdmin
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {isAdmin ? <Shield className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  {isAdmin ? 'Administrator Root Session' : 'Standard User Account'}
                </h2>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold ${
                    isAdmin
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {currentUser?.role || 'USER'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isAdmin
                  ? 'You have full administrative privileges to provision Docker VPS instances and manage global infrastructure.'
                  : 'Normal users cannot manually generate VPS instances. You can claim server resources using Redeem Codes.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAdmin ? (
              <button
                onClick={onOpenDeployModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Deploy VPS (Admin)</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('redeem')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
              >
                <Gift className="w-4 h-4" />
                <span>Redeem Coupon Code</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cluster Resource Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>VPS Instances</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            {runningCount} <span className="text-xs text-zinc-500 font-sans font-normal">/ {userInstances.length} Online</span>
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Docker Engine Healthy</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Compute Power</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            {totalCores} <span className="text-xs text-zinc-500 font-sans font-normal">vCPU Cores</span>
          </div>
          <div className="text-[10px] text-zinc-500">
            AMD EPYC 9654 Dedicated
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Memory Allocated</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            {totalRamGb.toFixed(1)} <span className="text-xs text-zinc-500 font-sans font-normal">GB RAM</span>
          </div>
          <div className="text-[10px] text-zinc-500">
            High-Speed DDR5 ECC
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Storage Attached</span>
            <HardDrive className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            {totalDiskGb} <span className="text-xs text-zinc-500 font-sans font-normal">GB NVMe</span>
          </div>
          <div className="text-[10px] text-zinc-500">
            PCIe 4.0 Direct Storage
          </div>
        </div>
      </div>

      {/* VPS Fleet Instances Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Active VPS Instances</h3>
            <p className="text-xs text-zinc-400">
              {isAdmin ? 'All containers across global fleet nodes' : 'Your provisioned Docker VPS containers'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <button
                onClick={onOpenDeployModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>New VPS</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('redeem')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
              >
                <Gift className="w-3.5 h-3.5 text-emerald-400" />
                <span>Claim Code</span>
              </button>
            )}
          </div>
        </div>

        {userInstances.length === 0 ? (
          <div className="p-12 rounded-3xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <Server className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-base font-bold text-white">No VPS instances provisioned</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {isAdmin
                  ? 'Click "Deploy VPS" to spin up a new Docker instance on your host node.'
                  : 'Enter a coupon code in the Redeem Center to auto-provision your first Docker VPS.'}
              </p>
            </div>
            <div>
              {isAdmin ? (
                <button
                  onClick={onOpenDeployModal}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20"
                >
                  Deploy Container Now
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('redeem')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20"
                >
                  Go to Redeem Center
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userInstances.map((vps) => {
              const isRunning = vps.status === 'RUNNING';
              return (
                <div
                  key={vps.id}
                  className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-5 space-y-4 hover:border-zinc-700 transition-all group flex flex-col justify-between shadow-lg"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                            isRunning
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                              : 'bg-zinc-950 text-zinc-500 border border-zinc-800'
                          }`}
                        >
                          <Server className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm tracking-tight group-hover:text-cyan-300 transition-colors">
                              {vps.name}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {vps.os.split(' ')[0]} • {vps.ipv4}:{vps.sshPort}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full uppercase border ${
                          isRunning
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}
                      >
                        {vps.status}
                      </span>
                    </div>

                    {/* Specs Pills */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-850 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">vCPU</span>
                        <span className="font-mono text-zinc-200 font-bold">{vps.cpuCores} Cores</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">RAM</span>
                        <span className="font-mono text-emerald-400 font-bold">{(vps.ramMb / 1024).toFixed(0)} GB</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">NVMe</span>
                        <span className="font-mono text-amber-400 font-bold">{vps.diskGb} GB</span>
                      </div>
                    </div>

                    {/* Usage Progress Bars */}
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>CPU Load</span>
                        <span className="font-mono text-white">{vps.currentCpu}%</span>
                      </div>
                      <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, vps.currentCpu)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Power & Nav Actions */}
                  <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {isRunning ? (
                          <>
                            <button
                              onClick={() => stopVPS(vps.id)}
                              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Stop VPS"
                            >
                              <Square className="w-3.5 h-3.5 fill-red-400" />
                            </button>
                            <button
                              onClick={() => restartVPS(vps.id)}
                              className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                              title="Restart VPS"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => startVPS(vps.id)}
                            className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Start VPS"
                          >
                            <Play className="w-3.5 h-3.5 fill-emerald-400" />
                          </button>
                        )}

                        {onOpenSSHSession && (
                          <button
                            onClick={() => {
                              setSelectedVpsId(vps.id);
                              onOpenSSHSession(vps.id);
                            }}
                            className="p-2 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                            title="SSH & sshx Web Session"
                          >
                            <Zap className="w-3.5 h-3.5 text-cyan-400" />
                          </button>
                        )}

                        <button
                          onClick={() => handleSelectVPS(vps.id, 'terminal')}
                          className="p-2 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 rounded-lg transition-colors"
                          title="Open Web Terminal"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleSelectVPS(vps.id, 'nat')}
                          className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded-lg transition-colors"
                          title="NAT Port Mapping"
                        >
                          <Network className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleSelectVPS(vps.id, 'vps')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-cyan-600 hover:text-white text-xs font-semibold text-zinc-200 transition-all"
                      >
                        <span>Manage</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

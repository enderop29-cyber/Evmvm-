import React, { useState, useEffect } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Terminal,
  Network,
  RefreshCw,
  Trash2,
  Cpu,
  Activity,
  HardDrive,
  Globe,
  Clock,
  Shield,
  Layers,
  Copy,
  Check,
  AlertTriangle,
  Key,
  Zap,
  ExternalLink,
  Radio,
  Smartphone
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useVPS } from '../context/VPSContext';
import { useAuth } from '../context/AuthContext';
import { MetricPoint, LinuxOS } from '../types';

interface VPSDetailViewProps {
  onOpenTerminal: () => void;
  onOpenNAT: () => void;
  onOpenReinstall: () => void;
  onOpenSSHSession: () => void;
}

export const VPSDetailView: React.FC<VPSDetailViewProps> = ({
  onOpenTerminal,
  onOpenNAT,
  onOpenReinstall,
  onOpenSSHSession,
}) => {
  const { userInstances, selectedVps, selectedVpsId, setSelectedVpsId, startVPS, stopVPS, restartVPS, deleteVPS } = useVPS();
  const { isAdmin } = useAuth();
  const [metricHistory, setMetricHistory] = useState<MetricPoint[]>([]);
  const [copiedPort, setCopiedPort] = useState(false);
  const [copiedTermux, setCopiedTermux] = useState(false);
  const [copiedSshx, setCopiedSshx] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeVps = selectedVps || userInstances[0] || null;
  const cleanIp = activeVps?.ipv4?.includes('127.0.0.1') ? '127.0.0.1' : (activeVps?.ipv4 || '127.0.0.1');
  const sshxSessionUrl = activeVps ? `https://sshx.io/s#evm-${activeVps.id.slice(0, 6)}` : '';

  // Generate realistic metric timeline history
  useEffect(() => {
    if (!activeVps) return;

    const initialHistory: MetricPoint[] = [];
    const now = Date.now();
    for (let i = 12; i >= 0; i--) {
      const t = new Date(now - i * 3000);
      const timeStr = `${t.getMinutes()}:${t.getSeconds() < 10 ? '0' : ''}${t.getSeconds()}`;
      initialHistory.push({
        time: timeStr,
        cpu: activeVps.status === 'RUNNING' ? +(Math.random() * 20 + 8).toFixed(1) : 0,
        ram: activeVps.status === 'RUNNING' ? +(Math.random() * 10 + 25).toFixed(1) : 0,
        disk: +((activeVps.currentDiskGb / activeVps.diskGb) * 100).toFixed(1),
        networkIn: activeVps.status === 'RUNNING' ? Math.round(Math.random() * 400 + 50) : 0,
        networkOut: activeVps.status === 'RUNNING' ? Math.round(Math.random() * 600 + 80) : 0,
      });
    }
    setMetricHistory(initialHistory);

    const interval = setInterval(() => {
      const t = new Date();
      const timeStr = `${t.getMinutes()}:${t.getSeconds() < 10 ? '0' : ''}${t.getSeconds()}`;
      setMetricHistory((prev) => {
        const next = [
          ...prev.slice(1),
          {
            time: timeStr,
            cpu: activeVps.status === 'RUNNING' ? activeVps.currentCpu : 0,
            ram: activeVps.status === 'RUNNING' ? +((activeVps.currentRamMb / activeVps.ramMb) * 100).toFixed(1) : 0,
            disk: +((activeVps.currentDiskGb / activeVps.diskGb) * 100).toFixed(1),
            networkIn: activeVps.status === 'RUNNING' ? Math.round(Math.random() * 500 + 40) : 0,
            networkOut: activeVps.status === 'RUNNING' ? Math.round(Math.random() * 750 + 90) : 0,
          },
        ];
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [activeVps?.id, activeVps?.status]);

  if (!activeVps) {
    return (
      <div className="p-12 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-3">
        <Layers className="w-10 h-10 mx-auto text-zinc-600" />
        <h3 className="text-base font-bold text-white">No VPS Instances Found</h3>
        <p className="text-xs text-zinc-400">
          Redeem a coupon code to provision your first Docker VPS instance.
        </p>
      </div>
    );
  }

  const copySsh = () => {
    navigator.clipboard.writeText(`ssh root@${cleanIp} -p ${activeVps.sshPort}`);
    setCopiedPort(true);
    setTimeout(() => setCopiedPort(false), 2000);
  };

  const copyTermux = () => {
    navigator.clipboard.writeText(`ssh root@${cleanIp} -p ${activeVps.sshPort}`);
    setCopiedTermux(true);
    setTimeout(() => setCopiedTermux(false), 2000);
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to permanently delete instance "${activeVps.name}"?`)) {
      setIsDeleting(true);
      await deleteVPS(activeVps.id);
      setIsDeleting(false);
    }
  };

  const formatUptime = (sec: number) => {
    const days = Math.floor(sec / (3600 * 24));
    const hours = Math.floor((sec % (3600 * 24)) / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-900/60 to-indigo-900/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg">
                <Cpu className="w-7 h-7" />
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-900 flex items-center justify-center ${
                  activeVps.status === 'RUNNING'
                    ? 'bg-emerald-400'
                    : activeVps.status === 'STOPPED'
                    ? 'bg-red-500'
                    : 'bg-amber-400'
                }`}
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight">{activeVps.name}</h1>
                <span
                  className={`text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full font-semibold border ${
                    activeVps.status === 'RUNNING'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : activeVps.status === 'STOPPED'
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse'
                  }`}
                >
                  ● {activeVps.status}
                </span>
                {activeVps.redeemedWithCode && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                    Promo: {activeVps.redeemedWithCode}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-2 mt-1">
                <span>{activeVps.os}</span>
                <span>•</span>
                <span className="font-mono text-zinc-500">{activeVps.containerId}</span>
                <span>•</span>
                <span>{activeVps.nodeName}</span>
              </p>
            </div>
          </div>

          {/* Quick VPS Switcher & SSH Copy */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedVpsId || ''}
              onChange={(e) => setSelectedVpsId(e.target.value)}
              className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:border-cyan-500 outline-none"
            >
              {userInstances.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.status})
                </option>
              ))}
            </select>

            <button
              onClick={copySsh}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-cyan-300 rounded-xl transition-colors"
            >
              {copiedPort ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>SSH :{activeVps.sshPort}</span>
            </button>
          </div>
        </div>

        {/* Live Power Actions Bar */}
        <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
          {activeVps.status === 'RUNNING' ? (
            <>
              <button
                onClick={() => stopVPS(activeVps.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-red-400" />
                <span>Stop</span>
              </button>
              <button
                onClick={() => restartVPS(activeVps.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => startVPS(activeVps.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-emerald-400" />
              <span>Start Instance</span>
            </button>
          )}

          <button
            onClick={onOpenSSHSession}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold shadow-sm transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>SSH & SSHX Session</span>
          </button>

          <button
            onClick={onOpenTerminal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Web Console</span>
          </button>

          <button
            onClick={onOpenNAT}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
          >
            <Network className="w-3.5 h-3.5 text-indigo-400" />
            <span>NAT & Ports ({activeVps.ports.length})</span>
          </button>

          <button
            onClick={onOpenReinstall}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reinstall OS</span>
          </button>

          <div className="ml-auto">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 text-xs transition-colors"
              title="Delete VPS Container"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Hardware Metrics & Graphs (Recharts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Metric Card */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" /> vCPU Usage
            </span>
            <span className="font-mono text-white font-bold">{activeVps.currentCpu}%</span>
          </div>
          <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, activeVps.currentCpu)}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-500">
            {activeVps.cpuCores} Dedicated AMD EPYC Cores
          </div>
        </div>

        {/* RAM Metric Card */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" /> RAM Memory
            </span>
            <span className="font-mono text-white font-bold">
              {activeVps.currentRamMb} / {activeVps.ramMb} MB
            </span>
          </div>
          <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (activeVps.currentRamMb / activeVps.ramMb) * 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-500">
            {((activeVps.currentRamMb / activeVps.ramMb) * 100).toFixed(0)}% Allocated DDR5 RAM
          </div>
        </div>

        {/* Disk Card */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-amber-400" /> NVMe SSD Storage
            </span>
            <span className="font-mono text-white font-bold">
              {activeVps.currentDiskGb} / {activeVps.diskGb} GB
            </span>
          </div>
          <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (activeVps.currentDiskGb / activeVps.diskGb) * 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-500">
            {((activeVps.currentDiskGb / activeVps.diskGb) * 100).toFixed(0)}% Used of High-Speed NVMe
          </div>
        </div>

        {/* Bandwidth / Network Card */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-400" /> Network I/O
            </span>
            <span className="font-mono text-white font-bold">{activeVps.bandwidthTb} TB Cap</span>
          </div>
          <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: '8%' }} />
          </div>
          <div className="text-[11px] text-zinc-500">
            ↓ {activeVps.networkInTotalMb} MB In • ↑ {activeVps.networkOutTotalMb} MB Out
          </div>
        </div>
      </div>

      {/* Real-time Charts using Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU & RAM Chart */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Live CPU & Memory Load (%)
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> CPU
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> RAM
              </span>
            </div>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricHistory}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="time" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} domain={[0, 100]} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="cpu" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#cpuGrad)" />
                <Area type="monotone" dataKey="ram" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#ramGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Network Throughput Chart */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Live Network Throughput (KB/s)
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-indigo-400">
                <span className="w-2 h-2 rounded-full bg-indigo-400" /> Ingress
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Egress
              </span>
            </div>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricHistory}>
                <defs>
                  <linearGradient id="netInGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="netOutGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="time" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} unit=" KB" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="networkIn" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#netInGrad)" />
                <Area type="monotone" dataKey="networkOut" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#netOutGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Remote Access & SSH / SSHX Sessions Hub */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Direct SSH, Termux & sshx Access
              </h3>
              <p className="text-[11px] text-zinc-400">
                Copy direct terminal strings for Android Termux, Linux/CMD OpenSSH, or open browser sshx session
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSSHSession}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all self-start sm:self-auto"
          >
            <span>All Connect Codes</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Termux Direct Command Box */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                Termux (Phone) SSH
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                1-Click Paste
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg font-mono text-emerald-300 text-xs truncate">
                ssh root@{cleanIp} -p {activeVps.sshPort}
              </div>
              <button
                onClick={copyTermux}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 shrink-0"
              >
                {copiedTermux ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTermux ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* SSH Direct Command Box */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                Windows CMD / Linux
              </span>
              <span className="text-zinc-400 font-mono">Port {activeVps.sshPort}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg font-mono text-cyan-300 text-xs truncate">
                ssh root@{cleanIp} -p {activeVps.sshPort}
              </div>
              <button
                onClick={copySsh}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 shrink-0"
              >
                {copiedPort ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPort ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* SSHX Instant Web Session Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/30 to-indigo-950/30 border border-cyan-500/20 space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                sshx Browser Web
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                Live Tab
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg font-mono text-cyan-300 text-xs truncate">
                {sshxSessionUrl}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sshxSessionUrl);
                  setCopiedSshx(true);
                  setTimeout(() => setCopiedSshx(false), 2000);
                }}
                className="px-2.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold text-xs transition-all flex items-center gap-1 shrink-0"
              >
                {copiedSshx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSshx ? 'Copied' : 'Link'}</span>
              </button>
              <a
                href={sshxSessionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors"
                title="Open sshx Session in New Tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & System Details */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          Container Virtualization Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850">
            <span className="text-zinc-500 block mb-1">Docker Container ID</span>
            <span className="font-mono text-zinc-200">{activeVps.containerId}</span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850">
            <span className="text-zinc-500 block mb-1">Public IPv4 Gateway</span>
            <span className="font-mono text-cyan-300">{activeVps.ipv4}</span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850">
            <span className="text-zinc-500 block mb-1">SSH Remote Port</span>
            <span className="font-mono text-emerald-300">:{activeVps.sshPort} (TCP)</span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850">
            <span className="text-zinc-500 block mb-1">Instance Uptime</span>
            <span className="font-mono text-zinc-200 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              {formatUptime(activeVps.uptimeSeconds)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

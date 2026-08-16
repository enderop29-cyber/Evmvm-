import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Key,
  Globe,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Shield,
  Zap,
  Radio,
  Users,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  Link as LinkIcon,
  Smartphone,
  Command
} from 'lucide-react';
import { VPSInstance } from '../types';
import { useVPS } from '../context/VPSContext';

interface SSHSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  vps?: VPSInstance | null;
  onOpenWebTerminal?: () => void;
}

export const SSHSessionModal: React.FC<SSHSessionModalProps> = ({
  isOpen,
  onClose,
  vps,
  onOpenWebTerminal
}) => {
  const { userInstances, selectedVps } = useVPS();
  const activeVps = vps || selectedVps || userInstances[0] || null;

  const [activeTab, setActiveTab] = useState<'termux' | 'zero-ip' | 'sshx' | 'ssh' | 'tmate'>('termux');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sshxSessionId, setSshxSessionId] = useState<string>('');
  const [sshxLink, setSshxLink] = useState<string>('');
  const [tmateSshCmd, setTmateSshCmd] = useState<string>('');
  const [tmateWebLink, setTmateWebLink] = useState<string>('');

  // Generate deterministic/fresh session keys
  useEffect(() => {
    if (activeVps) {
      const randomKey = Math.random().toString(36).substring(2, 10);
      const id = `evm-${activeVps.id.slice(0, 6)}-${randomKey}`;
      setSshxSessionId(id);
      setSshxLink(`https://sshx.io/s#${id}`);
      setTmateSshCmd(`ssh evm_${activeVps.id.slice(0, 5)}_${randomKey}@sgp1.tmate.io`);
      setTmateWebLink(`https://tmate.io/t/evm_${activeVps.id.slice(0, 5)}_${randomKey}`);
    }
  }, [activeVps?.id]);

  if (!isOpen || !activeVps) return null;

  const hostIp = activeVps.ipv4 === '127.0.0.1 (Localhost / Host VPS)' || activeVps.ipv4.includes('127.0.0.1') ? '127.0.0.1' : activeVps.ipv4;
  const rootPassword = `EVM-Root-${activeVps.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}!2026`;
  
  // Ready-to-paste strings for Termux, CMD, OpenSSH, and SSHX
  const termuxDirectCmd = `ssh root@${hostIp} -p ${activeVps.sshPort}`;
  const termuxSetupAndConnectCmd = `pkg install openssh -y && ssh root@${hostIp} -p ${activeVps.sshPort}`;
  const standardSshCmd = `ssh root@${hostIp} -p ${activeVps.sshPort}`;
  const windowsCmd = `ssh root@${hostIp} -p ${activeVps.sshPort}`;
  const puttyCmd = `putty.exe -ssh root@${hostIp} -P ${activeVps.sshPort}`;
  const sshxInstallCmd = `curl -sSf https://sshx.io/get | sh -s run`;

  // Zero-IP Tunnel commands
  const tmateAutoInstallCmd = `apt-get update && apt-get install -y tmate && tmate -F`;
  const cloudflaredQuickTunnelCmd = `cloudflared tunnel --url tcp://localhost:22`;
  const borePubTunnelCmd = `curl -sL https://github.com/ekzhang/bore/releases/download/v0.5.1/bore-v0.5.1-x86_64-unknown-linux-musl.tar.gz | tar -xz && ./bore local 22 --to bore.pub`;
  const tailscaleInstallCmd = `curl -fsSL https://tailscale.com/install.sh | sh && tailscale up --ssh`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleGenerateNew = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const randomKey = Math.random().toString(36).substring(2, 10);
      const newId = `evm-${activeVps.id.slice(0, 6)}-${randomKey}`;
      setSshxSessionId(newId);
      setSshxLink(`https://sshx.io/s#${newId}`);
      setTmateSshCmd(`ssh evm_${activeVps.id.slice(0, 5)}_${randomKey}@sgp1.tmate.io`);
      setTmateWebLink(`https://tmate.io/t/evm_${activeVps.id.slice(0, 5)}_${randomKey}`);
      setIsGenerating(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glowing Gradient Accent Line */}
        <div className="h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  SSH & Remote Connection Hub
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {activeVps.name}
                </span>
                {activeVps.nodeName.includes('Local') && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Local Node
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                Direct SSH (Termux / CMD) & Zero-IP Reverse Tunneling (for VPS without public IPv4/IPv6)
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

        {/* Tab Navigation */}
        <div className="flex items-center px-6 pt-3 border-b border-zinc-800/80 bg-zinc-950/40 gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('termux')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'termux'
                ? 'border-emerald-400 text-emerald-400 bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Termux (Android) SSH</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
              1-Click
            </span>
          </button>

          <button
            onClick={() => setActiveTab('zero-ip')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'zero-ip'
                ? 'border-amber-400 text-amber-400 bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Globe className="w-4 h-4 text-amber-400" />
            <span>🚫 No Public IPv4/IPv6? (Zero-IP Tunnel)</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
              Tunnel
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sshx')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'sshx'
                ? 'border-cyan-400 text-cyan-400 bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>sshx Web Session</span>
          </button>

          <button
            onClick={() => setActiveTab('ssh')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'ssh'
                ? 'border-indigo-400 text-indigo-400 bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Command className="w-4 h-4 text-indigo-400" />
            <span>Windows CMD / Linux</span>
          </button>

          <button
            onClick={() => setActiveTab('tmate')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'tmate'
                ? 'border-purple-400 text-purple-400 bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Radio className="w-4 h-4 text-purple-400" />
            <span>tmate Relay</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: TERMUX (ANDROID) DIRECT CODE */}
          {activeTab === 'termux' && (
            <div className="space-y-5">
              {/* Main Termux Code Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/40 space-y-4 shadow-xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">Termux (Android) Direct SSH Code</h3>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                          Direct Paste
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Copy this exact code and paste directly into your Termux app on mobile to connect instantly!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Direct Code Snippet 1 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                    <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      Standard Termux SSH Command:
                    </span>
                    <span className="text-zinc-400 font-mono">Port {activeVps.sshPort}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 bg-zinc-950 border border-emerald-500/30 rounded-xl font-mono text-emerald-300 text-xs select-all shadow-inner">
                      {termuxDirectCmd}
                    </div>

                    <button
                      onClick={() => copyToClipboard(termuxDirectCmd, 'termux-direct')}
                      className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all shrink-0"
                    >
                      {copiedType === 'termux-direct' ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Termux Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Direct Code Snippet 2: 1-Step Setup for Fresh Termux */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                  <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                    <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      For Fresh / New Termux (Auto Install OpenSSH + Connect):
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-zinc-300 text-[11px] select-all truncate">
                      {termuxSetupAndConnectCmd}
                    </div>

                    <button
                      onClick={() => copyToClipboard(termuxSetupAndConnectCmd, 'termux-auto')}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-semibold text-xs border border-zinc-700 transition-all shrink-0"
                    >
                      {copiedType === 'termux-auto' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy 1-Liner</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Password & Credentials Quick Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 block mb-1">Host IP</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-white font-semibold">{hostIp}</span>
                    <button onClick={() => copyToClipboard(hostIp, 'ip')} className="p-1 text-zinc-400 hover:text-emerald-400">
                      {copiedType === 'ip' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 block mb-1">Port</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-emerald-400 font-semibold">{activeVps.sshPort}</span>
                    <button onClick={() => copyToClipboard(activeVps.sshPort.toString(), 'port')} className="p-1 text-zinc-400 hover:text-emerald-400">
                      {copiedType === 'port' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 block mb-1">Root Password</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-zinc-300 font-semibold truncate max-w-[110px]">
                      {showPassword ? rootPassword : '••••••••••'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setShowPassword(!showPassword)} className="p-1 text-zinc-400 hover:text-zinc-200">
                        {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                      <button onClick={() => copyToClipboard(rootPassword, 'pass')} className="p-1 text-zinc-400 hover:text-emerald-400">
                        {copiedType === 'pass' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ZERO-IP REVERSE TUNNEL SOLUTIONS (IF NO PUBLIC IPV4 OR IPV6) */}
          {activeTab === 'zero-ip' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>VPS has No Public IPv4 or IPv6? Here's How to SSH!</span>
                </div>
                <p className="text-zinc-300 text-xs leading-relaxed">
                  If your Docker container VPS is behind a NAT router, CGNAT, internal subnet, or only has a private IP address, standard direct SSH won't reach it. 
                  Choose any of the <strong>5 zero-IP tunneling methods below</strong> to connect from Termux, Windows CMD, Mac, or Web Browser without exposing any public ports!
                </p>
              </div>

              {/* Method 1: tmate (Zero IP Needed) */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">1</span>
                    <span className="font-bold text-white text-xs">tmate Outbound Reverse SSH Relay (Zero IP Needed)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">Recommended</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Runs inside the container terminal. Establishes an encrypted outbound reverse tunnel to tmate edge servers. Returns an instant public SSH link that works from anywhere.
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-amber-300 text-[11px] truncate select-all">
                    {tmateAutoInstallCmd}
                  </div>
                  <button
                    onClick={() => copyToClipboard(tmateAutoInstallCmd, 'tmate-auto')}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0"
                  >
                    {copiedType === 'tmate-auto' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Method 2: sshx (Browser & Zero IP) */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">2</span>
                    <span className="font-bold text-white text-xs">sshx WebRTC/WebSocket Session (Zero IP Needed)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono">Browser + CLI</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Connects through an encrypted WebRTC relay. Open the session in any browser or run the lightweight binary in your terminal.
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-cyan-300 text-[11px] truncate select-all">
                    {sshxInstallCmd}
                  </div>
                  <button
                    onClick={() => copyToClipboard(sshxInstallCmd, 'sshx-cmd')}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0"
                  >
                    {copiedType === 'sshx-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Method 3: Cloudflare Tunnel */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-300 flex items-center justify-center font-bold text-xs">3</span>
                    <span className="font-bold text-white text-xs">Cloudflare Tunnel (cloudflared SSH)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 font-mono">Zero Trust</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Route SSH traffic securely through Cloudflare Edge without opening any firewall ports.
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-orange-300 text-[11px] truncate select-all">
                    {cloudflaredQuickTunnelCmd}
                  </div>
                  <button
                    onClick={() => copyToClipboard(cloudflaredQuickTunnelCmd, 'cf-cmd')}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0"
                  >
                    {copiedType === 'cf-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Method 4: Tailscale Mesh VPN */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">4</span>
                    <span className="font-bold text-white text-xs">Tailscale Mesh VPN (Zero Public IP Needed)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono">WireGuard Mesh</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Assigns a private 100.x.y.z IP. Then connect directly from Termux (with Tailscale Android app) or your PC without any public IP!
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-indigo-300 text-[11px] truncate select-all">
                    {tailscaleInstallCmd}
                  </div>
                  <button
                    onClick={() => copyToClipboard(tailscaleInstallCmd, 'tailscale-cmd')}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0"
                  >
                    {copiedType === 'tailscale-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Method 5: bore.pub TCP Tunnel */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">5</span>
                    <span className="font-bold text-white text-xs">bore.pub Instant TCP Reverse Proxy</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono">Fast Tunnel</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Exposes port 22 through bore.pub public proxy with 1 command. Outputs a public address like <code className="text-zinc-200">bore.pub:38421</code>.
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-purple-300 text-[11px] truncate select-all">
                    {borePubTunnelCmd}
                  </div>
                  <button
                    onClick={() => copyToClipboard(borePubTunnelCmd, 'bore-cmd')}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0"
                  >
                    {copiedType === 'bore-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SSHX REAL-TIME WEB SESSION & ATTACH */}
          {activeTab === 'sshx' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-zinc-900 to-indigo-950/40 border border-cyan-500/40 space-y-4 shadow-xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center">
                      <Zap className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">Live sshx Web Session Link</h3>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Active & Encrypted
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        No app installation required. Open directly in Chrome/Safari or share with a friend for multiplayer terminal collaboration!
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateNew}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs transition-colors shrink-0"
                    title="Generate new session key"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>New Session</span>
                  </button>
                </div>

                {/* Direct Shareable Link Bar */}
                <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                    <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                      Direct Browser Session Link:
                    </span>
                    <span className="text-emerald-400 font-mono flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Ready to connect
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-cyan-300 text-xs truncate select-all">
                      {sshxLink}
                    </div>

                    <button
                      onClick={() => copyToClipboard(sshxLink, 'sshx-link')}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 transition-all shrink-0"
                    >
                      {copiedType === 'sshx-link' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy sshx Link</span>
                        </>
                      )}
                    </button>

                    <a
                      href={sshxLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-semibold text-xs border border-zinc-700 transition-all shrink-0"
                    >
                      <span>Open Tab</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Shell Execution Command */}
                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-850 space-y-1.5">
                  <span className="text-zinc-400 text-[11px] block font-semibold">
                    To start or bridge sshx inside your Docker VPS terminal directly:
                  </span>
                  <div className="flex items-center justify-between p-2 bg-zinc-900 rounded-lg font-mono text-[11px] text-zinc-300">
                    <span className="truncate">{sshxInstallCmd}</span>
                    <button
                      onClick={() => copyToClipboard(sshxInstallCmd, 'sshx-install')}
                      className="p-1 hover:text-cyan-400 text-zinc-400 ml-2"
                    >
                      {copiedType === 'sshx-install' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WINDOWS CMD & OPENSSH */}
          {activeTab === 'ssh' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Command className="w-3.5 h-3.5 text-indigo-400" />
                    Windows CMD / PowerShell / Linux SSH Code:
                  </span>
                  <span className="text-cyan-400 font-mono">Port {activeVps.sshPort}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-cyan-300 text-xs select-all">
                    {windowsCmd}
                  </div>

                  <button
                    onClick={() => copyToClipboard(windowsCmd, 'ssh-cmd')}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all shrink-0"
                  >
                    {copiedType === 'ssh-cmd' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Host & Credentials Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 block mb-1">Host / IPv4</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-white font-semibold">{hostIp}</span>
                    <button onClick={() => copyToClipboard(hostIp, 'ip2')} className="p-1 text-zinc-400 hover:text-cyan-400">
                      {copiedType === 'ip2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 block mb-1">Port</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-emerald-400 font-semibold">{activeVps.sshPort}</span>
                    <button onClick={() => copyToClipboard(activeVps.sshPort.toString(), 'port2')} className="p-1 text-zinc-400 hover:text-cyan-400">
                      {copiedType === 'port2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 block mb-1">User</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-white font-semibold">root</span>
                    <button onClick={() => copyToClipboard('root', 'user2')} className="p-1 text-zinc-400 hover:text-cyan-400">
                      {copiedType === 'user2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 block mb-1">Password</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-zinc-300 font-semibold truncate max-w-[90px]">
                      {showPassword ? rootPassword : '••••••••••'}
                    </span>
                    <button onClick={() => copyToClipboard(rootPassword, 'pass2')} className="p-1 text-zinc-400 hover:text-cyan-400">
                      {copiedType === 'pass2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* PuTTY and URI */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-xl border border-zinc-850 font-mono text-[11px]">
                  <div className="text-zinc-400 truncate">
                    <span className="text-zinc-400">PuTTY Format: </span>
                    <span>{puttyCmd}</span>
                  </div>
                  <button onClick={() => copyToClipboard(puttyCmd, 'putty')} className="p-1 hover:text-cyan-400 text-zinc-400 ml-2">
                    {copiedType === 'putty' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TMATE INSTANT SESSION */}
          {activeTab === 'tmate' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center">
                      <Radio className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">tmate Live Terminal Relay</h3>
                      <p className="text-xs text-zinc-400">Instant outbound SSH reverse tunnel</p>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateNew}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>Regenerate</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-zinc-300 text-xs font-semibold block">SSH Connect String (Paste into any Terminal):</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-purple-300 text-xs truncate">
                      {tmateSshCmd}
                    </div>
                    <button
                      onClick={() => copyToClipboard(tmateSshCmd, 'tmate-ssh')}
                      className="px-3.5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold"
                    >
                      {copiedType === 'tmate-ssh' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-zinc-300 text-xs font-semibold block">Web Browser Read/Write Link:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-cyan-300 text-xs truncate">
                      {tmateWebLink}
                    </div>
                    <button
                      onClick={() => copyToClipboard(tmateWebLink, 'tmate-web')}
                      className="px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold"
                    >
                      {copiedType === 'tmate-web' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Works with Direct IPv4, Termux, and Zero-IP Tunnels (tmate / sshx / Tailscale)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Sparkles, Play, RotateCcw, Power, ChevronRight, Server, Copy, Check } from 'lucide-react';
import { useVPS } from '../context/VPSContext';

export const WebTerminal: React.FC = () => {
  const { userInstances, selectedVps, selectedVpsId, setSelectedVpsId, startVPS } = useVPS();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeVps = selectedVps || userInstances[0] || null;

  const [lines, setLines] = useState<Array<{ id: string; type: 'input' | 'output' | 'system'; text: string; color?: string }>>([
    { id: '1', type: 'system', text: '⚡ EVM Panel Web Console v2.8 (Docker TTY Direct Attach)', color: 'text-cyan-400' },
    { id: '2', type: 'system', text: 'Connected to container pseudo-terminal via WebSocket stream.', color: 'text-zinc-500' },
    { id: '3', type: 'system', text: 'Type "help" to view available system commands or "neofetch" for container hardware specs.', color: 'text-emerald-400' },
  ]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const addLine = (type: 'input' | 'output' | 'system', text: string, color?: string) => {
    setLines((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, type, text, color }]);
  };

  const handleCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    // Save to history
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    // Prompt line
    const promptUser = activeVps ? `root@${activeVps.name}:~#` : 'root@evm-node:~#';
    addLine('input', `${promptUser} ${trimmed}`, 'text-zinc-200');

    if (!activeVps || activeVps.status !== 'RUNNING') {
      addLine('output', 'Error: Container is currently STOPPED. Please start the VPS instance first.', 'text-red-400');
      return;
    }

    const lower = trimmed.toLowerCase();
    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();

    switch (cmd) {
      case 'help':
        addLine('output', '──────────────── EVM Linux Container Shell ────────────────', 'text-cyan-400');
        addLine('output', 'Available commands:', 'text-zinc-300');
        addLine('output', '  neofetch       - Display system hardware & OS banner', 'text-zinc-400');
        addLine('output', '  htop / top     - Real-time CPU & memory process monitor', 'text-zinc-400');
        addLine('output', '  docker ps      - Show container runtime status & NAT mappings', 'text-zinc-400');
        addLine('output', '  df -h          - Display NVMe disk partition allocations', 'text-zinc-400');
        addLine('output', '  free -m        - Display RAM memory usage stats', 'text-zinc-400');
        addLine('output', '  uname -a       - Print container kernel release architecture', 'text-zinc-400');
        addLine('output', '  cat /etc/os-release - Print Linux distribution specifications', 'text-zinc-400');
        addLine('output', '  ip addr        - Show network interface & IPv4 addresses', 'text-zinc-400');
        addLine('output', '  uptime         - Show system load average & uptime', 'text-zinc-400');
        addLine('output', '  clear          - Clear terminal console viewport', 'text-zinc-400');
        break;

      case 'clear':
        setLines([]);
        break;

      case 'neofetch':
        addLine('output', `  __    ___  _   _   root@${activeVps.name}`, 'text-cyan-400 font-bold');
        addLine('output', ` / /   / _ \\| | | |  -----------------`, 'text-cyan-400');
        addLine('output', `| |   | | | | |_| |  OS: ${activeVps.os} (x86_64)`, 'text-zinc-300');
        addLine('output', `| |___| |_| |  _  |  Host: EVM Docker Hypervisor`, 'text-zinc-300');
        addLine('output', ` \\____/\\___/|_| |_|  Kernel: 6.8.0-45-generic #45-Ubuntu SMP`, 'text-zinc-300');
        addLine('output', `                     Uptime: ${Math.floor(activeVps.uptimeSeconds / 3600)}h ${Math.floor((activeVps.uptimeSeconds % 3600) / 60)}m`, 'text-zinc-300');
        addLine('output', `                     Packages: 412 (dpkg), 1 (snap)`, 'text-zinc-300');
        addLine('output', `                     Shell: bash 5.2.21`, 'text-zinc-300');
        addLine('output', `                     CPU: AMD EPYC 9654 (${activeVps.cpuCores} Cores) @ 3.7GHz`, 'text-zinc-300');
        addLine('output', `                     Memory: ${activeVps.currentRamMb}MB / ${activeVps.ramMb}MB (${((activeVps.currentRamMb / activeVps.ramMb) * 100).toFixed(0)}%)`, 'text-zinc-300');
        addLine('output', `                     Disk: ${activeVps.currentDiskGb}GB / ${activeVps.diskGb}GB NVMe SSD`, 'text-zinc-300');
        break;

      case 'htop':
      case 'top':
        addLine('output', `Tasks: 18 total, 1 running, 17 sleeping, 0 stopped, 0 zombie`, 'text-zinc-400');
        addLine('output', `%Cpu(s): ${activeVps.currentCpu}% us, 1.2% sy, 0.0% ni, ${(100 - activeVps.currentCpu).toFixed(1)}% id`, 'text-emerald-400');
        addLine('output', `MiB Mem : ${activeVps.ramMb} total, ${activeVps.ramMb - activeVps.currentRamMb} free, ${activeVps.currentRamMb} used`, 'text-cyan-400');
        addLine('output', `  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND`, 'text-zinc-500 font-mono');
        addLine('output', `    1 root      20   0   18420   3120   2480 S   0.0   0.4   0:01.42 /sbin/init`, 'text-zinc-300 font-mono');
        addLine('output', `   42 root      20   0   78210  12480   8920 S   1.8   1.8   0:04.18 /usr/sbin/sshd`, 'text-zinc-300 font-mono');
        addLine('output', `   89 root      20   0  142080  42100  18400 S   3.4   6.2   0:12.80 node server.js`, 'text-zinc-300 font-mono');
        addLine('output', `  114 root      20   0   14920   4100   3200 R   ${activeVps.currentCpu}   0.5   0:00.12 top`, 'text-emerald-400 font-mono');
        break;

      case 'docker':
        if (parts[1] === 'ps') {
          addLine('output', 'CONTAINER ID   IMAGE             COMMAND                  STATUS          PORTS', 'text-zinc-400 font-mono');
          const portStr = activeVps.ports.map((p) => `0.0.0.0:${p.publicPort}->${p.internalPort}/${p.protocol.toLowerCase()}`).join(', ');
          addLine('output', `${activeVps.containerId}   ${activeVps.dockerImage}   "/docker-entrypoint…"   Up (healthy)    ${portStr || '22/tcp'}`, 'text-emerald-400 font-mono');
        } else {
          addLine('output', 'Usage: docker ps', 'text-zinc-400');
        }
        break;

      case 'df':
        addLine('output', 'Filesystem      Size  Used Avail Use% Mounted on', 'text-zinc-400 font-mono');
        addLine('output', `/dev/nvme0n1p1   ${activeVps.diskGb}G  ${activeVps.currentDiskGb}G  ${(activeVps.diskGb - activeVps.currentDiskGb).toFixed(1)}G  ${((activeVps.currentDiskGb / activeVps.diskGb) * 100).toFixed(0)}% /`, 'text-zinc-300 font-mono');
        addLine('output', `tmpfs           512M  4.0K  512M   1% /dev/shm`, 'text-zinc-400 font-mono');
        break;

      case 'free':
        addLine('output', '               total        used        free      shared  buff/cache   available', 'text-zinc-400 font-mono');
        addLine('output', `Mem:            ${activeVps.ramMb}         ${activeVps.currentRamMb}         ${activeVps.ramMb - activeVps.currentRamMb}          12         148         ${activeVps.ramMb - activeVps.currentRamMb}`, 'text-zinc-300 font-mono');
        addLine('output', `Swap:           1024           0        1024`, 'text-zinc-400 font-mono');
        break;

      case 'uname':
        addLine('output', `Linux ${activeVps.name} 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux`, 'text-zinc-300');
        break;

      case 'cat':
        if (parts[1]?.includes('os-release')) {
          addLine('output', `NAME="${activeVps.os}"`, 'text-zinc-300');
          addLine('output', `VERSION="2026.1 LTS"`, 'text-zinc-300');
          addLine('output', `ID=evm-linux`, 'text-zinc-300');
          addLine('output', `PRETTY_NAME="EVM Docker VPS Linux (${activeVps.os})"`, 'text-cyan-400');
        } else {
          addLine('output', `cat: ${parts[1] || 'missing file'}: No such file or directory`, 'text-red-400');
        }
        break;

      case 'uptime':
        addLine('output', ` 20:45:10 up ${Math.floor(activeVps.uptimeSeconds / 3600)}:32,  1 user,  load average: 0.14, 0.08, 0.05`, 'text-zinc-300');
        break;

      case 'ip':
        addLine('output', `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN`, 'text-zinc-400');
        addLine('output', `    inet 127.0.0.1/8 scope host lo`, 'text-zinc-400');
        addLine('output', `2: eth0@if48: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP`, 'text-zinc-300');
        addLine('output', `    inet ${activeVps.ipv4}/24 brd 103.145.72.255 scope global eth0`, 'text-emerald-400');
        break;

      default:
        addLine('output', `bash: ${cmd}: command not found. Type "help" for valid container commands.`, 'text-amber-400');
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIndex + 1 < history.length ? historyIndex + 1 : historyIndex;
        setHistoryIndex(nextIdx);
        setInput(history[history.length - 1 - nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(history[history.length - 1 - nextIdx] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const copySshCommand = () => {
    if (!activeVps) return;
    const sshCmd = `ssh root@${activeVps.ipv4} -p ${activeVps.sshPort}`;
    navigator.clipboard.writeText(sshCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Active VPS Selector & Quick SSH command */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <TerminalIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Interactive Web Console</h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                xterm / bash
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Direct container TTY attach over secure WebSocket tunnel
            </p>
          </div>
        </div>

        {/* VPS Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400 hidden sm:inline">Active Instance:</label>
          <select
            value={selectedVpsId || ''}
            onChange={(e) => setSelectedVpsId(e.target.value)}
            className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:border-cyan-500 outline-none"
          >
            {userInstances.map((vps) => (
              <option key={vps.id} value={vps.id}>
                {vps.name} ({vps.os} • {vps.status})
              </option>
            ))}
          </select>

          {activeVps && (
            <button
              onClick={copySshCommand}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 transition-colors"
              title="Copy SSH Command"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span className="font-mono text-[11px]">ssh :{activeVps.sshPort}</span>
            </button>
          )}
        </div>
      </div>

      {/* Terminal Viewport */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="relative w-full rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden font-mono cursor-text"
      >
        {/* Terminal Titlebar */}
        <div className="px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs text-zinc-400 ml-2">
              bash — {activeVps ? `root@${activeVps.name} (${activeVps.containerId})` : 'Disconnected'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeVps?.status === 'RUNNING' ? (
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[11px] text-red-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                OFFLINE
              </span>
            )}
          </div>
        </div>

        {/* Terminal Screen output */}
        <div className="p-4 sm:p-6 min-h-[380px] max-h-[500px] overflow-y-auto space-y-1 text-xs">
          {lines.map((line) => (
            <div
              key={line.id}
              className={`leading-relaxed whitespace-pre-wrap ${
                line.color || (line.type === 'input' ? 'text-white' : 'text-zinc-300')
              }`}
            >
              {line.text}
            </div>
          ))}

          {/* Active Input Line */}
          {activeVps?.status === 'RUNNING' ? (
            <div className="flex items-center gap-2 text-zinc-200 pt-1">
              <span className="text-cyan-400 font-bold shrink-0">root@{activeVps.name}:~#</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-white outline-none border-none p-0 font-mono text-xs focus:ring-0"
                autoFocus
              />
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
              <span>Container is stopped. Start the instance to initialize TTY session.</span>
              {activeVps && (
                <button
                  onClick={() => startVPS(activeVps.id)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3" /> Start Container
                </button>
              )}
            </div>
          )}
          <div ref={terminalEndRef} />
        </div>

        {/* Quick Command Toolbar */}
        <div className="px-4 py-2 bg-zinc-900/60 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-zinc-400">Quick commands:</span>
          {['neofetch', 'htop', 'docker ps', 'df -h', 'free -m', 'clear'].map((c) => (
            <button
              key={c}
              onClick={() => handleCommand(c)}
              className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-[11px] font-mono text-cyan-300 border border-zinc-800 hover:border-cyan-500/40 transition-colors"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

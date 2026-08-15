import React, { useState } from 'react';
import { Network, Plus, Trash2, Copy, Check, ShieldCheck, AlertCircle, Globe, Server, ArrowRight } from 'lucide-react';
import { useVPS } from '../context/VPSContext';

export const NATManager: React.FC = () => {
  const { userInstances, selectedVps, selectedVpsId, setSelectedVpsId, addPortMapping, removePortMapping } = useVPS();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [ruleName, setRuleName] = useState('');
  const [internalPort, setInternalPort] = useState<number>(80);
  const [publicPort, setPublicPort] = useState<number>(28080);
  const [protocol, setProtocol] = useState<'TCP' | 'UDP' | 'TCP/UDP'>('TCP');
  const [error, setError] = useState<string | null>(null);

  const activeVps = selectedVps || userInstances[0] || null;

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVps) return;
    setError(null);

    if (publicPort < 1024 || publicPort > 65535) {
      setError('Public port must be between 1024 and 65535');
      return;
    }

    if (internalPort < 1 || internalPort > 65535) {
      setError('Internal port must be between 1 and 65535');
      return;
    }

    const res = addPortMapping(activeVps.id, {
      name: ruleName.trim() || `Port ${internalPort} Forward`,
      publicPort,
      internalPort,
      protocol,
      status: 'ACTIVE',
    });

    if (res.success) {
      setIsAddModalOpen(false);
      setRuleName('');
      setInternalPort(8080);
      setPublicPort(28080 + Math.floor(Math.random() * 1000));
    } else {
      setError(res.message || 'Failed to add port mapping.');
    }
  };

  const copyEndpoint = (publicPort: number, id: string) => {
    if (!activeVps) return;
    const endpoint = `${activeVps.ipv4}:${publicPort}`;
    navigator.clipboard.writeText(endpoint);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestPort = (type: 'web' | 'tls' | 'mysql' | 'node' | 'minecraft') => {
    const base = 20000 + Math.floor(Math.random() * 15000);
    if (type === 'web') {
      setRuleName('HTTP Web Server');
      setInternalPort(80);
      setPublicPort(base);
      setProtocol('TCP');
    } else if (type === 'tls') {
      setRuleName('HTTPS Secure Web');
      setInternalPort(443);
      setPublicPort(base + 1);
      setProtocol('TCP');
    } else if (type === 'node') {
      setRuleName('Node.js / Express App');
      setInternalPort(3000);
      setPublicPort(base + 2);
      setProtocol('TCP');
    } else if (type === 'mysql') {
      setRuleName('MySQL Database');
      setInternalPort(3306);
      setPublicPort(base + 3);
      setProtocol('TCP');
    } else if (type === 'minecraft') {
      setRuleName('Game Server');
      setInternalPort(25565);
      setPublicPort(base + 4);
      setProtocol('TCP/UDP');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Instance Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">NAT & Port Forwarding Manager</h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                iptables / Docker Proxy
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Map host node public ports directly into Docker container private ports
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedVpsId || ''}
            onChange={(e) => setSelectedVpsId(e.target.value)}
            className="px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:border-cyan-500 outline-none"
          >
            {userInstances.map((vps) => (
              <option key={vps.id} value={vps.id}>
                {vps.name} ({vps.ports.length} ports mapped)
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setError(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-600/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Port Rule</span>
          </button>
        </div>
      </div>

      {/* Port Rules Table */}
      {activeVps ? (
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden shadow-xl">
          <div className="p-4 bg-zinc-950/70 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-white">
                Active Port Rules for <span className="text-cyan-400">{activeVps.name}</span>
              </span>
              <span className="text-xs text-zinc-500">({activeVps.ipv4})</span>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {activeVps.ports.length} rules active
            </span>
          </div>

          {activeVps.ports.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 space-y-3">
              <Globe className="w-8 h-8 mx-auto text-zinc-600" />
              <p className="text-sm">No NAT port mappings configured for this instance yet.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-300 hover:text-white"
              >
                Create first port mapping
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] bg-zinc-950/40">
                    <th className="p-4 font-semibold">Service Name</th>
                    <th className="p-4 font-semibold">Host Public Port</th>
                    <th className="p-4 font-semibold">Container Port</th>
                    <th className="p-4 font-semibold">Protocol</th>
                    <th className="p-4 font-semibold">Public Endpoint</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {activeVps.ports.map((rule) => (
                    <tr key={rule.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 font-medium text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        {rule.name}
                      </td>
                      <td className="p-4 font-mono text-cyan-300 font-bold">
                        :{rule.publicPort}
                      </td>
                      <td className="p-4 font-mono text-zinc-300">
                        :{rule.internalPort}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                          {rule.protocol}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => copyEndpoint(rule.publicPort, rule.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[11px] font-mono transition-colors"
                        >
                          <span>{activeVps.ipv4}:{rule.publicPort}</span>
                          {copiedId === rule.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-zinc-500" />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ACTIVE
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {rule.internalPort === 22 ? (
                          <span className="text-[10px] text-zinc-500 italic pr-2">SSH Core</span>
                        ) : (
                          <button
                            onClick={() => removePortMapping(activeVps.id, rule.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                            title="Delete rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center text-zinc-500 rounded-2xl bg-zinc-900/40 border border-zinc-800">
          No VPS instances available.
        </div>
      )}

      {/* Add Port Modal */}
      {isAddModalOpen && activeVps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 pb-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create NAT Port Forward Rule</h3>
                  <p className="text-xs text-zinc-400">Instance: {activeVps.name} ({activeVps.ipv4})</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRule} className="p-6 space-y-4">
              {/* Quick Presets */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Quick Port Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'HTTP (80)', key: 'web' as const },
                    { label: 'HTTPS (443)', key: 'tls' as const },
                    { label: 'NodeJS (3000)', key: 'node' as const },
                    { label: 'MySQL (3306)', key: 'mysql' as const },
                    { label: 'Minecraft (25565)', key: 'minecraft' as const },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => suggestPort(p.key)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-cyan-400 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Rule / Service Name</label>
                <input
                  type="text"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Web API Server"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Host Public Port
                  </label>
                  <input
                    type="number"
                    required
                    min={1024}
                    max={65535}
                    value={publicPort}
                    onChange={(e) => setPublicPort(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl text-xs text-cyan-400 font-mono font-bold outline-none"
                  />
                  <span className="text-[10px] text-zinc-500">External access port</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Container Port
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={65535}
                    value={internalPort}
                    onChange={(e) => setInternalPort(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl text-xs text-white font-mono outline-none"
                  />
                  <span className="text-[10px] text-zinc-500">Internal service port</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Protocol</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['TCP', 'UDP', 'TCP/UDP'] as const).map((proto) => (
                    <button
                      key={proto}
                      type="button"
                      onClick={() => setProtocol(proto)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        protocol === proto
                          ? 'bg-cyan-600/20 text-cyan-400 border-cyan-500'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {proto}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Mapping Preview:</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {activeVps.ipv4}:{publicPort} ➜ :{internalPort} ({protocol})
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20"
                >
                  Apply NAT Mapping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

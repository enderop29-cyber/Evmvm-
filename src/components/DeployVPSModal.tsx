import React, { useState } from 'react';
import {
  X,
  Cpu,
  Activity,
  HardDrive,
  Globe,
  Sparkles,
  Layers,
  AlertCircle,
  ShieldAlert,
  Server,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVPS } from '../context/VPSContext';
import { LinuxOS } from '../types';
import { OS_TEMPLATES } from '../lib/mockData';

interface DeployVPSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (instanceId: string) => void;
}

export const DeployVPSModal: React.FC<DeployVPSModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser, isAdmin, usersList } = useAuth();
  const { nodes, createVPSByAdmin } = useVPS();

  // Form State
  const [name, setName] = useState('');
  const [os, setOs] = useState<LinuxOS>('Ubuntu 22.04 LTS');
  const [cpuCores, setCpuCores] = useState(2);
  const [ramGb, setRamGb] = useState(4);
  const [diskGb, setDiskGb] = useState(40);
  const [bandwidthTb, setBandwidthTb] = useState(2);
  const [nodeId, setNodeId] = useState(nodes[0]?.id || 'node-sgp-01');
  const [assignedUserId, setAssignedUserId] = useState(currentUser?.id || '');
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Non-Admin access block inside modal
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-md bg-zinc-900 border border-red-500/40 rounded-2xl shadow-2xl p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">Manual Provisioning Restricted</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Standard user accounts cannot manually generate VPS instances. Only Administrators have manual deploy rights.
          </p>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-cyan-300">
            💡 Please visit the <span className="font-bold">Redeem Center</span> to claim a Docker VPS with a coupon code.
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsDeploying(true);

    try {
      const res = await createVPSByAdmin({
        name: name || `vps-${Date.now().toString(36)}`,
        os,
        cpuCores,
        ramMb: ramGb * 1024,
        diskGb,
        bandwidthTb,
        nodeId,
        assignedUserId: assignedUserId || currentUser?.id,
      });

      if (res.success && res.instanceId) {
        onSuccess(res.instanceId);
        onClose();
      } else {
        setError(res.message || 'Deployment failed');
      }
    } catch {
      setError('An error occurred during deployment');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Deploy Docker VPS Instance</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Admin Only
                </span>
              </div>
              <p className="text-xs text-zinc-400">Configure compute resources, Linux kernel image, and cluster node</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Instance Name & Host Node */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Instance Hostname</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. prod-api-cluster"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Target Cluster Node</label>
              <select
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none"
              >
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assign Owner */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Assign Instance Owner (RBAC)</label>
            <select
              value={assignedUserId}
              onChange={(e) => setAssignedUserId(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none font-mono"
            >
              {usersList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) — [{u.role}]
                </option>
              ))}
            </select>
          </div>

          {/* Linux OS Image Selection */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2">Select Linux OS Distribution</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {OS_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  type="button"
                  onClick={() => setOs(tmpl.name)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                    os === tmpl.name
                      ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-sm shadow-cyan-500/10'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: tmpl.iconColor }}
                  />
                  <div>
                    <div className="text-xs font-bold text-zinc-200">{tmpl.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{tmpl.tag}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Hardware Sliders */}
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Hardware Allocations
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-zinc-300 mb-1">
                  <span>vCPU:</span>
                  <span className="font-mono text-cyan-400 font-bold">{cpuCores} Cores</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={16}
                  value={cpuCores}
                  onChange={(e) => setCpuCores(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-300 mb-1">
                  <span>RAM:</span>
                  <span className="font-mono text-emerald-400 font-bold">{ramGb} GB</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={32}
                  value={ramGb}
                  onChange={(e) => setRamGb(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-300 mb-1">
                  <span>NVMe SSD:</span>
                  <span className="font-mono text-amber-400 font-bold">{diskGb} GB</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={300}
                  step={10}
                  value={diskGb}
                  onChange={(e) => setDiskGb(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-300 mb-1">
                  <span>Bandwidth:</span>
                  <span className="font-mono text-indigo-400 font-bold">{bandwidthTb} TB</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={bandwidthTb}
                  onChange={(e) => setBandwidthTb(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeploying}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isDeploying ? (
                <span>Booting Container...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Provision Instance</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

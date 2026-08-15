import React, { useState } from 'react';
import {
  ShieldCheck,
  Server,
  Users,
  Cpu,
  Activity,
  HardDrive,
  Gift,
  Plus,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  Globe,
  Radio,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVPS } from '../context/VPSContext';
import { AccessDenied } from './AccessDenied';
import { TabType } from './Sidebar';

interface AdminPanelProps {
  onOpenDeployModal: () => void;
  setActiveTab: (tab: TabType) => void;
  onOpenAuthModal: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onOpenDeployModal,
  setActiveTab,
  onOpenAuthModal,
}) => {
  const { currentUser, isAdmin, usersList, promoteUser } = useAuth();
  const { instances, nodes, redeemCodes, deleteVPS } = useVPS();
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'nodes' | 'users' | 'fleet' | 'codes'>('nodes');

  // If not admin, strictly render AccessDenied
  if (!isAdmin) {
    return (
      <AccessDenied
        onBackToDashboard={() => setActiveTab('dashboard')}
        onOpenLoginModal={onOpenAuthModal}
        featureName="EVM Administrator Control Portal"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-cyan-950/40 border border-cyan-500/30 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                Admin Master Control Portal
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase font-semibold">
                ROOT PRIVILEGES
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Host nodes orchestration, RBAC user permissions, and Docker VPS fleet management
            </p>
          </div>
        </div>

        <button
          onClick={onOpenDeployModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Deploy Manual VPS</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-zinc-800 gap-2">
        {[
          { id: 'nodes' as const, label: 'Host Nodes & Hardware', icon: <Server className="w-4 h-4" /> },
          { id: 'users' as const, label: `User RBAC Access (${usersList.length})`, icon: <Users className="w-4 h-4" /> },
          { id: 'fleet' as const, label: `Global VPS Fleet (${instances.length})`, icon: <Radio className="w-4 h-4" /> },
          { id: 'codes' as const, label: `Promo Codes (${redeemCodes.length})`, icon: <Gift className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveAdminSubTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeAdminSubTab === tab.id
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. Host Nodes View */}
      {activeAdminSubTab === 'nodes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {nodes.map((node) => (
            <div
              key={node.id}
              className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="text-base font-bold text-white tracking-tight">{node.name}</h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{node.location} • IP: {node.ip}</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {node.status}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-850 text-xs space-y-1">
                <div className="flex justify-between text-zinc-400">
                  <span>Docker Daemon:</span>
                  <span className="font-mono text-zinc-200">{node.dockerVersion}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Active Containers:</span>
                  <span className="font-mono text-cyan-400 font-bold">{node.activeContainers} Instances</span>
                </div>
              </div>

              {/* Hardware Gauges */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Host CPU ({node.cpuTotalCores} Cores)</span>
                    <span className="font-mono text-white">{node.cpuUsage}%</span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${node.cpuUsage}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Host RAM ({(node.ramTotalMb / 1024).toFixed(0)} GB Total)</span>
                    <span className="font-mono text-white">{((node.ramUsageMb / node.ramTotalMb) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${(node.ramUsageMb / node.ramTotalMb) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Host NVMe Array ({(node.diskTotalGb / 1000).toFixed(1)} TB Total)</span>
                    <span className="font-mono text-white">{((node.diskUsageGb / node.diskTotalGb) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${(node.diskUsageGb / node.diskTotalGb) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. User & RBAC Management View */}
      {activeAdminSubTab === 'users' && (
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden shadow-xl space-y-2">
          <div className="p-4 bg-zinc-950/70 border-b border-zinc-800/80 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                User Access & Role-Based Permissions
              </h3>
              <p className="text-xs text-zinc-400">
                Grant or revoke Admin root privileges. Regular users cannot deploy VPS without redeem codes.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] bg-zinc-950/40">
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Assigned Role</th>
                  <th className="p-4 font-semibold">VPS Instances Owned</th>
                  <th className="p-4 font-semibold text-right">Role Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {usersList.map((user) => {
                  const ownedCount = instances.filter((i) => i.ownerId === user.id).length;
                  const isCurrent = user.id === currentUser?.id;

                  return (
                    <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 font-medium text-white flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-cyan-900/40 shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-cyan-400">
                              {user.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-zinc-200">{user.name}</span>
                          {isCurrent && <span className="ml-1 text-[10px] text-cyan-400">(You)</span>}
                        </div>
                      </td>

                      <td className="p-4 font-mono text-zinc-300">{user.email}</td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                            user.role === 'ADMIN'
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                              : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                          }`}
                        >
                          {user.role === 'ADMIN' ? <ShieldCheck className="w-3 h-3 text-cyan-400" /> : <Lock className="w-3 h-3 text-zinc-400" />}
                          {user.role}
                        </span>
                      </td>

                      <td className="p-4 font-mono text-zinc-300">
                        {ownedCount} Container{ownedCount !== 1 ? 's' : ''}
                      </td>

                      <td className="p-4 text-right">
                        {user.role === 'ADMIN' ? (
                          <button
                            onClick={() => promoteUser(user.id, 'USER')}
                            disabled={isCurrent && usersList.filter((u) => u.role === 'ADMIN').length === 1}
                            className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors disabled:opacity-30"
                            title="Demote to Regular User"
                          >
                            Demote to User
                          </button>
                        ) : (
                          <button
                            onClick={() => promoteUser(user.id, 'ADMIN')}
                            className="px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-colors"
                            title="Promote to Administrator"
                          >
                            Promote to Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Global VPS Fleet View */}
      {activeAdminSubTab === 'fleet' && (
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden shadow-xl">
          <div className="p-4 bg-zinc-950/70 border-b border-zinc-800/80 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              All Global Fleet Containers
            </h3>
            <span className="text-xs font-mono text-cyan-400">{instances.length} Total Containers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] bg-zinc-950/40">
                  <th className="p-4 font-semibold">Instance Name</th>
                  <th className="p-4 font-semibold">Owner</th>
                  <th className="p-4 font-semibold">Allocated Resources</th>
                  <th className="p-4 font-semibold">Public Address</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {instances.map((vps) => (
                  <tr key={vps.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4 font-medium text-white">
                      <div className="font-semibold">{vps.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{vps.containerId}</div>
                    </td>
                    <td className="p-4 font-mono text-zinc-300">
                      <div>{vps.ownerEmail}</div>
                      <span className="text-[9px] uppercase px-1 rounded bg-zinc-800 text-zinc-400">
                        {vps.ownerRole}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-zinc-300">
                      {vps.cpuCores} vCPU • {(vps.ramMb / 1024).toFixed(0)}GB RAM • {vps.diskGb}GB NVMe
                    </td>
                    <td className="p-4 font-mono text-cyan-300">
                      {vps.ipv4}:{vps.sshPort}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                          vps.status === 'RUNNING'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {vps.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => deleteVPS(vps.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Force Delete Container"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Codes Audit View */}
      {activeAdminSubTab === 'codes' && (
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden shadow-xl">
          <div className="p-4 bg-zinc-950/70 border-b border-zinc-800/80 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Coupon Codes Audit Log
            </h3>
            <button
              onClick={() => setActiveTab('redeem')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              Open Redeem Center <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] bg-zinc-950/40">
                  <th className="p-4 font-semibold">Code</th>
                  <th className="p-4 font-semibold">Tier Specs</th>
                  <th className="p-4 font-semibold">Claims</th>
                  <th className="p-4 font-semibold">Claimed By Users</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {redeemCodes.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-cyan-300">{c.code}</td>
                    <td className="p-4 text-zinc-300 font-mono">
                      {c.cpuCores} vCPU / {(c.ramMb / 1024).toFixed(0)}GB RAM / {c.diskGb}GB NVMe
                    </td>
                    <td className="p-4 font-mono text-zinc-300">
                      {c.claimCount} / {c.maxClaims}
                    </td>
                    <td className="p-4 text-zinc-400">
                      {c.claimedBy.length === 0 ? (
                        <span className="text-zinc-600">No claims yet</span>
                      ) : (
                        <div className="space-y-0.5">
                          {c.claimedBy.map((cl, idx) => (
                            <div key={idx} className="font-mono text-[11px] text-zinc-300">
                              • {cl.userEmail}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                          c.active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {c.active ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

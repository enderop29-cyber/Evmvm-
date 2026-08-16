import React, { createContext, useContext, useState, useEffect } from 'react';
import { VPSInstance, VPSStatus, RedeemCode, HostNode, PortMapping, LinuxOS } from '../types';
import { INITIAL_INSTANCES, INITIAL_REDEEM_CODES, INITIAL_NODES, OS_TEMPLATES } from '../lib/mockData';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

interface VPSContextType {
  instances: VPSInstance[];
  userInstances: VPSInstance[];
  selectedVps: VPSInstance | null;
  selectedVpsId: string | null;
  setSelectedVpsId: (id: string | null) => void;
  redeemCodes: RedeemCode[];
  nodes: HostNode[];
  
  // Power Actions
  startVPS: (id: string) => Promise<void>;
  stopVPS: (id: string) => Promise<void>;
  restartVPS: (id: string) => Promise<void>;
  reinstallVPS: (id: string, newOs: LinuxOS, rootPass: string) => Promise<void>;
  deleteVPS: (id: string) => Promise<{ success: boolean; message?: string }>;
  
  // Admin-only VPS creation
  createVPSByAdmin: (data: {
    name: string;
    os: LinuxOS;
    cpuCores: number;
    ramMb: number;
    diskGb: number;
    bandwidthTb: number;
    nodeId: string;
    assignedUserId?: string;
  }) => Promise<{ success: boolean; instanceId?: string; message?: string }>;
  
  // User & Admin Code Redemption
  redeemCouponCode: (codeStr: string) => Promise<{ success: boolean; message: string; instance?: VPSInstance }>;
  
  // Admin Redeem Code Management
  createRedeemCode: (data: {
    code: string;
    description: string;
    cpuCores: number;
    ramMb: number;
    diskGb: number;
    bandwidthTb: number;
    defaultOs: LinuxOS;
    maxClaims: number;
    expiresInDays: number | null;
  }) => { success: boolean; message: string };
  deleteRedeemCode: (id: string) => void;
  toggleRedeemCode: (id: string) => void;

  // NAT Port Forwarding
  addPortMapping: (vpsId: string, rule: Omit<PortMapping, 'id' | 'createdAt'>) => { success: boolean; message?: string };
  removePortMapping: (vpsId: string, portId: string) => void;
}

const VPSContext = createContext<VPSContextType | undefined>(undefined);

export const VPSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();

  const [instances, setInstances] = useState<VPSInstance[]>(() => {
    try {
      const saved = localStorage.getItem('evm_instances_v2');
      return saved ? JSON.parse(saved) : INITIAL_INSTANCES;
    } catch {
      return INITIAL_INSTANCES;
    }
  });

  const [redeemCodes, setRedeemCodes] = useState<RedeemCode[]>(() => {
    try {
      const saved = localStorage.getItem('evm_redeem_codes_v2');
      return saved ? JSON.parse(saved) : INITIAL_REDEEM_CODES;
    } catch {
      return INITIAL_REDEEM_CODES;
    }
  });

  const [rawNodes] = useState<HostNode[]>(INITIAL_NODES);
  const [selectedVpsId, setSelectedVpsId] = useState<string | null>(null);

  // Computed nodes with live active container counts based on deployed instances
  const nodes = React.useMemo(() => {
    return rawNodes.map((node) => {
      const localAssigned = instances.filter((inst) => inst.nodeName === node.name).length;
      if (node.isLocal) {
        const runningLocal = instances.filter((inst) => inst.nodeName === node.name && inst.status === 'RUNNING');
        const usedRam = 4096 + runningLocal.reduce((acc, curr) => acc + curr.ramMb, 0);
        const usedDisk = 20 + runningLocal.reduce((acc, curr) => acc + curr.diskGb, 0);
        const calcCpu = Math.min(95, +(8.5 + runningLocal.length * 4.2).toFixed(1));
        return {
          ...node,
          activeContainers: localAssigned,
          ramUsageMb: Math.min(node.ramTotalMb, usedRam),
          diskUsageGb: Math.min(node.diskTotalGb, usedDisk),
          cpuUsage: calcCpu,
        };
      }
      return {
        ...node,
        activeContainers: node.activeContainers + localAssigned,
      };
    });
  }, [rawNodes, instances]);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('evm_instances_v2', JSON.stringify(instances));
  }, [instances]);

  useEffect(() => {
    localStorage.setItem('evm_redeem_codes_v2', JSON.stringify(redeemCodes));
  }, [redeemCodes]);

  // Real-time metric ticker simulation for active Docker containers
  useEffect(() => {
    const interval = setInterval(() => {
      setInstances((prev) =>
        prev.map((inst) => {
          if (inst.status !== 'RUNNING') {
            return {
              ...inst,
              currentCpu: 0,
              currentRamMb: 0,
            };
          }

          // Generate realistic micro jitter
          const baseCpu = inst.cpuCores > 2 ? 14 : 6;
          const cpuDelta = (Math.random() - 0.48) * 8;
          const newCpu = Math.max(1.5, Math.min(96, +(inst.currentCpu + cpuDelta * 0.3).toFixed(1) || baseCpu));

          const ramDelta = (Math.random() - 0.5) * 40;
          const newRam = Math.max(
            80,
            Math.min(inst.ramMb - 20, Math.round(inst.currentRamMb + ramDelta))
          );

          const netInDelta = Math.random() * 2.5;
          const netOutDelta = Math.random() * 3.8;

          return {
            ...inst,
            uptimeSeconds: inst.uptimeSeconds + 3,
            currentCpu: newCpu,
            currentRamMb: newRam,
            networkInTotalMb: +(inst.networkInTotalMb + netInDelta / 10).toFixed(1),
            networkOutTotalMb: +(inst.networkOutTotalMb + netOutDelta / 10).toFixed(1),
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Filter instances visible to current user
  const userInstances = React.useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) return instances; // Admins see all fleet instances
    return instances.filter((inst) => inst.ownerId === currentUser.id);
  }, [currentUser, isAdmin, instances]);

  // Active selected VPS
  const selectedVps = instances.find((i) => i.id === selectedVpsId) || null;

  // Power actions
  const setStatusWithDelay = async (id: string, tempStatus: VPSStatus, finalStatus: VPSStatus, delayMs = 1200) => {
    setInstances((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, status: tempStatus } : inst))
    );
    await new Promise((r) => setTimeout(r, delayMs));
    setInstances((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, status: finalStatus } : inst))
    );
  };

  const startVPS = async (id: string) => {
    await setStatusWithDelay(id, 'RUNNING', 'RUNNING', 600);
  };

  const stopVPS = async (id: string) => {
    await setStatusWithDelay(id, 'STOPPED', 'STOPPED', 600);
  };

  const restartVPS = async (id: string) => {
    await setStatusWithDelay(id, 'RESTARTING', 'RUNNING', 1800);
  };

  const reinstallVPS = async (id: string, newOs: LinuxOS, _rootPass: string) => {
    const tmpl = OS_TEMPLATES.find((t) => t.name === newOs);
    setInstances((prev) =>
      prev.map((inst) =>
        inst.id === id
          ? {
              ...inst,
              status: 'REINSTALLING',
              os: newOs,
              dockerImage: tmpl?.tag || 'ubuntu:22.04',
            }
          : inst
      )
    );
    await new Promise((r) => setTimeout(r, 2500));
    setInstances((prev) =>
      prev.map((inst) =>
        inst.id === id
          ? {
              ...inst,
              status: 'RUNNING',
              currentCpu: 8.5,
              currentRamMb: Math.round(inst.ramMb * 0.15),
              uptimeSeconds: 0,
            }
          : inst
      )
    );
  };

  const deleteVPS = async (id: string): Promise<{ success: boolean; message?: string }> => {
    const target = instances.find((i) => i.id === id);
    if (!target) return { success: false, message: 'Instance not found' };

    if (!isAdmin && target.ownerId !== currentUser?.id) {
      return { success: false, message: 'Unauthorized. You do not own this instance.' };
    }

    setInstances((prev) => prev.filter((i) => i.id !== id));
    if (selectedVpsId === id) {
      const remaining = instances.filter((i) => i.id !== id);
      setSelectedVpsId(remaining[0]?.id || null);
    }
    return { success: true };
  };

  // ADMIN ONLY: Direct manual VPS creation
  const createVPSByAdmin = async (data: {
    name: string;
    os: LinuxOS;
    cpuCores: number;
    ramMb: number;
    diskGb: number;
    bandwidthTb: number;
    nodeId: string;
    assignedUserId?: string;
  }): Promise<{ success: boolean; instanceId?: string; message?: string }> => {
    if (!isAdmin) {
      return {
        success: false,
        message: 'PERMISSION DENIED: Only Administrator accounts can directly provision VPS instances. Standard users must redeem a code.',
      };
    }

    const node = nodes.find((n) => n.id === data.nodeId) || nodes[0];
    const osTmpl = OS_TEMPLATES.find((t) => t.name === data.os);
    const assignedUser = data.assignedUserId
      ? { id: data.assignedUserId, email: 'assigned-user@evmpanel.io', role: 'USER' as const }
      : { id: currentUser?.id || 'user-admin-01', email: currentUser?.email || 'admin@evmpanel.io', role: currentUser?.role || 'ADMIN' as const };

    const randomPort = 22000 + Math.floor(Math.random() * 8000);
    const newId = `vps-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const containerHex = Math.random().toString(16).substring(2, 14);

    const newVPS: VPSInstance = {
      id: newId,
      name: data.name.trim().toLowerCase().replace(/\s+/g, '-'),
      containerId: `dckr_${containerHex}`,
      dockerImage: osTmpl?.tag || 'ubuntu:22.04',
      os: data.os,
      status: 'RUNNING',
      ownerId: assignedUser.id,
      ownerEmail: assignedUser.email,
      ownerRole: assignedUser.role,
      cpuCores: data.cpuCores,
      ramMb: data.ramMb,
      diskGb: data.diskGb,
      bandwidthTb: data.bandwidthTb,
      currentCpu: 4.5,
      currentRamMb: Math.round(data.ramMb * 0.12),
      currentDiskGb: +(data.diskGb * 0.08).toFixed(1),
      networkInTotalMb: 12.0,
      networkOutTotalMb: 8.5,
      ipv4: node.isLocal ? '127.0.0.1' : node.ip.split(' ')[0],
      sshPort: randomPort,
      ports: [
        {
          id: `port-${Date.now()}`,
          name: 'SSH Terminal Port',
          publicPort: randomPort,
          internalPort: 22,
          protocol: 'TCP',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        },
      ],
      uptimeSeconds: 10,
      createdAt: new Date().toISOString(),
      nodeName: node.name,
    };

    setInstances((prev) => [newVPS, ...prev]);
    setSelectedVpsId(newId);
    return { success: true, instanceId: newId };
  };

  // Redeem Coupon Code (For normal users & admins)
  const redeemCouponCode = async (
    codeStr: string
  ): Promise<{ success: boolean; message: string; instance?: VPSInstance }> => {
    if (!currentUser) {
      return { success: false, message: 'Please login to redeem a promo code.' };
    }

    const clean = codeStr.trim().toUpperCase();
    const codeObj = redeemCodes.find((c) => c.code.toUpperCase() === clean);

    if (!codeObj) {
      return { success: false, message: 'Invalid redeem code. Check spelling or request a new code from an Administrator.' };
    }

    if (!codeObj.active) {
      return { success: false, message: 'This redeem code has been disabled by the administrator.' };
    }

    if (codeObj.expiresAt && new Date(codeObj.expiresAt).getTime() < Date.now()) {
      return { success: false, message: 'This redeem code has expired.' };
    }

    if (codeObj.claimCount >= codeObj.maxClaims) {
      return { success: false, message: 'Maximum claims reached for this redeem code.' };
    }

    // Check if user already claimed this specific code
    const alreadyClaimed = codeObj.claimedBy.some((c) => c.userId === currentUser.id);
    if (alreadyClaimed) {
      return { success: false, message: 'You have already claimed this coupon code on your account.' };
    }

    // Provision new VPS instance instantly
    const node = nodes[0];
    const osTmpl = OS_TEMPLATES.find((t) => t.name === codeObj.defaultOs) || OS_TEMPLATES[0];
    const randomPort = 23000 + Math.floor(Math.random() * 7000);
    const newId = `vps-claimed-${Date.now().toString(36)}`;
    const containerHex = Math.random().toString(16).substring(2, 14);

    const newVPS: VPSInstance = {
      id: newId,
      name: `${currentUser.name.split(' ')[0].toLowerCase()}-${osTmpl.name.split(' ')[0].toLowerCase()}-vps`,
      containerId: `dckr_${containerHex}`,
      dockerImage: osTmpl.tag,
      os: codeObj.defaultOs,
      status: 'RUNNING',
      ownerId: currentUser.id,
      ownerEmail: currentUser.email,
      ownerRole: currentUser.role,
      cpuCores: codeObj.cpuCores,
      ramMb: codeObj.ramMb,
      diskGb: codeObj.diskGb,
      bandwidthTb: codeObj.bandwidthTb,
      currentCpu: 2.1,
      currentRamMb: Math.round(codeObj.ramMb * 0.1),
      currentDiskGb: +(codeObj.diskGb * 0.05).toFixed(1),
      networkInTotalMb: 5.2,
      networkOutTotalMb: 2.4,
      ipv4: node.isLocal ? '127.0.0.1' : node.ip.split(' ')[0],
      sshPort: randomPort,
      ports: [
        {
          id: `port-${Date.now()}`,
          name: 'SSH Shell',
          publicPort: randomPort,
          internalPort: 22,
          protocol: 'TCP',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        },
      ],
      uptimeSeconds: 0,
      createdAt: new Date().toISOString(),
      redeemedWithCode: codeObj.code,
      nodeName: node.name,
    };

    // Update instances
    setInstances((prev) => [newVPS, ...prev]);

    // Update redeem code claims
    setRedeemCodes((prev) =>
      prev.map((c) =>
        c.id === codeObj.id
          ? {
              ...c,
              claimCount: c.claimCount + 1,
              claimedBy: [
                ...c.claimedBy,
                {
                  userId: currentUser.id,
                  userEmail: currentUser.email,
                  vpsId: newId,
                  claimedAt: new Date().toISOString(),
                },
              ],
            }
          : c
      )
    );

    setSelectedVpsId(newId);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981', '#6366f1', '#f59e0b'],
      });
    } catch {
      // ignore
    }

    return {
      success: true,
      message: `Successfully provisioned ${codeObj.cpuCores} vCPU / ${(codeObj.ramMb / 1024).toFixed(0)}GB RAM Docker VPS!`,
      instance: newVPS,
    };
  };

  // ADMIN ONLY: Master Redeem Code Creation
  const createRedeemCode = (data: {
    code: string;
    description: string;
    cpuCores: number;
    ramMb: number;
    diskGb: number;
    bandwidthTb: number;
    defaultOs: LinuxOS;
    maxClaims: number;
    expiresInDays: number | null;
  }): { success: boolean; message: string } => {
    if (!isAdmin) {
      return { success: false, message: 'Unauthorized. Admin role required to create redeem codes.' };
    }

    const cleanCode = data.code.trim().toUpperCase().replace(/\s+/g, '-');
    if (!cleanCode) {
      return { success: false, message: 'Code cannot be empty.' };
    }

    if (redeemCodes.some((c) => c.code.toUpperCase() === cleanCode)) {
      return { success: false, message: 'A redeem code with this string already exists.' };
    }

    const expiresAt = data.expiresInDays
      ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const newCode: RedeemCode = {
      id: `code-${Date.now()}`,
      code: cleanCode,
      description: data.description || `${data.cpuCores} vCPU, ${data.ramMb / 1024}GB RAM, ${data.diskGb}GB NVMe`,
      cpuCores: data.cpuCores,
      ramMb: data.ramMb,
      diskGb: data.diskGb,
      bandwidthTb: data.bandwidthTb,
      defaultOs: data.defaultOs,
      maxClaims: data.maxClaims || 10,
      claimCount: 0,
      claimedBy: [],
      expiresAt,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.email || 'admin@evmpanel.io',
      active: true,
    };

    setRedeemCodes((prev) => [newCode, ...prev]);
    return { success: true, message: `Redeem code ${cleanCode} generated successfully!` };
  };

  const deleteRedeemCode = (id: string) => {
    if (!isAdmin) return;
    setRedeemCodes((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleRedeemCode = (id: string) => {
    if (!isAdmin) return;
    setRedeemCodes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  // NAT Port Forwarding
  const addPortMapping = (
    vpsId: string,
    rule: Omit<PortMapping, 'id' | 'createdAt'>
  ): { success: boolean; message?: string } => {
    const vps = instances.find((i) => i.id === vpsId);
    if (!vps) return { success: false, message: 'VPS not found' };

    // Check if public port is already in use
    const portTaken = instances.some((inst) =>
      inst.ports.some((p) => p.publicPort === rule.publicPort)
    );
    if (portTaken) {
      return { success: false, message: `Public port ${rule.publicPort} is already assigned on this node.` };
    }

    const newRule: PortMapping = {
      ...rule,
      id: `port-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setInstances((prev) =>
      prev.map((inst) =>
        inst.id === vpsId
          ? {
              ...inst,
              ports: [...inst.ports, newRule],
            }
          : inst
      )
    );

    return { success: true };
  };

  const removePortMapping = (vpsId: string, portId: string) => {
    setInstances((prev) =>
      prev.map((inst) =>
        inst.id === vpsId
          ? {
              ...inst,
              ports: inst.ports.filter((p) => p.id !== portId),
            }
          : inst
      )
    );
  };

  return (
    <VPSContext.Provider
      value={{
        instances,
        userInstances,
        selectedVps,
        selectedVpsId,
        setSelectedVpsId,
        redeemCodes,
        nodes,
        startVPS,
        stopVPS,
        restartVPS,
        reinstallVPS,
        deleteVPS,
        createVPSByAdmin,
        redeemCouponCode,
        createRedeemCode,
        deleteRedeemCode,
        toggleRedeemCode,
        addPortMapping,
        removePortMapping,
      }}
    >
      {children}
    </VPSContext.Provider>
  );
};

export const useVPS = () => {
  const context = useContext(VPSContext);
  if (!context) {
    throw new Error('useVPS must be used within a VPSProvider');
  }
  return context;
};

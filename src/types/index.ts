export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export type VPSStatus = 'RUNNING' | 'STOPPED' | 'RESTARTING' | 'REINSTALLING' | 'ERROR';

export type LinuxOS = 
  | 'Ubuntu 22.04 LTS'
  | 'Debian 12 Bookworm'
  | 'Alpine Linux 3.19'
  | 'CentOS Stream 9'
  | 'Arch Linux';

export interface PortMapping {
  id: string;
  name: string;
  publicPort: number;
  internalPort: number;
  protocol: 'TCP' | 'UDP' | 'TCP/UDP';
  status: 'ACTIVE' | 'PENDING' | 'DISABLED';
  createdAt: string;
}

export interface MetricPoint {
  time: string;
  cpu: number; // percentage
  ram: number; // percentage or MB
  disk: number; // percentage
  networkIn: number; // KB/s
  networkOut: number; // KB/s
}

export interface VPSInstance {
  id: string;
  name: string;
  containerId: string;
  dockerImage: string;
  os: LinuxOS;
  status: VPSStatus;
  ownerId: string;
  ownerEmail: string;
  ownerRole: UserRole;
  
  // Resource allocations
  cpuCores: number;
  ramMb: number;
  diskGb: number;
  bandwidthTb: number;
  
  // Real-time usage
  currentCpu: number; // 0 - 100%
  currentRamMb: number;
  currentDiskGb: number;
  networkInTotalMb: number;
  networkOutTotalMb: number;
  
  // Network
  ipv4: string;
  ipv6?: string;
  sshPort: number;
  ports: PortMapping[];
  
  // Timestamps & metadata
  uptimeSeconds: number;
  createdAt: string;
  redeemedWithCode?: string;
  nodeName: string;
}

export interface RedeemCode {
  id: string;
  code: string;
  description: string;
  cpuCores: number;
  ramMb: number;
  diskGb: number;
  bandwidthTb: number;
  defaultOs: LinuxOS;
  maxClaims: number;
  claimCount: number;
  claimedBy: Array<{
    userId: string;
    userEmail: string;
    vpsId: string;
    claimedAt: string;
  }>;
  expiresAt: string | null; // null = never expires
  createdAt: string;
  createdBy: string;
  active: boolean;
}

export interface HostNode {
  id: string;
  name: string;
  ip: string;
  location: string;
  status: 'ONLINE' | 'DEGRADED' | 'MAINTENANCE';
  dockerVersion: string;
  cpuTotalCores: number;
  cpuUsage: number;
  ramTotalMb: number;
  ramUsageMb: number;
  diskTotalGb: number;
  diskUsageGb: number;
  activeContainers: number;
}

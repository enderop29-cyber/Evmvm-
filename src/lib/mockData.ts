import { User, VPSInstance, RedeemCode, HostNode, LinuxOS } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-01',
    email: 'admin@evmpanel.io',
    name: 'Root Administrator',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-normal-01',
    email: 'user@evmpanel.io',
    name: 'Alex Mercer (Standard User)',
    role: 'USER',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-10T12:30:00Z',
  }
];

export const OS_TEMPLATES: Array<{
  name: LinuxOS;
  tag: string;
  image: string;
  category: string;
  iconColor: string;
  description: string;
}> = [
  {
    name: 'Ubuntu 22.04 LTS',
    tag: 'ubuntu:22.04',
    image: 'docker.io/library/ubuntu:jammy',
    category: 'Debian-based',
    iconColor: '#E95420',
    description: 'Industry standard enterprise Linux with extensive package ecosystem and LTS support.'
  },
  {
    name: 'Debian 12 Bookworm',
    tag: 'debian:12',
    image: 'docker.io/library/debian:bookworm',
    category: 'Debian-based',
    iconColor: '#A80030',
    description: 'Rock-solid stability and minimal memory overhead. Ideal for lightweight services.'
  },
  {
    name: 'Alpine Linux 3.19',
    tag: 'alpine:3.19',
    image: 'docker.io/library/alpine:3.19',
    category: 'Musl/Busybox',
    iconColor: '#0D597F',
    description: 'Ultra-lightweight (5MB base image) with musl libc. Maximum speed and density.'
  },
  {
    name: 'CentOS Stream 9',
    tag: 'centos:stream9',
    image: 'quay.io/centos/centos:stream9',
    category: 'RHEL-based',
    iconColor: '#93227F',
    description: 'Enterprise grade Red Hat compatible distribution with systemd container support.'
  },
  {
    name: 'Arch Linux',
    tag: 'archlinux:latest',
    image: 'docker.io/library/archlinux:latest',
    category: 'Rolling Release',
    iconColor: '#1793D1',
    description: 'Rolling release bleeding-edge Linux for advanced developers and power users.'
  }
];

export const INITIAL_NODES: HostNode[] = [
  {
    id: 'node-local-01',
    name: 'Local Host Node (Auto-Connected)',
    ip: '127.0.0.1 (Localhost / Host VPS)',
    location: 'Current Server Host ⚡',
    status: 'ONLINE',
    dockerVersion: 'Docker Engine v27.1.1 (unix:///var/run/docker.sock)',
    cpuTotalCores: 16,
    cpuUsage: 14.8,
    ramTotalMb: 32768,
    ramUsageMb: 7680,
    diskTotalGb: 500,
    diskUsageGb: 54,
    activeContainers: 0,
    isLocal: true,
    isAutoConfigured: true,
    socketPath: '/var/run/docker.sock',
  },
  {
    id: 'node-sgp-01',
    name: 'Node-AP-SG1 (Singapore Datacenter)',
    ip: '103.145.72.18',
    location: 'Singapore, SG 🇸🇬',
    status: 'ONLINE',
    dockerVersion: 'Docker Engine v27.1.1 (overlay2)',
    cpuTotalCores: 64,
    cpuUsage: 28.4,
    ramTotalMb: 131072,
    ramUsageMb: 42150,
    diskTotalGb: 4000,
    diskUsageGb: 1140,
    activeContainers: 24,
    isLocal: false,
    isAutoConfigured: false,
  },
  {
    id: 'node-usw-02',
    name: 'Node-NA-US2 (Silicon Valley Datacenter)',
    ip: '198.51.100.44',
    location: 'San Jose, USA 🇺🇸',
    status: 'ONLINE',
    dockerVersion: 'Docker Engine v27.1.1 (overlay2)',
    cpuTotalCores: 96,
    cpuUsage: 41.2,
    ramTotalMb: 262144,
    ramUsageMb: 89400,
    diskTotalGb: 8000,
    diskUsageGb: 3200,
    activeContainers: 48,
    isLocal: false,
    isAutoConfigured: false,
  }
];

export const INITIAL_INSTANCES: VPSInstance[] = [];

export const INITIAL_REDEEM_CODES: RedeemCode[] = [
  {
    id: 'code-01',
    code: 'EVM-STARTER-FREE',
    description: 'Free Tier: 1 vCPU, 1GB RAM, 15GB NVMe SSD Docker Instance',
    cpuCores: 1,
    ramMb: 1024,
    diskGb: 15,
    bandwidthTb: 1,
    defaultOs: 'Alpine Linux 3.19',
    maxClaims: 50,
    claimCount: 0,
    claimedBy: [],
    expiresAt: null,
    createdAt: '2026-03-01T00:00:00Z',
    createdBy: 'admin@evmpanel.io',
    active: true
  },
  {
    id: 'code-02',
    code: 'EVM-UBUNTU-PRO',
    description: 'Pro Developer Tier: 2 vCPU, 4GB RAM, 40GB NVMe, Ubuntu 22.04 LTS',
    cpuCores: 2,
    ramMb: 4096,
    diskGb: 40,
    bandwidthTb: 2,
    defaultOs: 'Ubuntu 22.04 LTS',
    maxClaims: 20,
    claimCount: 0,
    claimedBy: [],
    expiresAt: '2026-12-31T23:59:59Z',
    createdAt: '2026-03-02T12:00:00Z',
    createdBy: 'admin@evmpanel.io',
    active: true
  },
  {
    id: 'code-03',
    code: 'EVM-DEBIAN-VIP',
    description: 'VIP Beast Tier: 4 vCPU, 8GB RAM, 100GB NVMe, Debian 12',
    cpuCores: 4,
    ramMb: 8192,
    diskGb: 100,
    bandwidthTb: 5,
    defaultOs: 'Debian 12 Bookworm',
    maxClaims: 5,
    claimCount: 0,
    claimedBy: [],
    expiresAt: '2026-12-31T23:59:59Z',
    createdAt: '2026-03-03T16:20:00Z',
    createdBy: 'admin@evmpanel.io',
    active: true
  }
];

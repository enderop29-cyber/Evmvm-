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
  }
];

export const INITIAL_INSTANCES: VPSInstance[] = [
  {
    id: 'vps-admin-master-01',
    name: 'prod-api-gateway',
    containerId: 'dckr_8f93a11b90c1',
    dockerImage: 'ubuntu:22.04',
    os: 'Ubuntu 22.04 LTS',
    status: 'RUNNING',
    ownerId: 'user-admin-01',
    ownerEmail: 'admin@evmpanel.io',
    ownerRole: 'ADMIN',
    cpuCores: 4,
    ramMb: 8192,
    diskGb: 80,
    bandwidthTb: 4,
    currentCpu: 18.5,
    currentRamMb: 3420,
    currentDiskGb: 22.4,
    networkInTotalMb: 1420.5,
    networkOutTotalMb: 3980.2,
    ipv4: '103.145.72.18',
    sshPort: 22001,
    ports: [
      {
        id: 'port-1',
        name: 'SSH Remote Access',
        publicPort: 22001,
        internalPort: 22,
        protocol: 'TCP',
        status: 'ACTIVE',
        createdAt: '2026-03-01T10:00:00Z',
      },
      {
        id: 'port-2',
        name: 'Web HTTP Server',
        publicPort: 28080,
        internalPort: 80,
        protocol: 'TCP',
        status: 'ACTIVE',
        createdAt: '2026-03-01T10:05:00Z',
      },
      {
        id: 'port-3',
        name: 'HTTPS TLS',
        publicPort: 28443,
        internalPort: 443,
        protocol: 'TCP',
        status: 'ACTIVE',
        createdAt: '2026-03-01T10:05:00Z',
      }
    ],
    uptimeSeconds: 384920,
    createdAt: '2026-03-01T09:30:00Z',
    nodeName: 'Node-AP-SG1 (Singapore Datacenter)'
  },
  {
    id: 'vps-user-starter-02',
    name: 'my-alpine-bot',
    containerId: 'dckr_3a77f02e88d4',
    dockerImage: 'alpine:3.19',
    os: 'Alpine Linux 3.19',
    status: 'RUNNING',
    ownerId: 'user-normal-01',
    ownerEmail: 'user@evmpanel.io',
    ownerRole: 'USER',
    cpuCores: 1,
    ramMb: 1024,
    diskGb: 15,
    bandwidthTb: 1,
    currentCpu: 4.2,
    currentRamMb: 248,
    currentDiskGb: 3.1,
    networkInTotalMb: 120.4,
    networkOutTotalMb: 85.1,
    ipv4: '103.145.72.18',
    sshPort: 22055,
    ports: [
      {
        id: 'port-u1',
        name: 'SSH Shell',
        publicPort: 22055,
        internalPort: 22,
        protocol: 'TCP',
        status: 'ACTIVE',
        createdAt: '2026-03-05T14:10:00Z',
      },
      {
        id: 'port-u2',
        name: 'NodeJS App Port',
        publicPort: 23000,
        internalPort: 3000,
        protocol: 'TCP',
        status: 'ACTIVE',
        createdAt: '2026-03-05T14:15:00Z',
      }
    ],
    uptimeSeconds: 94820,
    createdAt: '2026-03-05T14:00:00Z',
    redeemedWithCode: 'EVM-STARTER-FREE',
    nodeName: 'Node-AP-SG1 (Singapore Datacenter)'
  }
];

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
    claimCount: 1,
    claimedBy: [
      {
        userId: 'user-normal-01',
        userEmail: 'user@evmpanel.io',
        vpsId: 'vps-user-starter-02',
        claimedAt: '2026-03-05T14:00:00Z'
      }
    ],
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

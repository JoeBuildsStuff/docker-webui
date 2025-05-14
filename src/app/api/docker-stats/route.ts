import { NextResponse } from 'next/server';
import Dockerode from 'dockerode';

import type { 
    DashboardStatsData, 
    DockerSystemInfo, 
    DockerVersionInfo 
} from '@/components/dashboard/types';

const docker = new Dockerode();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Usage {
  id: string;
  name: string;
  cpuPercent: number;
  memUsage: number; // bytes
  memLimit: number; // bytes
  memPercent: number; // usage / limit * 100
}

async function getResourceUsage(): Promise<{ cpuUsagePercent: number; memoryUsagePercent: number }> {
  try {
    // 1) list all running containers
    const containers = await docker.listContainers({ all: false });

    if (containers.length === 0) {
      return { cpuUsagePercent: 0, memoryUsagePercent: 0 };
    }

    // 2) for each, fetch a single stats snapshot
    const statsPromises = containers.map(async (info) => {
      const c = docker.getContainer(info.Id);
      // stream: false => one JSON object rather than endless stream
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stat = (await c.stats({ stream: false })) as any;

      // 3) CPU calculation (Docker formula)
      const cpuDelta = stat.cpu_stats.cpu_usage.total_usage - stat.precpu_stats.cpu_usage.total_usage;
      const systemDelta = stat.cpu_stats.system_cpu_usage - stat.precpu_stats.system_cpu_usage;
      const cpuPercent = systemDelta > 0 ? (cpuDelta / systemDelta) * stat.cpu_stats.online_cpus * 100 : 0;

      // 4) Memory fields
      const memUsage = stat.memory_stats.usage || 0;
      const memLimit = stat.memory_stats.limit || 1; // Avoid division by zero
      const memPercent = (memUsage / memLimit) * 100;

      return {
        id: info.Id,
        name: info.Names[0].replace(/^\//, ''), // strip leading slash
        cpuPercent,
        memUsage,
        memLimit,
        memPercent,
      };
    });

    const allContainerStats = await Promise.all(statsPromises);

    if (allContainerStats.length === 0) {
      return { cpuUsagePercent: 0, memoryUsagePercent: 0 };
    }

    let totalCpuUsage = 0;
    let totalMemUsagePercent = 0; // We'll average the memory percentage directly

    allContainerStats.forEach(stat => {
      totalCpuUsage += stat.cpuPercent || 0;
      totalMemUsagePercent += stat.memPercent || 0;
    });
    
    return {
      cpuUsagePercent: parseFloat((totalCpuUsage / allContainerStats.length).toFixed(2)),
      memoryUsagePercent: parseFloat((totalMemUsagePercent / allContainerStats.length).toFixed(2)),
    };
  } catch (error) {
    console.error('[API /docker-stats] Error fetching resource usage with Dockerode:', error);
    return { cpuUsagePercent: 0, memoryUsagePercent: 0 };
  }
}

export async function GET() {
  try {
    const systemInfo = await docker.info() as DockerSystemInfo;
    const versionInfo = await docker.version() as DockerVersionInfo;

    const volumesData = await docker.listVolumes();
    const networkData = await docker.listNetworks();
    const resourceUsage = await getResourceUsage();

    const stats: DashboardStatsData = {
      runningContainers: systemInfo.ContainersRunning || 0,
      pausedContainers: systemInfo.ContainersPaused || 0,
      stoppedContainers: systemInfo.ContainersStopped || 0,
      totalContainers: systemInfo.Containers || 0,
      images: systemInfo.Images || 0,
      volumes: volumesData.Volumes?.length || 0,
      networks: networkData?.length || 0,
      dockerVersion: versionInfo.Version || versionInfo.Components?.[0]?.Version || systemInfo.ServerVersion || 'N/A',
      apiVersion: versionInfo.ApiVersion || versionInfo.Components?.[0]?.Details?.ApiVersion || 'N/A',
      kernelVersion: versionInfo.KernelVersion || versionInfo.Components?.[0]?.Details?.KernelVersion || systemInfo.KernelVersion || 'N/A',
      os: versionInfo.Os || versionInfo.Components?.[0]?.Details?.Os || systemInfo.OperatingSystem || 'N/A',
      arch: versionInfo.Arch || versionInfo.Components?.[0]?.Details?.Arch || systemInfo.Architecture || 'N/A',
      cpus: systemInfo.NCPU || 0,
      memoryTotal: systemInfo.MemTotal ? ((systemInfo.MemTotal / (1024 * 1024 * 1024)).toFixed(2) + " GB") : "N/A",
      cpuUsagePercent: resourceUsage.cpuUsagePercent,
      memoryUsagePercent: resourceUsage.memoryUsagePercent,
      id: systemInfo.ID || 'N/A',
      name: systemInfo.Name || 'N/A',
    };

    return NextResponse.json(stats);
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred while fetching Docker stats.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('[API /docker-stats] Error:', error);
    return NextResponse.json({ error: errorMessage, details: error instanceof Error ? error.stack : undefined }, { status: 500 });
  }
} 
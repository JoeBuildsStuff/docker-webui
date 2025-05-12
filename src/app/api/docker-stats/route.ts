import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Helper to parse multi-JSON output (one JSON object per line)
function parseMultiJson(stdout: string): Record<string, unknown>[] {
  if (!stdout.trim()) {
    return [];
  }
  return stdout
    .trim()
    .split('\n')
    .map(line => {
      try {
        return JSON.parse(line);
      } catch (_e) { // Use _e to denote unused variable
        console.warn('Skipping line that failed to parse as JSON:', line, _e);
        return null; // Return null for lines that fail to parse
      }
    })
    .filter(item => item !== null) as Record<string, unknown>[]; // Filter out nulls and assert type
}

async function getDockerInfo() {
  try {
    const { stdout } = await execAsync('docker info --format "{{json .}}"');
    return JSON.parse(stdout) as Record<string, unknown>; // Assert type here as well
  } catch (error) {
    console.error('Error fetching Docker info:', error);
    // Return a default structure on error to prevent breaking the main stats object
    return {
      ServerVersion: 'Error',
      OperatingSystem: 'Error',
      Architecture: '',
      NCPU: 0,
      MemTotal: 0,
      Images: 0,
    };
  }
}

async function getContainerStats() {
  try {
    const { stdout } = await execAsync('docker ps -a --format "{{json .}}"');
    const containers = parseMultiJson(stdout);
    const runningContainers = containers.filter(c => c.State === 'running').length;
    const stoppedContainers = containers.filter(c => typeof c.State === 'string' && (c.State as string).startsWith('exited')).length;
    return { runningContainers, stoppedContainers, totalContainers: containers.length };
  } catch (error) {
    console.error('Error fetching container stats:', error);
    return { runningContainers: 0, stoppedContainers: 0, totalContainers: 0 };
  }
}

async function getVolumeCount() {
  try {
    const { stdout } = await execAsync('docker volume ls --format "{{json .}}"');
    const volumes = parseMultiJson(stdout);
    return volumes.length;
  } catch (error) {
    console.error('Error fetching volume count:', error);
    return 0;
  }
}

async function getNetworkCount() {
  try {
    const { stdout } = await execAsync('docker network ls --format "{{json .}}"');
    const networks = parseMultiJson(stdout);
    return networks.length;
  } catch (error) {
    console.error('Error fetching network count:', error);
    return 0;
  }
}

async function getResourceUsage() {
  try {
    const { stdout } = await execAsync('docker stats --no-stream --format "{{json .}}"');
    const containerStats = parseMultiJson(stdout);

    if (containerStats.length === 0) {
      return { cpuUsage: 0, memoryUsage: 0 };
    }

    let totalCpuUsage = 0;
    let totalMemUsage = 0;

    containerStats.forEach(stat => {
      const cpuPerc = stat.CPUPerc as string || '0%';
      const memPerc = stat.MemPerc as string || '0%';
      totalCpuUsage += parseFloat(cpuPerc.replace('%', '')) || 0;
      totalMemUsage += parseFloat(memPerc.replace('%', '')) || 0;
    });
    
    // Average the usage. This is a simplification.
    // For CPU, sum can exceed 100% on multi-core systems. 
    // Averaging gives a general sense but might not be perfectly representative of "system" load by Docker.
    return {
      cpuUsage: containerStats.length > 0 ? parseFloat((totalCpuUsage / containerStats.length).toFixed(2)) : 0,
      memoryUsage: containerStats.length > 0 ? parseFloat((totalMemUsage / containerStats.length).toFixed(2)) : 0,
    };
  } catch (error) {
    console.error('Error fetching resource usage:', error);
    return { cpuUsage: 0, memoryUsage: 0 };
  }
}


export async function GET() {
  try {
    const dockerInfo = await getDockerInfo();
    const containerStatsData = await getContainerStats();
    const volumeCount = await getVolumeCount();
    const networkCount = await getNetworkCount();
    const resourceUsage = await getResourceUsage();

    const stats = {
      runningContainers: containerStatsData.runningContainers,
      stoppedContainers: containerStatsData.stoppedContainers,
      images: (dockerInfo.Images as number) || 0,
      volumes: volumeCount,
      networks: networkCount,
      dockerVersion: (dockerInfo.ServerVersion as string) || 'Error',
      os: `${dockerInfo.OperatingSystem as string} (${(dockerInfo.Architecture as string) || 'N/A'})`,
      cpus: (dockerInfo.NCPU as number) || 0,
      memory: dockerInfo.MemTotal ? (((dockerInfo.MemTotal as number) / (1024 * 1024 * 1024)).toFixed(2) + " GB") : "N/A",
      cpuUsage: resourceUsage.cpuUsage,
      memoryUsage: resourceUsage.memoryUsage,
    };

    return NextResponse.json(stats);
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred while fetching Docker stats.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('[API /docker-stats] Global Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
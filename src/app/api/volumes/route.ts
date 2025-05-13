import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Helper to parse multi-JSON output (one JSON object per line)
// Copied from other routes, consider extracting to a shared util
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

export async function GET() {
  try {
    // Fetch all volumes in JSON format
    // Format includes: Driver, Labels, Links, Mountpoint, Name, Scope, Size
    const { stdout, stderr } = await execAsync('docker volume ls --format "{{json .}}"');

    if (stderr) {
      // `docker volume ls` might output warnings to stderr (e.g., about plugins)
      // that don't necessarily indicate a failure to list volumes.
      // We might want to log stderr but not necessarily fail the request.
      console.warn('Docker volume ls stderr:', stderr);
      // Let's proceed even if there's stderr, unless stdout is empty.
      if (!stdout.trim()) {
         console.error('Error executing docker volume ls: stderr present and stdout empty');
        return NextResponse.json({ error: `Docker command failed: ${stderr}` }, { status: 500 });
      }
    }

    const volumes = parseMultiJson(stdout);

    // The default json format gives:
    // {
    //   "Availability": "", (for swarm)
    //   "Driver": "local",
    //   "Group": "", (for swarm)
    //   "Labels": "",
    //   "Links": "0",
    //   "Mountpoint": "/var/lib/docker/volumes/myvolume/_data",
    //   "Name": "myvolume",
    //   "Scope": "local",
    //   "Size": "1.23MB", (Only available with `docker system df`)
    //   "Status": ""
    // }
    // Note: Size is not included in `docker volume ls`. Mountpoint is included.
    // The mock data included Name, Driver, Mountpoint which are present.

    return NextResponse.json(volumes);

  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred while fetching Docker volumes.';
    if (error instanceof Error) {
      if ('stderr' in error && typeof error.stderr === 'string' && error.stderr) {
        errorMessage = `Docker command error: ${error.stderr}`;
      } else if ('stdout' in error && typeof error.stdout === 'string' && error.stdout) {
        errorMessage = `Docker command output error: ${error.stdout}`;
      } else {
         errorMessage = error.message;
      }
    }
    console.error('[API /volumes] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
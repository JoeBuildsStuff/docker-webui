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
      } catch (_e) {
        console.warn('Skipping line that failed to parse as JSON:', line, _e);
        return null;
      }
    })
    .filter(item => item !== null) as Record<string, unknown>[];
}

export async function GET() {
  try {
    // Fetch all networks in JSON format
    // Format includes: ID, Name, Driver, Scope, IPv6, Internal, Labels, etc.
    const { stdout, stderr } = await execAsync('docker network ls --format "{{json .}}"');

    if (stderr) {
      console.error('Error executing docker network ls:', stderr);
      // Treat stderr as an error for networks
      return NextResponse.json({ error: `Docker command failed: ${stderr}` }, { status: 500 });
    }

    const networks = parseMultiJson(stdout);

    // The default json format gives:
    // {
    //   "CreatedAt": "2024-03-10T12:34:56.789Z",
    //   "Driver": "bridge",
    //   "ID": "abcdef123456",
    //   "IPv6": "disabled",
    //   "Internal": "false",
    //   "Labels": "",
    //   "Name": "bridge",
    //   "Scope": "local"
    // }
    // Note: Subnet information is not included in `docker network ls`.
    // It requires `docker network inspect <network_id>`.
    // We will omit Subnet in the response for simplicity.
    // The UI component will need to be adjusted.

    return NextResponse.json(networks);

  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred while fetching Docker networks.';
    if (error instanceof Error) {
       if ('stderr' in error && typeof error.stderr === 'string' && error.stderr) {
         errorMessage = `Docker command error: ${error.stderr}`;
       } else if ('stdout' in error && typeof error.stdout === 'string' && error.stdout) {
         errorMessage = `Docker command output error: ${error.stdout}`;
       } else {
          errorMessage = error.message;
       }
    }
    console.error('[API /networks] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
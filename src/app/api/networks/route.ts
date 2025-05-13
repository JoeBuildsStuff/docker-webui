import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { DockerNetwork } from '@/components/networks/types'; // Import DockerNetwork type

const execAsync = promisify(exec);

// Moved ExecError interface to top level
interface ExecError extends Error {
  stderr?: string;
  stdout?: string;
}

// Helper to parse multi-JSON output (one JSON object per line)
// Explicitly typing the return value based on DockerNetwork properties
function parseMultiJson(stdout: string): Partial<DockerNetwork>[] { // Use Partial<DockerNetwork>
  if (!stdout.trim()) {
    return [];
  }
  return stdout
    .trim()
    .split('\n')
    .map(line => {
      try {
        // We assume the JSON structure matches DockerNetwork fields
        const parsed = JSON.parse(line) as Partial<DockerNetwork>; 
        // Basic validation: Ensure essential fields like ID and Name exist
        if (parsed && typeof parsed.ID === 'string' && typeof parsed.Name === 'string') {
            return parsed;
        } else {
            console.warn('Skipping line with invalid or missing essential network fields (ID, Name):', line);
            return null;
        }
      } catch (_e) {
        console.warn('Skipping line that failed to parse as JSON:', line, _e);
        return null;
      }
    })
    .filter((item): item is Partial<DockerNetwork> => item !== null); // Type guard
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

    // Use the more specific type
    const networks: Partial<DockerNetwork>[] = parseMultiJson(stdout);

    // Type check ensures we return data closer to DockerNetwork[]
    // Note: Some fields might still be missing if not provided by `ls --format`
    return NextResponse.json(networks as DockerNetwork[]); // Assert as DockerNetwork[] for the response

  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred while fetching Docker networks.';
    if (error instanceof Error) {
       // Use ExecError type casting here as well
       const execError = error as ExecError; 
       if (execError.stderr) {
         errorMessage = `Docker command error: ${execError.stderr}`;
       } else if (execError.stdout) {
         errorMessage = `Docker command output error: ${execError.stdout}`;
       } else {
          errorMessage = error.message;
       }
    }
    console.error('[API /networks] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Type definition for the error structure potentially thrown by execAsync
interface ExecError extends Error {
  stderr?: string;
  stdout?: string;
}

// POST handler for creating a new network
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const networkName = body.name;
    const driver = body.driver; // Optional
    const subnet = body.subnet; // Optional
    // Add other options like gateway, ip-range, labels etc. if needed

    if (!networkName || typeof networkName !== 'string') {
      return NextResponse.json({ error: 'Network name is required' }, { status: 400 });
    }

    // Validate network name
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(networkName)) {
      return NextResponse.json({ error: 'Invalid network name format' }, { status: 400 });
    }

    let command = `docker network create`;

    // Add driver if provided and valid
    if (driver && typeof driver === 'string' && /^[a-zA-Z0-9_.-]+$/.test(driver)) {
      command += ` --driver ${driver}`;
    }

    // Add subnet if provided and seems like a valid CIDR (basic check)
    if (subnet && typeof subnet === 'string' && /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]{1,2}$/.test(subnet)) {
      command += ` --subnet ${subnet}`;
    } else if (subnet) {
      console.warn(`Invalid or empty subnet provided: ${subnet}. Ignoring.`);
      // Optionally return a 400 error if subnet format is strictly required when provided
      // return NextResponse.json({ error: 'Invalid subnet format (e.g., 172.18.0.0/16)' }, { status: 400 });
    }

    // Add network name at the end
    command += ` ${networkName}`;

    console.log(`Attempting to execute: ${command}`);
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.warn(`[API /networks POST] Docker network create stderr: ${stderr}`);
      if (stderr.includes("already exists")) {
         return NextResponse.json({ error: `Network named \"${networkName}\" already exists: ${stderr}` }, { status: 409 });
      }
       if (stderr.includes("requires specification of a subnet")) {
         return NextResponse.json({ error: `Driver ${driver || 'default'} requires a subnet specification: ${stderr}` }, { status: 400 });
       }
      // Treat other stderr as potential failure
      return NextResponse.json({ error: `Failed to create network: ${stderr}` }, { status: 500 });
    }

    console.log(`[API /networks POST] Docker network create stdout: ${stdout}`); // Usually the network ID
    return NextResponse.json({ message: `Network ${networkName} created successfully`, id: stdout.trim() }, { status: 201 });

  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred while creating the Docker network.';
    if (error instanceof Error) {
        errorMessage = error.message;
        const execError = error as ExecError;
        if (execError.stderr) {
            errorMessage = `Docker command error: ${execError.stderr}`;
        } else if (execError.stdout) {
            errorMessage = `Docker command output (error context): ${execError.stdout}`;
        }
    }
    console.error('[API /networks POST] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
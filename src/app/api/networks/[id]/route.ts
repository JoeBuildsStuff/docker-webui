import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Type definition for the error structure potentially thrown by execAsync
interface ExecError extends Error {
  stderr?: string;
  stdout?: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const networkId = params.id;

  if (!networkId) {
    return NextResponse.json({ error: 'Network ID is required' }, { status: 400 });
  }

  // Validate ID format (basic check, Docker IDs are typically hex)
  if (!/^[a-fA-F0-9]+$/.test(networkId)) {
      // Allow network *names* as well for removal, adjust regex
      if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(networkId)) {
        return NextResponse.json({ error: 'Invalid network ID or name format' }, { status: 400 });
      }
  }

  try {
    console.log(`Attempting to remove network: ${networkId}`);
    // Use network ID or name for removal
    const { stdout, stderr } = await execAsync(`docker network rm ${networkId}`);

    if (stderr) {
      console.warn(`Docker network rm stderr for ${networkId}: ${stderr}`);
      if (stderr.includes("No such network") || stderr.includes("no such network")) {
        return NextResponse.json({ error: `Network not found: ${stderr}` }, { status: 404 });
      }
      if (stderr.includes("active endpoints")) {
        return NextResponse.json({ error: `Network has active endpoints: ${stderr}` }, { status: 409 });
      }
      // Predefined networks like bridge, host, none cannot be removed.
      if (stderr.includes("is predefined")) {
         return NextResponse.json({ error: `Cannot remove predefined network: ${stderr}` }, { status: 400 });
      }
      // Generic error
      return NextResponse.json({ error: `Failed to remove network: ${stderr}` }, { status: 500 });
    }

    console.log(`Docker network rm stdout for ${networkId}: ${stdout}`); // Usually just the network ID/name
    return NextResponse.json({ message: `Network ${networkId} removed successfully` }, { status: 200 });

  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred while removing the Docker network.';
    if (error instanceof Error) {
        errorMessage = error.message;
        const execError = error as ExecError;
        if (execError.stderr) {
            errorMessage = `Docker command error: ${execError.stderr}`;
        } else if (execError.stdout) {
            errorMessage = `Docker command output (error context): ${execError.stdout}`;
        }
    }
    console.error(`[API /networks/${networkId} DELETE] Error:`, error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
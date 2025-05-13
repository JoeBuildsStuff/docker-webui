import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Define ExecError at the top level
interface ExecError extends Error {
  stderr?: string;
  stdout?: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const containerId = params.id;

  if (!containerId) {
    return NextResponse.json({ error: 'Container ID is required' }, { status: 400 });
  }

  // Basic validation for typical Docker ID format (hex) or name format
  if (!/^[a-fA-F0-9]+$/.test(containerId) && !/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(containerId)) {
      return NextResponse.json({ error: 'Invalid container ID or name format' }, { status: 400 });
  }

  try {
    console.log(`Attempting to remove container: ${containerId}`);
    // Standard remove command (does not force)
    const { stdout, stderr } = await execAsync(`docker rm ${containerId}`);

    if (stderr) {
      console.warn(`Docker rm stderr for ${containerId}: ${stderr}`);
      // Handle common errors
      if (stderr.includes("No such container")) {
        return NextResponse.json({ error: `Container not found: ${stderr}` }, { status: 404 });
      }
      // Error when trying to remove a running container without force
      if (stderr.includes("stop the container before attempting removal or force remove")) {
        return NextResponse.json({ error: `Container is running. Stop it first or use force remove: ${stderr}` }, { status: 409 }); // Conflict
      }
      // Other generic errors
      return NextResponse.json({ error: `Failed to remove container: ${stderr}` }, { status: 500 });
    }

    console.log(`Docker rm stdout for ${containerId}: ${stdout}`); // Usually just the container ID/name again
    // Return 200 OK with message, or could be 204 No Content
    return NextResponse.json({ message: `Container ${containerId} removed successfully` }, { status: 200 });

  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred while removing the Docker container.';
    if (error instanceof Error) {
        const execError = error as ExecError;
        if (execError.stderr) {
            errorMessage = `Docker command error: ${execError.stderr}`;
        } else if (execError.stdout) {
            errorMessage = `Docker command output (error context): ${execError.stdout}`;
        } else {
          errorMessage = error.message;
        }
    }
    console.error(`[API /containers/${containerId} DELETE] Error:`, error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
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
  { params }: { params: { name: string } }
) {
  const volumeName = params.name;

  if (!volumeName) {
    return NextResponse.json({ error: 'Volume name is required' }, { status: 400 });
  }

  // Basic validation for volume name (Docker constraints are quite strict)
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(volumeName)) {
    return NextResponse.json({ error: 'Invalid volume name format' }, { status: 400 });
  }

  try {
    console.log(`Attempting to remove volume: ${volumeName}`);
    // Force remove (-f) might be needed if the volume is attached to a stopped container,
    // but it's safer not to use it by default.
    // The command will fail if the volume is in use by a running container.
    const { stdout, stderr } = await execAsync(`docker volume rm ${volumeName}`);

    if (stderr) {
      // `docker volume rm` might output errors to stderr.
      console.warn(`Docker volume rm stderr for ${volumeName}: ${stderr}`);
      if (stderr.includes("No such volume") || stderr.includes("no such volume")) {
        return NextResponse.json({ error: `Volume not found: ${stderr}` }, { status: 404 });
      }
      if (stderr.includes("is in use")) {
        return NextResponse.json({ error: `Volume is currently in use: ${stderr}` }, { status: 409 });
      }
      // Generic error for other stderr content
      return NextResponse.json({ error: `Failed to remove volume: ${stderr}` }, { status: 500 });
    }

    console.log(`Docker volume rm stdout for ${volumeName}: ${stdout}`); // Usually just the volume name
    return NextResponse.json({ message: `Volume ${volumeName} removed successfully` }, { status: 200 });

  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred while removing the Docker volume.';
    if (error instanceof Error) {
        errorMessage = error.message;
        const execError = error as ExecError;
        if (execError.stderr) {
            errorMessage = `Docker command error: ${execError.stderr}`;
        } else if (execError.stdout) {
            errorMessage = `Docker command output (error context): ${execError.stdout}`;
        }
    }
    console.error(`[API /volumes/${volumeName} DELETE] Error:`, error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
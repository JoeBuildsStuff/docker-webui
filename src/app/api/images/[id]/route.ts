import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const imageId = params.id;

  if (!imageId) {
    return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
  }

  try {
    // It's generally safer to use the full image ID for removal.
    // The ID from `docker images --format "{{json .}}"` is usually the full ID.
    // Ensure the ID passed from the frontend is the full ID.
    const { stdout, stderr } = await execAsync(`docker rmi ${imageId}`);

    if (stderr) {
      // Docker often outputs to stderr for non-fatal errors or warnings (e.g., image used by container)
      // We need to decide if this is a hard error or something to report differently.
      // For "image is referenced in multiple repositories", it's more of a warning after forceful removal if we used -f.
      // If image is in use by a stopped container, `docker rmi` will fail unless -f is used.
      // If image is in use by a running container, `docker rmi` will fail even with -f.
      console.warn(`Docker rmi stderr for ${imageId}: ${stderr}`);
      // Let's assume for now that any stderr after an rmi attempt without -f is an issue.
      // A more robust solution might parse stderr for specific Docker error codes/messages.
      if (stderr.includes("No such image") || stderr.includes("no such image")) {
        return NextResponse.json({ error: `Image not found: ${stderr}` }, { status: 404 });
      }
      if (stderr.includes("is being used by stopped container") || stderr.includes("is being used by container")) {
        return NextResponse.json({ error: `Image is in use by a container: ${stderr}` }, { status: 409 });
      }
      // Generic error for other stderr content
      return NextResponse.json({ error: `Failed to remove image: ${stderr}` }, { status: 500 });
    }

    return NextResponse.json({ message: `Image ${imageId} removed successfully`, stdout }, { status: 200 });
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred while removing the Docker image.';
    if (error instanceof Error) {
        errorMessage = error.message;
        // Check if the error object has stderr/stdout properties (from execAsync promise rejection)
        const execError = error as ExecError; // Type assertion
        if (execError.stderr) {
            errorMessage = `Docker command error: ${execError.stderr}`;
        } else if (execError.stdout) {
            // stdout might not be an error, but if execAsync failed, it might be relevant
            errorMessage = `Docker command output (error context): ${execError.stdout}`;
        }
    }
    console.error(`[API /images/${imageId} DELETE] Error:`, error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Type definition for the error structure potentially thrown by execAsync
interface ExecError extends Error {
  stderr?: string;
  stdout?: string;
} 
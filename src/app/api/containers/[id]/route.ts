import { NextResponse } from 'next/server';
import Dockerode from 'dockerode';

const docker = new Dockerode();

// Re-using the DockerodeError interface from the main route for consistency
interface DockerodeError extends Error {
  statusCode?: number;
  json?: { message?: string };
  reason?: string;
}

export async function DELETE(
  request: Request, // request is unused but part of the Next.js API signature
  { params }: { params: { id: string } }
) {
  const containerId = params.id;

  if (!containerId) {
    return NextResponse.json({ error: 'Container ID is required' }, { status: 400 });
  }

  // Dockerode getContainer handles various forms of IDs/names.
  // Basic validation can still be useful for early exit.
  if (!/^[a-zA-Z0-9_.-]+$/.test(containerId) || containerId.length > 255 ) {
    return NextResponse.json({ error: 'Invalid container ID or name format' }, { status: 400 });
  }

  try {
    console.log(`[API /containers DELETE] Attempting to remove container: ${containerId}`);
    const container = docker.getContainer(containerId);
    
    // Options for remove: { v: boolean (remove volumes), force: boolean, link: boolean }
    // Defaulting to { force: false, v: false }
    // To match `docker rm <id>` behavior. Add `force:true` if needed based on UI/UX.
    await container.remove({ force: false, v: false }); 
    
    console.log(`[API /containers DELETE] Container ${containerId} removed successfully`);
    return NextResponse.json({ message: `Container ${containerId} removed successfully` }, { status: 200 });

  } catch (error: unknown) {
    console.error(`[API /containers DELETE] Error removing container ${containerId}:`, error);
    let errorMessage = 'An unknown error occurred while removing the container.';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      const dockerError = error as DockerodeError;
      if (dockerError.statusCode) {
        statusCode = dockerError.statusCode;
        errorMessage = dockerError.json?.message || dockerError.reason || dockerError.message;
        if (dockerError.statusCode === 404) {
          errorMessage = `Container '${containerId}' not found.`;
        }
        if (dockerError.statusCode === 409) {
          // 409 Conflict: often means container is running and force=false
          errorMessage = `Cannot remove container '${containerId}'. It might be running or has associated resources. ${dockerError.json?.message || ''}`.trim();
        }
      }
    }
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
} 
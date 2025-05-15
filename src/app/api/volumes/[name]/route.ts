import { NextResponse } from 'next/server';
import Dockerode from 'dockerode';

const docker = new Dockerode();

export async function DELETE(
  request: Request, // request is unused but part of the Next.js API signature
  { params }: { params: Promise<{ name: string }> }
) {
  const volumeName = (await params).name;

  if (!volumeName) {
    return NextResponse.json({ error: 'Volume name is required' }, { status: 400 });
  }

  // Basic validation for volume name
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(volumeName)) {
    return NextResponse.json({ error: 'Invalid volume name format' }, { status: 400 });
  }

  try {
    console.log(`[API /volumes DELETE] Attempting to remove volume: ${volumeName}`);
    const volume = docker.getVolume(volumeName);
    // The `remove` method can take an options object, e.g., { force: true }
    // For now, default behavior (no force).
    await volume.remove(); 
    
    console.log(`[API /volumes DELETE] Volume ${volumeName} removed successfully`);
    return NextResponse.json({ message: `Volume ${volumeName} removed successfully` }, { status: 200 });

  } catch (error: unknown) {
    console.error(`[API /volumes DELETE] Error removing volume ${volumeName}:`, error);
    let errorMessage = 'An unknown error occurred while removing the Docker volume.';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dockerError = error as any;
      if (dockerError.statusCode) {
        statusCode = dockerError.statusCode;
        if (dockerError.statusCode === 404) {
          errorMessage = `Volume '${volumeName}' not found.`;
        }
        if (dockerError.statusCode === 409) {
          // This status code means the volume is in use
          errorMessage = `Volume '${volumeName}' is in use and cannot be removed.`;
        }
      }
    }
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
} 
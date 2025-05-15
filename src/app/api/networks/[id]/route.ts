import { NextResponse } from 'next/server';
import Dockerode from 'dockerode';

const docker = new Dockerode();

export async function DELETE(
  request: Request, // request is unused but part of the Next.js API signature
  { params }: { params: Promise<{ id: string }> }
) {
  const networkId = (await params).id;

  if (!networkId) {
    return NextResponse.json({ error: 'Network ID or name is required' }, { status: 400 });
  }

  // Basic validation for typical Docker ID (hex) or name (alphanumeric with ._ -)
  // Dockerode will handle actual existence checks.
  if (!/^[a-zA-Z0-9_.-]+$/.test(networkId) || networkId.length > 255) {
      return NextResponse.json({ error: 'Invalid network ID or name format' }, { status: 400 });
  }

  try {
    console.log(`[API /networks DELETE] Attempting to remove network: ${networkId}`);
    const network = docker.getNetwork(networkId);
    await network.remove();
    
    console.log(`[API /networks DELETE] Network ${networkId} removed successfully`);
    return NextResponse.json({ message: `Network ${networkId} removed successfully` }, { status: 200 });

  } catch (error: unknown) {
    console.error(`[API /networks DELETE] Error removing network ${networkId}:`, error);
    let errorMessage = 'An unknown error occurred while removing the Docker network.';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      // Dockerode errors often have a statusCode property
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dockerError = error as any;
      if (dockerError.statusCode) {
        statusCode = dockerError.statusCode;
        if (dockerError.statusCode === 404) {
          errorMessage = `Network '${networkId}' not found.`;
        }
        if (dockerError.statusCode === 409) {
          errorMessage = `Network '${networkId}' has active endpoints and cannot be removed.`;
        }
        // Dockerode might return 500 for trying to remove predefined networks, 
        // or specific error messages. The default message should cover it.
      }
    }
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
} 
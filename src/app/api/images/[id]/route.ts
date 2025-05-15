import { NextResponse } from 'next/server';
import Dockerode from 'dockerode';

const docker = new Dockerode();

export async function DELETE(
  request: Request, // request is unused but part of the Next.js API signature
  { params }: { params: Promise<{ id: string }> }
) {
  const imageId = (await params).id;

  if (!imageId) {
    return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
  }
  // Docker image IDs can be full SHA256 hashes or shorter versions.
  // Dockerode getImage() handles various forms of IDs/tags.

  try {
    console.log(`[API /images DELETE] Attempting to remove image: ${imageId}`);
    const image = docker.getImage(imageId);
    
    // Options for remove: { force: boolean, noprune: boolean }
    // Using default { force: false, noprune: false }
    // This will fail if the image is used by any container (running or stopped)
    // or if it has child images.
    const removeInfo = await image.remove(); 
    
    // removeInfo is an array of objects: { Untagged: string } or { Deleted: string }
    console.log(`[API /images DELETE] Image ${imageId} removal process info:`, removeInfo);
    return NextResponse.json({ message: `Image ${imageId} removed successfully or untagged.`, details: removeInfo }, { status: 200 });

  } catch (error: unknown) {
    console.error(`[API /images DELETE] Error removing image ${imageId}:`, error);
    let errorMessage = 'An unknown error occurred while removing the Docker image.';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dockerError = error as any; // Dockerode errors often have a statusCode
      if (dockerError.statusCode) {
        statusCode = dockerError.statusCode;
        if (dockerError.statusCode === 404) {
          errorMessage = `Image '${imageId}' not found.`;
        }
        if (dockerError.statusCode === 409) {
          // 409 Conflict: image is being used by a container or has children
          errorMessage = `Image '${imageId}' is in use or has dependent images. ${dockerError.json?.message || ''}`.trim();
        }
      }
    }
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
} 
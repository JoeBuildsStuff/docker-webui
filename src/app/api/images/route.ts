import { NextResponse } from 'next/server';
import Dockerode from 'dockerode';
import type { DockerImage } from '@/components/images/types';
import type { ImageInfo } from 'dockerode'; // ImageInfo is the type from listImages
// import type { ImagePullOptions } from 'dockerode'; // Type not strictly needed if passing {} or specific options directly

const docker = new Dockerode();

// Helper to parse Repository and Tag from RepoTags
function parseRepoTag(repoTag: string): { repository: string; tag: string } {
  if (!repoTag || repoTag === '<none>:<none>') {
    return { repository: '<none>', tag: '<none>' };
  }
  const lastColon = repoTag.lastIndexOf(':');
  const lastSlash = repoTag.lastIndexOf('/');

  if (lastColon > -1 && lastColon > lastSlash) { // Ensure colon is for tag, not part of a port in hostname
    const tag = repoTag.substring(lastColon + 1);
    const repository = repoTag.substring(0, lastColon);
    return { repository, tag };
  } 
  return { repository: repoTag, tag: '<none>' }; // No tag or ambiguous tag
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === 'true';
  // Add other filters like 'dangling', 'label', etc. if needed.
  // Example: const filters = searchParams.get('filters'); 
  // docker.listImages({ all, filters: filters ? JSON.parse(filters) : undefined });

  try {
    const imageInfos: ImageInfo[] = await docker.listImages({ all });

    const images: DockerImage[] = imageInfos.map(info => {
      let repository = '<none>';
      let tag = '<none>';
      if (info.RepoTags && info.RepoTags.length > 0) {
        const parsed = parseRepoTag(info.RepoTags[0]); // Use the first tag as primary
        repository = parsed.repository;
        tag = parsed.tag;
      }

      return {
        Id: info.Id,
        ParentId: info.ParentId,
        Repository: repository,
        Tag: tag,
        RepoTags: info.RepoTags,
        RepoDigests: info.RepoDigests,
        Created: info.Created, // Unix timestamp
        Size: info.Size, // Bytes
        VirtualSize: info.VirtualSize, // Bytes
        SharedSize: info.SharedSize,
        Labels: info.Labels,
        Containers: info.Containers,
      };
    });

    return NextResponse.json(images);

  } catch (error: unknown) {
    console.error('[API /images GET] Error listing images:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to list Docker images: ${errorMessage}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let imageNameForError = 'unknown_image';
  try {
    const body = await request.json();
    const imageName: string = body.imageName;
    imageNameForError = imageName || imageNameForError;

    if (!imageName || typeof imageName !== 'string') {
      return NextResponse.json({ error: 'Image name (e.g., ubuntu:latest) is required.' }, { status: 400 });
    }
    // Basic validation, dockerode will handle more specific errors
    if (!/^[a-zA-Z0-9_.:/-]+$/.test(imageName)) {
      return NextResponse.json({ error: 'Invalid image name format.' }, { status: 400 });
    }

    console.log(`[API /images POST] Attempting to pull image: ${imageName}`);

    // docker.pull returns a Promise that resolves with the stream
    const stream = await docker.pull(imageName, {}); // Pass empty options object

    // Wait for the pull operation to complete by listening to the stream events
    await new Promise<void>((resolve, reject) => {
      docker.modem.followProgress(stream, (err, output) => {
        if (err) {
          return reject(err);
        }
        // Check the last message in the output for errors from Docker daemon
        if (output && output.length > 0) {
          const lastMessage = output[output.length - 1];
          if (lastMessage && (lastMessage.error || lastMessage.errorDetail)) {
            return reject(new Error(lastMessage.errorDetail?.message || lastMessage.error || 'Unknown error during pull'));
          }
        }
        resolve();
      });
    });

    console.log(`[API /images POST] Image ${imageName} pulled successfully.`);
    return NextResponse.json({ message: `Image ${imageName} pulled successfully.` }, { status: 200 });

  } catch (error: unknown) {
    console.error(`[API /images POST] Error pulling image ${imageNameForError}:`, error);
    let errorMessage = `Failed to pull image ${imageNameForError}.`;
    if (error instanceof Error) {
      errorMessage = error.message; // More specific error from followProgress or other issues
    }
    // Attempt to determine a more specific status code if possible (e.g., 404 for not found)
    // This might require parsing the error message string, which is fragile.
    // For now, using a generic 500 or 400 if error message indicates client error.
    const lowerError = errorMessage.toLowerCase();
    let statusCode = 500;
    if (lowerError.includes('not found') || lowerError.includes('no such image') || lowerError.includes('manifest unknown')) {
      statusCode = 404;
    } else if (lowerError.includes('access denied') || lowerError.includes('authentication required')) {
      statusCode = 401; // or 403
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
} 
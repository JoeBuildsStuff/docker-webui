import { NextResponse } from 'next/server';
import Dockerode from 'dockerode';
import type { DockerVolume } from '@/components/volumes/types'; // Ensure path is correct
import type { VolumeCreateOptions, VolumeCreateResponse } from 'dockerode'; // Added VolumeCreateResponse

const docker = new Dockerode();

export async function GET() {
  try {
    const listVolumesResponse = await docker.listVolumes();
    const volumes: DockerVolume[] = listVolumesResponse.Volumes as DockerVolume[];
    return NextResponse.json(volumes);
  } catch (error: unknown) {
    console.error('[API /volumes GET] Error listing volumes:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to list Docker volumes: ${errorMessage}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let volumeNameForError = 'unknown_volume';
  try {
    const body = await request.json();
    volumeNameForError = body.name || volumeNameForError;

    if (!body.name || typeof body.name !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(body.name)) {
      return NextResponse.json({ error: 'Invalid or missing volume name.' }, { status: 400 });
    }

    const createOptions: VolumeCreateOptions = {
      Name: body.name,
      Driver: body.driver,
      DriverOpts: body.driverOpts,
      Labels: body.labels,
    };

    console.log(`[API /volumes POST] Attempting to create volume with options:`, createOptions);

    // docker.createVolume returns Promise<VolumeCreateResponse>
    // VolumeCreateResponse is compatible with DockerVolume / VolumeInfo
    const volumeInfo: VolumeCreateResponse = await docker.createVolume(createOptions);
    
    console.log(`[API /volumes POST] Volume created successfully: ${volumeInfo.Name}`);
    return NextResponse.json({ message: `Volume ${volumeInfo.Name} created successfully`, volume: volumeInfo as DockerVolume }, { status: 201 });

  } catch (error: unknown) {
    console.error('[API /volumes POST] Error creating volume:', error);
    let errorMessage = 'An unknown error occurred while creating the Docker volume.';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dockerError = error as any;
      if (dockerError.statusCode) {
        statusCode = dockerError.statusCode;
        if (dockerError.statusCode === 409) {
          errorMessage = `Volume with name '${volumeNameForError}' already exists.`;
        }
      }
    }
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
} 
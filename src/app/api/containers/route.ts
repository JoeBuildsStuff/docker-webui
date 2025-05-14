import { NextResponse } from 'next/server';
import Dockerode from 'dockerode';
import type { DockerContainer } from '@/components/containers/types';
import type { ContainerInfo, ContainerCreateOptions, PortMap } from 'dockerode';

const docker = new Dockerode();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === 'true';
  const size = searchParams.get('size') === 'true';
  // Example for filters: {"status": ["running"]}
  // const filters = searchParams.get('filters');
  // const filtersOpt = filters ? JSON.parse(filters) : undefined;

  try {
    const containerInfos: ContainerInfo[] = await docker.listContainers({ all, size /*, filters: filtersOpt */ });
    // ContainerInfo[] is directly compatible with DockerContainer[] given our new type definition
   
    console.log('[API /containers GET] ContainerInfos:', containerInfos);
    return NextResponse.json(containerInfos as DockerContainer[]);
  } catch (error: unknown) {
    console.error('[API /containers GET] Error listing containers:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to list Docker containers: ${errorMessage}` }, { status: 500 });
  }
}

interface DockerodeError extends Error {
  statusCode?: number;
  json?: { message?: string };
  reason?: string; // Sometimes present
}

export async function POST(request: Request) {
  let imageName: string = 'unknown_image'; // For error reporting
  let containerNameForError: string | undefined;
  try {
    const body = await request.json();
    imageName = body.image;

    if (!imageName || typeof imageName !== 'string' || imageName.trim() === '') {
      return NextResponse.json({ error: 'Image name is required' }, { status: 400 });
    }

    const containerName: string | undefined = body.name;
    containerNameForError = containerName;
    if (containerName && (typeof containerName !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(containerName))) {
      return NextResponse.json({ error: 'Invalid container name format' }, { status: 400 });
    }

    const createOptions: ContainerCreateOptions = {
      Image: imageName,
      name: containerName,
      Env: [],
      ExposedPorts: {},
      HostConfig: {
        PortBindings: {}
      }
    };

    if (body.env && typeof body.env === 'string') {
      createOptions.Env = body.env.split(',').map((e: string) => e.trim()).filter((e: string) => e);
    }

    if (body.ports && typeof body.ports === 'string') {
      const portStrings = body.ports.split(',').map((p: string) => p.trim()).filter((p: string) => p);
      const portBindings: PortMap = {};
      const exposedPorts: { [port: string]: Record<string, unknown> } = {};
      for (const portString of portStrings) {
        const parts = portString.split(':');
        if (parts.length === 2) {
          const hostPort = parts[0];
          const containerPortAndProto = parts[1].split('/');
          const containerPort = containerPortAndProto[0];
          const protocol = containerPortAndProto[1] || 'tcp';
          const key = `${containerPort}/${protocol}`;
          exposedPorts[key] = {};
          if (!portBindings[key]) portBindings[key] = [];
          portBindings[key].push({ HostPort: hostPort });
        } else {
          console.warn(`Skipping invalid port mapping: ${portString}`);
        }
      }
      createOptions.ExposedPorts = exposedPorts;
      if (createOptions.HostConfig) createOptions.HostConfig.PortBindings = portBindings;
    }
    
    console.log('[API /containers POST] Attempting to create container with options:', JSON.stringify(createOptions, null, 2));

    const container = await docker.createContainer(createOptions);
    await container.start();
    // const containerInfo = await container.inspect(); // Inspect gives more detail than list

    console.log(`[API /containers POST] Container (ID: ${container.id}) started successfully`);
    return NextResponse.json({ 
      message: `Container (ID: ${container.id.substring(0,12)}) started successfully`,
      id: container.id // Return the ID so frontend can potentially use it
    }, { status: 201 });

  } catch (error: unknown) {
    console.error(`[API /containers POST] Error creating container ${containerNameForError || 'unknown'} from image ${imageName}:`, error);
    let errorMessage = 'An unknown error occurred while creating/starting the container.';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      const dockerError = error as DockerodeError; 
      if (dockerError.statusCode) {
        statusCode = dockerError.statusCode;
        errorMessage = dockerError.json?.message || dockerError.message;
        if (dockerError.statusCode === 404 && dockerError.json?.message?.includes('No such image')) {
          errorMessage = `Image not found: ${imageName}`;
        }
        if (dockerError.statusCode === 409 && dockerError.json?.message?.includes('Conflict')){
           errorMessage = `Container name '${containerNameForError}' likely already in use. ${dockerError.json.message}`;
        }
      }
    }
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
} 
import { NextResponse } from 'next/server';
import Dockerode from 'dockerode';
import type { DockerNetwork } from '@/components/networks/types'; // Ensure this path is correct
import type { NetworkCreateOptions } from 'dockerode'; // For POST request

const docker = new Dockerode(); // Initialize Dockerode

export async function GET() {
  try {
    const networksData = await docker.listNetworks();
    // The data from listNetworks() should match DockerNetwork[] based on the provided output
    return NextResponse.json(networksData as DockerNetwork[]);
  } catch (error: unknown) {
    console.error('[API /networks GET] Error listing networks:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to list Docker networks: ${errorMessage}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let networkNameForError = 'unknown_network'; // Default for error message if body.name is not available
  try {
    const body = await request.json();
    networkNameForError = body.name || networkNameForError;

    // Basic validation for network name
    if (!body.name || typeof body.name !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(body.name)) {
      return NextResponse.json({ error: 'Invalid or missing network name.' }, { status: 400 });
    }

    const createOptions: NetworkCreateOptions = {
      Name: body.name,
      Driver: body.driver, // string | undefined
      CheckDuplicate: true, // Default behavior, but good to be explicit
      Internal: body.internal, // boolean | undefined
      Attachable: body.attachable, // boolean | undefined
      Ingress: body.ingress, // boolean | undefined
      EnableIPv6: body.enableIPv6, // boolean | undefined
      Options: body.options, // { [option: string]: string; } | undefined
      Labels: body.labels, // { [label: string]: string; } | undefined
    };

    // IPAM configuration (more complex)
    if (body.ipam && typeof body.ipam === 'object') {
      createOptions.IPAM = {
        Driver: body.ipam.driver, // string | undefined
        Options: body.ipam.options, // { [option: string]: string; } | undefined
        Config: body.ipam.config, // IpamConfig[] | undefined
      };
      // Example: if body.ipam.config is [{ Subnet: "172.20.0.0/16", Gateway: "172.20.0.1" }]
    }

    console.log(`[API /networks POST] Attempting to create network with options:`, createOptions);

    const network = await docker.createNetwork(createOptions);
    const networkInfo = await network.inspect(); // Get full info after creation

    console.log(`[API /networks POST] Network created successfully: ${networkInfo.Id}`);
    return NextResponse.json({ message: `Network ${networkInfo.Name} created successfully`, network: networkInfo as DockerNetwork }, { status: 201 });

  } catch (error: unknown) {
    console.error('[API /networks POST] Error creating network:', error);
    let errorMessage = 'An unknown error occurred while creating the Docker network.';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      // Dockerode errors often have a statusCode property
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dockerError = error as any;
      if (dockerError.statusCode) {
        statusCode = dockerError.statusCode;
        if (dockerError.statusCode === 409) {
          errorMessage = `Network with name '${networkNameForError}' already exists or conflicts.`;
        }
      }
    }
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
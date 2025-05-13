import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { DockerContainer } from '@/components/containers/types'; // Import type

const execAsync = promisify(exec);

// Define ExecError at the top level
interface ExecError extends Error {
  stderr?: string;
  stdout?: string;
}

// Helper to parse multi-JSON output (one JSON object per line)
// Typed the return value
function parseMultiJson(stdout: string): Partial<DockerContainer>[] { // Use Partial
  if (!stdout.trim()) {
    return [];
  }
  return stdout
    .trim()
    .split('\n')
    .map(line => {
      try {
        const parsed = JSON.parse(line) as Partial<DockerContainer>;
        // Add basic validation if necessary (e.g., check for ID)
        if (parsed && typeof parsed.ID === 'string') {
            return parsed;
        } else {
            console.warn('Skipping container line with invalid or missing ID:', line);
            return null;
        }
      } catch (_e) { // Use _e to denote unused variable
        console.warn('Skipping line that failed to parse as JSON:', line, _e);
        return null; // Return null for lines that fail to parse
      }
    })
    .filter((item): item is Partial<DockerContainer> => item !== null); // Type guard
}

export async function GET() {
  try {
    // Fetch all containers (including stopped ones) in JSON format
    const { stdout, stderr } = await execAsync('docker ps -a --format "{{json .}}"');

    if (stderr) {
      console.error('Error executing docker ps:', stderr);
      // Decide if stderr always means failure or sometimes just warnings
      // For now, let's return an error if stderr is not empty
      return NextResponse.json({ error: `Docker command failed: ${stderr}` }, { status: 500 });
    }

    // Use the specific type
    const containers: Partial<DockerContainer>[] = parseMultiJson(stdout);

    // You might want to map/transform the data structure here
    // if the default docker ps output doesn't perfectly match your frontend needs
    // For example, 'CreatedAt' might be a string timestamp you need to parse later

    // Assert the type for the final response, assuming the format matches
    return NextResponse.json(containers as DockerContainer[]);

  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred while fetching Docker containers.';
    if (error instanceof Error) {
      // Use ExecError type casting
      const execError = error as ExecError;
      if (execError.stderr) {
        errorMessage = `Docker command error: ${execError.stderr}`;
      } else if (execError.stdout) {
        // Sometimes errors are in stdout for docker commands
        errorMessage = `Docker command output error: ${execError.stdout}`;
      } else {
         errorMessage = error.message;
      }
    }
    console.error('[API /containers] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST handler for creating/running a new container
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // --- Input Validation --- 
    const imageName = body.image;
    if (!imageName || typeof imageName !== 'string' || imageName.trim() === '') {
      return NextResponse.json({ error: 'Image name is required' }, { status: 400 });
    }
    // Basic validation for image name format (avoids obvious command injection)
    // Allows user/repo:tag, repo:tag, image:tag, image@sha256:...
    if (!/^[a-zA-Z0-9_.-]+([\/][a-zA-Z0-9_.-]+)?([:][a-zA-Z0-9_.-]+|@[a-zA-Z0-9:]+)$/.test(imageName)) {
        // Simple check, might need refinement for complex private registry URLs
        console.warn(`Potentially invalid image name format: ${imageName}`);
        // Allow proceeding but log, or return 400
        // return NextResponse.json({ error: 'Invalid image name format' }, { status: 400 });
    }

    const containerName = body.name; // Optional
    if (containerName && (typeof containerName !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(containerName))) {
        return NextResponse.json({ error: 'Invalid container name format' }, { status: 400 });
    }

    const ports = body.ports; // Optional string, e.g., "8080:80" or "8081:80, 9001:9000"
    const envVars = body.env; // Optional string, e.g., "KEY=value" or "KEY1=val1,KEY2=val2"

    // --- Command Construction --- 
    let command = `docker run -d`; // Run detached

    if (containerName) {
        command += ` --name ${containerName}`;
    }

    // Add port mappings (-p hostPort:containerPort)
    if (ports && typeof ports === 'string') {
        const portPairs = ports.split(',').map(p => p.trim()).filter(p => p);
        for (const pair of portPairs) {
            // Basic validation: digits, colon, digits
            if (/^[0-9]+:[0-9]+$/.test(pair)) {
                command += ` -p ${pair}`;
            } else {
                console.warn(`Invalid port mapping format skipped: ${pair}`);
                // Optionally return 400 if strict format required
                // return NextResponse.json({ error: `Invalid port mapping format: ${pair}` }, { status: 400 });
            }
        }
    }

    // Add environment variables (-e KEY=value)
    if (envVars && typeof envVars === 'string') {
        const envPairs = envVars.split(',').map(e => e.trim()).filter(e => e);
        for (const pair of envPairs) {
            // Basic validation: key=value format
            if (/^[a-zA-Z_][a-zA-Z0-9_]*=[^=]+$/.test(pair)) { // Simple check
                command += ` -e "${pair}"`; // Quote value in case it contains spaces etc.
            } else {
                console.warn(`Invalid environment variable format skipped: ${pair}`);
                // Optionally return 400
                // return NextResponse.json({ error: `Invalid environment variable format: ${pair}` }, { status: 400 });
            }
        }
    }

    command += ` ${imageName}`; // Add image name at the end

    // --- Execution & Response --- 
    console.log(`Attempting to execute: ${command}`);
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
        console.warn(`[API /containers POST] Docker run stderr: ${stderr}`);
        // Handle common errors
        if (stderr.includes("port is already allocated")) {
             return NextResponse.json({ error: `Port conflict: ${stderr}` }, { status: 409 });
        }
        if (stderr.includes("name is already in use")) {
             return NextResponse.json({ error: `Container name conflict: ${stderr}` }, { status: 409 });
        }
        if (stderr.includes("Unable to find image") && stderr.includes("locally")) {
             return NextResponse.json({ error: `Image not found locally: ${stderr}` }, { status: 404 });
        }
        // Generic error
        return NextResponse.json({ error: `Failed to run container: ${stderr}` }, { status: 500 });
    }

    // Success: stdout contains the full container ID
    const newContainerId = stdout.trim();
    console.log(`[API /containers POST] Docker run stdout (Container ID): ${newContainerId}`);
    
    // Optionally fetch details of the new container to return, or just return ID/success
    // For consistency with mutation, just return success message + ID
    return NextResponse.json({ message: `Container started successfully`, id: newContainerId }, { status: 201 });

  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred while running the container.';
    if (error instanceof Error) {
        const execError = error as ExecError;
        if (execError.stderr) {
            errorMessage = `Docker command error: ${execError.stderr}`;
        } else if (execError.stdout) {
            errorMessage = `Docker command output (error context): ${execError.stdout}`;
        } else {
          errorMessage = error.message;
        }
    }
    console.error('[API /containers POST] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Helper to parse multi-JSON output (one JSON object per line)
// Copied from docker-stats route, consider extracting to a shared util
function parseMultiJson(stdout: string): Record<string, unknown>[] {
  if (!stdout.trim()) {
    return [];
  }
  return stdout
    .trim()
    .split('\n')
    .map(line => {
      try {
        return JSON.parse(line);
      } catch (_e) { // Use _e to denote unused variable
        console.warn('Skipping line that failed to parse as JSON:', line, _e);
        return null; // Return null for lines that fail to parse
      }
    })
    .filter(item => item !== null) as Record<string, unknown>[]; // Filter out nulls and assert type
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

    const containers = parseMultiJson(stdout);

    // You might want to map/transform the data structure here
    // if the default docker ps output doesn't perfectly match your frontend needs
    // For example, 'CreatedAt' might be a string timestamp you need to parse later

    return NextResponse.json(containers);

  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred while fetching Docker containers.';
    if (error instanceof Error) {
      // Check for specific command execution errors
      if ('stderr' in error && typeof error.stderr === 'string' && error.stderr) {
        errorMessage = `Docker command error: ${error.stderr}`;
      } else if ('stdout' in error && typeof error.stdout === 'string' && error.stdout) {
        // Sometimes errors are in stdout for docker commands
        errorMessage = `Docker command output error: ${error.stdout}`;
      } else {
         errorMessage = error.message;
      }
    }
    console.error('[API /containers] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 